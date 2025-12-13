import React, { useMemo } from 'react';
import type { Apostle } from '../../../types/apostle';
import { calculateAsideEffects, calculatePositionSum } from '../../../utils/damageProcessor';

interface AsideEffectProps {
  apostles: Apostle[];
  asidesData?: any;
  asideSelection: Record<string, number | null>;
}

// ✅ 포지션별 설정
const positionConfig = {
  all: {
    label: '모든 아군',
    dotColor: 'text-slate-700 dark:text-slate-300',
  },
  front: {
    label: '전열 아군',
    dotColor: 'text-red-700 dark:text-red-300',
  },
  mid: {
    label: '중열 아군',
    dotColor: 'text-green-700 dark:text-green-300',
  },
  back: {
    label: '후열 아군',
    dotColor: 'text-blue-700 dark:text-blue-300',
  },
  persona: {
    label: '동일 성격 아군',
    dotColor: 'text-purple-700 dark:text-purple-300',
  },
};

// ✅ 포지션 효과 라인 (증가/감소 함께 표시)
const PositionEffectLine: React.FC<{
  position: 'all' | 'front' | 'mid' | 'back' | 'persona';
  skillIncrease?: number;
  damageIncrease?: number;
  damageReduction?: number;
  skillReduction?: number;
}> = ({
  position,
  skillIncrease = 0,
  damageIncrease = 0,
  damageReduction = 0,
  skillReduction = 0,
}) => {
  const config = positionConfig[position];

  // 표시할 항목만 필터링
  const items: Array<{ label: string; value: number; color: string }> = [];

  if (skillIncrease && skillIncrease > 0) {
    items.push({
      label: '스킬 피해량 증가',
      value: skillIncrease,
      color: 'text-yellow-600 dark:text-yellow-400',
    });
  }

  if (skillReduction && skillReduction > 0) {
    items.push({
      label: '스킬 피해량 감소',
      value: skillReduction,
      color: 'text-cyan-600 dark:text-cyan-400',
    });
  }
  if (position === 'persona') {
    if (damageIncrease && damageIncrease > 0) {
      items.push({
        label: '동일 성격 피해량 증가',
        value: damageIncrease,
        color: 'text-orange-600 dark:text-orange-400',
      });
    }
    if (damageReduction && damageReduction > 0) {
      items.push({
        label: '동일 성격 받는 피해량 감소',
        value: damageReduction,
        color: 'text-blue-600 dark:text-blue-400',
      });
    }
  } else {
    if (damageIncrease && damageIncrease > 0) {
      items.push({
        label: '피해량 증가',
        value: damageIncrease,
        color: 'text-orange-600 dark:text-orange-400',
      });
    }
    if (damageReduction && damageReduction > 0) {
      items.push({
        label: '받는 피해량 감소',
        value: damageReduction,
        color: 'text-blue-600 dark:text-blue-400',
      });
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className={`text-sm font-semibold ${config.dotColor}`}>● {config.label}</p>
      <div className="ml-4 space-y-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
            <span className={`font-bold ${item.color}`}>+{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EffectSection: React.FC<{
  skillIncreaseByPosition: Record<string, number>;
  damageIncreaseByPosition?: Record<string, number>;
  damageIncreaseByPersona?: Record<string, number>;
  damageReductionByPosition?: Record<string, number>;
  damageReductionByPersona?: Record<string, number>;
  skillReductionByPosition?: Record<string, number>;
}> = ({
  skillIncreaseByPosition = {},
  damageIncreaseByPosition = {},
  damageIncreaseByPersona = {},
  damageReductionByPosition = {},
  damageReductionByPersona = {},
  skillReductionByPosition = {},
}) => {
  const hasAnyEffect =
    Object.values(skillIncreaseByPosition).some((v) => v > 0) ||
    (damageIncreaseByPosition && Object.values(damageIncreaseByPosition).some((v) => v > 0)) ||
    (damageReductionByPosition && Object.values(damageReductionByPosition).some((v) => v > 0)) ||
    (damageIncreaseByPersona && Object.values(damageIncreaseByPersona).some((v) => v > 0)) ||
    (damageReductionByPersona && Object.values(damageReductionByPersona).some((v) => v > 0)) ||
    (skillReductionByPosition && Object.values(skillReductionByPosition).some((v) => v > 0));

  if (!hasAnyEffect) return null;

  console.log(damageReductionByPersona.persona);

  return (
    <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/20">
      <div className="space-y-4">
        <PositionEffectLine
          position="persona"
          damageIncrease={damageIncreaseByPersona.persona}
          damageReduction={damageReductionByPersona.persona}
        />

        <PositionEffectLine
          position="all"
          skillIncrease={skillIncreaseByPosition.all}
          damageIncrease={damageIncreaseByPosition?.all}
          damageReduction={damageReductionByPosition?.all}
          skillReduction={skillReductionByPosition?.all}
        />

        <PositionEffectLine
          position="front"
          skillIncrease={skillIncreaseByPosition.front}
          damageIncrease={damageIncreaseByPosition?.front}
          damageReduction={damageReductionByPosition?.front}
          skillReduction={skillReductionByPosition?.front}
        />

        <PositionEffectLine
          position="mid"
          skillIncrease={skillIncreaseByPosition.mid}
          damageIncrease={damageIncreaseByPosition?.mid}
          damageReduction={damageReductionByPosition?.mid}
          skillReduction={skillReductionByPosition?.mid}
        />

        <PositionEffectLine
          position="back"
          skillIncrease={skillIncreaseByPosition.back}
          damageIncrease={damageIncreaseByPosition?.back}
          damageReduction={damageReductionByPosition?.back}
          skillReduction={skillReductionByPosition?.back}
        />
      </div>
    </div>
  );
};

export const AsideEffectDisplay: React.FC<AsideEffectProps> = ({
  apostles,
  asidesData,
  asideSelection,
}) => {
  const effectList = useMemo(
    () => calculateAsideEffects(apostles, asidesData, asideSelection),
    [apostles, asidesData, asideSelection],
  );

  if (apostles.length === 0) {
    return (
      <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
        파티에 사도를 추가하세요.
      </div>
    );
  }

  const totalHasEffect =
    effectList.totalIncrease +
    effectList.totalReduction +
    effectList.totalSkillIncrease +
    effectList.totalSkillReduction;

  // ✅ 포지션별 효과값 계산
  const damageIncreaseByPersona = {
    all: calculatePositionSum(effectList.increaseEffects.all, false, false),
    front: calculatePositionSum(effectList.increaseEffects.front, false, false),
    mid: calculatePositionSum(effectList.increaseEffects.mid, false, false),
    back: calculatePositionSum(effectList.increaseEffects.back, false, false),
    persona: calculatePositionSum(effectList.increaseEffects.persona, true, false),
  };

  const damageReductionByPersona = {
    all: calculatePositionSum(effectList.reductionEffects.all, false, false),
    front: calculatePositionSum(effectList.reductionEffects.front, false, false),
    mid: calculatePositionSum(effectList.reductionEffects.mid, false, false),
    back: calculatePositionSum(effectList.reductionEffects.back, false, false),
    persona: calculatePositionSum(effectList.reductionEffects.persona, false, false),
  };

  const skillIncreaseByPosition = {
    all: calculatePositionSum(effectList.skillIncreaseEffects.all, true, true),
    front: calculatePositionSum(effectList.skillIncreaseEffects.front, true, true),
    mid: calculatePositionSum(effectList.skillIncreaseEffects.mid, true, true),
    back: calculatePositionSum(effectList.skillIncreaseEffects.back, true, true),
  };

  const damageIncreaseByPosition = {
    all: calculatePositionSum(effectList.increaseEffects.all, true, false),
    front: calculatePositionSum(effectList.increaseEffects.front, true, false),
    mid: calculatePositionSum(effectList.increaseEffects.mid, true, false),
    back: calculatePositionSum(effectList.increaseEffects.back, true, false),
  };

  const damageReductionByPosition = {
    all: calculatePositionSum(effectList.reductionEffects.all, false, false),
    front: calculatePositionSum(effectList.reductionEffects.front, false, false),
    mid: calculatePositionSum(effectList.reductionEffects.mid, false, false),
    back: calculatePositionSum(effectList.reductionEffects.back, false, false),
  };

  const skillReductionByPosition = {
    all: calculatePositionSum(effectList.skillReductionEffects.all, false, true),
    front: calculatePositionSum(effectList.skillReductionEffects.front, false, true),
    mid: calculatePositionSum(effectList.skillReductionEffects.mid, false, true),
    back: calculatePositionSum(effectList.skillReductionEffects.back, false, true),
  };

  return (
    <div className="space-y-6">
      <div className="collapse-arrow border-base-300 bg-base-100 collapse border">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title font-semibold">어사이드 효과</div>

        <div className="collapse-content text-sm">
          {totalHasEffect === 0 && (
            <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
              어사이드 설정에서 사도의 어사이드를 선택해주세요.
            </div>
          )}

          {/* ✅ 기타 섹션 */}
          <EffectSection
            skillIncreaseByPosition={skillIncreaseByPosition}
            skillReductionByPosition={skillReductionByPosition}
            damageIncreaseByPersona={damageIncreaseByPersona}
            damageReductionByPersona={damageReductionByPersona}
          />

          {/* ✅ 피해량 섹션 */}
          <EffectSection
            skillIncreaseByPosition={{}}
            damageIncreaseByPosition={damageIncreaseByPosition}
            damageReductionByPosition={damageReductionByPosition}
          />
        </div>
      </div>
    </div>
  );
};

export default AsideEffectDisplay;
