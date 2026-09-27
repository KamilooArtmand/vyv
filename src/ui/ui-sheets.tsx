// ─────────────────────────────────────────────────────────────
// ui-sheets.tsx: Contextual Modals, Sheets & Auth Form
// ─────────────────────────────────────────────────────────────

import {
  Bookmark,
  Disc,
  Heart,
  History,
  Library,
  ListEnd,
  Loader2,
  Clapperboard,
  Compass,
  ListStart,
  Mic,
  Radio,
  ScrollText,
  Shapes,
  Users,
} from 'lucide-react';
import { useStore } from '../core/core-store';
import {
  libraryStore,
  toggleBookmark,
  toggleFavorite,
  toggleInPlaylist,
  trackById,
  useIsBookmarked,
  useIsFavorite,
} from '../state/state-catalog';
import { addToQueue, playNext } from '../state/state-player';
import { AuthService, authStore, closeSheet, navigate, toast, uiStore } from '../state/state-ui';
import { isConfigured } from '../services/auth';
import type { AuthProvider } from '../core/core-types';
import { Artwork, LogoMark, Sheet } from './ui-components';

export function TrackActionsSheet({ id }: { id: string }) {
  const track = trackById(id);
  const fav = useIsFavorite(id);
  const saved = useIsBookmarked('track', id);
  const playlists = useStore(libraryStore, (s) => s.playlists);

  if (!track) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 bg-surface-2 p-3 rounded-[var(--radius-lg)] mb-2">
        <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} className="size-12 [--art-r:8px]" />
        <div className="min-w-0">
          <div className="font-semibold truncate text-sm">{track.title}</div>
          <div className="text-xs text-fg-3 truncate">{track.artist}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          playNext(track);
          toast('Plays next', 'check');
          closeSheet();
        }}
        className="press flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 text-sm text-left"
      >
        <ListStart size={18} /> Play next
      </button>

      <button
        type="button"
        onClick={() => {
          addToQueue(track);
          toast('Added to queue', 'check');
          closeSheet();
        }}
        className="press flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 text-sm text-left"
      >
        <ListEnd size={18} /> Add to queue
      </button>

      <button
        type="button"
        onClick={() => {
          toggleFavorite(id, track);
          toast(fav ? 'Removed from liked' : 'Liked', 'heart');
        }}
        className="press flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 text-sm text-left"
      >
        <Heart size={18} className={fav ? 'fill-accent text-accent' : ''} /> {fav ? 'Liked' : 'Like'}
      </button>

      <button
        type="button"
        onClick={() => {
          toggleBookmark('track', id, track);
          toast(saved ? 'Removed bookmark' : 'Bookmarked', 'bookmark');
        }}
        className="press flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 text-sm text-left"
      >
        <Bookmark size={18} className={saved ? 'fill-current' : ''} /> {saved ? 'Bookmarked' : 'Bookmark'}
      </button>

      <div className="border-t border-line-2 mt-2 pt-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-fg-3 px-3 mb-1">Add to Playlist</div>
        {playlists.map((p) => {
          const has = p.trackIds.includes(id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleInPlaylist(p.id, id, track)}
              className="press flex items-center justify-between w-full p-3 rounded-lg hover:bg-surface-2 text-sm"
            >
              <span>{p.name}</span>
              {has && <span className="text-xs text-accent-ink font-semibold">Added</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

export function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export const PROVIDERS: { id: AuthProvider; label: string; glyph: typeof GoogleGlyph }[] = [
  { id: 'google', label: 'Google', glyph: GoogleGlyph },
  { id: 'facebook', label: 'Facebook', glyph: FacebookGlyph },
];

/** The only way into vyv: a Gmail or Facebook account. No usernames, no passwords. */
export function SocialSignIn({ onDone }: { onDone?: () => void }) {
  const busy = useStore(authStore, (s) => s.busy);
  return (
    <div className="flex flex-col gap-2.5">
      {PROVIDERS.map(({ id, label, glyph: Glyph }) => (
        <button
          key={id}
          type="button"
          disabled={!!busy}
          onClick={async () => (await AuthService.continueWith(id)) && onDone?.()}
          className="press flex h-12 w-full items-center justify-center gap-3 rounded-full bg-surface-2 text-[14.5px] font-semibold hover:bg-surface-3 disabled:opacity-60"
        >
          {busy === id ? <Loader2 size={18} className="animate-spin" /> : <Glyph className="size-5 shrink-0" />}
          <span>Continue with {label}</span>
          {!isConfigured(id) && <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-fg-3">setup</span>}
        </button>
      ))}
    </div>
  );
}

export function AuthSheet({ onDone }: { onDone?: () => void }) {
  return (
    <div className="flex flex-col gap-5 text-fg">
      <div className="flex flex-col items-center gap-3 pt-1 text-center">
        <LogoMark bare className="size-10" />
        <p className="max-w-[300px] text-[13.5px] leading-relaxed text-fg-2">
          One tap with the account you already have. Your library, playlists and bookmarks follow you everywhere.
        </p>
      </div>
      <SocialSignIn onDone={onDone} />
      <p className="text-center text-[11.5px] leading-relaxed text-fg-3">
        vyv never sees or stores a password. We only read your name, email and photo.
      </p>
    </div>
  );
}

/** More Menu Sheet: Direct access to Wiki, Timeline, Audiobooks, Podcasts, Radio, Genres, etc. */
export function MoreNavigationSheet() {
  const links = [
    { name: 'discover', label: 'Discover', desc: 'Hundreds of tracks, stations, podcasts and films', icon: Compass },
    { name: 'wiki', label: 'Music Wiki & Essays', desc: 'Modal systems, Persian dastgah & ambient history', icon: ScrollText },
    { name: 'timeline', label: 'Sonic Timeline', desc: 'Chronological music history from 1968 to 2026', icon: History },
    { name: 'podcasts', label: 'Podcasts', desc: 'Audio shows, episodes & music theory stories', icon: Mic },
    { name: 'audiobooks', label: 'Audiobooks', desc: 'Rubáiyát of Khayyám, narrations & philosophy', icon: Library },
    { name: 'radio', label: 'Live Radio', desc: 'Thousands of live stations, Kurdish first', icon: Radio },
    { name: 'video', label: 'Video', desc: 'Films, clips and archive footage', icon: Clapperboard },
    { name: 'albums', label: 'Albums & Releases', desc: 'Full LP discography and records', icon: Disc },
    { name: 'artists', label: 'Artists', desc: 'Featured vocalists and sound creators', icon: Users },
    { name: 'genres', label: 'Genres & Eras', desc: 'Sonic taxonomy and visual moodscapes', icon: Shapes },
    { name: 'bookmarks', label: 'Bookmarks', desc: 'Pinned records, chapters and sound items', icon: Bookmark },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => {
              navigate({ name: item.name as unknown as Parameters<typeof navigate>[0]['name'] });
              closeSheet();
            }}
            className="press flex items-start gap-3.5 rounded-2xl bg-surface-2 p-3.5 text-left hover:bg-surface-3 transition-colors"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-fg">
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-fg truncate">{item.label}</div>
              <div className="text-xs text-fg-3 line-clamp-1 mt-0.5">{item.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function Sheets() {
  const sheet = useStore(uiStore, (s) => s.sheet);
  const trackId = useStore(uiStore, (s) => s.sheetTrackId);

  const getTitle = () => {
    if (sheet === 'auth') return 'Sign in to vyv';
    if (sheet === 'more') return 'Explore VYV Universe';
    if (sheet === 'addto') return 'Track Options & Playlists';
    return 'Options';
  };

  return (
    <Sheet open={!!sheet} onClose={closeSheet} title={getTitle()}>
      {sheet === 'addto' && trackId && <TrackActionsSheet id={trackId} />}
      {sheet === 'auth' && <AuthSheet onDone={closeSheet} />}
      {sheet === 'more' && <MoreNavigationSheet />}
    </Sheet>
  );
}
