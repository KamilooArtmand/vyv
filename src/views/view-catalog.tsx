// ─────────────────────────────────────────────────────────────
// view-catalog.tsx: Albums, Artists, and Genres Views
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Disc3, Mic2, Shapes } from 'lucide-react';
import { useStore } from '../core/core-store';
import { formatDuration } from '../core/core-utils';
import {
  ALBUMS,
  ARTISTS,
  GENRES,
  albumById,
  artistById,
  genreById,
  onlineCatalogStore,
  trackById,
  useAllTracks,
} from '../state/state-catalog';
import { playQueue } from '../state/state-player';
import { navigate } from '../state/state-ui';
import { CollectionHeader, EmptyState, Grid, MediaCard, PageHeader, Section, Shelf, TrackList, meshGradient } from '../ui/ui-components';
import type { Track } from '../core/core-types';

const tracksOf = (ids: string[]) => ids.map((id) => trackById(id)).filter(Boolean) as Track[];

export function Albums() {
  const onlineAlbums = useStore(onlineCatalogStore, (s) => s.albums);
  return (
    <div>
      <PageHeader title="Albums" />
      <Grid min={170}>
        {onlineAlbums.map((a) => (
          <MediaCard
            key={a.id}
            entity={{ kind: 'album', id: a.id, title: a.title, subtitle: `${a.year}`, color: a.color, src: a.coverUrl, route: { name: 'album', id: a.id } }}
            onPlay={() => playQueue(tracksOf(a.trackIds))}
          />
        ))}
      </Grid>
    </div>
  );
}

export function AlbumView({ id }: { id?: string }) {
  const album = albumById(id);
  const onlineAlbums = useStore(onlineCatalogStore, (s) => s.albums);
  if (!album) return <EmptyState icon={Disc3} title="Album not found" />;
  const artist = artistById(album.artistId);
  const tracks = tracksOf(album.trackIds);

  return (
    <div>
      <CollectionHeader
        kind="album"
        id={album.id}
        eyebrow={`Album · ${album.year}`}
        title={album.title}
        color={album.color}
        src={album.coverUrl}
        tracks={tracks}
        meta={`${artist?.name ?? ''} · ${tracks.length} tracks · ${formatDuration(tracks.reduce((s, t) => s + t.durationSeconds, 0))}`}
      />
      <Section title="Tracklist">
        <TrackList tracks={tracks} />
      </Section>
    </div>
  );
}

export function Artists() {
  const onlineArtists = useStore(onlineCatalogStore, (s) => s.artists);
  const onlineAlbums = useStore(onlineCatalogStore, (s) => s.albums);
  return (
    <div>
      <PageHeader title="Artists" />
      <Grid min={150}>
        {onlineArtists.map((a) => (
          <MediaCard
            key={a.id}
            entity={{ kind: 'artist', id: a.id, title: a.name, subtitle: a.origin, color: a.color, circle: true, route: { name: 'artist', id: a.id } }}
            onPlay={() => {
              playQueue(tracksOf(onlineAlbums.filter((al) => al.artistId === a.id).flatMap((al) => al.trackIds)));
            }}
          />
        ))}
      </Grid>
    </div>
  );
}

export function ArtistView({ id }: { id?: string }) {
  const artist = artistById(id);
  const allTracks = useAllTracks();
  const onlineAlbums = useStore(onlineCatalogStore, (s) => s.albums);
  if (!artist) return <EmptyState icon={Mic2} title="Artist not found" />;

  const tracks = allTracks.filter((t) => t.artistId === artist.id);
  const albums = onlineAlbums.filter((a) => a.artistId === artist.id);

  return (
    <div>
      <header className="relative mb-8 rounded-[var(--radius-2xl)] p-8 text-white overflow-hidden" style={{ backgroundImage: meshGradient(artist.id, artist.color) }}>
        <h1 className="text-4xl md:text-6xl font-bold">{artist.name}</h1>
        <p className="mt-2 text-white/80 max-w-xl text-sm">{artist.bio}</p>
        <div className="mt-4 flex gap-4 text-xs uppercase tracking-wider text-white/70">
          <span>{artist.origin}</span>
          <span>Since {artist.since}</span>
        </div>
      </header>

      {tracks.length > 0 && (
        <Section title="Top Tracks">
          <TrackList tracks={tracks} />
        </Section>
      )}

      {albums.length > 0 && (
        <Section title="Discography">
          <Shelf>
            {albums.map((a) => (
              <MediaCard
                key={a.id}
                className="w-40 shrink-0"
                entity={{ kind: 'album', id: a.id, title: a.title, subtitle: `${a.year}`, color: a.color, src: a.coverUrl, route: { name: 'album', id: a.id } }}
                onPlay={() => playQueue(tracksOf(a.trackIds))}
              />
            ))}
          </Shelf>
        </Section>
      )}
    </div>
  );
}

export function Genres() {
  const onlineGenres = useStore(onlineCatalogStore, (s) => s.genres);
  return (
    <div>
      <PageHeader title="Genres" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {onlineGenres.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => navigate({ name: 'genre', id: g.id })}
            className="press relative aspect-[4/3] rounded-[var(--radius-xl)] p-5 text-left text-white overflow-hidden shadow-lg"
            style={{ backgroundImage: meshGradient(g.id, g.colors[0]) }}
          >
            <span className="text-xs uppercase tracking-wider opacity-70 block">{g.era}</span>
            <span className="absolute bottom-4 left-4 text-2xl font-bold">{g.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function GenreView({ id }: { id?: string }) {
  const genre = genreById(id);
  const allTracks = useAllTracks();
  const onlineArtists = useStore(onlineCatalogStore, (s) => s.artists);
  if (!genre) return <EmptyState icon={Shapes} title="Genre not found" />;

  const tracks = allTracks.filter((t) => t.genreId === genre.id);
  const artists = onlineArtists.filter((a) => a.genres.includes(genre.id));

  return (
    <div>
      <CollectionHeader
        kind="genre"
        id={genre.id}
        eyebrow={`Genre · ${genre.era}`}
        title={genre.name}
        color={genre.colors[0]}
        meta={genre.about}
        tracks={tracks}
      />

      {tracks.length > 0 && (
        <Section title="Essentials">
          <TrackList tracks={tracks} />
        </Section>
      )}

      {artists.length > 0 && (
        <Section title="Artists">
          <Shelf>
            {artists.map((a) => (
              <MediaCard
                key={a.id}
                className="w-36 shrink-0"
                entity={{ kind: 'artist', id: a.id, title: a.name, subtitle: a.origin, color: a.color, circle: true, route: { name: 'artist', id: a.id } }}
              />
            ))}
          </Shelf>
        </Section>
      )}
    </div>
  );
}
