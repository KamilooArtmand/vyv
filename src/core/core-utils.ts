// ─────────────────────────────────────────────────────────────
// core-utils.ts: Formatters, Media Hooks & Entity Resolution
// ─────────────────────────────────────────────────────────────

import { useSyncExternalStore } from 'react';
import {
  BookOpen,
  Clapperboard,
  Disc3,
  Landmark,
  ListMusic,
  Mic2,
  Music2,
  Podcast,
  RadioTower,
  Shapes,
  type LucideIcon,
} from 'lucide-react';
import type { BookmarkKind, Route } from './core-types';

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export function formatTime(secs: number): string {
  if (!Number.isFinite(secs) || secs < 0) return '0:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const ss = s.toString().padStart(2, '0');
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

export function formatDuration(secs: number): string {
  const m = Math.round(secs / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min`;
}

export function compact(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Good night';
}

export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w[0] ?? ''))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export interface Entity {
  kind: BookmarkKind;
  id: string;
  title: string;
  subtitle: string;
  color: string;
  src?: string;
  glyph?: LucideIcon;
  circle?: boolean;
  route?: Route;
}

export const KIND_META: Record<BookmarkKind, { label: string; icon: LucideIcon }> = {
  track: { label: 'Tracks', icon: Music2 },
  artist: { label: 'Artists', icon: Mic2 },
  album: { label: 'Albums', icon: Disc3 },
  playlist: { label: 'Playlists', icon: ListMusic },
  show: { label: 'Podcasts', icon: Podcast },
  book: { label: 'Books', icon: BookOpen },
  station: { label: 'Stations', icon: RadioTower },
  wiki: { label: 'Wiki', icon: Landmark },
  genre: { label: 'Genres', icon: Shapes },
  video: { label: 'Videos', icon: Clapperboard },
};
