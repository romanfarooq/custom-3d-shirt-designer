import { create } from "zustand";

interface ClothingState {
  // State properties
  color: string;
  decalPosition: {
    position: [number, number, number];
    rotation: [number, number, number];
  } | null;

  // Actions
  setColor: (color: string) => void;
  setDecalPosition: (decalPosition: {
    position: [number, number, number];
    rotation: [number, number, number];
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
    position: [number, number, number];
    rotation: [number, number, number];
  }) => set({ decalPosition }),
}));
