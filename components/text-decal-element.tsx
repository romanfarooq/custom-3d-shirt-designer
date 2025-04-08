import { useState } from "react";
import { Text } from "@react-three/drei";
import type { DecalItem } from "@/lib/store";

export function TextDecalElement({ decal }: { decal: DecalItem }) {
  const [underline, setUnderline] = useState<{
    y: number;
    width: number;
    thickness: number;
  } | null>(null);

  const baseThickness = decal.fontSize * (decal.isBold ? 0.15 : 0.08);

  return (
    <>
      <Text
        color="black"
        anchorX="center"
        anchorY="middle"
        outlineColor="white"
        outlineWidth={0.05}
        scale={[-1, 1, 1]}
        rotation={[0, 0, Math.PI]}
        fontSize={decal.fontSize}
        fontWeight={decal.isBold ? "bold" : "normal"}
        fontStyle={decal.isItalic ? "italic" : "normal"}
        onSync={(self) => {
          self.geometry.computeBoundingBox();
          const bbox = self.geometry.boundingBox;
          if (
            bbox &&
            Number.isFinite(bbox.min.x) &&
            Number.isFinite(bbox.max.x)
          ) {
            const textWidth = bbox.max.x - bbox.min.x;
            const underlineY = (bbox.max.y + baseThickness) * 0.8;
            setUnderline({
              y: underlineY,
              width: textWidth,
              thickness: baseThickness,
            });
          }
        }}
      >
        {decal.text}
      </Text>
      {decal.isUnderline && underline && (
        <mesh position={[0, underline.y, -0.01]}>
          <planeGeometry args={[underline.width, underline.thickness]} />
          <meshBasicMaterial color="black" />
        </mesh>
      )}
    </>
  );
}
