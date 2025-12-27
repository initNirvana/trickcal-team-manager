import { z } from 'zod';

// JSON에 맞춘 enum들 (apostles.json 기준) [file:19]
const PersonalitySchema = z.enum(['Jolly', 'Mad', 'Naive', 'Gloomy', 'Cool']);
const PositionSchema = z.enum(['front', 'mid', 'back']);
const MethodSchema = z.enum(['Physical', 'Magical']);

// races도 JSON 기준(한글) [file:19]
const RaceSchema = z.enum(['용족', '정령', '수인', '유령', '마녀', '요정', '엘프']);

// role은 {main, subRole, trait} 구조 [file:19][file:20]
const TraitSchema = z.enum(['Damage', 'Defense', 'CC', 'Heal', 'Shield', 'Buff', 'Debuff']);

const AttackerSubRoleSchema = z.enum(['Melee', 'Ranged', 'Assassin', 'Nuker', 'Utility']);
const TankerSubRoleSchema = z.enum(['Main', 'Sub', 'Evasion']);
const SupporterSubRoleSchema = z.enum(['Pure', 'Buffer', 'CC', 'Utility', 'Attacker']);

const RoleSchema = z.discriminatedUnion('main', [
  z.object({
    main: z.literal('Attacker'),
    subRole: AttackerSubRoleSchema,
    trait: z.array(TraitSchema),
  }),
  z.object({
    main: z.literal('Tanker'),
    subRole: TankerSubRoleSchema,
    trait: z.array(TraitSchema),
  }),
  z.object({
    main: z.literal('Supporter'),
    subRole: SupporterSubRoleSchema,
    trait: z.array(TraitSchema),
  }),
]);

const AsideSchema = z
  .object({
    hasAside: z.boolean(),
    importance: z.enum(['선택', '권장', '필수']).nullable(),
    level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
    score: z.number().int().min(0).max(15),
  })
  // 선택: 데이터 일관성 룰(원하면 나중에 더 엄격히) [file:19]
  .superRefine((aside, ctx) => {
    if (!aside.hasAside) {
      if (aside.level !== 0 || aside.score !== 0 || aside.importance !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'aside.hasAside=false이면 importance=null, level=0, score=0 이어야 합니다.',
        });
      }
    }
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
  position: PositionSchema.or(z.array(PositionSchema)), // 일부 데이터가 배열일 가능성 대비 [file:19]
  positionPriority: z.array(PositionSchema).optional(),
  baseScore: z.number(),
  aside: AsideSchema,
  mercenary: z.boolean().optional(),
});

export const ApostlesDataSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(), // "2025-12-27" 형태 [file:19]
  apostles: z.array(ApostleSchema).min(1),
});

export type ApostlesData = z.infer<typeof ApostlesDataSchema>;
export type Apostle = z.infer<typeof ApostleSchema>;
