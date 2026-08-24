import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

// Convert any input audio (Telegram voice notes are .oga/opus) to 16kHz mono PCM WAV —
// what our own pitch-tracking code (and Whisper) expects.
export function convertToWav(inputPath) {
  return new Promise((resolve, reject) => {
    const outPath = path.join(os.tmpdir(), `${path.basename(inputPath, path.extname(inputPath))}.wav`);
    const ffmpeg = spawn('ffmpeg', ['-y', '-i', inputPath, '-ar', '16000', '-ac', '1', outPath]);
    let stderr = '';
    ffmpeg.stderr.on('data', d => (stderr += d));
    ffmpeg.on('close', code => {
      if (code === 0) resolve(outPath);
      else reject(new Error(`ffmpeg failed (${code}): ${stderr.slice(-500)}`));
    });
  });
}

// Converts TTS-generated MP3 into Telegram-native voice-note format (ogg/opus),
// so it renders as a proper voice bubble rather than a generic audio attachment.
export function convertToOggOpus(inputPath) {
  return new Promise((resolve, reject) => {
    const outPath = path.join(os.tmpdir(), `${path.basename(inputPath, path.extname(inputPath))}.ogg`);
    const ffmpeg = spawn('ffmpeg', ['-y', '-i', inputPath, '-ar', '48000', '-ac', '1', '-c:a', 'libopus', '-b:a', '32k', outPath]);
    let stderr = '';
    ffmpeg.stderr.on('data', d => (stderr += d));
    ffmpeg.on('close', code => {
      if (code === 0) resolve(outPath);
      else reject(new Error(`ffmpeg failed (${code}): ${stderr.slice(-500)}`));
    });
  });
}
