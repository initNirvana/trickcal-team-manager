import type { Apostle } from '../types/apostle';

// ==========================================
// 1. 어사이드(Aside) 효과 계산 로직
// ==========================================

export interface AsideEffect {
  apostleName: string;
  apostleId: string;
  asideName: string;
  rankStar: number;
  type: string;
  damageIncrease: number;
  damageReduction: number;
  description?: string;
}

export interface GroupedEffects {
  all: AsideEffect[];
  front: AsideEffect[];
  mid: AsideEffect[];
  back: AsideEffect[];
  persona: AsideEffect[];
}

export interface AsideEffectResult {
  totalIncrease: number;
  totalReduction: number;
  increaseEffects: GroupedEffects;
  reductionEffects: GroupedEffects;
}

/**
 * 어사이드 데이터와 선택된 랭크를 기반으로 효과를 계산합니다.
 * (기존 DamageReductionAsideDisplay.tsx에서 분리됨)
 */
export function calculateAsideEffects(
  apostles: Apostle[],
  asidesData: any,
  asideSelection: Record<string, number | null>,
): AsideEffectResult {
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
    // apostle.id가 없으면 name을 대체 키로 사용 (기존 로직 보완)
    const apostleKey = apostle.id || apostle.name;
    const selectedRank = asideSelection[apostleKey];

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
      const increaseEffect = { ...effectBase, damageReduction: 0 };
      addToGroup(increaseEffects, asideType[0], increaseEffect);
    }

    if (reduction > 0) {
      totalReduction += reduction;
      const reductionEffect = { ...effectBase, damageIncrease: 0 };
      addToGroup(reductionEffects, asideType[0], reductionEffect);
    }
  }

  return {
    totalIncrease,
    totalReduction,
    increaseEffects,
    reductionEffects,
  };
}

// 헬퍼 함수: 그룹 분류 (중복 제거를 위해 내부 함수로 분리)
function addToGroup(groups: GroupedEffects, type: string, effect: AsideEffect) {
  switch (type) {
    case 'All':
      groups.all.push(effect);
      break;
    case 'Persona':
      groups.persona.push(effect);
      break;
    case 'Front':
      groups.front.push(effect);
      break;
    case 'Mid':
      groups.mid.push(effect);
      break;
    case 'Back':
      groups.back.push(effect);
      break;
  }
}

/**
 * 효과 목록의 합계를 계산합니다.
 */
export function calculatePositionSum(effects: AsideEffect[], isDamageIncrease: boolean): number {
  return effects.reduce(
    (sum, e) => sum + (isDamageIncrease ? e.damageIncrease : e.damageReduction),
    0,
  );
}

// ==========================================
// 2. 스킬(Skill) 피해량 감소 계산 로직
// ==========================================

export interface SkillReductionDetail {
  apostleName: string;
  skillName: string;
  skillType: string;
  skillLevel: number;
  reduction: number;
  effectRange: string;
}

export interface SkillReductionResult {
  totalReduction: number;
  details: SkillReductionDetail[];
}

/**
 * 스킬 데이터와 레벨을 기반으로 피해량 감소를 계산합니다.
 * (기존 DamageReductionSkillDisplay.tsx에서 분리됨)
 */
export function calculateSkillDamageReduction(
  apostles: Apostle[],
  skillsData: any,
  skillLevels: Record<string, number>,
): SkillReductionResult {
  const details: SkillReductionDetail[] = [];
  let totalReduction = 0;

  if (!skillsData?.skills) {
    return { totalReduction: 0, details: [] };
  }

  for (const apostle of apostles) {
    const apostaSkills = skillsData.skills.filter((s: any) => s.apostleId === apostle.id);
    let bestSkill = null;
    let bestReduction = 0;

    for (const skill of apostaSkills) {
      if (!skill.damage || skill.damage.length === 0) continue;

      const currentLevel = skillLevels[apostle.id] || 1;
      const reductionData = skill.damage.find((d: any) => d.level === currentLevel);

      if (reductionData && reductionData.Reduction > bestReduction) {
        bestReduction = reductionData.Reduction;
        bestSkill = skill;
      }
    }

    if (bestSkill && bestReduction > 0) {
      const currentSkillLevel = skillLevels[apostle.id] || 1;
      const isExcludingSelf = bestSkill.excludeSelf ?? false;

      if (!isExcludingSelf) {
        totalReduction += bestReduction;
      }

      details.push({
        apostleName: apostle.name,
        skillName: bestSkill.name,
        skillType: bestSkill.level === 'low' ? '저학년' : '고학년',
        skillLevel: currentSkillLevel,
        reduction: bestReduction,
        effectRange: bestSkill.effectRange,
      });
    }
  }

  // 최대 75%로 제한
  totalReduction = Math.min(totalReduction, 75);

  return { totalReduction, details };
}
