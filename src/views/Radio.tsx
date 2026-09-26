import { Bookmark, Pause, Play, RadioTower, Sparkles } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/format';
import { STATIONS, genreById } from '../data/catalog';
import { playTrack, playerStore, togglePlay } from '../state/player';
import { toggleBookmark, useIsBookmarked } from '../state/library';
import { toast } from '../state/ui';
import { ask } from '../state/agent';
import { Artwork } from '../components/ui/Artwork';
import { IconButton } from '../components/ui/IconButton';
import { Chip } from '../components/ui/Controls';
import { LiveBadge } from '../components/ui/Cards';
import { PageHeader, Section } from '../components/ui/Layout';
import { Visualizer } from '../components/ui/Visualizer';
import type { Track } from '../types';

function StationTile({ s }: { s: Track }) {
  const isCurrent = useStore(playerStore, (p) => p.track?.id === s.id);
  const isPlaying = useStore(playerStore, (p) => p.isPlaying && p.track?.id === s.id);
  const saved = useIsBookmarked('station', s.id);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => (isCurrent ? togglePlay() : playTrack(s, STATIONS))}
      onKeyDown={(e) => e.key === 'Enter' && (isCurrent ? togglePlay() : playTrack(s, STATIONS))}
      className={cn('card press group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-[var(--radius-xl)] p-3 pr-4 hover:bg-surface-2', isCurrent && 'ring-1 ring-accent')}
    >
      <Artwork seed={s.id} color={s.dominantColorHex} src={s.coverUrl} className="size-[72px] [--art-r:16px]">
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 transition-opacity group-hover:opacity-100">
          {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="ml-0.5 fill-current" />}
        </span>
      </Artwork>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[16px] font-semibold tracking-[-0.02em]">{s.title}</div>
        <div className="truncate text-[13px] text-fg-3">
          {s.artist} · {genreById(s.genreId)?.name}
        </div>
        {isPlaying && <Visualizer bars={20} className="mt-2 h-4 w-28" />}
      </div>
      <IconButton
        icon={Bookmark}
        label={saved ? 'Saved' : 'Save'}
        size="sm"
        active={saved}
        filled={saved}
        onClick={(e) => {
          e.stopPropagation();
          toast(toggleBookmark('station', s.id) ? 'Station saved' : 'Removed', 'bookmark');
        }}
      />
    </div>
  );
}

export default function Radio() {
  const current = useStore(playerStore, (s) => (s.track?.isRadio ? s.track : null));
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const hero = current ?? STATIONS[0];

  return (
    <div>
      <PageHeader title="Radio" eyebrow={<span className="inline-flex items-center gap-2"><span className="anim-live size-1.5 rounded-full bg-live" /> {STATIONS.length} stations on air</span>} />

      <section className="anim-rise relative mb-9 overflow-hidden rounded-[var(--radius-2xl)] bg-surface p-6 md:p-8">
        <Artwork seed={hero.id} color={hero.dominantColorHex} src={hero.coverUrl} className="absolute inset-0 !rounded-none opacity-40 blur-3xl saturate-150" />
        <div className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 md:gap-8">
          <Artwork seed={hero.id} color={hero.dominantColorHex} src={hero.coverUrl} className="size-20 shadow-[var(--shadow-2)] [--art-r:18px] md:size-44 md:[--art-r:24px]" />
          <div className="min-w-0">
            <LiveBadge />
            <div className="mt-2 truncate text-[24px] font-semibold leading-none tracking-[-0.04em] md:mt-3 md:text-[44px]">{hero.title}</div>
            <div className="mt-1.5 truncate text-[14px] text-fg-2 md:text-[15px]">{hero.artist}</div>
            <Visualizer bars={40} className="mt-5 hidden h-10 w-full max-w-md md:block" />
          </div>
          <IconButton
            icon={current && isPlaying ? Pause : Play}
            label={current && isPlaying ? 'Pause' : 'Tune in'}
            size="xl"
            variant="accent"
            className="[&_svg]:fill-current max-md:!size-12"
            onClick={() => (current ? togglePlay() : playTrack(hero, STATIONS))}
          />
          <Visualizer bars={32} className="col-span-3 h-8 w-full md:hidden" />
        </div>
      </section>

      <Section title="Agent stations" icon={Sparkles}>
        <div className="flex flex-wrap gap-2">
          {['Calm', 'Focus', 'Night drive', 'Energy', 'Jazz', 'Lo-Fi'].map((m) => (
            <Chip key={m} icon={Sparkles} onClick={() => ask(`Play ${m.toLowerCase()}`)}>
              {m}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Stations" icon={RadioTower}>
        <div className="stagger grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {STATIONS.map((s) => (
            <StationTile key={s.id} s={s} />
          ))}
        </div>
      </Section>
    </div>
  );
}
