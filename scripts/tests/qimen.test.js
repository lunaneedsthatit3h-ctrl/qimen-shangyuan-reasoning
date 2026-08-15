const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { buildQimenChart, validateCivilTime } = require('../lib/qimenChart.js');
const { buildFlyingChart, placeNine, STAR_BY_HOME_NUMBER, GODS_YANG, GODS_YIN } = require('../lib/flyingChart.js');
const { selectPlate } = require('../lib/qimenSelector.js');

function chart(text) {
  const m = text.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
  return buildQimenChart({
    year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: +m[5],
    timezone: 'Asia/Shanghai'
  });
}

const goldenCases = [
  {
    time: '2027-07-01 09:01', pillars: ['丁未', '丙午', '辛巳', '癸巳'],
    jieqi: '夏至', yuan: '上元', ju: '阴遁9局', zf: ['天柱', '巽4宫'],
    zs: ['驚門', '兑7宫'], kong: ['申酉', '午未'], ma: ['亥', '亥']
  },
  {
    time: '2020-01-01 14:30', pillars: ['己亥', '丙子', '癸卯', '己未'],
    jieqi: '冬至', yuan: '中元', ju: '阳遁7局', zf: ['天沖', '艮8宫'],
    zs: ['傷門', '艮8宫'], kong: ['辰巳', '子丑'], ma: ['巳', '巳']
  },
  {
    time: '2027-06-21 22:15', pillars: ['丁未', '丙午', '辛未', '己亥'],
    jieqi: '夏至', yuan: '中元', ju: '阴遁3局', zf: ['天英', '坤2宫'],
    zs: ['景門', '巽4宫'], kong: ['戌亥', '辰巳'], ma: ['巳', '巳']
  },
  {
    time: '2025-08-01 10:00', pillars: ['乙巳', '癸未', '壬寅', '乙巳'],
    jieqi: '大暑', yuan: '中元', ju: '阴遁1局', zf: ['天心', '坤2宫'],
    zs: ['開門', '坤2宫'], kong: ['辰巳', '寅卯'], ma: ['申', '亥']
  }
];

for (const expected of goldenCases) {
  test(`golden chart ${expected.time}`, () => {
    const r = chart(expected.time);
    assert.deepEqual(Object.values(r.pillars), expected.pillars);
    assert.equal(r.calendar.jieqi, expected.jieqi);
    assert.equal(r.calendar.yuan, expected.yuan);
    assert.equal(r.chart.ju_name, expected.ju);
    assert.deepEqual([r.chart.zhi_fu.star, r.chart.zhi_fu.palace], expected.zf);
    assert.deepEqual([r.chart.zhi_shi.door, r.chart.zhi_shi.palace], expected.zs);
    assert.deepEqual(Object.values(r.chart.kong_wang), expected.kong);
    assert.deepEqual(Object.values(r.chart.ma_xing), expected.ma);
  });
}

test('current-time regression: 2026-08-15 15:58', () => {
  const r = chart('2026-08-15 15:58');
  assert.deepEqual(r.pillars, { year: '丙午', month: '丙申', day: '辛酉', hour: '丙申' });
  assert.equal(r.calendar.jieqi, '立秋');
  assert.equal(r.calendar.yuan, '下元');
  assert.equal(r.chart.ju_name, '阴遁8局');
  assert.deepEqual(r.chart.zhi_fu, { star: '天禽', palace: '坎1宫', index: 7 });
  assert.deepEqual(r.chart.zhi_shi, { door: '死門', palace: '震3宫', index: 3 });
  assert.deepEqual(r.chart.kong_wang, { day: '子丑', hour: '辰巳' });
  assert.deepEqual(r.chart.ma_xing, { day: '亥', hour: '寅' });

  const host = r.chart.palaces[7];
  assert.deepEqual(host.stars, ['天芮', '天禽']);
  assert.equal(host.tian_qin_host, true);
  assert.equal(host.hosted_sky, '辛');
  assert.equal(host.is_zhi_fu, true);
  assert.deepEqual(r.chart.palaces[4].stars, []);
  assert.equal(r.chart.palaces[4].is_zhi_fu, undefined);
  assert.equal(r.chart.palaces[2].hosted_earth, '辛');
});

test('Tianqin always co-resides with Tianrui and never marks the center', () => {
  const r = chart('2026-01-01 00:30');
  const host = r.chart.palaces.find(p => p.tian_qin_host);
  assert.deepEqual(host.stars, ['天芮', '天禽']);
  assert.equal(r.chart.zhi_fu.star, '天禽');
  assert.equal(r.chart.zhi_fu.palace, host.name);
  assert.notEqual(r.chart.zhi_fu.palace, '中5宫');
  assert.equal(host.is_zhi_fu, true);
});

test('hour boundary is stable inside 申时 and changes at 17:00', () => {
  const a = chart('2026-08-15 15:00');
  const b = chart('2026-08-15 16:59');
  const c = chart('2026-08-15 17:00');
  assert.equal(a.pillars.hour, b.pillars.hour);
  assert.equal(a.chart.zhi_fu.palace, b.chart.zhi_fu.palace);
  assert.notEqual(b.pillars.hour, c.pillars.hour);
});

test('invalid civil dates and unsupported years are rejected', () => {
  assert.throws(() => validateCivilTime({ year: 2026, month: 2, day: 30, hour: 12, minute: 0 }), /Invalid calendar date/);
  assert.throws(() => validateCivilTime({ year: 1899, month: 1, day: 1, hour: 0, minute: 0 }), /1900-2099/);
});

test('CLI emits valid JSON and a readable Markdown chart', () => {
  const cli = path.join(__dirname, '..', 'qimen_cli.js');
  const jsonRun = spawnSync(process.execPath, [cli, '--time', '2026-08-15 15:58', '--plate', 'rotating', '--format', 'json'], { encoding: 'utf8' });
  assert.equal(jsonRun.status, 0, jsonRun.stderr);
  assert.equal(JSON.parse(jsonRun.stdout).chart.zhi_fu.palace, '坎1宫');

  const mdRun = spawnSync(process.execPath, [cli, '--time', '2026-08-15 15:58', '--plate', 'rotating', '--format', 'markdown'], { encoding: 'utf8' });
  assert.equal(mdRun.status, 0, mdRun.stderr);
  assert.match(mdRun.stdout, /值符：天禽，落坎1宫/);
  assert.match(mdRun.stdout, /天芮\/天禽/);
});

test('plate selector requires the question horizon and never chooses by auspiciousness', () => {
  assert.equal(selectPlate({ plate: 'auto', horizon: 'immediate' }).selected, 'flying');
  assert.equal(selectPlate({ plate: 'auto', horizon: 'short' }).selected, 'flying');
  assert.equal(selectPlate({ plate: 'auto', horizon: 'long' }).selected, 'rotating');
  assert.equal(selectPlate({ plate: 'auto', horizon: 'mixed', primaryHorizon: 'short' }).selected, 'flying');
  assert.equal(selectPlate({ plate: 'rotating', horizon: 'short' }).selected, 'rotating');
  assert.throws(() => selectPlate({ plate: 'auto' }), /requires --horizon/);
  assert.throws(() => selectPlate({ plate: 'auto', horizon: 'mixed' }), /primary-horizon/);
});

test('flying placement reproduces published Yang and Yin star examples', () => {
  const yangStars = placeNine(STAR_BY_HOME_NUMBER, 4, 8, 1);
  const yinStars = placeNine(STAR_BY_HOME_NUMBER, 8, 7, -1);
  const numberToIndex = { 1: 7, 2: 2, 3: 3, 4: 0, 5: 4, 6: 8, 7: 5, 8: 6, 9: 1 };
  const byNumber = (values) => Object.fromEntries(Object.entries(numberToIndex).map(([n, i]) => [n, values[i]]));

  assert.deepEqual(byNumber(yangStars), {
    1: '天心', 2: '天柱', 3: '天任', 4: '天英', 5: '天蓬',
    6: '天芮', 7: '天沖', 8: '天輔', 9: '天禽'
  });
  assert.deepEqual(byNumber(yinStars), {
    1: '天禽', 2: '天輔', 3: '天沖', 4: '天芮', 5: '天蓬',
    6: '天英', 7: '天任', 8: '天柱', 9: '天心'
  });
});

test('flying nine-god sequences obey Yang-forward and Yin-reverse flight', () => {
  const yang = placeNine([''].concat(GODS_YANG), 1, 8, 1);
  const yin = placeNine([''].concat(GODS_YIN), 1, 7, -1);
  assert.equal(yang[6], '值符'); // 艮8
  assert.equal(yang[1], '騰蛇'); // 离9
  assert.equal(yang[4], '朱雀'); // 中5
  assert.equal(yin[5], '值符'); // 兑7
  assert.equal(yin[8], '騰蛇'); // 乾6
  assert.equal(yin[4], '太陰'); // 中5
});

test('flying chart uses all nine palaces including Tianqin, middle gate, and a ninth god', () => {
  const r = buildFlyingChart({ year: 2026, month: 8, day: 15, hour: 15, minute: 58, timezone: 'Asia/Shanghai' });
  assert.equal(r.ruleset.plate, '飞盘');
  assert.equal(new Set(r.chart.palaces.map(p => p.star)).size, 9);
  assert.equal(new Set(r.chart.palaces.map(p => p.door)).size, 9);
  assert.equal(new Set(r.chart.palaces.map(p => p.god)).size, 9);
  assert.equal(r.chart.palaces.filter(p => p.star === '天禽').length, 1);
  assert.equal(r.chart.palaces.filter(p => p.door === '中門').length, 1);
  assert.ok(r.chart.palaces[4].star);
  assert.ok(r.chart.palaces[4].door);
  assert.ok(r.chart.palaces[4].god);
});

test('flying chart invariants hold in both Yang and Yin dun cases', () => {
  for (const parts of [
    { year: 2026, month: 1, day: 1, hour: 0, minute: 30 },
    { year: 2026, month: 8, day: 15, hour: 15, minute: 58 }
  ]) {
    const r = buildFlyingChart({ ...parts, timezone: 'Asia/Shanghai' });
    const zf = r.chart.palaces[r.chart.zhi_fu.index];
    const zs = r.chart.palaces[r.chart.zhi_shi.index];
    assert.equal(zf.star, r.chart.zhi_fu.star);
    assert.equal(zf.god, '值符');
    assert.equal(zs.door, r.chart.zhi_shi.door);
    for (const p of r.chart.palaces) {
      assert.ok(p.star && p.door && p.god && p.sky && p.earth);
    }
  }
});

test('CLI auto-selects flying for a short event and rejects missing horizon', () => {
  const cli = path.join(__dirname, '..', 'qimen_cli.js');
  const selected = spawnSync(process.execPath, [cli, '--time', '2026-08-15 15:58', '--horizon', 'short', '--format', 'json'], { encoding: 'utf8' });
  assert.equal(selected.status, 0, selected.stderr);
  const result = JSON.parse(selected.stdout);
  assert.equal(result.ruleset.plate, '飞盘');
  assert.equal(result.plate_selection.selected, 'flying');

  const missing = spawnSync(process.execPath, [cli, '--time', '2026-08-15 15:58', '--format', 'json'], { encoding: 'utf8' });
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /requires --horizon/);
});
