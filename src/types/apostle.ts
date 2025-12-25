export type Personality = 'Jolly' | 'Mad' | 'Naive' | 'Gloomy' | 'Cool';
export type Position = 'front' | 'mid' | 'back';
export type Role = 'Attacker' | 'Tanker' | 'Supporter';
export type Method = 'Physical' | 'Magical';
export type Race = '용족' | '정령' | '수인' | '유령' | '마녀' | '요정' | '엘프';

/**
 * Apostle 인터페이스는 게임 내 캐릭터인 사도(Apostle)의 속성을 정의합니다.
 *
 * @property {string} id - 사도의 고유 식별자.
 * @property {string} name - 사도의 한국어 이름.
 * @property {string} engName - 사도의 영어 이름.
 * @property {boolean} isEldain - 사도가 엘다인 종족 여부.
 * @property {1 | 2 | 3} rank - 사도의 등급 (1, 2, 3).
 * @property {Race} race - 사도의 종족.
 * @property {Personality} persona - 사도의 성격 유형.
 * @property {Role} role - 사도의 역할 (딜러, 탱커, 서포터).
 * @property {Method} method - 사도의 공격 방식 (물리, 마법).
 * @property {Position | Position[]} position - 사도의 전투 위치 (앞열, 중열, 뒷열).
 * @property {Position[]} [positionPriority] - 사도의 위치 우선순위 배열 (선택적).
 * @property {boolean} [mercenary] - 용병 여부 (선택적).
 * @property {Aside} aside - 사도의 어사이드 정보.
 * @property {number} baseScore - 사도의 기본 점수.
 */

export interface Apostle {
  id: string;
  name: string;
  engName: string;
  isEldain: boolean;
  hasAside: boolean;
  rank: 1 | 2 | 3;
  race: Race;
  persona: Personality;
  role: Role;
  method: Method;
  position: Position | Position[];
  positionPriority?: Position[];
  mercenary?: boolean;
  aside: Aside;
  baseScore: number;
}

/**
 * Aside 인터페이스는 사도의 어사이드(Aside) 속성을 정의합니다.
 *
 * @property {boolean} hasAside - 어사이드 존재 여부.
 * @property {'선택' | '권장' | '필수' | null} importance - 어사이드 중요도.
 * @property {0 | 1 | 2 | 3} level - 어사이드 레벨.
 * @property {number} score - 어사이드 점수. (0 ~ 15)
 */

interface Aside {
  hasAside: boolean;
  importance: '선택' | '권장' | '필수' | null;
  level: 0 | 1 | 2 | 3;
  score: number;
}

export const getPersonalityKoreanName = (personality: Personality): string => {
  const personalityMap: Record<Personality, string> = {
    Mad: '광기',
    Gloomy: '우울',
    Naive: '순수',
    Jolly: '활발',
    Cool: '냉정',
  };
  return personalityMap[personality] || personality;
};

export function getPositions(apostle: Apostle): Position[] {
  const normalizePos = (pos: string): Position => {
    if (pos === 'front') return 'front';
    if (pos === 'mid') return 'mid';
    if (pos === 'back') return 'back';
    return 'front';
  };

  if (Array.isArray(apostle.position)) {
    return apostle.position.map(normalizePos);
  }
  return [normalizePos(apostle.position)];
}

export function getPositionsKorean(apostle: Apostle): string[] {
  const positionMap: Record<Position, string> = {
    front: '전열',
    mid: '중열',
    back: '후열',
  };
  return getPositions(apostle).map((pos) => positionMap[pos]);
}

export function isValidPosition(apostle: Apostle, slotNumber: number): boolean {
  const slotPosition = getSlotPosition(slotNumber);
  const positions = getPositions(apostle);
  return positions.includes(slotPosition);
}

function getSlotPosition(slotNumber: number): Position {
  if ([1, 4, 7].includes(slotNumber)) return 'back';
  if ([2, 5, 8].includes(slotNumber)) return 'mid';
  return 'front';
}

export function getPersonalityBackgroundClass(personality: Personality): string {
  switch (personality) {
    case 'Jolly':
      return 'bg-yellow-300';
    case 'Mad':
      return 'bg-red-500';
    case 'Naive':
      return 'bg-lime-500';
    case 'Gloomy':
      return 'bg-purple-500';
    case 'Cool':
      return 'bg-cyan-300';
    default:
      return 'bg-slate-100 ';
  }
}
