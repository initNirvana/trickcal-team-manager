import { useMemo } from 'react';
import { Apostle } from '@/types/apostle';
import { generateRecommendations } from '@/utils/builder/deckRecommendationUtils';
import { getPersonalityKoreanName, getPersonalityBackground } from '@/utils/ApostleUtils';
import {
  getSynergyOnIconPath,
  getSynergyOffIconPath,
  placeholderImagePath,
} from '@/utils/apostleImages';
import RecommendedDeckGrid from './RecommendedDeckGrid';

interface RecommendedDeckSectionProps {
  myApostles: Apostle[];
}

export const RecommendedDeckSection = ({ myApostles }: RecommendedDeckSectionProps) => {
  const recommendations = useMemo(() => generateRecommendations(myApostles), [myApostles]);

  if (recommendations.length === 0) {
    return (
      <div className="alert alert-warning flex items-center justify-center text-center">
        <div>
          <h3 className="font-bold">추천 가능한 조합이 없습니다</h3>
          <p className="text-sm">보유 사도가 부족하거나 역할 밸런스(탱커/서포터)가 맞지 않습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold">추천 조합 (보유 사도 기반)</h2>

      {recommendations.map((rec, idx) => (
        <div key={idx} className="card bg-base-200 shadow-lg">
          <div className="card-body">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <h3 className="card-title">
                {rec.deckSize}인 조합 ({rec.deckSize === 9 ? '대충돌/프론티어' : '침략'})
              </h3>
              {/* <div className="badge badge-lg badge-primary">총점: {rec.totalScore}</div> */}
            </div>

            {/* 성격 시너지 표시 */}
            <div className="mt-1">
              <h4 className="mb-2 text-sm font-semibold">
                성격 시너지
                {/* 성격 시너지 합계 표시 */}
                {rec.synergies.filter((s) => s.isActive).length > 0 && (
                  <div className="space-y-2">
                    {/* HP + 피해량 바 */}
                    <div className="flex gap-2">
                      {/* 합계 라벨 */}
                      <div className="text-center text-xs font-bold text-gray-600">합계</div>
                      <div className="flex-1">
                        <div className="flex h-5 items-center justify-center rounded bg-gray-200">
                          <span className="text-xs font-bold text-gray-700">
                            HP +{rec.synergies.reduce((sum, s) => sum + (s.bonus?.hp || 0), 0)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex h-5 items-center justify-center rounded bg-gray-200">
                          <span className="text-xs font-bold text-gray-700">
                            피해량 +
                            {rec.synergies.reduce((sum, s) => sum + (s.bonus?.damage || 0), 0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </h4>

              <div className="flex flex-wrap justify-center gap-2">
                {rec.synergies
                  .filter((s) => s.isActive)
                  .map((synergy) => (
                    <div
                      key={synergy.personality}
                      className={`badge badge-lg gap-1 ${getPersonalityBackground(synergy.personality)}`}
                      title={`${getPersonalityKoreanName(synergy.personality)} - HP +${synergy.bonus?.hp}%, 공격력 +${synergy.bonus?.damage}%`}
                    >
                      <div className="relative inline-flex items-center" style={{ height: '24px' }}>
                        {/* 활성 아이콘 */}
                        {Array.from({ length: synergy.activeCount }).map((_, index) => (
                          <img
                            key={`active-${index}`}
                            src={getSynergyOnIconPath(synergy.personality)}
                            alt={`${synergy.personality}-active-${index + 1}`}
                            className="h-6 w-6 rounded-full"
                            style={{
                              marginLeft: index === 0 ? '0' : '-12px',
                              zIndex: 100 + synergy.activeCount - index,
                              position: 'relative',
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = placeholderImagePath;
                            }}
                          />
                        ))}

                        {/* 비활성 아이콘 */}
                        {synergy.inactiveCount > 0 &&
                          Array.from({ length: synergy.inactiveCount }).map((_, index) => (
                            <img
                              key={`inactive-${index}`}
                              src={getSynergyOffIconPath(synergy.personality)}
                              alt={`${synergy.personality}-inactive-${index + 1}`}
                              className="h-6 w-6 rounded-full opacity-50 grayscale"
                              style={{
                                marginLeft: '-12px',
                                zIndex: synergy.inactiveCount - index,
                                position: 'relative',
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = placeholderImagePath;
                              }}
                            />
                          ))}
                      </div>
                      {/* <span className="text-xs">
                        {synergy.bonus ? `HP/피해량 +${synergy.bonus.hp}%` : ''}
                      </span> */}
                    </div>
                  ))}
              </div>
            </div>

            {/* 추천 조합 그리드 */}
            <div className="m-2 flex justify-center">
              <RecommendedDeckGrid deck={rec.deck} deckSize={rec.deckSize} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendedDeckSection;
