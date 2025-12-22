import { create } from 'zustand';
import type { Apostle } from '../types/apostle';

interface DeckState {
  deck: (Apostle | undefined)[];
  skillLevels: Record<string, number>;
  asideSelection: Record<string, number | null>;

  showDeckGuide: boolean;

  // Deck 관련
  setDeckMember: (slot: number, apostle: Apostle | undefined) => void;
  clearDeck: () => void;

  // Skill Levels 관련
  setSkillLevel: (apostleId: string, level: number) => void;
  resetSkillLevels: () => void;

  // Aside Selection 관련
  setAsideSelection: (apostleId: string, asideIndex: number | null) => void;
  resetAsideSelection: () => void;

  // 전체 리셋
  resetAll: () => void;

  setShowDeckGuide: (show: boolean) => void;
}

export const useDeckStore = create<DeckState>((set) => ({
  deck: Array(9).fill(undefined),
  skillLevels: {},
  asideSelection: {},
  showDeckGuide: true,

  // Deck 액션
  setDeckMember: (slot, apostle) =>
    set((state) => {
      const newDeck = [...state.deck];

      // 기존에 배치된 사도 배치 시도시
      if (apostle) {
        newDeck.forEach((existingApostle, index) => {
          if (existingApostle && existingApostle.name === apostle.name && index !== slot - 1) {
            newDeck[index] = undefined;
          }
        });
      }

      newDeck[slot - 1] = apostle;
      return { deck: newDeck };
    }),
  clearDeck: () => set({ deck: Array(9).fill(undefined) }),

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
      deck: Array(9).fill(undefined),
      skillLevels: {},
      asideSelection: {},
      showDeckGuide: undefined,
    }),

  setShowDeckGuide: (show) => set({ showDeckGuide: show }), // ✅ 새로운 액션
}));
