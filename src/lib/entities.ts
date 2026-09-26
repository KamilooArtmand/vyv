import { BookOpen, Disc3, Landmark, ListMusic, Mic2, Music2, Podcast, RadioTower, Shapes, type LucideIcon } from 'lucide-react';
import { albumById, artistById, bookById, genreById, showById, stationById, wikiById } from '../data/catalog';
import { playlistById, trackById } from '../state/library';
import type { BookmarkKind, Route } from '../types';

export interface Entity {
  kind: BookmarkKind;
  id: string;
  title: string;
  subtitle: string;
  color: string;
  src?: string;
  glyph?: LucideIcon;
  circle?: boolean;
  route?: Route;
}

export const KIND_META: Record<BookmarkKind, { label: string; icon: LucideIcon }> = {
  track: { label: 'Tracks', icon: Music2 },
  artist: { label: 'Artists', icon: Mic2 },
  album: { label: 'Albums', icon: Disc3 },
  playlist: { label: 'Playlists', icon: ListMusic },
  show: { label: 'Podcasts', icon: Podcast },
  book: { label: 'Books', icon: BookOpen },
  station: { label: 'Stations', icon: RadioTower },
  wiki: { label: 'Wiki', icon: Landmark },
  genre: { label: 'Genres', icon: Shapes },
};

/** Resolve any (kind, id) pair into something a card can render. */
export function resolveEntity(kind: BookmarkKind, id: string): Entity | null | undefined {
  switch (kind) {
    case 'track': {
      const t = trackById(id);
      return t && { kind, id, title: t.title, subtitle: t.artist, color: t.dominantColorHex, src: t.coverUrl, route: t.albumId ? { name: 'album', id: t.albumId } : undefined };
    }
    case 'artist': {
      const a = artistById(id);
      return a && { kind, id, title: a.name, subtitle: 'Artist', color: a.color, circle: true, glyph: Mic2, route: { name: 'artist', id } };
    }
    case 'album': {
      const a = albumById(id);
      return a && { kind, id, title: a.title, subtitle: `${artistById(a.artistId)?.name ?? ''} · ${a.year}`, color: a.color, src: a.coverUrl, glyph: Disc3, route: { name: 'album', id } };
    }
    case 'playlist': {
      const p = playlistById(id);
      return p && { kind, id, title: p.name, subtitle: `${p.trackIds.length} tracks`, color: p.color, glyph: ListMusic, route: { name: 'playlist', id } };
    }
    case 'show': {
      const s = showById(id);
      return s && { kind, id, title: s.title, subtitle: s.host, color: s.color, glyph: Podcast, route: { name: 'show', id } };
    }
    case 'book': {
      const b = bookById(id);
      return b && { kind, id, title: b.title, subtitle: b.author, color: b.color, route: { name: 'book', id } };
    }
    case 'station': {
      const s = stationById(id);
      return s && { kind, id, title: s.title, subtitle: 'Live radio', color: s.dominantColorHex, src: s.coverUrl, glyph: RadioTower, route: { name: 'radio' } };
    }
    case 'wiki': {
      const w = wikiById(id);
      return w && { kind, id, title: w.title, subtitle: w.era, color: w.color, glyph: Landmark, route: { name: 'article', id } };
    }
    case 'genre': {
      const g = genreById(id);
      return g && { kind, id, title: g.name, subtitle: g.era, color: g.colors[0], glyph: Shapes, route: { name: 'genre', id } };
    }
  }
  return null;
}
