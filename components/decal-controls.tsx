"use client";

import { Vector3 } from "three";
import { Decal } from "@react-three/drei";
import { useClothingStore } from "@/lib/store";

export function DecalControls({ visible }: { visible: boolean }) {
  const { controlPoints } = useClothingStore((state) => state.interaction);

  if (!visible || controlPoints.length === 0) return null;

  return (
    <>
      {controlPoints.map((point) => (
        <Decal
          key={point.type}
          rotation={[Math.PI / 2, 0, 0]} // Fixed rotation for control points
          scale={new Vector3(0.5, 0.5, 20)}
          position={point.position}
        >
          <meshBasicMaterial
            // Use different colors based on the point type
            color={point.type === "rot" ? "green" : "blue"}
            transparent
            polygonOffset
            polygonOffsetFactor={-2}
            opacity={0.5}
          />
        </Decal>
      ))}
    </>
  );
}
