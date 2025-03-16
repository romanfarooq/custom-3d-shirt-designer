"use client";

import { Decal } from "@react-three/drei";
import { type Euler, Vector3, Quaternion } from "three";

interface DecalControlsProps {
  scale: Vector3;
  rotation: Euler;
  position: Vector3;
}

// Pre-define control points to avoid recreating them on each render
const CONTROL_POINTS = [
  new Vector3(-0.5, -0.5, 0), // Top-left
  new Vector3(0.5, -0.5, 0), // Top-right
  new Vector3(-0.5, 0.5, 0), // Bottom-left
  new Vector3(0.5, 0.5, 0), // Bottom-right
  new Vector3(0, -0.5, 0), // Top (midpoint)
  new Vector3(0, 0.5, 0), // Bottom (midpoint)
  new Vector3(-0.5, 0, 0), // Left (midpoint)
  new Vector3(0.5, 0, 0), // Right (midpoint)
  new Vector3(0, -0.7, 0), // Rotation handle
];

export function DecalControls({
  scale,
  rotation,
  position,
}: DecalControlsProps) {
  const quaternion = new Quaternion().setFromEuler(rotation);
  return (
    <>
      {CONTROL_POINTS.map((baseOffset, index) => {
        // Clone the offset to avoid mutating the original
        const offset = baseOffset.clone();

        // Scale the offset
        const scaledOffset = new Vector3(
          offset.x * scale.x,
          offset.y * scale.y,
          0,
        );

        // Apply rotation
        scaledOffset.applyQuaternion(quaternion);

        // Add to position
        const finalPosition = position.clone().add(scaledOffset);

        return (
          <Decal
            key={index}
            rotation={rotation}
            position={finalPosition}
            scale={new Vector3(0.5, 0.5, 20)}
          >
            <meshBasicMaterial
              color="blue"
              transparent
              polygonOffset
              polygonOffsetFactor={-2}
              opacity={0.5}
            />
          </Decal>
        );
      })}
    </>
  );
}
