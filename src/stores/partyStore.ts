import { create } from 'zustand';
import type { Apostle } from '../types/apostle';

interface PartyState {
  party: (Apostle | undefined)[];
  skillLevels: Record<string, number>;
  asideSelection: Record<string, number | null>;

  // Party 관련
  setPartyMember: (slot: number, apostle: Apostle | undefined) => void;
  clearParty: () => void;

  // Skill Levels 관련
  setSkillLevel: (apostleId: string, level: number) => void;
  resetSkillLevels: () => void;

  // Aside Selection 관련
  setAsideSelection: (apostleId: string, asideIndex: number | null) => void;
  resetAsideSelection: () => void;

  // 전체 리셋
  resetAll: () => void;
}

export const usePartyStore = create<PartyState>((set) => ({
  party: Array(9).fill(undefined),
  skillLevels: {},
  asideSelection: {},

  // Party 액션
  setPartyMember: (slot, apostle) =>
    set((state) => {
      const newParty = [...state.party];

      // 기존에 배치된 사도 배치 시도시
      if (apostle) {
        newParty.forEach((existingApostle, index) => {
          if (existingApostle && existingApostle.name === apostle.name && index !== slot - 1) {
            newParty[index] = undefined;
          }
        });
      }

      newParty[slot - 1] = apostle;
      return { party: newParty };
    }),
  clearParty: () => set({ party: Array(9).fill(undefined) }),

  // Skill Level 액션
  setSkillLevel: (apostleId, level) =>
    set((state) => ({
      skillLevels: {
        ...state.skillLevels,
        [apostleId]: level,
      },
    })),
  resetSkillLevels: () => set({ skillLevels: {} }),

  // Aside Selection 액션
  setAsideSelection: (apostleId, asideIndex) =>
    set((state) => ({
      asideSelection: {
        ...state.asideSelection,
        [apostleId]: asideIndex,
      },
    })),
  resetAsideSelection: () => set({ asideSelection: {} }),

  // 전체 초기화
  resetAll: () =>
    set({
      party: Array(9).fill(undefined),
      skillLevels: {},
      asideSelection: {},
    }),
}));
