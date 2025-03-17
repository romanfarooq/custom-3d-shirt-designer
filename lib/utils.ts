import { CanvasTexture } from "three";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isLightColor(hex: string): boolean {
  // Cache the threshold value
  const BRIGHTNESS_THRESHOLD = 130; /* about half of 256. Lower threshold for darker colors */

  // Handle edge cases
  if (!hex || hex.length < 7) return true;

  // Use bitwise operations for faster parsing
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > BRIGHTNESS_THRESHOLD;
}

export function generateTextTexture(text: string, color: string = "black") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error("CanvasRenderingContext2D is not available.");
    return null;
  }

  canvas.width = 512;
  canvas.height = 256;

  ctx.fillStyle = color;
  ctx.font = "Bold 50px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.flipY = false;
  return texture;
}
