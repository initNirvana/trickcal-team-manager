import { useMemo, useCallback } from 'react';
import type { Apostle } from '@/types/apostle';
import { useMyApostleStore } from '@/stores/myApostleStore';
import MyApostleList from './Apostle/MyApostleList';
import PresetCombinationSection from './Preset/PresetCombinationSection';
import RecommendedDeckSection from './Recommendation/RecommendedDeckSection';
import GrowthGuide from './Recommendation/GrowthGuide';
import { generateRecommendations } from '@/utils/builder/deckRecommendationUtils';
import { useDataLoader } from '@/hooks/useDataLoader';
import { useTour } from '@/hooks/useTour';

export const DeckRecommender = () => {
  useTour();
  const { apostles } = useDataLoader();
  const { ownedApostles, toggleApostle, addApostles, removeApostles } = useMyApostleStore();

  const myApostles = useMemo(() => {
    const ownedIds = new Set(ownedApostles.map((oa) => oa.id));
    return apostles.filter((a) => ownedIds.has(a.id));
  }, [apostles, ownedApostles]);

  const handleAddApostle = useCallback(
    (apostle: Apostle) => {
      const isOwned = ownedApostles.some((oa) => oa.id === apostle.id);
      if (isOwned) return;
      toggleApostle(apostle.id);
    },
    [ownedApostles, toggleApostle],
  );

  const handleAddMultipleApostles = useCallback(
    (newApostles: Apostle[]) => {
      const ownedIds = new Set(ownedApostles.map((oa) => oa.id));
      const toAddIds = newApostles.filter((a) => !ownedIds.has(a.id)).map((a) => a.id);

      if (toAddIds.length > 0) {
        addApostles(toAddIds);
      }
    },
    [ownedApostles, addApostles],
  );

  const handleRemoveMultipleApostles = useCallback(
    (apostlesToRemove: Apostle[]) => {
      const idsToRemove = apostlesToRemove.map((a) => a.id);
      removeApostles(idsToRemove);
    },
    [removeApostles],
  );

  const handleRemoveApostle = useCallback(
    (apostle: Apostle) => {
      toggleApostle(apostle.id);
    },
    [toggleApostle],
  );

  const recommendations = useMemo(() => {
    const asideLevels: Record<string, number> = {};
    for (const oa of ownedApostles) {
      asideLevels[oa.id] = oa.asideLevel;
    }

    return generateRecommendations(myApostles, { asideLevels });
  }, [myApostles, ownedApostles]);

  return (
    <div className="bg-base-100 flex min-h-screen flex-col items-center justify-start p-4">
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
              <PresetCombinationSection />
            </div>

            {/* 추천 조합 (보유 사도만) */}
            {recommendations.length > 0 ? (
              <div id="recommendation-section" className="space-y-4">
                <div className="rounded-lg bg-white p-2 shadow">
                  <RecommendedDeckSection recommendations={recommendations} />
                </div>
              </div>
            ) : (
              <div className="alert justify-center">
                <p>추천 조합을 보려면 보유하신 사도를 추가해주세요</p>
              </div>
            )}
          </div>

          {/* 우측: 보유 사도 관리 + 육성 가이드 */}
          <div className="space-y-3">
            <MyApostleList
              myApostles={myApostles}
              allApostles={apostles}
              onAdd={handleAddApostle}
              onRemove={handleRemoveApostle}
              onAddMultiple={handleAddMultipleApostles}
              onRemoveMultiple={handleRemoveMultipleApostles}
            />
            {/* 육성 가이드 */}
            {recommendations.length > 0 && <GrowthGuide topDecks={recommendations} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckRecommender;
