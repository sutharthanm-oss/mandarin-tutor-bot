import fetch from 'node-fetch';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getUser, saveDb } from '../db.js';
import { convertToWav } from '../audioConvert.js';
import { transcribeMandarin, textSimilarity } from '../whisperTranscribe.js';
import { extractPitchContour, classifyToneSegments } from '../pitchAnalysis.js';
import { expectedTones } from '../pinyinTones.js';
import { generateCoaching } from './coach.js';

const TEXT_MATCH_THRESHOLD = 0.8;
const TONE_MATCH_THRESHOLD = 0.6; // fraction of syllables with confident, correct tone

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function handleVoiceMessage(bot, ctx) {
  const chatId = ctx.chat.id;
  const user = getUser(chatId);

  if (!user.currentSentence) {
    return ctx.reply("No sentence assigned yet — send /today to get one.");
  }
  if (user.currentSentence.passed) {
    return ctx.reply("You've already passed today's sentence 🎉 — I'll send a new one tomorrow (or send /today now if you want it early).");
  }

  await ctx.reply('🎧 Listening…');

  const fileId = ctx.message.voice?.file_id || ctx.message.audio?.file_id;
  if (!fileId) return ctx.reply("That doesn't look like a voice note — please send an audio/voice message.");

  const tmpDir = os.tmpdir();
  const ogaPath = path.join(tmpDir, `${fileId}.oga`);
  let wavPath;

  try {
    const link = await bot.telegram.getFileLink(fileId);
    const res = await fetch(link.href);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(ogaPath, buf);

    wavPath = await convertToWav(ogaPath);

    const [recognizedText, contour] = await Promise.all([
      transcribeMandarin(wavPath),
      Promise.resolve(extractPitchContour(wavPath)),
    ]);

    const expected = expectedTones(user.currentSentence.pinyin);
    const toneResults = classifyToneSegments(contour, expected.length);
    const toneComparison = expected.map((e, i) => ({
      syllable: e.syllable,
      expectedTone: e.tone,
      detectedTone: toneResults[i]?.tone ?? null,
      confidence: toneResults[i]?.confidence ?? 0,
    }));

    const textScore = textSimilarity(user.currentSentence.hanzi, recognizedText);

    const confidentTones = toneComparison.filter(t => t.detectedTone && t.confidence > 0.15);
    const toneMatches = confidentTones.filter(t => t.detectedTone === t.expectedTone);
    // If we don't have enough confident tone readings, don't let tone drag down an otherwise good attempt.
    const toneScore = confidentTones.length >= Math.ceil(expected.length * 0.5)
      ? toneMatches.length / confidentTones.length
      : 1;

    const passed = textScore >= TEXT_MATCH_THRESHOLD && toneScore >= TONE_MATCH_THRESHOLD;

    user.currentSentence.attempts.push({ at: new Date().toISOString(), passed });

    for (const t of toneComparison) {
      if (t.detectedTone && t.confidence > 0.15 && t.detectedTone !== t.expectedTone) {
        user.weakTones[t.syllable] = (user.weakTones[t.syllable] || 0) + 1;
      }
    }

    const coaching = await generateCoaching({
      sentence: user.currentSentence,
      recognizedText,
      toneComparison,
      passed,
    });

    if (passed) {
      user.currentSentence.passed = true;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      user.streak = user.lastPassedDate === yesterday ? user.streak + 1 : 1;
      user.longestStreak = Math.max(user.longestStreak, user.streak);
      user.lastPassedDate = todayStr();
      user.consecutivePasses += 1;
      user.history.push({ hanzi: user.currentSentence.hanzi, date: todayStr(), passed: true });

      await saveDb();
      await ctx.reply(`✅ Qualified! ${coaching}\n\n🔥 Streak: ${user.streak}. New sentence tomorrow morning.`);
    } else {
      user.consecutivePasses = 0;
      await saveDb();
      await ctx.reply(`${coaching}\n\nRecord it again whenever you're ready — same sentence until it's clean.`);
    }
  } catch (err) {
    console.error('[voiceHandler] error:', err);
    await ctx.reply(`⚠️ Couldn't process that: ${err.message}. Try recording again, closer to the mic.`);
  } finally {
    [ogaPath, wavPath].forEach(p => {
      if (p && fs.existsSync(p)) fs.unlinkSync(p);
    });
  }
}
