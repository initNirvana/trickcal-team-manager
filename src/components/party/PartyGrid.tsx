import React from "react";
import { Card } from "flowbite-react";
import type { Apostle } from "../../types/apostle";
import ApostleSlot from "./ApostleSlot";

interface PartyGridProps {
  party: (Apostle | undefined)[];
  onSelectSlot: (slotNumber: number) => void;
  onRemoveSlot: (slotNumber: number) => void;
}

const PartyGrid: React.FC<PartyGridProps> = ({ party, onSelectSlot }) => {
  const filledCount = party.filter((a) => a !== undefined).length;

  return (
    <div className="box space-h-4">
      {/* 3개 열 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 후열 */}
        <div className="space-y-3 p-3 border-2 border-blue-400 rounded-md bg-blue-50">
          <p className="text-xs font-bold text-center text-blue-700">후열</p>
          <div className="space-y-2">
            {[1, 4, 7].map((slot) => (
              <ApostleSlot
                key={slot}
                slotNumber={slot}
                apostle={party[slot - 1]}
                onSelect={() => onSelectSlot(slot)}
              />
            ))}
          </div>
        </div>

        {/* 중열 */}
        <div className="space-y-3 p-3 border-2 border-green-400 rounded-md bg-green-50">
          <p className="text-xs font-bold text-center text-green-700">중열</p>
          <div className="space-y-2">
            {[2, 5, 8].map((slot) => (
              <ApostleSlot
                key={slot}
                slotNumber={slot}
                apostle={party[slot - 1]}
                onSelect={() => onSelectSlot(slot)}
              />
            ))}
          </div>
        </div>

        {/* 전열 */}
        <div className="space-y-3 p-3 border-2 border-red-400 rounded-md bg-red-50">
          <p className="text-xs font-bold text-center text-red-700">전열</p>
          <div className="space-y-2">
            {[3, 6, 9].map((slot) => (
              <ApostleSlot
                key={slot}
                slotNumber={slot}
                apostle={party[slot - 1]}
                onSelect={() => onSelectSlot(slot)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyGrid;
