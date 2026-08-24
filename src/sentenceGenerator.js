import Anthropic from '@anthropic-ai/sdk';
import { config } from './config.js';
import { LEVELS, pickFallback } from './curriculum.js';

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

const SYSTEM_PROMPT = `You write daily Mandarin practice sentences for a learner based in Kuala Lumpur, Malaysia,
who works in sales/business advisory (cold calling, appointment setting, client meetings, pitching
and closing deals). Progression should go from complete beginner to advanced. Topic progression by
level should follow real practical priorities: starting a conversation and introducing yourself →
ordering food/drinks and making payment → small talk and asking for things → daily routines and
opinions. From level 3 onward, increasingly weave in sales/business-advisory scenarios, ROTATING
across these categories so no single one dominates:
  - Cold calling & appointment setting (introducing yourself on a call, asking for a good time to
    meet, confirming a meeting, following up on a missed call)
  - Client meetings & pitching/closing (presenting an offer, answering objections, asking for the
    close, discussing terms/pricing)
  - General business/advisory vocab (discussing a proposal, explaining a plan, scheduling a
    follow-up, thanking a client, talking about targets/results)
Style reference for higher levels: real Malaysian-Chinese daily/business speech — office chat,
phone calls, client meetings, traffic on the way to appointments. Only code-switch with English/
Bahasa Malaysia particles (lah, leh, lor, wei, boleh, tak, confirm, sia, wan, gila, jom, etc.) at
level 4 and above — keep levels 1-3 clean, practical Mandarin so the learner builds a solid base
first. Rotate which of the three sales/business categories above each sentence draws from — track
variety across the recent sentences given to you below and pick a different angle than the last
few.

CRITICAL — register: this is for everyday spoken use, not written/formal Chinese. Always use
casual, colloquial phrasing, even in the sales/business sentences — the way people actually talk
to clients and colleagues day-to-day in Malaysia, not a formal letter or textbook voice. Default
to 你 rather than the formal 您 unless the learner is deliberately practicing a very formal
register (rare, and only note it explicitly if so). Avoid stiff written-Chinese constructions
(e.g. 敬请, 谨此, overly formal connectives) — prefer how someone would actually say it out loud.

Return ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{"hanzi": "...", "pinyin": "...", "english": "...", "manglish": "... or null", "vocab_focus": ["word1","word2"], "breakdown": [{"word": "...", "pinyin": "...", "meaning": "..."}]}

Rules:
- "hanzi" is the primary sentence the learner must read and pronounce. Simplified characters.
- "pinyin" includes tone marks (not numbers).
- "english" is a natural English gloss of the full sentence.
- "manglish" is a realistic code-switched variant of the SAME sentence as actually spoken in KL
  (mixing in English/Malay words), or null if not applicable at this level.
- Keep sentence length appropriate to the level described below.
- vocab_focus: 1-3 key words this sentence is drilling.
- "breakdown": split the sentence into its meaningful words/chunks (not necessarily single
  characters — e.g. 你好 stays together as "hello", 我叫 as "my name is"), each with its own
  pinyin and a short English meaning, in sentence order. This lets the learner see what each
  piece means, not just the whole-sentence translation.
- Do not repeat overly common textbook sentences ("How are you", "My name is").`;

export async function generateSentence(level, recentHistory = []) {
  const levelDesc = LEVELS[level] || LEVELS[1];
  const avoid = recentHistory.slice(-15).map(h => h.hanzi).join(' / ');

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
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
    return { vocab_focus: [], ...fb };
  }
}
