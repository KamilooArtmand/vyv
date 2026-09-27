// ─────────────────────────────────────────────────────────────
// ui-shell.tsx: TopBar, Sidebar, PlayerDock, Modals & Toast
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  Bell,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Database,
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
  X,
  Disc,
  Mic,
} from 'lucide-react';
import { useStore } from '../core/core-store';
import { cn, formatTime } from '../core/core-utils';
import type { RouteName } from '../core/core-types';
import {
  applyTheme,
  authStore,
  closeSheet,
  cyclePlayerMode,
  goBack,
  goForward,
  navigate,
  openSheet,
  resolveTheme,
  setMode,
  settingsStore,
  toast,
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
import { onlineCatalogStore, useUnreadCount } from '../state/state-catalog';
import { Artwork, IconButton, LiveBadge, LogoMark, Sheet, Slider, Wordmark } from './ui-components';

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
  ],
  [
    { name: 'radio', label: 'Radio', icon: Radio },
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
  const route = useStore(uiStore, (s) => s.route.name);
  const user = useStore(authStore, (s) => s.user);
  const unread = useUnreadCount();
  const pref = useStore(settingsStore, (s) => s.theme);
  const onlineCatalog = useStore(onlineCatalogStore, (s) => s);
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
          icon={onlineCatalog.onlineConnected ? Cloud : Database}
          label={onlineCatalog.onlineConnected ? 'Online Database' : 'Database Offline'}
          size="sm"
          className={cn('hidden sm:flex', onlineCatalog.onlineConnected ? 'text-fg-2' : 'text-fg-3 opacity-60')}
          onClick={() => navigate({ name: 'settings' })}
        />
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
export function PlayerDock() {
  const track = useStore(playerStore, (s) => s.track);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const shuffle = useStore(playerStore, (s) => s.shuffle);
  const repeat = useStore(playerStore, (s) => s.repeat);
  const volume = useStore(playerStore, (s) => s.volume);
  const muted = useStore(playerStore, (s) => s.muted);
  const { time, duration } = useStore(timeStore, (s) => s);

  if (!track) return null;

  return (
    <footer className="glass border-t border-line-2 fixed inset-x-0 bottom-0 z-40 flex h-[var(--dock-h)] items-center px-4 md:px-8">
      {/* Current track info */}
      <div className="flex w-1/4 min-w-[180px] items-center gap-3">
        <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} className="size-12 [--art-r:10px]" />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold">{track.title}</div>
          <div className="truncate text-[12px] text-fg-3">{track.artist}</div>
        </div>
      </div>

      {/* Center playback controls */}
      <div className="flex flex-1 flex-col items-center max-w-xl mx-auto px-4">
        <div className="flex items-center gap-3">
          <IconButton icon={Shuffle} label="Shuffle" size="sm" active={shuffle} onClick={toggleShuffle} />
          <IconButton icon={SkipBack} label="Prev" size="md" onClick={prev} />
          <IconButton icon={isPlaying ? Pause : Play} label={isPlaying ? 'Pause' : 'Play'} variant="solid" size="lg" onClick={togglePlay} />
          <IconButton icon={SkipForward} label="Next" size="md" onClick={() => next()} />
          <IconButton icon={repeat === 'one' ? Repeat1 : Repeat} label="Repeat" size="sm" active={repeat !== 'off'} onClick={cycleRepeat} />
        </div>
        <div className="flex w-full items-center gap-2 text-[11px] tabular text-fg-3 mt-1">
          <span>{formatTime(time)}</span>
          <Slider value={time} max={duration || 1} onChange={seek} label="Seek" className="flex-1" />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right volume & mode controls */}
      <div className="hidden w-1/4 items-center justify-end gap-2 md:flex">
        <IconButton icon={muted ? VolumeX : Volume2} label="Mute" size="sm" onClick={toggleMute} />
        <Slider value={muted ? 0 : volume} max={1} step={0.01} onChange={setVolume} label="Volume" className="w-24" />
        <IconButton icon={Maximize2} label="Cover Mode" size="sm" onClick={() => setMode('Cover')} />
      </div>
    </footer>
  );
}

// ── Mobile Mini Player ───────────────────────────────────────
export function MiniPlayer() {
  const track = useStore(playerStore, (s) => s.track);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  if (!track) return null;

  return (
    <div onClick={() => setMode('Cover')} className="glass mb-2 flex h-14 items-center gap-3 rounded-[var(--radius-lg)] p-2 pr-3 md:hidden">
      <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} className="size-10 [--art-r:8px]" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold">{track.title}</div>
        <div className="truncate text-[12px] text-fg-3">{track.artist}</div>
      </div>
      <IconButton
        icon={isPlaying ? Pause : Play}
        label={isPlaying ? 'Pause' : 'Play'}
        size="sm"
        variant="solid"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
      />
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
