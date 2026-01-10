import { useMemo } from 'react';
import type { Apostle } from '@/types/apostle';
import { useMyApostleStore } from '@/stores/myApostleStore';
import MyApostleList from './Apostle/MyApostleList';
import PresetCombinationSection from './Preset/PresetCombinationSection';
import RecommendedDeckSection from './Recommendation/RecommendedDeckSection';
import { useTour } from '@/hooks/useTour';

interface DeckRecommenderProps {
  apostles: Apostle[];
}

export const DeckRecommender = ({ apostles }: DeckRecommenderProps) => {
  useTour();
  const { ownedApostleIds, toggleApostle, addApostles, removeApostles } = useMyApostleStore();

  const myApostles = useMemo(() => {
    return apostles.filter((a) => ownedApostleIds.includes(a.id));
  }, [apostles, ownedApostleIds]);

  const isUros = (apostle: Apostle) => apostle.engName === 'Uros';

  const handleAddApostle = (apostle: Apostle) => {
    if (ownedApostleIds.includes(apostle.id)) return;

    if (isUros(apostle)) {
      const existingUros = myApostles.find((a) => isUros(a));
      if (existingUros) {
        toggleApostle(existingUros.id);
        toggleApostle(apostle.id);
        return;
      }
    }

    toggleApostle(apostle.id);
  };

  const handleAddMultipleApostles = (newApostles: Apostle[]) => {
    const toAddIds: string[] = [];
    let hasUrosInCurrent = myApostles.some((a) => isUros(a));

    newApostles.forEach((apostle) => {
      if (ownedApostleIds.includes(apostle.id)) return;

      if (isUros(apostle)) {
        if (hasUrosInCurrent) return;
        hasUrosInCurrent = true;
      }

      toAddIds.push(apostle.id);
    });

    if (toAddIds.length > 0) {
      addApostles(toAddIds);
    }
  };

  const handleRemoveMultipleApostles = (apostlesToRemove: Apostle[]) => {
    const idsToRemove = apostlesToRemove.map((a) => a.id);
    removeApostles(idsToRemove);
  };

  const handleRemoveApostle = (apostle: Apostle) => {
    if (ownedApostleIds.includes(apostle.id)) {
      toggleApostle(apostle.id);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-4">
      {/* 헤더 */}
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold">보유 사도 분석기</h1>
        <p className="text-sm opacity-70">보유 사도를 선택하고 추천 조합을 확인하세요</p>
      </div>

      {/* 메인 콘텐츠 - 중앙 정렬 + 좌우 2단 */}
      <div className="w-full max-w-6xl">
        <div className="grid items-start gap-3 lg:grid-cols-2">
          {/* 좌측: 프리셋 조합 + 추천 조합 (세로) */}
          <div className="space-y-3">
            {/* 프리셋 조합 안내 */}
            <div id="preset-combination-section" className="rounded-lg bg-white p-2 shadow">
              <PresetCombinationSection allApostles={apostles} />
            </div>

            {/* 추천 조합 (보유 사도만) */}
            {myApostles.length > 0 ? (
              <div id="recommendation-section" className="rounded-lg bg-white p-2 shadow">
                <RecommendedDeckSection myApostles={myApostles} />
              </div>
            ) : (
              <div className="alert justify-center">
                <p>추천 조합을 보려면 보유하신 사도를 추가해주세요</p>
              </div>
            )}
          </div>

          {/* 우측: 보유 사도 관리 */}
          <MyApostleList
            myApostles={myApostles}
            allApostles={apostles}
            onAdd={handleAddApostle}
            onRemove={handleRemoveApostle}
            onAddMultiple={handleAddMultipleApostles}
            onRemoveMultiple={handleRemoveMultipleApostles}
          />
        </div>
      </div>
    </div>
  );
};

export default DeckRecommender;
