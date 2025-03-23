"use client";

import { useState } from "react";
import { useClothingStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

export function TextDecalInput() {
  const {
    addTextDecal,
    updateTextDecal,
    interaction: { activeDecal, mode },
  } = useClothingStore();
  const isPlacingDecal = mode === "placing";
  const [textDecalState, setTextDecalState] = useState({
    text: "",
    fontFamily: "",
    isBold: false,
    isItalic: false,
    isUnderline: false,
    fontSize: "24",
  });

  const handleAddText = () => {
    if (!textDecalState.text.trim() || !textDecalState.fontFamily) return;
    if (activeDecal?.id && activeDecal?.type === "text") {
      updateTextDecal({
        ...textDecalState,
        fontSize: parseInt(textDecalState.fontSize) || 24,
      });
    } else {
      addTextDecal({
        ...textDecalState,
        fontSize: parseInt(textDecalState.fontSize) || 24,
      });
    }
  };

  return (
    <div className="mb-4">
      <h3 className="mb-4 text-lg font-medium text-gray-800">Add Text</h3>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 space-y-2">
            <Label className="block text-sm font-medium text-gray-600">
              Text
            </Label>
            <Input
              type="text"
              value={textDecalState.text}
              onChange={(e) =>
                setTextDecalState((prev) => ({ ...prev, text: e.target.value }))
              }
              placeholder="Enter text"
              className="focus:border-accent focus:ring-primary/30 h-10 w-full rounded-lg border border-gray-300 px-3 focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="space-y-2 md:w-1/3">
            <Label className="block text-sm font-medium text-gray-600">
              Font
            </Label>
            <Select
              value={textDecalState.fontFamily}
              onValueChange={(value) =>
                setTextDecalState((prev) => ({ ...prev, fontFamily: value }))
              }
            >
              <SelectTrigger className="focus:border-primary focus:ring-primary/30 h-10 w-full rounded-lg border border-gray-300 focus:ring-2">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-gray-200 shadow-md">
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 space-y-2">
            <Label className="block text-sm font-medium text-gray-600">
              Text Formatting
            </Label>
            <ToggleGroup
              type="multiple"
              className="justify-start"
              onValueChange={(values) =>
                setTextDecalState((prev) => ({
                  ...prev,
                  isBold: values.includes("bold"),
                  isItalic: values.includes("italic"),
                  isUnderline: values.includes("underline"),
                }))
              }
            >
              <ToggleGroupItem
                value="bold"
                aria-label="Toggle bold"
                className="cursor-pointer"
              >
                <Bold className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="italic"
                aria-label="Toggle italic"
                className="cursor-pointer"
              >
                <Italic className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="underline"
                aria-label="Toggle underline"
                className="cursor-pointer"
              >
                <Underline className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2 md:w-1/3">
            <Label className="block text-sm font-medium text-gray-600">
              Font Size
            </Label>
            <Input
              type="number"
              min="12"
              max="72"
              value={textDecalState.fontSize}
              onChange={(e) =>
                setTextDecalState((prev) => ({
                  ...prev,
                  fontSize: e.target.value,
                }))
              }
              className="focus:border-accent focus:ring-primary/30 h-10 w-full rounded-lg border border-gray-300 px-3 focus:ring-2 focus:outline-none"
            />
          </div>
        </div>

        <Button
          onClick={handleAddText}
          className="h-10 w-full cursor-pointer rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white transition-colors hover:from-indigo-700 hover:to-purple-700"
        >
          {activeDecal?.id && activeDecal?.type === "text"
            ? "Update Text"
            : "Add Text"}{" "}
          to Shirt
        </Button>

        {isPlacingDecal && activeDecal?.type === "text" && (
          <p className="mt-1 text-sm text-gray-500 italic">
            Click on the shirt surface to place text
          </p>
        )}
      </div>

      {activeDecal && !isPlacingDecal && (
        <p className="mt-4 text-sm text-gray-500">
          Drag the handles to resize or rotate the image or text
        </p>
      )}
    </div>
  );
}
