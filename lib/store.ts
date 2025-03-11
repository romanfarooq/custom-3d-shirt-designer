import { create } from "zustand";

interface ClothingState {
  // State properties
  color: string;
  decalPosition: {
    position: number[];
    rotation: number[];
  } | null;

  // Actions
  setColor: (color: string) => void;
  setDecalPosition: (decalPosition: {
    position: number[];
    rotation: number[];
  }) => void;
}

export const useClothingStore = create<ClothingState>((set) => ({
  // Initial state
  color: "#F3F4F6", // Default color (White)
  gender: "man", // Default gender
  decalPosition: null,

  // Actions to update state
  setColor: (color: string) => set({ color }),
  setDecalPosition: (decalPosition: {
    position: number[];
    rotation: number[];
  }) => set({ decalPosition }),
}));
