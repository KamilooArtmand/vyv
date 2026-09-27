// ─────────────────────────────────────────────────────────────
// view-video.tsx: Video — Internet Archive films & YouTube
// ─────────────────────────────────────────────────────────────

import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { Bookmark, Clapperboard, Search as SearchIcon, X } from 'lucide-react';
import { useStore } from '../core/core-store';
import { toggleBookmark, trackById, useIsBookmarked } from '../state/state-catalog';
import { AudioEngine, playerStore } from '../state/state-player';
import { navigate, toast } from '../state/state-ui';
import { Archive, YouTube, YOUTUBE_API_KEY, embedUrl } from '../services/sources';
import { Chip, EmptyState, Grid, IconButton, PageHeader, Section } from '../ui/ui-components';
import { ArchiveCard, LiveState, OpenSource, SourceTag, VideoCard, useLive } from '../ui/ui-live';
import type { Track } from '../core/core-types';

const TOPICS = ['Kurdish', 'Kurdistan documentary', 'Newroz', 'Kurdish dance', 'Silent film', 'Classic cinema'];

function Player({ video }: { video: Track }) {
  const saved = useIsBookmarked('video', video.id);
  const audioPlaying = useStore(playerStore, (s) => s.isPlaying);

  // One sound at a time: starting a video pauses music…
  useEffect(() => {
    AudioEngine.pause();
  }, [video.id]);
  // …and starting music afterwards closes the video.
  const wasPlaying = useRef(audioPlaying);
  useEffect(() => {
    if (audioPlaying && !wasPlaying.current) navigate({ name: 'video' });
    wasPlaying.current = audioPlaying;
  }, [audioPlaying]);

  return (
    <section className="anim-rise mb-10">
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-2xl)] bg-black shadow-[var(--shadow-2)]">
        {video.youtubeId ? (
          <iframe
            key={video.id}
            src={embedUrl(video.youtubeId)}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full"
          />
        ) : (
          <video key={video.id} src={video.filePath} poster={video.coverUrl} controls autoPlay playsInline className="absolute inset-0 size-full object-contain" />
        )}
      </div>
      <div className="mt-4 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <SourceTag source={video.source} />
          </div>
          <h1 className="mt-1.5 text-[22px] font-semibold leading-tight tracking-[-0.03em] md:text-[26px]">{video.title}</h1>
          <div className="mt-1 text-[14px] text-fg-2">{video.artist}</div>
          {video.description && <p className="mt-3 line-clamp-3 max-w-3xl text-[13.5px] text-fg-3">{video.description}</p>}
          <div className="mt-3">
            <OpenSource track={video} />
          </div>
        </div>
        <IconButton
          icon={Bookmark}
          label={saved ? 'Saved' : 'Save video'}
          variant="bare"
          active={saved}
          filled={saved}
          onClick={() => toast(toggleBookmark('video', video.id, video) ? 'Video saved' : 'Removed', 'bookmark')}
        />
        <IconButton icon={X} label="Close" variant="bare" onClick={() => navigate({ name: 'video' })} />
      </div>
    </section>
  );
}

export default function VideoView({ id }: { id?: string }) {
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const query = useDeferredValue(q.trim()) || topic;
  const video = id ? trackById(id) : undefined;

  const films = useLive(`ia:${query}`, (sig) => Archive.search(query, 'movies', 18, sig));
  const yt = useLive(YOUTUBE_API_KEY ? `yt:${query}` : null, (sig) => YouTube.search(query, 18, sig));

  return (
    <div>
      {video ? <Player video={video} /> : id ? <EmptyState icon={Clapperboard} title="Video not found" /> : <PageHeader title="Video" subtitle="Films, documentaries and clips from the Internet Archive and YouTube." />}

      <label className="glass mb-5 flex h-12 items-center gap-3 rounded-full px-5">
        <SearchIcon size={18} strokeWidth={1.75} className="text-fg-3" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search videos…" aria-label="Search videos" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-fg-3" />
      </label>
      {!q && (
        <div className="scrollbar-none -mx-4 mb-7 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {TOPICS.map((t) => (
            <Chip key={t} active={topic === t} onClick={() => setTopic(t)}>
              {t}
            </Chip>
          ))}
        </div>
      )}

      {YOUTUBE_API_KEY && (
        <Section title="YouTube">
          <LiveState loading={yt.loading} error={yt.error} empty={!yt.data?.length}>
            <Grid min={260}>{yt.data?.map((v) => <VideoCard key={v.id} video={v} />)}</Grid>
          </LiveState>
        </Section>
      )}

      <Section title="Internet Archive">
        <LiveState loading={films.loading} error={films.error} empty={!films.data?.length}>
          <Grid min={170}>{films.data?.map((it) => <ArchiveCard key={it.id} item={it} />)}</Grid>
        </LiveState>
      </Section>
    </div>
  );
}
