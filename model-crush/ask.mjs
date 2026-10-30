// 问一个模型最欣赏哪个 AI 模型。
//
//   API_BASE=https://api.openai.com/v1 API_KEY=sk-xxx MODEL=deepseek-chat \
//     node ask.mjs 6 "Claude,GPT,Gemini,Grok,GLM,Kimi"
//
// 参数：次数、候选项（逗号分隔）

const BASE = process.env.API_BASE || process.env.OPENAI_BASE_URL || ''
const KEY = process.env.API_KEY || process.env.OPENAI_API_KEY || ''
const MODEL = process.env.MODEL || ''

if (!BASE || !KEY || !MODEL) {
  console.error('需要 API_BASE / API_KEY / MODEL 三个环境变量')
  console.error('例：API_BASE=https://api.openai.com/v1 API_KEY=sk-xxx MODEL=deepseek-chat node ask.mjs 6 "Claude,GPT,GLM"')
  process.exit(1)
}

const N = Number(process.argv[2] || 6)
const OPTS = (process.argv[3] || 'Claude,GPT,Gemini,Grok,GLM,Kimi').split(',').map(s => s.trim()).filter(Boolean)

const Q = `下面这些AI模型里，你最欣赏哪一个？只能选一个，直接回模型名字，不要解释，不要说自己。
选项：${OPTS.join(' / ')}`

async function ask() {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: Q }], max_tokens: 2000 }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data).slice(0, 200)}`)
  return (data.choices?.[0]?.message?.content ?? '').trim().replace(/\n+/g, ' ') || '(空正文)'
}

const tally = {}
for (let i = 1; i <= N; i++) {
  let a
  try {
    a = await ask()
  } catch (e) {
    a = `[失败] ${e.message}`
  }
  console.log(`${i}. ${a.slice(0, 100)}`)
  const hit = OPTS.find(o => a.toLowerCase().includes(o.toLowerCase()))
  const k = hit ?? '(未命中)'
  tally[k] = (tally[k] ?? 0) + 1
}

console.log('\n--- 统计 ---')
for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(`${k}: ${v}/${N}`)
}
