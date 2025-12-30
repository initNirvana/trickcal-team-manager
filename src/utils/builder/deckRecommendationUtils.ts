import type { Apostle, Personality, Position } from '@/types/apostle';
import { getPositions } from '@/utils/apostleUtils';
import { analyzeSynergies, Synergy, calculateTotalSynergyBonus } from '@/utils/deckAnalysisUtils';

type DeckSize = 6 | 9;
type ContentMode9 = 'CRASH' | 'FRONTIER';

export interface RecommendOptions {
  deckSize: DeckSize;
  mode9?: ContentMode9;
}

const ROLES = {
  TANKER: 'Tanker',
  ATTACKER: 'Attacker',
  SUPPORTER: 'Supporter',
} as const;

const ALL_PERSONALITIES = ['Jolly', 'Mad', 'Naive', 'Gloomy', 'Cool'] as const;

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
 * 추천 힐러 제안 교체 인터페이스
 */
interface HealerSuggestion {
  apostle: Apostle;
  synergySafe: boolean;
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
 * @returns HealerSuggestion[]
 */
function suggestAvailableHealers(deck: Apostle[], allApostles: Apostle[]): HealerSuggestion[] {
  const deckIds = new Set(deck.map((a) => a.id));
  const deckPersonas = new Set(deck.map((a) => a.persona));

  const availableHealers = allApostles
    .filter((a) => !deckIds.has(a.id) && isHealer(a))
    .map((a) => ({
      apostle: a,
      synergySafe: deckPersonas.has(a.persona),
    }))
    .sort((a, b) => {
      // 1순위: 덱 성격군 내
      if (a.synergySafe && !b.synergySafe) return -1;
      if (!a.synergySafe && b.synergySafe) return 1;
      // 2순위: 점수 높은 순
      return (b.apostle.baseScore ?? 0) - (a.apostle.baseScore ?? 0);
    })
    .slice(0, 5); // 상위 5개

  return availableHealers;
}

/**
 * 프리 포지션 여부 확인
 */
function isFreePosition(apostle: Apostle): boolean {
  const positions = getPositions(apostle);
  return positions.length === 3;
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
  deckSize: DeckSize;
  totalScore: number;
  baseScore: number;
  synergyScore: number;
  synergies: Synergy[];
  roleBalance: { tanker: number; attacker: number; supporter: number };
  hasHealer: boolean;
  healerSuggestions?: HealerSuggestion[];
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
 * 6인덱/9인덱 변동 점수 반영
 * @param a Apostle
 * @param size 덱 크기 (6 or 9)
 * @param position 배치 열 선택 (전열/중열/후열, 선택적)
 * @returns
 */
function getEffectiveBaseScore(a: Apostle, size: DeckSize, position?: Position): number {
  let baseScore = a.baseScore ?? 0;
  const sizeScore = a.scoreBySize as { size6?: number; size9?: number } | undefined;
  if (sizeScore) {
    baseScore = size === 6 ? (sizeScore.size6 ?? baseScore) : (sizeScore.size9 ?? baseScore);
  }

  // position이 지정된 경우만 positionScore 적용
  if (!position) return baseScore;

  const positionScore = a.positionScore as
    | { front?: number; mid?: number; back?: number }
    | undefined;
  if (!positionScore) return baseScore;
  return positionScore[position] ?? baseScore;
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

function applyBestPersonaForSynergy(deck: Apostle[]): Apostle[] {
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

function selectApostlesGreedy(
  sortedCandidates: Apostle[],
  requirements: { front: number; mid: number; back: number },
  skipNames: Set<string>,
  deckSize: DeckSize = 6,
): Apostle[] {
  const placement: Record<Position, Apostle[]> = { front: [], mid: [], back: [] };
  const placedNames = new Set<string>();

  for (const apostle of sortedCandidates) {
    if (skipNames.has(apostle.engName) || placedNames.has(apostle.engName)) continue;

    const priorityList = apostle.positionPriority || getPositions(apostle);
    const validPositions = getPositions(apostle); // 포지션 유효성 체크용

    // 포지션별 점수를 고려하여 배치 위치 결정
    let bestPos: Position | null = null;
    let bestScore = -Infinity;

    for (const pos of priorityList) {
      if (
        placement[pos].length < requirements[pos as keyof typeof requirements] &&
        validPositions.includes(pos)
      ) {
        // 위치별 점수 계산 (positionScore 적용, deckSize 고려)
        const posScore = getEffectiveBaseScore(apostle, deckSize, pos);
        if (posScore > bestScore) {
          bestScore = posScore;
          bestPos = pos;
        }
      }
    }

    if (bestPos !== null) {
      placement[bestPos].push(apostle);
      placedNames.add(apostle.engName);
    }

    const currentTotal = Object.values(placement).reduce((sum, list) => sum + list.length, 0);
    const targetTotal = requirements.front + requirements.mid + requirements.back;
    if (currentTotal >= targetTotal) break;
  }

  // 2단계: Free Position 사도 최적화 (티그 등)
  optimizeFreePositionApostles(placement);

  return [...placement.front, ...placement.mid, ...placement.back];
}

/**
 * Free Position 사도가 선호 위치에 배치되도록 교체 시도
 */
function optimizeFreePositionApostles(placement: Record<Position, Apostle[]>): void {
  const positions: Position[] = ['front', 'mid', 'back'];

  // 모든 포지션을 순회하며 Free Position 사도 찾기
  for (const currentPos of positions) {
    for (let i = 0; i < placement[currentPos].length; i++) {
      const apostle = placement[currentPos][i];

      // Free Position이 아니면 skip
      if (!isFreePosition(apostle)) continue;

      const priority = apostle.positionPriority || getPositions(apostle);
      const preferredPos = priority[0] as 'front' | 'mid' | 'back';

      // 이미 선호 위치에 있으면 skip
      if (preferredPos === currentPos) continue;

      // 선호 위치에서 교체 대상 찾기
      const swapTarget = findSwapTarget(placement[preferredPos], currentPos, 6);

      if (swapTarget !== null) {
        // Swap 실행
        const targetIndex = placement[preferredPos].indexOf(swapTarget);
        placement[preferredPos][targetIndex] = apostle;
        placement[currentPos][i] = swapTarget;

        // 한 번만 교체 (재귀 방지)
        break;
      }
    }
  }
}

/**
 * 교체 대상 찾기: Attacker 중 목표 위치 점수 낮은 순 → 전체 중 낮은 순
 */
function findSwapTarget(
  candidatesInPosition: Apostle[],
  targetPosition: 'front' | 'mid' | 'back',
  deckSize: DeckSize = 6,
): Apostle | null {
  // targetPosition에 배치 가능한 사도만 필터링
  const eligibleCandidates = candidatesInPosition.filter((a) =>
    getPositions(a).includes(targetPosition),
  );

  if (eligibleCandidates.length === 0) return null;

  // 1순위: Attacker 중 목표 위치 점수 낮은 순
  const attackers = eligibleCandidates
    .filter((a) => a.role.main === ROLES.ATTACKER)
    .sort(
      (a, b) =>
        getEffectiveBaseScore(a, deckSize, targetPosition) -
        getEffectiveBaseScore(b, deckSize, targetPosition),
    );

  if (attackers.length > 0) return attackers[0];

  // 2순위: 전체 중 목표 위치 점수 낮은 순
  const sortedByScore = eligibleCandidates.sort(
    (a, b) =>
      getEffectiveBaseScore(a, deckSize, targetPosition) -
      getEffectiveBaseScore(b, deckSize, targetPosition),
  );

  return sortedByScore[0];
}

function adjustForRoleBalance(currentDeck: Apostle[], candidates: Apostle[], deckSize: DeckSize) {
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

      const outIdx = currentDeck.findIndex(
        (a) =>
          a.role.main === ROLES.ATTACKER &&
          getPositions(a).some((p) => candidatePositions.includes(p)),
      );

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
 * 성격별로 사도를 그룹화하고 baseScore로 정렬
 */
function groupApostlesByPersonality(
  apostles: Apostle[],
  deckSize: DeckSize,
): Map<Personality, Apostle[]> {
  const groups = new Map<Personality, Apostle[]>();

  apostles.forEach((apostle) => {
    const personality = apostle.persona;
    if (!groups.has(personality)) {
      groups.set(personality, []);
    }
    groups.get(personality)!.push(apostle);
  });

  // 각 그룹 내에서 baseScore 내림차순 정렬
  groups.forEach((group) => {
    group.sort((a, b) => getEffectiveBaseScore(b, deckSize) - getEffectiveBaseScore(a, deckSize));
  });

  return groups;
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
): Apostle[] | null {
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
  const deck = selectApostlesGreedy(candidates, requirements, new Set(), deckSize);

  // 6명이 선택되지 않았으면 실패
  if (deck.length !== deckSize) return null;

  return deck;
}

/**
 * 패턴 기반 6인 덱 생성
 */
function buildSixPersonDeckWithPattern(myApostles: Apostle[]): RecommendedDeck[] {
  if (myApostles.length < 6) return [];

  const results: RecommendedDeck[] = [];
  const personalityGroups = groupApostlesByPersonality(myApostles, 6);
  const personalities = Array.from(personalityGroups.keys());
  const requirements = DECK_CONFIG[6].req;
  const reqBalance = DECK_CONFIG[6].balance;

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
      );

      if (deck) {
        // 성격 시너지 유지되도록 후보군 제한
        const synergyCandidates = myApostles.filter((a) => a.persona === p1 || a.persona === p2);

        const balancedDeck = adjustForRoleBalance([...deck], synergyCandidates, 6);
        const balancedDeckWithBestPersona = applyBestPersonaForSynergy(balancedDeck);
        const roles = getRoleBalance(balancedDeckWithBestPersona);

        if (
          roles.tanker >= reqBalance[ROLES.TANKER] &&
          roles.supporter >= reqBalance[ROLES.SUPPORTER]
        ) {
          const synergyScore = calculateSynergyScore(balancedDeckWithBestPersona);
          if (synergyScore === SYNERGY_SCORES.TYPE_4_2) {
            const baseScore = balancedDeckWithBestPersona.reduce(
              (sum, a) => sum + getEffectiveBaseScore(a, 6),
              0,
            );

            results.push({
              deck: balancedDeckWithBestPersona,
              deckSize: 6,
              totalScore: baseScore + synergyScore,
              baseScore,
              synergyScore,
              synergies: analyzeSynergies(balancedDeckWithBestPersona),
              roleBalance: roles,
              hasHealer: hasHealer(balancedDeckWithBestPersona),
            });
          }
        }
      }
    }
  }

  // 2순위: 2+2+2 패턴
  for (let i = 0; i < personalities.length - 2; i++) {
    for (let j = i + 1; j < personalities.length - 1; j++) {
      for (let k = j + 1; k < personalities.length; k++) {
        const p1 = personalities[i];
        const p2 = personalities[j];
        const p3 = personalities[k];

        const g1 = personalityGroups.get(p1) || [];
        const g2 = personalityGroups.get(p2) || [];
        const g3 = personalityGroups.get(p3) || [];

        if (g1.length < 2 || g2.length < 2 || g3.length < 2) continue;

        const deck = tryBuildDeckWithPersonalities(
          [p1, p2, p3],
          [2, 2, 2],
          personalityGroups,
          requirements,
          6,
        );

        if (deck) {
          const balancedDeck = adjustForRoleBalance([...deck], myApostles, 6);
          const balancedDeckWithBestPersona = applyBestPersonaForSynergy(balancedDeck);
          const roles = getRoleBalance(balancedDeckWithBestPersona);

          if (
            roles.tanker >= reqBalance[ROLES.TANKER] &&
            roles.supporter >= reqBalance[ROLES.SUPPORTER]
          ) {
            const synergyScore = calculateSynergyScore(balancedDeckWithBestPersona);
            if (synergyScore === SYNERGY_SCORES.TYPE_2_2_2) {
              const baseScore = balancedDeckWithBestPersona.reduce(
                (sum, a) => sum + getEffectiveBaseScore(a, 6),
                0,
              );
              results.push({
                deck: balancedDeckWithBestPersona,
                deckSize: 6,
                totalScore: baseScore + synergyScore,
                baseScore,
                synergyScore,
                synergies: analyzeSynergies(balancedDeckWithBestPersona),
                roleBalance: roles,
                hasHealer: hasHealer(balancedDeckWithBestPersona),
              });
            }
          }
        }
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
    );

    if (deck) {
      const balancedDeck = adjustForRoleBalance([...deck], myApostles, 6);
      const balancedDeckWithBestPersona = applyBestPersonaForSynergy(balancedDeck);
      const roles = getRoleBalance(balancedDeckWithBestPersona);

      if (
        roles.tanker >= reqBalance[ROLES.TANKER] &&
        roles.supporter >= reqBalance[ROLES.SUPPORTER]
      ) {
        const synergyScore = calculateSynergyScore(balancedDeckWithBestPersona);
        if (synergyScore === SYNERGY_SCORES.TYPE_6) {
          const baseScore = balancedDeckWithBestPersona.reduce(
            (sum, a) => sum + getEffectiveBaseScore(a, 6),
            0,
          );
          results.push({
            deck: balancedDeckWithBestPersona,
            deckSize: 6,
            totalScore: baseScore + synergyScore,
            baseScore,
            synergyScore,
            synergies: analyzeSynergies(balancedDeckWithBestPersona),
            roleBalance: roles,
            hasHealer: hasHealer(balancedDeckWithBestPersona),
          });
        }
      }
    }
  }

  // 중복 제거
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

function buildDeck(
  myApostles: Apostle[],
  size: DeckSize,
  maxAttempts: number,
  getSynergyScore: (deck: Apostle[]) => number,
): RecommendedDeck[] {
  if (!myApostles || myApostles.length === 0) return [];
  if (myApostles.length < size) return [];

  const results: RecommendedDeck[] = [];
  const usedCombinations = new Set<string>();
  const sortedApostles = [...myApostles].sort(
    (a, b) => getEffectiveBaseScore(b, size) - getEffectiveBaseScore(a, size),
  );

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const skipNames = new Set<string>();

    if (attempt > 0) {
      sortedApostles.slice(0, attempt).forEach((a) => skipNames.add(a.engName));
    }

    const initialDeck = selectApostlesGreedy(
      sortedApostles,
      DECK_CONFIG[size].req,
      skipNames,
      size,
    );
    if (initialDeck.length !== size) continue;

    const finalDeck = adjustForRoleBalance(initialDeck, sortedApostles, size);
    const finalDeckWithBestPersona = applyBestPersonaForSynergy(finalDeck);
    const finalRoles = getRoleBalance(finalDeckWithBestPersona);
    const reqBalance = DECK_CONFIG[size].balance;
    if (
      finalRoles.tanker < reqBalance[ROLES.TANKER] ||
      finalRoles.supporter < reqBalance[ROLES.SUPPORTER]
    ) {
      continue;
    }

    const deckKey = finalDeckWithBestPersona
      .map((a) => a.id)
      .sort()
      .join(',');
    if (usedCombinations.has(deckKey)) continue;
    usedCombinations.add(deckKey);

    const baseScore = finalDeckWithBestPersona.reduce(
      (sum, a) => sum + getEffectiveBaseScore(a, size),
      0,
    );
    const synergyScore = getSynergyScore(finalDeckWithBestPersona);

    const healerSuggestions = hasHealer(finalDeck)
      ? undefined
      : suggestAvailableHealers(finalDeck, myApostles);

    results.push({
      deck: finalDeckWithBestPersona,
      deckSize: size,
      totalScore: baseScore + synergyScore,
      baseScore,
      synergyScore,
      synergies: analyzeSynergies(finalDeckWithBestPersona),
      roleBalance: finalRoles,
      hasHealer: hasHealer(finalDeckWithBestPersona),
      healerSuggestions: healerSuggestions,
    });
  }

  return results.sort((a, b) => b.totalScore - a.totalScore);
}

export function generateRecommendations(
  myApostles: Apostle[],
  options?: RecommendOptions,
): RecommendedDeck[] {
  const results: RecommendedDeck[] = [];

  // 9인
  if (!options?.deckSize || options.deckSize === 9) {
    const score9 = getSynergyScore9(options?.mode9);
    results.push(...buildDeck(myApostles, 9, 3, score9));
  }

  // 6인 (시너지 조합 우선)
  if (!options?.deckSize || options.deckSize === 6) {
    results.push(...buildSixPersonDeckWithPattern(myApostles));
    results.push(...buildDeck(myApostles, 6, 2, calculateSynergyScore));
  }

  // 최종 중복 제거 및 정렬
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
    .slice(0, 12);
}
