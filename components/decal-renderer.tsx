import type { DecalItem } from "@/lib/store";
import type { ThreeEvent } from "@react-three/fiber";
import { TextDecalElement } from "@/components/text-decal-element";
import { Decal, RenderTexture, PerspectiveCamera } from "@react-three/drei";

interface DecalRendererProps {
  mode: string;
  decals: DecalItem[];
  activeDecalId: string | undefined;
  onPointerDown: (event: ThreeEvent<PointerEvent>, decal: DecalItem) => void;
}

export function DecalRenderer({
  mode,
  decals,
  activeDecalId,
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
              opacity={isDragging && activeDecalId === decal.id ? 0.8 : 1}
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
              opacity={isDragging && activeDecalId === decal.id ? 0.8 : 1}
            >
              <RenderTexture attach="map" anisotropy={16}>
                <PerspectiveCamera makeDefault manual position={[0, 0, 5]} />
                <TextDecalElement decal={decal} />
              </RenderTexture>
            </meshBasicMaterial>
          </Decal>
        ) : null,
      )}
    </>
  );
}
