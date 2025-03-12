"use client";

import { useClothingStore } from "@/lib/store";

export function DecalControls() {
  const { decal, setDecalScale, interaction } = useClothingStore();
  const isPlacingDecal = interaction.mode === "placing";

  if (!decal || !decal.position) return null;

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-medium text-gray-800">Decal Scale</h3>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min="1"
          max="20"
          step="1"
          value={decal.scale}
          onChange={(e) => {
            setDecalScale(Number(e.target.value));
          }}
          className="flex-1"
          disabled={isPlacingDecal}
        />
        <span className="w-8 text-gray-700">{decal.scale}</span>
      </div>
    </div>
  );
}
