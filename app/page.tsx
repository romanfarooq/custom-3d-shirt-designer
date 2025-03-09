"use client";

import * as THREE from "three";
import { Image, Upload } from "lucide-react";
import { cn, isLightColor } from "@/lib/utils";
import { Canvas } from "@react-three/fiber";
import { useState, useEffect, Suspense, useRef } from "react";
import {
  Stage,
  Decal,
  Center,
  useGLTF,
  useTexture,
  Environment,
  OrbitControls,
} from "@react-three/drei";

interface ImageDetails {
  url: string;
  scale: number;
  visible: boolean;
}

interface TShirtModelProps {
  color: string;
  imageDetails: ImageDetails;
}

// Model component
function TShirtModel({ color, imageDetails }: TShirtModelProps) {
  const { scene } = useGLTF("/shirt.glb");
  const groupRef = useRef<THREE.Group>(null);
  const shirtMeshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(imageDetails.url);

  // Find and store the shirt mesh reference
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const meshChild = child as THREE.Mesh;
        if (meshChild.material) {
          // Store the first mesh we find (which should be the shirt)
          if (!shirtMeshRef.current) {
            shirtMeshRef.current = meshChild;
          }

          // Update material color
          if (meshChild.material instanceof THREE.MeshStandardMaterial) {
            meshChild.material.color = new THREE.Color(color);
          } else {
            meshChild.material = new THREE.MeshStandardMaterial({ color });
          }
        }
      }
    });
  }, [scene, color]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.5} position={[0, 0, 0]} />

      {/* Apply decal directly to the shirt mesh */}
      {imageDetails.url && imageDetails.visible && shirtMeshRef.current && (
        <Decal
          mesh={shirtMeshRef as React.RefObject<THREE.Mesh>}
          scale={imageDetails.scale}
          position={[0, 0.15, 0.15]}
          rotation={[0, 0, 0]}
        >
          <meshPhysicalMaterial
            transparent
            polygonOffset
            polygonOffsetFactor={-1}
            map={texture}
          />
        </Decal>
      )}
    </group>
  );
}

interface ColorOption {
  name: string;
  value: string;
}

interface ImageDetailsState {
  url: string;
  scale: number;
  visible: boolean;
}

// Main component
export default function Home() {
  const [color, setColor] = useState<string>("#F3F4F6"); // Default color
  const [imageDetails, setImageDetails] = useState<ImageDetailsState>({
    url: "",
    scale: 0.5, // Adjusted scale for better visibility
    visible: false,
  });

  // Function to handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.match("image.*")) {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const target = event.target;
        if (target && target.result) {
          setImageDetails((prev) => ({
            ...prev,
            url: target.result as string,
            visible: true,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to toggle image visibility
  const toggleImageVisibility = () => {
    setImageDetails((prev) => ({
      ...prev,
      visible: !prev.visible,
    }));
  };

  // Function to adjust image scale
  const adjustImageScale = (value: number) => {
    setImageDetails((prev) => ({
      ...prev,
      scale: value,
    }));
  };

  const colorOptions: ColorOption[] = [
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
        <h1 className="text-3xl font-bold text-center text-gray-900">
          FASHION <span className="text-destructive">STUDIO</span>
        </h1>
      </header>

      <div className="flex flex-col md:flex-row w-full flex-grow">
        {/* 3D Canvas - Left half on desktop */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-auto bg-secondary rounded-lg overflow-hidden">
          <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.5}>
                <Center>
                  <TShirtModel color={color} imageDetails={imageDetails} />
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
                      "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                      color === colorOption.value
                        ? "border-accent"
                        : "border-gray-200"
                    )}
                    style={{ backgroundColor: colorOption.value }}
                    onClick={() => setColor(colorOption.value)}
                    title={colorOption.name}
                  />
                ))}

                {/* Custom color picker - now inline with other colors */}
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

            {/* Image upload section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-800">
                Add Image
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center justify-center w-full h-12 px-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">Upload Image</span>
                  </label>

                  {imageDetails.url && (
                    <button
                      onClick={toggleImageVisibility}
                      className={cn(
                        "flex items-center justify-center h-12 px-4 border-2 rounded-md transition-colors",
                        imageDetails.visible
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-gray-300 text-gray-500"
                      )}
                    >
                      <Image className="w-5 h-5 mr-2" />
                      <span className="text-sm">
                        {imageDetails.visible ? "Hide Image" : "Show Image"}
                      </span>
                    </button>
                  )}
                </div>

                {/* Scale slider for the image */}
                {imageDetails.url && imageDetails.visible && (
                  <div className="mt-4">
                    <label className="text-sm text-gray-600 block mb-2">
                      Image Size: {(imageDetails.scale * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={imageDetails.scale}
                      onChange={(e) =>
                        adjustImageScale(parseFloat(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                )}
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
