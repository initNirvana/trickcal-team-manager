import type { Apostle, Personality } from '../types/apostle';
import { analyzeSynergies } from './synergyUtils';

export interface PartyAnalysis {
  totalApostles: number;
  synergies: Array<{
    personality: Personality;
    count: number;
    totalCount: number;
    inactiveCount: number;
    isActive: boolean;
    bonus?: { hp: number; damage: number };
  }>;
}

export function analyzeParty(apostles: Apostle[]): PartyAnalysis {
  const totalApostles = apostles.length;
  const synergies = analyzeSynergies(apostles);

  return {
    totalApostles,
    synergies,
  };
}
