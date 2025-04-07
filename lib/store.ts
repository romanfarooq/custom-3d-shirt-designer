import { nanoid } from "nanoid";
import { create } from "zustand";
import { type Texture, Euler, Vector3, Quaternion, TextureLoader } from "three";

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
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  fontSize: number;
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
  activeDecal: DecalItem | null;
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
  color: string;
  decals: DecalItem[];
  interaction: InteractionState;

  setColor: (color: string) => void;
  addImageDecal: (image: string, aspect: number) => void;
  addTextDecal: (textProps: {
    text: string;
    fontFamily: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    fontSize?: number;
  }) => void;
  placeDecal: (position: Vector3 | null) => void;
  updateDecalPosition: (position: Vector3) => void;
  removeDecal: (id: string) => void;
  setActiveDecal: (activeDecal: DecalItem | null) => void;
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
  updateDecalScale: (newScale: Vector3) => void;
  updateDecalRotation: (newRotation: Euler) => void;
  updateTextDecal: (textProps: {
    text?: string;
    fontFamily?: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    fontSize?: number;
  }) => void;
}

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

const calculateControlPoints = (
  scale: Vector3,
  position: Vector3,
  rotation: Euler,
) => {
  const quaternion = new Quaternion().setFromEuler(rotation);

  return BASE_CONTROL_POINTS.map((point) => {
    const basePosition = point.position.clone();

    const scaledPosition = new Vector3(
      basePosition.x * scale.x,
      basePosition.y * scale.y,
      0,
    );

    scaledPosition.applyQuaternion(quaternion);

    const finalPosition = position.clone().add(scaledPosition);

    return {
      position: finalPosition,
      type: point.type,
      cursor: point.cursor,
    };
  });
};

export const useClothingStore = create<ClothingState>((set) => ({
  color: "#F3F4F6", // Default color (White)
  decals: [],
  interaction: {
    mode: "idle",
    dragOffset: null,
    activeDecal: null,
    activeControlPoint: null,
    controlPoints: [],
    startScale: null,
    startRotation: null,
    startPointerPosition: null,
  },

  setColor: (color) => set({ color }),

  addImageDecal: (image, aspect) => {
    const loader = new TextureLoader();
    loader.load(image, (texture) => {
      texture.needsUpdate = true;
      texture.flipY = false;

      set((state) => {
        const newDecal: DecalItem = {
          id: nanoid(),
          image,
          aspect,
          texture: texture,
          position: null,
          scale: new Vector3(10 * aspect, 10, 20),
          rotation: new Euler(Math.PI / 2, 0, 0),
          type: "image",
          text: null,
          fontFamily: null,
          isBold: false,
          isItalic: false,
          isUnderline: false,
          fontSize: 0,
        };

        return {
          decals: [...state.decals, newDecal],
          interaction: {
            mode: "placing",
            dragOffset: null,
            activeDecal: newDecal,
            activeControlPoint: null,
            controlPoints: [],
            startScale: null,
            startRotation: null,
            startPointerPosition: null,
          },
        };
      });
    });
  },

  placeDecal: (position) =>
    set((state) => {
      const { activeDecal } = state.interaction;
      if (!activeDecal) return state;

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecal.id ? { ...decal, position } : decal,
        ),
        interaction: {
          ...state.interaction,
          activeDecal: {
            ...activeDecal,
            position,
          },
          mode: "idle",
        },
      };
    }),

  updateDecalPosition: (position) =>
    set((state) => {
      const { activeDecal } = state.interaction;
      if (!activeDecal) return state;

      const newControlPoints = calculateControlPoints(
        activeDecal.scale,
        position,
        activeDecal.rotation,
      );

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecal.id ? { ...decal, position } : decal,
        ),
        interaction: {
          ...state.interaction,
          activeDecal: {
            ...activeDecal,
            position,
          },
          controlPoints: newControlPoints,
        },
      };
    }),

  updateDecalScale: (newScale) =>
    set((state) => {
      const { activeDecal } = state.interaction;
      if (!activeDecal?.position) return state;

      const newControlPoints = calculateControlPoints(
        newScale,
        activeDecal.position,
        activeDecal.rotation,
      );

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecal.id ? { ...decal, scale: newScale } : decal,
        ),
        interaction: {
          ...state.interaction,
          activeDecal: {
            ...activeDecal,
            scale: newScale,
          },
          controlPoints: newControlPoints,
        },
      };
    }),

  updateDecalRotation: (newRotation) =>
    set((state) => {
      const { activeDecal } = state.interaction;
      if (!activeDecal?.position) return state;

      const newControlPoints = calculateControlPoints(
        activeDecal.scale,
        activeDecal.position,
        newRotation,
      );

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecal.id
            ? { ...decal, rotation: newRotation }
            : decal,
        ),
        interaction: {
          ...state.interaction,
          activeDecal: {
            ...activeDecal,
            rotation: newRotation,
          },
          controlPoints: newControlPoints,
        },
      };
    }),

  removeDecal: (id) =>
    set((state) => {
      const newInteraction =
        state.interaction.activeDecal?.id === id
          ? {
              ...state.interaction,
              activeDecal: null,
              activeControlPoint: null,
              controlPoints: [],
              startScale: null,
              startRotation: null,
              startPointerPosition: null,
            }
          : state.interaction;

      return {
        decals: state.decals.filter((decal) => {
          if (decal.id === id) {
            if (decal.type === "image" && decal.image) {
              URL.revokeObjectURL(decal.image);
            }
            if (decal.texture) {
              decal.texture.dispose();
            }
            return false;
          }
          return true;
        }),
        interaction: newInteraction,
      };
    }),

  setActiveDecal: (activeDecal) =>
    set((state) => {
      return {
        interaction: {
          ...state.interaction,
          activeDecal,
          activeControlPoint: null,
          mode: "idle",
          controlPoints: [],
          startScale: null,
          startRotation: null,
          startPointerPosition: null,
        },
      };
    }),

  setTexture: (id, texture) =>
    set((state) => ({
      decals: state.decals.map((decal) =>
        decal.id === id ? { ...decal, texture } : decal,
      ),
      interaction:
        state.interaction.activeDecal?.id === id
          ? {
              ...state.interaction,
              activeDecal: {
                ...state.interaction.activeDecal,
                texture,
              },
            }
          : state.interaction,
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

  addTextDecal: (textProps) =>
    set((state) => {
      const newDecal: DecalItem = {
        id: nanoid(),
        image: null,
        aspect: null,
        texture: null,
        position: null,
        scale: new Vector3(10, 10, 20),
        rotation: new Euler(Math.PI / 2, 0, 0),
        type: "text",
        text: textProps.text ?? null,
        fontFamily: textProps.fontFamily ?? null,
        isBold: textProps.isBold ?? false,
        isItalic: textProps.isItalic ?? false,
        isUnderline: textProps.isUnderline ?? false,
        fontSize: textProps.fontSize ?? 0,
      };

      return {
        decals: [...state.decals, newDecal],
        interaction: {
          mode: "placing",
          dragOffset: null,
          activeDecal: newDecal,
          activeControlPoint: null,
          controlPoints: [],
          startScale: null,
          startRotation: null,
          startPointerPosition: null,
        },
      };
    }),

  updateTextDecal: (textProps) => {
    set((state) => {
      const { activeDecal } = state.interaction;
      if (!activeDecal) return state;

      return {
        decals: state.decals.map((decal) =>
          decal.id === activeDecal.id
            ? {
                ...decal,
                text: textProps.text ?? decal.text,
                fontFamily: textProps.fontFamily ?? decal.fontFamily,
                isBold: textProps.isBold ?? decal.isBold,
                isItalic: textProps.isItalic ?? decal.isItalic,
                isUnderline: textProps.isUnderline ?? decal.isUnderline,
                fontSize: textProps.fontSize ?? decal.fontSize,
              }
            : decal,
        ),
        interaction: {
          ...state.interaction,
          activeDecal: {
            ...activeDecal,
            text: textProps.text ?? activeDecal.text,
            fontFamily: textProps.fontFamily ?? activeDecal.fontFamily,
            isBold: textProps.isBold ?? activeDecal.isBold,
            isItalic: textProps.isItalic ?? activeDecal.isItalic,
            isUnderline: textProps.isUnderline ?? activeDecal.isUnderline,
            fontSize: textProps.fontSize ?? activeDecal.fontSize,
          },
        },
      };
    });
  },
}));
