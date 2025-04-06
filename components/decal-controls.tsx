"use client";

import { Decal } from "@react-three/drei";
import { type ThreeEvent } from "@react-three/fiber";
import { type ControlPointName, useClothingStore } from "@/lib/store";

export function DecalControls({ visible }: { visible: boolean }) {
  const {
    setInteractionMode,
    interaction: { activeDecal, controlPoints },
  } = useClothingStore();

  if (!visible || controlPoints.length === 0 || !activeDecal) return null;

  const handlePointerDown = (
    event: ThreeEvent<PointerEvent>,
    activeControlPoint: ControlPointName,
  ) => {
    event.stopPropagation();

    // Store initial values for the transformation
    const startScale = activeDecal.scale.clone();
    const startRotation = activeDecal.rotation.clone();
    const startPointerPosition = event.point.clone();

    // Set the interaction mode based on the control point type
    if (activeControlPoint === "rot") {
      setInteractionMode("rotating", {
        startRotation,
        activeControlPoint,
        startPointerPosition,
      });
    } else {
      setInteractionMode("resizing", {
        startScale,
        activeControlPoint,
        startPointerPosition,
      });
    }
  };

  return (
    <>
      {controlPoints.map((point) => (
        <Decal
          key={point.type}
          scale={[1, 1, 20]}
          position={point.position}
          rotation={activeDecal.rotation}
          onPointerDown={(e) => handlePointerDown(e, point.type)}
          onPointerOver={() => {
            document.body.style.cursor = point.cursor;
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <meshBasicMaterial
            color="gray"
            transparent
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </Decal>
      ))}
    </>
  );
}
