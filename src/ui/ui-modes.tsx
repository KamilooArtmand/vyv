// ─────────────────────────────────────────────────────────────
// ui-modes.tsx: Immersive Players (CoverPlayer, Micro, Nano)
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Heart,
  MicVocal,
  Moon,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Check,
  Gauge,
  Maximize2,
} from 'lucide-react';
import { useStore } from '../core/core-store';
import { formatTime } from '../core/core-utils';
import type { PlayerMode } from '../core/core-types';
import { SEED_TRACKS, toggleFavorite, useIsFavorite } from '../state/state-catalog';
import {
  cycleRepeat,
  next,
  playerStore,
  prev,
  seek,
  setSleep,
  setSpeed,
  setVolume,
  timeStore,
  toggleMute,
  togglePlay,
  toggleShuffle,
} from '../state/state-player';
import { cyclePlayerMode, settingsStore, setMode, toast } from '../state/state-ui';
import { Artwork, IconButton, LogoMark, LyricsView, Slider } from './ui-components';
import { ResizeEdges } from './ui-window';
import { desktop } from '../core/core-desktop';

/** Miniature interactive Logo Button with Left-Click Cycle, Long-Press Menu, and Right-Click Context Menu */
function MiniModeLogo({ currentMode }: { currentMode: PlayerMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const isLongPress = useRef(false);

  const startPress = () => {
    isLongPress.current = false;
    longPressTimer.current = window.setTimeout(() => {
      isLongPress.current = true;
      if (desktop) desktop.showModeMenu(currentMode);
      else setMenuOpen(true);
    }, 450);
  };

  const endPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPress.current) {
      e.preventDefault();
      return;
    }
    cyclePlayerMode();
  };

  // On desktop the menu is native, so it can extend past a tiny Micro/Nano window.
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (desktop) desktop.showModeMenu(currentMode);
    else setMenuOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [menuOpen]);

  const modes: { id: PlayerMode; label: string; desc: string }[] = [
    { id: 'Full', label: 'Full App', desc: 'Standard music app view' },
    { id: 'Cover', label: 'Cover View', desc: 'Immersive artwork & lyrics' },
    { id: 'Micro', label: 'Micro Floating', desc: 'Compact floating pill' },
    { id: 'Nano', label: 'Nano Circle', desc: 'Minimalist progress orb' },
  ];

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className="press group relative flex size-8 items-center justify-center rounded-full"
        title="Click: next mode · Right click: all modes"
        aria-label="Player mode"
      >
        <LogoMark bare className="size-5 transition-transform group-hover:scale-110" />
      </button>

      {/* Popover / Context Menu */}
      {menuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="glass-strong anim-pop absolute right-0 top-full mt-2 z-[100] w-48 rounded-2xl p-1.5 shadow-2xl border border-line-2 text-left"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-fg-3">
            Switch Display Mode
          </div>
          <div className="space-y-0.5 mt-1">
            {modes.map((m) => {
              const active = currentMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id);
                    setMenuOpen(false);
                  }}
                  className={`press flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors ${
                    active ? 'bg-surface-3 text-fg font-semibold' : 'text-fg-2 hover:bg-surface-2 hover:text-fg'
                  }`}
                >
                  <div className="truncate">
                    <div>{m.label}</div>
                    <div className="text-[10px] text-fg-3 font-normal">{m.desc}</div>
                  </div>
                  {active && <Check size={14} className="text-accent-ink shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** White-on-art ink: local token overrides so every shared control reads on the cover. */
const ON_ART = {
  '--fg': '#ffffff',
  '--fg-2': 'rgb(255 255 255 / 0.82)',
  '--fg-3': 'rgb(255 255 255 / 0.62)',
  '--bg': '#000000',
  '--surface-2': 'rgb(255 255 255 / 0.16)',
  '--surface-3': 'rgb(255 255 255 / 0.28)',
  '--accent-ink': '#ffffff',
  '--track-fill': '#ffffff',
} as React.CSSProperties;

/** Controls stay visible for a moment after the pointer moves, like a video player. */
function useIdleReveal(ms = 2400) {
  const [awake, setAwake] = useState(false);
  const t = useRef<number | undefined>(undefined);
  const poke = () => {
    setAwake(true);
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setAwake(false), ms);
  };
  useEffect(() => () => window.clearTimeout(t.current), []);
  return [awake, poke] as const;
}

/**
 * Cover: a square, opaque window that is nothing but the artwork. Transport,
 * scrubber, volume and extras fade in only while the pointer is over it.
 */
export function CoverPlayer() {
  const currentTrack = useStore(playerStore, (s) => s.track) || SEED_TRACKS[0];
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const shuffle = useStore(playerStore, (s) => s.shuffle);
  const repeat = useStore(playerStore, (s) => s.repeat);
  const volume = useStore(playerStore, (s) => s.volume);
  const muted = useStore(playerStore, (s) => s.muted);
  const lyrics = useStore(playerStore, (s) => s.lyrics);
  const sleepAt = useStore(playerStore, (s) => s.sleepAt);
  const speed = useStore(settingsStore, (s) => s.speed);
  const { time, duration } = useStore(timeStore, (s) => s);
  const fav = useIsFavorite(currentTrack?.id);
  const [showLyrics, setShowLyrics] = useState(false);
  const [sleepIdx, setSleepIdx] = useState(0);
  const [awake, poke] = useIdleReveal();
  const spoken = currentTrack.kind === 'podcast' || currentTrack.kind === 'audiobook';
  const live = !!currentTrack.isRadio;
  const sleepMins = sleepAt ? Math.max(1, Math.round((sleepAt - Date.now()) / 60_000)) : null;

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    setSpeed(speeds[(speeds.indexOf(speed) + 1) % speeds.length] ?? 1);
  };
  const cycleSleep = () => {
    const options = [null, 15, 30, 60] as const;
    const n = (sleepIdx + 1) % options.length;
    setSleepIdx(n);
    setSleep(options[n]);
  };
  const pill = 'press flex h-8 min-w-8 items-center justify-center gap-1 rounded-full px-1.5 text-[12px] font-semibold tabular text-fg-2 hover:text-fg';

  return (
    <div className="mode-stage anim-fade">
      <ResizeEdges />
      <div
        className="mode-cover mode-surface reveal-host anim-pop select-none"
        data-show={awake || showLyrics}
        onPointerMove={poke}
        onPointerDown={poke}
        style={ON_ART}
      >
        <Artwork seed={currentTrack.id} color={currentTrack.dominantColorHex} src={currentTrack.coverUrl} className="absolute inset-0 size-full !rounded-none" />

        {/* Drag handle for the desktop window (top centre, clear of the controls). */}
        <div className="drag absolute inset-x-[22%] top-0 z-10 h-14" aria-hidden />

        {showLyrics && lyrics.length > 0 && (
          <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-xl">
            <LyricsView className="h-full px-10 py-20 text-center" large />
          </div>
        )}

        {/* Top: back to the app, like, modes. */}
        <div className="reveal absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-[linear-gradient(to_bottom,rgb(0_0_0/0.5),transparent)] px-6 pb-10 pt-5 text-fg">
          <IconButton icon={ChevronDown} label="Back to app" size="sm" variant="bare" tip="bottom" onClick={() => setMode('Full')} />
          <div className="flex items-center gap-1">
            {!live && (
              <IconButton
                icon={Heart}
                label={fav ? 'Liked' : 'Like'}
                size="sm"
                variant="bare"
                tip="bottom"
                active={fav}
                filled={fav}
                onClick={() => {
                  toggleFavorite(currentTrack.id, currentTrack);
                  toast(fav ? 'Removed from liked' : 'Added to liked', 'heart');
                }}
              />
            )}
            <MiniModeLogo currentMode="Cover" />
          </div>
        </div>

        {/* Bottom: meta, scrubber, transport, volume & extras. */}
        <div className="reveal absolute inset-x-0 bottom-0 z-20 bg-[linear-gradient(to_top,rgb(0_0_0/0.72),rgb(0_0_0/0.35)_65%,transparent)] px-[clamp(22px,7%,40px)] pb-[clamp(20px,6%,34px)] pt-24 text-fg">
          <div className="min-w-0">
            <div className="truncate text-[clamp(17px,4.2vmin,26px)] font-semibold tracking-[-0.03em]">{currentTrack.title}</div>
            <div className="truncate text-[13.5px] text-fg-2">{currentTrack.artist}</div>
          </div>

          {live ? (
            <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-2">
              <span className="anim-live size-1.5 rounded-full bg-[#ff3c00]" /> Live
            </div>
          ) : (
            <div className="mt-2">
              <Slider value={time} max={duration || 1} step={0.1} onChange={seek} label="Seek" />
              <div className="flex justify-between text-[11px] font-medium tabular text-fg-3">
                <span>{formatTime(time)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center">
            <div className="flex items-center gap-1">
              <IconButton icon={muted || volume === 0 ? VolumeX : Volume2} label="Mute" size="sm" variant="bare" onClick={toggleMute} />
              <Slider value={muted ? 0 : volume} onChange={setVolume} label="Volume" className="w-[min(88px,13vmin)]" />
            </div>
            <div className="flex items-center gap-1.5">
              <IconButton icon={SkipBack} label="Previous" variant="bare" onClick={prev} className="[&_svg]:fill-current" />
              <IconButton icon={isPlaying ? Pause : Play} label={isPlaying ? 'Pause' : 'Play'} variant="solid" size="lg" onClick={togglePlay} className={isPlaying ? '[&_svg]:fill-current' : '[&_svg]:ml-0.5 [&_svg]:fill-current'} />
              <IconButton icon={SkipForward} label="Next" variant="bare" onClick={() => next()} className="[&_svg]:fill-current" />
            </div>
            <div className="flex items-center justify-end">
              {!live && <IconButton icon={Shuffle} label="Shuffle" size="sm" variant="bare" active={shuffle} onClick={toggleShuffle} />}
              {!live && <IconButton icon={repeat === 'one' ? Repeat1 : Repeat} label="Repeat" size="sm" variant="bare" active={repeat !== 'off'} onClick={cycleRepeat} />}
              {!live && (
                <button type="button" onClick={cycleSpeed} aria-label="Playback speed" className={pill}>
                  <Gauge size={15} strokeWidth={1.75} />
                  {speed !== 1 && `${speed}×`}
                </button>
              )}
              {spoken && (
                <button type="button" onClick={cycleSleep} aria-label="Sleep timer" className={pill}>
                  <Moon size={15} strokeWidth={1.75} />
                  {sleepMins && `${sleepMins}m`}
                </button>
              )}
              {lyrics.length > 0 && <IconButton icon={MicVocal} label="Lyrics" size="sm" variant="bare" active={showLyrics} onClick={() => setShowLyrics(!showLyrics)} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Micro: an opaque capsule — art, title, transport. Floats on top on desktop. */
export function MicroPlayer() {
  const currentTrack = useStore(playerStore, (s) => s.track) || SEED_TRACKS[0];
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const { time, duration } = useStore(timeStore, (s) => s);
  const progress = duration ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className="mode-stage anim-fade">
      <div className="mode-micro mode-surface drag anim-pop flex items-center gap-3 pl-3 pr-4">
        {/* 64px circle inset 12px: concentric with the capsule's 44px ends. */}
        <button type="button" aria-label="Open cover" onClick={() => setMode('Cover')} className="press shrink-0">
          <Artwork seed={currentTrack.id} color={currentTrack.dominantColorHex} src={currentTrack.coverUrl} shape="circle" className="size-16" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-fg">{currentTrack.title}</div>
          <div className="truncate text-[12px] text-fg-3">{currentTrack.artist}</div>
          <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-surface-3">
            {currentTrack.isRadio ? <div className="skeleton size-full" /> : <div className="h-full rounded-full bg-fg transition-[width] duration-300" style={{ width: `${progress}%` }} />}
          </div>
        </div>

        <div className="flex items-center">
          <IconButton icon={SkipBack} label="Previous" size="sm" variant="bare" tip={false} onClick={prev} className="[&_svg]:fill-current" />
          <IconButton icon={isPlaying ? Pause : Play} label={isPlaying ? 'Pause' : 'Play'} variant="solid" tip={false} onClick={togglePlay} className={isPlaying ? '[&_svg]:fill-current' : '[&_svg]:ml-0.5 [&_svg]:fill-current'} />
          <IconButton icon={SkipForward} label="Next" size="sm" variant="bare" tip={false} onClick={() => next()} className="[&_svg]:fill-current" />
          <MiniModeLogo currentMode="Micro" />
        </div>
      </div>
    </div>
  );
}

/** Nano: an opaque orb with a progress ring. Hover reveals play/pause; the rim drags. */
export function NanoPlayer() {
  const currentTrack = useStore(playerStore, (s) => s.track) || SEED_TRACKS[0];
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const { time, duration } = useStore(timeStore, (s) => s);
  const progress = currentTrack.isRadio ? 1 : duration ? Math.min(1, time / duration) : 0;
  const R = 78;
  const C = 2 * Math.PI * R;

  return (
    <div className="mode-stage anim-fade">
      <div className="mode-nano mode-surface drag reveal-host anim-pop">
        <svg className="pointer-events-none absolute inset-0 size-full -rotate-90" viewBox="0 0 168 168" aria-hidden>
          <circle cx="84" cy="84" r={R} fill="none" stroke="var(--surface-3)" strokeWidth="3" />
          <circle cx="84" cy="84" r={R} fill="none" stroke="#ff3c00" strokeWidth="3" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} strokeLinecap="round" className="transition-[stroke-dashoffset] duration-300" />
        </svg>

        <button
          type="button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={togglePlay}
          onDoubleClick={() => setMode('Full')}
          onContextMenu={(e) => {
            e.preventDefault();
            if (desktop) desktop.showModeMenu('Nano');
            else cyclePlayerMode();
          }}
          className="press absolute inset-[12px] overflow-hidden rounded-full"
        >
          <Artwork seed={currentTrack.id} color={currentTrack.dominantColorHex} src={currentTrack.coverUrl} shape="circle" className="size-full" />
          <span className="reveal absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white">
            {isPlaying ? <Pause size={30} className="fill-current" /> : <Play size={30} className="ml-1 fill-current" />}
          </span>
        </button>

        <button
          type="button"
          aria-label="Open full app"
          onClick={() => setMode('Full')}
          className="reveal press absolute bottom-[26px] left-1/2 flex size-7 -translate-x-1/2 items-center justify-center text-white/85 hover:text-white"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}
