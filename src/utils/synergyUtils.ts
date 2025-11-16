import type { Apostle, Personality } from '../types/apostle';
import { getPersonalities } from '../types/apostle';

export interface Synergy {
  personality: Personality;
  count: number;
  isActive: boolean;
  bonus?: {
    hp: number;
    damage: number;
  };
}

export function calculateSynergyBonus(count: number): { hp: number; damage: number } {
  if (count < 2) return { hp: 0, damage: 0 };
  if (count >= 9) return { hp: 200, damage: 200 };
  if (count >= 7) return { hp: 140, damage: 140 };
  if (count >= 6) return { hp: 100, damage: 100 };
  if (count >= 4) return { hp: 55, damage: 55 };
  return { hp: 20, damage: 20 };
}

export function analyzeSynergies(apostles: Apostle[]): Synergy[] {
  if (apostles.length === 0) return [];

  const personalityCounts: Map<Personality, number> = new Map();

  apostles.forEach((apostle) => {
    const personalities = getPersonalities(apostle);
    personalities.forEach((personality) => {
      const current = personalityCounts.get(personality) || 0;
      personalityCounts.set(personality, current + 1);
    });
  });

  const personalities: Personality[] = ['활발', '광기', '순수', '우울', '냉정'];

  const synergies: Synergy[] = personalities.map((personality) => {
    const count = personalityCounts.get(personality) || 0;
    const isActive = count >= 2;
    const bonus = isActive ? calculateSynergyBonus(count) : undefined;

    return {
      personality,
      count,
      isActive,
      bonus,
    };
  });

  return synergies;
}

export function getSynergyLevel(count: number): number {
  if (count < 2) return 0;
  if (count < 4) return 1;
  if (count < 6) return 2;
  if (count < 7) return 3;
  if (count < 9) return 4;
  return 5;
}

export function getSynergyLevelDescription(level: number): string {
  switch (level) {
    case 0:
      return '미활성';
    case 1:
      return 'Lv.1 (+20%)';
    case 2:
      return 'Lv.2 (+55%)';
    case 3:
      return 'Lv.3 (+100%)';
    case 4:
      return 'Lv.4 (+140%)';
    case 5:
      return 'Lv.5 (+200%)';
    default:
      return '알 수 없음';
  }
}

export function getActiveSynergies(apostles: Apostle[]): Personality[] {
  const synergies = analyzeSynergies(apostles);
  return synergies.filter((s) => s.isActive).map((s) => s.personality);
}