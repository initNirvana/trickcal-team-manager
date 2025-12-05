import React from 'react';
import type { Personality } from '../../../types/apostle';
import { getSynergyOnIconPath } from '../../../utils/apostleUtils';
import { getPersonalityBackgroundClass } from '../../../utils/apostleUtils';

interface SynergyDisplayProps {
  synergies: Array<{
    personality: Personality;
    count: number;
    isActive: boolean;
    bonus?: { hp: number; damage: number };
    level?: string;
  }>;
}

const SynergyDisplay: React.FC<SynergyDisplayProps> = ({ synergies }) => {
  const activeSynergies = synergies.filter((s) => s.isActive);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">성격 시너지</h3>
      {activeSynergies.length === 0 ? (
        <p className="text-center text-sm text-gray-500">같은 성격의 사도 2명 이상을 배치하세요.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {activeSynergies.map((synergy) => (
            <div key={synergy.personality} className="space-y-2">
              {/* 겹쳐진 아이콘 스택 */}
              <div className="flex items-center gap-3">
                <div className="relative inline-flex items-center" style={{ height: '24px' }}>
                  {Array.from({ length: synergy.count }).map((_, index) => (
                    <img
                      key={index}
                      src={getSynergyOnIconPath(synergy.personality)}
                      alt={`${synergy.personality}-${index + 1}`}
                      className="h-6 w-6 rounded-full border-2 border-white"
                      style={{
                        marginLeft: index === 0 ? '0' : '-12px',
                        zIndex: synergy.count - index,
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
                      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-center ${getPersonalityBackgroundClass(synergy.personality)}`}
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
