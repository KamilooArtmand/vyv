import { createStore } from '../lib/store';
import { AudioService } from '../services/audioService';
import { LyricsService } from '../services/lyricsService';
import { SEED_TRACKS } from '../data/catalog';
import { libraryStore, pushHistory, saveProgress } from './library';
import { settingsStore } from './settings';
import type { AudioDevice, LyricLine, RepeatMode, Track } from '../types';

interface PlayerState {
  track: Track | null;
  queue: Track[];
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  muted: boolean;
  lyrics: LyricLine[];
  sleepAt: number | null;
  devices: AudioDevice[];
}

export const playerStore = createStore<PlayerState>({
  track: null,
  queue: [],
  isPlaying: false,
  shuffle: false,
  repeat: 'off',
  volume: 0.85,
  muted: false,
  lyrics: [],
  sleepAt: null,
  devices: [],
});

/** High-frequency state lives apart so only the scrubber re-renders. */
export const timeStore = createStore({ time: 0, duration: 0 });

const isSpoken = (t?: Track | null) => t?.kind === 'podcast' || t?.kind === 'audiobook';

// ── Adaptive color ───────────────────────────────────────────
export function applyAccent(track: Track | null = playerStore.get().track) {
  const root = document.documentElement;
  if (settingsStore.get().adaptiveColor && track?.dominantColorHex) {
    root.style.setProperty('--accent', track.dominantColorHex);
  } else {
    root.style.removeProperty('--accent');
  }
}

// ── Media Session (lock screen, media keys, watch, car) ──────
function updateMediaSession(track: Track) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: track.album,
    artwork: track.coverUrl ? [{ src: track.coverUrl, sizes: '600x600', type: 'image/jpeg' }] : [],
  });
}

function bindMediaSession() {
  if (!('mediaSession' in navigator)) return;
  const ms = navigator.mediaSession;
  const safe = (action: MediaSessionAction, fn: MediaSessionActionHandler) => {
    try {
      ms.setActionHandler(action, fn);
    } catch {
      /* action unsupported on this platform */
    }
  };
  safe('play', () => AudioService.resume());
  safe('pause', () => AudioService.pause());
  safe('previoustrack', () => prev());
  safe('nexttrack', () => next());
  safe('seekbackward', () => skip(-15));
  safe('seekforward', () => skip(15));
  safe('seekto', (d) => d.seekTime != null && seek(d.seekTime));
}

// ── Boot ─────────────────────────────────────────────────────
let booted = false;
export function bootPlayer() {
  if (booted) return;
  booted = true;
  AudioService.initialize();
  const s = settingsStore.get();
  AudioService.setEqualizer(...s.eq);
  AudioService.setPlaybackRate(s.speed);
  AudioService.setVolume(playerStore.get().volume);

  const lastId = libraryStore.get().history[0];
  const first = SEED_TRACKS.find((t) => t.id === lastId) ?? SEED_TRACKS[0];
  load(first, SEED_TRACKS);

  let lastSaved = 0;
  AudioService.onTimeUpdate((time, duration) => {
    // Streams and blocked sources report no duration; keep the catalog value.
    timeStore.set({ time, duration: duration || playerStore.get().track?.durationSeconds || 0 });
    const { track, sleepAt } = playerStore.get();
    if (isSpoken(track) && Math.abs(time - lastSaved) > 5) {
      lastSaved = time;
      saveProgress(track!.id, time);
    }
    if (sleepAt && Date.now() >= sleepAt) {
      AudioService.pause();
      playerStore.set({ sleepAt: null });
    }
  });
  AudioService.onStateChange((isPlaying) => {
    playerStore.set({ isPlaying });
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  });
  AudioService.onPlaybackEnded(() => {
    const { repeat } = playerStore.get();
    if (repeat === 'one') {
      seek(0);
      AudioService.resume();
    } else next(true);
  });
  AudioService.getAudioDevices().then((devices) => playerStore.set({ devices }));

  settingsStore.subscribe(() => applyAccent());
  bindMediaSession();
}

function load(track: Track, queue?: Track[]) {
  playerStore.set((s) => ({
    track,
    queue: queue ?? (s.queue.some((q) => q.id === track.id) ? s.queue : [track]),
    lyrics: track.lrcLyrics ? LyricsService.parseLrc(track.lrcLyrics) : [],
  }));
  timeStore.set({ time: 0, duration: track.durationSeconds || 0 });
  applyAccent(track);
  updateMediaSession(track);
}

// ── Transport ────────────────────────────────────────────────
export function playTrack(track: Track, queue?: Track[]) {
  load(track, queue);
  if (!settingsStore.get().privateSession && !track.isRadio) pushHistory(track.id);
  AudioService.play(track.filePath);
  const resumeAt = isSpoken(track) ? libraryStore.get().progress[track.id] : 0;
  if (resumeAt) setTimeout(() => seek(resumeAt), 250);
}

export function playQueue(tracks: Track[], startIndex = 0) {
  if (!tracks.length) return;
  const { shuffle } = playerStore.get();
  const start = shuffle ? Math.floor(Math.random() * tracks.length) : startIndex;
  playTrack(tracks[start], tracks);
}

export function togglePlay() {
  const { track, queue } = playerStore.get();
  if (!track) return queue[0] && playTrack(queue[0]);
  if (AudioService.isPlaying) AudioService.pause();
  else if (!AudioService.currentTime && !AudioService.duration) playTrack(track);
  else AudioService.resume();
}

export function next(auto = false) {
  const { queue, track, shuffle, repeat } = playerStore.get();
  if (!queue.length) return;
  const idx = queue.findIndex((t) => t.id === track?.id);
  if (shuffle && queue.length > 1) {
    let n = idx;
    while (n === idx) n = Math.floor(Math.random() * queue.length);
    return playTrack(queue[n]);
  }
  if (idx === queue.length - 1 && auto && repeat === 'off') return;
  playTrack(queue[(idx + 1) % queue.length]);
}

export function prev() {
  const { queue, track } = playerStore.get();
  if (timeStore.get().time > 3) return seek(0);
  if (!queue.length) return;
  const idx = queue.findIndex((t) => t.id === track?.id);
  playTrack(queue[(idx - 1 + queue.length) % queue.length]);
}

export function seek(seconds: number) {
  AudioService.setPosition(seconds);
  timeStore.set({ time: seconds });
}

export const skip = (delta: number) => seek(Math.max(0, timeStore.get().time + delta));

export function setVolume(volume: number) {
  const v = Math.max(0, Math.min(1, volume));
  AudioService.setVolume(v);
  playerStore.set({ volume: v, muted: v === 0 });
}

export function toggleMute() {
  const { muted, volume } = playerStore.get();
  AudioService.setVolume(muted ? volume || 0.6 : 0);
  playerStore.set({ muted: !muted, volume: muted ? volume || 0.6 : volume });
}

export const toggleShuffle = () => playerStore.set((s) => ({ shuffle: !s.shuffle }));

export const cycleRepeat = () =>
  playerStore.set((s) => ({ repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off' }));

export function setSpeed(speed: number) {
  AudioService.setPlaybackRate(speed);
  settingsStore.set({ speed });
}

export function setEQ(gains: [number, number, number], preset = 'custom') {
  AudioService.setEqualizer(...gains);
  settingsStore.set({ eq: gains, eqPreset: preset });
}

export function setDevice(id: string) {
  AudioService.setAudioDevice(id);
  settingsStore.set({ deviceId: id });
}

export function setSleep(minutes: number | null) {
  playerStore.set({ sleepAt: minutes ? Date.now() + minutes * 60_000 : null });
}

export function playNext(track: Track) {
  playerStore.set((s) => {
    const q = s.queue.filter((t) => t.id !== track.id);
    const idx = q.findIndex((t) => t.id === s.track?.id);
    q.splice(idx + 1, 0, track);
    return { queue: q };
  });
}

export function addToQueue(track: Track) {
  playerStore.set((s) => ({ queue: [...s.queue.filter((t) => t.id !== track.id), track] }));
}

export function removeFromQueue(id: string) {
  playerStore.set((s) => ({ queue: s.queue.filter((t) => t.id !== id || t.id === s.track?.id) }));
}
