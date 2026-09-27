// ─────────────────────────────────────────────────────────────
// ui-shell.tsx: TopBar, Sidebar, PlayerDock, Modals & Toast
// ─────────────────────────────────────────────────────────────

import { useRef, useState } from 'react';
import { useBackdropTone } from './ui-backdrop';
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
  Clapperboard,
  Compass,
} from 'lucide-react';
import { useStore } from '../core/core-store';
import { cn, formatTime } from '../core/core-utils';
import type { RouteName } from '../core/core-types';
import {
  applyTheme,
  authStore,
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
import { WindowControls } from './ui-window';
import { desktop } from '../core/core-desktop';

// ── Navigation Structure ─────────────────────────────────────
export interface NavItem {
  name: RouteName;
  label: string;
  icon: typeof House;
}

export const NAV_GROUPS: NavItem[][] = [
  [
    { name: 'home', label: 'Home', icon: House },
    { name: 'discover', label: 'Discover', icon: Compass },
    { name: 'library', label: 'Library', icon: Library },
    { name: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ],
  [
    { name: 'radio', label: 'Radio', icon: Radio },
    { name: 'podcasts', label: 'Podcasts', icon: Podcast },
    { name: 'audiobooks', label: 'Audiobooks', icon: BookOpen },
    { name: 'video', label: 'Video', icon: Clapperboard },
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
/**
 * The header is part of the window body: logo and icons sit straight on the
 * background with no bar, chips or button fills. On desktop it is also the
 * drag handle and carries the minimal window controls.
 */
export function TopBar({ onAgent }: { onAgent?: () => void }) {
  const user = useStore(authStore, (s) => s.user);
  const unread = useUnreadCount();
  const pref = useStore(settingsStore, (s) => s.theme);
  const route = useStore(uiStore, (s) => s.route.name);
  const panel = useStore(uiStore, (s) => s.panel);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const dark = resolveTheme(pref) === 'dark';

  return (
    <header
      className="drag relative z-30 flex h-[var(--header-h)] shrink-0 items-center pl-5 pr-3 md:pl-[26px]"
      onDoubleClick={(e) => e.target === e.currentTarget && desktop?.toggleMaximize()}
    >
      <button type="button" aria-label="vyv home" onClick={() => navigate({ name: 'home' })} className="press flex items-center gap-1.5">
        <LogoMark bare animated={isPlaying} className="size-6" />
        <Wordmark className="text-[18px]" />
      </button>

      <div className="ml-6 hidden items-center md:flex">
        <IconButton icon={ChevronLeft} label="Back" size="sm" variant="bare" tip="bottom" onClick={goBack} />
        <IconButton icon={ChevronRight} label="Forward" size="sm" variant="bare" tip="bottom" onClick={goForward} />
      </div>

      <div className="ml-auto flex items-center">
        <IconButton icon={Search} label="Search" variant="bare" tip="bottom" active={route === 'search'} onClick={() => navigate({ name: 'search' })} />
        <IconButton icon={Sparkles} label="Agent  ⌘K" variant="bare" tip="bottom" active={panel === 'agent'} onClick={onAgent} />
        <IconButton icon={Bell} label="Inbox" variant="bare" tip="bottom" badge={unread} active={route === 'notifications'} onClick={() => navigate({ name: 'notifications' })} />
        <IconButton
          icon={dark ? Sun : Moon}
          label={dark ? 'Light mode' : 'Dark mode'}
          variant="bare"
          tip="bottom"
          onClick={(e) => {
            const nextTheme = dark ? 'light' : 'dark';
            settingsStore.set({ theme: nextTheme });
            applyTheme(nextTheme, { x: e.clientX, y: e.clientY });
          }}
        />
        <IconButton icon={Settings2} label="Settings" variant="bare" tip="bottom" active={route === 'settings'} onClick={() => navigate({ name: 'settings' })} />
        <button
          type="button"
          aria-label={user ? user.username : 'Sign in'}
          data-tip={user ? user.username : 'Sign in'}
          data-tip-side="bottom"
          onClick={() => (user ? navigate({ name: 'profile' }) : openSheet('auth'))}
          className={cn('press ml-1.5 flex size-8 items-center justify-center rounded-full', route === 'profile' ? 'text-fg' : 'text-fg-2 hover:text-fg')}
        >
          {user?.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="size-7 rounded-full object-cover" /> : <UserRound size={19} strokeWidth={1.75} />}
        </button>
        {desktop && <span className="ml-3 mr-1 h-4 w-px bg-line-2" aria-hidden />}
        <WindowControls />
      </div>
    </header>
  );
}

// ── Sidebar Rail ─────────────────────────────────────────────
export function Sidebar() {
  const route = useStore(uiStore, (s) => s.route.name);

  return (
    <nav aria-label="Primary" className="scrollbar-none relative z-30 flex h-full w-[76px] shrink-0 flex-col items-center gap-0.5 overflow-y-auto pb-[calc(var(--dock-h)+var(--dock-gap)*2)] pt-1">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} className="flex flex-col items-center gap-0.5">
          {gi > 0 && <span className="my-2 h-px w-5 bg-line-2" />}
          {group.map((item) => {
            const on = route === item.name;
            return (
              <div key={item.name} className="relative">
                {on && <span className="absolute -left-[13px] top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-fg" aria-hidden />}
                <IconButton
                  icon={item.icon}
                  label={item.label}
                  tip="right"
                  variant="bare"
                  className={on ? '!text-fg' : '!text-fg-3 hover:!text-fg'}
                  onClick={() => navigate({ name: item.name })}
                />
              </div>
            );
          })}
        </div>
      ))}
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
      {/* Circular art, concentric with the dock's round end. */}
      <button type="button" aria-label="Open cover" onClick={() => setMode('Cover')} className="press group/art relative shrink-0">
        <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} shape="circle" className="size-[calc(var(--dock-h)-var(--dock-gap)*2)]" />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover/art:opacity-100">
          <Maximize2 size={15} />
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
      {!track.isRadio && <IconButton icon={Heart} label={fav ? 'Unlike' : 'Like'} size="sm" variant="bare" active={fav} filled={fav} onClick={() => toggleFavorite(track.id, track)} />}
    </div>
  );
}

/**
 * Floating desktop player: a true capsule (radius = height / 2) whose two
 * round ends sit concentric inside the window's curved bottom corners.
 */
export function PlayerDock() {
  const track = useStore(playerStore, (s) => s.track);
  const panel = useStore(uiStore, (s) => s.panel);
  const shuffle = useStore(playerStore, (s) => s.shuffle);
  const repeat = useStore(playerStore, (s) => s.repeat);
  const volume = useStore(playerStore, (s) => s.volume);
  const muted = useStore(playerStore, (s) => s.muted);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const hasLyrics = useStore(playerStore, (s) => s.lyrics.length > 0);
  const ref = useRef<HTMLDivElement>(null);
  const { tone, busy } = useBackdropTone(ref, !!track);
  if (!track) return null;

  return (
    <div
      ref={ref}
      data-tone={tone}
      style={{ '--busy': busy } as React.CSSProperties}
      className="dock-surface anim-rise pointer-events-auto grid h-[var(--dock-h)] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-[var(--dock-gap)]"
    >
      <NowPlayingMeta />
      <div className="flex w-[min(40vw,500px)] flex-col items-center">
        <div className="flex items-center gap-1.5">
          <IconButton icon={Shuffle} label="Shuffle" size="xs" variant="bare" active={shuffle} onClick={toggleShuffle} />
          <IconButton icon={SkipBack} label="Previous" size="sm" variant="bare" onClick={prev} className="[&_svg]:fill-current" />
          <IconButton icon={isPlaying ? Pause : Play} label={isPlaying ? 'Pause' : 'Play'} variant="solid" size="md" onClick={togglePlay} className={cn('[&_svg]:fill-current', !isPlaying && '[&_svg]:ml-0.5')} />
          <IconButton icon={SkipForward} label="Next" size="sm" variant="bare" onClick={() => next()} className="[&_svg]:fill-current" />
          <IconButton icon={repeat === 'one' ? Repeat1 : Repeat} label={`Repeat ${repeat}`} size="xs" variant="bare" active={repeat !== 'off'} onClick={cycleRepeat} />
        </div>
        <Scrubber className="-mt-0.5 w-full" />
      </div>
      <div className="flex items-center justify-end gap-0.5">
        <IconButton icon={MicVocal} label="Lyrics" size="sm" variant="bare" active={panel === 'lyrics'} disabled={!hasLyrics} onClick={() => togglePanel('lyrics')} />
        <IconButton icon={ListMusic} label="Queue" size="sm" variant="bare" active={panel === 'queue'} onClick={() => togglePanel('queue')} />
        <IconButton icon={muted || volume === 0 ? VolumeX : Volume2} label="Mute" size="sm" variant="bare" onClick={toggleMute} className="ml-1" />
        <Slider label="Volume" value={muted ? 0 : volume} onChange={setVolume} className="w-24 max-xl:hidden" />
        <IconButton icon={PictureInPicture2} label="Micro" size="sm" variant="bare" onClick={() => setMode('Micro')} className="ml-1" />
        <IconButton icon={Circle} label="Nano" size="sm" variant="bare" onClick={() => setMode('Nano')} />
        {/* Right end: a round control concentric with the capsule's end. */}
        <IconButton icon={Maximize2} label="Cover" variant="bare" onClick={() => setMode('Cover')} className="!size-[calc(var(--dock-h)-var(--dock-gap)*2)]" />
      </div>
    </div>
  );
}

/** Compact mini player for phones: sits above the tab bar. */
export function MiniPlayer() {
  const track = useStore(playerStore, (s) => s.track);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const progress = useProgress();
  const ref = useRef<HTMLDivElement>(null);
  const { tone, busy } = useBackdropTone(ref, !!track);
  if (!track) return null;
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={() => setMode('Cover')}
      data-tone={tone}
      style={{ '--busy': busy } as React.CSSProperties}
      className="dock-surface anim-rise flex h-16 items-center gap-3 overflow-hidden !rounded-[22px] pl-2 pr-1.5"
    >
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
        {toastItem.icon ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-accent text-on-accent">
            <Check size={12} strokeWidth={2.5} />
          </span>
        ) : (
          <span className="ml-1 size-1.5 rounded-full bg-[#ff3c00]" />
        )}
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
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-30">
      <div
        className="anim-drift absolute -left-[10%] -top-[20%] size-[60vmax] rounded-full blur-[110px]"
        style={{ background: 'radial-gradient(circle, var(--fg) 0%, transparent 65%)', opacity: 0.1, animationPlayState: playing ? 'running' : 'paused' }}
      />
    </div>
  );
}
