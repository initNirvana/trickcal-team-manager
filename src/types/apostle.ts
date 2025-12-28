export type Personality = 'Jolly' | 'Mad' | 'Naive' | 'Gloomy' | 'Cool';
export type Position = 'front' | 'mid' | 'back';
export type Method = 'Physical' | 'Magical';
export type Race = '용족' | '정령' | '수인' | '유령' | '마녀' | '요정' | '엘프';
export type Role =
  | { main: 'Tanker'; subRole: TankerSubRole; trait: Trait[] }
  | { main: 'Attacker'; subRole: AttackerSubRole; trait: Trait[] }
  | { main: 'Supporter'; subRole: SupporterSubRole; trait: Trait[] };
export type AttackerSubRole = 'Melee' | 'Ranged' | 'Assassin' | 'Nuker' | 'Utility';
export type TankerSubRole = 'Main' | 'Sub' | 'Evasion';
export type SupporterSubRole = 'Pure' | 'Buffer' | 'CC' | 'Utility' | 'Attacker';
export type Trait = 'Damage' | 'Defense' | 'CC' | 'Heal' | 'Shield' | 'Buff' | 'Debuff';

const SLOT_POSITIONS = {
  1: 'back',
  2: 'mid',
  3: 'front',
  4: 'back',
  5: 'mid',
  6: 'front',
  7: 'back',
  8: 'mid',
  9: 'front',
} as const;

/**
 * 포지션 설정 (아이콘 및 레이블)
 */
export const POSITION_CONFIG = {
  front: { icon: 'Common_PositionFront', label: '전열' },
  mid: { icon: 'Common_PositionMiddle', label: '중열' },
  back: { icon: 'Common_PositionBack', label: '후열' },
  free: { icon: 'Common_PositionFree', label: '자유' },
} as const;

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
  scoreBySize?: { size6?: number; size9?: number };
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

/**
 * 사도의 성격 유형을 한국어로 변환합니다.
 * @param personality: Personality 성격 유형
 * @returns {string} 한국어 성격 이름
 */
export const getPersonalityKoreanName = (personality: Personality): string => {
  const personalityMap: Record<Personality, string> = {
    Jolly: '활발',
    Mad: '광기',
    Naive: '순수',
    Gloomy: '우울',
    Cool: '냉정',
  };
  if (!(personality in personalityMap)) {
    throw new Error(`Unknown personality: ${personality}`);
  }
  return personalityMap[personality];
};

/**
 * 사도의 위치를 반환합니다.
 * @param apostle: Apostle 사도 객체
 * @returns {Position[]} 전투 위치 배열
 */
export function getPositions(apostle: Apostle): Position[] {
  if (!apostle || !apostle.position) {
    throw new Error('Invalid apostle or position data');
  }

  const normalizePos = (pos: string): Position => {
    if (['front', 'mid', 'back'].includes(pos)) {
      return pos as Position;
    }
    throw new Error(`Invalid position: ${pos}`);
  };

  if (Array.isArray(apostle.position)) {
    return apostle.position.map(normalizePos);
  }
  return [normalizePos(apostle.position)];
}

/** * 사도의 위치를 한국어로 반환합니다.
 * @param apostle: Apostle 사도 객체
 * @returns {string[]} 한국어 전투 위치 배열
 */
export function getPositionsKorean(apostle: Apostle): string[] {
  const positionMap: Record<Position, string> = {
    front: '전열',
    mid: '중열',
    back: '후열',
  };
  return getPositions(apostle).map((pos) => positionMap[pos]);
}

/**
 * 사도가 특정 슬롯에 배치될 수 있는지 확인합니다.
 * @param apostle: Apostle 사도 객체
 * @param slotNumber: number 슬롯 번호
 * @returns {boolean} 배치 가능 여부
 */
export function isValidPosition(apostle: Apostle, slotNumber: number): boolean {
  const slotPosition = getSlotPosition(slotNumber);
  const positions = getPositions(apostle);
  return positions.includes(slotPosition);
}

/**
 * 슬롯 번호에 해당하는 열 위치를 반환합니다.
 * @param slotNumber: number 슬롯 번호
 * @returns {Position} 전투 위치
 */
function getSlotPosition(slotNumber: number): Position {
  if (slotNumber < 1 || slotNumber > 9) {
    throw new Error(`Invalid slot number: ${slotNumber}. Must be 1-9.`);
  }
  return SLOT_POSITIONS[slotNumber as keyof typeof SLOT_POSITIONS];
}

/**
 * 성격에 따른 배경색 클래스를 반환합니다.
 * @param personality: Personality 성격 유형
 * @returns {string} 배경색 tailwind 클래스
 */
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
      return 'bg-slate-100';
  }
}
