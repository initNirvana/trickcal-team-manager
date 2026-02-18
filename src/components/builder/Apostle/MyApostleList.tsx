import { useCallback, useMemo, useState } from 'react';
import { useUniqueApostles } from '@/hooks/useUniqueApostles';
import { useMyApostleStore } from '@/stores/myApostleStore';
import type { Apostle } from '@/types/apostle';
import ApostleSelectorSearch from '../../common/ApostleSearch';
import ApostleItem from './ApostleItem';

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

  const handleSort = useCallback(
    (sortType: 'name' | 'persona' | 'id') => {
      if (sortBy === sortType) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(sortType);
        setSortOrder('asc');
      }
    },
    [sortBy],
  );

  const handleAddApostle = useCallback(
    (apostle: Apostle) => {
      if (myApostles.some((a) => a.id === apostle.id)) return;
      onAdd(apostle);
    },
    [myApostles, onAdd],
  );

  const onToggle = useCallback(
    (apostle: Apostle) => {
      const isOwned = myApostles.some((m) => m.id === apostle.id);
      if (isOwned) {
        onRemove(apostle);
      } else {
        handleAddApostle(apostle);
      }
    },
    [myApostles, onRemove, handleAddApostle],
  );

  const handleAddMultipleApostles = useCallback(
    (newApostles: Apostle[]) => {
      const toAdd = newApostles.filter((a) => !myApostles.some((m) => m.id === a.id));

      if (toAdd.length > 0) {
        if (onAddMultiple) {
          onAddMultiple(toAdd);
        } else {
          toAdd.forEach(onAdd);
        }
      }
    },
    [myApostles, onAddMultiple, onAdd],
  );

  const handleRemoveAll = useCallback(() => {
    if (onRemoveMultiple) {
      onRemoveMultiple(myApostles);
    } else {
      myApostles.forEach((apostle) => {
        onRemove(apostle);
      });
    }
  }, [myApostles, onRemoveMultiple, onRemove]);

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

  const rawUniqueApostles = useUniqueApostles(sortedApostles);

  const uniqueApostles = useMemo(() => {
    return rawUniqueApostles.map((apostle) => {
      if (apostle.engName === 'Uros') {
        return { ...apostle, persona: 'Resonance' as const };
      }
      return apostle;
    });
  }, [rawUniqueApostles]);

  const myApostleIds = useMemo(() => new Set(myApostles.map((a) => a.id)), [myApostles]);

  const multiPersonaMap = useMemo(() => {
    const counts = new Map<string, number>();
    allApostles.forEach((a) => {
      counts.set(a.engName, (counts.get(a.engName) || 0) + 1);
    });
    return counts;
  }, [allApostles]);

  return (
    <div id="my-apostle-list-container" className="bg-base-200 space-y-2 rounded-xl p-4 shadow-lg">
      {/* 헤더 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-2xl font-bold">보유 사도 </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSort('id')}
            className={`btn btn-sm h-8 min-h-0 w-auto gap-0 rounded-md px-3 text-xs font-semibold whitespace-nowrap shadow-sm transition ${
              sortBy === 'id' ? 'btn-info text-black' : 'bg-slate-50'
            }`}
          >
            순서
          </button>
          <button
            onClick={() => handleSort('name')}
            className={`btn btn-sm h-8 min-h-0 w-auto gap-0 rounded-md px-3 text-xs font-semibold whitespace-nowrap shadow-sm transition ${
              sortBy === 'name' ? 'btn-info text-black' : 'bg-slate-50'
            }`}
          >
            이름
          </button>
          <button
            onClick={() => handleSort('persona')}
            className={`btn btn-sm h-8 min-h-0 w-auto gap-0 rounded-md px-3 text-xs font-semibold whitespace-nowrap shadow-sm transition ${
              sortBy === 'persona' ? 'btn-info text-black' : 'bg-slate-50'
            }`}
          >
            성격
          </button>

          <div className="divider divider-horizontal mx-0"></div>

          <button
            id="btn-apostle-select-all"
            onClick={() => handleAddMultipleApostles(uniqueApostles)}
            className="btn btn-success btn-sm rounded px-2 py-1 text-xs font-semibold text-black shadow-sm transition"
          >
            전체 선택
          </button>

          {myApostles.length > 0 && (
            <button
              onClick={handleRemoveAll}
              className="btn btn-error btn-sm rounded px-2 py-1 text-xs font-semibold text-black shadow-sm transition"
            >
              전체 제거
            </button>
          )}
        </div>
      </div>

      {/* 검색 */}
      <ApostleSelectorSearch apostles={uniqueApostles} onSelect={onToggle} />

      {/* 추가 가능한 캐릭 - 작은 그리드 (Mobile: 3열, Desktop: 5열) */}
      <div className="grid max-h-[70dvh] grid-cols-3 gap-2 overflow-y-auto px-2 sm:grid-cols-5">
        {uniqueApostles.map((apostle) => {
          const isOwned = myApostleIds.has(apostle.id);
          const asideLevel = getAsideLevel(apostle.id);

          // 같은 engName을 가진 사도가 여러 개인지 확인 (성격별 변형이 있는 경우)
          const hasMultiplePersonas = (multiPersonaMap.get(apostle.engName) || 0) > 1;

          return (
            <ApostleItem
              key={apostle.id}
              apostle={apostle}
              isOwned={isOwned}
              asideLevel={asideLevel}
              hasMultiplePersonas={hasMultiplePersonas}
              onToggle={onToggle}
              onSetAsideLevel={setAsideLevel}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MyApostleList;
