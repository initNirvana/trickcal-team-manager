import { describe, it, expect } from 'vitest';
import apostlesData from '@/data/apostles.json';
import ratingsData from '@/data/apostles-ratings.json';
import asidesData from '@/data/asides.json';
import skillsData from '@/data/skills.json';
import { ApostlesDataSchema } from '@/schemas/apostles.schema';
import { ApostlesRatingsSchema } from '@/schemas/apostles-ratings.schema';
import { AsidesDataSchema } from '@/schemas/asides.schema';
import { SkillsDataSchema } from '@/schemas/skills.schema';

describe('apostles data validation', () => {
  it('apostles.json should match ApostlesDataSchema', () => {
    const result = ApostlesDataSchema.safeParse(apostlesData);
    if (!result.success) console.log(result.error.format());
    expect(result.success).toBe(true);
  });

  it('apostles-ratings.json should match ApostlesRatingsSchema', () => {
    const result = ApostlesRatingsSchema.safeParse(ratingsData);
    if (!result.success) console.log(result.error.format());
    expect(result.success).toBe(true);
  });

  it('apostle ids should be unique', () => {
    const parsed = ApostlesDataSchema.parse(apostlesData);
    const ids = parsed.apostles.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ratings should exist for every apostle id (no missing ratings)', () => {
    const apostles = ApostlesDataSchema.parse(apostlesData).apostles;
    const ratings = ApostlesRatingsSchema.parse(ratingsData).ratings;

    const missingInRatings = apostles.map((a) => a.id).filter((id) => ratings[id] == null);

    expect(missingInRatings).toEqual([]);
  });

  it('every rating id should exist in apostles.json (no extra ratings)', () => {
    const apostles = ApostlesDataSchema.parse(apostlesData).apostles;
    const ratings = ApostlesRatingsSchema.parse(ratingsData).ratings;

    const apostleIdSet = new Set(apostles.map((a) => a.id));
    const extraInRatings = Object.keys(ratings).filter((id) => !apostleIdSet.has(id));

    expect(extraInRatings).toEqual([]);
  });

  it('ratings name/engName should match apostles.json (reference fields)', () => {
    const apostles = ApostlesDataSchema.parse(apostlesData).apostles;
    const ratings = ApostlesRatingsSchema.parse(ratingsData).ratings;

    const mismatched = apostles
      .map((a) => {
        const r = ratings[a.id];
        if (!r) return null;
        if (r.name !== a.name || r.engName !== a.engName) {
          return {
            id: a.id,
            apostle: { name: a.name, engName: a.engName },
            rating: { name: r.name, engName: r.engName },
          };
        }
        return null;
      })
      .filter(Boolean);

    expect(mismatched).toEqual([]);
  });

  it('if apostle has aside.hasAside=true, should have at least one aside in asides.json', () => {
    const apostles = ApostlesDataSchema.parse(apostlesData).apostles;
    const asides = AsidesDataSchema.parse(asidesData).asides;

    const apostlesWithAside = apostles.filter((a) => a.aside.hasAside);
    const asideApostleIds = new Set(asides.map((a) => a.apostleId));

    const missingAsides = apostlesWithAside
      .filter((a) => !asideApostleIds.has(a.id))
      .map((a) => ({
        id: a.id,
        name: a.name,
        engName: a.engName,
        asideHasAside: a.aside.hasAside,
      }));

    expect(missingAsides).toEqual([]);
  });

  it('every apostle should have one low-level skill and one high-level skill', () => {
    const apostles = ApostlesDataSchema.parse(apostlesData).apostles;
    const skills = SkillsDataSchema.parse(skillsData).skills;

    const missingSkills = apostles
      .map((apostle) => {
        if (apostle.id.includes('_')) return null; // 공명 사도의 성격 분리 데이터 제외

        const lowSkill = skills.find((s) => s.apostleId === apostle.id && s.level === 'low');
        const highSkill = skills.find((s) => s.apostleId === apostle.id && s.level === 'high');

        if (!lowSkill || !highSkill) {
          return {
            id: apostle.id,
            name: apostle.name,
            lowSkill: !!lowSkill,
            highSkill: !!highSkill,
          };
        }
        return null;
      })
      .filter(Boolean);

    expect(missingSkills).toEqual([]);
  });
});
