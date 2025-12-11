import { getChoseong } from 'es-hangul';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Apostle } from '../types/apostle';

interface UseApostleSearchProps {
  apostles: Apostle[];
}

interface UseApostleSearchReturn {
  search: string;
  setSearch: (value: string) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  searchList: Apostle[];
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * 사도 이름 검색을 위한 커스텀 훅
 * - 전체 이름 검색
 * - 초성 검색 (한글)
 */
export const useApostleSearch = ({ apostles }: UseApostleSearchProps): UseApostleSearchReturn => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null!);

  // 초성 맵 생성 (사도 이름 -> 초성)
  const initialMap = useMemo(() => {
    const map: Record<string, string> = {};
    apostles.forEach((apostle) => {
      const cleaned = apostle.name.replace(/\s+/g, '');
      map[apostle.name] = getChoseong(cleaned);
    });
    return map;
  }, [apostles]);

  // 검색 결과 리스트 계산
  const searchList = useMemo(() => {
    if (!search.trim()) return [];
    return apostles.filter((apostle) => {
      const cleanedName = apostle.name.replace(/\s+/g, '');
      const initials = initialMap[apostle.name] || '';
      return (
        cleanedName.toLowerCase().includes(search.toLowerCase()) || // 전체 이름 검색
        initials.includes(search) // 초성 검색
      );
    });
  }, [search, apostles, initialMap]);

  // 외부 클릭 시 검색 창 닫기
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  // 클릭 감지 리스너 등록
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return {
    search,
    setSearch,
    open,
    setOpen,
    searchList,
    containerRef,
  };
};
