import { describe, it, expect } from 'vitest';
import skillsData from '@/data/skills.json';
import { SkillsDataSchema } from '@/schemas/skills.schema';

describe('skills.json schema validation', () => {
  it('skills.json should match SkillsDataSchema', () => {
    const result = SkillsDataSchema.safeParse(skillsData);

    if (!result.success) {
      console.log(result.error.format());
    }

    expect(result.success).toBe(true);
  });

  it('each apostleId should have exactly one low and one high skill', () => {
    const parsed = SkillsDataSchema.parse(skillsData);

    const countMap = new Map<string, { low: number; high: number }>();

    for (const s of parsed.skills) {
      const key = s.apostleId;
      const prev = countMap.get(key) ?? { low: 0, high: 0 };

      if (s.level === 'low') prev.low += 1;
      if (s.level === 'high') prev.high += 1;

      countMap.set(key, prev);
    }

    const invalid = Array.from(countMap.entries())
      .filter(([, v]) => v.low !== 1 || v.high !== 1)
      .map(([apostleId, v]) => ({ apostleId, low: v.low, high: v.high }));

    expect(invalid, `low/high count mismatch: ${JSON.stringify(invalid, null, 2)}`).toHaveLength(0);
  });

  it('effectRange non-empty skills must have meaningful damage rows', () => {
    const parsed = SkillsDataSchema.parse(skillsData);

    type DamageValue = { level?: number; Increase?: number; Reduction?: number };
    type DamageField = DamageValue | DamageValue[] | undefined;

    const normalizeRows = (damage: DamageField): DamageValue[] => {
      if (!damage) return [];
      if (Array.isArray(damage)) return damage.filter(Boolean);
      if (typeof damage === 'object') return [damage];
      return [];
    };

    const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

    // 2-a) effectRange가 있는데 damage 값이 없는 경우(없음/빈 배열/빈 객체만)
    const missingDamage = parsed.skills
      .filter((s) => isNonEmptyString(s.effectRange))
      .filter((s) => {
        const rows = normalizeRows(s.damage);

        // rows가 0개이거나, "Increase/Reduction/level" 중 의미있는 필드가 하나도 없는 row만 있는 경우를 비정상으로 판단
        const meaningful = rows.some((r) => {
          if (!r || typeof r !== 'object') return false;
          const hasInc = typeof r.Increase === 'number';
          const hasRed = typeof r.Reduction === 'number';
          const hasLevel = typeof r.level === 'number';
          return hasInc || hasRed || hasLevel;
        });

        return rows.length === 0 || !meaningful;
      })
      .map((s) => ({
        apostleId: s.apostleId,
        skillType: s.level,
        name: s.name,
        effectRange: s.effectRange,
        damage: s.damage,
      }));

    expect(
      missingDamage,
      `effectRange set but damage missing/empty: ${JSON.stringify(missingDamage, null, 2)}`,
    ).toHaveLength(0);

    // 2-b) effectRange가 있는데 damage 배열이 "기본값 1개(레벨1, 0/0)"만 있는 경우
    const onlyDefaultRow = parsed.skills
      .filter((s) => isNonEmptyString(s.effectRange))
      .filter((s) => {
        const rows = normalizeRows(s.damage);

        if (rows.length !== 1) return false;

        const r = rows[0];
        if (!r || typeof r !== 'object') return false;

        const levelOk = r.level === 1 || r.level === undefined; // level 필드가 없는 케이스도 기본값으로 취급
        const incOk = (r.Increase ?? 0) === 0;
        const redOk = (r.Reduction ?? 0) === 0;

        return levelOk && incOk && redOk;
      })
      .map((s) => ({
        apostleId: s.apostleId,
        skillType: s.level,
        name: s.name,
        effectRange: s.effectRange,
        damage: s.damage,
      }));

    expect(
      onlyDefaultRow,
      `effectRange set but damage is only default row: ${JSON.stringify(onlyDefaultRow, null, 2)}`,
    ).toHaveLength(0);
  });
});
