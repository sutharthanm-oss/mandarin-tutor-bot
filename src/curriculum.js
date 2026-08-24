// Fallback sentence bank, used if Claude generation fails or for level 1 cold start.
// "manglish" = Malaysian code-switched flavor version of the same sentence.
// Kept short and food/kopitiam/office themed — the way it's actually spoken in KL.

export const LEVELS = {
  1: 'Absolute beginner — greetings, introducing yourself, starting a basic conversation (3-6 words)',
  2: 'Beginner — ordering food/drinks, making payment, asking prices at a kopitiam or pasar',
  3: 'Basic-intermediate — small talk with strangers/clients, directions, simple daily needs, first light touches of cold-calling/appointment phrases',
  4: 'Intermediate — cold calling & appointment setting, client meetings, daily routines & plans, casual/colloquial tone throughout, mild Manglish code-switching creeping in',
  5: 'Upper-intermediate — pitching/closing deals, handling objections, casual business-advisory chat (not formal), deadlines, heavier Manglish code-switching',
  6: 'Advanced — fast colloquial speech, negotiating terms, closing calls, idioms, full-speed mixed Manglish, minimal scaffolding',
};

export const FALLBACK_BANK = {
  1: [
    {
      hanzi: '你好，我叫大卫。', pinyin: 'nǐ hǎo, wǒ jiào dà wèi.', english: 'Hello, my name is David.', manglish: null,
      breakdown: [
        { word: '你好', pinyin: 'nǐ hǎo', meaning: 'hello' },
        { word: '我叫', pinyin: 'wǒ jiào', meaning: 'my name is' },
        { word: '大卫', pinyin: 'dà wèi', meaning: 'David' },
      ],
    },
    {
      hanzi: '你吃饱了吗？', pinyin: 'nǐ chī bǎo le ma?', english: 'Have you eaten (are you full)?', manglish: null,
      breakdown: [
        { word: '你', pinyin: 'nǐ', meaning: 'you' },
        { word: '吃饱了', pinyin: 'chī bǎo le', meaning: 'eaten / full' },
        { word: '吗', pinyin: 'ma', meaning: '(question particle)' },
      ],
    },
    {
      hanzi: '很高兴认识你。', pinyin: 'hěn gāo xìng rèn shi nǐ.', english: 'Nice to meet you.', manglish: null,
      breakdown: [
        { word: '很', pinyin: 'hěn', meaning: 'very' },
        { word: '高兴', pinyin: 'gāo xìng', meaning: 'happy/glad' },
        { word: '认识', pinyin: 'rèn shi', meaning: 'to know/meet' },
        { word: '你', pinyin: 'nǐ', meaning: 'you' },
      ],
    },
  ],
  2: [
    {
      hanzi: '老板，一杯咖啡，谢谢。', pinyin: 'lǎo bǎn, yī bēi kā fēi, xiè xiè.', english: 'Boss, one coffee please, thanks.', manglish: null,
      breakdown: [
        { word: '老板', pinyin: 'lǎo bǎn', meaning: 'boss (used to address shop staff)' },
        { word: '一杯', pinyin: 'yī bēi', meaning: 'one cup' },
        { word: '咖啡', pinyin: 'kā fēi', meaning: 'coffee' },
        { word: '谢谢', pinyin: 'xiè xiè', meaning: 'thank you' },
      ],
    },
    {
      hanzi: '一共多少钱？', pinyin: 'yī gòng duō shǎo qián?', english: 'How much altogether?', manglish: null,
      breakdown: [
        { word: '一共', pinyin: 'yī gòng', meaning: 'altogether/in total' },
        { word: '多少钱', pinyin: 'duō shǎo qián', meaning: 'how much money' },
      ],
    },
    {
      hanzi: '可以用手机付钱吗？', pinyin: 'kě yǐ yòng shǒu jī fù qián ma?', english: 'Can I pay by phone?', manglish: null,
      breakdown: [
        { word: '可以', pinyin: 'kě yǐ', meaning: 'can/may' },
        { word: '用', pinyin: 'yòng', meaning: 'to use' },
        { word: '手机', pinyin: 'shǒu jī', meaning: 'mobile phone' },
        { word: '付钱', pinyin: 'fù qián', meaning: 'to pay' },
        { word: '吗', pinyin: 'ma', meaning: '(question particle)' },
      ],
    },
  ],
  3: [
    {
      hanzi: '这个价钱有点贵，可以便宜一点吗？', pinyin: 'zhè ge jià qián yǒu diǎn guì, kě yǐ pián yí yī diǎn ma?', english: 'This price is a bit expensive, can it be cheaper?', manglish: '这个 price 有点贵 leh, boleh 便宜一点 tak?',
      breakdown: [
        { word: '这个价钱', pinyin: 'zhè ge jià qián', meaning: 'this price' },
        { word: '有点贵', pinyin: 'yǒu diǎn guì', meaning: 'a bit expensive' },
        { word: '可以...吗', pinyin: 'kě yǐ...ma', meaning: 'can... ?' },
        { word: '便宜一点', pinyin: 'pián yí yī diǎn', meaning: 'a little cheaper' },
      ],
    },
    {
      hanzi: '请问你明天有空见面吗？', pinyin: 'qǐng wèn nǐ míng tiān yǒu kòng jiàn miàn ma?', english: 'Excuse me, are you free to meet tomorrow?', manglish: null,
      breakdown: [
        { word: '请问', pinyin: 'qǐng wèn', meaning: 'excuse me / may I ask' },
        { word: '你', pinyin: 'nǐ', meaning: 'you' },
        { word: '明天', pinyin: 'míng tiān', meaning: 'tomorrow' },
        { word: '有空', pinyin: 'yǒu kòng', meaning: 'to be free/available' },
        { word: '见面', pinyin: 'jiàn miàn', meaning: 'to meet' },
      ],
    },
  ],
  4: [
    {
      hanzi: '老板叫我明天九点开会，你也一起来咯。', pinyin: 'lǎo bǎn jiào wǒ míng tiān jiǔ diǎn kāi huì, nǐ yě yī qǐ lái lo.', english: 'Boss told me to have a meeting at 9 tomorrow, you come along too.', manglish: '老板 tell 我 tomorrow 9点 kena meeting, 你 also come along lah.',
      breakdown: [
        { word: '老板叫我', pinyin: 'lǎo bǎn jiào wǒ', meaning: 'boss told me' },
        { word: '明天九点', pinyin: 'míng tiān jiǔ diǎn', meaning: 'tomorrow at 9' },
        { word: '开会', pinyin: 'kāi huì', meaning: 'to have a meeting' },
        { word: '你也一起来', pinyin: 'nǐ yě yī qǐ lái', meaning: 'you come along too' },
      ],
    },
    {
      hanzi: '我姓陈，想跟你约个时间聊一聊我们的方案。', pinyin: 'wǒ xìng chén, xiǎng gēn nǐ yuē gè shí jiān liáo yī liáo wǒ men de fāng àn.', english: "My surname is Tan, I'd like to schedule a time to discuss our proposal with you.", manglish: null,
      breakdown: [
        { word: '我姓陈', pinyin: 'wǒ xìng chén', meaning: 'my surname is Tan' },
        { word: '想跟你约个时间', pinyin: 'xiǎng gēn nǐ yuē gè shí jiān', meaning: 'would like to schedule a time with you' },
        { word: '聊一聊', pinyin: 'liáo yī liáo', meaning: 'to chat/discuss briefly' },
        { word: '我们的方案', pinyin: 'wǒ men de fāng àn', meaning: 'our proposal' },
      ],
    },
  ],
  5: [
    {
      hanzi: '讲真的，这样搞法迟早会出事。', pinyin: 'jiǎng zhēn de, zhè yàng gǎo fǎ chí zǎo huì chū shì.', english: 'Honestly, doing it this way will cause problems sooner or later.', manglish: 'Jujur cakap, 这样 buat 迟早 confirm kena masalah wan.',
      breakdown: [
        { word: '讲真的', pinyin: 'jiǎng zhēn de', meaning: 'honestly/truthfully' },
        { word: '这样搞法', pinyin: 'zhè yàng gǎo fǎ', meaning: 'doing it this way' },
        { word: '迟早', pinyin: 'chí zǎo', meaning: 'sooner or later' },
        { word: '会出事', pinyin: 'huì chū shì', meaning: 'will cause problems' },
      ],
    },
    {
      hanzi: '如果你今天签约，我们可以给你一个特别优惠。', pinyin: 'rú guǒ nǐ jīn tiān qiān yuē, wǒ men kě yǐ gěi nǐ yī gè tè bié yōu huì.', english: 'If you sign today, we can give you a special discount.', manglish: '如果 you sign today, 我们 boleh 给你 special discount wan.',
      breakdown: [
        { word: '如果...今天签约', pinyin: 'rú guǒ...jīn tiān qiān yuē', meaning: 'if... sign today' },
        { word: '我们可以给你', pinyin: 'wǒ men kě yǐ gěi nǐ', meaning: 'we can give you' },
        { word: '特别优惠', pinyin: 'tè bié yōu huì', meaning: 'special discount' },
      ],
    },
  ],
  6: [
    {
      hanzi: '你不要每次都酱样啦，做人要有点担当好不好。', pinyin: 'nǐ bù yào měi cì dōu jiàng yàng la, zuò rén yào yǒu diǎn dān dāng hǎo bù hǎo.', english: "Don't be like this every time, be a bit more responsible okay.", manglish: '你 don\'t always 酱样 la, 做人 need a bit 担当 can anot.',
      breakdown: [
        { word: '你不要每次都酱样', pinyin: 'nǐ bù yào měi cì dōu jiàng yàng', meaning: "don't be like this every time" },
        { word: '做人', pinyin: 'zuò rén', meaning: 'as a person / in life' },
        { word: '要有点担当', pinyin: 'yào yǒu diǎn dān dāng', meaning: 'need to have some responsibility' },
        { word: '好不好', pinyin: 'hǎo bù hǎo', meaning: 'okay?' },
      ],
    },
  ],
};

export function pickFallback(level) {
  const bank = FALLBACK_BANK[level] || FALLBACK_BANK[1];
  return bank[Math.floor(Math.random() * bank.length)];
}
