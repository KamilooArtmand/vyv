import { useState } from 'react';
import { useStore } from '../../lib/store';
import { cn, formatTime } from '../../lib/format';
import { playerStore, seek, timeStore } from '../../state/player';
import { Slider } from '../ui/Controls';
import { LiveBadge } from '../ui/Cards';

/** Seek bar. Isolated so time ticks re-render only this component. */
export function Scrubber({ className, compact, fill }: { className?: string; compact?: boolean; fill?: string }) {
  const { time, duration } = useStore(timeStore, (s) => s);
  const isRadio = useStore(playerStore, (s) => !!s.track?.isRadio);
  const [drag, setDrag] = useState<number | null>(null);
  const shown = drag ?? time;
  const commit = () => {
    if (drag === null) return;
    seek(drag);
    setDrag(null);
  };

  if (isRadio) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
          <div className="skeleton absolute inset-0 opacity-70" />
        </div>
        <LiveBadge />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 text-[11px] text-fg-3 tabular', className)}>
      {!compact && <span className="w-10 text-right">{formatTime(shown)}</span>}
      <Slider
        label="Seek"
        value={shown}
        max={duration || 1}
        step={0.1}
        fill={fill}
        onChange={(v) => setDrag(v)}
        className="flex-1 rounded-full"
        // Commit the seek on release, not on every pixel.
        onPointerUp={commit}
        onKeyUp={commit}
      />
      {!compact && <span className="w-10">{formatTime(duration)}</span>}
    </div>
  );
}

/** Hairline progress used by the mobile mini player and Nano ring. */
export function useProgress() {
  const { time, duration } = useStore(timeStore, (s) => s);
  return duration ? Math.min(1, time / duration) : 0;
}
