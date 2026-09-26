import { useState } from 'react';
import { Check, Pause, Play, Podcast } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn, formatDuration } from '../lib/format';
import { SHOWS, episodeToTrack, showById } from '../data/catalog';
import { libraryStore } from '../state/library';
import { playTrack, playerStore, togglePlay } from '../state/player';
import { navigate } from '../state/ui';
import { Artwork, meshGradient } from '../components/ui/Artwork';
import { Chip } from '../components/ui/Controls';
import { MediaCard } from '../components/ui/Cards';
import { EmptyState, Grid, PageHeader, Section } from '../components/ui/Layout';
import { CollectionHeader } from '../components/ui/Collection';
import type { Show } from '../types';

export default function Podcasts() {
  const [cat, setCat] = useState('All');
  const cats = ['All', ...new Set(SHOWS.map((s) => s.category))];
  const featured = SHOWS[0];
  const shows = SHOWS.filter((s) => cat === 'All' || s.category === cat);

  return (
    <div>
      <PageHeader title="Podcasts" />
      <button
        type="button"
        onClick={() => navigate({ name: 'show', id: featured.id })}
        className="anim-rise press relative mb-9 flex w-full flex-col justify-end overflow-hidden rounded-[var(--radius-2xl)] p-6 text-left text-white md:aspect-[3/1] md:p-8"
        style={{ backgroundImage: meshGradient(featured.id, featured.color) }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.5),transparent)]" />
        <div className="relative mt-24 md:mt-0">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">New episode</div>
          <div className="text-[28px] font-semibold tracking-[-0.035em] md:text-[40px]">{featured.title}</div>
          <div className="mt-1 max-w-lg text-[14px] text-white/75">{featured.episodes[0].title} — {featured.episodes[0].summary}</div>
        </div>
      </button>

      <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {cats.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <Grid>
        {shows.map((s) => (
          <MediaCard key={s.id} entity={{ kind: 'show', id: s.id, title: s.title, subtitle: s.host, color: s.color, glyph: Podcast, route: { name: 'show', id: s.id } }} onPlay={() => playTrack(episodeToTrack(s, s.episodes[0]))} />
        ))}
      </Grid>
    </div>
  );
}

function EpisodeRow({ show, ep }: { show: Show; ep: Show['episodes'][number] }) {
  const isCurrent = useStore(playerStore, (s) => s.track?.id === ep.id);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying && s.track?.id === ep.id);
  const pos = useStore(libraryStore, (s) => s.progress[ep.id] ?? 0);
  const pct = Math.min(1, pos / ep.durationSeconds);
  const done = pct > 0.95;
  return (
    <div className="cv-auto flex gap-4 border-b border-line py-5 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-fg-3">{new Date(ep.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
        <div className={cn('mt-0.5 text-[16px] font-semibold tracking-[-0.015em]', isCurrent && 'text-accent-ink')}>{ep.title}</div>
        <p className="mt-1 line-clamp-2 text-[14px] text-fg-2">{ep.summary}</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (isCurrent ? togglePlay() : playTrack(episodeToTrack(show, ep), show.episodes.map((e) => episodeToTrack(show, e))))}
            className="press flex h-8 items-center gap-1.5 rounded-full bg-surface-2 pl-2.5 pr-3.5 text-[12.5px] font-semibold hover:bg-surface-3"
          >
            {isPlaying ? <Pause size={13} className="fill-current" /> : done ? <Check size={13} /> : <Play size={13} className="fill-current" />}
            {pct > 0 && !done ? `${formatDuration(ep.durationSeconds - pos)} left` : formatDuration(ep.durationSeconds)}
          </button>
          {pct > 0 && !done && (
            <div className="h-1 w-24 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct * 100}%` }} />
            </div>
          )}
        </div>
      </div>
      <Artwork seed={ep.id} color={show.color} className="hidden size-20 [--art-r:14px] sm:block" />
    </div>
  );
}

export function ShowView({ id }: { id?: string }) {
  const show = showById(id);
  if (!show) return <EmptyState icon={Podcast} title="Show not found" />;
  return (
    <div>
      <CollectionHeader
        kind="show"
        id={show.id}
        eyebrow={`Podcast · ${show.category}`}
        title={show.title}
        color={show.color}
        glyph={Podcast}
        meta={
          <>
            <span className="block">{show.about}</span>
            <span className="text-fg-3">Hosted by {show.host}</span>
          </>
        }
        tracks={show.episodes.map((e) => episodeToTrack(show, e))}
      />
      <Section title="Episodes">
        <div className="max-w-3xl">
          {show.episodes.map((ep) => (
            <EpisodeRow key={ep.id} show={show} ep={ep} />
          ))}
        </div>
      </Section>
    </div>
  );
}
