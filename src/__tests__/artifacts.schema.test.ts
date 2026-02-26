import { describe, expect, it } from 'vitest';
import artifactsData from '@/data/artifacts.json';
import { ArtifactsDataSchema } from '@/schemas/artifacts.schema';

describe('artifacts.json schema validation', () => {
  it('artifacts.json should match ArtifactsDataSchema', () => {
    const result = ArtifactsDataSchema.safeParse(artifactsData);

    if (!result.success) {
      console.log(result.error.format());
    }

    expect(result.success).toBe(true);
  });

  it('each artifact should have unique id', () => {
    const parsed = ArtifactsDataSchema.parse(artifactsData);
    const ids = parsed.artifacts.map((a) => a.id);
    const uniqueIds = new Set(ids);

    expect(ids.length).toBe(uniqueIds.size);
  });
});
