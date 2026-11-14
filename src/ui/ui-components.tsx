// ─────────────────────────────────────────────────────────────
// ui-components.tsx: Buttons, Artwork, Cards, Visualizers & Sheet
// ─────────────────────────────────────────────────────────────

import { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Bookmark, Heart, MicVocal, MoreHorizontal, Pause, Play, Shuffle, Volume2, VolumeX, X, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import type { BookmarkKind, Track } from '../core/core-types';
import { cn, formatTime, hash } from '../core/core-utils';
import { useStore } from '../core/core-store';
import { getActiveLyricIndex, playQueue, playTrack, playerStore, seek, timeStore, togglePlay, AudioEngine, setVocalIsolation } from '../state/state-player';
import { remember, toggleBookmark, toggleFavorite, useIsBookmarked, useIsFavorite } from '../state/state-catalog';
import { navigate, openSheet } from '../state/state-ui';
import { ARGON_SPRINGS } from '../lib/motion';
import { computeInnerRadius } from '../lib/utils';
import { SpecularSurface } from '../components/primitives/specular-surface';

// ── Artwork & Generative Mesh Gradient ───────────────────────
function hexToHue(hex: string): number | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return null;
  const r = parseInt(m[1].slice(0, 2), 16) / 255;
  const g = parseInt(m[1].slice(2, 4), 16) / 255;
  const b = parseInt(m[1].slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return null;
  const d = max - min;
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

export function meshGradient(seed: string, color?: string): string {
  const k = hash(seed);
  const x1 = 15 + (k % 50);
  const y1 = 10 + ((k >> 3) % 40);
  const x2 = 50 + ((k >> 5) % 45);
  const y2 = 55 + ((k >> 7) % 40);
  const baseHue = color ? hexToHue(color) : null;
  const hue1 = baseHue == null ? 0 : (baseHue + ((k >> 9) % 24) - 12 + 360) % 360;
  const hue2 = baseHue == null ? 0 : (baseHue + ((k >> 12) % 36) - 18 + 360) % 360;
  const sat = baseHue == null ? 0 : 62 + (k % 20);
  const lum1 = 65 + (k % 25);
  const lum2 = 35 + ((k >> 2) % 30);
  const lum3 = 18 + ((k >> 4) % 20);
  const lum4 = 8 + ((k >> 6) % 15);
  return [
    `radial-gradient(at ${x1}% ${y1}%, hsl(${hue1} ${sat}% ${lum1}% / 0.95) 0px, transparent 55%)`,
    `radial-gradient(at ${x2}% ${y2}%, hsl(${hue2} ${sat}% ${lum2}% / 0.9) 0px, transparent 60%)`,
    `radial-gradient(at ${100 - x1}% ${100 - y1 / 2}%, hsl(${hue1} ${sat}% ${lum3}% / 0.85) 0px, transparent 50%)`,
    `linear-gradient(${k % 180}deg, hsl(${hue2} ${sat}% ${lum4}%), hsl(${hue1} ${sat}% ${lum2}%))`,
  ].join(',');
}

export const Artwork = memo(function Artwork({
  seed,
  color,
  src,
  alt = '',
  shape = 'square',
  className,
  glyph: Glyph,
  title,
  subtitle,
  children,
}: {
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
}) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;
  return (
    <div
      className={cn(
        !/\b(absolute|fixed)\b/.test(className ?? '') && 'relative',
        'isolate shrink-0 overflow-hidden',
        shape === 'circle' ? 'rounded-full' : 'rounded-[var(--art-r,14px)]',
        title && '[container-type:inline-size]',
        className,
      )}
      style={{ backgroundImage: meshGradient(seed, color) }}
      data-tone-color={color}
    >
      {showImg && (
        <img src={src} alt={alt} loading="lazy" decoding="async" draggable={false} onError={() => setFailed(true)} className="absolute inset-0 size-full object-cover" />
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

// ── Icon Button ──────────────────────────────────────────────
const SIZES = { xs: 'size-7', sm: 'size-8', md: 'size-10', lg: 'size-12', xl: 'size-16' };
const ICON_SIZES = { xs: 14, sm: 16, md: 18, lg: 20, xl: 26 };
const VARIANTS = {
  ghost: 'text-fg-2 hover:text-fg hover:bg-surface-2',
  soft: 'bg-surface-2 text-fg hover:bg-surface-3',
  solid: 'bg-fg text-bg hover:opacity-90 shadow-[var(--shadow-1)]',
  accent: 'bg-accent text-on-accent hover:brightness-110 shadow-[0_10px_30px_-10px_var(--accent)]',
  glass: 'glass text-fg hover:bg-surface-2',
  /** Icon drawn straight on the background — no chip, no fill, not even on hover. */
  bare: 'text-fg-2 hover:text-fg',
};

export const IconButton = forwardRef<HTMLButtonElement, {
  icon: LucideIcon;
  label: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'ghost' | 'soft' | 'solid' | 'accent' | 'glass' | 'bare';
  active?: boolean;
  filled?: boolean;
  tip?: 'top' | 'right' | 'bottom' | false;
  badge?: boolean | number;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}>(function IconButton({ icon: Icon, label, size = 'md', variant = 'ghost', active, filled, tip = 'top', badge, className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-pressed={active}
      data-tip={tip ? label : undefined}
      data-tip-side={tip && tip !== 'top' ? tip : undefined}
      className={cn('press relative inline-flex shrink-0 items-center justify-center rounded-full outline-none disabled:pointer-events-none disabled:opacity-35', SIZES[size], VARIANTS[variant], active && (variant === 'ghost' || variant === 'bare') && '!text-accent-ink', className)}
      {...rest}
    >
      <Icon size={ICON_SIZES[size]} strokeWidth={1.75} className={cn(filled && 'fill-current')} />
      {badge ? (
        <span className="absolute right-1.5 top-1.5 flex min-w-2 items-center justify-center rounded-full bg-[#ff3c00] px-[3px] text-[9px] font-semibold leading-[14px] text-white ring-2 ring-bg">
          {typeof badge === 'number' ? (badge > 9 ? '9+' : badge) : null}
        </span>
      ) : null}
    </button>
  );
});

// ── Play Floating Action Button ──────────────────────────────
export function PlayFab({
  onClick,
  playing,
  className,
  size = 'md',
}: {
  onClick: () => void;
  playing?: boolean;
  className?: string;
  size?: 'md' | 'lg';
}) {
  return (
    <motion.button
      type="button"
      aria-label={playing ? 'Pause' : 'Play'}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      transition={ARGON_SPRINGS.bouncy}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'group/play relative flex items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_8px_20px_-6px_var(--accent)] hover:brightness-105 active:brightness-95 border border-white/20 dark:border-white/10 outline-none cursor-pointer',
        size === 'lg' ? 'size-14' : 'size-11',
        className,
      )}
    >
      <motion.span
        key={playing ? 'pause' : 'play'}
        initial={{ scale: 0.85, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={ARGON_SPRINGS.bouncy}
        className="flex items-center justify-center"
      >
        {playing ? (
          <Pause size={size === 'lg' ? 22 : 18} className="fill-current" />
        ) : (
          <Play size={size === 'lg' ? 22 : 18} className="ml-0.5 fill-current" />
        )}
      </motion.span>
    </motion.button>
  );
}

// ── Visualizer & Spectrum Bars ───────────────────────────────
export function Visualizer({ bars = 24, className, mirror, color = 'var(--accent)' }: { bars?: number; className?: string; mirror?: boolean; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = new Float32Array(bars);
    const smooth = new Float32Array(bars);
    let raf = 0;
    let visible = true;
    let fill = '';
    let frame = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      fill = getComputedStyle(canvas).color;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      if (++frame % 30 === 0) fill = getComputedStyle(canvas).color;
      AudioEngine.fillSpectrum(data);
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = fill;
      const gap = w / bars;
      const bw = Math.max(2, gap * 0.42);
      for (let i = 0; i < bars; i++) {
        smooth[i] += (data[i] - smooth[i]) * 0.25;
        const v = Math.max(0.04, smooth[i]);
        const bh = Math.max(bw, mirror ? v * h * 0.9 : v * h);
        const x = i * gap + (gap - bw) / 2;
        const y = mirror ? (h - bh) / 2 : h - bh;
        ctx.beginPath();
        ctx.roundRect(x, y, bw, bh, bw / 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [bars, mirror]);

  return <canvas ref={ref} className={className} style={{ color }} aria-hidden />;
}

// ── Smooth Audio Waveform Visualizer Canvas ──────────────────
export function WaveformVisualizer({
  className,
  height = 36,
  color = 'var(--accent)',
  points = 64,
  active = true,
}: {
  className?: string;
  height?: number;
  color?: string;
  points?: number;
  active?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = new Float32Array(points);
    const smooth = new Float32Array(points);
    let raf = 0;
    let visible = true;
    let strokeColor = '';
    let phase = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || canvas.clientWidth || 300;
      const h = height;
      canvas.width = Math.max(10, Math.floor(w * dpr));
      canvas.height = Math.max(10, Math.floor(h * dpr));
      strokeColor = getComputedStyle(canvas).color || '#ff3c00';
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible || !active) return;

      phase += 0.04;
      AudioEngine.fillWaveform(data);

      let isSilent = true;
      for (let i = 0; i < points; i++) {
        if (Math.abs(data[i]) > 0.015) {
          isSilent = false;
          break;
        }
      }

      const { width: w, height: h } = canvas;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      const midY = h / 2;
      const step = w / (points - 1);

      ctx.beginPath();
      for (let i = 0; i < points; i++) {
        let targetVal = data[i];
        if (isSilent) {
          targetVal = Math.sin(i * 0.18 + phase) * 0.08 + Math.cos(i * 0.09 - phase * 0.5) * 0.04;
        }
        smooth[i] += (targetVal - smooth[i]) * 0.3;
        const amp = smooth[i] * (h * 0.44);
        const x = i * step;
        const y = midY - amp;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = (i - 1) * step;
          const prevAmp = smooth[i - 1] * (h * 0.44);
          const prevY = midY - prevAmp;
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
        }
      }

      const lastX = (points - 1) * step;
      ctx.lineTo(lastX, midY);
      ctx.lineTo(0, midY);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, strokeColor);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.22;
      ctx.fill();

      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5 * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.globalAlpha = 1.0;
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [points, height, active]);

  return (
    <div
      className={cn('relative w-full overflow-hidden shrink-0 select-none pointer-events-none', className)}
      style={{ height: `${height}px`, minHeight: `${height}px` }}
    >
      <canvas
        ref={canvasRef}
        className="size-full block"
        style={{ color }}
        aria-hidden
      />
    </div>
  );
}

export function EqBars({ playing, className }: { playing: boolean; className?: string }) {
  return (
    <span className={`eq-bars inline-flex h-3.5 items-end gap-[2px] ${playing ? '' : 'paused'} ${className ?? ''}`} aria-hidden>
      <span className="h-full" />
      <span className="h-full" />
      <span className="h-full" />
    </span>
  );
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg">
      <span className="anim-live size-1.5 rounded-full bg-live" /> Live
    </span>
  );
}

// ── Media Card & Track List ──────────────────────────────────
export const MediaCard = memo(function MediaCard({
  entity,
  onPlay,
  className,
  badge,
}: {
  entity: { kind: BookmarkKind; id: string; title: string; subtitle: string; color: string; src?: string; glyph?: LucideIcon; circle?: boolean; route?: { name: string; id?: string } };
  onPlay?: () => void;
  className?: string;
  badge?: ReactNode;
}) {
  return (
    <SpecularSurface
      role="link"
      tabIndex={0}
      onClick={() => entity.route && navigate(entity.route as unknown as Parameters<typeof navigate>[0])}
      onKeyDown={(e) => e.key === 'Enter' && entity.route && navigate(entity.route as unknown as Parameters<typeof navigate>[0])}
      className={cn(
        'group/card press cursor-pointer outline-none rounded-2xl p-2 bg-surface/50 hover:bg-surface-2/70 border border-hairline shadow-ambient-xs hover:border-hairline-strong transition-all duration-200',
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-hairline-subtle">
        <Artwork
          seed={entity.id}
          color={entity.color}
          src={entity.src}
          glyph={entity.glyph}
          shape={entity.circle ? 'circle' : 'square'}
          className={cn(
            'size-full transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover/card:scale-[1.03]',
            entity.circle ? 'rounded-full' : 'rounded-xl'
          )}
        >
          {onPlay && <PlayFab onClick={onPlay} className="absolute bottom-2.5 right-2.5 opacity-0 transition-opacity group-hover/card:opacity-100 max-md:opacity-100" />}
          {badge && <div className="absolute left-2.5 top-2.5">{badge}</div>}
        </Artwork>
      </div>
      <div className="mt-2.5 min-w-0 px-0.5 pb-0.5">
        <div className="truncate text-[14px] font-semibold tracking-[-0.015em] text-fg">{entity.title}</div>
        <div className="truncate text-[12.5px] text-fg-3">{entity.subtitle}</div>
      </div>
    </SpecularSurface>
  );
});

export function TrackRow({ track, queue, numbered, index }: { track: Track; queue: Track[]; numbered?: boolean; index?: number }) {
  const current = playerStore.get().track;
  const isPlaying = playerStore.get().isPlaying;
  const active = current?.id === track.id;
  const fav = useIsFavorite(track.id);

  return (
    <div
      role="row"
      tabIndex={0}
      onClick={() => (active ? togglePlay() : playTrack(track, queue))}
      className={cn(
        'group/row press flex h-14 cursor-pointer items-center gap-3.5 rounded-[var(--radius-md)] px-3 text-[14px] hover:bg-surface-2',
        active && 'bg-surface-2 text-fg',
      )}
    >
      {numbered && (
        <span className="w-6 text-center text-xs font-mono tabular-nums text-fg-3">
          {active && isPlaying ? <EqBars playing /> : index !== undefined ? String(index + 1).padStart(2, '0') : ''}
        </span>
      )}
      <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} className="size-10 [--art-r:8px]" />
      <div className="min-w-0 flex-1">
        <div className={cn('truncate font-medium', active && 'text-accent-ink')}>{track.title}</div>
        <div className="truncate text-[12.5px] text-fg-3">{track.artist}</div>
      </div>
      <IconButton
        icon={Heart}
        label={fav ? 'Liked' : 'Like'}
        size="xs"
        tip={false}
        active={fav}
        filled={fav}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(track.id, track);
        }}
        className={cn(!fav && 'opacity-0 group-hover/row:opacity-100')}
      />
      <span className="text-[12px] font-mono tabular-nums text-fg-3">{formatTime(track.durationSeconds)}</span>
      <IconButton
        icon={MoreHorizontal}
        label="More"
        size="xs"
        tip={false}
        onClick={(e) => {
          e.stopPropagation();
          remember(track);
          openSheet('addto', track.id);
        }}
      />
    </div>
  );
}

export function TrackList({ tracks, numbered = true }: { tracks: Track[]; numbered?: boolean }) {
  return (
    <div className="flex flex-col">
      {tracks.map((t, i) => (
        <TrackRow key={t.id} track={t} queue={tracks} numbered={numbered} index={i} />
      ))}
    </div>
  );
}

// ── Collection Header ────────────────────────────────────────
export function CollectionHeader({
  kind,
  id,
  eyebrow,
  title,
  meta,
  color,
  src,
  glyph,
  tracks,
  actions,
  tall,
  artTitle,
}: {
  kind?: BookmarkKind;
  id: string;
  eyebrow: string;
  title: string;
  meta?: ReactNode;
  color: string;
  src?: string;
  glyph?: LucideIcon;
  tracks?: Track[];
  actions?: ReactNode;
  /** Use a 3:4 portrait cover instead of a square — book jackets, etc. */
  tall?: boolean;
  /** Fallback text baked into the generated artwork when there is no image. */
  artTitle?: { title: string; subtitle: string };
}) {
  const saved = useIsBookmarked(kind ?? 'album', id);
  return (
    <header className="anim-rise relative mb-8 flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
      <Artwork
        seed={id}
        color={color}
        src={src}
        glyph={glyph}
        title={artTitle?.title}
        subtitle={artTitle?.subtitle}
        className={cn('mx-auto w-[min(62vw,240px)] shadow-[0_30px_70px_-28px_rgb(0_0_0/0.55)] [--art-r:24px] md:mx-0 md:w-[232px]', tall ? 'aspect-[3/4]' : 'aspect-square')}
      />
      <div className="min-w-0 flex-1 text-center md:text-left">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{eyebrow}</div>
        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.04em] md:text-[56px]">{title}</h1>
        {meta && <div className="mt-3 text-[14px] text-fg-2">{meta}</div>}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
          {tracks && tracks.length > 0 && <PlayFab size="lg" onClick={() => playQueue(tracks)} />}
          {tracks && tracks.length > 1 && (
            <IconButton
              icon={Shuffle}
              label="Shuffle"
              size="lg"
              variant="soft"
              onClick={() => {
                playerStore.set({ shuffle: true });
                playQueue(tracks);
              }}
            />
          )}
          <IconButton icon={Bookmark} label={saved ? 'Saved' : 'Save'} size="lg" variant="soft" active={saved} filled={saved} onClick={() => toggleBookmark(kind ?? 'album', id)} />
          {actions}
        </div>
      </div>
    </header>
  );
}

// ── Sheet Component ──────────────────────────────────────────
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="anim-fade absolute inset-0 bg-black/40 backdrop-blur-[6px]" onClick={onClose} />
      <div className="glass-strong anim-sheet relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[var(--radius-2xl)] p-5 pb-[max(20px,env(safe-area-inset-bottom))] sm:anim-pop sm:max-w-md sm:rounded-[var(--radius-2xl)] sm:p-6">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-surface-3 sm:hidden" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0 text-[17px] font-semibold tracking-[-0.02em]">{title}</div>
          <IconButton icon={X} label="Close" size="sm" variant="soft" tip={false} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Slider & Controls ────────────────────────────────────────
export function Slider({
  value,
  max = 1,
  step = 0.01,
  buffered,
  onChange,
  label,
  className,
  ...rest
}: {
  value: number;
  max?: number;
  step?: number;
  buffered?: number;
  onChange: (v: number) => void;
  label: string;
  className?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'max' | 'step' | 'onChange' | 'type' | 'min'
>) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  const bufferedPct = buffered !== undefined ? Math.max(0, Math.min(100, (buffered / (max || 1)) * 100)) : 0;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn('group/slider relative flex h-5 w-full items-center cursor-pointer select-none', className)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        className="absolute inset-0 z-20 size-full cursor-pointer opacity-0"
        {...rest}
      />
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-3 transition-all duration-200 group-hover/slider:h-2">
        {/* Buffered range shimmer */}
        {bufferedPct > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-surface-3/80 dark:bg-white/15 skeleton-shimmer transition-[width] duration-300"
            style={{ width: `${bufferedPct}%` }}
          />
        )}
        {/* Playback progress track */}
        <div
          className="relative h-full rounded-full bg-[var(--track-fill,var(--accent))] transition-[width] duration-75"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Tactile Scrubber Thumb with bouncy micro-spring */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 size-3.5 rounded-full bg-fg shadow-ambient-sm border border-hairline-strong transition-opacity duration-150"
        style={{
          left: `calc(${pct}% - 7px)`,
          opacity: hovered ? 1 : 0,
        }}
        animate={{ scale: hovered ? 1 : 0.6 }}
        transition={ARGON_SPRINGS.bouncy}
      />
    </div>
  );
}

// ── Tactile Rotary Volume Dial ────────────────────────────────
export function VolumeDial({
  value,
  onChange,
  className,
  size = 34,
  label = 'Volume',
  onMuteToggle,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  size?: number;
  label?: string;
  onMuteToggle?: () => void;
}) {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startVal = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startVal.current = value;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const deltaY = startY.current - e.clientY;
    const nextVal = Math.max(0, Math.min(1, startVal.current + deltaY / 120));
    onChange(nextVal);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - arcLength * Math.max(0, Math.min(1, value));
  const pct = Math.round(value * 100);

  return (
    <div
      role="slider"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={onMuteToggle}
      className={cn(
        'group/dial relative flex items-center justify-center cursor-ns-resize touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className
      )}
      style={{ width: `${size}px`, height: `${size}px` }}
      title={`${label}: ${pct}% (Drag up/down, double click to mute)`}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="size-full -rotate-[135deg] overflow-visible"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          className="text-surface-3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-75"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {value === 0 ? (
          <VolumeX size={size * 0.4} className="text-fg-3" />
        ) : (
          <Volume2 size={size * 0.4} className="text-fg-2 group-hover/dial:text-accent transition-colors" />
        )}
      </div>
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-300', checked ? 'bg-accent' : 'bg-surface-3')}
    >
      <span
        className="absolute left-[3px] top-[3px] size-5 rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.25)] transition-transform duration-500 [transition-timing-function:var(--ease-spring)]"
        style={{ transform: `translateX(${checked ? 18 : 0}px)` }}
      />
    </button>
  );
}

export function Chip({ active, onClick, icon: Icon, children }: { active?: boolean; onClick?: () => void; icon?: LucideIcon; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'press flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors',
        active ? 'bg-fg text-bg' : 'bg-surface-2 text-fg-2 hover:bg-surface-3 hover:text-fg',
      )}
    >
      {Icon && <Icon size={14} strokeWidth={2} />}
      {children}
    </button>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string; icon?: LucideIcon }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-full bg-surface-2 p-1">
      {options.map((o) => {
        const on = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn('press flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium transition', on ? 'bg-bg text-fg shadow-sm' : 'text-fg-3 hover:text-fg')}
          >
            {Icon && <Icon size={14} />}
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function LogoMark({ className, animated, bare }: { className?: string; animated?: boolean; bare?: boolean }) {
  // Bare: the mark sits straight on the background, no tile. The dot is the
  // only place brand orange appears (Bible § Logo & Mark).
  if (bare) {
    return (
      <svg viewBox="6 6 20 20" className={cn('size-7', className)} aria-hidden>
        <path d="M9 10.5 15.2 22a.9.9 0 0 0 1.6 0L23 10.5" fill="none" stroke="var(--fg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="11" r="2.3" fill="#ff3c00" className={animated ? 'anim-live origin-center [transform-box:fill-box]' : undefined} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <rect width="32" height="32" rx="10" fill="var(--fg)" />
      <path d="M9 10.5 15.2 22a.9.9 0 0 0 1.6 0L23 10.5" fill="none" stroke="var(--bg)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="11" r="2.3" fill="#ff3c00" className={animated ? 'anim-live origin-center [transform-box:fill-box]' : undefined} />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn('text-[19px] font-bold lowercase tracking-[-0.04em]', className)}>vyv</span>;
}

// ── Layout Wrappers ──────────────────────────────────────────
export function PageHeader({ title, eyebrow, subtitle, actions }: { title: ReactNode; eyebrow?: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="anim-rise mb-6 flex items-end justify-between gap-4 md:mb-8">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{eyebrow}</div>}
        <h1 className="truncate text-[32px] font-semibold leading-none tracking-[-0.035em] md:text-[44px]">{title}</h1>
        {subtitle && <p className="mt-2.5 max-w-xl text-sm text-fg-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </header>
  );
}

export function Section({ title, icon: Icon, action, children }: { title?: ReactNode; icon?: LucideIcon; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-9 md:mb-11">
      {title && (
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em] md:text-lg">
            {Icon && <Icon size={17} strokeWidth={1.75} className="text-fg-3" />}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Grid({ children, min = 160 }: { children: ReactNode; min?: number }) {
  return <div className="stagger grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))` }}>{children}</div>;
}

export function Shelf({ children }: { children: ReactNode }) {
  return <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 md:-mx-8 md:px-8">{children}</div>;
}

export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-fg-3">
      <Icon size={40} strokeWidth={1.4} className="mb-3 opacity-60" />
      <div className="text-[17px] font-semibold text-fg">{title}</div>
      {hint && <p className="mt-1 max-w-sm text-[13.5px]">{hint}</p>}
    </div>
  );
}

export const SHELF_ITEM = 'w-[150px] shrink-0 snap-start md:w-[172px]';

/** Bipolar vertical fader for EQ bands — fills from the center line. */
export function Fader({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (v: number) => void; label: string }) {
  const toPct = (v: number) => ((v - min) / (max - min)) * 100;
  const zero = toPct(0);
  const pct = toPct(value);

  const fromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const ratio = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    onChange(Math.round(min + ratio * (max - min)));
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-orientation="vertical"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e);
      }}
      onPointerMove={(e) => e.buttons && fromPointer(e)}
      onDoubleClick={() => onChange(0)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') onChange(Math.min(max, value + 1));
        if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') onChange(Math.max(min, value - 1));
      }}
      className="group relative flex h-full w-10 cursor-grab touch-none justify-center outline-none active:cursor-grabbing"
    >
      <div className="relative h-full w-1.5 rounded-full bg-surface-3">
        <div className="absolute inset-x-0 h-px bg-fg-3" style={{ bottom: `${zero}%` }} />
        <div
          className="absolute inset-x-0 rounded-full bg-accent transition-[bottom,height] duration-150"
          style={{ bottom: `${Math.min(zero, pct)}%`, height: `${Math.abs(pct - zero)}%` }}
        />
      </div>
      <span
        className="absolute left-1/2 size-5 -translate-x-1/2 translate-y-1/2 rounded-full bg-fg shadow-[0_2px_10px_rgb(0_0_0/0.3)] ring-4 ring-transparent transition-[bottom,box-shadow] duration-150 group-focus-visible:ring-accent-soft"
        style={{ bottom: `${pct}%` }}
      />
    </div>
  );
}

/** Karaoke-style synced lyrics, shared by Cover mode and the desktop side panel. */
export function LyricsView({
  className,
  large,
  showVocalToggles = true,
}: {
  className?: string;
  large?: boolean;
  showVocalToggles?: boolean;
}) {
  const lyrics = useStore(playerStore, (s) => s.lyrics);
  const track = useStore(playerStore, (s) => s.track);
  const vocalMode = useStore(playerStore, (s) => s.vocalIsolation || 'off');
  const time = useStore(timeStore, (s) => s.time);
  const active = useMemo(() => getActiveLyricIndex(lyrics, time), [lyrics, time]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [active]);

  if (!lyrics.length) {
    return (
      <div className={cn('relative flex flex-col items-center justify-center gap-3 text-fg-3 p-8 text-center', className)}>
        {track && (
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-20 blur-3xl saturate-150 transition-opacity duration-700"
            style={{
              backgroundImage: meshGradient(track.id, track.dominantColorHex),
              transform: 'translateZ(0)',
            }}
          />
        )}
        <MicVocal size={28} strokeWidth={1.5} />
        <span className="text-sm font-medium">No lyrics available</span>
      </div>
    );
  }

  const cycleVocalIsolation = () => {
    const next: 'off' | 'karaoke' | 'vocals' = vocalMode === 'off' ? 'karaoke' : vocalMode === 'karaoke' ? 'vocals' : 'off';
    setVocalIsolation(next);
  };

  return (
    <div className={cn('relative flex flex-col h-full overflow-hidden', className)}>
      {/* Dynamic Generative Mesh Background Aura without frame drops */}
      {track && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-25 blur-3xl saturate-150 transition-opacity duration-1000 will-change-[opacity,transform]"
          style={{
            backgroundImage: meshGradient(track.id, track.dominantColorHex),
            transform: 'translateZ(0)',
          }}
        />
      )}

      {/* Vocal Isolation Header Pill */}
      {showVocalToggles && (
        <div className="shrink-0 flex items-center justify-between pb-3 px-2 z-20">
          <button
            type="button"
            onClick={cycleVocalIsolation}
            className={cn(
              'press inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono tabular-nums font-semibold tracking-wider transition-all cursor-pointer outline-none',
              vocalMode === 'karaoke'
                ? 'bg-accent text-on-accent shadow-[0_0_12px_var(--accent)]'
                : vocalMode === 'vocals'
                ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-surface-2 text-fg-3 hover:text-fg border border-hairline'
            )}
            title="Toggle vocal isolation (Normal / Karaoke Instrumental / Vocals Focus)"
          >
            <MicVocal size={12} />
            <span>
              {vocalMode === 'karaoke' ? 'Karaoke · Backing' : vocalMode === 'vocals' ? 'Vocal Focus' : 'Vocals: Standard'}
            </span>
          </button>
        </div>
      )}

      {/* Synchronized Lyrics Scroll Container */}
      <div
        ref={ref}
        className="scrollbar-none flex-1 overflow-y-auto py-[35%] px-2"
        style={{ maskImage: 'linear-gradient(transparent,#000 15%,#000 85%,transparent)' }}
      >
        {lyrics.map((l, i) => {
          const isActive = i === active;
          const d = Math.abs(i - active);

          return (
            <motion.button
              key={i}
              data-i={i}
              type="button"
              onClick={() => seek(l.time)}
              animate={{
                scale: isActive ? (large ? 1.05 : 1.03) : 0.96,
                opacity: isActive ? 1 : Math.max(0.2, 0.5 - d * 0.1),
              }}
              transition={ARGON_SPRINGS.snappy}
              className={cn(
                'block w-full origin-left text-left font-semibold tracking-[-0.025em] cursor-pointer outline-none select-none transition-colors duration-200',
                large ? 'py-3 text-[28px] leading-[1.2] md:text-[38px]' : 'py-2.5 text-[20px] leading-snug',
                isActive
                  ? 'text-fg [text-shadow:0_0_24px_var(--accent)] font-bold'
                  : 'text-fg-3 hover:text-fg/80',
              )}
              style={{
                filter: isActive ? 'none' : `blur(${Math.min(d, 2.5) * 0.6}px)`,
                transformOrigin: 'left center',
                willChange: 'transform, opacity, filter',
              }}
            >
              {l.text}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Platinum UI Components: Spotlight Card, Button & Badge
// ─────────────────────────────────────────────────────────────

export interface VyvSpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const VyvSpotlightCard: React.FC<VyvSpotlightCardProps> = ({
  interactive = true,
  children,
  className = '',
  onMouseMove,
  ...rest
}) => {
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (interactive) {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }
      onMouseMove?.(e);
    },
    [interactive, onMouseMove]
  );

  return (
    <div
      className={cn('vyv-spotlight-card', className)}
      onMouseMove={handleMouseMove}
      {...rest}
    >
      {children}
    </div>
  );
};

export interface VyvButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
}

export const VyvButton: React.FC<VyvButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  style,
  disabled,
  ...rest
}) => {
  const sizeStyles: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
    sm: {
      height: 'calc(32px * var(--vyv-density-scale, 1))',
      padding: '0 var(--vyv-space-3, 12px)',
      fontSize: 'var(--vyv-text-xs, 12px)',
      borderRadius: 'var(--vyv-radius-sm, 10px)',
    },
    md: {
      height: 'calc(40px * var(--vyv-density-scale, 1))',
      padding: '0 var(--vyv-space-4, 16px)',
      fontSize: 'var(--vyv-text-sm, 14px)',
      borderRadius: 'var(--vyv-radius-md, 14px)',
    },
    lg: {
      height: 'calc(48px * var(--vyv-density-scale, 1))',
      padding: '0 var(--vyv-space-6, 24px)',
      fontSize: 'var(--vyv-text-base, 16px)',
      borderRadius: 'var(--vyv-radius-lg, 18px)',
    },
  };

  const variantStyles: Record<'primary' | 'glass' | 'ghost' | 'danger', React.CSSProperties> = {
    primary: {
      background: 'var(--vyv-accent-primary, var(--accent))',
      color: 'var(--vyv-text-on-brand, var(--on-accent))',
      border: '1px solid var(--vyv-border-specular-top, var(--line-2))',
      boxShadow: 'var(--vyv-shadow-glow-brand, var(--shadow-1))',
    },
    glass: {
      background: 'var(--vyv-surface-glass-2, var(--surface-2))',
      color: 'var(--vyv-text-primary, var(--fg))',
      border: '1px solid var(--vyv-border-subtle, var(--line))',
      backdropFilter: 'blur(var(--vyv-blur-sm, 12px))',
      boxShadow: 'var(--vyv-shadow-sm, var(--shadow-1))',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--vyv-text-secondary, var(--fg-2))',
      border: '1px solid transparent',
    },
    danger: {
      background: 'color-mix(in oklch, var(--vyv-status-danger, #ef4444) 18%, transparent)',
      color: 'var(--vyv-status-danger, #ef4444)',
      border: '1px solid color-mix(in oklch, var(--vyv-status-danger, #ef4444) 40%, transparent)',
    },
  };

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--vyv-space-2, 8px)',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all var(--vyv-duration-fast, 160ms) var(--vyv-ease-out-quart, ease-out)',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...rest}
    >
      {loading ? <span aria-hidden="true">•••</span> : icon}
      {children && <span>{children}</span>}
    </button>
  );
};

export const VyvBadge: React.FC<{
  tone?: 'brand' | 'live' | 'agent' | 'neutral';
  children: ReactNode;
}> = ({ tone = 'neutral', children }) => {
  const toneMap = {
    brand: {
      bg: 'var(--vyv-accent-primary-soft, var(--accent-soft))',
      fg: 'var(--vyv-accent-primary-hover, var(--accent))',
    },
    live: {
      bg: 'color-mix(in oklch, var(--vyv-accent-live, #ef4444) 20%, transparent)',
      fg: 'var(--vyv-accent-live, #ef4444)',
    },
    agent: {
      bg: 'color-mix(in oklch, var(--vyv-accent-agent, #06b6d4) 18%, transparent)',
      fg: 'var(--vyv-accent-agent, #06b6d4)',
    },
    neutral: {
      bg: 'var(--vyv-bg-interactive-hover, var(--surface-2))',
      fg: 'var(--vyv-text-secondary, var(--fg-2))',
    },
  }[tone];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--vyv-space-1, 4px)',
        padding: '2px var(--vyv-space-2-5, 10px)',
        fontSize: 'var(--vyv-text-2xs, 11px)',
        fontWeight: 600,
        borderRadius: 'var(--vyv-radius-pill, 9999px)',
        background: toneMap.bg,
        color: toneMap.fg,
        border: '1px solid var(--vyv-border-hairline, var(--line))',
      }}
    >
      {tone === 'live' && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--vyv-accent-live, #ef4444)',
            boxShadow: '0 0 8px var(--vyv-accent-live, #ef4444)',
          }}
        />
      )}
      {children}
    </span>
  );
};

