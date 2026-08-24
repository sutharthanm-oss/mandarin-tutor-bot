import { getUser, saveDb } from '../db.js';
import { pushSentence } from './dailySentence.js';
import { LEVELS } from '../curriculum.js';

export function registerCommands(bot) {
  bot.start(async ctx => {
    getUser(ctx.chat.id);
    await saveDb();
    await ctx.reply(
      "你好! I'm your Malaysian-Mandarin sparring partner 🥊\n\n" +
      "Every morning I'll send you one sentence. Record yourself reading it and send it back as " +
      "a voice note — I'll tell you exactly what to fix. You must nail it before I move on to the " +
      "next sentence: if you don't pass today, I resend the same one tomorrow.\n\n" +
      'Commands:\n' +
      "/today — get today's sentence (or resend if not yet passed)\n" +
      '/streak — see your streak\n' +
      '/level <1-6> — manually override difficulty\n' +
      '/help — show this again\n\n' +
      'Send /today to get your first sentence.'
    );
  });

  bot.help(ctx => ctx.reply('/today /streak /level <1-6> /help'));

  bot.command('today', async ctx => {
    await pushSentence(bot, ctx.chat.id);
  });

  bot.command('streak', async ctx => {
    const user = getUser(ctx.chat.id);
    await ctx.reply(
      `🔥 Current streak: ${user.streak}\n🏆 Longest streak: ${user.longestStreak}\n📚 Sentences passed: ${user.history.length}\n📍 Level: ${user.level}`
    );
  });

  bot.command('level', async ctx => {
    const arg = ctx.message.text.split(' ')[1];
    const lvl = parseInt(arg, 10);
    if (!lvl || lvl < 1 || lvl > 6) {
      const desc = Object.entries(LEVELS).map(([k, v]) => `${k}. ${v}`).join('\n');
      return ctx.reply(`Usage: /level <1-6>\n\n${desc}`);
    }
    const user = getUser(ctx.chat.id);
    user.level = lvl;
    user.consecutivePasses = 0;
    await saveDb();
    await ctx.reply(`Level set to ${lvl}: ${LEVELS[lvl]}\n\nSend /today for a sentence at this level.`);
  });
}
