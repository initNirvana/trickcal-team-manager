// src/utils/dataLoader.ts
import { Apostle } from '../types/apostle';

export class DataLoaderService {
  private static cache: Map<string, any> = new Map();

  /**
   * 동적 임포트로 데이터 로드
   * 첫 로드 시만 파싱, 이후는 캐시 사용
   */
  static async loadApostles(): Promise<Apostle[]> {
    if (this.cache.has('apostles')) {
      return this.cache.get('apostles');
    }

    try {
      const data = await import('../data/apostles.json');
      const apostles = data.apostles as Apostle[];
      this.cache.set('apostles', apostles);
      return apostles;
    } catch (error) {
      console.error('사도 데이터 로딩 실패:', error);
      return [];
    }
  }

  static async loadSkills(): Promise<any> {
    if (this.cache.has('skills')) {
      return this.cache.get('skills');
    }

    try {
      const data = await import('../data/skills.json');
      this.cache.set('skills', data);
      return data;
    } catch (error) {
      console.error('스킬 데이터 로딩 실패:', error);
      return {};
    }
  }

  static async loadAsides(): Promise<any> {
    if (this.cache.has('asides')) {
      return this.cache.get('asides');
    }

    try {
      const data = await import('../data/asides.json');
      this.cache.set('asides', data);
      return data;
    } catch (error) {
      console.error('어사이드 데이터 로딩 실패:', error);
      return {};
    }
  }

  static async loadSpells(): Promise<any> {
    if (this.cache.has('spells')) {
      return this.cache.get('spells');
    }

    try {
      const data = await import('../data/spells.json');
      this.cache.set('spells', data);
      return data;
    } catch (error) {
      console.error('스펠 데이터 로딩 실패:', error);
      return {};
    }
  }

  // 전체 데이터 동시 로드 (필요할 때만)
  static async loadAllData() {
    return Promise.all([
      this.loadApostles(),
      this.loadSkills(),
      this.loadAsides(),
      this.loadSpells(),
    ]);
  }
}
