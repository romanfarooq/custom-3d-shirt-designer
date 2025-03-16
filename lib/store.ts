import { create } from "zustand";
import { type Texture, Euler, Vector3 } from "three";

// Combined interface for decal properties
export interface DecalItem {
  id: string;
  image: string;
  aspect: number;
  texture: Texture | null;
  scale: Vector3;
  rotation: Euler;
  position: Vector3 | null;
}

// New interface for interaction state
export type InteractionMode =
  | "idle"
  | "placing"
  | "dragging"
  | "resizing"
  | "rotating";

export interface InteractionState {
  mode: InteractionMode;
  dragOffset: Vector3 | null;
  activeDecalId: string | null;
}

export interface ClothingState {
  // State properties
  color: string;
  decals: DecalItem[];
  interaction: InteractionState;

  // Actions
  setColor: (color: string) => void;
  addDecal: (url: string, aspect: number) => void;
  placeDecal: (position: Vector3 | null) => void;
  updateDecalPosition: (position: Vector3) => void;
  removeDecal: (id: string) => void;
  setActiveDecal: (id: string | null) => void;
  setTexture: (id: string, texture: Texture) => void;
  setInteractionMode: (
    mode: InteractionMode,
    options?: {
      offset?: Vector3 | null;
    },
  ) => void;
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

export const useClothingStore = create<ClothingState>((set) => ({
  // Initial state
  color: "#F3F4F6", // Default color (White)
  decals: [],
  interaction: {
    mode: "idle",
    dragOffset: null,
    activeDecalId: null,
  },

  // Actions to update state
  setColor: (color) => set({ color }),

  addDecal: (image, aspect) => {
    const newId = generateId();
    set((state) => ({
      decals: [
        ...state.decals,
        {
          id: newId,
          image,
          aspect,
          texture: null,
          position: null,
          scale: new Vector3(10 * aspect, 10, 20),
          rotation: new Euler(Math.PI / 2, 0, 0),
        },
      ],
      interaction: {
        mode: "placing",
        dragOffset: null,
        activeDecalId: newId,
      },
    }));
  },

  placeDecal: (position) =>
    set((state) => {
      const { activeDecalId } = state.interaction;
      if (!activeDecalId) return state;

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecalId ? { ...decal, position } : decal,
        ),
        interaction: {
          ...state.interaction,
          mode: "idle",
        },
      };
    }),

  updateDecalPosition: (position) =>
    set((state) => {
      const { activeDecalId } = state.interaction;
      if (!activeDecalId) return state;

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecalId ? { ...decal, position } : decal,
        ),
      };
    }),

  removeDecal: (id) =>
    set((state) => {
      // If removing the active decal, clear the active decal
      const newInteraction =
        state.interaction.activeDecalId === id
          ? { ...state.interaction, activeDecalId: null }
          : state.interaction;

      return {
        decals: state.decals.filter((decal) => decal.id !== id),
        interaction: newInteraction,
      };
    }),

  setActiveDecal: (id) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        activeDecalId: id,
        mode: "idle",
      },
    })),

  setTexture: (id, texture) =>
    set((state) => ({
      decals: state.decals.map((decal) =>
        decal.id === id ? { ...decal, texture } : decal,
      ),
    })),

  setInteractionMode: (mode, options = {}) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        mode,
        dragOffset: options.offset ?? state.interaction.dragOffset,
      },
    })),
}));
