import fs from 'fs';

// --- Minimal WAV (16-bit PCM, mono) reader ---
// ffmpeg in azure... (now our own) conversion always outputs 16kHz mono 16-bit PCM,
// so we can parse the header directly rather than pulling in a WAV library.
function readWavSamples(wavPath) {
  const buf = fs.readFileSync(wavPath);
  // Standard WAV header is 44 bytes for uncompressed PCM without extra chunks.
  // Find the 'data' subchunk defensively in case ffmpeg adds extra chunks.
  let offset = 12; // skip RIFF header
  let dataOffset = null;
  let dataSize = null;
  let sampleRate = 16000;
  while (offset < buf.length - 8) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    if (chunkId === 'fmt ') {
      sampleRate = buf.readUInt32LE(offset + 12);
    } else if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break;
    }
    offset += 8 + chunkSize + (chunkSize % 2);
  }
  if (dataOffset == null) throw new Error('Could not locate WAV data chunk');

  const numSamples = Math.floor(dataSize / 2);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    samples[i] = buf.readInt16LE(dataOffset + i * 2) / 32768;
  }
  return { samples, sampleRate };
}

// Autocorrelation-based pitch detection for a single frame.
// Returns frequency in Hz, or 0 if unvoiced/no clear pitch.
function detectPitchFrame(frame, sampleRate) {
  const minFreq = 75; // typical low end of human voice
  const maxFreq = 500; // typical high end for speech incl. rising tones
  const maxLag = Math.floor(sampleRate / minFreq);
  const minLag = Math.floor(sampleRate / maxFreq);

  // RMS gate — skip silence/near-silence frames.
  let rms = 0;
  for (let i = 0; i < frame.length; i++) rms += frame[i] * frame[i];
  rms = Math.sqrt(rms / frame.length);
  if (rms < 0.01) return 0;

  let bestLag = -1;
  let bestCorr = 0;
  for (let lag = minLag; lag <= maxLag && lag < frame.length; lag++) {
    let corr = 0;
    for (let i = 0; i < frame.length - lag; i++) {
      corr += frame[i] * frame[i + lag];
    }
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }
  if (bestLag <= 0) return 0;
  return sampleRate / bestLag;
}

// Returns { times: [s], freqs: [Hz] } — pitch contour across the whole clip,
// plus the [startSample, endSample] of the voiced region (silence trimmed).
export function extractPitchContour(wavPath) {
  const { samples, sampleRate } = readWavSamples(wavPath);
  const frameSize = Math.floor(sampleRate * 0.03); // 30ms frames
  const hopSize = Math.floor(sampleRate * 0.01); // 10ms hop

  const times = [];
  const freqs = [];
  for (let start = 0; start + frameSize <= samples.length; start += hopSize) {
    const frame = samples.subarray(start, start + frameSize);
    const f0 = detectPitchFrame(frame, sampleRate);
    times.push(start / sampleRate);
    freqs.push(f0);
  }

  // Trim leading/trailing unvoiced frames to isolate the spoken region.
  let first = times.findIndex((_, i) => freqs[i] > 0);
  let last = freqs.length - 1 - [...freqs].reverse().findIndex(f => f > 0);
  if (first === -1) { first = 0; last = freqs.length - 1; }

  return {
    times: times.slice(first, last + 1),
    freqs: freqs.slice(first, last + 1),
  };
}

// Splits the voiced pitch contour into `n` roughly equal time segments (one
// per expected syllable) and classifies each segment's shape as a Mandarin
// tone number. This is a coarse approximation (assumes roughly even syllable
// timing) rather than true forced alignment, but is enough to catch gross
// tone errors (e.g. reading a 4th tone as flat, or missing a rising 2nd tone).
export function classifyToneSegments(contour, n) {
  const { freqs } = contour;
  const voiced = freqs.filter(f => f > 0);
  if (voiced.length < n * 2) {
    // Not enough signal to say anything meaningful per-syllable.
    return Array.from({ length: n }, () => ({ tone: null, confidence: 0 }));
  }

  const segLen = Math.floor(freqs.length / n);
  const results = [];
  for (let s = 0; s < n; s++) {
    const segment = freqs.slice(s * segLen, s === n - 1 ? freqs.length : (s + 1) * segLen).filter(f => f > 0);
    if (segment.length < 3) {
      results.push({ tone: null, confidence: 0 });
      continue;
    }
    const third = Math.max(1, Math.floor(segment.length / 3));
    const start = avg(segment.slice(0, third));
    const mid = avg(segment.slice(third, segment.length - third));
    const end = avg(segment.slice(segment.length - third));

    const range = Math.max(start, mid, end) - Math.min(start, mid, end);
    const relRange = range / avg(segment); // normalized variation

    let tone;
    if (relRange < 0.06) {
      tone = 1; // flat, high-ish
    } else if (mid < start && mid < end) {
      tone = 3; // dip
    } else if (end - start > 0.04 * avg(segment)) {
      tone = 2; // rising
    } else if (start - end > 0.04 * avg(segment)) {
      tone = 4; // falling
    } else {
      tone = 5; // ambiguous/neutral
    }

    results.push({ tone, confidence: Math.min(1, relRange * 4) });
  }
  return results;
}

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
