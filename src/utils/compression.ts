import LZString from 'lz-string';
import type { OwnedApostle } from '@/stores/myApostleStore';

// 원본 데이터 타입 (백업용)
interface OriginalData {
  ownedApostles: OwnedApostle[];
}

// 최적화된 데이터 타입 (저장용)
export interface OptimizedData {
  o: OptimizedApostle[]; // ownedApostles -> o
}

export interface OptimizedApostle {
  i: string; // id -> i
  a?: number; // asideLevel -> a (0이면 생략)
}

/**
 * 데이터를 최적화(단축 키 매핑 + 기본값 제거)합니다.
 */
export const optimizeData = (data: OriginalData): OptimizedData => {
  return {
    o: data.ownedApostles.map((apostle) => {
      const optimized: OptimizedApostle = { i: apostle.id };
      // Default Value Optimization: asideLevel이 0보다 클 때만 저장
      if (apostle.asideLevel > 0) {
        optimized.a = apostle.asideLevel;
      }
      return optimized;
    }),
  };
};

/**
 * 최적화된 데이터를 원본 형태로 복원합니다.
 */
export const restoreData = (data: OptimizedData): OriginalData => {
  if (!data || !Array.isArray(data.o)) return { ownedApostles: [] };

  return {
    ownedApostles: data.o.map((item) => ({
      id: item.i,
      asideLevel: item.a ?? 0, // 기본값 복원
    })),
  };
};

/**
 * 데이터를 LZString으로 압축합니다.
 * @param data 압축할 객체 또는 문자열
 * @returns 압축된 문자열
 */
export const compressData = (data: unknown): string => {
  try {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data ?? null);
    return LZString.compressToEncodedURIComponent(jsonString);
  } catch (error) {
    console.error('Data compression failed:', error);
    return '';
  }
};

/**
 * LZString으로 압축된 데이터를 복원합니다.
 * @param compressed 압축된 문자열
 * @returns 복원된 객체 (실패 시 null)
 */
export const decompressData = <T>(compressed: string): T | null => {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    if (!decompressed) return null;
    return JSON.parse(decompressed) as T;
  } catch (error) {
    console.error('Data decompression failed:', error);
    return null;
  }
};

/**
 * 데이터가 압축된 형식인지 확인합니다.
 */
export const isCompressed = (data: unknown): data is string => {
  return typeof data === 'string' && data.length > 0;
};
