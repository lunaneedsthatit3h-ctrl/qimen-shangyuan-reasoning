#!/usr/bin/env node
const { buildQimenChart } = require('./lib/qimenChart.js');
const { buildFlyingChart } = require('./lib/flyingChart.js');
const { selectPlate } = require('./lib/qimenSelector.js');

function parseArgs(argv) {
  const out = { time: 'now', timezone: 'Asia/Shanghai', format: 'markdown', plate: 'auto' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--time') out.time = argv[++i];
    else if (arg === '--timezone') out.timezone = argv[++i];
    else if (arg === '--format') out.format = argv[++i];
    else if (arg === '--plate') out.plate = argv[++i];
    else if (arg === '--horizon') out.horizon = argv[++i];
    else if (arg === '--primary-horizon') out.primaryHorizon = argv[++i];
    else if (arg === '--json') out.format = 'json';
    else if (arg === '--help' || arg === '-h') out.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function currentParts(timezone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  const p = Object.fromEntries(formatter.formatToParts(new Date()).filter(x => x.type !== 'literal').map(x => [x.type, x.value]));
  return { year: +p.year, month: +p.month, day: +p.day, hour: +p.hour, minute: +p.minute };
}

function parseTime(value, timezone) {
  if (!value || value === 'now') return currentParts(timezone);
  const m = String(value).match(/^(\d{4})[-/]?(\d{2})[-/]?(\d{2})[ T]?(\d{2}):?(\d{2})$/);
  if (!m) throw new Error('Time must be now or YYYY-MM-DD HH:mm');
  return { year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: +m[5] };
}

function marks(p) {
  const out = [];
  if (p.is_zhi_fu) out.push('值符');
  if (p.is_zhi_shi) out.push('值使');
  if (p.kong_wang?.day) out.push('日空');
  if (p.kong_wang?.hour) out.push('时空');
  if (p.ma_xing?.day) out.push('日马');
  if (p.ma_xing?.hour) out.push('时马');
  return out;
}

function palaceCell(p) {
  if (p.is_center && !p.star && !p.door && !p.god) return `**中5·中宫**<br>地${p.earth}（寄坤2）`;
  const tag = marks(p);
  const hostedSky = p.hosted_sky ? `（寄${p.hosted_sky}）` : '';
  const hostedEarth = p.hosted_earth ? `（寄${p.hosted_earth}）` : '';
  return `**${p.name}·${p.direction}**${tag.length ? `〔${tag.join('·')}〕` : ''}<br>${p.god}<br>${p.star}<br>${p.door}<br>天${p.sky}${hostedSky}·地${p.earth}${hostedEarth}`;
}

function renderMarkdown(result) {
  const p = result.chart.palaces;
  const lines = [
    `时间：${result.normalized_input.civil_time}（${result.normalized_input.timezone}，民用时）`,
    `四柱：${result.pillars.year}年　${result.pillars.month}月　${result.pillars.day}日　${result.pillars.hour}时`,
    `局式：${result.calendar.jieqi}·${result.calendar.yuan}·${result.chart.ju_name}·${result.ruleset.plate}`,
    `盘式选择：${result.plate_selection.reason}`,
    `旬首：${result.chart.xun_shou}　遁干：${result.chart.hidden_jia_stem}`,
    `值符：${result.chart.zhi_fu.star}，落${result.chart.zhi_fu.palace}　值使：${result.chart.zhi_shi.door}，落${result.chart.zhi_shi.palace}`,
    `日空：${result.chart.kong_wang.day}　时空：${result.chart.kong_wang.hour}　日马：${result.chart.ma_xing.day}　时马：${result.chart.ma_xing.hour}`,
    '', '|  |  |  |', '|---|---|---|',
    `| ${palaceCell(p[0])} | ${palaceCell(p[1])} | ${palaceCell(p[2])} |`,
    `| ${palaceCell(p[3])} | ${palaceCell(p[4])} | ${palaceCell(p[5])} |`,
    `| ${palaceCell(p[6])} | ${palaceCell(p[7])} | ${palaceCell(p[8])} |`,
    '', ...result.warnings.map(w => `- ${w}`)
  ];
  return lines.join('\n');
}

function printHelp() {
  process.stdout.write('Usage: node scripts/qimen_cli.js [--time now|"YYYY-MM-DD HH:mm"] [--timezone Asia/Shanghai] [--plate auto|rotating|flying] [--horizon immediate|short|long|mixed] [--primary-horizon short|long] [--format markdown|json]\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return printHelp();
  if (!['markdown', 'json'].includes(args.format)) throw new Error('Format must be markdown or json');
  const parts = parseTime(args.time, args.timezone);
  const selection = selectPlate({ plate: args.plate, horizon: args.horizon, primaryHorizon: args.primaryHorizon });
  const result = selection.selected === 'flying'
    ? buildFlyingChart({ ...parts, timezone: args.timezone })
    : buildQimenChart({ ...parts, timezone: args.timezone });
  result.plate_selection = selection;
  process.stdout.write(args.format === 'json' ? JSON.stringify(result, null, 2) : renderMarkdown(result));
}

if (require.main === module) {
  try { main(); } catch (error) {
    process.stderr.write(`qimen_cli error: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { parseArgs, parseTime, currentParts, renderMarkdown };
