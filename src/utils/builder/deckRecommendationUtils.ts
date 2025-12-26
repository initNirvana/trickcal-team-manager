import type { Apostle } from '@/types/apostle';
import { getPositions } from '@/types/apostle';
import { analyzeSynergies, Synergy } from '@/utils/synergyUtils';

type DeckSize = 6 | 9;

const ROLES = {
  TANKER: 'Tanker',
  ATTACKER: 'Attacker',
  SUPPORTER: 'Supporter',
} as const;

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
  TYPE_2_2_2: 36,
  TYPE_4_2: 62,
  TYPE_5: 5,
  TYPE_6: 10,
} as const;

export interface RecommendedDeck {
  deck: Apostle[];
  deckSize: DeckSize;
  totalScore: number;
  baseScore: number;
  synergyScore: number;
  synergies: Synergy[];
  roleBalance: { tanker: number; attacker: number; supporter: number };
}

function calculateSynergyScore(apostles: Apostle[]): number {
  const synergies = analyzeSynergies(apostles);

  const countMap = synergies.reduce((acc: Record<string, number>, s) => {
    if (s.totalCount > 0) acc[s.personality] = s.totalCount;
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

function getRoleBalance(apostles: Apostle[]) {
  return apostles.reduce(
    (acc, a) => {
      if (a.role === ROLES.TANKER) acc.tanker++;
      else if (a.role === ROLES.ATTACKER) acc.attacker++;
      else if (a.role === ROLES.SUPPORTER) acc.supporter++;
      return acc;
    },
    { tanker: 0, attacker: 0, supporter: 0 },
  );
}

function selectApostlesGreedy(
  sortedCandidates: Apostle[],
  requirements: { front: number; mid: number; back: number },
  skipNames: Set<string>,
): Apostle[] {
  const placement: Record<string, Apostle[]> = { front: [], mid: [], back: [] };
  const placedNames = new Set<string>();

  for (const apostle of sortedCandidates) {
    if (skipNames.has(apostle.engName) || placedNames.has(apostle.engName)) continue;

    const priorityList = apostle.positionPriority || getPositions(apostle);
    const validPositions = getPositions(apostle); // 포지션 유효성 체크용

    for (const pos of priorityList) {
      if (
        placement[pos].length < requirements[pos as keyof typeof requirements] &&
        validPositions.includes(pos)
      ) {
        placement[pos].push(apostle);
        placedNames.add(apostle.engName);
        break;
      }
    }

    const currentTotal = Object.values(placement).reduce((sum, list) => sum + list.length, 0);
    const targetTotal = requirements.front + requirements.mid + requirements.back;
    if (currentTotal >= targetTotal) break;
  }

  return [...placement.front, ...placement.mid, ...placement.back];
}

function adjustForRoleBalance(
  currentDeck: Apostle[],
  candidates: Apostle[],
  deckSize: DeckSize,
): Apostle[] {
  const config = DECK_CONFIG[deckSize];
  const roles = getRoleBalance(currentDeck);
  const placedNames = new Set(currentDeck.map((a) => a.engName));

  const trySwap = (targetRole: string, needed: number) => {
    const availableCandidates = candidates
      .filter((a) => a.role === targetRole && !placedNames.has(a.engName))
      .sort((a, b) => (b.baseScore || 0) - (a.baseScore || 0));

    let swappedCount = 0;

    for (const candidate of availableCandidates) {
      if (swappedCount >= needed) break;

      const candidatePositions = getPositions(candidate);

      const swapTargetIndex = currentDeck.findIndex(
        (a) =>
          a.role === ROLES.ATTACKER &&
          getPositions(a).some((pos) => candidatePositions.includes(pos)),
      );

      if (swapTargetIndex !== -1) {
        currentDeck[swapTargetIndex] = candidate;
        placedNames.add(candidate.engName);
        swappedCount++;
      }
    }
  };

  if (roles.tanker < config.balance[ROLES.TANKER]) {
    trySwap(ROLES.TANKER, config.balance[ROLES.TANKER] - roles.tanker);
  }

  if (roles.supporter < config.balance[ROLES.SUPPORTER]) {
    trySwap(ROLES.SUPPORTER, config.balance[ROLES.SUPPORTER] - roles.supporter);
  }

  return currentDeck;
}

function buildDeck(myApostles: Apostle[], size: DeckSize, maxAttempts: number): RecommendedDeck[] {
  if (!myApostles || myApostles.length === 0) return [];

  if (myApostles.length < size) return [];

  const results: RecommendedDeck[] = [];
  const usedCombinations = new Set<string>();

  const sortedApostles = [...myApostles].sort((a, b) => (b.baseScore || 0) - (a.baseScore || 0));

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const skipNames = new Set<string>();

    if (attempt > 0) {
      sortedApostles.slice(0, attempt).forEach((a) => skipNames.add(a.engName));
    }

    const initialDeck = selectApostlesGreedy(sortedApostles, DECK_CONFIG[size].req, skipNames);
    if (initialDeck.length !== size) continue;

    const finalDeck = adjustForRoleBalance(initialDeck, sortedApostles, size);

    const finalRoles = getRoleBalance(finalDeck);
    const reqBalance = DECK_CONFIG[size].balance;
    if (
      finalRoles.tanker < reqBalance[ROLES.TANKER] ||
      finalRoles.supporter < reqBalance[ROLES.SUPPORTER]
    ) {
      continue;
    }

    const deckKey = finalDeck
      .map((a) => a.id)
      .sort()
      .join(',');
    if (usedCombinations.has(deckKey)) continue;
    usedCombinations.add(deckKey);

    const baseScore = finalDeck.reduce((sum, a) => sum + (a.baseScore || 0), 0);
    const synergyScore = calculateSynergyScore(finalDeck);

    results.push({
      deck: finalDeck,
      deckSize: size,
      totalScore: baseScore + synergyScore,
      baseScore,
      synergyScore,
      synergies: analyzeSynergies(finalDeck),
      roleBalance: finalRoles,
    });
  }

  return results.sort((a, b) => b.totalScore - a.totalScore);
}

export function generateRecommendations(myApostles: Apostle[]): RecommendedDeck[] {
  const results: RecommendedDeck[] = [];

  results.push(...buildDeck(myApostles, 9, 3));
  results.push(...buildDeck(myApostles, 6, 3));

  return results.sort((a, b) => b.totalScore - a.totalScore);
}
