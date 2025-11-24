import React from "react";
import { TabItem, Tabs, Badge } from "flowbite-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
} from "flowbite-react";

// 더미 데이터 (실제로는 JSON 파일에서 가져올 수 있음)
const RECOMMENDED_APOSTLES_DATA = {
  광기: [
    { name: "네티", tier: "S+", rank: 3, position: "전열" },
    { name: "티그(영웅)", tier: "S+", rank: 3, position: "중열" },
    { name: "리뉴아", tier: "S", rank: 3, position: "중열" },
    { name: "아네트", tier: "S", rank: 3, position: "중열" },
  ],
  우울: [
    { name: "란", tier: "S+", rank: 3, position: "중열" },
    { name: "엘리자베트", tier: "S+", rank: 3, position: "후열" },
    { name: "오필리아", tier: "S", rank: 3, position: "전열" },
    { name: "모르디카이", tier: "S", rank: 2, position: "중열" },
  ],
  순수: [
    { name: "마그달레나", tier: "S+", rank: 3, position: "후열" },
    { name: "에로스", tier: "S+", rank: 3, position: "전열" },
    { name: "소크라테스", tier: "S", rank: 3, position: "중열" },
    { name: "아벨", tier: "S", rank: 2, position: "후열" },
  ],
  활발: [
    { name: "카인", tier: "S+", rank: 3, position: "중열" },
    { name: "에스더", tier: "S+", rank: 3, position: "후열" },
    { name: "사무엘", tier: "S", rank: 3, position: "전열" },
    { name: "유디트", tier: "S", rank: 2, position: "중열" },
  ],
  냉정: [
    { name: "엘리샤", tier: "S+", rank: 3, position: "후열" },
    { name: "예레미야", tier: "S+", rank: 3, position: "중열" },
    { name: "발람", tier: "S", rank: 3, position: "전열" },
    { name: "욥", tier: "S", rank: 2, position: "후열" },
  ],
};

interface ApostleData {
  name: string;
  tier: string;
  rank: number;
  position: string;
}

interface TabsRefType {
  setActiveTab?: (value: number) => void;
}

export function RecommendedApostlesDisplay() {
  const tabsRef = React.useRef<TabsRefType>(null);
  const personalities = Object.keys(RECOMMENDED_APOSTLES_DATA) as Array<
    keyof typeof RECOMMENDED_APOSTLES_DATA
  >;

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case "S+":
        return "red";
      case "S":
        return "orange";
      case "A":
        return "blue";
      default:
        return "gray";
    }
  };

  const renderApostleRow = (apostle: ApostleData, idx: number) => (
    <div
      key={idx}
      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition border border-gray-200"
    >
      <div className="flex-1">
        <p className="font-bold text-sm text-gray-900">{apostle.name}</p>
        <p className="text-xs text-gray-600 mt-1">배치: {apostle.position}</p>
      </div>
      <div className="flex items-center gap-2 ml-3">
        <Badge color={getTierColor(apostle.tier)} size="sm">
          {apostle.tier}
        </Badge>
        <Badge color="info" size="sm">
          {apostle.rank}성
        </Badge>
      </div>
    </div>
  );

  return (
    <Accordion collapseAll>
      <AccordionPanel>
        <AccordionTitle>추천 사도</AccordionTitle>
        <AccordionContent>
          {/* 제목 */}
          <div className="mb-4">
            {/* <h2 className="text-xl font-bold text-gray-900">추천 사도</h2> */}
            <p className="text-sm text-gray-600 mt-1">
              성격별로 추천하는 사도들입니다
            </p>
          </div>

          {/* Tabs */}
          <Tabs aria-label="Recommended apostles by personality">
            {personalities.map((personality) => (
              <TabItem
                key={personality}
                active={personality === personalities[0]}
                title={personality}
              >
                <div className="space-y-2">
                  {RECOMMENDED_APOSTLES_DATA[personality].map((apostle, idx) =>
                    renderApostleRow(apostle, idx)
                  )}
                </div>
              </TabItem>
            ))}
          </Tabs>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  );
}

export default RecommendedApostlesDisplay;
