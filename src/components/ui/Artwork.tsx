import { memo, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn, hash } from '../../lib/format';

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
}

/** Deterministic mesh gradient: every entity gets a unique, on-brand cover. */
export function meshGradient(seed: string, color: string): string {
  const [h, s] = hexToHsl(color);
  const k = hash(seed);
  const a = (k % 60) - 30;
  const x1 = 15 + (k % 50);
  const y1 = 10 + ((k >> 3) % 40);
  const x2 = 50 + ((k >> 5) % 45);
  const y2 = 55 + ((k >> 7) % 40);
  const sat = Math.min(90, s + 5);
  return [
    `radial-gradient(at ${x1}% ${y1}%, hsl(${h + a} ${sat}% 68% / 0.95) 0px, transparent 55%)`,
    `radial-gradient(at ${x2}% ${y2}%, hsl(${h - a - 25} ${sat}% 45% / 0.9) 0px, transparent 60%)`,
    `radial-gradient(at ${100 - x1}% ${100 - y1 / 2}%, hsl(${h + 40} ${sat - 10}% 30% / 0.85) 0px, transparent 50%)`,
    `linear-gradient(${k % 360}deg, hsl(${h} ${sat}% 22%), hsl(${h + 30} ${sat}% 38%))`,
  ].join(',');
}

interface ArtworkProps {
  seed: string;
  color: string;
  src?: string;
  alt?: string;
  shape?: 'square' | 'circle';
  className?: string;
  glyph?: LucideIcon;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

export const Artwork = memo(function Artwork({ seed, color, src, alt = '', shape = 'square', className, glyph: Glyph, title, subtitle, children }: ArtworkProps) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;
  return (
    <div
      className={cn(
        // Callers may position the artwork themselves (e.g. blurred backdrops).
        !/\b(absolute|fixed)\b/.test(className ?? '') && 'relative',
        'isolate shrink-0 overflow-hidden',
        shape === 'circle' ? 'rounded-full' : 'rounded-[var(--art-r,14px)]',
        title && '[container-type:inline-size]',
        className,
      )}
      style={{ backgroundImage: meshGradient(seed, color) }}
    >
      {showImg && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
      {!showImg && Glyph && (
        <Glyph className="absolute left-1/2 top-1/2 size-[34%] -translate-x-1/2 -translate-y-1/2 text-white/85" strokeWidth={1.25} />
      )}
      {!showImg && title && (
        <div className="absolute inset-0 flex flex-col justify-end p-[9%] text-white">
          <span className="line-clamp-3 text-[clamp(11px,11cqi,22px)] font-semibold leading-[1.05] tracking-tight">{title}</span>
          {subtitle && <span className="mt-1 truncate text-[clamp(9px,6.5cqi,13px)] opacity-75">{subtitle}</span>}
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/5 dark:ring-white/10" />
      {children}
    </div>
  );
});
