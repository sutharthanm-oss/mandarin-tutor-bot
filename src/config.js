import 'dotenv/config';

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.warn(`[config] Missing env var ${name} — set it before the bot will fully work.`);
  }
  return v;
}

export const config = {
  telegramToken: required('TELEGRAM_BOT_TOKEN'),
  ownerChatId: process.env.OWNER_CHAT_ID || null,
  anthropicApiKey: required('ANTHROPIC_API_KEY'),
  openaiApiKey: required('OPENAI_API_KEY'),
  dailyHour: parseInt(process.env.DAILY_SEND_HOUR || '8', 10),
  dailyMinute: parseInt(process.env.DAILY_SEND_MINUTE || '0', 10),
  dbPath: process.env.DB_PATH || './data/db.json',
  port: parseInt(process.env.PORT || '3000', 10),
  timezone: 'Asia/Kuala_Lumpur',
};
