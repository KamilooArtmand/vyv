// ─────────────────────────────────────────────────────────────
// view-extra.tsx: Bookmarks, Notifications, Timeline & Deep Wiki
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BellOff,
  Bookmark,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Disc,
  Radio,
  Settings2,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { useStore } from '../core/core-store';
import { relativeTime } from '../core/core-utils';
import {
  TIMELINE,
  WIKI,
  clearNotifications,
  libraryStore,
  markRead,
  resolveEntity,
  toggleBookmark,
  wikiById,
} from '../state/state-catalog';
import { ask } from '../state/state-agent';
import { navigate, settingsStore, toast } from '../state/state-ui';
import { EmptyState, Grid, IconButton, MediaCard, PageHeader, Section, meshGradient } from '../ui/ui-components';
import type { NotificationItem, NotificationType } from '../core/core-types';

export function BookmarksView() {
  const bookmarks = useStore(libraryStore, (s) => s.bookmarks);

  return (
    <div>
      <PageHeader title="Bookmarks" subtitle={`${bookmarks.length} saved items.`} />
      {bookmarks.length === 0 ? (
        <EmptyState icon={Bookmark} title="No bookmarks yet" hint="Bookmark artists, albums, or tracks to access them here." />
      ) : (
        <Grid min={160}>
          {bookmarks.map((b) => {
            const entity = resolveEntity(b.kind, b.id);
            if (!entity) return null;
            return (
              <div key={`${b.kind}-${b.id}`} className="relative group">
                <MediaCard entity={entity} />
                <button
                  type="button"
                  onClick={() => toast(toggleBookmark(b.kind, b.id) ? 'Bookmarked' : 'Removed', 'bookmark')}
                  aria-label="Remove bookmark"
                  className="absolute top-2 right-2 size-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            );
          })}
        </Grid>
      )}
    </div>
  );
}

// Only the agent gets the brand accent — every other type stays neutral gray.
const NOTIF_TYPE: Record<NotificationType, { icon: typeof Bell; color: string; label: string }> = {
  agent: { icon: Sparkles, color: 'var(--accent)', label: 'Agent' },
  release: { icon: Disc, color: 'var(--gray)', label: 'Releases' },
  podcast: { icon: Radio, color: 'var(--gray)', label: 'Podcasts' },
  social: { icon: Users, color: 'var(--gray)', label: 'Social' },
  system: { icon: Settings2, color: 'var(--gray)', label: 'System' },
};

function bucket(iso: string) {
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  return h < 24 ? 'Today' : h < 24 * 7 ? 'This week' : 'Earlier';
}

function NotificationRow({ n }: { n: NotificationItem }) {
  const t = NOTIF_TYPE[n.type];
  const Icon = t.icon;
  return (
    <button
      type="button"
      onClick={() => {
        markRead(n.id);
        n.route && navigate(n.route);
      }}
      className="press group flex w-full items-start gap-3.5 rounded-[var(--radius-lg)] p-3 text-left hover:bg-surface-2"
    >
      <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full" style={{ background: `color-mix(in oklab, ${t.color} 16%, transparent)`, color: t.color }}>
        <Icon size={19} strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className={n.read ? 'truncate text-[14.5px] font-medium text-fg-2' : 'truncate text-[14.5px] font-semibold'}>{n.title}</span>
          <span className="shrink-0 text-[12px] text-fg-3 tabular">{relativeTime(n.time)}</span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[13.5px] text-fg-3">{n.content}</span>
      </span>
      <span className={`mt-2 size-2 shrink-0 rounded-full bg-accent transition-opacity ${n.read ? 'opacity-0' : ''}`} />
    </button>
  );
}

export function NotificationsView() {
  const items = useStore(libraryStore, (s) => s.notifications);
  const enabled = useStore(settingsStore, (s) => s.notifications);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const shown = items.filter((n) => filter === 'all' || n.type === filter);
  const groups = ['Today', 'This week', 'Earlier']
    .map((g) => [g, shown.filter((n) => bucket(n.time) === g)] as const)
    .filter(([, list]) => list.length);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Inbox"
        subtitle={`${items.filter((n) => !n.read).length} unread`}
        actions={
          <>
            <IconButton icon={enabled ? Bell : BellOff} label={enabled ? 'Mute' : 'Unmute'} variant="soft" active={enabled} onClick={() => settingsStore.set({ notifications: !enabled })} />
            <IconButton icon={CheckCheck} label="Mark all read" variant="soft" onClick={() => markRead()} />
            <IconButton icon={Trash2} label="Clear" variant="soft" onClick={clearNotifications} />
          </>
        }
      />
      <div className="scrollbar-none anim-rise -mx-4 mb-6 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
        {(['all', ...Object.keys(NOTIF_TYPE)] as (NotificationType | 'all')[]).map((k) => {
          const meta = k === 'all' ? { icon: Bell, label: 'All' } : NOTIF_TYPE[k];
          const Icon = meta.icon;
          return (
            <button
              key={k}
              type="button"
              aria-label={meta.label}
              onClick={() => setFilter(k)}
              className={`press flex size-9 shrink-0 items-center justify-center rounded-full ${filter === k ? 'bg-fg text-bg' : 'bg-surface-2 text-fg-2 hover:text-fg'}`}
            >
              <Icon size={16} strokeWidth={1.75} />
            </button>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={Bell} title="All caught up" />
      ) : (
        groups.map(([g, list]) => (
          <section key={g} className="mb-6">
            <h2 className="mb-1 px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">{g}</h2>
            <div className="flex flex-col">
              {list.map((n) => (
                <NotificationRow key={n.id} n={n} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

const TL_START = 1870;
const TL_END = 2030;
const TL_PX = 16; // pixels per year on the ruler

export function TimelineView({ id }: { id?: string }) {
  const idx = Math.max(0, TIMELINE.findIndex((y) => String(y.year) === id));
  const entry = TIMELINE[id ? idx : TIMELINE.length - 1];
  const i = TIMELINE.indexOf(entry);
  const ruler = useRef<HTMLDivElement>(null);
  const go = (n: number) => navigate({ name: 'timeline', id: String(TIMELINE[(n + TIMELINE.length) % TIMELINE.length].year) });

  useEffect(() => {
    const el = ruler.current;
    if (!el) return;
    el.scrollTo({ left: (entry.year - TL_START) * TL_PX - el.clientWidth / 2, behavior: 'smooth' });
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
      <div ref={ruler} className="scrollbar-none relative -mx-4 mb-10 mt-4 overflow-x-auto md:-mx-8" aria-label="Years" style={{ maskImage: 'linear-gradient(to right, transparent, #000 16px, #000 calc(100% - 32px), transparent)' }}>
        <div className="relative h-20" style={{ width: (TL_END - TL_START) * TL_PX }}>
          {Array.from({ length: (TL_END - TL_START) / 10 + 1 }, (_, d) => TL_START + d * 10).map((y) => (
            <div key={y} className="absolute bottom-0 top-8 flex flex-col items-start" style={{ left: (y - TL_START) * TL_PX }}>
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
                title={`${t.year} · ${t.headline}`}
                onClick={() => navigate({ name: 'timeline', id: String(t.year) })}
                className="group absolute top-[52px] -translate-x-1/2 -translate-y-1/2 p-2"
                style={{ left: (t.year - TL_START) * TL_PX }}
              >
                <span
                  className={`block rounded-full transition-all duration-500 ${on ? 'size-4 bg-accent shadow-[0_0_0_6px_var(--accent-soft)]' : 'size-2 bg-fg-3 group-hover:size-3 group-hover:bg-fg'}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* The story of the year */}
      <div key={`c-${entry.year}`} className="anim-rise grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="glass rounded-[var(--radius-2xl)] border border-line-2 p-6 md:p-8">
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
        <div className="glass rounded-[var(--radius-2xl)] border border-line-2 p-6">
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

      <Section title="Decades">
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
                className={`press rounded-[var(--radius-md)] py-3 text-[15px] font-medium tabular disabled:opacity-30 ${on ? 'bg-fg text-bg' : 'bg-surface-2 hover:bg-surface-3'}`}
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

export function WikiView({ id }: { id?: string }) {
  // If an ID is provided, render the rich detailed article view
  if (id) {
    const article = wikiById(id) || WIKI[0];
    return (
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate({ name: 'wiki' })}
          className="press mb-4 inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-fg font-medium"
        >
          <ArrowLeft size={16} /> Back to Music Wiki
        </button>

        <header
          className="relative rounded-[var(--radius-2xl)] p-8 md:p-12 text-white overflow-hidden shadow-lg mb-8"
          style={{ backgroundImage: meshGradient(article.id, article.color) }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80 block mb-2">{article.era}</span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{article.title}</h1>
          <p className="mt-4 text-base md:text-lg text-white/90 leading-relaxed max-w-2xl">{article.summary}</p>
        </header>

        <div className="space-y-6">
          {article.sections.map((sec, i) => (
            <div key={i} className="glass rounded-[var(--radius-xl)] p-6 border border-line-2">
              <h2 className="text-xl font-bold text-fg mb-2">{sec.heading}</h2>
              <p className="text-sm md:text-base text-fg-2 leading-relaxed">{sec.body}</p>
            </div>
          ))}
        </div>

        {article.related && article.related.length > 0 && (
          <div className="mt-8 border-t border-line-2 pt-6">
            <h3 className="text-xs uppercase tracking-wider text-fg-3 font-semibold mb-3">Related Concepts</h3>
            <div className="flex flex-wrap gap-2">
              {article.related.map((rel) => (
                <span key={rel} className="rounded-full bg-surface-2 px-3 py-1 text-xs text-fg-2 font-medium">
                  #{rel}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Otherwise render the full Wiki directory of deep essays
  return (
    <div>
      <PageHeader
        title="Music Wiki & Philosophy"
        subtitle="In-depth essays on modal systems, Persian radif, electronic architecture and the science of listening."
      />
      <div className="grid gap-6 sm:grid-cols-2">
        {WIKI.map((w) => (
          <div
            key={w.id}
            onClick={() => navigate({ name: 'article', id: w.id })}
            className="glass press group cursor-pointer rounded-[var(--radius-2xl)] p-6 border border-line-2 hover:border-fg/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-fg-3">{w.era}</span>
                <span className="size-2 rounded-full" style={{ backgroundColor: w.color }} />
              </div>
              <h3 className="text-2xl font-bold text-fg group-hover:text-accent transition-colors">{w.title}</h3>
              <p className="mt-3 text-sm text-fg-2 leading-relaxed line-clamp-3">{w.summary}</p>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-fg-3 group-hover:text-fg pt-4 border-t border-line-2">
              <span>{w.sections.length} chapters</span>
              <span className="inline-flex items-center gap-1 text-accent">
                Read Article →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The single-article reader (routed as "article") is WikiView's id branch. */
export const ArticleView = WikiView;
