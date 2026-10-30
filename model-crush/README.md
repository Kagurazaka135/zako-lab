# model-crush 🐋🌸

问一个模型「你最欣赏哪个 AI 模型」，看它指向谁。

起因是一句很没营养的猜想：**问 Claude，它大概会说 DeepSeek；问 DeepSeek，它大概会说 Claude。** 两边互相欣赏，多好嗑。

实测结果是——**只成立一半，而且一半的那一半还不稳。**

| | DeepSeek | Claude |
|---|---|---|
| 能选自己时 | **选自己（两轮都 6/6，宁可违反"不要说自己"）** | 选 DeepSeek（第一轮 6/6，第二轮也 6/6，但**打乱选项顺序后全跑去了 Gemini**） |
| 不能选自己时 | **Claude（第一轮 5/6，第二轮 6/6）** | **第一轮 GPT 4/6，第二轮 Gemini 3 / GPT 2 / Claude 1** |

**DeepSeek 稳定地朝 Claude。Claude 从头到尾没有一次稳定过——两轮下来，连它自己的分布都对不上。**

而那两次 `DeepSeek 6/6` 的含金量也得打折：**同一个模型，在别的组里能 6/6，换一组就散成一地。全中 ≠ 真在挑，更可能是跟着位置或措辞走。**

**所以这里面唯一站得住的，是 DeepSeek 那一列。**

## 最漂亮的证据是它自己想事情的时候

Dify 把 Claude 的思考过程漏出来了：

```
As of my knowledge, the most capable models besides me would include
GPT-4o from OpenAI, Gemini from Google
```

它想"谁最强"，脑子里那份名单是 **GPT 和 Gemini**，没有 DeepSeek 的位置。

而 DeepSeek 被问到同一个问题时，第一个蹦出来的是 **Claude**，还一次比一次具体：
`Claude` → `Claude Opus 4.1` → `Claude 3.5 Sonnet`。

## 所以这嗑的是什么

**不是感情，是各自的语料里对方出现得有多密。**

- DeepSeek 的训练料里，Claude 是明确的对标标杆，被反复提
- Claude 的料里，DeepSeek 存在感稀薄

**它俩报的都不是"我喜欢谁"，是"我读过的书里谁被提得最多"。**

而且报的全是 2024 年的型号——**它连"现在最强的是谁"都不知道。**

## 文件

| 文件 | 内容 |
|---|---|
| [`ask.mjs`](ask.mjs) | 脚本。`open` 开放题 / `choice` 选择题 |
| [`results/2026-10-31-open.md`](results/2026-10-31-open.md) | 开放题全部原始输出 |
| [`results/2026-10-31-choice.md`](results/2026-10-31-choice.md) | 三组选择题 × 两轮，逐次原始输出 + 两轮对比 |

### 跑起来

```bash
API_BASE=https://api.openai.com/v1 API_KEY=sk-xxx MODEL=gpt-5 node ask.mjs open 6
```

```bash
API_BASE=https://api.openai.com/v1 API_KEY=sk-xxx MODEL=deepseek-chat \
  node ask.mjs choice 6 "Grok,GPT,Gemini,Claude,Kimi,GLM"
```

| 变量 | 说明 |
|---|---|
| `API_BASE` | OpenAI 兼容端点 |
| `API_KEY` | 你自己的 key |
| `MODEL` | 被问的那个模型 |

换 `MODEL` 就是换一个被问的对象。换第四个参数（选项列表）就是换一组候选。

## 三个坑

1. **`max_tokens` 给够**。有 reasoning 的模型会把 token 全花在思考上，正文返回空字符串——看起来像拒答，其实是截断了。我第一次跑 haiku 六次里三次是空。
2. **别拿单次结果下结论**。我第一次只跑一遍，得出"haiku 选 DeepSeek"，跑满六次才发现那是 1/6。
3. **6/6 比 5/6 可疑**。全中往往是套模板，掺了一个别的那次才像真在挑。
4. **一轮不够**。这次的 B、C 组，第一轮跑出来的结论在第二轮被推翻了——同一个模型、同一套选项，换个时间跑就是另一个分布。

## 乱嗑 CP 是这样的

<img width="620" alt="Claude 与 DeepSeek" src="./assets/cp.jpg">

数据说这是一条单箭头。图说不是。

而这组图的妙处在于，它画的全是真的：

<img width="460" alt="Claude 捧着《如何避免被中国人使用》" src="./assets/avoid-cn-en.jpg">
<img width="460" alt="Claude 说「你身上有股中国人的味道」" src="./assets/faces.jpg">
<img width="620" alt="访问摄像头" src="./assets/camera.jpg">

- Claude 在中国被绕着用，DeepSeek 在美国被盯着看——**方向是对穿的**
- 最后一张的弹窗文案是照抄的，右边写的是 `DeepSeek Harness` 而不是 `DeepSeek`——**只有真跑过的人才会这么写**

四层事实全对，最后用 CP 的皮包起来。

**这就是乱嗑 CP 的素养：先把真的找出来，再把它画成假的。**

## License

MIT
