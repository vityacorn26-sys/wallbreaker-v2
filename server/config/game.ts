export const RANKS = {
  1: { 
    name: "Proxy Hacker", 
    wbcPerTap: 10, 
    priceWbc: 0, 
    priceTon: 0, 
    priceStars: 0, 
    durationDays: 0 // Базовый ранг, навсегда
  },
  2: { 
    name: "Tunnel Master", 
    wbcPerTap: 25, 
    priceWbc: 250000, 
    priceTon: 0, 
    priceStars: 0, 
    durationDays: 7 
  },
  3: { 
    name: "Firewall Breaker", 
    wbcPerTap: 60, 
    priceWbc: 0, 
    priceTon: 0.5, 
    priceStars: 50, 
    durationDays: 7 
  },
  4: { 
    name: "Root Operator", 
    wbcPerTap: 150, 
    priceWbc: 750000, 
    priceTon: 1.0, 
    priceStars: 0, 
    durationDays: 7 
  },
  5: { 
    name: "Cyber Legend", 
    wbcPerTap: 400, 
    priceWbc: 1300000, 
    priceTon: 2.5, 
    priceStars: 0, 
    durationDays: 7 
  }
};

export const GAME_CONFIG = {
  ZERO_DAY_KEY_PRICE: 2000000,
  MAX_KEYS_PER_DRAW: 2,
  MAX_CPU: 100,
  CPU_REGEN_TIME_SEC: 30, // 1 единица раз в 30 секунд
  CPU_REGEN_AMOUNT: 1
};
