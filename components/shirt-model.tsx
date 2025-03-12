"use client";

import { useEffect, useRef } from "react";
import { type Mesh, TextureLoader } from "three";
import { type ThreeEvent } from "@react-three/fiber";
import { useClothingStore } from "@/lib/store";
import { Decal, useGLTF } from "@react-three/drei";

export function ShirtModel() {
  const meshRef = useRef<Mesh | null>(null);
  const { nodes, materials } = useGLTF("/shirt_man.glb");
  const { color, decal, isPlacingDecal, placeDecal, setTexture } = useClothingStore();

  useEffect(() => {
    if (decal?.image) {
      const loader = new TextureLoader();
      loader.load(decal.image, setTexture);
    }
  }, [decal?.image]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    if (!meshRef.current || !isPlacingDecal || !decal) return;

    // Get click position
    const worldPosition = event.point;
    const localPosition = meshRef.current.worldToLocal(worldPosition.clone());

    // Place the decal at the clicked position
    placeDecal(localPosition.toArray() as [number, number, number]);
  };

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      material={materials.manShad}
      geometry={(nodes.man as Mesh).geometry}
      position={[0, -0.8, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <meshStandardMaterial color={color} />

      {decal && decal.position && (
        <Decal
          scale={[decal.scale * decal.aspect, decal.scale, decal.scale]}
          position={decal.position}
          rotation={decal.rotation}
        >
          <meshPhongMaterial
            map={decal.texture}
            transparent
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </Decal>
      )}
    </mesh>
  );
}

// Preload models
useGLTF.preload("/shirt_man.glb");
