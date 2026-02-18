import { useMemo, useState } from 'react';
import type { Apostle } from '@/types/apostle';
import type { Aside } from '@/types/aside';
import { type AsideEffect, calculateAsideEffects } from '@/utils/party/damageProcessor';

type PositionKey = 'all' | 'front' | 'mid' | 'back' | 'persona';

interface AsideEffectProps {
  apostles: Apostle[];
  asidesData?: Aside[];
  asideSelection: Record<string, number[]>;
}

const ALL_POSITIONS: PositionKey[] = ['all', 'front', 'mid', 'back', 'persona'];
const NON_PERSONA_POSITIONS: PositionKey[] = ['all', 'front', 'mid', 'back'];

const positionConfig: Record<PositionKey, { label: string; dotColor: string }> = {
  all: { label: '모든 아군', dotColor: 'text-slate-700 dark:text-slate-300' },
  front: { label: '전열 아군', dotColor: 'text-red-700 dark:text-red-300' },
  mid: { label: '중열 아군', dotColor: 'text-green-700 dark:text-green-300' },
  back: { label: '후열 아군', dotColor: 'text-blue-700 dark:text-blue-300' },
  persona: { label: '동일 성격 아군', dotColor: 'text-purple-700 dark:text-purple-300' },
};

const sumBy = <T,>(arr: T[], pick: (v: T) => number) =>
  arr.reduce((acc, v) => acc + (pick(v) ?? 0), 0);

/**
 * GroupedEffects에서 특정 속성을 위치별로 집계
 */
const aggregateByPosition = (
  effects: Record<PositionKey, AsideEffect[]>,
  positions: PositionKey[],
  picker: (item: AsideEffect) => number,
): Record<PositionKey, number> => {
  const result = {} as Record<PositionKey, number>;
  positions.forEach((pos) => {
    result[pos] = sumBy(effects[pos], picker);
  });
  return result;
};

/**
 * 여러 effectList에서 특정 속성을 위치별로 합산
 */
const aggregateEffects = (
  effectLists: Array<Record<PositionKey, AsideEffect[]>>,
  positions: PositionKey[],
) => {
  type AggregatedEffect = {
    criticalRate: number;
    criticalDamage: number;
    criticalResist: number;
    criticalDamageResist: number;
    spRecovery: number;
    attackSpeed: number;
    hp: number;
  };

  const result: Record<PositionKey, AggregatedEffect> = {} as Record<PositionKey, AggregatedEffect>;

  positions.forEach((pos) => {
    result[pos] = {
      criticalRate: effectLists.reduce(
        (sum, list) => sum + sumBy(list[pos], (e) => e.criticalRate ?? 0),
        0,
      ),
      criticalDamage: effectLists.reduce(
        (sum, list) => sum + sumBy(list[pos], (e) => e.criticalDamage ?? 0),
        0,
      ),
      criticalResist: effectLists.reduce(
        (sum, list) => sum + sumBy(list[pos], (e) => e.criticalResist ?? 0),
        0,
      ),
      criticalDamageResist: effectLists.reduce(
        (sum, list) => sum + sumBy(list[pos], (e) => e.criticalDamageResist ?? 0),
        0,
      ),
      spRecovery: effectLists.reduce(
        (sum, list) => sum + sumBy(list[pos], (e) => e.spRecovery ?? 0),
        0,
      ),
      attackSpeed: effectLists.reduce(
        (sum, list) => sum + sumBy(list[pos], (e) => e.attackSpeed ?? 0),
        0,
      ),
      hp: effectLists.reduce((sum, list) => sum + sumBy(list[pos], (e) => e.hp ?? 0), 0),
    };
  });

  return result;
};

const PositionEffectLine = ({
  position,
  skillIncrease = 0,
  skillReduction = 0,
  damageIncrease = 0,
  damageReduction = 0,
  criticalRate = 0,
  criticalDamage = 0,
  criticalResist = 0,
  criticalDamageResist = 0,
  spRecovery = 0,
  attackSpeed = 0,
  hp = 0,
}: {
  position: PositionKey;
  skillIncrease?: number;
  skillReduction?: number;
  damageIncrease?: number;
  damageReduction?: number;
  criticalRate?: number;
  criticalDamage?: number;
  criticalResist?: number;
  criticalDamageResist?: number;
  spRecovery?: number;
  attackSpeed?: number;
  hp?: number;
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
      label: '피해량 증가',
      value: damageIncrease,
      color: 'text-orange-600 dark:text-orange-400',
    });
  }

  if (damageReduction > 0) {
    items.push({
      label: '받는 피해량 감소',
      value: damageReduction,
      color: 'text-blue-600 dark:text-blue-400',
    });
  }

  // 치명타 관련
  if (criticalRate > 0) {
    items.push({
      label: '치명타 확률 증가',
      value: criticalRate,
      color: 'text-red-600 dark:text-red-400',
    });
  }
  if (criticalDamage > 0) {
    items.push({
      label: '치명타 피해 증가',
      value: criticalDamage,
      color: 'text-pink-600 dark:text-pink-400',
    });
  }
  if (criticalResist > 0) {
    items.push({
      label: '치명타 저항',
      value: criticalResist,
      color: 'text-purple-600 dark:text-purple-400',
    });
  }
  if (criticalDamageResist > 0) {
    items.push({
      label: '치명타 피해 저항',
      value: criticalDamageResist,
      color: 'text-indigo-600 dark:text-indigo-400',
    });
  }

  // 기타 수치형 효과
  if (spRecovery > 0) {
    items.push({
      label: 'SP 회복량 증가',
      value: spRecovery,
      color: 'text-green-600 dark:text-green-400',
    });
  }
  if (attackSpeed > 0) {
    items.push({
      label: '공격 속도 증가',
      value: attackSpeed,
      color: 'text-amber-600 dark:text-amber-400',
    });
  }
  if (hp > 0) {
    items.push({ label: '최대 HP 증가', value: hp, color: 'text-rose-600 dark:text-rose-400' });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className={`font-semibold ${config.dotColor}`}>● {config.label}</span>
      <div className="flex flex-col gap-0.5 pl-4">
        {items.map((item, idx) => (
          <span key={`${position}-${item.label}-${idx}`} className={item.color}>
            {item.label} +{item.value}%
          </span>
        ))}
      </div>
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
    criticalRate?: number;
    criticalDamage?: number;
    criticalResist?: number;
    criticalDamageResist?: number;
    spRecovery?: number;
    attackSpeed?: number;
    hp?: number;
  }>;
}) => {
  const hasAny = lines.some(
    (l) =>
      (l.skillIncrease ?? 0) > 0 ||
      (l.skillReduction ?? 0) > 0 ||
      (l.damageIncrease ?? 0) > 0 ||
      (l.damageReduction ?? 0) > 0 ||
      (l.criticalRate ?? 0) > 0 ||
      (l.criticalDamage ?? 0) > 0 ||
      (l.criticalResist ?? 0) > 0 ||
      (l.criticalDamageResist ?? 0) > 0 ||
      (l.spRecovery ?? 0) > 0 ||
      (l.attackSpeed ?? 0) > 0 ||
      (l.hp ?? 0) > 0,
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

/**
 * 물리/마법 피해 감소를 하나의 섹션에서 리스트로 표시
 */
const DamageTypeListSection = ({
  types,
}: {
  types: Array<{ label: string; reductionByPosition: Record<PositionKey, number>; color: string }>;
}) => {
  const hasAnyType = types.some((t) => ALL_POSITIONS.some((pos) => t.reductionByPosition[pos] > 0));
  if (!hasAnyType) return null;

  return (
    <section className="rounded-box bg-base-200 p-3">
      <div className="flex flex-col gap-3">
        {types.map(({ label, reductionByPosition, color }) => {
          const hasThis = ALL_POSITIONS.some((pos) => reductionByPosition[pos] > 0);
          if (!hasThis) return null;

          return (
            <div key={label} className="flex flex-col gap-1">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {label}
              </div>
              {ALL_POSITIONS.map((position) => {
                const value = reductionByPosition[position];
                if (value <= 0) return null;

                const config = positionConfig[position];
                return (
                  <div key={position} className="flex items-center gap-2 text-sm">
                    <span className={`font-semibold ${config.dotColor}`}>● {config.label}</span>
                    <span className={color}>피해량 감소 +{value}%</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const SkillEffectItem = ({ effect }: { effect: AsideEffect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="bg-base-100 hover:bg-base-200/50 flex cursor-pointer flex-col gap-1 rounded p-2 transition-colors"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-purple-600 dark:text-purple-400">● {effect.apostleName}</span>
          <span className="text-xs text-gray-500">Lv.{effect.rankStar}</span>
        </div>
        <div className="text-xs text-slate-400">{isOpen ? '접기 ▲' : '설명 보기 ▼'}</div>
      </div>

      <div className="flex flex-col gap-0.5 pl-4 text-sm">
        {/* 주요 정보 우선 표시 */}
        {effect.duration && (
          <div className="font-medium text-amber-600 dark:text-amber-400">
            지속 시간: {effect.duration}초
          </div>
        )}

        {effect.damageReduction > 0 && (
          <div className="text-blue-600 dark:text-blue-400">
            받는 피해량 감소 +{effect.damageReduction}%
          </div>
        )}
        {effect.damageIncrease > 0 && (
          <div className="text-orange-600 dark:text-orange-400">
            피해량 증가 +{effect.damageIncrease}%
          </div>
        )}

        {/* 상세 설명 (토글) */}
        {isOpen && effect.description && (
          <div className="border-base-300 mt-1 border-t pt-1 text-xs whitespace-pre-wrap text-gray-600 dark:text-gray-400">
            {effect.description}
          </div>
        )}
      </div>
    </div>
  );
};

const SkillEffectSection = ({ effects }: { effects: AsideEffect[] }) => {
  if (!effects || effects.length === 0) return null;

  return (
    <section className="rounded-box bg-base-200 p-3">
      <div className="flex flex-col gap-2">
        <div className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          스킬 효과
        </div>
        {effects.map((effect, idx) => (
          <SkillEffectItem key={`${effect.apostleId}-${idx}`} effect={effect} />
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
    effectList.totalSkillReduction +
    effectList.totalPhysicalReduction +
    effectList.totalMagicalReduction +
    effectList.skillTypeEffects.length;

  const damageIncreaseByPosition = aggregateByPosition(
    effectList.increaseEffects,
    ALL_POSITIONS,
    (e) => e.damageIncrease,
  );

  const damageReductionByPosition = aggregateByPosition(
    effectList.reductionEffects,
    ALL_POSITIONS,
    (e) => e.damageReduction,
  );

  const skillIncreaseByPosition = aggregateByPosition(
    effectList.skillIncreaseEffects,
    NON_PERSONA_POSITIONS,
    (e) => e.skillIncrease,
  );

  const skillReductionByPosition = aggregateByPosition(
    effectList.skillReductionEffects,
    NON_PERSONA_POSITIONS,
    (e) => e.skillReduction,
  );

  // 물리 피해 감소 (림, 벨벳, 멜루나)
  const physicalReductionByPosition = aggregateByPosition(
    effectList.physicalReductionEffects,
    ALL_POSITIONS,
    (e) => e.damageReduction,
  );

  // 마법 피해 감소 (빅우드, 힐데)
  const magicalReductionByPosition = aggregateByPosition(
    effectList.magicalReductionEffects,
    ALL_POSITIONS,
    (e) => e.damageReduction,
  );

  // 모든 effectList에서 치명타, SP, 공속, HP 효과를 위치별로 집계
  const mergedByPosition = aggregateEffects(
    [
      effectList.increaseEffects,
      effectList.reductionEffects,
      effectList.skillIncreaseEffects,
      effectList.skillReductionEffects,
    ],
    ALL_POSITIONS,
  );

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
            ...mergedByPosition.all,
          },
          {
            position: 'front',
            damageIncrease: damageIncreaseByPosition.front,
            damageReduction: damageReductionByPosition.front,
            ...mergedByPosition.front,
          },
          {
            position: 'mid',
            damageIncrease: damageIncreaseByPosition.mid,
            damageReduction: damageReductionByPosition.mid,
            ...mergedByPosition.mid,
          },
          {
            position: 'back',
            damageIncrease: damageIncreaseByPosition.back,
            damageReduction: damageReductionByPosition.back,
            ...mergedByPosition.back,
          },
          {
            position: 'persona',
            damageIncrease: damageIncreaseByPosition.persona,
            damageReduction: damageReductionByPosition.persona,
            ...mergedByPosition.persona,
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

      {/* 스킬 효과 섹션 (새로 추가됨) */}
      <SkillEffectSection effects={effectList.skillTypeEffects} />

      <DamageTypeListSection
        types={[
          {
            label: '물리 피해량 감소',
            reductionByPosition: physicalReductionByPosition,
            color: 'text-blue-600',
          },
          {
            label: '마법 피해량 감소',
            reductionByPosition: magicalReductionByPosition,
            color: 'text-cyan-600',
          },
        ]}
      />
    </div>
  );
};

export default AsideEffectDisplay;
