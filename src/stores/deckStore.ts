import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Apostle } from '../types/apostle';

interface DeckState {
  deck: (Apostle | undefined)[];
  skillLevels: Record<string, number>;
  asideSelection: Record<string, number | string | undefined>;

  showDeckGuide: boolean;

  // Deck 관련
  setDeckMember: (slot: number, apostle: Apostle | undefined) => void;
  clearDeck: () => void;

  // Skill Levels 관련
  setSkillLevel: (apostleId: string, level: number) => void;
  resetSkillLevels: () => void;

  // Aside Selection 관련
  setAsideSelection: (apostleId: string, asideIndex: number | string | undefined) => void;
  resetAsideSelection: () => void;

  // 전체 리셋
  resetAll: () => void;

  setShowDeckGuide: (show: boolean) => void;

  // 내부 헬퍼 (persist용)
  hydrateDeck: (apostleIds: (string | null)[], allApostles: Apostle[]) => void;
}

interface PersistedState {
  deckIds: (string | null)[];
  skillLevels: Record<string, number>;
  asideSelection: Record<string, number | string | undefined>;
}

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      deck: Array(9).fill(undefined),
      skillLevels: {},
      asideSelection: {},
      showDeckGuide: false,

      // Deck 액션
      setDeckMember: (slot, apostle) =>
        set((state) => {
          const newDeck = [...state.deck];

          // 기존에 배치된 사도 중복 배치 시도 시 제거
          if (apostle) {
            newDeck.forEach((existingApostle, index) => {
              if (existingApostle && existingApostle.id === apostle.id && index !== slot - 1) {
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
          showDeckGuide: false,
        }),

      setShowDeckGuide: (show) => set({ showDeckGuide: show }),

      // 내부 헬퍼: ID 배열을 받아 Apostle 객체로 복원
      hydrateDeck: (apostleIds, allApostles) => {
        const apostlesMap = new Map(allApostles.map((a) => [a.id, a]));
        const restoredDeck = apostleIds.map((id) => (id ? apostlesMap.get(id) : undefined));
        set({ deck: restoredDeck });
      },
    }),
    {
      name: 'trickcal-deck-storage',
      storage: createJSONStorage(() => localStorage),

      // 저장 시: Apostle 객체를 ID로 변환
      partialize: (state): PersistedState => ({
        deckIds: state.deck.map((a) => a?.id || null),
        skillLevels: state.skillLevels,
        asideSelection: state.asideSelection,
      }),

      // 복원 시: ID를 다시 Apostle 객체로 변환하지 않음 (컴포넌트에서 처리)
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<PersistedState>),
      }),
    },
  ),
);
