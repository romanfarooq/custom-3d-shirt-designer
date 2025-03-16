"use client";

import { Fragment, useEffect, useRef } from "react";
import { Decal, useGLTF } from "@react-three/drei";
import { DecalControls } from "@/components/decal-controls";
import { type ThreeEvent, useThree, useFrame } from "@react-three/fiber";
import {
  type ControlPoint,
  type ControlPointName,
  useClothingStore,
} from "@/lib/store";
import {
  type Mesh,
  type Euler,
  Vector3,
  Raycaster,
  TextureLoader,
  Quaternion,
} from "three";

const BASE_CONTROL_POINTS: { position: Vector3; type: ControlPointName }[] = [
  {
    position: new Vector3(-0.5, -0.5, 0),
    type: "tl",
  }, // Top Left
  {
    position: new Vector3(0.5, -0.5, 0),
    type: "tr",
  }, // Top Right
  {
    position: new Vector3(-0.5, 0.5, 0),
    type: "bl",
  }, // Bottom Left
  {
    position: new Vector3(0.5, 0.5, 0),
    type: "br",
  }, // Bottom Right
  {
    position: new Vector3(0, -0.5, 0),
    type: "t",
  }, // Top
  {
    position: new Vector3(0.5, 0, 0),
    type: "r",
  }, // Right
  {
    position: new Vector3(0, 0.5, 0),
    type: "b",
  }, // Bottom
  {
    position: new Vector3(-0.5, 0, 0),
    type: "l",
  }, // Left
  {
    position: new Vector3(0, -0.7, 0),
    type: "rot",
  }, // Rotation handle
];

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
    updateControlPoints,
    updateDecalRotation,
    interaction: {
      mode,
      dragOffset,
      activeDecalId,
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
      if (activeDecalId && mode === "idle") {
        setActiveDecal(null);
      }
    };

    window.addEventListener("click", handleBackgroundClick);
    return () => window.removeEventListener("click", handleBackgroundClick);
  }, [activeDecalId, mode, setActiveDecal]);

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

    if (!meshRef.current || !isPlacingDecal || !activeDecalId) return;

    // Get click position
    const worldPosition = event.point;
    const localPosition = meshRef.current.worldToLocal(worldPosition.clone());

    // Place the decal at the clicked position
    placeDecal(localPosition);
  };

  // Handle pointer down on a decal
  const handlePointerDown = (
    event: ThreeEvent<PointerEvent>,
    decalId: string,
  ) => {
    event.stopPropagation();

    if (!meshRef.current) return;

    // Find the decal
    const decal = decals.find((d) => d.id === decalId);
    if (!decal?.position) return;

    // Calculate the offset between the pointer hit point and the decal position
    const worldDecalPos = new Vector3().copy(decal.position);
    meshRef.current.localToWorld(worldDecalPos);

    const offset = worldDecalPos.clone().sub(event.point);
    setInteractionMode("dragging", { offset });
  };

  // Function to calculate control points based on decal properties
  const calculateControlPoints = (
    scale: Vector3,
    position: Vector3,
    rotation: Euler,
  ): ControlPoint[] => {
    const quaternion = new Quaternion().setFromEuler(rotation);

    return BASE_CONTROL_POINTS.map((point) => {
      // Clone the base position to avoid mutating the original
      const basePosition = point.position.clone();

      // Scale the position
      const scaledPosition = new Vector3(
        basePosition.x * scale.x,
        basePosition.y * scale.y,
        0,
      );

      // Apply rotation
      scaledPosition.applyQuaternion(quaternion);

      // Add to decal position
      const finalPosition = position.clone().add(scaledPosition);

      return {
        position: finalPosition,
        type: point.type,
      };
    });
  };

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
        updateDecalPosition(localPosition);
      }
    }

    // Handle resizing the decal
    if (
      startScale &&
      isResizing &&
      activeDecalId &&
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
        const activeDecal = decals.find((d) => d.id === activeDecalId);

        if (activeDecal?.position) {
          // Calculate the movement delta
          const delta = currentPoint.clone().sub(startPointerPosition);

          // Create a new scale based on the control point being dragged
          const newScale = startScale.clone();

          // Handle different control points for resizing
          switch (activeControlPoint) {
            // Corner points - resize in both dimensions
            case "tl": // Top Left
              newScale.x = Math.max(1, startScale.x - delta.x * 2);
              newScale.y = Math.max(1, startScale.y - delta.y * 2);
              break;
            case "tr": // Top Right
              newScale.x = Math.max(1, startScale.x + delta.x * 2);
              newScale.y = Math.max(1, startScale.y - delta.y * 2);
              break;
            case "bl": // Bottom Left
              newScale.x = Math.max(1, startScale.x - delta.x * 2);
              newScale.y = Math.max(1, startScale.y + delta.y * 2);
              break;
            case "br": // Bottom Right
              newScale.x = Math.max(1, startScale.x + delta.x * 2);
              newScale.y = Math.max(1, startScale.y + delta.y * 2);
              break;

            // Edge points - resize in one dimension
            case "t": // Top
              newScale.y = Math.max(1, startScale.y - delta.y * 2);
              break;
            case "r": // Right
              newScale.x = Math.max(1, startScale.x + delta.x * 2);
              break;
            case "b": // Bottom
              newScale.y = Math.max(1, startScale.y + delta.y * 2);
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
      activeDecalId &&
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
        const activeDecal = decals.find((d) => d.id === activeDecalId);

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
          const angleDelta = currentAngle - startAngle;

          // Create a new rotation based on the original plus the delta
          const newRotation = startRotation.clone();
          newRotation.z = startRotation.z + angleDelta;

          // Update the decal rotation
          updateDecalRotation(newRotation);
        }
      }
    }

    // Calculate control points for active decal
    if (activeDecalId) {
      const activeDecal = decals.find((d) => d.id === activeDecalId);
      if (activeDecal?.position) {
        // Calculate control points based on the active decal's properties
        const calculatedPoints = calculateControlPoints(
          activeDecal.scale,
          activeDecal.position,
          activeDecal.rotation,
        );

        // Update the control points in the store
        updateControlPoints(calculatedPoints);
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
          decal.position &&
          decal.texture && (
            <Fragment key={decal.id}>
              <Decal
                scale={decal.scale}
                position={decal.position}
                rotation={decal.rotation}
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
            </Fragment>
          ),
      )}

      {/* Single DecalControls component that uses pre-calculated points */}
      <DecalControls
        visible={!!activeDecalId && !isDragging && !isPlacingDecal}
      />
    </mesh>
  );
}

// Preload models
useGLTF.preload("/shirt_man.glb");
