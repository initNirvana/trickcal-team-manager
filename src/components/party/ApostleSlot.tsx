import React from 'react';
import type { Apostle } from '../../types/apostle';
import { getPersonalities } from '../../types/apostle';
import { getPersonalityBackgroundClass, getApostleImagePath } from '../../utils/apostleUtils';

interface ApostleSlotProps {
  slotNumber: number;
  apostle?: Apostle;
  onSelect?: () => void;
}

const ApostleSlot: React.FC<ApostleSlotProps> = ({ slotNumber, apostle, onSelect }) => {
  if (apostle) {
    const personalities = getPersonalities(apostle);
    const primaryPersonality = personalities[0];

    return (
      <div
        onClick={onSelect}
        className={`${getPersonalityBackgroundClass(
          primaryPersonality,
        )} flex h-30 cursor-pointer flex-col rounded-md text-white transition hover:opacity-50`}
      >
        <div className="flex flex-1 flex-col items-center justify-center">
          <img
            src={getApostleImagePath(apostle.engName)}
            alt={apostle.name}
            className="h-auto max-h-20 w-auto rounded-md object-cover"
            onError={(e) => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className="flex h-30 cursor-pointer items-center justify-center rounded-md border-2 border-black bg-white text-center transition hover:bg-gray-50"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onSelect) onSelect();
      }}
    >
      <p className="mt-1 text-xs">
        사도를 배치하려면 <br /> 클릭하세요
      </p>
    </div>
  );
};

export default ApostleSlot;
