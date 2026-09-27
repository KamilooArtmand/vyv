// ─────────────────────────────────────────────────────────────
// state-catalog.ts: Music Data, Online Firebase Sync & Library
// ─────────────────────────────────────────────────────────────

import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../core/core-firebase';
import { createStore, useStore } from '../core/core-store';
import type {
  Album,
  Artist,
  Audiobook,
  Bookmark,
  BookmarkKind,
  Episode,
  Genre,
  NotificationItem,
  Playlist,
  Show,
  TimelineYear,
  Track,
  WikiArticle,
} from '../core/core-types';

const AUDIO = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
];
const audio = (i: number) => AUDIO[i % AUDIO.length];

export const ARTISTS: Artist[] = [
  {
    id: 'elysian',
    name: 'Elysian Soundscapes',
    color: '#6366f1',
    genres: ['ambient', 'classical'],
    bio: 'A studio project that layers felt piano, field recordings and slow strings into weightless, rain-soaked soundscapes.',
    origin: 'Reykjavík',
    since: 2014,
    listeners: 1_840_000,
    related: ['solar', 'verdant', 'aurora'],
  },
  {
    id: 'neon',
    name: 'Neon Odyssey',
    color: '#ec4899',
    genres: ['synthwave', 'electronic'],
    bio: 'Retro-futurist synth duo scoring imaginary night drives with analog arpeggios and gated drums.',
    origin: 'Los Angeles',
    since: 2016,
    listeners: 3_210_000,
    related: ['lowtide', 'solar'],
  },
  {
    id: 'traveler',
    name: 'Acoustic Traveler',
    color: '#f59e0b',
    genres: ['acoustic', 'persian'],
    bio: 'Nomadic guitarist blending fingerstyle folk with modal scales collected along the Silk Road.',
    origin: 'Istanbul',
    since: 2011,
    listeners: 920_000,
    related: ['arvand', 'verdant'],
  },
  {
    id: 'solar',
    name: 'Solar Echoes',
    color: '#06b6d4',
    genres: ['ambient', 'electronic'],
    bio: 'Deep-space drone artist using modular synthesizers, planetary telemetry and magnetic tape loops.',
    origin: 'Berlin',
    since: 2018,
    listeners: 1_430_000,
    related: ['elysian', 'neon'],
  },
  {
    id: 'verdant',
    name: 'Verdant Symphony',
    color: '#10b981',
    genres: ['classical', 'ambient'],
    bio: 'Chamber orchestra recording in temperate rainforests, weaving live woodwinds through birdsong and wind.',
    origin: 'Vancouver',
    since: 2015,
    listeners: 1_120_000,
    related: ['elysian', 'traveler'],
  },
  {
    id: 'aurora',
    name: 'Aurora Keys',
    color: '#a855f7',
    genres: ['lofi', 'ambient'],
    bio: 'Pianist whose dusty felt recordings and vinyl crackle became the unofficial study soundtrack of millions.',
    origin: 'Kyoto',
    since: 2019,
    listeners: 2_640_000,
    related: ['elysian', 'lowtide'],
  },
  {
    id: 'lowtide',
    name: 'Low Tide Collective',
    color: '#3b82f6',
    genres: ['jazz', 'hiphop'],
    bio: 'Late-night Bristol quartet stitching Rhodes chords, upright bass walks and lazy boom-bap swing.',
    origin: 'Bristol',
    since: 2017,
    listeners: 1_980_000,
    related: ['aurora', 'neon'],
  },
  {
    id: 'arvand',
    name: 'Arvand Ensemble',
    color: '#e11d48',
    genres: ['persian', 'classical'],
    bio: 'Setar, kamancheh and tombak trio reinterpreting the Persian radif with a contemporary, minimalist ear.',
    origin: 'Tehran',
    since: 2009,
    listeners: 680_000,
    related: ['traveler', 'verdant'],
  },
];

export const GENRES: Genre[] = [
  { id: 'ambient', name: 'Ambient', colors: ['#6366f1', '#06b6d4'], era: '1970s', origin: 'United Kingdom', about: 'Music of atmosphere over rhythm. Brian Eno named it in 1978 with “Ambient 1: Music for Airports”.', related: ['electronic', 'classical', 'lofi'] },
  { id: 'synthwave', name: 'Synthwave', colors: ['#ec4899', '#8b5cf6'], era: '2000s', origin: 'France · USA', about: 'A nostalgic electronic style drawing on 1980s film scores, arcade culture and analog synthesizers.', related: ['electronic'] },
  { id: 'acoustic', name: 'Acoustic', colors: ['#f59e0b', '#ef4444'], era: 'Timeless', origin: 'Worldwide', about: 'Unplugged instruments and close-miked intimacy — songs stripped to wood, string and voice.', related: ['classical', 'persian'] },
  { id: 'electronic', name: 'Electronic', colors: ['#06b6d4', '#3b82f6'], era: '1950s →', origin: 'Germany · USA', about: 'From tape experiments and early synths to techno, house and everything built on circuits.', related: ['synthwave', 'ambient', 'hiphop'] },
  { id: 'jazz', name: 'Jazz', colors: ['#3b82f6', '#a855f7'], era: '1910s', origin: 'New Orleans, USA', about: 'Born from blues and ragtime in African-American communities, built on swing, blue notes and improvisation.', related: ['hiphop', 'lofi'] },
  { id: 'classical', name: 'Classical', colors: ['#10b981', '#0ea5e9'], era: '1600s →', origin: 'Europe', about: 'The Western art-music tradition, from the Baroque through the Romantic era to today’s neo-classical.', related: ['ambient', 'acoustic'] },
  { id: 'hiphop', name: 'Hip-Hop', colors: ['#f97316', '#e11d48'], era: '1970s', origin: 'The Bronx, USA', about: 'DJing, MCing, breaking and graffiti — a culture that turned the turntable into an instrument.', related: ['jazz', 'electronic'] },
  { id: 'lofi', name: 'Lo-Fi', colors: ['#a855f7', '#f472b6'], era: '2010s', origin: 'Internet', about: 'Hazy, imperfect beats with dusty samples — the soundtrack of late-night study streams.', related: ['jazz', 'hiphop', 'ambient'] },
  { id: 'persian', name: 'Persian', colors: ['#e11d48', '#f59e0b'], era: 'Ancient', origin: 'Iran', about: 'A modal tradition organised into the dastgāh system and memorised through the radif repertoire.', related: ['classical', 'acoustic'] },
  { id: 'rock', name: 'Rock', colors: ['#71717a', '#ef4444'], era: '1950s', origin: 'USA · UK', about: 'Electric guitars, backbeat and rebellion — from rock ’n’ roll to grunge and beyond.', related: ['electronic'] },
];

const LYRICS: Record<string, string> = {
  'track-1': `[00:00.00]Soft droplets falling in the tranquil evening
[00:12.50]Distant piano melodies drifting through the haze
[00:25.00]Echoes of serene raindrops washing over memories
[00:40.00]A quiet rhythm beating softly in the twilight
[00:58.00]Strings ascend like gentle night breezes
[01:15.00]Peaceful stillness touching every breath`,
  'track-2': `[00:00.00]Neon lights flicker across the pavement
[00:15.00]Cruising through the electric twilight
[00:30.00]Synthesizers pulse like a heartbeat
[00:48.00]Lost in the sound of midnight city`,
};

type Seed = Omit<Track, 'filePath' | 'isFavorite' | 'addedAt' | 'kind'>;
const SEEDS: Seed[] = [
  { id: 'track-1', title: 'Rain of Ambient Dreams', artist: 'Elysian Soundscapes', artistId: 'elysian', album: 'Serenity Vol. 1', albumId: 'serenity', genreId: 'ambient', year: 2021, durationSeconds: 236, dominantColorHex: '#6366f1', coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80', moods: ['calm', 'night', 'focus'] },
  { id: 'track-2', title: 'Midnight City Glow', artist: 'Neon Odyssey', artistId: 'neon', album: 'Future Horizon', albumId: 'horizon', genreId: 'synthwave', year: 2023, durationSeconds: 198, dominantColorHex: '#ec4899', coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80', moods: ['night', 'energy'] },
  { id: 'track-3', title: 'Desert Odyssey & Wind', artist: 'Acoustic Traveler', artistId: 'traveler', album: 'Nomad Chronicles', albumId: 'nomad', genreId: 'acoustic', year: 2019, durationSeconds: 310, dominantColorHex: '#f59e0b', coverUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80', moods: ['melancholy', 'calm'] },
  { id: 'track-4', title: 'Deep Ambient Drift', artist: 'Solar Echoes', artistId: 'solar', album: 'Cosmic Waves', albumId: 'cosmic', genreId: 'ambient', year: 2024, durationSeconds: 245, dominantColorHex: '#06b6d4', coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80', moods: ['focus', 'calm', 'night'] },
  { id: 'track-5', title: 'Morning Bloom & Sunlight', artist: 'Verdant Symphony', artistId: 'verdant', album: 'Botanical Harmony', albumId: 'botanical', genreId: 'classical', year: 2020, durationSeconds: 215, dominantColorHex: '#10b981', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80', moods: ['happy', 'calm'] },
  { id: 'track-6', title: 'Paper Lanterns', artist: 'Aurora Keys', artistId: 'aurora', album: 'Tape Diaries', albumId: 'tape', genreId: 'lofi', year: 2022, durationSeconds: 162, dominantColorHex: '#a855f7', moods: ['focus', 'night', 'calm'] },
  { id: 'track-7', title: 'Blue Hour Session', artist: 'Low Tide Collective', artistId: 'lowtide', album: 'One Take', albumId: 'onetake', genreId: 'jazz', year: 2021, durationSeconds: 274, dominantColorHex: '#3b82f6', moods: ['night', 'melancholy'] },
  { id: 'track-8', title: 'Chahargah Morning', artist: 'Arvand Ensemble', artistId: 'arvand', album: 'Radif Reimagined', albumId: 'radif', genreId: 'persian', year: 2018, durationSeconds: 332, dominantColorHex: '#e11d48', moods: ['melancholy', 'focus'] },
  { id: 'track-9', title: 'Overdrive Skyline', artist: 'Neon Odyssey', artistId: 'neon', album: 'Future Horizon', albumId: 'horizon', genreId: 'synthwave', year: 2023, durationSeconds: 204, dominantColorHex: '#f472b6', moods: ['energy', 'happy'] },
  { id: 'track-10', title: 'Orbit Lullaby', artist: 'Solar Echoes', artistId: 'solar', album: 'Cosmic Waves', albumId: 'cosmic', genreId: 'ambient', year: 2024, durationSeconds: 288, dominantColorHex: '#0ea5e9', moods: ['calm', 'night'] },
];

export const SEED_TRACKS: Track[] = SEEDS.map((s, i) => ({
  ...s,
  kind: 'music',
  filePath: audio(i),
  isFavorite: i === 0 || i === 2 || i === 6,
  addedAt: new Date(Date.UTC(2026, 0, 10 + i * 4)).toISOString(),
  lrcLyrics: LYRICS[s.id],
}));

export const ALBUMS: Album[] = [
  { id: 'serenity', title: 'Serenity Vol. 1', artistId: 'elysian', year: 2021, color: '#6366f1', genreId: 'ambient', coverUrl: SEEDS[0].coverUrl, trackIds: ['track-1'] },
  { id: 'horizon', title: 'Future Horizon', artistId: 'neon', year: 2023, color: '#ec4899', genreId: 'synthwave', coverUrl: SEEDS[1].coverUrl, trackIds: ['track-2', 'track-9'] },
  { id: 'nomad', title: 'Nomad Chronicles', artistId: 'traveler', year: 2019, color: '#f59e0b', genreId: 'acoustic', coverUrl: SEEDS[2].coverUrl, trackIds: ['track-3'] },
  { id: 'cosmic', title: 'Cosmic Waves', artistId: 'solar', year: 2024, color: '#06b6d4', genreId: 'ambient', coverUrl: SEEDS[3].coverUrl, trackIds: ['track-4', 'track-10'] },
  { id: 'botanical', title: 'Botanical Harmony', artistId: 'verdant', year: 2020, color: '#10b981', genreId: 'classical', coverUrl: SEEDS[4].coverUrl, trackIds: ['track-5'] },
  { id: 'tape', title: 'Tape Diaries', artistId: 'aurora', year: 2022, color: '#a855f7', genreId: 'lofi', trackIds: ['track-6'] },
  { id: 'onetake', title: 'One Take', artistId: 'lowtide', year: 2021, color: '#3b82f6', genreId: 'jazz', trackIds: ['track-7'] },
  { id: 'radif', title: 'Radif Reimagined', artistId: 'arvand', year: 2018, color: '#e11d48', genreId: 'persian', trackIds: ['track-8'] },
];

const station = (id: string, title: string, artist: string, filePath: string, color: string, genreId: string, coverUrl?: string): Track => ({
  id,
  title,
  artist,
  album: 'Live',
  filePath,
  durationSeconds: 0,
  dominantColorHex: color,
  coverUrl,
  isFavorite: false,
  addedAt: '2026-01-01T00:00:00Z',
  isRadio: true,
  kind: 'radio',
  genreId,
});

export const STATIONS: Track[] = [
  station('radio-1', 'Groove Salad', 'SomaFM Ambient', 'https://ice1.somafm.com/groovesalad-128-mp3', '#ec4899', 'ambient', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80'),
  station('radio-2', 'Vaporwaves', 'SomaFM Chill', 'https://ice1.somafm.com/vaporwaves-128-mp3', '#8b5cf6', 'synthwave', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80'),
  station('radio-3', 'Drone Zone', 'SomaFM Space Ambient', 'https://ice1.somafm.com/dronezone-128-mp3', '#d97706', 'classical', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80'),
  station('radio-4', 'DEF CON Radio', 'SomaFM Underground', 'https://ice1.somafm.com/defcon-128-mp3', '#06b6d4', 'electronic', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80'),
  station('radio-5', 'Secret Agent', 'SomaFM Spy Lounge', 'https://ice1.somafm.com/secretagent-128-mp3', '#10b981', 'jazz', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80'),
];

export const SHOWS: Show[] = [
  {
    id: 'signal',
    title: 'Signal & Noise',
    host: 'Mara Okafor',
    color: '#f97316',
    category: 'Music Tech',
    about: 'How synthesizers, tape and computers rebuilt modern music.',
    episodes: [
      { id: 'signal-42', title: 'The Monolith in the Studio', summary: 'The history and sonic texture of analog synthesizers.', durationSeconds: 2400, date: '2026-09-12T00:00:00Z', filePath: audio(1) },
      { id: 'signal-41', title: 'Tape Delays & Ghost Echoes', summary: 'Magnetic loops and reel-to-reel sound sculpture.', durationSeconds: 2160, date: '2026-09-05T00:00:00Z', filePath: audio(2) },
    ],
  },
  {
    id: 'mind',
    title: 'Mind the Beat',
    host: 'Dr. Lucas Chen',
    color: '#06b6d4',
    category: 'Neuroscience',
    about: 'What music does to the nervous system.',
    episodes: [
      { id: 'mind-12', title: 'Why Sad Songs Feel Good', summary: 'Prolactin, empathy and melancholy.', durationSeconds: 1980, date: '2026-09-15T00:00:00Z', filePath: audio(3) },
    ],
  },
];

export const BOOKS: Audiobook[] = [
  {
    id: 'rubaiyat',
    title: 'Rubáiyát of Omar Khayyám',
    author: 'Omar Khayyám · Edward FitzGerald',
    narrator: 'Parisa Nemati',
    year: '1120 / 1859',
    color: '#f59e0b',
    about: 'Timeless Persian quatrains contemplating mortality, fate, roses and wine.',
    chapters: [
      { id: 'rubaiyat-1', title: 'Book I — Morning & the Clay', durationSeconds: 720, filePath: audio(4) },
      { id: 'rubaiyat-2', title: 'Book II — The Moving Finger', durationSeconds: 840, filePath: audio(5) },
    ],
  },
  {
    id: 'airports',
    title: 'Ambient Century',
    author: 'Garry Thom',
    narrator: 'David Rhys',
    year: '2000',
    color: '#6366f1',
    about: 'From Mahler to Moby: a hundred years of sound architecture.',
    chapters: [
      { id: 'airports-1', title: 'Chapter 1 — Before Silence', durationSeconds: 1100, filePath: audio(0) },
    ],
  },
];

export const WIKI: WikiArticle[] = [
  {
    id: 'dastgah',
    title: 'The Persian Dastgāh System',
    era: 'Classical Persia',
    color: '#e11d48',
    summary: 'A modal musical system at the core of traditional Persian art music.',
    sections: [
      { heading: 'Structure', body: 'Twelve modal systems: seven principal dastgāhs and five auxiliary āvāzes.' },
      { heading: 'Radif', body: 'The preserved melodic corpus memorised through oral transmission.' },
    ],
    related: ['shur', 'chahargah'],
    genreId: 'persian',
  },
  {
    id: 'ambient-origins',
    title: 'The Invention of Ambient',
    era: '1970s',
    color: '#6366f1',
    summary: 'How Brian Eno turned background noise into active contemplation.',
    sections: [
      { heading: 'Cologne Hospital', body: 'The 1975 accident that revealed volume as a creative parameter.' },
    ],
    related: ['synthwave-roots'],
    genreId: 'ambient',
  },
];

export const TIMELINE: TimelineYear[] = [
  { year: 1968, headline: 'Wendy Carlos & Switched-On Bach', events: ['Synthesizer reaches mainstream culture', 'Moog modular enters studios'], wave: ['Classical', 'Electronic'], wikiId: 'ambient-origins' },
  { year: 1978, headline: 'Brian Eno — Ambient 1', events: ['The term “Ambient Music” coined', 'Airport installation soundscapes'], wave: ['Ambient', 'Minimalism'], wikiId: 'ambient-origins' },
  { year: 1982, headline: 'The Compact Disc Era Begins', events: ['First commercial CD pressed', 'Digital stereo fidelity'], wave: ['Synthwave', 'New Wave'] },
  { year: 1993, headline: 'Ambient House Explosion', events: ['The Orb & Aphex Twin chart globally', 'Chillout rooms emerge'], wave: ['Electronic', 'Ambient'] },
  { year: 2026, headline: 'The Autonomous Player Era', events: ['VYV agent-driven zero-touch dynamic audio playback'], wave: ['Ambient', 'Synthetic', 'Lo-Fi'] },
];

export const DEFAULT_PLAYLISTS: Playlist[] = [
  { id: 'nightdrive', name: 'Night Drive', description: 'Neon streets, analog bass and clear horizons.', color: '#ec4899', trackIds: ['track-2', 'track-9', 'track-4', 'track-7'], createdAt: '2026-02-01T00:00:00Z' },
  { id: 'focusflow', name: 'Deep Focus', description: 'Wordless, ambient, and frictionless.', color: '#6366f1', trackIds: ['track-1', 'track-4', 'track-6', 'track-10'], createdAt: '2026-02-15T00:00:00Z' },
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', type: 'release', title: 'Solar Echoes', content: 'New album “Cosmic Waves” is out today.', time: '2026-09-26T18:00:00Z', read: false, route: { name: 'album', id: 'cosmic' } },
  { id: 'n2', type: 'agent', title: 'Mix ready', content: 'Your Evening Calm mix has 12 ambient pieces.', time: '2026-09-26T14:30:00Z', read: false, route: { name: 'playlist', id: 'focusflow' } },
];

// ── Online Catalog Store & Sync ──────────────────────────────
export interface OnlineCatalogState {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  genres: Genre[];
  loading: boolean;
  onlineConnected: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

export const onlineCatalogStore = createStore<OnlineCatalogState>({
  tracks: SEED_TRACKS,
  artists: ARTISTS,
  albums: ALBUMS,
  genres: GENRES,
  loading: false,
  onlineConnected: false,
  lastSyncedAt: null,
  error: null,
});

let initPromise: Promise<void> | null = null;

export async function initOnlineCatalog(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    onlineCatalogStore.set({ loading: true, error: null });
    try {
      const tracksSnap = await getDocs(collection(db, 'tracks'));
      if (tracksSnap.empty) {
        const batch = writeBatch(db);
        for (const track of SEED_TRACKS) batch.set(doc(db, 'tracks', track.id), track);
        for (const artist of ARTISTS) batch.set(doc(db, 'artists', artist.id), artist);
        for (const album of ALBUMS) batch.set(doc(db, 'albums', album.id), album);
        for (const genre of GENRES) batch.set(doc(db, 'genres', genre.id), genre);
        await batch.commit();
        onlineCatalogStore.set({
          tracks: SEED_TRACKS,
          artists: ARTISTS,
          albums: ALBUMS,
          genres: GENRES,
          loading: false,
          onlineConnected: true,
          lastSyncedAt: new Date().toISOString(),
          error: null,
        });
      } else {
        const tracks: Track[] = [];
        tracksSnap.forEach((d) => tracks.push(d.data() as Track));
        const [artistsSnap, albumsSnap, genresSnap] = await Promise.all([
          getDocs(collection(db, 'artists')),
          getDocs(collection(db, 'albums')),
          getDocs(collection(db, 'genres')),
        ]);
        const artists: Artist[] = [];
        artistsSnap.forEach((d) => artists.push(d.data() as Artist));
        const albums: Album[] = [];
        albumsSnap.forEach((d) => albums.push(d.data() as Album));
        const genres: Genre[] = [];
        genresSnap.forEach((d) => genres.push(d.data() as Genre));

        onlineCatalogStore.set({
          tracks: tracks.length ? tracks : SEED_TRACKS,
          artists: artists.length ? artists : ARTISTS,
          albums: albums.length ? albums : ALBUMS,
          genres: genres.length ? genres : GENRES,
          loading: false,
          onlineConnected: true,
          lastSyncedAt: new Date().toISOString(),
          error: null,
        });
      }
    } catch (err: unknown) {
      console.warn('Online sync cached fallback:', err);
      onlineCatalogStore.set({
        tracks: SEED_TRACKS,
        artists: ARTISTS,
        albums: ALBUMS,
        genres: GENRES,
        loading: false,
        onlineConnected: false,
        error: err instanceof Error ? err.message : 'Offline cached catalog',
      });
    }
  })();
  return initPromise;
}

// ── Library Store & Getters ──────────────────────────────────
export const localTracksStore = createStore<{ tracks: Track[] }>({ tracks: [] });

interface LibraryState {
  favorites: string[];
  bookmarks: Bookmark[];
  history: string[];
  playlists: Playlist[];
  notifications: NotificationItem[];
  progress: Record<string, number>;
  listenedSeconds: number;
  streak: number;
}

export const libraryStore = createStore<LibraryState>(
  {
    favorites: SEED_TRACKS.filter((t) => t.isFavorite).map((t) => t.id),
    bookmarks: [
      { kind: 'artist', id: 'neon', at: '2026-05-01T00:00:00Z' },
      { kind: 'artist', id: 'arvand', at: '2026-05-02T00:00:00Z' },
      { kind: 'album', id: 'cosmic', at: '2026-05-03T00:00:00Z' },
      { kind: 'show', id: 'signal', at: '2026-05-04T00:00:00Z' },
      { kind: 'wiki', id: 'dastgah', at: '2026-05-05T00:00:00Z' },
      { kind: 'book', id: 'rubaiyat', at: '2026-05-06T00:00:00Z' },
    ],
    history: ['track-4', 'track-2', 'track-6', 'track-1'],
    playlists: DEFAULT_PLAYLISTS,
    notifications: SEED_NOTIFICATIONS,
    progress: { 'rubaiyat-2': 420, 'signal-42': 960 },
    listenedSeconds: 184_320,
    streak: 12,
  },
  'vyv.library.v3',
);

export const allTracks = (): Track[] => {
  const online = onlineCatalogStore.get().tracks;
  const source = online.length > 0 ? online : SEED_TRACKS;
  return [...localTracksStore.get().tracks, ...source];
};

export const trackById = (id?: string): Track | undefined =>
  allTracks().find((t) => t.id === id) ?? STATIONS.find((s) => s.id === id);

export const useAllTracks = () => {
  const local = useStore(localTracksStore, (s) => s.tracks);
  const online = useStore(onlineCatalogStore, (s) => s.tracks);
  const source = online.length > 0 ? online : SEED_TRACKS;
  return local.length ? [...local, ...source] : source;
};

export const artistById = (id?: string) => {
  const online = onlineCatalogStore.get().artists.find((a) => a.id === id);
  return online ?? ARTISTS.find((a) => a.id === id);
};

export const albumById = (id?: string) => {
  const online = onlineCatalogStore.get().albums.find((a) => a.id === id);
  return online ?? ALBUMS.find((a) => a.id === id);
};

export const genreById = (id?: string) => {
  const online = onlineCatalogStore.get().genres.find((g) => g.id === id);
  return online ?? GENRES.find((g) => g.id === id);
};

export const showById = (id?: string) => SHOWS.find((s) => s.id === id);
export const bookById = (id?: string) => BOOKS.find((b) => b.id === id);
export const wikiById = (id?: string) => WIKI.find((w) => w.id === id);
export const stationById = (id?: string) => STATIONS.find((s) => s.id === id);
export const playlistById = (id?: string) => libraryStore.get().playlists.find((p) => p.id === id);

export const useIsFavorite = (id?: string) => useStore(libraryStore, (s) => !!id && s.favorites.includes(id));

export function toggleFavorite(id: string): boolean {
  const has = libraryStore.get().favorites.includes(id);
  libraryStore.set((s) => ({ favorites: has ? s.favorites.filter((f) => f !== id) : [id, ...s.favorites] }));
  return !has;
}

export const useIsBookmarked = (kind: BookmarkKind, id?: string) =>
  useStore(libraryStore, (s) => !!id && s.bookmarks.some((b) => b.kind === kind && b.id === id));

export function toggleBookmark(kind: BookmarkKind, id: string): boolean {
  const { bookmarks } = libraryStore.get();
  const has = bookmarks.some((b) => b.kind === kind && b.id === id);
  libraryStore.set({
    bookmarks: has ? bookmarks.filter((b) => !(b.kind === kind && b.id === id)) : [{ kind, id, at: new Date().toISOString() }, ...bookmarks],
  });
  return !has;
}

export function pushHistory(trackId: string) {
  libraryStore.set((s) => ({
    history: [trackId, ...s.history.filter((id) => id !== trackId)].slice(0, 50),
    listenedSeconds: s.listenedSeconds + 180,
  }));
}

export function saveProgress(id: string, seconds: number) {
  libraryStore.set((s) => ({ progress: { ...s.progress, [id]: Math.round(seconds) } }));
}

export function createPlaylist(name: string, trackIds: string[] = [], smart = false, description = ''): Playlist {
  const pl: Playlist = {
    id: `pl-${Date.now()}`,
    name: name.trim() || 'Untitled Playlist',
    description,
    color: '#ff3c00',
    trackIds,
    smart,
    createdAt: new Date().toISOString(),
  };
  libraryStore.set((s) => ({ playlists: [pl, ...s.playlists] }));
  return pl;
}

export function deletePlaylist(id: string) {
  libraryStore.set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
}

export function toggleInPlaylist(playlistId: string, trackId: string): boolean {
  let added = false;
  libraryStore.set((s) => ({
    playlists: s.playlists.map((p) => {
      if (p.id !== playlistId) return p;
      const has = p.trackIds.includes(trackId);
      added = !has;
      return { ...p, trackIds: has ? p.trackIds.filter((t) => t !== trackId) : [...p.trackIds, trackId] };
    }),
  }));
  return added;
}

export function pushNotification(item: Omit<NotificationItem, 'id' | 'read' | 'time'> & { time?: string }) {
  const n: NotificationItem = { id: `notif-${Date.now()}`, read: false, time: item.time ?? new Date().toISOString(), ...item };
  libraryStore.set((s) => ({ notifications: [n, ...s.notifications].slice(0, 30) }));
}

export function markRead(id?: string) {
  libraryStore.set((s) => ({
    notifications: s.notifications.map((n) => (!id || n.id === id ? { ...n, read: true } : n)),
  }));
}

export function clearNotifications() {
  libraryStore.set({ notifications: [] });
}

export const useUnreadCount = () => useStore(libraryStore, (s) => s.notifications.filter((n) => !n.read).length);

export function smartMix(): Playlist {
  const tracks = allTracks();
  const h = new Date().getHours();
  const mood = h < 6 || h >= 22 ? 'night' : h < 12 ? 'happy' : h < 18 ? 'focus' : 'calm';
  const picked = tracks.filter((t) => t.moods?.includes(mood));
  return {
    id: `smart-${mood}`,
    name: `Daily ${mood.charAt(0).toUpperCase() + mood.slice(1)}`,
    description: 'Autonomous mix continuously adapted to your hour and listening pace.',
    color: '#ff3c00',
    trackIds: (picked.length ? picked : tracks).slice(0, 8).map((t) => t.id),
    smart: true,
    createdAt: new Date().toISOString(),
  };
}

export const episodeToTrack = (show: Show, e: Episode): Track => ({
  id: e.id,
  title: e.title,
  artist: show.title,
  album: show.host,
  filePath: e.filePath,
  durationSeconds: e.durationSeconds,
  dominantColorHex: show.color,
  isFavorite: false,
  addedAt: e.date,
  kind: 'podcast',
});

export const chapterToTrack = (book: Audiobook, c: Audiobook['chapters'][number]): Track => ({
  id: c.id,
  title: c.title,
  artist: book.title,
  album: book.author,
  filePath: c.filePath,
  durationSeconds: c.durationSeconds,
  dominantColorHex: book.color,
  isFavorite: false,
  addedAt: '2026-01-01T00:00:00Z',
  kind: 'audiobook',
});
