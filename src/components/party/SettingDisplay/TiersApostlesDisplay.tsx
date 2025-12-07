import React, { useState } from 'react';
import { getApostleImagePath, getPositionIconPath } from '../../../utils/apostleUtils';
import { HiOutlineExclamation } from 'react-icons/hi';
import Image from '../../common/Image';
import apostlesTiersData from '../../../data/apostles-recommend.json';

interface ApostleData {
  name: string;
  engName: string;
  position: string;
}

// ===== 티어 색상 및 설정 =====
const tierConfig = {
  S: {
    color: 'red' as const,
    bgColor: 'bg-red-100 dark:bg-red-900',
    borderColor: 'border-red-300 dark:border-red-700',
    label: '최상급',
  },
  A: {
    color: 'orange' as const,
    bgColor: 'bg-amber-100 dark:bg-amber-900',
    borderColor: 'border-amber-300 dark:border-amber-700',
    label: '상급',
  },
  B: {
    color: 'blue' as const,
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    borderColor: 'border-blue-300 dark:border-blue-700',
    label: '중급',
  },
};

// ===== 위치 설정 (아이콘 이미지) =====
const positionConfig = {
  전열: { icon: 'Common_PositionFront', label: '전열' },
  중열: { icon: 'Common_PositionMiddle', label: '중열' },
  후열: { icon: 'Common_PositionBack', label: '후열' },
};

// ===== 사도 카드 =====
const ApostleCard: React.FC<{ apostle: ApostleData }> = ({ apostle }) => (
  <div className="group flex flex-col items-center gap-1">
    <div className="relative h-24 w-20 overflow-hidden rounded-lg border-2 border-gray-300 transition hover:shadow-lg dark:border-gray-600">
      <Image
        src={getApostleImagePath(apostle.engName)}
        alt={apostle.name}
        className="h-full w-full object-cover"
      />
      {/* 위치 아이콘 배지 */}
      <div className="absolute bottom-1 left-1 h-6 w-6 rounded-full border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
        <img
          src={getPositionIconPath(
            positionConfig[apostle.position as keyof typeof positionConfig].icon,
          )}
          alt={apostle.position}
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    </div>
    {/* 사도명 */}
    <span className="text-center text-xs font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
      {apostle.name}
    </span>
  </div>
);

// ===== 티어 행 =====
const TierRow: React.FC<{
  tier: string;
  apostles: ApostleData[];
}> = ({ tier, apostles }) => {
  const config = tierConfig[tier as keyof typeof tierConfig];

  return (
    <div className={`flex items-stretch overflow-hidden rounded-lg border-2 ${config.borderColor}`}>
      {/* 티어 레이블 */}
      <div
        className={`flex w-20 items-center justify-center text-3xl font-bold text-white ${config.bgColor}`}
      >
        {tier}
      </div>

      {/* 사도 영역 */}
      <div
        className={`flex flex-1 flex-wrap content-start items-start gap-0.5 p-1 ${config.bgColor}`}
      >
        {apostles.length > 0 ? (
          apostles.map((apostle, idx) => <ApostleCard key={`${tier}-${idx}`} apostle={apostle} />)
        ) : (
          <div className="flex h-32 w-full items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-sm">사도 없음</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== 성격 드롭다운 메뉴 (커스텀) =====
const PersonalityDropdown: React.FC<{
  personalities: string[];
  selectedPersonalities: Set<string>;
  onToggle: (personality: string) => void;
}> = ({ personalities, selectedPersonalities, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="btn transition">
        성격선택 {selectedPersonalities.size > 0 && `(${selectedPersonalities.size})`}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 min-w-max rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {personalities.map((personality) => (
            <label
              key={personality}
              className="flex cursor-pointer items-center gap-3 border-b border-gray-200 px-4 py-2 last:border-b-0 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <input
                type="checkbox"
                checked={selectedPersonalities.has(personality)}
                onChange={() => onToggle(personality)}
                className="cursor-pointer"
              />
              <span className="text-sm text-gray-900 dark:text-white">{personality}</span>
            </label>
          ))}
        </div>
      )}

      {/* 배경 클릭으로 닫기 */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

// ===== 메인 컴포넌트 =====
export function RecommendedApostlesDisplay() {
  const APOSTLES_BY_PERSONALITY = apostlesTiersData.tiers as Record<
    string,
    { S: any[]; A: any[]; B: any[] }
  >;

  const personalities = Object.keys(APOSTLES_BY_PERSONALITY) as Array<
    keyof typeof APOSTLES_BY_PERSONALITY
  >;

  const positions = ['전열', '중열', '후열'];

  // ===== 상태 관리 =====
  const [selectedPersonalities, setSelectedPersonalities] = useState<Set<string>>(new Set()); // 초기: 선택 없음 (전체)
  const [selectedPosition, setSelectedPosition] = useState<string>('전열'); // 초기: 전열

  // ===== 성격 토글 함수 =====
  const togglePersonality = (personality: string) => {
    const newSet = new Set(selectedPersonalities);
    if (newSet.has(personality)) {
      newSet.delete(personality);
    } else {
      newSet.add(personality);
    }
    setSelectedPersonalities(newSet);
  };

  // ===== 필터링 된 사도 =====
  const filterApostles = (apostles: ApostleData[]) => {
    return apostles.filter((a) => a.position === selectedPosition);
  };

  // ===== 선택된 성격의 모든 사도 수집 =====
  const collectFilteredApostles = (tier: string) => {
    let result: ApostleData[] = [];

    // 성격 선택이 없으면 전체, 있으면 선택된 것만
    const targetPersonalities =
      selectedPersonalities.size === 0 ? personalities : Array.from(selectedPersonalities);

    targetPersonalities.forEach((personality) => {
      const apostles =
        APOSTLES_BY_PERSONALITY[personality as keyof typeof APOSTLES_BY_PERSONALITY][
          tier as 'S' | 'A' | 'B'
        ] || [];
      result = result.concat(apostles);
    });
    return filterApostles(result);
  };

  const filteredS = collectFilteredApostles('S');
  const filteredA = collectFilteredApostles('A');
  const filteredB = collectFilteredApostles('B');

  // ===== 표시될 성격 텍스트 =====
  const displayPersonalityText =
    selectedPersonalities.size === 0 ? '전체' : Array.from(selectedPersonalities).join(', ');

  return (
    <div className="space-y-1">
      {/* 헤더 */}
      <div className="space-y-1">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          위치와 성격을 선택하여 추천 사도를 확인하세요.
        </div>
      </div>

      {/* 필터 바 */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
        {/* 위치 선택 버튼 */}
        <div className="flex flex-wrap gap-2">
          {positions.map((position) => (
            <button
              key={position}
              color={selectedPosition === position ? 'blue' : 'gray'}
              onClick={() => setSelectedPosition(position)}
              className="btn flex items-center gap-1 transition"
            >
              <img
                src={getPositionIconPath(
                  positionConfig[position as keyof typeof positionConfig].icon,
                )}
                alt={position}
                className="h-5 w-5"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              {position}
            </button>
          ))}
        </div>

        {/* 성격 선택 드롭다운 (커스텀) */}
        <div className="ml-auto">
          <PersonalityDropdown
            personalities={personalities}
            selectedPersonalities={selectedPersonalities}
            onToggle={togglePersonality}
          />
        </div>
      </div>

      {/* 선택된 성격 태그 */}
      {selectedPersonalities.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from(selectedPersonalities).map((personality) => (
            <div
              key={personality}
              color="blue"
              className="badge badge-info cursor-pointer hover:opacity-75"
              onClick={() => togglePersonality(personality)}
            >
              {personality} ✕
            </div>
          ))}
        </div>
      )}

      {/* 타이틀 & 카운트 */}
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900 dark:text-white">
          {displayPersonalityText} 성격 / {selectedPosition === '전체' ? '전체' : selectedPosition}
        </p>
      </div>

      {/* 티어 메이커 영역 */}
      <div className="space-y-1">
        {/* S 티어 */}
        {filteredS.length > 0 && <TierRow tier="S" apostles={filteredS} />}

        {/* A 티어 */}
        {filteredA.length > 0 && <TierRow tier="A" apostles={filteredA} />}

        {/* B 티어 */}
        {filteredB.length > 0 && <TierRow tier="B" apostles={filteredB} />}

        {/* 빈 상태 */}
        {filteredS.length === 0 && filteredA.length === 0 && filteredB.length === 0 && (
          <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">
              선택한 조건에 해당하는 사도가 없습니다.
            </p>
          </div>
        )}
      </div>

      {/* 팁 */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
        <div className="text-sm text-green-900 dark:text-green-200">
          <ul className="list">
            <li>9인 PVE의 경우 받는 피해량 감소가 중요합니다.</li>
            <li>대표적인 피해 감소량 사도는 슈로, 벨라(A2)입니다.</li>
            <li>
              티어 선정 기준은 프론티어 공략 글을 참고 했습니다. 자세한 설명은 아래 링크 참고
              부탁드립니다.
              <ul>
                <li className="list-row">
                  <a href="https://arca.live/b/trickcal/145428369">
                    https://arca.live/b/trickcal/145428369
                  </a>
                </li>
              </ul>
            </li>
            <li>
              대충돌/프론티어 관련 기록을 정리해주시는 분이 계십니다. 링크 참고 부탁드립니다.
              <ul>
                <li className="list-row">
                  <a href="https://trickcalrecord.pages.dev/">https://trickcalrecord.pages.dev/</a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RecommendedApostlesDisplay;
