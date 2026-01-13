import { Apostle, Personality, Position } from '@/types/apostle';

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
export function getPersonalityBackground(personality: Personality): string {
  switch (personality) {
    case 'Jolly':
      return 'bg-[rgb(235_218_86)]';
    case 'Mad':
      return 'bg-[rgb(235_129_127)]';
    case 'Naive':
      return 'bg-[rgb(133_215_117)]';
    case 'Gloomy':
      return 'bg-[rgb(159,131,231)]';
    case 'Cool':
      return 'bg-[rgb(98_219_243)]';
    default:
      return 'bg-[linear-gradient(to_bottom,rgba(255,255,255,.5)),conic-gradient(at_center,#66C17C,#83B9EB,#EB839A,#EBDB83,#C683EC,#66C17C)]';
  }
}

export const isUros = (apostle: Apostle): boolean => apostle.engName === 'Uros';

export const filterUniqueApostles = (apostles: Apostle[]): Apostle[] => {
  const seen = new Set<string>();
  const PREFERRED_UROS_ID = 'a107';
  return apostles.filter((apostle) => {
    if (apostle.engName === 'Uros') {
      if (apostle.id === PREFERRED_UROS_ID && !seen.has('Uros')) {
        seen.add('Uros');
        return true;
      }
      return false;
    }

    if (seen.has(apostle.engName)) {
      return false;
    }
    seen.add(apostle.engName);
    return true;
  });
};
