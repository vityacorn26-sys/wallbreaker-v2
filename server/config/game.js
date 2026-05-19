module.exports = {
  MAX_ENERGY: 100,
  ENERGY_REGEN_SEC: 30,
  TAP_DELAY: 150,
  INIT_DATA_MAX_AGE_SEC: 60 * 60 * 6, // 6 часов
  
  // Твои точные лимиты по рекламе
  ADS_PER_CLAIM: 1,
  ADS_HOUR_LIMIT: 20,
  ADS_DAY_LIMIT: 60,
  AD_REWARD_COOLDOWN_MS: 25 * 1000,
  
  // Награды за ранги (пассивный доход или пулл)
  RANK_REWARDS: {
    1: 10,
    2: 25,
    3: 60,
    4: 150,
    5: 400
  },
  RANK_DURATION_DAYS: 7,
  
  // Твоя точная экономика покупки рангов R2 - R5
  RANK_PRICES_WBC: {
    2: 250000,
    4: 750000,
    5: 1300000
  },
  RANK_PRICES_TON: {
    3: 0.5,
    4: 1.0,
    5: 2.5
  },
  RANK_PRICES_STARS: {
    3: 50
  },
  
  ZERO_DAY_KEY_PRICE: 2000000,
  ZERO_DAY_KEY_MAX_PER_DRAW: 2
};
