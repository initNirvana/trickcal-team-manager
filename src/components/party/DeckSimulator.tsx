import { Activity, useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import type { Apostle } from '../../types/apostle';
import type { Skill } from '@/types/skill';
import type { Aside } from '@/types/aside';
import type { SlotNumber } from '@/types/branded';
import { useDeckStore } from '../../stores/deckStore';
import DeckGrid from './DeckGrid';
import DeckAnalysisPanel from './Analysis/AnalysisPanel';
import { analyzeDeck } from '../../utils/deckAnalysisUtils';
import DeckSetting from './DeckSetting';
import DeckRecommendationGuide from './ApostleGuide';

const ApostleSelector = lazy(() => import('./Apostle/ApostleSelector'));

interface DeckSimulatorProps {
  apostles: Apostle[];
  skillsData?: Skill[];
  asidesData?: Aside[];
}

const DeckSimulator = ({ apostles, skillsData, asidesData }: DeckSimulatorProps) => {
  // Zustand 구독: Deck 상태
  const deck = useDeckStore((state) => state.deck);
  const setDeckMember = useDeckStore((state) => state.setDeckMember);
  const resetAll = useDeckStore((state) => state.resetAll);
  const hydrateDeck = useDeckStore((state) => state.hydrateDeck);
  // 속성별 추천 사도 가이드 ON/OFF
  const showDeckGuide = useDeckStore((state) => state.showDeckGuide);

  // UI 관련 로컬 상태 (useState 유지)
  const [selectedSlot, setSelectedSlot] = useState<SlotNumber | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  const [gameMode, setGameMode] = useState<'pve' | 'pvp'>('pve');

  useEffect(() => {
    const stored = localStorage.getItem('trickcal-deck-storage');
    if (stored && apostles.length > 0) {
      try {
        const parsed = JSON.parse(stored);
        const deckIds = parsed?.state?.deckIds;
        if (deckIds && Array.isArray(deckIds)) {
          hydrateDeck(deckIds, apostles);
        }
      } catch (error) {
        console.error('Failed to restore deck:', error);
      }
    }
  }, [apostles, hydrateDeck]);

  // 액션 핸들러
  const handleSlotClick = (slotNumber: SlotNumber) => {
    setSelectedSlot(slotNumber);
    setShowSelector(true);
  };

  const handleAddApostle = (apostle: Apostle) => {
    if (selectedSlot === null) return;

    // ✅ Zustand 액션 사용
    setDeckMember(selectedSlot, apostle);
    setShowSelector(false);
  };

  const handleRemoveApostle = () => {
    if (selectedSlot === null) return;
    setDeckMember(selectedSlot, undefined);
    setShowSelector(false);
    setSelectedSlot(null);
  };

  const handleReset = () => {
    resetAll();
  };

  // ✅ 파생 상태 (메모이제이션으로 불필요한 재계산 방지)
  const filledDeck = useMemo(() => deck.filter((a) => a !== undefined) as Apostle[], [deck]);

  const analysis = useMemo(() => analyzeDeck(filledDeck), [filledDeck]);

  return (
    <div className="bg-base-100 flex min-h-screen flex-col items-center justify-start p-4">
      <h1 className="mb-4 text-2xl font-bold">덱 빌더</h1>
      <p className="text-black">사도를 선택하고 피해량 정보를 확인하세요</p>

      {/* DeckSetting - asideSelection을 직접 Zustand에서 구독 */}
      <div className="mb-4 w-full max-w-xl rounded-lg bg-white p-4 shadow">
        <DeckSetting
          filledDeck={filledDeck}
          asidesData={asidesData}
          // ✅ onAsideChange Props 제거!
        />
      </div>

      {/* DeckRecommendationGuide - showDeckGuide를 직접 Zustand에서 구독 */}
      <Activity mode={showDeckGuide ? 'visible' : 'hidden'}>
        <div className="mb-4 w-full max-w-xl rounded-lg bg-white p-4 shadow">
          <DeckRecommendationGuide
            apostles={filledDeck}
            allApostles={apostles}
            gameMode={gameMode}
            onGameModeChange={setGameMode}
          />
        </div>
      </Activity>

      {/* DeckAnalysisPanel - skillLevels를 직접 Zustand에서 구독 */}
      <div className="mb-4 w-full max-w-xl rounded-lg bg-white p-4 shadow">
        <DeckAnalysisPanel
          analysis={analysis}
          filledDeck={filledDeck}
          skillsData={skillsData}
          asidesData={asidesData}
        />
      </div>

      {/* 초기화 버튼 */}
      <button onClick={handleReset} className="btn btn-error mb-4 h-full">
        초기화
      </button>

      {/* DeckGrid - deck을 직접 Zustand에서 구독 */}
      <div className="mb-4 w-full max-w-xl rounded-lg bg-white p-4 shadow">
        <DeckGrid onSelectSlot={handleSlotClick} />
      </div>

      {/* Apostle 선택 모달 - createPortal로 body에 렌더링 */}
      {showSelector && selectedSlot !== null
        ? createPortal(
            <dialog open className="modal">
              <Suspense
                fallback={
                  <div className="modal-box flex items-center justify-center py-20">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                }
              >
                <ApostleSelector
                  apostles={apostles}
                  selectedSlot={selectedSlot}
                  currentApostle={deck[selectedSlot - 1]}
                  onSelect={handleAddApostle}
                  onRemove={handleRemoveApostle}
                  onClose={() => setShowSelector(false)}
                />
              </Suspense>
              <form method="dialog" className="modal-backdrop">
                <button onClick={() => setShowSelector(false)}>close</button>
              </form>
            </dialog>,
            document.body,
          )
        : null}
    </div>
  );
};

export default DeckSimulator;
