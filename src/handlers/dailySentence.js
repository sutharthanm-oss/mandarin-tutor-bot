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
  if (Array.isArray(sentence.breakdown) && sentence.breakdown.length) {
    lines.push('', '📖 *Word by word:*');
    for (const w of sentence.breakdown) {
      lines.push(`${w.word} (${w.pinyin}) — ${w.meaning}`);
    }
  }
  lines.push('', '🎙️ Listen above, then send your own voice note reading it out loud.');
  return lines.join('\n');
}

async function sendSentencePush(bot, chatId, sentence, level, opts) {
  const caption = formatSentenceMessage(sentence, level, opts);
  const captionFits = caption.length <= 1024; // Telegram's hard limit on media captions
  let mp3Path, oggPath;
  try {
    mp3Path = await generateSpeech(sentence.hanzi);
    oggPath = await convertToOggOpus(mp3Path);
    if (captionFits) {
      await bot.telegram.sendVoice(chatId, { source: oggPath }, { caption, parse_mode: 'Markdown' });
    } else {
      // Breakdown pushed it over Telegram's caption limit — send voice plain, text as follow-up.
      await bot.telegram.sendVoice(chatId, { source: oggPath });
      await bot.telegram.sendMessage(chatId, caption, { parse_mode: 'Markdown' });
    }
  } catch (err) {
    console.error('[dailySentence] TTS voice note failed, falling back to text only:', err.message);
    await bot.telegram.sendMessage(chatId, caption, { parse_mode: 'Markdown' });
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
    await sendSentencePush(bot, chatId, user.currentSentence, user.level, { retry: true });
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

  await sendSentencePush(bot, chatId, sentence, user.level, {});
}
