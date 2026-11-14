// MANDATORY UTILITY CONTRACT: src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes deterministically without specificity conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Optical Border Radius Calculator:
 * Prevents pinched corners in nested Bento containers by computing
 * R_inner = max(0, R_outer - Padding)
 */
export function computeInnerRadius(outerRadiusPx: number, paddingPx: number): string {
  return `${Math.max(0, outerRadiusPx - paddingPx)}px`;
}
