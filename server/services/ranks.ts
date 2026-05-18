const RANK_REWARDS: Record<number, number> = {
  1: 10,
  2: 25,
  3: 60,
  4: 150,
  5: 400,
};

export function getRewardForRank(rankId: number): number {
  return RANK_REWARDS[rankId] || RANK_REWARDS[1] || 10;
}
