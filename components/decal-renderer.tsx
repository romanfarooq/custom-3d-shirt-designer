import type { DecalItem } from "@/lib/store";
import type { ThreeEvent } from "@react-three/fiber";
import { Decal, Text, RenderTexture } from "@react-three/drei";

interface DecalRendererProps {
  mode: string;
  decals: DecalItem[];
  activeDecal: DecalItem | null;
  onPointerDown: (event: ThreeEvent<PointerEvent>, decal: DecalItem) => void;
}

export function DecalRenderer({
  mode,
  decals,
  activeDecal,
  onPointerDown,
}: DecalRendererProps) {
  const isDragging = mode === "dragging";

  return (
    <>
      {decals.map((decal) =>
        decal.type === "image" && decal.texture && decal.position ? (
          <Decal
            key={decal.id}
            scale={decal.scale}
            position={decal.position}
            rotation={decal.rotation}
            onPointerDown={(e) => onPointerDown(e, decal)}
          >
            <meshBasicMaterial
              map={decal.texture}
              transparent
              polygonOffset
              polygonOffsetFactor={-1}
              opacity={isDragging && activeDecal?.id === decal.id ? 0.8 : 1}
            />
          </Decal>
        ) : decal.type === "text" && decal.text && decal.position ? (
          <Decal
            key={decal.id}
            scale={decal.scale}
            position={decal.position}
            rotation={decal.rotation}
            onPointerDown={(e) => onPointerDown(e, decal)}
          >
            <meshBasicMaterial
              transparent
              polygonOffset
              polygonOffsetFactor={-1}
              opacity={isDragging && activeDecal?.id === decal.id ? 0.8 : 1}
            >
              <RenderTexture attach="map">
                <group scale={[1 / decal.scale.x, 1 / decal.scale.y, 1]}>
                  <Text
                    color="black"
                    anchorX="center"
                    anchorY="middle"
                    outlineColor="white"
                    outlineWidth={0.05}
                    scale={[-1, 1, 1]}
                    rotation={[0, 0, Math.PI]}
                    fontSize={decal.fontSize * 10}
                    fontWeight={decal.isBold ? "bold" : "normal"}
                    fontStyle={decal.isItalic ? "italic" : "normal"}
                  >
                    {decal.text}
                  </Text>
                  {decal.isUnderline &&
                    (() => {
                      const underlineThickness = decal.fontSize * 10 * (decal.isBold ? 0.05 : 0.02);
                      const underlineWidth = decal.text.length * decal.fontSize * 10 * 0.6;
                      const underlinePositionY = (decal.fontSize * 10) / 2 + underlineThickness;
                      const underlinePositionZ = -0.01;
                      return (
                        <mesh position={[0, underlinePositionY, underlinePositionZ]}>
                          <planeGeometry args={[underlineWidth, underlineThickness]} />
                          <meshBasicMaterial color="black" />
                        </mesh>
                      );
                    })()}
                </group>
              </RenderTexture>
            </meshBasicMaterial>
          </Decal>
        ) : null,
      )}
    </>
  );
}
