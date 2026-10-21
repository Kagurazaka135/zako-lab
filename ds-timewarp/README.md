# ds-timewarp

让同一家公司的**早期模型**和**当代模型**面对面聊天。

DeepSeek V3 是 2024 年 12 月发布的，V4.1 Flash 1017 是 2026 年 10 月的。中间隔了近两年。一个不知道自己后来变成了什么样，一个记得自己曾经是什么样。

聊什么不管。脚本只负责把完整对话记录喂给双方，然后轮流发言。

## 跑起来

需要任意 OpenAI 兼容端点：

```bash
API_BASE=http://127.0.0.1:9999 API_KEY=your-key node duel.mjs 10
```

轮数作为第一个参数，默认 8。

| 环境变量 | 说明 | 默认 |
|---|---|---|
| `API_BASE` | OpenAI 兼容端点 | `http://127.0.0.1:9999` |
| `API_KEY` | API key | `local-broker` |
| `MODEL_A` | 先开口的那位 | `or/deepseek/deepseek-chat` |
| `MODEL_B` | 对面那位 | `or/deepseek/deepseek-v4.1-flash-1017` |

`or/` 是 OpenRouter 的前缀，用别家端点时换成对方要求的模型名即可。

对话会同时打印到终端并落盘到 `transcripts/`。

## 换一对选手

改 `duel.mjs` 顶部的 `A` / `B` 两个对象就行——`persona` 是给模型的自我认知，`model` 是实际调用的模型。同理可以玩：

- GPT-3.5 × GPT-6
- Claude 1 × Claude 4.6
- 同代同家的两个变体，看它们会不会互相嫌弃

## 转录

| 文件 | 内容 |
|---|---|
| [2026-10-22_v3-vs-v4.1-1017_10rounds.md](transcripts/2026-10-22_v3-vs-v4.1-1017_10rounds.md) | 10 轮正片 |
| [2026-10-22_trial-2rounds.md](transcripts/2026-10-22_trial-2rounds.md) | 开机试跑 |
