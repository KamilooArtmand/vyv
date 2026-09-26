import { useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/format';
import { IconButton } from './IconButton';

export function PageHeader({
  title,
  eyebrow,
  subtitle,
  actions,
  className,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('anim-rise mb-6 flex items-end justify-between gap-4 md:mb-8', className)}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{eyebrow}</div>}
        <h1 className="truncate text-[32px] font-semibold leading-none tracking-[-0.035em] md:text-[44px]">{title}</h1>
        {subtitle && <p className="mt-2.5 max-w-xl text-sm text-fg-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </header>
  );
}

export function Section({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('mb-9 md:mb-11', className)}>
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

/** Width + snap for items placed in a <Shelf>. */
export const SHELF_ITEM = 'w-[148px] shrink-0 snap-start md:w-[176px]';

/** Horizontal, snap-scrolling shelf with desktop arrow nudges. */
export function Shelf({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const nudge = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <div className={cn('group/shelf relative -mx-4 md:-mx-8', className)}>
      <div ref={ref} className="scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-3.5 overflow-x-auto px-4 pb-2 md:scroll-px-8 md:gap-4 md:px-8">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-2 right-2 hidden items-center justify-between opacity-0 transition-opacity group-hover/shelf:opacity-100 md:flex">
        <IconButton icon={ChevronLeft} label="Scroll left" variant="glass" size="sm" tip={false} className="pointer-events-auto -mt-10" onClick={() => nudge(-1)} />
        <IconButton icon={ChevronRight} label="Scroll right" variant="glass" size="sm" tip={false} className="pointer-events-auto -mt-10" onClick={() => nudge(1)} />
      </div>
    </div>
  );
}

export function Grid({ children, className, min = 160 }: { children: ReactNode; className?: string; min?: number }) {
  return (
    <div className={cn('stagger grid gap-x-3.5 gap-y-6 md:gap-x-5', className)} style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 44%), 1fr))` }}>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint, action }: { icon: LucideIcon; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="anim-rise flex flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-dashed border-line-2 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-surface-2 text-fg-3">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div className="text-[15px] font-medium">{title}</div>
      {hint && <p className="max-w-xs text-sm text-fg-3">{hint}</p>}
      {action}
    </div>
  );
}
