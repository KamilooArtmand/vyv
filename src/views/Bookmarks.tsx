import { useState } from 'react';
import { Bookmark, LayoutGrid, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/format';
import { libraryStore, toggleBookmark } from '../state/library';
import { KIND_META, resolveEntity } from '../lib/entities';
import { MediaCard } from '../components/ui/Cards';
import { EmptyState, Grid, PageHeader } from '../components/ui/Layout';
import type { BookmarkKind } from '../types';

export default function Bookmarks() {
  const bookmarks = useStore(libraryStore, (s) => s.bookmarks);
  const [filter, setFilter] = useState<BookmarkKind | 'all'>('all');
  const kinds = [...new Set(bookmarks.map((b) => b.kind))];
  const shown = bookmarks.filter((b) => filter === 'all' || b.kind === filter);

  return (
    <div>
      <PageHeader title="Bookmarks" subtitle={`${bookmarks.length} saved`} />
      <div className="scrollbar-none anim-rise -mx-4 mb-7 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
        {[['all', { label: 'All', icon: LayoutGrid }] as const, ...kinds.map((k) => [k, KIND_META[k]] as const)].map(([k, meta]) => {
          const Icon = meta.icon;
          const count = k === 'all' ? bookmarks.length : bookmarks.filter((b) => b.kind === k).length;
          return (
            <button
              key={k}
              type="button"
              aria-label={meta.label}
              data-tip={meta.label}
              data-tip-side="bottom"
              onClick={() => setFilter(k)}
              className={cn('press flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium', filter === k ? 'bg-fg text-bg' : 'bg-surface-2 text-fg-2 hover:text-fg')}
            >
              <Icon size={15} strokeWidth={1.75} />
              <span className="tabular">{count}</span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={Bookmark} title="Nothing saved yet" hint="Tap the bookmark on any artist, album, show, book or article." />
      ) : (
        <Grid>
          {shown.map((b) => {
            const e = resolveEntity(b.kind, b.id);
            if (!e) return null;
            return (
              <div key={`${b.kind}-${b.id}`} className="group/bm relative">
                <MediaCard entity={e} badge={<span className="glass flex size-7 items-center justify-center rounded-full"><KindIcon kind={b.kind} /></span>} />
                <button
                  type="button"
                  aria-label="Remove bookmark"
                  onClick={() => toggleBookmark(b.kind, b.id)}
                  className="glass press absolute right-2 top-2 flex size-7 items-center justify-center rounded-full opacity-0 transition-opacity group-hover/bm:opacity-100 max-md:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </Grid>
      )}
    </div>
  );
}

function KindIcon({ kind }: { kind: BookmarkKind }) {
  const Icon = KIND_META[kind].icon;
  return <Icon size={13} strokeWidth={2} />;
}
