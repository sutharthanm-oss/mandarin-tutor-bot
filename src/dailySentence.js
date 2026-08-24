import { getUser, saveDb } from '../db.js';
import { generateSentence } from '../sentenceGenerator.js';
import { generateSpeech } from '../tts.js';
import { convertToOggOpus } from '../audioConvert.js';
import fs from 'fs';

const PASSES_PER_LEVEL_UP = 7; // roughly a week of daily passes before difficulty increases

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatSentenceMessage(sentence, level, { retry } = {}) {
  const lines = [];
  if (retry) {
    lines.push("🔁 Same sentence as before — let's nail this one first.", '');
  } else {
    lines.push(`📅 *Today's sentence* (Level ${level})`, '');
  }
  lines.push(`🀄 ${sentence.hanzi}`, `🔤 ${sentence.pinyin}`, `🇬🇧 ${sentence.english}`);
  if (sentence.manglish) {
    lines.push('', `💬 As you'd actually hear it in KL: _${sentence.manglish}_`);
  }
  lines.push('', '🎙️ Listen to the voice note above, then send your own reading it out loud.');
  return lines.join('\n');
}

async function sendSentenceVoiceNote(bot, chatId, hanzi) {
  let mp3Path, oggPath;
  try {
    mp3Path = await generateSpeech(hanzi);
    oggPath = await convertToOggOpus(mp3Path);
    await bot.telegram.sendVoice(chatId, { source: oggPath });
  } catch (err) {
    console.error('[dailySentence] TTS voice note failed, continuing with text only:', err.message);
  } finally {
    [mp3Path, oggPath].forEach(p => {
      if (p && fs.existsSync(p)) fs.unlinkSync(p);
    });
  }
}

// Called both by the daily cron and by /today.
export async function pushSentence(bot, chatId) {
  const user = getUser(chatId);

  // Still on an unpassed sentence from before — resend it verbatim, do NOT advance.
  if (user.currentSentence && !user.currentSentence.passed) {
    await sendSentenceVoiceNote(bot, chatId, user.currentSentence.hanzi);
    await bot.telegram.sendMessage(
      chatId,
      formatSentenceMessage(user.currentSentence, user.level, { retry: true }),
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // Auto-advance level every N consecutive passes, capped at 6.
  if (user.consecutivePasses > 0 && user.consecutivePasses % PASSES_PER_LEVEL_UP === 0 && user.level < 6) {
    user.level += 1;
  }

  const sentence = await generateSentence(user.level, user.history);
  user.currentSentence = {
    ...sentence,
    assignedDate: todayStr(),
    passed: false,
    attempts: [],
  };
  await saveDb();

  await sendSentenceVoiceNote(bot, chatId, sentence.hanzi);
  await bot.telegram.sendMessage(chatId, formatSentenceMessage(sentence, user.level), { parse_mode: 'Markdown' });
}
