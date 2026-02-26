import { z } from 'zod';

export const CardGradeSchema = z.enum(['일반', '고급', '희귀', '전설']);

export const CardOptionTypeSchema = z.enum([
  'physicalAttack',
  'magicAttack',
  'physicalDefense',
  'magicDefense',
  'hp',
  'criticalRate',
  'criticalDamage',
  'criticalResist',
  'criticalDamageResist',
  'attackSpeed',
]);

export const CardOptionSchema = z.object({
  type: CardOptionTypeSchema,
  value: z.number(),
});

export const CardBaseSchema = z.object({
  id: z.number().int().positive(),
  level: z.number().int().min(1),
  grade: CardGradeSchema,
  name: z.string().min(1),
  coin: z.number().int().nonnegative().optional(),
  options: z.array(CardOptionSchema).optional(),
  effectDescription: z.string().optional(),
});
