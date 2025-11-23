import type { Apostle, Personality } from '../types/apostle';
import { analyzeSynergies } from './synergyUtils';
import { calculateDamageReduction } from './damageReductionUtils';

export interface PartyAnalysis {
  totalApostles: number;
  synergies: Array<{
    personality: Personality;
    count: number;
    isActive: boolean;
    bonus?: { hp: number; damage: number };
  }>;
  damageReduction: {
    total: number;
    needed: number;
  };
}

export function analyzeParty(apostles: Apostle[]): PartyAnalysis {
  const totalApostles = apostles.length;
  const synergies = analyzeSynergies(apostles);
  const damageReduction = calculateDamageReduction(apostles);
  const neededReduction = Math.max(0, 60 - damageReduction);

  return {
    totalApostles,
    synergies,
    damageReduction: {
      total: damageReduction,
      needed: neededReduction,
    },
  };
}
