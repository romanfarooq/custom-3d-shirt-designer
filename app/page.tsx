"use client";

import { gsap } from "gsap";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stage, OrbitControls } from "@react-three/drei";
import { useClothingStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShirtModel } from "@/components/shirt-model";
import { ColorPicker } from "@/components/color-picker";
import { DecalUploader } from "@/components/decal-uploader";
import { DecalControls } from "@/components/decal-controls";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

export default function Home() {
  const { interaction } = useClothingStore();
  const isDragging = interaction.mode === "dragging";
  const orbitControlsRef = useRef<OrbitControlsType | null>(null);

  // Function to smoothly reset camera
  const resetCamera = () => {
    if (orbitControlsRef.current) {
      // Get the current camera
      const camera = orbitControlsRef.current.object;
      const controls = orbitControlsRef.current;

      // Reset the target to the center of the shirt
      gsap.to(controls.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: "power2.inOut",
      });

      // Animate camera position to the reset position
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 53,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          // Update controls on each animation frame
          controls.update();
        },
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <header className="w-full border-b border-gray-100 px-8 py-6">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          FASHION <span className="text-destructive">STUDIO</span>
        </h1>
      </header>

      <div className="flex w-full flex-grow flex-col md:flex-row">
        {/* 3D Canvas - Left half on desktop */}
        <div className="bg-secondary relative h-[50vh] w-full overflow-hidden rounded-lg md:h-auto md:w-1/2">
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
              enablePan={!isDragging}
              enableRotate={!isDragging}
              enableZoom={!isDragging}
              minPolarAngle={Math.PI / 6} // Limit upward rotation (30 degrees from top)
              maxPolarAngle={Math.PI / 2} // Limit downward rotation (90 degrees - horizontal view)
              minDistance={25} // Prevent zooming too close/inside the shirt
              maxDistance={100} // Prevent zooming too far out
            />
          </Canvas>

          {/* Reset Camera Button */}
          <div className="absolute right-4 bottom-4 z-10">
            <Button
              variant="secondary"
              size="sm"
              className="cursor-pointer bg-white/80 shadow-md hover:bg-white"
              onClick={resetCamera}
            >
              Reset Camera
            </Button>
          </div>
        </div>

        {/* Customization Panel - Right half on desktop */}
        <div className="flex w-full flex-col justify-center p-8 md:w-1/2">
          <div className="mx-auto max-w-md">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Customize Your T-Shirt
            </h2>

            <DecalUploader />
            <DecalControls />
            <ColorPicker />
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
