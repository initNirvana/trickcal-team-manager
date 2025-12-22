import type { Apostle, Personality } from '../types/apostle';
import { analyzeSynergies } from './synergyUtils';

export interface DeckAnalysis {
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

export function analyzeDeck(apostles: Apostle[]): DeckAnalysis {
  const totalApostles = apostles.length;
  const synergies = analyzeSynergies(apostles);

  return {
    totalApostles,
    synergies,
  };
}
