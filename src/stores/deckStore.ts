import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { GRID_CONFIG } from '@/constants/gameConstants';
import type { AsideRank, CardLevel, SkillLevel, SlotNumber } from '@/types/branded';
import type { Apostle } from '../types/apostle';

interface DeckState {
  deck: (Apostle | undefined)[];
  skillLevels: Record<string, SkillLevel>;
  asideSelection: Record<string, AsideRank[]>;

  showDeckGuide: boolean;
  showArtifactMode: boolean;

  // 장착된 아티팩트 (key: apostleId, value: [아티팩트ID, 아티팩트ID, 아티팩트ID])
  // null이면 빈 슬롯
  equippedArtifacts: Record<string, [number | null, number | null, number | null]>;

  // Deck 관련
  setDeckMember: (slot: SlotNumber, apostle: Apostle | undefined) => void;
  clearDeck: () => void;

  // Skill Levels 관련
  setSkillLevel: (apostleId: string, level: SkillLevel) => void;
  resetSkillLevels: () => void;

  // Aside Selection 관련
  setAsideSelection: (apostleId: string, ranks: AsideRank[]) => void;
  resetAsideSelection: () => void;

  // Card Level 관련
  cardLevels: Record<string, CardLevel>;
  setCardLevel: (cardId: string, level: CardLevel) => void;
  resetCardLevels: () => void;

  // 전체 리셋
  resetAll: () => void;

  setShowDeckGuide: (show: boolean) => void;
  setShowArtifactMode: (show: boolean) => void;

  // 장착된 아티팩트 관리
  equipArtifact: (apostleId: string, slotIndex: number, artifactId: number) => void;
  unequipArtifact: (apostleId: string, slotIndex: number) => void;

  // 내부 헬퍼 (persist용)
  hydrateDeck: (apostleIds: (string | null)[], allApostles: Apostle[]) => void;
}

interface PersistedState {
  deckIds: (string | null)[];
  skillLevels: Record<string, SkillLevel>;
  asideSelection: Record<string, AsideRank[]>;
  cardLevels: Record<string, CardLevel>;
  showArtifactMode: boolean;
  equippedArtifacts: Record<string, [number | null, number | null, number | null]>;
}

export const useDeckStore = create<DeckState>()(
  persist(
    (set) => ({
      deck: Array(GRID_CONFIG.SIZE).fill(undefined),
      skillLevels: {},
      asideSelection: {},
      cardLevels: {},
      showDeckGuide: false,
      showArtifactMode: false,
      equippedArtifacts: {},

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

      // Card Level 액션
      setCardLevel: (cardId, level) =>
        set((state) => ({
          cardLevels: {
            ...state.cardLevels,
            [cardId]: level,
          },
        })),

      resetCardLevels: () => set({ cardLevels: {} }),

      // 전체 초기화
      resetAll: () =>
        set({
          deck: Array(GRID_CONFIG.SIZE).fill(undefined),
          skillLevels: {},
          asideSelection: {},
          cardLevels: {},
          showDeckGuide: false,
          showArtifactMode: false,
          equippedArtifacts: {},
        }),

      setShowDeckGuide: (show) => set({ showDeckGuide: show }),
      setShowArtifactMode: (show) => set({ showArtifactMode: show }),

      equipArtifact: (apostleId, slotIndex, artifactId) =>
        set((state) => {
          const currentArtifacts = state.equippedArtifacts[apostleId] || [null, null, null];
          const newArtifacts = [...currentArtifacts] as [
            number | null,
            number | null,
            number | null,
          ];
          newArtifacts[slotIndex] = artifactId;
          return {
            equippedArtifacts: {
              ...state.equippedArtifacts,
              [apostleId]: newArtifacts,
            },
          };
        }),

      unequipArtifact: (apostleId, slotIndex) =>
        set((state) => {
          if (!state.equippedArtifacts[apostleId]) return state;

          const newArtifacts = [...state.equippedArtifacts[apostleId]] as [
            number | null,
            number | null,
            number | null,
          ];
          newArtifacts[slotIndex] = null;
          return {
            equippedArtifacts: {
              ...state.equippedArtifacts,
              [apostleId]: newArtifacts,
            },
          };
        }),

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
        cardLevels: state.cardLevels,
        showArtifactMode: state.showArtifactMode,
        equippedArtifacts: state.equippedArtifacts,
      }),

      // 복원 오류 시 초기화
      onRehydrateStorage: () => {
        return (_state, error) => {
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
