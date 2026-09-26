import { useEffect, useRef } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/format';
import { TIMELINE, wikiById } from '../data/catalog';
import { navigate } from '../state/ui';
import { ask } from '../state/agent';
import { IconButton } from '../components/ui/IconButton';
import { Section } from '../components/ui/Layout';

const START = 1870;
const END = 2030;
const PX = 16; // pixels per year on the ruler

export default function Timeline({ id }: { id?: string }) {
  const idx = Math.max(0, TIMELINE.findIndex((y) => String(y.year) === id));
  const entry = TIMELINE[id ? idx : TIMELINE.length - 1];
  const i = TIMELINE.indexOf(entry);
  const ruler = useRef<HTMLDivElement>(null);
  const go = (n: number) => navigate({ name: 'timeline', id: String(TIMELINE[(n + TIMELINE.length) % TIMELINE.length].year) });

  useEffect(() => {
    const el = ruler.current;
    if (!el) return;
    el.scrollTo({ left: (entry.year - START) * PX - el.clientWidth / 2, behavior: 'smooth' });
  }, [entry.year]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') go(i - 1);
      if (e.key === 'ArrowRight') go(i + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const article = wikiById(entry.wikiId);

  return (
    <div>
      <div className="anim-rise mb-2 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">Timeline · year by year</div>

      {/* The year */}
      <div className="flex items-center justify-between gap-4">
        <h1 key={entry.year} className="anim-rise text-[96px] font-extralight leading-[0.9] tracking-[-0.07em] tabular md:text-[180px]">
          {entry.year}
        </h1>
        <div className="flex gap-1.5">
          <IconButton icon={ChevronLeft} label="Earlier" variant="soft" size="lg" onClick={() => go(i - 1)} />
          <IconButton icon={ChevronRight} label="Later" variant="soft" size="lg" onClick={() => go(i + 1)} />
        </div>
      </div>

      {/* Ruler */}
      <div ref={ruler} className="scrollbar-none fade-x relative -mx-4 mb-10 mt-4 overflow-x-auto md:-mx-8" aria-label="Years">
        <div className="relative h-20" style={{ width: (END - START) * PX }}>
          {Array.from({ length: (END - START) / 10 + 1 }, (_, d) => START + d * 10).map((y) => (
            <div key={y} className="absolute bottom-0 top-8 flex flex-col items-start" style={{ left: (y - START) * PX }}>
              <span className="h-full w-px bg-line-2" />
              <span className="absolute -top-6 -translate-x-1/2 text-[11px] text-fg-3 tabular">{y}</span>
            </div>
          ))}
          <div className="absolute inset-x-0 top-[52px] h-px bg-line-2" />
          {TIMELINE.map((t) => {
            const on = t.year === entry.year;
            return (
              <button
                key={t.year}
                type="button"
                aria-label={String(t.year)}
                data-tip={`${t.year} · ${t.headline}`}
                onClick={() => navigate({ name: 'timeline', id: String(t.year) })}
                className="group absolute top-[52px] -translate-x-1/2 -translate-y-1/2 p-2"
                style={{ left: (t.year - START) * PX }}
              >
                <span
                  className={cn(
                    'block rounded-full transition-all duration-500 [transition-timing-function:var(--ease-spring)]',
                    on ? 'size-4 bg-accent shadow-[0_0_0_6px_var(--accent-soft)]' : 'size-2 bg-fg-3 group-hover:size-3 group-hover:bg-fg',
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* The story of the year */}
      <div key={`c-${entry.year}`} className="anim-rise grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="card rounded-[var(--radius-2xl)] p-6 md:p-8">
          <h2 className="text-[26px] font-semibold tracking-[-0.035em] md:text-[34px]">{entry.headline}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {entry.events.map((e) => (
              <li key={e} className="flex gap-3 text-[15.5px] leading-relaxed text-fg-2">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                {e}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" onClick={() => ask(`What happened in music in ${entry.year}?`)} className="press flex h-10 items-center gap-2 rounded-full bg-fg px-4 text-[13.5px] font-medium text-bg">
              <Sparkles size={15} /> Ask agent
            </button>
            {article && (
              <button type="button" onClick={() => navigate({ name: 'article', id: article.id })} className="press flex h-10 items-center gap-2 rounded-full bg-surface-2 px-4 text-[13.5px] font-medium hover:bg-surface-3">
                {article.title} <ArrowUpRight size={15} />
              </button>
            )}
          </div>
        </div>
        <div className="card rounded-[var(--radius-2xl)] p-6">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">Sound of the year</div>
          <div className="flex flex-wrap gap-2">
            {entry.wave.map((w) => (
              <button key={w} type="button" onClick={() => ask(`Play ${w}`)} className="press rounded-full border border-line-2 px-3.5 py-1.5 text-[13.5px] hover:bg-surface-2">
                {w}
              </button>
            ))}
          </div>
          <div className="mt-6 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">Milestone</div>
          <div className="mt-1 text-[32px] font-extralight tabular tracking-[-0.04em]">
            {i + 1}
            <span className="text-fg-3">/{TIMELINE.length}</span>
          </div>
        </div>
      </div>

      <Section title="Decades" className="mt-12">
        <div className="stagger grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {[1870, 1880, 1910, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((d) => {
            const first = TIMELINE.find((t) => t.year >= d && t.year < d + 10);
            const on = entry.year >= d && entry.year < d + 10;
            return (
              <button
                key={d}
                type="button"
                disabled={!first}
                onClick={() => first && navigate({ name: 'timeline', id: String(first.year) })}
                className={cn('press rounded-[var(--radius-md)] py-3 text-[15px] font-medium tabular disabled:opacity-30', on ? 'bg-fg text-bg' : 'bg-surface-2 hover:bg-surface-3')}
              >
                {d}s
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
