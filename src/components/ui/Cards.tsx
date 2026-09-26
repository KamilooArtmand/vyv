import { memo, type ReactNode } from 'react';
import { Heart, MoreHorizontal, Pause, Play } from 'lucide-react';
import { cn, formatTime } from '../../lib/format';
import { navigate, openSheet } from '../../state/ui';
import { playTrack, playerStore, togglePlay } from '../../state/player';
import { toggleFavorite, useIsFavorite } from '../../state/library';
import { useStore } from '../../lib/store';
import type { Entity } from '../../lib/entities';
import type { Track } from '../../types';
import { Artwork } from './Artwork';
import { EqBars } from './Visualizer';

/** Round play button that floats over artwork on hover. */
export function PlayFab({ onClick, playing, className, size = 'md' }: { onClick: () => void; playing?: boolean; className?: string; size?: 'md' | 'lg' }) {
  return (
    <button
      type="button"
      aria-label={playing ? 'Pause' : 'Play'}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'press flex items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_12px_28px_-8px_var(--accent)] hover:brightness-110',
        size === 'lg' ? 'size-14' : 'size-11',
        className,
      )}
    >
      {playing ? <Pause size={size === 'lg' ? 22 : 18} className="fill-current" /> : <Play size={size === 'lg' ? 22 : 18} className="ml-0.5 fill-current" />}
    </button>
  );
}

export const MediaCard = memo(function MediaCard({
  entity,
  onPlay,
  className,
  badge,
  footer,
}: {
  entity: Entity;
  onPlay?: () => void;
  className?: string;
  badge?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => entity.route && navigate(entity.route)}
      onKeyDown={(e) => e.key === 'Enter' && entity.route && navigate(entity.route)}
      className={cn('group/card press cursor-pointer outline-none [&:active]:scale-[0.98]', className)}
    >
      <Artwork
        seed={entity.id}
        color={entity.color}
        src={entity.src}
        glyph={entity.kind === 'book' ? undefined : entity.glyph}
        title={entity.kind === 'book' ? entity.title : undefined}
        subtitle={entity.kind === 'book' ? entity.subtitle : undefined}
        shape={entity.circle ? 'circle' : 'square'}
        className={cn('w-full shadow-[var(--shadow-1)] transition-transform duration-500 group-hover/card:-translate-y-1 [--art-r:18px]', entity.kind === 'book' ? 'aspect-[3/4]' : 'aspect-square')}
      >
        {badge && <div className="absolute left-2.5 top-2.5">{badge}</div>}
        {onPlay && (
          <PlayFab
            onClick={onPlay}
            className={cn(
              'absolute bottom-2.5 right-2.5 translate-y-2 opacity-0 transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100 max-md:hidden',
              entity.circle && 'bottom-1 right-1',
            )}
          />
        )}
      </Artwork>
      <div className={cn('mt-2.5 min-w-0 px-0.5', entity.circle && 'text-center')}>
        <div className="truncate text-[14px] font-medium tracking-[-0.01em]">{entity.title}</div>
        <div className="truncate text-[13px] text-fg-3">{entity.subtitle}</div>
        {footer}
      </div>
    </div>
  );
});

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-live px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
      <span className="anim-live size-1.5 rounded-full bg-white" />
      Live
    </span>
  );
}

// ── Track rows ───────────────────────────────────────────────
export const TrackRow = memo(function TrackRow({
  track,
  index,
  queue,
  showArt = true,
  sub,
}: {
  track: Track;
  index?: number;
  queue?: Track[];
  showArt?: boolean;
  sub?: ReactNode;
}) {
  const isCurrent = useStore(playerStore, (s) => s.track?.id === track.id);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying && s.track?.id === track.id);
  const fav = useIsFavorite(track.id);

  const play = () => (isCurrent ? togglePlay() : playTrack(track, queue));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={play}
      onKeyDown={(e) => e.key === 'Enter' && play()}
      onContextMenu={(e) => {
        e.preventDefault();
        openSheet('addto', track.id);
      }}
      className={cn(
        'cv-auto group/row relative flex h-16 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 outline-none transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 md:gap-4 md:px-3',
        isCurrent && 'bg-surface',
      )}
    >
      {index !== undefined && (
        <div className="hidden w-5 shrink-0 justify-center text-[13px] text-fg-3 tabular sm:flex">
          {isCurrent ? <EqBars playing={isPlaying} className="text-accent-ink" /> : <span className="group-hover/row:hidden">{index + 1}</span>}
          {!isCurrent && <Play size={14} className="hidden fill-current text-fg group-hover/row:block" />}
        </div>
      )}
      {showArt && (
        <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} className="size-11 [--art-r:10px]">
          {isCurrent && index === undefined && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
              <EqBars playing={isPlaying} />
            </div>
          )}
        </Artwork>
      )}
      <div className="min-w-0 flex-1">
        <div className={cn('truncate text-[14.5px] font-medium tracking-[-0.01em]', isCurrent && 'text-accent-ink')}>{track.title}</div>
        <div className="truncate text-[13px] text-fg-3">{sub ?? track.artist}</div>
      </div>
      <button
        type="button"
        aria-label={fav ? 'Unlike' : 'Like'}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(track.id);
        }}
        className={cn('press flex size-8 items-center justify-center rounded-full', fav ? 'text-accent-ink' : 'text-fg-3 opacity-0 hover:text-fg group-hover/row:opacity-100 max-md:hidden')}
      >
        <Heart size={16} strokeWidth={1.75} className={cn(fav && 'fill-current')} />
      </button>
      <span className="hidden w-11 text-right text-[13px] text-fg-3 tabular sm:block">{track.isRadio ? '' : formatTime(track.durationSeconds)}</span>
      <button
        type="button"
        aria-label="More"
        onClick={(e) => {
          e.stopPropagation();
          openSheet('addto', track.id);
        }}
        className="press flex size-8 items-center justify-center rounded-full text-fg-3 hover:bg-surface-3 hover:text-fg md:opacity-0 md:group-hover/row:opacity-100"
      >
        <MoreHorizontal size={18} strokeWidth={1.75} />
      </button>
    </div>
  );
});

export function TrackList({ tracks, numbered = true, showArt = true }: { tracks: Track[]; numbered?: boolean; showArt?: boolean }) {
  return (
    <div className="stagger -mx-2 flex flex-col md:-mx-3">
      {tracks.map((t, i) => (
        <TrackRow key={t.id} track={t} index={numbered ? i : undefined} queue={tracks} showArt={showArt} />
      ))}
    </div>
  );
}
