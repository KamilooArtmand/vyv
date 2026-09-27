// ─────────────────────────────────────────────────────────────
// ui-backdrop.ts: Backdrop-aware contrast for floating glass
//
// The player dock floats over whatever scrolls beneath it: black
// artwork, white pages, neon covers. This hook looks through the dock
// (elementsFromPoint on a grid of points), estimates the luminance and
// busyness of what it finds, and reports a tone. The dock then picks
// its own ink and veil strength — independent of the app theme — so
// its shape, controls and text stay legible on any background.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, type RefObject } from 'react';

export interface BackdropTone {
  /** Tone of what is behind the element: 'light' → dark ink, 'dark' → light ink. */
  tone: 'light' | 'dark';
  /** 0 (flat) … 1 (very busy / high-contrast): drives how opaque the veil gets. */
  busy: number;
}

type RGB = [number, number, number];

const channel = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
/** WCAG relative luminance. */
export const luminance = ([r, g, b]: RGB) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

function parseColor(css: string): [number, number, number, number] | null {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return [parts[0], parts[1], parts[2], parts[3] ?? 1];
}

function parseHex(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
}

let canvas: HTMLCanvasElement | null = null;
/** Read the pixel of an <img> under the point. Returns null for cross-origin (tainted) images. */
function imagePixel(img: HTMLImageElement, x: number, y: number): RGB | null {
  if (!img.complete || !img.naturalWidth) return null;
  try {
    canvas ??= document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    const r = img.getBoundingClientRect();
    const sx = ((x - r.left) / r.width) * img.naturalWidth;
    const sy = ((y - r.top) / r.height) * img.naturalHeight;
    ctx.drawImage(img, sx, sy, 1, 1, 0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  } catch {
    return null;
  }
}

/** Best estimate of the colour painted at (x, y) by `el` and its ancestors. */
function colorAt(el: Element | null, x: number, y: number): RGB {
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    if (node instanceof HTMLImageElement) {
      const px = imagePixel(node, x, y);
      if (px) return px;
    }
    // Artwork and cards publish their dominant colour for exactly this purpose.
    const hint = (node as HTMLElement).dataset?.toneColor;
    if (hint) {
      const rgb = parseHex(hint);
      if (rgb) return rgb;
    }
    const style = getComputedStyle(node);
    const bg = parseColor(style.backgroundColor);
    if (bg && bg[3] > 0.55) return [bg[0], bg[1], bg[2]];
    // CSS gradients: average their colour stops (computed values are rgb()).
    if (style.backgroundImage.includes('gradient')) {
      const stops = [...style.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map((m) => parseColor(m[0])).filter((c) => c && c[3] > 0.3) as number[][];
      if (stops.length) {
        const avg = [0, 1, 2].map((i) => stops.reduce((a, c) => a + c[i], 0) / stops.length);
        return [avg[0], avg[1], avg[2]];
      }
    }
    node = node.parentElement;
  }
  const base = parseColor(getComputedStyle(document.body).backgroundColor);
  return base ? [base[0], base[1], base[2]] : [9, 10, 12];
}

function sample(host: HTMLElement): { lum: number; spread: number } | null {
  const r = host.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  const lums: number[] = [];
  const cols = 11;
  for (const fy of [0.22, 0.5, 0.78]) {
    for (let i = 0; i < cols; i++) {
      const x = r.left + ((i + 0.5) / cols) * r.width;
      const y = r.top + fy * r.height;
      // First element under the point that is not part of the dock itself.
      const under = document.elementsFromPoint(x, y).find((e) => !host.contains(e) && !e.contains(host));
      lums.push(luminance(colorAt(under ?? null, x, y)));
    }
  }
  const mean = lums.reduce((a, b) => a + b, 0) / lums.length;
  const spread = Math.sqrt(lums.reduce((a, b) => a + (b - mean) ** 2, 0) / lums.length);
  return { lum: mean, spread };
}

export function useBackdropTone(ref: RefObject<HTMLElement | null>, enabled = true): BackdropTone {
  const [state, setState] = useState<BackdropTone>(() => ({
    tone: typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
    busy: 0,
  }));

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = state;
    const run = () => {
      raf = 0;
      const host = ref.current;
      if (!host) return;
      const s = sample(host);
      if (!s) return;
      // White and black ink have equal contrast at L ≈ 0.18; flip only clearly
      // past that point (hysteresis) so the dock never flickers mid-scroll.
      const tone = last.tone === 'dark' ? (s.lum > 0.24 ? 'light' : 'dark') : s.lum < 0.13 ? 'dark' : 'light';
      const busy = Math.min(1, Math.round(s.spread * 4 * 20) / 20);
      if (tone !== last.tone || Math.abs(busy - last.busy) >= 0.1) {
        last = { tone, busy };
        setState(last);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };

    schedule();
    document.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('load', schedule, true); // images finishing under the dock
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] });
    const tick = window.setInterval(schedule, 1500); // route changes, lazy content
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
      document.removeEventListener('load', schedule, true);
      mo.disconnect();
      window.clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ref]);

  return state;
}
