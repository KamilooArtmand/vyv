import { useEffect, useMemo, useRef } from 'react';
import { MicVocal } from 'lucide-react';
import { useStore } from '../../lib/store';
import { cn } from '../../lib/format';
import { playerStore, seek, timeStore } from '../../state/player';
import { LyricsService } from '../../services/lyricsService';

/** Karaoke-style synced lyrics. Tap a line to jump there. */
export function LyricsView({ className, large }: { className?: string; large?: boolean }) {
  const lyrics = useStore(playerStore, (s) => s.lyrics);
  const time = useStore(timeStore, (s) => s.time);
  const active = useMemo(() => LyricsService.getActiveLyricIndex(lyrics, time), [lyrics, time]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(`[data-i="${active}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [active]);

  if (!lyrics.length) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3 text-fg-3', className)}>
        <MicVocal size={28} strokeWidth={1.5} />
        <span className="text-sm">No lyrics</span>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn('scrollbar-none overflow-y-auto py-[35%] [mask-image:linear-gradient(transparent,#000_18%,#000_82%,transparent)]', className)}
    >
      {lyrics.map((l, i) => {
        const d = Math.abs(i - active);
        return (
          <button
            key={i}
            data-i={i}
            type="button"
            onClick={() => seek(l.time)}
            className={cn(
              'lyric-line block w-full origin-left text-left font-semibold tracking-[-0.025em]',
              large ? 'py-2.5 text-[28px] leading-[1.18] md:text-[40px]' : 'py-2 text-[20px] leading-snug',
              i === active ? 'scale-100 text-fg opacity-100' : 'scale-[0.97] text-fg opacity-30 hover:opacity-60',
            )}
            style={{ filter: i === active ? 'none' : `blur(${Math.min(d, 3) * 0.6}px)` }}
          >
            {l.text}
          </button>
        );
      })}
    </div>
  );
}
