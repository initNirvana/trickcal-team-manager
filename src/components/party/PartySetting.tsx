import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle } from 'flowbite-react';
import type { Apostle } from '../../types/apostle';

interface PartySettingProps {
  filledParty: Apostle[];
  asidesData?: any;
  onAsideChange?: (apostleId: string, rankStar: number | null) => void;
}

export const PartySetting: React.FC<PartySettingProps> = ({
  filledParty,
  asidesData,
  onAsideChange,
}) => {
  const [asideSelection, setAsideSelection] = useState<Record<string, number | null>>({});

  const handleAsideRankSelect = (apostleId: string, rank: number | null) => {
    const newValue = asideSelection[apostleId] === rank ? null : rank;
    setAsideSelection((prev) => ({
      ...prev,
      [apostleId]: newValue,
    }));
    onAsideChange?.(apostleId, newValue);
  };

  const getApostleImage = (apostleName: string) => {
    return `src/assets/apostles/${apostleName}.webp`;
  };

  const getAvailableAsideRanks = (apostleId: string): { has2Star: boolean; has3Star: boolean } => {
    if (!asidesData?.asides) {
      return { has2Star: false, has3Star: false };
    }

    const apostleAsides = asidesData.asides.filter((aside: any) => aside.apostleId === apostleId);

    const has2Star = apostleAsides.some((aside: any) => aside.level === 2);
    const has3Star = apostleAsides.some((aside: any) => aside.level === 3);

    return { has2Star, has3Star };
  };

  return (
    <Accordion collapseAll>
      <AccordionPanel>
        <AccordionTitle>각종 설정</AccordionTitle>
        <AccordionContent>구현 예정</AccordionContent>
        <AccordionContent>
          대충돌/프론티어 관련 기록은 <br />
          <a href="https://trickcalrecord.pages.dev/">https://trickcalrecord.pages.dev/</a>
          참고 부탁드립니다~
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel>
        <AccordionTitle>어사이드 설정</AccordionTitle>
        <AccordionContent>
          {/* 배치된 사도가 없을 때 */}
          {filledParty.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                사도를 배치하면 어사이드 설정이 활성화됩니다.
              </p>
            </div>
          ) : (
            /* 배치된 사도 목록 - 테이블 형태 */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                {/* 헤더 */}
                <thead className="bg-gray-50 text-xs uppercase dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-2 py-3">
                      이미지
                    </th>
                    <th scope="col" className="px-3 py-3">
                      사도 이름
                    </th>
                    <th scope="col" className="px-6 py-3">
                      어사이드 선택
                    </th>
                  </tr>
                </thead>

                {/* 사도 목록 */}
                <tbody>
                  {filledParty.map((apostle, index) => {
                    const apostleKey = apostle.id || apostle.name;
                    const selectedRank = asideSelection[apostleKey];
                    const { has2Star, has3Star } = getAvailableAsideRanks(apostleKey);

                    // 어사이드가 하나도 없는 경우
                    const hasNoAside = !has2Star && !has3Star;

                    return (
                      <tr
                        key={index}
                        className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-600"
                      >
                        {/* 사도 이미지 (1 col) */}
                        <td className="px-2 py-3">
                          <img
                            src={getApostleImage(apostle.name)}
                            alt={apostle.name}
                            className="h-12 w-12 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'src/assets/apostles/default.webp';
                            }}
                          />
                        </td>

                        {/* 사도 이름 (3 col) */}
                        <td className="px-3 py-3 font-medium whitespace-nowrap">{apostle.name}</td>

                        {/* 어사이드 선택 버튼 (8 col) */}
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            {/* 3성 버튼 - 3성이 있을 때만 표시 */}
                            {has3Star && (
                              <button
                                onClick={() => handleAsideRankSelect(apostleKey, 3)}
                                className={`rounded px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                                  selectedRank === 3
                                    ? 'bg-purple-500 text-white shadow-md'
                                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                                }`}
                                title="3성 어사이드"
                              >
                                어사 3성
                              </button>
                            )}

                            {/* 2성 버튼 - 2성이 있을 때만 표시 */}
                            {has2Star && (
                              <button
                                onClick={() => handleAsideRankSelect(apostleKey, 2)}
                                className={`rounded px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                                  selectedRank === 2
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                                }`}
                                title="2성 어사이드"
                              >
                                어사 2성
                              </button>
                            )}

                            {/* 미해당 버튼 - 항상 표시 */}
                            <button
                              onClick={() => handleAsideRankSelect(apostleKey, null)}
                              disabled={hasNoAside}
                              className={`rounded px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                                selectedRank === null || hasNoAside
                                  ? 'bg-red-500 text-white shadow-md'
                                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                              } ${hasNoAside ? 'cursor-not-allowed opacity-50' : ''}`}
                              title={hasNoAside ? '어사이드 없음' : '어사이드 미선택'}
                            >
                              미해당
                            </button>
                          </div>

                          {/* 어사이드 없음 안내 */}
                          {hasNoAside && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              어사이드 없음
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  );
};

export default PartySetting;
