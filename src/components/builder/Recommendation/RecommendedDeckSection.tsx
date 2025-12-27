import { useMemo } from 'react';
import { Apostle, getPersonalityBackgroundClass } from '@/types/apostle';
import { generateRecommendations } from '@/utils/builder/deckRecommendationUtils';
import { getPersonalityKoreanName } from '@/types/apostle';
import RecommendedDeckGrid from './RecommendedDeckGrid';

interface RecommendedDeckSectionProps {
  myApostles: Apostle[];
}

export const RecommendedDeckSection = ({ myApostles }: RecommendedDeckSectionProps) => {
  const recommendations = useMemo(() => generateRecommendations(myApostles), [myApostles]);

  if (recommendations.length === 0) {
    return (
      <div className="alert alert-warning">
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
                {rec.deckSize}인 조합 ({rec.deckSize === 9 ? '대충돌/프론티어' : '침략/줘팸터'})
              </h3>
              <div className="badge badge-lg badge-primary">총점: {rec.totalScore}</div>
            </div>

            {/* 점수 상세 */}
            <div className="flex gap-4 text-sm">
              <span className="badge badge-outline">기본점수: {rec.baseScore}</span>
              <span className="badge badge-outline">시너지: {rec.synergyScore}</span>
            </div>

            {/* 성격 시너지 표시 */}
            <div className="mt-3">
              <h4 className="mb-2 text-sm font-semibold">성격 시너지</h4>
              <div className="flex flex-wrap gap-2">
                {rec.synergies
                  .filter((s) => s.isActive)
                  .map((synergy) => (
                    <div
                      key={synergy.personality}
                      className={`badge badge-lg gap-1 ${getPersonalityBackgroundClass(synergy.personality)}`}
                      title={`HP +${synergy.bonus?.hp}%, 공격력 +${synergy.bonus?.damage}%`}
                    >
                      <span className="font-bold">
                        {getPersonalityKoreanName(synergy.personality)}
                      </span>
                      <span className="opacity-80">{synergy.activeCount}명</span>
                      {synergy.inactiveCount > 0 && (
                        <span className="text-xs opacity-60">(+{synergy.inactiveCount})</span>
                      )}
                      <span className="text-xs">
                        {synergy.bonus ? `+${synergy.bonus.hp}%` : ''}
                      </span>
                    </div>
                  ))}

                {rec.synergies.filter((s) => s.isActive).length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    전체 보너스:
                    <span className="ml-1">
                      HP +{rec.synergies.reduce((sum, s) => sum + (s.bonus?.hp || 0), 0)}%, 피해량 +
                      {rec.synergies.reduce((sum, s) => sum + (s.bonus?.damage || 0), 0)}%
                    </span>
                  </div>
                )}
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
