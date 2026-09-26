import { useSyncExternalStore } from 'react';

type Listener = () => void;
type Patch<T> = Partial<T> | ((state: T) => Partial<T>);

export interface Store<T> {
  get: () => T;
  set: (patch: Patch<T>) => void;
  subscribe: (listener: Listener) => () => void;
}

/** Minimal external store. Components subscribe to slices, so a 4 Hz
 *  time update never re-renders the library grid. */
export function createStore<T extends object>(initial: T, persistKey?: string): Store<T> {
  let state = initial;
  if (persistKey) {
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) state = { ...initial, ...JSON.parse(raw) };
    } catch {
      /* storage unavailable */
    }
  }
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set(patch) {
      const next = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...next };
      if (persistKey) {
        try {
          localStorage.setItem(persistKey, JSON.stringify(state));
        } catch {
          /* quota or private mode */
        }
      }
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStore<T extends object, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(store.subscribe, () => selector(store.get()), () => selector(store.get()));
}
