import { create } from "zustand";
import type { Texture, Vector3 } from "three";

// Combined interface for decal properties
interface Decal {
  image: string;
  aspect: number;
  scale: number;
  texture: Texture | null;
  position: [number, number, number] | null;
  rotation: [number, number, number];
}

// New interface for interaction state
type InteractionMode = "idle" | "placing" | "dragging";

interface InteractionState {
  mode: InteractionMode;
  dragOffset: Vector3 | null;
}

interface ClothingState {
  // State properties
  color: string;
  decal: Decal | null;
  interaction: InteractionState;

  // Actions
  setColor: (color: string) => void;
  setDecalImage: (url: string, aspect: number) => void;
  placeDecal: (position: [number, number, number] | null) => void;
  updateDecalPosition: (position: [number, number, number]) => void;
  setDecalScale: (scale: number) => void;
  resetDecal: () => void;
  setTexture: (texture: Texture) => void;
  setInteractionMode: (mode: InteractionMode, offset?: Vector3 | null) => void;
}

export const useClothingStore = create<ClothingState>((set) => ({
  // Initial state
  color: "#F3F4F6", // Default color (White)
  decal: null,
  interaction: {
    mode: "idle",
    dragOffset: null,
  },

  // Actions to update state
  setColor: (color) => set({ color }),

  setDecalImage: (image, aspect) =>
    set({
      decal: {
        image,
        aspect,
        scale: 10, // Default scale
        texture: null,
        position: null,
        rotation: [Math.PI / 2, 0, 0],
      },
      interaction: {
        mode: "placing",
        dragOffset: null,
      },
    }),

  placeDecal: (position) =>
    set((state) => ({
      decal: state.decal
        ? {
            ...state.decal,
            position,
          }
        : null,
      interaction: {
        mode: "idle",
        dragOffset: null,
      },
    })),

  updateDecalPosition: (position) =>
    set((state) => ({
      decal: state.decal
        ? {
            ...state.decal,
            position,
          }
        : null,
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
      interaction: {
        mode: "idle",
        dragOffset: null,
      },
    }),

  setTexture: (texture) =>
    set((state) => ({
      decal: state.decal
        ? {
            ...state.decal,
            texture,
          }
        : null,
    })),

  setInteractionMode: (mode, offset = null) =>
    set(() => ({
      interaction: {
        mode,
        dragOffset: offset,
      },
    })),
}));
