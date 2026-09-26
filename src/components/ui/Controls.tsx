import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/format';

/** iOS-grade toggle. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-300',
        checked ? 'bg-accent' : 'bg-surface-3',
      )}
    >
      <span
        className="absolute left-[3px] top-[3px] size-5 rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.25)] transition-transform duration-500 [transition-timing-function:var(--ease-spring)]"
        style={{ transform: `translateX(${checked ? 18 : 0}px)` }}
      />
    </button>
  );
}

export interface SegOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

/** Segmented control with a sliding thumb. Icon-only when an icon is given. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  iconOnly,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T, e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
  className?: string;
  iconOnly?: boolean;
}) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div
      role="radiogroup"
      className={cn('relative inline-grid rounded-full bg-surface-2 p-1', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute bottom-1 top-1 rounded-full bg-bg shadow-[var(--shadow-1)] transition-transform duration-500 [transition-timing-function:var(--ease-spring)] dark:bg-surface-3"
        style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${idx * 100}%)`, left: 4 }}
      />
      {options.map((o) => {
        const Icon = o.icon;
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={o.label}
            data-tip={iconOnly ? o.label : undefined}
            onClick={(e) => onChange(o.value, e)}
            className={cn(
              'relative z-10 flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3.5 text-[13px]',
              on ? 'text-fg' : 'text-fg-3 hover:text-fg-2',
            )}
          >
            {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.75} />}
            {!iconOnly && <span className="truncate">{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Thin range with a filled track (styled in index.css). */
export function Slider({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  label,
  className,
  fill,
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'min' | 'max' | 'step'> & {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  label: string;
  className?: string;
  fill?: string;
}) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn('range', className)}
      style={{ '--p': `${pct}%`, '--track-fill': fill } as CSSProperties}
      {...rest}
    />
  );
}

export function Chip({
  children,
  active,
  onClick,
  icon: Icon,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'press inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium',
        active ? 'bg-fg text-bg' : 'bg-surface-2 text-fg-2 hover:bg-surface-3 hover:text-fg',
      )}
    >
      {Icon && <Icon size={14} strokeWidth={1.75} />}
      {children}
    </button>
  );
}

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
