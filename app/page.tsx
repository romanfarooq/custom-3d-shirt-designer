"use client";

import { gsap } from "gsap";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useShallow } from "zustand/shallow";
import { useClothingStore } from "@/lib/store";
import { Stage, OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ShirtModel } from "@/components/shirt-model";
import { DecalInfo } from "@/components/decal-Info";
import { ColorPicker } from "@/components/color-picker";
import { TextDecalInput } from "@/components/text-decal-input";
import { ImageDecalUploader } from "@/components/image-decal-uploader";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

export default function Home() {
  const orbitControlsRef = useRef<OrbitControlsType>(null);

  const { mode } = useClothingStore(
    useShallow((state) => ({
      mode: state.interaction.mode,
    })),
  );

  const isDragging = mode === "dragging";
  const isRotating = mode === "rotating";
  const isResizing = mode === "resizing";

  function resetCamera() {
    if (orbitControlsRef.current) {
      const camera = orbitControlsRef.current.object;
      const controls = orbitControlsRef.current;

      gsap.to(controls.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: "power2.inOut",
      });

      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 53,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => controls.update(),
      });
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-white pt-16">
      <header className="fixed top-0 left-0 z-50 w-full border-b border-gray-100 bg-white px-8 py-5">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          THREADO <span className="text-destructive">STUDIO</span>
        </h1>
      </header>

      <div className="flex w-full flex-grow flex-col">
        <div className="bg-secondary relative h-[50vh] w-full overflow-hidden md:fixed md:bottom-0 md:left-0 md:h-[calc(100vh-72px)] md:w-1/2">
          <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.6}>
                <ShirtModel />
              </Stage>
            </Suspense>
            <OrbitControls
              ref={orbitControlsRef}
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={25}
              maxDistance={100}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2}
              enabled={!isDragging && !isRotating && !isResizing}
            />
          </Canvas>

          <div className="absolute right-4 bottom-4 z-10">
            <Button
              size="sm"
              variant="secondary"
              className="cursor-pointer bg-white/80 shadow-md hover:bg-white"
              onClick={resetCamera}
            >
              Reset Camera
            </Button>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center p-8 md:ml-[50%] md:w-1/2">
          <div className="mx-auto max-w-md">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Customize Your T-Shirt
            </h2>

            <ImageDecalUploader />
            <TextDecalInput />
            <ColorPicker />
            <DecalInfo />
          </div>

          <div className="mt-auto pt-4 text-center">
            <p className="text-sm text-gray-500">
              Use mouse to rotate, scroll to zoom, and right-click to pan
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
