import type { Apostle, Personality, Position } from '@/types/apostle';
import { getPositions } from '@/utils/apostleUtils';
import { analyzeSynergies, Synergy, calculateTotalSynergyBonus } from '@/utils/deckAnalysisUtils';

type DeckSize = 6 | 9;
type ContentMode9 = 'CRASH' | 'FRONTIER';
type ContentMode6 = 'INVASION' | 'JWOPAEMTEO';

export interface RecommendOptions {
  deckSize?: DeckSize;
  mode6?: ContentMode6;
  mode9?: ContentMode9;
  asideLevels?: Record<string, number>;
}

const ROLES = {
  TANKER: 'Tanker',
  ATTACKER: 'Attacker',
  SUPPORTER: 'Supporter',
} as const;

const ALL_PERSONALITIES = ['Jolly', 'Mad', 'Naive', 'Gloomy', 'Cool'] as const;
const PRIORITY_POSITIONS: Position[] = ['back', 'mid', 'front'];

const MULTI_PERSONA_RULES: Array<{
  engName?: string;
  id?: string;
  name?: string;
  allowed: Personality[];
}> = [{ engName: 'Uros', name: '우로스', allowed: [...ALL_PERSONALITIES] }];

function getAllowedPersonas(a: Apostle): Personality[] | null {
  const rule = MULTI_PERSONA_RULES.find(
    (r) =>
      (r.engName && r.engName === a.engName) ||
      (r.id && r.id === a.id) ||
      (r.name && r.name === a.name),
  );
  return rule ? rule.allowed : null;
}

/**
 * 힐러/줘팸터 사도 제안 교체 인터페이스
 */
interface ApostleSuggestion {
  apostle: Apostle;
  synergySafe: boolean;
  score: number;
  reason?: string;
  aside?: '필수' | '권장' | '선택' | null;
}

/**
 * 조합 내 사도의 세부 역할에 Heal 또는 Shield가 포함된 사도가 있는지 확인
 * @param deck
 * @returns Boolean
 */
function hasHealer(deck: Apostle[]): boolean {
  return deck.some((a) => a.role?.trait?.includes('Heal') || a.role?.trait?.includes('Shield'));
}

/**
 * 사도가 힐러 역할인지 확인
 * @param apostle
 * @returns Boolean
 */
function isHealer(apostle: Apostle): boolean {
  return apostle.role?.trait?.includes('Heal') || apostle.role?.trait?.includes('Shield');
}

/**
 * 보유 사도 중 추천 힐러 사도 리스트 생성
 * @param deck 현재 덱
 * @param allApostles 전체 보유 사도
 * @returns ApostleSuggestion[]
 */
function suggestAvailableHealers(deck: Apostle[], allApostles: Apostle[]): ApostleSuggestion[] {
  const deckIds = new Set(deck.map((a) => a.id));
  const deckPersonas = new Set(deck.map((a) => a.persona));

  const availableHealers = allApostles
    .filter((a) => !deckIds.has(a.id) && isHealer(a))
    .map((a) => ({
      apostle: a,
      synergySafe: deckPersonas.has(a.persona),
      score: a.baseScore ?? 0, // 기본 점수 사용
      reason: a.reason, // 공통 사유 사용
    }))
    .sort((a, b) => {
      // 1순위: 덱 성격군 내
      if (a.synergySafe && !b.synergySafe) return -1;
      if (!a.synergySafe && b.synergySafe) return 1;
      // 2순위: 점수 높은 순
      return b.score - a.score;
    })
    .slice(0, 5);

  return availableHealers;
}

const DECK_CONFIG = {
  6: {
    req: { front: 2, mid: 2, back: 2 },
    balance: { [ROLES.TANKER]: 1, [ROLES.SUPPORTER]: 1 },
  },
  9: {
    req: { front: 3, mid: 3, back: 3 },
    balance: { [ROLES.TANKER]: 1, [ROLES.SUPPORTER]: 2 },
  },
} as const;

const SYNERGY_SCORES = {
  TYPE_2: 12,
  TYPE_2_2_2: 50, // 2순위: 2+2+2 조합
  TYPE_4_2: 100, // 1순위: 4+2 조합 (최우선)
  TYPE_5: 5,
  TYPE_6: 35, // 3순위: 단일 6인 조합
} as const;

export interface RecommendedDeck {
  deck: Apostle[];
  placement?: Record<string, Position>; // apostle id -> 배치된 포지션
  deckSize: DeckSize;
  totalScore: number;
  baseScore: number;
  synergyScore: number;
  synergies: Synergy[];
  roleBalance: { tanker: number; attacker: number; supporter: number };
  hasHealer: boolean;
  healerSuggestions?: ApostleSuggestion[]; // 힐러/보호막 사도 제안
  jwopaemSuggestions?: ApostleSuggestion[]; // 줘팸터 사도 제안
}

/**
 * 줘팸터(PVP)/힐러 추천 로직 일원화
 * @param deck Apostle[]
 * @param positionMap Record<string, Position>
 * @param myApostles Apostle[]
 * @param deckSize DeckSize
 * @param synergyScoreInput number (선택적)
 * @returns RecommendedDeck
 */
function createRecommendedDeckResult(
  deck: Apostle[],
  positionMap: Record<string, Position>,
  myApostles: Apostle[],
  deckSize: DeckSize,
  synergyScoreInput?: number,
  options?: RecommendOptions,
): RecommendedDeck {
  // 1. 점수 및 시너지 계산
  const baseScore = deck.reduce((sum, a) => {
    const pos = positionMap[a.id];
    const asideLevel = options?.asideLevels?.[a.id] ?? 0;
    return sum + getEffectiveBaseScore(a, deckSize, pos, options, asideLevel);
  }, 0);

  const synergies = analyzeSynergies(deck);
  // synergyScore가 주어지지 않으면 계산, 주어지면 사용 (9인덱 등 유연성 확보)
  const synergyScore = synergyScoreInput ?? calculateSynergyScore(deck);

  // 2. 부가 정보 계산
  const hasHealerBool = hasHealer(deck);
  const roleBalance = getRoleBalance(deck);

  // 3. 추천(Suggestion) 로직 통합
  // 힐러가 없으면 힐러 추천, 있으면 undefined
  const healerSuggestions = hasHealerBool ? undefined : suggestAvailableHealers(deck, myApostles);
  // 줘팸터(PVP) 사도 추천
  const jwopaemSuggestions = suggestAvailableAlternatives(deck, myApostles);

  return {
    deck,
    placement: positionMap,
    deckSize,
    totalScore: baseScore + synergyScore,
    baseScore,
    synergyScore,
    synergies,
    roleBalance,
    hasHealer: hasHealerBool,
    healerSuggestions,
    jwopaemSuggestions,
  };
}

/**
 * 대충돌/프론티어 성격시너지 옵션 함수
 * @param mode9 9인 콘텐츠 모드
 * @returns
 */
const getSynergyScore9 = (mode9: ContentMode9 | undefined) => {
  if (mode9 === 'FRONTIER') return () => 0; // 프론티어는 시너지 미적용
  return (deck: Apostle[]) => {
    const synergies = analyzeSynergies(deck);
    const total = calculateTotalSynergyBonus(synergies);
    return total.hp + total.damage; // 가중치는 3단계 전에 튜닝
  };
};

/**
 * 줘팸터(PVP) 보너스 점수 반영
 * @param apostle Apostle
 * @param options RecommendOptions (6인덱/9인덱 모드 옵션)
 * @returns number
 */
function getPvpBonusScore(apostle: Apostle, options?: RecommendOptions): number {
  const isPvpMode = options?.deckSize === 6 && options?.mode6 === 'JWOPAEMTEO';
  if (isPvpMode && apostle.pvp?.score) {
    return apostle.pvp.score;
  }
  return 0;
}
/**
 * 6인덱/9인덱 변동 점수 반영 (줘팸터 보너스 점수 포함)
 * @param apostle Apostle
 * @param size 덱 크기 (6 or 9)
 * @param position 배치 열 선택 (전열/중열/후열, 선택적)
 * @param options RecommendOptions (6인덱/9인덱 모드 옵션)
 * @returns number
 */
export function getEffectiveBaseScore(
  apostle: Apostle,
  decksize: DeckSize,
  targetPos?: Position,
  options?: RecommendOptions,
  asideLevel: number = 0,
): number {
  let baseScore = apostle.baseScore ?? 0;
  // 1. 덱 크기 보정
  const sizeScore = apostle.scoreBySize as { size6?: number; size9?: number } | undefined;
  if (sizeScore) {
    baseScore = decksize === 6 ? (sizeScore.size6 ?? baseScore) : (sizeScore.size9 ?? baseScore);
  }

  // 2. PVP 보정 (분리된 함수 호출)
  baseScore += getPvpBonusScore(apostle, options);
  // 3. 포지션 보정
  if (targetPos && apostle.positionScore) {
    baseScore = (apostle.positionScore as Record<Position, number>)[targetPos] ?? baseScore;
  }

  // 4. 어사이드 보정 (A2 달성 시만 점수반영)
  const asideScore = apostle.aside?.score ?? 0;
  const asideBonus = asideLevel >= 2 ? asideScore : 0;
  baseScore += asideBonus;

  return baseScore;
}

/**
 * 보유한 사도 중 줘팸터 추천 사도 리스트를 생성합니다.
 *
 * @param deck 현재 구성된 덱 (6명 or 9명)
 * @param allApostles 전체 보유 사도 리스트
 * @param positionMap 현재 덱의 사도별 배치 위치 정보 (Record<apostleId, Position>)
 * @param options 추천 옵션 (모드, 덱 크기 등)
 * @returns Record<string, ApostleSuggestion[]> (key: 원본 사도 ID, value: 대체 후보 리스트)
 */
function suggestAvailableAlternatives(
  deck: Apostle[],
  allApostles: Apostle[],
): ApostleSuggestion[] {
  const deckIds = new Set(deck.map((a) => a.id));
  const deckPersonas = new Set(deck.map((a) => a.persona));
  const recommendOptions = { deckSize: 6, mode6: 'JWOPAEMTEO' } as RecommendOptions;

  const candidates = allApostles
    .filter((candidate) => !deckIds.has(candidate.id))
    .map((candidate) => {
      const positions = Array.isArray(candidate.position)
        ? candidate.position
        : [candidate.position];
      const bestPos = positions[0] as Position;
      const score = getEffectiveBaseScore(candidate, 6, bestPos, recommendOptions);

      /**
       * 활성화된 시너지 내에서 대체 사도 확인
       * PVP 데이터가 있으면 우선 적용
       */
      const synergySafe = deckPersonas.has(candidate.persona);
      let reason = candidate.reason;
      let asideRec = candidate.aside?.importance;
      if (candidate.pvp) {
        if (candidate.pvp.reason) reason = candidate.pvp.reason;
        if (candidate.pvp.aside) asideRec = candidate.pvp.aside as '필수' | '권장' | '선택';
      }

      return {
        apostle: candidate,
        synergySafe,
        score,
        reason,
        aside: asideRec,
      } as ApostleSuggestion;
    });

  // 2. 상위 5명 사도 추출 (50점 이상만)
  return candidates
    .filter((c) => c.score > 50 && c.synergySafe)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function calculateSynergyScore(apostles: Apostle[]): number {
  const synergies = analyzeSynergies(apostles);

  const countMap = synergies.reduce<Partial<Record<Personality, number>>>((acc, s) => {
    if (s.ownedCount > 0) acc[s.personality] = s.ownedCount;
    return acc;
  }, {});

  const counts = Object.values(countMap).sort((a, b) => b - a);

  if (counts.length >= 2 && counts[0] === 4 && counts[1] === 2) return SYNERGY_SCORES.TYPE_4_2;
  if (counts[0] === 5) return SYNERGY_SCORES.TYPE_5;
  if (counts.length >= 3 && counts[0] === 2 && counts[1] === 2 && counts[2] === 2)
    return SYNERGY_SCORES.TYPE_2_2_2;
  if (counts[0] === 6) return SYNERGY_SCORES.TYPE_6;

  return 0;
}

/**
 * 공명성격 사도 성격 시너지 최적화
 * @param deck
 * @returns
 */
function applyBestPersona(deck: Apostle[]): Apostle[] {
  const targets = deck
    .map((a, idx) => ({ a, idx, allowed: getAllowedPersonas(a) }))
    .filter((x): x is { a: Apostle; idx: number; allowed: Personality[] } => !!x.allowed);

  if (targets.length === 0) return deck;

  let bestDeck = deck;
  let bestScore = -Infinity;

  const tryAll = (i: number, working: Apostle[]) => {
    if (i === targets.length) {
      const synergies = analyzeSynergies(working);
      const total = calculateTotalSynergyBonus(synergies);
      const score = total.hp + total.damage;
      if (score > bestScore) {
        bestScore = score;
        bestDeck = working;
      }
      return;
    }

    const t = targets[i];
    for (const p of t.allowed) {
      const next = working.map((x, idx) => (idx === t.idx ? { ...x, persona: p } : x));
      tryAll(i + 1, next);
    }
  };

  tryAll(0, deck);
  return bestDeck;
}

function getRoleBalance(apostles: Apostle[]) {
  return apostles.reduce(
    (acc, a) => {
      if (a.role.main === ROLES.TANKER) acc.tanker++;
      else if (a.role.main === ROLES.ATTACKER) acc.attacker++;
      else if (a.role.main === ROLES.SUPPORTER) acc.supporter++;
      return acc;
    },
    { tanker: 0, attacker: 0, supporter: 0 },
  );
}

/**
 * Greedy 알고리즘으로 포지션별 최적 사도를 선택하고 덱을 구성합니다.
 * 1. 포지션 배치: '후열 -> 중열 -> 전열' 순으로 진행
 * 2. 동적 재정렬: 각 포지션을 채울 때마다 현재 남은 후보군을 '해당 열의 점수' 기준으로 매번 재정렬
 * 3. 포지션 최적화: 프리포지션 사도가가 성능이 낮은 열(전열 등)에 배정되어 조합의 밸류가 낮아지는 현상을 방지
 * @param candidates 후보로 고려할 사도 리스트
 * @param requirements { front, mid, back } 각 포지션별로 필요한 사도 수
 * @param skipNames 추천 조합에서 제외할 사도 이름 집합 (중복 추천 방지 등)
 * @param deckSize 구성할 덱의 크기 (6인/9인)
 * @param options 어사이드(Aside) 레벨 등 점수 보정 및 컨텐츠 모드 옵션
 * @returns { deck, placement } 생성된 사도 리스트와 ID별 포지션 매핑 결과
 */
function selectApostlesGreedy(
  candidates: Apostle[],
  requirements: { front: number; mid: number; back: number },
  skipNames: Set<string>,
  deckSize: DeckSize = 6,
  options?: RecommendOptions,
): { deck: Apostle[]; placement: Record<string, Position> } {
  const placement: Record<Position, Apostle[]> = { front: [], mid: [], back: [] };
  const deck: Apostle[] = [];
  const placedIds = new Set<string>();

  let pool = candidates.filter((a) => !skipNames.has(a.engName));

  for (const targetPos of PRIORITY_POSITIONS) {
    const capacity = requirements[targetPos];
    if (capacity <= 0) continue;

    pool.sort((a, b) => {
      const asideLevelA = options?.asideLevels?.[a.id] ?? 0;
      const asideLevelB = options?.asideLevels?.[b.id] ?? 0;

      const scoreA = getEffectiveBaseScore(a, deckSize, targetPos, options, asideLevelA);
      const scoreB = getEffectiveBaseScore(b, deckSize, targetPos, options, asideLevelB);

      return scoreB - scoreA;
    });

    const nextPool: Apostle[] = [];

    for (const apostle of pool) {
      const validPositions = getPositions(apostle);
      const isFull = placement[targetPos].length >= capacity;
      if (!isFull && validPositions.includes(targetPos)) {
        placement[targetPos].push(apostle);
        deck.push(apostle);
        placedIds.add(apostle.id);
      } else {
        nextPool.push(apostle);
      }
    }

    pool = nextPool;
  }

  const positionMap: Record<string, Position> = {};
  Object.entries(placement).forEach(([pos, apostles]) => {
    apostles.forEach((apostle) => {
      positionMap[apostle.id] = pos as Position;
    });
  });

  return {
    deck: [...placement.front, ...placement.mid, ...placement.back],
    placement: positionMap,
  };
}

function adjustForRoleBalance(
  currentDeck: Apostle[],
  candidates: Apostle[],
  deckSize: DeckSize,
  positionMap: Record<string, Position>,
) {
  const config = DECK_CONFIG[deckSize];
  const placedNames = new Set(currentDeck.map((a) => a.engName));

  const trySwap = (targetRole: string, needed: number) => {
    let roles = getRoleBalance(currentDeck);

    const available = candidates
      .filter((a) => a.role.main === targetRole && !placedNames.has(a.engName))
      .sort((a, b) => {
        // 가능한 모든 포지션의 평균 점수로 비교 (positionScore 적용)
        const positionsA = getPositions(a);
        const positionsB = getPositions(b);
        const avgA =
          positionsA.reduce((sum, pos) => sum + getEffectiveBaseScore(a, deckSize, pos), 0) /
          positionsA.length;
        const avgB =
          positionsB.reduce((sum, pos) => sum + getEffectiveBaseScore(b, deckSize, pos), 0) /
          positionsB.length;
        return avgB - avgA;
      });

    for (const candidate of available) {
      if (needed <= 0) break;

      const candidatePositions = getPositions(candidate);

      // 교체 가능한 모든 Attacker 찾기
      const validOutIndices = currentDeck
        .map((a, idx) => ({ a, idx }))
        .filter(
          (x) =>
            x.a.role.main === ROLES.ATTACKER &&
            getPositions(x.a).some((p) => candidatePositions.includes(p)),
        )
        // 현재 배치된 위치의 점수가 낮은 순으로 정렬 (우선 교체 대상)
        .sort((a, b) => {
          // 현재 배치된 위치의 실제 점수로 비교
          const currentPosA = positionMap[a.a.id];
          const currentPosB = positionMap[b.a.id];
          const scoreA = currentPosA
            ? getEffectiveBaseScore(a.a, deckSize, currentPosA)
            : getEffectiveBaseScore(a.a, deckSize);
          const scoreB = currentPosB
            ? getEffectiveBaseScore(b.a, deckSize, currentPosB)
            : getEffectiveBaseScore(b.a, deckSize);
          return scoreA - scoreB;
        });

      const outIdx = validOutIndices.length > 0 ? validOutIndices[0].idx : -1;

      if (outIdx === -1) continue;

      currentDeck[outIdx] = candidate;
      placedNames.add(candidate.engName);

      roles = getRoleBalance(currentDeck);
      needed = Math.max(
        0,
        config.balance[targetRole as keyof typeof config.balance] -
          roles[targetRole.toLowerCase() as 'tanker' | 'supporter'],
      );
    }
  };

  const roles0 = getRoleBalance(currentDeck);
  if (roles0.tanker < config.balance[ROLES.TANKER])
    trySwap(ROLES.TANKER, config.balance[ROLES.TANKER] - roles0.tanker);
  const roles1 = getRoleBalance(currentDeck);
  if (roles1.supporter < config.balance[ROLES.SUPPORTER])
    trySwap(ROLES.SUPPORTER, config.balance[ROLES.SUPPORTER] - roles1.supporter);

  return currentDeck;
}

/**
 * 특정 성격 조합으로 6인 덱 생성 시도
 */
function tryBuildDeckWithPersonalities(
  selectedPersonalities: Personality[],
  distribution: number[],
  personalityGroups: Map<Personality, Apostle[]>,
  requirements: { front: number; mid: number; back: number },
  deckSize: DeckSize = 6,
  options?: RecommendOptions,
): { deck: Apostle[]; positionMap: Record<string, Position> } | null {
  const candidates: Apostle[] = [];
  const usedNames = new Set<string>();

  // 각 성격에서 필요한 수만큼 사도 선택
  for (let i = 0; i < selectedPersonalities.length; i++) {
    const personality = selectedPersonalities[i];
    const needed = distribution[i];
    const group = personalityGroups.get(personality) || [];

    let selectedCount = 0;
    for (const apostle of group) {
      if (usedNames.has(apostle.engName)) continue;
      if (selectedCount >= needed) break;

      candidates.push(apostle);
      usedNames.add(apostle.engName);
      selectedCount++;
    }

    // 필요한 수만큼 선택 못했으면 실패
    if (selectedCount < needed) return null;
  }

  // 포지션 제약을 만족하는 덱 생성
  const deckResult = selectApostlesGreedy(candidates, requirements, new Set(), deckSize, options);
  const deck = deckResult.deck;
  const positionMap = deckResult.placement;

  // 6명이 선택되지 않았으면 실패
  if (deck.length !== deckSize) return null;

  return { deck, positionMap };
}

/**
 * 시너지 패턴을 기반으로 6인 덱 생성
 * 공명 사도의 경우 모든 성격 고려
 * @param myApostles
 * @param options
 * @returns
 */
function buildSixDeckWithPattern(
  myApostles: Apostle[],
  options?: RecommendOptions,
): RecommendedDeck[] {
  if (myApostles.length < 6) return [];

  const results: RecommendedDeck[] = [];
  const personalityGroups = new Map<Personality, Apostle[]>();
  ALL_PERSONALITIES.forEach((p) => personalityGroups.set(p, []));

  myApostles.forEach((a) => {
    const allowed = getAllowedPersonas(a);
    if (allowed && allowed.length > 0) {
      allowed.forEach((p) => personalityGroups.get(p)?.push(a));
    } else {
      personalityGroups.get(a.persona)?.push(a);
    }
  });

  personalityGroups.forEach((group) => {
    group.sort((a, b) => {
      const asideA = options?.asideLevels?.[a.id] ?? 0;
      const asideB = options?.asideLevels?.[b.id] ?? 0;
      const scoreA = getEffectiveBaseScore(a, 6, undefined, options, asideA);
      const scoreB = getEffectiveBaseScore(b, 6, undefined, options, asideB);
      return scoreB - scoreA;
    });
  });

  const personalities = Array.from(personalityGroups.keys()).filter(
    (p) => (personalityGroups.get(p)?.length ?? 0) > 0,
  );
  const requirements = DECK_CONFIG[6].req;
  const reqBalance = DECK_CONFIG[6].balance;

  const processAndAddDeck = (
    deckResult: { deck: Apostle[]; positionMap: Record<string, Position> } | null,
    targetSynergyScore: number,
    balancingCandidates: Apostle[], // 밸런싱에 사용할 사도 풀 (4+2는 시너지 깨짐 방지 위해 제한 필요)
    options?: RecommendOptions,
  ) => {
    if (!deckResult) return;

    // 1. 역할 밸런스 조정 (탱커/서포터 부족 시 교체 시도)
    const balancedDeck = adjustForRoleBalance(
      [...deckResult.deck],
      balancingCandidates,
      6,
      deckResult.positionMap,
    );

    // 2. 최적의 성격 적용 (우로스 등)
    const optimizedDeck = applyBestPersona(balancedDeck);

    // 3. 최종 역할군 검사 (Hard Constraint)
    const roles = getRoleBalance(optimizedDeck);
    if (
      roles.tanker >= reqBalance[ROLES.TANKER] &&
      roles.supporter >= reqBalance[ROLES.SUPPORTER]
    ) {
      // 4. 최종 시너지 점수 확인
      const currentSynergyScore = calculateSynergyScore(optimizedDeck);

      // 5. 목표 시너지와 일치하면 결과 저장
      if (currentSynergyScore === targetSynergyScore) {
        results.push(
          createRecommendedDeckResult(
            optimizedDeck,
            deckResult.positionMap,
            myApostles, // 줘팸터 추천 등을 위해 전체 목록 필요
            6,
            currentSynergyScore,
            options,
          ),
        );
      }
    }
  };

  // 1순위: 4+2 패턴
  for (const p1 of personalities) {
    const group1 = personalityGroups.get(p1) || [];
    if (group1.length < 4) continue;

    for (const p2 of personalities) {
      if (p1 === p2) continue;
      const group2 = personalityGroups.get(p2) || [];
      if (group2.length < 2) continue;

      const deck = tryBuildDeckWithPersonalities(
        [p1, p2],
        [4, 2],
        personalityGroups,
        requirements,
        6,
        options,
      );

      // 4+2는 시너지가 깨지지 않도록, 해당 성격(p1, p2)을 가진 사도들 중에서만 교체 멤버를 찾음
      const synergyCandidates = myApostles.filter((a) => a.persona === p1 || a.persona === p2);
      processAndAddDeck(deck, SYNERGY_SCORES.TYPE_4_2, synergyCandidates, options);
    }
  }

  // 2순위: 2+2+2 패턴
  for (let i = 0; i < personalities.length - 2; i++) {
    for (let j = i + 1; j < personalities.length - 1; j++) {
      for (let k = j + 1; k < personalities.length; k++) {
        const p1 = personalities[i];
        const p2 = personalities[j];
        const p3 = personalities[k];

        if ((personalityGroups.get(p1)?.length ?? 0) < 2) continue;
        if ((personalityGroups.get(p2)?.length ?? 0) < 2) continue;
        if ((personalityGroups.get(p3)?.length ?? 0) < 2) continue;

        const deck = tryBuildDeckWithPersonalities(
          [p1, p2, p3],
          [2, 2, 2],
          personalityGroups,
          requirements,
          6,
          options,
        );

        // 2+2+2는 이미 다양한 성격이 섞여 있으므로 전체 사도 풀에서 교체 시도
        processAndAddDeck(deck, SYNERGY_SCORES.TYPE_2_2_2, myApostles, options);
      }
    }
  }

  // 3순위: 단일 6 패턴
  for (const personality of personalities) {
    const group = personalityGroups.get(personality) || [];
    if (group.length < 6) continue;

    const deck = tryBuildDeckWithPersonalities(
      [personality],
      [6],
      personalityGroups,
      requirements,
      6,
      options,
    );

    processAndAddDeck(deck, SYNERGY_SCORES.TYPE_6, myApostles, options);
  }

  const uniqueResults = new Map<string, RecommendedDeck>();
  results.forEach((result) => {
    const deckKey = result.deck
      .map((a) => a.id)
      .sort()
      .join(',');
    if (!uniqueResults.has(deckKey)) {
      uniqueResults.set(deckKey, result);
    }
  });

  return Array.from(uniqueResults.values()).sort((a, b) => b.totalScore - a.totalScore);
}

function processGreedyAttempt(
  sortedCandidates: Apostle[],
  skipNames: Set<string>,
  size: DeckSize,
  options?: RecommendOptions,
): { deck: Apostle[]; placement: Record<string, Position> } | null {
  const deckResult = selectApostlesGreedy(
    sortedCandidates,
    DECK_CONFIG[size].req,
    skipNames,
    size,
    options,
  );
  const initialDeck = deckResult.deck;
  const placement = deckResult.placement;

  if (initialDeck.length !== size) return null;

  // 제외 사도 필터링
  const candidatesForBalancing = sortedCandidates.filter((a) => !skipNames.has(a.engName));

  // 역할 밸런스 조정
  const balancedDeck = adjustForRoleBalance(
    initialDeck,
    candidatesForBalancing, // [변경] 필터링된 후보군 사용
    size,
    placement,
  );

  // 공명 성격 최적화
  const finalDeck = applyBestPersona(balancedDeck);

  // 덱 내 필수 역할 검증
  const finalRoles = getRoleBalance(finalDeck);
  const reqBalance = DECK_CONFIG[size].balance;

  if (
    finalRoles.tanker < reqBalance[ROLES.TANKER] ||
    finalRoles.supporter < reqBalance[ROLES.SUPPORTER]
  ) {
    return null;
  }

  return { deck: finalDeck, placement };
}

/**
 * 덱 빌더 메인 함수
 * 점수 기준 정렬 후, 하나씩 제외하여 덱 생성
 * @param myApostles
 * @param size
 * @param maxAttempts
 * @param getSynergyScore
 * @returns
 */
function buildDeck(
  myApostles: Apostle[],
  size: DeckSize,
  maxAttempts: number,
  getSynergyScore: (deck: Apostle[]) => number,
  options?: RecommendOptions,
): RecommendedDeck[] {
  // 예외 처리
  if (!myApostles || myApostles.length < size) return [];

  const results: RecommendedDeck[] = [];
  const usedCombinations = new Set<string>();

  // 점수 기준 정렬 (모든 시도에서 공통으로 사용)
  const sortedApostles = [...myApostles].sort((a, b) => {
    const aAside = options?.asideLevels?.[a.id] ?? 0;
    const bAside = options?.asideLevels?.[b.id] ?? 0;
    return (
      getEffectiveBaseScore(b, size, undefined, options, bAside) -
      getEffectiveBaseScore(a, size, undefined, options, aAside)
    );
  });

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const skipNames = new Set<string>();
    if (attempt > 0) {
      sortedApostles.slice(0, attempt).forEach((a) => skipNames.add(a.engName));
    }

    // 2. 단일 덱 생성 시도 (분리된 함수 호출)
    const attemptResult = processGreedyAttempt(sortedApostles, skipNames, size, options);

    // 생성 실패 시 다음 시도로 넘어감
    if (!attemptResult) continue;

    // 3. 중복 조합 체크 (Deck Key 생성)
    const deckKey = attemptResult.deck
      .map((a) => a.id)
      .sort()
      .join(',');
    if (usedCombinations.has(deckKey)) continue;
    usedCombinations.add(deckKey);

    // 4. 시너지 점수 계산 (주입받은 함수 사용 - 6인/9인 대응)
    const synergyScore = getSynergyScore(attemptResult.deck);

    // 5. 결과 객체 생성 및 저장
    results.push(
      createRecommendedDeckResult(
        attemptResult.deck,
        attemptResult.placement,
        myApostles,
        size,
        synergyScore,
        options,
      ),
    );
  }

  return results.sort((a, b) => b.totalScore - a.totalScore);
}

export function generateRecommendations(
  myApostles: Apostle[],
  options?: RecommendOptions,
): RecommendedDeck[] {
  const results: RecommendedDeck[] = [];

  // 9인
  const score9 = getSynergyScore9(options?.mode9);
  results.push(...buildDeck(myApostles, 9, 1, score9, options));
  // 6인
  results.push(...buildSixDeckWithPattern(myApostles, options));
  results.push(...buildDeck(myApostles, 6, 2, calculateSynergyScore, options));

  return duplicateAndSortResults(results);
}

/**
 * 중복된 추천 덱 제거 후 상위 6개 반환
 * @param results
 * @returns
 */
function duplicateAndSortResults(results: RecommendedDeck[]): RecommendedDeck[] {
  const uniqueResults = new Map<string, RecommendedDeck>();
  results.forEach((result) => {
    const deckKey = result.deck
      .map((a) => a.id)
      .sort()
      .join(',');
    const existing = uniqueResults.get(deckKey);
    if (!existing || result.totalScore > existing.totalScore) {
      uniqueResults.set(deckKey, result);
    }
  });

  return Array.from(uniqueResults.values())
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 6);
}
