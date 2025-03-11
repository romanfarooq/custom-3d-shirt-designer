import { create } from "zustand";

interface DecalPosition {
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
}

interface ClothingState {
  // State properties
  color: string;
  decalImage: string | null;
  localImage: string | null;
  decalAspect: number | null;
  decalPosition: DecalPosition | null;

  // Actions
  setColor: (color: string) => void;
  setDecalImage: (url: string) => void;
  setDecalAspect: (aspect: number) => void;
  setLocalImage: (url: string | null) => void;
  setDecalPosition: (decalPosition: DecalPosition | null) => void;
}

export const useClothingStore = create<ClothingState>((set) => ({
  // Initial state
  color: "#F3F4F6", // Default color (White)
  decalImage: null,
  localImage: null,
  decalAspect: null,
  decalPosition: null,

  // Actions to update state
  setColor: (color: string) => set({ color }),
  setDecalImage: (decalImage) => set({ decalImage }),
  setLocalImage: (localImage) => set({ localImage }),
  setDecalAspect: (decalAspect) => set({ decalAspect }),
  setDecalPosition: (decalPosition: DecalPosition | null) => set({ decalPosition }),
}));
