import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { config } from './config.js';

const openai = new OpenAI({ apiKey: config.openaiApiKey });

// Generates an MP3 reading of `text` and returns the local file path.
// Speed is intentionally slower than natural (0.75x) — this is for a beginner
// learner to catch every syllable/tone clearly, not natural conversational pace.
// Using gpt-4o-mini-tts (not the older tts-1) because it supports steering
// instructions — OpenAI's built-in voices are optimized for English by default,
// so we explicitly ask for clear, standard Mandarin delivery to cut down on
// the English-accent bleed-through.
export async function generateSpeech(text) {
  const response = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'coral',
    input: text,
    instructions: 'Speak as a native Mandarin Chinese speaker with standard, textbook-clear pronunciation and accurate tones. Enunciate each syllable distinctly — do not rush or slur syllables together, and do not carry any English accent into the Mandarin.',
    speed: 0.75,
  });
  const buf = Buffer.from(await response.arrayBuffer());
  const outPath = path.join(os.tmpdir(), `tts-${Date.now()}.mp3`);
  fs.writeFileSync(outPath, buf);
  return outPath;
}
