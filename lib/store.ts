import { create } from "zustand";
import { type Texture, Euler, Vector3 } from "three";

export interface DecalItem {
  id: string;
  image: string;
  aspect: number;
  texture: Texture | null;
  scale: Vector3;
  rotation: Euler;
  position: Vector3 | null;
}

export type ControlPointName =
  | "tl" // Top Left
  | "tr" // Top Right
  | "bl" // Bottom Left
  | "br" // Bottom Right
  | "t" // Top
  | "r" // Right
  | "b" // Bottom
  | "l" // Left
  | "rot"; // Rotation handle

export interface ControlPoint {
  position: Vector3;
  type: ControlPointName;
}

export type InteractionMode = "idle" | "placing" | "dragging";

export interface InteractionState {
  mode: InteractionMode;
  dragOffset: Vector3 | null;
  activeDecalId: string | null;
  controlPoints: ControlPoint[];
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
  updateControlPoints: (points: ControlPoint[]) => void;
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
    controlPoints: [],
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
        controlPoints: [],
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
          ? { ...state.interaction, activeDecalId: null, controlPoints: [] }
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
        controlPoints: [],
      },
    })),

  setTexture: (id, texture) =>
    set((state) => ({
      decals: state.decals.map((decal) =>
        decal.id === id ? { ...decal, texture } : decal,
      ),
    })),

  updateControlPoints: (points) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        controlPoints: points,
      },
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
