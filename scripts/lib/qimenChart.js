// Deterministic rotating-plate, Chai-Bu Qimen chart builder.
// Calculation core adapted from oceanjustinlin/qimen (MIT).
// Tianqin hosting is aligned to Ch 6 of 《奇門遁甲上元經評述》.
const { Solar } = require('../vendor/lunar.js');
const C = require('./QimenConstants.js');
const U = require('./QimenUtils.js');
const Calc = require('./QimenCalculations.js');
const { getMaXing, maXingMap, getKongIndices } = require('./qimenCore.js');

const PALACE_NAMES = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾'];
const PALACE_NUMBERS = [4, 9, 2, 3, 5, 7, 8, 1, 6];
const DIRECTIONS = ['东南', '正南', '西南', '正东', '中宫', '正西', '东北', '正北', '西北'];

function validateCivilTime(parts) {
  const required = ['year', 'month', 'day', 'hour', 'minute'];
  for (const key of required) {
    if (!Number.isInteger(parts[key])) throw new Error(`Invalid ${key}`);
  }
  const { year, month, day, hour, minute } = parts;
  if (year < 1900 || year > 2099) throw new Error('Year must be 1900-2099');
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error('Invalid civil time');
  }
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new Error('Invalid calendar date');
  }
}

function buildQimenChart({ year, month, day, hour, minute, timezone = 'Asia/Shanghai' }) {
  validateCivilTime({ year, month, day, hour, minute });
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const ganzhiHour = lunar.getTimeInGanZhi();
  const ganzhiDay = lunar.getDayInGanZhi();
  const juResult = Calc.calculateJuByChaiBu(solar, C.JIEQI_JUSHU, C.YUAN_NAMES);
  const xunHead = U.getXunHead(ganzhiHour);
  const fuShou = U.getFuShou(xunHead);
  const flyStep = U.calculateFlyStep(xunHead, ganzhiHour);
  const rawTianGan = U.extractTianGan(ganzhiHour);
  const tianGan = U.resolveJiaHiding(rawTianGan, fuShou);

  const diPan = Calc.getDiPan(juResult.isYang, juResult.gameNumber);
  const zhiFuStar = Calc.getZhiFuStar(fuShou, diPan);
  const nineStars = Calc.calculateNineStars(zhiFuStar, tianGan, diPan);
  const zhiShiDoor = Calc.getZhiShiDoor(fuShou, diPan);
  const eightDoors = Calc.calculateEightDoors(juResult.isYang, zhiShiDoor, flyStep, fuShou, diPan);
  const eightGods = Calc.calculateEightGods(juResult.isYang, tianGan, diPan);
  const tianPanGan = Calc.calculateTianPan(juResult.isYang, tianGan, fuShou, diPan);

  const dayZhi = U.extractDiZhi(ganzhiDay);
  const hourZhi = U.extractDiZhi(ganzhiHour);
  const dayMa = getMaXing(dayZhi);
  const hourMa = getMaXing(hourZhi);
  const dayKong = lunar.getDayXunKong();
  const hourKong = lunar.getTimeXunKong();
  const dayKongIndices = getKongIndices(dayKong);
  const hourKongIndices = getKongIndices(hourKong);

  // Rotating plate rule from Ch 6: Tianqin leaves the center and co-resides
  // with Tianrui. The center stem is hosted in Kun2 on the earth plate and
  // follows Tianrui on the heaven plate.
  const tianRuiIndex = nineStars.indexOf('天芮');
  const centerStem = diPan[4];
  const zhiFuIndex = zhiFuStar === '天禽' ? tianRuiIndex : nineStars.indexOf(zhiFuStar);
  const zhiShiIndex = eightDoors.indexOf(zhiShiDoor);
  const palaces = [];

  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      palaces.push({
        index: i, number: PALACE_NUMBERS[i], name: '中5宫', direction: DIRECTIONS[i],
        is_center: true, earth: centerStem, earth_host: '坤2宫',
        stars: [], star: '', door: '', god: '', sky: ''
      });
      continue;
    }
    const stars = [nineStars[i]];
    if (i === tianRuiIndex) stars.push('天禽');
    palaces.push({
      index: i,
      number: PALACE_NUMBERS[i],
      name: `${PALACE_NAMES[i]}${PALACE_NUMBERS[i]}宫`,
      direction: DIRECTIONS[i],
      is_center: false,
      stars,
      star: stars.join('/'),
      tian_qin_host: i === tianRuiIndex,
      sky: tianPanGan[i],
      hosted_sky: i === tianRuiIndex ? centerStem : '',
      door: eightDoors[i],
      god: eightGods[i],
      earth: diPan[i],
      hosted_earth: i === 2 ? centerStem : '',
      stem_relation: U.getStemRelation(tianPanGan[i], diPan[i]),
      kong_wang: {
        day: dayKongIndices.includes(i),
        hour: hourKongIndices.includes(i),
        is_kong: dayKongIndices.includes(i) || hourKongIndices.includes(i)
      },
      ma_xing: {
        day: i === maXingMap[dayMa],
        hour: i === maXingMap[hourMa],
        has_ma: i === maXingMap[dayMa] || i === maXingMap[hourMa]
      },
      is_zhi_fu: i === zhiFuIndex,
      is_zhi_shi: i === zhiShiIndex
    });
  }

  const timestamp = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return {
    schema_version: '1.0.0',
    ruleset: {
      id: 'shangyuan-chabu-rotating-v1',
      system: '时家奇门', plate: '转盘', method: '拆补法',
      civil_time: true, true_solar_time: false,
      tian_qin_rule: '转盘天禽与天芮同宫，中宫地盘干寄坤二，天盘寄干随天芮',
      provenance: {
        calendar_and_base_layout: 'external:lunar-javascript + oceanjustinlin/qimen',
        rotating_tianqin_center_rule: 'book:ch06',
        interpretation_framework: 'book:ch21-ch31'
      }
    },
    normalized_input: { calendar: 'solar', timezone, civil_time: timestamp, year, month, day, hour, minute },
    calendar: {
      solar: timestamp,
      lunar: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      jieqi: juResult.jieQiName,
      yuan: juResult.yuanName
    },
    pillars: {
      year: lunar.getYearInGanZhi(), month: lunar.getMonthInGanZhi(),
      day: ganzhiDay, hour: ganzhiHour
    },
    chart: {
      dun_type: juResult.yinYang === '陽' ? '阳遁' : '阴遁',
      ju_number: juResult.gameNumber,
      ju_name: `${juResult.yinYang === '陽' ? '阳' : '阴'}遁${juResult.gameNumber}局`,
      xun_shou: xunHead,
      hidden_jia_stem: fuShou,
      zhi_fu: { star: zhiFuStar, palace: palaces[zhiFuIndex].name, index: zhiFuIndex },
      zhi_shi: { door: zhiShiDoor, palace: palaces[zhiShiIndex].name, index: zhiShiIndex },
      kong_wang: { day: dayKong, hour: hourKong },
      ma_xing: { day: dayMa, hour: hourMa },
      palaces
    },
    warnings: [
      '本盘采用北京时间/民用时，不校正真太阳时。',
      '本盘仅生成传统术数结构，不证明预测有效性。'
    ]
  };
}

module.exports = { buildQimenChart, validateCivilTime, PALACE_NAMES, PALACE_NUMBERS, DIRECTIONS };
