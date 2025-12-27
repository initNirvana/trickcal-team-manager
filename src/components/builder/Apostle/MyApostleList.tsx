import { useState } from 'react';
import type { Apostle } from '@/types/apostle';
import { getApostleImagePath } from '@/utils/apostleImages';
import { getPersonalityBackgroundClass } from '@/types/apostle';
import ApostleSelectorSearch from '../../common/ApostleSearch';

interface MyApostleListProps {
  myApostles: Apostle[];
  allApostles: Apostle[];
  onAdd: (apostle: Apostle) => void;
  onRemove: (apostle: Apostle) => void;
  onAddMultiple?: (apostles: Apostle[]) => void;
}

const MyApostleList = ({
  myApostles,
  allApostles,
  onAdd,
  onRemove,
  onAddMultiple,
}: MyApostleListProps) => {
  const [sortBy, setSortBy] = useState<'name' | 'persona' | 'id'>('id');

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
    sortedApostles.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'persona') {
    sortedApostles.sort((a, b) => (a.persona || '').localeCompare(b.persona || ''));
  } else if (sortBy === 'id') {
    sortedApostles.sort((a, b) => b.id.localeCompare(a.id));
  }

  return (
    <div className="bg-base-200 space-y-5 rounded-xl border-gray-700 p-6 shadow-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-black">보유 사도 </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('id')}
            className={`btn btn-circle rounded px-2 py-1 text-xs font-semibold transition ${
              sortBy === 'id' ? 'bg-blue-600 text-black' : 'bg-gray-700 text-gray-300'
            }`}
          >
            순서
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`btn btn-circle rounded px-2 py-1 text-xs font-semibold transition ${
              sortBy === 'name' ? 'bg-blue-600 text-black' : 'bg-gray-700 text-gray-300'
            }`}
          >
            이름
          </button>
          <button
            onClick={() => setSortBy('persona')}
            className={`btn btn-circle rounded px-2 py-1 text-xs font-semibold transition ${
              sortBy === 'persona' ? 'bg-blue-600 text-black' : 'bg-gray-700 text-gray-300'
            }`}
          >
            성격
          </button>

          {myApostles.length < allApostles.length && (
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
              className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-black transition hover:bg-green-700"
              title="모든 사도 추가"
            >
              전체 사도 선택
            </button>
          )}
        </div>
      </div>

      {/* 검색 */}
      <ApostleSelectorSearch apostles={allApostles} onSelect={onToggle} />

      {/* 추가 가능한 캐릭 - 작은 그리드 */}
      <div className="grid max-h-[70vh] grid-cols-5 gap-2 overflow-y-auto px-2">
        {allApostles.map((apostle) => {
          const isOwned = myApostles.some((m) => m.id === apostle.id);

          return (
            <button
              key={apostle.id}
              onClick={() => {
                onToggle(apostle);
              }}
              className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                isOwned ? 'opacity-100 ring-2 ring-green-400' : 'hover:scale-105 hover:shadow-lg'
              }`}
            >
              {/* 이미지 */}
              <img
                src={getApostleImagePath(apostle.engName)}
                className={`inline-flex h-full w-full items-center gap-1 rounded object-cover px-2 py-1 text-center text-xs ${getPersonalityBackgroundClass(apostle.persona)}`}
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
