import {
  Heart,
  ListMusic,
  Maximize2,
  MicVocal,
  PictureInPicture2,
  Circle,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { cn } from '../../lib/format';
import { cycleRepeat, next, playerStore, prev, setVolume, toggleMute, togglePlay, toggleShuffle } from '../../state/player';
import { toggleFavorite, useIsFavorite } from '../../state/library';
import { navigate, setMode, togglePanel, uiStore } from '../../state/ui';
import { IconButton } from '../ui/IconButton';
import { Slider } from '../ui/Controls';
import { Artwork } from '../ui/Artwork';
import { Visualizer } from '../ui/Visualizer';
import { Scrubber, useProgress } from './Scrubber';

export function TransportButtons({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const big = size === 'lg';
  return (
    <div className={cn('flex items-center', big ? 'gap-5' : 'gap-2')}>
      <IconButton icon={SkipBack} label="Previous" size={big ? 'lg' : 'md'} onClick={prev} className="[&_svg]:fill-current" />
      <IconButton
        icon={isPlaying ? Pause : Play}
        label={isPlaying ? 'Pause' : 'Play'}
        size={big ? 'xl' : 'lg'}
        variant="solid"
        onClick={togglePlay}
        className={cn('[&_svg]:fill-current', !isPlaying && '[&_svg]:ml-0.5')}
      />
      <IconButton icon={SkipForward} label="Next" size={big ? 'lg' : 'md'} onClick={() => next()} className="[&_svg]:fill-current" />
    </div>
  );
}

export function ShuffleRepeat({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const shuffle = useStore(playerStore, (s) => s.shuffle);
  const repeat = useStore(playerStore, (s) => s.repeat);
  return (
    <>
      <IconButton icon={Shuffle} label="Shuffle" size={size} active={shuffle} onClick={toggleShuffle} />
      <IconButton icon={repeat === 'one' ? Repeat1 : Repeat} label={`Repeat ${repeat}`} size={size} active={repeat !== 'off'} onClick={cycleRepeat} />
    </>
  );
}

export function VolumeControl({ className }: { className?: string }) {
  const volume = useStore(playerStore, (s) => s.volume);
  const muted = useStore(playerStore, (s) => s.muted);
  const v = muted ? 0 : volume;
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <IconButton icon={v === 0 ? VolumeX : v < 0.5 ? Volume1 : Volume2} label={muted ? 'Unmute' : 'Mute'} size="sm" onClick={toggleMute} />
      <Slider label="Volume" value={v} onChange={setVolume} className="w-24" />
    </div>
  );
}

function NowPlayingMeta() {
  const track = useStore(playerStore, (s) => s.track);
  const fav = useIsFavorite(track?.id);
  if (!track) return <div className="flex-1" />;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" aria-label="Open now playing" onClick={() => setMode('Cover')} className="press group/art relative shrink-0">
        <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} shape="circle" className="size-13 shadow-[var(--shadow-1)] ring-2 ring-white/10" />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover/art:opacity-100">
          <Maximize2 size={16} />
        </span>
      </button>
      <div className="min-w-0">
        <button type="button" onClick={() => setMode('Cover')} className="block max-w-full truncate text-left text-[14px] font-medium tracking-[-0.01em] hover:underline">
          {track.title}
        </button>
        <button
          type="button"
          onClick={() => track.artistId && navigate({ name: 'artist', id: track.artistId })}
          className="block max-w-full truncate text-left text-[12.5px] text-fg-3 hover:text-fg-2"
        >
          {track.artist}
        </button>
      </div>
      {!track.isRadio && (
        <IconButton icon={Heart} label={fav ? 'Unlike' : 'Like'} size="sm" active={fav} filled={fav} onClick={() => toggleFavorite(track.id)} />
      )}
    </div>
  );
}

/** Floating desktop player capsule — 100% fully rounded pill with semicircular ends. */
export function PlayerDock() {
  const panel = useStore(uiStore, (s) => s.panel);
  const hasLyrics = useStore(playerStore, (s) => s.lyrics.length > 0);

  return (
    <div className="glass anim-rise pointer-events-auto relative grid h-[var(--dock-h)] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 overflow-hidden rounded-full border border-line-2 px-4 pr-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <Visualizer bars={48} className="pointer-events-none absolute inset-x-8 bottom-0 h-9 w-[calc(100%-4rem)] opacity-[0.25]" />
      <NowPlayingMeta />
      <div className="flex w-[min(44vw,520px)] flex-col items-center gap-0.5">
        <div className="flex items-center gap-2">
          <ShuffleRepeat />
          <div className="mx-1">
            <TransportButtons />
          </div>
          <span className="w-16" aria-hidden />
        </div>
        <Scrubber className="w-full -mt-1" />
      </div>
      <div className="flex items-center justify-end gap-1">
        <IconButton icon={MicVocal} label="Lyrics" size="sm" active={panel === 'lyrics'} disabled={!hasLyrics} onClick={() => togglePanel('lyrics')} />
        <IconButton icon={ListMusic} label="Queue" size="sm" active={panel === 'queue'} onClick={() => togglePanel('queue')} />
        <IconButton icon={Sparkles} label="Agent" size="sm" active={panel === 'agent'} onClick={() => togglePanel('agent')} className="max-xl:hidden" />
        <VolumeControl className="ml-1 max-xl:[&>input]:hidden" />
        <span className="mx-1 h-5 w-px bg-line-2" />
        <IconButton icon={PictureInPicture2} label="Micro" size="sm" onClick={() => setMode('Micro')} />
        <IconButton icon={Circle} label="Nano" size="sm" onClick={() => setMode('Nano')} />
        <IconButton icon={Maximize2} label="Full screen" size="sm" onClick={() => setMode('Cover')} />
      </div>
    </div>
  );
}

/** Compact mini player for phones: sits above the tab bar — fully rounded pill. */
export function MiniPlayer() {
  const track = useStore(playerStore, (s) => s.track);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const progress = useProgress();
  if (!track) return null;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setMode('Cover')}
      className="glass anim-rise relative flex h-16 items-center gap-3 overflow-hidden rounded-full border border-line-2 pl-2.5 pr-3 shadow-[0_16px_36px_rgba(0,0,0,0.4)]"
    >
      <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} shape="circle" className="size-12 ring-2 ring-white/10 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium">{track.title}</div>
        <div className="truncate text-[12.5px] text-fg-3">{track.artist}</div>
      </div>
      <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-0.5">
        <IconButton icon={isPlaying ? Pause : Play} label={isPlaying ? 'Pause' : 'Play'} tip={false} className="[&_svg]:fill-current text-fg" onClick={togglePlay} />
        <IconButton icon={SkipForward} label="Next" tip={false} className="[&_svg]:fill-current text-fg" onClick={() => next()} />
      </div>
      <div className="absolute inset-x-6 bottom-0 h-[2.5px] overflow-hidden rounded-full bg-surface-3">
        <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
