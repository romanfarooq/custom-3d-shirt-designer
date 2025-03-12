"use client";

import { useClothingStore } from "@/lib/store";

export function DecalUploader() {
  const { decal, setDecalImage, startPlacingDecal } = useClothingStore();

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
        setDecalImage(objectUrl, aspect);
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4 text-gray-800">Upload Decal</h3>
      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-center w-full h-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-accent transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <span className="text-gray-500">
            {decal ? "Image Uploaded ✓" : "Click to Upload Image"}
          </span>
        </label>

        {decal && decal.position && (
          <button
            onClick={startPlacingDecal}
            className="text-sm text-accent hover:underline"
          >
            Reposition decal
          </button>
        )}
      </div>
    </div>
  );
}
