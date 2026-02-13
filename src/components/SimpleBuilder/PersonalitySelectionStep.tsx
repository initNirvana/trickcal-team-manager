import { useMemo, memo } from 'react';
import { Personality, Apostle } from '@/types/apostle';
import { getPersonalityIconPath } from '@/utils/apostleImages';
import { useDataLoader } from '@/hooks/useDataLoader';
import PresetDeckGrid from '@/components/builder/Preset/PresetDeckGrid';
import { PERSONALITIES, PRESET_DECKS } from './constants';

interface PersonalitySelectionStepProps {
  currentTab: Personality;
  onTabChange: (personality: Personality) => void;
  stepNumber: number;
}

export const PersonalitySelectionStep = memo(
  ({ currentTab, onTabChange, stepNumber }: PersonalitySelectionStepProps) => {
    const { apostles } = useDataLoader();

    const presetDeck = useMemo(() => {
      const personality = currentTab as keyof typeof PRESET_DECKS;
      const targetNames = PRESET_DECKS[personality];
      if (!targetNames) return [];

      return targetNames
        .map((name) => apostles.find((a) => a.engName === name))
        .filter((a): a is Apostle => !!a);
    }, [apostles, currentTab]);

    return (
      <div className="card bg-base-100 border-primary border-2 p-4 shadow-xl transition-all duration-300">
        <div className="mb-4 flex items-center gap-2">
          <span className="badge badge-primary">{stepNumber}단계</span>
          <h3 className="text-lg font-bold">성격 선택 및 추천 조합</h3>
        </div>

        <div className="tabs tabs-boxed bg-base-200 rounded-none">
          {PERSONALITIES.map((p) => (
            <button
              key={p}
              className={`tab tab-sm flex-1 ${currentTab === p ? 'tab-active' : ''}`}
              onClick={() => onTabChange(p)}
            >
              <img src={getPersonalityIconPath(p)} className="h-6 w-6 sm:h-8 sm:w-8" alt={p} />
            </button>
          ))}
        </div>

        <div className="bg-info/10 text-info-content border-info/20 mt-4 mb-4 rounded-xl border p-3 text-xs">
          어떤 성격을 좋아하시나요? 성격을 선택하시면 조합 예시를 보여드려요.
        </div>

        {presetDeck.length > 0 && (
          <div className="flex flex-col items-center">
            <PresetDeckGrid deck={presetDeck} deckSize={6} personality={currentTab} />
          </div>
        )}
      </div>
    );
  },
);

PersonalitySelectionStep.displayName = 'PersonalitySelectionStep';
