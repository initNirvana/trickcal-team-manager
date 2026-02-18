import { memo } from 'react';
import { Apostle, Personality } from '@/types/apostle';
import { getPersonalityIconPath } from '@/utils/apostleImages';
import { ApostleSelectorItem } from './ApostleSelectorItem';
import { PERSONALITIES } from './constants';

interface ApostleSelectionStepProps {
  currentTab: Personality;
  onTabChange: (personality: Personality) => void;
  topApostlesByPersona: Partial<Record<Personality, Apostle[]>>;
  placedApostles: (Apostle | null)[];
  onApostleSelect: (apostle: Apostle) => void;
  stepNumber: number;
  stepTitle: string;
}

export const ApostleSelectionStep = memo(
  ({
    currentTab,
    onTabChange,
    topApostlesByPersona,
    placedApostles,
    onApostleSelect,
    stepNumber,
    stepTitle,
  }: ApostleSelectionStepProps) => {
    return (
      <div
        className={`card bg-base-100 border-2 shadow-xl transition-all duration-300 ${stepNumber === 3 ? 'border-primary' : 'border-base-300'}`}
      >
        <div className="bg-base-200/50 flex items-center gap-2 p-4">
          <span className="badge badge-primary">{stepNumber}단계</span>
          <h3 className="text-lg font-bold">{stepTitle}</h3>
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

        <div className="grid grid-cols-3 gap-3 p-4">
          {topApostlesByPersona[currentTab]?.map((apostle) => (
            <ApostleSelectorItem
              key={apostle.id}
              apostle={apostle}
              isPlaced={placedApostles.some((a) => a?.id === apostle.id)}
              onClick={onApostleSelect}
            />
          ))}
        </div>
      </div>
    );
  },
);

ApostleSelectionStep.displayName = 'ApostleSelectionStep';
