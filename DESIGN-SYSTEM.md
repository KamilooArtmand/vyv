# UNIVERSAL MASTER ARCHITECTURAL SPECIFICATION

**SYSTEM CODENAME:** ARGON-V1 (NO-UI / OPTICAL MONOCHROME / 120FPS HARDWARE CHOREOGRAPHY) **DEFAULT POLARITY:** LIGHT MODE FIRST (`#FFFFFF` / `#F6F7F9` / `#A2A8B2` / `#000000`) WITH OBSIDIAN DARK MODE (`#08080A` / `#111215`) **TARGET RUNTIME:** Next.js (App Router / RSC), React 19, TypeScript 5.x (Strict), Tailwind CSS, Radix UI / Base UI, Framer Motion (`motion/react`)

---

## SECTION 0: MASTER AGENT DIRECTIVES & EXECUTION PROTOCOL

### 0.1 Prime Directive for AI Coding Agents

When this specification is loaded into your context window (Cursor, Windsurf, Claude, Antigravity, or any automated refactoring agent), treat every token, mathematical formula, CSS rule, and component contract in this document as an **immutable architectural law**. You are forbidden from improvising generic styling, introducing uncalibrated Tailwind colors, or outputting high-level placeholder implementations.

Your mission is to construct or refactor the target codebase into an ultra-minimalist, **"No-UI" (Invisible Interface)** digital product that surpasses the visual precision of Linear, Vercel Geist, Framer, Raycast, and Apple visionOS/iOS 18\.

### 0.2 The "No-UI" & Anti-AI-Slop Enforcement Matrix

AI-generated interfaces fail because they rely on decorative clutter to mask poor spatial hierarchy. You must actively scan for, strip out, and replace the following banned patterns across the entire codebase:

| Banned Pattern ("AI Slop") | Mandatory Argon Replacement |
| :---- | :---- |
| Neon purple, cyan, pink, or multi-stop rainbow gradients (`from-purple-500 to-cyan-500`) | Monochromatic luminance shifts, pure carbon/alabaster surfaces, or subtle 2-stop vertical surface sheens (`rgba(255,255,255,0.04)` to `transparent`). |
| Default dark-mode-only startup with glowing sci-fi borders | **Light Mode (`light`) enforced as default root state.** Crisp `#FFFFFF` primary surfaces on `#F6F7F9` secondary canvas with `1px solid` structural hairlines. |
| Heavy drop shadows (`shadow-lg`, `shadow-xl`, `shadow-2xl` with high alpha) | Whisper-quiet multi-layered ambient elevation (max alpha `0.04` in light mode) or structural `1px` hairline borders (`--border-subtle`). |
| Nested "Box-in-a-Box" card bloat (cards inside cards with redundant padding) | Structural 1px hairlines (`divide-y`, `border-b`), negative space, and typographic contrast. Remove intermediate wrapper containers. |
| Raw Tailwind palette utilities (`bg-gray-800`, `text-slate-400`, `border-zinc-700`) | Semantic OKLCH CSS variables (`bg-surface-primary`, `text-ink-secondary`, `border-hairline-default`). |
| Linear or standard CSS transitions (`transition-all duration-300 ease-in-out`) | Explicit property transitions (`transition-[transform,opacity,background-color]`) driven by custom optical bezier curves or 120fps spring physics. |
| Physical directional CSS (`ml-4`, `pr-2`, `left-0`, `text-left`, `border-l`) | Logical CSS properties (`ms-4`, `pe-2`, `start-0`, `text-start`, `border-s`) for zero-regression LTR/RTL bi-directional parity. |
| Jittery numeric counters, timers, tables, and financial metrics | Strict enforcement of `font-variant-numeric: tabular-nums` (`tabular-nums`) and optical monospace alignment. |

### 0.3 Deterministic Codebase Refactoring Pipeline

When instructed to upgrade an existing repository or scaffold a new application using `DESIGN-SYSTEM.md`, execute changes strictly in this six-step sequence:

1. **Step 1 — AST & Stylesheet Audit:** Scan `package.json`, global CSS files (`globals.css`), `tailwind.config.ts`, and root layout files (`app/layout.tsx`). Identify all legacy color variables, hardcoded hex codes, non-logical directional utilities, and unmanaged font imports.  
2. **Step 2 — Root Polarity & Token Injection:** Inject the complete `:root` (Light Mode default) and `.dark` (Obsidian Dark Mode) OKLCH token engine into `globals.css`. Configure the root `<html>` tag with `dir="auto"` (or dynamic locale direction), `className="light"`, and antialiased font-rendering rules.  
3. **Step 3 — Multi-Script Font & Spatial Grid Binding:** Bind the Latin Sans, Monospace, and RTL (Persian/Kurdish/Arabic) font variables to the root layout. Enforce the 4px/8px spatial grid, `100dvh` viewport locking, and optical radius equations.  
4. **Step 4 — Atomic Primitive Replacement:** Refactor all base interactive elements (`button`, `input`, `select`, `textarea`, `badge`, `avatar`, `toggle`) to adhere strictly to Section 5 state matrices (default, hover, active press scale, focus-visible ring, disabled, loading).  
5. **Step 5 — Surface & Bento Architecture Normalization:** Convert cluttered dashboard views and modal overlays into structural Bento grids, Liquid Glass floating decks, and Vaul/Radix overlays defined in Section 6\.  
6. **Step 6 — 120FPS Motion & Ergonomic Verification:** Replace CSS layout jumps with Framer Motion `layoutId` projection and spring presets (Section 4). Verify keyboard navigation (`roving tabindex`, `Cmd+K`), touch hit-targets (minimum `44x44px`), and WCAG AAA contrast compliance.

### 0.4 Strict TypeScript & React 19 Engineering Contracts

Every component generated or refactored under this specification must comply with the following architectural constraints:

```
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
```

* **React 19 Ref Forwarding:** Do not use deprecated `React.forwardRef` in React 19 codebases; accept `ref` directly as a standard prop in the component signature (`ref?: React.Ref<HTMLButtonElement>`), while maintaining `data-slot` attributes on every primitive root node for deterministic styling inspection.  
* **Server/Client Boundary Hygiene:** Keep layout shells, Bento grids, data tables, and typography primitives as React Server Components (RSC) by default. Isolate `"use client"` strictly to interactive leaf nodes requiring state, event listeners, or `motion/react` spring physics.  
* **Zero Layout Shift (CLS \= 0.000):** Every asynchronous boundary, image container, font load, and dynamic metric must reserve explicit geometric dimensions or render a hardware-composited shimmer skeleton matching the exact final bounding box.

---

## SECTION 1: CORE DESIGN TOKENS, OKLCH COLOR ENGINE & OPTICAL POLARITY

### 1.1 Optical Color Science & Default Light Polarity Mandate

1. **Light Mode Default (`:root` / `.light`):** The system MUST initialize in Light Mode by default unless the user explicitly toggles Dark Mode or a persisted user preference overrides it. Do not default to system dark mode on first visit unless instructed.  
2. **Perceptual Uniformity via OKLCH:** All tokens are engineered in the **OKLCH** color space (`oklch(Lightness Chroma Hue / Alpha)`) so that lightness steps (`L`) produce identical perceived contrast across all hues and surfaces.  
3. **Achromatic Structural Purity:** Light polarity pairs Pure White (`#FFFFFF`) elevated interactive surfaces against a Cool Alabaster (`#F6F7F9` / `#F3F4F6`) architectural canvas, anchored by Titanium Gray (`#A2A8B2`) metadata and Carbon Black (`#000000` / `#09090B`) primary ink.  
4. **Obsidian Dark Polarity (`.dark`):** Dark mode avoids muddy mid-grays. It utilizes a Deep Carbon void (`#08080A`), Elevated Obsidian surfaces (`#111215`), and top-edge specular inner highlights (`inset 0 1px 0 0 rgba(255, 255, 255, 0.07)`) to simulate overhead light catching physical anodized aluminum or smoked glass.

### 1.2 Master Token Architecture (`src/styles/globals.css`)

Inject the following complete CSS token architecture verbatim into the global stylesheet:

```css
@layer base {
  :root,
  .light {
    color-scheme: light;

    /* ==========================================================================
       1. SURFACE & CANVAS HIERARCHY (LIGHT POLARITY — DEFAULT)
       ========================================================================== */
    /* Primary architectural background canvas (Cool Alabaster: #F6F7F9) */
    --bg-canvas: oklch(0.973 0.003 255.0);
    /* Secondary recessed well / grouped list background (#F3F4F6) */
    --bg-canvas-subtle: oklch(0.967 0.003 264.5);
    /* Deep recessed track / code block / input well (#EBEEF2) */
    --bg-canvas-recessed: oklch(0.946 0.005 255.0);

    /* Level 1 Surface: Primary cards, panels, active workspace (#FFFFFF) */
    --surface-primary: oklch(1.000 0.000 0.0);
    /* Level 2 Surface: Hover state on primary surface (#F9FAFB) */
    --surface-hover: oklch(0.985 0.002 247.8);
    /* Level 3 Surface: Active/Pressed state on surface (#F3F4F6) */
    --surface-active: oklch(0.967 0.003 264.5);
    /* Level 4 Surface: Floating popovers, dropdowns, modals (#FFFFFF) */
    --surface-elevated: oklch(1.000 0.000 0.0);
    /* Inverted High-Contrast Surface: Primary CTA, active pill, tooltips (#09090B) */
    --surface-inverted: oklch(0.141 0.005 285.8);
    --surface-inverted-hover: oklch(0.210 0.006 285.8);

    /* ==========================================================================
       2. LIQUID GLASSMORPHISM & TRANSLUCENT DECK TOKENS (LIGHT)
       ========================================================================== */
    /* Floating navigation bar, sticky headers, command palette shell */
    --glass-surface-primary: oklch(1.000 0.000 0.0 / 0.78);
    --glass-surface-elevated: oklch(0.985 0.002 247.8 / 0.86);
    --glass-surface-subtle: oklch(0.967 0.003 264.5 / 0.65);
    --glass-backdrop-overlay: oklch(0.141 0.005 285.8 / 0.24);
    --glass-specular-highlight: inset 0 1px 0 0 oklch(1.000 0.000 0.0 / 0.90);

    /* ==========================================================================
       3. TYPOGRAPHY & ICONOGRAPHY INK HIERARCHY (LIGHT)
       ========================================================================== */
    /* Razor-sharp primary headings & vector glyphs (#000000 / #09090B) */
    --ink-primary: oklch(0.141 0.005 285.8);
    --ink-pure: oklch(0.000 0.000 0.0);
    /* Secondary body copy & balanced UI labels (#4B5563) */
    --ink-secondary: oklch(0.446 0.026 256.8);
    /* Tertiary metadata, timestamps, kbd hints, inactive icons (Titanium Gray: #A2A8B2) */
    --ink-tertiary: oklch(0.730 0.015 255.0);
    /* Disabled controls & placeholder text (#C4C9D1) */
    --ink-disabled: oklch(0.835 0.010 255.0);
    /* Ink on inverted surfaces (#FFFFFF) */
    --ink-on-inverted: oklch(1.000 0.000 0.0);

    /* ==========================================================================
       4. STRUCTURAL 1PX HAIRLINES & FOCUS GEOMETRY (LIGHT)
       ========================================================================== */
    /* Whisper-quiet section dividers & inner grid lines (#ECEEF2) */
    --border-subtle: oklch(0.948 0.004 255.0);
    /* Standard card, input, and button structural hairline (#E2E5EB) */
    --border-default: oklch(0.918 0.006 255.0);
    /* Interactive hover or emphasized structural border (#C8CDD6) */
    --border-strong: oklch(0.852 0.010 255.0);
    /* Active input or selected card border (#09090B) */
    --border-focused: oklch(0.141 0.005 285.8);
    /* Keyboard accessibility focus ring (2px offset optical halo) */
    --ring-focus: oklch(0.141 0.005 285.8 / 0.18);
    --ring-focus-solid: oklch(0.141 0.005 285.8);

    /* ==========================================================================
       5. SEMANTIC STATUS & INTENT TOKENS (OPTICALLY CALIBRATED — LIGHT)
       ========================================================================== */
    /* Positive / Operational / Emerald */
    --status-success-bg: oklch(0.962 0.035 156.0);
    --status-success-border: oklch(0.885 0.075 156.0);
    --status-success-ink: oklch(0.435 0.115 156.0);
    --status-success-dot: oklch(0.580 0.150 156.0);

    /* Warning / Degraded / Amber */
    --status-warning-bg: oklch(0.968 0.042 82.0);
    --status-warning-border: oklch(0.895 0.092 82.0);
    --status-warning-ink: oklch(0.470 0.120 74.0);
    --status-warning-dot: oklch(0.680 0.155 78.0);

    /* Danger / Destructive / Crimson */
    --status-danger-bg: oklch(0.960 0.032 22.0);
    --status-danger-border: oklch(0.880 0.075 22.0);
    --status-danger-ink: oklch(0.465 0.165 24.5);
    --status-danger-dot: oklch(0.575 0.195 25.0);

    /* Informational / System Accent / Cobalt */
    --status-info-bg: oklch(0.962 0.028 252.0);
    --status-info-border: oklch(0.885 0.068 252.0);
    --status-info-ink: oklch(0.450 0.145 254.0);
    --status-info-dot: oklch(0.560 0.175 254.0);

    /* ==========================================================================
       6. AMBIENT ELEVATION & TACTILE SHADOWS (LIGHT)
       ========================================================================== */
    --shadow-xs: 0 1px 2px 0 oklch(0.141 0.005 285.8 / 0.03);
    --shadow-sm:
      0 1px 2px -1px oklch(0.141 0.005 285.8 / 0.04),
      0 2px 4px 0 oklch(0.141 0.005 285.8 / 0.03);
    --shadow-md:
      0 4px 8px -2px oklch(0.141 0.005 285.8 / 0.05),
      0 2px 4px -2px oklch(0.141 0.005 285.8 / 0.03);
    --shadow-lg:
      0 12px 24px -4px oklch(0.141 0.005 285.8 / 0.06),
      0 4px 8px -2px oklch(0.141 0.005 285.8 / 0.03);
    --shadow-floating-deck:
      0 0 0 1px oklch(0.141 0.005 285.8 / 0.06),
      0 16px 36px -6px oklch(0.141 0.005 285.8 / 0.08),
      0 4px 12px -2px oklch(0.141 0.005 285.8 / 0.04);
  }

  .dark {
    color-scheme: dark;

    /* ==========================================================================
       1. SURFACE & CANVAS HIERARCHY (OBSIDIAN DARK POLARITY)
       ========================================================================== */
    /* Primary void canvas (Deep Carbon: #08080A) */
    --bg-canvas: oklch(0.132 0.004 285.0);
    /* Secondary structural background (#0C0D10) */
    --bg-canvas-subtle: oklch(0.155 0.005 280.0);
    /* Recessed input/code well (#050507) */
    --bg-canvas-recessed: oklch(0.110 0.004 285.0);

    /* Level 1 Surface: Elevated Obsidian card/panel (#111215) */
    --surface-primary: oklch(0.182 0.006 280.0);
    /* Level 2 Surface: Hover state (#17181C) */
    --surface-hover: oklch(0.210 0.007 280.0);
    /* Level 3 Surface: Active/Pressed state (#1D1F24) */
    --surface-active: oklch(0.238 0.008 280.0);
    /* Level 4 Surface: Floating modal, command menu, popover (#15161A) */
    --surface-elevated: oklch(0.200 0.007 280.0);
    /* Inverted High-Contrast Surface: Primary CTA (#F4F4F6) */
    --surface-inverted: oklch(0.968 0.003 264.5);
    --surface-inverted-hover: oklch(1.000 0.000 0.0);

    /* ==========================================================================
       2. LIQUID GLASSMORPHISM & TRANSLUCENT DECK TOKENS (DARK)
       ========================================================================== */
    --glass-surface-primary: oklch(0.182 0.006 280.0 / 0.72);
    --glass-surface-elevated: oklch(0.215 0.007 280.0 / 0.82);
    --glass-surface-subtle: oklch(0.155 0.005 280.0 / 0.60);
    --glass-backdrop-overlay: oklch(0.000 0.000 0.0 / 0.68);
    /* Top-edge overhead light catch on obsidian surfaces */
    --glass-specular-highlight: inset 0 1px 0 0 oklch(1.000 0.000 0.0 / 0.07);

    /* ==========================================================================
       3. TYPOGRAPHY & ICONOGRAPHY INK HIERARCHY (DARK)
       ========================================================================== */
    /* Crisp Off-White primary text (#F4F4F6) */
    --ink-primary: oklch(0.968 0.003 264.5);
    --ink-pure: oklch(1.000 0.000 0.0);
    /* Balanced secondary body text (#A1A6B0) */
    --ink-secondary: oklch(0.725 0.014 260.0);
    /* Muted Titanium metadata & secondary icons (#686E7A) */
    --ink-tertiary: oklch(0.540 0.016 262.0);
    /* Disabled text & subtle placeholders (#3E424B) */
    --ink-disabled: oklch(0.375 0.012 265.0);
    /* Ink on inverted light CTAs (#08080A) */
    --ink-on-inverted: oklch(0.132 0.004 285.0);

    /* ==========================================================================
       4. STRUCTURAL 1PX HAIRLINES & FOCUS GEOMETRY (DARK)
       ========================================================================== */
    /* Whisper-quiet inner dividers (rgba(255,255,255,0.05)) */
    --border-subtle: oklch(1.000 0.000 0.0 / 0.055);
    /* Standard structural card/input border (rgba(255,255,255,0.085)) */
    --border-default: oklch(1.000 0.000 0.0 / 0.085);
    /* Interactive hover border (rgba(255,255,255,0.16)) */
    --border-strong: oklch(1.000 0.000 0.0 / 0.160);
    /* Focused input/active selection border (#F4F4F6) */
    --border-focused: oklch(0.968 0.003 264.5);
    /* Keyboard focus halo */
    --ring-focus: oklch(1.000 0.000 0.0 / 0.20);
    --ring-focus-solid: oklch(0.968 0.003 264.5);

    /* ==========================================================================
       5. SEMANTIC STATUS & INTENT TOKENS (OPTICALLY CALIBRATED — DARK)
       ========================================================================== */
    /* Positive / Operational / Emerald */
    --status-success-bg: oklch(0.240 0.045 156.0 / 0.45);
    --status-success-border: oklch(0.450 0.100 156.0 / 0.40);
    --status-success-ink: oklch(0.790 0.135 156.0);
    --status-success-dot: oklch(0.680 0.155 156.0);

    /* Warning / Degraded / Amber */
    --status-warning-bg: oklch(0.250 0.050 80.0 / 0.45);
    --status-warning-border: oklch(0.480 0.110 80.0 / 0.40);
    --status-warning-ink: oklch(0.820 0.135 82.0);
    --status-warning-dot: oklch(0.740 0.155 80.0);

    /* Danger / Destructive / Crimson */
    --status-danger-bg: oklch(0.245 0.055 24.0 / 0.45);
    --status-danger-border: oklch(0.460 0.130 24.0 / 0.40);
    --status-danger-ink: oklch(0.780 0.145 24.0);
    --status-danger-dot: oklch(0.650 0.190 25.0);

    /* Informational / System Accent / Cobalt */
    --status-info-bg: oklch(0.245 0.050 254.0 / 0.45);
    --status-info-border: oklch(0.460 0.115 254.0 / 0.40);
    --status-info-ink: oklch(0.795 0.125 254.0);
    --status-info-dot: oklch(0.660 0.165 254.0);

    /* ==========================================================================
       6. AMBIENT ELEVATION & SPECULAR SHADOWS (DARK)
       ========================================================================== */
    --shadow-xs:
      inset 0 1px 0 0 oklch(1.000 0.000 0.0 / 0.05),
      0 1px 2px 0 oklch(0.000 0.000 0.0 / 0.40);
    --shadow-sm:
      inset 0 1px 0 0 oklch(1.000 0.000 0.0 / 0.06),
      0 2px 6px -1px oklch(0.000 0.000 0.0 / 0.50);
    --shadow-md:
      inset 0 1px 0 0 oklch(1.000 0.000 0.0 / 0.07),
      0 8px 16px -4px oklch(0.000 0.000 0.0 / 0.60);
    --shadow-lg:
      inset 0 1px 0 0 oklch(1.000 0.000 0.0 / 0.08),
      0 20px 32px -8px oklch(0.000 0.000 0.0 / 0.72);
    --shadow-floating-deck:
      inset 0 1px 0 0 oklch(1.000 0.000 0.0 / 0.09),
      0 0 0 1px oklch(1.000 0.000 0.0 / 0.08),
      0 24px 48px -12px oklch(0.000 0.000 0.0 / 0.85);
  }
}
```

### 1.3 Tailwind CSS Integration Mapping

Support both **Tailwind CSS v4** (CSS-first `@theme` directive) and **Tailwind CSS v3** (`tailwind.config.ts`).

#### A. Tailwind v4 `@theme` Configuration (`src/styles/globals.css`)

```css
@theme inline {
  /* Surface & Canvas Tokens */
  --color-canvas: var(--bg-canvas);
  --color-canvas-subtle: var(--bg-canvas-subtle);
  --color-canvas-recessed: var(--bg-canvas-recessed);
  --color-surface: var(--surface-primary);
  --color-surface-hover: var(--surface-hover);
  --color-surface-active: var(--surface-active);
  --color-surface-elevated: var(--surface-elevated);
  --color-surface-inverted: var(--surface-inverted);
  --color-surface-inverted-hover: var(--surface-inverted-hover);

  /* Liquid Glass Tokens */
  --color-glass: var(--glass-surface-primary);
  --color-glass-elevated: var(--glass-surface-elevated);
  --color-glass-subtle: var(--glass-surface-subtle);
  --color-glass-overlay: var(--glass-backdrop-overlay);

  /* Typography & Icon Ink Tokens */
  --color-ink: var(--ink-primary);
  --color-ink-pure: var(--ink-pure);
  --color-ink-secondary: var(--ink-secondary);
  --color-ink-tertiary: var(--ink-tertiary);
  --color-ink-disabled: var(--ink-disabled);
  --color-ink-inverted: var(--ink-on-inverted);

  /* Border & Focus Ring Tokens */
  --color-hairline-subtle: var(--border-subtle);
  --color-hairline: var(--border-default);
  --color-hairline-strong: var(--border-strong);
  --color-hairline-focused: var(--border-focused);
  --color-ring-focus: var(--ring-focus);

  /* Semantic Status Tokens */
  --color-success-bg: var(--status-success-bg);
  --color-success-border: var(--status-success-border);
  --color-success-ink: var(--status-success-ink);
  --color-success-dot: var(--status-success-dot);

  --color-warning-bg: var(--status-warning-bg);
  --color-warning-border: var(--status-warning-border);
  --color-warning-ink: var(--status-warning-ink);
  --color-warning-dot: var(--status-warning-dot);

  --color-danger-bg: var(--status-danger-bg);
  --color-danger-border: var(--status-danger-border);
  --color-danger-ink: var(--status-danger-ink);
  --color-danger-dot: var(--status-danger-dot);

  --color-info-bg: var(--status-info-bg);
  --color-info-border: var(--status-info-border);
  --color-info-ink: var(--status-info-ink);
  --color-info-dot: var(--status-info-dot);

  /* Box Shadows */
  --shadow-ambient-xs: var(--shadow-xs);
  --shadow-ambient-sm: var(--shadow-sm);
  --shadow-ambient-md: var(--shadow-md);
  --shadow-ambient-lg: var(--shadow-lg);
  --shadow-deck: var(--shadow-floating-deck);

  /* Spatial Radii */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-3xl: 24px;
  --radius-pill: 9999px;
}
```

#### B. Tailwind v3 Compatibility Contract (`tailwind.config.ts`)

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "var(--bg-canvas)",
          subtle: "var(--bg-canvas-subtle)",
          recessed: "var(--bg-canvas-recessed)",
        },
        surface: {
          DEFAULT: "var(--surface-primary)",
          hover: "var(--surface-hover)",
          active: "var(--surface-active)",
          elevated: "var(--surface-elevated)",
          inverted: "var(--surface-inverted)",
          "inverted-hover": "var(--surface-inverted-hover)",
        },
        glass: {
          DEFAULT: "var(--glass-surface-primary)",
          elevated: "var(--glass-surface-elevated)",
          subtle: "var(--glass-surface-subtle)",
          overlay: "var(--glass-backdrop-overlay)",
        },
        ink: {
          DEFAULT: "var(--ink-primary)",
          pure: "var(--ink-pure)",
          secondary: "var(--ink-secondary)",
          tertiary: "var(--ink-tertiary)",
          disabled: "var(--ink-disabled)",
          inverted: "var(--ink-on-inverted)",
        },
        hairline: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
          focused: "var(--border-focused)",
        },
        status: {
          success: {
            bg: "var(--status-success-bg)",
            border: "var(--status-success-border)",
            ink: "var(--status-success-ink)",
            dot: "var(--status-success-dot)",
          },
          warning: {
            bg: "var(--status-warning-bg)",
            border: "var(--status-warning-border)",
            ink: "var(--status-warning-ink)",
            dot: "var(--status-warning-dot)",
          },
          danger: {
            bg: "var(--status-danger-bg)",
            border: "var(--status-danger-border)",
            ink: "var(--status-danger-ink)",
            dot: "var(--status-danger-dot)",
          },
          info: {
            bg: "var(--status-info-bg)",
            border: "var(--status-info-border)",
            ink: "var(--status-info-ink)",
            dot: "var(--status-info-dot)",
          },
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
        pill: "9999px",
      },
      boxShadow: {
        "ambient-xs": "var(--shadow-xs)",
        "ambient-sm": "var(--shadow-sm)",
        "ambient-md": "var(--shadow-md)",
        "ambient-lg": "var(--shadow-lg)",
        deck: "var(--shadow-floating-deck)",
        specular: "var(--glass-specular-highlight)",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## SECTION 2: TYPOGRAPHY, MULTI-SCRIPT GRID (LTR/RTL) & SPATIAL GEOMETRY

### 2.1 Multi-Script Typographic Architecture (Latin \+ Persian/Kurdish/Arabic)

A world-class interface must render English/Latin, Monospace telemetry, and RTL scripts (Persian, Kurdish Sorani, Arabic) with unified optical density, baseline alignment, and zero vertical clipping.

1. **Primary Latin Sans (`--font-sans-latin`):** `Geist Sans`, `Inter Display` / `Inter`, `-apple-system`, `BlinkMacSystemFont`.  
2. **Primary RTL Sans (`--font-sans-rtl`):** `Abar 2.2 Low` (`AbarLow`), `Vazirmatn`, `IRANSansX`, `Estedad` — engineered with balanced loop proportions and low x-height ascenders to harmonize with `Geist` and `Inter`.  
3. **Technical Monospace (`--font-mono`):** `Geist Mono`, `JetBrains Mono`, `SFMono-Regular`.

```css
@layer base {
  :root {
    --font-sans-latin: "Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --font-sans-rtl: "AbarLow", "Abar", "Vazirmatn", "IRANSansX", system-ui, sans-serif;
    --font-mono: "Geist Mono", "JetBrains Mono", "SFMono-Regular", Consolas, monospace;

    /* Unified composite stack: browser automatically falls back per-glyph unicode range */
    --font-sans: var(--font-sans-latin), var(--font-sans-rtl);

    /* Script-aware optical multipliers (LTR default) */
    --leading-script-multiplier: 1;
    --tracking-script-multiplier: 1;
  }

  /* Automatic RTL Optical Compensation for Persian (fa), Kurdish Sorani (ckb/ku), Arabic (ar) */
  :root[dir="rtl"],
  [dir="rtl"],
  :lang(fa),
  :lang(ckb),
  :lang(ku),
  :lang(ar) {
    --font-sans: var(--font-sans-rtl), var(--font-sans-latin);
    /* RTL scripts require +8% vertical line-height breathing room to prevent ascender/descender collision */
    --leading-script-multiplier: 1.08;
    /* CRITICAL LAW: Negative or positive letter-spacing breaks Arabic/Persian/Kurdish cursive ligatures. Zero out all tracking in RTL. */
    --tracking-script-multiplier: 0;
  }

  html {
    font-family: var(--font-sans);
    background-color: var(--bg-canvas);
    color: var(--ink-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-synthesis: none;
    /* Enforce OpenType alternate glyphs: single-story 'a' (cv11), open '4' (cv02), flat-top '3' (cv04), disambiguated 'I/l/1' (ss01) */
    font-feature-settings: "cv02" 1, "cv03" 1, "cv04" 1, "cv11" 1, "ss01" 1, "kern" 1;
  }

  /* Mandatory Tabular Numerals for all Financial, Telemetry, Timer, Badge, and Table Elements */
  .tabular-data,
  table,
  td,
  th,
  time,
  output,
  [data-numeric="true"] {
    font-variant-numeric: tabular-nums slashed-zero;
  }
}
```

### 2.2 Fluid Optical Type Scale Matrix

Every typographic role uses `clamp()` for seamless viewport scaling (from `375px` mobile viewports to `1920px+` studio displays) while dynamically multiplying `letter-spacing` by `var(--tracking-script-multiplier)` so RTL scripts never fracture.

| Token Role | CSS Utility Class | Fluid Font Size (`clamp`) | Line Height | LTR Tracking | Weight | Primary Architectural Use Case |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Display Hero** | `.type-display-xl` | `clamp(2.25rem, 4vw + 1rem, 3.75rem)` (`36px–60px`) | `1.06` | `-0.035em` | `600` | Marketing hero headers, splash statements |
| **Display Section** | `.type-display-lg` | `clamp(1.75rem, 2.5vw + 0.75rem, 2.5rem)` (`28px–40px`) | `1.12` | `-0.028em` | `600` | Major workspace view titles, metric heroes |
| **Heading 1 (Page)** | `.type-h1` | `clamp(1.375rem, 1.5vw + 0.75rem, 1.75rem)` (`22px–28px`) | `1.20` | `-0.022em` | `600` | Primary application page headers |
| **Heading 2 (Panel)** | `.type-h2` | `clamp(1.125rem, 0.8vw + 0.85rem, 1.3125rem)` (`18px–21px`) | `1.28` | `-0.018em` | `600` | Modal titles, major Bento section headers |
| **Heading 3 (Card)** | `.type-h3` | `1.000rem` (`16px`) | `1.35` | `-0.014em` | `500` | Card titles, drawer headers, setting groups |
| **Body Large** | `.type-body-lg` | `1.0625rem` (`17px`) | `1.60` | `-0.011em` | `400` | Long-form essays, editorial notes, lead paragraphs |
| **Body Default** | `.type-body` | `0.875rem` (`14px`) | `1.50` | `-0.006em` | `400` | **Default UI & application text** (Linear/Raycast standard) |
| **Body Compact** | `.type-body-sm` | `0.8125rem` (`13px`) | `1.45` | `-0.003em` | `400` | High-density tables, sidebar links, secondary descriptions |
| **Caption / Meta** | `.type-caption` | `0.75rem` (`12px`) | `1.35` | `0.000em` | `400` | Timestamps, helper text, axis labels, breadcrumbs |
| **Micro / KBD / Tag** | `.type-micro` | `0.6875rem` (`11px`) | `1.20` | `+0.040em` | `500` | Keyboard shortcuts (`⌘K`), status pills, uppercase group headers |

```css
@layer components {
  .type-display-xl {
    font-size: clamp(2.25rem, 4vw + 1rem, 3.75rem);
    line-height: calc(1.06 * var(--leading-script-multiplier));
    letter-spacing: calc(-0.035em * var(--tracking-script-multiplier));
    font-weight: 600;
    text-wrap: balance;
  }

  .type-display-lg {
    font-size: clamp(1.75rem, 2.5vw + 0.75rem, 2.5rem);
    line-height: calc(1.12 * var(--leading-script-multiplier));
    letter-spacing: calc(-0.028em * var(--tracking-script-multiplier));
    font-weight: 600;
    text-wrap: balance;
  }

  .type-h1 {
    font-size: clamp(1.375rem, 1.5vw + 0.75rem, 1.75rem);
    line-height: calc(1.20 * var(--leading-script-multiplier));
    letter-spacing: calc(-0.022em * var(--tracking-script-multiplier));
    font-weight: 600;
    text-wrap: balance;
  }

  .type-h2 {
    font-size: clamp(1.125rem, 0.8vw + 0.85rem, 1.3125rem);
    line-height: calc(1.28 * var(--leading-script-multiplier));
    letter-spacing: calc(-0.018em * var(--tracking-script-multiplier));
    font-weight: 600;
  }

  .type-h3 {
    font-size: 1rem;
    line-height: calc(1.35 * var(--leading-script-multiplier));
    letter-spacing: calc(-0.014em * var(--tracking-script-multiplier));
    font-weight: 500;
  }

  .type-body-lg {
    font-size: 1.0625rem;
    line-height: calc(1.60 * var(--leading-script-multiplier));
    letter-spacing: calc(-0.011em * var(--tracking-script-multiplier));
    font-weight: 400;
    text-wrap: pretty;
  }

  .type-body {
    font-size: 0.875rem;
    line-height: calc(1.50 * var(--leading-script-multiplier));
    letter-spacing: calc(-0.006em * var(--tracking-script-multiplier));
    font-weight: 400;
    text-wrap: pretty;
  }

  .type-body-sm {
    font-size: 0.8125rem;
    line-height: calc(1.45 * var(--leading-script-multiplier));
    letter-spacing: calc(-0.003em * var(--tracking-script-multiplier));
    font-weight: 400;
  }

  .type-caption {
    font-size: 0.75rem;
    line-height: calc(1.35 * var(--leading-script-multiplier));
    letter-spacing: 0em;
    font-weight: 400;
    color: var(--ink-tertiary);
  }

  .type-micro {
    font-size: 0.6875rem;
    line-height: calc(1.20 * var(--leading-script-multiplier));
    letter-spacing: calc(0.04em * var(--tracking-script-multiplier));
    font-weight: 500;
  }
}

```

### 2.3 Spatial Grid, Optical Radii & Bento Grid Mathematics

#### 1\. The 4px / 8px Spatial Rhythm Law

All padding, margin, gap, and structural dimensions must resolve to multiples of `4px` (`0.25rem`), with micro-adjustments of `2px` (`0.125rem`) permitted strictly for inline icon-to-text alignment and compact badge padding.

| Scale Step | CSS Value | Pixel Equivalent | Architectural Assignment |
| :---- | :---- | :---- | :---- |
| `space-0.5` | `0.125rem` | `2px` | Inline status dot offset, micro badge vertical padding |
| `space-1` | `0.25rem` | `4px` | Icon-to-label gap inside buttons, tight stack rhythm |
| `space-1.5` | `0.375rem` | `6px` | Compact button horizontal padding, Segmented Control inset |
| `space-2` | `0.5rem` | `8px` | Standard toolbar gap, list item vertical padding |
| `space-3` | `0.75rem` | `12px` | Default input horizontal padding, compact Bento cell gap |
| `space-4` | `1.0rem` | `16px` | Standard Bento grid gap, mobile container inline padding |
| `space-5` | `1.25rem` | `20px` | Standard Bento card internal padding (`p-5`) |
| `space-6` | `1.5rem` | `24px` | Elevated modal/panel padding (`p-6`), desktop section gap |
| `space-8` | `2.0rem` | `32px` | Major workspace zone separation |
| `space-12` | `3.0rem` | `48px` | Architectural canvas breathing room |

#### 2\. Concentric Optical Border Radius Law

When nesting a rounded child element (such as an image preview, action well, or inner sub-card) inside a parent Bento card, **never use the same border-radius on both elements**. Equal radii create an optical bulge at the corners. Enforce concentric curvature via CSS calculations:

\$\$R\_{\\text{inner}} \= \\max(4\\text{px}, R\_{\\text{outer}} \- P\_{\\text{parent}})\$\$

* **Example A (Standard Bento Card):** Outer Card Radius \$R\_{\\text{outer}} \= 16\\text{px}\$ (`rounded-xl`), Card Padding \$P\_{\\text{parent}} \= 8\\text{px}\$ (`p-2`) \$\\implies\$ Inner Surface Radius \$R\_{\\text{inner}} \= 8\\text{px}\$ (`rounded-md`).  
* **Example B (Feature Bento Shell):** Outer Shell Radius \$R\_{\\text{outer}} \= 24\\text{px}\$ (`rounded-3xl`), Shell Padding \$P\_{\\text{parent}} \= 12\\text{px}\$ (`p-3`) \$\\implies\$ Inner Module Radius \$R\_{\\text{inner}} \= 12\\text{px}\$ (`rounded-lg`).  
* **Example C (Segmented Control Track):** Outer Track Radius \$R\_{\\text{outer}} \= 10\\text{px}\$, Track Inset Padding \$P\_{\\text{parent}} \= 3\\text{px}\$ \$\\implies\$ Active Indicator Pill Radius \$R\_{\\text{inner}} \= 7\\text{px}\$.

#### 3\. Structural Bento Grid & Hairline Matrix Architecture

We support two distinct Bento Grid archetypes: **Modular Gap Bento** (discrete floating cards separated by `12px–16px` canvas space) and **Architectural Hairline Grid** (zero-gap cells unified by `1px solid` shared borders, inspired by Vercel Geist and Linear engineering grids).

```css
@layer components {
  /* Archetype 1: Modular Bento Grid with Container Query Support */
  .bento-grid {
    container-type: inline-size;
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    grid-auto-rows: minmax(140px, auto);
    gap: 1rem; /* 16px */
  }

  @container (min-width: 640px) {
    .bento-grid {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }
  }

  @container (min-width: 1024px) {
    .bento-grid {
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 1.25rem; /* 20px */
    }
  }

  /* Archetype 2: 1px Structural Hairline Matrix (Zero-Double-Border Engine) */
  .hairline-matrix {
    display: grid;
    background-color: var(--border-default);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    overflow: hidden;
    gap: 1px; /* Exposes the 1px --border-default background between cells without doubling borders */
  }

  .hairline-matrix-cell {
    background-color: var(--surface-primary);
    padding: 1.25rem;
    transition: background-color 150ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .hairline-matrix-cell:hover {
    background-color: var(--surface-hover);
  }
}

```

### 2.4 Viewport, Safe-Area & Bidirectional Layout Shell

Mobile web apps, PWAs, and desktop shells must never suffer from iOS Safari address-bar resize jumps, notch/home-indicator collisions, or horizontal overflow leaks.

```css
@layer base {
  /* Lock root shell to dynamic viewport height and prevent rubber-band bounce on fixed app shells */
  html,
  body {
    min-height: 100dvh;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow-x: clip;
    overscroll-behavior-y: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* Safe-Area Aware Application Frame */
  .app-shell-viewport {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding-top: env(safe-area-inset-top, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    padding-inline-start: env(safe-area-inset-left, 0px);
    padding-inline-end: env(safe-area-inset-right, 0px);
  }

  /* Directional Icon Auto-Mirroring for RTL (Arrows, Chevrons, Sidebar Toggles) */
  [dir="rtl"] [data-rtl-flip="true"] {
    transform: scaleX(-1);
  }
}

```

## SECTION 3: MATERIAL PHYSICS, LIQUID GLASSMORPHISM, SHADERS & MICRO-SURFACES

### 3.1 Liquid Glassmorphism & Optical Refraction Engine

In the Argon paradigm, translucent surfaces are never flat semi-transparent rectangles. They simulate physical optical glass and anodized aluminum through a four-layer material stack:

1. **Layer 1 — Backdrop Optical Refraction:** Multi-pass Gaussian blur (`backdrop-filter: blur(...)`) paired with chromatic saturation boost (`saturate(180%)`) so underlying content colors do not turn muddy gray when diffused.  
2. **Layer 2 — Luminance Tint:** Polarity-aware OKLCH translucent surface token (`--glass-surface-*`).  
3. **Layer 3 — Micro-Grain Anti-Banding Texture:** Fractional SVG noise overlay (`opacity: 0.015` in Light Mode, `0.022` in Dark Mode) to prevent 8-bit gradient banding and impart tactile physical materiality.  
4. **Layer 4 — Specular Edge Catch:** A `1px` outer structural border combined with an inner top-edge specular reflection (`inset 0 1px 0 0`) simulating overhead studio lighting.

```css
@layer components {
  /* ==========================================================================
     TIER 1: STICKY NAVIGATION, WORKSPACE HEADERS & STATUS BARS
     ========================================================================== */
  .glass-bar {
    background-color: var(--glass-surface-primary);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border-bottom: 1px solid var(--border-subtle);
    box-shadow: var(--glass-specular-highlight);
    transform: translateZ(0); /* Force dedicated GPU compositing layer */
  }

  /* ==========================================================================
     TIER 2: FLOATING DECKS, iOS/visionOS DOCKS, COMMAND PALETTE & MODALS
     ========================================================================== */
  .glass-deck {
    position: relative;
    background-color: var(--glass-surface-elevated);
    backdrop-filter: blur(24px) saturate(190%);
    -webkit-backdrop-filter: blur(24px) saturate(190%);
    border: 1px solid var(--border-default);
    box-shadow: var(--shadow-floating-deck);
    transform: translateZ(0);
    isolation: isolate;
  }

  /* ==========================================================================
     TIER 3: TRANSIENT HUDs, FLOATING PILLS, POPOVERS & MEDIA CONTROLS
     ========================================================================== */
  .glass-pill {
    background-color: var(--glass-surface-subtle);
    backdrop-filter: blur(12px) saturate(160%);
    -webkit-backdrop-filter: blur(12px) saturate(160%);
    border: 1px solid var(--border-default);
    box-shadow: var(--shadow-xs), var(--glass-specular-highlight);
    border-radius: var(--radius-pill);
  }

  /* ==========================================================================
     MODAL & DRAWER BACKDROP CURTAIN
     ========================================================================== */
  .glass-backdrop {
    background-color: var(--glass-backdrop-overlay);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  /* Graceful Fallback for Low-Power Devices or Browsers Lacking Backdrop-Filter */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .glass-bar,
    .glass-deck,
    .glass-pill {
      background-color: var(--surface-elevated);
    }
  }
}

```

### 3.2 Fractional SVG Noise & Micro-Surface Materiality

To prevent sterile digital flatness without introducing visual clutter, apply a zero-network-request inline SVG `<feTurbulence>` noise matrix across elevated glass decks or primary architectural canvases.

```css
@layer utilities {
  :root {
    --noise-pattern: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='argonNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23argonNoise)'/%3E%3C/svg%3E");
    --noise-opacity: 0.015;
  }

  .dark {
    --noise-opacity: 0.022;
  }

  /* Apply to Bento Cards, Floating Decks, or Hero Canvases for Tactile Grain */
  .surface-grain {
    position: relative;
    isolation: isolate;
  }

  .surface-grain::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-image: var(--noise-pattern);
    background-repeat: repeat;
    background-size: 128px 128px;
    opacity: var(--noise-opacity);
    pointer-events: none;
    z-index: 1;
    mix-blend-mode: overlay;
  }
}

```

### 3.3 Cursor-Reactive Specular Hairlines (Monochrome Proximity Shader)

Unlike generic AI templates that use neon rainbow border glows, Argon implements an optical **Monochrome Specular Proximity Border**. As the pointer approaches or traverses a Bento card, a subtle radial luminance gradient illuminates the `1px` structural hairline and a `2%` surface sheen directly beneath the cursor, running strictly via CSS custom properties with zero React state re-renders.

```
// MANDATORY COMPONENT CONTRACT: src/components/primitives/specular-surface.tsx
"use client";

import React, { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface SpecularSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Radius of the optical proximity illumination in pixels (Default: 280) */
  spotlightRadius?: number;
  /** Enable subtle inner surface luminance sheen in addition to 1px border catch */
  enableSurfaceSheen?: boolean;
  /** Semantic HTML tag or Polymorphic wrapper */
  as?: "div" | "article" | "section" | "li";
  ref?: React.Ref<HTMLDivElement>;
}

export function SpecularSurface({
  children,
  className,
  spotlightRadius = 280,
  enableSurfaceSheen = true,
  as: Component = "div",
  onPointerMove,
  ref,
  ...props
}: SpecularSurfaceProps) {
  const internalRef = useRef<HTMLDivElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = internalRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--cursor-x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--cursor-y", `${e.clientY - rect.top}px`);
      }
      onPointerMove?.(e);
    },
    [onPointerMove]
  );

  return (
    <Component
      ref={setRefs}
      data-slot="specular-surface"
      onPointerMove={handlePointerMove}
      style={
        {
          "--spotlight-radius": `${spotlightRadius}px`,
        } as React.CSSProperties
      }
      className={cn(
        "group/specular relative overflow-hidden rounded-xl bg-surface border border-hairline shadow-ambient-xs transition-colors duration-200",
        /* 1px Monochrome Specular Border Mask */
        "before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-[inherit] before:p-px",
        "before:bg-[radial-gradient(var(--spotlight-radius)_circle_at_var(--cursor-x,-999px)_var(--cursor-y,-999px),var(--ink-tertiary),transparent_100%)]",
        "before:opacity-0 hover:before:opacity-45 dark:hover:before:opacity-65 before:transition-opacity before:duration-300",
        "before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude]",
        /* Optional 2% Optical Surface Sheen */
        enableSurfaceSheen && [
          "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-[inherit]",
          "after:bg-[radial-gradient(var(--spotlight-radius)_circle_at_var(--cursor-x,-999px)_var(--cursor-y,-999px),var(--ink-primary),transparent_100%)]",
          "after:opacity-0 hover:after:opacity-[0.02] dark:hover:after:opacity-[0.035] after:transition-opacity after:duration-300",
        ],
        className
      )}
      {...props}
    >
      <div className="relative z-10 h-full w-full">{children}</div>
    </Component>
  );
}

```

### 3.4 Hardware-Composited Skeleton Shimmer Physics

Never animate `background-position` for loading skeletons—it forces continuous CPU main-thread paint recalculations. All Argon skeletons lock their base surface to `--bg-canvas-subtle` and translate a hardware-accelerated `::after` luminance wave via `transform: translate3d()`.

```css
@layer components {
  @keyframes argon-shimmer {
    0% {
      transform: translate3d(-100%, 0, 0);
    }
    100% {
      transform: translate3d(100%, 0, 0);
    }
  }

  .skeleton-shimmer {
    position: relative;
    overflow: hidden;
    background-color: var(--bg-canvas-recessed);
    border-radius: var(--radius-sm);
    isolation: isolate;
  }

  .skeleton-shimmer::after {
    content: "";
    position: absolute;
    inset: 0;
    transform: translate3d(-100%, 0, 0);
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      oklch(1.000 0.000 0.0 / 0.55) 50%,
      transparent 100%
    );
    animation: argon-shimmer 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    will-change: transform;
  }

  .dark .skeleton-shimmer::after {
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      oklch(1.000 0.000 0.0 / 0.06) 50%,
      transparent 100%
    );
  }
}

```

---

## SECTION 4: THE 120FPS MOTION ENGINE & CHOREOGRAPHY MATRIX

### 4.1 The 120FPS Hardware Compositing Law

To sustain a locked `120Hz` (`8.33ms` frame budget on ProMotion / high-refresh displays), every animation in the codebase must obey four strict laws:

1. **Compositor-Only Property Mutation:** Animate strictly `transform` (`translate3d`, `scale`, `rotate`), `opacity`, `filter`, and `clip-path`.  
2. **Forbidden Layout Thrashing:** Never animate `width`, `height`, `top`, `left`, `margin`, `padding`, or `border-width` via CSS keyframes or standard transitions. When geometric morphing is required (e.g., expanding a Bento card, shifting an active tab pill, or resizing a command palette), use **Framer Motion FLIP Layout Projection** (`layout`, `layoutId`) which computes bounding-box deltas and executes the transition via inverse GPU scale/translate matrices.  
3. **Zero Entry Latency on Pointer Down:** Tactile feedback (`scale(0.97)` or `scale(0.985)`) must initiate within `<16ms` of `pointerdown`.  
4. **Interruptible Velocity Preservation:** All interactive state changes (drawers, tabs, popovers, accordions) must use spring physics so mid-flight user interruptions preserve momentum rather than snapping abruptly.

### 4.2 Optical Cubic-Bezier Curves (CSS Micro-Interactions)

Inject these deterministic easing curves into `src/styles/globals.css` for ultra-fast CSS state transitions (color, border-color, background-color, opacity):

```css
@layer base {
  :root {
    /* High-velocity initial impulse with long friction deceleration (Linear/Apple standard) */
    --ease-optical-out: cubic-bezier(0.22, 1, 0.36, 1);
    /* Extreme exponential snap for command palettes, tooltips, and micro-menus */
    --ease-expo-out: cubic-bezier(0.16, 1, 0.3, 1);
    /* Symmetrical spatial shift for off-canvas drawers and theme transitions */
    --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
    /* Crisp mechanical response for checkboxes, switches, and active press states */
    --ease-snap: cubic-bezier(0.2, 0, 0, 1);

    /* Standardized Micro-Timing Tokens */
    --duration-instant: 75ms;
    --duration-fast: 150ms;
    --duration-normal: 220ms;
    --duration-deliberate: 350ms;
  }
}

```

### 4.3 Master Spring Physics & Choreography Matrix (`src/lib/motion.ts`)

Create `src/lib/motion.ts` as the single source of truth for all Framer Motion (`motion/react`) spring physics, layout projections, and staggered entry choreographies.

```ts
// MANDATORY MOTION ENGINE CONTRACT: src/lib/motion.ts
import type { Transition, Variants } from "motion/react";

/**
 * 1. DETERMINISTIC SPRING PHYSICS MATRIX
 * Calibrated for 120Hz ProMotion displays with sub-pixel rest thresholds.
 */
export const ARGON_SPRINGS = {
  /**
   * SNAPPY: Micro-controls,Segmented Control pills, Toggles, Buttons, Hover indicators.
   * Zero overshoot, instantaneous response (~180ms settling perception).
   */
  snappy: {
    type: "spring",
    stiffness: 520,
    damping: 38,
    mass: 0.8,
    restDelta: 0.001,
    restSpeed: 0.001,
  } satisfies Transition,

  /**
   * FLUID: Command Palette (Cmd+K), Modals, Popovers, Shared layoutId morphs.
   * Critically damped with organic momentum (~260ms settling perception).
   */
  fluid: {
    type: "spring",
    stiffness: 380,
    damping: 32,
    mass: 1.0,
    restDelta: 0.001,
    restSpeed: 0.001,
  } satisfies Transition,

  /**
   * SILK: Bento card expansion, Split-pane sidebars, Page-level layout projections.
   * Luxurious, weighted deceleration with zero bounce.
   */
  silk: {
    type: "spring",
    stiffness: 250,
    damping: 30,
    mass: 1.1,
    restDelta: 0.001,
    restSpeed: 0.001,
  } satisfies Transition,

  /**
   * TACTILE BOUNCE: Floating dock magnification, Notification badges, Success checkmarks.
   * Controlled ~6% elastic overshoot for physical delight.
   */
  tactile: {
    type: "spring",
    stiffness: 460,
    damping: 22,
    mass: 0.85,
    restDelta: 0.001,
  } satisfies Transition,

  /**
   * HEAVY SHEET: Mobile bottom drawers (Vaul), Full-screen workspace sheets.
   * High inertia that respects swipe release velocity.
   */
  heavy: {
    type: "spring",
    stiffness: 200,
    damping: 28,
    mass: 1.35,
    restDelta: 0.001,
  } satisfies Transition,
} as const;

/**
 * 2. OPTICAL BEZIER TRANSITIONS (FOR OPACITY & BLUR MORPHS)
 */
export const ARGON_EASE = {
  opticalOut: [0.22, 1, 0.36, 1] as const,
  expoOut: [0.16, 1, 0.3, 1] as const,
  snap: [0.2, 0, 0, 1] as const,
};

/**
 * 3. CHOREOGRAPHED STAGGER & ENTRY VARIANTS
 * Uses subtle Y-axis translation (8px), optical blur dissipation (4px -> 0px),
 * and opacity ramp to create a high-craft "materializing" effect.
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

export const materializeItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.985,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: ARGON_SPRINGS.fluid,
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.985,
    filter: "blur(2px)",
    transition: {
      duration: 0.14,
      ease: ARGON_EASE.expoOut,
    },
  },
};

/**
 * 4. MODAL, DIALOG & POPOVER OVERLAY VARIANTS
 */
export const overlayBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.18, ease: ARGON_EASE.opticalOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.14, ease: ARGON_EASE.expoOut },
  },
};

export const modalSurfaceVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 6,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: ARGON_SPRINGS.fluid,
  },
  exit: {
    opacity: 0,
    scale: 0.975,
    y: 4,
    filter: "blur(4px)",
    transition: {
      duration: 0.13,
      ease: ARGON_EASE.expoOut,
    },
  },
};

/**
 * 5. TACTILE MICRO-INTERACTION PRESETS (BUTTONS & CARDS)
 */
export const TACTILE_PRESS = {
  /** Standard compact controls (buttons, pills, icon triggers) */
  control: {
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.97 },
    transition: ARGON_SPRINGS.snappy,
  },
  /** Interactive Bento cards and large list rows */
  surface: {
    whileHover: { y: -1 },
    whileTap: { scale: 0.992 },
    transition: ARGON_SPRINGS.snappy,
  },
} as const;

```

### 4.4 Shared-Layout Pill & Active Indicator Architecture (`layoutId`)

Never use instant background toggles for Navigation Bars, Segmented Controls, Sidebar Links, or Filter Tabs. Use Framer Motion's `layoutId` so the active background pill or `1px` bottom indicator glides physically across the DOM between targets.

```
// MANDATORY PATTERN: Shared-Layout Segmented / Navigation Indicator
"use client";

import React from "react";
import { motion } from "motion/react";
import { ARGON_SPRINGS } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  layoutGroupId: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  layoutGroupId,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      data-slot="segmented-control"
      className={cn(
        "relative inline-flex items-center gap-0.5 rounded-[10px] bg-canvas-recessed p-[3px] border border-hairline-subtle",
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative z-10 inline-flex h-7 items-center justify-center gap-1.5 rounded-[7px] px-3 type-body-sm font-medium transition-colors duration-150 select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus",
              isActive ? "text-ink" : "text-ink-tertiary hover:text-ink-secondary"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={`${layoutGroupId}-active-pill`}
                transition={ARGON_SPRINGS.snappy}
                className="absolute inset-0 -z-10 rounded-[7px] bg-surface shadow-ambient-xs border border-hairline/60"
              />
            )}
            <span>{option.label}</span>
            {typeof option.count === "number" && (
              <span
                data-numeric="true"
                className={cn(
                  "tabular-data type-micro rounded-xs px-1 py-0.25 transition-colors",
                  isActive ? "bg-canvas-subtle text-ink" : "text-ink-tertiary"
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

```

### 4.5 Magnetic Pointer Target & Optical Polarity View Transitions

1. **Magnetic Desktop Targets (`<MagneticTarget>`):** Primary floating action buttons, dock icons, and header utility triggers subtly gravitate toward the user's cursor (`maxDisplacement = 4px`) using spring physics, snapping cleanly back to `(0, 0)` on pointer exit.  
2. **Zero-Flash Polarity Switching (View Transitions API):** When toggling between Light Mode (`#FFFFFF` / `#F6F7F9`) and Obsidian Dark Mode (`#08080A` / `#111215`), suppress raw CSS transition lag across thousands of DOM nodes during the switch and leverage the native View Transitions API for a butter-smooth `120fps` cross-fade.

```css
@layer base {
  /* Native View Transitions API Choreography for Route & Theme Changes */
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 220ms;
    animation-timing-function: var(--ease-optical-out);
    mix-blend-mode: normal;
  }

  /* Temporarily disable element transitions during global theme flip to prevent cascading lag */
  .theme-transitioning,
  .theme-transitioning *,
  .theme-transitioning *::before,
  .theme-transitioning *::after {
    transition: none !important;
    animation: none !important;
  }
}

```

```
// MANDATORY COMPONENT CONTRACT: src/components/primitives/magnetic-target.tsx
"use client";

import React, { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ARGON_SPRINGS } from "@/lib/motion";

interface MagneticTargetProps {
  children: React.ReactNode;
  /** Pull intensity multiplier (0.15 = subtle 3-5px pull; never exceed 0.3) */
  strength?: number;
  className?: string;
}

export function MagneticTarget({
  children,
  strength = 0.18,
  className,
}: MagneticTargetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const x = useSpring(rawX, ARGON_SPRINGS.snappy);
  const y = useSpring(rawY, ARGON_SPRINGS.snappy);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "touch" || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      rawX.set((e.clientX - centerX) * strength);
      rawY.set((e.clientY - centerY) * strength);
    },
    [rawX, rawY, strength]
  );

  const handlePointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

```

## SECTION 5: ATOMIC PRIMITIVES & INTERACTIVE CONTROLS

### 5.1 Universal Interactive State & Geometry Matrix

Every atomic interactive control in the Argon system is governed by a strict geometric height scale, optical stroke calibration, and a deterministic 6-state lifecycle (`default`, `hover`, `active`, `focus-visible`, `disabled`, `loading`).

#### 1\. Shared Control Height & Density Scale

Controls must align horizontally on a shared baseline without vertical jitter when placed side-by-side in toolbars, filter bars, or input groups:

| Size Token | Height (`px` / `rem`) | Horizontal Padding | Border Radius | Font Class | Icon Size (`px` / Stroke) | Primary Architectural Use Case |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `xs` | `24px` (`1.5rem`) | `8px` (`px-2`) | `6px` (`rounded-sm`) | `.type-micro` (`11px`) | `12px` (`1.5px` stroke) | Inline table row actions, micro tags, KBD triggers |
| `sm` | `28px` (`1.75rem`) | `10px` (`px-2.5`) | `6px` (`rounded-sm`) | `.type-caption` (`12px`) | `14px` (`1.5px` stroke) | Dense header toolbars, secondary card actions |
| `md` (Default) | `32px` (`2.0rem`) | `12px` (`px-3`) | `8px` (`rounded-md`) | `.type-body-sm` (`13px`) | `15px` (`1.5px` stroke) | **Standard desktop application controls & inputs** |
| `lg` | `36px` (`2.25rem`) | `14px` (`px-3.5`) | `8px` (`rounded-md`) | `.type-body` (`14px`) | `16px` (`1.5px` stroke) | Primary workspace forms, modal actions, command inputs |
| `xl` | `40px` (`2.5rem`) | `18px` (`px-4.5`) | `10px` (`rounded-[10px]`) | `.type-body` (`14px`) | `16px` (`1.75px` stroke) | Hero CTAs, authentication forms, mobile primary buttons |

#### 2\. The 6-State Interactive Contract

All interactive controls must implement these exact visual and behavioral rules across every state:

```css
@layer components {
  /* Universal Focus-Visible Halo: Zero mouse focus clutter; crisp 2px ring + 3px optical halo on keyboard Tab */
  .argon-focus-ring {
    outline: none;
  }

  .argon-focus-ring:focus-visible {
    border-color: var(--border-focused);
    box-shadow: 0 0 0 3px var(--ring-focus);
  }

  /* Universal Touch Target Expander: Ensures compact 24px/28px/32px controls meet 44x44px hit area on coarse pointers */
  @media (pointer: coarse) {
    .touch-target-expand {
      position: relative;
    }
    .touch-target-expand::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      min-width: 44px;
      min-height: 44px;
    }
  }
}

```

---

### 5.2 Button & IconButton Architecture (`src/components/ui/button.tsx`)

Buttons never use neon fills or heavy drop shadows. Primary actions use **Inverted Monochrome Contrast** (`#09090B` fill with `#FFFFFF` ink in Light Mode; `#F4F4F6` fill with `#08080A` ink in Dark Mode). Loading states preserve the exact bounding-box width of the button by keeping the label in the DOM at `opacity: 0` while centering a hardware-composited SVG spinner overlay.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/button.tsx
"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center select-none whitespace-nowrap font-medium",
    "transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-150 ease-[var(--ease-optical-out)]",
    "argon-focus-ring touch-target-expand",
    "active:scale-[0.975] disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** High-contrast monochrome primary CTA (#09090B Light / #F4F4F6 Dark) */
        primary: [
          "bg-surface-inverted text-ink-inverted border border-transparent",
          "shadow-ambient-xs hover:bg-surface-inverted-hover",
        ],
        /** Structural elevated surface button (#FFFFFF Light / #111215 Dark) */
        secondary: [
          "bg-surface text-ink border border-hairline",
          "shadow-ambient-xs hover:bg-surface-hover hover:border-hairline-strong active:bg-surface-active",
        ],
        /** Subtle recessed canvas button */
        subtle: [
          "bg-canvas-subtle text-ink-secondary border border-hairline-subtle",
          "hover:bg-surface-active hover:text-ink hover:border-hairline",
        ],
        /** Transparent structural wireframe button */
        outline: [
          "bg-transparent text-ink border border-hairline",
          "hover:bg-surface-hover hover:border-hairline-strong",
        ],
        /** Zero-chrome invisible button; reveals surface strictly on hover/focus */
        ghost: [
          "bg-transparent text-ink-secondary border border-transparent",
          "hover:bg-surface-hover hover:text-ink active:bg-surface-active",
        ],
        /** Liquid glass translucent pill button for floating decks & media overlays */
        glass: [
          "glass-pill text-ink",
          "hover:bg-glass-elevated hover:border-hairline-strong",
        ],
        /** Calibrated crimson destructive button */
        danger: [
          "bg-status-danger-bg text-status-danger-ink border border-status-danger-border",
          "hover:bg-[oklch(0.55_0.19_25)] hover:text-white hover:border-transparent",
          "dark:hover:bg-[oklch(0.58_0.19_25)] dark:hover:text-white",
        ],
      },
      size: {
        xs: "h-6 gap-1 px-2 rounded-sm type-micro [&_svg]:size-3",
        sm: "h-7 gap-1.5 px-2.5 rounded-sm type-caption [&_svg]:size-3.5",
        md: "h-8 gap-1.5 px-3 rounded-md type-body-sm [&_svg]:size-[15px]",
        lg: "h-9 gap-2 px-3.5 rounded-md type-body [&_svg]:size-4",
        xl: "h-10 gap-2 px-4.5 rounded-[10px] type-body [&_svg]:size-4",
        "icon-xs": "size-6 rounded-sm [&_svg]:size-3",
        "icon-sm": "size-7 rounded-sm [&_svg]:size-3.5",
        "icon-md": "size-8 rounded-md [&_svg]:size-[15px]",
        "icon-lg": "size-9 rounded-md [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child element via Radix Slot */
  asChild?: boolean;
  /** Activates zero-layout-shift loading state and disables pointer events */
  isLoading?: boolean;
  /** Optional leading icon element */
  leadingIcon?: React.ReactNode;
  /** Optional trailing icon or KBD shortcut badge */
  trailingSlot?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  disabled,
  leadingIcon,
  trailingSlot,
  children,
  ref,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";
  const isDisabled = disabled || isLoading;

  if (asChild) {
    return (
      <Slot
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <Component
      ref={ref}
      type={props.type ?? "button"}
      data-slot="button"
      data-loading={isLoading ? "true" : undefined}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {/* Content Wrapper: Hidden optically during loading while preserving exact button width */}
      <span
        className={cn(
          "inline-flex items-center justify-center gap-[inherit] transition-opacity duration-150",
          isLoading && "opacity-0"
        )}
      >
        {leadingIcon && <span className="inline-flex shrink-0">{leadingIcon}</span>}
        {children}
        {trailingSlot && <span className="inline-flex shrink-0">{trailingSlot}</span>}
      </span>

      {/* Centered 120fps Hardware-Accelerated SVG Spinner */}
      {isLoading && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <svg
            className="animate-spin"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="1.75"
            />
            <path
              d="M14 8a6 6 0 0 0-6-6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
    </Component>
  );
}

export { buttonVariants };

```

---

### 5.3 Text Inputs, Search Fields, KBD Hints & Auto-Growing Textareas (`src/components/ui/input.tsx`)

Inputs eliminate heavy inset box-shadows and thick borders. They use a unified flexbox shell that houses optional leading icons, the native `<input>`, and trailing action slots (such as clear triggers, unit labels, or `<Kbd>` shortcut hints) within a single `1px solid` focusable boundary.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/input.tsx
"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputShellVariants = cva(
  [
    "group/input relative flex w-full items-center bg-surface text-ink",
    "border border-hairline shadow-ambient-xs",
    "transition-[border-color,box-shadow,background-color] duration-150 ease-[var(--ease-optical-out)]",
    "hover:border-hairline-strong",
    "focus-within:border-hairline-focused focus-within:shadow-[0_0_0_3px_var(--ring-focus)]",
    "has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50 has-[:disabled]:bg-canvas-subtle",
    "has-[[data-invalid=true]]:border-status-danger-dot has-[[data-invalid=true]]:focus-within:shadow-[0_0_0_3px_var(--status-danger-bg)]",
  ],
  {
    variants: {
      size: {
        sm: "h-7 rounded-sm px-2.5 gap-1.5 type-caption",
        md: "h-8 rounded-md px-3 gap-2 type-body-sm",
        lg: "h-9 rounded-md px-3.5 gap-2 type-body",
        xl: "h-10 rounded-[10px] px-4 gap-2.5 type-body",
      },
      surface: {
        default: "bg-surface",
        recessed: "bg-canvas-recessed border-hairline-subtle shadow-none focus-within:bg-surface",
        glass: "glass-pill rounded-md",
      },
    },
    defaultVariants: {
      size: "md",
      surface: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">,
    VariantProps<typeof inputShellVariants> {
  /** Leading icon or inline text prefix */
  leadingSlot?: React.ReactNode;
  /** Trailing action button, unit label, or KBD badge */
  trailingSlot?: React.ReactNode;
  /** Marks input as invalid and triggers semantic crimson border + focus halo */
  isInvalid?: boolean;
  /** Enforces tabular monospace numerals for financial/numeric inputs */
  tabular?: boolean;
  containerClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({
  className,
  containerClassName,
  size,
  surface,
  leadingSlot,
  trailingSlot,
  isInvalid = false,
  tabular = false,
  ref,
  ...props
}: InputProps) {
  return (
    <div
      data-slot="input-shell"
      className={cn(inputShellVariants({ size, surface }), containerClassName)}
    >
      {leadingSlot && (
        <span className="inline-flex shrink-0 items-center text-ink-tertiary group-focus-within/input:text-ink-secondary transition-colors [&_svg]:size-4">
          {leadingSlot}
        </span>
      )}
      <input
        ref={ref}
        data-slot="input"
        data-invalid={isInvalid ? "true" : undefined}
        aria-invalid={isInvalid || undefined}
        className={cn(
          "h-full w-full min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-disabled focus:outline-none",
          "disabled:cursor-not-allowed",
          "file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-ink",
          tabular && "tabular-data font-mono",
          className
        )}
        {...props}
      />
      {trailingSlot && (
        <span className="inline-flex shrink-0 items-center gap-1 text-ink-tertiary">
          {trailingSlot}
        </span>
      )}
    </div>
  );
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isInvalid?: boolean;
  /** Uses native CSS field-sizing: content for zero-JS auto-expansion */
  autoGrow?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function Textarea({
  className,
  isInvalid = false,
  autoGrow = true,
  ref,
  ...props
}: TextareaProps) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      data-invalid={isInvalid ? "true" : undefined}
      aria-invalid={isInvalid || undefined}
      className={cn(
        "block w-full min-h-[84px] max-h-[320px] rounded-md bg-surface px-3 py-2 type-body-sm text-ink",
        "border border-hairline shadow-ambient-xs",
        "placeholder:text-ink-disabled",
        "transition-[border-color,box-shadow,background-color] duration-150 ease-[var(--ease-optical-out)]",
        "hover:border-hairline-strong",
        "focus-visible:outline-none focus-visible:border-hairline-focused focus-visible:shadow-[0_0_0_3px_var(--ring-focus)]",
        "disabled:pointer-events-none disabled:opacity-50 disabled:bg-canvas-subtle",
        "data-[invalid=true]:border-status-danger-dot data-[invalid=true]:focus-visible:shadow-[0_0_0_3px_var(--status-danger-bg)]",
        autoGrow ? "[field-sizing:content] resize-none" : "resize-y",
        className
      )}
      {...props}
    />
  );
}

```

---

### 5.4 Precision Selects & Dropdown Pickers (`src/components/ui/select.tsx`)

Built atop `@radix-ui/react-select`, the Argon Select uses the `glass-deck` surface for its floating menu, `4px` (`p-1`) concentric inner padding around `6px` (`rounded-sm`) menu items, and instantaneous keyboard highlight transitions (`data-[highlighted]`).

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/select.tsx
"use client";

import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: "sm" | "md" | "lg";
  isInvalid?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

export function SelectTrigger({
  className,
  size = "md",
  isInvalid = false,
  children,
  ref,
  ...props
}: SelectTriggerProps) {
  const sizeClasses = {
    sm: "h-7 px-2.5 rounded-sm type-caption",
    md: "h-8 px-3 rounded-md type-body-sm",
    lg: "h-9 px-3.5 rounded-md type-body",
  }[size];

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      data-invalid={isInvalid ? "true" : undefined}
      className={cn(
        "group/select inline-flex w-full items-center justify-between gap-2 bg-surface text-ink select-none",
        "border border-hairline shadow-ambient-xs",
        "transition-[border-color,box-shadow,background-color] duration-150 ease-[var(--ease-optical-out)]",
        "hover:bg-surface-hover hover:border-hairline-strong",
        "argon-focus-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[placeholder]:text-ink-tertiary",
        "data-[invalid=true]:border-status-danger-dot",
        sizeClasses,
        className
      )}
      {...props}
    >
      <span className="truncate text-start">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-3.5 shrink-0 text-ink-tertiary transition-transform duration-150 group-data-[state=open]/select:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  ref?: React.Ref<HTMLDivElement>;
}

export function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  ref,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "glass-deck z-50 max-h-80 min-w-[8rem] overflow-hidden rounded-[10px] p-1 text-ink",
          "origin-[--radix-select-content-transform-origin]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          position === "popper" &&
            "w-[var(--radix-select-trigger-width)]",
          className
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1 text-ink-tertiary">
          <ChevronUp className="size-3.5" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-0.5">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1 text-ink-tertiary">
          <ChevronDown className="size-3.5" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  ref?: React.Ref<HTMLDivElement>;
}

export function SelectItem({
  className,
  children,
  ref,
  ...props
}: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center justify-between rounded-[6px] py-1.5 ps-2.5 pe-7 type-body-sm text-ink outline-none",
        "transition-colors duration-75",
        "data-[highlighted]:bg-surface-active data-[highlighted]:text-ink-pure",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute end-2 flex size-3.5 items-center justify-center text-ink">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-3.5 stroke-[2]" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

```

---

### 5.5 Tactile Selection Controls: Switch, Checkbox & Range Slider (`src/components/ui/controls.tsx`)

Selection primitives enforce crisp mechanical feedback:

* **Switch (`36x20px`):** Uses logical translation (`ltr:data-[state=checked]:translate-x-4 rtl:data-[state=checked]:-translate-x-4`) so RTL layouts mirror automatically without breaking thumb physics.  
* **Checkbox (`16x16px`):** Uses concentric `4px` radius (`rounded-xs`) and high-contrast inverted active state.  
* **Slider:** Features a `4px` (`h-1`) recessed track and a `14x14px` precision thumb that expands its optical halo on drag.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/controls.tsx
"use client";

import React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/* ==========================================================================
   1. TACTILE SWITCH (TOGGLE)
   ========================================================================== */
export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  ref?: React.Ref<HTMLButtonElement>;
}

export function Switch({ className, ref, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-pill border border-transparent p-0.5",
        "transition-colors duration-150 ease-[var(--ease-snap)]",
        "argon-focus-ring touch-target-expand",
        "bg-canvas-recessed border-hairline data-[state=checked]:bg-surface-inverted data-[state=checked]:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-45",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-pill bg-surface shadow-ambient-sm ring-0",
          "transition-transform duration-150 ease-[var(--ease-optical-out)]",
          "data-[state=unchecked]:translate-x-0",
          "ltr:data-[state=checked]:translate-x-4 rtl:data-[state=checked]:-translate-x-4",
          " dark:data-[state=checked]:bg-canvas"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

/* ==========================================================================
   2. PRECISION CHECKBOX
   ========================================================================== */
export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  ref?: React.Ref<HTMLButtonElement>;
}

export function Checkbox({ className, ref, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        "peer inline-flex size-4 shrink-0 items-center justify-center rounded-xs bg-surface",
        "border border-hairline shadow-ambient-xs",
        "transition-[background-color,border-color,transform] duration-150 ease-[var(--ease-snap)]",
        "hover:border-hairline-strong active:scale-90",
        "argon-focus-ring touch-target-expand",
        "data-[state=checked]:bg-surface-inverted data-[state=checked]:border-surface-inverted data-[state=checked]:text-ink-inverted",
        "data-[state=indeterminate]:bg-surface-inverted data-[state=indeterminate]:border-surface-inverted data-[state=indeterminate]:text-ink-inverted",
        "disabled:cursor-not-allowed disabled:opacity-45",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {props.checked === "indeterminate" ? (
          <Minus className="size-3 stroke-[2.5]" />
        ) : (
          <Check className="size-3 stroke-[2.5]" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

/* ==========================================================================
   3. HARDWARE-PRECISION RANGE SLIDER
   ========================================================================== */
export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  ref?: React.Ref<HTMLSpanElement>;
}

export function Slider({ className, ref, ...props }: SliderProps) {
  const initialValues = Array.isArray(props.value)
    ? props.value
    : Array.isArray(props.defaultValue)
      ? props.defaultValue
      : [0];

  return (
    <SliderPrimitive.Root
      ref={ref}
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none select-none items-center py-1.5",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-pill bg-canvas-recessed border border-hairline-subtle">
        <SliderPrimitive.Range className="absolute h-full bg-surface-inverted" />
      </SliderPrimitive.Track>
      {initialValues.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={cn(
            "block size-3.5 rounded-pill bg-surface border border-hairline-focused shadow-ambient-sm",
            "transition-[transform,box-shadow] duration-150 ease-[var(--ease-optical-out)]",
            "hover:scale-110 active:scale-95",
            "argon-focus-ring cursor-grab active:cursor-grabbing"
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

```

---

### 5.6 Status Badges, KBD Shortcut Caps & Optical Avatars (`src/components/ui/badge-avatar.tsx`)

* **Badges (`<Badge>`):** Desaturated semantic pills that harmonize with monochromatic workspaces. Includes an optional `dot` prop that renders a `6px` semantic status indicator.  
* **Keyboard Keycaps (`<Kbd>`):** Simulates physical low-profile mechanical keycaps with a `1px` bottom bezel shadow (`shadow-[0_1px_0_0_var(--border-strong)]`).  
* **Optical Avatars (`<Avatar>`):** Enforces an inner `1px` contrast ring (`ring-1 ring-inset ring-black/8 dark:ring-white/10`) so light-colored avatars never merge into white backgrounds.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/badge-avatar.tsx
"use client";

import React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ==========================================================================
   1. SEMANTIC STATUS BADGE & TAG
   ========================================================================== */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 whitespace-nowrap select-none font-medium tabular-data",
    "border transition-colors duration-150",
  ],
  {
    variants: {
      variant: {
        default: "bg-canvas-subtle text-ink-secondary border-hairline",
        surface: "bg-surface text-ink border-hairline shadow-ambient-xs",
        inverted: "bg-surface-inverted text-ink-inverted border-transparent",
        success: "bg-status-success-bg text-status-success-ink border-status-success-border",
        warning: "bg-status-warning-bg text-status-warning-ink border-status-warning-border",
        danger: "bg-status-danger-bg text-status-danger-ink border-status-danger-border",
        info: "bg-status-info-bg text-status-info-ink border-status-info-border",
      },
      size: {
        sm: "h-5 px-1.5 rounded-xs type-micro",
        md: "h-6 px-2 rounded-sm type-caption",
        pill: "h-6 px-2.5 rounded-pill type-caption",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Renders a 6px status indicator dot matching the semantic variant */
  dot?: boolean;
  /** Pulses the status dot for live/streaming telemetry states */
  pulseDot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size,
  dot = false,
  pulseDot = false,
  children,
  ...props
}: BadgeProps) {
  const dotColorClass = {
    default: "bg-ink-tertiary",
    surface: "bg-ink",
    inverted: "bg-ink-inverted",
    success: "bg-status-success-dot",
    warning: "bg-status-warning-dot",
    danger: "bg-status-danger-dot",
    info: "bg-status-info-dot",
  }[variant ?? "default"];

  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span className="relative flex size-1.5 shrink-0">
          {pulseDot && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-pill opacity-75",
                dotColorClass
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex size-1.5 rounded-pill",
              dotColorClass
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}

/* ==========================================================================
   2. TACTILE KEYBOARD SHORTCUT CAP (<Kbd>)
   ========================================================================== */
export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  keys?: string[];
}

export function Kbd({ className, keys, children, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center gap-0.5 rounded-xs px-1.5",
        "bg-canvas-subtle font-sans type-micro text-ink-tertiary",
        "border border-hairline shadow-[0_1px_0_0_var(--border-default)]",
        className
      )}
      {...props}
    >
      {keys
        ? keys.map((k, i) => (
            <React.Fragment key={i}>
              <span>{k}</span>
            </React.Fragment>
          ))
        : children}
    </kbd>
  );
}

/* ==========================================================================
   3. OPTICAL AVATAR WITH INNER CONTRAST RING
   ========================================================================== */
export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "squircle";
  status?: "online" | "busy" | "offline";
  ref?: React.Ref<HTMLSpanElement>;
}

export function Avatar({
  className,
  src,
  alt = "",
  fallback,
  size = "md",
  shape = "circle",
  status,
  ref,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    xs: "size-5 type-micro",
    sm: "size-6 type-micro",
    md: "size-8 type-caption",
    lg: "size-10 type-body-sm",
    xl: "size-12 type-body",
  }[size];

  const statusColor = {
    online: "bg-status-success-dot",
    busy: "bg-status-danger-dot",
    offline: "bg-ink-tertiary",
  };

  return (
    <div className="relative inline-flex shrink-0">
      <AvatarPrimitive.Root
        ref={ref}
        data-slot="avatar"
        className={cn(
          "relative flex shrink-0 overflow-hidden bg-canvas-recessed select-none",
          "ring-1 ring-inset ring-black/[0.08] dark:ring-white/[0.10]",
          shape === "circle" ? "rounded-pill" : "rounded-md",
          sizeClasses,
          className
        )}
        {...props}
      >
        {src && (
          <AvatarPrimitive.Image
            src={src}
            alt={alt}
            className="aspect-square h-full w-full object-cover"
          />
        )}
        <AvatarPrimitive.Fallback
          delayMs={src ? 200 : 0}
          className="flex h-full w-full items-center justify-center bg-canvas-subtle font-medium text-ink-secondary uppercase"
        >
          {fallback.slice(0, 2)}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {status && (
        <span
          aria-label={`Status: ${status}`}
          className={cn(
            "absolute bottom-0 end-0 block size-2.5 rounded-pill ring-2 ring-surface",
            statusColor[status]
          )}
        />
      )}
    </div>
  );
}

```

## SECTION 6: COMPLEX SURFACES, WINDOWS, BENTO CARDS, PANELS & OVERLAYS

### 6.1 Structural Bento Card & Concentric Well Architecture (`src/components/ui/bento-card.tsx`)

Bento cards in the Argon system never rely on heavy drop shadows, neon gradients, or thick borders. They achieve depth through **Concentric Curvature**, **Recessed Inner Wells**, and **1px Luminance Contrast**:

* **Outer Shell:** `rounded-2xl` (`20px`) with `p-2` (`8px`) or `p-5` (`20px`), `bg-surface`, and `border-hairline`.  
* **Inner Visual Well:** When a card contains an interactive preview, chart, or media canvas, the inner container sits inside an `8px` (`p-2`) outer frame and uses `rounded-xl` (`12px` \= \$20\\text{px} \- 8\\text{px}\$) with `bg-canvas-subtle` and `border-hairline-subtle`.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/bento-card.tsx
"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { SpecularSurface } from "@/components/primitives/specular-surface";
import { cn } from "@/lib/utils";

const bentoCardVariants = cva(
  [
    "group/bento relative flex flex-col justify-between overflow-hidden",
    "rounded-2xl bg-surface text-ink border border-hairline shadow-ambient-xs",
    "transition-[border-color,box-shadow,transform] duration-200 ease-[var(--ease-optical-out)]",
  ],
  {
    variants: {
      variant: {
        /** Standard structural surface card */
        default: "bg-surface border-hairline",
        /** Recessed secondary canvas card for passive telemetry */
        recessed: "bg-canvas-subtle border-hairline-subtle shadow-none",
        /** Translucent liquid glass card for floating workspace panels */
        glass: "glass-deck border-hairline",
        /** High-contrast inverted monochrome card */
        inverted: "bg-surface-inverted text-ink-inverted border-transparent shadow-ambient-md",
      },
      interactive: {
        true: "cursor-pointer hover:border-hairline-strong hover:shadow-ambient-sm active:scale-[0.994]",
        false: "",
      },
      padding: {
        none: "p-0",
        /** Concentric frame padding (20px outer radius - 8px padding = 12px inner well radius) */
        framed: "p-2",
        compact: "p-4",
        default: "p-5",
        spacious: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
      padding: "default",
    },
  }
);

export interface BentoCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoCardVariants> {
  /** Enables cursor-reactive 1px monochrome specular border physics */
  specular?: boolean;
  /** Responsive 12-column span classes (e.g., "col-span-12 md:col-span-6 lg:col-span-4") */
  spanClassName?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export function BentoCard({
  className,
  spanClassName,
  variant = "default",
  interactive = false,
  padding = "default",
  specular = true,
  children,
  ref,
  ...props
}: BentoCardProps) {
  if (specular && variant === "default") {
    return (
      <SpecularSurface
        ref={ref}
        data-slot="bento-card"
        className={cn(
          bentoCardVariants({ variant, interactive, padding }),
          spanClassName,
          className
        )}
        {...props}
      >
        {children}
      </SpecularSurface>
    );
  }

  return (
    <div
      ref={ref}
      data-slot="bento-card"
      className={cn(
        bentoCardVariants({ variant, interactive, padding }),
        spanClassName,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Concentric Inner Well: Placed inside a <BentoCard padding="framed"> (p-2 / 8px)
 * Enforces exact R_inner = 20px - 8px = 12px (rounded-xl) optical curvature.
 */
export function BentoInnerWell({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="bento-inner-well"
      className={cn(
        "relative flex-1 overflow-hidden rounded-xl bg-canvas-subtle p-4 border border-hairline-subtle",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function BentoHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="bento-header"
      className={cn("flex items-start justify-between gap-3", className)}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-canvas-subtle border border-hairline-subtle text-ink-secondary [&_svg]:size-4">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="type-h3 text-ink truncate">{title}</h3>
          {subtitle && (
            <p className="type-caption text-ink-tertiary truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

```

---

### 6.2 Floating iOS / visionOS Glass Dock & Action Deck (`src/components/ui/floating-dock.tsx`)

Inspired by Apple visionOS and macOS/iOS floating spatial decks, the `<FloatingDock>` hovers `16px` (`bottom-4`) above the viewport bottom (respecting `env(safe-area-inset-bottom)`), wrapped in the `.glass-deck` material stack (`backdrop-filter: blur(24px) saturate(190%)`). On fine-pointer desktop devices, icons respond to cursor proximity via a continuous Gaussian distance spring without triggering React re-renders.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/floating-dock.tsx
"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ARGON_SPRINGS } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface DockItemConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  isActive?: boolean;
  badgeCount?: number;
}

export interface FloatingDockProps {
  items: readonly DockItemConfig[];
  className?: string;
}

export function FloatingDock({ items, className }: FloatingDockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <nav
      aria-label="Primary Floating Dock"
      data-slot="floating-dock"
      onPointerMove={(e) => {
        if (e.pointerType !== "touch") {
          mouseX.set(e.pageX);
        }
      }}
      onPointerLeave={() => mouseX.set(Infinity)}
      className={cn(
        "glass-deck surface-grain fixed bottom-4 inset-x-0 z-40 mx-auto flex h-14 w-fit items-center gap-1.5 rounded-2xl px-2.5",
        "mb-[env(safe-area-inset-bottom,0px)] select-none",
        className
      )}
    >
      {items.map((item) => (
        <DockIconButton key={item.id} item={item} mouseX={mouseX} />
      ))}
    </nav>
  );
}

function DockIconButton({
  item,
  mouseX,
}: {
  item: DockItemConfig;
  mouseX: MotionValue<number>;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  /* Maps cursor proximity [-110px, 0px, 110px] to icon button size [40px, 50px, 40px] */
  const rawSize = useTransform(distance, [-110, 0, 110], [40, 50, 40]);
  const size = useSpring(rawSize, ARGON_SPRINGS.snappy);

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={item.label}
      onClick={item.onClick}
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.92 }}
      className={cn(
        "group/dock-item relative flex aspect-square items-center justify-center rounded-xl",
        "transition-colors duration-150 argon-focus-ring touch-target-expand",
        item.isActive
          ? "bg-surface-inverted text-ink-inverted shadow-ambient-sm"
          : "bg-surface/60 text-ink-secondary hover:bg-surface hover:text-ink border border-hairline-subtle"
      )}
    >
      {/* Zero-Latency Hover Label Pill */}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap",
          "rounded-sm bg-surface-inverted px-2 py-0.5 type-micro text-ink-inverted shadow-ambient-sm",
          "opacity-0 translate-y-1 scale-95 transition-[opacity,transform] duration-150 ease-[var(--ease-expo-out)]",
          "group-hover/dock-item:opacity-100 group-hover/dock-item:translate-y-0 group-hover/dock-item:scale-100"
        )}
      >
        {item.label}
      </span>

      <span className="[&_svg]:size-[18px] [&_svg]:stroke-[1.6]">{item.icon}</span>

      {/* Unread / Telemetry Counter Dot */}
      {typeof item.badgeCount === "number" && item.badgeCount > 0 && (
        <span
          data-numeric="true"
          className="tabular-data absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-pill bg-status-danger-dot px-1 type-micro text-white ring-2 ring-surface"
        >
          {item.badgeCount > 99 ? "99+" : item.badgeCount}
        </span>
      )}

      {/* Active Workspace 4px Specular Dot */}
      {item.isActive && (
        <span className="absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-pill bg-ink" />
      )}
    </motion.button>
  );
}

```

---

### 6.3 Modals, Dialogs & Vaul Physics Bottom Sheets (`src/components/ui/dialog-drawer.tsx`)

Overlays adapt ergonomically to device posture:

1. **Desktop Modal (`<Dialog>`):** Centers in the viewport (`max-w-lg`) over a `6px` Gaussian blur backdrop (`.glass-backdrop`). Enters from `scale(0.96)` and `blur(4px)` to `scale(1)` and `blur(0px)` in `180ms` via `--ease-expo-out`.  
2. **Mobile & Touch Drawer (`<BottomSheet>` via `vaul`):** Anchors to the bottom viewport edge with velocity-aware swipe-to-dismiss physics, a `36x4px` (`w-9 h-1`) recessed drag pill, and background scaling (`[vaul-drawer-wrapper]` scales down to `0.97` with `16px` rounded corners when a sheet opens).

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/dialog-drawer.tsx
"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Drawer as VaulDrawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ==========================================================================
   1. PRECISION DESKTOP MODAL DIALOG
   ========================================================================== */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className={cn(
          "glass-backdrop fixed inset-0 z-50",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
        )}
      />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        className={cn(
          "glass-deck fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl p-6 text-ink",
          "duration-200 ease-[var(--ease-expo-out)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "focus:outline-none",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            aria-label="Close modal"
            className={cn(
              "absolute end-4 top-4 inline-flex size-7 items-center justify-center rounded-sm text-ink-tertiary",
              "hover:bg-surface-hover hover:text-ink transition-colors argon-focus-ring touch-target-expand"
            )}
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1 text-start", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
  ref?: React.Ref<HTMLHeadingElement>;
}) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("type-h2 text-ink", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
  ref?: React.Ref<HTMLParagraphElement>;
}) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("type-body-sm text-ink-secondary", className)}
      {...props}
    />
  );
}

/* ==========================================================================
   2. VAUL PHYSICS BOTTOM SHEET (VELOCITY SNAP & BACKGROUND RECESSION)
   ========================================================================== */
export function BottomSheet({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Root>) {
  return (
    <VaulDrawer.Root
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    />
  );
}

export const BottomSheetTrigger = VaulDrawer.Trigger;
export const BottomSheetClose = VaulDrawer.Close;

export function BottomSheetContent({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof VaulDrawer.Content> & {
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <VaulDrawer.Portal>
      <VaulDrawer.Overlay className="glass-backdrop fixed inset-0 z-50" />
      <VaulDrawer.Content
        ref={ref}
        data-slot="bottom-sheet-content"
        className={cn(
          "glass-deck fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[92dvh] flex-col rounded-t-3xl border-t border-hairline text-ink focus:outline-none",
          "pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]",
          className
        )}
        {...props}
      >
        {/* Tactile Drag Affordance Handle (36x4px) */}
        <div className="mx-auto mt-3 mb-2 h-1 w-9 shrink-0 rounded-pill bg-ink-disabled/60" />
        <div className="flex-1 overflow-y-auto px-5 pt-2">{children}</div>
      </VaulDrawer.Content>
    </VaulDrawer.Portal>
  );
}

```

---

### 6.4 Zero-Latency Warmup Tooltips & Precision Context Menus (`src/components/ui/tooltip-dropdown.tsx`)

Desktop-grade ergonomics require **Warmup/Cooldown Tooltip Choreography**:

* Hovering the first toolbar button waits `260ms` (`delayDuration={260}`) so accidental cursor fly-overs never trigger visual noise.  
* Once a tooltip is open, sliding across adjacent controls triggers subsequent tooltips with **zero latency (`0ms`)** during a `400ms` cooldown window (`skipDelayDuration={400}`), and animates strictly from the anchor origin (`origin-[--radix-tooltip-content-transform-origin]`).

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/tooltip-dropdown.tsx
"use client";

import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Kbd } from "@/components/ui/badge-avatar";
import { cn } from "@/lib/utils";

/* ==========================================================================
   1. ZERO-LATENCY WARMUP TOOLTIP SYSTEM
   ========================================================================== */
export function TooltipProvider({
  delayDuration = 260,
  skipDelayDuration = 400,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent
      {...props}
    >
      {children}
    </TooltipPrimitive.Provider>
  );
}

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  shortcut,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
  /** Optional keyboard shortcut keys rendered inline inside the tooltip */
  shortcut?: string[];
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 inline-flex items-center gap-2 overflow-hidden rounded-sm bg-surface-inverted px-2.5 py-1 type-caption text-ink-inverted shadow-ambient-md select-none",
          "origin-[--radix-tooltip-content-transform-origin]",
          "animate-in fade-in-0 zoom-in-95 duration-100 ease-[var(--ease-expo-out)]",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-75",
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {shortcut && shortcut.length > 0 && (
          <span className="inline-flex items-center gap-0.5 opacity-80">
            {shortcut.map((key, idx) => (
              <kbd
                key={idx}
                className="inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] bg-white/15 px-1 font-sans type-micro text-ink-inverted dark:bg-black/15"
              >
                {key}
              </kbd>
            ))}
          </span>
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

/* ==========================================================================
   2. PRECISION DROPDOWN & CONTEXT MENU
   ========================================================================== */
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export function DropdownMenuContent({
  className,
  sideOffset = 5,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        data-slot="dropdown-content"
        sideOffset={sideOffset}
        className={cn(
          "glass-deck z-50 min-w-[12rem] overflow-hidden rounded-[10px] p-1 text-ink",
          "origin-[--radix-dropdown-menu-content-transform-origin]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-150 ease-[var(--ease-expo-out)]",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  intent = "default",
  icon,
  shortcut,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  intent?: "default" | "danger";
  icon?: React.ReactNode;
  shortcut?: string[];
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot="dropdown-item"
      className={cn(
        "relative flex cursor-default select-none items-center justify-between gap-4 rounded-[6px] px-2.5 py-1.5 type-body-sm outline-none transition-colors duration-75",
        intent === "default" && [
          "text-ink data-[highlighted]:bg-surface-active data-[highlighted]:text-ink-pure",
        ],
        intent === "danger" && [
          "text-status-danger-ink data-[highlighted]:bg-status-danger-bg data-[highlighted]:text-status-danger-ink",
        ],
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-2 truncate">
        {icon && (
          <span className="inline-flex shrink-0 text-ink-tertiary group-data-[highlighted]:text-current [&_svg]:size-3.5">
            {icon}
          </span>
        )}
        <span className="truncate">{children}</span>
      </span>
      {shortcut && <Kbd keys={shortcut} />}
    </DropdownMenuPrimitive.Item>
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-hairline-subtle", className)}
      {...props}
    />
  );
}

```

---

### 6.5 Universal Command Palette Engine (`Cmd+K` / `src/components/ui/command-palette.tsx`)

Every desktop/web application refactored under Argon must expose a global `Cmd+K` / `Ctrl+K` Command Palette built atop `cmdk` and Radix Dialog. It features a top glass search header, categorized result sections, instant keyboard navigation, and a recessed bottom telemetry legend bar.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/command-palette.tsx
"use client";

import React, { useEffect } from "react";
import { Command as CommandPrimitive } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, CornerDownLeft } from "lucide-react";
import { Kbd } from "@/components/ui/badge-avatar";
import { cn } from "@/lib/utils";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  children: React.ReactNode;
}

export function CommandPalette({
  open,
  onOpenChange,
  placeholder = "Type a command or search workspace...",
  children,
}: CommandPaletteProps) {
  /* Global Cmd+K / Ctrl+K Hotkey Listener */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="glass-backdrop fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150" />
        <DialogPrimitive.Content
          aria-label="Command Palette"
          data-slot="command-palette"
          className={cn(
            "glass-deck fixed left-1/2 top-[16vh] z-50 w-[calc(100%-2rem)] max-w-[620px] -translate-x-1/2 overflow-hidden rounded-2xl p-0 text-ink",
            "duration-150 ease-[var(--ease-expo-out)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "focus:outline-none"
          )}
        >
          <CommandPrimitive
            loop
            className="flex h-full w-full flex-col overflow-hidden bg-transparent"
          >
            {/* Top Search Bar with ESC Trigger */}
            <div className="flex h-12 items-center gap-2.5 border-b border-hairline-subtle px-4">
              <Search className="size-4 shrink-0 text-ink-tertiary" />
              <CommandPrimitive.Input
                placeholder={placeholder}
                className="flex h-full w-full bg-transparent type-body text-ink placeholder:text-ink-disabled focus:outline-none"
              />
              <Kbd keys={["ESC"]} />
            </div>

            {/* Scrollable Results Viewport */}
            <CommandPrimitive.List className="max-h-[360px] overflow-y-auto overscroll-contain p-1.5">
              <CommandPrimitive.Empty className="py-10 text-center type-body-sm text-ink-tertiary">
                No matching commands or records found.
              </CommandPrimitive.Empty>
              {children}
            </CommandPrimitive.List>

            {/* Recessed Bottom Telemetry & Shortcut Legend Bar */}
            <div className="flex h-8 items-center justify-between border-t border-hairline-subtle bg-canvas-subtle/70 px-3.5 type-micro text-ink-tertiary">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Kbd keys={["↑", "↓"]} /> Navigate
                </span>
                <span className="inline-flex items-center gap-1">
                  <Kbd>
                    <CornerDownLeft className="size-2.5" />
                  </Kbd>{" "}
                  Execute
                </span>
              </div>
              <span className="font-mono uppercase tracking-wider opacity-75">
                ARGON OS
              </span>
            </div>
          </CommandPrimitive>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function CommandGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "overflow-hidden p-1 text-ink [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:type-micro [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-ink-tertiary",
        className
      )}
      {...props}
    />
  );
}

export function CommandItem({
  className,
  icon,
  shortcut,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
  icon?: React.ReactNode;
  shortcut?: string[];
}) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-default select-none items-center justify-between gap-3 rounded-md px-2.5 py-2 type-body-sm text-ink outline-none",
        "transition-colors duration-75",
        "data-[selected=true]:bg-surface-active data-[selected=true]:text-ink-pure",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5 truncate">
        {icon && (
          <span className="flex size-5 shrink-0 items-center justify-center text-ink-tertiary [&_svg]:size-4">
            {icon}
          </span>
        )}
        <span className="truncate">{children}</span>
      </div>
      {shortcut && <Kbd keys={shortcut} />}
    </CommandPrimitive.Item>
  );
}

```

## SECTION 7: DATA VISUALIZATION, TABLES, WIDGETS, EMPTY STATES & FEEDBACK SYSTEMS

### 7.1 High-Density Architectural Data Tables (`src/components/ui/data-table.tsx`)

Argon data tables reject bloated padding and heavy zebra striping. Inspired by Linear issue lists and Vercel deployment logs, they prioritize **information density**, **tabular numeric alignment**, and **zero-clutter row actions**:

1. **Row Density:** Compact rows lock to `36px` (`h-9`) and standard rows lock to `44px` (`h-11`).  
2. **Sticky Glass Header:** Table headers (`<thead>`) remain pinned during vertical scrolling using `bg-glass` (`backdrop-filter: blur(12px)`), separated by a crisp `1px solid var(--border-default)` bottom hairline.  
3. **Numeric & Monospace Discipline:** All financial, latency, timestamp, ID, and percentage cells must apply `align="end"` (`text-end`) and `numeric` (`tabular-data font-mono`) so decimal points and digits align vertically to the sub-pixel.  
4. **Hover-Revealed Row Actions:** Secondary row actions (copy ID, open menu, archive) remain hidden (`opacity-0`) at rest and materialize (`group-hover/row:opacity-100 group-focus-within/row:opacity-100`) on row hover or keyboard focus.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/data-table.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Enforces 36px ultra-dense telemetry rows instead of 44px standard rows */
  density?: "compact" | "default";
  /** Wraps table in a 1px structural hairline rounded container */
  framed?: boolean;
  containerClassName?: string;
  ref?: React.Ref<HTMLTableElement>;
}

export function Table({
  className,
  containerClassName,
  density = "default",
  framed = true,
  ref,
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      data-density={density}
      className={cn(
        "group/table relative w-full overflow-x-auto overscroll-x-contain",
        framed && "rounded-xl bg-surface border border-hairline shadow-ambient-xs",
        containerClassName
      )}
    >
      <table
        ref={ref}
        data-slot="table"
        className={cn(
          "w-full caption-bottom border-collapse text-start type-body-sm text-ink",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement>;
}) {
  return (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn(
        "sticky top-0 z-10 bg-glass backdrop-blur-md border-b border-hairline select-none",
        className
      )}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement>;
}) {
  return (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={cn(
        "divide-y divide-hairline-subtle [&_tr:last-child]:border-0",
        className
      )}
      {...props}
    />
  );
}

export function TableRow({
  className,
  isSelected = false,
  interactive = true,
  ref,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  isSelected?: boolean;
  interactive?: boolean;
  ref?: React.Ref<HTMLTableRowElement>;
}) {
  return (
    <tr
      ref={ref}
      data-slot="table-row"
      data-state={isSelected ? "selected" : undefined}
      className={cn(
        "group/row transition-colors duration-100",
        interactive && "hover:bg-surface-hover",
        "data-[state=selected]:bg-surface-active",
        className
      )}
      {...props}
    />
  );
}

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: "start" | "center" | "end";
  ref?: React.Ref<HTMLTableCellElement>;
}

export function TableHead({
  className,
  align = "start",
  ref,
  ...props
}: TableHeadProps) {
  const alignClass = {
    start: "text-start",
    center: "text-center",
    end: "text-end",
  }[align];

  return (
    <th
      ref={ref}
      data-slot="table-head"
      className={cn(
        "h-8 px-3.5 align-middle type-micro uppercase text-ink-tertiary font-medium whitespace-nowrap",
        "first:ps-4 last:pe-4",
        alignClass,
        className
      )}
      {...props}
    />
  );
}

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: "start" | "center" | "end";
  /** Enforces tabular numerals and monospace font for numbers, IDs, and metrics */
  numeric?: boolean;
  /** Fades cell content to secondary/tertiary ink for metadata columns */
  muted?: boolean;
  ref?: React.Ref<HTMLTableCellElement>;
}

export function TableCell({
  className,
  align = "start",
  numeric = false,
  muted = false,
  ref,
  ...props
}: TableCellProps) {
  const alignClass = {
    start: "text-start",
    center: "text-center",
    end: "text-end",
  }[align];

  return (
    <td
      ref={ref}
      data-slot="table-cell"
      data-numeric={numeric ? "true" : undefined}
      className={cn(
        "px-3.5 align-middle whitespace-nowrap",
        "h-11 group-data-[density=compact]/table:h-9",
        "first:ps-4 last:pe-4",
        alignClass,
        numeric && "tabular-data font-mono type-caption",
        muted ? "text-ink-secondary" : "text-ink",
        className
      )}
      {...props}
    />
  );
}

```

---

### 7.2 Optical Telemetry, KPIs & Monochrome/Semantic Sparklines (`src/components/ui/telemetry-sparkline.tsx`)

Data visualization in the Argon system strictly forbids multi-colored rainbow charts, heavy gridlines, and glowing drop shadows.

1. **Color Hierarchy:** Primary data series render in high-contrast monochrome (`var(--ink-primary)`), historical baselines render in dashed `1px` Titanium Gray (`var(--ink-tertiary)`), and semantic delta indicators use calibrated OKLCH status tokens (`emerald` for positive, `crimson` for negative, `cobalt` for informational).  
2. **Gridline Discipline:** Use at most 3 horizontal dashed reference hairlines (`stroke="var(--border-subtle)" strokeDasharray="3 3"`). Never render vertical chart gridlines unless actively scrubbing with a crosshair.  
3. **Vector Sparkline & KPI Telemetry Card:** Use the zero-dependency SVG engine below for instantaneous SSR rendering with zero layout shift.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/telemetry-sparkline.tsx
"use client";

import React, { useId, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { BentoCard } from "@/components/ui/bento-card";
import { Badge } from "@/components/ui/badge-avatar";
import { cn } from "@/lib/utils";

export type SparklineIntent = "monochrome" | "success" | "danger" | "info";

export interface SparklineProps extends React.SVGAttributes<SVGSVGElement> {
  /** Array of numeric data points (minimum 2 points) */
  data: readonly number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  intent?: SparklineIntent;
  /** Renders a subtle vertical area gradient under the stroke path */
  showArea?: boolean;
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  strokeWidth = 1.5,
  intent = "monochrome",
  showArea = true,
  className,
  ...props
}: SparklineProps) {
  const gradientId = useId();

  const strokeColor = {
    monochrome: "var(--ink-primary)",
    success: "var(--status-success-dot)",
    danger: "var(--status-danger-dot)",
    info: "var(--status-info-dot)",
  }[intent];

  const { linePath, areaPath, lastPoint } = useMemo(() => {
    if (!data || data.length < 2) {
      return { linePath: "", areaPath: "", lastPoint: null };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min === 0 ? 1 : max - min;
    const pad = strokeWidth + 2;
    const innerW = width - pad * 2;
    const innerH = height - pad * 2;

    const points = data.map((val, idx) => {
      const x = pad + (idx / (data.length - 1)) * innerW;
      const y = pad + innerH - ((val - min) / range) * innerH;
      return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
    });

    const line = points
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
      .join(" ");

    const first = points[0];
    const last = points[points.length - 1];
    const area = `${line} L ${last.x} ${height} L ${first.x} ${height} Z`;

    return { linePath: line, areaPath: area, lastPoint: last };
  }, [data, width, height, strokeWidth]);

  if (!data || data.length < 2) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      fill="none"
      aria-hidden="true"
      data-slot="sparkline"
      className={cn("overflow-visible shrink-0 select-none", className)}
      {...props}
    >
      {showArea && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.16" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
      )}

      {showArea && <path d={areaPath} fill={`url(#${gradientId})`} />}

      <path
        d={linePath}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {lastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={2.25}
          fill={strokeColor}
          className=" ring-2 ring-surface"
        />
      )}
    </svg>
  );
}

/* ==========================================================================
   TELEMETRY KPI METRIC CARD
   ========================================================================== */
export interface TelemetryMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string;
    trend: "up" | "down" | "neutral";
    /** Set false if upward trend is negative (e.g., error rate or latency) */
    positiveIsGood?: boolean;
  };
  sparklineData?: readonly number[];
  footnote?: string;
  className?: string;
}

export function TelemetryMetricCard({
  label,
  value,
  unit,
  delta,
  sparklineData,
  footnote,
  className,
}: TelemetryMetricCardProps) {
  const positiveIsGood = delta?.positiveIsGood ?? true;

  const badgeVariant = !delta || delta.trend === "neutral"
    ? "default"
    : (delta.trend === "up" && positiveIsGood) ||
        (delta.trend === "down" && !positiveIsGood)
      ? "success"
      : "danger";

  const sparklineIntent: SparklineIntent =
    badgeVariant === "success"
      ? "success"
      : badgeVariant === "danger"
        ? "danger"
        : "monochrome";

  return (
    <BentoCard padding="default" className={cn("gap-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="type-caption font-medium text-ink-secondary truncate">
          {label}
        </span>
        {delta && (
          <Badge variant={badgeVariant} size="sm" className="gap-0.5">
            {delta.trend === "up" && <ArrowUpRight className="size-3" />}
            {delta.trend === "down" && <ArrowDownRight className="size-3" />}
            {delta.trend === "neutral" && <Minus className="size-3" />}
            <span>{delta.value}</span>
          </Badge>
        )}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span
            data-numeric="true"
            className="tabular-data type-display-lg font-semibold tracking-tight text-ink truncate"
          >
            {value}
          </span>
          {unit && (
            <span className="type-caption font-mono text-ink-tertiary">
              {unit}
            </span>
          )}
        </div>

        {sparklineData && sparklineData.length > 1 && (
          <Sparkline
            data={sparklineData}
            intent={sparklineIntent}
            width={96}
            height={32}
          />
        )}
      </div>

      {footnote && (
        <div className="pt-2 border-t border-hairline-subtle">
          <p className="type-micro text-ink-tertiary truncate">{footnote}</p>
        </div>
      )}
    </BentoCard>
  );
}

```

---

### 7.3 Liquid Glass Toast & Notification Choreography (`src/components/ui/toaster.tsx`)

Toasts use `sonner` configured as a stack of `.glass-deck` pills. They never use solid neon red or green backgrounds; instead, they preserve the translucent monochrome surface and indicate status strictly through a calibrated `16px` leading vector icon or pulsing status dot.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/toaster.tsx
"use client";

import React from "react";
import { Toaster as SonnerToaster } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Loader2,
} from "lucide-react";

export function ArgonToaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      expand={false}
      visibleToasts={4}
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            "glass-deck group/toast flex w-full max-w-[360px] items-start gap-3 rounded-xl p-3.5 text-ink",
            "border border-hairline shadow-deck select-none",
          ].join(" "),
          title: "type-body-sm font-medium text-ink leading-tight",
          description: "type-caption text-ink-secondary mt-0.5 leading-snug",
          actionButton: [
            "inline-flex h-6 items-center justify-center rounded-sm bg-surface-inverted px-2.5 type-micro font-medium text-ink-inverted",
            "hover:bg-surface-inverted-hover transition-colors shrink-0",
          ].join(" "),
          cancelButton: [
            "inline-flex h-6 items-center justify-center rounded-sm bg-canvas-subtle px-2 type-micro font-medium text-ink-secondary",
            "border border-hairline hover:text-ink transition-colors shrink-0",
          ].join(" "),
        },
      }}
      icons={{
        success: <CheckCircle2 className="size-4 text-status-success-dot shrink-0 mt-0.5" />,
        warning: <AlertTriangle className="size-4 text-status-warning-dot shrink-0 mt-0.5" />,
        error: <XCircle className="size-4 text-status-danger-dot shrink-0 mt-0.5" />,
        info: <Info className="size-4 text-status-info-dot shrink-0 mt-0.5" />,
        loading: <Loader2 className="size-4 text-ink-tertiary animate-spin shrink-0 mt-0.5" />,
      }}
    />
  );
}

```

---

### 7.4 Form Field Architecture & Animated Inline Validation (`src/components/ui/form-field.tsx`)

Never render raw unaligned `<label>` tags or sudden red error text that causes vertical layout jumps. Wrap every form control in `<FormField>` to enforce a `6px` (`gap-1.5`) structural stack and smooth `AnimatePresence` height projection for validation messages.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/form-field.tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { ARGON_SPRINGS } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label: React.ReactNode;
  /** Optional metadata hint on the opposite end of the label (e.g., "Optional", "Max 64 chars") */
  labelHint?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | null;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  labelHint,
  description,
  errorMessage,
  required = false,
  children,
  className,
}: FormFieldProps) {
  const hasError = Boolean(errorMessage);

  return (
    <div
      data-slot="form-field"
      data-invalid={hasError ? "true" : undefined}
      className={cn("flex flex-col gap-1.5 w-full", className)}
    >
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="type-body-sm font-medium text-ink select-none cursor-pointer"
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              className="ms-1 text-status-danger-dot font-mono"
            >
              *
            </span>
          )}
        </label>
        {labelHint && (
          <span className="type-micro text-ink-tertiary">{labelHint}</span>
        )}
      </div>

      {children}

      <AnimatePresence initial={false} mode="wait">
        {hasError ? (
          <motion.div
            key="error"
            role="alert"
            initial={{ opacity: 0, height: 0, y: -2 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -2 }}
            transition={ARGON_SPRINGS.snappy}
            className="overflow-hidden"
          >
            <p className="flex items-center gap-1.5 pt-0.5 type-caption text-status-danger-ink">
              <AlertCircle className="size-3.5 shrink-0 text-status-danger-dot" />
              <span>{errorMessage}</span>
            </p>
          </motion.div>
        ) : description ? (
          <motion.div
            key="description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="type-caption text-ink-tertiary">{description}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

```

---

### 7.5 Architectural Blueprint Empty & Error States (`src/components/ui/empty-state.tsx`)

Cartoonish vector illustrations in empty states are strictly banned. When a table, search query, or Bento module has zero records or encounters a recoverable fault, render an **Architectural Wireframe Blueprint** (`1px` radial dot or hairline grid mask) with a concentric icon well and direct recovery actions.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/empty-state.tsx
import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Primary CTA button or recovery trigger */
  action?: React.ReactNode;
  /** Secondary documentation or filter reset link */
  secondaryAction?: React.ReactNode;
  /** Renders a subtle 1px architectural dot-matrix blueprint background */
  blueprintGrid?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  blueprintGrid = true,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "relative flex min-h-[260px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl p-8 text-center",
        "bg-canvas-subtle/60 border border-dashed border-hairline",
        className
      )}
      {...props}
    >
      {/* Subtle Radial-Masked 1px Architectural Blueprint Matrix */}
      {blueprintGrid && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10",
            "bg-[radial-gradient(var(--border-strong)_1px,transparent_1px)] [background-size:16px_16px]",
            "[mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-60"
          )}
        />
      )}

      {/* Concentric Double-Ring Icon Well */}
      {icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-canvas-recessed/80 p-1.5 border border-hairline-subtle shadow-ambient-xs">
          <div className="flex size-full items-center justify-center rounded-lg bg-surface text-ink-secondary border border-hairline [&_svg]:size-4 [&_svg]:stroke-[1.5]">
            {icon}
          </div>
        </div>
      )}

      <h3 className="type-h3 text-ink max-w-sm">{title}</h3>

      {description && (
        <p className="mt-1 max-w-md type-body-sm text-ink-secondary text-balance">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

```

---

## SECTION 8: RESPONSIVE, PWA, NATIVE MOBILE ERGONOMICS, ACCESSIBILITY & FINAL AUDIT CHECKLIST

### 8.1 Native-Grade Mobile, PWA & Touch Physics Architecture

A web application or hybrid shell built under Argon must be indistinguishable from a native iOS 18 / macOS application. Enforce the following viewport, touch-latency, and overscroll rules across all mobile and PWA surfaces:

1. **Zero Tap-Delay & Callout Suppression:** Apply `touch-action: manipulation` globally to all interactive elements to eliminate the legacy `300ms` double-tap zoom delay. Suppress iOS long-press magnifying callouts (`-webkit-touch-callout: none`) on UI chrome while keeping article/table text selectable (`user-select: text`).  
2. **Virtual Keyboard Viewport Adaptation:** Configure the root viewport meta tag with `interactiveWidget: "resizes-content"` so fixed bottom bars and Vaul drawers smoothly ride above the mobile virtual keyboard without obscuring focused inputs.  
3. **Input Auto-Zoom Prevention Law:** On viewports `< 768px`, any `<input>`, `<select>`, or `<textarea>` with a computed `font-size` below `16px` triggers a jarring forced page zoom in iOS Safari. Automatically lock input font size to `16px` (`1rem`) on coarse pointers while preserving compact visual padding.

```css
@layer base {
  /* 1. Eliminate 300ms Tap Delay & Unintended Gesture Interception */
  a,
  button,
  input,
  select,
  textarea,
  label,
  summary,
  [role="button"],
  [role="tab"],
  [role="menuitem"],
  [data-slot] {
    touch-action: manipulation;
  }

  /* 2. Native App Chrome Selection Hygiene */
  nav,
  header,
  footer,
  aside,
  button,
  [role="dialog"],
  [data-slot="floating-dock"],
  [data-slot="segmented-control"] {
    -webkit-touch-callout: none;
    user-select: none;
  }

  /* 3. iOS Safari Input Auto-Zoom Prevention on Mobile Touch Devices */
  @media (pointer: coarse) and (max-width: 767px) {
    input,
    select,
    textarea {
      font-size: max(16px, 1em) !important;
    }
  }

  /* 4. Momentum Scroll Container Utility with Hidden Scrollbars */
  .scroll-native-momentum {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--border-strong) transparent;
  }

  .scroll-native-none {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .scroll-native-none::-webkit-scrollbar {
    display: none;
  }
}

```

#### Next.js App Router Root Viewport & PWA Polarity Contract (`src/app/layout.tsx`)

Configure the Next.js `Viewport` export so the browser/PWA status bar dynamically matches the Light Default (`#F6F7F9`) and Obsidian Dark (`#08080A`) canvas tokens:

```
// MANDATORY VIEWPORT EXPORT: src/app/layout.tsx
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F7F9" },
    { media: "(prefers-color-scheme: dark)", color: "#08080A" },
  ],
};

```

---

### 8.2 Web Haptics & Tactile Feedback Engine (`src/lib/haptics.ts`)

Pair visual spring compression (`scale(0.97)`) with physical micro-vibrations on supported mobile/PWA hardware whenever a user toggles a switch, snaps a bottom sheet, executes a command, or encounters a validation error.

```ts
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

```

---

### 8.3 Posture-Adaptive Overlay Pattern (`src/components/ui/adaptive-overlay.tsx`)

Never force desktop center modals onto mobile screens, and never force full-width mobile bottom sheets onto desktop monitors. Use `<AdaptiveOverlay>` to automatically render a precision centered `<Dialog>` on viewports \$\\ge 768\\text{px}\$ and a velocity-snapping Vaul `<BottomSheet>` on viewports \$\< 768\\text{px}\$.

```
// MANDATORY COMPONENT CONTRACT: src/components/ui/adaptive-overlay.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  BottomSheet,
  BottomSheetContent,
} from "@/components/ui/dialog-drawer";

export function useIsDesktop(breakpointPx = 768): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpointPx]);

  return isDesktop;
}

export interface AdaptiveOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AdaptiveOverlay({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: AdaptiveOverlayProps) {
  const isDesktop = useIsDesktop(768);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={className}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className={className}>
        <div className="mb-4 flex flex-col gap-1 text-start">
          <h2 className="type-h2 text-ink">{title}</h2>
          {description && (
            <p className="type-body-sm text-ink-secondary">{description}</p>
          )}
        </div>
        {children}
      </BottomSheetContent>
    </BottomSheet>
  );
}

```

---

### 8.4 WCAG AAA Accessibility, Reduced Motion & High-Contrast Guardrails

Luxury minimalism must never sacrifice accessibility. Every component must satisfy **WCAG 2.2 AA/AAA** contrast and keyboard navigability laws:

1. **Perceptual Contrast Ratios:**  
* `--ink-primary` on `--surface-primary` / `--bg-canvas`: **\$\\ge 15.4:1\$** (Exceeds WCAG AAA \$7:1\$).  
* `--ink-secondary` on `--surface-primary`: **\$\\ge 7.2:1\$** (WCAG AAA compliant for body copy).  
* `--ink-tertiary` (`#A2A8B2` Light / `#686E7A` Dark): Strictly reserved for supplementary metadata, keyboard shortcut hints (`<Kbd>`), and non-essential decorative labels—never use `--ink-tertiary` for primary body copy or standalone critical actions.  
2. **Reduced Motion Hardware Fallback (`prefers-reduced-motion: reduce`):**  
* Wrap the root React tree in `<MotionConfig reducedMotion="user">` from `motion/react`. This automatically disables spatial `x`/`y`/`scale` spring translations while preserving `opacity` cross-fades and state updates.  
* Inject the CSS fallback below so all keyframe shimmers and transitions collapse to instant micro-fades.  
3. **Forced-Colors & High-Contrast Mode (`prefers-contrast: more`):**  
* When the OS requests increased contrast, automatically step up `--border-default` and `--ink-tertiary` to higher-opacity tokens so structural `1px` hairlines become hyper-legible.

```css
@layer base {
  /* 1. Hardware Reduced-Motion Enforcement */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }

    .skeleton-shimmer::after {
      animation: none !important;
      display: none !important;
    }
  }

  /* 2. High-Contrast Optical Escalation */
  @media (prefers-contrast: more) {
    :root,
    .light {
      --border-subtle: oklch(0.850 0.010 255.0);
      --border-default: oklch(0.720 0.015 255.0);
      --ink-secondary: oklch(0.280 0.020 256.8);
      --ink-tertiary: oklch(0.450 0.020 255.0);
    }

    .dark {
      --border-subtle: oklch(1.000 0.000 0.0 / 0.18);
      --border-default: oklch(1.000 0.000 0.0 / 0.32);
      --ink-secondary: oklch(0.880 0.008 260.0);
      --ink-tertiary: oklch(0.740 0.012 262.0);
    }
  }

  /* 3. Skip-to-Main-Workspace Accessibility Trigger */
  .skip-to-content {
    position: fixed;
    top: 0.75rem;
    inset-inline-start: 0.75rem;
    z-index: 100;
    transform: translateY(-150%);
    transition: transform 150ms var(--ease-expo-out);
  }

  .skip-to-content:focus-visible {
    transform: translateY(0%);
  }
}

```

---

### 8.5 Lighthouse 100/100 & Core Web Vitals (CWV) Engineering Constraints

Every page and view must satisfy these hard performance telemetry budgets:

* **Cumulative Layout Shift (`CLS`):** `0.000` (Zero tolerance). All images must declare explicit `width`/`height` or `aspect-[x/y]`, web fonts must use `display: "swap"` with `adjustFontFallback: true`, and asynchronous data blocks must mount inside fixed-height `.skeleton-shimmer` placeholders.  
* **Interaction to Next Paint (`INP`):** `< 50ms`. Never run synchronous array sorting/filtering on the main thread inside `onClick` or `onChange` handlers without `React.startTransition()`.  
* **Offscreen Rendering Virtualization:** Any feed, log viewer, or data table rendering \$\> 50\$ rows must apply `content-visibility: auto; contain-intrinsic-size: auto 44px;` on row items or use virtualized windowing (`@tanstack/react-virtual`).  
* **Backdrop-Filter GPU Budget:** Never stack more than **3 simultaneous `backdrop-filter: blur(...)` layers** in the same viewport z-axis stack to prevent mobile GPU thermal throttling.

---

### 8.6 Master AI Agent Migration & Verification Checklist

Before an AI Coding Agent declares any UI creation or refactoring task complete, it must run through and verify every item in this deterministic audit checklist:

- [ ] **1\. Light Mode Default Verified:** Root `<html>` defaults to `.light` (`#F6F7F9` canvas / `#FFFFFF` surface / `#09090B` ink) with zero hardcoded dark-only assumptions.  
- [ ] **2\. Zero Raw Color Utilities:** Zero occurrences of `bg-slate-*`, `bg-gray-*`, `bg-zinc-*`, `text-gray-*`, or neon gradients (`from-purple-*`, `to-cyan-*`). All colors resolve to semantic Argon tokens (`bg-canvas`, `bg-surface`, `text-ink`, `border-hairline`).  
- [ ] **3\. Concentric Border Radii Enforced:** Every nested inner container computes \$R\_{\\text{inner}} \= \\max(4\\text{px}, R\_{\\text{outer}} \- P\_{\\text{parent}})\$.  
- [ ] **4\. Bidirectional LTR/RTL Parity:** Zero physical directional utilities (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`). All layout spacing uses logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`). RTL letter-spacing (`tracking`) automatically zeroes out via `--tracking-script-multiplier`.  
- [ ] **5\. Tabular Numerals Active:** Every counter, price, percentage, badge count, timer, and `<TableCell numeric>` applies `.tabular-data` (`font-variant-numeric: tabular-nums`).  
- [ ] **6\. 120FPS Compositor Motion:** Zero `transition-all` declarations. Interactive morphs use `ARGON_SPRINGS` (`snappy`, `fluid`, `silk`) and only mutate `transform`, `opacity`, or `filter`.  
- [ ] **7\. Touch & Keyboard Ergonomics:** All compact controls include `.touch-target-expand` (`44x44px` coarse hit area) and `.argon-focus-ring` (`:focus-visible` halo). Global `Cmd+K` Command Palette and `ESC` dismissal work without mouse interaction.

`[END OF DESIGN-SYSTEM.md SPECIFICATION — ARGON-V1 ARCHITECTURE COMPLETE]`

---

