import { Maximize2, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useStore } from '../../lib/store';
import { playerStore, next, prev, togglePlay } from '../../state/player';
import { setMode } from '../../state/ui';
import { Artwork } from '../ui/Artwork';
import { IconButton } from '../ui/IconButton';
import { Visualizer } from '../ui/Visualizer';
import { useProgress } from '../shell/Scrubber';

/** Micro — a floating capsule for a small always-on-top window. */
export function MicroPlayer() {
  const track = useStore(playerStore, (s) => s.track);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const progress = useProgress();
  if (!track) return null;
  return (
    <div className="anim-fade fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onDoubleClick={() => setMode('Full')}
        className="glass-strong anim-pop relative flex w-full max-w-[420px] items-center gap-3 overflow-hidden rounded-[28px] p-2.5 pr-3"
      >
        <Visualizer bars={32} className="pointer-events-none absolute inset-0 size-full opacity-[0.12]" />
        <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} className="size-14 [--art-r:18px]" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold">{track.title}</div>
          <div className="truncate text-[12.5px] text-fg-3">{track.artist}</div>
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        <IconButton icon={SkipBack} label="Previous" size="sm" onClick={prev} className="[&_svg]:fill-current" />
        <IconButton icon={isPlaying ? Pause : Play} label={isPlaying ? 'Pause' : 'Play'} variant="solid" onClick={togglePlay} className="[&_svg]:fill-current" />
        <IconButton icon={SkipForward} label="Next" size="sm" onClick={() => next()} className="[&_svg]:fill-current" />
        <IconButton icon={Maximize2} label="Expand" size="sm" onClick={() => setMode('Full')} />
      </div>
    </div>
  );
}

/** Nano — a single orb with a progress ring. Double-click to expand. */
export function NanoPlayer() {
  const track = useStore(playerStore, (s) => s.track);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const progress = useProgress();
  if (!track) return null;
  const R = 76;
  const C = 2 * Math.PI * R;
  return (
    <div className="anim-fade fixed inset-0 z-50 flex flex-col items-center justify-center gap-5">
      <div className="anim-pop group relative size-[168px]" onDoubleClick={() => setMode('Full')}>
        <svg viewBox="0 0 168 168" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="84" cy="84" r={R} fill="none" stroke="var(--surface-3)" strokeWidth="3" />
          <circle
            cx="84"
            cy="84"
            r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-300"
          />
        </svg>
        <div className="absolute inset-[12px] rounded-full shadow-[0_24px_60px_-18px_var(--accent)]">
          <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} shape="circle" className={`size-full ${isPlaying ? 'anim-spin-slow' : ''}`} />
        </div>
        <button
          type="button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={togglePlay}
          className="absolute inset-[12px] flex items-center justify-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          {isPlaying ? <Pause size={34} className="fill-current" /> : <Play size={34} className="ml-1 fill-current" />}
        </button>
      </div>
      <IconButton icon={Maximize2} label="Expand" variant="glass" onClick={() => setMode('Full')} />
    </div>
  );
}
