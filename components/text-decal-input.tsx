"use client";

import { useState } from "react";
import { useClothingStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    interaction: { mode },
  } = useClothingStore();
  const isPlacingDecal = mode === "placing";
  const [text, setText] = useState("");
  const [fontFamily, setFontFamily] = useState("");

  const handleAddText = () => {
    if (!text.trim() || !fontFamily) return;
    addTextDecal(text, fontFamily);
    setText("");
    setFontFamily("");
  };

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-medium text-gray-800">Add Text</h3>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 space-y-2">
            <Label className="block text-sm font-medium text-gray-600">
              Text
            </Label>
            <Input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text"
              className="focus:border-accent focus:ring-primary/30 h-10 w-full rounded-lg border border-gray-300 px-3 focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="space-y-2 md:w-1/3">
            <Label className="block text-sm font-medium text-gray-600">
              Font
            </Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
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

        <Button
          onClick={handleAddText}
          className="h-10 w-full cursor-pointer rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white transition-colors hover:from-indigo-700 hover:to-purple-700"
        >
          Add Text to Shirt
        </Button>

        {isPlacingDecal && (
          <p className="mt-1 text-sm text-gray-500 italic">
            Click on the shirt surface to place text
          </p>
        )}
      </div>
    </div>
  );
}
