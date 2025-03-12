"use client";

import type * as THREE from "three";
import { useRef } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { useClothingStore } from "@/lib/store"; 
import { Decal, useGLTF, useTexture } from "@react-three/drei";

export function ShirtModel() {
  const { nodes, materials } = useGLTF("/shirt_man.glb");
  const { color, decal, isPlacingDecal, placeDecal } = useClothingStore();
  const meshRef = useRef<THREE.Mesh | null>(null);

  // Load the texture from the decal image or use a transparent texture if no decal
  const texture = useTexture(decal?.image || "/transparent.png");

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
      geometry={(nodes.man as THREE.Mesh).geometry}
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
            map={texture}
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
