import React from "react";
import type { Apostle } from "../../types/apostle";
import type { PartyAnalysis } from "../../utils/partyAnalysisUtils";
import DamageReductionDisplay from "./DamageReductionDisplay";
import SynergyDisplay from "./SynergyDisplay";

interface PartyAnalysisPanelProps {
  analysis: PartyAnalysis;
  filledParty: Apostle[];
  skillsData?: any;
}

export const PartyAnalysisPanel: React.FC<PartyAnalysisPanelProps> = ({
  analysis,
  filledParty,
  skillsData,
}) => {
  if (filledParty.length === 0) {
    return (
      <div className="box text-center py-8">
        <p className="text-muted">사도를 배치하면 분석 결과가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DamageReductionDisplay
        apostles={filledParty}
        skillsData={skillsData}
        skillLevels={{}}
      />
      <SynergyDisplay synergies={analysis.synergies} />
    </div>
  );
};

export default PartyAnalysisPanel;
