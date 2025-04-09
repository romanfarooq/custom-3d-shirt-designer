import type { Mesh } from "three";
import type { DecalItem } from "@/lib/store";
import { useRef } from "react";
import { Text } from "@react-three/drei";

export function TextDecalElement({ decal }: { decal: DecalItem }) {
  const underlineRef = useRef<{
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
      underlineRef.current = {
        y: underlineY,
        width: textWidth,
        thickness: baseThickness,
      };
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
        font={decal.fontFamily}
        color={decal.fontColor}
        fontSize={decal.fontSize}
        fontWeight={decal.isBold ? "bold" : "normal"}
        fontStyle={decal.isItalic ? "italic" : "normal"}
      >
        {decal.text}
      </Text>
      {decal.isUnderline && underlineRef.current && (
        <mesh position={[0, underlineRef.current.y, -0.01]}>
          <planeGeometry
            args={[underlineRef.current.width, underlineRef.current.thickness]}
          />
          <meshBasicMaterial color={decal.fontColor} />
        </mesh>
      )}
    </group>
  );
}
