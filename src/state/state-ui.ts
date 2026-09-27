// ─────────────────────────────────────────────────────────────
// state-ui.ts: UI Routes, Navigation, Settings & Auth State
// ─────────────────────────────────────────────────────────────

import { createStore } from '../core/core-store';
import { signInWith, signOutProviders } from '../services/auth';
import type { AgentMessage, AuthProvider, LinkedAccount, PlayerMode, Route, RouteName, ThemePref, User } from '../core/core-types';

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
  'video',
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

// ── Account (Google / Facebook only — vyv has no passwords) ──
// Only the public profile is kept on this device; provider tokens are used
// once to read it and never stored.
const STORAGE_KEY_AUTH = 'vyv.account.v1';

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    const u = raw ? (JSON.parse(raw) as User) : null;
    return u && Array.isArray(u.accounts) && u.accounts.length ? u : null;
  } catch {
    return null;
  }
}

export const authStore = createStore<{ user: User | null; busy: AuthProvider | null }>({ user: loadUser(), busy: null });

function saveUser(user: User | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY_AUTH);
  } catch {
    /* storage unavailable */
  }
  authStore.set({ user });
}

const PROVIDER_NAME: Record<AuthProvider, string> = { google: 'Google', facebook: 'Facebook' };

function userFrom(account: LinkedAccount): User {
  const base = (account.email?.split('@')[0] || account.name).toLowerCase().replace(/[^a-z0-9_.]/g, '');
  return {
    id: `${account.provider}:${account.sub}`,
    username: account.name,
    handle: `@${base || 'listener'}`,
    email: account.email ?? '',
    avatarUrl: account.picture ?? '',
    coverUrl: '',
    bio: '',
    followersCount: 0,
    followingCount: 0,
    provider: account.provider,
    accounts: [account],
  };
}

export const AuthService = {
  getCurrentUser: () => authStore.get().user,

  /** Sign in — or, when already signed in, link another provider to the same profile. */
  async continueWith(provider: AuthProvider): Promise<boolean> {
    if (authStore.get().busy) return false;
    authStore.set({ busy: provider });
    try {
      const account = await signInWith(provider);
      const current = authStore.get().user;
      if (current) {
        const accounts = [...current.accounts.filter((a) => a.provider !== provider), account];
        saveUser({ ...current, accounts, avatarUrl: current.avatarUrl || account.picture || '', email: current.email || account.email || '' });
        toast(`${PROVIDER_NAME[provider]} connected`, 'check');
      } else {
        saveUser(userFrom(account));
        toast(`Signed in with ${PROVIDER_NAME[provider]}`, 'check');
      }
      return true;
    } catch (e) {
      const err = e as { message?: string; code?: string };
      if (err.code !== 'cancelled') toast(err.message || 'Sign-in failed');
      return false;
    } finally {
      authStore.set({ busy: null });
    }
  },

  /** Unlink a provider. Unlinking the last one signs out. */
  disconnect(provider: AuthProvider) {
    const current = authStore.get().user;
    if (!current) return;
    const accounts = current.accounts.filter((a) => a.provider !== provider);
    if (!accounts.length) return AuthService.logout();
    saveUser({ ...current, accounts, provider: accounts[0].provider });
    toast(`${PROVIDER_NAME[provider]} disconnected`, 'check');
  },

  updateUserProfile: (username: string, handle: string, bio: string, avatarUrl: string, coverUrl: string) => {
    const current = authStore.get().user;
    if (!current) return;
    saveUser({
      ...current,
      username,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      bio,
      avatarUrl: avatarUrl || current.avatarUrl,
      coverUrl,
    });
  },

  logout: () => {
    signOutProviders();
    saveUser(null);
  },
};

// Drop the old simulated accounts from earlier prototypes.
try {
  localStorage.removeItem('vyv_player_auth_v3');
} catch {
  /* ignore */
}
