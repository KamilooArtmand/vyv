import { useState } from 'react';
import { ChevronDown, Disc3, Gauge, Heart, ListMusic, MicVocal, MoreHorizontal, Moon, PictureInPicture2, Rewind, FastForward, Speaker } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useMediaQuery } from '../../lib/hooks';
import { cn } from '../../lib/format';
import { playerStore, setDevice, setSleep, setSpeed, skip } from '../../state/player';
import { settingsStore } from '../../state/settings';
import { toggleFavorite, useIsFavorite } from '../../state/library';
import { navigate, openSheet, setMode } from '../../state/ui';
import { Artwork } from '../ui/Artwork';
import { IconButton } from '../ui/IconButton';
import { Segmented } from '../ui/Controls';
import { Visualizer } from '../ui/Visualizer';
import { Scrubber } from '../shell/Scrubber';
import { ShuffleRepeat, TransportButtons, VolumeControl } from '../shell/PlayerDock';
import { LyricsView } from '../shell/Lyrics';
import { QueuePanel } from '../shell/QueuePanel';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SLEEP = [null, 15, 30, 60] as const;

type Pane = 'art' | 'lyrics' | 'queue';

/** Immersive “Now Playing”: artwork-tinted, lyrics-first, distraction-free. */
export function CoverPlayer() {
  const track = useStore(playerStore, (s) => s.track);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const hasLyrics = useStore(playerStore, (s) => s.lyrics.length > 0);
  const sleepAt = useStore(playerStore, (s) => s.sleepAt);
  const devices = useStore(playerStore, (s) => s.devices);
  const speed = useStore(settingsStore, (s) => s.speed);
  const deviceId = useStore(settingsStore, (s) => s.deviceId);
  const lyricsOn = useStore(settingsStore, (s) => s.lyrics);
  const fav = useIsFavorite(track?.id);
  const [pane, setPane] = useState<Pane>('art');
  const [sleepIdx, setSleepIdx] = useState(0);
  const wide = useMediaQuery('(min-width: 1024px)');

  if (!track) return null;
  const spoken = track.kind === 'podcast' || track.kind === 'audiobook';
  const showLyricsCol = lyricsOn && hasLyrics && wide;
  // On wide screens lyrics get their own column, so the left pane is always artwork.
  const view: Pane = showLyricsCol && pane === 'lyrics' ? 'art' : pane;
  const sleepMins = sleepAt ? Math.max(1, Math.round((sleepAt - Date.now()) / 60000)) : null;

  const cycleSleep = () => {
    const n = (sleepIdx + 1) % SLEEP.length;
    setSleepIdx(n);
    setSleep(SLEEP[n]);
  };
  const cycleDevice = () => {
    if (devices.length < 2) return;
    const i = devices.findIndex((d) => d.id === deviceId);
    setDevice(devices[(i + 1) % devices.length].id);
  };

  return (
    <div className="anim-fade fixed inset-0 z-50 flex flex-col overflow-hidden bg-bg" role="dialog" aria-label="Now playing">
      {/* Backdrop: artwork, blown up and blurred into light */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} className="absolute inset-[-20%] !rounded-none opacity-80 blur-[90px] saturate-150" />
        <div className="absolute inset-0 bg-bg/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent,var(--bg)_85%)]" />
      </div>

      <header className="flex items-center justify-between gap-2 px-4 pt-[max(12px,env(safe-area-inset-top))] md:px-8 md:pt-6">
        <IconButton icon={ChevronDown} label="Close" variant="soft" tip="bottom" onClick={() => setMode('Full')} />
        <div className="min-w-0 text-center">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-fg-3">{track.isRadio ? 'Live radio' : spoken ? (track.kind === 'podcast' ? 'Podcast' : 'Audiobook') : 'Playing from'}</div>
          <button
            type="button"
            onClick={() => track.albumId && navigate({ name: 'album', id: track.albumId })}
            className="max-w-[60vw] truncate text-[13px] font-medium"
          >
            {track.album}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <IconButton icon={PictureInPicture2} label="Micro" variant="soft" tip="bottom" className="max-md:hidden" onClick={() => setMode('Micro')} />
          <IconButton icon={MoreHorizontal} label="More" variant="soft" tip="bottom" disabled={track.isRadio} onClick={() => openSheet('addto', track.id)} />
        </div>
      </header>

      <main
        className={cn(
          'mx-auto grid min-h-0 w-full max-w-6xl flex-1 items-center gap-6 px-6 md:px-10',
          showLyricsCol ? 'grid-cols-[minmax(0,440px)_minmax(0,1fr)] gap-16' : 'max-w-xl',
        )}
      >
        <div className="flex min-h-0 flex-col justify-center gap-6 md:gap-7">
          <div className="relative flex min-h-0 items-center justify-center">
            {view === 'art' && (
              <Artwork
                seed={track.id}
                color={track.dominantColorHex}
                src={track.coverUrl}
                className={cn(
                  'aspect-square w-full max-w-[min(440px,42dvh)] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.6)] transition-transform duration-700 [--art-r:28px] [transition-timing-function:var(--ease-spring)]',
                  isPlaying ? 'scale-100' : 'scale-[0.88]',
                )}
              />
            )}
            {view === 'lyrics' && <LyricsView large className="h-[42dvh] w-full" />}
            {view === 'queue' && (
              <div className="scrollbar-none h-[42dvh] w-full overflow-y-auto">
                <QueuePanel />
              </div>
            )}
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-[24px] font-semibold tracking-[-0.03em] md:text-[28px]">{track.title}</h1>
              <button type="button" onClick={() => track.artistId && navigate({ name: 'artist', id: track.artistId })} className="max-w-full truncate text-[16px] text-fg-2 hover:text-fg">
                {track.artist}
              </button>
            </div>
            {!track.isRadio && (
              <IconButton icon={Heart} label={fav ? 'Unlike' : 'Like'} active={fav} filled={fav} variant="soft" onClick={() => toggleFavorite(track.id)} />
            )}
          </div>

          <Scrubber fill="var(--fg)" />

          <div className="flex items-center justify-between">
            {spoken ? (
              <IconButton icon={Rewind} label="Back 15s" onClick={() => skip(-15)} />
            ) : (
              <ShuffleRepeat size="md" />
            )}
            <TransportButtons size="lg" />
            {spoken ? <IconButton icon={FastForward} label="Forward 30s" onClick={() => skip(30)} /> : <span className="w-[88px]" aria-hidden />}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Segmented
              iconOnly
              size="sm"
              value={view}
              onChange={setPane}
              options={[
                { value: 'art', label: 'Artwork', icon: Disc3 },
                ...(hasLyrics && lyricsOn && !showLyricsCol ? [{ value: 'lyrics' as const, label: 'Lyrics', icon: MicVocal }] : []),
                { value: 'queue', label: 'Queue', icon: ListMusic },
              ]}
            />
            <div className="ml-auto flex items-center gap-1">
              <button type="button" onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] ?? 1)} aria-label="Playback speed" data-tip="Speed" className={cn('press flex h-8 min-w-8 items-center justify-center gap-1 rounded-full px-2 text-[12px] font-semibold tabular hover:bg-surface-2', speed !== 1 ? 'text-accent-ink' : 'text-fg-2')}>
                <Gauge size={15} strokeWidth={1.75} />
                {speed !== 1 && `${speed}×`}
              </button>
              <button type="button" onClick={cycleSleep} aria-label="Sleep timer" data-tip="Sleep timer" className={cn('press flex h-8 min-w-8 items-center justify-center gap-1 rounded-full px-2 text-[12px] font-semibold tabular hover:bg-surface-2', sleepMins ? 'text-accent-ink' : 'text-fg-2')}>
                <Moon size={15} strokeWidth={1.75} />
                {sleepMins && `${sleepMins}m`}
              </button>
              <IconButton icon={Speaker} label={devices.find((d) => d.id === deviceId)?.name ?? 'Output'} size="sm" onClick={cycleDevice} />
              <VolumeControl className="max-sm:hidden" />
            </div>
          </div>
        </div>

        {showLyricsCol && (
          <div className="flex h-full min-h-0 flex-col">
            <LyricsView large className="min-h-0 flex-1" />
          </div>
        )}
      </main>

      <Visualizer bars={64} mirror className="pointer-events-none h-16 w-full opacity-30 md:h-20" color="var(--fg)" />
    </div>
  );
}
