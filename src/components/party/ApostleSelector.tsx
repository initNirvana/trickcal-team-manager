import React, { useState, useMemo } from "react";
import type { Apostle } from "../../types/apostle";
import { getPersonalities, isValidPosition } from "../../types/apostle";
import {
  getPersonalityBackgroundClass,
  getPersonalityIconPath,
} from "../../utils/apostleUtils";
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";

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
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(
    null
  );
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const isRemoveButtonEnabled =
    currentApostle !== undefined && currentApostle !== null;

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
        return a.name.localeCompare(b.name, "ko");
      });
  }, [apostles, selectedSlot, selectedPersonality, selectedRank]);

  const getRequiredPosition = (slot: number | null): string => {
    if (!slot) return "전체";
    if ([1, 4, 7].includes(slot)) return "후열";
    if ([2, 5, 8].includes(slot)) return "중열";
    return "전열";
  };

  const getRankIconPath = (rank: number): string => {
    return `/src/assets/icon/${rank}성.webp`;
  };

  const getApostleImagePath = (apostleName: string): string => {
    return `/src/assets/apostles/${apostleName}.webp`;
  };

  // 가능한 성격 목록
  const personalities = ["Mad", "Gloomy", "Naive", "Jolly", "Cool"];

  // 가능한 랭크 목록
  const ranks = [3, 2, 1];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[60vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <h2 className="text-2xl font-bold whitespace-nowrap min-w-fit">
          {getRequiredPosition(selectedSlot)} 선택
        </h2>

        {/* 성격 필터 | 등급 필터 */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {personalities.map((personality) => (
              <button
                key={personality}
                onClick={() =>
                  setSelectedPersonality(
                    selectedPersonality === personality ? null : personality
                  )
                }
                className={`relative w-9 h-9 rounded-lg transition transform hover:scale-50 ${
                  selectedPersonality === personality
                    ? "ring-2 ring-offset-1 ring-blue-500 scale-110"
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                }`}
                title={personality}
              >
                <img
                  src={getPersonalityIconPath(personality)}
                  alt={personality}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/src/assets/placeholder.png";
                  }}
                />
              </button>
            ))}
            {/* 등급 필터 */}
            {ranks.map((rank) => (
              <button
                key={rank}
                onClick={() =>
                  setSelectedRank(selectedRank === rank ? null : rank)
                }
                className={`relative w-9 h-9 rounded-lg transition transform ${
                  selectedRank === rank
                    ? "ring-2 ring-offset-1 ring-blue-500"
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                }`}
                title={`${rank}성`}
              >
                <img
                  src={getRankIconPath(rank)}
                  alt={`${rank}성`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/src/assets/placeholder.png";
                  }}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              color={isRemoveButtonEnabled ? "red" : "gray"}
              size="sm"
              disabled={!isRemoveButtonEnabled}
              onClick={() => {
                if (isRemoveButtonEnabled && onRemove) {
                  onRemove();
                }
              }}
              aria-label="Remove apostle from slot"
              className="flex items-center gap-1"
              title={
                isRemoveButtonEnabled ? "슬롯 비우기" : "배치된 사도가 없습니다"
              }
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
            <div className="col-span-5 text-center py-12 text-gray-500">
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
                    primaryPersonality
                  )} text-white p-3 rounded-lg cursor-pointer hover:shadow-md transition h-30 flex flex-col items-center justify-between overflow-hidden`}
                >
                  {/* 사도 이미지 */}
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img
                      src={getApostleImagePath(apostle.name)}
                      alt={apostle.name}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  {/* 사도 이름 */}
                  <div className="text-xs font-semibold text-center truncate w-full">
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
