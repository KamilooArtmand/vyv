import { createStore, useStore } from '../lib/store';
import { DEFAULT_PLAYLISTS, SEED_NOTIFICATIONS, SEED_TRACKS, STATIONS } from '../data/catalog';
import type { Bookmark, BookmarkKind, NotificationItem, Playlist, Track } from '../types';

interface LibraryState {
  favorites: string[];
  bookmarks: Bookmark[];
  history: string[];
  playlists: Playlist[];
  notifications: NotificationItem[];
  /** Resume position (seconds) for podcasts and audiobooks. */
  progress: Record<string, number>;
  listenedSeconds: number;
  streak: number;
}

export const libraryStore = createStore<LibraryState>(
  {
    favorites: SEED_TRACKS.filter((t) => t.isFavorite).map((t) => t.id),
    bookmarks: [
      { kind: 'artist', id: 'neon', at: '2026-05-01T00:00:00Z' },
      { kind: 'artist', id: 'arvand', at: '2026-05-02T00:00:00Z' },
      { kind: 'album', id: 'cosmic', at: '2026-05-03T00:00:00Z' },
      { kind: 'show', id: 'signal', at: '2026-05-04T00:00:00Z' },
      { kind: 'wiki', id: 'dastgah', at: '2026-05-05T00:00:00Z' },
      { kind: 'book', id: 'rubaiyat', at: '2026-05-06T00:00:00Z' },
    ],
    history: ['track-4', 'track-2', 'track-6', 'track-1', 'track-8'],
    playlists: DEFAULT_PLAYLISTS,
    notifications: SEED_NOTIFICATIONS,
    progress: { 'rubaiyat-2': 420, 'signal-42': 960 },
    listenedSeconds: 184_320,
    streak: 12,
  },
  'vyv.library.v2',
);

/** Local imports live for the session only — blob URLs don't survive a reload. */
export const localTracksStore = createStore<{ tracks: Track[] }>({ tracks: [] });

export const allTracks = (): Track[] => [...localTracksStore.get().tracks, ...SEED_TRACKS];
export const trackById = (id?: string): Track | undefined =>
  allTracks().find((t) => t.id === id) ?? STATIONS.find((s) => s.id === id);

export const useAllTracks = () => {
  const local = useStore(localTracksStore, (s) => s.tracks);
  return local.length ? [...local, ...SEED_TRACKS] : SEED_TRACKS;
};

// ── Favorites ─────────────────────────────────────────────────
export const useIsFavorite = (id?: string) => useStore(libraryStore, (s) => !!id && s.favorites.includes(id));

export function toggleFavorite(id: string): boolean {
  const has = libraryStore.get().favorites.includes(id);
  libraryStore.set((s) => ({ favorites: has ? s.favorites.filter((f) => f !== id) : [id, ...s.favorites] }));
  return !has;
}

// ── Bookmarks ─────────────────────────────────────────────────
export const useIsBookmarked = (kind: BookmarkKind, id?: string) =>
  useStore(libraryStore, (s) => !!id && s.bookmarks.some((b) => b.kind === kind && b.id === id));

export function toggleBookmark(kind: BookmarkKind, id: string): boolean {
  const has = libraryStore.get().bookmarks.some((b) => b.kind === kind && b.id === id);
  libraryStore.set((s) => ({
    bookmarks: has
      ? s.bookmarks.filter((b) => !(b.kind === kind && b.id === id))
      : [{ kind, id, at: new Date().toISOString() }, ...s.bookmarks],
  }));
  return !has;
}

// ── History & progress ───────────────────────────────────────
export function pushHistory(id: string) {
  libraryStore.set((s) => ({ history: [id, ...s.history.filter((h) => h !== id)].slice(0, 60) }));
}

export function saveProgress(id: string, seconds: number) {
  libraryStore.set((s) => ({ progress: { ...s.progress, [id]: Math.floor(seconds) } }));
}

// ── Playlists ─────────────────────────────────────────────────
const PALETTE = ['#8b7cff', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export function createPlaylist(name: string, trackIds: string[] = [], smart = false, description = ''): Playlist {
  const pl: Playlist = {
    id: `pl-${Date.now().toString(36)}`,
    name: name.trim() || 'Untitled',
    description,
    color: PALETTE[libraryStore.get().playlists.length % PALETTE.length],
    trackIds,
    smart,
    createdAt: new Date().toISOString(),
  };
  libraryStore.set((s) => ({ playlists: [pl, ...s.playlists] }));
  return pl;
}

export function deletePlaylist(id: string) {
  libraryStore.set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
}

export function toggleInPlaylist(playlistId: string, trackId: string) {
  libraryStore.set((s) => ({
    playlists: s.playlists.map((p) =>
      p.id !== playlistId
        ? p
        : { ...p, trackIds: p.trackIds.includes(trackId) ? p.trackIds.filter((t) => t !== trackId) : [...p.trackIds, trackId] },
    ),
  }));
}

/** The agent's always-fresh daily mix, derived from history and favorites. */
export function smartMix(): Playlist {
  const { history, favorites } = libraryStore.get();
  const ids = [...new Set([...favorites, ...history, ...SEED_TRACKS.map((t) => t.id)])].slice(0, 10);
  return {
    id: 'smart-mix',
    name: 'Daily Mix',
    description: 'Tuned by your agent from what you love lately.',
    color: '#8b7cff',
    trackIds: ids,
    smart: true,
    createdAt: new Date().toISOString(),
  };
}

export const playlistById = (id?: string): Playlist | undefined =>
  id === 'smart-mix' ? smartMix() : libraryStore.get().playlists.find((p) => p.id === id);

// ── Notifications ────────────────────────────────────────────
export const useUnreadCount = () => useStore(libraryStore, (s) => s.notifications.filter((n) => !n.read).length);

export function pushNotification(n: Omit<NotificationItem, 'id' | 'time' | 'read'>) {
  const item: NotificationItem = { ...n, id: `n-${Date.now()}`, time: new Date().toISOString(), read: false };
  libraryStore.set((s) => ({ notifications: [item, ...s.notifications].slice(0, 50) }));
  return item;
}

export function markRead(id?: string) {
  libraryStore.set((s) => ({ notifications: s.notifications.map((n) => (!id || n.id === id ? { ...n, read: true } : n)) }));
}

export function clearNotifications() {
  libraryStore.set({ notifications: [] });
}

// ── Local files ──────────────────────────────────────────────
const LOCAL_COLORS = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

export async function importFiles(files: FileList | File[]): Promise<number> {
  const audioFiles = [...files].filter((f) => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac|opus)$/i.test(f.name));
  const tracks = await Promise.all(
    audioFiles.map(
      (file, i) =>
        new Promise<Track>((resolve) => {
          const url = URL.createObjectURL(file);
          const base = file.name.replace(/\.[^/.]+$/, '');
          const [maybeArtist, ...rest] = base.split(' - ');
          const t: Track = {
            id: `local-${Date.now().toString(36)}-${i}`,
            title: rest.length ? rest.join(' - ').trim() : base,
            artist: rest.length ? maybeArtist.trim() : 'Local file',
            album: 'Imported',
            durationSeconds: 0,
            filePath: url,
            dominantColorHex: LOCAL_COLORS[(Date.now() + i) % LOCAL_COLORS.length],
            isFavorite: false,
            addedAt: new Date().toISOString(),
            kind: 'music',
          };
          const probe = new Audio();
          probe.preload = 'metadata';
          probe.onloadedmetadata = () => resolve({ ...t, durationSeconds: Math.round(probe.duration) || 0 });
          probe.onerror = () => resolve(t);
          probe.src = url;
        }),
    ),
  );
  localTracksStore.set((s) => ({ tracks: [...tracks, ...s.tracks] }));
  return tracks.length;
}
