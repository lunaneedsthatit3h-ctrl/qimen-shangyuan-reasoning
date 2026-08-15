const VALID_PLATES = new Set(['auto', 'rotating', 'flying']);
const VALID_HORIZONS = new Set(['immediate', 'short', 'long', 'mixed']);

function selectPlate({ plate = 'auto', horizon, primaryHorizon } = {}) {
  if (!VALID_PLATES.has(plate)) {
    throw new Error('Plate must be auto, rotating, or flying');
  }

  if (plate !== 'auto') {
    return {
      requested: plate,
      selected: plate,
      horizon: horizon || null,
      reason: '用户明确指定盘式；不得因结果吉凶改盘。',
      source_status: 'book_explicit'
    };
  }

  if (!horizon || !VALID_HORIZONS.has(horizon)) {
    throw new Error('Auto plate selection requires --horizon immediate|short|long|mixed');
  }

  if (horizon === 'mixed') {
    if (!['short', 'long'].includes(primaryHorizon)) {
      throw new Error('Mixed horizon requires --primary-horizon short|long');
    }
    return {
      requested: 'auto',
      selected: primaryHorizon === 'short' ? 'flying' : 'rotating',
      horizon,
      primary_horizon: primaryHorizon,
      reason: `混合事件以${primaryHorizon === 'short' ? '短时细节' : '长期连续'}为主层；另一盘只能作为另行声明的辅助层。`,
      source_status: 'book_commentary_operationalized'
    };
  }

  const selected = horizon === 'long' ? 'rotating' : 'flying';
  return {
    requested: 'auto',
    selected,
    horizon,
    reason: selected === 'flying'
      ? '短促、突发或持续时间短的问题优先飞盘。'
      : '涉及时间流转、持续发展或长期趋势的问题优先转盘。',
    source_status: 'book_explicit'
  };
}

module.exports = { selectPlate, VALID_PLATES, VALID_HORIZONS };
