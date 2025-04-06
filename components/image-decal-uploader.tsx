"use client";

import { type ChangeEvent, useRef } from "react";
import { Label } from "@/components/ui/label";
import { useClothingStore } from "@/lib/store";

export function ImageDecalUploader() {
  const {
    addImageDecal,
    interaction: { activeDecal, mode },
  } = useClothingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPlacingDecal = mode === "placing";

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;

    img.onload = () => {
      const aspect = img.width / img.height;
      addImageDecal(objectUrl, aspect);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
  };

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-medium text-gray-800">Add Image</h3>
      <div className="flex flex-col gap-3">
        <Label className="hover:border-accent flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <span className="text-gray-500">Click to Upload Image</span>
        </Label>

        {isPlacingDecal && activeDecal?.type === "image" && (
          <p className="text-sm text-gray-500 italic">
            Click on the shirt surface to place image
          </p>
        )}
      </div>
    </div>
  );
}
