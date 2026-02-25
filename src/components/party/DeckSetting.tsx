import { useState } from 'react';
import { useDeckStore } from '@/stores/deckStore';
import type { Apostle } from '@/types/apostle';
import type { Aside } from '@/types/aside';
import AsideSetting from './SettingDisplay/AsideSetting';
import CardSettingModal from './SettingDisplay/CardSetting/CardSetting';

interface DeckSettingProps {
  filledDeck: Apostle[];
  asidesData?: Aside[];
}

const DeckSetting = ({ filledDeck, asidesData }: DeckSettingProps) => {
  const showDeckGuide = useDeckStore((state) => state.showDeckGuide);
  const setShowDeckGuide = useDeckStore((state) => state.setShowDeckGuide);
  const showArtifactMode = useDeckStore((state) => state.showArtifactMode);
  const setShowArtifactMode = useDeckStore((state) => state.setShowArtifactMode);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  return (
    <div className="space-y-1">
      {/* 설정 섹션 */}
      <div className="collapse-arrow border-base-300 bg-base-100 collapse border">
        <input type="checkbox" name="my-accordion-4" />
        <div className="collapse-title font-semibold">
          <div>각종 설정</div>
        </div>
        <div className="collapse-content text-sm">
          <label className="swap justify-center">
            <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-28 border p-3">
              <legend className="fieldset-legend">속성 추천 모드</legend>
              <label className="label">
                <input
                  type="checkbox"
                  checked={showDeckGuide}
                  onChange={(e) => setShowDeckGuide(e.target.checked)}
                  className="toggle toggle-xl toggle-primary"
                />
              </label>
            </fieldset>
          </label>
          <label className="swap justify-center">
            <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-28 border p-3">
              <legend className="fieldset-legend">아티팩트 모드</legend>
              <label className="label">
                <input
                  type="checkbox"
                  checked={showArtifactMode}
                  onChange={(e) => setShowArtifactMode(e.target.checked)}
                  className="toggle toggle-xl toggle-primary"
                />
              </label>
            </fieldset>
          </label>
        </div>
      </div>

      {/* 어사이드 설정 섹션 */}
      <div className="collapse-arrow join-item border-base-300 collapse border">
        <input type="checkbox" name="my-accordion-4" />
        <div className="collapse-title font-semibold">
          <div>어사이드 설정</div>
        </div>
        <div className="collapse-content text-sm">
          <AsideSetting filledDeck={filledDeck} asidesData={asidesData} />
        </div>
      </div>
      {/* 카드 설정 섹션 */}
      <div className="collapse-arrow join-item border-base-300 collapse border">
        <input type="checkbox" name="my-accordion-4" />
        <div className="collapse-title font-semibold">
          <div>스펠/아티팩트 설정</div>
        </div>
        <div className="collapse-content flex justify-center">
          <button
            onClick={() => setIsCardModalOpen(true)}
            className="btn bg-[#1a2332] text-white hover:bg-[#2a364a]"
          >
            스펠/아티팩트 설정
          </button>
        </div>
      </div>

      <CardSettingModal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} />
    </div>
  );
};

export default DeckSetting;
