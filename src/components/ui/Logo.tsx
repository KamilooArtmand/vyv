import { cn } from '../../lib/format';

/** VYV mark: two converging sound strokes form a “V” around a resonant dot. */
export function LogoMark({ className, animated }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <defs>
        <linearGradient id="vyv-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-ink)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="var(--fg)" />
      <path d="M9 10.5 15.2 22a.9.9 0 0 0 1.6 0L23 10.5" fill="none" stroke="var(--bg)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="11" r="2.3" fill="url(#vyv-g)" className={animated ? 'anim-live origin-center [transform-box:fill-box]' : undefined} />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn('text-[19px] font-bold lowercase tracking-[-0.04em]', className)}>vyv</span>;
}
