// src/__tests__/asides.schema.test.ts
import { describe, it, expect } from 'vitest';
import asidesData from '@/data/asides.json';
import { AsidesDataSchema } from '@/schemas/asides.schema';
import { Personality } from '@/types/apostle';

const PERSONALITIES = ['Jolly', 'Mad', 'Cool', 'Naive', 'Gloomy'] as const;
const ALLOWED_PERSONALITIES = new Set(PERSONALITIES);

const ALLOWED_TYPES = new Set(['All', 'Front', 'Mid', 'Back', 'Persona']);

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

const normalizeArray = <T>(v: T | T[] | undefined | null): T[] => {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
};

// 숫자/배열/객체 어디에 있든 “0이 아닌 숫자”가 하나라도 있으면 true
const hasAnyNonZeroNumberDeep = (v: unknown): boolean => {
  if (typeof v === 'number') return v !== 0;
  if (Array.isArray(v)) return v.some(hasAnyNonZeroNumberDeep);
  if (v && typeof v === 'object') {
    return Object.values(v as Record<string, unknown>).some(hasAnyNonZeroNumberDeep);
  }
  return false;
};

describe('asides.json schema validation', () => {
  it('asides.json should match AsidesDataSchema', () => {
    const result = AsidesDataSchema.safeParse(asidesData);
    expect(result.success).toBe(true);

    if (!result.success) {
      console.log(result.error.format());
    }
  });

  it('(apostleId, level) pairs should be unique', () => {
    const parsed = AsidesDataSchema.parse(asidesData) as { asides: any[] };

    const keys = parsed.asides.map((a) => `${a.apostleId}#${a.level}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('type values should be valid (All/Front/Mid/Back/Persona)', () => {
    const parsed = AsidesDataSchema.parse(asidesData) as { asides: any[] };

    const invalid = parsed.asides
      .flatMap((a) => normalizeArray(a.type))
      .filter((t) => !isNonEmptyString(t) || !ALLOWED_TYPES.has(t))
      .map((t) => t);

    expect(invalid, `invalid type values: ${JSON.stringify(invalid, null, 2)}`).toHaveLength(0);
  });

  it('if persona field exists, it must be non-empty and one of 5 personalities', () => {
    const parsed = AsidesDataSchema.parse(asidesData) as { asides: any[] };

    const invalid = parsed.asides
      // "키가 존재하는지" 기준 (값이 undefined여도 키가 있으면 검사)
      .filter((a) => Object.prototype.hasOwnProperty.call(a, 'persona'))
      .filter((a) => {
        const v = a.persona;

        if (!isNonEmptyString(v)) return true;
        if (!ALLOWED_PERSONALITIES.has(v as Personality)) return true;

        return false;
      })
      .map((a) => ({
        apostleId: a.apostleId,
        level: a.level,
        name: a.name,
        type: a.type,
        persona: a.persona,
      }));

    expect(invalid, `invalid persona field: ${JSON.stringify(invalid, null, 2)}`).toHaveLength(0);
  });

  it('when type includes Persona, it should not mix with position types', () => {
    const parsed = AsidesDataSchema.parse(asidesData) as { asides: any[] };
    const positionTypes = new Set(['All', 'Front', 'Mid', 'Back']);

    const invalid = parsed.asides
      .filter((a) => normalizeArray(a.type).includes('Persona'))
      .filter((a) => {
        const types = normalizeArray(a.type);
        // Persona + (All/Front/Mid/Back) 같이 있으면 정책상 불일치로 처리
        return types.some((t) => positionTypes.has(t));
      })
      .map((a) => ({
        apostleId: a.apostleId,
        level: a.level,
        name: a.name,
        type: a.type,
      }));

    expect(
      invalid,
      `Persona type mixed with position types: ${JSON.stringify(invalid, null, 2)}`,
    ).toHaveLength(0);
  });

  it('each aside should have at least one meaningful modifier (non-zero numbers OR valid persona)', () => {
    const parsed = AsidesDataSchema.parse(asidesData) as { asides: any[] };

    const modifierFields = [
      'damage',
      'skill',
      'physical',
      'magical',
      'critical',
      'hp',
      'spRecovery',
      'attackSpeed',
    ] as const;

    const isValidPersonaValue = (v: unknown) =>
      isNonEmptyString(v) && ALLOWED_PERSONALITIES.has(v as Personality);

    const invalid = parsed.asides
      .filter((a) => {
        // 1) 숫자 기반 modifier들 중 0이 아닌 숫자가 하나라도 있으면 OK
        const hasNonZero = modifierFields.some((f) => hasAnyNonZeroNumberDeep(a[f]));

        // 2) persona가 “존재 + 유효”면(우이 같은 케이스) damage가 0/0이어도 OK
        const hasValidPersona =
          Object.prototype.hasOwnProperty.call(a, 'persona') && isValidPersonaValue(a.persona);

        return !(hasNonZero || hasValidPersona);
      })
      .map((a) => ({
        apostleId: a.apostleId,
        level: a.level,
        name: a.name,
        type: a.type,
        persona: a.persona,
        damage: a.damage,
        skill: a.skill,
        physical: a.physical,
        magical: a.magical,
        critical: a.critical,
        hp: a.hp,
        spRecovery: a.spRecovery,
      }));

    expect(
      invalid,
      `aside has no meaningful modifier: ${JSON.stringify(invalid, null, 2)}`,
    ).toHaveLength(0);
  });

  it('if description exists, it should not be empty', () => {
    const parsed = AsidesDataSchema.parse(asidesData) as { asides: any[] };

    const invalid = parsed.asides
      .filter((a) => Object.prototype.hasOwnProperty.call(a, 'description'))
      .filter((a) => !isNonEmptyString(a.description))
      .map((a) => ({
        apostleId: a.apostleId,
        level: a.level,
        name: a.name,
        description: a.description,
      }));

    expect(invalid, `empty description: ${JSON.stringify(invalid, null, 2)}`).toHaveLength(0);
  });
});
