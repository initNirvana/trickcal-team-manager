import { z } from 'zod';

export const ApostleRatingSchema = z
  .object({
    name: z.string().min(1),
    engName: z.string().min(1),

    baseScore: z.number(),
    scoreBySize: z
      .object({
        size6: z.number().optional(),
        size9: z.number().optional(),
      })
      .optional(),
    positionScore: z
      .object({
        front: z.number().optional(),
        mid: z.number().optional(),
        back: z.number().optional(),
      })
      .optional(),
    aside: z.object({
      importance: z.enum(['선택', '권장', '필수']).nullable(),
      score: z.number().int().min(0).max(15),
    }),
  })
  .strict();

export const ApostlesRatingsSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  ratings: z.record(z.string().min(1), ApostleRatingSchema),
});

export type ApostlesRatings = z.infer<typeof ApostlesRatingsSchema>;
