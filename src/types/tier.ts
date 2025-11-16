export type Tier = 'SS' | 'S' | 'A' | 'B' | 'C';

export const TierOrder: Record<Tier, number> = {
  SS: 1,
  S: 2,
  A: 3,
  B: 4,
  C: 5,
};
