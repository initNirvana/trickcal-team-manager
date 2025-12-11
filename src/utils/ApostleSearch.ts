import { getChoseong } from 'es-hangul';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Apostle } from '../types/apostle';

interface UseApostleSearchProps {
  apostles: Apostle[];
  maxHistorySize?: number;
}

interface UseApostleSearchReturn {
  search: string;
  setSearch: (value: string) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  searchList: Apostle[];
  history: string[];
  addHistory: (name: string) => void;
  deleteHistory: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * 사도 이름 검색을 위한 커스텀 훅
 * - 전체 이름 검색
 * - 초성 검색 (한글)
 * - 최근 검색 히스토리 관리 (localStorage 사용)
 */
export const useApostleSearch = ({
  apostles,
  maxHistorySize = 10,
}: UseApostleSearchProps): UseApostleSearchReturn => {
  const [search, setSearch] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null!);

  const STORAGE_KEY = 'apostle.searchHistory';

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

  // localStorage에서 히스토리 로드
  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      console.warn('Failed to load search history');
      return [];
    }
  }, []);

  // 히스토리 저장
  const saveHistory = useCallback((newHistory: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch {
      console.warn('Failed to save search history');
    }
  }, []);

  // 히스토리에 검색어 추가
  const addHistory = useCallback(
    (name: string) => {
      if (!name.trim()) return;

      const currentHistory = loadHistory();
      let updated = currentHistory.filter((item: string) => item !== name);
      updated = [name, ...updated];

      if (updated.length > maxHistorySize) {
        updated = updated.slice(0, maxHistorySize);
      }

      saveHistory(updated);
    },
    [loadHistory, saveHistory, maxHistorySize],
  );

  // 히스토리에서 검색어 삭제
  const deleteHistory = useCallback(
    (index: number) => {
      const currentHistory = loadHistory();
      currentHistory.splice(index, 1);
      saveHistory(currentHistory);
    },
    [loadHistory, saveHistory],
  );

  // 초기 히스토리 로드
  useEffect(() => {
    setHistory(loadHistory());
  }, [loadHistory]);

  // 외부 클릭 시 검색 창 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    search,
    setSearch,
    open,
    setOpen,
    searchList,
    history,
    addHistory,
    deleteHistory,
    containerRef,
  };
};
