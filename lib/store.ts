import { create } from "zustand";

interface DecalPosition {
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
}

interface ClothingState {
  // State properties
  color: string;
  decalPosition: DecalPosition | null;

  // Actions
  setColor: (color: string) => void;
  setDecalPosition: (decalPosition: DecalPosition) => void;
}

export const useClothingStore = create<ClothingState>((set) => ({
  // Initial state
  color: "#F3F4F6", // Default color (White)
  decalPosition: null,

  // Actions to update state
  setColor: (color: string) => set({ color }),
  setDecalPosition: (decalPosition: DecalPosition) => set({ decalPosition }),
}));
