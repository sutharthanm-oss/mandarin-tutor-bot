import Anthropic from '@anthropic-ai/sdk';
import { config } from './config.js';
import { LEVELS, pickFallback } from './curriculum.js';

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

const SYSTEM_PROMPT = `You write daily Mandarin practice sentences for a learner based in Kuala Lumpur, Malaysia,
progressing from complete beginner to advanced. Topic progression by level should follow real
practical priorities: starting a conversation and introducing yourself → ordering food/drinks and
making payment → small talk and asking for things → daily routines and opinions → office/social
life with heavier code-switching → fast idiomatic speech. Style reference for higher levels: real
Malaysian-Chinese daily speech — kopitiam orders, office chat, pasar malam, LRT/traffic, family talk.
Only code-switch with English/Bahasa Malaysia particles (lah, leh, lor, wei, boleh, tak, confirm,
sia, wan, gila, jom, etc.) at level 4 and above — keep levels 1-3 clean, practical Mandarin so the
learner builds a solid base first.

Return ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{"hanzi": "...", "pinyin": "...", "english": "...", "manglish": "... or null", "vocab_focus": ["word1","word2"]}

Rules:
- "hanzi" is the primary sentence the learner must read and pronounce. Simplified characters.
- "pinyin" includes tone marks (not numbers).
- "english" is a natural English gloss.
- "manglish" is a realistic code-switched variant of the SAME sentence as actually spoken in KL
  (mixing in English/Malay words), or null if not applicable at this level.
- Keep sentence length appropriate to the level described below.
- vocab_focus: 1-3 key words this sentence is drilling.
- Do not repeat overly common textbook sentences ("How are you", "My name is").`;

export async function generateSentence(level, recentHistory = []) {
  const levelDesc = LEVELS[level] || LEVELS[1];
  const avoid = recentHistory.slice(-15).map(h => h.hanzi).join(' / ');

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Level ${level}: ${levelDesc}\n\nAvoid repeating these recent sentences: ${avoid || '(none yet)'}\n\nGenerate one new sentence now.`,
        },
      ],
    });

    const text = msg.content.find(b => b.type === 'text')?.text?.trim() || '';
    const cleaned = text.replace(/^```json\s*|```$/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.hanzi || !parsed.pinyin) throw new Error('Incomplete generation');
    return parsed;
  } catch (err) {
    console.error('[sentenceGenerator] Claude generation failed, using fallback bank:', err.message);
    const fb = pickFallback(level);
    return { ...fb, vocab_focus: [] };
  }
}
