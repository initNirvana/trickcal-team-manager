import type { Aside } from '@/types/aside';
import type { SkillLevel } from '@/types/branded';
import type { Skill } from '@/types/skill';
import { useDeckStore } from '../../../stores/deckStore';
import type { Apostle } from '../../../types/apostle';
import type { DeckAnalysis } from '../../../utils/deckAnalysisUtils';
import AsideEffectDisplay from '../DamageDisplay/AsideEffect';
import SkillEffectDisplay from '../DamageDisplay/SkillEffect';
import SynergyDisplay from './SynergyDisplay';

interface AnalysisPanelProps {
  analysis: DeckAnalysis;
  filledDeck: Apostle[];
  skillsData?: Skill[];
  asidesData?: Aside[];
}

const AnalysisPanel = ({ analysis, filledDeck, skillsData, asidesData }: AnalysisPanelProps) => {
  const skillLevels = useDeckStore((state) => state.skillLevels);
  const setSkillLevel = useDeckStore((state) => state.setSkillLevel);
  const asideSelection = useDeckStore((state) => state.asideSelection);

  // ✅ 스킬 레벨 변경 핸들러
  const handleSkillLevelChange = (apostleId: string, newLevel: SkillLevel) => {
    setSkillLevel(apostleId, newLevel);
  };

  if (filledDeck.length === 0) {
    return (
      <div className="box py-8 text-center">
        <p className="text-muted">사도를 배치하면 분석 결과가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 스킬 피해감소 표시 */}
      <SkillEffectDisplay
        apostles={filledDeck}
        skillsData={skillsData}
        skillLevels={skillLevels}
        onSkillLevelChange={handleSkillLevelChange}
      />

      {/* 어사이드 피해감소 표시 */}
      <AsideEffectDisplay
        apostles={filledDeck}
        asidesData={asidesData}
        asideSelection={asideSelection}
      />

      {/* 시너지 표시 */}
      <SynergyDisplay synergies={analysis.synergies} />
    </div>
  );
};

export default AnalysisPanel;
