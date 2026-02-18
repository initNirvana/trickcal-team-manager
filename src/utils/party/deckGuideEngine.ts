import deckGuides from '../../data/apostles-guides.json';
import type { Apostle, Personality } from '../../types/apostle';
import { getEffectiveBaseScore } from '../builder/deckRecommendationUtils';

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
  deckType: string;
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

export interface Alternative {
  replace: string;
  with: string[];
  condition: string;
  tradeoff: string;
}

interface DeckGuide {
  overview: string;
  difficulty: string;
  pros: string[];
  cons: string[];
  core: CoreApostle[];
  alternatives: Alternative[];
  tips: string[];
}

/**
 * 역할별 기본 트레이드오프 메시지 생성
 */
const getRoleTip = (role: string): string => {
  const tips: Record<string, string> = {
    Tanker: '유지력 감소 가능',
    Supporter: '버프/힐 효율 변화',
    Attacker: '딜 성능 차이',
  };
  return tips[role] || '';
};

/**
 * Core 사도에 대한 대체 사도 자동 생성
 * @param coreApostles 핵심 사도 리스트
 * @param targetPersona 대상 성격
 * @param allApostles 전체 사도 리스트
 * @param mode PVE 또는 PVP 모드
 * @returns 대체 사도 추천 리스트
 */
export const generateAlternatives = (
  coreApostles: Apostle[],
  targetPersona: Personality,
  allApostles: Apostle[],
  mode: 'pve' | 'pvp',
): Alternative[] => {
  const alternatives: Alternative[] = [];
  const recommendOptions =
    mode === 'pvp'
      ? { deckSize: 6 as const, mode6: 'JWOPAEMTEO' as const }
      : { deckSize: 6 as const };

  for (const core of coreApostles) {
    // 1. 같은 역할의 후보 찾기 (Core에 포함되지 않은 사도만)
    const coreIds = new Set(coreApostles.map((a) => a.id));
    const candidates = allApostles
      .filter(
        (a) =>
          a.role.main === core.role.main &&
          !coreIds.has(a.id) &&
          (a.persona === targetPersona || a.mercenary),
      )
      .sort((a, b) => {
        const scoreB = getEffectiveBaseScore(b, 6, undefined, recommendOptions, 2);
        const scoreA = getEffectiveBaseScore(a, 6, undefined, recommendOptions, 2);
        return scoreB - scoreA;
      })
      .slice(0, 3); // 상위 3명만

    if (candidates.length > 0) {
      alternatives.push({
        replace: core.name,
        with: candidates.map((c) => c.name),
        condition: `${core.name} 미보유 시`,
        tradeoff: getRoleTip(core.role.main),
      });
    }
  }

  return alternatives;
};

export const analyzeDeckPersonality = (apostles: Apostle[]): DeckAnalysisResult => {
  const filledSlots = apostles.filter((a) => a).length;
  const personalityCount = new Map<Personality, number>();
  const personalities: Personality[] = ['Jolly', 'Mad', 'Naive', 'Gloomy', 'Cool', 'Resonance'];

  personalities.forEach((p) => {
    personalityCount.set(p, 0);
  });

  apostles.forEach((apostle) => {
    if (!apostle) return;
    const primary = apostle.persona;
    const current = personalityCount.get(primary) || 0;
    personalityCount.set(primary, current + 1);
  });

  const distribution = Array.from(personalityCount.entries())
    .map(([personality, count]) => ({
      personality,
      count,
      percentage: filledSlots > 0 ? (count / filledSlots) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const dominantPersonality = distribution[0]?.personality || null;
  const dominantPercentage = distribution[0]?.percentage || 0;

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

  return {
    filledSlots,
    emptySlots: 9 - filledSlots,
    personalityDistribution: distribution,
    dominantPersonality,
    dominantPercentage,
    deckType: getDeckType(dominantPersonality),
    gameMode: 'pve',
  };
};

/**
 * 추천 사도 가져오기 (동적 랭킹 주입)
 */
export const getRecommendedApostles = (
  deckType: string,
  mode: 'pve' | 'pvp',
  allApostles: Apostle[],
): DeckGuide | null => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const guideTemplate = (deckGuides as any).decks?.[deckType];
  if (!guideTemplate) return null;

  const personalityMap: Record<string, Personality> = {
    활발: 'Jolly',
    광기: 'Mad',
    순수: 'Naive',
    우울: 'Gloomy',
    냉정: 'Cool',
  };
  const targetPersona = personalityMap[deckType];

  if (!targetPersona) return null;

  // 실시간 점수 기준으로 해당 성격 사도 정렬
  const recommendOptions =
    mode === 'pvp'
      ? { deckSize: 6 as const, mode6: 'JWOPAEMTEO' as const }
      : { deckSize: 6 as const };

  const candidates = allApostles
    .filter((a) => a.persona === targetPersona)
    .filter((a) => {
      // 9인 전용 사도 제외 (size9 점수가 size6보다 높은 경우 6인 추천에서 배제)
      if (a.scoreBySize?.size9 && a.scoreBySize?.size6) {
        return a.scoreBySize.size9 <= a.scoreBySize.size6;
      }
      return true;
    })
    .sort((a, b) => {
      // 어사이드 점수 포함을 위해 asideLevel: 2 전달
      const scoreB = getEffectiveBaseScore(
        b,
        recommendOptions.deckSize,
        undefined,
        recommendOptions,
        2,
      );
      const scoreA = getEffectiveBaseScore(
        a,
        recommendOptions.deckSize,
        undefined,
        recommendOptions,
        2,
      );
      return scoreB - scoreA;
    });

  // 역할군별 분리
  const tankers = candidates.filter((a) => a.role.main === 'Tanker');
  const supporters = candidates.filter((a) => a.role.main === 'Supporter');

  // 6인 조합 구성 (탱1, 서폿1 보장 후 점수순)
  const coreApostles: Apostle[] = [];
  if (tankers.length > 0) coreApostles.push(tankers[0]);
  if (supporters.length > 0) coreApostles.push(supporters[0]);

  const remaining = candidates
    .filter((a) => !coreApostles.find((c) => c.id === a.id))
    .slice(0, 6 - coreApostles.length);
  coreApostles.push(...remaining);

  // 전열 -> 중열 -> 후열 순서로 정렬
  const posMap: Record<string, number> = { front: 0, mid: 1, back: 2 };
  coreApostles.sort((a, b) => {
    const pA = Array.isArray(a.position) ? a.position[0] : a.position;
    const pB = Array.isArray(b.position) ? b.position[0] : b.position;
    return (posMap[pA] ?? 99) - (posMap[pB] ?? 99);
  });

  const dynamicCore = coreApostles.map((a) => {
    const pvpData = mode === 'pvp' ? a.pvp : undefined;
    const pos = Array.isArray(a.position) ? a.position[0] : a.position;

    return {
      name: a.name,
      engName: a.engName,
      role: a.role.main,
      position: pos as 'front' | 'mid' | 'back',
      reason: pvpData?.reason || a.aside?.reason || a.reason || '',
      essential: a.isEldain || (a.baseScore ?? 0) >= 70,
      aside_required: (pvpData?.aside || a.aside?.importance || '') as string,
    };
  });

  // Alternatives 생성: JSON에 있으면 사용, 없으면 자동 생성
  const jsonAlternatives = guideTemplate[mode]?.alternatives;
  const alternatives =
    jsonAlternatives && jsonAlternatives.length > 0
      ? jsonAlternatives
      : generateAlternatives(coreApostles, targetPersona, allApostles, mode);

  return {
    overview: guideTemplate.overview,
    difficulty: guideTemplate.difficulty,
    pros: guideTemplate.pros,
    cons: guideTemplate.cons,
    core: dynamicCore,
    alternatives,
    tips: guideTemplate[mode]?.tips || [],
  };
};
