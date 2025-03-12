import { create } from "zustand";

// Combined interface for decal properties
interface Decal {
  image: string;
  aspect: number;
  scale: number;
  position: [number, number, number] | null;
  rotation: [number, number, number];
}

interface ClothingState {
  // State properties
  color: string;
  decal: Decal | null;
  isPlacingDecal: boolean;

  // Actions
  setColor: (color: string) => void;
  setDecalImage: (url: string, aspect: number) => void;
  placeDecal: (position: [number, number, number] | null) => void;
  setDecalScale: (scale: number) => void;
  resetDecal: () => void;
  startPlacingDecal: () => void;
}

export const useClothingStore = create<ClothingState>((set) => ({
  // Initial state
  color: "#F3F4F6", // Default color (White)
  decal: null,
  isPlacingDecal: false,

  // Actions to update state
  setColor: (color) => set({ color }),

  setDecalImage: (image, aspect) =>
    set({
      decal: {
        image,
        aspect,
        scale: 10, // Default scale
        position: null,
        rotation: [Math.PI / 2, 0, Math.PI],
      },
      isPlacingDecal: true,
    }),

  placeDecal: (position) =>
    set((state) => ({
      decal: state.decal
        ? {
            ...state.decal,
            position,
          }
        : null,
      isPlacingDecal: false,
    })),

  setDecalScale: (scale) =>
    set((state) => ({
      decal: state.decal
        ? {
            ...state.decal,
            scale,
          }
        : null,
    })),

  resetDecal: () =>
    set({
      decal: null,
      isPlacingDecal: false,
    }),

  startPlacingDecal: () =>
    set((state) => ({
      isPlacingDecal: state.decal !== null,
    })),
}));
