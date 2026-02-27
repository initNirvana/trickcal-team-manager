import { z } from 'zod';
import { CardBaseSchema } from './card.schema';

export const ArtifactSchema = CardBaseSchema.extend({
  coin: z.number().int().nonnegative(),
});

export const ArtifactsDataSchema = z.object({
  artifacts: z.array(ArtifactSchema).min(1),
});

export type ArtifactsData = z.infer<typeof ArtifactsDataSchema>;
export type ArtifactRow = z.infer<typeof ArtifactSchema>;
