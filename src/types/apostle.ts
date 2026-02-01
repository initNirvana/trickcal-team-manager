export type Personality = 'Jolly' | 'Mad' | 'Naive' | 'Gloomy' | 'Cool' | 'Resonance';
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
 * @property {Position | Position[]} position - 사도의 전투 위치 (전열, 중열, 후열).
 * @property {Position[]} [positionPriority] - 사도의 위치 우선순위 배열 (선택적).
 * @property {{front?: number; mid?: number; back?: number}} [positionScore] - 사도의 위치별 점수 (선택적).
 * @property {boolean} [mercenary] - 용병 여부 (선택적).
 * @property {Aside} aside - 사도의 어사이드 정보.
 * @property {number} baseScore - 사도의 기본 점수.
 * @property {{size6?: number; size9?: number}} [scoreBySize] - 사도의 덱 사이즈별 점수 (선택적).
 * @property {{score: number; aside: '선택' | '권장' | '필수' | null; reason?: string}} [pvp] - PvP 모드 관련 정보 (선택적).
 * @property {string} [reason] - 사도 선택 이유 또는 설명 (선택적).
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
  positionScore?: { front?: number; mid?: number; back?: number };
  mercenary?: boolean;
  aside: Aside;
  baseScore: number;
  scoreBySize?: { size6?: number; size9?: number };
  pvp?: {
    score: number;
    aside: '선택' | '권장' | '필수' | null;
    reason?: string;
  };
  reason?: string;
}

/**
 * Aside 인터페이스는 사도의 어사이드(Aside) 속성을 정의합니다.
 *
 * @property {boolean} hasAside - 어사이드 존재 여부.
 * @property {'선택' | '권장' | '필수' | '보류' | null} importance - 어사이드 중요도.
 * @property {number} score - 어사이드 점수. (0 ~ 15)
 */

interface Aside {
  hasAside: boolean;
  importance: '선택' | '권장' | '필수' | '보류' | null;
  score: number;
  reason?: string;
}
