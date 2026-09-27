// ─────────────────────────────────────────────────────────────
// services/sync.ts: Per-user library sync with Supabase
//
// Signed in → pull the user's row, merge it with this device (nothing
// is lost from either side), push the result, then keep pushing local
// changes (debounced) and apply changes from the user's other devices
// in real time. Signed out / no Supabase → everything stays local.
// ─────────────────────────────────────────────────────────────

import type { Bookmark, Playlist, Track } from '../core/core-types';
import { libraryStore, remoteStore } from '../state/state-catalog';
import { authStore, settingsStore } from '../state/state-ui';
import { supabase } from './cloud';
import type { RemoteShow } from './sources';

interface LibraryRow {
  user_id: string;
  favorites: string[];
  bookmarks: Bookmark[];
  playlists: Playlist[];
  history: string[];
  progress: Record<string, number>;
  saved_items: Record<string, Track>;
  saved_shows: Record<string, RemoteShow>;
  settings: Record<string, unknown>;
  device: string | null;
  updated_at?: string;
}

const DEVICE = (() => {
  try {
    const k = 'vyv.device';
    const v = localStorage.getItem(k) || crypto.randomUUID();
    localStorage.setItem(k, v);
    return v;
  } catch {
    return crypto.randomUUID();
  }
})();

const union = <T>(a: T[], b: T[], key: (x: T) => string = String) => [...new Map([...a, ...b].map((x) => [key(x), x])).values()];

function merge(remote: Partial<LibraryRow>): Omit<LibraryRow, 'user_id' | 'device'> {
  const lib = libraryStore.get();
  const rem = remoteStore.get();
  const progress = { ...(remote.progress ?? {}) };
  for (const [id, secs] of Object.entries(lib.progress)) progress[id] = Math.max(progress[id] ?? 0, secs);
  const playlists = union(remote.playlists ?? [], lib.playlists, (p) => p.id).map((p) => {
    const local = lib.playlists.find((l) => l.id === p.id);
    return local ? { ...p, trackIds: union(p.trackIds, local.trackIds) } : p;
  });
  return {
    favorites: union(remote.favorites ?? [], lib.favorites),
    bookmarks: union(remote.bookmarks ?? [], lib.bookmarks, (b) => `${b.kind}:${b.id}`),
    playlists,
    history: union(remote.history ?? [], lib.history).slice(0, 60),
    progress,
    saved_items: { ...(remote.saved_items ?? {}), ...rem.tracks },
    saved_shows: { ...(remote.saved_shows ?? {}), ...rem.shows },
    settings: { ...(remote.settings ?? {}), ...settingsStore.get() },
  };
}

let applying = false;
function apply(row: Omit<LibraryRow, 'user_id' | 'device'>) {
  applying = true;
  libraryStore.set({ favorites: row.favorites, bookmarks: row.bookmarks, playlists: row.playlists, history: row.history, progress: row.progress });
  remoteStore.set({ tracks: row.saved_items, shows: row.saved_shows });
  applying = false;
}

function snapshot(userId: string): LibraryRow {
  const lib = libraryStore.get();
  const rem = remoteStore.get();
  return {
    user_id: userId,
    favorites: lib.favorites,
    bookmarks: lib.bookmarks,
    playlists: lib.playlists,
    history: lib.history,
    progress: lib.progress,
    saved_items: rem.tracks,
    saved_shows: rem.shows,
    settings: settingsStore.get() as unknown as Record<string, unknown>,
    device: DEVICE,
  };
}

export type SyncState = 'off' | 'syncing' | 'synced' | 'error';
let lastState: SyncState = 'off';
const listeners = new Set<(s: SyncState) => void>();
function setSyncState(s: SyncState) {
  lastState = s;
  listeners.forEach((l) => l(s));
}
export function onSyncState(cb: (s: SyncState) => void): () => void {
  listeners.add(cb);
  cb(lastState);
  return () => listeners.delete(cb);
}

/** Start syncing for the signed-in user; returns a stop function. */
export function startSync(): () => void {
  const sb = supabase;
  if (!sb) return () => {};
  let stopUser: (() => void) | null = null;

  const begin = async (userId: string) => {
    setSyncState('syncing');
    const { data, error } = await sb.from('libraries').select('*').eq('user_id', userId).maybeSingle<LibraryRow>();
    if (error) return setSyncState('error');
    const merged = merge(data ?? {});
    apply(merged);
    await sb.from('libraries').upsert({ user_id: userId, ...merged, device: DEVICE });
    setSyncState('synced');

    // Push local changes, debounced.
    let timer: number | undefined;
    const push = () => {
      if (applying) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        setSyncState('syncing');
        const { error: e } = await sb.from('libraries').upsert(snapshot(userId));
        setSyncState(e ? 'error' : 'synced');
      }, 1500);
    };
    const offs = [libraryStore.subscribe(push), remoteStore.subscribe(push), settingsStore.subscribe(push)];

    // Pull changes made on the user's other devices, live.
    const channel = sb
      .channel(`library:${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'libraries', filter: `user_id=eq.${userId}` }, (payload) => {
        const row = payload.new as LibraryRow;
        if (row.device === DEVICE) return;
        apply({ ...row, settings: row.settings });
      })
      .subscribe();

    stopUser = () => {
      window.clearTimeout(timer);
      offs.forEach((off) => off());
      sb.removeChannel(channel);
      stopUser = null;
    };
  };

  let currentId: string | null = null;
  const onUser = () => {
    const id = authStore.get().user?.id ?? null;
    if (id === currentId) return;
    stopUser?.();
    currentId = id;
    if (id) begin(id);
    else setSyncState('off');
  };
  onUser();
  const off = authStore.subscribe(onUser);
  return () => {
    off();
    stopUser?.();
  };
}
