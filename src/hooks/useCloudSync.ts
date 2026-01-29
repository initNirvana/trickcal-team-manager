import { useEffect, useCallback, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { useMyApostleStore } from '@/stores/myApostleStore';
import type { OwnedApostle } from '@/stores/myApostleStore';
import toast from 'react-hot-toast';
import isEqual from 'lodash/isEqual';

export interface BackupData {
  ownedApostles: OwnedApostle[];
}

export interface Backup {
  id: string;
  created_at: string;
  data: BackupData;
}

export const useCloudSync = (
  { enableAutoSave }: { enableAutoSave: boolean } = { enableAutoSave: true },
) => {
  const { user } = useAuthStore();
  const { ownedApostles, setOwnedApostles } = useMyApostleStore();

  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);

  // 백업 목록 불러오기
  const fetchBackups = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_owned_apostle')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBackups(data || []);
      if (data && data.length > 0) {
        setLastSyncedTime(new Date(data[0].created_at).toLocaleString());
      } else {
        setLastSyncedTime(null);
      }
    } catch (error) {
      console.error('백업 로드 실패:', error);
    }
  }, [user]);

  // 자동 저장 로직 (10초마다 체크)
  useEffect(() => {
    if (!user) return;

    // 초기 백업 로드
    fetchBackups();

    if (!enableAutoSave) return;

    const interval = setInterval(async () => {
      if (!user) return;

      // 최신 백업과 현재 상태 비교
      const { data: latestBackup, error } = await supabase
        .from('user_owned_apostle')
        .select('data')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // 에러가 'Row not found'인 경우는 백업이 없는 것이므로 진행
      if (error && error.code !== 'PGRST116') {
        console.error('Sync check error:', error);
        return;
      }

      const normalizeData = (data: BackupData | null | undefined) => {
        if (!data?.ownedApostles) return { ownedApostles: [] };
        // ID 기준 정렬하여 순서 변경으로 인한 불필요한 저장 방지
        const sortedApostles = [...data.ownedApostles].sort((a: OwnedApostle, b: OwnedApostle) =>
          a.id.localeCompare(b.id),
        );
        // 객체 키 순서 정규화를 위해(일부 환경 대비) 새로운 객체 반환
        return {
          ownedApostles: sortedApostles.map((a: OwnedApostle) => ({
            id: a.id,
            asideLevel: a.asideLevel,
          })),
        };
      };

      const currentNormalized = normalizeData({ ownedApostles });
      const serverNormalized = normalizeData(latestBackup?.data);

      // lodash.isEqual로 깊은 비교 수행
      if (!isEqual(currentNormalized, serverNormalized)) {
        setIsSyncing(true);
        try {
          // 저장할 때는 정렬되지 않은 원본 데이터를 저장할지, 정렬된 데이터를 저장할지 고민
          // 여기서는 현재 상태 그대로(ownedApostles) 저장
          const { error: insertError } = await supabase
            .from('user_owned_apostle')
            .insert([{ user_id: user.id, data: { ownedApostles } }]); // Wrap in object to match structure

          if (insertError) throw insertError;

          await fetchBackups(); // 목록 갱신
          toast.success('저장되었습니다.', { id: 'auto-save' });
        } catch (err) {
          console.error('저장 실패:', err);
          toast.error('저장 실패');
        } finally {
          setIsSyncing(false);
        }
      }
    }, 10000); // 10초

    return () => clearInterval(interval);
  }, [user, ownedApostles, fetchBackups, enableAutoSave]);

  // 백업 복원
  const restoreBackup = async (backup: Backup) => {
    try {
      // 데이터 유효성 체크
      if (backup.data && Array.isArray(backup.data.ownedApostles)) {
        setOwnedApostles(backup.data.ownedApostles);
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
