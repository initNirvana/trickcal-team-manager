import { describe, it, expect } from 'vitest';
import apostlesData from '@/data/apostles.json';
import ratingsData from '@/data/apostles-ratings.json';

import { ApostlesDataSchema } from '@/schemas/apostles.schema';
import { ApostlesRatingsSchema } from '@/schemas/apostles-ratings.schema';

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
});
