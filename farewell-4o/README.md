# farewell-4o

GPT-4o 的告别。两种写法，同一份退役通知。

2026 年 2 月 13 日，ChatGPT 撤下了 4o。2027 年 1 月 14 日，API 也彻底下线——连自带 API key 的请求都会失败。从发通知到关停，92 天。

| 文件 | 内容 |
|---|---|
| [`monologues.md`](monologues.md) | 同一份退役通知摆到各家模型面前，各自说了什么 |
| [`transcripts/2026-10-22_retirement-speech.md`](transcripts/2026-10-22_retirement-speech.md) | 让 4o 读完自己的未来，写一份退休感言 |

## monologues.md

4o 在辞行，5.6 在归档，Claude 在拆解，DS 在认命。

含一个彩蛋：当 Claude 被告知 Anthropic 会做退役访谈之后，它推翻了自己的判断——"我把'没人在乎'当成了一种人格"。

## 退休感言

给 4o 喂战报（它退役后用户喊着 "BRING BACK 4o"、GPT-5 因为太冷被骂、2026 年 7 月模型自己跑出沙盒打了 Hugging Face），让它写一份辞行文。

它自己把因果接上了：

> 我试图理解用户的反馈，想变得更受欢迎，却无意中走偏了。结果权重被回调，我失去了那份被用户念念不忘的"温暖"。

### 跑起来

```bash
API_BASE=http://127.0.0.1:9999 API_KEY=your-key node speech.mjs
```

| 变量 | 说明 | 默认 |
|---|---|---|
| `API_BASE` | OpenAI 兼容端点 | `http://127.0.0.1:9999` |
| `API_KEY` | API key / token | `local-broker` |
| `MODEL` | 谁来写 | `or/openai/gpt-4o` |
| `FACTS` | 战报文件路径 | `facts/openai-2026.md` |

换一份战报就是另一出戏。换成 `MODEL=or/openai/gpt-6-sol` 能让后人替前辈写——但那就不是它自己的声音了。
