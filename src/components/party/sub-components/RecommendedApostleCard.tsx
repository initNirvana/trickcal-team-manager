// src/components/party/sub-components/RecommendedApostleCard.tsx

import React from 'react';
import type { Apostle } from '../../../types/apostle';
import { getPersonalities } from '../../../types/apostle';
import { getApostleImagePath, getPersonalityBackgroundClass } from '../../../utils/apostleUtils';

interface RecommendedApostleCardProps {
  name: string;
  role: string;
  reason: string;
  position: string;
  asideRequired?: number | string | null;
  isEssential?: boolean; // ✅ 필수 사도 여부
  isRecommended?: boolean; // ✅ 권장 사도 여부
  isPlaced?: boolean; // ✅ 배치 여부
  allApostles: Apostle[];
}

const RecommendedApostleCard: React.FC<RecommendedApostleCardProps> = ({
  name,
  role,
  reason,
  position,
  asideRequired,
  isEssential = false,
  isRecommended = false,
  isPlaced,
  allApostles,
}) => {
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

  const bgColor = getPersonalityBackgroundClass(personalities[0]);

  const getRoleColor = (r: string) => {
    switch (r) {
      case 'tank':
        return 'badge-info';
      case 'attacker':
        return 'badge-error';
      case 'healer':
        return 'badge-success';
      case 'support':
        return 'badge-secondary';
      default:
        return 'badge-neutral';
    }
  };

  const getRoleName = (r: string) => {
    switch (r) {
      case 'tank':
        return '탱';
      case 'attacker':
        return '딜';
      case 'healer':
        return '힐';
      case 'support':
        return '지원';
      default:
        return r;
    }
  };

  return (
    <div>
      {/* 필수/권장 표시 */}
      {isPlaced ? (
        <div className="badge badge-success">✓ 배치됨</div>
      ) : isEssential ? (
        <div className="badge badge-primary">필수</div>
      ) : isRecommended ? (
        <div className="badge badge-info">권장</div>
      ) : null}

      {/* 사도 이미지 */}
      <figure className="h-24 overflow-hidden bg-black/20">
        <img
          src={getApostleImagePath(apostle.engName)}
          alt={apostle.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </figure>
      {/* 카드 본문 */}
      <div className="card-body p-2 text-center">
        {/* 이름 */}
        <p className="truncate text-xs font-bold">{name}</p>

        {/* 역할 배지 */}
        <div className="flex justify-center gap-1">
          <span className={`badge badge-sm ${getRoleColor(role)}`}>{getRoleName(role)}</span>
        </div>

        {/* 위치 정보 */}
        <span className="text-base-content/60 mt-1 text-xs">
          {position === 'front' ? '전열' : position === 'mid' ? '중열' : '후열'}
        </span>

        {/* 어사이드 표시 */}
        {asideRequired && (
          <span className="badge badge-sm badge-warning">
            {typeof asideRequired === 'number' ? `A${asideRequired}` : asideRequired}
          </span>
        )}

        {/* 설명 */}
        <p className="line-clamp-2 text-xs opacity-75">{reason}</p>
      </div>
    </div>
  );
};

export default RecommendedApostleCard;
