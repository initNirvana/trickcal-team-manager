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
  skillIncrease: number;
  skillReduction: number;
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
  totalSkillIncrease: number;
  totalSkillReduction: number;
  increaseEffects: GroupedEffects;
  reductionEffects: GroupedEffects;
  skillIncreaseEffects: GroupedEffects;
  skillReductionEffects: GroupedEffects;
}

/**
 * 어사이드 데이터와 선택된 랭크를 기반으로 효과를 계산합니다.
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

  const skillIncreaseEffects: GroupedEffects = {
    all: [],
    persona: [],
    front: [],
    mid: [],
    back: [],
  };

  const skillReductionEffects: GroupedEffects = {
    all: [],
    persona: [],
    front: [],
    mid: [],
    back: [],
  };

  let totalIncrease = 0;
  let totalReduction = 0;
  let totalSkillIncrease = 0;
  let totalSkillReduction = 0;

  if (!asidesData?.asides || !Array.isArray(asidesData.asides)) {
    return {
      totalIncrease: 0,
      totalReduction: 0,
      totalSkillIncrease: 0,
      totalSkillReduction: 0,
      increaseEffects,
      reductionEffects,
      skillIncreaseEffects,
      skillReductionEffects,
    };
  }

  for (const apostle of apostles) {
    if (!apostle) continue;

    // ✅ apostleKey 개선
    const apostleKey = apostle.id || apostle.name;
    const selectedRank = asideSelection[apostleKey];

    if (!selectedRank) continue;

    // ✅ aside 찾기 개선 (더 유연한 검색)
    const aside = asidesData.asides.find(
      (a: any) => a.apostleId === apostle.id && a.level === selectedRank && (a.damage || a.skill), // ✅ damage 또는 skill 중 하나라도 있으면 OK
    );

    if (!aside) continue;

    // ✅ damage 필드 처리 (안전하게)
    const damageData = aside.damage
      ? Array.isArray(aside.damage)
        ? aside.damage[0]
        : aside.damage
      : null;
    const increase = damageData?.Increase || 0;
    const reduction = damageData?.Reduction || 0;

    // ✅ skill 필드 처리 (안전하게)
    const skillData = aside.skill
      ? Array.isArray(aside.skill)
        ? aside.skill[0]
        : aside.skill
      : null;
    const skillIncrease = skillData?.Increase || 0;
    const skillReduction = skillData?.Reduction || 0;

    // ✅ type 처리 개선
    const asideType = aside.type && Array.isArray(aside.type) ? aside.type[0] : aside.type || 'All';

    const effectBase: AsideEffect = {
      apostleName: apostle.name,
      apostleId: apostle.id,
      asideName: aside.name,
      rankStar: selectedRank,
      type: asideType,
      damageIncrease: increase,
      damageReduction: reduction,
      skillIncrease: skillIncrease,
      skillReduction: skillReduction,
      description: aside.description,
    };

    // 피해량 증가
    if (increase > 0) {
      totalIncrease += increase;
      const increaseEffect = { ...effectBase, damageReduction: 0 };
      addToGroup(increaseEffects, asideType, increaseEffect);
    }

    // 피해량 감소
    if (reduction > 0) {
      totalReduction += reduction;
      const reductionEffect = { ...effectBase, damageIncrease: 0 };
      addToGroup(reductionEffects, asideType, reductionEffect);
    }

    // 스킬 피해량 증가
    if (skillIncrease > 0) {
      totalSkillIncrease += skillIncrease;
      const skillIncreaseEffect = {
        ...effectBase,
        skillReduction: 0,
        damageIncrease: 0,
        damageReduction: 0,
      };
      addToGroup(skillIncreaseEffects, asideType, skillIncreaseEffect);
    }

    // 스킬 피해량 감소
    if (skillReduction > 0) {
      totalSkillReduction += skillReduction;
      const skillReductionEffect = {
        ...effectBase,
        skillIncrease: 0,
        damageIncrease: 0,
        damageReduction: 0,
      };
      addToGroup(skillReductionEffects, asideType, skillReductionEffect);
    }
  }

  return {
    totalIncrease,
    totalReduction,
    totalSkillIncrease,
    totalSkillReduction,
    increaseEffects,
    reductionEffects,
    skillIncreaseEffects,
    skillReductionEffects,
  };
}

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
export function calculatePositionSum(
  effects: AsideEffect[],
  isDamageIncrease: boolean,
  isSkillIncrease?: boolean,
): number {
  if (!effects || effects.length === 0) return 0;

  return effects.reduce((sum, e) => {
    if (isSkillIncrease) {
      return sum + (isDamageIncrease ? e.skillIncrease : e.skillReduction);
    }
    return sum + (isDamageIncrease ? e.damageIncrease : e.damageReduction);
  }, 0);
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
 */
export function calculateSkillDamageReduction(
  apostles: Apostle[],
  skillsData: any,
  skillLevels: Record<string, number>,
): SkillReductionResult {
  const details: SkillReductionDetail[] = [];
  let totalReduction = 0;

  if (!skillsData?.skills || !Array.isArray(skillsData.skills)) {
    return { totalReduction: 0, details: [] };
  }

  for (const apostle of apostles) {
    if (!apostle) continue;
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

  return { totalReduction, details };
}
