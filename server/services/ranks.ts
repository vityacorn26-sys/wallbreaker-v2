import { GAME_CONFIG } from "../config/game.js";

export function getRewardForRank(rankId: number): number {
  // Берем награду из общего конфига, если ранга нет — возвращаем дефолтные 10
  return GAME_CONFIG.RANK_REWARDS[rankId as keyof typeof GAME_CONFIG.RANK_REWARDS] || 10;
}

export function getRankName(rankId: number): string {
  return GAME_CONFIG.RANK_NAMES[rankId as keyof typeof GAME_CONFIG.RANK_NAMES] || "Proxy Hacker";
}
