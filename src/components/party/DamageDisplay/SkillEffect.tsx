import { useMemo, useCallback } from 'react';
import type { Apostle } from '@/types/apostle';
import { HiMinus, HiPlus } from 'react-icons/hi';
import { calculateSkillDamageReduction } from '@/utils/damageProcessor';

type SkillLevels = Record<string, number | string | undefined>;

interface SkillEffectDisplayProps {
  apostles: Apostle[];
  skillsData?: any;
  skillLevels?: SkillLevels;
  onSkillLevelChange?: (apostleId: string, newLevel: number) => void;
}

const MIN_LEVEL = 1;
const MAX_LEVEL = 13;

const toValidLevel = (v: unknown, fallback = 1) => {
  const n = typeof v === 'string' ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Math.floor(n)));
};

const SkillEffectDisplay = ({
  apostles,
  skillsData,
  skillLevels = {},
  onSkillLevelChange,
}: SkillEffectDisplayProps) => {
  const reduction = useMemo(
    () => calculateSkillDamageReduction(apostles, skillsData, skillLevels),
    [apostles, skillsData, skillLevels],
  );

  const apostleIdByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of apostles) m.set(a.name, a.id);
    return m;
  }, [apostles]);

  const handleLevelChange = useCallback(
    (apostleId: string, delta: number) => {
      if (!onSkillLevelChange) return;

      const currentLevel = toValidLevel(skillLevels[apostleId], 1);
      const newLevel = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, currentLevel + delta));
      if (newLevel !== currentLevel) onSkillLevelChange(apostleId, newLevel);
    },
    [onSkillLevelChange, skillLevels],
  );

  if (apostles.length === 0) {
    return <div className="text-sm opacity-80">파티 분석이 진행 중입니다.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 제목 */}
      <div className="text-base font-bold">받는 피해량 감소 현황 (스킬)</div>

      {reduction.details.length > 0 ? (
        <div className="flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">스킬 구성 ({reduction.details.length}개)</div>
            <div className="text-xs opacity-70">스킬별 감소량</div>
          </div>

          {/* 스킬 리스트: daisyUI List 적용 */}
          <ul className="list">
            {reduction.details.map((item, idx) => {
              const apostleId = apostleIdByName.get(item.apostleName) ?? '';
              const canChange = Boolean(onSkillLevelChange && apostleId);

              const currentLevel = apostleId
                ? toValidLevel(skillLevels[apostleId], item.skillLevel)
                : item.skillLevel;

              return (
                <li key={`${item.apostleName}-${item.skillName}-${idx}`} className="list-row">
                  {/* 좌측: 사도명 + 범위 */}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      {item.apostleName} {item.skillType} Lv.{currentLevel}
                    </div>
                    <div className="text-xs opacity-70">범위: {item.effectRange}</div>
                  </div>

                  <div className="justify-right text-right">
                    {/* 스킬 레벨 조정 */}
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => apostleId && handleLevelChange(apostleId, -1)}
                      disabled={!canChange || currentLevel <= MIN_LEVEL}
                      aria-label={`${item.apostleName} 스킬 레벨 -1`}
                    >
                      <HiMinus />
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => apostleId && handleLevelChange(apostleId, 1)}
                      disabled={!canChange || currentLevel >= MAX_LEVEL}
                      aria-label={`${item.apostleName} 스킬 레벨 +1`}
                    >
                      <HiPlus />
                    </button>
                    <span className="badge badge-primary badge-outline">{item.reduction}%</span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* 총합 표시 (선택사항) */}
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2">
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
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-500">받는 피해량 감소 효과를 가진 사도가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default SkillEffectDisplay;
