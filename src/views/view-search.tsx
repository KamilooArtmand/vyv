// ─────────────────────────────────────────────────────────────
// view-search.tsx: Search & Discovery Engine
// ─────────────────────────────────────────────────────────────

import { useDeferredValue, useMemo, useState } from 'react';
import { Search as SearchIcon, Sparkles, X } from 'lucide-react';
import { ALBUMS, ARTISTS, BOOKS, GENRES, SHOWS, STATIONS, WIKI, resolveEntity, useAllTracks } from '../state/state-catalog';
import { ask } from '../state/state-agent';
import { playTrack } from '../state/state-player';
import { navigate } from '../state/state-ui';
import { EmptyState, Grid, MediaCard, Section, Shelf, TrackList, meshGradient } from '../ui/ui-components';
import { NAV_GROUPS } from '../ui/ui-shell';
import type { BookmarkKind } from '../core/core-types';

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
const SHELF_ITEM = 'w-[150px] shrink-0 snap-start md:w-[172px]';

export default function SearchView() {
  const [q, setQ] = useState('');
  const query = norm(useDeferredValue(q).trim());
  const tracks = useAllTracks();

  const results = useMemo(() => {
    if (!query) return null;
    const has = (...s: string[]) => s.some((x) => norm(x).includes(query));
    return {
      tracks: tracks.filter((t) => has(t.title, t.artist, t.album)),
      groups: [
        ['artist', ARTISTS.filter((a) => has(a.name, ...a.genres)).map((a) => a.id)],
        ['album', ALBUMS.filter((a) => has(a.title)).map((a) => a.id)],
        ['genre', GENRES.filter((g) => has(g.name)).map((g) => g.id)],
        ['station', STATIONS.filter((s) => has(s.title, s.artist)).map((s) => s.id)],
        ['show', SHOWS.filter((s) => has(s.title, s.host, s.category)).map((s) => s.id)],
        ['book', BOOKS.filter((b) => has(b.title, b.author)).map((b) => b.id)],
        ['wiki', WIKI.filter((w) => has(w.title, w.summary)).map((w) => w.id)],
      ] as [BookmarkKind, string[]][],
    };
  }, [query, tracks]);

  const empty = results && !results.tracks.length && results.groups.every(([, ids]) => !ids.length);

  return (
    <div>
      <div className="anim-rise sticky top-16 z-10 -mx-4 mb-8 px-4 pb-2 md:-mx-8 md:px-8">
        <label className="glass flex h-14 items-center gap-3 rounded-full px-5">
          <SearchIcon size={20} strokeWidth={1.75} className="text-fg-3" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Artists, songs, podcasts, history…"
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-fg-3"
          />
          {q && (
            <button type="button" aria-label="Clear" onClick={() => setQ('')} className="press text-fg-3 hover:text-fg">
              <X size={18} />
            </button>
          )}
        </label>
      </div>

      {!results && (
        <>
          <Section title="Browse">
            <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {NAV_GROUPS.slice(1)
                .flat()
                .map(({ name, label, icon: Icon }) => (
                  <button key={name} type="button" onClick={() => navigate({ name })} className="glass press flex aspect-[5/3] flex-col justify-between rounded-[var(--radius-lg)] p-4 text-left hover:bg-surface-2">
                    <Icon size={22} strokeWidth={1.6} className="text-fg-2" />
                    <span className="text-[15px] font-semibold tracking-[-0.02em]">{label}</span>
                  </button>
                ))}
            </div>
          </Section>
          <Section title="Genres">
            <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => navigate({ name: 'genre', id: g.id })}
                  className="press relative aspect-[5/3] overflow-hidden rounded-[var(--radius-lg)] p-4 text-left text-white"
                  style={{ backgroundImage: meshGradient(g.id, g.colors[0]) }}
                >
                  <span className="text-[17px] font-semibold tracking-[-0.02em]">{g.name}</span>
                </button>
              ))}
            </div>
          </Section>
        </>
      )}

      {results && (
        <div className="anim-fade">
          <button type="button" onClick={() => ask(q)} className="glass press mb-8 flex w-full items-center gap-3 rounded-[var(--radius-lg)] p-4 text-left hover:bg-surface-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
              <Sparkles size={18} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[15px]">
              Ask the agent: <span className="font-medium">“{q}”</span>
            </span>
          </button>

          {empty && <EmptyState icon={SearchIcon} title="Nothing matched" hint="Try the agent — it understands moods and years." />}

          {results.tracks.length > 0 && (
            <Section title="Songs">
              <TrackList tracks={results.tracks.slice(0, 8)} numbered={false} />
            </Section>
          )}

          {results.groups.map(([kind, ids]) =>
            ids.length ? (
              <Section key={kind} title={kind === 'wiki' ? 'Wiki' : kind === 'show' ? 'Podcasts' : kind === 'book' ? 'Audiobooks' : kind === 'station' ? 'Radio' : `${kind[0].toUpperCase()}${kind.slice(1)}s`}>
                {ids.length > 4 ? (
                  <Shelf>
                    {ids.map((id) => (
                      <MediaCard key={id} className={SHELF_ITEM} entity={resolveEntity(kind, id)!} />
                    ))}
                  </Shelf>
                ) : (
                  <Grid>
                    {ids.map((id) => {
                      const s = kind === 'station' ? STATIONS.find((x) => x.id === id) : undefined;
                      return <MediaCard key={id} entity={resolveEntity(kind, id)!} onPlay={s ? () => playTrack(s, STATIONS) : undefined} />;
                    })}
                  </Grid>
                )}
              </Section>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
