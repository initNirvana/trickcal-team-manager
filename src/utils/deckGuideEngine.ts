import type { Apostle, Personality } from '../types/apostle';
import deckGuides from '../data/apostles-guides.json';

export interface PersonalityDistribution {
  personality: Personality;
  count: number;
  percentage: number;
}

export interface DeckAnalysisResult {
  filledSlots: number;
  emptySlots: number;
  personalityDistribution: PersonalityDistribution[];
  dominantPersonality: Personality | null;
  dominantPercentage: number;
  deckType: string; // "순수_6속", "광기_6속" 등
  gameMode: 'pve' | 'pvp';
}

interface CoreApostle {
  name: string;
  engName: string;
  role: string;
  position: 'front' | 'mid' | 'back';
  reason: string;
  essential: boolean;
  aside_required: string;
}

interface DeckGuide {
  overview: string;
  difficulty: string;
  pros: string[];
  cons: string[];
  essentials: boolean;
  core: CoreApostle[];
  alternatives: [];
  tips: string[];
}

// 덱의 성격 분포 분석
export const analyzeDeckPersonality = (apostles: Apostle[]): DeckAnalysisResult => {
  const filledSlots = apostles.filter((a) => a).length;
  const emptySlots = 9 - filledSlots;

  // 성격 카운트
  const personalityCount = new Map<Personality, number>();
  const personalities: Personality[] = ['Jolly', 'Mad', 'Naive', 'Gloomy', 'Cool', 'Resonance'];

  personalities.forEach((p) => personalityCount.set(p, 0));

  apostles.forEach((apostle) => {
    if (!apostle) return;
    const apostlePersonalities = [apostle.persona];
    const primary = apostlePersonalities[0];
    const current = personalityCount.get(primary) || 0;
    personalityCount.set(primary, current + 1);
  });

  // 성격별 분포 정렬
  const distribution = Array.from(personalityCount.entries())
    .map(([personality, count]) => ({
      personality,
      count,
      percentage: filledSlots > 0 ? (count / filledSlots) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // 지배 성격 판별
  const dominantPersonality = distribution[0]?.personality || null;
  const dominantPercentage = distribution[0]?.percentage || 0;

  // 덱 타입 판별 (주 성격 기준)
  const getDeckType = (personality: Personality | null): string => {
    const personalityMap: Record<Personality, string> = {
      Jolly: '활발',
      Mad: '광기',
      Naive: '순수',
      Gloomy: '우울',
      Cool: '냉정',
      Resonance: '공명',
    };
    return personality ? personalityMap[personality] : '기타';
  };

  const deckType = getDeckType(dominantPersonality);

  return {
    filledSlots,
    emptySlots,
    personalityDistribution: distribution,
    dominantPersonality,
    dominantPercentage,
    deckType,
    gameMode: 'pve', // 기본값, 후에 props로 변경 가능
  };
};

// 추천 사도 가져오기

export const getRecommendedApostles = (deckType: string, mode: 'pve' | 'pvp'): DeckGuide | null => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deck = (deckGuides as any).decks?.[deckType] || (deckGuides as any).decks?.['순수_6속'];
  if (!deck) return null;

  const modeGuide = deck[mode];
  if (!modeGuide) return null;

  return {
    overview: deck.overview,
    difficulty: deck.difficulty,
    pros: deck.pros,
    cons: deck.cons,
    essentials: deck.essentials,
    core: modeGuide.core,
    alternatives: modeGuide.alternatives,
    tips: modeGuide.tips,
  };
};
