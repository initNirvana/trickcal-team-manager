import { describe, expect, it } from 'vitest';
import spellsData from '@/data/spells.json';
import { SpellsDataSchema } from '@/schemas/spells.schema';

describe('spells.json schema validation', () => {
  it('spells.json should match SpellsDataSchema', () => {
    const result = SpellsDataSchema.safeParse(spellsData);

    if (!result.success) {
      console.log(result.error.format());
    }

    expect(result.success).toBe(true);
  });

  it('each spell should have unique id', () => {
    const parsed = SpellsDataSchema.parse(spellsData);
    const ids = parsed.spells.map((s) => s.id);
    const uniqueIds = new Set(ids);

    expect(ids.length).toBe(uniqueIds.size);
  });
});
