/**
 * Branded Types: 런타임 값은 같지만 타입 시스템에서 구분되는 타입
 * - 컴파일 타임 타입 체크 + 런타임 값 검증의 이중 보호
 */

/**
 * 덱 슬롯 번호 (1~9)
 * - 1-indexed 슬롯 위치를 나타냄
 */
export type SlotNumber = number & { readonly __brand: 'SlotNumber' };

/**
 * 스킬 레벨 (1~13)
 * - 스킬의 현재 레벨을 나타냄
 */
export type SkillLevel = number & { readonly __brand: 'SkillLevel' };

/**
 * 어사이드 랭크 (1~3)
 * - 어사이드의 성급(星級)을 나타냄
 */
export type AsideRank = number & { readonly __brand: 'AsideRank' };

/**
 * SlotNumber 생성 헬퍼
 * @param n - 1~9 범위의 숫자
 * @throws {Error} 범위를 벗어난 경우
 */
export function toSlotNumber(n: number): SlotNumber {
  if (!Number.isInteger(n) || n < 1 || n > 9) {
    throw new Error(`Invalid slot number: ${n}. Must be between 1 and 9`);
  }
  return n as SlotNumber;
}

/**
 * SlotNumber 안전 생성 (에러 없이 null 반환)
 */
export function trySlotNumber(n: number): SlotNumber | null {
  if (!Number.isInteger(n) || n < 1 || n > 9) {
    return null;
  }
  return n as SlotNumber;
}

/**
 * SkillLevel 생성 헬퍼
 * @param n - 1~13 범위의 숫자
 * @throws {Error} 범위를 벗어난 경우
 */
export function toSkillLevel(n: number): SkillLevel {
  if (!Number.isInteger(n) || n < 1 || n > 13) {
    throw new Error(`Invalid skill level: ${n}. Must be between 1 and 13`);
  }
  return n as SkillLevel;
}

/**
 * SkillLevel 안전 생성 (기본값 반환)
 */
export function trySkillLevel(n: unknown, fallback: SkillLevel = 1 as SkillLevel): SkillLevel {
  const num = typeof n === 'string' ? Number(n) : typeof n === 'number' ? n : NaN;
  if (!Number.isFinite(num) || num < 1 || num > 13) {
    return fallback;
  }
  return Math.floor(num) as SkillLevel;
}

/**
 * AsideRank 생성 헬퍼
 * @param n - 1~3 범위의 숫자
 * @throws {Error} 범위를 벗어난 경우
 */
export function toAsideRank(n: number): AsideRank {
  if (!Number.isInteger(n) || n < 1 || n > 3) {
    throw new Error(`Invalid aside rank: ${n}. Must be between 1 and 3`);
  }
  return n as AsideRank;
}

/**
 * AsideRank 안전 생성 (에러 없이 null 반환)
 */
export function tryAsideRank(n: number): AsideRank | null {
  if (!Number.isInteger(n) || n < 1 || n > 3) {
    return null;
  }
  return n as AsideRank;
}

/**
 * Branded Type을 일반 number로 변환 (필요시)
 */
export function unwrapNumber<T extends number & { readonly __brand: string }>(branded: T): number {
  return branded as number;
}
