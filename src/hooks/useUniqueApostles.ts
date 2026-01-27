import { useMemo } from 'react';
import { Apostle } from '@/types/apostle';
import { filterUniqueApostles } from '@/utils/apostleUtils';

/**
 * 사도 리스트에서 중복(다중 성격 등)을 제거하고 유니크한 리스트를 반환하는 훅
 * engName을 기준으로 그룹화하며, 안정적인 대표 사도를 선택합니다.
 *
 * @param allApostles 전체 사도 리스트
 * @returns {Apostle[]} 유니크한 사도 리스트
 */
export const useUniqueApostles = (allApostles: Apostle[]): Apostle[] => {
  return useMemo(() => {
    return filterUniqueApostles(allApostles);
  }, [allApostles]);
};
