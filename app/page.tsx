"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useState, useEffect, Suspense } from "react";
import {
  Stage,
  Center,
  useGLTF,
  Environment,
  OrbitControls,
} from "@react-three/drei";

// Model component
function TShirtModel({ color }: { color: string }) {
  const { scene } = useGLTF("/shirt.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const meshChild = child as THREE.Mesh;
        if (meshChild.material) {
          if (meshChild.material instanceof THREE.MeshStandardMaterial) {
            meshChild.material.color = new THREE.Color(color);
          } else {
            meshChild.material = new THREE.MeshStandardMaterial({ color });
          }
        }
      }
    });
  }, [scene, color]);

  return <primitive object={scene} scale={1.5} position={[0, 0, 0]} />;
}

// Main component
export default function Home() {
  const [color, setColor] = useState("#F3F4F6"); // Default color

  const colorOptions = [
    { name: "White", value: "#F3F4F6" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Red", value: "#EF4444" },
    { name: "Green", value: "#10B981" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Yellow", value: "#F59E0B" },
    { name: "Black", value: "#1F2937" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <header className="w-full py-6 px-8 border-b border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-900">FASHION <span className="text-accent">STUDIO</span></h1>
      </header>

      <div className="flex flex-col md:flex-row w-full flex-grow">
        {/* 3D Canvas - Left half on desktop */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-auto bg-secondary rounded-lg overflow-hidden">
          <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.5}>
                <Center>
                  <TShirtModel color={color} />
                </Center>
              </Stage>
            </Suspense>
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
            />
            <Environment preset="city" />
          </Canvas>
        </div>

        {/* Customization Panel - Right half on desktop */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Customize Your T-Shirt</h2>
            
            {/* Color selection */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-800">Choose Color</h3>
              <div className="flex gap-3 flex-wrap">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    className={`w-10 h-10 rounded-full border-2 ${
                      color === colorOption.value
                        ? "border-accent"
                        : "border-gray-200"
                    } transition-all hover:scale-110`}
                    style={{ backgroundColor: colorOption.value }}
                    onClick={() => setColor(colorOption.value)}
                    title={colorOption.name}
                  />
                ))}
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
useGLTF.preload("/shirt.glb");
