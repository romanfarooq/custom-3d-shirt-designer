"use client";

import { Decal } from "@react-three/drei";
import { useShallow } from "zustand/shallow";
import { type ThreeEvent } from "@react-three/fiber";
import { type ControlPointName, useClothingStore } from "@/lib/store";

export function DecalControls({ visible }: { visible: boolean }) {
  const {
    controlPoints,
    setInteractionMode,
    activeDecalScale,
    activeDecalRotation,
  } = useClothingStore(
    useShallow((state) => ({
      controlPoints: state.interaction.controlPoints,
      setInteractionMode: state.setInteractionMode,
      activeDecalScale: state.interaction.activeDecal?.scale,
      activeDecalRotation: state.interaction.activeDecal?.rotation,
    })),
  );

  if (
    !visible ||
    !activeDecalScale ||
    !activeDecalRotation ||
    controlPoints.length === 0
  ) {
    return null;
  }

  function handlePointerDown(
    event: ThreeEvent<PointerEvent>,
    activeControlPoint: ControlPointName,
  ) {
    event.stopPropagation();

    const startScale = activeDecalScale?.clone();
    const startRotation = activeDecalRotation?.clone();
    const startPointerPosition = event.point.clone();

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
  }

  return (
    <>
      {controlPoints.map((point) => (
        <Decal
          key={point.type}
          scale={[1, 1, 20]}
          position={point.position}
          rotation={activeDecalRotation}
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
