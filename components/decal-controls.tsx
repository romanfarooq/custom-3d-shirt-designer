"use client";

import { useClothingStore } from "@/lib/store";

export function DecalControls() {
  const { decal, setDecalScale, isPlacingDecal } = useClothingStore();

  if (!decal || !decal.position) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4 text-gray-800">Decal Scale</h3>
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
        <span className="text-gray-700 w-8">{decal.scale}</span>
      </div>
    </div>
  );
}
