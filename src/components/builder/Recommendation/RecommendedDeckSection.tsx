// ============================================
// 📄 RecommendedDeckSection.tsx
// 추천 조합 섹션 (보유 사도 기반 자동 생성)
// ============================================
import { Apostle } from '../../../types/apostle';
import { getPersonalities } from '../../../types/apostle';
import { getApostleImagePath } from '../../../utils/apostleUtils';
import {
  getPersonalityDistribution,
  calculateMatchScore,
} from '../../../utils/builder/deckRecommendationUtils';

interface RecommendedDeckSectionProps {
  recommendedParties: Apostle[][];
  apostles: Apostle[];
  myApostles: Apostle[];
}

export const RecommendedDeckSection = ({
  recommendedParties,
  apostles,
  myApostles,
}: RecommendedDeckSectionProps) => {
  return (
    <div className="space-y-6">
      {/* 헤더: 추천 조합 */}
      <div>
        <h3 className="mb-2 text-xl font-bold">추천 조합</h3>
        <p className="text-sm text-gray-600">보유 사도를 기반으로 자동 생성된 조합입니다</p>
      </div>

      {/* 추천 덱 리스트 */}
      <div className="space-y-4">
        {recommendedParties.map((deck, index) => {
          // 덱 멤버 이름 추출
          const deckMemberNames = deck.map((a) => a.name);
          // 매칭 점수 계산
          const matchScore = calculateMatchScore(deckMemberNames, myApostles, apostles);
          // 성격 분포 계산
          const distribution = getPersonalityDistribution(deckMemberNames, apostles);
          return (
            <div key={index} className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
              {/* 덱 제목 */}
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-lg font-bold">조합 #{index + 1}</h4>
                <div className="text-sm font-semibold text-blue-600">{matchScore.details}</div>
              </div>

              {/* 덱 멤버 그리드 */}
              <div className="mb-3 grid grid-cols-3 gap-3">
                {deck.map((apostle, idx) => {
                  const isOwned = myApostles.some((a) => a.id === apostle.id);
                  const personalities = getPersonalities(apostle);

                  return (
                    <div
                      key={idx}
                      className={`rounded-lg border p-2 ${
                        isOwned ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={getApostleImagePath(apostle.engName)}
                          alt={apostle.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{apostle.name}</div>
                          <div className="text-xs text-gray-500">{personalities.join(', ')}</div>
                        </div>
                      </div>
                      <div className="mt-1 text-xs font-semibold">
                        {isOwned ? '✓ 보유' : '✗ 미보유'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 성격 분포 */}
              <div className="rounded-lg bg-gray-50 p-2">
                <div className="mb-1 text-xs font-semibold text-gray-700">성격 분포</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(distribution).map(([persona, count]) =>
                    count > 0 ? (
                      <span
                        key={persona}
                        className="rounded bg-blue-100 px-2 py-1 font-semibold text-blue-800"
                      >
                        {persona}: {count}
                      </span>
                    ) : null,
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedDeckSection;
