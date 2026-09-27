// ─────────────────────────────────────────────────────────────
// ui-live.tsx: Building blocks for live-source results
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, type ReactNode } from 'react';
import { Bookmark, Clapperboard, ExternalLink, Loader2, Pause, Play, WifiOff } from 'lucide-react';
import { useStore } from '../core/core-store';
import { openExternal } from '../core/core-desktop';
import { cn } from '../core/core-utils';
import type { SourceId, Track } from '../core/core-types';
import { remember, rememberShow, toggleBookmark, useIsBookmarked } from '../state/state-catalog';
import { playQueue, playTrack, playerStore, togglePlay } from '../state/state-player';
import { navigate, toast } from '../state/state-ui';
import { Archive, SOURCE_META, type ArchiveItem, type RemoteShow } from '../services/sources';
import { Artwork, IconButton, MediaCard, Visualizer } from './ui-components';

/** Fetch-on-mount with loading / error state; re-runs when `key` changes. */
export function useLive<T>(key: string | null, load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<{ key: string | null; data?: T; error?: string; loading: boolean }>({ key: null, loading: !!key });
  useEffect(() => {
    if (!key) {
      setState({ key, loading: false });
      return;
    }
    const ctrl = new AbortController();
    setState((s) => ({ key, loading: true, data: s.key === key ? s.data : undefined }));
    load(ctrl.signal)
      .then((data) => !ctrl.signal.aborted && setState({ key, data, loading: false }))
      .catch((e: Error) => !ctrl.signal.aborted && setState({ key, error: e.message || 'Unavailable', loading: false }));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}

export function SourceTag({ source, className }: { source?: SourceId; className?: string }) {
  if (!source || source === 'vyv' || source === 'local') return null;
  return (
    <span className={cn('inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-[10.5px] font-medium tracking-wide text-fg-3', className)}>
      {SOURCE_META[source].name}
    </span>
  );
}

/** Loading, error and empty states for a live block. */
export function LiveState({ loading, error, empty, children, rows = 1 }: { loading: boolean; error?: string; empty?: boolean; children: ReactNode; rows?: number }) {
  if (loading && empty)
    return (
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: rows * 3 }).map((_, i) => (
          <div key={i} className="skeleton h-[72px] rounded-[var(--radius-xl)]" />
        ))}
      </div>
    );
  if (error && empty)
    return (
      <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] bg-surface px-4 py-3 text-[13px] text-fg-3">
        <WifiOff size={16} /> {error}
      </div>
    );
  if (empty) return <div className="px-1 text-[13px] text-fg-3">Nothing found.</div>;
  return <>{children}</>;
}

// ── Stations ─────────────────────────────────────────────────
export function LiveStationTile({ s, queue }: { s: Track; queue: Track[] }) {
  const isCurrent = useStore(playerStore, (p) => p.track?.id === s.id);
  const isPlaying = useStore(playerStore, (p) => p.isPlaying && p.track?.id === s.id);
  const saved = useIsBookmarked('station', s.id);
  const play = () => (isCurrent ? togglePlay() : playTrack(s, queue));
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={play}
      onKeyDown={(e) => e.key === 'Enter' && play()}
      className={cn('press group relative flex cursor-pointer items-center gap-3.5 rounded-[var(--radius-xl)] bg-surface p-2.5 pr-3 hover:bg-surface-2', isCurrent && 'ring-1 ring-fg/30')}
    >
      <Artwork seed={s.id} color={s.dominantColorHex} src={s.coverUrl} className="size-14 bg-white [--art-r:14px]">
        <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white opacity-0 transition-opacity group-hover:opacity-100">
          {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="ml-0.5 fill-current" />}
        </span>
      </Artwork>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold tracking-[-0.015em]">{s.title}</div>
        <div className="truncate text-[12.5px] text-fg-3">{s.artist}</div>
        {isPlaying && <Visualizer bars={18} className="mt-1.5 h-3 w-24" />}
      </div>
      <IconButton
        icon={Bookmark}
        label={saved ? 'Saved' : 'Save station'}
        size="sm"
        variant="bare"
        active={saved}
        filled={saved}
        onClick={(e) => {
          e.stopPropagation();
          toast(toggleBookmark('station', s.id, s) ? 'Station saved' : 'Removed', 'bookmark');
        }}
      />
    </div>
  );
}

export function StationGrid({ stations }: { stations: Track[] }) {
  return (
    <div className="grid gap-2.5 md:grid-cols-2 2xl:grid-cols-3">
      {stations.map((s) => (
        <LiveStationTile key={s.id} s={s} queue={stations} />
      ))}
    </div>
  );
}

// ── Podcasts ─────────────────────────────────────────────────
export function ShowCard({ show, className }: { show: RemoteShow; className?: string }) {
  return (
    <div onClickCapture={() => rememberShow(show)} className={className}>
      <MediaCard entity={{ kind: 'show', id: show.id, title: show.title, subtitle: show.host, color: show.color, src: show.artwork, route: { name: 'show', id: show.id } }} />
    </div>
  );
}

// ── Internet Archive ─────────────────────────────────────────
export function ArchiveCard({ item, className }: { item: ArchiveItem; className?: string }) {
  const [busy, setBusy] = useState(false);
  const open = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const tracks = await Archive.tracks(item);
      if (!tracks.length) return toast('No playable files in this item');
      if (item.mediatype === 'movies') {
        remember(tracks[0]);
        navigate({ name: 'video', id: tracks[0].id });
      } else {
        tracks.forEach(remember);
        playQueue(tracks);
      }
    } catch {
      toast('Internet Archive is not responding');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div role="button" tabIndex={0} onClick={open} onKeyDown={(e) => e.key === 'Enter' && open()} className={cn('group/card press cursor-pointer', className)}>
      <Artwork seed={item.id} color="#a2a8b2" src={item.thumb} glyph={item.mediatype === 'movies' ? Clapperboard : undefined} className="aspect-square w-full shadow-[var(--shadow-1)]">
        <span className={cn('absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-fg text-bg shadow-lg transition-opacity', busy ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100')}>
          {busy ? <Loader2 size={17} className="animate-spin" /> : <Play size={16} className="ml-0.5 fill-current" />}
        </span>
      </Artwork>
      <div className="mt-3 min-w-0">
        <div className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-[-0.015em]">{item.title}</div>
        <div className="truncate text-[12.5px] text-fg-3">
          {item.creator}
          {item.year ? ` · ${item.year}` : ''}
        </div>
      </div>
    </div>
  );
}

// ── Video ────────────────────────────────────────────────────
export function VideoCard({ video, className }: { video: Track; className?: string }) {
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => {
        remember(video);
        navigate({ name: 'video', id: video.id });
      }}
      onKeyDown={(e) => e.key === 'Enter' && (remember(video), navigate({ name: 'video', id: video.id }))}
      className={cn('group/card press cursor-pointer', className)}
    >
      <Artwork seed={video.id} color={video.dominantColorHex} src={video.coverUrl} glyph={Clapperboard} className="aspect-video w-full shadow-[var(--shadow-1)] [--art-r:18px]">
        <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white opacity-0 transition-opacity group-hover/card:opacity-100">
          <Play size={30} className="ml-1 fill-current" />
        </span>
      </Artwork>
      <div className="mt-2.5 min-w-0">
        <div className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-[-0.015em]">{video.title}</div>
        <div className="truncate text-[12.5px] text-fg-3">{video.artist}</div>
      </div>
    </div>
  );
}

export function OpenSource({ track }: { track: Track }) {
  if (!track.pageUrl || !track.source || track.source === 'vyv') return null;
  return (
    <button type="button" onClick={() => openExternal(track.pageUrl!)} className="press inline-flex items-center gap-1.5 text-[12.5px] font-medium text-fg-3 hover:text-fg">
      <ExternalLink size={13} /> Open on {SOURCE_META[track.source as keyof typeof SOURCE_META]?.name ?? 'source'}
    </button>
  );
}
