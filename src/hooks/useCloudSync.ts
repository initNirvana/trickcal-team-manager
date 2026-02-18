import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { OwnedApostle } from '@/stores/myApostleStore';
import { useMyApostleStore } from '@/stores/myApostleStore';
import {
  compressData,
  decompressData,
  type OptimizedData,
  optimizeData,
  restoreData,
} from '@/utils/compression';

/** 자동 저장 대기 시간 (3초) */
const AUTO_SAVE_DELAY = 3000;

export interface BackupData {
  ownedApostles?: OwnedApostle[];
  c?: string; // Compressed data
}

export interface Backup {
  id: string;
  created_at: string;
  data: BackupData;
}

/**
 * 백업 데이터에서 실제 데이터를 추출합니다 (압축 해제 포함).
 */
const getRealData = (data: BackupData | null | undefined): BackupData => {
  if (!data) return { ownedApostles: [] };
  if (data.c) {
    // 1. 압축 해제
    const decompressed = decompressData<unknown>(data.c);

    // 2. 최적화된 데이터인지 확인 ('o' 프로퍼티가 있는지)
    if (decompressed && typeof decompressed === 'object' && 'o' in decompressed) {
      return restoreData(decompressed as OptimizedData);
    }

    // 3. 기존 압축 데이터 (단순 JSON 압축)
    return (decompressed as BackupData) || { ownedApostles: [] };
  }
  return data;
};

/**
 * 데이터를 비교하기 좋게 정렬하고 불필요한 필드를 제거하여 정규화합니다.
 * @param data 백업 데이터 객체
 * @returns 정규화된 데이터 객체
 */
const normalizeData = (data: BackupData | null | undefined) => {
  const realData = getRealData(data);
  const apostles = realData.ownedApostles || [];

  const sortedApostles = [...apostles].sort((a: OwnedApostle, b: OwnedApostle) =>
    a.id.localeCompare(b.id),
  );

  return {
    ownedApostles: sortedApostles.map((a: OwnedApostle) => ({
      id: a.id,
      asideLevel: a.asideLevel,
    })),
  };
};

/**
 * 클라우드 동기화 및 자동 저장을 관리하는 커스텀 훅입니다.
 * - 사용자 백업 목록 조회 및 복원
 * - 데이터 변경 감지 시 Debounce를 적용한 자동 저장
 * - 중복 저장 방지 및 초기 로드 시 자동 복원 기능 포함
 * @param options.enableAutoSave 자동 저장 활성화 여부
 */
export const useCloudSync = (
  { enableAutoSave }: { enableAutoSave: boolean } = { enableAutoSave: true },
) => {
  const { user } = useAuthStore();
  const { ownedApostles, setOwnedApostles } = useMyApostleStore();

  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);

  // 초기 로드 완료 여부 (Race Condition 방지용)
  const [isInitialized, setIsInitialized] = useState(false);

  // 마지막으로 저장에 성공한 데이터를 추적 (불필요한 중복 저장 방지)
  const lastSavedRef = useRef<{ ownedApostles: { id: string; asideLevel: number }[] } | null>(null);

  /**
   * Supabase에서 사용자의 백업 목록을 가져오고 초기 상태를 설정합니다.
   * - 백업 목록 업데이트
   * - 마지막 동기화 시간 표시
   * - (최초 실행 시) 로컬 데이터가 비어있을 경우 자동 복원 수행
   */
  const fetchBackups = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_owned_apostle')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const backupList = data || [];
      setBackups(backupList);

      if (backupList.length > 0) {
        const latestBackup = backupList[0];
        const latestData = latestBackup.data;

        setLastSyncedTime(new Date(latestBackup.created_at).toLocaleString());

        const normalizedLatest = normalizeData(latestData);

        // 1. 초기 기준점 설정 (비교용)
        if (!lastSavedRef.current) {
          lastSavedRef.current = normalizedLatest;
        }

        // 2. 자동 복원 로직: 로컬 데이터가 비어있다면 최신 백업 자동 적용
        const currentOwned = useMyApostleStore.getState().ownedApostles;
        if (currentOwned.length === 0 && normalizedLatest.ownedApostles.length > 0) {
          setOwnedApostles(normalizedLatest.ownedApostles);

          // 복원된 데이터가 즉시 다시 저장되는 것을 방지하기 위해 기준점 업데이트
          lastSavedRef.current = normalizedLatest;
          toast.success('데이터를 불러왔습니다.', { id: 'auto-restore' });
        }
      } else {
        setLastSyncedTime(null);
      }
    } catch (error) {
      console.error('백업 로드 실패:', error);
    } finally {
      setIsInitialized(true);
    }
  }, [user, setOwnedApostles]);

  // 컴포넌트 마운트 시 초기 백업 목록 로드
  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  // 실제 데이터를 Supabase에 저장하는 비동기 함수
  const performSave = useCallback(
    async (currentNormalized: { ownedApostles: { id: string; asideLevel: number }[] }) => {
      if (!user) return;

      setIsSyncing(true);
      try {
        // 1. 데이터 최적화 (Short Key + Default Value Removal)
        const optimized = optimizeData({ ownedApostles });

        // 2. 압축 저장
        const compressed = compressData(optimized);
        const { error: insertError } = await supabase
          .from('user_owned_apostle')
          .insert([{ user_id: user.id, data: { c: compressed } }]);

        if (insertError) throw insertError;

        lastSavedRef.current = currentNormalized;
        await fetchBackups();
        toast.success('자동 저장되었습니다.', { id: 'auto-save' });
      } catch (err) {
        console.error('자동 저장 실패:', err);
        toast.error('자동 저장 실패');
      } finally {
        setIsSyncing(false);
      }
    },
    [user, ownedApostles, fetchBackups],
  );

  //데이터 변경 감지 및 자동 저장 트리거
  useEffect(() => {
    // 초기화 전이거나, 유저가 없거나, 자동저장 꺼짐, 데이터 없음이면 스킵
    if (!isInitialized || !user || !enableAutoSave || ownedApostles.length === 0) return;

    const currentNormalized = normalizeData({ ownedApostles });

    // 이전 저장 상태와 내용이 같다면 아무 작업도 하지 않음
    if (isEqual(currentNormalized, lastSavedRef.current)) return;

    // 지정된 시간(AUTO_SAVE_DELAY) 동안 데이터 변경이 없으면 저장을 수행
    const timer = setTimeout(() => performSave(currentNormalized), AUTO_SAVE_DELAY);

    return () => clearTimeout(timer);
  }, [user, ownedApostles, enableAutoSave, isInitialized, performSave]);

  //선택한 백업 데이터로 현재 상태를 복원
  const restoreBackup = async (backup: Backup) => {
    try {
      const realData = getRealData(backup.data);
      if (realData && Array.isArray(realData.ownedApostles)) {
        setOwnedApostles(realData.ownedApostles);

        // 복원 직후 자동 저장이 다시 발생하는 것을 방지하기 위해 참조를 동기화
        lastSavedRef.current = normalizeData(backup.data);

        toast.success('데이터가 복원되었습니다.');
      } else {
        throw new Error('유효하지 않은 데이터 형식입니다.');
      }
    } catch (error) {
      console.error('복원 실패:', error);
      toast.error('복원 실패: 데이터 형식이 올바르지 않습니다.');
    }
  };

  return {
    backups,
    restoreBackup,
    lastSyncedTime,
    isSyncing,
    refreshBackups: fetchBackups,
  };
};
