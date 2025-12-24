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
  const personalities: Personality[] = ['Jolly', 'Mad', 'Naive', 'Gloomy', 'Cool'];

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

// 빈 슬롯에 가장 적합한 사도 추천
export const getRecommendationsForEmptySlot = (
  emptySlot: number,
  filledApostles: Apostle[],
  allApostles: Apostle[],
  deckType: string,
  mode: 'pve' | 'pvp',
) => {
  const guide = getRecommendedApostles(deckType, mode);
  if (!guide) return [];

  const getPosition = (slot: number): 'front' | 'mid' | 'back' => {
    if ([1, 2, 3].includes(slot)) return 'front';
    if ([4, 5, 6].includes(slot)) return 'mid';
    return 'back';
  };

  const position = getPosition(emptySlot);

  const recommendedNames = guide.core
    .filter((apostle: CoreApostle) => apostle.position === position)
    .map((apostle: CoreApostle) => apostle.name);

  const placedNames = filledApostles.filter((a) => a).map((a) => a.name);

  const recommendations = allApostles.filter(
    (apostle) => recommendedNames.includes(apostle.name) && !placedNames.includes(apostle.name),
  );

  return recommendations.slice(0, 3);
};

export interface CombinationGuide {
  name: string;
  front?: string[];
  mid?: string[];
  back?: string[];
  members?: string[];
  alternatives?: Record<string, string[]>;
  notes?: string[];
}

// 현재 덱의 성격별 개수에 따라 최적 조합 가져오기
export const getOptimalCombination = (analysis: DeckAnalysisResult): CombinationGuide | null => {
  // deckType에서 접두사 추출
  const getDeckPersonalityKey = (deckType: string): string => {
    const mapping: Record<string, string> = {
      활발: '활발',
      광기: '광기',
      순수: '순수',
      우울: '우울',
      냉정: '냉정',
    };
    return mapping[deckType] || '순수';
  };

  const deckPersonalityKey = getDeckPersonalityKey(analysis.deckType);
  const filledCount = analysis.filledSlots;

  const combinations = (deckGuides as any).combinations?.[deckPersonalityKey];
  if (!combinations) return null;

  const optimalKey = filledCount >= 9 ? '9' : filledCount >= 4 ? '4' : '2';
  return combinations[optimalKey] || null;
};
