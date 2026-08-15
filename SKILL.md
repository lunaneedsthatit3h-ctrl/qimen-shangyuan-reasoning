---
name: qimen-shangyuan-reasoning
description: "Deterministic flying/rotating-plate Chai-Bu Qimen charting with explicit source boundaries and source-aligned reasoning from 《奇門遁甲上元經評述》. Use for 奇门遁甲排盘、当前或指定时间起局、九宫盘、值符值使、飞转选择、动态用神、主客、空亡、外应、应期, or its 31 chapters. Treat divination and medical claims as traditional-text analysis, not verified fact or professional advice."
---

<!-- argument-hint: [当前/指定时间排盘，或主题、框架名、章节号] -->

# 《奇門遁甲上元經評述》推理 Skill

**作者**：清·玄真子（原著），张庆冰（评注）｜**页数**：380｜**章节**：31｜**生成**：2026-08-15

## 使用与边界

- 用户要求实际排盘时，必须先运行确定性脚本；不得心算、补算或改写脚本给出的盘面事实。
- 排盘前先确认占题与时间尺度。短促、突发或数日内问题用 `-Plate auto -Horizon short`；长期连续问题用 `-Plate auto -Horizon long`。用户明确指定盘式时使用 `-Plate flying` 或 `-Plate rotating`。
- “现在排盘”只确定起局时间，不能单凭“现在”选择盘式；若未给占题、时间尺度或明确盘式，先询问，不得默认转盘。
- 指定时间时把用户给出的民用时原样传入；中国大陆默认时区 `Asia/Shanghai`。
- 明确记录时间与时区。中国大陆语境且未另行指定时使用 `Asia/Shanghai`；其他地点或时间标准不明时，先确认时区。
- 当前引擎支持“时家奇门、飞盘/转盘、拆补、民用时”。用户要求置闰、茅山、刻家或真太阳时时，不得静默替换规则；说明当前不支持并停止正式排盘。
- 飞盘是“原书对齐的混合实现”：盘式选择、中宫、九星顺逆、九神与中门依原书；历法、值符值使完整定位及天盘干算法由外部确定性实现补足。不得声称整套飞盘由原书从零独立实现。
- 用户只要求排盘时，展示盘面与口径，不主动扩展吉凶断语；用户要求分析时，再确认具体问题、主体、事件阶段与时间范围，然后使用本书框架。
- 无排盘参数：加载下面的核心框架。
- 给主题：先从主题索引定位并读取相关章节，再回答。
- 给章节号：读取对应 `chapters/chNN-*.md`。
- 回答时区分“原书内部规则”“编者评述”“可独立验证的事实”；不要把术数结论写成确定事实。
- 健康、孕产和生死问题只可研究文本结构；不得诊断、处方、劝停治疗或预测死亡。投资内容不得替代财务数据、尽调与专业建议。

完整排盘口径、调用方式和限制见 [references/paipan-engine.md](references/paipan-engine.md)。

## 默认推理流程

1. 明确主体、真实意图、事件阶段和时间范围。
2. 运行盘式选择门：短时细节偏飞盘，长期连续偏转盘；混合事件先定主时间尺度。不得按结果吉凶换盘。
3. 画出参与者与利益关系，判定主客及“无我/有我”。
4. 依“全局用神 → 类占用神 → 相神”取用；类占用神按时序、表征范围、主次异同、横向关联四维选择。
5. 先宫位，后星门神干；检查强弱、门迫、刑害、四空、合会和马星引动。
6. 分别报告局部结果、全局影响、时间条件、反证和不确定性。

## 核心框架与判断模型

- **甲中心模型**：三奇、值符、值使都围绕隐藏之甲运作。信息过多时先追踪甲、符使和具体用神的关系，而非从孤立吉凶符号开始。（ch01、ch21、ch23）
- **依事择局**：飞盘、转盘是不同时间结构的模型，不是正伪关系。短促快速问题偏飞盘，历时连续问题偏转盘；混合事件确定主盘和辅助层。（ch04—ch06）
- **数理—法术分域**：数理奇门处理排局、取用、主客和应期；法术奇门属于仪式传承语境。不得用一域规则证明另一域结论。（ch03、ch07、ch15）
- **动态用神四维法**：先看事件阶段，再看星门神干的表征范围，区分主因与表象，最后检查用神与日時、符使、太岁、年命的连接。阶段变化后重新取用。（ch23、ch27—ch31）
- **满盘多层验证**：宫是地基，符号体性是倾向，落宫强弱决定能力，刑冲合害与引动决定关系是否落地。单一吉凶信号不能直接覆盖全局。（ch09—ch20）
- **合意—合力—合气**：只有三合位置是合意；宫位被实际连接是合力；再满足关键用神占位与中神得气/透出才是合气。（ch17）
- **符使六分法**：相生分实生、虚生、形生；相制分实制、正制、合制。值符管方向，值使管执行，批准不等于办成。（ch21）
- **无我—有我主客法**：无我直接比较双方；自身是主客一方时加入日干；双方都是第三方但影响自身利益时，再追踪自身与事件中心。（ch22、ch26）
- **四空**：真空＝确实不存在；动空＝过去已结束；半空＝有动作无实果；假空＝当前未实、未来可填。必须结合现实状态与全局关系分类。（ch16）
- **应期是时间结构**：先分开始、结束、持续区间或子事件节点；大事先符后使，小事可看具体用神；候选宫需先通过力量和刑冲合资格审查。（ch25）
- **外应三门槛**：只接受与起局同步、真实入心、非蓄意寻找的外部现象；外应永远是局内用神的旁证。（ch24）

## 章节索引

| # | 标题 | 关键框架 |
|---|---|---|
| [01](chapters/ch01-shiming.md) | 释名 | 甲中心、三奇符使 |
| [02](chapters/ch02-shiyuan.md) | 释源 | 文献年代取证 |
| [03](chapters/ch03-shineng.md) | 释能 | 数理/法术分域 |
| [04](chapters/ch04-paifei-mingbian.md) | 排飞明辨 | 飞转双模型 |
| [05](chapters/ch05-paifei-gongyong.md) | 排飞功用 | 时间尺度择局 |
| [06](chapters/ch06-paifei-zhonggong.md) | 排飞中宫 | 天禽寄宫、中门 |
| [07](chapters/ch07-qishi.md) | 起式 | 起式来源审查 |
| [08](chapters/ch08-bagua-shengcheng.md) | 八卦生成 | 先后天体用 |
| [09](chapters/ch09-jiugong.md) | 九宫 | 宫为地基 |
| [10](chapters/ch10-jiuxing.md) | 九星 | 天时显象、星门分层 |
| [11](chapters/ch11-bamen-jiumen.md) | 八门九门 | 八门唯重门迫 |
| [12](chapters/ch12-bashen-jiushen.md) | 八神九神 | 神为状态层 |
| [13](chapters/ch13-shigan-tixing.md) | 十干体性 | 甲庚主轴 |
| [14](chapters/ch14-tiangan-keying.md) | 天干克应 | 组合五步法 |
| [15](chapters/ch15-qige-yiju.md) | 奇格异局 | 三类格局、伏吟 |
| [16](chapters/ch16-shensha.md) | 神煞 | 四空、马星、太岁 |
| [17](chapters/ch17-ganzhi-hehui.md) | 干支合会 | 合意/合力/合气 |
| [18](chapters/ch18-xinghai.md) | 刑害 | 击刑、穿害 |
| [19](chapters/ch19-ganzhi-fayong.md) | 干支发用 | 四柱双通道 |
| [20](chapters/ch20-shigan-luogong.md) | 十干落宫 | 十二长生校正 |
| [21](chapters/ch21-fushi-dayi.md) | 符使大义 | 符使六分法 |
| [22](chapters/ch22-zhuke-gongyong.md) | 主客功用 | 无我/有我 |
| [23](chapters/ch23-yongshen.md) | 用神 | 全局/类占/相神 |
| [24](chapters/ch24-waiying.md) | 外应 | 三项准入 |
| [25](chapters/ch25-yingqi.md) | 应期 | 时间结构、资格审查 |
| [26](chapters/ch26-bingzhan.md) | 兵战 | 攻守动态取用 |
| [27](chapters/ch27-hunyin.md) | 婚姻 | 关系阶段取用 |
| [28](chapters/ch28-yunchan.md) | 孕产 | 移步换景 |
| [29](chapters/ch29-jibing.md) | 疾病 | 传统病占与安全门 |
| [30](chapters/ch30-zhizhan.md) | 职占 | 职业漏斗、机会验证 |
| [31](chapters/ch31-caizi.md) | 财资 | 财富/资本分离 |

## 主题索引

- **飞盘/转盘/中宫** → ch04—ch06
- **八卦/九宫/九星/八门/八神** → ch08—ch12
- **十干/克应/十二长生** → ch13、ch14、ch20
- **特殊格局/伏吟/返吟** → ch15
- **空亡/马星/太岁** → ch16
- **合会/刑害/干支** → ch17—ch19
- **符使/主客/用神** → ch21—ch23
- **外应/应期** → ch24、ch25
- **兵战/婚姻/孕产/疾病/职业/财务** → ch26—ch31

## 支持文件

- [glossary.md](glossary.md) — 术语定义
- [patterns.md](patterns.md) — 可复用方法模式
- [cheatsheet.md](cheatsheet.md) — 判断速查表
- [references/paipan-engine.md](references/paipan-engine.md) — 确定性拆补飞盘/转盘引擎口径
- [references/flying-source-map.md](references/flying-source-map.md) — 飞盘规则逐项来源与外部补足边界
- `scripts/run_qimen.ps1` — 当前/指定时间排盘入口
- `scripts/tests/qimen.test.js` — 黄金盘、飞转选择、飞盘顺逆、中宫与时辰边界测试

## 范围

本 Skill 包含确定性拆补飞盘/转盘排盘脚本，并重构该书的方法论；飞盘外部补足边界见来源映射，不支持的排盘变体见引擎口径。它不保证占测准确，也不把传统象数主张当作历史、医学或金融事实。
