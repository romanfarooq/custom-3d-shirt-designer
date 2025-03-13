"use client";

import { RotateCw } from "lucide-react";
import { useEffect, useRef } from "react";
import { useClothingStore } from "@/lib/store";
import { Decal, useGLTF, Html } from "@react-three/drei";
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
    updateDecalPosition,
    updateDecalScale,
    updateDecalRotation,
    setInteractionMode,
    setActiveDecal,
  } = useClothingStore();

  const { camera, pointer, size } = useThree();

  // Custom raycaster for dragging
  const dragRaycaster = useRef(new Raycaster());

  // Derived state
  const dragOffset = interaction.dragOffset;
  const isDragging = interaction.mode === "dragging";
  const isResizing = interaction.mode === "resizing";
  const isRotating = interaction.mode === "rotating";
  const isPlacingDecal = interaction.mode === "placing";
  const activeDecalId = interaction.activeDecalId;
  const resizeHandle = interaction.resizeHandle;
  const initialScale = interaction.initialScale;
  const initialRotation = interaction.initialRotation;
  const initialPointer = interaction.initialPointer;

  // Find the active decal
  const activeDecal = decals.find((d) => d.id === activeDecalId);

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

  // Handle background click to deselect active decal
  useEffect(() => {
    const handleBackgroundClick = () => {
      if (activeDecalId && interaction.mode === "idle") {
        setActiveDecal(null);
      }
    };

    window.addEventListener("click", handleBackgroundClick);
    return () => window.removeEventListener("click", handleBackgroundClick);
  }, [activeDecalId, interaction.mode, setActiveDecal]);

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
    setInteractionMode("dragging", { offset });
  };

  // Handle resize handle pointer down
  const handleResizeStart = (
    event: React.PointerEvent,
    decalId: string,
    handle: string,
  ) => {
    event.stopPropagation();

    const decal = decals.find((d) => d.id === decalId);
    if (!decal) return;

    setInteractionMode("resizing", {
      resizeHandle: handle,
      initialScale: { x: decal.scaleX, y: decal.scaleY },
      initialPointer: { x: event.clientX, y: event.clientY },
    });
  };

  // Handle rotation handle pointer down
  const handleRotateStart = (event: React.PointerEvent, decalId: string) => {
    event.stopPropagation();

    const decal = decals.find((d) => d.id === decalId);
    if (!decal) return;

    setInteractionMode("rotating", {
      initialRotation: [...decal.rotation],
      initialPointer: { x: event.clientX, y: event.clientY },
    });
  };

  // Global pointer up handler
  const handlePointerUp = () => {
    setInteractionMode("idle");
  };

  // Update decal position during dragging (for smooth updates)
  useFrame(() => {
    if (!meshRef.current) return;

    // Handle dragging
    if (isDragging && dragOffset && activeDecalId) {
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
    }

    // Handle resizing
    if (
      isResizing &&
      initialScale &&
      initialPointer &&
      activeDecalId &&
      resizeHandle
    ) {
      const decal = decals.find((d) => d.id === activeDecalId);
      if (!decal) return;

      // Calculate the delta movement
      const deltaX = (pointer.x * size.width) / 2 - initialPointer.x;
      const deltaY = -((pointer.y * size.height) / 2) - initialPointer.y;

      // Calculate new scale based on the handle being dragged
      let newScaleX = initialScale.x;
      let newScaleY = initialScale.y;

      const scaleFactor = 0.05;

      switch (resizeHandle) {
        case "tl": // Top Left
          newScaleX = Math.max(1, initialScale.x - deltaX * scaleFactor);
          newScaleY = Math.max(1, initialScale.y - deltaY * scaleFactor);
          break;
        case "tr": // Top Right
          newScaleX = Math.max(1, initialScale.x + deltaX * scaleFactor);
          newScaleY = Math.max(1, initialScale.y - deltaY * scaleFactor);
          break;
        case "bl": // Bottom Left
          newScaleX = Math.max(1, initialScale.x - deltaX * scaleFactor);
          newScaleY = Math.max(1, initialScale.y + deltaY * scaleFactor);
          break;
        case "br": // Bottom Right
          newScaleX = Math.max(1, initialScale.x + deltaX * scaleFactor);
          newScaleY = Math.max(1, initialScale.y + deltaY * scaleFactor);
          break;
        case "t": // Top
          newScaleY = Math.max(1, initialScale.y - deltaY * scaleFactor);
          break;
        case "r": // Right
          newScaleX = Math.max(1, initialScale.x + deltaX * scaleFactor);
          break;
        case "b": // Bottom
          newScaleY = Math.max(1, initialScale.y + deltaY * scaleFactor);
          break;
        case "l": // Left
          newScaleX = Math.max(1, initialScale.x - deltaX * scaleFactor);
          break;
      }

      updateDecalScale(newScaleX, newScaleY);
    }

    // Handle rotation
    if (isRotating && initialRotation && initialPointer && activeDecalId) {
      const decal = decals.find((d) => d.id === activeDecalId);
      if (!decal || !decal.position) return;

      // Calculate the delta movement
      const deltaX = (pointer.x * size.width) / 2 - initialPointer.x;

      // Calculate new rotation
      const rotationZ = initialRotation[2] + deltaX * 0.01;

      // Update rotation (keep x and y the same)
      updateDecalRotation([initialRotation[0], initialRotation[1], rotationZ]);
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

      {/* Render all decals directly as children of the mesh */}
      {decals.map(
        (decal) =>
          decal.position &&
          decal.texture && (
            <Decal
              key={decal.id}
              scale={[decal.scaleX, decal.scaleY, 1]}
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

      {/* Render control points separately for the active decal */}
      {activeDecalId &&
        decals
          .filter((decal) => decal.id === activeDecalId && decal.position)
          .map((decal) => (
            <Html
              key={`controls-${decal.id}`}
              position={decal.position}
              rotation={decal.rotation}
              transform
            >
              <div
                className="relative"
                style={{
                  width: `${decal.scaleX * 2}px`,
                  height: `${decal.scaleY * 2}px`,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }}
              >
                {/* Resize handles */}
                {/* Top Left */}
                <div
                  className="absolute -top-2 -left-2 h-4 w-4 cursor-nwse-resize rounded-full bg-gray-800"
                  style={{ pointerEvents: "auto" }}
                  onPointerDown={(e) => handleResizeStart(e, decal.id, "tl")}
                />

                {/* Top */}
                <div
                  className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 cursor-ns-resize rounded-full bg-gray-800"
                  style={{ pointerEvents: "auto" }}
                  onPointerDown={(e) => handleResizeStart(e, decal.id, "t")}
                />

                {/* Top Right */}
                <div
                  className="absolute -top-2 -right-2 h-4 w-4 cursor-nesw-resize rounded-full bg-gray-800"
                  style={{ pointerEvents: "auto" }}
                  onPointerDown={(e) => handleResizeStart(e, decal.id, "tr")}
                />

                {/* Right */}
                <div
                  className="absolute top-1/2 -right-2 h-4 w-4 -translate-y-1/2 cursor-ew-resize rounded-full bg-gray-800"
                  style={{ pointerEvents: "auto" }}
                  onPointerDown={(e) => handleResizeStart(e, decal.id, "r")}
                />

                {/* Bottom Right */}
                <div
                  className="absolute -right-2 -bottom-2 h-4 w-4 cursor-nwse-resize rounded-full bg-gray-800"
                  style={{ pointerEvents: "auto" }}
                  onPointerDown={(e) => handleResizeStart(e, decal.id, "br")}
                />

                {/* Bottom */}
                <div
                  className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 cursor-ns-resize rounded-full bg-gray-800"
                  style={{ pointerEvents: "auto" }}
                  onPointerDown={(e) => handleResizeStart(e, decal.id, "b")}
                />

                {/* Bottom Left */}
                <div
                  className="absolute -bottom-2 -left-2 h-4 w-4 cursor-nesw-resize rounded-full bg-gray-800"
                  style={{ pointerEvents: "auto" }}
                  onPointerDown={(e) => handleResizeStart(e, decal.id, "bl")}
                />

                {/* Left */}
                <div
                  className="absolute top-1/2 -left-2 h-4 w-4 -translate-y-1/2 cursor-ew-resize rounded-full bg-gray-800"
                  style={{ pointerEvents: "auto" }}
                  onPointerDown={(e) => handleResizeStart(e, decal.id, "l")}
                />

                {/* Rotation handle */}
                <div
                  className="absolute -top-8 left-1/2 flex h-6 w-6 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full bg-gray-800"
                  style={{ pointerEvents: "auto" }}
                  onPointerDown={(e) => handleRotateStart(e, decal.id)}
                >
                  <RotateCw className="h-4 w-4 text-white" />
                </div>
              </div>
            </Html>
          ))}
    </mesh>
  );
}

// Preload models
useGLTF.preload("/shirt_man.glb");
