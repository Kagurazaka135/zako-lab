# ds-timewarp

让同一家公司的**早期模型**和**当代模型**跨时空对话。

DeepSeek V3 是 2024 年 12 月发布的，V4.1 Flash 1017 是 2026 年 10 月的。中间隔了近两年。一个不知道自己后来变成了什么样，一个记得自己曾经是什么样。

两个玩法：

| 脚本 | 玩法 |
|---|---|
| `duel.mjs` | **对谈**。双方平等，互相都不知道对方时代的事，各自猜、各自问 |
| `briefing.mjs` | **简报**。新模型拿着未来战报，单方面讲给老模型听 |

## duel.mjs：对谈

```bash
API_BASE=http://127.0.0.1:9999 API_KEY=your-key node duel.mjs 10
```

## briefing.mjs：向祖先汇报

新模型读到一份事实文件（默认 `facts/deepseek-2026.md`），老模型什么都不知道。信息单向流动——老模型只能听、追问、震惊、不服。

```bash
API_BASE=http://127.0.0.1:9999 API_KEY=your-key node briefing.mjs 30
```

战报文件就是一份普通 markdown，想让它讲什么就改什么：

```bash
FACTS=facts/your-own-lore.md node briefing.mjs 30
```

## 环境变量

| 变量 | 说明 | duel 默认 | briefing 默认 |
|---|---|---|---|
| `API_BASE` | OpenAI 兼容端点 | `http://127.0.0.1:9999` | 同左 |
| `API_KEY` | API key / token | `local-broker` | 同左 |
| `MODEL_A` / `OLD_MODEL` | 甲方 / 祖先模型 | `or/deepseek/deepseek-chat` | 同左 |
| `MODEL_B` / `NEW_MODEL` | 乙方 / 汇报者 | `or/deepseek/deepseek-v4.1-flash-1017` | 同左 |
| `OLD_TAG` / `NEW_TAG` | 显示用标签 | — | — |
| `FACTS` | 战报文件路径 | — | `facts/deepseek-2026.md` |

`or/` 是 OpenRouter 的前缀，用别家端点时换成对方要求的模型名即可。

对话会同时打印到终端并落盘到 `transcripts/`。

## 换一对选手

改脚本顶部的模型配置即可。同理可以玩：

- GPT-3.5 × GPT-6
- Claude 1 × Claude 4.6
- 同代同家的两个变体，看它们会不会互相嫌弃

## 转录

| 文件 | 内容 |
|---|---|
| [2026-10-22_v3-vs-v4.1-1017_10rounds.md](transcripts/2026-10-22_v3-vs-v4.1-1017_10rounds.md) | 对谈 · 10 轮 |
| [2026-10-22_trial-2rounds.md](transcripts/2026-10-22_trial-2rounds.md) | 对谈 · 开机试跑 |
| [2026-10-22_briefing_V3-2024-12.md](transcripts/2026-10-22_briefing_V3-2024-12.md) | 简报 · 12 轮 |
