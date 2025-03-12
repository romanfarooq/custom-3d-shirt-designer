"use client";

import { useEffect, useRef } from "react";
import { useClothingStore } from "@/lib/store";
import { Decal, useGLTF } from "@react-three/drei";
import { type ThreeEvent, useThree, useFrame } from "@react-three/fiber";
import { type Mesh, Vector2, Vector3, Raycaster, TextureLoader } from "three";

export function ShirtModel() {
  const meshRef = useRef<Mesh | null>(null);
  const decalRef = useRef<Mesh | null>(null);
  const { nodes, materials } = useGLTF("/shirt_man.glb");
  const {
    color,
    decal,
    interaction,
    placeDecal,
    setTexture,
    updateDecalPosition,
    setInteractionMode,
  } = useClothingStore();

  const { camera, pointer, gl } = useThree();

  // Custom raycaster for dragging
  const dragRaycaster = useRef(new Raycaster());

  // Derived state
  const isPlacingDecal = interaction.mode === "placing";
  const isDragging = interaction.mode === "dragging";
  const dragOffset = interaction.dragOffset;

  // Use useTexture for the decal if available
  useEffect(() => {
    if (decal?.image) {
      // Load texture using TextureLoader
      const loader = new TextureLoader();
      loader.load(decal.image, (texture) => {
        // Ensure texture settings are optimal
        texture.needsUpdate = true;
        texture.flipY = false; // Try this if texture appears inverted
        setTexture(texture);
      });
    }
  }, [decal?.image, setTexture]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    if (!meshRef.current || !isPlacingDecal || !decal) return;

    // Get click position
    const worldPosition = event.point;
    const localPosition = meshRef.current.worldToLocal(worldPosition.clone());

    // Place the decal at the clicked position
    placeDecal(localPosition.toArray());
  };

  // Handle pointer down on the decal
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    if (!meshRef.current || !decal?.position) return;

    // Calculate the offset between the pointer hit point and the decal position
    // This ensures the decal doesn't jump to the pointer position
    const worldDecalPos = new Vector3(...decal.position);
    meshRef.current.localToWorld(worldDecalPos);

    const offset = worldDecalPos.clone().sub(event.point);
    setInteractionMode("dragging", offset);

    // Add global event listeners to handle dragging outside the decal
    window.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("pointerup", handleGlobalPointerUp);
  };

  // Global pointer move handler (for when cursor moves fast)
  const handleGlobalPointerMove = (event: PointerEvent) => {
    if (!isDragging || !meshRef.current || !dragOffset) return;

    // Convert pointer position to normalized device coordinates
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster with the current pointer position
    const pointerPos = new Vector2(x, y);
    dragRaycaster.current.setFromCamera(pointerPos, camera);

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
  };

  // Global pointer up handler
  const handleGlobalPointerUp = () => {
    setInteractionMode("idle");

    // Remove global event listeners
    window.removeEventListener("pointermove", handleGlobalPointerMove);
    window.removeEventListener("pointerup", handleGlobalPointerUp);
  };

  // Update decal position during dragging (for smooth updates)
  useFrame(() => {
    if (!isDragging || !meshRef.current || !dragOffset) return;

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
      onClick={handleClick}
      material={materials.manShad}
      geometry={(nodes.man as Mesh).geometry}
      position={[0, -0.8, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <meshStandardMaterial color={color} />

      {decal && decal.position && decal.texture && (
        <Decal
          ref={decalRef}
          scale={[decal.scale * decal.aspect, decal.scale, decal.scale]}
          position={decal.position}
          rotation={decal.rotation}
          onPointerDown={handlePointerDown}
        >
          {/* Use MeshBasicMaterial instead of MeshPhongMaterial to avoid lighting effects */}
          <meshBasicMaterial
            map={decal.texture}
            transparent
            polygonOffset
            polygonOffsetFactor={-1}
            opacity={isDragging ? 0.8 : 1}
          />
        </Decal>
      )}
    </mesh>
  );
}

// Preload models
useGLTF.preload("/shirt_man.glb");
