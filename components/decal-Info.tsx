"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useClothingStore } from "@/lib/store";

export function DecalInfo() {
  const {
    decals,
    removeDecal,
    setActiveDecal,
    interaction: { activeDecal, mode },
  } = useClothingStore();
  const isPlacingDecal = mode === "placing";

  if (decals.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-medium text-gray-800">Manage Images</h3>

      {/* Decal Gallery */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        {decals.map(
          (decal) =>
            decal.type === "image" && (
              <div
                key={decal.id}
                className={cn(
                  "relative cursor-pointer rounded border-2 p-1",
                  activeDecal?.id === decal.id
                    ? "border-black"
                    : "border-gray-200",
                )}
                onClick={() => setActiveDecal(decal)}
              >
                <Image
                  src={decal.image!}
                  alt="Decal"
                  height={50}
                  width={50}
                  className="aspect-square h-full w-full object-contain"
                />
                <button
                  className="bg-destructive hover:bg-destructive/80 absolute -top-2 -right-2 cursor-pointer rounded-full p-1 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDecal(decal.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ),
        )}
      </div>

      {isPlacingDecal && (
        <p className="text-sm text-gray-500">
          Click on the shirt surface to place image or text
        </p>
      )}
    </div>
  );
}
