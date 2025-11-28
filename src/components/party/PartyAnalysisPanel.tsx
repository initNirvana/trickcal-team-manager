import React from 'react';
import type { Apostle } from '../../types/apostle';
import type { PartyAnalysis } from '../../utils/partyAnalysisUtils';
import { usePartyStore } from '../../stores/partyStore';
import DamageReductionSkillDisplay from './DamageReductionSkillDisplay';
import DamageReductionAsideDisplay from './DamageReductionAsideDisplay';
import SynergyDisplay from './SynergyDisplay';

interface PartyAnalysisPanelProps {
  analysis: PartyAnalysis;
  filledParty: Apostle[];
  skillsData?: any;
  asidesData?: any;
}

export const PartyAnalysisPanel: React.FC<PartyAnalysisPanelProps> = ({
  analysis,
  filledParty,
  skillsData,
  asidesData,
}) => {
  const skillLevels = usePartyStore((state) => state.skillLevels);
  const setSkillLevel = usePartyStore((state) => state.setSkillLevel);
  const asideSelection = usePartyStore((state) => state.asideSelection);

  // ✅ 스킬 레벨 변경 핸들러
  const handleSkillLevelChange = (apostleId: string, newLevel: number) => {
    setSkillLevel(apostleId, newLevel);
  };

  if (filledParty.length === 0) {
    return (
      <div className="box py-8 text-center">
        <p className="text-muted">사도를 배치하면 분석 결과가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 스킬 피해감소 표시 */}
      <DamageReductionSkillDisplay
        apostles={filledParty}
        skillsData={skillsData}
        skillLevels={skillLevels}
        onSkillLevelChange={handleSkillLevelChange}
      />

      {/* 어사이드 피해감소 표시 */}
      <DamageReductionAsideDisplay
        apostles={filledParty}
        asidesData={asidesData}
        asideSelection={asideSelection}
      />

      {/* 시너지 표시 */}
      <SynergyDisplay synergies={analysis.synergies} />
    </div>
  );
};

export default PartyAnalysisPanel;
