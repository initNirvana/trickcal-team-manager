import { useMemo } from 'react';
import type { Apostle } from '@/types/apostle';
import { calculateAsideEffects } from '@/utils/damageProcessor';

type PositionKey = 'all' | 'front' | 'mid' | 'back' | 'persona';

interface AsideEffectProps {
  apostles: Apostle[];
  asidesData?: any;
  asideSelection: Record<string, number | string | undefined>;
}

const positionConfig: Record<PositionKey, { label: string; dotColor: string }> = {
  all: { label: '모든 아군', dotColor: 'text-slate-700 dark:text-slate-300' },
  front: { label: '전열 아군', dotColor: 'text-red-700 dark:text-red-300' },
  mid: { label: '중열 아군', dotColor: 'text-green-700 dark:text-green-300' },
  back: { label: '후열 아군', dotColor: 'text-blue-700 dark:text-blue-300' },
  persona: { label: '동일 성격 아군', dotColor: 'text-purple-700 dark:text-purple-300' },
};

const sumBy = <T,>(arr: T[], pick: (v: T) => number) =>
  arr.reduce((acc, v) => acc + (pick(v) ?? 0), 0);

const PositionEffectLine = ({
  position,
  skillIncrease = 0,
  skillReduction = 0,
  damageIncrease = 0,
  damageReduction = 0,
}: {
  position: PositionKey;
  skillIncrease?: number;
  skillReduction?: number;
  damageIncrease?: number;
  damageReduction?: number;
}) => {
  const config = positionConfig[position];

  const items: Array<{ label: string; value: number; color: string }> = [];

  if (skillIncrease > 0) {
    items.push({
      label: '스킬 피해량 증가',
      value: skillIncrease,
      color: 'text-yellow-600 dark:text-yellow-400',
    });
  }

  if (skillReduction > 0) {
    items.push({
      label: '스킬 피해량 감소',
      value: skillReduction,
      color: 'text-cyan-600 dark:text-cyan-400',
    });
  }

  if (damageIncrease > 0) {
    items.push({
      label: position === 'persona' ? '피해량 증가' : '피해량 증가',
      value: damageIncrease,
      color: 'text-orange-600 dark:text-orange-400',
    });
  }

  if (damageReduction > 0) {
    items.push({
      label: position === 'persona' ? '받는 피해량 감소' : '받는 피해량 감소',
      value: damageReduction,
      color: 'text-blue-600 dark:text-blue-400',
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className={`font-semibold ${config.dotColor}`}>● {config.label}</span>
      {items.map((item, idx) => (
        <span key={`${position}-${item.label}-${idx}`} className={item.color}>
          {item.label} +{item.value}%
        </span>
      ))}
    </div>
  );
};

const EffectSection = ({
  lines,
}: {
  lines: Array<{
    position: PositionKey;
    skillIncrease?: number;
    skillReduction?: number;
    damageIncrease?: number;
    damageReduction?: number;
  }>;
}) => {
  const hasAny = lines.some(
    (l) =>
      (l.skillIncrease ?? 0) > 0 ||
      (l.skillReduction ?? 0) > 0 ||
      (l.damageIncrease ?? 0) > 0 ||
      (l.damageReduction ?? 0) > 0,
  );

  if (!hasAny) return null;

  return (
    <section className="rounded-box bg-base-200 p-3">
      <div className="flex flex-col gap-1">
        {lines.map((l) => (
          <PositionEffectLine key={`${l.position}`} {...l} />
        ))}
      </div>
    </section>
  );
};

const AsideEffectDisplay = ({ apostles, asidesData, asideSelection }: AsideEffectProps) => {
  const effectList = useMemo(
    () => calculateAsideEffects(apostles, asidesData, asideSelection),
    [apostles, asidesData, asideSelection],
  );

  if (!apostles || apostles.length === 0) {
    return (
      <div className="rounded-box bg-base-200 p-3 text-sm opacity-80">덱에 사도를 추가하세요.</div>
    );
  }

  const totalHasEffect =
    effectList.totalIncrease +
    effectList.totalReduction +
    effectList.totalSkillIncrease +
    effectList.totalSkillReduction;

  const damageIncreaseByPosition = {
    all: sumBy(effectList.increaseEffects.all, (e) => e.damageIncrease),
    front: sumBy(effectList.increaseEffects.front, (e) => e.damageIncrease),
    mid: sumBy(effectList.increaseEffects.mid, (e) => e.damageIncrease),
    back: sumBy(effectList.increaseEffects.back, (e) => e.damageIncrease),
    persona: sumBy(effectList.increaseEffects.persona, (e) => e.damageIncrease),
  };

  const damageReductionByPosition = {
    all: sumBy(effectList.reductionEffects.all, (e) => e.damageReduction),
    front: sumBy(effectList.reductionEffects.front, (e) => e.damageReduction),
    mid: sumBy(effectList.reductionEffects.mid, (e) => e.damageReduction),
    back: sumBy(effectList.reductionEffects.back, (e) => e.damageReduction),
    persona: sumBy(effectList.reductionEffects.persona, (e) => e.damageReduction),
  };

  const skillIncreaseByPosition = {
    all: sumBy(effectList.skillIncreaseEffects.all, (e) => e.skillIncrease),
    front: sumBy(effectList.skillIncreaseEffects.front, (e) => e.skillIncrease),
    mid: sumBy(effectList.skillIncreaseEffects.mid, (e) => e.skillIncrease),
    back: sumBy(effectList.skillIncreaseEffects.back, (e) => e.skillIncrease),
  };

  const skillReductionByPosition = {
    all: sumBy(effectList.skillReductionEffects.all, (e) => e.skillReduction),
    front: sumBy(effectList.skillReductionEffects.front, (e) => e.skillReduction),
    mid: sumBy(effectList.skillReductionEffects.mid, (e) => e.skillReduction),
    back: sumBy(effectList.skillReductionEffects.back, (e) => e.skillReduction),
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-base font-bold">어사이드 효과</div>

      {totalHasEffect === 0 && (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-500">어사이드 설정에서 사도의 어사이드를 선택해주세요.</p>
        </div>
      )}

      {/* 피해량 증가/감소 효과 섹션 */}
      <EffectSection
        lines={[
          {
            position: 'all',
            damageIncrease: damageIncreaseByPosition.all,
            damageReduction: damageReductionByPosition.all,
          },
          {
            position: 'front',
            damageIncrease: damageIncreaseByPosition.front,
            damageReduction: damageReductionByPosition.front,
          },
          {
            position: 'mid',
            damageIncrease: damageIncreaseByPosition.mid,
            damageReduction: damageReductionByPosition.mid,
          },
          {
            position: 'back',
            damageIncrease: damageIncreaseByPosition.back,
            damageReduction: damageReductionByPosition.back,
          },
          {
            position: 'persona',
            damageIncrease: damageIncreaseByPosition.persona,
            damageReduction: damageReductionByPosition.persona,
          },
        ]}
      />

      {/* 스킬 피해량 증가/감소 효과 섹션 */}
      <EffectSection
        lines={[
          {
            position: 'all',
            skillIncrease: skillIncreaseByPosition.all,
            skillReduction: skillReductionByPosition.all,
          },
          {
            position: 'front',
            skillIncrease: skillIncreaseByPosition.front,
            skillReduction: skillReductionByPosition.front,
          },
          {
            position: 'mid',
            skillIncrease: skillIncreaseByPosition.mid,
            skillReduction: skillReductionByPosition.mid,
          },
          {
            position: 'back',
            skillIncrease: skillIncreaseByPosition.back,
            skillReduction: skillReductionByPosition.back,
          },
        ]}
      />
    </div>
  );
};

export default AsideEffectDisplay;
