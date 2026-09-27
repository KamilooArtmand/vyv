// ─────────────────────────────────────────────────────────────
// view-home.tsx: Unified Home Experience & Genre Discovery
// ─────────────────────────────────────────────────────────────

import { ArrowUpRight, BookOpen, Heart, History, ListMusic, RadioTower, ScrollText, Shapes, Sparkles } from 'lucide-react';
import { useStore } from '../core/core-store';
import { greeting } from '../core/core-utils';
import {
  ALBUMS,
  BOOKS,
  SHOWS,
  STATIONS,
  TIMELINE,
  WIKI,
  libraryStore,
  onlineCatalogStore,
  smartMix,
  trackById,
  useAllTracks,
} from '../state/state-catalog';
import { playQueue, playTrack } from '../state/state-player';
import { ask } from '../state/state-agent';
import { navigate } from '../state/state-ui';
import { Artwork, LiveBadge, MediaCard, PageHeader, PlayFab, Section, Shelf, SHELF_ITEM, meshGradient } from '../ui/ui-components';
import type { Mood, Track } from '../core/core-types';

const MOODS: { mood: Mood; name: string; prompt: string }[] = [
  { mood: 'focus', name: 'Focus', prompt: 'Play focus music' },
  { mood: 'calm', name: 'Calm', prompt: 'Play something calm' },
  { mood: 'night', name: 'Night', prompt: 'Play night drive' },
  { mood: 'energy', name: 'Energy', prompt: 'Play something with energy' },
  { mood: 'happy', name: 'Sunny', prompt: 'Play something happy' },
  { mood: 'melancholy', name: 'Rainy', prompt: 'Play something for a rainy day' },
];

export default function HomeView() {
  const tracks = useAllTracks();
  const onlineAlbums = useStore(onlineCatalogStore, (s) => s.albums);
  const onlineGenres = useStore(onlineCatalogStore, (s) => s.genres);
  const history = useStore(libraryStore, (s) => s.history);
  const favorites = useStore(libraryStore, (s) => s.favorites);
  const mix = smartMix();

  const recent = history.map((id) => trackById(id)).filter(Boolean) as Track[];
  const liked = tracks.filter((t) => favorites.includes(t.id));

  return (
    <div>
      <PageHeader title={greeting()} eyebrow="Home" />

      {/* Quick Picks */}
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => playQueue(liked)}
          className="glass press flex h-16 cursor-pointer items-center gap-3 overflow-hidden rounded-[var(--radius-lg)] p-2.5 hover:bg-surface-2"
        >
          <div className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-accent text-on-accent">
            <Heart size={20} className="fill-current" />
          </div>
          <span className="truncate font-semibold text-sm">Liked Songs</span>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => playQueue(mix.trackIds.map((id) => trackById(id)).filter(Boolean) as Track[])}
          className="glass press flex h-16 cursor-pointer items-center gap-3 overflow-hidden rounded-[var(--radius-lg)] p-2.5 hover:bg-surface-2"
        >
          <div className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-fg text-bg">
            <Sparkles size={20} />
          </div>
          <span className="truncate font-semibold text-sm">{mix.name}</span>
        </div>
      </section>

      {/* Mood Mixes */}
      <Section title="Mood Mixes" icon={Sparkles}>
        <Shelf>
          {MOODS.map((m) => (
            <button
              key={m.mood}
              type="button"
              onClick={() => ask(m.prompt)}
              className={`${SHELF_ITEM} press relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] p-4 text-left text-white shadow-md`}
              style={{ backgroundImage: meshGradient(m.mood, '#ff3c00') }}
            >
              <span className="absolute bottom-4 left-4 text-[20px] font-semibold">{m.name}</span>
              <ArrowUpRight size={18} className="absolute right-3 top-3 opacity-70" />
            </button>
          ))}
        </Shelf>
      </Section>

      {/* Browse by Genre */}
      <Section title="Browse by Genre" icon={Shapes}>
        <Shelf>
          {onlineGenres.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => navigate({ name: 'genre', id: g.id })}
              className={`${SHELF_ITEM} press relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] p-4 text-left text-white shadow-md`}
              style={{ backgroundImage: meshGradient(g.id, g.colors[0]) }}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider opacity-70 block">{g.era}</span>
              <span className="absolute bottom-3 left-3 text-[17px] font-semibold">{g.name}</span>
            </button>
          ))}
        </Shelf>
      </Section>

      {/* Live Radio */}
      <Section title="Live Radio" icon={RadioTower}>
        <Shelf>
          {STATIONS.map((s) => (
            <MediaCard
              key={s.id}
              className={SHELF_ITEM}
              entity={{ kind: 'station', id: s.id, title: s.title, subtitle: s.artist, color: s.dominantColorHex, src: s.coverUrl, route: { name: 'radio' } }}
              badge={<LiveBadge />}
              onPlay={() => playTrack(s, STATIONS)}
            />
          ))}
        </Shelf>
      </Section>

      {/* Recent Releases */}
      <Section title="Albums & Releases">
        <Shelf>
          {onlineAlbums.map((a) => (
            <MediaCard
              key={a.id}
              className={SHELF_ITEM}
              entity={{ kind: 'album', id: a.id, title: a.title, subtitle: `${a.year}`, color: a.color, src: a.coverUrl, route: { name: 'album', id: a.id } }}
              onPlay={() => playQueue(a.trackIds.map((id) => trackById(id)).filter(Boolean) as Track[])}
            />
          ))}
        </Shelf>
      </Section>

      {/* Audiobooks Showcase */}
      <Section title="Audiobooks & Literature">
        <Shelf>
          {BOOKS.map((b) => (
            <MediaCard
              key={b.id}
              className={SHELF_ITEM}
              entity={{ kind: 'book', id: b.id, title: b.title, subtitle: b.author, color: b.color, route: { name: 'book', id: b.id } }}
            />
          ))}
        </Shelf>
      </Section>

      {/* Music Wiki & Timeline Highlights */}
      <Section title="Music Philosophy & Wiki Essays" icon={ScrollText}>
        <div className="grid gap-4 sm:grid-cols-2">
          {WIKI.slice(0, 2).map((w) => (
            <div
              key={w.id}
              onClick={() => navigate({ name: 'article', id: w.id })}
              className="glass press group cursor-pointer rounded-[var(--radius-xl)] p-5 border border-line-2 hover:border-fg/20 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-fg-3 block mb-1">{w.era}</span>
                <h3 className="text-lg font-bold text-fg group-hover:text-accent transition-colors">{w.title}</h3>
                <p className="mt-2 text-xs text-fg-2 line-clamp-2 leading-relaxed">{w.summary}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-accent">
                <span>Explore essay</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
