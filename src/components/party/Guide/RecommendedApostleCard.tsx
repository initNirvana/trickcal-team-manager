import { Activity } from 'react';
import type { Apostle } from '../../../types/apostle';
import {
  getApostleImagePath,
  getPositionIconPath,
  getClassIconPath,
  getIconPath,
} from '../../../utils/apostleImages';

import Image from '../../common/Image';

interface RecommendedApostleCardProps {
  name: string;
  role: string;
  reason: string;
  position: string;
  isEssential?: boolean; // ✅ 필수 사도 여부
  allApostles: Apostle[];
}

const RecommendedApostleCard = ({
  name,
  role,
  reason,
  position,
  isEssential = false,
  allApostles,
}: RecommendedApostleCardProps) => {
  const apostle = allApostles.find((a) => a.name === name);

  if (!apostle) {
    console.warn(`사도 "${name}"을(를) 찾을 수 없습니다.`);
    return null;
  }

  if (!apostle.persona) {
    console.warn(`사도 "${apostle.name}"의 성격이 없습니다.`);
    return null;
  }

  return (
    <div>
      {/* 사도 이미지 */}
      <figure className="relative h-24 overflow-hidden bg-black/20">
        <Image
          src={getApostleImagePath(apostle)}
          alt={apostle.name}
          className="h-full w-full object-cover"
        />
        {/* 위치 표시 */}
        <div className="absolute bottom-1 left-1 h-5 w-5 rounded-full">
          <Image
            src={getPositionIconPath(apostle)}
            className="h-full w-full object-contain"
            alt={position}
          />
        </div>

        {/* 클래스 표시 */}
        <div className="absolute bottom-1 left-6 h-5 w-5 rounded-full">
          <Image
            src={getClassIconPath(role)}
            className="h-full w-full object-contain"
            alt={apostle.role.main}
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
        <span className="line-clamp-3 text-xs opacity-75">{reason}</span>
      </div>
    </div>
  );
};

export default RecommendedApostleCard;
