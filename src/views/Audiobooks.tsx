import { BookOpen, Pause, Play } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn, formatDuration } from '../lib/format';
import { BOOKS, bookById, chapterToTrack } from '../data/catalog';
import { libraryStore } from '../state/library';
import { playTrack, playerStore, togglePlay } from '../state/player';
import { navigate } from '../state/ui';
import { Artwork } from '../components/ui/Artwork';
import { MediaCard, PlayFab } from '../components/ui/Cards';
import { EmptyState, Grid, PageHeader, Section } from '../components/ui/Layout';
import { CollectionHeader } from '../components/ui/Collection';
import type { Audiobook } from '../types';

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

export default function Audiobooks() {
  const progress = useStore(libraryStore, (s) => s.progress);
  const reading = BOOKS.map((b) => ({ b, ...bookProgress(b, progress) })).filter((x) => x.pct > 0);

  return (
    <div>
      <PageHeader title="Audiobooks" />
      {reading.length > 0 && (
        <Section title="Continue">
          <div className="grid gap-3 md:grid-cols-2">
            {reading.map(({ b, pct, resume, left }) => (
              <div key={b.id} className="card anim-rise flex items-center gap-4 rounded-[var(--radius-xl)] p-3 pr-4">
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
            <MediaCard key={b.id} entity={{ kind: 'book', id: b.id, title: b.title, subtitle: b.author, color: b.color, route: { name: 'book', id: b.id } }} />
          ))}
        </Grid>
      </Section>
    </div>
  );
}

export function BookView({ id }: { id?: string }) {
  const book = bookById(id);
  const progress = useStore(libraryStore, (s) => s.progress);
  const currentId = useStore(playerStore, (s) => s.track?.id);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);
  if (!book) return <EmptyState icon={BookOpen} title="Book not found" />;
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
        <div className="stagger flex max-w-3xl flex-col">
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
