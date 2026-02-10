import { z } from 'zod';

const PersonalitySchema = z.enum(['Jolly', 'Mad', 'Naive', 'Gloomy', 'Cool']);
const PositionSchema = z.enum(['front', 'mid', 'back']);
const MethodSchema = z.enum(['Physical', 'Magical']);
const RaceSchema = z.enum(['용족', '정령', '수인', '유령', '마녀', '요정', '엘프', '미스틱']);
const TraitSchema = z.enum(['Damage', 'Defense', 'CC', 'Heal', 'Shield', 'Buff', 'Debuff']);
const AttackerSubRoleSchema = z.enum(['Melee', 'Ranged', 'Assassin', 'Nuker', 'Utility']);
const TankerSubRoleSchema = z.enum(['Main', 'Sub', 'Evasion']);
const SupporterSubRoleSchema = z.enum(['Pure', 'Buffer', 'CC', 'Utility', 'Attacker']);

const RoleSchema = z.discriminatedUnion('main', [
  z.object({
    main: z.literal('Attacker'),
    subRole: AttackerSubRoleSchema,
    trait: z.array(TraitSchema).default([]),
  }),
  z.object({
    main: z.literal('Tanker'),
    subRole: TankerSubRoleSchema,
    trait: z.array(TraitSchema).default([]),
  }),
  z.object({
    main: z.literal('Supporter'),
    subRole: SupporterSubRoleSchema,
    trait: z.array(TraitSchema).default([]),
  }),
]);

const AsideSchema = z.object({
  hasAside: z.boolean(),
  importance: z.enum(['선택', '권장', '필수', '보류']).nullable().optional(),
  score: z.number().int().min(0).max(15).optional(),
  reason: z.string().min(1).optional(),
});

export const ApostleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  engName: z.string().min(1),
  isEldain: z.boolean(),
  rank: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  race: RaceSchema,
  persona: PersonalitySchema,
  role: RoleSchema,
  method: MethodSchema,
  position: z.union([PositionSchema, z.array(PositionSchema)]),
  positionPriority: z.array(PositionSchema).optional(),
  positionScore: z
    .object({
      front: z.number().optional(),
      mid: z.number().optional(),
      back: z.number().optional(),
    })
    .optional(),
  aside: AsideSchema,
  mercenary: z.boolean().optional(),
  baseScore: z.number().optional(),
  scoreBySize: z
    .object({
      size6: z.number().optional(),
      size9: z.number().optional(),
    })
    .optional(),
  pvp: z
    .object({
      score: z.number().int().min(0).max(15),
      aside: z.enum(['선택', '권장', '필수', '보류']).nullable(),
      reason: z.string().min(1).optional(),
    })
    .optional(),
  reason: z.string().min(1).optional(),
});

export const ApostlesDataSchema = z.object({
  apostles: z.array(ApostleSchema).min(1),
});

export type ApostlesData = z.infer<typeof ApostlesDataSchema>;
