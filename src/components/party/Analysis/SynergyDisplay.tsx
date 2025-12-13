import React from 'react';
import type { Personality } from '../../../types/apostle';
import { getSynergyOnIconPath, getSynergyOffIconPath } from '../../../utils/apostleUtils';
import { getPersonalityBackgroundClass } from '../../../utils/apostleUtils';

interface SynergyDisplayProps {
  synergies: Array<{
    personality: Personality;
    count: number;
    totalCount: number;
    inactiveCount: number;
    isActive: boolean;
    bonus?: { hp: number; damage: number };
  }>;
}

const SynergyDisplay: React.FC<SynergyDisplayProps> = ({ synergies }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">성격 시너지</h3>

      {/* 모든 시너지 표시 (비활성도 포함) */}
      {synergies.filter((s) => s.totalCount > 0).length === 0 ? (
        <p className="text-center text-sm text-gray-500">같은 성격의 사도 2명 이상을 배치하세요.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {synergies
            .filter((s) => s.totalCount > 0)
            .map((synergy) => (
              <div key={synergy.personality} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative inline-flex items-center" style={{ height: '24px' }}>
                    {/* 활성 아이콘 */}
                    {Array.from({ length: synergy.count }).map((_, index) => (
                      <img
                        key={`active-${index}`}
                        src={getSynergyOnIconPath(synergy.personality)}
                        alt={`${synergy.personality}-active-${index + 1}`}
                        className="h-6 w-6 rounded-full border-2 border-white"
                        style={{
                          marginLeft: index === 0 ? '0' : '-12px',
                          zIndex: synergy.totalCount - index,
                          position: 'relative',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/src/assets/placeholder.png';
                        }}
                      />
                    ))}

                    {/* 비활성 아이콘 - 배치된 사도만큼 모두 표시 */}
                    {Array.from({ length: synergy.inactiveCount }).map((_, index) => (
                      <img
                        key={`inactive-${index}`}
                        src={getSynergyOffIconPath(synergy.personality)}
                        alt={`${synergy.personality}-inactive-${index + 1}`}
                        className="h-6 w-6 rounded-full border-2 border-white opacity-50 grayscale"
                        style={{
                          marginLeft: '-12px',
                          zIndex: synergy.inactiveCount - index,
                          position: 'relative',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/src/assets/placeholder.png';
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
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-center text-xs ${getPersonalityBackgroundClass(synergy.personality)}`}
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
