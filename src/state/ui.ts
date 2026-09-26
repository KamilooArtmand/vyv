import { createStore } from '../lib/store';
import type { AgentMessage, PlayerMode, Route, RouteName } from '../types';

const ROUTES: RouteName[] = ['home', 'search', 'library', 'playlist', 'bookmarks', 'notifications', 'podcasts', 'show', 'radio', 'audiobooks', 'book', 'albums', 'album', 'artists', 'artist', 'genres', 'genre', 'timeline', 'wiki', 'article', 'profile', 'settings'];

// ── Deep links: #/artist/neon ────────────────────────────────
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

export const goBack = () => history.back();
export const goForward = () => history.forward();

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

export function togglePanel(panel: Exclude<Panel, null>) {
  uiStore.set((s) => ({ panel: s.panel === panel ? null : panel }));
}

export const openSheet = (sheet: Sheet, sheetTrackId?: string) => uiStore.set({ sheet, sheetTrackId });
export const closeSheet = () => uiStore.set({ sheet: null, sheetTrackId: undefined });

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(text: string, icon?: Toast['icon']) {
  clearTimeout(toastTimer);
  uiStore.set({ toast: { id: Date.now(), text, icon } });
  toastTimer = setTimeout(() => uiStore.set({ toast: null }), 2600);
}
