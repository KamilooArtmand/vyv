// ─────────────────────────────────────────────────────────────
// view-extra.tsx: Bookmarks, Notifications, Timeline & Deep Wiki
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Bookmark,
  CheckCheck,
  Disc,
  History,
  Landmark,
  Radio,
  ScrollText,
  Share2,
  Trash2,
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
import { navigate, toast } from '../state/state-ui';
import { EmptyState, Grid, IconButton, MediaCard, PageHeader, Section, meshGradient } from '../ui/ui-components';
import type { BookmarkKind, NotificationItem } from '../core/core-types';

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

export function NotificationsView() {
  const items = useStore(libraryStore, (s) => s.notifications);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Inbox"
        subtitle={`${items.filter((n) => !n.read).length} unread notifications.`}
        actions={
          <>
            <IconButton icon={CheckCheck} label="Mark all read" variant="soft" onClick={() => markRead()} />
            <IconButton icon={Trash2} label="Clear" variant="soft" onClick={clearNotifications} />
          </>
        }
      />
      {items.length === 0 ? (
        <EmptyState icon={Bell} title="All caught up" />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markRead(n.id);
                n.route && navigate(n.route);
              }}
              className="glass press flex items-start gap-4 rounded-[var(--radius-xl)] p-4 cursor-pointer hover:bg-surface-2"
            >
              <div className="size-10 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                <Bell size={18} className="text-fg-2" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-baseline">
                  <div className="text-sm font-semibold truncate">{n.title}</div>
                  <span className="text-xs text-fg-3">{relativeTime(n.time)}</span>
                </div>
                <div className="text-xs text-fg-3 mt-1 line-clamp-2">{n.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TimelineView() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Sonic Timeline"
        subtitle="Chronological milestones of musical synthesis, acoustic revolution & digital philosophy."
      />
      <div className="relative pl-6 md:pl-8 border-l border-line-2 space-y-8 mt-6">
        {TIMELINE.map((t) => (
          <div key={t.year} className="relative group">
            {/* Timeline node dot */}
            <div className="absolute -left-[31px] md:-left-[39px] top-1.5 size-4 rounded-full border-4 border-bg bg-accent group-hover:scale-125 transition-transform" />

            <div className="glass rounded-[var(--radius-2xl)] p-6 shadow-sm border border-line-2">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-3xl md:text-4xl font-extralight text-fg tracking-tight">{t.year}</span>
                <div className="flex gap-1.5">
                  {t.wave.map((w) => (
                    <span key={w} className="rounded-full bg-surface-3 px-2.5 py-0.5 text-[11px] font-semibold text-fg-2">
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <h3 className="text-xl font-bold mt-2 text-fg">{t.headline}</h3>
              <ul className="mt-3 list-disc list-inside text-sm text-fg-2 space-y-1.5 leading-relaxed">
                {t.events.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>

              {t.wikiId && (
                <button
                  type="button"
                  onClick={() => navigate({ name: 'article', id: t.wikiId })}
                  className="press mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                >
                  <BookOpen size={14} />
                  <span>Read Wiki Essay</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
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
