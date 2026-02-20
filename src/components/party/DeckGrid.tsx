import { ApostleCell } from '@/components/common/ApostleCell';
import { useDeckStore } from '@/stores/deckStore';
import type { SlotNumber } from '@/types/branded';
import { toSlotNumber } from '@/types/branded';

interface DeckGridProps {
  onSelectSlot: (slotNumber: SlotNumber) => void;
}

const DeckGrid = ({ onSelectSlot }: DeckGridProps) => {
  const deck = useDeckStore((state) => state.deck);

  return (
    <div className="bg-base-200 border-base-300 relative flex justify-center overflow-hidden rounded-3xl border-2 p-3 shadow-inner sm:p-6">
      <div className="grid w-full max-w-md grid-cols-3 gap-2">
        {/* 후열 */}
        <div className="flex flex-col gap-1">
          <div className="bg-primary text-primary-content rounded-t-xl py-1 text-center text-xs font-bold shadow-sm sm:text-sm">
            후열
          </div>
          <div className="flex flex-col gap-1">
            {[1, 4, 7].map((slot) => (
              <ApostleCell
                key={slot}
                index={slot - 1}
                apostle={deck[slot - 1]}
                onClick={() => onSelectSlot(toSlotNumber(slot))}
              />
            ))}
          </div>
        </div>

        {/* 중열 */}
        <div className="flex flex-col gap-1">
          <div className="bg-success text-success-content rounded-t-xl py-1 text-center text-xs font-bold shadow-sm sm:text-sm">
            중열
          </div>
          <div className="flex flex-col gap-1">
            {[2, 5, 8].map((slot) => (
              <ApostleCell
                key={slot}
                index={slot - 1}
                apostle={deck[slot - 1]}
                onClick={() => onSelectSlot(toSlotNumber(slot))}
              />
            ))}
          </div>
        </div>

        {/* 전열 */}
        <div className="flex flex-col gap-1">
          <div className="bg-error text-error-content rounded-t-xl py-1 text-center text-xs font-bold shadow-sm sm:text-sm">
            전열
          </div>
          <div className="flex flex-col gap-1">
            {[3, 6, 9].map((slot) => (
              <ApostleCell
                key={slot}
                index={slot - 1}
                apostle={deck[slot - 1]}
                onClick={() => onSelectSlot(toSlotNumber(slot))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckGrid;
