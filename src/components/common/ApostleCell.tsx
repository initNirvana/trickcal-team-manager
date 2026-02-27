import { memo } from 'react';
import { Apostle } from '@/types/apostle';
import {
  getApostleImagePath,
  getClassIconPath,
  getEmptyHeroImagePath,
  getPositionIconPath,
} from '@/utils/apostleImages';
import { getPersonalityBackground } from '@/utils/apostleUtils';

interface ApostleCellProps {
  index: number;
  apostle: Apostle | null | undefined;
  onClick: (idx: number) => void;
}

export const ApostleCell = memo(({ index, apostle, onClick }: ApostleCellProps) => {
  const handleClick = () => onClick(index);

  if (!apostle) {
    return (
      <div
        onClick={handleClick}
        className="rounded-box bg-base-100 flex aspect-square cursor-pointer items-center justify-center transition-all hover:scale-105 hover:shadow-md active:scale-95"
      >
        <img src={getEmptyHeroImagePath()} className="h-full w-full object-cover" alt="빈 슬롯" />
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`rounded-box group relative aspect-square cursor-pointer overflow-hidden border-2 shadow-sm transition-all hover:shadow-md ${getPersonalityBackground(apostle.persona)} border-transparent hover:scale-105 active:scale-95`}
    >
      {/* 위치 아이콘 */}
      <div className="absolute bottom-7 left-0.5 h-6 w-6 rounded-full">
        <img
          src={getPositionIconPath(apostle)}
          className="h-full w-full object-contain"
          alt="position"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* 클래스 아이콘 */}
      <div className="absolute bottom-13 left-0.5 h-6 w-6 rounded-full">
        <img
          src={getClassIconPath(apostle.role.main)}
          className="h-full w-full object-contain"
          alt="role"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      <img
        src={getApostleImagePath(apostle)}
        className="h-full w-full object-cover"
        alt={apostle.name}
      />

      <div className="absolute right-0 bottom-0 left-0 bg-black/60 px-2 py-1 text-center">
        <p className="truncate text-[12px] font-bold text-white sm:text-sm">{apostle.name}</p>
      </div>
    </div>
  );
});
