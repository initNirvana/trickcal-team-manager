import { useCallback } from 'react';
import type { Apostle } from '../../../types/apostle';
import { useApostleSearch } from '../../../utils/ApostleSearch';
import { getApostleImagePath } from '../../../utils/apostleUtils';
import Image from '../../common/Image';

interface ApostleSelectorSearchProps {
  apostles: Apostle[];
  onSelect: (apostle: Apostle) => void;
  placeholder?: string;
}

/**
 * 사도 이름 검색 컴포넌트
 * - 전체 이름 및 초성 검색 지원
 * - 검색 결과 목록 표시
 */
const ApostleSelectorSearch = ({
  apostles,
  onSelect,
  placeholder = '사도 이름 검색 (초성 가능)',
}: ApostleSelectorSearchProps) => {
  const { search, setSearch, open, setOpen, searchList, containerRef } = useApostleSearch({
    apostles,
  });

  const handleSelectApostle = useCallback(
    (apostle: Apostle) => {
      onSelect(apostle);
      setSearch('');
      setOpen(false);
    },
    [onSelect, setSearch, setOpen],
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 검색 입력창 */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="input form-control bg-base-200 w-full"
      />

      {/* 검색 결과 드롭다운 */}
      {open && (
        <div className="bg-base-100 border-base-300 absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-y-auto rounded-md border shadow-lg">
          {searchList.length === 0 ? (
            <div className="text-base-content/50 px-4 py-3 text-center">
              {search.trim() ? '검색 결과가 없습니다' : '검색어를 입력해주세요'}
            </div>
          ) : (
            <>
              {searchList.map((apostle) => (
                <div
                  key={apostle.id}
                  onClick={() => handleSelectApostle(apostle)}
                  className="hover:bg-base-200 flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition"
                >
                  {/* 사도 이미지 */}
                  <Image
                    src={getApostleImagePath(apostle.engName)}
                    alt={apostle.name}
                    className="h-8 w-8 rounded"
                  />

                  {/* 사도 정보 */}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{apostle.name}</div>
                    <div className="text-base-content/60 text-xs">{apostle.position}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ApostleSelectorSearch;
