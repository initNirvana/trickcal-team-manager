import { useEffect } from 'react';
import { useDataStore } from '@/stores/dataStore';

export function useDataLoader() {
  const { apostles, skills, asides, spells, isLoading, error, loadAllData } = useDataStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return { apostles, skills, asides, spells, isLoading, error };
}
