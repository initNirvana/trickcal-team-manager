import { useEffect, useState } from 'react';
import { DataLoaderService } from '../utils/dataLoader';
import { AsidesData } from '../types/aside';
import { SkillsData } from '../types/skill';
import { SpellsData } from '../types/spell';
import { Apostle } from '../types/apostle';

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
        const [apostles, skills, asides, spells] = await DataLoaderService.loadAllData();

        setState({
          apostles,
          skills: skills as SkillsData,
          asides: asides as AsidesData,
          spells: spells as SpellsData,
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
