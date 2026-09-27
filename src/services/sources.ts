// ─────────────────────────────────────────────────────────────
// services/sources.ts: Live media sources (real services, real playback)
//
//  radiobrowser  Radio Browser — ~50k live stations, community-run, no key
//  audius        Audius — full-length streams from independent artists, no key
//  itunes        Apple Podcasts directory — search + episode audio, no key
//  archive       Internet Archive — heritage audio, LibriVox audiobooks, films
//  youtube       YouTube Data API v3 — search needs VITE_YOUTUBE_API_KEY;
//                playback uses the official embedded player
//
// Every result maps onto the app's own Track type, so play, queue, like,
// bookmark, playlists and history work the same as for built-in items.
// ─────────────────────────────────────────────────────────────

import type { SourceId, Track } from '../core/core-types';
import { hash } from '../core/core-utils';

const env = import.meta.env;
export const YOUTUBE_API_KEY = env.VITE_YOUTUBE_API_KEY ?? '';
const APP = 'vyv';

export const SOURCE_META: Record<Exclude<SourceId, 'vyv' | 'local'>, { name: string; what: string; url: string; needsKey?: string }> = {
  radiobrowser: { name: 'Radio Browser', what: 'Live radio worldwide', url: 'https://www.radio-browser.info' },
  audius: { name: 'Audius', what: 'Full-length music from independent artists', url: 'https://audius.co' },
  itunes: { name: 'Apple Podcasts', what: 'Podcast directory & episodes', url: 'https://podcasts.apple.com' },
  archive: { name: 'Internet Archive', what: 'Heritage recordings, audiobooks & films', url: 'https://archive.org' },
  youtube: { name: 'YouTube', what: 'Video search & playback', url: 'https://www.youtube.com', needsKey: 'VITE_YOUTUBE_API_KEY' },
};

export const sourceReady = (id: keyof typeof SOURCE_META) => (id === 'youtube' ? !!YOUTUBE_API_KEY : true);

const PALETTE = ['#ff3c00', '#8b7cff', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444'];
const colorFor = (seed: string) => PALETTE[hash(seed) % PALETTE.length];

const cache = new Map<string, { at: number; data: unknown }>();
async function getJSON<T>(url: string, ttl = 5 * 60_000, signal?: AbortSignal): Promise<T> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < ttl) return hit.data as T;
  // A hung mirror must not stall a whole section: give each request 10 s.
  const timeout = AbortSignal.timeout(10_000);
  const r = await fetch(url, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
  if (!r.ok) throw new Error(`${r.status} ${new URL(url).host}`);
  const data = (await r.json()) as T;
  cache.set(url, { at: Date.now(), data });
  return data;
}

const https = (u?: string) => (u && u.startsWith('http://') ? u.replace('http://', 'https://') : u);
const stripHtml = (s?: string) => (s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// ── Radio Browser ────────────────────────────────────────────
const RB_HOSTS = ['https://de1.api.radio-browser.info', 'https://de2.api.radio-browser.info', 'https://fi1.api.radio-browser.info'];
let rbHost = 0;

async function rb<T>(path: string, signal?: AbortSignal): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < RB_HOSTS.length; i++) {
    const host = RB_HOSTS[(rbHost + i) % RB_HOSTS.length];
    try {
      const out = await getJSON<T>(`${host}${path}`, 10 * 60_000, signal);
      rbHost = (rbHost + i) % RB_HOSTS.length;
      return out;
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw e;
      lastErr = e;
    }
  }
  throw lastErr;
}

interface RBStation {
  stationuuid: string;
  name: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  language: string;
  codec: string;
  bitrate: number;
  lastcheckok: number;
}

// A page served over https can only play https streams; the desktop shell can play both.
const playableStream = (s: RBStation) => s.lastcheckok === 1 && !!s.url_resolved && (s.url_resolved.startsWith('https://') || location.protocol === 'http:');

export function stationToTrack(s: RBStation): Track {
  const tags = s.tags.split(',').filter(Boolean).slice(0, 2).join(' · ');
  return {
    id: `rb:${s.stationuuid}`,
    title: s.name.trim(),
    artist: [s.country || s.countrycode, tags].filter(Boolean).join(' · ') || 'Live radio',
    album: s.language || 'Radio',
    filePath: s.url_resolved,
    durationSeconds: 0,
    dominantColorHex: colorFor(s.stationuuid),
    coverUrl: https(s.favicon) || undefined,
    isFavorite: false,
    addedAt: new Date().toISOString(),
    isRadio: true,
    kind: 'radio',
    source: 'radiobrowser',
    cors: false,
    pageUrl: s.homepage || undefined,
  };
}

const RB_Q = 'hidebroken=true&order=clickcount&reverse=true';
const dedupe = (list: RBStation[]) => [...new Map(list.map((s) => [s.stationuuid, s])).values()];

export const RadioBrowser = {
  async search(q: string, limit = 40, signal?: AbortSignal): Promise<Track[]> {
    const [byName, byTag] = await Promise.all([
      rb<RBStation[]>(`/json/stations/search?name=${encodeURIComponent(q)}&${RB_Q}&limit=${limit}`, signal),
      rb<RBStation[]>(`/json/stations/search?tag=${encodeURIComponent(q.toLowerCase())}&${RB_Q}&limit=${limit}`, signal).catch(() => []),
    ]);
    return dedupe([...byName, ...byTag]).filter(playableStream).slice(0, limit).map(stationToTrack);
  },
  /** Kurdish-language and Kurdish-tagged stations, most listened first. */
  async kurdish(limit = 40): Promise<Track[]> {
    const [lang, tag, sorani, kurmanji] = await Promise.all([
      rb<RBStation[]>(`/json/stations/search?language=kurdish&${RB_Q}&limit=${limit}`),
      rb<RBStation[]>(`/json/stations/search?tag=kurdish&${RB_Q}&limit=${limit}`).catch(() => []),
      rb<RBStation[]>(`/json/stations/search?language=sorani&${RB_Q}&limit=20`).catch(() => []),
      rb<RBStation[]>(`/json/stations/search?language=kurmanji&${RB_Q}&limit=20`).catch(() => []),
    ]);
    return dedupe([...lang, ...tag, ...sorani, ...kurmanji]).filter(playableStream).slice(0, limit).map(stationToTrack);
  },
  async top(limit = 30): Promise<Track[]> {
    const list = await rb<RBStation[]>(`/json/stations/topclick/${limit * 2}?hidebroken=true`);
    return list.filter(playableStream).slice(0, limit).map(stationToTrack);
  },
  async byCountry(code: string, limit = 30): Promise<Track[]> {
    const list = await rb<RBStation[]>(`/json/stations/search?countrycode=${code}&${RB_Q}&limit=${limit * 2}`);
    return list.filter(playableStream).slice(0, limit).map(stationToTrack);
  },
  /** Radio Browser asks clients to report plays; it powers their popularity ranking. */
  click(trackId: string) {
    if (!trackId.startsWith('rb:')) return;
    fetch(`${RB_HOSTS[rbHost]}/json/url/${trackId.slice(3)}`).catch(() => {});
  },
};

// ── Audius ───────────────────────────────────────────────────
const AUDIUS = 'https://api.audius.co/v1';

interface AudiusTrack {
  id: string;
  title: string;
  duration: number;
  genre?: string;
  mood?: string;
  release_date?: string;
  permalink: string;
  artwork?: Record<string, string>;
  user: { name: string; handle: string };
  is_streamable?: boolean;
  description?: string;
}

function audiusToTrack(t: AudiusTrack): Track {
  return {
    id: `au:${t.id}`,
    title: t.title,
    artist: t.user.name,
    album: t.genre || 'Audius',
    filePath: `${AUDIUS}/tracks/${t.id}/stream?app_name=${APP}`,
    durationSeconds: t.duration,
    dominantColorHex: colorFor(t.id),
    coverUrl: t.artwork?.['480x480'] || t.artwork?.['1000x1000'],
    isFavorite: false,
    addedAt: new Date().toISOString(),
    kind: 'music',
    source: 'audius',
    cors: true,
    pageUrl: `https://audius.co${t.permalink}`,
    description: t.description,
    year: t.release_date ? new Date(t.release_date).getFullYear() : undefined,
  };
}

export const Audius = {
  async search(q: string, limit = 30, signal?: AbortSignal): Promise<Track[]> {
    const r = await getJSON<{ data: AudiusTrack[] }>(`${AUDIUS}/tracks/search?query=${encodeURIComponent(q)}&app_name=${APP}&limit=${limit}`, 5 * 60_000, signal);
    return r.data.filter((t) => t.is_streamable !== false).slice(0, limit).map(audiusToTrack);
  },
  async trending(genre?: string, limit = 24): Promise<Track[]> {
    const g = genre ? `&genre=${encodeURIComponent(genre)}` : '';
    const r = await getJSON<{ data: AudiusTrack[] }>(`${AUDIUS}/tracks/trending?app_name=${APP}&time=week${g}`, 30 * 60_000);
    return r.data.filter((t) => t.is_streamable !== false).slice(0, limit).map(audiusToTrack);
  },
};

// ── Apple Podcasts directory ─────────────────────────────────
export interface RemoteShow {
  id: string;
  title: string;
  host: string;
  category: string;
  artwork?: string;
  pageUrl?: string;
  color: string;
}

interface ITunesPodcast {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl600?: string;
  artworkUrl100?: string;
  primaryGenreName?: string;
  collectionViewUrl?: string;
}
interface ITunesEpisode {
  wrapperType: string;
  kind?: string;
  trackId: number;
  trackName: string;
  description?: string;
  shortDescription?: string;
  episodeUrl?: string;
  trackTimeMillis?: number;
  releaseDate: string;
  artworkUrl600?: string;
  collectionName: string;
  artistName?: string;
  trackViewUrl?: string;
}

const toShow = (p: ITunesPodcast): RemoteShow => ({
  id: `it:${p.collectionId}`,
  title: p.collectionName,
  host: p.artistName,
  category: p.primaryGenreName ?? 'Podcast',
  artwork: p.artworkUrl600 || p.artworkUrl100,
  pageUrl: p.collectionViewUrl,
  color: colorFor(String(p.collectionId)),
});

export const Podcasts = {
  async search(q: string, limit = 24, signal?: AbortSignal): Promise<RemoteShow[]> {
    const r = await getJSON<{ results: ITunesPodcast[] }>(
      `https://itunes.apple.com/search?media=podcast&entity=podcast&term=${encodeURIComponent(q)}&limit=${limit}`,
      30 * 60_000,
      signal,
    );
    return r.results.map(toShow);
  },
  async episodes(showId: string, limit = 60): Promise<{ show: RemoteShow; episodes: Track[] }> {
    const id = showId.replace(/^it:/, '');
    const r = await getJSON<{ results: (ITunesPodcast & ITunesEpisode)[] }>(
      `https://itunes.apple.com/lookup?id=${id}&media=podcast&entity=podcastEpisode&limit=${limit}`,
      15 * 60_000,
    );
    const head = r.results.find((x) => x.wrapperType === 'track' && !x.episodeUrl) ?? r.results[0];
    if (!head) throw new Error('Podcast not found');
    const show = toShow(head);
    const episodes = r.results
      .filter((x) => x.episodeUrl)
      .map<Track>((e) => ({
        id: `it:ep:${e.trackId}`,
        title: e.trackName,
        artist: show.title,
        album: show.host,
        filePath: e.episodeUrl!,
        durationSeconds: Math.round((e.trackTimeMillis ?? 0) / 1000),
        dominantColorHex: show.color,
        coverUrl: e.artworkUrl600 || show.artwork,
        isFavorite: false,
        addedAt: e.releaseDate,
        kind: 'podcast',
        source: 'itunes',
        cors: false,
        pageUrl: e.trackViewUrl || show.pageUrl,
        description: stripHtml(e.shortDescription || e.description),
      }));
    return { show, episodes };
  },
};

// ── Internet Archive ─────────────────────────────────────────
export interface ArchiveItem {
  id: string;
  title: string;
  creator: string;
  mediatype: 'audio' | 'movies';
  year?: number;
  thumb: string;
}

interface ArchiveDoc {
  identifier: string;
  title?: string;
  creator?: string | string[];
  mediatype: string;
  year?: string | number;
}
interface ArchiveFile {
  name: string;
  format?: string;
  length?: string;
  title?: string;
  track?: string;
  source?: string;
}

const archiveThumb = (id: string) => `https://archive.org/services/img/${id}`;
const parseLength = (l?: string) => {
  if (!l) return 0;
  if (l.includes(':')) return l.split(':').reduce((acc, p) => acc * 60 + Number(p), 0);
  return Math.round(Number(l)) || 0;
};

export const Archive = {
  async search(q: string, kind: 'audio' | 'movies' | 'audiobooks' = 'audio', limit = 24, signal?: AbortSignal): Promise<ArchiveItem[]> {
    const scope = kind === 'audiobooks' ? 'collection:(librivoxaudio)' : `mediatype:(${kind})`;
    // Match on title/subject: full-text matches drag in unrelated uploads.
    const query = `(title:(${q}) OR subject:(${q})) AND ${scope}`;
    const url =
      `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}` +
      '&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=mediatype&fl[]=year&sort[]=downloads+desc' +
      `&rows=${limit}&output=json`;
    const r = await getJSON<{ response: { docs: ArchiveDoc[] } }>(url, 30 * 60_000, signal);
    return r.response.docs.map((d) => ({
      id: d.identifier,
      title: d.title ?? d.identifier,
      creator: (Array.isArray(d.creator) ? d.creator[0] : d.creator) ?? 'Internet Archive',
      mediatype: d.mediatype === 'movies' ? 'movies' : 'audio',
      year: d.year ? Number(String(d.year).slice(0, 4)) : undefined,
      thumb: archiveThumb(d.identifier),
    }));
  },

  /** Resolve an item into playable tracks (one per audio file, or the best video file). */
  async tracks(item: Pick<ArchiveItem, 'id' | 'title' | 'creator' | 'mediatype'>): Promise<Track[]> {
    const meta = await getJSON<{ files: ArchiveFile[]; metadata: { title?: string; creator?: string | string[]; description?: string } }>(
      `https://archive.org/metadata/${item.id}`,
      60 * 60_000,
    );
    const files = meta.files ?? [];
    const base = `https://archive.org/download/${item.id}/`;
    const common = {
      artist: item.creator,
      album: item.title,
      dominantColorHex: colorFor(item.id),
      coverUrl: archiveThumb(item.id),
      isFavorite: false,
      addedAt: new Date().toISOString(),
      source: 'archive' as const,
      cors: true,
      pageUrl: `https://archive.org/details/${item.id}`,
      description: stripHtml(meta.metadata?.description).slice(0, 400),
    };
    if (item.mediatype === 'movies') {
      const video =
        files.find((f) => /\.mp4$/i.test(f.name) && /h\.264|mpeg4/i.test(f.format ?? '') && f.source !== 'metadata') ??
        files.find((f) => /\.mp4$/i.test(f.name)) ??
        files.find((f) => /\.webm$/i.test(f.name));
      if (!video) return [];
      return [{ ...common, id: `ia:${item.id}`, title: item.title, filePath: base + encodeURIComponent(video.name), durationSeconds: parseLength(video.length), kind: 'video' }];
    }
    // Prefer the VBR MP3 derivatives; fall back to any MP3 / OGG.
    let audio = files.filter((f) => /\.mp3$/i.test(f.name) && f.format === 'VBR MP3');
    if (!audio.length) audio = files.filter((f) => /\.(mp3|ogg)$/i.test(f.name));
    audio.sort((a, b) => (Number(a.track) || 0) - (Number(b.track) || 0) || a.name.localeCompare(b.name, undefined, { numeric: true }));
    return audio.slice(0, 100).map((f, i) => ({
      ...common,
      id: `ia:${item.id}:${i}`,
      title: f.title || f.name.replace(/\.[^.]+$/, '').replace(/_/g, ' '),
      filePath: base + encodeURIComponent(f.name),
      durationSeconds: parseLength(f.length),
      kind: item.id.includes('librivox') ? 'audiobook' : 'music',
    }));
  },
};

// ── YouTube ──────────────────────────────────────────────────
interface YTItem {
  id: { videoId: string };
  snippet: { title: string; channelTitle: string; publishedAt: string; description: string; thumbnails: Record<string, { url: string }> };
}

const decodeEntities = (s: string) => {
  const el = document.createElement('textarea');
  el.innerHTML = s;
  return el.value;
};

export const YouTube = {
  async search(q: string, limit = 24, signal?: AbortSignal): Promise<Track[]> {
    if (!YOUTUBE_API_KEY) throw new Error('YouTube needs VITE_YOUTUBE_API_KEY');
    const r = await getJSON<{ items: YTItem[] }>(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&safeSearch=moderate&maxResults=${limit}&q=${encodeURIComponent(q)}&key=${YOUTUBE_API_KEY}`,
      30 * 60_000,
      signal,
    );
    return r.items.map((it) => ({
      id: `yt:${it.id.videoId}`,
      title: decodeEntities(it.snippet.title),
      artist: decodeEntities(it.snippet.channelTitle),
      album: 'YouTube',
      filePath: '',
      durationSeconds: 0,
      dominantColorHex: colorFor(it.id.videoId),
      coverUrl: it.snippet.thumbnails.high?.url ?? it.snippet.thumbnails.medium?.url,
      isFavorite: false,
      addedAt: it.snippet.publishedAt,
      kind: 'video',
      source: 'youtube',
      youtubeId: it.id.videoId,
      pageUrl: `https://www.youtube.com/watch?v=${it.id.videoId}`,
      description: decodeEntities(it.snippet.description),
    }));
  },
};

export const embedUrl = (youtubeId: string) =>
  `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
