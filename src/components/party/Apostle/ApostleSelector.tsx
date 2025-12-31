import { useState, useMemo } from 'react';
import type { Apostle, Personality } from '@/types/apostle';
import {
  getPersonalityKoreanName,
  isValidPosition,
  getPersonalityBackground,
} from '@/utils/apostleUtils';
import {
  getPersonalityIconPath,
  getApostleImagePath,
  getRankIconPath,
} from '@/utils/apostleImages';
import Image from '../../common/Image';
import ApostleSelectorSearch from '../../common/ApostleSearch';

interface ApostleSelectorProps {
  apostles: Apostle[];
  selectedSlot: number | null;
  currentApostle?: Apostle;
  onSelect: (apostle: Apostle) => void;
  onRemove?: () => void;
  onClose: () => void;
}

const ApostleSelector = ({
  apostles,
  selectedSlot,
  currentApostle,
  onSelect,
  onRemove,
  onClose,
}: ApostleSelectorProps) => {
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const isRemoveButtonEnabled = currentApostle !== undefined && currentApostle !== null;

  const handleSelectApostle = (apostle: Apostle) => {
    onSelect(apostle);
  };

  const positionFilteredApostles = useMemo(() => {
    return apostles.filter((apostle) => {
      if (selectedSlot && !isValidPosition(apostle, selectedSlot)) {
        return false;
      }
      return true;
    });
  }, [apostles, selectedSlot]);

  const filteredApostles = useMemo(() => {
    return positionFilteredApostles.filter((apostle) => {
      if (selectedPersonality && apostle.persona !== selectedPersonality) {
        return false;
      }
      if (selectedRank !== null && apostle.rank !== selectedRank) {
        return false;
      }
      return true;
    });
  }, [positionFilteredApostles, selectedPersonality, selectedRank]);

  const getRequiredPosition = (slot: number | null): string => {
    if (!slot) return '전체';
    if ([1, 4, 7].includes(slot)) return '후열';
    if ([2, 5, 8].includes(slot)) return '중열';
    return '전열';
  };

  // 가능한 성격 목록
  const personalities: Personality[] = ['Mad', 'Gloomy', 'Naive', 'Jolly', 'Cool'];

  // 가능한 랭크 목록
  const ranks = [3, 2, 1];

  return (
    <div className="modal-box max-h-[50vh] max-w-xl space-y-1.5 overflow-y-auto rounded-lg">
      {/* 헤더 */}
      <div className="grid grid-cols-2 items-center">
        <h2 className="text-2xl font-bold">{getRequiredPosition(selectedSlot)} 선택</h2>

        <div className="flex items-center justify-end gap-2">
          <button
            className={`btn btn-sm ${isRemoveButtonEnabled ? 'btn-error' : 'btn-disabled'}`}
            disabled={!isRemoveButtonEnabled}
            onClick={() => {
              if (isRemoveButtonEnabled && onRemove) {
                onRemove();
              }
            }}
            title={isRemoveButtonEnabled ? '슬롯 비우기' : '배치된 사도가 없습니다'}
          >
            그렇게 됐어요
          </button>
          <button className="btn btn-sm" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>

      {/* 사도 검색기 */}
      <ApostleSelectorSearch apostles={positionFilteredApostles} onSelect={handleSelectApostle} />

      {/* 성격 필터 | 등급 필터 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {personalities.map((personality) => (
            <button
              key={personality}
              onClick={() =>
                setSelectedPersonality(selectedPersonality === personality ? null : personality)
              }
              className={`relative h-9 w-9 transform rounded-lg transition hover:scale-50 ${
                selectedPersonality === personality
                  ? 'scale-110'
                  : 'opacity-60 hover:scale-105 hover:opacity-100'
              }`}
              title={getPersonalityKoreanName(personality)}
            >
              <img
                src={getPersonalityIconPath(personality)}
                alt={personality}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/src/assets/placeholder.png';
                }}
              />
            </button>
          ))}
          {/* 등급 필터 */}
          {ranks.map((rank) => (
            <button
              key={rank}
              onClick={() => setSelectedRank(selectedRank === rank ? null : rank)}
              className={`relative h-9 w-9 transform rounded-lg transition ${
                selectedRank === rank ? 'scale-110' : 'opacity-60 hover:scale-105 hover:opacity-100'
              }`}
              title={`${rank}성`}
            >
              <Image src={getRankIconPath(rank)} alt={`${rank}성`} />
              <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                <span className="text-sm font-bold text-black">{rank}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 사도 그리드 - 5열 */}
      <div className="rounded-2xlsm:grid-cols-3 grid grid-cols-3 gap-1 md:grid-cols-5">
        {filteredApostles.length === 0 ? (
          <div className="col-span-5 py-6 text-center text-gray-500">
            배치 가능한 사도가 없습니다.
          </div>
        ) : (
          filteredApostles.map((apostle) => {
            const displayPersonality = apostle.persona;
            return (
              <div
                key={apostle.id}
                onClick={() => onSelect(apostle)}
                className={`${getPersonalityBackground(
                  displayPersonality,
                )} relative h-24 cursor-pointer flex-col items-center rounded-2xl transition-all hover:scale-105 hover:shadow-lg`}
              >
                {/* 사도 이미지 */}
                <img
                  src={getApostleImagePath(apostle.engName)}
                  className={`h-full w-full rounded-2xl object-cover`}
                  alt={apostle.name}
                />

                {/* 이름 표시 */}
                <div className="absolute right-0 bottom-0 left-0 rounded-2xl bg-black/60 px-2 py-1 text-center">
                  <p className="text-xs font-semibold text-white">{apostle.name}</p>
                </div>

                {/* 성격 아이콘 - 우상단 */}
                <div className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full">
                  <img src={getPersonalityIconPath(displayPersonality)} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ApostleSelector;
