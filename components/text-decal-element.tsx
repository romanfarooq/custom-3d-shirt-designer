import type { Mesh } from "three";
import type { DecalItem } from "@/lib/store";
import { useState } from "react";
import { Text } from "@react-three/drei";

export function TextDecalElement({ decal }: { decal: DecalItem }) {
  const [underline, setUnderline] = useState<{
    y: number;
    width: number;
    thickness: number;
  } | null>(null);

  function computeUnderline(self: Mesh) {
    self.geometry.computeBoundingBox();
    const bbox = self.geometry.boundingBox;
    if (bbox) {
      const baseThickness = decal.fontSize * (decal.isBold ? 0.15 : 0.08);
      const textWidth = bbox.max.x - bbox.min.x;
      const underlineY = (bbox.max.y + baseThickness) * 0.8;
      setUnderline({
        y: underlineY,
        width: textWidth,
        thickness: baseThickness,
      });
    }
  }

  return (
    <group scale={[1 / decal.scale.x, 1 / decal.scale.y, 1]}>
      <Text
        anchorX="center"
        anchorY="middle"
        scale={[-1, 1, 1]}
        rotation={[0, 0, Math.PI]}
        onSync={computeUnderline}
        color={decal.fontColor}
        fontSize={decal.fontSize}
        fontWeight={decal.isBold ? "bold" : "normal"}
        fontStyle={decal.isItalic ? "italic" : "normal"}
      >
        {decal.text}
      </Text>
      {decal.isUnderline && underline && (
        <mesh position={[0, underline.y, -0.01]}>
          <planeGeometry args={[underline.width, underline.thickness]} />
          <meshBasicMaterial color={decal.fontColor} />
        </mesh>
      )}
    </group>
  );
}
