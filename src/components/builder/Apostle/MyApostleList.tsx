import { useState } from 'react';
import type { Apostle } from '@/types/apostle';
import { getApostleImagePath } from '@/utils/apostleImages';
import { getPersonalityBackground } from '@/utils/ApostleUtils';
import ApostleSelectorSearch from '../../common/ApostleSearch';

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
      onAdd(apostle);
    }
  };

  // 정렬
  const sortedApostles = [...allApostles];
  if (sortBy === 'name') {
    sortedApostles.sort((a, b) => {
      const result = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? result : -result;
    });
  } else if (sortBy === 'persona') {
    sortedApostles.sort((a, b) => {
      const result = (a.persona || '').localeCompare(b.persona || '');
      return sortOrder === 'asc' ? result : -result;
    });
  } else if (sortBy === 'id') {
    sortedApostles.sort((a, b) => {
      const result = a.id.localeCompare(b.id);
      return sortOrder === 'asc' ? result : -result;
    });
  }

  return (
    <div className="bg-base-200 space-y-2 rounded-xl p-4 shadow-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">보유 사도 </h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleSort('id')}
            className={`btn btn-circle rounded px-2 py-1 text-xs font-semibold transition ${
              sortBy === 'id' ? 'btn-info text-black' : 'bg-slate-50'
            }`}
            title={sortBy === 'id' ? (sortOrder === 'asc' ? '오름차순' : '내림차순') : ''}
          >
            순서
          </button>
          <button
            onClick={() => handleSort('name')}
            className={`btn btn-circle rounded px-2 py-1 text-xs font-semibold transition ${
              sortBy === 'name' ? 'btn-info text-black' : 'bg-slate-50'
            }`}
            title={sortBy === 'name' ? (sortOrder === 'asc' ? '오름차순' : '내림차순') : ''}
          >
            이름
          </button>
          <button
            onClick={() => handleSort('persona')}
            className={`btn btn-circle rounded px-2 py-1 text-xs font-semibold transition ${
              sortBy === 'persona' ? 'btn-info text-black' : 'bg-slate-50'
            }`}
            title={sortBy === 'persona' ? (sortOrder === 'asc' ? '오름차순' : '내림차순') : ''}
          >
            성격
          </button>

          <button
            onClick={() => {
              if (onAddMultiple) {
                const apostlesToAdd = allApostles.filter(
                  (apostle) => !myApostles.some((m) => m.id === apostle.id),
                );
                onAddMultiple(apostlesToAdd);
              } else {
                allApostles.forEach((apostle) => {
                  if (!myApostles.some((m) => m.id === apostle.id)) {
                    onAdd(apostle);
                  }
                });
              }
            }}
            className="btn btn-success rounded px-2 py-1 text-xs font-semibold text-black transition"
            title="모든 사도 추가"
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
              className="btn btn-error rounded px-2 py-1 text-xs font-semibold text-black transition"
              title="모든 사도 제거"
            >
              전체 제거
            </button>
          )}
        </div>
      </div>

      {/* 검색 */}
      <ApostleSelectorSearch apostles={allApostles} onSelect={onToggle} />

      {/* 추가 가능한 캐릭 - 작은 그리드 */}
      <div className="grid max-h-[70dvh] grid-cols-5 gap-2 overflow-y-auto px-2">
        {sortedApostles.map((apostle) => {
          const isOwned = myApostles.some((m) => m.id === apostle.id);

          return (
            <button
              key={apostle.id}
              onClick={() => {
                onToggle(apostle);
              }}
              className={`group relative min-h-14 overflow-hidden rounded-lg border-2 transition-all ${
                isOwned
                  ? 'border-success shadow-success/30 shadow-lg'
                  : 'border-transparent hover:scale-105 hover:shadow-lg'
              }`}
            >
              {/* 이미지 */}
              <img
                src={getApostleImagePath(apostle.engName)}
                className={`inline-flex h-full w-full items-center gap-1 rounded object-cover text-center text-xs transition-all ${getPersonalityBackground(apostle.persona)} ${!isOwned ? 'grayscale-30% brightness-75' : ''}`}
                alt={apostle.name}
              />

              {/* ✓ 보유 체크마크 - 우상단 */}
              {isOwned && (
                <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-400">
                  <span className="text-sm font-bold text-black">✓</span>
                </div>
              )}

              {/* 호버 오버레이 */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                <span className="text-sm font-bold text-white">{isOwned ? '보유중' : '추가'}</span>
              </div>

              {/* 이름 표시 */}
              <div className="absolute right-0 bottom-0 left-0 bg-black/60 px-2 py-1">
                <p className="text-xs font-semibold text-white">{apostle.name}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MyApostleList;
