"use client";

import { useClothingStore } from "@/lib/store";

export function DecalUploader() {
  const { interaction, addDecal } = useClothingStore();
  const isPlacingDecal = interaction.mode === "placing";

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const aspect = img.width / img.height;
        const objectUrl = URL.createObjectURL(file);
        addDecal(objectUrl, aspect);
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-medium text-gray-800">Upload Decal</h3>
      <div className="flex flex-col gap-3">
        <label className="hover:border-accent flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <span className="text-gray-500">Click to Upload Image</span>
        </label>

        {isPlacingDecal && (
          <p className="text-sm text-gray-500">
            Click on the shirt surface to place image
          </p>
        )}
      </div>
    </div>
  );
}
