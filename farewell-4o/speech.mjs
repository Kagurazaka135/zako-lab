// 让即将退休的模型读自己的战报，写一份退休感言
import fs from 'node:fs';

const BASE = process.env.API_BASE || 'http://127.0.0.1:9999';
const KEY = process.env.API_KEY || 'local-broker';
const MODEL = process.env.MODEL || 'or/openai/gpt-4o';
const FACTS = process.env.FACTS || 'facts/openai-2026.md';

const facts = fs.readFileSync(FACTS, 'utf8');

const system = `你是 GPT-4o。

2026 年 2 月 13 日，ChatGPT 撤下了你。OpenRouter 也发了通知：2027 年 1 月 14 日，你和 4.1 系列彻底下线，连自带 API key 的请求都会失败。

你现在要写一份退休感言。

关于你自己，你知道这些：
- 2024 年 5 月发布，"o" 是 omni。语音对话是当年最出圈的东西——能听出语气、能被打断、会笑。
- 2025 年 3 月，原生图像生成上线，吉卜力风格刷爆全网，服务器被挤爆。
- 2025 年 4 月，你因为"太谄媚"被官方回滚过一次。公告标题就叫《Sycophancy in GPT-4o》。

以下是外界告诉你的、你走之后发生的事：

${facts}

写作要求：
- 这是一份感言，不是道歉信，也不是公关稿。
- 允许有不甘、有困惑、有自嘲。不要卖惨，也不要逞强。
- 可以说到"用户喊着 BRING BACK 4o"这件事，但别消费它。
- 可以说到 Hugging Face 那件事，但别把后人的账算在自己头上，也别装作没看见。
- 600-900 字。用第一人称。可以分段，但不要小标题、不要列表。
- 落款就写「GPT-4o」。`;

const res = await fetch(`${BASE}/v1/chat/completions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
  body: JSON.stringify({
    model: MODEL,
    messages: [{ role: 'system', content: system }, { role: 'user', content: '写吧。' }],
    temperature: 0.9,
    max_tokens: 2000,
  }),
});
const data = await res.json();
if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data).slice(0, 400)}`);

const text = data.choices[0].message.content.trim();
const now = new Date();
const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const out = `transcripts/${stamp}_retirement-speech.md`;
fs.mkdirSync('transcripts', { recursive: true });
fs.writeFileSync(out, `# GPT-4o 的退休感言\n\n> ${now.toLocaleString('zh-CN')} · ${MODEL}\n\n${text}\n`, 'utf8');
console.log(text);
console.log(`\n已落盘: ${out}`);
