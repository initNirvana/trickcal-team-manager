import { useState, useMemo } from 'react';
import type { Apostle } from '@/types/apostle';
import { getApostleImagePath } from '@/utils/apostleImages';
import { getPersonalityBackground } from '@/utils/apostleUtils';
import { useUniqueApostles } from '@/hooks/useUniqueApostles';
import ApostleSelectorSearch from '../../common/ApostleSearch';
import { useMyApostleStore } from '@/stores/myApostleStore';

interface MyApostleListProps {
  myApostles: Apostle[];
  allApostles: Apostle[];
  onAdd: (apostle: Apostle) => void;
  onRemove: (apostle: Apostle) => void;
  onAddMultiple?: (apostles: Apostle[]) => void;
  onRemoveMultiple?: (apostles: Apostle[]) => void;
}

const MyApostleList = ({
  myApostles,
  allApostles,
  onAdd,
  onRemove,
  onAddMultiple,
  onRemoveMultiple,
}: MyApostleListProps) => {
  const [sortBy, setSortBy] = useState<'name' | 'persona' | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { setAsideLevel, getAsideLevel } = useMyApostleStore();

  const handleSort = (sortType: 'name' | 'persona' | 'id') => {
    if (sortBy === sortType) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sortType);
      setSortOrder('asc');
    }
  };

  const onToggle = (apostle: Apostle) => {
    const isOwned = myApostles.some((m) => m.id === apostle.id);
    if (isOwned) {
      onRemove(apostle);
    } else {
      handleAddApostle(apostle);
    }
  };

  const handleAddApostle = (apostle: Apostle) => {
    if (myApostles.some((a) => a.id === apostle.id)) return;
    onAdd(apostle);
  };

  const handleAddMultipleApostles = (newApostles: Apostle[]) => {
    const toAdd = newApostles.filter((a) => !myApostles.some((m) => m.id === a.id));

    if (toAdd.length > 0) {
      if (onAddMultiple) {
        onAddMultiple(toAdd);
      } else {
        toAdd.forEach(onAdd);
      }
    }
  };

  const sortedApostles = useMemo(() => {
    const sorted = [...allApostles];

    const sortFunctions = {
      name: (a: Apostle, b: Apostle) => a.name.localeCompare(b.name),
      persona: (a: Apostle, b: Apostle) => (a.persona || '').localeCompare(b.persona || ''),
      id: (a: Apostle, b: Apostle) => a.id.localeCompare(b.id),
    };

    sorted.sort(sortFunctions[sortBy]);
    return sortOrder === 'asc' ? sorted : sorted.reverse();
  }, [allApostles, sortBy, sortOrder]);

  // engName 기준 중복 제거 (성격별 변형 사도를 하나로 통합)
  const uniqueApostles = useUniqueApostles(sortedApostles);

  return (
    <div id="my-apostle-list-container" className="bg-base-200 space-y-2 rounded-xl p-4 shadow-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">보유 사도 </h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleSort('id')}
            className={`btn btn-circle rounded px-2 py-1 text-xs font-semibold shadow-sm transition ${
              sortBy === 'id' ? 'btn-info text-black' : 'bg-slate-50'
            }`}
          >
            순서
          </button>
          <button
            onClick={() => handleSort('name')}
            className={`btn btn-circle rounded px-2 py-1 text-xs font-semibold shadow-sm transition ${
              sortBy === 'name' ? 'btn-info text-black' : 'bg-slate-50'
            }`}
          >
            이름
          </button>
          <button
            onClick={() => handleSort('persona')}
            className={`btn btn-circle rounded px-2 py-1 text-xs font-semibold shadow-sm transition ${
              sortBy === 'persona' ? 'btn-info text-black' : 'bg-slate-50'
            }`}
          >
            성격
          </button>

          <button
            id="btn-apostle-select-all"
            onClick={() => handleAddMultipleApostles(uniqueApostles)}
            className="btn btn-success rounded px-2 py-1 text-xs font-semibold text-black shadow-sm transition"
          >
            전체 선택
          </button>

          {myApostles.length > 0 && (
            <button
              onClick={() => {
                if (onRemoveMultiple) {
                  onRemoveMultiple(myApostles);
                } else {
                  myApostles.forEach((apostle) => {
                    onRemove(apostle);
                  });
                }
              }}
              className="btn btn-error rounded px-2 py-1 text-xs font-semibold text-black shadow-sm transition"
            >
              전체 제거
            </button>
          )}
        </div>
      </div>

      {/* 검색 */}
      <ApostleSelectorSearch apostles={uniqueApostles} onSelect={onToggle} />

      {/* 추가 가능한 캐릭 - 작은 그리드 */}
      <div className="grid max-h-[70dvh] grid-cols-5 gap-2 overflow-y-auto px-2">
        {uniqueApostles.map((apostle) => {
          const isOwned = myApostles.some((m) => m.id === apostle.id);
          const asideLevel = getAsideLevel(apostle.id);

          // 같은 engName을 가진 사도가 여러 개인지 확인 (성격별 변형이 있는 경우)
          const hasMultiplePersonas =
            allApostles.filter((a) => a.engName === apostle.engName).length > 1;

          // 성격별 변형이 있으면 기본 배경, 없으면 성격 배경
          const bgClass = hasMultiplePersonas
            ? 'bg-[linear-gradient(to_bottom,rgba(255,255,255,.5)),conic-gradient(at_center,#66C17C,#83B9EB,#EB839A,#EBDB83,#C683EC,#66C17C)]'
            : getPersonalityBackground(apostle.persona);

          return (
            <div
              key={apostle.id}
              className={`group relative min-h-14 cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                isOwned
                  ? 'border-success shadow-success/30 shadow-lg'
                  : 'border-transparent hover:scale-105 hover:shadow-lg'
              }`}
              onClick={() => onToggle(apostle)}
            >
              {/* 이미지 */}
              <img
                src={getApostleImagePath(apostle.engName)}
                className={`inline-flex h-full w-full items-center gap-1 rounded object-cover text-center text-xs transition-all ${bgClass} ${!isOwned ? 'brightness-75 grayscale-[0.3]' : ''}`}
                alt={apostle.name}
              />

              {/* ✓ 보유 체크마크 - 우상단 */}
              {isOwned && (
                <div className="absolute top-1 right-1 z-10 flex h-4 w-4 items-center justify-center rounded-full border border-black/10 bg-green-400 shadow-sm">
                  <span className="text-xs leading-none font-bold text-black">✓</span>
                </div>
              )}

              {/* A2 토글 버튼 - 좌상단 (항상 표시 / 모바일 대응) */}
              {isOwned && (
                <div
                  className={`absolute top-1 left-1 z-20 flex h-5 w-6 cursor-pointer items-center justify-center rounded border shadow-sm transition-all sm:h-5 sm:w-6 ${
                    asideLevel >= 2
                      ? 'border-black/20 bg-amber-400 text-black'
                      : 'border-white/30 bg-black/40 text-white/70 hover:bg-black/60'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAsideLevel(apostle.id, asideLevel >= 2 ? 0 : 2);
                  }}
                >
                  <span className="text-[10px] leading-none font-bold">A2</span>
                </div>
              )}

              {/* 제거 힌트 오버레이 (데스크탑 호버용) */}
              {isOwned && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <span className="text-sm font-bold text-red-300 drop-shadow-md">제거</span>
                </div>
              )}

              {/* 이름 표시 */}
              <div className="absolute right-0 bottom-0 left-0 bg-black/60 px-2 py-0.5">
                <p className="truncate text-[10px] font-semibold text-white">{apostle.name}</p>
              </div>

              {!isOwned && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                  <span className="text-sm font-bold text-white">추가</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyApostleList;
