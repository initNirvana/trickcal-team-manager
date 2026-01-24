import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Apostle } from '../types/apostle';
import type { SlotNumber, SkillLevel, AsideRank } from '@/types/branded';
import { GRID_CONFIG } from '@/constants/gameConstants';

interface DeckState {
  deck: (Apostle | undefined)[];
  skillLevels: Record<string, SkillLevel>;
  asideSelection: Record<string, AsideRank[]>;

  showDeckGuide: boolean;

  // Deck 관련
  setDeckMember: (slot: SlotNumber, apostle: Apostle | undefined) => void;
  clearDeck: () => void;

  // Skill Levels 관련
  setSkillLevel: (apostleId: string, level: SkillLevel) => void;
  resetSkillLevels: () => void;

  // Aside Selection 관련
  setAsideSelection: (apostleId: string, ranks: AsideRank[]) => void;
  resetAsideSelection: () => void;

  // 전체 리셋
  resetAll: () => void;

  setShowDeckGuide: (show: boolean) => void;

  // 내부 헬퍼 (persist용)
  hydrateDeck: (apostleIds: (string | null)[], allApostles: Apostle[]) => void;
}

interface PersistedState {
  deckIds: (string | null)[];
  skillLevels: Record<string, SkillLevel>;
  asideSelection: Record<string, AsideRank[]>;
}

export const useDeckStore = create<DeckState>()(
  persist(
    (set) => ({
      deck: Array(GRID_CONFIG.SIZE).fill(undefined),
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
              if (!existingApostle) return;

              // ID 또는 engName이 같으면 중복으로 간주
              const isSameId = existingApostle.id === apostle.id;
              const isSameEngName = existingApostle.engName === apostle.engName;

              if ((isSameId || isSameEngName) && index !== slot - 1) {
                newDeck[index] = undefined;
              }
            });
          }

          newDeck[slot - 1] = apostle;
          return { deck: newDeck };
        }),

      clearDeck: () => set({ deck: Array(GRID_CONFIG.SIZE).fill(undefined) }),

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

      // 복원 오류 시 초기화
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.warn('Storage data error, resetting:', error);
            localStorage.removeItem('trickcal-deck-storage');
          }
        };
      },

      // 복원 시: ID를 다시 Apostle 객체로 변환하지 않음 (컴포넌트에서 처리)
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<PersistedState>),
      }),
    },
  ),
);
