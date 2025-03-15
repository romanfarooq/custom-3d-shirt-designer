"use client";

import { Html } from "@react-three/drei";

export function DecalControls({
  scale,
  position,
  rotation,
}: {
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const halfWidth = scale[0] / 2;
  const halfHeight = scale[1] / 2;

  const points: { position: [number, number, number]; type: string }[] = [
    { position: [0, -halfHeight, 0], type: "top" },
    { position: [halfWidth, -halfHeight, 0], type: "topRight" },
    { position: [halfWidth, 0, 0], type: "right" },
    { position: [halfWidth, halfHeight, 0], type: "bottomRight" },
    { position: [0, halfHeight, 0], type: "bottom" },
    { position: [-halfWidth, halfHeight, 0], type: "bottomLeft" },
    { position: [-halfWidth, 0, 0], type: "left" },
    { position: [-halfWidth, -halfHeight, 0], type: "topLeft" },
    { position: [0, -halfHeight - 1, 0], type: "rotate" }, // Adjusted rotation handle
  ];

  return (
    <group position={position} rotation={rotation}>
      {points.map((point) => (
        <Html key={point.type} position={point.position}>
          <div className="size-1 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-gray-800 ring" />
        </Html>
      ))}
    </group>
  );
}
