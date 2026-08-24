// Maps tone-marked vowels to tone numbers, so we can extract the *expected* tone
// for each syllable directly from Claude-generated pinyin (which uses diacritics).

const TONE_MAP = {
  ā: 1, ē: 1, ī: 1, ō: 1, ū: 1, ǖ: 1,
  á: 2, é: 2, í: 2, ó: 2, ú: 2, ǘ: 2,
  ǎ: 3, ě: 3, ǐ: 3, ǒ: 3, ǔ: 3, ǚ: 3,
  à: 4, è: 4, ì: 4, ò: 4, ù: 4, ǜ: 4,
};

// Splits a pinyin string like "nǐ hǎo, wǒ jiào dà wèi." into clean syllables,
// stripping punctuation.
export function splitPinyinSyllables(pinyin) {
  return pinyin
    .split(/\s+/)
    .map(s => s.replace(/[,.!?，。！？、]/g, '').trim())
    .filter(Boolean);
}

export function toneOfSyllable(syllable) {
  for (const ch of syllable) {
    if (TONE_MAP[ch]) return TONE_MAP[ch];
  }
  return 5; // neutral tone — no diacritic
}

// Returns [{ syllable, tone }] for a full pinyin string.
export function expectedTones(pinyin) {
  return splitPinyinSyllables(pinyin).map(syllable => ({
    syllable,
    tone: toneOfSyllable(syllable),
  }));
}
