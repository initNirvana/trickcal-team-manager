import React from "react";
import type { Apostle } from "../../types/apostle";
import PartyGrid from "./PartyGrid";
import PartyAnalysisPanel from "./PartyAnalysisPanel";
import ApostleSelector from "./ApostleSelector";
import { analyzeParty } from "../../utils/partyAnalysisUtils";
import { Button, Modal, ModalBody } from "flowbite-react";
import RecommendedApstlesDisplay from "./RecommendedApstlesDisplay";
import PartySetting from "./PartySetting";

interface Props {
  apostles: Apostle[];
  skillsData?: any;
  asidesData: any;
}

export const PartySimulator: React.FC<Props> = ({
  apostles,
  skillsData,
  asidesData,
}) => {
  const [party, setParty] = React.useState<(Apostle | undefined)[]>(
    Array(9).fill(undefined)
  );
  const [selectedSlot, setSelectedSlot] = React.useState<number | null>(null);
  const [showSelector, setShowSelector] = React.useState(false);

  const handleSlotClick = (slotNumber: number) => {
    setSelectedSlot(slotNumber);
    setShowSelector(true);
  };

  const handleAddApostle = (apostle: Apostle) => {
    if (selectedSlot === null) return;

    const newParty = [...party];
    const existingIndex = newParty.findIndex((a) => a?.name === apostle.name);
    if (existingIndex !== -1 && existingIndex !== selectedSlot - 1) {
      newParty[existingIndex] = undefined;
    }

    newParty[selectedSlot - 1] = apostle;
    setParty(newParty);
    setShowSelector(false);
  };

  const handleRemoveApostle = () => {
    if (selectedSlot === null) return;
    const newParty = [...party];
    newParty[selectedSlot - 1] = undefined;
    setParty(newParty);
    setShowSelector(false);
    setSelectedSlot(null);
  };

  const handleReset = () => {
    setParty(Array(9).fill(undefined));
  };

  const filledParty = party.filter((a) => a !== undefined) as Apostle[];
  const analysis = analyzeParty(filledParty);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-gray-50">
      {/* 상단: 타이틀 및 버튼 */}
      <h1 className="text-2xl font-bold mb-4">파티 빌더</h1>

      {/* 설정 관련 */}
      <div className="w-full max-w-xl mb-4 bg-white rounded-lg shadow p-4">
        <PartySetting filledParty={filledParty} asidesData={asidesData} />
      </div>

      {/* 분석 결과 */}
      <div className="w-full max-w-xl mb-4 bg-white rounded-lg shadow p-4">
        <PartyAnalysisPanel
          analysis={analysis}
          filledParty={filledParty}
          skillsData={skillsData}
        />
      </div>

      {/* 파티 구성 */}
      <div className="w-full max-w-xl mb-4 bg-white rounded-lg shadow p-4">
        <PartyGrid
          party={party}
          onSelectSlot={handleSlotClick}
          onRemoveSlot={handleRemoveApostle}
        />
      </div>

      {/* 모달: 사도 선택 - 선택된 열의 모달 */}
      {showSelector && selectedSlot !== null && (
        <Modal
          show={showSelector}
          onClose={() => {
            setShowSelector(false);
            setSelectedSlot(null);
          }}
          size="2xl"
        >
          <ModalBody>
            <ApostleSelector
              apostles={apostles}
              selectedSlot={selectedSlot}
              currentApostle={party[selectedSlot - 1]} // ✅ 현재 슬롯의 사도 전달
              onSelect={handleAddApostle}
              onRemove={handleRemoveApostle} // ✅ 슬롯 비우기 콜백 추가
              onClose={() => {
                setShowSelector(false);
                setSelectedSlot(null);
              }}
            />
          </ModalBody>
        </Modal>
      )}

      <Button
        color="red"
        onClick={handleReset}
        className="btn-secondary h-full"
        pill
      >
        전체 초기화
      </Button>

      {/* 추천 사도 */}
      <div className="w-full max-w-xl mb-4 bg-white rounded-lg shadow p-4">
        <RecommendedApstlesDisplay />
      </div>
    </div>
  );
};

export default PartySimulator;
