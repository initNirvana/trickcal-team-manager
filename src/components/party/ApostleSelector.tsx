import React, { useState, useMemo } from 'react';
import type { Apostle, Personality } from '../../types/apostle';
import { getPersonalities, isValidPosition } from '../../types/apostle';
import {
  getPersonalityBackgroundClass,
  getPersonalityIconPath,
  getApostleImagePath,
} from '../../utils/apostleUtils';
import { Button } from 'flowbite-react';

interface ApostleSelectorProps {
  apostles: Apostle[];
  selectedSlot: number | null;
  currentApostle?: Apostle;
  onSelect: (apostle: Apostle) => void;
  onRemove?: () => void;
  onClose: () => void;
}

const ApostleSelector: React.FC<ApostleSelectorProps> = ({
  apostles,
  selectedSlot,
  currentApostle,
  onSelect,
  onRemove,
  onClose,
}) => {
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const isRemoveButtonEnabled = currentApostle !== undefined && currentApostle !== null;

  const filteredApostles = useMemo(() => {
    return apostles
      .filter((apostle) => {
        if (selectedSlot && !isValidPosition(apostle, selectedSlot)) {
          return false;
        }

        // 성격 필터링
        if (selectedPersonality) {
          const personalities = getPersonalities(apostle);
          if (!personalities.includes(selectedPersonality)) {
            return false;
          }
        }

        // 랭크 필터링
        if (selectedRank !== null) {
          if (apostle.rank !== selectedRank) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        return a.name.localeCompare(b.name, 'ko');
      });
  }, [apostles, selectedSlot, selectedPersonality, selectedRank]);

  const getRequiredPosition = (slot: number | null): string => {
    if (!slot) return '전체';
    if ([1, 4, 7].includes(slot)) return '후열';
    if ([2, 5, 8].includes(slot)) return '중열';
    return '전열';
  };

  const getRankIconPath = (rank: number): string => {
    return `/src/assets/icon/${rank}성.webp`;
  };

  // 가능한 성격 목록
  const personalities: Personality[] = ['Mad', 'Gloomy', 'Naive', 'Jolly', 'Cool'];

  // 가능한 랭크 목록
  const ranks = [3, 2, 1];

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <div
        className="max-h-[60vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <h2 className="min-w-fit text-2xl font-bold whitespace-nowrap">
          {getRequiredPosition(selectedSlot)} 선택
        </h2>

        {/* 성격 필터 | 등급 필터 */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {personalities.map((personality) => (
              <button
                key={personality}
                onClick={() =>
                  setSelectedPersonality(selectedPersonality === personality ? null : personality)
                }
                className={`relative h-9 w-9 transform rounded-lg transition hover:scale-50 ${
                  selectedPersonality === personality
                    ? 'scale-110 ring-2 ring-blue-500 ring-offset-1'
                    : 'opacity-60 hover:scale-105 hover:opacity-100'
                }`}
                title={personality}
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
                  selectedRank === rank
                    ? 'ring-2 ring-blue-500 ring-offset-1'
                    : 'opacity-60 hover:scale-105 hover:opacity-100'
                }`}
                title={`${rank}성`}
              >
                <img
                  src={getRankIconPath(rank)}
                  alt={`${rank}성`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/src/assets/placeholder.png';
                  }}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              color={isRemoveButtonEnabled ? 'red' : 'gray'}
              size="sm"
              disabled={!isRemoveButtonEnabled}
              onClick={() => {
                if (isRemoveButtonEnabled && onRemove) {
                  onRemove();
                }
              }}
              aria-label="Remove apostle from slot"
              className="flex items-center gap-1"
              title={isRemoveButtonEnabled ? '슬롯 비우기' : '배치된 사도가 없습니다'}
            >
              <span className="hidden sm:inline">그렇게 됐어요</span>
            </Button>
            <Button color="gray" size="sm" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>

        {/* 사도 그리드 - 5열 */}
        <div className="grid grid-cols-5 gap-4">
          {filteredApostles.length === 0 ? (
            <div className="col-span-5 py-12 text-center text-gray-500">
              배치 가능한 사도가 없습니다.
            </div>
          ) : (
            filteredApostles.map((apostle) => {
              const primaryPersonality = getPersonalities(apostle)[0];
              return (
                <div
                  key={apostle.id}
                  onClick={() => onSelect(apostle)}
                  className={`${getPersonalityBackgroundClass(
                    primaryPersonality,
                  )} flex h-30 cursor-pointer flex-col items-center justify-between overflow-hidden rounded-lg p-3 text-white transition hover:shadow-md`}
                >
                  {/* 사도 이미지 */}
                  <div className="flex h-20 w-20 items-center justify-center">
                    <img
                      src={getApostleImagePath(apostle.engName)}
                      alt={apostle.name}
                      className="h-full w-full rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  {/* 사도 이름 */}
                  <div className="w-full truncate text-center text-xs font-semibold">
                    {apostle.name}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ApostleSelector;
