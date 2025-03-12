"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stage, OrbitControls } from "@react-three/drei";
import { ShirtModel } from "@/components/shirt-model";
import { ColorPicker } from "@/components/color-picker";
import { DecalUploader } from "@/components/decal-uploader";
import { DecalControls } from "@/components/decal-controls";
import { useClothingStore } from "@/lib/store";

export default function Home() {
  const { isPlacingDecal } = useClothingStore();

  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <header className="w-full py-6 px-8 border-b border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          FASHION <span className="text-destructive">STUDIO</span>
        </h1>
      </header>

      <div className="flex flex-col md:flex-row w-full flex-grow">
        {/* 3D Canvas - Left half on desktop */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-auto bg-secondary rounded-lg overflow-hidden relative">
          <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.6}>
                <ShirtModel />
              </Stage>
            </Suspense>
            <OrbitControls
              enablePan={!isPlacingDecal}
              enableRotate={!isPlacingDecal}
              enableZoom={!isPlacingDecal}
            />
          </Canvas>

          {isPlacingDecal && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-gray-800 font-medium">
                  Click on the shirt to place your decal
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Customization Panel - Right half on desktop */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
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
