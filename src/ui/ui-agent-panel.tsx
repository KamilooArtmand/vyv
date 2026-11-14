// ─────────────────────────────────────────────────────────────
// ui-agent-panel.tsx: Conversational Agent Overlay & Command Palette
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Circle,
  CloudSun,
  Headphones,
  History,
  Landmark,
  Layout,
  Maximize2,
  Mic,
  Moon,
  MoonStar,
  Music,
  Pause,
  PictureInPicture2,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Sun,
  Timer,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from 'lucide-react';
import { useStore } from '../core/core-store';
import { cn } from '../core/core-utils';
import { ask, listen, predict, voiceSupported } from '../state/state-agent';
import { SEED_TRACKS, allTracks, libraryStore, resolveEntity } from '../state/state-catalog';
import {
  cycleRepeat,
  next,
  playerStore,
  playQueue,
  prev,
  setSleep,
  setVolume,
  toggleMute,
  togglePlay,
  toggleShuffle,
} from '../state/state-player';
import { applyTheme, navigate, setMode, settingsStore, toast, uiStore } from '../state/state-ui';
import { Artwork, IconButton } from './ui-components';
import { AdaptiveOverlay } from '../components/ui/adaptive-overlay';
import { CommandGroup, CommandItem, CommandPalette } from '../components/ui/command-palette';
import { triggerHaptic } from '../lib/haptics';
import type { AgentMessage, BookmarkKind, ThemePref } from '../core/core-types';

const CAPABILITIES = [
  { icon: Wand2, text: 'Make me a focus mix' },
  { icon: History, text: 'What happened in 1979?' },
  { icon: Landmark, text: 'Tell me about the dastgah' },
  { icon: Timer, text: 'Sleep in 20 minutes' },
  { icon: MoonStar, text: 'Dark mode' },
  { icon: Headphones, text: 'What is this song?' },
];

function EntityChip({ kind, id }: { kind: BookmarkKind; id: string }) {
  const e = resolveEntity(kind, id);
  if (!e) return null;
  return (
    <button
      type="button"
      onClick={() => e.route && navigate(e.route)}
      className="press flex w-full items-center gap-3 rounded-[var(--radius-md)] bg-surface p-2 text-left hover:bg-surface-2"
    >
      <Artwork seed={e.id} color={e.color} src={e.src} glyph={e.glyph} shape={e.circle ? 'circle' : 'square'} className="size-10 [--art-r:10px]" />
      <div className="min-w-0">
        <div className="truncate text-[13.5px] font-medium">{e.title}</div>
        <div className="truncate text-[12px] text-fg-3">{e.subtitle}</div>
      </div>
    </button>
  );
}

function Bubble({ m, onSuggest }: { m: AgentMessage; onSuggest: (s: string) => void }) {
  if (m.role === 'user') {
    return <div className="anim-rise ml-auto max-w-[85%] rounded-[20px] rounded-br-md bg-fg px-4 py-2.5 text-[14px] text-bg">{m.text}</div>;
  }
  return (
    <div className="anim-rise flex max-w-[92%] flex-col gap-2">
      <div className="flex gap-2.5">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
          <Sparkles size={13} />
        </span>
        <p className="text-[14px] leading-relaxed text-fg">{m.text}</p>
      </div>
      {m.cards && (
        <div className="ml-8 flex flex-col gap-1.5">
          {m.cards.map((c) => (
            <EntityChip key={`${c.kind}-${c.id}`} kind={c.kind} id={c.id} />
          ))}
        </div>
      )}
      {m.suggestions && (
        <div className="ml-8 flex flex-wrap gap-1.5">
          {m.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                triggerHaptic('tick');
                onSuggest(s);
              }}
              className="press rounded-full border border-line-2 px-3 py-1.5 text-[12.5px] text-fg-2 hover:bg-surface-2 hover:text-fg"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Conversational AI agent: understands intent, acts, and predicts. */
export function AgentPanel({ autoFocus }: { autoFocus?: boolean } = {}) {
  const messages = useStore(uiStore, (s) => s.agent);
  const busy = useStore(uiStore, (s) => s.agentBusy);
  const current = useStore(playerStore, (s) => s.track);
  const voiceOn = useStore(settingsStore, (s) => s.agentVoice);
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const stopRef = useRef<() => void>(() => {});
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, busy]);

  const send = (t = text) => {
    if (!t.trim()) return;
    triggerHaptic('impact');
    ask(t);
    setText('');
  };

  const mic = () => {
    if (listening) {
      triggerHaptic('tick');
      return stopRef.current();
    }
    triggerHaptic('impact');
    setListening(true);
    stopRef.current = listen(
      (t) => send(t),
      () => setListening(false),
    );
  };

  const nudge = predict({ tracks: allTracks(), current, history: libraryStore.get().history });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="scrollbar-none flex-1 overflow-y-auto px-1 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-4 pt-2">
            <div>
              <div className="mb-3 flex size-12 items-center justify-center rounded-[16px] bg-fg text-bg shadow-[0_16px_40px_-12px_var(--accent)]">
                <Sparkles size={22} />
              </div>
              <h3 className="text-[22px] font-semibold tracking-[-0.03em]">How should it sound?</h3>
              <p className="mt-1 text-[13.5px] text-fg-3">Moods, artists, years, questions, or commands — in natural language.</p>
            </div>
            <button
              type="button"
              onClick={() => send(nudge.prompt)}
              className="press relative overflow-hidden rounded-[var(--radius-lg)] bg-accent-soft p-4 text-left border border-hairline"
            >
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-accent-ink font-mono">
                <CloudSun size={13} /> Predicted for now
              </div>
              <div className="text-[14.5px] font-medium leading-snug">{nudge.title}</div>
            </button>
            <div className="grid grid-cols-2 gap-2">
              {CAPABILITIES.map(({ icon: Icon, text: t }) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => send(t)}
                  className="press flex flex-col gap-2 rounded-[var(--radius-md)] bg-surface p-3 text-left text-[13px] leading-snug text-fg-2 hover:bg-surface-2 hover:text-fg border border-hairline/40"
                >
                  <Icon size={16} strokeWidth={1.75} className="text-fg-3" />
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-2">
            {messages.map((m) => (
              <Bubble key={m.id} m={m} onSuggest={send} />
            ))}
            {busy && (
              <div className="flex items-center gap-1.5 pl-8" aria-label="Thinking">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="anim-live size-1.5 rounded-full bg-fg-3" style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-1.5 rounded-full bg-surface-2 p-1.5 pl-4 ring-1 ring-transparent transition focus-within:bg-surface focus-within:ring-line-2 border border-hairline/60"
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={listening ? 'Listening…' : 'Ask vyv…'}
          aria-label="Message the agent"
          enterKeyHint="send"
          className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-fg-3"
        />
        {voiceOn && voiceSupported() && (
          <IconButton icon={Mic} label={listening ? 'Stop' : 'Voice'} size="sm" tip={false} onClick={mic} className={cn(listening && 'anim-live !bg-live !text-white')} />
        )}
        <IconButton icon={ArrowUp} label="Send" size="sm" variant="solid" tip={false} onClick={() => send()} disabled={!text.trim()} />
      </form>
    </div>
  );
}

/**
 * Conversational AI Audio Assistant Wrapped in AdaptiveOverlay:
 * - Desktop: Centered specular glass Dialog modal
 * - Mobile: Swipeable Vaul BottomSheet drawer
 */
export function AgentOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AdaptiveOverlay
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          triggerHaptic('tick');
          onClose();
        }
      }}
      title={
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-accent-ink" />
          <span>AI Audio Assistant</span>
        </div>
      }
      description="Natural language queries for music discovery, context curation, and playback control."
      className="max-w-2xl h-[78vh] flex flex-col p-6"
    >
      <div className="min-h-0 flex-1 pt-2">
        <AgentPanel autoFocus />
      </div>
    </AdaptiveOverlay>
  );
}

/**
 * Global Command Palette (Cmd+K / Ctrl+K):
 * Provides instant track discovery, volume adjustments, sleep timer, and mode switching.
 */
export function GlobalCommandPalette({
  open,
  onOpenChange,
  onOpenAgent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenAgent?: () => void;
}) {
  const currentTrack = useStore(playerStore, (s) => s.track);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const volume = useStore(playerStore, (s) => s.volume);
  const muted = useStore(playerStore, (s) => s.muted);
  const mode = useStore(uiStore, (s) => s.mode);
  const themePref = useStore(settingsStore, (s) => s.theme);

  const availableTracks = SEED_TRACKS;

  const selectTrack = (trackId: string) => {
    const t = availableTracks.find((x) => x.id === trackId);
    if (t) {
      triggerHaptic('impact');
      playQueue([t], 0);
      onOpenChange(false);
      toast(`Playing "${t.title}"`, 'sparkles');
    }
  };

  const handleMode = (m: 'Full' | 'Cover' | 'Micro' | 'Nano') => {
    triggerHaptic('tick');
    setMode(m);
    onOpenChange(false);
  };

  const handleTheme = (th: ThemePref) => {
    triggerHaptic('tick');
    settingsStore.set({ theme: th });
    applyTheme(th);
    onOpenChange(false);
  };

  const handleVolume = (vol: number) => {
    triggerHaptic('tick');
    setVolume(vol);
    onOpenChange(false);
    toast(`Volume: ${Math.round(vol * 100)}%`, 'check');
  };

  const handleSleep = (minutes: number | null) => {
    triggerHaptic('tick');
    setSleep(minutes);
    onOpenChange(false);
    toast(minutes ? `Sleep timer set to ${minutes}m` : 'Sleep timer disabled', 'moon');
  };

  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      placeholder="Type a command or search tracks, modes, volume..."
    >
      {/* 1. Track Discovery */}
      <CommandGroup heading="Track Discovery">
        {availableTracks.map((t) => (
          <CommandItem
            key={t.id}
            icon={<Music size={15} />}
            shortcut={[t.isRadio ? 'RADIO' : 'FLAC']}
            onSelect={() => selectTrack(t.id)}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium truncate">{t.title}</span>
              <span className="text-xs text-ink-tertiary truncate">· {t.artist}</span>
            </div>
          </CommandItem>
        ))}
      </CommandGroup>

      {/* 2. Playback & Transport */}
      <CommandGroup heading="Playback & Controls">
        <CommandItem
          icon={isPlaying ? <Pause size={15} /> : <Play size={15} />}
          shortcut={['Space']}
          onSelect={() => {
            triggerHaptic('impact');
            togglePlay();
            onOpenChange(false);
          }}
        >
          {isPlaying ? 'Pause Playback' : 'Resume Playback'}
        </CommandItem>
        <CommandItem
          icon={<SkipForward size={15} />}
          shortcut={['⌘', '→']}
          onSelect={() => {
            triggerHaptic('tick');
            next();
            onOpenChange(false);
          }}
        >
          Next Track
        </CommandItem>
        <CommandItem
          icon={<SkipBack size={15} />}
          shortcut={['⌘', '←']}
          onSelect={() => {
            triggerHaptic('tick');
            prev();
            onOpenChange(false);
          }}
        >
          Previous Track
        </CommandItem>
        <CommandItem
          icon={<Shuffle size={15} />}
          shortcut={['S']}
          onSelect={() => {
            triggerHaptic('tick');
            toggleShuffle();
            onOpenChange(false);
          }}
        >
          Toggle Shuffle Mode
        </CommandItem>
        <CommandItem
          icon={<Repeat size={15} />}
          shortcut={['R']}
          onSelect={() => {
            triggerHaptic('tick');
            cycleRepeat();
            onOpenChange(false);
          }}
        >
          Cycle Repeat Mode
        </CommandItem>
      </CommandGroup>

      {/* 3. Player Morphing Modes */}
      <CommandGroup heading="Player Morphing Modes">
        <CommandItem
          icon={<Layout size={15} />}
          shortcut={['1']}
          onSelect={() => handleMode('Full')}
        >
          Full Player Mode (Standard Desktop)
        </CommandItem>
        <CommandItem
          icon={<Maximize2 size={15} />}
          shortcut={['2']}
          onSelect={() => handleMode('Cover')}
        >
          Cover Mode (1:1 Vinyl Square)
        </CommandItem>
        <CommandItem
          icon={<PictureInPicture2 size={15} />}
          shortcut={['3']}
          onSelect={() => handleMode('Micro')}
        >
          Micro Player Mode (Floating Capsule)
        </CommandItem>
        <CommandItem
          icon={<Circle size={15} />}
          shortcut={['4']}
          onSelect={() => handleMode('Nano')}
        >
          Nano Mode (Progress Ring Orb)
        </CommandItem>
      </CommandGroup>

      {/* 4. Volume Adjustments */}
      <CommandGroup heading="Volume Adjustments">
        <CommandItem
          icon={muted ? <Volume2 size={15} /> : <VolumeX size={15} />}
          shortcut={['M']}
          onSelect={() => {
            triggerHaptic('tick');
            toggleMute();
            onOpenChange(false);
          }}
        >
          {muted ? 'Unmute Volume' : 'Mute Audio'}
        </CommandItem>
        <CommandItem
          icon={<Volume2 size={15} />}
          shortcut={['25%']}
          onSelect={() => handleVolume(0.25)}
        >
          Volume: 25% (Whisper)
        </CommandItem>
        <CommandItem
          icon={<Volume2 size={15} />}
          shortcut={['50%']}
          onSelect={() => handleVolume(0.5)}
        >
          Volume: 50% (Comfortable)
        </CommandItem>
        <CommandItem
          icon={<Volume2 size={15} />}
          shortcut={['75%']}
          onSelect={() => handleVolume(0.75)}
        >
          Volume: 75% (Focused)
        </CommandItem>
        <CommandItem
          icon={<Volume2 size={15} />}
          shortcut={['100%']}
          onSelect={() => handleVolume(1.0)}
        >
          Volume: 100% (Maximum Output)
        </CommandItem>
      </CommandGroup>

      {/* 5. Sleep Timer Settings */}
      <CommandGroup heading="Sleep Timer">
        <CommandItem
          icon={<Timer size={15} />}
          shortcut={['15m']}
          onSelect={() => handleSleep(15)}
        >
          Sleep in 15 Minutes
        </CommandItem>
        <CommandItem
          icon={<Timer size={15} />}
          shortcut={['30m']}
          onSelect={() => handleSleep(30)}
        >
          Sleep in 30 Minutes
        </CommandItem>
        <CommandItem
          icon={<Timer size={15} />}
          shortcut={['60m']}
          onSelect={() => handleSleep(60)}
        >
          Sleep in 60 Minutes
        </CommandItem>
        <CommandItem
          icon={<X size={15} />}
          shortcut={['Off']}
          onSelect={() => handleSleep(null)}
        >
          Disable Sleep Timer
        </CommandItem>
      </CommandGroup>

      {/* 6. Theme Switching */}
      <CommandGroup heading="Theme & Polarity">
        <CommandItem
          icon={<Sun size={15} />}
          shortcut={['Light']}
          onSelect={() => handleTheme('light')}
        >
          Porcelain Alabaster (Light Canvas)
        </CommandItem>
        <CommandItem
          icon={<Moon size={15} />}
          shortcut={['Dark']}
          onSelect={() => handleTheme('dark')}
        >
          Obsidian Neutral (Dark Canvas)
        </CommandItem>
        <CommandItem
          icon={<Sparkles size={15} />}
          shortcut={['OLED']}
          onSelect={() => handleTheme('oled')}
        >
          Cinema OLED (Pure Black #000000)
        </CommandItem>
      </CommandGroup>

      {/* 7. Conversational AI Assistant */}
      <CommandGroup heading="AI Intelligence">
        <CommandItem
          icon={<Sparkles size={15} />}
          shortcut={['⌘', 'J']}
          onSelect={() => {
            triggerHaptic('impact');
            onOpenChange(false);
            onOpenAgent?.();
          }}
        >
          Open AI Audio Assistant Dialog
        </CommandItem>
        <CommandItem
          icon={<Wand2 size={15} />}
          onSelect={() => {
            triggerHaptic('impact');
            onOpenChange(false);
            onOpenAgent?.();
            ask('Make me a focus mix');
          }}
        >
          "Make me a focus mix"
        </CommandItem>
        <CommandItem
          icon={<History size={15} />}
          onSelect={() => {
            triggerHaptic('impact');
            onOpenChange(false);
            onOpenAgent?.();
            ask('What happened in 1979?');
          }}
        >
          "What happened in 1979?"
        </CommandItem>
      </CommandGroup>
    </CommandPalette>
  );
}
