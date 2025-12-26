import type { Apostle, Personality } from '../types/apostle';

export const SYNERGY_TIERS = [
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
  bonus: { hp: number; damage: number };
}

export interface DeckAnalysis {
  totalApostles: number;
  synergies: Synergy[];
  totalBonus: { hp: number; damage: number };
}

/**
 * 특정 사도 수에 해당하는 시너지 티어를 찾습니다.
 */
const getSynergyTier = (count: number) => SYNERGY_TIERS.find((tier) => count >= tier.count);

/**
 * 단일 성격에 대한 시너지 정보를 계산합니다.
 */
const calculateSingleSynergy = (personality: Personality, totalCount: number): Synergy => {
  const tier = getSynergyTier(totalCount);
  const isActive = !!tier;
  const activeCount = tier ? tier.count : 0;

  return {
    personality,
    totalCount,
    count: activeCount,
    inactiveCount: isActive ? totalCount - activeCount : 0,
    isActive,
    bonus: tier ? { hp: tier.hp, damage: tier.damage } : { hp: 0, damage: 0 },
  };
};

/**
 * 덱의 모든 성격 시너지를 분석합니다.
 */
export function analyzeSynergies(apostles: Apostle[]): Synergy[] {
  if (!apostles.length) return [];

  // 사도 성격 카운팅 (O(n))
  const counts = apostles.reduce(
    (acc, { persona }) => {
      acc[persona] = (acc[persona] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // 모든 성격에 대해 시너지 결과 생성
  return PERSONALITY_LIST.map((p) => calculateSingleSynergy(p, counts[p] || 0));
}

/**
 * 활성화된 모든 시너지의 보너스 합계를 계산합니다.
 */
export function calculateTotalSynergyBonus(synergies: Synergy[]) {
  return synergies.reduce(
    (total, { isActive, bonus }) => {
      if (isActive) {
        total.hp += bonus.hp;
        total.damage += bonus.damage;
      }
      return total;
    },
    { hp: 0, damage: 0 },
  );
}

/**
 * 덱 분석 통합 엔트리 포인트
 */
export function analyzeDeck(apostles: Apostle[]): DeckAnalysis {
  const synergies = analyzeSynergies(apostles);
  const totalBonus = calculateTotalSynergyBonus(synergies);

  return {
    totalApostles: apostles.length,
    synergies,
    totalBonus,
  };
}
