// ─────────────────────────────────────────────────────────────
// state-ui.ts: UI Routes, Navigation, Settings & Auth State
// ─────────────────────────────────────────────────────────────

import { createStore } from '../core/core-store';
import type { AgentMessage, PlayerMode, Route, RouteName, ThemePref, User } from '../core/core-types';

const ROUTES: RouteName[] = [
  'home',
  'search',
  'library',
  'playlist',
  'bookmarks',
  'notifications',
  'podcasts',
  'show',
  'radio',
  'audiobooks',
  'book',
  'albums',
  'album',
  'artists',
  'artist',
  'genres',
  'genre',
  'timeline',
  'wiki',
  'article',
  'profile',
  'settings',
];

const toHash = (r: Route) => `#/${r.name}${r.id ? `/${encodeURIComponent(r.id)}` : ''}`;

function parseHash(hash: string): Route | null {
  const [, name, id] = hash.split('/');
  if (!ROUTES.includes(name as RouteName)) return null;
  return { name: name as RouteName, id: id ? decodeURIComponent(id) : undefined };
}

export type Panel = 'agent' | 'queue' | 'lyrics' | null;
export type Sheet = 'more' | 'auth' | 'addto' | 'newplaylist' | null;

export interface Toast {
  id: number;
  text: string;
  icon?: 'heart' | 'bookmark' | 'check' | 'sparkles' | 'bell' | 'moon';
}

interface UIState {
  route: Route;
  back: Route[];
  forward: Route[];
  mode: PlayerMode;
  panel: Panel;
  sheet: Sheet;
  sheetTrackId?: string;
  toast: Toast | null;
  agent: AgentMessage[];
  agentBusy: boolean;
}

export const uiStore = createStore<UIState>({
  route: (typeof location !== 'undefined' && parseHash(location.hash)) || { name: 'home' },
  back: [],
  forward: [],
  mode: 'Full',
  panel: null,
  sheet: null,
  toast: null,
  agent: [],
  agentBusy: false,
});

const sameRoute = (a: Route, b: Route) => a.name === b.name && a.id === b.id;

export function navigate(route: Route) {
  const { route: current } = uiStore.get();
  if (sameRoute(current, route)) return;
  uiStore.set((s) => ({ route, back: [...s.back, current].slice(-40), forward: [], mode: 'Full', sheet: null }));
  history.pushState(null, '', toHash(route));
  document.getElementById('main-scroll')?.scrollTo({ top: 0 });
}

function stepBack() {
  const { back, route } = uiStore.get();
  const prev = back[back.length - 1];
  if (!prev) return;
  uiStore.set((s) => ({ route: prev, back: s.back.slice(0, -1), forward: [route, ...s.forward] }));
}

function stepForward() {
  const { forward, route } = uiStore.get();
  const next = forward[0];
  if (!next) return;
  uiStore.set((s) => ({ route: next, forward: s.forward.slice(1), back: [...s.back, route] }));
}

export const goBack = () => history.back();
export const goForward = () => history.forward();

// Browser / OS back & forward gestures map onto the in-app history.
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const target = parseHash(location.hash) ?? { name: 'home' };
    const { back, forward, route } = uiStore.get();
    if (sameRoute(target, route)) return;
    if (back.length && sameRoute(back[back.length - 1], target)) stepBack();
    else if (forward.length && sameRoute(forward[0], target)) stepForward();
    else uiStore.set((s) => ({ route: target, back: [...s.back, route].slice(-40), forward: [] }));
    uiStore.set({ mode: 'Full', sheet: null });
  });
}

export const setMode = (mode: PlayerMode) => uiStore.set({ mode });
export const cyclePlayerMode = () => {
  const modes: PlayerMode[] = ['Full', 'Cover', 'Micro', 'Nano'];
  const cur = uiStore.get().mode;
  setMode(modes[(modes.indexOf(cur) + 1) % modes.length]);
};

export const togglePanel = (panel: Panel) => uiStore.set((s) => ({ panel: s.panel === panel ? null : panel }));
export const openSheet = (sheet: Sheet, sheetTrackId?: string) => uiStore.set({ sheet, sheetTrackId });
export const closeSheet = () => uiStore.set({ sheet: null, sheetTrackId: undefined });

let toastTimer: number | undefined;
export function toast(text: string, icon?: Toast['icon']) {
  if (typeof window === 'undefined') return;
  window.clearTimeout(toastTimer);
  uiStore.set({ toast: { id: Date.now(), text, icon } });
  toastTimer = window.setTimeout(() => uiStore.set({ toast: null }), 2600);
}

// ── Settings ─────────────────────────────────────────────────
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

export const settingsStore = createStore<Settings>(DEFAULT_SETTINGS, 'vyv.settings.v3');

export const EQ_PRESETS: { id: string; label: string; gains: [number, number, number] }[] = [
  { id: 'flat', label: 'Flat', gains: [0, 0, 0] },
  { id: 'bass', label: 'Bass', gains: [7, 0, -1] },
  { id: 'vocal', label: 'Vocal', gains: [-2, 5, 2] },
  { id: 'bright', label: 'Bright', gains: [-1, 1, 6] },
  { id: 'night', label: 'Night', gains: [3, -1, -5] },
];

export function resolveTheme(pref: ThemePref): 'light' | 'dark' {
  if (pref !== 'auto') return pref;
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function applyTheme(pref: ThemePref, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const target = resolveTheme(pref);
  const current = root.dataset.theme;
  if (current === target) return;

  const docWithTransition = document as unknown as {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> };
  };

  const reduced = settingsStore.get().reduceMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!docWithTransition.startViewTransition || reduced || !origin) {
    root.dataset.theme = target;
    return;
  }

  const { x, y } = origin;
  const maxR = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = docWithTransition.startViewTransition(() => {
    root.dataset.theme = target;
  });
  t.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxR}px at ${x}px ${y}px)`] },
      { duration: 420, easing: 'cubic-bezier(0.2, 0.9, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}

// ── Auth Service & Store ─────────────────────────────────────
const STORAGE_KEY_AUTH = 'vyv_player_auth_v3';

let currentUser: User | null = null;
const authListeners: ((u: User | null) => void)[] = [];

function initAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (raw) currentUser = JSON.parse(raw);
  } catch {
    currentUser = null;
  }
}
initAuth();

function notifyAuth() {
  try {
    if (currentUser) localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
    else localStorage.removeItem(STORAGE_KEY_AUTH);
  } catch {}
  authListeners.forEach((l) => l(currentUser));
}

export const authStore = createStore<{ user: User | null }>({ user: currentUser });

export const AuthService = {
  getCurrentUser: () => currentUser,
  subscribe: (l: (u: User | null) => void) => {
    authListeners.push(l);
    return () => {
      const idx = authListeners.indexOf(l);
      if (idx >= 0) authListeners.splice(idx, 1);
    };
  },
  loginWithEmail: async (email: string, pass: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 400));
    if (!email || !pass) return false;
    const username = email.split('@')[0];
    currentUser = {
      id: `user-${Date.now()}`,
      username: username.charAt(0).toUpperCase() + username.slice(1),
      handle: `@${username.toLowerCase()}`,
      email,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff`,
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      bio: 'Audiophile, night playlist curator, and soundscape explorer.',
      followersCount: 142,
      followingCount: 89,
    };
    notifyAuth();
    authStore.set({ user: currentUser });
    return true;
  },
  registerWithEmail: async (username: string, email: string, pass: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 400));
    if (!username || !email || !pass) return false;
    currentUser = {
      id: `user-${Date.now()}`,
      username,
      handle: `@${username.toLowerCase().replace(/\s+/g, '')}`,
      email,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=ec4899&color=fff`,
      coverUrl: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=1200&q=80',
      bio: 'New listener enjoying crystal soundscapes on VYV.',
      followersCount: 1,
      followingCount: 10,
    };
    notifyAuth();
    authStore.set({ user: currentUser });
    return true;
  },
  loginWithOAuth: async (provider: 'Google' | 'Facebook'): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 500));
    const isGoogle = provider === 'Google';
    currentUser = {
      id: `oauth-${Date.now()}`,
      username: isGoogle ? 'Google User' : 'Facebook User',
      handle: isGoogle ? '@google_listener' : '@fb_listener',
      email: isGoogle ? 'user@gmail.com' : 'user@facebook.com',
      avatarUrl: isGoogle
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80',
      bio: `Connected with ${provider} account.`,
      followersCount: 380,
      followingCount: 215,
    };
    notifyAuth();
    authStore.set({ user: currentUser });
    return true;
  },
  updateUserProfile: (username: string, handle: string, bio: string, avatarUrl: string, coverUrl: string) => {
    if (!currentUser) return;
    currentUser = {
      ...currentUser,
      username,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      bio,
      avatarUrl: avatarUrl || currentUser.avatarUrl,
      coverUrl: coverUrl || currentUser.coverUrl,
    };
    notifyAuth();
    authStore.set({ user: currentUser });
  },
  toggleFollow: () => {
    if (!currentUser) return;
    currentUser = { ...currentUser, followersCount: currentUser.followersCount + 1 };
    notifyAuth();
    authStore.set({ user: currentUser });
  },
  logout: () => {
    currentUser = null;
    notifyAuth();
    authStore.set({ user: null });
  },
};
