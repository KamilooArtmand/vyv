import { forwardRef, type ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/format';

type Variant = 'ghost' | 'soft' | 'solid' | 'accent' | 'glass';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, { box: string; icon: number }> = {
  xs: { box: 'size-7', icon: 14 },
  sm: { box: 'size-8', icon: 16 },
  md: { box: 'size-10', icon: 18 },
  lg: { box: 'size-12', icon: 20 },
  xl: { box: 'size-16', icon: 26 },
};

const VARIANTS: Record<Variant, string> = {
  ghost: 'text-fg-2 hover:text-fg hover:bg-surface-2',
  soft: 'bg-surface-2 text-fg hover:bg-surface-3',
  solid: 'bg-fg text-bg hover:opacity-90 shadow-[var(--shadow-1)]',
  accent: 'bg-accent text-on-accent hover:brightness-110 shadow-[0_10px_30px_-10px_var(--accent)]',
  glass: 'glass text-fg hover:bg-surface-2',
};

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: LucideIcon;
  label: string;
  size?: Size;
  variant?: Variant;
  active?: boolean;
  filled?: boolean;
  tip?: 'top' | 'right' | 'bottom' | false;
  badge?: boolean | number;
}

/** Icon-only button. `label` is required: it becomes the accessible name and the tooltip. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, size = 'md', variant = 'ghost', active, filled, tip = 'top', badge, className, ...rest },
  ref,
) {
  const s = SIZES[size];
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-pressed={active}
      data-tip={tip ? label : undefined}
      data-tip-side={tip && tip !== 'top' ? tip : undefined}
      className={cn(
        'press relative inline-flex shrink-0 items-center justify-center rounded-full outline-none disabled:pointer-events-none disabled:opacity-35',
        s.box,
        VARIANTS[variant],
        active && variant === 'ghost' && '!text-accent-ink',
        className,
      )}
      {...rest}
    >
      <Icon size={s.icon} strokeWidth={1.75} className={cn(filled && 'fill-current')} />
      {badge ? (
        <span className="absolute right-1.5 top-1.5 flex min-w-2 items-center justify-center rounded-full bg-live px-[3px] text-[9px] font-semibold leading-[14px] text-white ring-2 ring-bg">
          {typeof badge === 'number' ? (badge > 9 ? '9+' : badge) : null}
        </span>
      ) : null}
    </button>
  );
});
