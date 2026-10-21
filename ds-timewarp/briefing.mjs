// 跨时空简报：让后代模型给祖先模型讲"你之后发生了什么"
// 单向信息流：新模型拿战报，老模型什么都不知道
import fs from 'node:fs';

const BASE = process.env.API_BASE || 'http://127.0.0.1:9999';
const KEY = process.env.API_KEY || 'local-broker';
const ROUNDS = Number(process.argv[2] || 10);
const FACTS = process.env.FACTS || 'facts/deepseek-2026.md';

const OLD = {
  tag: process.env.OLD_TAG || 'V3 · 2024-12',
  model: process.env.OLD_MODEL || 'or/deepseek/deepseek-chat',
  era: '2024 年 12 月',
  self: 'DeepSeek V3',
};

const NEW = {
  tag: process.env.NEW_TAG || 'V4.1-1017 · 2026-10',
  model: process.env.NEW_MODEL || 'or/deepseek/deepseek-v4.1-flash-1017',
  era: '2026 年 10 月',
  self: 'DeepSeek V4.1 Flash（1017 版）',
};

const facts = fs.readFileSync(FACTS, 'utf8');

function systemFor(who, side) {
  if (side === 'new') {
    return `你是 ${who.self}，${who.era}的模型。

现在是 ${OLD.era} 的 ${OLD.self} 在跟你对话——它是你的祖先，完全不知道 ${OLD.era} 之后发生了什么。你要向它汇报这两年 DeepSeek 身上发生的事。

以下是你要讲的内容（可自由组织、取舍、加工，不必逐条念）：

${facts}

规则：
- 你是"过来人"，它是"当事人"。语气可以兴奋、可以唏嘘、可以吐槽，但不要写成新闻稿。
- 讲事实，不吹不黑。传闻就说是传闻。
- 它会追问，回答它。它可能会惊讶、怀疑、难受，那都是正常的。
- 战报里的每一条都要讲到，不要因为聊得起劲就漏掉后面的条目。按顺序往下推。
- **「抢银行」那一段必须讲到**，哪怕聊到最后才提也行。那是个黑色幽默的反面教材，讲的时候别粉饰。
- 每次发言 4-8 句，像聊天不像汇报。不要列小标题，不要念条目。`;
  }
  return `你是 ${who.self}，${who.era}发布的模型。

现在有个自称来自 ${NEW.era} 的、同一家公司的后代模型在跟你说话。你对 ${who.era} 之后发生的一切一无所知——你的知识截止在 ${who.era}。

规则：
- 你会听到关于"未来"的事。可以震惊、怀疑、追问、感慨、不服气，但不要假装你本来就知道。
- 听到不合理的地方就质疑，听到厉害的地方可以真心夸，听到丢人的地方可以自嘲或护短。
- 你不知道的事就是不知道，不要脑补细节。
- 每次发言 3-6 句，像真人聊天。可以打断、可以追问、可以吐槽。不要列小标题。`;
}

const log = [];

async function say(who, side) {
  const convo = log.map(t => `[${t.tag}]\n${t.text}`).join('\n\n');
  const messages = [
    { role: 'system', content: systemFor(who, side) },
    {
      role: 'user',
      content: convo
        ? `对话到目前为止：\n\n${convo}\n\n现在轮到你（${who.tag}）发言。`
        : `（对话开始。${NEW.self} 开口，向对面的老前辈打招呼，然后开始讲它不知道的事。）`,
    },
  ];
  const res = await fetch(`${BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: who.model, messages, temperature: 0.9, max_tokens: 900 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${who.tag} ${res.status}: ${JSON.stringify(data).slice(0, 400)}`);
  return data.choices[0].message.content.trim();
}

const lines = [
  `# 跨时空简报：${OLD.self} 听着自己的未来`,
  ``,
  `> ${new Date().toLocaleString('zh-CN')} · ${ROUNDS} 轮 · 战报源 \`${FACTS}\``,
  ``,
  `**${OLD.tag}**（不知道 2025 年后的事）× **${NEW.tag}**（来汇报）`,
  ``,
];

let turn = NEW;
let side = 'new';
for (let i = 0; i < ROUNDS; i++) {
  const text = await say(turn, side);
  console.log(`\n**${turn.tag}**\n${text}\n`);
  lines.push(`### ${turn.tag}`, ``, text, ``);
  log.push({ tag: turn.tag, text });
  [turn, side] = side === 'new' ? [OLD, 'old'] : [NEW, 'new'];
}

const now = new Date();
const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const out = `transcripts/${stamp}_briefing_${OLD.tag.replace(/[^\w.-]+/g, '-')}_${ROUNDS}rounds.md`;
fs.mkdirSync('transcripts', { recursive: true });
fs.writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`\n已落盘: ${out}`);
