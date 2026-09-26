import { createStore } from '../lib/store';
import type { ThemePref } from '../types';

export interface Settings {
  theme: ThemePref;
  adaptiveColor: boolean;
  aura: boolean;
  reduceMotion: boolean;
  hiRes: boolean;
  normalize: boolean;
  gapless: boolean;
  crossfade: boolean;
  lyrics: boolean;
  explicit: boolean;
  dataSaver: boolean;
  offline: boolean;
  notifications: boolean;
  agentProactive: boolean;
  agentVoice: boolean;
  privateSession: boolean;
  eqPreset: string;
  eq: [number, number, number];
  speed: number;
  deviceId: string;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  adaptiveColor: true,
  aura: true,
  reduceMotion: false,
  hiRes: true,
  normalize: true,
  gapless: true,
  crossfade: false,
  lyrics: true,
  explicit: true,
  dataSaver: false,
  offline: false,
  notifications: true,
  agentProactive: true,
  agentVoice: true,
  privateSession: false,
  eqPreset: 'flat',
  eq: [0, 0, 0],
  speed: 1,
  deviceId: 'default',
};

export const settingsStore = createStore<Settings>(DEFAULT_SETTINGS, 'vyv.settings.v2');

export const EQ_PRESETS: { id: string; label: string; gains: [number, number, number] }[] = [
  { id: 'flat', label: 'Flat', gains: [0, 0, 0] },
  { id: 'bass', label: 'Bass', gains: [7, 0, -1] },
  { id: 'vocal', label: 'Vocal', gains: [-2, 5, 2] },
  { id: 'bright', label: 'Bright', gains: [-1, 1, 6] },
  { id: 'night', label: 'Night', gains: [3, -1, -5] },
];

/** Resolve the effective theme ('auto' follows the OS). */
export function resolveTheme(pref: ThemePref): 'dark' | 'light' {
  if (pref !== 'auto') return pref;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Apply a theme, with a circular reveal from the point of interaction
 *  when the View Transitions API is available. */
export function applyTheme(pref: ThemePref, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const next = resolveTheme(pref);
  const commit = () => {
    root.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0a0a0c' : '#f6f5f2');
  };
  if (root.dataset.theme === next) return commit();

  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  const reduced = settingsStore.get().reduceMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!doc.startViewTransition || reduced || !origin) return commit();

  const { x, y } = origin;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  doc.startViewTransition(commit).ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}
