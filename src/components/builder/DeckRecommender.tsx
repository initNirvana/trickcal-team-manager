import { useState } from 'react';
import type { Apostle } from '@/types/apostle';
import MyApostleList from './Apostle/MyApostleList';
import PresetCombinationSection from './Preset/PresetCombinationSection';
import RecommendedDeckSection from './Recommendation/RecommendedDeckSection';

interface DeckRecommenderProps {
  apostles: Apostle[];
}

export const DeckRecommender = ({ apostles }: DeckRecommenderProps) => {
  const [myApostles, setMyApostles] = useState<Apostle[]>([]);

  // 우로스는 하나만 보유 가능
  const isUros = (apostle: Apostle) => apostle.engName === 'Uros';

  const handleAddApostle = (apostle: Apostle) => {
    if (myApostles.some((a) => a.id === apostle.id)) return;

    // 우로스 추가 시, 기존에 다른 성격의 우로스가 있으면 교체
    if (isUros(apostle)) {
      const existingUrosIndex = myApostles.findIndex((a) => isUros(a));
      if (existingUrosIndex >= 0) {
        // 교체
        setMyApostles(myApostles.map((a) => (isUros(a) ? apostle : a)));
        return;
      }
    }

    setMyApostles([...myApostles, apostle]);
  };

  const handleAddMultipleApostles = (newApostles: Apostle[]) => {
    const toAdd: Apostle[] = [];
    let hasUros = myApostles.some((a) => isUros(a));

    newApostles.forEach((apostle) => {
      // 이미 보유한 사도는 스킵
      if (myApostles.some((m) => m.id === apostle.id)) return;

      // 우로스의 경우 이미 하나가 있으면 스킵 (기존 것 유지)
      if (isUros(apostle)) {
        if (hasUros) return;
        hasUros = true;
      }

      toAdd.push(apostle);
    });

    if (toAdd.length > 0) {
      setMyApostles([...myApostles, ...toAdd]);
    }
  };

  const handleRemoveMultipleApostles = (apostlesToRemove: Apostle[]) => {
    const idsToRemove = new Set(apostlesToRemove.map((a) => a.id));
    setMyApostles(myApostles.filter((a) => !idsToRemove.has(a.id)));
  };

  const handleRemoveApostle = (apostle: Apostle) => {
    setMyApostles(myApostles.filter((a) => a.id !== apostle.id));
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
            <div className="rounded-lg bg-white p-2 shadow">
              <PresetCombinationSection allApostles={apostles} />
            </div>

            {/* 추천 조합 (보유 사도만) */}
            {myApostles.length > 0 ? (
              <div className="rounded-lg bg-white p-2 shadow">
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
