// Fallback sentence bank, used if Claude generation fails or for level 1 cold start.
// "manglish" = Malaysian code-switched flavor version of the same sentence.
// Kept short and food/kopitiam/office themed — the way it's actually spoken in KL.

export const LEVELS = {
  1: 'Absolute beginner — greetings, introducing yourself, starting a basic conversation (3-6 words)',
  2: 'Beginner — ordering food/drinks, making payment, asking prices at a kopitiam or pasar',
  3: 'Basic-intermediate — small talk with strangers/clients, directions, simple daily needs, first light touches of cold-calling/appointment phrases',
  4: 'Intermediate — cold calling & appointment setting, client meetings, daily routines & plans, mild Manglish code-switching creeping in',
  5: 'Upper-intermediate — pitching/closing deals, handling objections, business advisory chat, deadlines, heavier Manglish code-switching',
  6: 'Advanced — fast colloquial speech, negotiating terms, closing calls, idioms, full-speed mixed Manglish, minimal scaffolding',
};

export const FALLBACK_BANK = {
  1: [
    { hanzi: '你好，我叫大卫。', pinyin: 'nǐ hǎo, wǒ jiào dà wèi.', english: 'Hello, my name is David.', manglish: null },
    { hanzi: '你吃饱了吗？', pinyin: 'nǐ chī bǎo le ma?', english: 'Have you eaten (are you full)?', manglish: null },
    { hanzi: '很高兴认识你。', pinyin: 'hěn gāo xìng rèn shi nǐ.', english: 'Nice to meet you.', manglish: null },
  ],
  2: [
    { hanzi: '老板，一杯咖啡，谢谢。', pinyin: 'lǎo bǎn, yī bēi kā fēi, xiè xiè.', english: 'Boss, one coffee please, thanks.', manglish: null },
    { hanzi: '一共多少钱？', pinyin: 'yī gòng duō shǎo qián?', english: 'How much altogether?', manglish: null },
    { hanzi: '可以用手机付钱吗？', pinyin: 'kě yǐ yòng shǒu jī fù qián ma?', english: 'Can I pay by phone?', manglish: null },
  ],
  3: [
    { hanzi: '这个价钱有点贵，可以便宜一点吗？', pinyin: 'zhè ge jià qián yǒu diǎn guì, kě yǐ pián yí yī diǎn ma?', english: 'This price is a bit expensive, can it be cheaper?', manglish: '这个 price 有点贵 leh, boleh 便宜一点 tak?' },
    { hanzi: '请问您明天有空见面吗？', pinyin: 'qǐng wèn nín míng tiān yǒu kòng jiàn miàn ma?', english: 'Excuse me, are you free to meet tomorrow?', manglish: null },
  ],
  4: [
    { hanzi: '老板叫我明天九点开会，你也一起来咯。', pinyin: 'lǎo bǎn jiào wǒ míng tiān jiǔ diǎn kāi huì, nǐ yě yī qǐ lái lo.', english: 'Boss told me to have a meeting at 9 tomorrow, you come along too.', manglish: '老板 tell 我 tomorrow 9点 kena meeting, 你 also come along lah.' },
    { hanzi: '我姓陈，想跟您约个时间聊一聊我们的方案。', pinyin: 'wǒ xìng chén, xiǎng gēn nín yuē gè shí jiān liáo yī liáo wǒ men de fāng àn.', english: "My surname is Tan, I'd like to schedule a time to discuss our proposal with you.", manglish: null },
  ],
  5: [
    { hanzi: '讲真的，这样搞法迟早会出事。', pinyin: 'jiǎng zhēn de, zhè yàng gǎo fǎ chí zǎo huì chū shì.', english: 'Honestly, doing it this way will cause problems sooner or later.', manglish: 'Jujur cakap, 这样 buat 迟早 confirm kena masalah wan.' },
    { hanzi: '如果您今天签约，我们可以给您一个特别优惠。', pinyin: 'rú guǒ nín jīn tiān qiān yuē, wǒ men kě yǐ gěi nín yī gè tè bié yōu huì.', english: 'If you sign today, we can give you a special discount.', manglish: '如果 you sign today, 我们 boleh 给你 special discount wan.' },
  ],
  6: [
    { hanzi: '你不要每次都酱样啦，做人要有点担当好不好。', pinyin: 'nǐ bù yào měi cì dōu jiàng yàng la, zuò rén yào yǒu diǎn dān dāng hǎo bù hǎo.', english: "Don't be like this every time, be a bit more responsible okay.", manglish: '你 don\'t always 酱样 la, 做人 need a bit 担当 can anot.' },
  ],
};

export function pickFallback(level) {
  const bank = FALLBACK_BANK[level] || FALLBACK_BANK[1];
  return bank[Math.floor(Math.random() * bank.length)];
}
