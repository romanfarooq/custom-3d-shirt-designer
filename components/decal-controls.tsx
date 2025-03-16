"use client";

import { Vector3 } from "three";
import { Decal } from "@react-three/drei";
import { type ThreeEvent } from "@react-three/fiber";
import { type ControlPointName, useClothingStore } from "@/lib/store";

export function DecalControls({ visible }: { visible: boolean }) {
  const { decals, interaction, setInteractionMode } = useClothingStore();

  const activeDecalId = interaction.activeDecalId;
  const controlPoints = interaction.controlPoints;
  const activeControlPoint = interaction.activeControlPoint;

  const activeDecal = activeDecalId
    ? decals.find((d) => d.id === activeDecalId)
    : null;

  if (!visible || controlPoints.length === 0 || !activeDecal) return null;

  const handlePointerDown = (
    event: ThreeEvent<PointerEvent>,
    controlPoint: ControlPointName,
  ) => {
    event.stopPropagation();

    // Store initial values for the transformation
    const startScale = activeDecal.scale.clone();
    const startRotation = activeDecal.rotation.clone();
    const startPointerPosition = event.point.clone();

    // Set the interaction mode based on the control point type
    if (controlPoint === "rot") {
      setInteractionMode("rotating", {
        controlPoint,
        startRotation,
        startPointerPosition,
      });
    } else {
      setInteractionMode("resizing", {
        controlPoint,
        startScale,
        startPointerPosition,
      });
    }
  };

  return (
    <>
      {controlPoints.map((point) => (
        <Decal
          key={point.type}
          rotation={[Math.PI / 2, 0, 0]}
          scale={new Vector3(1, 1, 20)}
          position={point.position}
          onPointerDown={(e) => handlePointerDown(e, point.type)}
        >
          <meshBasicMaterial
            color={
              point.type === "rot"
                ? "green"
                : activeControlPoint === point.type
                  ? "yellow"
                  : "blue"
            }
            transparent
            polygonOffset
            polygonOffsetFactor={-2}
            opacity={activeControlPoint === point.type ? 0.8 : 0.5}
          />
        </Decal>
      ))}
    </>
  );
}
