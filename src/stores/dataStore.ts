import { create } from 'zustand';
import { DataLoaderService } from '@/services/DataLoaderService';
import type { Apostle } from '@/types/apostle';
import type { AsidesData } from '@/types/aside';
import type { SkillsData } from '@/types/skill';
import type { SpellsData } from '@/types/spell';

interface DataState {
  apostles: Apostle[];
  skills: SkillsData;
  asides: AsidesData;
  spells: SpellsData;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  loadAllData: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  apostles: [],
  skills: { skills: [] },
  asides: { asides: [] },
  spells: { spells: [] },
  isLoading: false,
  error: null,
  initialized: false,

  loadAllData: async () => {
    if (get().initialized || get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const [apostles, skills, asides, spells] = await Promise.all([
        DataLoaderService.loadApostles(),
        DataLoaderService.loadSkills(),
        DataLoaderService.loadAsides(),
        DataLoaderService.loadSpells(),
      ]);

      set({
        apostles,
        skills,
        asides,
        spells,
        isLoading: false,
        initialized: true,
      });
    } catch (error) {
      console.error('Data loading error:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '데이터 로딩 실패',
      });
    }
  },
}));
