import React, { memo } from 'react';
import type { Apostle } from '@/types/apostle';
import { getApostleImagePath } from '@/utils/apostleImages';
import { getPersonalityBackground } from '@/utils/apostleUtils';

interface ApostleItemProps {
  apostle: Apostle;
  isOwned: boolean;
  asideLevel: number;
  hasMultiplePersonas: boolean;
  onToggle: (apostle: Apostle) => void;
  onSetAsideLevel: (id: string, level: number) => void;
}

const ApostleItem = ({
  apostle,
  isOwned,
  asideLevel,
  hasMultiplePersonas,
  onToggle,
  onSetAsideLevel,
}: ApostleItemProps) => {
  // 공명 성격 대응으로 인한 배경 변경
  // TODO: 추후 기능 추가시 해당 상황 개선 필요
  const bgClass = hasMultiplePersonas
    ? 'bg-[linear-gradient(to_bottom,rgba(255,255,255,.5)),conic-gradient(at_center,#66C17C,#83B9EB,#EB839A,#EBDB83,#C683EC,#66C17C)]'
    : getPersonalityBackground(apostle.persona);

  const handleToggle = () => {
    onToggle(apostle);
  };

  const handleAsideToggle = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    onSetAsideLevel(apostle.id, asideLevel >= 2 ? 0 : 2);
  };

  return (
    <button
      type="button"
      className={`group relative min-h-20 w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-all sm:min-h-14 ${
        isOwned
          ? 'border-success shadow-success/30 shadow-lg'
          : 'border-transparent hover:scale-105 hover:shadow-lg'
      }`}
      onClick={handleToggle}
      aria-pressed={isOwned}
      aria-label={`${apostle.name}${isOwned ? ' 보유 중' : ' 미보유'}`}
    >
      {/* 이미지 */}
      <img
        src={getApostleImagePath(apostle)}
        className={`inline-flex h-full w-full items-center gap-1 rounded object-cover text-center text-xs transition-all ${bgClass} ${!isOwned ? 'brightness-75 grayscale-[0.3]' : ''}`}
      />

      {/* ✓ 보유 체크마크 - 우상단 (모바일에서 더 크게) */}
      {isOwned && (
        <div className="absolute top-1 right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-black/10 bg-green-400 shadow-sm sm:h-4 sm:w-4">
          <span className="text-xs leading-none font-bold text-black">✓</span>
        </div>
      )}

      {/* A2 토글 버튼 - 좌상단 (항상 표시 / 모바일 대응 - 더 크게) */}
      {isOwned && apostle.aside?.hasAside && (
        <div
          role="button"
          tabIndex={0}
          className={`absolute top-1 left-1 z-20 flex h-7 w-8 cursor-pointer items-center justify-center rounded border shadow-sm transition-all sm:h-5 sm:w-6 ${
            asideLevel >= 2
              ? 'border-black/20 bg-amber-400 text-black'
              : 'border-white/30 bg-black/40 text-white/70 hover:bg-black/60'
          }`}
          onClick={handleAsideToggle}
          aria-label={`${apostle.name} A2 레벨 토글`}
        >
          <span className="text-[10px] leading-none font-bold">A2</span>
        </div>
      )}

      {/* 제거 힌트 오버레이 (데스크탑 호버용) */}
      {isOwned && (
        <div className="absolute inset-0 z-10 hidden items-center justify-center bg-black/40 opacity-0 transition group-hover:flex group-hover:opacity-100">
          <span className="text-sm font-bold text-red-300 drop-shadow-md">제거</span>
        </div>
      )}

      {/* 이름 표시 */}
      <div className="absolute right-0 bottom-0 left-0 bg-black/70 px-2 py-0.5 text-left">
        <p className="truncate text-[12px] font-semibold text-white">{apostle.name}</p>
      </div>

      {!isOwned && (
        <div className="absolute inset-0 hidden items-center justify-center bg-black/30 opacity-0 transition group-hover:flex group-hover:opacity-100">
          <span className="text-sm font-bold text-white">추가</span>
        </div>
      )}
    </button>
  );
};

export default memo(ApostleItem);
