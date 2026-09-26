import type { ReactNode } from 'react';
import { Bookmark, Shuffle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toggleBookmark, useIsBookmarked } from '../../state/library';
import { playQueue, playerStore } from '../../state/player';
import { toast } from '../../state/ui';
import type { BookmarkKind, Track } from '../../types';
import { Artwork } from './Artwork';
import { PlayFab } from './Cards';
import { IconButton } from './IconButton';

/** Hero header for albums, playlists, shows, books and genres. */
export function CollectionHeader({
  kind,
  id,
  eyebrow,
  title,
  meta,
  color,
  src,
  glyph,
  tracks,
  round,
  tall,
  actions,
  artTitle,
}: {
  kind?: BookmarkKind;
  id: string;
  eyebrow: string;
  title: string;
  meta?: ReactNode;
  color: string;
  src?: string;
  glyph?: LucideIcon;
  tracks?: Track[];
  round?: boolean;
  tall?: boolean;
  actions?: ReactNode;
  artTitle?: { title: string; subtitle: string };
}) {
  const saved = useIsBookmarked(kind ?? 'album', id);
  const shuffle = () => {
    playerStore.set({ shuffle: true });
    tracks && playQueue(tracks);
  };
  return (
    <header className="anim-rise relative mb-8 flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
      <Artwork
        seed={id}
        color={color}
        src={src}
        glyph={glyph}
        title={artTitle?.title}
        subtitle={artTitle?.subtitle}
        shape={round ? 'circle' : 'square'}
        className={`mx-auto w-[min(62vw,240px)] shadow-[0_30px_70px_-28px_rgb(0_0_0/0.55)] [--art-r:24px] md:mx-0 md:w-[232px] ${tall ? 'aspect-[3/4]' : 'aspect-square'}`}
      />
      <div className="min-w-0 flex-1 text-center md:text-left">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{eyebrow}</div>
        <h1 className="text-[34px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[52px]">{title}</h1>
        {meta && <div className="mt-3 text-[14px] text-fg-2">{meta}</div>}
        <div className="mt-5 flex items-center justify-center gap-2 md:justify-start">
          {tracks && tracks.length > 0 && <PlayFab size="lg" onClick={() => playQueue(tracks)} />}
          {tracks && tracks.length > 1 && <IconButton icon={Shuffle} label="Shuffle" variant="soft" size="lg" onClick={shuffle} />}
          {kind && (
            <IconButton
              icon={Bookmark}
              label={saved ? 'Saved' : 'Save'}
              variant="soft"
              size="lg"
              active={saved}
              filled={saved}
              onClick={() => toast(toggleBookmark(kind, id) ? 'Bookmarked' : 'Removed', 'bookmark')}
            />
          )}
          {actions}
        </div>
      </div>
    </header>
  );
}
