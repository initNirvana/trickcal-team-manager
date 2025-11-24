import React, { useState } from 'react';
import type { Apostle } from '../../types/apostle';
import type { PartyAnalysis } from '../../utils/partyAnalysisUtils';
import DamageReductionSkillDisplay from './DamageReductionSkillDisplay';
import DamageReductionAsideDisplay from './DamageReductionAsideDisplay';
import SynergyDisplay from './SynergyDisplay';

interface PartyAnalysisPanelProps {
  analysis: PartyAnalysis;
  filledParty: Apostle[];
  skillsData?: any;
  asidesData?: any;
  asideSelection?: Record<string, number | null>;
}

export const PartyAnalysisPanel: React.FC<PartyAnalysisPanelProps> = ({
  analysis,
  filledParty,
  skillsData,
  asidesData,
  asideSelection,
}) => {
  const [selectedApostles, setSelectedApostles] = useState<Apostle[]>([]);
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({});
  // 스킬 레벨 변경 핸들러
  const handleSkillLevelChange = (apostleId: string, newLevel: number) => {
    setSkillLevels((prev) => ({
      ...prev,
      [apostleId]: newLevel,
    }));
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
      <DamageReductionSkillDisplay
        apostles={filledParty}
        skillsData={skillsData}
        skillLevels={skillLevels}
        onSkillLevelChange={handleSkillLevelChange}
      />
      <DamageReductionAsideDisplay
        apostles={filledParty}
        asidesData={asidesData}
        asideSelection={asideSelection || {}}
      />
      <SynergyDisplay synergies={analysis.synergies} />
    </div>
  );
};

export default PartyAnalysisPanel;
