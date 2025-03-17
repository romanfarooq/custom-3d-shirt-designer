"use client";

import { Fragment, useEffect, useRef } from "react";
import { Decal, Text, useGLTF } from "@react-three/drei";
import { DecalControls } from "@/components/decal-controls";
import { type DecalItem, useClothingStore } from "@/lib/store";
import { type Mesh, Raycaster, TextureLoader } from "three" ;
import { type ThreeEvent, useThree, useFrame } from "@react-three/fiber";

export function ShirtModel() {
  const meshRef = useRef<Mesh | null>(null);
  const { nodes, materials } = useGLTF("/shirt_man.glb");

  const {
    color,
    decals,
    placeDecal,
    setTexture,
    setActiveDecal,
    updateDecalScale,
    setInteractionMode,
    updateDecalPosition,
    updateDecalRotation,
    interaction: {
      mode,
      dragOffset,
      activeDecal,
      activeControlPoint,
      startScale,
      startRotation,
      startPointerPosition,
    },
  } = useClothingStore();

  const { camera, pointer } = useThree();

  // Custom raycaster for dragging
  const dragRaycaster = useRef(new Raycaster());

  // Derived states
  const isDragging = mode === "dragging";
  const isResizing = mode === "resizing";
  const isRotating = mode === "rotating";
  const isPlacingDecal = mode === "placing";

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
      if (activeDecal?.id && mode === "idle") {
        setActiveDecal(null);
      }
    };

    window.addEventListener("click", handleBackgroundClick);
    return () => window.removeEventListener("click", handleBackgroundClick);
  }, [activeDecal?.id, mode, setActiveDecal]);

  // Global pointer up handler - improved to handle all interaction modes
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      // Check if we're in any interaction mode that needs to be ended
      if (isDragging || isResizing || isRotating) {
        // Reset all interaction values when ending any operation
        setInteractionMode("idle", {
          offset: null,
          startScale: null,
          startRotation: null,
          activeControlPoint: null,
          startPointerPosition: null,
        });
      }
    };

    // Add the event listener to the window to catch all pointer up events
    window.addEventListener("pointerup", handleGlobalPointerUp);
    return () => window.removeEventListener("pointerup", handleGlobalPointerUp);
  }, [isDragging, isResizing, isRotating, setInteractionMode]);

  const handleClickMesh = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    if (!meshRef.current || !isPlacingDecal || !activeDecal) return;

    // Get click position
    const worldPosition = event.point;
    const localPosition = meshRef.current.worldToLocal(worldPosition.clone());

    // Place the decal at the clicked position
    placeDecal(localPosition);
  };

  // Handle pointer down on a decal
  const handlePointerDown = (
    event: ThreeEvent<PointerEvent>,
    decal: DecalItem,
  ) => {
    event.stopPropagation();

    if (!meshRef.current) return;

    setActiveDecal(decal);

    if (!decal?.position) return;

    // Calculate the offset between the pointer hit point and the decal position
    const worldDecalPos = decal.position.clone();
    meshRef.current.localToWorld(worldDecalPos);

    const offset = worldDecalPos.clone().sub(event.point);
    setInteractionMode("dragging", { offset });
  };

  useFrame(() => {
    if (!meshRef.current) return;

    // Handle dragging
    if (isDragging && dragOffset && activeDecal) {
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
        updateDecalPosition(localPosition);
      }
    }

    // Handle resizing the decal
    if (
      startScale &&
      isResizing &&
      activeDecal &&
      activeControlPoint &&
      startPointerPosition
    ) {
      // Cast a ray from the camera through the mouse position
      dragRaycaster.current.setFromCamera(pointer, camera);

      // Check for intersections with the shirt mesh
      const intersects = dragRaycaster.current.intersectObject(
        meshRef.current,
        false,
      );

      if (intersects.length > 0) {
        const currentPoint = intersects[0].point;

        if (activeDecal?.position) {
          // Calculate the movement delta
          const delta = currentPoint.clone().sub(startPointerPosition);

          // Create a new scale based on the control point being dragged
          const newScale = startScale.clone();

          // Handle different control points for resizing
          switch (activeControlPoint) {
            // Corner points - resize uniformly in both dimensions to maintain aspect ratio
            case "tl": // Top Left
              {
                // Calculate scale factors for both dimensions
                const scaleFactorX =
                  (startScale.x - delta.x * 2) / startScale.x;
                const scaleFactorY =
                  (startScale.y + delta.y * 2) / startScale.y;
                // Use the smaller scale factor to ensure uniform scaling
                const uniformScaleFactor = Math.max(
                  Math.min(scaleFactorX, scaleFactorY),
                  0.1,
                );
                newScale.x = Math.max(1, startScale.x * uniformScaleFactor);
                newScale.y = Math.max(1, startScale.y * uniformScaleFactor);
              }
              break;
            case "tr": // Top Right
              {
                const scaleFactorX =
                  (startScale.x + delta.x * 2) / startScale.x;
                const scaleFactorY =
                  (startScale.y + delta.y * 2) / startScale.y;
                const uniformScaleFactor = Math.max(
                  Math.min(scaleFactorX, scaleFactorY),
                  0.1,
                );
                newScale.x = Math.max(1, startScale.x * uniformScaleFactor);
                newScale.y = Math.max(1, startScale.y * uniformScaleFactor);
              }
              break;
            case "bl": // Bottom Left
              {
                const scaleFactorX =
                  (startScale.x - delta.x * 2) / startScale.x;
                const scaleFactorY =
                  (startScale.y - delta.y * 2) / startScale.y;
                const uniformScaleFactor = Math.max(
                  Math.min(scaleFactorX, scaleFactorY),
                  0.1,
                );
                newScale.x = Math.max(1, startScale.x * uniformScaleFactor);
                newScale.y = Math.max(1, startScale.y * uniformScaleFactor);
              }
              break;
            case "br": // Bottom Right
              {
                const scaleFactorX =
                  (startScale.x + delta.x * 2) / startScale.x;
                const scaleFactorY =
                  (startScale.y - delta.y * 2) / startScale.y;
                const uniformScaleFactor = Math.max(
                  Math.min(scaleFactorX, scaleFactorY),
                  0.1,
                );
                newScale.x = Math.max(1, startScale.x * uniformScaleFactor);
                newScale.y = Math.max(1, startScale.y * uniformScaleFactor);
              }
              break;

            // Edge points - resize in one dimension
            case "t": // Top
              newScale.y = Math.max(1, startScale.y + delta.y * 2); // Fixed: Inverted y-axis delta
              break;
            case "r": // Right
              newScale.x = Math.max(1, startScale.x + delta.x * 2);
              break;
            case "b": // Bottom
              newScale.y = Math.max(1, startScale.y - delta.y * 2); // Fixed: Inverted y-axis delta
              break;
            case "l": // Left
              newScale.x = Math.max(1, startScale.x - delta.x * 2);
              break;
          }

          // Update the decal scale
          updateDecalScale(newScale);
        }
      }
    }

    // Handle rotating the decal
    if (
      isRotating &&
      activeDecal &&
      startRotation &&
      startPointerPosition &&
      activeControlPoint === "rot"
    ) {
      // Cast a ray from the camera through the mouse position
      dragRaycaster.current.setFromCamera(pointer, camera);

      // Check for intersections with the shirt mesh
      const intersects = dragRaycaster.current.intersectObject(
        meshRef.current,
        false,
      );

      if (intersects.length > 0) {
        const currentPoint = intersects[0].point;

        if (activeDecal?.position) {
          // Convert decal position to world space
          const worldDecalPos = activeDecal.position.clone();
          meshRef.current.localToWorld(worldDecalPos);

          // Calculate angles from decal center to start and current points
          const startVector = startPointerPosition.clone().sub(worldDecalPos);
          const currentVector = currentPoint.clone().sub(worldDecalPos);

          // Calculate the angle between these vectors
          const startAngle = Math.atan2(startVector.y, startVector.x);
          const currentAngle = Math.atan2(currentVector.y, currentVector.x);
          // Reverse the angle delta to fix the rotation direction
          const angleDelta = startAngle - currentAngle;

          // Create a new rotation based on the original plus the delta
          const newRotation = startRotation.clone();
          newRotation.z = startRotation.z + angleDelta;

          // Update the decal rotation
          updateDecalRotation(newRotation);
        }
      }
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
          decal.position && (
            <Fragment key={decal.id}>
              {decal.type === "text" ? (
                <Decal
                  scale={decal.scale}
                  position={decal.position}
                  rotation={decal.rotation}
                  onPointerDown={(e) => handlePointerDown(e, decal)}
                >
                  <meshStandardMaterial
                    transparent
                    polygonOffset
                    polygonOffsetFactor={-1}
                    opacity={isDragging && activeDecal?.id === decal.id ? 0.8 : 1}
                  >
                    <Text color="black">{decal.text}</Text>
                  </meshStandardMaterial>
                </Decal>
              ) : (
                // Render image decal
                decal.texture && (
                  <Decal
                    scale={decal.scale}
                    position={decal.position}
                    rotation={decal.rotation}
                    onPointerDown={(e) => handlePointerDown(e, decal)}
                  >
                    <meshBasicMaterial
                      map={decal.texture}
                      transparent
                      polygonOffset
                      polygonOffsetFactor={-1}
                      opacity={
                        isDragging && activeDecal?.id === decal.id ? 0.8 : 1
                      }
                    />
                  </Decal>
                )
              )}
            </Fragment>
          ),
      )}

      {/* Single DecalControls component that uses pre-calculated points */}
      <DecalControls
        visible={!!activeDecal?.id && !isDragging && !isPlacingDecal}
      />
    </mesh>
  );
}

// Preload models
useGLTF.preload("/shirt_man.glb");
