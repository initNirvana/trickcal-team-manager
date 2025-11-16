import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
  Badge,
  Card,
} from "flowbite-react";
import type { Apostle } from "../../types/apostle";
import { getPersonalities } from "../../types/apostle";

interface PartySettingProps {
  filledParty: Apostle[];
  asidesData?: any;
  onAsideChange?: (apostleId: string, rankStar: number | null) => void;
}

export const PartySetting: React.FC<PartySettingProps> = ({
  filledParty,
  asidesData = {},
  onAsideChange,
}) => {
  const [asideSelection, setAsideSelection] = useState<
    Record<string, number | null>
  >({});

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
  return (
    <div className="space-y-4">
      {/* Accordion */}
      <Accordion>
        <AccordionPanel>
          <AccordionTitle>각종 설정</AccordionTitle>
          <AccordionContent>내용</AccordionContent>
        </AccordionPanel>
        <AccordionPanel>
          <AccordionTitle>어사이드 설정</AccordionTitle>
          <AccordionContent>
            {/* 배치된 사도가 없을 때 */}
            {filledParty.length === 0 ? (
              <div className="box text-center py-8">
                <p className="text-muted">
                  사도를 배치하면 어사이드 설정이 활성화됩니다.
                </p>
              </div>
            ) : (
              /* 배치된 사도 목록 - 테이블 형태 */
              <div className="space-y-2">
                {/* 헤더 */}
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-2 py-2 border-b border-gray-300 dark:border-gray-600 mb-2">
                  <div className="sm:col-span-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    이미지
                  </div>
                  <div className="sm:col-span-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    사도 이름
                  </div>
                  <div className="sm:col-span-8 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    어사이드 선택
                  </div>
                </div>

                {/* 사도 목록 */}
                {filledParty.map((apostle, index) => {
                  const apostleKey = apostle.id || apostle.name;
                  const selectedRank = asideSelection[apostleKey];

                  return (
                    <div
                      key={`${apostleKey}-${index}`}
                      className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      {/* 사도 이미지 (1 col) */}
                      <div className="col-span-2 sm:col-span-1">
                        <img
                          src={getApostleImage(apostle.name)}
                          alt={apostle.name}
                          className="w-10 h-10 rounded-md border border-gray-300 dark:border-gray-500 object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "src/assets/apostles/default.webp";
                          }}
                        />
                      </div>

                      {/* 사도 이름 (3 col) */}
                      <div className="col-span-4 sm:col-span-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {apostle.name}
                        </p>
                      </div>

                      {/* 어사이드 선택 버튼 (8 col) */}
                      <div className="col-span-6 sm:col-span-8 flex gap-1.5">
                        {/* 3성 버튼 */}
                        <button
                          onClick={() => handleAsideRankSelect(apostleKey, 3)}
                          className={`px-2.5 py-1.5 rounded text-xs font-semibold transition whitespace-nowrap ${
                            selectedRank === 3
                              ? "bg-purple-500 text-white shadow-md"
                              : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500"
                          }`}
                          title="3성 어사이드"
                        >
                          어사 3성
                        </button>

                        {/* 2성 버튼 */}
                        <button
                          onClick={() => handleAsideRankSelect(apostleKey, 2)}
                          className={`px-2.5 py-1.5 rounded text-xs font-semibold transition whitespace-nowrap ${
                            selectedRank === 2
                              ? "bg-blue-500 text-white shadow-md"
                              : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500"
                          }`}
                          title="2성 어사이드"
                        >
                          어사 2성
                        </button>

                        {/* 미해당 버튼 */}
                        <button
                          onClick={() =>
                            handleAsideRankSelect(apostleKey, null)
                          }
                          className={`px-2.5 py-1.5 rounded text-xs font-semibold transition whitespace-nowrap ${
                            selectedRank === null
                              ? "bg-red-500 text-white shadow-md"
                              : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500"
                          }`}
                          title="어사이드 미선택"
                        >
                          미해당
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  );
};

export default PartySetting;
