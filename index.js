import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import express from 'express';
import { config } from './config.js';
import { loadDb, db } from './db.js';
import { registerCommands } from './handlers/commands.js';
import { handleVoiceMessage } from './handlers/voiceHandler.js';
import { pushSentence } from './handlers/dailySentence.js';

async function main() {
  await loadDb();

  const bot = new Telegraf(config.telegramToken);
  registerCommands(bot);
  bot.on(['voice', 'audio'], ctx => handleVoiceMessage(bot, ctx));

  bot.catch((err, ctx) => {
    console.error(`[bot] error for ${ctx.updateType}:`, err);
  });

  // Daily push to every known user (bot is designed for a single owner, but this
  // scales fine if you ever add more).
  const cronExpr = `${config.dailyMinute} ${config.dailyHour} * * *`;
  cron.schedule(
    cronExpr,
    async () => {
      const chatIds = Object.keys(db.data.users);
      for (const chatId of chatIds) {
        try {
          await pushSentence(bot, chatId);
        } catch (err) {
          console.error(`[cron] failed to send daily sentence to ${chatId}:`, err);
        }
      }
    },
    { timezone: config.timezone }
  );

  await bot.launch();
  console.log(`[bot] launched. Daily sentence scheduled ${config.dailyHour}:${String(config.dailyMinute).padStart(2, '0')} ${config.timezone}`);

  // Minimal HTTP server so Railway's healthcheck has something to hit.
  const app = express();
  app.get('/', (_req, res) => res.send('mandarin-tutor-bot is running'));
  app.listen(config.port, () => console.log(`[http] healthcheck server on :${config.port}`));

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch(err => {
  console.error('[fatal]', err);
  process.exit(1);
});
