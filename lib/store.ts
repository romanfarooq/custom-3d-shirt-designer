import { create } from "zustand";
import { type Texture, Euler, Vector3, Quaternion } from "three";

export interface DecalItem {
  id: string;
  image: string | null;
  aspect: number | null;
  texture: Texture | null;
  scale: Vector3;
  rotation: Euler;
  position: Vector3 | null;
  type: "image" | "text";
  text: string | null;
  fontFamily: string | null;
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
  cursor: string;
}

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
  activeControlPoint: ControlPointName | null;
  controlPoints: {
    position: Vector3;
    type: ControlPointName;
    cursor: string;
  }[];
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
  addImageDecal: (url: string, aspect: number) => void;
  addTextDecal: (text: string, fontFamily: string) => void;
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
      controlPoint?:
        | { position: Vector3; type: ControlPointName; cursor: string }[]
        | null;
      activeControlPoint?: ControlPointName | null;
    },
  ) => void;
  updateControlPoints: (
    points: { position: Vector3; type: ControlPointName; cursor: string }[],
  ) => void;
  updateDecalScale: (newScale: Vector3) => void;
  updateDecalRotation: (newRotation: Euler) => void;
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Base control points for decal manipulation
const BASE_CONTROL_POINTS: {
  position: Vector3;
  type: ControlPointName;
  cursor: string;
}[] = [
  { position: new Vector3(-0.5, -0.5, 0), type: "tl", cursor: "nwse-resize" },
  { position: new Vector3(0.5, -0.5, 0), type: "tr", cursor: "nesw-resize" },
  { position: new Vector3(-0.5, 0.5, 0), type: "bl", cursor: "nesw-resize" },
  { position: new Vector3(0.5, 0.5, 0), type: "br", cursor: "nwse-resize" },
  { position: new Vector3(0, -0.5, 0), type: "t", cursor: "ns-resize" },
  { position: new Vector3(0.5, 0, 0), type: "r", cursor: "ew-resize" },
  { position: new Vector3(0, 0.5, 0), type: "b", cursor: "ns-resize" },
  { position: new Vector3(-0.5, 0, 0), type: "l", cursor: "ew-resize" },
  { position: new Vector3(0, -0.7, 0), type: "rot", cursor: "grab" },
];

// Helper function to calculate control points
const calculateControlPoints = (
  scale: Vector3,
  position: Vector3,
  rotation: Euler,
) => {
  const quaternion = new Quaternion().setFromEuler(rotation);

  return BASE_CONTROL_POINTS.map((point) => {
    // Clone the base position to avoid mutating the original
    const basePosition = point.position.clone();

    // Scale the position
    const scaledPosition = new Vector3(
      basePosition.x * scale.x,
      basePosition.y * scale.y,
      0,
    );

    // Apply rotation
    scaledPosition.applyQuaternion(quaternion);

    // Add to decal position
    const finalPosition = position.clone().add(scaledPosition);

    return {
      position: finalPosition,
      type: point.type,
      cursor: point.cursor,
    };
  });
};

export const useClothingStore = create<ClothingState>((set) => ({
  // Initial state
  color: "#F3F4F6", // Default color (White)
  decals: [],
  interaction: {
    mode: "idle",
    dragOffset: null,
    activeDecalId: null,
    activeControlPoint: null,
    controlPoints: [],
    startScale: null,
    startRotation: null,
    startPointerPosition: null,
  },

  // Actions to update state
  setColor: (color) => set({ color }),

  addImageDecal: (image, aspect) => {
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
          type: "image",
          text: null,
          fontFamily: null,
        },
      ],
      interaction: {
        mode: "placing",
        dragOffset: null,
        activeDecalId: newId,
        activeControlPoint: null,
        controlPoints: [],
        startScale: null,
        startRotation: null,
        startPointerPosition: null,
      },
    }));
  },

  addTextDecal: (text, fontFamily) => {
    const newId = generateId();
    set((state) => ({
      decals: [
        ...state.decals,
        {
          id: newId,
          image: null,
          aspect: null,
          texture: null,
          position: null,
          scale: new Vector3(5, 5, 20),
          rotation: new Euler(Math.PI / 2, 0, 0),
          type: "text",
          text,
          fontFamily,
        },
      ],
      interaction: {
        mode: "placing",
        dragOffset: null,
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

      // Find the active decal to get its current properties
      const activeDecal = state.decals.find((d) => d.id === activeDecalId);
      if (!activeDecal) return state;

      // Calculate new control points immediately using the helper function
      const newControlPoints = calculateControlPoints(
        activeDecal.scale,
        position,
        activeDecal.rotation,
      );

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecalId ? { ...decal, position } : decal,
        ),
        interaction: {
          ...state.interaction,
          controlPoints: newControlPoints,
        },
      };
    }),

  // New action to update decal scale
  updateDecalScale: (newScale) =>
    set((state) => {
      const { activeDecalId } = state.interaction;
      if (!activeDecalId) return state;

      // Find the active decal to get its current properties
      const activeDecal = state.decals.find((d) => d.id === activeDecalId);
      if (!activeDecal?.position) return state;

      // Calculate new control points immediately using the helper function
      const newControlPoints = calculateControlPoints(
        newScale,
        activeDecal.position,
        activeDecal.rotation,
      );

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecalId ? { ...decal, scale: newScale } : decal,
        ),
        interaction: {
          ...state.interaction,
          controlPoints: newControlPoints,
        },
      };
    }),

  // New action to update decal rotation
  updateDecalRotation: (newRotation) =>
    set((state) => {
      const { activeDecalId } = state.interaction;
      if (!activeDecalId) return state;

      // Find the active decal to get its current properties
      const activeDecal = state.decals.find((d) => d.id === activeDecalId);
      if (!activeDecal?.position) return state;

      // Calculate new control points immediately using the helper function
      const newControlPoints = calculateControlPoints(
        activeDecal.scale,
        activeDecal.position,
        newRotation,
      );

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecalId
            ? { ...decal, rotation: newRotation }
            : decal,
        ),
        interaction: {
          ...state.interaction,
          controlPoints: newControlPoints,
        },
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
        dragOffset: options.offset ?? state.interaction.dragOffset,
        startScale: options.startScale ?? state.interaction.startScale,
        controlPoints: options.controlPoint ?? state.interaction.controlPoints,
        startRotation: options.startRotation ?? state.interaction.startRotation,
        activeControlPoint:
          options.activeControlPoint ?? state.interaction.activeControlPoint,
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
