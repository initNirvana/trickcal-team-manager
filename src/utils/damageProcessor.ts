import type { Apostle } from '../types/apostle';

type AsideTarget = 'All' | 'Front' | 'Mid' | 'Back' | 'Persona';
type Modifier = { Increase?: number; Reduction?: number };
type OneOrArray<T> = T | T[];

export interface AsideRow {
  apostleId: string;
  apostleName?: string;
  name: string;
  level: number;
  description?: string;
  type?: OneOrArray<AsideTarget>;
  damage?: OneOrArray<Required<Pick<Modifier, 'Increase' | 'Reduction'>>>;
  skill?: OneOrArray<Required<Pick<Modifier, 'Increase' | 'Reduction'>>>;
}

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
  description?: string;
}

const emptyGroups = (): GroupedEffects => ({ all: [], front: [], mid: [], back: [], persona: [] });

const normalizeTarget = (t?: OneOrArray<AsideTarget>): AsideTarget => {
  const v = Array.isArray(t) ? t[0] : t;
  return v ?? 'All';
};

const normalizeMod = (m?: OneOrArray<{ Increase: number; Reduction: number }>) => {
  const v = Array.isArray(m) ? m[0] : m;
  return { inc: v?.Increase ?? 0, red: v?.Reduction ?? 0 };
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
  asidesData: { asides?: AsideRow[] } | undefined,
  asideSelection: Record<string, number[]>,
): AsideEffectResult {
  const increaseEffects = emptyGroups();
  const reductionEffects = emptyGroups();
  const skillIncreaseEffects = emptyGroups();
  const skillReductionEffects = emptyGroups();

  if (!Array.isArray(asidesData?.asides)) {
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

  const index = new Map<string, AsideRow>();
  for (const a of asidesData.asides) index.set(`${a.apostleId}:${a.level}`, a);

  let totalIncrease = 0;
  let totalReduction = 0;
  let totalSkillIncrease = 0;
  let totalSkillReduction = 0;

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
      };

      if (dmg.inc > 0) {
        totalIncrease += dmg.inc;
        pushGrouped(increaseEffects, target, { ...base, damageReduction: 0 });
      }
      if (dmg.red > 0) {
        totalReduction += dmg.red;
        pushGrouped(reductionEffects, target, { ...base, damageIncrease: 0 });
      }
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

const toValidLevel = (v: unknown, fallback = 1) => {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
};

const getReductionAtLevel = (skill: SkillRow, level: number) => {
  const rows = skill.damage;
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  const hit = rows.find((r) => r.level === level);
  return hit?.Reduction ?? 0;
};

export function calculateSkillDamageReduction(
  apostles: Apostle[],
  skillsData: { skills?: SkillRow[] } | undefined,
  skillLevels: Record<string, number | string | undefined>,
): SkillReductionResult {
  if (!Array.isArray(skillsData?.skills)) return { totalReduction: 0, details: [] };

  const skillsByApostleId = new Map<string, SkillRow[]>();
  for (const s of skillsData.skills) {
    const prev = skillsByApostleId.get(s.apostleId);
    if (prev) prev.push(s);
    else skillsByApostleId.set(s.apostleId, [s]);
  }

  const details: SkillReductionDetail[] = [];
  let totalReduction = 0;

  for (const apostle of apostles) {
    if (!apostle?.id) continue;

    const currentLevel = toValidLevel(skillLevels[apostle.id], 1);
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
      skillLevel: currentLevel,
      reduction: bestReduction,
      effectRange: bestSkill.effectRange,
    });
  }

  return { totalReduction, details };
}
