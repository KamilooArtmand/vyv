// ─────────────────────────────────────────────────────────────
// ui-components.tsx: Buttons, Artwork, Cards, Visualizers & Sheet
// ─────────────────────────────────────────────────────────────

import { forwardRef, memo, useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { Bookmark, Heart, MoreHorizontal, Pause, Play, Shuffle, X, type LucideIcon } from 'lucide-react';
import type { BookmarkKind, Track } from '../core/core-types';
import { cn, formatDuration, formatTime, hash } from '../core/core-utils';
import { playQueue, playTrack, playerStore, togglePlay, AudioEngine } from '../state/state-player';
import { toggleBookmark, toggleFavorite, useIsBookmarked, useIsFavorite } from '../state/state-catalog';
import { navigate, openSheet, toast } from '../state/state-ui';

// ── Artwork & Generative Mesh Gradient ───────────────────────
export function meshGradient(seed: string, color?: string): string {
  const k = hash(seed);
  const x1 = 15 + (k % 50);
  const y1 = 10 + ((k >> 3) % 40);
  const x2 = 50 + ((k >> 5) % 45);
  const y2 = 55 + ((k >> 7) % 40);
  const lum1 = 65 + (k % 25);
  const lum2 = 35 + ((k >> 2) % 30);
  const lum3 = 18 + ((k >> 4) % 20);
  const lum4 = 8 + ((k >> 6) % 15);
  return [
    `radial-gradient(at ${x1}% ${y1}%, hsl(0 0% ${lum1}% / 0.95) 0px, transparent 55%)`,
    `radial-gradient(at ${x2}% ${y2}%, hsl(0 0% ${lum2}% / 0.9) 0px, transparent 60%)`,
    `radial-gradient(at ${100 - x1}% ${100 - y1 / 2}%, hsl(0 0% ${lum3}% / 0.85) 0px, transparent 50%)`,
    `linear-gradient(${(k % 180)}deg, hsl(0 0% ${lum4}%), hsl(0 0% ${lum2}%))`,
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
};

export const IconButton = forwardRef<HTMLButtonElement, {
  icon: LucideIcon;
  label: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'ghost' | 'soft' | 'solid' | 'accent' | 'glass';
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
      className={cn('press relative inline-flex shrink-0 items-center justify-center rounded-full outline-none disabled:pointer-events-none disabled:opacity-35', SIZES[size], VARIANTS[variant], active && variant === 'ghost' && '!text-accent-ink', className)}
      {...rest}
    >
      <Icon size={ICON_SIZES[size]} strokeWidth={1.75} className={cn(filled && 'fill-current')} />
      {badge ? (
        <span className="absolute right-1.5 top-1.5 flex min-w-2 items-center justify-center rounded-full bg-live px-[3px] text-[9px] font-semibold leading-[14px] text-white ring-2 ring-bg">
          {typeof badge === 'number' ? (badge > 9 ? '9+' : badge) : null}
        </span>
      ) : null}
    </button>
  );
});

// ── Play Floating Action Button ──────────────────────────────
export function PlayFab({ onClick, playing, className, size = 'md' }: { onClick: () => void; playing?: boolean; className?: string; size?: 'md' | 'lg' }) {
  return (
    <button
      type="button"
      aria-label={playing ? 'Pause' : 'Play'}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'press flex items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_12px_28px_-8px_var(--accent)] hover:brightness-110',
        size === 'lg' ? 'size-14' : 'size-11',
        className,
      )}
    >
      {playing ? <Pause size={size === 'lg' ? 22 : 18} className="fill-current" /> : <Play size={size === 'lg' ? 22 : 18} className="ml-0.5 fill-current" />}
    </button>
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
    <div
      role="link"
      tabIndex={0}
      onClick={() => entity.route && navigate(entity.route as unknown as Parameters<typeof navigate>[0])}
      onKeyDown={(e) => e.key === 'Enter' && entity.route && navigate(entity.route as unknown as Parameters<typeof navigate>[0])}
      className={cn('group/card press cursor-pointer outline-none [&:active]:scale-[0.98]', className)}
    >
      <Artwork
        seed={entity.id}
        color={entity.color}
        src={entity.src}
        glyph={entity.glyph}
        shape={entity.circle ? 'circle' : 'square'}
        className="aspect-square w-full shadow-[var(--shadow-1)] transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover/card:scale-[1.02]"
      >
        {onPlay && <PlayFab onClick={onPlay} className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover/card:opacity-100 max-md:opacity-100" />}
        {badge && <div className="absolute left-3 top-3">{badge}</div>}
      </Artwork>
      <div className="mt-3 min-w-0">
        <div className="truncate text-[14.5px] font-semibold tracking-[-0.015em] text-fg">{entity.title}</div>
        <div className="truncate text-[13px] text-fg-3">{entity.subtitle}</div>
      </div>
    </div>
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
        <span className="w-5 text-center text-xs tabular text-fg-3">
          {active && isPlaying ? <EqBars playing /> : index !== undefined ? index + 1 : ''}
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
          toggleFavorite(track.id);
        }}
        className={cn(!fav && 'opacity-0 group-hover/row:opacity-100')}
      />
      <span className="text-[12px] tabular text-fg-3">{formatTime(track.durationSeconds)}</span>
      <IconButton
        icon={MoreHorizontal}
        label="More"
        size="xs"
        tip={false}
        onClick={(e) => {
          e.stopPropagation();
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
}) {
  const saved = useIsBookmarked(kind ?? 'album', id);
  return (
    <header className="anim-rise relative mb-8 flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
      <Artwork seed={id} color={color} src={src} glyph={glyph} className="mx-auto w-[min(62vw,240px)] aspect-square shadow-[0_30px_70px_-28px_rgb(0_0_0/0.55)] [--art-r:24px] md:mx-0 md:w-[232px]" />
      <div className="min-w-0 flex-1 text-center md:text-left">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{eyebrow}</div>
        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.04em] md:text-[56px]">{title}</h1>
        {meta && <div className="mt-3 text-[14px] text-fg-2">{meta}</div>}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
          {tracks && tracks.length > 0 && <PlayFab size="lg" onClick={() => playQueue(tracks)} />}
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
export function Slider({ value, max = 1, step = 0.01, onChange, label, className }: { value: number; max?: number; step?: number; onChange: (v: number) => void; label: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn('relative flex h-5 w-full items-center', className)}>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
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

export function LogoMark({ className, animated }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <rect width="32" height="32" rx="10" fill="var(--fg)" />
      <path d="M9 10.5 15.2 22a.9.9 0 0 0 1.6 0L23 10.5" fill="none" stroke="var(--bg)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="11" r="2.3" fill="var(--fg)" className={animated ? 'anim-live origin-center' : undefined} />
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
