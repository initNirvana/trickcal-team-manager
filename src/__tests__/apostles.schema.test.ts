import { describe, it, expect } from 'vitest';
import apostlesData from '@/data/apostles.json';
import { ApostlesDataSchema } from '@/schemas/apostles.schema';

describe('apostles.json schema validation', () => {
  it('apostles.json should match ApostlesDataSchema', () => {
    const result = ApostlesDataSchema.safeParse(apostlesData);

    if (!result.success) {
      console.log(result.error.format());
    }

    expect(result.success).toBe(true);
  });

  it('apostle ids should be unique', () => {
    const parsed = ApostlesDataSchema.parse(apostlesData);
    const ids = parsed.apostles.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
