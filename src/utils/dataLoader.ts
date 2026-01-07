import { Apostle } from '../types/apostle';
import { AsidesData } from '../types/aside';
import { SkillsData } from '../types/skill';
import { SpellsData } from '../types/spell';
import { ApostlesDataSchema } from '../schemas/apostles.schema';
import { ApostlesRatingsSchema } from '../schemas/apostles-ratings.schema';

type CacheData = Apostle[] | SkillsData | AsidesData | SpellsData;

export class DataLoaderService {
  private static cache: Map<string, CacheData> = new Map();

  static async loadApostles(): Promise<Apostle[]> {
    if (this.cache.has('apostles')) return this.cache.get('apostles') as Apostle[];

    try {
      const [apostlesModule, ratingsModule] = await Promise.all([
        import('../data/apostles.json'),
        import('../data/apostles-ratings.json'),
      ]);

      const apostlesData = ApostlesDataSchema.parse(apostlesModule);
      const ratingsData = ApostlesRatingsSchema.parse(ratingsModule);

      const apostlesRaw = apostlesData.apostles;
      const ratings = ratingsData.ratings;

      const merged: Apostle[] = apostlesRaw.map((a) => {
        const rating = ratings[a.id];
        if (!rating) throw new Error(`Rating missing for ${a.id}`);
        return {
          ...a,
          baseScore: rating.baseScore,
          scoreBySize: rating.scoreBySize,
          positionScore: rating.positionScore,
          aside: {
            hasAside: a.aside.hasAside,
            importance: rating.aside.importance,
            score: rating.aside.score,
          },
        } as Apostle;
      });

      this.cache.set('apostles', merged);
      return merged;
    } catch (error) {
      console.error('Failed to load apostles:', error);
      throw error;
    }
  }

  static async loadSkills(): Promise<SkillsData> {
    if (this.cache.has('skills')) return this.cache.get('skills') as SkillsData;
    try {
      const module = await import('../data/skills.json');
      const data = module as unknown as SkillsData;
      this.cache.set('skills', data);
      return data;
    } catch (error) {
      console.error('Failed to load skills:', error);
      throw error;
    }
  }

  static async loadAsides(): Promise<AsidesData> {
    if (this.cache.has('asides')) return this.cache.get('asides') as AsidesData;
    try {
      const module = await import('../data/asides.json');
      const data = module as unknown as AsidesData;
      this.cache.set('asides', data);
      return data;
    } catch (error) {
      console.error('Failed to load asides:', error);
      throw error;
    }
  }

  static async loadSpells(): Promise<SpellsData> {
    if (this.cache.has('spells')) return this.cache.get('spells') as SpellsData;
    try {
      const module = await import('../data/spells.json');
      const data = module as unknown as SpellsData;
      this.cache.set('spells', data);
      return data;
    } catch (error) {
      console.error('Failed to load spells:', error);
      throw error;
    }
  }

  static async loadAllData() {
    return Promise.all([
      this.loadApostles(),
      this.loadSkills(),
      this.loadAsides(),
      this.loadSpells(),
    ]);
  }
}
