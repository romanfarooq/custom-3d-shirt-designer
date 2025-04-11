"use client";

import type { Mesh } from "three";
import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useShallow } from "zustand/shallow";
import { useClothingStore } from "@/lib/store";
import { DecalControls } from "@/components/decal-controls";
import { DecalRenderer } from "@/components/decal-renderer";
import { useShirtInteractions } from "@/hooks/useShirtInteractions";

export function ShirtModel() {
  const meshRef = useRef<Mesh>(null);
  const { nodes, materials } = useGLTF("/shirt_man.glb");

  const { mode, color, decals, activeDecalId } = useClothingStore(
    useShallow((state) => ({
      color: state.color,
      decals: state.decals,
      mode: state.interaction.mode,
      activeDecalId: state.interaction.activeDecal?.id,
    })),
  );

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

      <DecalRenderer
        mode={mode}
        decals={decals}
        activeDecalId={activeDecalId}
        onPointerDown={handlePointerDown}
      />

      <DecalControls
        visible={!!activeDecalId && mode !== "dragging" && mode !== "placing"}
      />
    </mesh>
  );
}

// Preload models
useGLTF.preload("/shirt_man.glb");
