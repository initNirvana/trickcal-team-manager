import React from 'react';
import { usePartyStore } from '../../stores/partyStore';
import type { Apostle } from '../../types/apostle';
import RecommendedApostlesDisplay from './SettingDisplay/TiersApostlesDisplay';
import AsideSetting from './SettingDisplay/AsideSetting';

interface PartySettingProps {
  filledParty: Apostle[];
  asidesData?: any;
}

export const PartySetting: React.FC<PartySettingProps> = ({ filledParty, asidesData }) => {
  const showDeckGuide = usePartyStore((state) => state.showDeckGuide);
  const setShowDeckGuide = usePartyStore((state) => state.setShowDeckGuide);

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
        </div>
      </div>

      {/* 추천 사도 섹션 */}
      <div className="collapse-arrow border-base-300 bg-base-100 collapse border">
        <input type="checkbox" name="my-accordion-4" />
        <div className="collapse-title font-semibold">
          <div>추천 사도 티어표</div>
        </div>
        <div className="collapse-content text-sm">
          <RecommendedApostlesDisplay />
        </div>
      </div>

      {/* 어사이드 설정 섹션 */}
      <div className="collapse-arrow join-item border-base-300 collapse border">
        <input type="checkbox" name="my-accordion-4" />
        <div className="collapse-title font-semibold">
          <div>어사이드 설정</div>
        </div>
        <div className="collapse-content text-sm">
          <AsideSetting filledParty={filledParty} asidesData={asidesData} />
        </div>
      </div>
    </div>
  );
};

export default PartySetting;
