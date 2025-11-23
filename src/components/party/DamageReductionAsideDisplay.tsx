import React, { useMemo } from 'react';
import type { Apostle } from '../../types/apostle';
import { Accordion, AccordionPanel, AccordionContent, AccordionTitle, Badge } from 'flowbite-react';

// ✅ 올바른 Props 인터페이스
interface DamageReductionAsideDisplayProps {
  apostles: Apostle[];
  asidesData?: any;
  asideSelection: Record<string, number | null>;
}

// ✅ 어사이드 효과 인터페이스
interface AsideEffect {
  apostleName: string;
  apostleId: string;
  asideName: string;
  rankStar: number;
  type: string;
  damageIncrease: number;
  damageReduction: number;
  description?: string;
}

// ✅ 열별 그룹 인터페이스
interface GroupedEffects {
  all: AsideEffect[];
  front: AsideEffect[];
  mid: AsideEffect[];
  back: AsideEffect[];
  persona: AsideEffect[];
}

interface AsideeffectListResult {
  totalIncrease: number;
  totalReduction: number;
  increaseEffects: GroupedEffects;
  reductionEffects: GroupedEffects;
}

// ✅ 어사이드 효과 계산 함수
function calculateAsideEffects(
  apostles: Apostle[],
  asidesData: any,
  asideSelection: Record<string, number | null>,
): AsideeffectListResult {
  const increaseEffects: GroupedEffects = {
    all: [],
    persona: [],
    front: [],
    mid: [],
    back: [],
  };

  const reductionEffects: GroupedEffects = {
    all: [],
    persona: [],
    front: [],
    mid: [],
    back: [],
  };

  let totalIncrease = 0;
  let totalReduction = 0;

  if (!asidesData?.asides) {
    return {
      totalIncrease: 0,
      totalReduction: 0,
      increaseEffects,
      reductionEffects,
    };
  }

  for (const apostle of apostles) {
    const selectedRank = asideSelection[apostle.id];
    if (!selectedRank) continue;

    const aside = asidesData.asides.find(
      (a: any) => a.apostleId === apostle.id && a.level === selectedRank,
    );

    if (!aside?.damage) continue;

    const damageData = Array.isArray(aside.damage) ? aside.damage[0] : aside.damage;

    const increase = damageData?.Increase || 0;
    const reduction = damageData?.Reduction || 0;
    const asideType = aside.type || 'All';

    const effectBase: AsideEffect = {
      apostleName: apostle.name,
      apostleId: apostle.id,
      asideName: aside.name,
      rankStar: selectedRank,
      type: aside.type || 'All',
      damageIncrease: increase,
      damageReduction: reduction,
      description: aside.description,
    };

    if (increase > 0) {
      totalIncrease += increase;
      const increaseEffect = {
        ...effectBase,
        damageReduction: 0,
      };

      switch (asideType[0]) {
        case 'All':
          increaseEffects.all.push(increaseEffect);
          break;
        case 'Persona':
          increaseEffects.persona.push(increaseEffect);
          break;
        case 'Front':
          increaseEffects.front.push(increaseEffect);
          break;
        case 'Mid':
          increaseEffects.mid.push(increaseEffect);
          break;
        case 'Back':
          increaseEffects.back.push(increaseEffect);
          break;
      }
    }

    if (reduction > 0) {
      totalReduction += reduction;
      const reductionEffect = {
        ...effectBase,
        damageIncrease: 0,
      };

      switch (asideType[0]) {
        case 'All':
          reductionEffects.all.push(reductionEffect);
          break;
        case 'Persona':
          reductionEffects.persona.push(reductionEffect);
          break;
        case 'Front':
          reductionEffects.front.push(reductionEffect);
          break;
        case 'Mid':
          reductionEffects.mid.push(reductionEffect);
          break;
        case 'Back':
          reductionEffects.back.push(reductionEffect);
          break;
      }
    }
  }

  return {
    totalIncrease,
    totalReduction,
    increaseEffects,
    reductionEffects,
  };
}

// ✅ 열 타입별 한글 라벨
function getPositionLabel(type: 'all' | 'front' | 'mid' | 'back' | 'persona'): string {
  const labels = {
    all: '모든 열에 적용',
    front: '전열',
    mid: '중열',
    back: '후열',
    persona: '동일 성격',
  };
  return labels[type];
}

// ✅ 열별 합계 계산
function calculatePositionSum(effects: AsideEffect[], isDamageIncrease: boolean): number {
  return effects.reduce(
    (sum, e) => sum + (isDamageIncrease ? e.damageIncrease : e.damageReduction),
    0,
  );
}

// ✅ 개별 효과 카드
const EffectCard: React.FC<{
  effect: AsideEffect;
  isDamageIncrease: boolean;
}> = ({ effect, isDamageIncrease }) => {
  const value = isDamageIncrease ? effect.damageIncrease : effect.damageReduction;
  const bgColor = isDamageIncrease
    ? 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30'
    : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30';
  const badgeColor = isDamageIncrease ? 'warning' : 'info';
  const sign = isDamageIncrease ? '+' : '-';

  return (
    <div className={`flex items-center justify-between rounded-lg p-2 transition ${bgColor}`}>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          {effect.apostleName} ({effect.rankStar}성)
        </p>
      </div>
      <Badge color={badgeColor} size="sm">
        {sign}
        {value}%
      </Badge>
    </div>
  );
};

// ✅ 열별 섹션
const PositionSection: React.FC<{
  effects: AsideEffect[];
  positionType: 'all' | 'front' | 'mid' | 'back' | 'persona';
  isDamageIncrease: boolean;
}> = ({ effects, positionType, isDamageIncrease }) => {
  if (effects.length === 0) return null;

  const sum = calculatePositionSum(effects, isDamageIncrease);

  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center justify-between">
        <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300">
          {getPositionLabel(positionType)}
        </h5>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{sum}%</span>
      </div>

      <div className="space-y-2">
        {effects.map((effect, idx) => (
          <EffectCard
            key={`${effect.apostleId}-${idx}`}
            effect={effect}
            isDamageIncrease={isDamageIncrease}
          />
        ))}
      </div>
    </div>
  );
};

// ✅ 메인 컴포넌트
export const DamageReductionAsideDisplay: React.FC<DamageReductionAsideDisplayProps> = ({
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
      <div className="box py-4 text-center">
        <p className="text-muted">파티에 사도를 추가하세요.</p>
      </div>
    );
  }

  return (
    <Accordion collapseAll>
      <AccordionPanel>
        <AccordionTitle>
          <div className="flex w-full items-center justify-between pr-2">
            <span className="text-sm font-semibold">어사이드 효과</span>
          </div>
        </AccordionTitle>

        <AccordionContent>
          {effectList.totalIncrease === 0 && effectList.totalReduction === 0 && (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                어사이드 설정에서 사도의 어사이드를 선택해주세요.
              </p>
            </div>
          )}

          {/* ✅ 피해량 증가 섹션 */}
          {effectList.totalIncrease > 0 && (
            <div className="mb-4">
              <h4 className="mb-3 text-sm font-bold text-orange-700 dark:text-orange-400">
                피해량 증가
              </h4>

              <PositionSection
                effects={effectList.increaseEffects.all}
                positionType="all"
                isDamageIncrease={true}
              />
              <PositionSection
                effects={effectList.increaseEffects.persona}
                positionType="persona"
                isDamageIncrease={true}
              />
              <PositionSection
                effects={effectList.increaseEffects.front}
                positionType="front"
                isDamageIncrease={true}
              />
              <PositionSection
                effects={effectList.increaseEffects.mid}
                positionType="mid"
                isDamageIncrease={true}
              />
              <PositionSection
                effects={effectList.increaseEffects.back}
                positionType="back"
                isDamageIncrease={true}
              />
            </div>
          )}

          {/* ✅ 피해량 감소 섹션 */}
          {effectList.totalReduction > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-bold text-blue-700 dark:text-blue-400">
                피해량 감소
              </h4>

              <PositionSection
                effects={effectList.reductionEffects.all}
                positionType="all"
                isDamageIncrease={false}
              />
              <PositionSection
                effects={effectList.reductionEffects.persona}
                positionType="persona"
                isDamageIncrease={false}
              />
              <PositionSection
                effects={effectList.reductionEffects.front}
                positionType="front"
                isDamageIncrease={false}
              />
              <PositionSection
                effects={effectList.reductionEffects.mid}
                positionType="mid"
                isDamageIncrease={false}
              />
              <PositionSection
                effects={effectList.reductionEffects.back}
                positionType="back"
                isDamageIncrease={false}
              />
            </div>
          )}
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  );
};

export default DamageReductionAsideDisplay;
