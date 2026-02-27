import { memo } from 'react';
import type { CardItem, CardType } from '@/types/card';
import {
  getArtifactGradeBgPath,
  getArtifactImagePath,
  getCostBgPath,
  getSpellImagePath,
} from '@/utils/apostleImages';
import { StatDisplay } from './StatDisplay';

const GRADE_TO_NUM: Record<string, number> = {
  일반: 1,
  고급: 2,
  희귀: 3,
  전설: 4,
};

interface CardListItemProps {
  item: CardItem;
  level: number;
  activeTab: CardType;
  onLevelChange: (cardId: string, value: string) => void;
}

/**
 * 개별 카드 항목 컴포넌트 (Memoized)
 */
export const CardListItem = memo(({ item, level, activeTab, onLevelChange }: CardListItemProps) => {
  const isArtifact = activeTab === 'artifact';
  const gradeNum = GRADE_TO_NUM[item.grade] || 1;
  const imgPath = isArtifact
    ? getArtifactImagePath(item.id.toString())
    : getSpellImagePath(item.id.toString());
  const gradeBgPath = getArtifactGradeBgPath(gradeNum);
  const costBgPath = getCostBgPath();

  // 배경색 클래스 계산
  const bgClass = isArtifact ? 'bg-[#e4ebc0]/40' : 'bg-[#e6f4d8]/40';

  return (
    <li
      className={`list-row items-center gap-3 px-3 py-2 hover:bg-base-200 transition-colors duration-200 ${bgClass}`}
    >
      {/* 아이콘 및 등급 배경 */}
      <div className="w-[84px] h-[84px] shrink-0 relative flex items-center justify-center rounded-lg bg-base-100/50 shadow-sm">
        <img
          src={gradeBgPath}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
        />
        <img
          src={imgPath}
          alt={item.name}
          loading="lazy"
          className="w-[95%] h-[95%] object-contain drop-shadow-md"
        />
      </div>

      {/* 정보 영역 */}
      <div className="list-col-grow flex flex-col justify-center gap-1.5">
        <div className="font-extrabold text-[#2a323c] flex items-center gap-1.5">
          <div
            className="flex items-center justify-center w-[26px] h-[26px] shrink-0 bg-contain bg-center bg-no-repeat text-xs font-black text-white tracking-tighter"
            style={{
              backgroundImage: `url(${costBgPath})`,
              textShadow:
                '0px 1.5px 2px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.4), 1px -1px 0 rgba(0,0,0,0.4), -1px 1px 0 rgba(0,0,0,0.4), 1px 1px 0 rgba(0,0,0,0.4)',
            }}
          >
            <span className="mt-[2px] ml-px">{item.coin}</span>
          </div>
          <span className="truncate text-[15px]">{item.name}</span>
        </div>

        <div className="w-full relative">
          <StatDisplay item={item} />
        </div>

        {/* 레벨 조절 */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-gray-800">Lv.</span>
          <input
            type="number"
            min={1}
            max={10}
            value={level}
            onChange={(e) => onLevelChange(item.typeId, e.target.value)}
            className="input input-sm border-gray-300 w-16 bg-white text-center font-bold text-black"
          />
          {/* <span className="text-xs font-bold text-gray-500 ml-auto mr-2">/ MAX 10</span> */}
        </div>
      </div>
    </li>
  );
});

CardListItem.displayName = 'CardListItem';
