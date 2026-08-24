import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import express from 'express';
import { config } from './config.js';
import { loadDb, db } from './db.js';
import { registerCommands } from './handlers/commands.js';
import { handleVoiceMessage } from './handlers/voiceHandler.js';
import { pushSentence } from './handlers/dailySentence.js';

const WEBHOOK_PATH = '/telegram-webhook';

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

  const app = express();
  app.get('/', (_req, res) => res.send('mandarin-tutor-bot is running'));

  if (config.publicUrl) {
    // Webhook mode — required on platforms like Railway that briefly run two
    // container instances during a zero-downtime deploy. Long-polling (bot.launch())
    // would have both instances call getUpdates simultaneously and Telegram rejects
    // one with a 409 Conflict. Webhooks have no such race: Telegram just POSTs to
    // whichever instance is currently registered.
    app.use(bot.webhookCallback(WEBHOOK_PATH));
    app.listen(config.port, async () => {
      console.log(`[http] listening on :${config.port}`);
      const webhookUrl = `${config.publicUrl}${WEBHOOK_PATH}`;
      await bot.telegram.setWebhook(webhookUrl);
      console.log(`[bot] webhook set to ${webhookUrl}. Daily sentence scheduled ${config.dailyHour}:${String(config.dailyMinute).padStart(2, '0')} ${config.timezone}`);
    });
  } else {
    // Fallback for local development without a public URL: plain long-polling.
    await bot.launch();
    console.log(`[bot] launched via polling (no PUBLIC_URL set). Daily sentence scheduled ${config.dailyHour}:${String(config.dailyMinute).padStart(2, '0')} ${config.timezone}`);
    app.listen(config.port, () => console.log(`[http] healthcheck server on :${config.port}`));
  }

  process.once('SIGINT', () => { bot.stop('SIGINT'); process.exit(0); });
  process.once('SIGTERM', () => { bot.stop('SIGTERM'); process.exit(0); });
}

main().catch(err => {
  console.error('[fatal]', err);
  process.exit(1);
});
