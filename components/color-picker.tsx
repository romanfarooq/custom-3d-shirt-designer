"use client";

import { cn, isLightColor } from "@/lib/utils";
import { useClothingStore } from "@/lib/store";

const colorOptions = [
  { name: "White", value: "#F3F4F6" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Red", value: "#EF4444" },
  { name: "Green", value: "#10B981" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Black", value: "#1F2937" },
];

export function ColorPicker() {
  const { color, setColor } = useClothingStore();

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4 text-gray-800">Choose Color</h3>
      <div className="flex gap-3 flex-wrap">
        {colorOptions.map((colorOption) => (
          <button
            key={colorOption.value}
            className={cn(
              "w-10 h-10 rounded-full border-2 cursor-pointer transition-all hover:scale-110",
              color === colorOption.value ? "border-accent" : "border-gray-200"
            )}
            style={{ backgroundColor: colorOption.value }}
            onClick={() => setColor(colorOption.value)}
            title={colorOption.name}
          />
        ))}

        {/* Custom color picker - inline with other colors */}
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
  );
}
