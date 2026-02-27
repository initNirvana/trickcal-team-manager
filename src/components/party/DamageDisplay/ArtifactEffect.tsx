import { useMemo, useState } from 'react';
import type { Apostle } from '@/types/apostle';
import type { Artifact } from '@/types/artifact';
import { calculateArtifactEffects, type DynamicEffect } from '@/utils/party/damageProcessor';

type PositionKey = 'all' | 'front' | 'mid' | 'back';

interface ArtifactEffectProps {
  apostles: Apostle[];
  artifactsData?: Artifact[];
  equippedArtifacts: Record<string, [number | null, number | null, number | null]>;
}

const positionConfig: Record<PositionKey, { label: string; dotColor: string }> = {
  all: { label: '모든 아군', dotColor: 'text-slate-700 dark:text-slate-300' },
  front: { label: '전열 아군', dotColor: 'text-red-700 dark:text-red-300' },
  mid: { label: '중열 아군', dotColor: 'text-green-700 dark:text-green-300' },
  back: { label: '후열 아군', dotColor: 'text-blue-700 dark:text-blue-300' },
};

const EFFECT_LABELS: Record<string, { label: string; color: string; isNegative?: boolean }> = {
  physicalAttack: { label: '물리 공격력 증가', color: 'text-orange-600 dark:text-orange-400' },
  magicAttack: { label: '마법 공격력 증가', color: 'text-blue-600 dark:text-blue-400' },
  criticalRate: { label: '치명타 확률 증가', color: 'text-red-600 dark:text-red-400' },
  criticalDamage: { label: '치명타 피해 증가', color: 'text-pink-600 dark:text-pink-400' },
  attackSpeed: { label: '공격 속도 증가', color: 'text-amber-600 dark:text-amber-400' },
  skillDamage: { label: '스킬 피해량 증가', color: 'text-emerald-600 dark:text-emerald-400' },
  damage: { label: '일반 피해량 증가', color: 'text-teal-600 dark:text-teal-400' },
  generalDamage: { label: '피해량 증가', color: 'text-cyan-600 dark:text-cyan-400' },
  hpRecovery: { label: 'HP 회복량 증가', color: 'text-green-600 dark:text-green-400' },
  damageReduction: { label: '받는 피해량 감소', color: 'text-indigo-600 dark:text-indigo-400' },
  healing: { label: '치유량 증가', color: 'text-lime-600 dark:text-lime-400' },
  shield: { label: '받는 보호막 효과 증가', color: 'text-slate-600 dark:text-slate-400' },
  spRecovery: { label: '기본 SP 회복량 증가', color: 'text-yellow-600 dark:text-yellow-400' },
  magicDamage: { label: '마법 피해량 증가', color: 'text-fuchsia-600 dark:text-fuchsia-400' },
  commonDamage: { label: '일반 공격 피해량 증가', color: 'text-rose-600 dark:text-rose-400' },
  highGradeSkillDamage: {
    label: '고학년 스킬 피해량 증가',
    color: 'text-violet-600 dark:text-violet-400',
  },
  enhancedAttackDamage: { label: '강화 공격 피해량 증가', color: 'text-sky-600 dark:text-sky-400' },
  hp: { label: '최대 HP 증가', color: 'text-emerald-500 dark:text-emerald-300' },
};

const getEffectLabel = (effect: DynamicEffect) => {
  const config = EFFECT_LABELS[effect.type] || {
    label: `${effect.type} 증가`,
    color: 'text-gray-600 dark:text-gray-400',
  };

  let label = config.label;
  const roundedValue = Math.round(effect.value * 100) / 100;
  let valueStr = roundedValue > 0 ? `+${roundedValue}%` : `${roundedValue}%`;

  if (roundedValue < 0 && label.includes('증가')) {
    label = label.replace('증가', '감소');
    // 음수일 경우 이미 '-' 부호가 포함되어 있으므로 그대로 출력
    valueStr = `${roundedValue}%`;
  }

  return { label, color: config.color, valueStr };
};

const PositionEffectLine = ({
  position,
  effects,
}: {
  position: PositionKey;
  effects: DynamicEffect[];
}) => {
  if (!effects || effects.length === 0) return null;

  const config = positionConfig[position];

  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className={`font-semibold ${config.dotColor}`}>● {config.label}</span>
      <div className="flex flex-col gap-0.5 pl-4">
        {effects.map((effect, idx) => {
          const { label, color, valueStr } = getEffectLabel(effect);
          return (
            <span key={`${position}-${effect.type}-${idx}`} className={color}>
              {label} {valueStr}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EffectSection = ({ rowEffects }: { rowEffects: Record<PositionKey, DynamicEffect[]> }) => {
  const hasAny = Object.values(rowEffects).some((effects) => effects.length > 0);

  if (!hasAny) return null;

  return (
    <section className="rounded-box bg-base-200 p-3">
      <div className="flex flex-col gap-1">
        {(Object.entries(rowEffects) as [PositionKey, DynamicEffect[]][]).map(([pos, effects]) => (
          <PositionEffectLine key={pos} position={pos} effects={effects} />
        ))}
      </div>
    </section>
  );
};

const SpecialEffectItem = ({
  effectData,
}: {
  effectData: {
    apostleId: string;
    apostleName: string;
    artifactId: number;
    artifactName: string;
    description?: string;
    effects: DynamicEffect[];
  };
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="bg-base-100 hover:bg-base-200/50 flex cursor-pointer flex-col gap-1 rounded p-2 transition-colors"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-purple-600 dark:text-purple-400">● {effectData.apostleName}</span>
          <span className="text-xs text-gray-500">{effectData.artifactName}</span>
        </div>
        <div className="text-xs text-slate-400">{isOpen ? '접기 ▲' : '설명/효과 보기 ▼'}</div>
      </div>

      <div className="flex flex-col gap-0.5 pl-4 text-sm">
        {isOpen && (
          <div className="border-base-300 mt-1 border-t pt-2 flex flex-col gap-1">
            {effectData.effects.map((eff, i) => {
              const { label, color, valueStr } = getEffectLabel(eff);
              return (
                <span key={i} className={`text-xs ${color}`}>
                  - {label} {valueStr}
                </span>
              );
            })}

            {effectData.description && (
              <div className="text-xs whitespace-pre-wrap text-gray-500 mt-1">
                {effectData.description}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * TODO: 개별/특수 아티팩트 효과 표시
 * 추가 검토 필요 UI/UX 방향
 * @param effects 아티팩트 효과
 * @returns
 */
const _SpecialEffectSection = ({
  effects,
}: {
  effects: {
    apostleId: string;
    apostleName: string;
    artifactId: number;
    artifactName: string;
    description?: string;
    effects: DynamicEffect[];
  }[];
}) => {
  if (!effects || effects.length === 0) return null;

  return (
    <section className="rounded-box bg-base-200 p-3">
      <div className="flex flex-col gap-2">
        <div className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          개별/특수 아티팩트 효과
        </div>
        {effects.map((effectData, idx) => (
          <SpecialEffectItem
            key={`${effectData.apostleId}-${effectData.artifactId}-${idx}`}
            effectData={effectData}
          />
        ))}
      </div>
    </section>
  );
};

const ArtifactEffectDisplay = ({
  apostles,
  artifactsData,
  equippedArtifacts,
}: ArtifactEffectProps) => {
  const effectList = useMemo(
    () => calculateArtifactEffects(apostles, artifactsData, equippedArtifacts),
    [apostles, artifactsData, equippedArtifacts],
  );

  if (!apostles || apostles.length === 0) {
    return (
      <div className="rounded-box bg-base-200 p-3 text-sm opacity-80">덱에 사도를 추가하세요.</div>
    );
  }

  const hasAnyRowStats = Object.values(effectList.rowEffectsByPosition).some(
    (arr) => arr.length > 0,
  );

  const totalHasEffect = hasAnyRowStats || effectList.individualEffectsByApostle.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-base font-bold">아티팩트 효과</div>

      {!totalHasEffect && (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-500">사도에게 아티팩트를 장착해주세요.</p>
        </div>
      )}

      {/* 포지션별(스탯/연산형) 효과 섹션 */}
      <EffectSection rowEffects={effectList.rowEffectsByPosition} />

      {/* 특수/개인 효과 분석 섹션 */}
      {/* <SpecialEffectSection effects={effectList.individualEffectsByApostle} /> */}
    </div>
  );
};

export default ArtifactEffectDisplay;
