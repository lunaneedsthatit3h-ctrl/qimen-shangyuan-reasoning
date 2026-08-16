# qimen-shangyuan-reasoning

基于《奇門遁甲上元經評述》构建的 Codex 奇门遁甲 Skill，提供**时家奇门、拆补定局、飞盘/转盘双模式排盘**，以及具有明确来源边界的传统文本推理流程。

本项目的目标不是简单生成盘面，而是把“时间输入、盘式选择、确定性排盘、用神分析、吉凶判断、应期推演和来源披露”组织成一套可执行、可复查、可测试的完整工作流。

> **关键说明**：原书本身包含飞盘与转盘的论述；缺少飞盘的是本项目所采用的上游基础排盘代码。项目在原有转盘函数基础上新增了独立飞盘引擎，并对飞盘规则的原书依据、结构推论和外部算法补足逐项标注。

## 相对原始代码的主要增强

### 1. 新增飞盘排盘引擎

上游基础代码主要提供转盘排盘能力。本项目新增 `shangyuan-chabu-flying-v1` 飞盘规则集，实现：

- 九宫全部参与飞布，中五宫不再只作为寄宫处理
- 九星依洛书宫序飞布，阳遁顺飞、阴遁逆飞
- 中门参与九门飞布
- 九神体系完整进入九宫，阳遁与阴遁分别采用对应序列
- 天禽、中门和第九神可以独立进入中五宫
- 飞星携带本位宫地盘干，生成飞盘天盘干
- 飞盘值符、值使及旬内落宫位置的确定性计算

### 2. 建立飞盘/转盘双模式

项目同时保留并规范转盘规则集 `shangyuan-chabu-rotating-v1`，形成统一的双模式接口：

| 模式 | 结构特点 | 适用时间尺度 |
|---|---|---|
| 飞盘 | 九宫跳布，中宫参与，强调短时变化与离散节点 | 短促、突发、快速变化或数日内事件 |
| 转盘 | 星门按盘旋转，中宫寄宫，强调连续演化 | 长期、连续、分阶段发展的事件 |

自动模式必须先取得问题的时间尺度；脚本不会因为某一种盘的结果更吉或更符合预期而更换盘式。混合事件必须明确主要时间尺度，再确定主盘。

### 3. 增加确定性排盘入口

支持以当前时间或指定民用时间起局，程序统一输出：

- 公历时间与时区
- 年、月、日、时四柱
- 节气、阴阳遁与拆补上中下元
- 局数、旬首与遁干
- 值符、值使及其落宫
- 九宫天地盘干、九星、九门与九神
- 空亡与马星
- 所用规则集及来源信息

盘面事实由脚本确定，推理模型不得心算、补算或改写程序输出，因此同一组输入可以得到一致结果。

### 4. 增加来源边界与可追溯性

本项目不把所有排盘规则笼统归为“原书内容”，而是明确分为四类：

| 来源层级 | 内容示例 |
|---|---|
| 原书明确规则 | 飞转选择原则、中宫差异、九星顺逆、九神序列、中门存在 |
| 原书结构推论 | 九门依洛书本位次序与星神同向飞布 |
| 外部算法补足 | 飞盘值符值使完整定位、天盘干携带规则 |
| 外部历法计算 | 四柱、节气、拆补局数和基础时间计算 |

飞盘输出中的 `ruleset.provenance` 会披露各项规则的来源性质。完整映射见 [`references/flying-source-map.md`](references/flying-source-map.md)。

### 5. 增加结构化判断流程

在确定性排盘之上，Skill 按原书评述重构以下推理框架：

- 全局用神、类占用神与相神的分层取用
- 无我/有我条件下的主客判断
- 宫位、星、门、神、干的多层验证
- 旺衰、门迫、刑害、合会、空亡和马星引动
- 真空、动空、半空、假空的现实状态区分
- 外应的同步、入心与非蓄意三项准入条件
- 开始、结束、持续区间与子事件节点的应期拆分
- 局部结果、全局影响、成立条件、反证和不确定性的分别报告

这使项目从单纯的排盘工具扩展为“排盘 + 传统文本分析”的完整 Skill。

### 6. 增加自动化回归测试

项目包含 15 项自动测试，覆盖：

- 多组黄金盘结果
- 当前时间回归
- 时辰边界与非法日期处理
- 飞盘阳遁顺飞、阴遁逆飞
- 九宫、中门、天禽和九神完整性
- 飞盘/转盘选择门
- 混合事件与缺少时间尺度时的错误处理
- JSON 与 Markdown 输出

## 功能范围

当前版本支持：

- 时家奇门
- 拆补法定局
- 飞盘与转盘
- 当前时间或指定时间排盘
- 公历民用时，默认时区 `Asia/Shanghai`
- Markdown 与 JSON 输出
- 用神、主客、空亡、外应、吉凶与应期的传统文本分析

当前版本不支持：

- 置闰法、茅山法和刻家奇门
- 真太阳时及经纬度校正
- 自动吉凶评分
- 将术数判断作为确定性现实预测

遇到不支持的排盘口径时，Skill 会明确说明差异并停止正式排盘，不会静默改用其他规则。

## 安装

可以让 Codex 使用 Skill Installer 从公开仓库安装：

```text
请使用 skill-installer 安装：
https://github.com/lunaneedsthatit3h-ctrl/qimen-shangyuan-reasoning
```

也可以下载整个仓库并放入 Codex 能识别的 Skills 目录。安装完成后应确保以下文件存在：

```text
qimen-shangyuan-reasoning/SKILL.md
```

重新打开 Codex 任务后即可调用。

## 调用示例

### 自然语言调用

```text
$qimen-shangyuan-reasoning 以现在时间，占我多久开学
```

```text
$qimen-shangyuan-reasoning 以 2026-08-16 14:30、Asia/Shanghai 起飞盘，分析这件短期事项
```

### Windows / Codex

```powershell
& scripts/run_qimen.ps1 -Time 'now' -Timezone 'Asia/Shanghai' -Plate auto -Horizon short -Format markdown
& scripts/run_qimen.ps1 -Time '2026-08-16 14:30' -Timezone 'Asia/Shanghai' -Plate flying -Format json
& scripts/run_qimen.ps1 -Time '2026-08-16 14:30' -Timezone 'Asia/Shanghai' -Plate rotating -Format json
```

### Node.js

```bash
node scripts/qimen_cli.js --time now --timezone Asia/Shanghai --plate auto --horizon short --format markdown
node scripts/qimen_cli.js --time '2026-08-16 14:30' --timezone Asia/Shanghai --plate flying --format json
node scripts/qimen_cli.js --time '2026-08-16 14:30' --timezone Asia/Shanghai --plate rotating --format json
```

`auto` 模式必须同时提供 `horizon`。如果事件同时包含短期和长期过程，需要额外提供 `primary-horizon`，防止程序静默代替用户选择主时间尺度。

## 测试

```bash
node --test scripts/tests/qimen.test.js
```

测试文件覆盖排盘不变量、飞盘顺逆、中宫处理、盘式选择和命令行输出。当前版本共 15 项测试。

## 项目结构

```text
qimen-shangyuan-reasoning/
├── SKILL.md                         # Skill 主入口与推理规范
├── agents/openai.yaml               # Codex 显示名称和默认提示
├── chapters/                        # 全书 31 章结构化方法笔记
├── references/paipan-engine.md      # 排盘引擎口径、命令与限制
├── references/flying-source-map.md  # 飞盘规则逐项来源映射
├── scripts/qimen_cli.js             # 跨平台命令行入口
├── scripts/run_qimen.ps1            # Windows/Codex 排盘入口
├── scripts/lib/                     # 飞盘、转盘和选择逻辑
├── scripts/tests/qimen.test.js       # 自动化测试
├── scripts/vendor/                  # 第三方依赖及许可证
├── glossary.md                      # 术语表
├── patterns.md                      # 可复用推理模式
└── cheatsheet.md                    # 判断速查表
```

## 技术来源与许可证

- 转盘基础函数改编自 [`oceanjustinlin/qimen`](https://github.com/oceanjustinlin/qimen)，MIT License。
- 飞盘值符值使与飞布算法参考 [`deminzhang/qimen-go`](https://github.com/deminzhang/qimen-go) 及公开排局例进行确定性对照，MIT License。
- 历法计算使用 [`6tail/lunar-javascript`](https://github.com/6tail/lunar-javascript) 1.7.7，MIT License。
- 第三方许可证保存在 `scripts/vendor/`。

## 使用边界

本项目用于传统文化文本研究、方法复现与软件测试。飞盘引擎属于“原书对齐的混合实现”，不能表述为整套算法完全由原书从零独立实现。

占测、健康、孕产、生死、投资等内容不属于经验证的事实，不能替代医疗、法律、财务或其他专业意见。仓库不包含原始书籍 PDF；未经权利人许可，请勿加入或传播原书电子文件。
