import { type Mesh, Raycaster } from "three";
import { type RefObject, useEffect, useRef } from "react";
import { type DecalItem, useClothingStore } from "@/lib/store";
import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";

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

  const dragRaycaster = useRef(new Raycaster());

  const isDragging = mode === "dragging";
  const isResizing = mode === "resizing";
  const isRotating = mode === "rotating";
  const isPlacingDecal = mode === "placing";

  useEffect(() => {
    function handleInActiveDecal() {
      if (!activeDecal?.id || mode !== "idle") return;
      setActiveDecal(null);
    }
    gl.domElement.addEventListener("click", handleInActiveDecal);
    return () => gl.domElement.removeEventListener("click", handleInActiveDecal);
  }, [activeDecal?.id, gl.domElement, mode, setActiveDecal]);

  useEffect(() => {
    function handleGlobalPointerUp() {
      if (isDragging || isResizing || isRotating) {
        setInteractionMode("idle", {
          offset: null,
          startScale: null,
          startRotation: null,
          activeControlPoint: null,
          startPointerPosition: null,
        });
      }
    }
    window.addEventListener("pointerup", handleGlobalPointerUp);
    return () => window.removeEventListener("pointerup", handleGlobalPointerUp);
  }, [isDragging, isResizing, isRotating, setInteractionMode]);

  function handleClickMesh(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();

    if (!meshRef.current || !isPlacingDecal || !activeDecal) return;

    const worldPosition = event.point;
    const localPosition = meshRef.current.worldToLocal(worldPosition.clone());

    placeDecal(localPosition);
  }

  function handlePointerDown(
    event: ThreeEvent<PointerEvent>,
    decal: DecalItem,
  ) {
    event.stopPropagation();

    if (!meshRef.current) return;

    setActiveDecal(decal);

    if (!decal?.position) return;

    const worldDecalPos = decal.position.clone();
    meshRef.current.localToWorld(worldDecalPos);

    const offset = worldDecalPos.clone().sub(event.point);
    setInteractionMode("dragging", { offset });
  }

  useFrame(() => {
    if (!meshRef.current) return;

    if (isDragging && dragOffset && activeDecal) {
      handleDragging();
    }

    if (
      startScale &&
      isResizing &&
      activeDecal &&
      activeControlPoint &&
      startPointerPosition
    ) {
      handleResizing();
    }

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

  function handleDragging() {
    dragRaycaster.current.setFromCamera(pointer, camera);

    const intersects = dragRaycaster.current.intersectObject(
      meshRef.current!,
      false,
    );

    if (intersects.length > 0 && dragOffset) {
      const hitPoint = intersects[0].point.clone().add(dragOffset);

      const localPosition = meshRef.current!.worldToLocal(hitPoint);

      updateDecalPosition(localPosition);
    }
  }

  function handleResizing() {
    dragRaycaster.current.setFromCamera(pointer, camera);

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

      const delta = currentPoint.clone().sub(startPointerPosition);

      const newScale = startScale.clone();

      switch (activeControlPoint) {
        case "tl":
          {
            const scaleFactorX = (startScale.x - delta.x * 2) / startScale.x;
            const scaleFactorY = (startScale.y + delta.y * 2) / startScale.y;
            const uniformScaleFactor = Math.max(
              Math.min(scaleFactorX, scaleFactorY),
              0.1,
            );
            newScale.x = Math.max(1, startScale.x * uniformScaleFactor);
            newScale.y = Math.max(1, startScale.y * uniformScaleFactor);
          }
          break;
        case "tr":
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
        case "bl":
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
        case "br":
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

        case "t":
          newScale.y = Math.max(1, startScale.y + delta.y * 2);
          break;
        case "r":
          newScale.x = Math.max(1, startScale.x + delta.x * 2);
          break;
        case "b":
          newScale.y = Math.max(1, startScale.y - delta.y * 2);
          break;
        case "l":
          newScale.x = Math.max(1, startScale.x - delta.x * 2);
          break;
      }

      updateDecalScale(newScale);
    }
  }

  function handleRotating() {
    dragRaycaster.current.setFromCamera(pointer, camera);

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

      const worldDecalPos = activeDecal.position.clone();
      meshRef.current!.localToWorld(worldDecalPos);

      const startVector = startPointerPosition.clone().sub(worldDecalPos);
      const currentVector = currentPoint.clone().sub(worldDecalPos);

      const startAngle = Math.atan2(startVector.y, startVector.x);
      const currentAngle = Math.atan2(currentVector.y, currentVector.x);
      const angleDelta = startAngle - currentAngle;

      const newRotation = startRotation.clone();
      newRotation.z = startRotation.z + angleDelta;

      updateDecalRotation(newRotation);
    }
  }

  return { handleClickMesh, handlePointerDown };
}
