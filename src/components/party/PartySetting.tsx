import React from 'react';
import type { Apostle } from '../../types/apostle';
import RecommendedApostlesDisplay from './SettingDisplay/TiersApostlesDisplay';
import AsideSetting from './SettingDisplay/AsideSetting';

interface PartySettingProps {
  filledParty: Apostle[];
  asidesData?: any;
}

export const PartySetting: React.FC<PartySettingProps> = ({ filledParty, asidesData }) => {
  return (
    <div className="space-y-1">
      {/* 설정 섹션 */}
      <div className="collapse-arrow border-base-300 bg-base-100 collapse border">
        <input type="checkbox" name="my-accordion-4" />
        <div className="collapse-title font-semibold">
          <div>각종 설정</div>
        </div>
        <div className="collapse-content text-sm">아티팩트/스펠 설정 구현 예정</div>
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
