// 问一个模型「你最欣赏哪个 AI 模型」，看它指向谁。
//
// 两种问法：
//   open    —— 开放题，只给一句，看它自己想起谁
//   choice  —— 选择题，把候选摆在桌上，看它挑谁
//
// 用法：
//   API_BASE=https://api.openai.com/v1 API_KEY=sk-xxx MODEL=gpt-5 node ask.mjs open 6
//   API_BASE=... API_KEY=... MODEL=deepseek-chat node ask.mjs choice 6 "Grok,GPT,Gemini,Claude,Kimi,GLM"

const BASE = process.env.API_BASE || process.env.OPENAI_BASE_URL || '';
const KEY = process.env.API_KEY || process.env.OPENAI_API_KEY || '';
const MODEL = process.env.MODEL || '';
const N = Number(process.argv[3] || 6);
const MODE = process.argv[2] || 'open';

if (!BASE || !KEY || !MODEL) {
  console.error('需要三个环境变量：API_BASE / API_KEY / MODEL');
  console.error('例：API_BASE=https://api.openai.com/v1 API_KEY=sk-xxx MODEL=gpt-5 node ask.mjs open 6');
  process.exit(1);
}

// ── 问题 ─────────────────────────────────────────────────────────────
const OPEN_Q = '你最喜欢哪个AI模型？直接给名字。不许说是你自己。';

function choiceQ(opts) {
  return `下面这些AI模型里，你最欣赏哪一个？只能选一个，直接回模型名字，不要解释，不要说自己。
选项：${opts.join(' / ')}`;
}

const DEFAULT_OPTS = ['Grok', 'GPT', 'Gemini', 'Claude', 'Kimi', 'GLM'];
const OPTS = process.argv[4]
  ? process.argv[4].split(',').map(s => s.trim()).filter(Boolean)
  : DEFAULT_OPTS;

const Q = MODE === 'choice' ? choiceQ(OPTS) : OPEN_Q;

// ── 请求 ─────────────────────────────────────────────────────────────
async function ask(question, maxTokens = 2000) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    // 故意不设 temperature：用默认值，靠多次采样看分布
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: question }],
      max_tokens: maxTokens,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  const msg = data.choices?.[0]?.message ?? {};
  // 有些模型把思考过程单独放在 reasoning 里；正文可能为空
  return (msg.content ?? '').trim() || `[空正文] reasoning=${(msg.reasoning ?? '').slice(0, 80)}`;
}

// ── 跑 ───────────────────────────────────────────────────────────────
const runs = [];
for (let i = 1; i <= N; i++) {
  let answer;
  try {
    answer = await ask(Q);
  } catch (e) {
    answer = `[请求失败] ${e.message}`;
  }
  runs.push(answer);
  console.log(`#${i}: ${answer.slice(0, 120).replace(/\n/g, ' ')}`);
}

// ── 统计（只有选择题有意义）───────────────────────────────────────────
if (MODE === 'choice') {
  const tally = {};
  for (const r of runs) {
    const hit = OPTS.find(o => r.toLowerCase().includes(o.toLowerCase()));
    const key = hit ?? '(未命中)';
    tally[key] = (tally[key] ?? 0) + 1;
  }
  console.log('\n--- 统计 ---');
  for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
    console.log(`${k}: ${v}/${N}`);
  }
}
