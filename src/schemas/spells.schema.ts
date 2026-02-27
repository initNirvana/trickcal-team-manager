import { z } from 'zod';
import { CardBaseSchema } from './card.schema';

export const SpellSchema = CardBaseSchema.extend({
  coin: z.number().int().nonnegative(),
});

export const SpellsDataSchema = z.object({
  spells: z.array(SpellSchema).min(1),
});

export type SpellsData = z.infer<typeof SpellsDataSchema>;
export type SpellRow = z.infer<typeof SpellSchema>;
