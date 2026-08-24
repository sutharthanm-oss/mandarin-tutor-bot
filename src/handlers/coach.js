import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

const SYSTEM_PROMPT = `You are a warm but exacting Mandarin pronunciation coach for a Malaysian
learner. You receive: (1) what a speech-to-text engine heard vs. the target sentence, and (2) a
rough per-syllable tone comparison from independent pitch analysis (expected tone vs detected
tone, 1=flat/high, 2=rising, 3=dip, 4=falling, 5=neutral; detected can be null if the signal was
too weak to judge — ignore those, don't mention low-confidence readings).

Rules:
- Never mention scores, percentages, or "confidence" — the learner doesn't want a scoreboard.
- If passed=true: 2-3 sentences max. Confirm it's good, note ONE thing to keep polishing if
  there's a recurring issue, otherwise just affirm clearly.
- If passed=false: 2-4 short bullet points, each naming the specific character/syllable and what
  to fix in plain beginner-friendly terms (e.g. "你 (nǐ) — this should dip down then rise, it came
  out flat" or "了 seems to have been dropped or unclear — don't rush past it"). End with one line
  of encouragement to try again right now.
- Be concrete, reference actual characters/pinyin from the data, not generic tips.
- Remember: the tone detection is approximate (DIY pitch analysis, not commercial-grade), so if the
  data is ambiguous/conflicting, favor the text-match signal and keep tone comments soft/tentative.
- Output plain text, no markdown headers, ready to send directly in a Telegram message.`;

export async function generateCoaching({ sentence, recognizedText, toneComparison, passed }) {
  const toneSummary = toneComparison
    .map(t => `${t.syllable} | expectedTone:${t.expectedTone} | detectedTone:${t.detectedTone ?? 'unclear'}`)
    .join('\n');

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Target sentence: ${sentence.hanzi} (${sentence.pinyin})\nWhat the engine heard: ${recognizedText}\nPassed: ${passed}\n\nPer-syllable tone comparison:\n${toneSummary}`,
        },
      ],
    });
    return msg.content.find(b => b.type === 'text')?.text?.trim()
      || (passed ? 'Good — that clears it.' : 'Some parts need work — give it another try.');
  } catch (err) {
    console.error('[coach] Claude coaching generation failed:', err.message);
    if (passed) return "Good, that's clear enough. Moving on tomorrow.";
    const mismatches = toneComparison.filter(t => t.detectedTone && t.detectedTone !== t.expectedTone);
    if (!mismatches.length) return "Close, but not quite clean yet — give it another go.";
    return 'Tones to check:\n' + mismatches.map(t => `• ${t.syllable} (expected tone ${t.expectedTone})`).join('\n') + '\n\nTry again now.';
  }
}
