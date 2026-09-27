// ─────────────────────────────────────────────────────────────
// view-search.tsx: Search & Discovery Engine
// ─────────────────────────────────────────────────────────────

import { useDeferredValue, useMemo, useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useStore } from '../core/core-store';
import { ALBUMS, ARTISTS, BOOKS, GENRES, SHOWS, STATIONS, WIKI, useAllTracks } from '../state/state-catalog';
import { playTrack } from '../state/state-player';
import { navigate } from '../state/state-ui';
import { EmptyState, Grid, MediaCard, Section, Shelf, TrackList, meshGradient } from '../ui/ui-components';
import type { BookmarkKind } from '../core/core-types';

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

export default function SearchView() {
  const [q, setQ] = useState('');
  const query = norm(useDeferredValue(q).trim());
  const tracks = useAllTracks();
  const onlineArtists = ARTISTS;
  const onlineAlbums = ALBUMS;
  const onlineGenres = GENRES;

  const results = useMemo(() => {
    if (!query) return null;
    const has = (...s: string[]) => s.some((x) => norm(x).includes(query));
    return {
      tracks: tracks.filter((t) => has(t.title, t.artist, t.album)),
      artists: onlineArtists.filter((a) => has(a.name, ...a.genres)),
      albums: onlineAlbums.filter((a) => has(a.title)),
      genres: onlineGenres.filter((g) => has(g.name)),
      stations: STATIONS.filter((s) => has(s.title, s.artist)),
    };
  }, [query, tracks, onlineArtists, onlineAlbums, onlineGenres]);

  return (
    <div>
      <div className="sticky top-16 z-10 mb-8">
        <label className="glass flex h-14 items-center gap-3 rounded-full px-5 shadow-sm">
          <SearchIcon size={20} className="text-fg-3" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search artists, songs, genres, radio…"
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-fg-3"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} className="press text-fg-3 hover:text-fg">
              <X size={18} />
            </button>
          )}
        </label>
      </div>

      {!results && (
        <Section title="Explore Genres">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {onlineGenres.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => navigate({ name: 'genre', id: g.id })}
                className="press relative aspect-[5/3] overflow-hidden rounded-[var(--radius-lg)] p-4 text-left text-white shadow-md"
                style={{ backgroundImage: meshGradient(g.id, g.colors[0]) }}
              >
                <span className="text-[17px] font-semibold">{g.name}</span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {results && (
        <div>
          {results.tracks.length > 0 && (
            <Section title="Songs">
              <TrackList tracks={results.tracks.slice(0, 10)} numbered={false} />
            </Section>
          )}

          {results.artists.length > 0 && (
            <Section title="Artists">
              <Shelf>
                {results.artists.map((a) => (
                  <MediaCard
                    key={a.id}
                    className="w-36 shrink-0"
                    entity={{ kind: 'artist', id: a.id, title: a.name, subtitle: a.origin, color: a.color, circle: true, route: { name: 'artist', id: a.id } }}
                  />
                ))}
              </Shelf>
            </Section>
          )}

          {results.albums.length > 0 && (
            <Section title="Albums">
              <Shelf>
                {results.albums.map((a) => (
                  <MediaCard
                    key={a.id}
                    className="w-40 shrink-0"
                    entity={{ kind: 'album', id: a.id, title: a.title, subtitle: `${a.year}`, color: a.color, src: a.coverUrl, route: { name: 'album', id: a.id } }}
                  />
                ))}
              </Shelf>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
