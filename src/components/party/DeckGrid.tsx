import type { SlotNumber } from '@/types/branded';
import { toSlotNumber } from '@/types/branded';
import { useDeckStore } from '../../stores/deckStore';
import ApostleSlot from './ApostleSlot';

interface DeckGridProps {
  onSelectSlot: (slotNumber: SlotNumber) => void;
}

const DeckGrid = ({ onSelectSlot }: DeckGridProps) => {
  const deck = useDeckStore((state) => state.deck);

  return (
    <div className="box space-h-4">
      {/* 3개 열 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 후열 */}
        <div className="space-y-3 rounded-md border-2 border-blue-400 bg-blue-50 p-3">
          <p className="text-center text-xs font-bold text-blue-700">후열</p>
          <div className="space-y-2">
            {[1, 4, 7].map((slot) => (
              <ApostleSlot
                key={slot}
                apostle={deck[slot - 1]}
                onSelect={() => onSelectSlot(toSlotNumber(slot))}
              />
            ))}
          </div>
        </div>

        {/* 중열 */}
        <div className="space-y-3 rounded-md border-2 border-green-400 bg-green-50 p-3">
          <p className="text-center text-xs font-bold text-green-700">중열</p>
          <div className="space-y-2">
            {[2, 5, 8].map((slot) => (
              <ApostleSlot
                key={slot}
                apostle={deck[slot - 1]}
                onSelect={() => onSelectSlot(toSlotNumber(slot))}
              />
            ))}
          </div>
        </div>

        {/* 전열 */}
        <div className="space-y-3 rounded-md border-2 border-red-400 bg-red-50 p-3">
          <p className="text-center text-xs font-bold text-red-700">전열</p>
          <div className="space-y-2">
            {[3, 6, 9].map((slot) => (
              <ApostleSlot
                key={slot}
                apostle={deck[slot - 1]}
                onSelect={() => onSelectSlot(toSlotNumber(slot))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckGrid;
