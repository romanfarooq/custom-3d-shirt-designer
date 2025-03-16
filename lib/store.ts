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

export type InteractionMode =
  | "idle"
  | "placing"
  | "dragging"
  | "resizing"
  | "rotating";

export interface InteractionState {
  mode: InteractionMode;
  activeDecalId: string | null;
  activeControlPoint: ControlPointName | null;
  controlPoints: ControlPoint[];
  startScale: Vector3 | null;
  startRotation: Euler | null;
  startPointerPosition: Vector3 | null;
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
      startScale?: Vector3 | null;
      startRotation?: Euler | null;
      startPointerPosition?: Vector3 | null;
      controlPoint?: ControlPointName | null;
      activeControlPoint?: ControlPointName | null;
    },
  ) => void;
  updateControlPoints: (points: ControlPoint[]) => void;
  updateDecalScale: (newScale: Vector3) => void;
  updateDecalRotation: (newRotation: Euler) => void;
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

export const useClothingStore = create<ClothingState>((set) => ({
  // Initial state
  color: "#F3F4F6", // Default color (White)
  decals: [],
  interaction: {
    mode: "idle",
    activeDecalId: null,
    activeControlPoint: null,
    controlPoints: [],
    startScale: null,
    startRotation: null,
    startPointerPosition: null,
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
        activeDecalId: newId,
        activeControlPoint: null,
        controlPoints: [],
        startScale: null,
        startRotation: null,
        startPointerPosition: null,
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

  // New action to update decal scale
  updateDecalScale: (newScale) =>
    set((state) => {
      const { activeDecalId } = state.interaction;
      if (!activeDecalId) return state;

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecalId ? { ...decal, scale: newScale } : decal,
        ),
      };
    }),

  // New action to update decal rotation
  updateDecalRotation: (newRotation) =>
    set((state) => {
      const { activeDecalId } = state.interaction;
      if (!activeDecalId) return state;

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecalId
            ? { ...decal, rotation: newRotation }
            : decal,
        ),
      };
    }),

  removeDecal: (id) =>
    set((state) => {
      // If removing the active decal, clear the active decal
      const newInteraction =
        state.interaction.activeDecalId === id
          ? {
              ...state.interaction,
              activeDecalId: null,
              activeControlPoint: null,
              controlPoints: [],
              startScale: null,
              startRotation: null,
              startPointerPosition: null,
            }
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
        activeControlPoint: null,
        mode: "idle",
        controlPoints: [],
        startScale: null,
        startRotation: null,
        startPointerPosition: null,
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
        startScale: options.startScale ?? state.interaction.startScale,
        startRotation: options.startRotation ?? state.interaction.startRotation,
        activeControlPoint:
          options.controlPoint ?? state.interaction.activeControlPoint,
        startPointerPosition:
          options.startPointerPosition ??
          state.interaction.startPointerPosition,
      },
    })),

  updateControlPoints: (points) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        controlPoints: points,
      },
    })),
}));
