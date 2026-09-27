// ─────────────────────────────────────────────────────────────
// state-player.ts: Audio Playback Engine, Equalizer & Queue
// ─────────────────────────────────────────────────────────────

import { createStore } from '../core/core-store';
import type { AudioDevice, LyricLine, RepeatMode, Track } from '../core/core-types';
import { libraryStore, pushHistory, saveProgress, SEED_TRACKS } from './state-catalog';
import { settingsStore } from './state-ui';

const isSpoken = (t?: Track | null) => t?.kind === 'podcast' || t?.kind === 'audiobook';

// ── Adaptive color: tint --accent from the playing track's artwork ──
export function applyAccent(track: Track | null = playerStore.get().track) {
  const root = document.documentElement;
  if (settingsStore.get().adaptiveColor && track?.dominantColorHex) {
    root.style.setProperty('--accent', track.dominantColorHex);
  } else {
    root.style.removeProperty('--accent');
  }
}

// ── Media Session: lock screen, media keys, headsets, car ────────
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
  safe('play', () => AudioEngine.play());
  safe('pause', () => AudioEngine.pause());
  safe('previoustrack', () => prev());
  safe('nexttrack', () => next());
  safe('seekbackward', () => skip(-15));
  safe('seekforward', () => skip(15));
  safe('seekto', (d) => d.seekTime != null && seek(d.seekTime));
}

// ── Audio Core Service ───────────────────────────────────────
export class AudioEngine {
  private static audio: HTMLAudioElement | null = null;
  private static audioContext: AudioContext | null = null;
  private static sourceNode: MediaElementAudioSourceNode | null = null;
  private static analyserNode: AnalyserNode | null = null;
  private static lowFilter: BiquadFilterNode | null = null;
  private static midFilter: BiquadFilterNode | null = null;
  private static highFilter: BiquadFilterNode | null = null;

  public static isPlaying: boolean = false;
  public static currentTime: number = 0;
  public static duration: number = 0;
  public static volume: number = 0.85;
  private static rate = 1;
  private static eq: [number, number, number] = [0, 0, 0];

  private static onEndedCallbacks: (() => void)[] = [];
  private static onTimeUpdateCallbacks: ((time: number, duration: number) => void)[] = [];
  private static onStateChangeCallbacks: ((isPlaying: boolean) => void)[] = [];
  private static isInitialized = false;
  private static dataArray: Uint8Array | null = null;

  static initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.volume = this.volume;
    this.audio.preload = 'auto';

    const emitTime = () => {
      if (this.audio) {
        this.currentTime = this.audio.currentTime || 0;
        this.duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
        this.onTimeUpdateCallbacks.forEach((cb) => cb(this.currentTime, this.duration));
      }
    };
    this.audio.addEventListener('timeupdate', emitTime);
    this.audio.addEventListener('loadedmetadata', emitTime);

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.notifyState();
      this.onEndedCallbacks.forEach((cb) => cb());
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notifyState();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notifyState();
    });
  }

  private static setupAudioContext(): void {
    if (this.audioContext || !this.audio) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

      this.lowFilter = this.audioContext.createBiquadFilter();
      this.lowFilter.type = 'lowshelf';
      this.lowFilter.frequency.value = 320;
      this.lowFilter.gain.value = this.eq[0];

      this.midFilter = this.audioContext.createBiquadFilter();
      this.midFilter.type = 'peaking';
      this.midFilter.frequency.value = 1000;
      this.midFilter.Q.value = 1.0;
      this.midFilter.gain.value = this.eq[1];

      this.highFilter = this.audioContext.createBiquadFilter();
      this.highFilter.type = 'highshelf';
      this.highFilter.frequency.value = 3200;
      this.highFilter.gain.value = this.eq[2];

      this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.lowFilter);
      this.lowFilter.connect(this.midFilter);
      this.midFilter.connect(this.highFilter);
      this.highFilter.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);
    } catch {
      /* AudioContext fallback */
    }
  }

  static async loadTrack(url: string, autoPlay: boolean = false): Promise<void> {
    this.initialize();
    if (!this.audio) return;
    this.audio.src = url;
    this.audio.playbackRate = this.rate;
    this.audio.load();
    if (autoPlay) await this.play();
  }

  static async play(): Promise<void> {
    this.initialize();
    if (!this.audio) return;
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume().catch(() => {});
    } else if (!this.audioContext) {
      this.setupAudioContext();
    }
    try {
      await this.audio.play();
      this.isPlaying = true;
      this.notifyState();
    } catch {
      this.isPlaying = false;
      this.notifyState();
    }
  }

  static pause(): void {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
      this.notifyState();
    }
  }

  static seek(seconds: number): void {
    if (this.audio && Number.isFinite(seconds)) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
    }
  }

  static setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) this.audio.volume = this.volume;
  }

  static setPlaybackRate(rate: number): void {
    this.rate = rate;
    if (this.audio) this.audio.playbackRate = rate;
  }

  static setEQ(gains: [number, number, number]): void {
    this.eq = gains;
    if (this.lowFilter) this.lowFilter.gain.value = gains[0];
    if (this.midFilter) this.midFilter.gain.value = gains[1];
    if (this.highFilter) this.highFilter.gain.value = gains[2];
  }

  static async setSinkId(deviceId: string): Promise<boolean> {
    if (this.audio && 'setSinkId' in this.audio) {
      try {
        await (this.audio as unknown as { setSinkId: (id: string) => Promise<void> }).setSinkId(deviceId);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  static fillSpectrum(out: Float32Array): void {
    if (!this.analyserNode || !this.isPlaying || !this.dataArray) {
      out.fill(0);
      return;
    }
    (this.analyserNode as unknown as { getByteFrequencyData: (arr: Uint8Array) => void }).getByteFrequencyData(this.dataArray);
    const step = this.dataArray.length / out.length;
    for (let i = 0; i < out.length; i++) {
      out[i] = (this.dataArray[Math.floor(i * step)] || 0) / 255;
    }
  }

  static onEnded(cb: () => void) { this.onEndedCallbacks.push(cb); }
  static onTimeUpdate(cb: (t: number, d: number) => void) { this.onTimeUpdateCallbacks.push(cb); }
  static onStateChange(cb: (p: boolean) => void) { this.onStateChangeCallbacks.push(cb); }

  private static notifyState(): void {
    this.onStateChangeCallbacks.forEach((cb) => cb(this.isPlaying));
  }
}

// ── Lyrics Parser ────────────────────────────────────────────
export function parseLrc(content?: string): LyricLine[] {
  if (!content) return [];
  const lines = content.split('\n');
  const lyrics: LyricLine[] = [];
  const regex = /\[(\d{1,2}):(\d{1,2}(?:\.\d+)?)\](.*)/;
  for (const raw of lines) {
    const m = regex.exec(raw.trim());
    if (m) {
      const text = m[3].trim();
      if (text) lyrics.push({ time: parseInt(m[1], 10) * 60 + parseFloat(m[2]), text });
    }
  }
  return lyrics.sort((a, b) => a.time - b.time);
}

export function getActiveLyricIndex(lyrics: LyricLine[], time: number): number {
  if (!lyrics.length) return -1;
  let active = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= time) active = i;
    else break;
  }
  return active;
}

// ── Player Store & Actions ───────────────────────────────────
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
  track: SEED_TRACKS[0] || null,
  queue: SEED_TRACKS,
  isPlaying: false,
  shuffle: false,
  repeat: 'off',
  volume: 0.85,
  muted: false,
  lyrics: parseLrc(SEED_TRACKS[0]?.lrcLyrics),
  sleepAt: null,
  devices: [],
});

export const timeStore = createStore({ time: 0, duration: 0 });

let sleepTimer: number | undefined;

function scheduleSleep(mins: number | null) {
  window.clearTimeout(sleepTimer);
  if (!mins) {
    playerStore.set({ sleepAt: null });
    return;
  }
  playerStore.set({ sleepAt: Date.now() + mins * 60_000 });
  sleepTimer = window.setTimeout(() => {
    AudioEngine.pause();
    playerStore.set({ isPlaying: false, sleepAt: null });
  }, mins * 60_000);
}

let booted = false;
export function bootPlayer() {
  if (booted) return;
  booted = true;
  AudioEngine.initialize();
  AudioEngine.onTimeUpdate((time, duration) => {
    timeStore.set({ time, duration });
    const { track } = playerStore.get();
    if (track && isSpoken(track)) {
      saveProgress(track.id, time);
    }
  });

  AudioEngine.onStateChange((isPlaying) => {
    playerStore.set({ isPlaying });
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  });
  AudioEngine.onEnded(() => next(true));

  // Audio outputs
  if (navigator.mediaDevices?.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then((devs) => {
      const outs = devs.filter((d) => d.kind === 'audiooutput').map((d) => ({ id: d.deviceId, name: d.label || 'Speaker' }));
      if (outs.length) playerStore.set({ devices: outs });
    }).catch(() => {});
  }

  // Re-tint the accent whenever "Adaptive color" is toggled.
  settingsStore.subscribe(() => applyAccent());
  bindMediaSession();
}

export function playTrack(track: Track, newQueue?: Track[]) {
  const currentQ = playerStore.get().queue;
  const queue = newQueue ?? (currentQ.some((t) => t.id === track.id) ? currentQ : [track, ...currentQ]);
  const lyrics = parseLrc(track.lrcLyrics);

  playerStore.set({ track, queue, isPlaying: true, lyrics });
  timeStore.set({ time: 0, duration: track.durationSeconds });
  applyAccent(track);
  updateMediaSession(track);
  AudioEngine.loadTrack(track.filePath, true);

  if (!settingsStore.get().privateSession && !track.isRadio) pushHistory(track.id);

  // Resume podcasts/audiobooks from where you left off.
  const resumeAt = isSpoken(track) ? libraryStore.get().progress[track.id] : 0;
  if (resumeAt) setTimeout(() => AudioEngine.seek(resumeAt), 250);
}

export function playQueue(tracks: Track[], startIdx = 0) {
  if (!tracks.length) return;
  playTrack(tracks[startIdx], tracks);
}

export function togglePlay() {
  const { track, isPlaying } = playerStore.get();
  if (!track) {
    playTrack(SEED_TRACKS[0]);
    return;
  }
  if (isPlaying) AudioEngine.pause();
  else AudioEngine.play();
}

export function next(auto = false) {
  const { queue, track, repeat, shuffle } = playerStore.get();
  if (!queue.length) return;
  const idx = queue.findIndex((t) => t.id === track?.id);
  if (repeat === 'one' && auto && track) {
    AudioEngine.seek(0);
    AudioEngine.play();
    return;
  }
  let nextIdx = idx + 1;
  if (shuffle) nextIdx = Math.floor(Math.random() * queue.length);
  if (nextIdx >= queue.length) {
    if (repeat === 'all') nextIdx = 0;
    else return;
  }
  playTrack(queue[nextIdx], queue);
}

export function prev() {
  if (timeStore.get().time > 3) {
    AudioEngine.seek(0);
    return;
  }
  const { queue, track } = playerStore.get();
  const idx = queue.findIndex((t) => t.id === track?.id);
  const prevIdx = idx > 0 ? idx - 1 : queue.length - 1;
  if (queue[prevIdx]) playTrack(queue[prevIdx], queue);
}

export function seek(secs: number) { AudioEngine.seek(secs); }
export function skip(delta: number) { AudioEngine.seek(timeStore.get().time + delta); }

export function setVolume(vol: number) {
  playerStore.set({ volume: vol, muted: false });
  AudioEngine.setVolume(vol);
}

export function toggleMute() {
  const { muted, volume } = playerStore.get();
  if (muted) {
    AudioEngine.setVolume(volume);
    playerStore.set({ muted: false });
  } else {
    AudioEngine.setVolume(0);
    playerStore.set({ muted: true });
  }
}

export function toggleShuffle() { playerStore.set((s) => ({ shuffle: !s.shuffle })); }
export function cycleRepeat() {
  const modes: RepeatMode[] = ['off', 'all', 'one'];
  playerStore.set((s) => ({ repeat: modes[(modes.indexOf(s.repeat) + 1) % modes.length] }));
}

export function setSpeed(speed: number) {
  settingsStore.set({ speed });
  AudioEngine.setPlaybackRate(speed);
}

export function setEQ(eq: [number, number, number], preset?: string) {
  settingsStore.set({ eq, eqPreset: preset ?? 'custom' });
  AudioEngine.setEQ(eq);
}

export function setSleep(mins: number | null) { scheduleSleep(mins); }
export function setDevice(deviceId: string) {
  settingsStore.set({ deviceId });
  AudioEngine.setSinkId(deviceId);
}

export function addToQueue(track: Track) {
  playerStore.set((s) => ({ queue: [...s.queue.filter((t) => t.id !== track.id), track] }));
}

export function playNext(track: Track) {
  playerStore.set((s) => {
    const curIdx = s.queue.findIndex((t) => t.id === s.track?.id);
    const filtered = s.queue.filter((t) => t.id !== track.id);
    return { queue: [...filtered.slice(0, curIdx + 1), track, ...filtered.slice(curIdx + 1)] };
  });
}

export function removeFromQueue(trackId: string) {
  playerStore.set((s) => ({ queue: s.queue.filter((t) => t.id !== trackId) }));
}
