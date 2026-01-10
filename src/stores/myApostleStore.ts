import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface MyApostleState {
  ownedApostleIds: string[];
  toggleApostle: (id: string) => void;
  addApostles: (ids: string[]) => void;
  removeApostles: (ids: string[]) => void;
  setOwnedApostles: (ids: string[]) => void;
  resetAll: () => void;
  hasApostle: (id: string) => boolean;
}

export const useMyApostleStore = create<MyApostleState>()(
  persist(
    (set, get) => ({
      ownedApostleIds: [],

      toggleApostle: (id) =>
        set((state) => {
          const exists = state.ownedApostleIds.includes(id);
          return {
            ownedApostleIds: exists
              ? state.ownedApostleIds.filter((x) => x !== id)
              : [...state.ownedApostleIds, id],
          };
        }),

      addApostles: (newIds) =>
        set((state) => ({
          ownedApostleIds: Array.from(new Set([...state.ownedApostleIds, ...newIds])),
        })),

      removeApostles: (targetIds) =>
        set((state) => ({
          ownedApostleIds: state.ownedApostleIds.filter((id) => !targetIds.includes(id)),
        })),

      setOwnedApostles: (ids) => set({ ownedApostleIds: ids }),

      resetAll: () => set({ ownedApostleIds: [] }),

      hasApostle: (id) => get().ownedApostleIds.includes(id),
    }),
    {
      name: 'trickcal-owned-apostles',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
