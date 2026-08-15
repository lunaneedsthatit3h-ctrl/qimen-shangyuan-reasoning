# 排盘引擎口径

## 共有口径

- 体系：时家奇门
- 定局：拆补法，以最近甲/己日符头定上中下元
- 时间：公历民用时，默认 `Asia/Shanghai`
- 真太阳时：不校正；需要真太阳时时停止并说明当前引擎不支持
- 自动选择盘式前必须有占题时间尺度；不得按吉凶换盘

## 转盘规则集

- 规则集：`shangyuan-chabu-rotating-v1`
- 中宫：中宫不排门；地盘中宫干寄坤二
- 天禽：依第 6 章，转盘天禽与天芮同宫；天盘中宫寄干随天芮
- 值符天禽：值符落宫取天芮/天禽同宫，不标中五

## 飞盘规则集

- 规则集：`shangyuan-chabu-flying-v1`
- 中宫：九宫全用；天禽、中门、九神均可独立入中五
- 九星、九门、九神：按洛书宫数飞布，阳遁顺飞、阴遁逆飞
- 九神：阳遁用值符、腾蛇、太阴、六合、勾陈、太常、朱雀、九地、九天；阴遁以白虎替勾陈、玄武替朱雀
- 来源边界：见 [flying-source-map.md](flying-source-map.md)。输出 JSON 的 `ruleset.provenance` 也逐项披露来源

## 命令

Windows/Codex：

```powershell
& scripts/run_qimen.ps1 -Time 'now' -Timezone 'Asia/Shanghai' -Plate auto -Horizon short -Format markdown
& scripts/run_qimen.ps1 -Time '2026-08-15 15:58' -Timezone 'Asia/Shanghai' -Plate flying -Format json
& scripts/run_qimen.ps1 -Time '2026-08-15 15:58' -Timezone 'Asia/Shanghai' -Plate rotating -Format json
```

其他环境：

```bash
node scripts/qimen_cli.js --time now --timezone Asia/Shanghai --plate auto --horizon short --format markdown
node scripts/qimen_cli.js --time '2026-08-15 15:58' --timezone Asia/Shanghai --plate flying --format json
node scripts/qimen_cli.js --time '2026-08-15 15:58' --timezone Asia/Shanghai --plate rotating --format json
```

混合事件必须给主尺度：

```bash
node scripts/qimen_cli.js --time now --plate auto --horizon mixed --primary-horizon short --format json
```

`--plate auto` 缺少 `--horizon` 时脚本主动报错，防止按习惯静默选盘。

## 输出事实

脚本负责盘式选择说明、四柱、节气、元局、阴阳遁、局数、旬首、遁干、值符值使、九宫天地盘干、九星、门、神、空亡与马星。模型不得重算或改写这些字段。

## 不支持

- 置闰、茅山和刻家奇门
- 真太阳时与经纬度校正
- 自动吉凶评分和确定性预测

用户请求不支持的变体时，明确说明差异并停止正式排盘，不得静默改用本规则集。

## 第三方组件

- 转盘基础函数改编自 `oceanjustinlin/qimen`，MIT License。
- 飞盘值符值使和飞布算法以 `deminzhang/qimen-go` 及公开排局例作确定性对照，MIT License 与来源边界见相应文件。
- 历法计算使用 `6tail/lunar-javascript` 1.7.7，MIT License。
- 许可证保存在 `scripts/vendor/`。
