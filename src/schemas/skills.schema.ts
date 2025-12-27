import { z } from 'zod';

export const SkillGradeSchema = z.enum(['low', 'high']);

export const SkillValueSchema = z
  .object({
    level: z.number().int().min(1).optional(),
    Increase: z.number().optional(),
    Reduction: z.number().optional(),
  })
  .passthrough();

export const SkillSchema = z
  .object({
    apostleId: z.string().min(1),
    name: z.string().min(1),
    level: SkillGradeSchema,
    description: z.string().optional(),
    effectRange: z.string().optional(),
    damage: z.union([z.array(SkillValueSchema), SkillValueSchema]).optional(),
  })
  .passthrough();

export const SkillsDataSchema = z
  .object({
    skills: z.array(SkillSchema).min(1),
    version: z.string().optional(),
    lastUpdated: z.string().optional(),
  })
  .passthrough();

export type SkillsData = z.infer<typeof SkillsDataSchema>;
export type SkillRow = z.infer<typeof SkillSchema>;
