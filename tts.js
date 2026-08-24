import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { config } from './config.js';

const openai = new OpenAI({ apiKey: config.openaiApiKey });

// Generates an MP3 reading of `text` and returns the local file path.
export async function generateSpeech(text) {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
  });
  const buf = Buffer.from(await response.arrayBuffer());
  const outPath = path.join(os.tmpdir(), `tts-${Date.now()}.mp3`);
  fs.writeFileSync(outPath, buf);
  return outPath;
}
