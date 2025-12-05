import React, { useState } from 'react';
import type { Apostle } from '../../types/apostle';
import { usePartyStore } from '../../stores/partyStore';
import PartyGrid from './PartyGrid';
import PartyAnalysisPanel from './Analysis/PartyAnalysisPanel';
import ApostleSelector from './Apostle/ApostleSelector';
import { analyzeParty } from '../../utils/partyAnalysisUtils';
import PartySetting from './PartySetting';
import DeckRecommendationGuide from './ApostleGuide';

interface Props {
  apostles: Apostle[];
  skillsData?: any;
  asidesData: any;
}

export const PartySimulator: React.FC<Props> = ({ apostles, skillsData, asidesData }) => {
  // ===== Zustand 구독: Party 상태 =====
  const party = usePartyStore((state) => state.party);
  const setPartyMember = usePartyStore((state) => state.setPartyMember);
  const clearParty = usePartyStore((state) => state.clearParty);
  const resetAll = usePartyStore((state) => state.resetAll);

  // ===== UI 관련 로컬 상태 (useState 유지) =====
  const [selectedSlot, setSelectedSlot] = React.useState<number | null>(null);
  const [showSelector, setShowSelector] = React.useState(false);

  const [gameMode, setGameMode] = useState<'pve' | 'pvp'>('pve');

  // ===== 액션 핸들러 =====
  const handleSlotClick = (slotNumber: number) => {
    setSelectedSlot(slotNumber);
    setShowSelector(true);
  };

  const handleAddApostle = (apostle: Apostle) => {
    if (selectedSlot === null) return;

    // ✅ Zustand 액션 사용
    setPartyMember(selectedSlot, apostle);
    setShowSelector(false);
  };

  const handleRemoveApostle = () => {
    if (selectedSlot === null) return;
    setPartyMember(selectedSlot, undefined);
    setShowSelector(false);
    setSelectedSlot(null);
  };

  const handleReset = () => {
    resetAll();
  };

  // ===== 파생 상태 (계산된 값) =====
  const filledParty = party.filter((a) => a !== undefined) as Apostle[];
  const analysis = analyzeParty(filledParty);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gray-50 p-4">
      <h1 className="mb-4 text-2xl font-bold">파티 빌더</h1>

      {/* PartySetting - asideSelection을 직접 Zustand에서 구독 */}
      <div className="mb-4 w-full max-w-xl rounded-lg bg-white p-4 shadow">
        <PartySetting
          filledParty={filledParty}
          asidesData={asidesData}
          // ✅ onAsideChange Props 제거!
        />
      </div>

      {/* PartyAnalysisPanel - skillLevels를 직접 Zustand에서 구독 */}
      <div className="mb-4 w-full max-w-xl rounded-lg bg-white p-4 shadow">
        <DeckRecommendationGuide
          apostles={filledParty}
          allApostles={apostles}
          gameMode={gameMode}
          onGameModeChange={setGameMode}
        />

        <PartyAnalysisPanel
          analysis={analysis}
          filledParty={filledParty}
          skillsData={skillsData}
          asidesData={asidesData}
          // ✅ asideSelection Props 제거!
        />
      </div>

      {/* 초기화 버튼 */}
      <button onClick={handleReset} className="btn btn-error h-full">
        초기화
      </button>

      {/* PartyGrid - party를 직접 Zustand에서 구독 */}
      <div className="mb-4 w-full max-w-xl rounded-lg bg-white p-4 shadow">
        <PartyGrid onSelectSlot={handleSlotClick} />
      </div>

      {/* Apostle 선택 모달 */}
      {showSelector && selectedSlot !== null && (
        <dialog open className="modal">
          <ApostleSelector
            apostles={apostles}
            selectedSlot={selectedSlot}
            currentApostle={party[selectedSlot - 1]}
            onSelect={handleAddApostle}
            onRemove={handleRemoveApostle}
            onClose={() => setShowSelector(false)}
          />
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowSelector(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default PartySimulator;
