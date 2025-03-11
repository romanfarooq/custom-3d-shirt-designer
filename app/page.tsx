"use client";

import * as THREE from "three";
import { Suspense, useRef } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { cn, isLightColor } from "@/lib/utils";
import { useClothingStore } from "@/lib/store";
import {
  Stage,
  Decal,
  useGLTF,
  useTexture,
  OrbitControls,
} from "@react-three/drei";

function ManShirtModel() {
  const texture = useTexture("/placeholder.jpg");
  const meshRef = useRef<THREE.Mesh | null>(null);
  const { nodes, materials } = useGLTF("/shirt_man.glb");
  const { color, decalPosition, setDecalPosition } = useClothingStore();

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    if (!meshRef.current) return;

    // Get click position and normal
    const worldPosition = event.point;
    const localPosition = meshRef.current.worldToLocal(worldPosition.clone());

    setDecalPosition({
      scale: [10, 10, 10],
      position: localPosition?.toArray(),
      rotation: [Math.PI / 2, 0, Math.PI],
    });
  };

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      material={materials.manShad}
      geometry={(nodes.man as THREE.Mesh).geometry}
      position={[0, -0.8, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <meshStandardMaterial color={color} />
      {decalPosition && (
        <Decal
          scale={decalPosition.scale}
          position={decalPosition.position}
          rotation={decalPosition.rotation}
        >
          <meshPhongMaterial
            map={texture}
            transparent
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </Decal>
      )}
    </mesh>
  );
}

const colorOptions = [
  { name: "White", value: "#F3F4F6" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Red", value: "#EF4444" },
  { name: "Green", value: "#10B981" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Black", value: "#1F2937" },
];

// Main component
export default function Home() {
  const { color, setColor } = useClothingStore();

  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <header className="w-full py-6 px-8 border-b border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          FASHION <span className="text-destructive">STUDIO</span>
        </h1>
      </header>

      <div className="flex flex-col md:flex-row w-full flex-grow">
        {/* 3D Canvas - Left half on desktop */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-auto bg-secondary rounded-lg overflow-hidden">
          <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.6}>
                <ManShirtModel />
              </Stage>
            </Suspense>
            <OrbitControls />
          </Canvas>
        </div>

        {/* Customization Panel - Right half on desktop */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Customize Your T-Shirt
            </h2>

            {/* Color selection */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-800">
                Choose Color
              </h3>
              <div className="flex gap-3 flex-wrap">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 cursor-pointer transition-all hover:scale-110",
                      color === colorOption.value
                        ? "border-accent"
                        : "border-gray-200"
                    )}
                    style={{ backgroundColor: colorOption.value }}
                    onClick={() => setColor(colorOption.value)}
                    title={colorOption.name}
                  />
                ))}

                {/* Custom color picker - inline with other colors */}
                <div className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 cursor-pointer rounded-sm overflow-hidden absolute inset-0 opacity-0"
                  />
                  <div
                    className={cn(
                      "w-10 h-10 rounded-sm border-2 transition-all hover:scale-110 flex items-center justify-center",
                      colorOptions.some((opt) => opt.value === color)
                        ? "border-gray-200"
                        : "border-accent"
                    )}
                    style={{ backgroundColor: color }}
                    title="Custom Color"
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: isLightColor(color) ? "#000" : "#fff" }}
                    >
                      +
                    </span>
                  </div>
                </div>
              </div>
            </div>
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

// Preload models
useGLTF.preload("/shirt_man.glb");
useTexture.preload("/placeholder.jpg");
