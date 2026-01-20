import type { Apostle, Personality } from '../types/apostle';
import { SYNERGY_TIER_CONFIG } from '@/constants/gameConstants';

type PersonalityCountMap = Record<Personality, number>;

/**
 * 성격 시너지 효과 정의
 */
export const SYNERGY_TIERS = Object.entries(SYNERGY_TIER_CONFIG)
  .map(([countStr, cfg]) => ({ count: Number(countStr), ...cfg }))
  .sort((a, b) => b.count - a.count) as ReadonlyArray<{
  count: number;
  level: number;
  hp: number;
  damage: number;
  label: string;
}>;

const PERSONALITY_LIST = [
  'Jolly',
  'Mad',
  'Naive',
  'Gloomy',
  'Cool',
] as const satisfies readonly Personality[];

/**
 * 성격 시너지 정보 인터페이스
 * - personality: 성격 타입
 * - ownedCount: 보유한 사도 수
 * - activeCount: 활성화된 시너지 수 = tier.count (0/2/4/6/7/9)
 * - extraCount: 활성화 후 추가로 보유한 사도 수
 * - inactiveCount: 비활성 시너지 수 = ownedCount - activeCount
 * - activeThreshold: 다음 시너지 활성화에 필요한 사도 수
 * - isActive: 시너지 활성화 여부
 * - bonus: 시너지 보너스 (HP, 피해량)
 */
export interface Synergy {
  personality: Personality;
  ownedCount: number;
  activeCount: number;
  extraCount: number;
  inactiveCount: number;
  activeThreshold: number;
  isActive: boolean;
  bonus: { hp: number; damage: number };
}

/**
 * 덱 분석 결과 인터페이스
 * - totalApostles: 덱에 포함된 사도 총 수
 * - synergies: 성격 시너지 배열
 * - totalBonus: 총 시너지 보너스 (HP, 피해량)
 */
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
const calculateSingleSynergy = (personality: Personality, ownedCount: number): Synergy => {
  const tier = getSynergyTier(ownedCount);
  const activeThreshold = tier?.count ?? 0;
  const activeCount = tier?.count ?? 0;
  const extraCount = tier ? Math.max(0, ownedCount - activeCount) : 0;

  return {
    personality,
    ownedCount,
    activeThreshold,
    activeCount,
    extraCount,
    inactiveCount: ownedCount - activeCount,
    isActive: Boolean(tier),
    bonus: tier ? { hp: tier.hp, damage: tier.damage } : { hp: 0, damage: 0 },
  };
};

/**
 * 덱의 모든 성격 시너지를 분석합니다.
 */
export function analyzeSynergies(apostles: Apostle[]): Synergy[] {
  const counts = apostles.reduce<PersonalityCountMap>(
    (acc, { persona }) => {
      acc[persona] += 1;
      return acc;
    },
    { Jolly: 0, Mad: 0, Naive: 0, Gloomy: 0, Cool: 0 },
  );

  return PERSONALITY_LIST.map((p) => calculateSingleSynergy(p, counts[p]));
}

/**
 * 활성화된 모든 시너지의 보너스 합계를 계산합니다.
 */
export function calculateTotalSynergyBonus(synergies: Synergy[]) {
  return synergies.reduce(
    (total, synergy) => {
      if (synergy.isActive) {
        total.hp += synergy.bonus.hp;
        total.damage += synergy.bonus.damage;
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
