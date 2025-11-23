import React from 'react';
import type { Apostle } from '../../types/apostle';
import PartyGrid from './PartyGrid';
import PartyAnalysisPanel from './PartyAnalysisPanel';
import ApostleSelector from './ApostleSelector';
import { analyzeParty } from '../../utils/partyAnalysisUtils';
import { Button, Modal, ModalBody } from 'flowbite-react';
import RecommendedApstlesDisplay from './RecommendedApstlesDisplay';
import PartySetting from './PartySetting';

interface Props {
  apostles: Apostle[];
  skillsData?: any;
  asidesData: any;
}

export const PartySimulator: React.FC<Props> = ({ apostles, skillsData, asidesData }) => {
  const [party, setParty] = React.useState<(Apostle | undefined)[]>(Array(9).fill(undefined));
  const [selectedSlot, setSelectedSlot] = React.useState<number | null>(null);
  const [showSelector, setShowSelector] = React.useState(false);
  const [asideSelection, setAsideSelection] = React.useState<Record<string, number | null>>({});

  const handleAsideChange = (apostleId: string, rankStar: number | null) => {
    setAsideSelection((prev) => ({
      ...prev,
      [apostleId]: rankStar,
    }));
  };

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
    <div className="flex min-h-screen flex-col items-center justify-start bg-gray-50 p-4">
      {/* 상단: 타이틀 및 버튼 */}
      <h1 className="mb-4 text-2xl font-bold">파티 빌더</h1>

      {/* 설정 관련 */}
      <div className="mb-4 w-full max-w-xl rounded-lg bg-white p-4 shadow">
        <PartySetting
          filledParty={filledParty}
          asidesData={asidesData}
          onAsideChange={handleAsideChange}
        />
      </div>

      {/* 분석 결과 */}
      <div className="mb-4 w-full max-w-xl rounded-lg bg-white p-4 shadow">
        <PartyAnalysisPanel
          analysis={analysis}
          filledParty={filledParty}
          skillsData={skillsData}
          asidesData={asidesData}
          asideSelection={asideSelection}
        />
      </div>

      <Button color="red" onClick={handleReset} className="btn-secondary h-full" pill>
        전체 초기화
      </Button>

      {/* 파티 구성 */}
      <div className="mb-4 w-full max-w-xl rounded-lg bg-white p-4 shadow">
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

      {/* 추천 사도 */}
      {/* <div className="mb-4 w-full max-w-xl rounded-lg bg-white p-4 shadow">
        <RecommendedApstlesDisplay />
      </div> */}
    </div>
  );
};

export default PartySimulator;
