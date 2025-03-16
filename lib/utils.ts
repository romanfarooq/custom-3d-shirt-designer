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
