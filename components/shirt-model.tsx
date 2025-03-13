"use client";

import { useEffect, useRef } from "react";
import { useClothingStore } from "@/lib/store";
import { Decal, useGLTF } from "@react-three/drei";
import { type ThreeEvent, useThree, useFrame } from "@react-three/fiber";
import { type Mesh, Vector3, Raycaster, TextureLoader } from "three";

export function ShirtModel() {
  const meshRef = useRef<Mesh | null>(null);
  const { nodes, materials } = useGLTF("/shirt_man.glb");
  const {
    color,
    decals,
    interaction,
    placeDecal,
    setTexture,
    setActiveDecal,
    updateDecalPosition,
    setInteractionMode,
  } = useClothingStore();

  const { camera, pointer } = useThree();

  // Custom raycaster for dragging
  const dragRaycaster = useRef(new Raycaster());

  // Derived state
  const dragOffset = interaction.dragOffset;
  const activeDecalId = interaction.activeDecalId;
  const isDragging = interaction.mode === "dragging";
  const isPlacingDecal = interaction.mode === "placing";

  // Load textures for all decals
  useEffect(() => {
    decals.forEach((decal) => {
      if (decal.image && !decal.texture) {
        // Load texture using TextureLoader
        const loader = new TextureLoader();
        loader.load(decal.image, (texture) => {
          // Ensure texture settings are optimal
          texture.needsUpdate = true;
          texture.flipY = false; // Try this if texture appears inverted
          setTexture(decal.id, texture);
        });
      }
    });
  }, [decals, setTexture]);

  const handleClickMesh = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    if (!meshRef.current || !isPlacingDecal || !activeDecalId) return;

    // Get click position
    const worldPosition = event.point;
    const localPosition = meshRef.current.worldToLocal(worldPosition.clone());

    // Place the decal at the clicked position
    placeDecal(localPosition.toArray());
  };

  // Handle pointer down on a decal
  const handlePointerDown = (
    event: ThreeEvent<PointerEvent>,
    decalId: string,
  ) => {
    event.stopPropagation();

    if (!meshRef.current) return;

    // Set this decal as active
    setActiveDecal(decalId);

    // Find the decal
    const decal = decals.find((d) => d.id === decalId);
    if (!decal?.position) return;

    // Calculate the offset between the pointer hit point and the decal position
    const worldDecalPos = new Vector3(...decal.position);
    meshRef.current.localToWorld(worldDecalPos);

    const offset = worldDecalPos.clone().sub(event.point);
    setInteractionMode("dragging", offset);
  };

  // Global pointer up handler
  const handlePointerUp = () => {
    setInteractionMode("idle");
  };

  // Update decal position during dragging (for smooth updates)
  useFrame(() => {
    if (!isDragging || !meshRef.current || !dragOffset || !activeDecalId)
      return;

    // Cast a ray from the camera through the mouse position
    dragRaycaster.current.setFromCamera(pointer, camera);

    // Check for intersections with the shirt mesh
    const intersects = dragRaycaster.current.intersectObject(
      meshRef.current,
      false,
    );

    if (intersects.length > 0) {
      // Get the intersection point and add the offset
      const hitPoint = intersects[0].point.clone().add(dragOffset);

      // Convert to local space of the shirt
      const localPosition = meshRef.current.worldToLocal(hitPoint);

      // Update the decal position
      updateDecalPosition(localPosition.toArray());
    }
  });

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

      {decals.map(
        (decal) =>
          decal.position &&
          decal.texture && (
            <Decal
              key={decal.id}
              scale={[decal.scale * decal.aspect, decal.scale, decal.scale]}
              position={decal.position}
              rotation={decal.rotation}
              onPointerUp={handlePointerUp}
              onPointerDown={(e) => handlePointerDown(e, decal.id)}
            >
              <meshBasicMaterial
                map={decal.texture}
                transparent
                polygonOffset
                polygonOffsetFactor={-1}
                opacity={isDragging && activeDecalId === decal.id ? 0.8 : 1}
              />
            </Decal>
          ),
      )}
    </mesh>
  );
}

// Preload models
useGLTF.preload("/shirt_man.glb");
