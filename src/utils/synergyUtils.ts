import type { Apostle, Personality } from '../types/apostle';
import { getPersonalities } from '../types/apostle';

const SYNERGY_TIERS = [
  { count: 9, level: 5, hp: 200, damage: 200, label: 'Lv.5 (+200%)' },
  { count: 7, level: 4, hp: 140, damage: 140, label: 'Lv.4 (+140%)' },
  { count: 6, level: 3, hp: 100, damage: 100, label: 'Lv.3 (+100%)' },
  { count: 4, level: 2, hp: 55, damage: 55, label: 'Lv.2 (+55%)' },
  { count: 2, level: 1, hp: 20, damage: 20, label: 'Lv.1 (+20%)' },
] as const;

const PERSONALITY_LIST: Personality[] = ['Jolly', 'Mad', 'Naive', 'Gloomy', 'Cool'];

export interface Synergy {
  personality: Personality;
  count: number;
  totalCount: number;
  inactiveCount: number;
  isActive: boolean;
  bonus?: { hp: number; damage: number };
}

function getSynergyTier(count: number) {
  return SYNERGY_TIERS.find((tier) => count >= tier.count);
}

export function calculateSynergyBonus(count: number): { hp: number; damage: number } {
  const tier = getSynergyTier(count);
  return tier ? { hp: tier.hp, damage: tier.damage } : { hp: 0, damage: 0 };
}

export function analyzeSynergies(apostles: Apostle[]): Synergy[] {
  if (apostles.length === 0) return [];

  const personalityCounts = new Map<Personality, number>();

  for (const apostle of apostles) {
    const personalities = getPersonalities(apostle);
    for (const p of personalities) {
      personalityCounts.set(p, (personalityCounts.get(p) || 0) + 1);
    }
  }

  return PERSONALITY_LIST.map((personality) => {
    const totalCount = personalityCounts.get(personality) || 0;
    const activeTier = getSynergyTier(totalCount);
    const isActive = !!activeTier;
    const count = activeTier ? activeTier.count : 0;
    const inactiveCount = isActive ? totalCount - count : 0;
    const bonus = activeTier ? { hp: activeTier.hp, damage: activeTier.damage } : undefined;

    return {
      personality,
      count,
      totalCount,
      inactiveCount,
      isActive,
      bonus,
    };
  });
}

export function calculateTotalSynergyBonus(synergies: Synergy[]): { hp: number; damage: number } {
  return synergies.reduce(
    (total, synergy) => {
      if (synergy.isActive && synergy.bonus) {
        return {
          hp: total.hp + synergy.bonus.hp,
          damage: total.damage + synergy.bonus.damage,
        };
      }
      return total;
    },
    { hp: 0, damage: 0 },
  );
}
