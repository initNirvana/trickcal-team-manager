import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface OwnedApostle {
  id: string;
  asideLevel: number; // 0, 1, 2, 3
}

interface MyApostleState {
  ownedApostles: OwnedApostle[];
  toggleApostle: (id: string) => void;
  addApostles: (ids: string[]) => void;
  removeApostles: (ids: string[]) => void;
  setOwnedApostles: (owned: OwnedApostle[]) => void;
  setAsideLevel: (id: string, level: number) => void;
  resetAll: () => void;
  hasApostle: (id: string) => boolean;
  getAsideLevel: (id: string) => number;
}

export const useMyApostleStore = create<MyApostleState>()(
  persist(
    (set, get) => ({
      ownedApostles: [],

      toggleApostle: (id) =>
        set((state) => {
          const exists = state.ownedApostles.some((a) => a.id === id);
          return {
            ownedApostles: exists
              ? state.ownedApostles.filter((a) => a.id !== id)
              : [...state.ownedApostles, { id, asideLevel: 0 }],
          };
        }),

      addApostles: (ids) =>
        set((state) => {
          const currentIds = new Set(state.ownedApostles.map((a) => a.id));
          const newApostles = ids
            .filter((id) => !currentIds.has(id))
            .map((id) => ({ id, asideLevel: 0 }));
          return {
            ownedApostles: [...state.ownedApostles, ...newApostles],
          };
        }),

      removeApostles: (targetIds) =>
        set((state) => ({
          ownedApostles: state.ownedApostles.filter((a) => !targetIds.includes(a.id)),
        })),

      setOwnedApostles: (owned) => set({ ownedApostles: owned }),

      setAsideLevel: (id, level) =>
        set((state) => ({
          ownedApostles: state.ownedApostles.map((a) =>
            a.id === id ? { ...a, asideLevel: level } : a,
          ),
        })),

      resetAll: () => set({ ownedApostles: [] }),

      hasApostle: (id) => get().ownedApostles.some((a) => a.id === id),

      getAsideLevel: (id) => get().ownedApostles.find((a) => a.id === id)?.asideLevel ?? 0,
    }),
    {
      name: 'trickcal-owned-apostles',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0 && (persistedState as { ownedApostleIds: string[] }).ownedApostleIds) {
          return {
            ownedApostles: (persistedState as { ownedApostleIds: string[] }).ownedApostleIds.map(
              (id: string) => ({
                id,
                asideLevel: 0,
              }),
            ),
          };
        }
        return persistedState;
      },
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<MyApostleState>;
        if (state && Array.isArray(state.ownedApostles)) {
          // 데이터 유효성 검증
          const validApostles = state.ownedApostles.filter((item) => {
            return (
              item &&
              typeof item === 'object' &&
              typeof item.id === 'string' &&
              item.id.length > 0 &&
              typeof item.asideLevel === 'number' &&
              item.asideLevel >= 0 &&
              item.asideLevel <= 3
            );
          });
          return { ...currentState, ...state, ownedApostles: validApostles };
        }
        return currentState;
      },
    },
  ),
);
