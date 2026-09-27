// ─────────────────────────────────────────────────────────────
// core-store.ts: Unified State Store Primitive & Helpers
// ─────────────────────────────────────────────────────────────

import { useSyncExternalStore } from 'react';

type Listener = () => void;
type Patch<T> = Partial<T> | ((state: T) => Partial<T>);

export interface Store<T> {
  get: () => T;
  set: (patch: Patch<T>) => void;
  subscribe: (listener: Listener) => () => void;
}

/** Lightweight external store with selective slice subscription. */
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
