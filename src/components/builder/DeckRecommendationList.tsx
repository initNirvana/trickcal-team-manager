// ============================================
// 📄 DeckRecommendationList.tsx (리팩토링)
// 프리셋 조합과 추천 조합을 통합하는 메인 컴포넌트
// ============================================
import { Apostle } from '../../types/apostle';
import { buildPresetCombinations } from '../../utils/builder/deckRecommendationUtils';
import PresetCombinationSection from './Preset/PresetCombinationSection';
import RecommendedDeckSection from './Recommendation/RecommendedDeckSection';

interface DeckRecommendationListProps {
  recommendedParties: Apostle[][];
  personality: string;
  apostles: Apostle[];
  deckPreset?: any;
  myApostles?: Apostle[];
}

export const DeckRecommendationList = ({
  recommendedParties,
  personality,
  apostles,
  deckPreset,
  myApostles = [],
}: DeckRecommendationListProps) => {
  const { combo9, combo4, combo2 } = buildPresetCombinations(
    personality,
    apostles,
    deckPreset,
    myApostles,
  );

  return (
    <div className="space-y-8">
      {/* 프리셋 조합 섹션 */}
      <PresetCombinationSection
        combo9={combo9}
        combo4={combo4}
        combo2={combo2}
        myApostles={myApostles}
      />

      {/* 구분선 */}
      <div className="border-t-2 border-gray-300"></div>

      {/* 추천 조합 섹션 */}
      <RecommendedDeckSection
        recommendedParties={recommendedParties}
        apostles={apostles}
        myApostles={myApostles}
      />
    </div>
  );
};

export default DeckRecommendationList;
