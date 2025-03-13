"use client";

import { useClothingStore } from "@/lib/store";
import { Trash2 } from "lucide-react";

export function DecalControls() {
  const { decals, interaction, setDecalScale, removeDecal, setActiveDecal } = useClothingStore();
  const activeDecalId = interaction.activeDecalId;
  const isPlacingDecal = interaction.mode === "placing";

  // Find the active decal
  const activeDecal = decals.find((d) => d.id === activeDecalId);

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

      {/* Scale Controls - Only show if a decal is selected and not in placing mode */}
      {activeDecal && !isPlacingDecal && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Decal Scale
          </h4>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={activeDecal.scale}
              onChange={(e) => {
                setDecalScale(Number(e.target.value));
              }}
              className="flex-1"
            />
            <span className="w-8 text-gray-700">{activeDecal.scale}</span>
          </div>
        </div>
      )}
    </div>
  );
}
