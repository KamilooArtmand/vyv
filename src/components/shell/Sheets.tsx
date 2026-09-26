import { useState } from 'react';
import {
  Bookmark,
  Check,
  Disc3,
  Heart,
  ListEnd,
  ListPlus,
  ListStart,
  Mic2,
  Plus,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { closeSheet, navigate, openSheet, toast, uiStore } from '../../state/ui';
import {
  createPlaylist,
  libraryStore,
  toggleBookmark,
  toggleFavorite,
  toggleInPlaylist,
  trackById,
  useIsBookmarked,
  useIsFavorite,
} from '../../state/library';
import { addToQueue, playNext } from '../../state/player';
import { Sheet, SheetItem } from '../ui/Sheet';
import { Artwork } from '../ui/Artwork';
import { ALL_NAV } from './nav';
import { AuthForm } from '../AuthForm';

function MoreSheet() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ALL_NAV.filter((n) => !['home', 'search', 'library'].includes(n.name)).map(({ name, label, icon: Icon }) => (
        <button
          key={name}
          type="button"
          onClick={() => navigate({ name })}
          className="press flex flex-col items-center gap-2 rounded-[var(--radius-lg)] py-3 hover:bg-surface-2"
        >
          <span className="flex size-12 items-center justify-center rounded-[16px] bg-surface-2">
            <Icon size={21} strokeWidth={1.6} />
          </span>
          <span className="text-[11.5px] text-fg-2">{label}</span>
        </button>
      ))}
    </div>
  );
}

function TrackActions({ id }: { id: string }) {
  const track = trackById(id);
  const fav = useIsFavorite(id);
  const saved = useIsBookmarked('track', id);
  const playlists = useStore(libraryStore, (s) => s.playlists);
  if (!track) return null;
  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center gap-3 rounded-[var(--radius-lg)] bg-surface p-2.5">
        <Artwork seed={track.id} color={track.dominantColorHex} src={track.coverUrl} className="size-12 [--art-r:10px]" />
        <div className="min-w-0">
          <div className="truncate font-medium">{track.title}</div>
          <div className="truncate text-sm text-fg-3">{track.artist}</div>
        </div>
      </div>
      <SheetItem icon={ListStart} onClick={() => (playNext(track), toast('Plays next', 'check'), closeSheet())}>Play next</SheetItem>
      <SheetItem icon={ListEnd} onClick={() => (addToQueue(track), toast('Added to queue', 'check'), closeSheet())}>Add to queue</SheetItem>
      <SheetItem icon={Heart} active={fav} onClick={() => toast(toggleFavorite(id) ? 'Liked' : 'Removed from likes', 'heart')}>{fav ? 'Liked' : 'Like'}</SheetItem>
      <SheetItem icon={Bookmark} active={saved} onClick={() => toast(toggleBookmark('track', id) ? 'Bookmarked' : 'Bookmark removed', 'bookmark')}>{saved ? 'Bookmarked' : 'Bookmark'}</SheetItem>
      {track.artistId && <SheetItem icon={Mic2} onClick={() => navigate({ name: 'artist', id: track.artistId })}>Artist</SheetItem>}
      {track.albumId && <SheetItem icon={Disc3} onClick={() => navigate({ name: 'album', id: track.albumId })}>Album</SheetItem>}

      <div className="mb-1 mt-4 px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">Add to playlist</div>
      <SheetItem icon={Plus} onClick={() => openSheet('newplaylist', id)}>New playlist</SheetItem>
      {playlists.map((p) => {
        const has = p.trackIds.includes(id);
        return (
          <SheetItem key={p.id} icon={has ? Check : ListPlus} active={has} onClick={() => toggleInPlaylist(p.id, id)}>
            {p.name}
          </SheetItem>
        );
      })}
    </div>
  );
}

function NewPlaylist({ trackId }: { trackId?: string }) {
  const [name, setName] = useState('');
  const submit = () => {
    const pl = createPlaylist(name, trackId ? [trackId] : []);
    toast(`Created “${pl.name}”`, 'check');
    closeSheet();
    navigate({ name: 'playlist', id: pl.id });
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-3"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        aria-label="Playlist name"
        className="h-12 rounded-[var(--radius-md)] bg-surface-2 px-4 text-[15px] outline-none ring-1 ring-transparent focus:ring-line-2"
      />
      <button type="submit" className="press h-12 rounded-full bg-fg text-[15px] font-medium text-bg">
        Create
      </button>
    </form>
  );
}

export function Sheets() {
  const sheet = useStore(uiStore, (s) => s.sheet);
  const trackId = useStore(uiStore, (s) => s.sheetTrackId);
  const titles = { more: 'Explore', addto: '', newplaylist: 'New playlist', auth: 'Welcome' } as const;
  return (
    <Sheet open={!!sheet} onClose={closeSheet} title={sheet ? titles[sheet] : ''}>
      {sheet === 'more' && <MoreSheet />}
      {sheet === 'addto' && trackId && <TrackActions id={trackId} />}
      {sheet === 'newplaylist' && <NewPlaylist trackId={trackId} />}
      {sheet === 'auth' && <AuthForm onDone={closeSheet} />}
    </Sheet>
  );
}
