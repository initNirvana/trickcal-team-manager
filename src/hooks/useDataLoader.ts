import { useEffect, useState } from 'react';
import { DataLoaderService } from '@/services/DataLoaderService';
import type { AsidesData } from '@/types/aside';
import type { SkillsData } from '@/types/skill';
import type { SpellsData } from '@/types/spell';
import type { Apostle } from '@/types/apostle';

interface DataLoaderState {
  apostles: Apostle[];
  skills: SkillsData;
  asides: AsidesData;
  spells: SpellsData;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: DataLoaderState = {
  apostles: [],
  skills: { skills: [] },
  asides: { asides: [] },
  spells: { spells: [] },
  isLoading: true,
  error: null,
};

export function useDataLoader(): DataLoaderState {
  const [state, setState] = useState<DataLoaderState>(INITIAL_STATE);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [apostles, skills, asides, spells] = await Promise.all([
          DataLoaderService.loadApostles(),
          DataLoaderService.loadSkills(),
          DataLoaderService.loadAsides(),
          DataLoaderService.loadSpells(),
        ]);

        setState({
          apostles,
          skills,
          asides,
          spells,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Data loading error:', error);
        setState({
          ...INITIAL_STATE,
          isLoading: false,
          error: error instanceof Error ? error.message : '데이터 로딩 실패',
        });
      }
    };

    loadData();
  }, []);

  return state;
}
