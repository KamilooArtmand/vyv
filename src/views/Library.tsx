import { useRef, useState } from 'react';
import { Clock, FolderPlus, HardDrive, Heart, ListMusic, Music2, Plus, Sparkles, Trash2, Upload } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn, formatDuration } from '../lib/format';
import {
  deletePlaylist,
  importFiles,
  libraryStore,
  localTracksStore,
  playlistById,
  smartMix,
  trackById,
  useAllTracks,
} from '../state/library';
import { playQueue } from '../state/player';
import { navigate, openSheet, toast } from '../state/ui';
import { Segmented } from '../components/ui/Controls';
import { IconButton } from '../components/ui/IconButton';
import { MediaCard, TrackList } from '../components/ui/Cards';
import { EmptyState, Grid, PageHeader } from '../components/ui/Layout';
import { CollectionHeader } from '../components/ui/Collection';
import type { Track } from '../types';

type Tab = 'playlists' | 'liked' | 'recent' | 'local';

export default function Library() {
  const [tab, setTab] = useState<Tab>('playlists');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const playlists = useStore(libraryStore, (s) => s.playlists);
  const favorites = useStore(libraryStore, (s) => s.favorites);
  const history = useStore(libraryStore, (s) => s.history);
  const local = useStore(localTracksStore, (s) => s.tracks);
  const tracks = useAllTracks();
  const mix = smartMix();

  const onFiles = async (files: FileList | File[]) => {
    const n = await importFiles(files);
    if (n) {
      toast(`Imported ${n} file${n > 1 ? 's' : ''}`, 'check');
      setTab('local');
    }
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
        <div className="anim-fade pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-bg/70 backdrop-blur-md">
          <div className="flex flex-col items-center gap-3 rounded-[var(--radius-2xl)] border-2 border-dashed border-accent px-16 py-12 text-accent-ink">
            <Upload size={32} />
            <span className="font-medium">Drop to import</span>
          </div>
        </div>
      )}
      <input ref={fileRef} type="file" accept="audio/*" multiple hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />

      <PageHeader
        title="Library"
        actions={
          <>
            <IconButton icon={FolderPlus} label="Import files" variant="soft" onClick={() => fileRef.current?.click()} />
            <IconButton icon={Plus} label="New playlist" variant="solid" onClick={() => openSheet('newplaylist')} />
          </>
        }
      />

      <Segmented
        className="anim-rise mb-7"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'playlists', label: 'Playlists', icon: ListMusic },
          { value: 'liked', label: 'Liked', icon: Heart },
          { value: 'recent', label: 'Recent', icon: Clock },
          { value: 'local', label: 'Files', icon: HardDrive },
        ]}
        iconOnly
      />

      {tab === 'playlists' && (
        <Grid>
          <button
            type="button"
            onClick={() => navigate({ name: 'playlist', id: 'liked' })}
            className="press relative flex aspect-square flex-col justify-end overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#ff3c00,#8a1f00)] p-4 text-left text-white shadow-[var(--shadow-1)]"
          >
            <Heart size={26} className="absolute left-4 top-4 fill-current" />
            <span className="text-[19px] font-semibold tracking-[-0.03em]">Liked</span>
            <span className="text-[13px] text-white/75">{favorites.length} tracks</span>
          </button>
          <MediaCard entity={{ kind: 'playlist', id: mix.id, title: mix.name, subtitle: 'By your agent', color: mix.color, glyph: Sparkles, route: { name: 'playlist', id: mix.id } }} onPlay={() => playQueue(mix.trackIds.map((id) => trackById(id)!).filter(Boolean))} />
          {playlists.map((p) => (
            <MediaCard
              key={p.id}
              entity={{ kind: 'playlist', id: p.id, title: p.name, subtitle: p.smart ? 'By your agent' : `${p.trackIds.length} tracks`, color: p.color, glyph: p.smart ? Sparkles : ListMusic, route: { name: 'playlist', id: p.id } }}
              onPlay={() => playQueue(p.trackIds.map((id) => trackById(id)!).filter(Boolean))}
            />
          ))}
        </Grid>
      )}

      {tab === 'liked' && (tracks.some((t) => favorites.includes(t.id)) ? <TrackList tracks={tracks.filter((t) => favorites.includes(t.id))} /> : <EmptyState icon={Heart} title="No likes yet" />)}

      {tab === 'recent' && <TrackList tracks={history.map((id) => trackById(id)).filter(Boolean) as Track[]} numbered={false} />}

      {tab === 'local' &&
        (local.length ? (
          <TrackList tracks={local} />
        ) : (
          <EmptyState
            icon={Music2}
            title="Your files, beautifully played"
            hint="Drop MP3, FLAC, WAV, OGG or M4A anywhere on this page."
            action={
              <button type="button" onClick={() => fileRef.current?.click()} className="press mt-2 flex h-10 items-center gap-2 rounded-full bg-fg px-5 text-[14px] font-medium text-bg">
                <FolderPlus size={16} /> Import
              </button>
            }
          />
        ))}
    </div>
  );
}

export function PlaylistView({ id }: { id?: string }) {
  // Subscribe so edits (add/remove) re-render.
  useStore(libraryStore, (s) => s.playlists);
  const favorites = useStore(libraryStore, (s) => s.favorites);
  const all = useAllTracks();

  const liked = id === 'liked';
  const pl = liked
    ? { id: 'liked', name: 'Liked', description: 'Everything you’ve hearted.', color: '#ff3c00', trackIds: favorites, smart: false, createdAt: '' }
    : playlistById(id);
  if (!pl) return <EmptyState icon={ListMusic} title="Playlist not found" />;

  const tracks = pl.trackIds.map((tid) => all.find((t) => t.id === tid)).filter(Boolean) as Track[];
  const total = tracks.reduce((a, t) => a + t.durationSeconds, 0);
  const deletable = !liked && pl.id !== 'smart-mix';

  return (
    <div>
      <CollectionHeader
        kind={liked ? undefined : 'playlist'}
        id={pl.id}
        eyebrow={pl.smart ? 'Agent playlist' : 'Playlist'}
        title={pl.name}
        color={pl.color}
        glyph={liked ? Heart : pl.smart ? Sparkles : ListMusic}
        meta={
          <>
            {pl.description && <span className="block">{pl.description}</span>}
            <span className="text-fg-3">
              {tracks.length} tracks · {formatDuration(total)}
            </span>
          </>
        }
        tracks={tracks}
        actions={
          deletable && (
            <IconButton
              icon={Trash2}
              label="Delete"
              variant="soft"
              size="lg"
              className={cn('hover:!text-live')}
              onClick={() => {
                deletePlaylist(pl.id);
                toast('Playlist deleted', 'check');
                navigate({ name: 'library' });
              }}
            />
          )
        }
      />
      {tracks.length ? <TrackList tracks={tracks} /> : <EmptyState icon={ListMusic} title="Empty playlist" hint="Use ••• on any song to add it here." />}
    </div>
  );
}
