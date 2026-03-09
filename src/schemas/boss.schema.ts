import { z } from 'zod';

export const ContentTypeSchema = z.enum(['dimension', 'frontier']);

export const BossTagSchema = z.enum([
  '방어력감소',
  '피해량감소',
  '광역딜',
  '단일딜',
  '침묵',
  '감전',
  '화상',
  '쓰라림',
  'CC',
  '기절',
  'SP감소',
  'SP제거',
  '시간정지',
  '레이저차단',
  '잡몹정리',
  '받는피해량감소',
  '주는피해량감소',
  '광역힐',
  '광역보호막',
  '버프',
  '시간가속',
  '무적',
  '분신',
  '후열보호',
  '범위공격',
  '근거리탱커',
  '단일탱',
  '저속딜러',
]);

export const BossPatternSchema = z.object({
  name: z.string().min(1),
  debuffs: z.array(z.string()).optional(),
  note: z.string().optional(),
});

export const BossConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  content: ContentTypeSchema,
  recommendedTags: z.array(BossTagSchema),
  notRecommendedTags: z.array(BossTagSchema),
  memo: z.string().optional(),
  patterns: z.array(BossPatternSchema).optional(),
});

export const BossesDataSchema = z.array(BossConfigSchema);

export type BossesData = z.infer<typeof BossesDataSchema>;
export type BossConfigRow = z.infer<typeof BossConfigSchema>;
