import { create } from "zustand";
import {
  type Texture,
  Euler,
  Vector3,
  Quaternion,
  CanvasTexture,
  TextureLoader,
} from "three";

export interface DecalItem {
  id: string;
  image: string | null;
  aspect: number | null;
  texture: Texture | CanvasTexture | null;
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
  // State properties
  color: string;
  decals: DecalItem[];
  interaction: InteractionState;

  // Actions
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
  setTexture: (id: string, texture: Texture | CanvasTexture) => void;
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
    activeDecal: null,
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

    // Create texture immediately
    const loader = new TextureLoader();
    loader.load(image, (texture) => {
      texture.needsUpdate = true;
      texture.flipY = false;

      set((state) => {
        const newDecal: DecalItem = {
          id: newId,
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

  addTextDecal: (textProps) => {
    const newId = generateId();
    const {
      text,
      fontFamily,
      isBold = false,
      isItalic = false,
      isUnderline = false,
      fontSize = 24,
    } = textProps;

    // Calculate appropriate scale based on text length
    // Use a 2:1 aspect ratio to match canvas dimensions (512x256)
    // This ensures text decal matches the canvas height and width proportions
    const baseWidth = 10; // Base width for short text
    const baseHeight = 5; // Base height (half of width for 2:1 ratio)

    // Adjust width based on text length for longer text
    // Longer text will have more width to accommodate wrapping
    const textLength = text.length;
    const widthFactor = Math.min(Math.max(1, textLength / 10), 2); // Cap at 2x width

    // Create texture immediately
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Set canvas dimensions - maintain 2:1 aspect ratio
      canvas.width = 512;
      canvas.height = 256;

      // Get font family or fallback to Arial
      const fontFamilyToUse = fontFamily || "Arial";

      // Use specified font size or default to max font size for auto-sizing
      const maxFontSize = 100;
      let fontSizeToUse = fontSize ?? maxFontSize;
      const textToUse = text || "";

      // Clear canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create font style string
      const fontWeight = isBold ? "bold" : "normal";
      const fontStyle = isItalic ? "italic" : "normal";

      // Start with specified font
      ctx.font = `${fontStyle} ${fontWeight} ${fontSizeToUse}px ${fontFamilyToUse}`;

      // Calculate maximum width and height for text area (90% of canvas)
      const maxWidth = canvas.width * 0.9;
      const maxHeight = canvas.height * 0.8;

      // Function to wrap text and check if it fits
      const wrapText = (text: string, fontSize: number) => {
        // Apply font styling consistently
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamilyToUse}`;
        const words = text.split(" ");
        const lines = [];
        let currentLine = words[0] || "";

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = ctx.measureText(currentLine + " " + word).width;

          if (width < maxWidth) {
            currentLine += " " + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);

        // Check if text height fits within maxHeight
        const lineHeight = fontSize * 1.2; // Add some line spacing
        const totalHeight = lineHeight * lines.length;

        return {
          lines,
          totalHeight,
          lineHeight,
          fits: totalHeight <= maxHeight,
        };
      };

      // Reduce font size until text fits both width and height constraints
      let textInfo = wrapText(textToUse, fontSizeToUse);
      while (!textInfo.fits && fontSizeToUse > 20) {
        fontSizeToUse -= 5;
        textInfo = wrapText(textToUse, fontSizeToUse);
      }

      // Set final font and draw wrapped text
      ctx.fillStyle = "black";
      ctx.font = `${fontStyle} ${fontWeight} ${fontSizeToUse}px ${fontFamilyToUse}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Calculate starting Y position to center all lines vertically
      const startY =
        (canvas.height - textInfo.totalHeight) / 2 + textInfo.lineHeight / 2;

      // Draw each line of text
      textInfo.lines.forEach((line, index) => {
        const y = startY + index * textInfo.lineHeight;
        ctx.fillText(line, canvas.width / 2, y);

        // Add underline if enabled
        if (isUnderline) {
          const textWidth = ctx.measureText(line).width;
          const underlineY = y + fontSizeToUse * 0.1; // Position slightly below text
          const lineStartX = (canvas.width - textWidth) / 2;

          ctx.beginPath();
          ctx.moveTo(lineStartX, underlineY);
          ctx.lineTo(lineStartX + textWidth, underlineY);
          ctx.lineWidth = Math.max(1, fontSizeToUse * 0.05); // Scale underline with font size
          ctx.stroke();
        }
      });

      const texture = new CanvasTexture(canvas);
      texture.needsUpdate = true;
      texture.flipY = false;

      set((state) => {
        const newDecal: DecalItem = {
          id: newId,
          image: null,
          aspect: 2, // Setting aspect to match canvas ratio (width:height = 2:1)
          texture: texture,
          position: null,
          scale: new Vector3(baseWidth * widthFactor, baseHeight, 20),
          rotation: new Euler(Math.PI / 2, 0, 0),
          type: "text",
          text,
          fontFamily,
          isBold,
          isItalic,
          isUnderline,
          fontSize,
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
    } else {
      // Fallback if canvas context is not available
      set((state) => {
        return {
          decals: [...state.decals],
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
        };
      });
    }
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

      // Calculate new control points immediately using the helper function
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

  // New action to update decal scale
  updateDecalScale: (newScale) =>
    set((state) => {
      const { activeDecal } = state.interaction;
      if (!activeDecal?.position) return state;

      // Calculate new control points immediately using the helper function
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

  // New action to update decal rotation
  updateDecalRotation: (newRotation) =>
    set((state) => {
      const { activeDecal } = state.interaction;
      if (!activeDecal?.position) return state;

      // Calculate new control points immediately using the helper function
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
      // If removing the active decal, clear the active decal
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
        decals: state.decals.filter((decal) => decal.id !== id),
        interaction: newInteraction,
      };
    }),

  setActiveDecal: (activeDecal: DecalItem | null) =>
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

  // Update text textProps properties
  updateTextDecal: (textProps) =>
    set((state) => {
      // Find the decal to update
      const decalToUpdate = state.decals.find(
        (decal) => decal.id === state.interaction.activeDecal?.id,
      );
      if (!decalToUpdate || decalToUpdate.type !== "text") return state;

      // Create updated decal with new textProps
      const updatedDecal = {
        ...decalToUpdate,
        text:
          textProps.text !== undefined ? textProps.text : decalToUpdate.text,
        fontFamily:
          textProps.fontFamily !== undefined
            ? textProps.fontFamily
            : decalToUpdate.fontFamily,
        isBold:
          textProps.isBold !== undefined
            ? textProps.isBold
            : decalToUpdate.isBold,
        isItalic:
          textProps.isItalic !== undefined
            ? textProps.isItalic
            : decalToUpdate.isItalic,
        isUnderline:
          textProps.isUnderline !== undefined
            ? textProps.isUnderline
            : decalToUpdate.isUnderline,
        fontSize:
          textProps.fontSize !== undefined
            ? textProps.fontSize
            : decalToUpdate.fontSize,
      };

      // Update the decals array
      return {
        decals: state.decals.map((decal) =>
          decal.id === state.interaction.activeDecal?.id ? updatedDecal : decal,
        ),
        // Update active decal if it's the one being modified
        interaction: {
          ...state.interaction,
          activeDecal: updatedDecal,
        },
      };
    }),
}));
