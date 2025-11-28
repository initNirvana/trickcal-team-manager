import { create } from 'zustand';
import type { Apostle } from '../types/apostle';

interface PartyState {
  party: (Apostle | undefined)[];
  setPartyMember: (slot: number, apostle: Apostle | undefined) => void;
  clearParty: () => void;
}

export const usePartyStore = create<PartyState>((set) => ({
  party: Array(9).fill(undefined),
  setPartyMember: (slot, apostle) =>
    set((state) => {
      const newParty = [...state.party];
      newParty[slot - 1] = apostle;
      return { party: newParty };
    }),
  clearParty: () => set({ party: Array(9).fill(undefined) }),
}));
