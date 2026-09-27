// ─────────────────────────────────────────────────────────────
// view-media.tsx: Podcasts, Audiobooks, Radio, Library & Profile
// ─────────────────────────────────────────────────────────────

import { useRef, useState } from 'react';
import { Bookmark, Check, FolderPlus, Heart, ListMusic, LogOut, Pause, Pencil, Play, RadioTower, Share2, Sparkles, Trash2, Upload } from 'lucide-react';
import { useStore } from '../core/core-store';
import { cn, formatDuration } from '../core/core-utils';
import { ask } from '../state/state-agent';
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
  toggleBookmark,
  trackById,
  useAllTracks,
  useIsBookmarked,
} from '../state/state-catalog';
import { playQueue, playTrack, playerStore, togglePlay } from '../state/state-player';
import { AuthService, authStore, navigate, openSheet, toast } from '../state/state-ui';
import {
  Artwork,
  Chip,
  CollectionHeader,
  EmptyState,
  Grid,
  IconButton,
  LiveBadge,
  MediaCard,
  PageHeader,
  PlayFab,
  Section,
  TrackList,
  Visualizer,
  meshGradient,
} from '../ui/ui-components';
import type { Audiobook, Mood, Show, Track } from '../core/core-types';

// ── Radio View ───────────────────────────────────────────────
const MOOD_STATIONS = ['Calm', 'Focus', 'Night drive', 'Energy', 'Jazz', 'Lo-Fi'];

function StationTile({ s }: { s: Track }) {
  const isCurrent = useStore(playerStore, (p) => p.track?.id === s.id);
  const isPlaying = useStore(playerStore, (p) => p.isPlaying && p.track?.id === s.id);
  const saved = useIsBookmarked('station', s.id);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => (isCurrent ? togglePlay() : playTrack(s, STATIONS))}
      onKeyDown={(e) => e.key === 'Enter' && (isCurrent ? togglePlay() : playTrack(s, STATIONS))}
      className={cn('glass press group relative flex cursor-pointer items-center gap-4 rounded-[var(--radius-xl)] p-3 pr-4 hover:bg-surface-2', isCurrent && 'ring-1 ring-accent')}
    >
      <Artwork seed={s.id} color={s.dominantColorHex} src={s.coverUrl} className="size-[72px] [--art-r:16px]">
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 transition-opacity group-hover:opacity-100">
          {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="ml-0.5 fill-current" />}
        </span>
      </Artwork>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[16px] font-semibold tracking-[-0.02em]">{s.title}</div>
        <div className="truncate text-[13px] text-fg-3">
          {s.artist} · {genreById(s.genreId)?.name}
        </div>
        {isPlaying && <Visualizer bars={20} className="mt-2 h-4 w-28" />}
      </div>
      <IconButton
        icon={Bookmark}
        label={saved ? 'Saved' : 'Save'}
        size="sm"
        active={saved}
        filled={saved}
        onClick={(e) => {
          e.stopPropagation();
          toast(toggleBookmark('station', s.id) ? 'Station saved' : 'Removed', 'bookmark');
        }}
      />
    </div>
  );
}

export function RadioView() {
  const current = useStore(playerStore, (s) => (s.track?.isRadio ? s.track : null));
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  const hero = current ?? STATIONS[0];

  return (
    <div>
      <PageHeader title="Radio" eyebrow={<span className="inline-flex items-center gap-2"><span className="anim-live size-1.5 rounded-full bg-live" /> {STATIONS.length} stations on air</span>} />

      <section className="anim-rise relative mb-9 overflow-hidden rounded-[var(--radius-2xl)] bg-surface p-6 md:p-8">
        <Artwork seed={hero.id} color={hero.dominantColorHex} src={hero.coverUrl} className="absolute inset-0 !rounded-none opacity-40 blur-3xl saturate-150" />
        <div className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 md:gap-8">
          <Artwork seed={hero.id} color={hero.dominantColorHex} src={hero.coverUrl} className="size-20 shadow-[var(--shadow-2)] [--art-r:18px] md:size-44 md:[--art-r:24px]" />
          <div className="min-w-0">
            <LiveBadge />
            <div className="mt-2 truncate text-[24px] font-semibold leading-none tracking-[-0.04em] md:mt-3 md:text-[44px]">{hero.title}</div>
            <div className="mt-1.5 truncate text-[14px] text-fg-2 md:text-[15px]">{hero.artist}</div>
            <Visualizer bars={40} className="mt-5 hidden h-10 w-full max-w-md md:block" />
          </div>
          <IconButton
            icon={current && isPlaying ? Pause : Play}
            label={current && isPlaying ? 'Pause' : 'Tune in'}
            size="xl"
            variant="accent"
            className="[&_svg]:fill-current max-md:!size-12"
            onClick={() => (current ? togglePlay() : playTrack(hero, STATIONS))}
          />
          <Visualizer bars={32} className="col-span-3 h-8 w-full md:hidden" />
        </div>
      </section>

      <Section title="Agent stations">
        <div className="flex flex-wrap gap-2">
          {MOOD_STATIONS.map((m) => (
            <Chip key={m} icon={Sparkles} onClick={() => ask(`Play ${m.toLowerCase()}`)}>
              {m}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Stations" icon={RadioTower}>
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {STATIONS.map((s) => (
            <StationTile key={s.id} s={s} />
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── Podcasts View ────────────────────────────────────────────
export function PodcastsView() {
  const [cat, setCat] = useState('All');
  const cats = ['All', ...new Set(SHOWS.map((s) => s.category))];
  const featured = SHOWS[0];
  const shows = SHOWS.filter((s) => cat === 'All' || s.category === cat);

  return (
    <div>
      <PageHeader title="Podcasts" subtitle="Conversations on music tech, sound and brain science." />
      <button
        type="button"
        onClick={() => navigate({ name: 'show', id: featured.id })}
        className="anim-rise press relative mb-9 flex w-full flex-col justify-end overflow-hidden rounded-[var(--radius-2xl)] p-6 text-left text-white md:aspect-[3/1] md:p-8"
        style={{ backgroundImage: meshGradient(featured.id, featured.color) }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.5),transparent)]" />
        <div className="relative mt-24 md:mt-0">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">New episode</div>
          <div className="text-[28px] font-semibold tracking-[-0.035em] md:text-[40px]">{featured.title}</div>
          <div className="mt-1 max-w-lg text-[14px] text-white/75">
            {featured.episodes[0].title} — {featured.episodes[0].summary}
          </div>
        </div>
      </button>

      <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {cats.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <Grid min={240}>
        {shows.map((s) => (
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

function EpisodeRow({ show, ep }: { show: Show; ep: Show['episodes'][number] }) {
  const isCurrent = useStore(playerStore, (s) => s.track?.id === ep.id);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying && s.track?.id === ep.id);
  const pos = useStore(libraryStore, (s) => s.progress[ep.id] ?? 0);
  const pct = Math.min(1, pos / ep.durationSeconds);
  const done = pct > 0.95;
  return (
    <div className="flex gap-4 border-b border-line py-5 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-fg-3">{new Date(ep.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
        <div className={cn('mt-0.5 text-[16px] font-semibold tracking-[-0.015em]', isCurrent && 'text-accent-ink')}>{ep.title}</div>
        <p className="mt-1 line-clamp-2 text-[14px] text-fg-2">{ep.summary}</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (isCurrent ? togglePlay() : playTrack(episodeToTrack(show, ep), show.episodes.map((e) => episodeToTrack(show, e))))}
            className="press flex h-8 items-center gap-1.5 rounded-full bg-surface-2 pl-2.5 pr-3.5 text-[12.5px] font-semibold hover:bg-surface-3"
          >
            {isPlaying ? <Pause size={13} className="fill-current" /> : done ? <Check size={13} /> : <Play size={13} className="fill-current" />}
            {pct > 0 && !done ? `${formatDuration(ep.durationSeconds - pos)} left` : formatDuration(ep.durationSeconds)}
          </button>
          {pct > 0 && !done && (
            <div className="h-1 w-24 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct * 100}%` }} />
            </div>
          )}
        </div>
      </div>
      <Artwork seed={ep.id} color={show.color} className="hidden size-20 [--art-r:14px] sm:block" />
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
        meta={
          <>
            <span className="block">{show.about}</span>
            <span className="text-fg-3">Hosted by {show.host}</span>
          </>
        }
        tracks={tracks}
      />
      <Section title="Episodes">
        <div className="max-w-3xl">
          {show.episodes.map((ep) => (
            <EpisodeRow key={ep.id} show={show} ep={ep} />
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── Audiobooks View ──────────────────────────────────────────
function bookProgress(book: Audiobook, progress: Record<string, number>) {
  const total = book.chapters.reduce((a, c) => a + c.durationSeconds, 0);
  let listened = 0;
  let resume = book.chapters[0];
  for (const c of book.chapters) {
    const p = progress[c.id] ?? 0;
    listened += p;
    if (p > 0) resume = c;
  }
  return { pct: total ? listened / total : 0, resume, left: total - listened };
}

function Ring({ pct }: { pct: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 52 52" className="size-14 -rotate-90" aria-hidden>
      <circle cx="26" cy="26" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="4" />
      <circle cx="26" cy="26" r={r} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
    </svg>
  );
}

export function AudiobooksView() {
  const progress = useStore(libraryStore, (s) => s.progress);
  const reading = BOOKS.map((b) => ({ b, ...bookProgress(b, progress) })).filter((x) => x.pct > 0);

  return (
    <div>
      <PageHeader title="Audiobooks" subtitle="Narrated classics and sonic philosophies." />
      {reading.length > 0 && (
        <Section title="Continue">
          <div className="grid gap-3 md:grid-cols-2">
            {reading.map(({ b, pct, resume, left }) => (
              <div key={b.id} className="glass anim-rise flex items-center gap-4 rounded-[var(--radius-xl)] p-3 pr-4">
                <button type="button" onClick={() => navigate({ name: 'book', id: b.id })} className="press">
                  <Artwork seed={b.id} color={b.color} title={b.title} className="aspect-[3/4] w-16 [--art-r:10px]" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold">{b.title}</div>
                  <div className="truncate text-[13px] text-fg-3">
                    {resume.title} · {formatDuration(left)} left
                  </div>
                </div>
                <div className="relative flex items-center justify-center">
                  <Ring pct={pct} />
                  <PlayFab className="!absolute !size-10" onClick={() => playTrack(chapterToTrack(b, resume), b.chapters.map((c) => chapterToTrack(b, c)))} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
      <Section title="Classics">
        <Grid min={150}>
          {BOOKS.map((b) => (
            <MediaCard
              key={b.id}
              entity={{ kind: 'book', id: b.id, title: b.title, subtitle: b.author, color: b.color, route: { name: 'book', id: b.id } }}
              onPlay={() => playTrack(chapterToTrack(b, b.chapters[0]))}
            />
          ))}
        </Grid>
      </Section>
    </div>
  );
}

export function BookView({ id }: { id?: string }) {
  const book = BOOKS.find((b) => b.id === id);
  const progress = useStore(libraryStore, (s) => s.progress);
  const currentId = useStore(playerStore, (s) => s.track?.id);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  if (!book) return <EmptyState icon={RadioTower} title="Book not found" />;
  const tracks = book.chapters.map((c) => chapterToTrack(book, c));
  const total = book.chapters.reduce((a, c) => a + c.durationSeconds, 0);

  return (
    <div>
      <CollectionHeader
        kind="book"
        id={book.id}
        eyebrow={`Audiobook · ${book.year}`}
        title={book.title}
        color={book.color}
        tall
        artTitle={{ title: book.title, subtitle: book.author }}
        meta={
          <>
            <span className="block">{book.about}</span>
            <span className="text-fg-3">
              {book.author} · Narrated by {book.narrator} · {formatDuration(total)}
            </span>
          </>
        }
        tracks={tracks}
      />
      <Section title="Chapters">
        <div className="flex max-w-3xl flex-col">
          {book.chapters.map((c, i) => {
            const on = currentId === c.id;
            const pct = Math.min(1, (progress[c.id] ?? 0) / c.durationSeconds);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => (on ? togglePlay() : playTrack(tracks[i], tracks))}
                className={cn('press flex items-center gap-4 rounded-[var(--radius-md)] p-3 text-left hover:bg-surface-2', on && 'bg-surface')}
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-surface-2">
                  {on && isPlaying ? <Pause size={15} className="fill-current" /> : <Play size={15} className="ml-0.5 fill-current" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-[15px] font-medium', on && 'text-accent-ink')}>{c.title}</span>
                  {pct > 0 && (
                    <span className="mt-1.5 block h-1 w-32 overflow-hidden rounded-full bg-surface-3">
                      <span className="block h-full rounded-full bg-accent" style={{ width: `${pct * 100}%` }} />
                    </span>
                  )}
                </span>
                <span className="text-[13px] text-fg-3 tabular">{formatDuration(c.durationSeconds)}</span>
              </button>
            );
          })}
        </div>
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
        actions={
          <IconButton
            icon={Trash2}
            label="Delete playlist"
            size="lg"
            variant="soft"
            onClick={() => {
              deletePlaylist(p.id);
              toast('Playlist deleted', 'check');
              navigate({ name: 'library' });
            }}
          />
        }
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
