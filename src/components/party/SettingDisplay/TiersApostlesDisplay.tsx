import { useState } from 'react';
import { getApostleImagePath, getPositionIconPath, getClassIconPath } from '@/utils/apostleImages';
import { Position, POSITION_CONFIG, Personality, Apostle } from '@/types/apostle';
import { getPersonalityBackground, getPersonalityKoreanName } from '@/utils/apostleUtils';
import PersonalityDropdown from '@/components/common/PersonalityDropdown';
import apostlesTiersData from '@/data/apostles-recommend.json';
import apostlesData from '@/data/apostles.json';

interface ApostleData {
  name: string;
  engName: string;
  position: string;
  description?: string;
  persona: string;
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

interface ApostleCardProps {
  apostle: ApostleData;
}

// ===== 사도 카드 =====
const ApostleCard = ({ apostle }: ApostleCardProps) => {
  // 전체 데이터에서 해당 사도의 Role 정보 찾기
  // apostlesData has the shape { apostles: Apostle[] }
  const fullApostleData = (apostlesData as unknown as { apostles: Apostle[] }).apostles.find(
    (a) => a.engName === apostle.engName,
  );
  const mainRole = fullApostleData?.role.main;

  return (
    <div className="group border-base-200 bg-base-100 hover:border-primary relative aspect-square w-20 cursor-pointer overflow-hidden rounded-lg border-2 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md">
      {/* 사도 이미지 */}
      <img
        src={getApostleImagePath(apostle.engName)}
        className={`inline-flex h-full w-full items-center rounded object-cover text-center text-xs ${getPersonalityBackground(apostle.persona as Personality)}`}
        alt={apostle.name}
      />

      {/* 위치 아이콘 */}
      <div className="absolute bottom-5 left-0.5 h-5 w-5 rounded-full">
        <img
          src={getPositionIconPath(
            POSITION_CONFIG[apostle.position as keyof typeof POSITION_CONFIG]?.icon ||
              'Common_PositionFront',
          )}
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* 클래스 아이콘 (Role 정보가 있을 때만 표시) */}
      {mainRole && (
        <div className="absolute bottom-11 left-0.5 h-5 w-5 rounded-full">
          <img
            src={getClassIconPath(mainRole)}
            className="h-full w-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* 사도 이름 오버레이 */}
      <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-1 text-center">
        <p className="group-hover:text-primary-content text-[10px] font-bold text-white">
          {apostle.name}
        </p>
      </div>
    </div>
  );
};

// ===== 티어 행 =====
const TierRow = ({ tier, apostles }: { tier: string; apostles: ApostleData[] }) => {
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

// ===== 메인 컴포넌트 =====
export function RecommendedApostlesDisplay() {
  const APOSTLES_BY_PERSONALITY = apostlesTiersData.tiers as Record<
    string,
    { S: ApostleData[]; A: ApostleData[]; B: ApostleData[] }
  >;

  const personalities = Object.keys(APOSTLES_BY_PERSONALITY) as Personality[];

  const positions: Position[] = ['front', 'mid', 'back'];

  // ===== 상태 관리 =====
  const [selectedPersonalities, setSelectedPersonalities] = useState<Set<Personality>>(new Set()); // 초기: 선택 없음 (전체)
  const [selectedPosition, setSelectedPosition] = useState<Position>('front'); // 초기: 전열

  // ===== 성격 토글 함수 =====
  const togglePersonality = (personality: Personality | null) => {
    if (personality === null) {
      setSelectedPersonalities(new Set());
      return;
    }

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
    selectedPersonalities.size === 0
      ? '전체'
      : Array.from(selectedPersonalities)
          .map((p) => getPersonalityKoreanName(p))
          .join(', ');

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
        {/* 위치 선택 버튼 - Join 사용 */}
        <div className="join">
          {positions.map((position) => (
            <button
              key={position}
              onClick={() => setSelectedPosition(position)}
              className={`btn join-item ${selectedPosition === position ? 'btn-active btn-primary' : ''}`}
            >
              <img
                src={getPositionIconPath(
                  POSITION_CONFIG[position as keyof typeof POSITION_CONFIG]?.icon ||
                    'Common_PositionFront',
                )}
                alt={POSITION_CONFIG[position].label}
                className="h-5 w-5"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              {POSITION_CONFIG[position].label}
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

      {/* 타이틀 & 카운트 */}
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900 dark:text-white">
          {displayPersonalityText} 성격 / {POSITION_CONFIG[selectedPosition].label}
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
      {/* 팁 - Alert 사용 */}
      <div role="alert" className="alert alert-success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-6 w-6 shrink-0 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div>
          <h3 className="font-bold">Tip!</h3>
          <ul className="list-inside list-disc text-sm">
            <li>9인 PVE의 경우 받는 피해량 감소가 중요합니다.</li>
            <li>대표적인 피해 감소량 사도는 슈로, 벨라(A2)입니다.</li>
            <li>
              티어 선정 기준 ref:{' '}
              <a
                href="https://arca.live/b/trickcal/145428369"
                target="_blank"
                rel="noreferrer"
                className="link"
              >
                아카라이브 공략 채널
              </a>
            </li>
            <li>
              대충돌/프론티어 기록:{' '}
              <a
                href="https://trickcalrecord.pages.dev/"
                target="_blank"
                rel="noreferrer"
                className="link"
              >
                Trickcal Record
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RecommendedApostlesDisplay;
