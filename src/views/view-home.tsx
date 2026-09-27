// ─────────────────────────────────────────────────────────────
// view-home.tsx: Unified Home Experience & Genre Discovery
// ─────────────────────────────────────────────────────────────

import { ArrowUpRight, Heart, History, ListMusic, RadioTower, Sparkles } from 'lucide-react';
import { useStore } from '../core/core-store';
import { greeting } from '../core/core-utils';
import {
  ALBUMS,
  SHOWS,
  STATIONS,
  TIMELINE,
  episodeToTrack,
  libraryStore,
  resolveEntity,
  smartMix,
  trackById,
  useAllTracks,
} from '../state/state-catalog';
import { playQueue, playTrack, playerStore } from '../state/state-player';
import { ask, predict } from '../state/state-agent';
import { authStore, navigate, settingsStore } from '../state/state-ui';
import { Artwork, LiveBadge, MediaCard, PlayFab, Section, Shelf, SHELF_ITEM, meshGradient } from '../ui/ui-components';
import type { Mood, Track } from '../core/core-types';

// One brand color for every tile — each still reads distinct because
// meshGradient() jitters hue per seed, so the family stays cohesive.
const MOOD_COLOR = '#ff3c00';
const MOODS: { mood: Mood; name: string; prompt: string }[] = [
  { mood: 'focus', name: 'Focus', prompt: 'Play focus music' },
  { mood: 'calm', name: 'Calm', prompt: 'Play something calm' },
  { mood: 'night', name: 'Night', prompt: 'Play night drive' },
  { mood: 'energy', name: 'Energy', prompt: 'Play something with energy' },
  { mood: 'happy', name: 'Sunny', prompt: 'Play something happy' },
  { mood: 'melancholy', name: 'Rainy', prompt: 'Play something for a rainy day' },
];

function QuickTile({ title, color, seed, src, icon, onClick, onPlay }: { title: string; color: string; seed: string; src?: string; icon?: typeof Heart; onClick: () => void; onPlay: () => void }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick()} className="group/q press flex h-14 cursor-pointer items-center gap-3 overflow-hidden rounded-[var(--radius-md)] bg-surface pr-2 hover:bg-surface-2 md:h-16">
      <Artwork seed={seed} color={color} src={src} glyph={icon} className="aspect-square h-full !rounded-none" />
      <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium md:text-[14.5px]">{title}</span>
      <PlayFab onClick={onPlay} className="!size-9 opacity-0 transition-opacity group-hover/q:opacity-100 max-md:hidden" />
    </div>
  );
}

export default function HomeView() {
  const tracks = useAllTracks();
  const history = useStore(libraryStore, (s) => s.history);
  const favorites = useStore(libraryStore, (s) => s.favorites);
  const playlists = useStore(libraryStore, (s) => s.playlists);
  const progress = useStore(libraryStore, (s) => s.progress);
  const proactive = useStore(settingsStore, (s) => s.agentProactive);
  const user = useStore(authStore, (s) => s.user);
  const current = useStore(playerStore, (s) => s.track);

  const nudge = predict({ tracks, current, history });
  const nudgeTracks = tracks.filter((t) => t.moods?.includes(nudge.mood));
  const recent = history.map((id) => trackById(id)).filter(Boolean) as Track[];
  const liked = tracks.filter((t) => favorites.includes(t.id));
  const mix = smartMix();
  const today = new Date();
  const onThisDay = TIMELINE[(today.getDate() + today.getMonth() * 31) % TIMELINE.length];
  const playFromIds = (ids: string[]) => playQueue(ids.map((id) => trackById(id)).filter(Boolean) as Track[]);

  const continueItems = Object.entries(progress)
    .map(([id, secs]) => {
      const show = SHOWS.find((s) => s.episodes.some((e) => e.id === id));
      return show ? { id, secs, show, ep: show.episodes.find((e) => e.id === id)! } : null;
    })
    .filter(Boolean)
    .slice(0, 2) as { id: string; secs: number; show: (typeof SHOWS)[number]; ep: (typeof SHOWS)[number]['episodes'][number] }[];

  return (
    <div>
      <header className="anim-rise mb-7 md:mb-9">
        <div className="mb-1.5 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">
          {today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="text-[32px] font-semibold leading-none tracking-[-0.04em] md:text-[48px]">
          {greeting(today)}
          {user ? <span className="text-fg-3">, {user.username.split(' ')[0]}</span> : null}
        </h1>
      </header>

      {/* Agent prediction */}
      {proactive && (
        <section className="anim-rise mb-9">
          <div className="relative overflow-hidden rounded-[var(--radius-2xl)] p-6 text-white md:p-8" style={{ backgroundImage: meshGradient(nudge.mood, nudgeTracks[0]?.dominantColorHex ?? MOOD_COLOR) }}>
            <div className="absolute inset-0 bg-[linear-gradient(100deg,rgb(0_0_0/0.45),transparent_70%)]" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-lg">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] backdrop-blur">
                  <Sparkles size={12} /> Agent · for right now
                </div>
                <p className="text-[22px] font-semibold leading-tight tracking-[-0.025em] md:text-[28px]">{nudge.title}</p>
                <p className="mt-2 text-[13.5px] text-white/70">{nudgeTracks.slice(0, 3).map((t) => t.artist).join(' · ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => ask(nudge.prompt)} className="press flex h-12 items-center gap-2 rounded-full bg-white pl-4 pr-5 text-[14px] font-semibold text-black">
                  <Sparkles size={16} /> Play mix
                </button>
                <div className="flex -space-x-3">
                  {nudgeTracks.slice(0, 3).map((t) => (
                    <Artwork key={t.id} seed={t.id} color={t.dominantColorHex} src={t.coverUrl} shape="circle" className="size-12 ring-2 ring-white/40" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick picks */}
      <section className="stagger mb-10 grid grid-cols-2 gap-2 md:gap-3 xl:grid-cols-3">
        <QuickTile title="Liked" color={MOOD_COLOR} seed="liked" icon={Heart} onClick={() => navigate({ name: 'playlist', id: 'liked' })} onPlay={() => playQueue(liked)} />
        <QuickTile title={mix.name} color={mix.color} seed={mix.id} icon={Sparkles} onClick={() => navigate({ name: 'playlist', id: mix.id })} onPlay={() => playFromIds(mix.trackIds)} />
        {playlists.slice(0, 2).map((p) => (
          <QuickTile key={p.id} title={p.name} color={p.color} seed={p.id} icon={ListMusic} onClick={() => navigate({ name: 'playlist', id: p.id })} onPlay={() => playFromIds(p.trackIds)} />
        ))}
        {ALBUMS.slice(3, 5).map((a) => (
          <QuickTile key={a.id} title={a.title} color={a.color} seed={a.id} src={a.coverUrl} onClick={() => navigate({ name: 'album', id: a.id })} onPlay={() => playFromIds(a.trackIds)} />
        ))}
      </section>

      {recent.length > 0 && (
        <Section title="Jump back in" icon={History}>
          <Shelf>
            {recent.slice(0, 10).map((t) => (
              <MediaCard key={t.id} className={SHELF_ITEM} entity={resolveEntity('track', t.id)!} onPlay={() => playTrack(t, recent)} />
            ))}
          </Shelf>
        </Section>
      )}

      <Section title="Moods" icon={Sparkles}>
        <Shelf>
          {MOODS.map((m) => (
            <button
              key={m.mood}
              type="button"
              onClick={() => ask(m.prompt)}
              className={`${SHELF_ITEM} press relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] p-4 text-left text-white`}
              style={{ backgroundImage: meshGradient(m.mood, MOOD_COLOR) }}
            >
              <span className="absolute bottom-4 left-4 text-[22px] font-semibold tracking-[-0.03em]">{m.name}</span>
              <ArrowUpRight size={18} className="absolute right-3.5 top-3.5 opacity-70" />
            </button>
          ))}
        </Shelf>
      </Section>

      {continueItems.length > 0 && (
        <Section title="Continue listening">
          <div className="grid gap-3 md:grid-cols-2">
            {continueItems.map(({ id, secs, show, ep }) => (
              <div key={id} className="glass flex items-center gap-4 rounded-[var(--radius-lg)] p-3">
                <Artwork seed={show.id} color={show.color} className="size-16 [--art-r:14px]" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] text-fg-3">{show.title}</div>
                  <div className="truncate text-[14.5px] font-medium">{ep.title}</div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (secs / ep.durationSeconds) * 100)}%` }} />
                  </div>
                </div>
                <PlayFab onClick={() => playTrack(episodeToTrack(show, ep))} />
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Live now" icon={RadioTower} action={<SeeAll to="radio" />}>
        <Shelf>
          {STATIONS.map((s) => (
            <MediaCard key={s.id} className={SHELF_ITEM} entity={resolveEntity('station', s.id)!} badge={<LiveBadge />} onPlay={() => playTrack(s, STATIONS)} />
          ))}
        </Shelf>
      </Section>

      <Section title="On this day in music">
        <button
          type="button"
          onClick={() => navigate({ name: 'timeline', id: String(onThisDay.year) })}
          className="glass press group flex w-full items-center gap-5 overflow-hidden rounded-[var(--radius-xl)] p-5 text-left md:p-6"
        >
          <span className="text-[56px] font-extralight leading-none tracking-[-0.06em] text-fg md:text-[72px]">{onThisDay.year}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-semibold tracking-[-0.02em]">{onThisDay.headline}</span>
            <span className="mt-1 line-clamp-2 block text-[14px] text-fg-2">{onThisDay.events[0]}</span>
          </span>
          <ArrowUpRight className="shrink-0 text-fg-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </Section>

      <Section title="New releases" action={<SeeAll to="albums" />}>
        <Shelf>
          {[...ALBUMS]
            .sort((a, b) => b.year - a.year)
            .map((a) => (
              <MediaCard key={a.id} className={SHELF_ITEM} entity={resolveEntity('album', a.id)!} onPlay={() => playFromIds(a.trackIds)} />
            ))}
        </Shelf>
      </Section>
    </div>
  );
}

export function SeeAll({ to }: { to: Parameters<typeof navigate>[0]['name'] }) {
  return (
    <button type="button" onClick={() => navigate({ name: to })} aria-label="See all" className="press flex size-8 items-center justify-center rounded-full text-fg-3 hover:bg-surface-2 hover:text-fg">
      <ArrowUpRight size={18} strokeWidth={1.75} />
    </button>
  );
}
