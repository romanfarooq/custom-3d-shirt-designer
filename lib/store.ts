import { create } from 'zustand';

type Gender = 'man' | 'woman';

interface ClothingState {
  // State properties
  color: string;
  gender: Gender;
  
  // Actions
  setColor: (color: string) => void;
  setGender: (gender: Gender) => void;
}

export const useClothingStore = create<ClothingState>((set) => ({
  // Initial state
  color: '#F3F4F6', // Default color (White)
  gender: 'man', // Default gender
  
  // Actions to update state
  setColor: (color: string) => set({ color }),
  setGender: (gender: Gender) => set({ gender }),
}));