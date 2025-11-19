import React from "react";
import type { Personality } from "../../types/apostle";
import { getSynergyOnIconPath } from "../../utils/apostleUtils";

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
    <div className="box space-y-2">
      <div className="section-header ">
        <h3 className="section-title">성격 시너지</h3>
      </div>

      {activeSynergies.length === 0 ? (
        <p className="text-muted text-sm">
          같은 성격의 사도 2명 이상을 배치하세요.
        </p>
      ) : (
        <div className="space-y-2">
          {activeSynergies.map((synergy) => (
            <div
              key={synergy.personality}
              className="box-subtitle border-l-4 border-blue-500 pl-3"
            >
              <img
                src={getSynergyOnIconPath(synergy.personality)}
                alt={synergy.personality}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/src/assets/placeholder.png";
                }}
              />
              {synergy.bonus && (
                <div className="text-xs text-gray-600 mt-1">
                  HP: +{synergy.bonus.hp}% | 피해: +{synergy.bonus.damage}%
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
