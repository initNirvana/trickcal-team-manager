import React from "react";
import type { Apostle } from "../../types/apostle";
import { getPersonalities } from "../../types/apostle";
import { getPersonalityBackgroundClass } from "../../utils/apostleUtils";
import { Button } from "flowbite-react";

interface ApostleSlotProps {
  slotNumber: number;
  apostle?: Apostle;
  onSelect?: () => void;
}

const ApostleSlot: React.FC<ApostleSlotProps> = ({
  slotNumber,
  apostle,
  onSelect,
}) => {
  const getApostleImage = (apostleName: string) => {
    return "src/assets/apostles/" + apostleName + ".webp";
  };

  if (apostle) {
    const personalities = getPersonalities(apostle);
    const primaryPersonality = personalities[0];

    return (
      <div
        onClick={onSelect}
        className={`${getPersonalityBackgroundClass(
          primaryPersonality
        )} text-white rounded-md cursor-pointer hover:opacity-50 transition h-30 flex flex-col`}
      >
        <div className="flex-1 flex flex-col items-center justify-center">
          <img
            src={getApostleImage(apostle.name)}
            alt={apostle.name}
            className="w-auto h-auto object-cover rounded-md max-h-20"
            onError={(e) => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className="border-2 border-black bg-white rounded-md h-30 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition text-center"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onSelect) onSelect();
      }}
    >
      <p className="text-xs mt-1">
        사도를 배치하려면 <br /> 클릭하세요
      </p>
    </div>
  );
};

export default ApostleSlot;
