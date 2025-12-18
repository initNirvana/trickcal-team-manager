// src/components/party/sub-components/RecommendedApostleCard.tsx

import React, { Activity } from 'react';
import type { Apostle } from '../../../types/apostle';
import { getPersonalities } from '../../../types/apostle';
import {
  getApostleImagePath,
  getPositionIconPath,
  getClassIconPath,
  getIconPath,
} from '../../../utils/apostleUtils';

import Image from '../../common/Image';

interface RecommendedApostleCardProps {
  name: string;
  role: string;
  reason: string;
  position: string;
  asideRequired?: number | string | null;
  isEssential?: boolean; // ✅ 필수 사도 여부
  allApostles: Apostle[];
}

// ===== 위치 설정 (아이콘 이미지) =====
const positionConfig = {
  front: { icon: 'Common_PositionFront', label: '전열' },
  mid: { icon: 'Common_PositionMiddle', label: '중열' },
  back: { icon: 'Common_PositionBack', label: '후열' },
};

const RecommendedApostleCard = ({
  name,
  role,
  reason,
  position,
  asideRequired,
  isEssential = false,
  allApostles,
}: RecommendedApostleCardProps) => {
  const apostle = allApostles.find((a) => a.name === name);

  if (!apostle) {
    console.warn(`사도 "${name}"을(를) 찾을 수 없습니다.`);
    return null;
  }

  const personalities = getPersonalities(apostle);
  if (!personalities || personalities.length === 0) {
    console.warn(`사도 "${apostle.name}"의 성격이 없습니다.`);
    return null;
  }

  return (
    <div>
      {/* 사도 이미지 */}
      <figure className="relative h-24 overflow-hidden bg-black/20">
        <Image
          src={getApostleImagePath(apostle.engName)}
          alt={apostle.name}
          className="h-full w-full object-cover"
        />
        {/* 위치 표시 */}
        <div className="absolute bottom-1 left-1 h-5 w-5 rounded-full">
          <Image
            src={getPositionIconPath(positionConfig[position as keyof typeof positionConfig].icon)}
            className="h-full w-full object-contain"
            alt={position}
          />
        </div>

        {/* 클래스 표시 */}
        <div className="absolute bottom-1 left-6 h-5 w-5 rounded-full">
          <Image
            src={getClassIconPath(role)}
            className="h-full w-full object-contain"
            alt={apostle.role}
          />
        </div>
        {/* 필수 사도 표시 (참잘했어요) */}
        <Activity mode={isEssential ? 'visible' : 'hidden'}>
          <div className="tooltip absolute right-2 bottom-1 h-5 w-5 rounded-full" data-tip="필수">
            <Image
              src={getIconPath('CurrencyIcon_0033')}
              className="h-full w-full object-contain"
              alt="필수"
            />
          </div>
        </Activity>
      </figure>
      {/* 카드 본문 */}
      <div className="card-body items-center p-2 text-center">
        {/* 이름 */}
        <span className="truncate text-xs font-bold">{name}</span>

        {/* 설명 */}
        <span className="line-clamp-2 text-xs opacity-75">{reason}</span>

        {/* 어사이드 표시 */}
        <Activity mode={asideRequired ? 'visible' : 'hidden'}>
          <span className="badge badge-xs badge-accent"> {asideRequired} </span>
        </Activity>
      </div>
    </div>
  );
};

export default RecommendedApostleCard;
