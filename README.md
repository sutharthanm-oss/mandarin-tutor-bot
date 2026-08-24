# Mandarin Tutor (Telegram) — Malaysian flavor

Every morning: one Mandarin sentence pushed to you — **as a voice note (native TTS reading) plus
text** (hanzi, pinyin, English). You record yourself saying it back as a voice note. The bot tells
you in plain English what to fix — no scores, no numbers shown. **You must pass before moving
on**: if you don't clear today's sentence, the exact same sentence (and its voice note) is
resent the next morning instead of a new one. Difficulty starts at greetings/introductions and
ramps toward ordering food & payment → small talk → daily life/opinions → office chat with
Malaysian code-switching, auto-advancing roughly every 7 passed sentences.

## Get 2 credentials first

1. **Telegram bot token** — talk to [@BotFather](https://t.me/BotFather) on Telegram, `/newbot`.
2. **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com) → API Keys
   (generates sentences and writes the coaching feedback).
3. **OpenAI API key** — [platform.openai.com](https://platform.openai.com) → API Keys
   (used for Whisper speech-to-text — no other vendor needed).

Fill these into a `.env` file (copy `.env.example`).

## Run locally

```bash
npm install
cp .env.example .env   # fill in the values above
npm start
```

Then in Telegram: `/start`, then `/today`.

## Deploy to Railway

This repo ships with a `Dockerfile` (needed for `ffmpeg`, which converts Telegram's `.oga`
voice notes to the WAV format our transcription/pitch analysis expects).

1. Push this folder to a GitHub repo.
2. In Railway: New Project → Deploy from GitHub repo.
3. Add a **Volume** mounted at `/data` (so streaks/history survive redeploys) and set
   `DB_PATH=/data/db.json`.
4. Set the env vars from `.env.example` in Railway's Variables tab.
5. Deploy. Check logs for `[bot] launched`.

## How it works under the hood

There is no dedicated Mandarin pronunciation-scoring vendor with easy self-serve signup — the
ones that do this well (Azure, SpeechSuper, iFlytek) all have enterprise-style onboarding. So
this is a DIY pipeline built from two easy-signup pieces instead:

- **Whisper (OpenAI)** transcribes what you actually said, compared character-by-character
  against the target 🀄 sentence (`src/whisperTranscribe.js`).
- **TTS (OpenAI)** generates the native-voice reading sent with every sentence push
  (`src/tts.js`), converted to Telegram's voice-note format via ffmpeg.
- **Custom pitch-contour analysis** (`src/pitchAnalysis.js`) — pure JS, no external API —
  extracts the pitch curve from your voice note via autocorrelation, splits it into one segment
  per syllable, and classifies each segment's shape (flat/rising/dip/falling) against the tone
  expected from the sentence's pinyin (`src/pinyinTones.js`). This is a coarse approximation
  (assumes roughly even syllable timing rather than true forced alignment) — good enough to
  catch clearly wrong tones, not commercial-grade precision.
- Claude (`src/handlers/coach.js`) turns both signals into plain-English coaching — no scores
  or numbers are ever shown to you, just what to fix.
- Pass gate: text similarity ≥ 80% AND tone match ≥ 60% (`TEXT_MATCH_THRESHOLD` /
  `TONE_MATCH_THRESHOLD` in `src/handlers/voiceHandler.js`). Today's sentence stays assigned —
  and gets resent verbatim each morning — until you pass it.
- Level auto-advances every 7 consecutive passes (`PASSES_PER_LEVEL_UP` in
  `src/handlers/dailySentence.js`), capped at 6. Override anytime with `/level <1-6>`.
- Sentences are generated fresh by Claude following a practical topic progression: greetings/
  intro → ordering food & payment → small talk/directions → daily life & opinions → office chat
  with Malaysian code-switching → fast idiomatic speech. Falls back to a small curated bank in
  `src/curriculum.js` if the API call fails.

## Known limitations

- Tone detection is a DIY approximation, not a commercial-grade engine — it can miss subtle
  errors or occasionally flag a correct tone as wrong, especially on short/fast syllables. The
  pass gate is tuned loose on purpose (60% tone match) so it doesn't block progress on noise.
- Single-owner design: the daily cron pushes to every chat id that has ever `/start`ed the
  bot. Fine for personal use; add an allowlist in `src/config.js` if you share the bot.
