import * as htmlToImage from 'html-to-image';
import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaRegCopy } from 'react-icons/fa6';
import {
  getSynergyOffIconPath,
  getSynergyOnIconPath,
  placeholderImagePath,
} from '@/utils/apostleImages';
import { getPersonalityBackground, getPersonalityKoreanName } from '@/utils/apostleUtils';
import { RecommendedDeck } from '@/utils/builder/deckRecommendationUtils';
import RecommendedDeckGrid from './RecommendedDeckGrid';
import SuggestionCard from './SuggestionCard';

interface RecommendedDeckSectionProps {
  recommendations: RecommendedDeck[];
}

export const RecommendedDeckSection = ({ recommendations }: RecommendedDeckSectionProps) => {
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  // 각 추천 덱별로 선택된 사도 ID 관리 (number: PVP용, string: 힐러용)
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<number | string, string>>(
    {},
  );

  const handleCopyCard = useCallback((idx: number) => {
    const node = cardRefs.current[idx];
    if (!node) return;

    const blobPromise = htmlToImage
      .toBlob(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#ffffff',
        style: {
          borderRadius: '16px',
        },
      })
      .then((blob) => {
        if (!blob) throw new Error('이미지 생성 실패');
        return blob;
      });

    const copyPromise = blobPromise.then((blob) => {
      try {
        const item = new ClipboardItem({ 'image/png': blob });
        return navigator.clipboard.write([item]);
      } catch (err) {
        throw new Error(`클립보드 저장 실패: ${(err as Error).message}`);
      }
    });

    toast.promise(copyPromise, {
      loading: '이미지 생성 중...',
      success: '클립보드에 복사되었습니다!',
      error: (err) => `실패: ${err.message}`,
    });
  }, []);

  if (recommendations.length === 0) {
    return (
      <div className="alert alert-warning flex items-center justify-center text-center">
        <div>
          <h3 className="font-bold">추천 가능한 조합이 없습니다</h3>
          <p className="text-sm">보유 사도가 부족하거나 역할 밸런스(탱커/서포터)가 맞지 않습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h2 className="text-center text-2xl font-bold">추천 조합 (보유 사도 기반)</h2>

      {recommendations.map((rec, idx) => (
        <div
          key={idx}
          className="card bg-base-200 relative shadow-lg"
          ref={(el) => {
            cardRefs.current[idx] = el;
          }}
        >
          <button
            type="button"
            className="btn btn-md btn-circle btn-ghost absolute top-2 right-2 z-10"
            aria-label="클립보드로 복사하기"
            title="클립보드로 복사하기"
            onClick={() => handleCopyCard(idx)}
          >
            <FaRegCopy />
          </button>
          <div className="card-body">
            {/* 헤더 */}
            <div className="flex justify-center">
              <h3 className="card-title">
                {rec.deckSize}인 조합 ({rec.deckSize === 9 ? '대충돌/프론티어' : '침략'})
              </h3>
            </div>
            {/* 성격 시너지 표시 */}
            <div>
              <h4 className="mb-2 text-sm font-semibold">
                성격 시너지
                {/* 성격 시너지 합계 표시 */}
                {rec.synergies.filter((s) => s.isActive).length > 0 && (
                  <div className="space-y-2">
                    {/* HP + 피해량 바 */}
                    <div className="flex gap-2">
                      {/* 합계 라벨 */}
                      <div className="text-center text-xs font-bold text-gray-600">합계</div>
                      <div className="flex-1">
                        <div className="flex h-5 items-center justify-center rounded bg-gray-200">
                          <span className="text-xs font-bold text-gray-700">
                            HP +{rec.synergies.reduce((sum, s) => sum + (s.bonus?.hp || 0), 0)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex h-5 items-center justify-center rounded bg-gray-200">
                          <span className="text-xs font-bold text-gray-700">
                            피해량 +
                            {rec.synergies.reduce((sum, s) => sum + (s.bonus?.damage || 0), 0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </h4>

              <div className="flex flex-wrap justify-center gap-2">
                {rec.synergies
                  .filter((s) => s.isActive)
                  .map((synergy) => (
                    <div
                      key={synergy.personality}
                      className={`badge badge-lg ${getPersonalityBackground(synergy.personality)}`}
                      title={`${getPersonalityKoreanName(synergy.personality)} - HP +${synergy.bonus?.hp}%, 공격력 +${synergy.bonus?.damage}%`}
                    >
                      <div className="relative inline-flex items-center" style={{ height: '24px' }}>
                        {/* 활성 아이콘 */}
                        {Array.from({ length: synergy.activeCount }).map((_, index) => (
                          <img
                            key={`active-${index}`}
                            src={getSynergyOnIconPath(synergy.personality)}
                            alt={`${synergy.personality}-active-${index + 1}`}
                            className="h-6 w-6 rounded-full"
                            style={{
                              marginLeft: index === 0 ? '0' : '-12px',
                              zIndex: 100 + synergy.activeCount - index,
                              position: 'relative',
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = placeholderImagePath;
                            }}
                          />
                        ))}

                        {/* 비활성 아이콘 */}
                        {synergy.inactiveCount > 0 &&
                          Array.from({ length: synergy.inactiveCount }).map((_, index) => (
                            <img
                              key={`inactive-${index}`}
                              src={getSynergyOffIconPath(synergy.personality)}
                              alt={`${synergy.personality}-inactive-${index + 1}`}
                              className="h-6 w-6 rounded-full opacity-50 grayscale"
                              style={{
                                marginLeft: '-12px',
                                zIndex: synergy.inactiveCount - index,
                                position: 'relative',
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = placeholderImagePath;
                              }}
                            />
                          ))}
                      </div>
                      {/* <span className="text-xs">
                        {synergy.bonus ? `HP/피해량 +${synergy.bonus.hp}%` : ''}
                      </span> */}
                    </div>
                  ))}
              </div>
            </div>
            {/* 추천 조합 그리드 */}
            <div className="m-0.5 flex justify-center">
              <RecommendedDeckGrid deck={rec.deck} deckSize={rec.deckSize} />
            </div>
            {/* 힐러 없음 경고 배지 */}
            {!rec.hasHealer && (
              <div className="alert alert-warning shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-xs">
                    다른 사도에게 회복이나 보호막을 부여하는 사도가 없습니다. 유지력이 떨어질 수
                    있습니다.
                  </p>
                </div>
              </div>
            )}
            {/* HP 회복/보호막 사도 */}
            {!rec.hasHealer && rec.healerSuggestions && rec.healerSuggestions.length > 0 && (
              <div className="collapse-arrow border-base-300 bg-base-100 collapse border">
                <input type="checkbox" name={`healer-suggest-${idx}`} />
                <div className="collapse-title text-sm font-semibold">추천 HP 회복/보호막 사도</div>
                <div className="collapse-content">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                    {rec.healerSuggestions.map((suggestion, hIdx) => (
                      <SuggestionCard
                        key={`healer-${hIdx}`}
                        apostle={suggestion.apostle}
                        type="HEALER"
                        reason={suggestion.reason}
                        isSelected={selectedSuggestions[`healer-${idx}`] === suggestion.apostle.id}
                        onClick={() =>
                          setSelectedSuggestions((prev) => ({
                            ...prev,
                            [`healer-${idx}`]:
                              prev[`healer-${idx}`] === suggestion.apostle.id
                                ? ''
                                : suggestion.apostle.id,
                          }))
                        }
                      />
                    ))}
                  </div>
                  {/* 선택된 힐러 상세 정보 */}
                  {/* {selectedSuggestions[`healer-${idx}`] &&
                    (() => {
                      const selected = rec.healerSuggestions.find(
                        (s) => s.apostle.id === selectedSuggestions[`healer-${idx}`],
                      );
                      return selected ? (
                        <div role="alert" className="alert alert-info mt-3">
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
                            />
                          </svg>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold">
                              {selected.apostle.name} ({selected.apostle.engName})
                            </span>
                            {selected.reason && <span className="text-sm">{selected.reason}</span>}
                          </div>
                        </div>
                      ) : null;
                    })()} */}
                  <div className="alert alert-info mt-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 shrink-0 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs">
                      다른 사도에게 HP 회복이나 보호막을 부여하는 사도에요
                    </span>
                  </div>
                </div>
              </div>
            )}
            {/* 2. PVP 추천 용병 섹션 */}
            {/* {rec.deckSize === 6 && rec.jwopaemSuggestions && rec.jwopaemSuggestions.length > 0 && (
              <div className="collapse-arrow border-base-300 bg-base-100 collapse border">
                <input type="checkbox" name={`jwopaem-suggest-${idx}`} />
                <div className="collapse-title text-sm font-semibold">줘팸터 추천 사도</div>
                <div className="collapse-content">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                    {rec.jwopaemSuggestions.map((suggestion, sIdx) => (
                      <SuggestionCard
                        key={`pvp-${sIdx}`}
                        apostle={suggestion.apostle}
                        type="PVP"
                        reason={suggestion.reason}
                        isSelected={selectedSuggestions[idx] === suggestion.apostle.id}
                        onClick={() =>
                          setSelectedSuggestions((prev) => ({
                            ...prev,
                            [idx]: prev[idx] === suggestion.apostle.id ? '' : suggestion.apostle.id,
                          }))
                        }
                      />
                    ))}
                  </div>
                  {/* 선택된 사도 상세 정보 */}
            {/* {selectedSuggestions[idx] &&
                    (() => {
                      const selected = rec.jwopaemSuggestions.find(
                        (s) => s.apostle.id === selectedSuggestions[idx],
                      );
                      return selected ? (
                        <div role="alert" className="alert alert-info mt-3">
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
                            />
                          </svg>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold">
                              {selected.apostle.name} ({selected.apostle.engName})
                            </span>
                            {selected.reason && (
                              <span className="text-sm">
                                {selected.reason.replace('[PVP] ', '').replace('⚔️ ', '')}
                              </span>
                            )}
                            {selected.aside && (
                              <span className="text-xs">
                                어사이드: <span className="font-semibold">{selected.aside}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })()} */}
            {/* </div> */}
            {/* </div> */}
            {/* // )}   */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendedDeckSection;
