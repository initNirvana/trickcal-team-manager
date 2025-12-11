import { useCallback } from 'react';
import { HiXMark } from 'react-icons/hi2';
import type { Apostle } from '../../../types/apostle';
import { useApostleSearch } from '../../../utils/ApostleSearch';
import { getApostleImagePath } from '../../../utils/apostleUtils';
import Image from '../../common/Image';

interface ApostleSelectorSearchProps {
  apostles: Apostle[];
  onSelect: (apostle: Apostle) => void;
  placeholder?: string;
  maxHistorySize?: number;
}

/**
 * 사도 이름 검색 컴포넌트
 * - 전체 이름 및 초성 검색 지원
 * - 최근 검색 히스토리 표시
 * - 검색 결과 목록 표시
 */
export const ApostleSelectorSearch: React.FC<ApostleSelectorSearchProps> = ({
  apostles,
  onSelect,
  placeholder = '사도 이름 검색 (초성 가능)',
  maxHistorySize = 10,
}) => {
  const {
    search,
    setSearch,
    open,
    setOpen,
    searchList,
    history,
    addHistory,
    deleteHistory,
    containerRef,
  } = useApostleSearch({ apostles, maxHistorySize });

  const handleSelectApostle = useCallback(
    (apostle: Apostle) => {
      addHistory(apostle.name);
      onSelect(apostle);
      setSearch('');
      setOpen(false);
    },
    [addHistory, onSelect, setSearch, setOpen],
  );

  const handleDeleteHistory = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      deleteHistory(index);
    },
    [deleteHistory],
  );

  const displayList = search.trim() ? searchList : history;
  const isHistoryMode = !search.trim() && history.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 검색 입력창 */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="form-control bg-base-200 w-full"
      />

      {/* 검색 결과 드롭다운 */}
      {open && (
        <div className="border-base-300 bg-base-100 absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border shadow-lg">
          {/* 히스토리 모드 헤더 */}
          {isHistoryMode && (
            <div className="border-base-300 bg-base-200 sticky top-0 border-b px-4 py-2">
              <p className="text-base-content text-xs font-semibold">최근 검색</p>
            </div>
          )}

          {displayList.length === 0 ? (
            <div className="flex items-center justify-center px-4 py-8">
              <p className="text-base-content/50 text-sm">
                {search.trim() ? '검색 결과가 없습니다' : '검색 히스토리가 없습니다'}
              </p>
            </div>
          ) : (
            <ul className="space-y-0 py-2">
              {displayList.map((item) => {
                // 히스토리 모드일 때는 문자열, 검색 결과일 때는 Apostle 객체
                const apostle =
                  typeof item === 'string' ? apostles.find((a) => a.name === item) : item;

                if (!apostle) return null;

                return (
                  <li
                    key={`${apostle.id}-${isHistoryMode ? 'history' : 'search'}`}
                    className="border-base-300 hover:bg-base-200 border-b last:border-b-0"
                  >
                    <button
                      onClick={() => handleSelectApostle(apostle)}
                      className="hover:bg-base-200 flex w-full items-center gap-3 px-4 py-3 text-left transition"
                    >
                      {/* 사도 이미지 */}
                      <div className="bg-base-300 relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={getApostleImagePath(apostle.engName)}
                          alt={apostle.name}
                          className="h-full w-full object-cover"
                          fallbackSrc="src/assets/placeholder.webp"
                        />
                      </div>

                      {/* 사도 정보 */}
                      <div className="min-w-0 flex-1">
                        <p className="text-base-content truncate font-semibold">{apostle.name}</p>
                        <p className="text-base-content/60 text-xs">{apostle.engName}</p>
                      </div>

                      {/* 히스토리 삭제 버튼 */}
                      {isHistoryMode && (
                        <button
                          onClick={(e) => handleDeleteHistory(e, history.indexOf(apostle.name))}
                          className="text-base-content/40 hover:text-base-content shrink-0 p-1"
                          title="검색 히스토리에서 제거"
                        >
                          <HiXMark className="h-4 w-4" />
                        </button>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ApostleSelectorSearch;
