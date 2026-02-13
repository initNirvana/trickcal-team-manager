import type { Apostle } from '../../types/apostle';
import type { AsideTarget, AsideRow } from '../../types/aside';
import type { SkillLevel } from '../../types/branded';
import { trySkillLevel, toSkillLevel } from '../../types/branded';

type OneOrArray<T> = T | T[];

export interface AsideEffect {
  apostleName: string;
  apostleId: string;
  asideName: string;
  rankStar: number;
  type: AsideTarget;
  damageIncrease: number;
  damageReduction: number;
  skillIncrease: number;
  skillReduction: number;
  // 치명타 관련
  criticalRate?: number; // 치명타 확률 증가
  criticalDamage?: number; // 치명타 피해 증가
  criticalResist?: number; // 치명타 저항
  criticalDamageResist?: number; // 치명타 피해 저항
  // 기타 수치형 효과
  spRecovery?: number; // SP 회복량
  attackSpeed?: number; // 공격 속도
  hp?: number; // HP
  description?: string;
  duration?: number;
}

const emptyGroups = (): GroupedEffects => ({ all: [], front: [], mid: [], back: [], persona: [] });

const normalizeTarget = (t?: OneOrArray<AsideTarget>): AsideTarget => {
  const v = Array.isArray(t) ? t[0] : t;
  return v ?? 'All';
};

const normalizeMod = (
  m?: OneOrArray<{ Increase?: number; Reduction?: number; Duration?: number }>,
) => {
  const v = Array.isArray(m) ? m[0] : m;
  return { inc: v?.Increase ?? 0, red: v?.Reduction ?? 0, dur: v?.Duration };
};

const pushGrouped = (groups: GroupedEffects, target: AsideTarget, effect: AsideEffect) => {
  switch (target) {
    case 'All':
      groups.all.push(effect);
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
    case 'Persona':
      groups.persona.push(effect);
      break;
    // Skill type is handled separately, but if it slips here, default to all?
    // Actually, we should handle 'Skill' explicitly in the main loop to avoid pushing to these groups
    default:
      groups.all.push(effect);
      break;
  }
};

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
  totalPhysicalReduction: number;
  totalMagicalReduction: number;
  increaseEffects: GroupedEffects;
  reductionEffects: GroupedEffects;
  skillIncreaseEffects: GroupedEffects;
  skillReductionEffects: GroupedEffects;
  physicalReductionEffects: GroupedEffects;
  magicalReductionEffects: GroupedEffects;
  skillTypeEffects: AsideEffect[];
}

/**
 * 어사이드 데이터와 선택된 랭크를 기반으로 효과를 계산합니다.
 */
export function calculateAsideEffects(
  apostles: Apostle[],
  asidesData: AsideRow[] | undefined,
  asideSelection: Record<string, number[]>,
): AsideEffectResult {
  const increaseEffects = emptyGroups();
  const reductionEffects = emptyGroups();
  const skillIncreaseEffects = emptyGroups();
  const skillReductionEffects = emptyGroups();
  const physicalReductionEffects = emptyGroups();
  const magicalReductionEffects = emptyGroups();
  const skillTypeEffects: AsideEffect[] = [];

  if (!Array.isArray(asidesData)) {
    return {
      totalIncrease: 0,
      totalReduction: 0,
      totalSkillIncrease: 0,
      totalSkillReduction: 0,
      totalPhysicalReduction: 0,
      totalMagicalReduction: 0,
      increaseEffects,
      reductionEffects,
      skillIncreaseEffects,
      skillReductionEffects,
      physicalReductionEffects,
      magicalReductionEffects,
      skillTypeEffects,
    };
  }

  const index = new Map<string, AsideRow>();
  for (const a of asidesData) index.set(`${a.apostleId}:${a.level}`, a);

  let totalIncrease = 0;
  let totalReduction = 0;
  let totalSkillIncrease = 0;
  let totalSkillReduction = 0;
  let totalPhysicalReduction = 0;
  let totalMagicalReduction = 0;

  for (const apostle of apostles) {
    if (!apostle?.id) continue;

    const selectedRanks = asideSelection[apostle.id];
    if (!selectedRanks || selectedRanks.length === 0) continue;

    // 선택된 모든 랭크(2성, 3성 등)의 효과를 합산
    for (const level of selectedRanks) {
      if (!Number.isFinite(level)) continue;

      const aside = index.get(`${apostle.id}:${level}`);
      if (!aside) continue;

      const target = normalizeTarget(aside.type);
      const dmg = normalizeMod(aside.damage);
      const skl = normalizeMod(aside.skill);
      const phys = normalizeMod(aside.physical);
      const mag = normalizeMod(aside.magical);

      const base: AsideEffect = {
        apostleName: apostle.name,
        apostleId: apostle.id,
        asideName: aside.name,
        rankStar: level,
        type: target,
        damageIncrease: dmg.inc,
        damageReduction: dmg.red,
        skillIncrease: skl.inc,
        skillReduction: skl.red,
        description: aside.description,
        duration: dmg.dur, // Add duration
      };

      // 치명타 처리
      if (aside.critical && Array.isArray(aside.critical) && aside.critical.length > 0) {
        const crit = aside.critical[0];
        if (crit.Increase) base.criticalRate = crit.Increase;
        if (crit.IncreaseDamage) base.criticalDamage = crit.IncreaseDamage;
        if (crit.resist) base.criticalResist = crit.resist;
        if (crit.damageResist) base.criticalDamageResist = crit.damageResist;
      }

      // 기타 수치형 효과
      if (typeof aside.spRecovery === 'number') base.spRecovery = aside.spRecovery;
      if (typeof aside.attackSpeed === 'number') base.attackSpeed = aside.attackSpeed;
      if (typeof aside.hp === 'number') base.hp = aside.hp;

      // Handle Skill type separately
      if (target === 'Skill') {
        skillTypeEffects.push(base);
        continue; // Skip standard processing for Skill type
      }

      // 효과가 하나라도 있으면 처리
      const hasAnyEffect =
        dmg.inc > 0 ||
        dmg.red > 0 ||
        phys.red > 0 ||
        mag.red > 0 ||
        skl.inc > 0 ||
        skl.red > 0 ||
        base.criticalRate ||
        base.criticalDamage ||
        base.criticalResist ||
        base.criticalDamageResist ||
        base.spRecovery ||
        base.attackSpeed ||
        base.hp;

      // 효과가 없으면 스킵
      if (!hasAnyEffect) continue;

      // 피해 증가/감소
      if (dmg.inc > 0) {
        totalIncrease += dmg.inc;
        pushGrouped(increaseEffects, target, { ...base, damageReduction: 0 });
      }
      if (dmg.red > 0) {
        totalReduction += dmg.red;
        pushGrouped(reductionEffects, target, { ...base, damageIncrease: 0 });
      }

      // 물리 피해 감소 (물리 공격만 막음 - 일반 피해와 별개)
      if (phys.red > 0) {
        totalPhysicalReduction += phys.red;
        pushGrouped(physicalReductionEffects, target, {
          ...base,
          damageIncrease: 0,
          damageReduction: phys.red,
          description: base.description,
        });
      }

      // 마법 피해 감소 (마법 공격만 막음 - 일반 피해와 별개)
      if (mag.red > 0) {
        totalMagicalReduction += mag.red;
        pushGrouped(magicalReductionEffects, target, {
          ...base,
          damageIncrease: 0,
          damageReduction: mag.red,
          description: base.description,
        });
      }

      // 스킬 피해
      if (skl.inc > 0) {
        totalSkillIncrease += skl.inc;
        pushGrouped(skillIncreaseEffects, target, {
          ...base,
          skillReduction: 0,
          damageIncrease: 0,
          damageReduction: 0,
        });
      }
      if (skl.red > 0) {
        totalSkillReduction += skl.red;
        pushGrouped(skillReductionEffects, target, {
          ...base,
          skillIncrease: 0,
          damageIncrease: 0,
          damageReduction: 0,
        });
      }

      // 치명타/SP/공속/HP만 있는 경우 increaseEffects에 추가
      // (damage=0이지만 다른 효과가 있으므로 표시되어야 함)
      if (
        dmg.inc === 0 &&
        dmg.red === 0 &&
        phys.red === 0 &&
        mag.red === 0 &&
        skl.inc === 0 &&
        skl.red === 0 &&
        (base.criticalRate ||
          base.criticalDamage ||
          base.criticalResist ||
          base.criticalDamageResist ||
          base.spRecovery ||
          base.attackSpeed ||
          base.hp)
      ) {
        pushGrouped(increaseEffects, target, base);
      }
    }
  }

  return {
    totalIncrease,
    totalReduction,
    totalSkillIncrease,
    totalSkillReduction,
    totalPhysicalReduction,
    totalMagicalReduction,
    increaseEffects,
    reductionEffects,
    skillIncreaseEffects,
    skillReductionEffects,
    physicalReductionEffects,
    magicalReductionEffects,
    skillTypeEffects,
  };
}

export const sumEffects = (effects: AsideEffect[], pick: (e: AsideEffect) => number) =>
  effects.reduce((acc, e) => acc + pick(e), 0);

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

type SkillGrade = 'low' | 'high';

type SkillDamageRow = {
  level: number;
  Reduction?: number;
};

type SkillRow = {
  apostleId: string;
  name: string;
  level: SkillGrade;
  effectRange: string;
  excludeSelf?: boolean;
  damage?: SkillDamageRow[];
};

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

const getReductionAtLevel = (skill: SkillRow, level: SkillLevel) => {
  const rows = skill.damage;
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  const hit = rows.find((r) => r.level === (level as number));
  return hit?.Reduction ?? 0;
};

export function calculateSkillDamageReduction(
  apostles: Apostle[],
  skillsData: SkillRow[] | undefined,
  skillLevels: Record<string, SkillLevel | undefined>,
): SkillReductionResult {
  if (!Array.isArray(skillsData)) return { totalReduction: 0, details: [] };

  const skillsByApostleId = new Map<string, SkillRow[]>();
  for (const s of skillsData) {
    const prev = skillsByApostleId.get(s.apostleId);
    if (prev) prev.push(s);
    else skillsByApostleId.set(s.apostleId, [s]);
  }

  const details: SkillReductionDetail[] = [];
  let totalReduction = 0;

  for (const apostle of apostles) {
    if (!apostle?.id) continue;

    const currentLevel = trySkillLevel(skillLevels[apostle.id], toSkillLevel(1));
    const skills = skillsByApostleId.get(apostle.id) ?? [];
    if (skills.length === 0) continue;

    let bestSkill: SkillRow | null = null;
    let bestReduction = 0;

    for (const skill of skills) {
      if (skill.excludeSelf) continue;

      const reduction = getReductionAtLevel(skill, currentLevel);
      if (reduction > bestReduction) {
        bestReduction = reduction;
        bestSkill = skill;
      }
    }

    if (!bestSkill || bestReduction <= 0) continue;

    totalReduction += bestReduction;
    details.push({
      apostleName: apostle.name,
      skillName: bestSkill.name,
      skillType: bestSkill.level === 'low' ? '저학년' : '고학년',
      skillLevel: currentLevel as number,
      reduction: bestReduction,
      effectRange: bestSkill.effectRange,
    });
  }

  return { totalReduction, details };
}
