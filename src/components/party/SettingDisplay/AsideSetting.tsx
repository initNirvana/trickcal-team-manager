import { Activity, useMemo } from 'react';
import { useDeckStore } from '@/stores/deckStore';
import type { Apostle } from '@/types/apostle';
import type { Aside } from '@/types/aside';
import { type AsideRank, toAsideRank } from '@/types/branded';
import { getApostleImagePath } from '@/utils/apostleImages';
import Image from '../../common/Image';

interface AsideSettingProps {
  filledDeck: Apostle[];
  asidesData?: Aside[];
}

interface AsideRankInfo {
  has2Star: boolean;
  has3Star: boolean;
}

/**
 * 어사이드 설정 컴포넌트
 * 각 사도별 어사이드 등급(2성, 3성) 선택 기능 제공
 */
const AsideSetting = ({ filledDeck, asidesData }: AsideSettingProps) => {
  const asideSelection = useDeckStore((state) => state.asideSelection);
  const setAsideSelection = useDeckStore((state) => state.setAsideSelection);

  /**
   * 특정 사도가 가진 어사이드 등급 확인
   */
  const getAvailableAsideRanks = useMemo(() => {
    return (apostleId: string): AsideRankInfo => {
      if (!Array.isArray(asidesData)) {
        return { has2Star: false, has3Star: false };
      }

      const apostleAsides = asidesData.filter((aside) => aside.apostleId === apostleId);

      const has2Star = apostleAsides.some((aside) => aside.level === 2);
      const has3Star = apostleAsides.some((aside) => aside.level === 3);

      return { has2Star, has3Star };
    };
  }, [asidesData]);

  /**
   * 어사이드 등급 선택 핸들러
   * 3성 선택 시 2성도 포함, 2성 선택 시 2성만 포함
   */
  const handleAsideRankSelect = (apostleId: string, rank: number) => {
    const currentRanks = asideSelection[apostleId] || [];

    if (rank === 3) {
      // 3성 클릭: 3성이 이미 있으면 3성만 제거 (2성 유지), 없으면 [2, 3] 추가
      if (currentRanks.includes(3 as AsideRank)) {
        setAsideSelection(
          apostleId,
          currentRanks.filter((r) => r !== (3 as AsideRank)),
        );
      } else {
        // 3성 선택 시 2성도 자동 포함
        const newRanks: AsideRank[] = [toAsideRank(2), toAsideRank(3)];
        setAsideSelection(apostleId, newRanks);
      }
    } else if (rank === 2) {
      // 2성 클릭: 2성이 있으면 모두 제거, 없으면 2성만 추가
      if (currentRanks.includes(2 as AsideRank)) {
        setAsideSelection(apostleId, []);
      } else {
        setAsideSelection(apostleId, [toAsideRank(2)]);
      }
    }
  };

  /**
   * 어사이드 해제 핸들러
   */
  const handleAsideReset = (apostleId: string) => {
    setAsideSelection(apostleId, []);
  };

  if (filledDeck.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          사도를 배치하면 어사이드 설정이 활성화됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        {/* 테이블 바디 */}
        <tbody>
          {filledDeck.map((apostle, index) => {
            const apostleKey = apostle.id || apostle.name;
            const selectedRanks = asideSelection[apostleKey] || [];
            const { has2Star, has3Star } = getAvailableAsideRanks(apostleKey);
            const hasNoAside = !has2Star && !has3Star;

            return (
              <tr
                key={index}
                className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-600"
              >
                {/* 사도 이미지 */}
                <td className="px-2 py-3">
                  <Image
                    src={getApostleImagePath(apostle)}
                    alt={apostle.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                </td>

                {/* 사도명 */}
                <td className="px-3 py-3 font-medium whitespace-nowrap">{apostle.name}</td>

                {/* 어사이드 등급 버튼 */}
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    {/* 3성 버튼 */}
                    <Activity mode={has3Star ? 'visible' : 'hidden'}>
                      <button
                        onClick={() => handleAsideRankSelect(apostleKey, 3)}
                        className={`rounded px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                          selectedRanks.includes(toAsideRank(3))
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                        }`}
                        title="3성 어사이드 (2성 포함)"
                      >
                        어사이드 3성
                      </button>
                    </Activity>

                    {/* 2성 버튼 */}
                    <Activity mode={has2Star ? 'visible' : 'hidden'}>
                      <button
                        onClick={() => handleAsideRankSelect(apostleKey, 2)}
                        className={`rounded px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                          selectedRanks.includes(toAsideRank(2))
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                        }`}
                        title="2성 어사이드"
                      >
                        어사이드 2성
                      </button>
                    </Activity>

                    {/* 해제 버튼 */}
                    <button
                      onClick={() => handleAsideReset(apostleKey)}
                      disabled={hasNoAside}
                      className={`rounded px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                        selectedRanks.length === 0
                          ? 'bg-red-500 text-white shadow-md'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                      } ${hasNoAside ? 'cursor-not-allowed opacity-50' : ''}`}
                      title={hasNoAside ? '어사이드가 없습니다' : '어사이드 해제'}
                    >
                      미해당
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AsideSetting;
