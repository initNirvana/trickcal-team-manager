import React, { useMemo, useState } from 'react';
import artifactData from '@/data/artifacts.json';
import { useDeckStore } from '@/stores/deckStore';
import {
  getArtifactGradeBgPath,
  getArtifactImagePath,
  getCostBgPath,
  getIconPath,
} from '@/utils/apostleImages';

interface ArtifactModalProps {
  isOpen: boolean;
  onClose: () => void;
  apostleId: string | null;
  apostleName: string | null;
  slotIndex: number | null;
  currentArtifactId: number | null;
}

const GRADE_TO_NUM: Record<string, number> = {
  일반: 1,
  고급: 2,
  희귀: 3,
  전설: 4,
};

const STAT_FILTERS = [
  { id: 'hp', icon: 'Icon_Hp', type: 'hp' },
  { id: 'physicalAttack', icon: 'Icon_AttackPhysic', type: 'physicalAttack' },
  { id: 'magicAttack', icon: 'Icon_AttackMagic', type: 'magicAttack' },
  { id: 'criticalRate', icon: 'Icon_CriticalRate', type: 'criticalRate' },
  { id: 'criticalDamage', icon: 'Icon_CriticalMult', type: 'criticalDamage' },
  { id: 'criticalResist', icon: 'Icon_CriticalResist', type: 'criticalResist' },
  { id: 'criticalDamageResist', icon: 'Icon_CriticalMultResist', type: 'criticalDamageResist' },
  { id: 'attackSpeed', icon: 'Icon_AttackSpeed', type: 'attackSpeed' },
];

export const ArtifactModal = ({
  isOpen,
  onClose,
  apostleId,
  apostleName,
  slotIndex,
  currentArtifactId,
}: ArtifactModalProps) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState<number | null>(null);

  const equipArtifact = useDeckStore((state) => state.equipArtifact);
  const unequipArtifact = useDeckStore((state) => state.unequipArtifact);

  // When modal is opened, reset selected artifact to currently equipped one
  React.useEffect(() => {
    if (isOpen) {
      setSelectedArtifactId(currentArtifactId);
    }
  }, [isOpen, currentArtifactId]);

  const handleFilterToggle = (filterType: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterType) ? prev.filter((f) => f !== filterType) : [...prev, filterType],
    );
  };

  const filteredArtifacts = useMemo(() => {
    let artifacts = artifactData.artifacts;

    if (selectedFilters.length > 0) {
      artifacts = artifacts.filter((artifact) =>
        artifact.options.some((opt) => selectedFilters.includes(opt.type)),
      );
    }

    return [...artifacts].sort((a, b) => {
      const coinDiff = (b.coin || 0) - (a.coin || 0);
      if (coinDiff !== 0) return coinDiff;
      return a.id - b.id;
    });
  }, [selectedFilters]);

  const handleApply = () => {
    if (apostleId && slotIndex !== null && selectedArtifactId !== null) {
      equipArtifact(apostleId, slotIndex, selectedArtifactId);
    }
    onClose();
  };

  const handleClear = () => {
    if (apostleId && slotIndex !== null) {
      unequipArtifact(apostleId, slotIndex);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box w-full max-w-xl max-h-[70vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <h2 className="text-xl font-bold">{`${apostleName ?? ''} 아티팩트 선택`}</h2>
        </div>

        {/* Filters */}
        <div className="flex px-2 py-2 gap-2 justify-center flex-wrap">
          {STAT_FILTERS.map((filter) => {
            const isActive = selectedFilters.includes(filter.type);
            return (
              <button
                key={filter.id}
                onClick={() => handleFilterToggle(filter.type)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 scale-110'
                    : 'border-transparent hover:bg-base-200'
                }`}
                title={filter.type} // TODO: Add proper Korean labels to title if possible
              >
                <img
                  src={getIconPath(filter.icon)}
                  alt={filter.type}
                  className="h-8 w-8 object-contain"
                />
              </button>
            );
          })}
        </div>

        {/* Artifact Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-green-50/50">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {filteredArtifacts.map((artifact) => {
              const isSelected = selectedArtifactId === artifact.id;
              const gradeNum = GRADE_TO_NUM[artifact.grade] || 1;
              const gradeBgPath = getArtifactGradeBgPath(gradeNum);
              const costBgPath = getCostBgPath();

              return (
                <button
                  key={artifact.id}
                  onClick={() => setSelectedArtifactId(artifact.id)}
                  className={`relative overflow-hidden rounded-lg transition-transform flex items-center justify-center p-1 ${
                    isSelected
                      ? 'ring-4 ring-primary scale-105'
                      : 'hover:scale-105 ring-1 ring-base-300'
                  }`}
                >
                  <img
                    src={gradeBgPath}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <img
                    src={getArtifactImagePath(artifact.id.toString())}
                    alt={artifact.name}
                    className="relative z-10 w-[95%] h-[95%] object-contain drop-shadow-md pb-4"
                    onError={(e) => {
                      // placeholder 처리 시도, 혹은 빈 이미지로 표시
                      (e.target as HTMLImageElement).src = getArtifactImagePath('placeholder');
                    }}
                  />
                  {/* 동전(비용) 표시 부분 - 필요 시 추가 */}
                  {artifact.coin != null && (
                    <div
                      className="absolute top-1 left-1 flex items-center justify-center w-[26px] h-[26px] bg-contain bg-center bg-no-repeat text-[11px] font-black text-white tracking-tighter z-20"
                      style={{
                        backgroundImage: `url(${costBgPath})`,
                        textShadow:
                          '0px 1.5px 2px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.4), 1px -1px 0 rgba(0,0,0,0.4), -1px 1px 0 rgba(0,0,0,0.4), 1px 1px 0 rgba(0,0,0,0.4)',
                      }}
                    >
                      <span className="mt-[2px] ml-px">{artifact.coin}</span>
                    </div>
                  )}
                  <div className="absolute right-0 bottom-0 left-0 bg-black/60 px-1 py-1 text-center z-20">
                    <p className="font-bold text-white text-xs">{artifact.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-base-200 bg-base-100 justify-end">
          <button onClick={onClose} className="btn btn-ghost">
            아니오
          </button>
          <button
            onClick={handleClear}
            className="btn btn-error btn-outline"
            disabled={!currentArtifactId}
          >
            슬롯 비우기
          </button>
          <button
            onClick={handleApply}
            className="btn btn-primary"
            disabled={selectedArtifactId === null}
          >
            그래요
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};
