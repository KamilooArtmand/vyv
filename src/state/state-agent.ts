// ─────────────────────────────────────────────────────────────
// state-agent.ts: Natural Language Music Agent & Voice
// ─────────────────────────────────────────────────────────────

import type { AgentAction, AgentContext, AgentMessage, AgentReply, Mood, RouteName, Track } from '../core/core-types';
import { allTracks, createPlaylist, libraryStore, toggleBookmark, toggleFavorite } from './state-catalog';
import { AudioEngine, cycleRepeat, next, playQueue, playTrack, playerStore, prev, setSleep, setSpeed, setVolume, toggleShuffle } from './state-player';
import { applyTheme, navigate, settingsStore, toast, uiStore } from './state-ui';

const SECTIONS: [RegExp, RouteName][] = [
  [/setting|preference|تنظیم/, 'settings'],
  [/profile|account|پروفایل/, 'profile'],
  [/playlist|library|کتابخانه|پلی.?لیست/, 'library'],
  [/bookmark|saved|نشان/, 'bookmarks'],
  [/notification|inbox|اعلان/, 'notifications'],
  [/podcast|پادکست/, 'podcasts'],
  [/radio|station|رادیو/, 'radio'],
  [/audiobook|book|کتاب/, 'audiobooks'],
  [/album|آلبوم/, 'albums'],
  [/artist|هنرمند|خواننده/, 'artists'],
  [/genre|ژانر|سبک/, 'genres'],
  [/timeline|year by year|تایم.?لاین|سال/, 'timeline'],
  [/wiki|history|ویکی|تاریخ/, 'wiki'],
  [/search|جستجو/, 'search'],
  [/home|خانه/, 'home'],
];

const MOODS: [RegExp, Mood, string][] = [
  [/calm|relax|chill|sleep|unwind|آرام|آروم|خواب/, 'calm', 'Calm'],
  [/focus|study|work|concentrat|code|تمرکز|مطالعه|کار/, 'focus', 'Focus'],
  [/energy|workout|gym|party|upbeat|run|انرژی|ورزش|شاد/, 'energy', 'Energy'],
  [/night|drive|late|midnight|شب|رانندگی/, 'night', 'Night Drive'],
  [/happy|sunny|morning|bright|صبح|خوشحال/, 'happy', 'Sunny'],
  [/sad|melanchol|rain|blue|غم|بارون|باران|دلتنگ/, 'melancholy', 'Rainy Day'],
];

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();

export function interpret(input: string, ctx: AgentContext): AgentReply {
  const raw = norm(input);
  const { tracks } = ctx;

  if (!raw) return { text: 'Ask for a mood, an artist, a year — or tell me what to do.', action: { type: 'none' } };

  // Theme
  if (/(dark|obsidian|تاریک)\s*(mode|theme)?/.test(raw) && !/drive|play/.test(raw)) {
    return { text: 'Obsidian on. Easy on the eyes.', action: { type: 'theme', theme: 'dark' } };
  }
  if (/(light|porcelain|روشن)\s*(mode|theme)?/.test(raw) && !/play/.test(raw)) {
    return { text: 'Porcelain on. Bright and airy.', action: { type: 'theme', theme: 'light' } };
  }

  // Playback commands
  if (/^(pause|stop|quiet|متوقف|توقف|سکوت)/.test(raw)) return { text: 'Paused.', action: { type: 'pause' } };
  if (/^(next|skip|بعدی|رد کن)/.test(raw)) return { text: 'Skipping.', action: { type: 'next' } };
  if (/^(prev|previous|back|قبلی)/.test(raw)) return { text: 'Going back.', action: { type: 'prev' } };

  // Mood request
  for (const [re, mood, label] of MOODS) {
    if (re.test(raw)) {
      const candidates = tracks.filter((t: Track) => t.moods?.includes(mood));
      const pool = candidates.length ? candidates : tracks;
      return { text: `Here’s your ${label} mix.`, action: { type: 'play', track: pool[0], queue: pool } };
    }
  }

  // Navigation
  for (const [re, route] of SECTIONS) {
    if (re.test(raw)) return { text: `Opening ${route}.`, action: { type: 'navigate', route: { name: route } } };
  }

  // Default fallback: play general pool
  return { text: 'Playing your personalized catalog.', action: { type: 'play', track: tracks[0], queue: tracks } };
}

export function predict(ctx: { tracks: Track[]; current: Track | null; history: string[] }): { mood: Mood; line: string } {
  const h = new Date().getHours();
  if (h < 5 || h >= 22) return { mood: 'night', line: 'Night drive soundscapes' };
  if (h < 12) return { mood: 'happy', line: 'Morning calm and bright tones' };
  if (h < 18) return { mood: 'focus', line: 'Deep focus flow' };
  return { mood: 'calm', line: 'Evening tranquil drift' };
}

const id = () => Math.random().toString(36).slice(2, 9);
function say(msg: Omit<AgentMessage, 'id'>) {
  uiStore.set((s) => ({ agent: [...s.agent, { ...msg, id: id() }].slice(-40) }));
}

export function ask(input: string) {
  const text = input.trim();
  if (!text) return;
  say({ role: 'user', text });
  uiStore.set({ agentBusy: true });

  setTimeout(() => {
    uiStore.set({ agentBusy: false });
    const { track } = playerStore.get();
    const reply = interpret(text, { tracks: allTracks(), current: track, history: libraryStore.get().history });
    const a = reply.action;

    switch (a.type) {
      case 'play':
        if (a.track) playTrack(a.track, a.queue);
        else AudioEngine.play();
        break;
      case 'pause':
        AudioEngine.pause();
        break;
      case 'next':
        next();
        break;
      case 'prev':
        prev();
        break;
      case 'navigate':
        navigate(a.route);
        break;
      case 'theme':
        settingsStore.set({ theme: a.theme });
        applyTheme(a.theme);
        break;
      case 'volume':
        setVolume(a.value);
        break;
      case 'shuffle':
        toggleShuffle();
        break;
      case 'sleep':
        setSleep(a.minutes);
        break;
    }
    say({ role: 'agent', text: reply.text, suggestions: reply.suggestions, cards: reply.cards });
  }, 250);
}
