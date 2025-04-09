"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Trash2, Type } from "lucide-react";
import { useShallow } from "zustand/shallow";
import { useClothingStore } from "@/lib/store";

export function DecalInfo() {
  const { mode, decals, removeDecal, activeDecal, setActiveDecal } =
    useClothingStore(
      useShallow((state) => ({
        decals: state.decals,
        mode: state.interaction.mode,
        removeDecal: state.removeDecal,
        setActiveDecal: state.setActiveDecal,
        activeDecal: state.interaction.activeDecal,
      })),
    );

  if (decals.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-medium text-gray-800">Manage Texture</h3>

      {/* Decal Gallery */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        {decals.map((decal) => (
          <div
            key={decal.id}
            onClick={() => setActiveDecal(decal)}
            className={cn(
              "relative cursor-pointer rounded border-2 p-1",
              activeDecal?.id === decal.id ? "border-black" : "border-gray-200",
            )}
          >
            {decal.type === "image" && decal.image ? (
              <Image
                src={decal.image}
                alt="Image Texture"
                width={100}
                height={100}
                className="aspect-square h-full w-full object-contain"
              />
            ) : decal.type === "text" && decal.text ? (
              <div className="flex aspect-square h-full w-full items-center justify-center bg-gray-100">
                <Type className="h-6 w-6 text-gray-600" />
                <span className="ml-1 truncate text-xs text-gray-800">
                  {decal.text.substring(0, 8)}
                </span>
              </div>
            ) : null}
            <button
              className="bg-destructive absolute -top-2 -right-2 cursor-pointer rounded-full p-1 text-white hover:bg-red-700"
              onClick={(e) => {
                e.stopPropagation();
                removeDecal(decal.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {mode === "placing" && (
        <p className="text-sm text-gray-500">
          Click on the shirt surface to place image or text
        </p>
      )}
    </div>
  );
}
