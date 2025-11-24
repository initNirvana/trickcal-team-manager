import type { Position, Personality } from '../types/apostle';

/**
 * 슬롯 번호에 맞는 포지션 검증
 * 1,4,7 = 후열, 2,5,8 = 중열, 3,6,9 = 전열
 */
export function getRequiredPositionForSlot(slotNumber: number): Position {
  const slot = ((slotNumber - 1) % 3) + 1;
  
  switch (slot) {
    case 1: return 'backLine';   // 1,4,7 = 후열
    case 2: return 'midLine';    // 2,5,8 = 중열
    case 3: return 'frontLine';  // 3,6,9 = 전열
    default: return 'midLine';
  }
}

/**
 * 사도가 해당 슬롯에 배치 가능한지 검증
 */
export function isSlotValid(slotNumber: number, apostlePosition: Position): boolean {
  const requiredPosition = getRequiredPositionForSlot(slotNumber);
  return apostlePosition === requiredPosition;
}

/**
 * 슬롯 번호로 줄 번호 구하기 (1-3 = 1줄, 4-6 = 2줄, 7-9 = 3줄)
 */
export function getRowFromSlot(slotNumber: number): number {
  return Math.ceil(slotNumber / 3);
}

/**
 * 슬롯 번호로 열 번호 구하기 (1,4,7 = 1열, 2,5,8 = 2열, 3,6,9 = 3열)
 */
export function getColumnFromSlot(slotNumber: number): number {
  return ((slotNumber - 1) % 3) + 1;
}
