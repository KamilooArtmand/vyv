// ─────────────────────────────────────────────────────────────
// ui-live.tsx: Building blocks for live-source results
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, type ReactNode } from 'react';
import { Bookmark, Clapperboard, ExternalLink, Loader2, Pause, Play, WifiOff } from 'lucide-react';
import { useStore } from '../core/core-store';
import { openExternal } from '../core/core-desktop';
import { cn, hash } from '../core/core-utils';
import type { SourceId, Track } from '../core/core-types';
import { remember, rememberShow, toggleBookmark, useIsBookmarked } from '../state/state-catalog';
import { playQueue, playTrack, playerStore, togglePlay } from '../state/state-player';
import { navigate, toast } from '../state/state-ui';
import { Archive, SOURCE_META, type ArchiveItem, type RemoteShow } from '../services/sources';
import { Artwork, IconButton, MediaCard, Visualizer } from './ui-components';
import { SpecularSurface } from '../components/primitives/specular-surface';

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

function getStationTelemetry(s: Track) {
  const h = hash(s.id);
  const freqNum = (87.5 + (h % 205) / 10).toFixed(1);
  const freq = h % 4 === 0 ? `${freqNum} MHz FM` : h % 4 === 1 ? `${freqNum} MHz` : h % 4 === 2 ? 'DAB+ Digital' : 'Web Stream';
  const bitrates = ['128 kbps MP3', '256 kbps AAC', '320 kbps HQ', '96 kbps OPUS'];
  const bitrate = bitrates[h % bitrates.length];
  return { freq, bitrate };
}

// ── Stations ─────────────────────────────────────────────────
export function LiveStationTile({ s, queue }: { s: Track; queue: Track[] }) {
  const isCurrent = useStore(playerStore, (p) => p.track?.id === s.id);
  const isPlaying = useStore(playerStore, (p) => p.isPlaying && p.track?.id === s.id);
  const saved = useIsBookmarked('station', s.id);
  const play = () => (isCurrent ? togglePlay() : playTrack(s, queue));
  const { freq, bitrate } = getStationTelemetry(s);

  return (
    <SpecularSurface
      role="button"
      tabIndex={0}
      onClick={play}
      onKeyDown={(e) => e.key === 'Enter' && play()}
      className={cn(
        'press group relative flex cursor-pointer items-center gap-3.5 rounded-2xl bg-surface/50 p-2.5 pr-3 hover:bg-surface-2/70 border border-hairline shadow-ambient-xs hover:border-hairline-strong transition-all duration-200 outline-none',
        isCurrent && 'ring-1 ring-accent'
      )}
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-hairline-subtle relative bg-surface-2">
        <Artwork seed={s.id} color={s.dominantColorHex} src={s.coverUrl} className="size-full rounded-xl object-cover">
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
            {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="ml-0.5 fill-current" />}
          </span>
        </Artwork>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          {/* Concentric Live Badge Pulse Animation */}
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-live" />
          </span>
          <span className="text-[10.5px] font-mono tabular-nums text-live font-semibold uppercase tracking-wider">
            {freq}
          </span>
          <span className="text-[10px] font-mono tabular-nums text-fg-3/70 ml-auto hidden sm:inline">
            {bitrate}
          </span>
        </div>

        <div className="truncate text-[14.5px] font-semibold tracking-[-0.015em] text-fg">{s.title}</div>
        <div className="truncate text-[12px] text-fg-3">{s.artist}</div>

        {isPlaying && <Visualizer bars={20} className="mt-1.5 h-3.5 w-28 text-accent" />}
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
    </SpecularSurface>
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
    <SpecularSurface
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => e.key === 'Enter' && open()}
      className={cn(
        'group/card press cursor-pointer outline-none rounded-2xl p-2 bg-surface/50 hover:bg-surface-2/70 border border-hairline shadow-ambient-xs hover:border-hairline-strong transition-all duration-200',
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-hairline-subtle">
        <Artwork
          seed={item.id}
          color="#a2a8b2"
          src={item.thumb}
          glyph={item.mediatype === 'movies' ? Clapperboard : undefined}
          className="size-full rounded-xl transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover/card:scale-[1.03]"
        >
          <span className={cn('absolute bottom-2.5 right-2.5 flex size-10 items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_8px_20px_-6px_var(--accent)] transition-opacity', busy ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100')}>
            {busy ? <Loader2 size={17} className="animate-spin" /> : <Play size={16} className="ml-0.5 fill-current" />}
          </span>
        </Artwork>
      </div>
      <div className="mt-2.5 min-w-0 px-0.5 pb-0.5">
        <div className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-[-0.015em] text-fg">{item.title}</div>
        <div className="truncate text-[12.5px] text-fg-3">
          {item.creator}
          {item.year ? ` · ${item.year}` : ''}
        </div>
      </div>
    </SpecularSurface>
  );
}

// ── Video ────────────────────────────────────────────────────
export function VideoCard({ video, className }: { video: Track; className?: string }) {
  return (
    <SpecularSurface
      role="link"
      tabIndex={0}
      onClick={() => {
        remember(video);
        navigate({ name: 'video', id: video.id });
      }}
      onKeyDown={(e) => e.key === 'Enter' && (remember(video), navigate({ name: 'video', id: video.id }))}
      className={cn(
        'group/card press cursor-pointer outline-none rounded-2xl p-2 bg-surface/50 hover:bg-surface-2/70 border border-hairline shadow-ambient-xs hover:border-hairline-strong transition-all duration-200',
        className
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-hairline-subtle">
        <Artwork
          seed={video.id}
          color={video.dominantColorHex}
          src={video.coverUrl}
          glyph={Clapperboard}
          className="size-full rounded-xl transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover/card:scale-[1.03]"
        >
          <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white opacity-0 transition-opacity group-hover/card:opacity-100">
            <Play size={28} className="ml-0.5 fill-current" />
          </span>
        </Artwork>
      </div>
      <div className="mt-2.5 min-w-0 px-0.5 pb-0.5">
        <div className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-[-0.015em] text-fg">{video.title}</div>
        <div className="truncate text-[12.5px] text-fg-3">{video.artist}</div>
      </div>
    </SpecularSurface>
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
