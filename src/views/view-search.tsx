// ─────────────────────────────────────────────────────────────
// view-search.tsx: Search & Discovery Engine
// ─────────────────────────────────────────────────────────────

import { useDeferredValue, useMemo, useState } from 'react';
import { Globe, Search as SearchIcon, Sparkles, X } from 'lucide-react';
import { Archive, Audius, Podcasts, RadioBrowser, YouTube, YOUTUBE_API_KEY } from '../services/sources';
import { ArchiveCard, LiveState, ShowCard, StationGrid, VideoCard, useLive } from '../ui/ui-live';
import { ALBUMS, ARTISTS, BOOKS, GENRES, SHOWS, STATIONS, WIKI, resolveEntity, useAllTracks } from '../state/state-catalog';
import { ask } from '../state/state-agent';
import { playTrack } from '../state/state-player';
import { navigate } from '../state/state-ui';
import { Grid, MediaCard, Section, Shelf, TrackList, meshGradient } from '../ui/ui-components';
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

          {empty && <p className="mb-6 px-1 text-[13px] text-fg-3">Nothing in your vyv library — here is what the live sources found.</p>}

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

          <OnlineResults q={query} />
        </div>
      )}
    </div>
  );
}

/** Live results from every connected source, fetched in parallel. */
function OnlineResults({ q }: { q: string }) {
  const active = q.length > 1 ? q : null;
  const music = useLive(active && `au:${q}`, (sig) => Audius.search(q, 8, sig));
  const radio = useLive(active && `rb:${q}`, (sig) => RadioBrowser.search(q, 6, sig));
  const pods = useLive(active && `it:${q}`, (sig) => Podcasts.search(q, 10, sig));
  const archive = useLive(active && `ia:${q}`, (sig) => Archive.search(q, 'audio', 10, sig));
  const video = useLive(active && YOUTUBE_API_KEY ? `yt:${q}` : null, (sig) => YouTube.search(q, 8, sig));
  if (!active) return null;

  return (
    <>
      <div className="mb-6 mt-2 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">
        <Globe size={13} /> Live sources <span className="h-px flex-1 bg-line" />
      </div>
      <Section title="Music · Audius">
        <LiveState loading={music.loading} error={music.error} empty={!music.data?.length}>
          <TrackList tracks={music.data ?? []} numbered={false} />
        </LiveState>
      </Section>
      <Section title="Radio · live">
        <LiveState loading={radio.loading} error={radio.error} empty={!radio.data?.length}>
          <StationGrid stations={radio.data ?? []} />
        </LiveState>
      </Section>
      <Section title="Podcasts">
        <LiveState loading={pods.loading} error={pods.error} empty={!pods.data?.length}>
          <Shelf>{pods.data?.map((sh) => <ShowCard key={sh.id} show={sh} className={SHELF_ITEM} />)}</Shelf>
        </LiveState>
      </Section>
      <Section title="Internet Archive">
        <LiveState loading={archive.loading} error={archive.error} empty={!archive.data?.length}>
          <Shelf>{archive.data?.map((it) => <ArchiveCard key={it.id} item={it} className={SHELF_ITEM} />)}</Shelf>
        </LiveState>
      </Section>
      {YOUTUBE_API_KEY && (
        <Section title="Video · YouTube">
          <LiveState loading={video.loading} error={video.error} empty={!video.data?.length}>
            <Shelf>{video.data?.map((v) => <VideoCard key={v.id} video={v} className="w-[260px] shrink-0 snap-start" />)}</Shelf>
          </LiveState>
        </Section>
      )}
    </>
  );
}
