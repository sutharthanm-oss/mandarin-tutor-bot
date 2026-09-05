import OpenAI, { toFile } from 'openai';
import fs from 'fs';
import { config } from './config.js';

const openai = new OpenAI({ apiKey: config.openaiApiKey });

// Buffers the file fully and wraps it with OpenAI's toFile() helper rather than
// passing a live fs.createReadStream directly. Streaming a raw ReadStream as the
// upload body can trip Node's fetch/undici layer in some container environments
// (surfaces as a generic "Connection error." with no further detail) — sending a
// fully-buffered file avoids that class of failure entirely.
export async function transcribeMandarin(wavPath) {
  const buffer = fs.readFileSync(wavPath);
  const file = await toFile(buffer, 'audio.wav');
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'zh',
  });
  return transcription.text.trim();
}

// Simple Levenshtein distance for character-level text comparison —
// Chinese has no spaces, so we diff at the character level.
export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// 0-1 similarity score between the target hanzi and what Whisper heard.
export function textSimilarity(target, heard) {
  const cleanTarget = target.replace(/[，。！？、\s]/g, '');
  const cleanHeard = heard.replace(/[，。！？、\s,.!?]/g, '');
  if (!cleanTarget.length) return 0;
  const dist = levenshtein(cleanTarget, cleanHeard);
  return Math.max(0, 1 - dist / cleanTarget.length);
}
