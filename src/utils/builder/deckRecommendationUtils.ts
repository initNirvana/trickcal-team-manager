import type { Apostle } from '@/types/apostle';
import { getPositions } from '@/types/apostle';
import { analyzeSynergies, Synergy } from '@/utils/synergyUtils';

export interface RecommendedDeck {
  deck: Apostle[];
  deckSize: 6 | 9;
  totalScore: number;
  baseScore: number;
  synergyScore: number;
  synergies: Synergy[];
  roleBalance: {
    tanker: number;
    attacker: number;
    supporter: number;
  };
}

function calculateSynergyScore(apostles: Apostle[]): number {
  const synergies = analyzeSynergies(apostles);

  const personalityCounts = synergies.reduce(
    (acc, s) => {
      if (s.totalCount > 0) {
        acc[s.personality] = s.totalCount;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log('사도 성격 분포:', personalityCounts);

  const counts = Object.values(personalityCounts).sort((a, b) => b - a);

  // 4/2 조합: 62점, 5명: 50점, 2/2/2: 36점, 6명: 10점
  if (counts.length >= 2 && counts[0] === 4 && counts[1] === 2) return 62;
  if (counts[0] === 5) return 50;
  if (counts.length >= 3 && counts[0] === 2 && counts[1] === 2 && counts[2] === 2) return 36;
  if (counts[0] === 6) return 10;
  return 0;
}

function checkRoleBalance(apostles: Apostle[], deckSize: 6 | 9): boolean {
  const roles = apostles.reduce(
    (acc, a) => {
      acc[a.role] = (acc[a.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log('역할 분포:', roles);

  const requirements = deckSize === 6 ? { tanker: 1, supporter: 1 } : { tanker: 1, supporter: 2 };

  return (
    (roles['Tanker'] || 0) >= requirements.tanker &&
    (roles['Supporter'] || 0) >= requirements.supporter
  );
}

function getRoleBalance(apostles: Apostle[]) {
  return apostles.reduce(
    (acc, a) => {
      if (a.role === 'Tanker') acc.tanker++;
      else if (a.role === 'Attacker') acc.attacker++;
      else if (a.role === 'Supporter') acc.supporter++;
      return acc;
    },
    { tanker: 0, attacker: 0, supporter: 0 },
  );
}

function selectApostlesGreedy(
  candidates: Apostle[],
  requirements: { front: number; mid: number; back: number },
  skipName: Set<string> = new Set<string>(),
): { front: Apostle[]; mid: Apostle[]; back: Apostle[] } {
  const sorted = [...candidates]
    .filter((a) => !skipName.has(a.engName))
    .sort((a, b) => (b.baseScore || 0) - (a.baseScore || 0));
  const placement = {
    front: [] as Apostle[],
    mid: [] as Apostle[],
    back: [] as Apostle[],
  };

  const placedName = new Set<string>();

  for (const apostle of sorted) {
    if (placedName.has(apostle.engName)) continue;

    const priorityList = apostle.positionPriority
      ? apostle.positionPriority
      : getPositions(apostle);

    for (const preferredPosition of priorityList) {
      if (
        placement[preferredPosition].length < requirements[preferredPosition] &&
        getPositions(apostle).includes(preferredPosition)
      ) {
        placement[preferredPosition].push(apostle);
        placedName.add(apostle.engName);
        break;
      }
    }

    const totalPlaced = placement.front.length + placement.mid.length + placement.back.length;
    const totalRequired = requirements.front + requirements.mid + requirements.back;
    if (totalPlaced >= totalRequired) break;
  }

  return placement;
}

function adjustForRoleBalance(
  placement: { front: Apostle[]; mid: Apostle[]; back: Apostle[] },
  candidates: Apostle[],
  deckSize: 6 | 9,
): Apostle[] {
  let deck = [...placement.front, ...placement.mid, ...placement.back];

  if (checkRoleBalance(deck, deckSize)) return deck;

  // 역할 부족 분석
  const roles = getRoleBalance(deck);
  const requirements = deckSize === 6 ? { tanker: 1, supporter: 1 } : { tanker: 2, supporter: 2 };

  const placedIds = new Set(deck.map((a) => a.id));

  // 탱커 부족 시 교체
  if (roles.tanker < requirements.tanker) {
    const availableTankers = candidates
      .filter((a) => a.role === 'Tanker' && !placedIds.has(a.id))
      .sort((a, b) => (b.baseScore || 0) - (a.baseScore || 0));

    const needed = requirements.tanker - roles.tanker;
    for (let i = 0; i < needed && i < availableTankers.length; i++) {
      // 가장 낮은 점수의 딜러 제거
      const attackerIndex = deck.findIndex((a) => a.role === 'Attacker');
      if (attackerIndex !== -1) {
        deck.splice(attackerIndex, 1);
        deck.push(availableTankers[i]);
      }
    }
  }

  // 서포터 부족 시 교체
  if (roles.supporter < requirements.supporter) {
    const availableSupporters = candidates
      .filter((a) => a.role === 'Supporter' && !placedIds.has(a.id))
      .sort((a, b) => (b.baseScore || 0) - (a.baseScore || 0));

    const needed = requirements.supporter - roles.supporter;
    for (let i = 0; i < needed && i < availableSupporters.length; i++) {
      const attackerIndex = deck.findIndex((a) => a.role === 'Attacker');
      if (attackerIndex !== -1) {
        deck.splice(attackerIndex, 1);
        deck.push(availableSupporters[i]);
      }
    }
  }

  return deck;
}

function buildSixDeck(myApostles: Apostle[], maxAttempts: number = 5): RecommendedDeck[] {
  if (myApostles.length < 6) return [];

  const results: RecommendedDeck[] = [];
  const usedCombinations = new Set<string>();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const skipName = new Set<string>();
    if (attempt > 0) {
      const previousTop = myApostles
        .sort((a, b) => (b.baseScore || 0) - (a.baseScore || 0))
        .slice(0, attempt);
      previousTop.forEach((a) => skipName.add(a.engName));
    }

    const placement = selectApostlesGreedy(myApostles, { front: 2, mid: 2, back: 2 }, skipName);

    if (!placement) continue;

    let deck = adjustForRoleBalance(placement, myApostles, 6);

    if (deck.length !== 6 || !checkRoleBalance(deck, 6)) continue;

    const deckKey = deck
      .map((a) => a.id)
      .sort()
      .join(',');
    if (usedCombinations.has(deckKey)) continue;
    usedCombinations.add(deckKey);

    const baseScore = deck.reduce((sum, a) => sum + (a.baseScore || 0), 0);
    const synergies = analyzeSynergies(deck);
    const synergyScore = calculateSynergyScore(deck);

    results.push({
      deck,
      deckSize: 6,
      totalScore: baseScore + synergyScore,
      baseScore,
      synergyScore,
      synergies,
      roleBalance: getRoleBalance(deck),
    });

    console.log(
      `6인 조합 #${attempt + 1}:`,
      deck.map((a) => `${a.name}(${a.baseScore})`),
      'total:',
      baseScore + synergyScore,
    );
  }

  return results.sort((a, b) => b.totalScore - a.totalScore);
}

function buildNineDeck(myApostles: Apostle[], maxAttempts: number = 5): RecommendedDeck[] {
  if (myApostles.length < 9) return [];

  const results: RecommendedDeck[] = [];
  const usedCombinations = new Set<string>();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const skipIds = new Set<string>();
    if (attempt > 0) {
      const previousTop = myApostles
        .sort((a, b) => (b.baseScore || 0) - (a.baseScore || 0))
        .slice(0, attempt);
      previousTop.forEach((a) => skipIds.add(a.id));
    }

    const placement = selectApostlesGreedy(myApostles, { front: 3, mid: 3, back: 3 }, skipIds);

    if (!placement) continue;

    let deck = adjustForRoleBalance(placement, myApostles, 9);

    if (deck.length !== 9 || !checkRoleBalance(deck, 9)) continue;

    const deckKey = deck
      .map((a) => a.id)
      .sort()
      .join(',');
    if (usedCombinations.has(deckKey)) continue;
    usedCombinations.add(deckKey);

    const baseScore = deck.reduce((sum, a) => sum + (a.baseScore || 0), 0);
    const synergies = analyzeSynergies(deck);
    const synergyScore = calculateSynergyScore(deck);

    results.push({
      deck,
      deckSize: 9,
      totalScore: baseScore + synergyScore,
      baseScore,
      synergyScore,
      synergies,
      roleBalance: getRoleBalance(deck),
    });

    console.log(
      `9인 조합 #${attempt + 1}:`,
      deck.map((a) => `${a.name}(${a.baseScore})`),
      'total:',
      baseScore + synergyScore,
    );
  }

  return results.sort((a, b) => b.totalScore - a.totalScore);
}

export function generateRecommendations(myApostles: Apostle[]): RecommendedDeck[] {
  const results: RecommendedDeck[] = [];

  // console.table(myApostles, ['name', 'baseScore', 'position', 'role', 'rank', 'persona']);

  const nineDeck = buildNineDeck(myApostles, 3);
  if (nineDeck) results.push(...nineDeck);

  const sixDeck = buildSixDeck(myApostles, 3);
  if (sixDeck) results.push(...sixDeck);

  return results.sort((a, b) => b.totalScore - a.totalScore);
}
