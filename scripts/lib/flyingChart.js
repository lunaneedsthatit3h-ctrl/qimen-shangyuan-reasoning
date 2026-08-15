// Deterministic flying-plate, Chai-Bu Qimen chart builder.
// Source boundaries are documented in references/flying-source-map.md.
const { Solar } = require('../vendor/lunar.js');
const C = require('./QimenConstants.js');
const U = require('./QimenUtils.js');
const Calc = require('./QimenCalculations.js');
const { getMaXing, maXingMap, getKongIndices } = require('./qimenCore.js');
const { validateCivilTime, PALACE_NAMES, PALACE_NUMBERS, DIRECTIONS } = require('./qimenChart.js');

const NUMBER_TO_INDEX = Object.freeze({ 1: 7, 2: 2, 3: 3, 4: 0, 5: 4, 6: 8, 7: 5, 8: 6, 9: 1 });
const STAR_BY_HOME_NUMBER = Object.freeze(['', '天蓬', '天芮', '天沖', '天輔', '天禽', '天心', '天柱', '天任', '天英']);
const DOOR_BY_HOME_NUMBER = Object.freeze(['', '休門', '死門', '傷門', '杜門', '中門', '開門', '驚門', '生門', '景門']);
const GODS_YANG = Object.freeze(['值符', '騰蛇', '太陰', '六合', '勾陳', '太常', '朱雀', '九地', '九天']);
const GODS_YIN = Object.freeze(['值符', '騰蛇', '太陰', '六合', '白虎', '太常', '玄武', '九地', '九天']);

function wrap9(value) {
  return ((value - 1) % 9 + 9) % 9 + 1;
}

function palaceNumberForIndex(index) {
  return PALACE_NUMBERS[index];
}

function placeNine(sequence, sourceStart, targetStart, direction) {
  const result = new Array(9).fill('');
  for (let k = 0; k < 9; k++) {
    const sourceNumber = wrap9(sourceStart + k);
    const targetNumber = wrap9(targetStart + direction * k);
    result[NUMBER_TO_INDEX[targetNumber]] = sequence[sourceNumber];
  }
  return result;
}

function buildFlyingChart({ year, month, day, hour, minute, timezone = 'Asia/Shanghai' }) {
  validateCivilTime({ year, month, day, hour, minute });
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const ganzhiHour = lunar.getTimeInGanZhi();
  const ganzhiDay = lunar.getDayInGanZhi();
  const juResult = Calc.calculateJuByChaiBu(solar, C.JIEQI_JUSHU, C.YUAN_NAMES);
  const xunHead = U.getXunHead(ganzhiHour);
  const fuShou = U.getFuShou(xunHead);
  const flyStep = U.calculateFlyStep(xunHead, ganzhiHour);
  const rawHourStem = U.extractTianGan(ganzhiHour);
  const hourStem = U.resolveJiaHiding(rawHourStem, fuShou);
  const diPan = Calc.getDiPan(juResult.isYang, juResult.gameNumber);
  const direction = juResult.isYang ? 1 : -1;

  const dutyIndex = diPan.indexOf(fuShou);
  const dutyNumber = palaceNumberForIndex(dutyIndex);
  const dutyStar = STAR_BY_HOME_NUMBER[dutyNumber];
  const dutyDoor = DOOR_BY_HOME_NUMBER[dutyNumber];
  const dutyStarTargetIndex = diPan.indexOf(hourStem);
  const dutyStarTargetNumber = palaceNumberForIndex(dutyStarTargetIndex);
  const dutyDoorTargetNumber = wrap9(dutyNumber + direction * flyStep);
  const dutyDoorTargetIndex = NUMBER_TO_INDEX[dutyDoorTargetNumber];

  // Stars and nine gods use the book's Yang-forward/Yin-reverse Luo-Shu flight.
  const stars = placeNine(STAR_BY_HOME_NUMBER, dutyNumber, dutyStarTargetNumber, direction);
  const godsByOrdinal = [''].concat(juResult.isYang ? GODS_YANG : GODS_YIN);
  const gods = placeNine(godsByOrdinal, 1, dutyStarTargetNumber, direction);

  // Flying nine-door model: retain an independent middle gate. Home-door order is
  // the nine Luo-Shu home positions; placement follows the same Yin/Yang flight.
  const doors = placeNine(DOOR_BY_HOME_NUMBER, dutyNumber, dutyDoorTargetNumber, direction);

  // Each flying star carries the earth-plate stem from its original home palace.
  const skyStemsByHome = [''];
  for (let n = 1; n <= 9; n++) skyStemsByHome[n] = diPan[NUMBER_TO_INDEX[n]];
  const skyStems = placeNine(skyStemsByHome, dutyNumber, dutyStarTargetNumber, direction);

  const dayZhi = U.extractDiZhi(ganzhiDay);
  const hourZhi = U.extractDiZhi(ganzhiHour);
  const dayMa = getMaXing(dayZhi);
  const hourMa = getMaXing(hourZhi);
  const dayKong = lunar.getDayXunKong();
  const hourKong = lunar.getTimeXunKong();
  const dayKongIndices = getKongIndices(dayKong);
  const hourKongIndices = getKongIndices(hourKong);

  const palaces = [];
  for (let i = 0; i < 9; i++) {
    palaces.push({
      index: i,
      number: PALACE_NUMBERS[i],
      name: `${PALACE_NAMES[i]}${PALACE_NUMBERS[i]}宫`,
      direction: DIRECTIONS[i],
      is_center: i === 4,
      stars: [stars[i]],
      star: stars[i],
      sky: skyStems[i],
      door: doors[i],
      god: gods[i],
      earth: diPan[i],
      stem_relation: U.getStemRelation(skyStems[i], diPan[i]),
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
      is_zhi_fu: i === dutyStarTargetIndex,
      is_zhi_shi: i === dutyDoorTargetIndex
    });
  }

  const timestamp = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return {
    schema_version: '1.1.0',
    ruleset: {
      id: 'shangyuan-chabu-flying-v1',
      system: '时家奇门', plate: '飞盘', method: '拆补法',
      civil_time: true, true_solar_time: false,
      center_rule: '飞盘九宫全用；天禽、中门、九神均可独立入中五宫',
      flight_rule: '九星、九门、九神依洛书宫数阳顺阴逆飞布',
      source_boundary: '盘式选择、九宫参与、星神顺逆及九神序列取自原书；值符值使定位和天盘干携带法为外部传统排盘算法。',
      provenance: {
        calendar_and_ju: 'external:lunar-javascript + oceanjustinlin/qimen',
        plate_selection_center_star_god_rules: 'book:ch04-ch06,ch10,ch12',
        duty_star_and_duty_door_placement: 'external:qimen-go + traditional flying-plate worked examples',
        flying_nine_door_order_and_center_participation: 'book_inference:ch06,ch11',
        sky_stem_carried_by_star: 'external:traditional flying-plate worked example'
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
      zhi_fu: { star: dutyStar, palace: palaces[dutyStarTargetIndex].name, index: dutyStarTargetIndex },
      zhi_shi: { door: dutyDoor, palace: palaces[dutyDoorTargetIndex].name, index: dutyDoorTargetIndex },
      kong_wang: { day: dayKong, hour: hourKong },
      ma_xing: { day: dayMa, hour: hourMa },
      palaces
    },
    warnings: [
      '本盘采用北京时间/民用时，不校正真太阳时。',
      '飞盘完整软件步骤并非原书逐行给出；外部补足部分已在 source_boundary 与参考文件中披露。',
      '本盘仅生成传统术数结构，不证明预测有效性。'
    ]
  };
}

module.exports = {
  buildFlyingChart, wrap9, placeNine, NUMBER_TO_INDEX,
  STAR_BY_HOME_NUMBER, DOOR_BY_HOME_NUMBER, GODS_YANG, GODS_YIN
};
