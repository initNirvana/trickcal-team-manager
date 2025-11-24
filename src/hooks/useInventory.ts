import { useState, useCallback, useEffect } from 'react';
import type { PartySimulation } from '../types/party';
import {
  getOwnedApostles,
  updateOwnedApostles,
  saveParty,
  loadParty,
  getAllSavedParties,
  deleteParty,
  renameParty,
  duplicateParty,
  exportData,
  importData,
} from '../utils/inventoryUtils';

/**
 * 인벤토리 및 파티 저장소 관리 훅
 * Local Storage를 기반으로 사용자 데이터를 관리합니다
 */
export const useInventory = () => {
  const [savedParties, setSavedParties] = useState<PartySimulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 초기 로드
   */
  useEffect(() => {
    try {
      const parties = getAllSavedParties();
      setSavedParties(parties);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장된 파티를 불러올 수 없습니다');
      setIsLoading(false);
    }
  }, []);

  /**
   * 파티 저장
   */
  const save = useCallback((party: PartySimulation) => {
    try {
      saveParty(party);
      setSavedParties(getAllSavedParties());
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '파티 저장에 실패했습니다');
      return false;
    }
  }, []);

  /**
   * 파티 로드
   */
  const load = useCallback((partyId: string): PartySimulation | null => {
    try {
      return loadParty(partyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '파티 로드에 실패했습니다');
      return null;
    }
  }, []);

  /**
   * 파티 삭제
   */
  const remove = useCallback((partyId: string) => {
    try {
      deleteParty(partyId);
      setSavedParties(getAllSavedParties());
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '파티 삭제에 실패했습니다');
      return false;
    }
  }, []);

  /**
   * 파티 이름 변경
   */
  const rename = useCallback((partyId: string, newName: string): PartySimulation | null => {
    try {
      const renamed = renameParty(partyId, newName);
      if (renamed) {
        setSavedParties(getAllSavedParties());
      }
      return renamed;
    } catch (err) {
      setError(err instanceof Error ? err.message : '파티 이름 변경에 실패했습니다');
      return null;
    }
  }, []);

  /**
   * 파티 복제
   */
  const duplicate = useCallback((partyId: string): PartySimulation | null => {
    try {
      const duplicated = duplicateParty(partyId);
      if (duplicated) {
        setSavedParties(getAllSavedParties());
      }
      return duplicated;
    } catch (err) {
      setError(err instanceof Error ? err.message : '파티 복제에 실패했습니다');
      return null;
    }
  }, []);

  /**
   * 모든 저장된 파티 조회
   */
  const getAll = useCallback((): PartySimulation[] => {
    return savedParties;
  }, [savedParties]);

  /**
   * 파티 검색 (이름으로)
   */
  const search = useCallback((query: string): PartySimulation[] => {
    return savedParties.filter(party =>
      party.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [savedParties]);

  /**
   * 파티를 생성 날짜순으로 정렬
   */
  const sortByDate = useCallback((order: 'asc' | 'desc' = 'desc'): PartySimulation[] => {
    const sorted = [...savedParties].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }, [savedParties]);

  /**
   * 파티를 점수순으로 정렬
   */
  const sortByScore = useCallback((order: 'asc' | 'desc' = 'desc'): PartySimulation[] => {
    const sorted = [...savedParties].sort((a, b) => {
      const scoreA = a.analysis?.score.overall || 0;
      const scoreB = b.analysis?.score.overall || 0;
      return order === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    });
    return sorted;
  }, [savedParties]);

  /**
   * 데이터 내보내기 (JSON)
   */
  const exportToJson = useCallback((): string => {
    try {
      return exportData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '내보내기에 실패했습니다');
      return '';
    }
  }, []);

  /**
   * 데이터 가져오기 (JSON)
   */
  const importFromJson = useCallback((jsonString: string): boolean => {
    try {
      const success = importData(jsonString);
      if (success) {
        setSavedParties(getAllSavedParties());
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : '가져오기에 실패했습니다');
      return false;
    }
  }, []);

  /**
   * 최근 파티 조회
   */
  const getLatest = useCallback((limit: number = 5): PartySimulation[] => {
    return sortByDate('desc').slice(0, limit);
  }, [sortByDate]);

  /**
   * 최고 점수 파티 조회
   */
  const getTopScored = useCallback((limit: number = 5): PartySimulation[] => {
    return sortByScore('desc').slice(0, limit);
  }, [sortByScore]);

  /**
   * 통계 정보
   */
  const getStats = useCallback(() => {
    const stats = {
      totalParties: savedParties.length,
      averageScore: savedParties.length > 0
        ? Math.round(
            savedParties.reduce((sum, p) => sum + (p.analysis?.score.overall || 0), 0) /
            savedParties.length
          )
        : 0,
      averageDamageReduction: savedParties.length > 0
        ? Math.round(
            savedParties.reduce((sum, p) => sum + (p.analysis?.totalDamageReduction || 0), 0) /
            savedParties.length * 100
          ) / 100
        : 0,
      highestScore: savedParties.length > 0
        ? Math.max(...savedParties.map(p => p.analysis?.score.overall || 0))
        : 0,
      mostRecentParty: savedParties.length > 0
        ? savedParties[0]
        : null,
    };
    return stats;
  }, [savedParties]);

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 상태
    savedParties,
    isLoading,
    error,

    // 기본 CRUD
    save,
    load,
    remove,
    rename,
    duplicate,

    // 조회
    getAll,
    search,
    getLatest,
    getTopScored,

    // 정렬
    sortByDate,
    sortByScore,

    // 데이터 관리
    exportToJson,
    importFromJson,

    // 통계
    getStats,

    // 유틸
    clearError,
  };
};