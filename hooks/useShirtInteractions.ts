import { type Mesh, Raycaster } from "three";
import { type RefObject, useEffect, useRef } from "react";
import { type DecalItem, useClothingStore } from "@/lib/store";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";

export function useShirtInteractions(meshRef: RefObject<Mesh | null>) {
  const {
    placeDecal,
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

  const { gl, camera, pointer } = useThree();

  // Custom raycaster for dragging
  const dragRaycaster = useRef(new Raycaster());

  // Derived states
  const isDragging = mode === "dragging";
  const isResizing = mode === "resizing";
  const isRotating = mode === "rotating";
  const isPlacingDecal = mode === "placing";

  // Handle background click to deselect active decal
  useEffect(() => {
    const handleInActiveDecal = () => {
      if (!activeDecal?.id || mode !== "idle") return;
      setActiveDecal(null);
    };
    gl.domElement.addEventListener("click", handleInActiveDecal);
    return () =>
      gl.domElement.removeEventListener("click", handleInActiveDecal);
  }, [activeDecal?.id, gl.domElement, mode, setActiveDecal]);

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
      handleDragging();
    }

    // Handle resizing the decal
    if (
      startScale &&
      isResizing &&
      activeDecal &&
      activeControlPoint &&
      startPointerPosition
    ) {
      handleResizing();
    }

    // Handle rotating the decal
    if (
      isRotating &&
      activeDecal &&
      startRotation &&
      startPointerPosition &&
      activeControlPoint === "rot"
    ) {
      handleRotating();
    }
  });

  const handleDragging = () => {
    // Cast a ray from the camera through the mouse position
    dragRaycaster.current.setFromCamera(pointer, camera);

    // Check for intersections with the shirt mesh
    const intersects = dragRaycaster.current.intersectObject(
      meshRef.current!,
      false,
    );

    if (intersects.length > 0 && dragOffset) {
      // Get the intersection point and add the offset
      const hitPoint = intersects[0].point.clone().add(dragOffset);

      // Convert to local space of the shirt
      const localPosition = meshRef.current!.worldToLocal(hitPoint);

      // Update the decal position
      updateDecalPosition(localPosition);
    }
  };

  const handleResizing = () => {
    // Cast a ray from the camera through the mouse position
    dragRaycaster.current.setFromCamera(pointer, camera);

    // Check for intersections with the shirt mesh
    const intersects = dragRaycaster.current.intersectObject(
      meshRef.current!,
      false,
    );

    if (
      intersects.length > 0 &&
      startScale &&
      startPointerPosition &&
      activeControlPoint &&
      activeDecal?.position
    ) {
      const currentPoint = intersects[0].point;

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
            const scaleFactorX = (startScale.x - delta.x * 2) / startScale.x;
            const scaleFactorY = (startScale.y + delta.y * 2) / startScale.y;
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
            const scaleFactorX = (startScale.x + delta.x * 2) / startScale.x;
            const scaleFactorY = (startScale.y + delta.y * 2) / startScale.y;
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
            const scaleFactorX = (startScale.x - delta.x * 2) / startScale.x;
            const scaleFactorY = (startScale.y - delta.y * 2) / startScale.y;
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
            const scaleFactorX = (startScale.x + delta.x * 2) / startScale.x;
            const scaleFactorY = (startScale.y - delta.y * 2) / startScale.y;
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
          newScale.y = Math.max(1, startScale.y + delta.y * 2);
          break;
        case "r": // Right
          newScale.x = Math.max(1, startScale.x + delta.x * 2);
          break;
        case "b": // Bottom
          newScale.y = Math.max(1, startScale.y - delta.y * 2);
          break;
        case "l": // Left
          newScale.x = Math.max(1, startScale.x - delta.x * 2);
          break;
      }

      // Update the decal scale
      updateDecalScale(newScale);
    }
  };

  const handleRotating = () => {
    // Cast a ray from the camera through the mouse position
    dragRaycaster.current.setFromCamera(pointer, camera);

    // Check for intersections with the shirt mesh
    const intersects = dragRaycaster.current.intersectObject(
      meshRef.current!,
      false,
    );

    if (
      intersects.length > 0 &&
      startRotation &&
      startPointerPosition &&
      activeDecal?.position
    ) {
      const currentPoint = intersects[0].point;

      // Convert decal position to world space
      const worldDecalPos = activeDecal.position.clone();
      meshRef.current!.localToWorld(worldDecalPos);

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
  };

  return { handleClickMesh, handlePointerDown };
}
