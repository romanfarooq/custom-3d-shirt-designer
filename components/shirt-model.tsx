"use client";

import type { Mesh } from "three";
import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useClothingStore } from "@/lib/store";
import { DecalControls } from "@/components/decal-controls";
import { DecalRenderer } from "@/components/decal-renderer";
import { useShirtInteractions } from "@/hooks/useShirtInteractions";

export function ShirtModel() {
  const meshRef = useRef<Mesh>(null);
  const { nodes, materials } = useGLTF("/shirt_man.glb");

  const {
    color,
    decals,
    interaction: { mode, activeDecal },
  } = useClothingStore();

  const { handleClickMesh, handlePointerDown } = useShirtInteractions(meshRef);

  return (
    <mesh
      ref={meshRef}
      onClick={handleClickMesh}
      material={materials.manShad}
      geometry={(nodes.man as Mesh).geometry}
      position={[0, -0.8, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <meshStandardMaterial color={color} />

      {/* Render all decals through the extracted component */}
      <DecalRenderer
        mode={mode}
        decals={decals}
        activeDecal={activeDecal}
        onPointerDown={handlePointerDown}
      />

      {/* Single DecalControls component that uses pre-calculated points */}
      <DecalControls
        visible={!!activeDecal?.id && mode !== "dragging" && mode !== "placing"}
      />
    </mesh>
  );
}

// Preload models
useGLTF.preload("/shirt_man.glb");
