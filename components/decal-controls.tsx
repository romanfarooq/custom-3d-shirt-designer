"use client";

import { Trash2 } from "lucide-react";
import { useClothingStore } from "@/lib/store";

export function DecalControls() {
  const { decals, interaction, removeDecal, setActiveDecal } = useClothingStore();
  const activeDecalId = interaction.activeDecalId;
  const isPlacingDecal = interaction.mode === "placing";

  if (decals.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-medium text-gray-800">Manage Decals</h3>

      {/* Decal Gallery */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        {decals.map((decal) => (
          <div
            key={decal.id}
            className={`relative cursor-pointer rounded border-2 p-1 ${
              activeDecalId === decal.id ? "border-accent" : "border-gray-200"
            }`}
            onClick={() => setActiveDecal(decal.id)}
          >
            <img
              src={decal.image || "/placeholder.svg"}
              alt="Decal"
              className="aspect-square h-full w-full object-contain"
            />
            <button
              className="bg-destructive hover:bg-destructive/80 absolute -top-2 -right-2 rounded-full p-1 text-white"
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

      {isPlacingDecal && (
        <p className="text-sm text-gray-500">
          Click on the shirt surface to place image
        </p>
      )}

      {activeDecalId && !isPlacingDecal && (
        <p className="text-sm text-gray-500">
          Drag the handles to resize or rotate the image
        </p>
      )}
    </div>
  );
}
