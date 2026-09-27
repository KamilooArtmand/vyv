// ─────────────────────────────────────────────────────────────
// view-discover.tsx: The whole catalogue — hundreds of real items
//
// Renders the bundled snapshot instantly, then swaps in live results
// from the same open sources as they arrive.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Compass, Play } from 'lucide-react';
import { playQueue } from '../state/state-player';
import { Audius, RadioBrowser } from '../services/sources';
import { loadSnapshot, snapshotSize, type CatalogSnapshot } from '../services/snapshot';
import { Chip, EmptyState, Grid, PageHeader, Section, Segmented, TrackList } from '../ui/ui-components';
import { ArchiveCard, ShowCard, SourceTag, StationGrid, useLive } from '../ui/ui-live';
import type { Track } from '../core/core-types';

type Tab = 'music' | 'radio' | 'podcasts' | 'heritage';

function Chips<T extends string>({ items, value, onChange, label }: { items: T[]; value: T; onChange: (v: T) => void; label?: (v: T) => string }) {
  return (
    <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
      {items.map((it) => (
        <Chip key={it} active={value === it} onClick={() => onChange(it)}>
          {label ? label(it) : it}
        </Chip>
      ))}
    </div>
  );
}

function PlayAll({ tracks }: { tracks: Track[] }) {
  if (!tracks.length) return null;
  return (
    <button type="button" onClick={() => playQueue(tracks)} className="press flex h-9 items-center gap-2 rounded-full bg-fg pl-3 pr-4 text-[13px] font-semibold text-bg">
      <Play size={14} className="fill-current" /> Play all
    </button>
  );
}

function MusicTab({ snap }: { snap: CatalogSnapshot }) {
  const genres = Object.keys(snap.music ?? {}).sort((a, b) => Number(b === 'Kurdish') - Number(a === 'Kurdish'));
  const [genre, setGenre] = useState(genres.includes('Kurdish') ? 'Kurdish' : genres[0]);
  const live = useLive(genre && genre !== 'Kurdish' ? `au:tr:${genre}` : null, () => Audius.trending(genre === 'Trending' ? undefined : genre, 40));
  const tracks = live.data?.length ? live.data : snap.music?.[genre] ?? [];
  return (
    <>
      <Chips items={genres} value={genre} onChange={setGenre} />
      <Section title={genre} action={<PlayAll tracks={tracks} />}>
        <TrackList tracks={tracks} />
      </Section>
    </>
  );
}

function RadioTab({ snap }: { snap: CatalogSnapshot }) {
  const groups = ['kurdish', 'world', ...Object.keys(snap.radio?.byTag ?? {})];
  const [group, setGroup] = useState('kurdish');
  const live = useLive(group === 'kurdish' ? 'rb:kurdish:60' : group === 'world' ? 'rb:top:60' : null, () =>
    group === 'kurdish' ? RadioBrowser.kurdish(60) : RadioBrowser.top(60),
  );
  const base = group === 'kurdish' ? snap.radio?.kurdish : group === 'world' ? snap.radio?.world : snap.radio?.byTag[group];
  const stations = live.data?.length ? live.data : base ?? [];
  const label = (g: string) => (g === 'kurdish' ? 'Kurdish' : g === 'world' ? 'Most played' : g[0].toUpperCase() + g.slice(1));
  return (
    <>
      <Chips items={groups} value={group} onChange={setGroup} label={label} />
      <Section title={`${label(group)} · ${stations.length} stations`}>
        <StationGrid stations={stations} />
      </Section>
    </>
  );
}

function PodcastsTab({ snap }: { snap: CatalogSnapshot }) {
  const all = snap.podcasts ?? [];
  const groups = ['all', ...new Set(all.map((p) => p.group ?? 'other'))];
  const [group, setGroup] = useState('all');
  const shows = group === 'all' ? all : all.filter((p) => p.group === group);
  return (
    <>
      <Chips items={groups} value={group} onChange={setGroup} label={(g) => (g === 'all' ? 'All' : g)} />
      <Section title={`${shows.length} podcasts`}>
        <Grid min={160}>{shows.map((sh) => <ShowCard key={sh.id} show={sh} />)}</Grid>
      </Section>
    </>
  );
}

function HeritageTab({ snap }: { snap: CatalogSnapshot }) {
  const h = snap.heritage;
  const groups = ['kurdish', 'world', 'books', 'films'] as const;
  const [group, setGroup] = useState<(typeof groups)[number]>('kurdish');
  const names = { kurdish: 'Kurdish recordings', world: 'World 78s & folk', books: 'LibriVox audiobooks', films: 'Films' };
  const items = h?.[group] ?? [];
  return (
    <>
      <Chips items={[...groups]} value={group} onChange={setGroup} label={(g) => names[g]} />
      <Section title={`${names[group]} · ${items.length}`} action={<SourceTag source="archive" />}>
        <Grid min={160}>{items.map((it) => <ArchiveCard key={it.id} item={it} />)}</Grid>
      </Section>
    </>
  );
}

export default function DiscoverView() {
  const [snap, setSnap] = useState<CatalogSnapshot | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('music');
  useEffect(() => {
    loadSnapshot().then(setSnap);
  }, []);

  if (snap === undefined) return <div className="skeleton h-72 rounded-[var(--radius-2xl)]" />;
  if (!snap) return <EmptyState icon={Compass} title="Catalogue unavailable" hint="Check your connection and try again." />;

  const updated = new Date(snap.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return (
    <div>
      <PageHeader
        title="Discover"
        eyebrow={`${snapshotSize(snap).toLocaleString()} items · updated ${updated}`}
        subtitle="Music, live radio, podcasts, heritage recordings, audiobooks and films from open sources — all playable."
      />
      <div className="mb-6 max-w-lg">
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'music', label: 'Music' },
            { value: 'radio', label: 'Radio' },
            { value: 'podcasts', label: 'Podcasts' },
            { value: 'heritage', label: 'Archive' },
          ]}
        />
      </div>
      {tab === 'music' && <MusicTab snap={snap} />}
      {tab === 'radio' && <RadioTab snap={snap} />}
      {tab === 'podcasts' && <PodcastsTab snap={snap} />}
      {tab === 'heritage' && <HeritageTab snap={snap} />}
    </div>
  );
}
