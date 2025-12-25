import { useState } from 'react';
import type { Apostle, Personality } from '@/types/apostle';
import { getPersonalityKoreanName } from '@/types/apostle';
import MyApostleList from './Apostle/MyApostleList';
import PresetCombinationSection from './Preset/PresetCombinationSection';
import RecommendedDeckSection from './Recommendation/RecommendedDeckSection';

interface DeckRecommenderProps {
  apostles: Apostle[];
}

export const DeckRecommender = ({ apostles }: DeckRecommenderProps) => {
  const [selectedPersonality, setSelectedPersonality] = useState<Personality>('Jolly');
  const [myApostles, setMyApostles] = useState<Apostle[]>([]);

  const handleAddApostle = (apostle: Apostle) => {
    if (myApostles.some((a) => a.id === apostle.id)) return;
    setMyApostles([...myApostles, apostle]);
  };

  const handleAddMultipleApostles = (newApostles: Apostle[]) => {
    const filtered = newApostles.filter((a) => !myApostles.some((m) => m.id === a.id));
    if (filtered.length === 0) return;
    setMyApostles([...myApostles, ...filtered]);
  };

  const handleRemoveApostle = (apostle: Apostle) => {
    setMyApostles(myApostles.filter((a) => a.id !== apostle.id));
  };

  return (
    <div className="max-w-6xl space-y-6 p-4">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">보유 사도 분석기</h1>
        <p className="text-sm opacity-70">보유 사도를 선택하고 추천 조합을 확인하세요</p>
      </div>

      {/* 성격 선택 탭 */}
      <div className="flex justify-center gap-2">
        {(['Jolly', 'Mad', 'Cool', 'Naive', 'Gloomy'] as Personality[]).map((personality) => (
          <button
            key={personality}
            onClick={() => setSelectedPersonality(personality)}
            className={`btn ${selectedPersonality === personality ? 'btn-primary' : 'btn-outline'}`}
          >
            {getPersonalityKoreanName(personality)}
          </button>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid gap-3 lg:grid-cols-2">
        {/* 좌측: 추천 조합 */}
        <div className="lg:grid-cols-2">
          <div className="space-y-2">
            {/* 프리셋 조합 안내 */}
            <PresetCombinationSection personality={selectedPersonality} allApostles={apostles} />

            {/* 추천 조합 (보유 사도만) */}
            {myApostles.length > 0 ? (
              <RecommendedDeckSection myApostles={myApostles} />
            ) : (
              <div className="alert justify-center">
                <p>추천 조합을 보려면 보유하신 사도를 추가해주세요</p>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 보유 사도 관리 */}
        <div>
          <MyApostleList
            myApostles={myApostles}
            allApostles={apostles}
            onAdd={handleAddApostle}
            onRemove={handleRemoveApostle}
            onAddMultiple={handleAddMultipleApostles}
          />
        </div>
      </div>
    </div>
  );
};

export default DeckRecommender;
