import { useState } from 'react';
import { ApostleCell } from '@/components/common/ApostleCell';
import artifactData from '@/data/artifacts.json';
import { useDeckStore } from '@/stores/deckStore';
import type { SlotNumber } from '@/types/branded';
import { toSlotNumber } from '@/types/branded';
import { getArtifactImagePath, getEmptyArtifactImagePath } from '@/utils/apostleImages';
import { ArtifactModal } from './Artifact/ArtifactSelector';

interface DeckGridProps {
  onSelectSlot: (slotNumber: SlotNumber) => void;
}

const DeckGrid = ({ onSelectSlot }: DeckGridProps) => {
  const deck = useDeckStore((state) => state.deck);
  const showArtifactMode = useDeckStore((state) => state.showArtifactMode);
  const equippedArtifacts = useDeckStore((state) => state.equippedArtifacts);

  // Modal State
  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
  const [modalApostleId, setModalApostleId] = useState<string | null>(null);
  const [modalApostleName, setModalApostleName] = useState<string | null>(null);
  const [modalSlotIndex, setModalSlotIndex] = useState<number | null>(null);
  const [currentArtifactId, setCurrentArtifactId] = useState<number | null>(null);

  const handleOpenArtifactModal = (
    apostleId: string,
    apostleName: string,
    slotIndex: number,
    currentId: number | null,
  ) => {
    setModalApostleId(apostleId);
    setModalApostleName(apostleName);
    setModalSlotIndex(slotIndex);
    setCurrentArtifactId(currentId);
    setIsArtifactModalOpen(true);
  };

  const handleCloseArtifactModal = () => {
    setIsArtifactModalOpen(false);
    setModalApostleId(null);
    setModalApostleName(null);
    setModalSlotIndex(null);
    setCurrentArtifactId(null);
  };

  const renderArtifactSlot = (
    apostleId: string,
    apostleName: string,
    slotIndex: number,
    currentId: number | null,
  ) => {
    const artifact = currentId ? artifactData.artifacts.find((a) => a.id === currentId) : null;

    return (
      <button
        key={slotIndex}
        className="flex items-center justify-center rounded-full hover:scale-105 transition-transform"
        onClick={() => handleOpenArtifactModal(apostleId, apostleName, slotIndex, currentId)}
      >
        <img
          src={
            artifact ? getArtifactImagePath(artifact.id.toString()) : getEmptyArtifactImagePath()
          }
          className={`h-full w-full object-contain ${artifact ? '' : 'opacity-90'}`}
        />
      </button>
    );
  };

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
              <div key={slot}>
                <ApostleCell
                  index={slot - 1}
                  apostle={deck[slot - 1]}
                  onClick={() => onSelectSlot(toSlotNumber(slot))}
                />
                {showArtifactMode && (
                  <div className="flex justify-center gap-1 mt-1">
                    {[0, 1, 2].map((i) => {
                      const apostle = deck[slot - 1];
                      if (!apostle) {
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-center rounded-full opacity-50"
                          >
                            <img
                              src={getEmptyArtifactImagePath()}
                              className="h-full w-full object-contain"
                              alt="빈 슬롯"
                            />
                          </div>
                        );
                      }
                      const currentArtifacts = equippedArtifacts[apostle.id] || [null, null, null];
                      return renderArtifactSlot(apostle.id, apostle.name, i, currentArtifacts[i]);
                    })}
                  </div>
                )}
              </div>
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
              <div key={slot}>
                <ApostleCell
                  index={slot - 1}
                  apostle={deck[slot - 1]}
                  onClick={() => onSelectSlot(toSlotNumber(slot))}
                />
                {showArtifactMode && (
                  <div className="flex justify-center gap-1 mt-1">
                    {[0, 1, 2].map((i) => {
                      const apostle = deck[slot - 1];
                      if (!apostle) {
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-center rounded-full opacity-50"
                          >
                            <img
                              src={getEmptyArtifactImagePath()}
                              className="h-full w-full object-contain"
                              alt="빈 슬롯"
                            />
                          </div>
                        );
                      }
                      const currentArtifacts = equippedArtifacts[apostle.id] || [null, null, null];
                      return renderArtifactSlot(apostle.id, apostle.name, i, currentArtifacts[i]);
                    })}
                  </div>
                )}
              </div>
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
              <div key={slot}>
                <ApostleCell
                  index={slot - 1}
                  apostle={deck[slot - 1]}
                  onClick={() => onSelectSlot(toSlotNumber(slot))}
                />
                {showArtifactMode && (
                  <div className="flex justify-center gap-1 mt-1">
                    {[0, 1, 2].map((i) => {
                      const apostle = deck[slot - 1];
                      if (!apostle) {
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-center rounded-full opacity-50"
                          >
                            <img
                              src={getEmptyArtifactImagePath()}
                              className="h-full w-full object-contain"
                              alt="빈 슬롯"
                            />
                          </div>
                        );
                      }
                      const currentArtifacts = equippedArtifacts[apostle.id] || [null, null, null];
                      return renderArtifactSlot(apostle.id, apostle.name, i, currentArtifacts[i]);
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ArtifactModal
        isOpen={isArtifactModalOpen}
        onClose={handleCloseArtifactModal}
        apostleId={modalApostleId}
        apostleName={modalApostleName}
        slotIndex={modalSlotIndex}
        currentArtifactId={currentArtifactId}
      />
    </div>
  );
};

export default DeckGrid;
