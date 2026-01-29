import { z } from 'zod';

export const AsideTargetSchema = z.enum(['All', 'Front', 'Mid', 'Back', 'Persona', 'Skill']);

export const AsideModifierSchema = z
  .object({
    Increase: z.number().optional(),
    Reduction: z.number().optional(),
    Duration: z.number().optional(),
  })
  .passthrough();

export const AsideRowSchema = z
  .object({
    apostleId: z.string().min(1),
    apostleName: z.string().optional(),
    name: z.string().min(1),
    level: z.number().int().min(1),
    description: z.string().optional(),
    type: z.union([AsideTargetSchema, z.array(AsideTargetSchema)]).optional(),
    damage: z.union([AsideModifierSchema, z.array(AsideModifierSchema)]).optional(),
    skill: z.union([AsideModifierSchema, z.array(AsideModifierSchema)]).optional(),
  })
  .passthrough();

export const AsidesDataSchema = z.object({
  asides: z.array(AsideRowSchema).min(1),
});

export type AsidesData = z.infer<typeof AsidesDataSchema>;
export type AsideRow = z.infer<typeof AsideRowSchema>;
