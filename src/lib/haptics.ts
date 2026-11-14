// MANDATORY HAPTICS ENGINE CONTRACT: src/lib/haptics.ts
export type HapticPattern =
  | "tick"      // 6ms ultra-crisp micro-pulse for switches, checkboxes, segmented tabs
  | "impact"    // 12ms medium pulse for primary CTA press, dock tap, drawer snap
  | "success"   // Double ascending pulse for completed mutations
  | "warning"   // Double alert pulse for destructive confirmation prompts
  | "error";    // Triple staccato pulse for invalid form submission

const HAPTIC_SEQUENCES: Record<HapticPattern, number | number[]> = {
  tick: 6,
  impact: 12,
  success: [8, 40, 14],
  warning: [14, 50, 14],
  error: [16, 35, 16, 35, 22],
};

/**
 * Triggers hardware haptic feedback on supported mobile/PWA runtimes.
 * Automatically no-ops when prefers-reduced-motion is active or API is unavailable.
 */
export function triggerHaptic(pattern: HapticPattern = "tick"): void {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return;

  if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(HAPTIC_SEQUENCES[pattern]);
    } catch {
      /* Ignore blocked vibration calls prior to user gesture activation */
    }
  }
}
