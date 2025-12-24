import { useState } from 'react';
import type { Apostle } from '../../types/apostle';
import { getPersonalityKoreanName } from '../../types/apostle';
import MyApostleList from './MyApostleList';
import DeckRecommendationList from './DeckRecommendationList';
import deckPreset from '../../data/apostles-preset.json';
import { calculateRecommendedParties } from '../../utils/builder/deckRecommendationUtils';

interface DeckRecommenderProps {
  apostles: Apostle[];
}

export const DeckRecommender = ({ apostles }: DeckRecommenderProps) => {
  const [selectedPersonality, setSelectedPersonality] = useState<string>('Naive');
  const [myApostles, setMyApostles] = useState<Apostle[]>([]);
  const [recommendedParties, setRecommendedParties] = useState<Apostle[][]>([]);

  const updateRecommendations = (personality: string, owned: Apostle[]) => {
    const recommendations = calculateRecommendedParties(personality, owned, deckPreset);
    setRecommendedParties(recommendations);
  };

  // 성격 선택
  const handleSelectPersonality = (personality: string) => {
    setSelectedPersonality(personality);
    updateRecommendations(personality, myApostles);
  };

  // 보유 캐릭 추가
  const handleAddApostle = (apostle: Apostle) => {
    if (myApostles.some((a) => a.id === apostle.id)) return;
    const updated = [...myApostles, apostle];
    setMyApostles(updated);
    updateRecommendations(selectedPersonality, updated);
  };

  const handleAddMultipleApostles = (apostles: Apostle[]) => {
    const newApostles = apostles.filter((a) => !myApostles.some((m) => m.id === a.id));
    if (newApostles.length === 0) return;

    const updated = [...myApostles, ...newApostles];
    setMyApostles(updated);
    updateRecommendations(selectedPersonality, updated);
  };

  // 보유 캐릭 제거
  const handleRemoveApostle = (apostle: Apostle) => {
    const updated = myApostles.filter((a) => a.id !== apostle.id);
    setMyApostles(updated);
    if (updated.length > 0) {
      updateRecommendations(selectedPersonality, updated);
    }
  };

  return (
    <div className="from-white-900 via-white-800 to-white-900 min-h-screen bg-linear-to-br p-4">
      {/* 헤더 */}
      <div className="mb-6 items-center justify-center text-center">
        <h1 className="mb-2 text-3xl font-bold text-black">보유 사도 분석기</h1>
        <p className="text-black-400">보유 사도를 선택하고 추천 조합을 확인하세요</p>
      </div>

      {/* 성격 선택 탭 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['Naive', 'Cool', 'Mad', 'Jolly', 'Gloomy'].map((personality) => (
          <button
            key={personality}
            onClick={() => handleSelectPersonality(personality)}
            className={`rounded-lg px-4 py-2 font-semibold transition ${
              selectedPersonality === personality
                ? 'bg-blue-600 text-black'
                : 'bg-white-700 text-black-300 hover:bg-white-600'
            }`}
          >
            {getPersonalityKoreanName(personality as any)}
          </button>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* 좌측: 추천 덱 조합 리스트 */}
        <div className="lg:col-span-2">
          {recommendedParties.length > 0 ? (
            <DeckRecommendationList
              recommendedParties={recommendedParties}
              personality={selectedPersonality}
              apostles={apostles}
              deckPreset={deckPreset}
              myApostles={myApostles}
            />
          ) : (
            <div className="border-white-700 bg-white-800 rounded-xl border p-8 text-center shadow-lg">
              <p className="text-black-400 mb-2">성격을 선택하고 보유 캐릭 1명 이상 추가</p>
              <p className="text-black-500 text-sm">추천 덱 조합이 여기에 표시됩니다</p>
            </div>
          )}
        </div>

        {/* 우측: 보유 사도  */}
        <div className="space-y-6 lg:col-span-2">
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
