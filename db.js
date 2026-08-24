import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname } from 'path';
import { mkdirSync } from 'fs';
import { config } from './config.js';

mkdirSync(dirname(config.dbPath), { recursive: true });

const defaultData = {
  users: {},
  // users[chatId] = {
  //   chatId, level: 1-6,
  //   streak, longestStreak, lastPassedDate,
  //   consecutivePasses,           // used to auto-advance level every N passes
  //   currentSentence: {
  //     hanzi, pinyin, english, manglish, vocab_focus,
  //     assignedDate, passed: bool, attempts: [{ at, passed }]
  //   },
  //   weakTones: { "nǐ": 3 },      // syllable -> recurring-miss count, for future trend feedback
  //   history: [ { hanzi, date, passed } ],
  // }
};

const adapter = new JSONFile(config.dbPath);
export const db = new Low(adapter, defaultData);

export async function loadDb() {
  await db.read();
  db.data ||= structuredClone(defaultData);
  await db.write();
  return db;
}

export function getUser(chatId) {
  const id = String(chatId);
  if (!db.data.users[id]) {
    db.data.users[id] = {
      chatId: id,
      level: 1,
      streak: 0,
      longestStreak: 0,
      lastPassedDate: null,
      consecutivePasses: 0,
      currentSentence: null,
      weakTones: {},
      history: [],
      createdAt: new Date().toISOString(),
    };
  }
  return db.data.users[id];
}

export async function saveDb() {
  await db.write();
}
