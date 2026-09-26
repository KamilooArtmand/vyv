import { interpret } from '../services/aiAgentService';
import { allTracks, createPlaylist, libraryStore, toggleBookmark, toggleFavorite } from './library';
import { cycleRepeat, next, playQueue, playTrack, playerStore, prev, setSleep, setSpeed, setVolume, toggleShuffle } from './player';
import { AudioService } from '../services/audioService';
import { applyTheme, settingsStore } from './settings';
import { navigate, setMode, toast, uiStore } from './ui';
import type { AgentMessage, Playlist } from '../types';

let lastMix: Playlist | null = null;
const id = () => Math.random().toString(36).slice(2, 9);

function say(msg: Omit<AgentMessage, 'id'>) {
  uiStore.set((s) => ({ agent: [...s.agent, { ...msg, id: id() }].slice(-40) }));
}

/** Send a prompt to the agent, execute the resulting action and log the dialogue. */
export function ask(input: string) {
  const text = input.trim();
  if (!text) return;
  say({ role: 'user', text });
  uiStore.set({ agentBusy: true });

  // A short, human-feeling pause before the agent answers.
  setTimeout(() => {
    uiStore.set({ agentBusy: false });

    if (/save (it |this )?(as|to) (a )?playlist|ذخیره.*پلی/.test(text.toLowerCase()) && lastMix) {
      const pl = createPlaylist(lastMix.name, lastMix.trackIds, true, lastMix.description);
      say({ role: 'agent', text: `Saved “${pl.name}” to your library.`, suggestions: ['Open library'] });
      return;
    }

    const { track } = playerStore.get();
    const reply = interpret(text, { tracks: allTracks(), current: track, history: libraryStore.get().history });
    const a = reply.action;

    switch (a.type) {
      case 'play':
        if (a.track) playTrack(a.track, a.queue);
        else AudioService.resume();
        break;
      case 'pause':
        AudioService.pause();
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
        applyTheme(a.theme, { x: innerWidth / 2, y: innerHeight / 2 });
        break;
      case 'volume':
        setVolume(a.value);
        break;
      case 'shuffle':
        toggleShuffle();
        break;
      case 'repeat':
        cycleRepeat();
        break;
      case 'like':
        if (track) toggleFavorite(track.id);
        break;
      case 'bookmark':
        if (track) toggleBookmark('track', track.id);
        break;
      case 'sleep':
        setSleep(a.minutes);
        break;
      case 'speed':
        setSpeed(a.value);
        break;
      case 'mode':
        setMode(a.mode);
        break;
      case 'playlist': {
        lastMix = a.playlist;
        const tracks = allTracks().filter((t) => a.playlist.trackIds.includes(t.id));
        playQueue(tracks);
        break;
      }
    }

    say({ role: 'agent', text: reply.text, cards: reply.cards, suggestions: reply.suggestions });
    if (uiStore.get().panel !== 'agent') toast(reply.text, 'sparkles');
  }, 380);
}

// ── Voice ────────────────────────────────────────────────────
type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
};

export const voiceSupported = () =>
  typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

/** Push-to-talk via the Web Speech API. Returns a stop function. */
export function listen(onText: (t: string) => void, onEnd: () => void): () => void {
  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Ctor) {
    onEnd();
    return () => {};
  }
  const rec: Recognition = new Ctor();
  rec.lang = navigator.language || 'en-US';
  rec.interimResults = false;
  rec.onresult = (e) => onText(e.results[0][0].transcript);
  rec.onend = onEnd;
  rec.onerror = onEnd;
  rec.start();
  return () => rec.stop();
}
