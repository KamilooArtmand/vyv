// ─────────────────────────────────────────────────────────────
// services/snapshot.ts: Bundled catalogue (several hundred real items)
//
// public/catalog/snapshot.json is generated from the open sources by
// scripts/snapshot-catalog.mjs and refreshed daily in CI. The app shows
// it instantly and falls back to it when a live API is unreachable.
// ─────────────────────────────────────────────────────────────

import type { Track } from '../core/core-types';
import type { ArchiveItem, RemoteShow } from './sources';

export interface CatalogSnapshot {
  version: number;
  generatedAt: string;
  radio: { kurdish: Track[]; world: Track[]; byTag: Record<string, Track[]> } | null;
  music: Record<string, Track[]> | null;
  heritage: { kurdish: ArchiveItem[]; world: ArchiveItem[]; books: ArchiveItem[]; films: ArchiveItem[] } | null;
  podcasts: (RemoteShow & { group?: string })[] | null;
}

let pending: Promise<CatalogSnapshot | null> | null = null;
let loaded: CatalogSnapshot | null = null;

export function loadSnapshot(): Promise<CatalogSnapshot | null> {
  pending ??= fetch('/catalog/snapshot.json')
    .then((r) => (r.ok ? (r.json() as Promise<CatalogSnapshot>) : null))
    .then((s) => (loaded = s))
    .catch(() => {
      pending = null; // allow a retry later
      return null;
    });
  return pending;
}

/** Synchronous access once loaded (null before). */
export const snapshotNow = () => loaded;

/** Items the snapshot captured, for counts on screen. */
export function snapshotSize(s: CatalogSnapshot | null): number {
  if (!s) return 0;
  const radio = s.radio ? s.radio.kurdish.length + s.radio.world.length + Object.values(s.radio.byTag).reduce((a, l) => a + l.length, 0) : 0;
  const music = s.music ? Object.values(s.music).reduce((a, l) => a + l.length, 0) : 0;
  const heritage = s.heritage ? Object.values(s.heritage).reduce((a, l) => a + l.length, 0) : 0;
  return radio + music + heritage + (s.podcasts?.length ?? 0);
}

const norm = (x: string) => x.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
export const matches = (q: string, ...fields: (string | undefined)[]) => {
  const n = norm(q);
  return fields.some((f) => f && norm(f).includes(n));
};
