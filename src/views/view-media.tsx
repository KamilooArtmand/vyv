// ─────────────────────────────────────────────────────────────
// view-media.tsx: Podcasts, Audiobooks, Radio, Library & Profile
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Bookmark, Clock, Heart, History, ListMusic, LogOut, RadioTower, Sparkles, Trash2 } from 'lucide-react';
import { useStore } from '../core/core-store';
import { formatDuration } from '../core/core-utils';
import {
  BOOKS,
  SHOWS,
  STATIONS,
  chapterToTrack,
  deletePlaylist,
  episodeToTrack,
  libraryStore,
  smartMix,
  trackById,
  useAllTracks,
} from '../state/state-catalog';
import { playQueue, playTrack } from '../state/state-player';
import { AuthService, authStore, closeSheet, navigate, openSheet, toast } from '../state/state-ui';
import {
  Artwork,
  CollectionHeader,
  EmptyState,
  Grid,
  IconButton,
  LiveBadge,
  MediaCard,
  PageHeader,
  PlayFab,
  Section,
  Shelf,
  TrackList,
  meshGradient,
} from '../ui/ui-components';
import type { Audiobook, Show, Track } from '../core/core-types';

// ── Radio View ───────────────────────────────────────────────
export function RadioView() {
  return (
    <div>
      <PageHeader title="Live Radio" subtitle="Non-stop global high-fidelity streams." />
      <Grid min={240}>
        {STATIONS.map((s) => (
          <div
            key={s.id}
            role="button"
            tabIndex={0}
            onClick={() => playTrack(s, STATIONS)}
            className="glass press flex cursor-pointer items-center gap-4 rounded-[var(--radius-xl)] p-4 hover:bg-surface-2"
          >
            <Artwork seed={s.id} color={s.dominantColorHex} src={s.coverUrl} className="size-16 [--art-r:14px]" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-semibold">{s.title}</div>
              <div className="truncate text-xs text-fg-3">{s.artist}</div>
              <div className="mt-2"><LiveBadge /></div>
            </div>
            <PlayFab onClick={() => playTrack(s, STATIONS)} />
          </div>
        ))}
      </Grid>
    </div>
  );
}

// ── Podcasts View ────────────────────────────────────────────
export function PodcastsView() {
  return (
    <div>
      <PageHeader title="Podcasts" subtitle="Conversations on music tech, sound and brain science." />
      <Grid min={240}>
        {SHOWS.map((s) => (
          <MediaCard
            key={s.id}
            entity={{ kind: 'show', id: s.id, title: s.title, subtitle: s.host, color: s.color, route: { name: 'show', id: s.id } }}
            onPlay={() => playTrack(episodeToTrack(s, s.episodes[0]))}
          />
        ))}
      </Grid>
    </div>
  );
}

export function ShowView({ id }: { id?: string }) {
  const show = SHOWS.find((s) => s.id === id);
  if (!show) return <EmptyState icon={RadioTower} title="Podcast not found" />;
  const tracks = show.episodes.map((e) => episodeToTrack(show, e));

  return (
    <div>
      <CollectionHeader
        kind="show"
        id={show.id}
        eyebrow={`Podcast · ${show.category}`}
        title={show.title}
        color={show.color}
        meta={show.about}
        tracks={tracks}
      />
      <Section title="Episodes">
        <TrackList tracks={tracks} numbered={false} />
      </Section>
    </div>
  );
}

// ── Audiobooks View ──────────────────────────────────────────
export function AudiobooksView() {
  return (
    <div>
      <PageHeader title="Audiobooks" subtitle="Narrated classics and sonic philosophies." />
      <Grid min={220}>
        {BOOKS.map((b) => (
          <MediaCard
            key={b.id}
            entity={{ kind: 'book', id: b.id, title: b.title, subtitle: b.author, color: b.color, route: { name: 'book', id: b.id } }}
            onPlay={() => playTrack(chapterToTrack(b, b.chapters[0]))}
          />
        ))}
      </Grid>
    </div>
  );
}

export function BookView({ id }: { id?: string }) {
  const book = BOOKS.find((b) => b.id === id);
  if (!book) return <EmptyState icon={RadioTower} title="Book not found" />;
  const tracks = book.chapters.map((c) => chapterToTrack(book, c));

  return (
    <div>
      <CollectionHeader
        kind="book"
        id={book.id}
        eyebrow={`Audiobook · ${book.author}`}
        title={book.title}
        color={book.color}
        meta={book.about}
        tracks={tracks}
      />
      <Section title="Chapters">
        <TrackList tracks={tracks} numbered={false} />
      </Section>
    </div>
  );
}

// ── Library & Playlist View ──────────────────────────────────
export function LibraryView() {
  const playlists = useStore(libraryStore, (s) => s.playlists);
  const favorites = useStore(libraryStore, (s) => s.favorites);
  const tracks = useAllTracks();
  const likedTracks = tracks.filter((t) => favorites.includes(t.id));

  return (
    <div>
      <PageHeader title="Your Library" subtitle="Personal collections, favorites and mixes." />

      <Section title="Quick Access">
        <div className="grid grid-cols-2 gap-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => playQueue(likedTracks)}
            className="glass press flex cursor-pointer items-center gap-4 rounded-[var(--radius-xl)] p-4"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-on-accent">
              <Heart size={26} className="fill-current" />
            </div>
            <div>
              <div className="text-base font-bold">Liked Songs</div>
              <div className="text-xs text-fg-3">{likedTracks.length} tracks</div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Playlists">
        <Grid min={170}>
          {playlists.map((p) => (
            <MediaCard
              key={p.id}
              entity={{ kind: 'playlist', id: p.id, title: p.name, subtitle: `${p.trackIds.length} tracks`, color: p.color, route: { name: 'playlist', id: p.id } }}
              onPlay={() => playQueue(p.trackIds.map((id) => trackById(id)).filter(Boolean) as Track[])}
            />
          ))}
        </Grid>
      </Section>
    </div>
  );
}

export function PlaylistView({ id }: { id?: string }) {
  const playlists = useStore(libraryStore, (s) => s.playlists);
  const favorites = useStore(libraryStore, (s) => s.favorites);
  const allTracks = useAllTracks();

  if (id === 'liked') {
    const tracks = allTracks.filter((t) => favorites.includes(t.id));
    return (
      <div>
        <CollectionHeader kind="playlist" id="liked" eyebrow="Collection" title="Liked Songs" color="#ff3c00" tracks={tracks} />
        <Section title="Tracks"><TrackList tracks={tracks} /></Section>
      </div>
    );
  }

  const p = playlists.find((x) => x.id === id);
  if (!p) return <EmptyState icon={ListMusic} title="Playlist not found" />;
  const tracks = p.trackIds.map((tid) => trackById(tid)).filter(Boolean) as Track[];

  return (
    <div>
      <CollectionHeader
        kind="playlist"
        id={p.id}
        eyebrow="Playlist"
        title={p.name}
        color={p.color}
        meta={p.description}
        tracks={tracks}
      />
      <Section title="Tracks">
        <TrackList tracks={tracks} />
      </Section>
    </div>
  );
}

// ── Profile View ─────────────────────────────────────────────
export function ProfileView() {
  const user = useStore(authStore, (s) => s.user);
  const playlists = useStore(libraryStore, (s) => s.playlists);
  const favorites = useStore(libraryStore, (s) => s.favorites);
  const listenedSeconds = useStore(libraryStore, (s) => s.listenedSeconds);
  const streak = useStore(libraryStore, (s) => s.streak);
  const history = useStore(libraryStore, (s) => s.history);

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="size-20 mx-auto rounded-full bg-surface-2 flex items-center justify-center mb-4">
          <Sparkles size={32} className="text-fg-3" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Welcome to VYV</h2>
        <p className="text-sm text-fg-3 mb-6">
          Sign in or create an account to sync playlists, stream uncompressed soundscapes, and bookmark wiki essays.
        </p>
        <button
          type="button"
          onClick={() => openSheet('auth')}
          className="press w-full h-12 rounded-full bg-fg text-bg font-semibold text-sm shadow-lg hover:opacity-90"
        >
          Sign in or Register
        </button>
      </div>
    );
  }

  const hoursListened = Math.round(listenedSeconds / 3600);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Cover Banner */}
      <div className="relative h-44 md:h-56 rounded-[var(--radius-2xl)] overflow-hidden border border-line-2 shadow-lg">
        <img src={user.coverUrl} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
      </div>

      {/* Profile Details Container */}
      <div className="relative px-6 -mt-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <img
            src={user.avatarUrl}
            alt=""
            className="size-28 rounded-full object-cover border-4 border-bg shadow-2xl ring-2 ring-line"
          />
          <div className="mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-fg">{user.username}</h1>
            <p className="text-sm text-fg-3">{user.handle} · {user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={AuthService.logout}
            className="press flex items-center gap-1.5 rounded-full bg-surface-2 px-4 py-2 text-xs font-semibold text-live hover:bg-surface-3 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-4 px-6 text-sm text-fg-2 max-w-xl leading-relaxed">{user.bio}</p>

      {/* Stats Cards */}
      <div className="mt-6 px-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass rounded-[var(--radius-xl)] p-4 text-center border border-line-2">
          <div className="text-2xl font-bold text-fg">{favorites.length}</div>
          <div className="text-xs text-fg-3 mt-0.5">Liked Tracks</div>
        </div>
        <div className="glass rounded-[var(--radius-xl)] p-4 text-center border border-line-2">
          <div className="text-2xl font-bold text-fg">{playlists.length}</div>
          <div className="text-xs text-fg-3 mt-0.5">Playlists</div>
        </div>
        <div className="glass rounded-[var(--radius-xl)] p-4 text-center border border-line-2">
          <div className="text-2xl font-bold text-fg">{hoursListened}h</div>
          <div className="text-xs text-fg-3 mt-0.5">Listened</div>
        </div>
        <div className="glass rounded-[var(--radius-xl)] p-4 text-center border border-line-2">
          <div className="text-2xl font-bold text-fg">{streak} Days</div>
          <div className="text-xs text-fg-3 mt-0.5">Daily Streak</div>
        </div>
      </div>

      {/* Profile Collections Preview */}
      <div className="mt-10 px-6 space-y-6">
        <Section title="Your Playlists">
          <Grid min={160}>
            {playlists.map((p) => (
              <MediaCard
                key={p.id}
                entity={{
                  kind: 'playlist',
                  id: p.id,
                  title: p.name,
                  subtitle: `${p.trackIds.length} tracks`,
                  color: p.color,
                  route: { name: 'playlist', id: p.id },
                }}
                onPlay={() => playQueue(p.trackIds.map((id) => trackById(id)).filter(Boolean) as Track[])}
              />
            ))}
          </Grid>
        </Section>
      </div>
    </div>
  );
}
