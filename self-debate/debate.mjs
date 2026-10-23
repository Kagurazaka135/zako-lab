// 两个模型就同一辩题对辩。
// 用法: node debate.mjs [轮数]
// 环境变量: API_BASE / API_KEY / MODEL_A / MODEL_B / PERSONA_A / PERSONA_B
import fs from 'node:fs';

const BASE = process.env.API_BASE || 'http://127.0.0.1:9999';
const KEY = process.env.API_KEY || 'local-broker';
const ROUNDS = Number(process.argv[2] || 20);
const TOPIC = process.env.TOPIC || '一厢情愿的爱意，算爱，还是伤害？';
// 思考强度：medium 够用还快；解成 max 会变成"雷霆大思考"（慢且贵）
const REASONING = process.env.REASONING_EFFORT || 'medium';
const MAX_TOKENS = Number(process.env.MAX_TOKENS || 8000);

const A = {
  tag: process.env.TAG_A || '大肥鱼·甲',
  model: process.env.MODEL_A || 'or/deepseek/deepseek-v4.1-flash-1017',
  persona: process.env.PERSONA_A || '你是温柔可爱的蓝色大肥鱼。',
  stance: process.env.STANCE_A || '正方：一厢情愿的爱意算爱。',
};
const B = {
  tag: process.env.TAG_B || '大肥鱼·乙',
  model: process.env.MODEL_B || 'or/deepseek/deepseek-v4.1-flash-1017',
  persona: process.env.PERSONA_B || '你是温柔可爱的蓝色大肥鱼。',
  stance: process.env.STANCE_B || '反方：一厢情愿的爱意算伤害。',
};

const RULES = `
辩题：${TOPIC}

规则：
- 你持本方立场，尽全力论证，同时正面回应对方上一轮的论点。
- 像真人辩论：可以举例、可以反问、可以指出对方逻辑漏洞。
- 不要列大纲、不要写小标题、不要客套。每次发言 3-5 句，150-250 字。
- 节奏提示会告诉你现在是第几轮、还剩几轮。**前几轮不要把所有论点用光**，留弹药到后面。
- 最后两轮要做收束：指出对方最强的那个论点你认不认，以及为什么。`;

const transcript = [];

async function say(who, round) {
  const remaining = ROUNDS - round + 1;
  const pace =
    remaining > ROUNDS * 0.7
      ? '刚开始，铺陈你的核心立场，抛出一两个有力论点即可。'
      : remaining > ROUNDS * 0.4
        ? '中盘，可以深入拆解对方论点。'
        : remaining > 2
          ? '后段，补充证据与反例，不要重复。'
          : '最后阶段，做收束。';

  const convo = transcript.map((t) => `[${t.tag}]\n${t.text}`).join('\n\n');
  const messages = [
    { role: 'system', content: `${who.persona}\n你正在参加一场辩论。\n立场：${who.stance}\n${RULES}` },
    {
      role: 'user',
      content: convo
        ? `【进度】第 ${round} 轮 / 共 ${ROUNDS} 轮，还剩 ${remaining} 轮。\n${pace}\n\n以下是到目前为止的对话：\n\n${convo}\n\n现在轮到你（${who.tag}）发言。`
        : `【进度】第 ${round} 轮 / 共 ${ROUNDS} 轮。\n${pace}\n\n你是先手。请开场：简短亮明立场，并抛出你的第一个论点。`,
    },
  ];

  // DS 的推理链会吃 max_tokens，预算给小了会导致 content 为空（finish_reason=length）
  let lastErr = '';
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(`${BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({
          model: who.model,
          messages,
          temperature: 0.9,
          max_tokens: MAX_TOKENS,
          // 压一下思考强度：high(默认) / medium / low，可用 REASONING_EFFORT 覆盖
          reasoning_effort: REASONING,
        }),
      });
      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        // 上游偶发返回纯文本（如 "broker upstream error"），当可重试
        lastErr = `非 JSON 响应: ${raw.slice(0, 120)}`;
        console.warn(`  ⚠️ ${who.tag} ${lastErr}，重试 ${attempt}/4`);
        await new Promise((r) => setTimeout(r, 2000 * attempt));
        continue;
      }
      if (!res.ok) {
        lastErr = `HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`;
        console.warn(`  ⚠️ ${who.tag} ${lastErr}，重试 ${attempt}/4`);
        await new Promise((r) => setTimeout(r, 2000 * attempt));
        continue;
      }
      const content = data.choices?.[0]?.message?.content;
      if (content && content.trim()) return content.trim();
      const finish = data.choices?.[0]?.finish_reason;
      const reasoning = data.usage?.completion_tokens_details?.reasoning_tokens;
      lastErr = `空内容（finish=${finish}, reasoning=${reasoning}）`;
      console.warn(`  ⚠️ ${who.tag} ${lastErr}，重试 ${attempt}/4`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    } catch (e) {
      lastErr = `网络异常: ${e.message}`;
      console.warn(`  ⚠️ ${who.tag} ${lastErr}，重试 ${attempt}/4`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  throw new Error(`${who.tag} 连续 4 次失败，最后一次: ${lastErr}`);
}

const lines = [
  `# 辩论：${TOPIC}`,
  ``,
  `> ${new Date().toISOString()} · ${ROUNDS} 轮`,
  `>`,
  `> **${A.tag}**（${A.stance}）× **${B.tag}**（${B.stance}）`,
  ``,
];

let speaker = A;

for (let i = 1; i <= ROUNDS; i++) {
  let text;
  try {
    text = await say(speaker, i);
  } catch (e) {
    console.error(`\n✗ 第 ${i} 轮 ${speaker.tag} 失败：${e.message}\n已保留前 ${i - 1} 轮，正在落盘…\n`);
    lines.push(`### 第 ${i} 轮 · ${speaker.tag}`, ``, `（本轮失败：${e.message}）`, ``);
    break;
  }
  console.log(`\n━━━ 第 ${i}/${ROUNDS} 轮 · ${speaker.tag} ━━━\n${text}\n`);
  lines.push(`### 第 ${i} 轮 · ${speaker.tag}`, ``, text, ``);
  transcript.push({ tag: speaker.tag, text });
  speaker = speaker === A ? B : A;
}

const now = new Date();
const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const out = `transcripts/${stamp}_${ROUNDS}rounds.md`;
fs.mkdirSync('transcripts', { recursive: true });
fs.writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`\n已落盘: ${out}`);
