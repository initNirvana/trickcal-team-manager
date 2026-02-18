import {
  getSynergyOffIconPath,
  getSynergyOnIconPath,
  placeholderImagePath,
} from '@/utils/apostleImages';
import { getPersonalityBackground } from '@/utils/apostleUtils';
import type { Synergy } from '@/utils/deckAnalysisUtils';
import { calculateTotalSynergyBonus } from '@/utils/deckAnalysisUtils';

const SynergyDisplay = ({ synergies }: { synergies: Synergy[] }) => {
  const totalBonus = calculateTotalSynergyBonus(synergies);
  const hasActiveSynergies = synergies.some((s) => s.isActive);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">성격 시너지</h3>

      {/* 성격 시너지 합계 */}
      {hasActiveSynergies && (
        <div className="space-y-2">
          {/* HP + 피해량 바 */}
          <div className="flex gap-2">
            {/* 합계 라벨 */}
            <div className="text-center text-xs font-bold text-gray-600">합계</div>
            <div className="flex-1">
              <div className="flex h-5 items-center justify-center rounded bg-gray-200">
                <span className="text-xs font-bold text-gray-700">HP +{totalBonus.hp}%</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex h-5 items-center justify-center rounded bg-gray-200">
                <span className="text-xs font-bold text-gray-700">
                  피해량 +{totalBonus.damage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 모든 시너지 표시 (비활성도 포함) */}
      {!hasActiveSynergies ? (
        <p className="text-center text-sm text-gray-500">같은 성격의 사도를 2명 이상 배치하세요.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {synergies
            .filter((s) => s.ownedCount > 0)
            .map((synergy) => (
              <div key={synergy.personality} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative inline-flex items-center" style={{ height: '24px' }}>
                    {/* 활성 아이콘 */}
                    {Array.from({ length: synergy.ownedCount }).map((_, index) => (
                      <img
                        key={`active-${index}`}
                        src={getSynergyOnIconPath(synergy.personality)}
                        alt={`${synergy.personality}-active-${index + 1}`}
                        className="h-6 w-6 rounded-full"
                        style={{
                          marginLeft: index === 0 ? '0' : '-12px',
                          zIndex: 100 + synergy.ownedCount - index,
                          position: 'relative',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = placeholderImagePath;
                        }}
                      />
                    ))}

                    {/* 비활성 아이콘 - 배치된 사도만큼 모두 표시 */}
                    {Array.from({ length: synergy.inactiveCount }).map((_, index) => (
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
                </div>

                {/* 보너스 정보 */}
                {synergy.bonus && (
                  <div className="ml-2 space-y-1 text-sm">
                    {synergy.bonus.hp > 0 && (
                      <div
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-center text-xs ${getPersonalityBackground(synergy.personality)}`}
                      >
                        HP +{synergy.bonus.hp}% <br />
                        피해량 +{synergy.bonus.damage}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SynergyDisplay;
