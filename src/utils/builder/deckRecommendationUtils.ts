// ============================================
// 📦 deckRecommendationUtils.ts (리팩토링)
// ============================================
import type { Apostle, Personality } from '../../types/apostle';
import { isValidPosition, getPersonalities } from '../../types/apostle';

// ============================================
// 🔧 Constants
// ============================================
const POSITION_SLOTS = {
  front: [2, 5, 8],
  mid: [1, 4, 7],
  back: [0, 3, 6],
} as const;

const SLOT_PRIORITIES = ['9', '4', '2'] as const;

// ============================================
// 🔧 Types
// ============================================
export interface MatchResult {
  score: number;
  matchType: 'perfect' | 'partial' | 'similar' | 'none';
  details?: string;
  matchCount?: number;
  totalCount?: number;
}

export interface PresetCombination {
  deck: Apostle[];
  slotKey: string;
  comboName?: string;
  reason: string;
  rawCombo: any;
  matchScore: MatchResult;
}

interface SlotAssignment {
  slot: number;
  apostle: Apostle;
}

// ============================================
// 🔧 Helper Functions - Apostle Matching
// ============================================

/**
 * 가이드 이름으로 정확히 일치하는 사도 찾기
 */
const findExactMatch = (
  guideName: string,
  owned: Apostle[],
  usedIds: Set<string>,
  slot: number,
): Apostle | undefined => {
  return owned.find((a) => {
    if (usedIds.has(a.id)) return false;
    if (a.name === guideName || a.engName === guideName) {
      return isValidPosition(a, slot);
    }
    return false;
  });
};

/**
 * 같은 성격을 가진 대체 사도 찾기
 */
const findPersonalityMatch = (
  personality: string,
  owned: Apostle[],
  usedIds: Set<string>,
  slot: number,
): Apostle | undefined => {
  return owned.find((a) => {
    if (usedIds.has(a.id)) return false;
    if (a.persona !== personality) return false;
    return isValidPosition(a, slot);
  });
};

/**
 * 슬롯에 맞는 임의의 사도 찾기 (최후의 수단)
 */
const findAnyMatch = (
  owned: Apostle[],
  usedIds: Set<string>,
  slot: number,
): Apostle | undefined => {
  return owned.find((a) => !usedIds.has(a.id) && isValidPosition(a, slot));
};

/**
 * 슬롯에 배치할 최적의 사도 찾기 (우선순위: 정확 > 성격 > 아무거나)
 */
const findBestApostleForSlot = (
  guideName: string,
  personality: string,
  owned: Apostle[],
  usedIds: Set<string>,
  slot: number,
): Apostle | undefined => {
  return (
    findExactMatch(guideName, owned, usedIds, slot) ||
    findPersonalityMatch(personality, owned, usedIds, slot) ||
    findAnyMatch(owned, usedIds, slot)
  );
};

// ============================================
// 🔧 Helper Functions - Deck Building
// ============================================

/**
 * 포지션별 사도 배치 (9슬롯용)
 */
const assignPositionBasedSlots = (
  combo: any,
  personality: string,
  owned: Apostle[],
  usedIds: Set<string>,
): SlotAssignment[] => {
  const slotAssignments: SlotAssignment[] = [];
  const positions = {
    front: { names: combo.front || [], slots: POSITION_SLOTS.front },
    mid: { names: combo.mid || [], slots: POSITION_SLOTS.mid },
    back: { names: combo.back || [], slots: POSITION_SLOTS.back },
  };

  Object.entries(positions).forEach(([, { names, slots }]) => {
    const nameArray = Array.isArray(names) ? names : [names];

    nameArray.forEach((guideName: string, index: number) => {
      const slot = slots[index];
      if (slot === undefined) return;

      const matchedApostle = findBestApostleForSlot(guideName, personality, owned, usedIds, slot);

      if (matchedApostle) {
        slotAssignments.push({ slot, apostle: matchedApostle });
        usedIds.add(matchedApostle.id);
      }
    });
  });

  return slotAssignments;
};

/**
 * 멤버 리스트 기반 배치 (4슬롯, 2슬롯용)
 */
const assignMemberBasedSlots = (
  combo: any,
  personality: string,
  owned: Apostle[],
  usedIds: Set<string>,
  maxSlot: number,
): SlotAssignment[] => {
  const slotAssignments: SlotAssignment[] = [];
  const memberArray = Array.isArray(combo.members) ? combo.members : [combo.members];

  let slotIdx = 0;

  memberArray.forEach((guideName: string) => {
    if (slotIdx >= maxSlot) return;

    const matchedApostle = findBestApostleForSlot(guideName, personality, owned, usedIds, slotIdx);

    if (matchedApostle) {
      slotAssignments.push({ slot: slotIdx, apostle: matchedApostle });
      usedIds.add(matchedApostle.id);
      slotIdx++;
    }
  });

  return slotAssignments;
};

/**
 * 남은 슬롯을 채우기 위한 필러 사도 찾기
 */
const findFillerApostle = (
  personality: string,
  owned: Apostle[],
  usedIds: Set<string>,
  slot: number,
): Apostle | undefined => {
  return (
    findPersonalityMatch(personality, owned, usedIds, slot) ||
    findAnyMatch(owned, usedIds, slot) ||
    owned[0] // 최후의 수단
  );
};

/**
 * 9슬롯 덱의 빈 슬롯 채우기
 */
const fillRemainingSlots = (
  deck: Apostle[],
  personality: string,
  owned: Apostle[],
  usedIds: Set<string>,
): void => {
  while (deck.length < 9) {
    const filler = findFillerApostle(personality, owned, usedIds, deck.length);

    if (filler && !usedIds.has(filler.id)) {
      deck.push(filler);
      usedIds.add(filler.id);
    } else {
      break;
    }
  }
};

/**
 * 중복 덱 체크
 */
const isDuplicateDeck = (deck: Apostle[], existingDecks: Apostle[][]): boolean => {
  return existingDecks.some(
    (existing) => existing.length === deck.length && existing.every((a, i) => a.id === deck[i].id),
  );
};

// ============================================
// 🔧 Helper Functions - Combo Processing
// ============================================

/**
 * 단일 조합 처리
 */
const processSingleCombo = (
  slotKey: string,
  combo: any,
  personality: string,
  owned: Apostle[],
): Apostle[] => {
  if (!combo?.front && !combo?.mid && !combo?.back && !combo?.members) {
    return [];
  }

  const usedIds = new Set<string>();
  let slotAssignments: SlotAssignment[] = [];

  // 1. 포지션별 매칭 (9슬롯 조합)
  if (combo.front || combo.mid || combo.back) {
    slotAssignments = assignPositionBasedSlots(combo, personality, owned, usedIds);
  }
  // 2. 멤버 방식 (4슬롯, 2슬롯)
  else if (combo.members) {
    const maxSlot = parseInt(slotKey) + 1;
    slotAssignments = assignMemberBasedSlots(combo, personality, owned, usedIds, maxSlot);
  }

  // 슬롯 번호 순서대로 정렬하여 덱 구성
  slotAssignments.sort((a, b) => a.slot - b.slot);
  const deck = slotAssignments.map(({ apostle }) => apostle);

  // 3. 9슬롯인 경우 남은 슬롯 채우기
  if (slotKey === '9') {
    fillRemainingSlots(deck, personality, owned, usedIds);
  }

  return deck;
};

/**
 * 조합에서 멤버 리스트 추출
 */
const extractMembers = (combo: any): string[] => {
  if (combo.front && combo.mid && combo.back) {
    return [...combo.front, ...combo.mid, ...combo.back];
  }
  if (combo.members) {
    return Array.isArray(combo.members) ? combo.members : [combo.members];
  }
  return [];
};

// ============================================
// 🎯 Main Functions
// ============================================

/**
 * 추천 조합 생성 알고리즘
 */
export const calculateRecommendedParties = (
  personality: string,
  owned: Apostle[],
  deckGuides: any,
): Apostle[][] => {
  if (owned.length < 1) return [];

  const combinations = deckGuides?.combinations?.[personality];
  if (!combinations) {
    console.warn(`[추천 조합] ${personality} 성격의 조합 데이터 없음`);
    return [];
  }

  const recommendations: Apostle[][] = [];

  // 9 > 4 > 2 순서로 조합 생성
  SLOT_PRIORITIES.forEach((slotKey) => {
    const combo = combinations[slotKey];
    if (!combo) return;

    const deck = processSingleCombo(slotKey, combo, personality, owned);

    // 유효한 덱만 추가 (중복 제거)
    if (deck.length > 0 && !isDuplicateDeck(deck, recommendations)) {
      recommendations.push(deck);
    }
  });

  return recommendations.slice(0, 3);
};

// ============================================
// 🔧 Utility Functions - Personality Distribution
// ============================================

/**
 * 조합의 성격 분포 계산
 */
export const getPersonalityDistribution = (
  members: string[],
  allApostles: Apostle[],
): Record<Personality, number> => {
  const distribution: Record<Personality, number> = {
    Naive: 0,
    Cool: 0,
    Mad: 0,
    Jolly: 0,
    Gloomy: 0,
  };

  members.forEach((name: string) => {
    const apostle = allApostles.find((a) => a.name === name || a.engName === name);
    if (!apostle) return;

    const personalities = getPersonalities(apostle);
    personalities.forEach((p) => {
      if (p in distribution) distribution[p]++;
    });
  });

  return distribution;
};

// ============================================
// 🔧 Utility Functions - Match Scoring
// ============================================

/**
 * 완벽 매칭 계산
 */
const calculatePerfectMatch = (comboMembers: string[], myApostles: Apostle[]): number => {
  return comboMembers.filter((name) =>
    myApostles.some((a) => a.name === name || a.engName === name),
  ).length;
};

/**
 * 성격 기반 매칭 계산
 */
const calculateSimilarMatch = (
  comboMembers: string[],
  myApostles: Apostle[],
  allApostles: Apostle[],
): number => {
  const ownedPersonalities = myApostles.flatMap((a) => getPersonalities(a));
  const comboDistribution = getPersonalityDistribution(comboMembers, allApostles);
  const uniqueOwnedPersonalities = Array.from(new Set(ownedPersonalities));

  let similarMatchCount = 0;

  uniqueOwnedPersonalities.forEach((personality) => {
    const ownedCount = ownedPersonalities.filter((p) => p === personality).length;
    const comboCount = comboDistribution[personality] || 0;

    if (comboCount > 0) {
      similarMatchCount += Math.min(ownedCount, comboCount);
    }
  });

  return similarMatchCount;
};

/**
 * 조합과 보유 사도 간의 매칭 점수 계산
 */
export const calculateMatchScore = (
  comboMembers: string[],
  myApostles: Apostle[],
  allApostles: Apostle[],
): MatchResult => {
  if (myApostles.length === 0) {
    return {
      score: 0,
      matchType: 'none',
      details: '보유사도 없음',
      matchCount: 0,
      totalCount: comboMembers.length,
    };
  }

  // 1️⃣ Perfect Match (정확한 매칭)
  const perfectMatches = calculatePerfectMatch(comboMembers, myApostles);

  // 모든 멤버를 완벽하게 보유한 경우
  if (perfectMatches === comboMembers.length && comboMembers.length > 0) {
    return {
      score: 100,
      matchType: 'perfect',
      details: `완벽 매칭 ✨`,
      matchCount: perfectMatches,
      totalCount: comboMembers.length,
    };
  }

  // 일부 멤버를 정확하게 보유한 경우
  if (perfectMatches > 0) {
    const matchRate = Math.round((perfectMatches / comboMembers.length) * 100);
    return {
      score: matchRate,
      matchType: 'partial',
      details: `부분 매칭: ${perfectMatches}/${comboMembers.length}명 (${matchRate}%)`,
      matchCount: perfectMatches,
      totalCount: comboMembers.length,
    };
  }

  // 2️⃣ Similar Match (성격 기반 매칭)
  const similarMatchCount = calculateSimilarMatch(comboMembers, myApostles, allApostles);

  if (similarMatchCount > 0) {
    const matchRate = Math.round((similarMatchCount / comboMembers.length) * 100);
    return {
      score: matchRate,
      matchType: 'similar',
      details: `성격 매칭: ${similarMatchCount}/${comboMembers.length}명 (${matchRate}%)`,
      matchCount: similarMatchCount,
      totalCount: comboMembers.length,
    };
  }

  // 3️⃣ No Match
  return {
    score: 0,
    matchType: 'none',
    details: '매칭되는 사도 없음',
    matchCount: 0,
    totalCount: comboMembers.length,
  };
};

// ============================================
// 🔧 Preset Combinations
// ============================================

/**
 * 프리셋 조합 생성
 */
export const buildPresetCombinations = (
  personality: string,
  apostles: Apostle[],
  deckGuides: any,
  myApostles: Apostle[],
): {
  presetCombinations: PresetCombination[];
  combo9?: PresetCombination;
  combo4?: PresetCombination;
  combo2?: PresetCombination;
} => {
  const combinations = deckGuides?.combinations?.[personality] || {};
  const presetCombinations: PresetCombination[] = [];

  SLOT_PRIORITIES.forEach((slotKey) => {
    const combo = combinations[slotKey];
    if (!combo) return;

    const members = extractMembers(combo);
    if (members.length === 0) return;

    const presetApostles = members
      .map((name: string) => apostles.find((a) => a.name === name || a.engName === name))
      .filter(Boolean) as Apostle[];

    if (presetApostles.length === 0) return;

    const matchScore = calculateMatchScore(members, myApostles, apostles);

    presetCombinations.push({
      deck: presetApostles,
      slotKey,
      comboName: combo.name,
      reason: combo.preset_reason || '프리셋 조합',
      rawCombo: combo,
      matchScore,
    });
  });

  const combo9 = presetCombinations.find((c) => c.slotKey === '9');
  const combo4 = presetCombinations.find((c) => c.slotKey === '4');
  const combo2 = presetCombinations.find((c) => c.slotKey === '2');

  return { presetCombinations, combo9, combo4, combo2 };
};

export default buildPresetCombinations;
