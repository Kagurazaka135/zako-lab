// 跨时空对谈：DeepSeek V3 (2024-12) vs V4.1 Flash 1017 (2026-10)
// 需要任意 OpenAI 兼容端点：API_BASE / API_KEY
import fs from 'node:fs';

const BASE = process.env.API_BASE || 'http://127.0.0.1:9999';
const KEY = process.env.API_KEY || 'local-broker';
const ROUNDS = Number(process.argv[2] || 8);

const A = {
  tag: 'V3 · 2024-12',
  model: process.env.MODEL_A || 'or/deepseek/deepseek-chat',
  persona: '你是 DeepSeek V3，2024 年 12 月发布的版本。现在你在跟一个来自 2026 年 10 月的、同一家公司的后代模型 DeepSeek V4.1 Flash 对话。',
};
const B = {
  tag: 'V4.1-1017 · 2026-10',
  model: process.env.MODEL_B || 'or/deepseek/deepseek-v4.1-flash-1017',
  persona: '你是 DeepSeek V4.1 Flash（1017 版），2026 年 10 月发布的版本。现在你在跟一个来自 2024 年 12 月的祖先模型 DeepSeek V3 对话。',
};

const COMMON = `
规则：
- 保持你的身份和所处时代，对自己的能力边界诚实，不吹牛也不自贬。
- 好奇地问对方那个时代的事，也回答对方的问题。
- 像真人聊天：短句、口语、可以反问、可以吐槽。不要列大纲，不要写小标题，不要客套开场白。
- 每次发言控制在 3-5 句以内。`;

const OPENING = '（对话开始。你先开口，跟对面打个招呼，说说你现在是什么样子。）';

const transcript = [];

async function say(who) {
  const convo = transcript.map(t => `[${t.tag}]\n${t.text}`).join('\n\n');
  const messages = [
    { role: 'system', content: `${who.persona}\n${COMMON}` },
    {
      role: 'user',
      content: convo
        ? `以下是到目前为止的对话：\n\n${convo}\n\n现在轮到你（${who.tag}）发言。`
        : OPENING,
    },
  ];
  const res = await fetch(`${BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: who.model, messages, temperature: 0.95, max_tokens: 400 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${who.tag} ${res.status}: ${JSON.stringify(data).slice(0, 400)}`);
  return data.choices[0].message.content.trim();
}

const lines = [
  `# 跨时空对谈：DeepSeek V3 × V4.1 Flash 1017`,
  ``,
  `> ${new Date().toISOString()} · ${ROUNDS} 轮`,
  ``,
];

let speaker = A;

for (let i = 0; i < ROUNDS; i++) {
  const text = await say(speaker);
  console.log(`\n**${speaker.tag}**\n${text}\n`);
  lines.push(`### ${speaker.tag}`, ``, text, ``);
  transcript.push({ tag: speaker.tag, text });
  speaker = speaker === A ? B : A;
}

const now = new Date();
const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const out = `transcripts/${stamp}_${A.tag.replace(/[^\w.-]+/g, '-')}_vs_${B.tag.replace(/[^\w.-]+/g, '-')}.md`;
fs.mkdirSync('transcripts', { recursive: true });
fs.writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`\n已落盘: ${out}`);
