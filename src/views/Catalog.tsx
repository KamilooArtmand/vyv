import { useState } from 'react';
import { ArrowDownAZ, BadgeCheck, CalendarDays, Clock, Disc3, Landmark, MapPin, Mic2, RadioTower, Shapes, Sparkles, UserCheck, UserPlus, Users } from 'lucide-react';
import { useStore } from '../lib/store';
import { compact, formatDuration } from '../lib/format';
import { ALBUMS, ARTISTS, GENRES, STATIONS, WIKI, albumById, artistById, genreById } from '../data/catalog';
import { libraryStore, toggleBookmark, trackById, useAllTracks, useIsBookmarked } from '../state/library';
import { playQueue, playTrack } from '../state/player';
import { navigate, toast } from '../state/ui';
import { ask } from '../state/agent';
import { resolveEntity } from '../lib/entities';
import { meshGradient } from '../components/ui/Artwork';
import { Segmented } from '../components/ui/Controls';
import { MediaCard, PlayFab, TrackList } from '../components/ui/Cards';
import { EmptyState, Grid, PageHeader, Section, Shelf, SHELF_ITEM } from '../components/ui/Layout';
import { CollectionHeader } from '../components/ui/Collection';
import { IconButton } from '../components/ui/IconButton';
import type { Track } from '../types';

const tracksOf = (ids: string[]) => ids.map((id) => trackById(id)).filter(Boolean) as Track[];

// ── Albums ───────────────────────────────────────────────────
export function Albums() {
  const [sort, setSort] = useState<'recent' | 'az' | 'year'>('recent');
  const list = [...ALBUMS].sort((a, b) =>
    sort === 'az' ? a.title.localeCompare(b.title) : sort === 'year' ? a.year - b.year : b.year - a.year,
  );
  return (
    <div>
      <PageHeader
        title="Albums"
        actions={
          <Segmented
            iconOnly
            size="sm"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'recent', label: 'Newest', icon: Clock },
              { value: 'az', label: 'A–Z', icon: ArrowDownAZ },
              { value: 'year', label: 'Oldest', icon: CalendarDays },
            ]}
          />
        }
      />
      <Grid>
        {list.map((a) => (
          <MediaCard key={a.id} entity={resolveEntity('album', a.id)!} onPlay={() => playQueue(tracksOf(a.trackIds))} />
        ))}
      </Grid>
    </div>
  );
}

export function AlbumView({ id }: { id?: string }) {
  const album = albumById(id);
  if (!album) return <EmptyState icon={Disc3} title="Album not found" />;
  const artist = artistById(album.artistId);
  const tracks = tracksOf(album.trackIds);
  const more = ALBUMS.filter((a) => a.artistId === album.artistId && a.id !== album.id);
  const similar = ALBUMS.filter((a) => a.genreId === album.genreId && a.id !== album.id);
  return (
    <div>
      <CollectionHeader
        kind="album"
        id={album.id}
        eyebrow={`Album · ${album.year}`}
        title={album.title}
        color={album.color}
        src={album.coverUrl}
        glyph={Disc3}
        tracks={tracks}
        meta={
          <>
            <button type="button" onClick={() => artist && navigate({ name: 'artist', id: artist.id })} className="font-medium text-fg hover:underline">
              {artist?.name}
            </button>
            <span className="text-fg-3">
              {' '}
              · {genreById(album.genreId)?.name} · {tracks.length} tracks · {formatDuration(tracks.reduce((s, t) => s + t.durationSeconds, 0))}
            </span>
          </>
        }
      />
      <TrackList tracks={tracks} showArt={false} />
      {(more.length > 0 || similar.length > 0) && (
        <Section title={more.length ? `More by ${artist?.name}` : 'You might like'} className="mt-10">
          <Shelf>
            {(more.length ? more : similar).map((a) => (
              <MediaCard key={a.id} className={SHELF_ITEM} entity={resolveEntity('album', a.id)!} onPlay={() => playQueue(tracksOf(a.trackIds))} />
            ))}
          </Shelf>
        </Section>
      )}
    </div>
  );
}

// ── Artists ──────────────────────────────────────────────────
export function Artists() {
  const bookmarks = useStore(libraryStore, (s) => s.bookmarks);
  const followed = ARTISTS.filter((a) => bookmarks.some((b) => b.kind === 'artist' && b.id === a.id));
  return (
    <div>
      <PageHeader title="Artists" />
      {followed.length > 0 && (
        <Section title="Following" icon={UserCheck}>
          <Shelf>
            {followed.map((a) => (
              <MediaCard key={a.id} className="w-[112px] shrink-0 snap-start md:w-[132px]" entity={resolveEntity('artist', a.id)!} />
            ))}
          </Shelf>
        </Section>
      )}
      <Section title="All">
        <Grid min={140}>
          {ARTISTS.map((a) => (
            <MediaCard key={a.id} entity={resolveEntity('artist', a.id)!} onPlay={() => playQueue(tracksBy(a.id))} />
          ))}
        </Grid>
      </Section>
    </div>
  );
}

function tracksBy(artistId: string) {
  return tracksOf(ALBUMS.filter((a) => a.artistId === artistId).flatMap((a) => a.trackIds));
}

export function ArtistView({ id }: { id?: string }) {
  const artist = artistById(id);
  const following = useIsBookmarked('artist', id);
  const all = useAllTracks();
  if (!artist) return <EmptyState icon={Mic2} title="Artist not found" />;
  const tracks = all.filter((t) => t.artistId === artist.id);
  const albums = ALBUMS.filter((a) => a.artistId === artist.id);
  const related = artist.related.map((r) => artistById(r)).filter(Boolean);

  return (
    <div>
      <header className="anim-rise relative -mx-4 -mt-2 mb-8 flex min-h-[300px] flex-col justify-end overflow-hidden px-6 pb-7 pt-24 text-white md:mx-0 md:min-h-[360px] md:rounded-[var(--radius-2xl)] md:px-10 md:pb-10" style={{ backgroundImage: meshGradient(artist.id, artist.color) }}>
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.55),transparent_70%)]" />
        <div className="relative">
          <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-white/80">
            <BadgeCheck size={15} /> Artist
          </div>
          <h1 className="text-[44px] font-semibold leading-[0.95] tracking-[-0.05em] md:text-[80px]">{artist.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-white/80">
            <span className="flex items-center gap-1.5"><Users size={14} /> {compact(artist.listeners)} monthly</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {artist.origin}</span>
            <span className="flex items-center gap-1.5"><CalendarDays size={14} /> Since {artist.since}</span>
          </div>
        </div>
      </header>

      <div className="mb-8 flex items-center gap-2">
        <PlayFab size="lg" onClick={() => playQueue(tracks)} />
        <button
          type="button"
          onClick={() => toast(toggleBookmark('artist', artist.id) ? `Following ${artist.name}` : 'Unfollowed', 'check')}
          aria-pressed={following}
          className={`press flex h-12 items-center gap-2 rounded-full px-5 text-[14px] font-semibold ${following ? 'bg-surface-2 text-fg' : 'bg-fg text-bg'}`}
        >
          {following ? <UserCheck size={17} /> : <UserPlus size={17} />}
          {following ? 'Following' : 'Follow'}
        </button>
        <IconButton icon={RadioTower} label="Artist radio" variant="soft" size="lg" onClick={() => ask(`more like ${artist.name}`)} />
        <IconButton icon={Sparkles} label="Ask agent" variant="soft" size="lg" onClick={() => ask(`Tell me about ${artist.name}`)} />
      </div>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Section title="Popular">
          <TrackList tracks={tracks} />
        </Section>
        <Section title="About">
          <div className="card rounded-[var(--radius-xl)] p-5">
            <p className="text-[14.5px] leading-relaxed text-fg-2">{artist.bio}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {artist.genres.map((g) => (
                <button key={g} type="button" onClick={() => navigate({ name: 'genre', id: g })} className="press rounded-full bg-surface-2 px-3 py-1 text-[12.5px] font-medium hover:bg-surface-3">
                  {genreById(g)?.name}
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-[var(--radius-md)] bg-accent-soft p-3.5">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-accent-ink" />
              <p className="text-[13px] leading-relaxed text-fg-2">
                Your agent: fans who love {artist.name} also replay {related[0]?.name ?? 'similar artists'} late in the evening.
              </p>
            </div>
          </div>
        </Section>
      </div>

      {albums.length > 0 && (
        <Section title="Discography">
          <Shelf>
            {albums.map((a) => (
              <MediaCard key={a.id} className={SHELF_ITEM} entity={resolveEntity('album', a.id)!} onPlay={() => playQueue(tracksOf(a.trackIds))} />
            ))}
          </Shelf>
        </Section>
      )}
      {related.length > 0 && (
        <Section title="Fans also like">
          <Shelf>
            {related.map((r) => (
              <MediaCard key={r!.id} className="w-[124px] shrink-0 snap-start md:w-[148px]" entity={resolveEntity('artist', r!.id)!} />
            ))}
          </Shelf>
        </Section>
      )}
    </div>
  );
}

// ── Genres ───────────────────────────────────────────────────
export function Genres() {
  return (
    <div>
      <PageHeader title="Genres" />
      <div className="stagger grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {GENRES.map((g, i) => (
          <button
            key={g.id}
            type="button"
            onClick={() => navigate({ name: 'genre', id: g.id })}
            className={`press relative overflow-hidden rounded-[var(--radius-xl)] p-5 text-left text-white ${i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-[4/3]'}`}
            style={{ backgroundImage: meshGradient(g.id, g.colors[0]) }}
          >
            <span className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.35),transparent_60%)]" />
            <span className="relative block text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">{g.era}</span>
            <span className={`absolute bottom-5 left-5 font-semibold tracking-[-0.035em] ${i === 0 ? 'text-[40px] md:text-[56px]' : 'text-[22px]'}`}>{g.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function GenreView({ id }: { id?: string }) {
  const genre = genreById(id);
  const all = useAllTracks();
  if (!genre) return <EmptyState icon={Shapes} title="Genre not found" />;
  const tracks = all.filter((t) => t.genreId === genre.id);
  const artists = ARTISTS.filter((a) => a.genres.includes(genre.id));
  const station = STATIONS.find((s) => s.genreId === genre.id);
  const article = WIKI.find((w) => w.genreId === genre.id);

  return (
    <div>
      <CollectionHeader
        kind="genre"
        id={genre.id}
        eyebrow={`Genre · ${genre.era} · ${genre.origin}`}
        title={genre.name}
        color={genre.colors[0]}
        glyph={Shapes}
        meta={genre.about}
        tracks={tracks}
        actions={
          <>
            {station && <IconButton icon={RadioTower} label="Live station" variant="soft" size="lg" onClick={() => playTrack(station, [station])} />}
            {article && <IconButton icon={Landmark} label="History" variant="soft" size="lg" onClick={() => navigate({ name: 'article', id: article.id })} />}
          </>
        }
      />
      {tracks.length > 0 && (
        <Section title="Essentials">
          <TrackList tracks={tracks} />
        </Section>
      )}
      {artists.length > 0 && (
        <Section title="Artists">
          <Shelf>
            {artists.map((a) => (
              <MediaCard key={a.id} className="w-[124px] shrink-0 snap-start md:w-[148px]" entity={resolveEntity('artist', a.id)!} />
            ))}
          </Shelf>
        </Section>
      )}
      <Section title="Related">
        <div className="flex flex-wrap gap-2">
          {genre.related.map((r) => {
            const g = genreById(r);
            return g ? (
              <button key={r} type="button" onClick={() => navigate({ name: 'genre', id: r })} className="press flex h-10 items-center gap-2 rounded-full bg-surface-2 pl-1.5 pr-4 text-[14px] font-medium hover:bg-surface-3">
                <span className="size-7 rounded-full" style={{ backgroundImage: meshGradient(g.id, g.colors[0]) }} />
                {g.name}
              </button>
            ) : null;
          })}
        </div>
      </Section>
    </div>
  );
}
