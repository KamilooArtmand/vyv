// ─────────────────────────────────────────────────────────────
// ui-modes.tsx: Immersive Players (CoverPlayer, Micro, Nano)
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Disc3,
  Heart,
  ListMusic,
  Maximize2,
  MicVocal,
  Minus,
  Moon,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Radio,
  Sliders,
  Check,
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
  setVolume,
  timeStore,
  toggleMute,
  togglePlay,
  toggleShuffle,
} from '../state/state-player';
import { cyclePlayerMode, setMode, toast } from '../state/state-ui';
import { Artwork, IconButton, LogoMark, Slider, Visualizer } from './ui-components';

/** Miniature interactive Logo Button with Left-Click Cycle, Long-Press Menu, and Right-Click Context Menu */
function MiniModeLogo({ currentMode }: { currentMode: PlayerMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const isLongPress = useRef(false);

  const startPress = () => {
    isLongPress.current = false;
    longPressTimer.current = window.setTimeout(() => {
      isLongPress.current = true;
      setMenuOpen(true);
      toast('Mode options', 'sparkles');
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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(true);
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
        className="press group relative flex size-8 items-center justify-center rounded-full bg-surface-2 hover:bg-surface-3 transition-colors shadow-sm"
        title="Left click: Next mode | Long press or Right click: Mode menu"
        aria-label="Player mode"
      >
        <LogoMark className="size-4.5 group-hover:scale-105 transition-transform" />
      </button>

      {/* Popover / Context Menu */}
      {menuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="glass-strong anim-pop absolute bottom-full mb-2 right-0 z-[100] w-48 rounded-2xl p-1.5 shadow-2xl border border-line-2 text-left"
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

export function CoverPlayer() {
  const currentTrack = useStore(playerStore, (s) => s.track) || SEED_TRACKS[0];
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const shuffle = useStore(playerStore, (s) => s.shuffle);
  const repeat = useStore(playerStore, (s) => s.repeat);
  const volume = useStore(playerStore, (s) => s.volume);
  const muted = useStore(playerStore, (s) => s.muted);
  const lyrics = useStore(playerStore, (s) => s.lyrics);
  const { time, duration } = useStore(timeStore, (s) => s);
  const fav = useIsFavorite(currentTrack?.id);
  const [showLyrics, setShowLyrics] = useState(false);

  return (
    <div className="anim-fade fixed inset-0 z-50 flex flex-col bg-bg text-fg select-none overflow-hidden">
      {/* Background ambient blur */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25 blur-3xl scale-125 transition-all duration-700"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 40%, ${currentTrack.dominantColorHex || 'var(--accent)'} 0%, transparent 60%)`,
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-10 flex h-16 items-center justify-between px-6 md:px-10 border-b border-line-2 bg-bg/40 backdrop-blur-md">
        <IconButton
          icon={ChevronDown}
          label="Back to Full App"
          size="md"
          variant="soft"
          onClick={() => setMode('Full')}
        />
        <div className="text-center min-w-0 px-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-3">Now Playing</div>
          <div className="text-xs font-medium text-fg truncate">{currentTrack.album}</div>
        </div>
        <div className="flex items-center gap-2">
          <MiniModeLogo currentMode="Cover" />
        </div>
      </header>

      {/* Main Center Section */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="flex flex-col items-center max-w-lg w-full">
          {/* Large Artwork */}
          <div className="relative group/art aspect-square w-64 sm:w-80 md:w-96 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.6)] rounded-[28px] overflow-hidden">
            <Artwork
              seed={currentTrack.id}
              color={currentTrack.dominantColorHex}
              src={currentTrack.coverUrl}
              className="size-full [--art-r:28px]"
            />
            {/* Visualizer overlay */}
            <Visualizer
              bars={32}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 opacity-30"
              mirror
            />
          </div>

          {/* Title & Artist & Favorite */}
          <div className="mt-8 flex w-full items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{currentTrack.title}</h1>
              <p className="text-base text-fg-3 mt-1 truncate">{currentTrack.artist}</p>
            </div>
            <IconButton
              icon={Heart}
              label={fav ? 'Liked' : 'Like'}
              size="lg"
              variant="soft"
              active={fav}
              filled={fav}
              onClick={() => {
                toggleFavorite(currentTrack.id);
                toast(fav ? 'Removed from liked' : 'Added to favorites', 'heart');
              }}
            />
          </div>

          {/* Scrubber & Time */}
          <div className="w-full mt-6">
            <Slider
              value={time}
              max={duration || 1}
              step={0.1}
              onChange={seek}
              label="Seek timeline"
              className="h-6"
            />
            <div className="flex justify-between text-xs text-fg-3 tabular font-medium mt-1">
              <span>{formatTime(time)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Transport playback controls */}
          <div className="flex w-full items-center justify-between mt-6 px-2">
            <IconButton
              icon={Shuffle}
              label="Shuffle"
              size="md"
              active={shuffle}
              onClick={toggleShuffle}
            />
            <IconButton
              icon={SkipBack}
              label="Previous"
              size="lg"
              onClick={prev}
            />
            <IconButton
              icon={isPlaying ? Pause : Play}
              label={isPlaying ? 'Pause' : 'Play'}
              variant="solid"
              size="xl"
              onClick={togglePlay}
              className="shadow-xl"
            />
            <IconButton
              icon={SkipForward}
              label="Next"
              size="lg"
              onClick={() => next()}
            />
            <IconButton
              icon={repeat === 'one' ? Repeat1 : Repeat}
              label="Repeat"
              size="md"
              active={repeat !== 'off'}
              onClick={cycleRepeat}
            />
          </div>

          {/* Secondary bar: Volume & Lyrics */}
          <div className="mt-8 flex w-full items-center justify-between border-t border-line-2 pt-6">
            <div className="flex items-center gap-2 w-40">
              <IconButton icon={muted ? VolumeX : Volume2} label="Mute" size="sm" onClick={toggleMute} />
              <Slider value={muted ? 0 : volume} max={1} step={0.01} onChange={setVolume} label="Volume" />
            </div>

            {lyrics.length > 0 && (
              <button
                type="button"
                onClick={() => setShowLyrics(!showLyrics)}
                className={`press flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  showLyrics ? 'bg-fg text-bg' : 'bg-surface-2 text-fg hover:bg-surface-3'
                }`}
              >
                <MicVocal size={14} />
                <span>Lyrics</span>
              </button>
            )}
          </div>

          {/* Synchronized lyrics container */}
          {showLyrics && lyrics.length > 0 && (
            <div className="mt-4 w-full rounded-2xl bg-surface-2/60 backdrop-blur-md p-4 max-h-36 overflow-y-auto text-center space-y-2">
              {lyrics.map((l, i) => {
                const isCurrent = l.time <= time && (i === lyrics.length - 1 || lyrics[i + 1].time > time);
                return (
                  <p
                    key={i}
                    onClick={() => seek(l.time)}
                    className={`cursor-pointer text-sm font-medium transition-all ${
                      isCurrent ? 'text-fg font-bold scale-105' : 'text-fg-3 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {l.text}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export function MicroPlayer() {
  const currentTrack = useStore(playerStore, (s) => s.track) || SEED_TRACKS[0];
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const { time, duration } = useStore(timeStore, (s) => s);
  const progress = duration ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="glass-strong anim-pop relative flex w-full max-w-[420px] items-center gap-3.5 rounded-[28px] p-3.5 shadow-2xl border border-line-2">
        <Artwork
          seed={currentTrack.id}
          color={currentTrack.dominantColorHex}
          src={currentTrack.coverUrl}
          className="size-14 [--art-r:16px] shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-bold text-fg">{currentTrack.title}</div>
          <div className="truncate text-[12px] text-fg-3">{currentTrack.artist}</div>
          {/* Progress bar */}
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <IconButton icon={SkipBack} label="Previous" size="sm" onClick={prev} />
        <IconButton
          icon={isPlaying ? Pause : Play}
          label={isPlaying ? 'Pause' : 'Play'}
          variant="solid"
          size="md"
          onClick={togglePlay}
        />
        <IconButton icon={SkipForward} label="Next" size="sm" onClick={() => next()} />

        {/* Clean Single Mode Trigger: Mini Logo */}
        <MiniModeLogo currentMode="Micro" />
      </div>
    </div>
  );
}

export function NanoPlayer() {
  const currentTrack = useStore(playerStore, (s) => s.track) || SEED_TRACKS[0];
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const { time, duration } = useStore(timeStore, (s) => s);
  const progress = duration ? Math.min(1, time / duration) : 0;

  const R = 64;
  const C = 2 * Math.PI * R;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-md">
      <div className="relative flex flex-col items-center">
        {/* Circular Progress Ring */}
        <div className="relative size-[152px] flex items-center justify-center">
          <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 152 152">
            <circle
              cx="76"
              cy="76"
              r={R}
              fill="none"
              stroke="var(--surface-3)"
              strokeWidth="4"
            />
            <circle
              cx="76"
              cy="76"
              r={R}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-300"
            />
          </svg>

          {/* Central Play/Pause Orb */}
          <button
            type="button"
            onClick={togglePlay}
            className="press group relative size-[132px] rounded-full overflow-hidden shadow-2xl p-1"
          >
            <Artwork
              seed={currentTrack.id}
              color={currentTrack.dominantColorHex}
              src={currentTrack.coverUrl}
              shape="circle"
              className="size-full"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white">
              {isPlaying ? <Pause size={32} className="fill-current" /> : <Play size={32} className="ml-1 fill-current" />}
            </span>
          </button>
        </div>

        {/* Track Label */}
        <div className="mt-3 text-center max-w-[200px]">
          <div className="truncate text-sm font-bold text-fg">{currentTrack.title}</div>
          <div className="truncate text-xs text-fg-3">{currentTrack.artist}</div>
        </div>

        {/* Clean Single Mode Trigger: Mini Logo */}
        <div className="mt-4 flex items-center justify-center">
          <MiniModeLogo currentMode="Nano" />
        </div>
      </div>
    </div>
  );
}
