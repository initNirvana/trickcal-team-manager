// src/components/party/DamageReductionSkillDisplay.tsx
import React, { useMemo } from 'react';
import type { Apostle } from '../../types/apostle';
import { HiMinus, HiPlus } from 'react-icons/hi';
import { calculateSkillDamageReduction } from '../../utils/damageProcessor';

interface DamageReductionDisplayProps {
  apostles: Apostle[];
  skillsData?: any;
  skillLevels?: Record<string, number>;
  onSkillLevelChange?: (apostleId: string, newLevel: number) => void;
}

export const DamageReductionDisplay: React.FC<DamageReductionDisplayProps> = ({
  apostles,
  skillsData,
  skillLevels = {},
  onSkillLevelChange,
}) => {
  const MIN_LEVEL = 1;
  const MAX_LEVEL = 13;

  const reduction = useMemo(
    () => calculateSkillDamageReduction(apostles, skillsData, skillLevels),
    [apostles, skillsData, skillLevels],
  );

  const handleLevelChange = (apostleId: string, delta: number) => {
    if (!onSkillLevelChange) return;
    const currentLevel = skillLevels[apostleId] || 1;
    const newLevel = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, currentLevel + delta));
    if (newLevel !== currentLevel) {
      onSkillLevelChange(apostleId, newLevel);
    }
  };

  if (apostles.length === 0) {
    return (
      <div className="box text-center">
        <p className="text-muted">파티 분석이 진행 중입니다.</p>
      </div>
    );
  }

  return (
    <div className="join-item border-base-300 collapse border">
      <input type="checkbox" />
      <div className="collapse-title font-semibold">
        <span className="text-sm font-semibold">받는 피해량 감소 현황 (스킬)</span>
      </div>

      {reduction.details.length > 0 ? (
        <ul className="list space-y-1 shadow-md">
          {/* 헤더 */}
          <div className="flex justify-between border-b border-gray-200 px-6 pb-2">
            <li className="text-xs font-semibold opacity-80">
              스킬 구성 ({reduction.details.length}개)
            </li>
            <p className="text-xs text-gray-500">스킬별 감소량</p>
          </div>

          {/* 스킬 리스트 */}
          {reduction.details.map((item, idx) => {
            const apostle = apostles.find((a) => a.name === item.apostleName);
            const apostleId = apostle?.id || '';

            return (
              <li
                key={idx}
                className="list-row flex items-center justify-between rounded-lg bg-gray-50 p-2 px-6 transition hover:bg-gray-100"
              >
                {/* 좌측: 사도명 + 범위 */}
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    {item.apostleName} {item.skillType} Lv.{item.skillLevel}
                  </p>
                  <p className="text-xs text-gray-500">범위: {item.appliesTo}</p>
                </div>

                {/* 사도 스킬 레벨 조정 */}
                <div className="tooltip" data-tip="스킬 레벨 조정 1 ~ 13">
                  <div className="join">
                    <button
                      className="btn btn-xs btn-soft join-item"
                      onClick={() => handleLevelChange(apostleId, -1)}
                      color="gray"
                      disabled={item.skillLevel === MIN_LEVEL}
                    >
                      <HiMinus className="h-4 w-4" />
                    </button>
                    <button
                      className="btn btn-xs btn-soft join-item"
                      onClick={() => handleLevelChange(apostleId, 1)}
                      color="gray"
                      disabled={item.skillLevel === MAX_LEVEL}
                    >
                      <HiPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* 우측: 감소량 */}
                <span className="badge badge-sm badge-info">{item.reduction}%</span>
              </li>
            );
          })}

          {/* 총합 표시 (선택사항) */}
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-1">
            <p className="text-sm font-bold text-gray-900">총 감소량</p>
            <div className="tooltip" data-tip="최대 75%">
              <span
                className={`badge ${
                  reduction.totalReduction >= 60 ? 'badge-success' : 'badge-warning'
                }`}
              >
                {reduction.totalReduction}%
              </span>
            </div>
          </div>
        </ul>
      ) : (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-500">파티에 받는 피해량 감소 효과가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default DamageReductionDisplay;
