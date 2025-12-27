import { useEffect, useState } from 'react';
import { DataLoaderService } from '../utils/dataLoader';
import { Apostle } from '../types/apostle';

interface DataLoaderState {
  apostles: Apostle[];
  skills: any;
  asides: any;
  spells: any;
  isLoading: boolean;
  error: string | null;
}

export function useDataLoader() {
  const [state, setState] = useState<DataLoaderState>({
    apostles: [],
    skills: {},
    asides: {},
    spells: {},
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [apostles, skills, asides, spells] = await DataLoaderService.loadAllData();
        setState({
          apostles,
          skills,
          asides,
          spells,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : '데이터 로딩 실패',
        }));
      }
    };

    loadData();
  }, []);

  return state;
}
