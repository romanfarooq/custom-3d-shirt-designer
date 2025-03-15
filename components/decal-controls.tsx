"use clinet";

import { Decal } from "@react-three/drei";
import { Vector3, Euler, Quaternion } from "three";

interface DecalControlsProps {
  scale: Vector3;
  rotation: Euler;
  position: Vector3;
}

const controlPoints = [
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
  return (
    <>
      {controlPoints.map((offset, index) => {
        const scaledOffset = new Vector3(
          offset.x * scale.x,
          offset.y * scale.y,
          0,
        );

        // Apply rotation
        const quaternion = new Quaternion().setFromEuler(rotation);
        scaledOffset.applyQuaternion(quaternion);

        return (
          <Decal
            key={index}
            rotation={rotation}
            scale={new Vector3(0.5, 0.5, 10)}
            position={position.clone().add(scaledOffset)}
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
