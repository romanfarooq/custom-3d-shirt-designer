import { create } from "zustand";
import type { Texture, Vector3 } from "three";

// Combined interface for decal properties
export interface DecalItem {
  id: string;
  image: string;
  aspect: number;
  texture: Texture | null;
  scale: [number, number, number];
  position: [number, number, number] | null;
  rotation: [number, number, number];
}

// New interface for interaction state
export type InteractionMode =
  | "idle"
  | "placing"
  | "dragging"
  | "resizing"
  | "rotating";

// Type for resize handle positions
export type ResizeHandle =
  | "tl" // Top Left
  | "tr" // Top Right
  | "bl" // Bottom Left
  | "br" // Bottom Right
  | "t" // Top
  | "r" // Right
  | "b" // Bottom
  | "l"; // Left

export interface InteractionState {
  mode: InteractionMode;
  dragOffset: Vector3 | null;
  activeDecalId: string | null;
  resizeHandle: ResizeHandle | null;
  initialScale: { x: number; y: number } | null;
  initialPointer: { x: number; y: number } | null;
  initialRotation: [number, number, number] | null;
}

export interface ClothingState {
  // State properties
  color: string;
  decals: DecalItem[];
  interaction: InteractionState;

  // Actions
  setColor: (color: string) => void;
  addDecal: (url: string, aspect: number) => void;
  placeDecal: (position: [number, number, number] | null) => void;
  updateDecalPosition: (position: [number, number, number]) => void;
  updateDecalScale: (scaleX: number, scaleY: number) => void;
  updateDecalRotation: (rotation: [number, number, number]) => void;
  removeDecal: (id: string) => void;
  setActiveDecal: (id: string | null) => void;
  setTexture: (id: string, texture: Texture) => void;
  setInteractionMode: (
    mode: InteractionMode,
    options?: {
      offset?: Vector3 | null;
      resizeHandle?: ResizeHandle | null;
      initialScale?: { x: number; y: number } | null;
      initialRotation?: [number, number, number] | null;
      initialPointer?: { x: number; y: number } | null;
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
    resizeHandle: null,
    initialScale: null,
    initialRotation: null,
    initialPointer: null,
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
          scale: [10 * aspect, 10, 10],
          rotation: [Math.PI / 2, 0, 0],
        },
      ],
      interaction: {
        mode: "placing",
        dragOffset: null,
        activeDecalId: newId,
        resizeHandle: null,
        initialScale: null,
        initialRotation: null,
        initialPointer: null,
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

  updateDecalScale: (scaleX, scaleY) =>
    set((state) => {
      const { activeDecalId } = state.interaction;
      if (!activeDecalId) return state;

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecalId
            ? {
                ...decal,
                scaleX,
                scaleY,
              }
            : decal,
        ),
      };
    }),

  updateDecalRotation: (rotation) =>
    set((state) => {
      const { activeDecalId } = state.interaction;
      if (!activeDecalId) return state;

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecalId ? { ...decal, rotation } : decal,
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
        resizeHandle: null,
        initialScale: null,
        initialRotation: null,
        initialPointer: null,
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
        resizeHandle: options.resizeHandle ?? state.interaction.resizeHandle,
        initialScale: options.initialScale ?? state.interaction.initialScale,
        initialRotation:
          options.initialRotation ?? state.interaction.initialRotation,
        initialPointer:
          options.initialPointer ?? state.interaction.initialPointer,
      },
    })),
}));
