/**
 * 게임 데이터 로딩 및 캐싱 서비스
 * - Zod 스키마 검증으로 안전성 보장
 * - safeParse로 에러 안전하게 처리
 */

import type { Apostle } from '@/types/apostle';
import type { AsidesData } from '@/types/aside';
import type { SkillsData } from '@/types/skill';
import type { SpellsData } from '@/types/spell';
import { ApostlesDataSchema } from '@/schemas/apostles.schema';
import { ApostlesRatingsSchema } from '@/schemas/apostles-ratings.schema';

type CacheData = Apostle[] | SkillsData | AsidesData | SpellsData;

export interface DataLoaderError {
  code: 'PARSE_ERROR' | 'LOAD_ERROR' | 'VALIDATION_ERROR';
  message: string;
  originalError?: unknown;
}

export class DataLoaderService {
  private static cache: Map<string, CacheData> = new Map();

  /**
   * 안전한 데이터 로딩 - 실패 시 에러 객체 반환
   */
  static async loadApostlesSafe(): Promise<{
    data: Apostle[] | null;
    error: DataLoaderError | null;
  }> {
    if (this.cache.has('apostles')) {
      return { data: this.cache.get('apostles') as Apostle[], error: null };
    }

    try {
      const [apostlesModule, ratingsModule] = await Promise.all([
        import('@/data/apostles.json'),
        import('@/data/apostles-ratings.json'),
      ]);

      const apostlesResult = ApostlesDataSchema.safeParse(apostlesModule);
      if (!apostlesResult.success) {
        return {
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Apostles schema validation failed: ${apostlesResult.error.message}`,
            originalError: apostlesResult.error,
          },
        };
      }

      const ratingsResult = ApostlesRatingsSchema.safeParse(ratingsModule);
      if (!ratingsResult.success) {
        return {
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Ratings schema validation failed: ${ratingsResult.error.message}`,
            originalError: ratingsResult.error,
          },
        };
      }

      const apostlesData = apostlesResult.data;
      const ratingsData = ratingsResult.data;

      const apostlesRaw = apostlesData.apostles;
      const ratings = ratingsData.ratings;

      const merged: Apostle[] = apostlesRaw.map((a) => {
        const rating = ratings[a.id];
        if (!rating) {
          throw new Error(`Rating missing for apostle ID: ${a.id}`);
        }
        return {
          ...a,
          baseScore: rating.baseScore,
          scoreBySize: rating.scoreBySize,
          positionScore: rating.positionScore,
          pvp: rating.pvp,
          reason: rating.reason,
          aside: {
            hasAside: a.aside.hasAside,
            importance: rating.aside.importance,
            score: rating.aside.score,
            reason: rating.aside.reason,
          },
        } as Apostle;
      });

      this.cache.set('apostles', merged);
      return { data: merged, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        data: null,
        error: {
          code: 'LOAD_ERROR',
          message: `Failed to load apostles: ${message}`,
          originalError: error,
        },
      };
    }
  }

  /**
   * 기존 API 유지 (에러 발생 시 throw)
   */
  static async loadApostles(): Promise<Apostle[]> {
    const { data, error } = await this.loadApostlesSafe();
    if (error) {
      throw new Error(error.message);
    }
    return data!;
  }

  static async loadSkills(): Promise<SkillsData> {
    if (this.cache.has('skills')) return this.cache.get('skills') as SkillsData;

    try {
      const skillsModule = await import('@/data/skills.json');
      const skillsData = skillsModule.default ?? skillsModule;
      this.cache.set('skills', skillsData as SkillsData);
      return skillsData as SkillsData;
    } catch (error) {
      console.error('Failed to load skills:', error);
      throw error;
    }
  }

  static async loadAsides(): Promise<AsidesData> {
    if (this.cache.has('asides')) return this.cache.get('asides') as AsidesData;

    try {
      const asidesModule = await import('@/data/asides.json');
      const asidesData = asidesModule.default ?? asidesModule;
      this.cache.set('asides', asidesData as AsidesData);
      return asidesData as AsidesData;
    } catch (error) {
      console.error('Failed to load asides:', error);
      throw error;
    }
  }

  static async loadSpells(): Promise<SpellsData> {
    if (this.cache.has('spells')) return this.cache.get('spells') as SpellsData;

    try {
      const spellsModule = await import('@/data/spells.json');
      const spellsData = spellsModule.default ?? spellsModule;
      this.cache.set('spells', spellsData as SpellsData);
      return spellsData as SpellsData;
    } catch (error) {
      console.error('Failed to load spells:', error);
      throw error;
    }
  }

  static clearCache(): void {
    this.cache.clear();
  }
}
