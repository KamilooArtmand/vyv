// ─────────────────────────────────────────────────────────────
// ui-shell.tsx: TopBar, Sidebar, PlayerDock, Modals & Toast
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  Bell,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  History,
  House,
  LayoutGrid,
  Library,
  ListMusic,
  Maximize2,
  MicVocal,
  Moon,
  Pause,
  Play,
  Radio,
  Repeat,
  Repeat1,
  ScrollText,
  Search,
  Settings2,
  Shapes,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Sun,
  UserRound,
  Volume2,
  VolumeX,
  Disc,
  Mic,
  Podcast,
  BookOpen,
  PictureInPicture2,
  Circle,
} from 'lucide-react';
import { useStore } from '../core/core-store';
import { cn, formatTime } from '../core/core-utils';
import type { RouteName } from '../core/core-types';
import {
  applyTheme,
  authStore,
  cyclePlayerMode,
  goBack,
  goForward,
  navigate,
  openSheet,
  resolveTheme,
  setMode,
  settingsStore,
  togglePanel,
  uiStore,
} from '../state/state-ui';
import {
  cycleRepeat,
  next,
  playerStore,
  prev,
  seek,
  setVolume,
  timeStore,
  toggleMute,
  togglePlay,
  toggleShuffle,
} from '../state/state-player';
import { toggleFavorite, useIsFavorite, useUnreadCount } from '../state/state-catalog';
import { Artwork, IconButton, LiveBadge, LogoMark, Slider, Wordmark } from './ui-components';

// ── Navigation Structure ─────────────────────────────────────
export interface NavItem {
  name: RouteName;
  label: string;
  icon: typeof House;
}

export const NAV_GROUPS: NavItem[][] = [
  [
    { name: 'home', label: 'Home', icon: House },
    { name: 'search', label: 'Search', icon: Search },
    { name: 'library', label: 'Library', icon: Library },
    { name: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ],
  [
    { name: 'radio', label: 'Radio', icon: Radio },
    { name: 'podcasts', label: 'Podcasts', icon: Podcast },
    { name: 'audiobooks', label: 'Audiobooks', icon: BookOpen },
  ],
  [
    { name: 'albums', label: 'Albums', icon: Disc },
    { name: 'artists', label: 'Artists', icon: Mic },
    { name: 'genres', label: 'Genres', icon: Shapes },
  ],
  [
    { name: 'wiki', label: 'Wiki', icon: ScrollText },
    { name: 'timeline', label: 'Timeline', icon: History },
  ],
];

// ── TopBar ───────────────────────────────────────────────────
export function TopBar({ onAgent }: { onAgent?: () => void }) {
  const user = useStore(authStore, (s) => s.user);
  const unread = useUnreadCount();
  const pref = useStore(settingsStore, (s) => s.theme);
  const dark = resolveTheme(pref) === 'dark';

  return (
    <header className="glass sticky top-0 z-30 flex h-[var(--header-h)] items-center px-4 md:px-8">
      <button type="button" onClick={cyclePlayerMode} className="press flex items-center gap-2 md:hidden">
        <LogoMark className="size-8" />
        <Wordmark />
      </button>

      <div className="hidden items-center gap-1 md:flex">
        <IconButton icon={ChevronLeft} label="Back" size="sm" variant="soft" onClick={goBack} />
        <IconButton icon={ChevronRight} label="Forward" size="sm" variant="soft" onClick={goForward} />
      </div>

      <button
        type="button"
        onClick={onAgent}
        className="press group ml-2 hidden h-10 max-w-md flex-1 items-center gap-2.5 rounded-full bg-surface-2 pl-3.5 pr-2 text-left text-[14px] text-fg-3 hover:bg-surface-3 md:flex"
      >
        <Sparkles size={16} className="text-accent-ink" />
        <span className="flex-1 truncate">Ask vyv anything…</span>
        <kbd className="rounded-md border border-line-2 px-1.5 py-0.5 text-[11px] text-fg-3">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <IconButton
          icon={dark ? Sun : Moon}
          label={dark ? 'Light mode' : 'Dark mode'}
          size="md"
          onClick={() => {
            const nextTheme = dark ? 'light' : 'dark';
            settingsStore.set({ theme: nextTheme });
            applyTheme(nextTheme);
          }}
        />
        <IconButton icon={Bell} label="Inbox" size="md" badge={unread} onClick={() => navigate({ name: 'notifications' })} />
        <button type="button" onClick={() => navigate({ name: 'profile' })} className="press ml-1">
          {user ? (
            <img src={user.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-surface-2 text-fg-2">
              <UserRound size={16} />
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

// ── Sidebar Rail ─────────────────────────────────────────────
export function Sidebar() {
  const route = useStore(uiStore, (s) => s.route.name);
  const panel = useStore(uiStore, (s) => s.panel);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);

  return (
    <nav aria-label="Primary" className="scrollbar-none relative z-30 flex h-full w-[76px] shrink-0 flex-col items-center gap-1 overflow-y-auto py-4">
      <button type="button" onClick={cyclePlayerMode} className="press group relative mb-3">
        <LogoMark className="size-9" animated={isPlaying} />
      </button>

      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} className="flex flex-col items-center gap-1">
          {gi > 0 && <span className="my-2 h-px w-6 bg-line-2" />}
          {group.map((item) => {
            const on = route === item.name;
            return (
              <IconButton
                key={item.name}
                icon={item.icon}
                label={item.label}
                tip="right"
                className={cn('!rounded-[14px]', on && '!bg-surface-2 !text-fg')}
                onClick={() => navigate({ name: item.name })}
              />
            );
          })}
        </div>
      ))}

      <div className="mt-auto flex flex-col items-center gap-1 pt-4">
        <IconButton icon={Sparkles} label="Agent" tip="right" active={panel === 'agent'} onClick={() => togglePanel('agent')} />
        <IconButton icon={Settings2} label="Settings" tip="right" onClick={() => navigate({ name: 'settings' })} />
      </div>
    </nav>
  );
}

// ── Bottom Mobile Bar ────────────────────────────────────────
export function BottomNav({ onAgent }: { onAgent?: () => void }) {
  const route = useStore(uiStore, (s) => s.route.name);
  return (
    <nav aria-label="Tabs" className="glass flex h-[var(--nav-h)] items-stretch rounded-full border border-line-2 px-3 shadow-lg">
      <button type="button" onClick={() => navigate({ name: 'home' })} className="press flex flex-1 flex-col items-center justify-center">
        <House size={22} className={route === 'home' ? 'text-fg' : 'text-fg-3'} />
      </button>
      <button type="button" onClick={() => navigate({ name: 'search' })} className="press flex flex-1 flex-col items-center justify-center">
        <Search size={22} className={route === 'search' ? 'text-fg' : 'text-fg-3'} />
      </button>
      <button type="button" onClick={onAgent} className="press flex flex-1 items-center justify-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-fg text-bg shadow-md">
          <Sparkles size={20} />
        </span>
      </button>
      <button type="button" onClick={() => navigate({ name: 'library' })} className="press flex flex-1 flex-col items-center justify-center">
        <Library size={22} className={route === 'library' ? 'text-fg' : 'text-fg-3'} />
      </button>
      <button type="button" onClick={() => openSheet('more')} className="press flex flex-1 flex-col items-center justify-center">
        <LayoutGrid size={22} className="text-fg-3" />
      </button>
    </nav>
  );
}

// ── Player Dock ──────────────────────────────────────────────
function Scrubber({ className }: { className?: string }) {
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
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
          <div className="skeleton absolute inset-0 opacity-70" />
        </div>
        <LiveBadge />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 text-[11px] text-fg-3 tabular', className)}>
      <span className="w-10 text-right">{formatTime(shown)}</span>
      <Slider label="Seek" value={shown} max={duration || 1} step={0.1} onChange={setDrag} onPointerUp={commit} onKeyUp={commit} className="flex-1" />
      <span className="w-10">{formatTime(duration)}</span>
    </div>
  );
}

function useProgress() {
  const { time, duration } = useStore(timeStore, (s) => s);
  return duration ? Math.min(1, time / duration) : 0;
}

function NowPlayingMeta() {
  const track = useStore(playerStore, (s) => s.track);
  const fav = useIsFavorite(track?.id);
  if (!track) return <div className="flex-1" />;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" aria-label="Open now playing" onClick={() => setMode('Cover')} className="press group/art relative">
        <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} className="size-12 shadow-[var(--shadow-1)] [--art-r:12px]" />
        <span className="absolute inset-0 flex items-center justify-center rounded-[12px] bg-black/40 text-white opacity-0 transition-opacity group-hover/art:opacity-100">
          <Maximize2 size={16} />
        </span>
      </button>
      <div className="min-w-0">
        <button type="button" onClick={() => setMode('Cover')} className="block max-w-full truncate text-left text-[14px] font-medium tracking-[-0.01em] hover:underline">
          {track.title}
        </button>
        <button type="button" onClick={() => track.artistId && navigate({ name: 'artist', id: track.artistId })} className="block max-w-full truncate text-left text-[12.5px] text-fg-3 hover:text-fg-2">
          {track.artist}
        </button>
      </div>
      {!track.isRadio && <IconButton icon={Heart} label={fav ? 'Unlike' : 'Like'} size="sm" active={fav} filled={fav} onClick={() => toggleFavorite(track.id)} />}
    </div>
  );
}

/** Floating desktop player capsule — round on every side, not a flat toolbar. */
export function PlayerDock() {
  const track = useStore(playerStore, (s) => s.track);
  const panel = useStore(uiStore, (s) => s.panel);
  const shuffle = useStore(playerStore, (s) => s.shuffle);
  const repeat = useStore(playerStore, (s) => s.repeat);
  const volume = useStore(playerStore, (s) => s.volume);
  const muted = useStore(playerStore, (s) => s.muted);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const hasLyrics = useStore(playerStore, (s) => s.lyrics.length > 0);
  if (!track) return null;

  return (
    <div className="glass anim-rise pointer-events-auto relative grid h-[var(--dock-h)] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 overflow-hidden rounded-[var(--radius-xl)] px-3 pr-4">
      <NowPlayingMeta />
      <div className="flex w-[min(44vw,520px)] flex-col items-center gap-0.5">
        <div className="flex items-center gap-2">
          <IconButton icon={Shuffle} label="Shuffle" size="sm" active={shuffle} onClick={toggleShuffle} />
          <IconButton icon={repeat === 'one' ? Repeat1 : Repeat} label={`Repeat ${repeat}`} size="sm" active={repeat !== 'off'} onClick={cycleRepeat} />
          <div className="mx-1 flex items-center gap-2">
            <IconButton icon={SkipBack} label="Previous" size="md" onClick={prev} className="[&_svg]:fill-current" />
            <IconButton icon={isPlaying ? Pause : Play} label={isPlaying ? 'Pause' : 'Play'} variant="solid" size="lg" onClick={togglePlay} className={cn('[&_svg]:fill-current', !isPlaying && '[&_svg]:ml-0.5')} />
            <IconButton icon={SkipForward} label="Next" size="md" onClick={() => next()} className="[&_svg]:fill-current" />
          </div>
          <span className="w-16" aria-hidden />
        </div>
        <Scrubber className="w-full -mt-1" />
      </div>
      <div className="flex items-center justify-end gap-0.5">
        <IconButton icon={MicVocal} label="Lyrics" size="sm" active={panel === 'lyrics'} disabled={!hasLyrics} onClick={() => togglePanel('lyrics')} />
        <IconButton icon={ListMusic} label="Queue" size="sm" active={panel === 'queue'} onClick={() => togglePanel('queue')} />
        <IconButton icon={Sparkles} label="Agent" size="sm" active={panel === 'agent'} onClick={() => togglePanel('agent')} className="max-xl:hidden" />
        <IconButton icon={muted || volume === 0 ? VolumeX : Volume2} label="Mute" size="sm" onClick={toggleMute} className="ml-1" />
        <Slider label="Volume" value={muted ? 0 : volume} onChange={setVolume} className="w-24 max-xl:hidden" />
        <span className="mx-1 h-5 w-px bg-line-2" />
        <IconButton icon={PictureInPicture2} label="Micro" size="sm" onClick={() => setMode('Micro')} />
        <IconButton icon={Circle} label="Nano" size="sm" onClick={() => setMode('Nano')} />
        <IconButton icon={Maximize2} label="Full screen" size="sm" onClick={() => setMode('Cover')} />
      </div>
    </div>
  );
}

/** Compact mini player for phones: sits above the tab bar. */
export function MiniPlayer() {
  const track = useStore(playerStore, (s) => s.track);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const progress = useProgress();
  if (!track) return null;
  return (
    <div role="button" tabIndex={0} onClick={() => setMode('Cover')} className="glass anim-rise relative flex h-16 items-center gap-3 overflow-hidden rounded-[22px] pl-2 pr-1.5">
      <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} className="size-12 [--art-r:14px]" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium">{track.title}</div>
        <div className="truncate text-[12.5px] text-fg-3">{track.artist}</div>
      </div>
      <div onClick={(e) => e.stopPropagation()} className="flex items-center">
        <IconButton icon={isPlaying ? Pause : Play} label={isPlaying ? 'Pause' : 'Play'} tip={false} className="[&_svg]:fill-current text-fg" onClick={togglePlay} />
        <IconButton icon={SkipForward} label="Next" tip={false} className="[&_svg]:fill-current text-fg" onClick={() => next()} />
      </div>
      <div className="absolute inset-x-3 bottom-0 h-[2px] overflow-hidden rounded-full bg-surface-3">
        <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

// ── Toast Alert ──────────────────────────────────────────────
export function Toast() {
  const toastItem = useStore(uiStore, (s) => s.toast);
  if (!toastItem) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[80] flex justify-center px-4">
      <div className="glass-strong anim-pop flex max-w-md items-center gap-2.5 rounded-full py-2 pl-3 pr-4 text-[13.5px] font-medium shadow-xl">
        <span className="flex size-5 items-center justify-center rounded-full bg-accent text-on-accent">
          <Check size={12} strokeWidth={2.5} />
        </span>
        <span>{toastItem.text}</span>
      </div>
    </div>
  );
}

// ── Ambient Glow Background ──────────────────────────────────
export function Aura() {
  const on = useStore(settingsStore, (s) => s.aura);
  const playing = useStore(playerStore, (s) => s.isPlaying);
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-30">
      <div
        className="anim-drift absolute -left-[10%] -top-[20%] size-[60vmax] rounded-full blur-[110px]"
        style={{ background: 'radial-gradient(circle, var(--fg) 0%, transparent 65%)', opacity: 0.1, animationPlayState: playing ? 'running' : 'paused' }}
      />
    </div>
  );
}
