import { useEffect } from 'react';
import { BiLoaderAlt } from 'react-icons/bi';
import { FaCheckCircle, FaCloudUploadAlt, FaExclamationCircle, FaHistory } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import { type BackupData, useCloudSync } from '@/hooks/useCloudSync';
import { useAuthStore } from '@/stores/authStore';
import { decompressData, type OptimizedData, restoreData } from '@/utils/compression';

function Settings() {
  const { user, loading, checkUser, signInWithGoogle, signOut } = useAuthStore();
  const { backups, restoreBackup, lastSyncedTime, isSyncing, refreshBackups } = useCloudSync({
    enableAutoSave: false,
  });

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-center text-2xl font-bold">설정</h1>

      {/* 1. 계정 설정 */}
      <div className="card bg-base-100 mb-6 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg">계정 연동</h2>

          <div className="mt-4 flex items-center justify-between">
            {loading ? (
              <div className="text-sm font-semibold text-gray-400">계정 확인 중...</div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <FcGoogle size={20} />
                <div>
                  <div className="font-bold">{user.email}</div>
                  <div className="text-success text-xs">연동됨</div>
                </div>
              </div>
            ) : (
              <div className="text-sm font-semibold text-gray-400">연동된 계정이 없습니다.</div>
            )}

            {user ? (
              <button onClick={signOut} className="btn btn-outline btn-sm">
                로그아웃
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="btn btn-neutral btn-sm flex items-center gap-2"
              >
                <FcGoogle size={20} />
                Google 계정으로 로그인
              </button>
            )}
          </div>
        </div>
      </div>

      {user && (
        <>
          {/* 2. 동기화 상태 */}
          <div className="card bg-base-100 mb-6 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title flex items-center gap-2 text-lg">
                  <FaCloudUploadAlt /> 클라우드 동기화
                </h2>
                {isSyncing ? (
                  <div className="flex items-center gap-2 text-sm text-blue-500">
                    <BiLoaderAlt className="animate-spin" /> 동기화 중...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-500">
                    <FaCheckCircle /> 최신 상태
                  </div>
                )}
              </div>

              <div className="mt-2 text-sm">
                <p>최근 동기화: {lastSyncedTime || '기록 없음'}</p>
                <p className="mt-1 text-xs opacity-60">
                  데이터 변경을 확인하여 자동으로 저장합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 3. 백업 기록 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="card-title flex items-center gap-2 text-lg">
                  <FaHistory /> 백업 기록 (최근 5개)
                </h2>
                <button onClick={refreshBackups} className="btn btn-ghost btn-xs">
                  새로고침
                </button>
              </div>

              {backups.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">
                  저장된 백업이 없습니다.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>저장 시간</th>
                        <th>보유 사도 수</th>
                        <th>작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup) => {
                        // 압축된 데이터 처리
                        let displayData: BackupData = backup.data;

                        if (backup.data.c) {
                          // 1. 압축 해제
                          const decompressed = decompressData<unknown>(backup.data.c);

                          if (decompressed && typeof decompressed === 'object') {
                            // 2. 최적화된 데이터(Short Key)인지 확인
                            if ('o' in decompressed) {
                              displayData = restoreData(decompressed as OptimizedData);
                            } else {
                              // 3. 레거시 압축 데이터
                              displayData = decompressed as BackupData;
                            }
                          }
                        }

                        const ownedCount = displayData.ownedApostles?.length;
                        const asideCount = displayData.ownedApostles?.filter(
                          (a) => a.asideLevel > 0,
                        ).length;

                        return (
                          <tr key={backup.id} className="hover">
                            <td>{new Date(backup.created_at).toLocaleString()}</td>
                            <td>
                              {typeof ownedCount === 'number' ? (
                                <div className="flex flex-col text-xs">
                                  <span>총 {ownedCount}명</span>
                                  <span className="text-base-content/60">
                                    (어사이드: {asideCount}명)
                                  </span>
                                </div>
                              ) : (
                                '알 수 없음'
                              )}
                            </td>
                            <td>
                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      '이 시점으로 데이터를 복원하시겠습니까?\n현재 데이터는 덮어씌워집니다.',
                                    )
                                  ) {
                                    await restoreBackup(backup);
                                  }
                                }}
                                className="btn btn-warning btn-xs"
                                disabled={isSyncing}
                              >
                                복원
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="alert alert-info mt-4 flex items-center text-xs">
                <FaExclamationCircle className="mr-2" />
                백업을 복원하면 현재 로컬 데이터가 덮어씌워집니다. 신중하게 진행해주세요.
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 text-center">
        <Link to="/privacy" className="text-base-content/50 text-xs hover:underline">
          개인정보 처리방침
        </Link>
      </div>
    </div>
  );
}

export default Settings;
