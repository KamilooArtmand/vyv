// ─────────────────────────────────────────────────────────────
// view-media.tsx: Podcasts, Audiobooks, Radio, Library & Profile
// ─────────────────────────────────────────────────────────────

import { useRef, useState } from 'react';
import { Bookmark, Clock, FolderPlus, Heart, History, ListMusic, LogOut, Pencil, RadioTower, Share2, Sparkles, Trash2, Upload } from 'lucide-react';
import { useStore } from '../core/core-store';
import { formatDuration } from '../core/core-utils';
import {
  ARTISTS,
  BOOKS,
  SHOWS,
  STATIONS,
  chapterToTrack,
  deletePlaylist,
  episodeToTrack,
  genreById,
  importFiles,
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
import type { Audiobook, Mood, Show, Track } from '../core/core-types';

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
  const mix = smartMix();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const onFiles = async (files: FileList | File[]) => {
    const n = await importFiles(files);
    if (n) toast(`Imported ${n} file${n > 1 ? 's' : ''}`, 'check');
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFiles(e.dataTransfer.files);
      }}
      className="relative"
    >
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-bg/70 backdrop-blur-md">
          <div className="flex flex-col items-center gap-3 rounded-[var(--radius-2xl)] border-2 border-dashed border-accent px-16 py-12 text-accent-ink">
            <Upload size={32} />
            <span className="font-medium">Drop to import</span>
          </div>
        </div>
      )}
      <input ref={fileRef} type="file" accept="audio/*" multiple hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />

      <PageHeader
        title="Your Library"
        subtitle="Personal collections, favorites and mixes."
        actions={<IconButton icon={FolderPlus} label="Import files" variant="soft" onClick={() => fileRef.current?.click()} />}
      />

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
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate({ name: 'playlist', id: mix.id })}
            className="glass press flex cursor-pointer items-center gap-4 rounded-[var(--radius-xl)] p-4"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl text-white" style={{ backgroundImage: meshGradient(mix.id, mix.color) }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div className="text-base font-bold">{mix.name}</div>
              <div className="text-xs text-fg-3">By your agent</div>
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
const PERSONA: Record<Mood, { name: string; line: string }> = {
  night: { name: 'Nocturnal Explorer', line: 'You come alive after dark — neon, rain and long drives.' },
  calm: { name: 'Quiet Architect', line: 'You build calm spaces out of sound.' },
  focus: { name: 'Deep Worker', line: 'Wordless, steady, locked in. Music is your flow state.' },
  energy: { name: 'Kinetic Spirit', line: 'Tempo up, volume up. You move to everything.' },
  happy: { name: 'Sunlit Optimist', line: 'Bright mornings and open windows.' },
  melancholy: { name: 'Romantic Wanderer', line: 'You find beauty in the bittersweet.' },
};

function EditProfileForm({ onDone }: { onDone: () => void }) {
  const user = useStore(authStore, (s) => s.user)!;
  const [f, setF] = useState({ username: user.username, handle: user.handle, bio: user.bio, avatarUrl: user.avatarUrl, coverUrl: user.coverUrl });
  const field = (k: keyof typeof f, label: string, area?: boolean) => (
    <label className="flex flex-col gap-1.5">
      <span className="px-1 text-[12px] text-fg-3">{label}</span>
      {area ? (
        <textarea rows={3} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent resize-none" />
      ) : (
        <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="h-12 rounded-xl bg-surface-2 px-4 text-sm text-fg outline-none focus:ring-2 focus:ring-accent" />
      )}
    </label>
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        AuthService.updateUserProfile(f.username, f.handle, f.bio, f.avatarUrl, f.coverUrl);
        toast('Profile saved', 'check');
        onDone();
      }}
      className="glass mb-8 flex flex-col gap-3 rounded-[var(--radius-2xl)] p-5"
    >
      {field('username', 'Name')}
      {field('handle', 'Handle')}
      {field('bio', 'Bio', true)}
      {field('avatarUrl', 'Avatar URL')}
      {field('coverUrl', 'Cover URL')}
      <div className="mt-1 flex gap-2">
        <button type="submit" className="press h-11 flex-1 rounded-full bg-fg text-bg text-sm font-semibold">Save</button>
        <button type="button" onClick={onDone} className="press h-11 rounded-full bg-surface-2 px-5 text-sm font-semibold hover:bg-surface-3">Cancel</button>
      </div>
    </form>
  );
}

export function ProfileView() {
  const user = useStore(authStore, (s) => s.user);
  const playlists = useStore(libraryStore, (s) => s.playlists);
  const favorites = useStore(libraryStore, (s) => s.favorites);
  const listenedSeconds = useStore(libraryStore, (s) => s.listenedSeconds);
  const streak = useStore(libraryStore, (s) => s.streak);
  const history = useStore(libraryStore, (s) => s.history);
  const tracks = useAllTracks();
  const [editing, setEditing] = useState(false);

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

  // Listening DNA — derived from what you actually play and love.
  const pool = [...history, ...favorites].map((id) => tracks.find((t) => t.id === id)).filter(Boolean) as Track[];
  const genres = Object.entries(
    pool.reduce<Record<string, number>>((acc, t) => ((acc[t.genreId ?? 'other'] = (acc[t.genreId ?? 'other'] ?? 0) + 1), acc), {}),
  ).sort((a, b) => b[1] - a[1]);
  const totalGenre = genres.reduce((s, [, n]) => s + n, 0) || 1;
  const moodCount = pool.flatMap((t) => t.moods ?? []).reduce<Record<string, number>>((acc, m) => ((acc[m] = (acc[m] ?? 0) + 1), acc), {});
  const topMood = (Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'calm') as Mood;
  const persona = PERSONA[topMood];
  const topArtists = [...new Set(pool.map((t) => t.artistId))].map((id) => ARTISTS.find((a) => a.id === id)).filter(Boolean).slice(0, 8);
  const recent = history.map((id) => trackById(id)).filter(Boolean).slice(0, 5) as Track[];

  const share = async () => {
    const text = `I'm a ${persona.name} on vyv.`;
    try {
      if (navigator.share) await navigator.share({ title: 'vyv', text });
      else {
        await navigator.clipboard.writeText(text);
        toast('Copied to clipboard', 'check');
      }
    } catch {
      /* dismissed */
    }
  };

  if (editing) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader title="Edit profile" />
        <EditProfileForm onDone={() => setEditing(false)} />
      </div>
    );
  }

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
          <IconButton icon={Pencil} label="Edit" variant="soft" onClick={() => setEditing(true)} />
          <IconButton icon={Share2} label="Share" variant="soft" onClick={share} />
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

      {/* Sound persona + Listening DNA */}
      <div className="mt-8 px-6 grid gap-4 lg:grid-cols-2">
        <div
          className="relative overflow-hidden rounded-[var(--radius-2xl)] p-6 text-white"
          style={{ backgroundImage: meshGradient(topMood, '#ff3c00') }}
        >
          <div className="mb-8 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] backdrop-blur">
            <Sparkles size={12} /> Sound persona
          </div>
          <div className="text-[26px] font-bold leading-none tracking-tight">{persona.name}</div>
          <p className="mt-2 text-[14px] text-white/80">{persona.line}</p>
        </div>

        <div className="glass rounded-[var(--radius-2xl)] p-6 border border-line-2">
          <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">Listening DNA</div>
          {genres.length === 0 ? (
            <p className="text-sm text-fg-3">Play a few tracks to see your breakdown.</p>
          ) : (
            <>
              <div className="flex h-3 overflow-hidden rounded-full">
                {genres.map(([g, n]) => (
                  <span key={g} style={{ width: `${(n / totalGenre) * 100}%`, background: genreById(g)?.colors[0] ?? 'var(--fg-3)' }} />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {genres.slice(0, 6).map(([g, n]) => (
                  <div key={g} className="flex items-center gap-2 text-[13px]">
                    <span className="size-2.5 rounded-full" style={{ background: genreById(g)?.colors[0] }} />
                    <span className="flex-1 truncate">{genreById(g)?.name ?? g}</span>
                    <span className="text-fg-3 tabular">{Math.round((n / totalGenre) * 100)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
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

        {topArtists.length > 0 && (
          <Section title="Top artists">
            <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 md:-mx-8 md:px-8">
              {topArtists.map((a) => (
                <MediaCard key={a!.id} className="w-[112px] shrink-0 md:w-[136px]" entity={{ kind: 'artist', id: a!.id, title: a!.name, subtitle: 'Artist', color: a!.color, circle: true, route: { name: 'artist', id: a!.id } }} />
              ))}
            </div>
          </Section>
        )}

        {recent.length > 0 && (
          <Section title="Recently played">
            <div className="glass rounded-[var(--radius-xl)] border border-line-2 p-2">
              {recent.map((t) => (
                <div key={t.id} role="button" tabIndex={0} onClick={() => playTrack(t, recent)} className="press flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] p-2 hover:bg-surface-2">
                  <Artwork seed={t.id} color={t.dominantColorHex} src={t.coverUrl} className="size-10 [--art-r:8px]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium">{t.title}</div>
                    <div className="truncate text-[12px] text-fg-3">{t.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
