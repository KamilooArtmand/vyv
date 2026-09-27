// ─────────────────────────────────────────────────────────────
// state-catalog.ts: Music Data & Library (favorites, bookmarks,
// history, playlists, notifications) — fully local, no backend.
// ─────────────────────────────────────────────────────────────

import { BookOpen, Disc3, Landmark, ListMusic, Mic2, Music2, Podcast, RadioTower, Shapes, type LucideIcon } from 'lucide-react';
import { createStore, useStore } from '../core/core-store';
import type { Entity } from '../core/core-utils';
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

/** Short, royalty-free preview clips used as stand-in audio for the demo catalog. */
const AUDIO = [
  'https://cdn.freesound.org/previews/612/612644_5674468-lq.mp3',
  'https://cdn.freesound.org/previews/568/568853_7037-lq.mp3',
  'https://cdn.freesound.org/previews/689/689366_11861866-lq.mp3',
  'https://cdn.freesound.org/previews/657/657954_11861866-lq.mp3',
  'https://cdn.freesound.org/previews/560/560447_649468-lq.mp3',
];
const audio = (i: number) => AUDIO[i % AUDIO.length];

// ── Artists ───────────────────────────────────────────────────
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
    bio: 'Deep-space ambient built from modular synths and orbital radio samples.',
    origin: 'Berlin',
    since: 2018,
    listeners: 1_120_000,
    related: ['elysian', 'neon'],
  },
  {
    id: 'verdant',
    name: 'Verdant Symphony',
    color: '#10b981',
    genres: ['classical', 'acoustic'],
    bio: 'Chamber ensemble writing nature-inspired neo-classical pieces for flute, strings and piano.',
    origin: 'Vienna',
    since: 2012,
    listeners: 760_000,
    related: ['elysian', 'traveler'],
  },
  {
    id: 'aurora',
    name: 'Aurora Keys',
    color: '#a855f7',
    genres: ['lofi', 'jazz'],
    bio: 'Bedroom producer turning jazz chords and vinyl crackle into late-night lo-fi.',
    origin: 'Osaka',
    since: 2019,
    listeners: 2_400_000,
    related: ['lowtide', 'elysian'],
  },
  {
    id: 'lowtide',
    name: 'Low Tide Collective',
    color: '#3b82f6',
    genres: ['jazz', 'hiphop'],
    bio: 'A rotating crew of jazz players and beatmakers recording live in one take.',
    origin: 'London',
    since: 2015,
    listeners: 1_560_000,
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

// ── Genres ────────────────────────────────────────────────────
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

// ── Tracks ────────────────────────────────────────────────────
type Seed = Omit<Track, 'filePath' | 'isFavorite' | 'addedAt' | 'kind'>;

const LYRICS: Record<string, string> = {
  'track-1': `[00:00.00]Soft droplets falling in the tranquil evening
[00:12.50]Distant piano melodies drifting through the haze
[00:25.00]Echoes of serene raindrops washing over memories
[00:40.00]A quiet rhythm beating softly in the twilight
[00:58.00]Strings ascend like gentle night breezes
[01:15.00]Peaceful stillness touching every breath
[01:35.00]A harmonic tapestry weaving into the dark
[01:55.00]Subtle tones lingering with warmth
[02:15.00]Fading gently into golden silence`,
  'track-2': `[00:00.00]Neon lights flicker across the pavement
[00:15.00]Cruising through the electric twilight
[00:30.00]Synthesizers pulse like a heartbeat
[00:48.00]Lost in the sound of midnight city
[01:05.00]Reflections shimmering on wet glass
[01:25.00]Bass resonates deep in the night
[01:45.00]Endless horizon glowing ahead`,
  'track-3': `[00:00.00]A lonely wind whispers over golden dunes
[00:20.00]Ancient strings echo under the desert sun
[00:45.00]Footsteps carved deep in timeless sand
[01:10.00]Rhythmic pulses guided by distant stars
[01:40.00]Campfire sparks ascending to the cosmos
[02:10.00]Rising chords echoing through mountain canyons
[02:45.00]A quiet descent into the silent night`,
  'track-4': `[00:00.00]Floating weightless in zero gravity
[00:20.00]Gentle soundwaves expand across space
[00:50.00]Soft chords like distant stellar lights
[01:20.00]Deep resonance embracing mind and soul
[01:50.00]Calm tranquility washes over you`,
  'track-5': `[00:00.00]First light caressing emerald fields
[00:15.00]Acoustic strings intertwine with morning dew
[00:35.00]Flutes dancing on fresh forest winds
[00:55.00]Peaceful harmony embracing clean nature
[01:25.00]Golden rays shining through green canopies`,
};

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
  { id: 'track-11', title: 'Study Rain', artist: 'Aurora Keys', artistId: 'aurora', album: 'Tape Diaries', albumId: 'tape', genreId: 'lofi', year: 2022, durationSeconds: 176, dominantColorHex: '#c084fc', moods: ['focus', 'calm'] },
  { id: 'track-12', title: 'Brass & Concrete', artist: 'Low Tide Collective', artistId: 'lowtide', album: 'One Take', albumId: 'onetake', genreId: 'hiphop', year: 2021, durationSeconds: 219, dominantColorHex: '#2563eb', moods: ['energy', 'happy'] },
  { id: 'track-13', title: 'Caravan of Stars', artist: 'Acoustic Traveler', artistId: 'traveler', album: 'Nomad Chronicles', albumId: 'nomad', genreId: 'acoustic', year: 2019, durationSeconds: 251, dominantColorHex: '#d97706', moods: ['happy', 'calm'] },
  { id: 'track-14', title: 'Setar in the Snow', artist: 'Arvand Ensemble', artistId: 'arvand', album: 'Radif Reimagined', albumId: 'radif', genreId: 'persian', year: 2018, durationSeconds: 297, dominantColorHex: '#be123c', moods: ['melancholy', 'calm'] },
];

export const SEED_TRACKS: Track[] = SEEDS.map((s, i) => ({
  ...s,
  kind: 'music',
  filePath: audio(i),
  isFavorite: i === 0 || i === 2 || i === 6,
  addedAt: new Date(Date.UTC(2026, 0, 10 + i * 4)).toISOString(),
  lrcLyrics: LYRICS[s.id],
}));

// ── Albums ────────────────────────────────────────────────────
export const ALBUMS: Album[] = [
  { id: 'serenity', title: 'Serenity Vol. 1', artistId: 'elysian', year: 2021, color: '#6366f1', genreId: 'ambient', coverUrl: SEEDS[0].coverUrl, trackIds: ['track-1'] },
  { id: 'horizon', title: 'Future Horizon', artistId: 'neon', year: 2023, color: '#ec4899', genreId: 'synthwave', coverUrl: SEEDS[1].coverUrl, trackIds: ['track-2', 'track-9'] },
  { id: 'nomad', title: 'Nomad Chronicles', artistId: 'traveler', year: 2019, color: '#f59e0b', genreId: 'acoustic', coverUrl: SEEDS[2].coverUrl, trackIds: ['track-3', 'track-13'] },
  { id: 'cosmic', title: 'Cosmic Waves', artistId: 'solar', year: 2024, color: '#06b6d4', genreId: 'ambient', coverUrl: SEEDS[3].coverUrl, trackIds: ['track-4', 'track-10'] },
  { id: 'botanical', title: 'Botanical Harmony', artistId: 'verdant', year: 2020, color: '#10b981', genreId: 'classical', coverUrl: SEEDS[4].coverUrl, trackIds: ['track-5'] },
  { id: 'tape', title: 'Tape Diaries', artistId: 'aurora', year: 2022, color: '#a855f7', genreId: 'lofi', trackIds: ['track-6', 'track-11'] },
  { id: 'onetake', title: 'One Take', artistId: 'lowtide', year: 2021, color: '#3b82f6', genreId: 'jazz', trackIds: ['track-7', 'track-12'] },
  { id: 'radif', title: 'Radif Reimagined', artistId: 'arvand', year: 2018, color: '#e11d48', genreId: 'persian', trackIds: ['track-8', 'track-14'] },
];

// ── Radio ─────────────────────────────────────────────────────
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

// ── Podcasts ──────────────────────────────────────────────────
const ep = (showId: string, n: number, title: string, summary: string, mins: number, day: number) => ({
  id: `${showId}-${n}`,
  title,
  summary,
  durationSeconds: mins * 60,
  date: new Date(Date.UTC(2026, 8, day)).toISOString(),
  filePath: audio(n + day),
});

export const SHOWS: Show[] = [
  {
    id: 'signal',
    title: 'Signal & Noise',
    host: 'Mara Okafor',
    color: '#f97316',
    category: 'Production',
    about: 'Producers take apart one song per episode — every layer, every plugin, every happy accident.',
    episodes: [
      ep('signal', 42, 'Sidechain, explained by ear', 'Why pumping compression became the heartbeat of dance music.', 38, 22),
      ep('signal', 41, 'The 808 that changed everything', 'A drum machine that flopped in 1980 and then took over the world.', 45, 15),
      ep('signal', 40, 'Mixing in mono', 'The old-school trick that still fixes modern mixes.', 31, 8),
    ],
  },
  {
    id: 'liner',
    title: 'Liner Notes',
    host: 'Dariush & Lena',
    color: '#8b5cf6',
    category: 'History',
    about: 'Stories behind landmark albums, told through the people who were in the room.',
    episodes: [
      ep('liner', 18, 'Kind of Blue in five takes', 'How modal jazz was recorded almost entirely on first takes.', 52, 20),
      ep('liner', 17, 'The birth of the LP', 'Columbia, 1948, and the format that made the “album” possible.', 41, 6),
    ],
  },
  {
    id: 'mixroom',
    title: 'The Mix Room',
    host: 'Kenji Sato',
    color: '#06b6d4',
    category: 'Culture',
    about: 'A weekly guest DJ, a two-hour conversation, and the records that shaped them.',
    episodes: [
      ep('mixroom', 9, 'Ambient after midnight', 'Slow music for fast times, with a guest from Reykjavík.', 64, 24),
      ep('mixroom', 8, 'Tehran to Berlin', 'Tracing a line from the setar to the modular synth.', 58, 10),
    ],
  },
  {
    id: 'mind',
    title: 'Mind the Beat',
    host: 'Dr. Priya Nair',
    color: '#10b981',
    category: 'Science',
    about: 'Neuroscience of music: why chills happen, how rhythm entrains us, and what focus music really does.',
    episodes: [
      ep('mind', 12, 'Why sad songs feel good', 'The surprising chemistry of melancholy.', 29, 18),
      ep('mind', 11, 'Flow state playlists', 'What research says about music while working.', 33, 4),
    ],
  },
];

// ── Audiobooks (public-domain classics) ──────────────────────
const chapters = (bookId: string, titles: string[], base: number) =>
  titles.map((title, i) => ({ id: `${bookId}-${i + 1}`, title, durationSeconds: (base + i * 3) * 60, filePath: audio(i + base) }));

export const BOOKS: Audiobook[] = [
  {
    id: 'rubaiyat',
    title: 'The Rubáiyát',
    author: 'Omar Khayyám',
    narrator: 'Sam Rahimi',
    year: '1859 tr.',
    color: '#b45309',
    about: 'Edward FitzGerald’s celebrated English rendering of the quatrains attributed to the Persian poet and mathematician.',
    chapters: chapters('rubaiyat', ['Preface', 'Quatrains I–XXV', 'Quatrains XXVI–L', 'Quatrains LI–LXXV'], 18),
  },
  {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    narrator: 'Helen Ward',
    year: 'c. 180',
    color: '#475569',
    about: 'Private notes on Stoic philosophy written by a Roman emperor to himself.',
    chapters: chapters('meditations', ['Book One', 'Book Two', 'Book Three', 'Book Four', 'Book Five'], 22),
  },
  {
    id: 'pride',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    narrator: 'Clara Bell',
    year: '1813',
    color: '#be185d',
    about: 'Elizabeth Bennet, Mr Darcy, and the most famous first line in English fiction.',
    chapters: chapters('pride', ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4'], 14),
  },
  {
    id: 'artofwar',
    title: 'The Art of War',
    author: 'Sun Tzu',
    narrator: 'Wei Chen',
    year: '5th c. BC',
    color: '#b91c1c',
    about: 'Thirteen short chapters on strategy that are still quoted in boardrooms and locker rooms.',
    chapters: chapters('artofwar', ['Laying Plans', 'Waging War', 'Attack by Stratagem'], 12),
  },
];

// ── Timeline — year by year ──────────────────────────────────
export const TIMELINE: TimelineYear[] = [
  { year: 1877, headline: 'Sound is recorded', events: ['Thomas Edison demonstrates the tin-foil phonograph.'], wave: ['Parlour songs'], wikiId: 'recording' },
  { year: 1887, headline: 'The flat disc', events: ['Emile Berliner patents the gramophone and flat disc record.'], wave: ['Marches', 'Opera'], wikiId: 'recording' },
  { year: 1917, headline: 'Jazz on record', events: ['The Original Dixieland Jass Band cuts the first commercial jazz record.'], wave: ['Jazz', 'Ragtime'], wikiId: 'jazz' },
  { year: 1948, headline: 'The LP arrives', events: ['Columbia introduces the 33⅓ rpm long-playing record.'], wave: ['Big band', 'Bebop'], wikiId: 'recording' },
  { year: 1954, headline: 'Rock ’n’ roll ignites', events: ['Elvis Presley records “That’s All Right” at Sun Studio.', 'Fender launches the Stratocaster.'], wave: ['Rock ’n’ roll', 'R&B'], wikiId: 'guitar' },
  { year: 1959, headline: 'Modal jazz', events: ['Miles Davis releases “Kind of Blue”.'], wave: ['Modal jazz', 'Hard bop'], wikiId: 'jazz' },
  { year: 1963, headline: 'Music goes portable', events: ['Philips introduces the Compact Cassette.'], wave: ['Beat', 'Surf', 'Soul'] },
  { year: 1964, headline: 'The Moog', events: ['Robert Moog unveils his modular synthesizer.'], wave: ['Electronic', 'Folk rock'], wikiId: 'synth' },
  { year: 1967, headline: 'The album as art', events: ['The Beatles release “Sgt. Pepper’s Lonely Hearts Club Band”.'], wave: ['Psychedelia'] },
  { year: 1969, headline: 'Woodstock', events: ['Roughly 400,000 people gather for three days of music in upstate New York.'], wave: ['Rock', 'Folk'] },
  { year: 1973, headline: 'A culture is born', events: ['DJ Kool Herc’s back-to-school party in the Bronx.', 'Pink Floyd release “The Dark Side of the Moon”.'], wave: ['Funk', 'Prog rock', 'Hip-hop'], wikiId: 'hiphop' },
  { year: 1978, headline: 'Ambient is named', events: ['Brian Eno releases “Ambient 1: Music for Airports”.'], wave: ['Disco', 'Punk', 'Ambient'], wikiId: 'ambient' },
  { year: 1979, headline: 'Headphones go outside', events: ['Sony launches the Walkman.'], wave: ['New wave', 'Post-punk'] },
  { year: 1981, headline: 'I want my MTV', events: ['MTV begins broadcasting, opening with “Video Killed the Radio Star”.'], wave: ['Synth-pop', 'New wave'] },
  { year: 1982, headline: 'Digital audio', events: ['The Compact Disc goes on sale in Japan.', 'Michael Jackson releases “Thriller”.'], wave: ['Pop', 'Electro'], wikiId: 'recording' },
  { year: 1983, headline: 'Instruments start talking', events: ['MIDI 1.0 is published, letting synths from any maker talk to each other.'], wave: ['Synth-pop'], wikiId: 'synth' },
  { year: 1991, headline: 'Grunge breaks', events: ['Nirvana release “Nevermind”.'], wave: ['Grunge', 'Rave'] },
  { year: 1999, headline: 'Peer-to-peer', events: ['Napster launches and upends the record business.'], wave: ['Nu-metal', 'Trance', 'Teen pop'] },
  { year: 2001, headline: '1,000 songs in your pocket', events: ['Apple introduces the iPod.'], wave: ['Garage rock revival'] },
  { year: 2008, headline: 'Streaming begins', events: ['Spotify launches in Europe.'], wave: ['Electropop', 'Indie'] },
  { year: 2015, headline: 'Playlists rule', events: ['Apple Music launches; streaming becomes the default way to listen.'], wave: ['Tropical house', 'Trap'] },
  { year: 2020, headline: 'The bedroom era', events: ['Live music pauses worldwide; livestreams and home studios flourish.'], wave: ['Lo-fi', 'Bedroom pop'], wikiId: 'lofi' },
  { year: 2026, headline: 'Listening gets an agent', events: ['Players start to understand intent, mood and context — like VYV.'], wave: ['Ambient', 'Hyperpop', 'Global fusion'] },
];

// ── Wiki — music history ─────────────────────────────────────
export const WIKI: WikiArticle[] = [
  {
    id: 'recording',
    title: 'Capturing Sound',
    era: '1877 → today',
    color: '#64748b',
    summary: 'From Edison’s tin foil to lossless streams: 150 years of storing music.',
    sections: [
      { heading: 'Acoustic era', body: 'Early phonographs cut sound waves directly into tin foil and later wax cylinders. Berliner’s flat disc (1887) was easier to mass-produce, and discs won the format war.' },
      { heading: 'Electrical recording', body: 'Microphones and amplifiers arrived in the mid-1920s, capturing a far wider frequency range and making softer, more intimate singing possible.' },
      { heading: 'LP, cassette, CD', body: 'Columbia’s LP (1948) created the album as a format. The cassette (1963) made music portable and personal, and the CD (1982) brought digital audio to the living room.' },
      { heading: 'Files and streams', body: 'The MP3 format made music small enough to share online. Streaming turned ownership into access, and today’s services deliver lossless and spatial audio on demand.' },
    ],
    related: ['synth', 'lofi'],
  },
  {
    id: 'jazz',
    title: 'The Story of Jazz',
    era: '1910s → today',
    color: '#3b82f6',
    genreId: 'jazz',
    summary: 'Born in New Orleans, jazz became America’s great musical export.',
    sections: [
      { heading: 'New Orleans', body: 'Jazz grew from blues, ragtime and brass-band traditions in African-American communities of early 20th-century New Orleans.' },
      { heading: 'Swing to bebop', body: 'Big bands made jazz the pop music of the 1930s. In the 1940s bebop players like Charlie Parker and Dizzy Gillespie turned it into fast, virtuosic art music.' },
      { heading: 'Modal & beyond', body: 'Miles Davis’s “Kind of Blue” (1959) built improvisation on scales rather than chord changes, opening the door to modal, free and fusion jazz.' },
    ],
    related: ['hiphop', 'lofi'],
  },
  {
    id: 'hiphop',
    title: 'Birth of Hip-Hop',
    era: '1973 → today',
    color: '#f97316',
    genreId: 'hiphop',
    summary: 'A Bronx block party became a global culture.',
    sections: [
      { heading: 'The break', body: 'In 1973 DJ Kool Herc extended the instrumental “breaks” of funk records using two turntables, giving dancers more time to move.' },
      { heading: 'Four elements', body: 'DJing, MCing, breaking and graffiti formed the core of the culture, with sampling and the drum machine becoming its instruments.' },
      { heading: 'Worldwide', body: 'From the 1980s onward hip-hop spread across the globe and became one of the most listened-to genres in the world.' },
    ],
    related: ['jazz', 'synth'],
  },
  {
    id: 'synth',
    title: 'Rise of the Synthesizer',
    era: '1964 → today',
    color: '#8b5cf6',
    genreId: 'electronic',
    summary: 'How voltage became melody.',
    sections: [
      { heading: 'Modular beginnings', body: 'Robert Moog and Don Buchla built voltage-controlled modular synthesizers in the mid-1960s, patched together with cables.' },
      { heading: 'Going polyphonic', body: 'Through the 1970s and 80s synths became smaller, cheaper and able to play chords, defining the sound of synth-pop.' },
      { heading: 'MIDI', body: 'The MIDI standard (1983) let instruments and computers from any maker talk to each other — the foundation of modern production.' },
    ],
    related: ['recording', 'ambient'],
  },
  {
    id: 'dastgah',
    title: 'The Persian Dastgāh',
    era: 'Centuries',
    color: '#e11d48',
    genreId: 'persian',
    summary: 'A modal system of seven dastgāhs and their derived āvāz, memorised through the radif.',
    sections: [
      { heading: 'Seven systems', body: 'Persian classical music is organised into seven dastgāhs — Shur, Māhur, Homāyun, Segāh, Chahārgāh, Rāst-Panjgāh and Navā — each a family of melodic pieces called gusheh.' },
      { heading: 'The radif', body: 'The radif is the repertoire of gushehs passed from master to student. Performers learn it by heart and improvise within its framework.' },
      { heading: 'Instruments', body: 'Setar, tar, kamancheh, santur, ney and tombak are central instruments, often played in intimate solo or small-ensemble settings.' },
    ],
    related: ['guitar'],
  },
  {
    id: 'ambient',
    title: 'Ambient Music',
    era: '1978 → today',
    color: '#06b6d4',
    genreId: 'ambient',
    summary: 'Music “as ignorable as it is interesting.”',
    sections: [
      { heading: 'Naming it', body: 'Brian Eno coined the term with “Ambient 1: Music for Airports” (1978), describing music meant to shape the atmosphere of a space.' },
      { heading: 'Roots', body: 'Erik Satie’s “furniture music”, minimalism and early electronic experiments all fed into the idea.' },
    ],
    related: ['synth', 'lofi'],
  },
  {
    id: 'guitar',
    title: 'The Electric Guitar',
    era: '1930s → today',
    color: '#ef4444',
    genreId: 'rock',
    summary: 'An amplified instrument that rewired popular music.',
    sections: [
      { heading: 'Getting loud', body: 'Pickups turned string vibrations into electrical signals so guitars could be heard over big bands in the 1930s.' },
      { heading: 'Solid bodies', body: 'The Fender Telecaster, Gibson Les Paul and Fender Stratocaster in the early 1950s defined the sound of rock ’n’ roll.' },
    ],
    related: ['recording', 'dastgah'],
  },
  {
    id: 'lofi',
    title: 'Lo-Fi Culture',
    era: '2010s → today',
    color: '#a855f7',
    genreId: 'lofi',
    summary: 'Imperfection as a feature.',
    sections: [
      { heading: 'Dusty textures', body: 'Tape hiss, vinyl crackle and swung, off-grid drums — heavily influenced by hip-hop producers such as J Dilla and Nujabes.' },
      { heading: 'Always-on streams', body: 'Round-the-clock “beats to study to” livestreams turned lo-fi into a shared, ambient companion for work and study.' },
    ],
    related: ['jazz', 'ambient'],
  },
];

// ── Default playlists ─────────────────────────────────────────
export const DEFAULT_PLAYLISTS: Playlist[] = [
  { id: 'pl-night', name: 'Night Drive', description: 'Neon, rain and empty roads.', color: '#ec4899', trackIds: ['track-2', 'track-9', 'track-7', 'track-4'], createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pl-focus', name: 'Deep Focus', description: 'No words, just flow.', color: '#06b6d4', trackIds: ['track-4', 'track-11', 'track-1', 'track-6', 'track-10'], createdAt: '2026-03-10T00:00:00Z' },
  { id: 'pl-sunday', name: 'Slow Sunday', description: 'Coffee, plants, sunlight.', color: '#f59e0b', trackIds: ['track-5', 'track-3', 'track-13', 'track-14'], createdAt: '2026-04-02T00:00:00Z' },
];

// ── Seed notifications ────────────────────────────────────────
const ago = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', type: 'agent', title: 'Your Friday mix is ready', content: '24 tracks tuned to this week’s late nights.', time: ago(0.3), read: false, route: { name: 'playlist', id: 'smart-mix' } },
  { id: 'n2', type: 'release', title: 'Neon Odyssey', content: 'New single “Overdrive Skyline” is out now.', time: ago(2), read: false, route: { name: 'artist', id: 'neon' } },
  { id: 'n3', type: 'podcast', title: 'Signal & Noise · Ep. 42', content: 'Sidechain, explained by ear.', time: ago(6), read: false, route: { name: 'show', id: 'signal' } },
  { id: 'n4', type: 'social', title: 'Lena followed you', content: 'You share 3 artists in your top ten.', time: ago(26), read: true, route: { name: 'profile' } },
  { id: 'n5', type: 'system', title: 'Lossless is on', content: 'Hi-Res streaming enabled on Wi-Fi.', time: ago(50), read: true, route: { name: 'settings' } },
  { id: 'n6', type: 'release', title: 'Arvand Ensemble', content: '“Radif Reimagined” — 5 years today.', time: ago(80), read: true, route: { name: 'album', id: 'radif' } },
];

// ── Lookups ───────────────────────────────────────────────────
export const artistById = (id?: string) => ARTISTS.find((a) => a.id === id);
export const albumById = (id?: string) => ALBUMS.find((a) => a.id === id);
export const genreById = (id?: string) => GENRES.find((g) => g.id === id);
export const showById = (id?: string) => SHOWS.find((s) => s.id === id);
export const bookById = (id?: string) => BOOKS.find((b) => b.id === id);
export const wikiById = (id?: string) => WIKI.find((w) => w.id === id);
export const stationById = (id?: string) => STATIONS.find((s) => s.id === id);

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

interface LibraryState {
  favorites: string[];
  bookmarks: Bookmark[];
  history: string[];
  playlists: Playlist[];
  notifications: NotificationItem[];
  /** Resume position (seconds) for podcasts and audiobooks. */
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
    history: ['track-4', 'track-2', 'track-6', 'track-1', 'track-8'],
    playlists: DEFAULT_PLAYLISTS,
    notifications: SEED_NOTIFICATIONS,
    progress: { 'rubaiyat-2': 420, 'signal-42': 960 },
    listenedSeconds: 184_320,
    streak: 12,
  },
  'vyv.library.v2',
);

// ── Local files & local-only tracks ─────────────────────────
/** Local imports live for the session only — blob URLs don't survive a reload. */
export const localTracksStore = createStore<{ tracks: Track[] }>({ tracks: [] });

export const allTracks = (): Track[] => [...localTracksStore.get().tracks, ...SEED_TRACKS];
export const trackById = (id?: string): Track | undefined =>
  allTracks().find((t) => t.id === id) ?? STATIONS.find((s) => s.id === id);

export const useAllTracks = () => {
  const local = useStore(localTracksStore, (s) => s.tracks);
  return local.length ? [...local, ...SEED_TRACKS] : SEED_TRACKS;
};

// ── Favorites ─────────────────────────────────────────────────
export const useIsFavorite = (id?: string) => useStore(libraryStore, (s) => !!id && s.favorites.includes(id));

export function toggleFavorite(id: string): boolean {
  const has = libraryStore.get().favorites.includes(id);
  libraryStore.set((s) => ({ favorites: has ? s.favorites.filter((f) => f !== id) : [id, ...s.favorites] }));
  return !has;
}

// ── Bookmarks ─────────────────────────────────────────────────
export const useIsBookmarked = (kind: BookmarkKind, id?: string) =>
  useStore(libraryStore, (s) => !!id && s.bookmarks.some((b) => b.kind === kind && b.id === id));

export function toggleBookmark(kind: BookmarkKind, id: string): boolean {
  const has = libraryStore.get().bookmarks.some((b) => b.kind === kind && b.id === id);
  libraryStore.set((s) => ({
    bookmarks: has
      ? s.bookmarks.filter((b) => !(b.kind === kind && b.id === id))
      : [{ kind, id, at: new Date().toISOString() }, ...s.bookmarks],
  }));
  return !has;
}

// ── History & progress ───────────────────────────────────────
export function pushHistory(id: string) {
  libraryStore.set((s) => ({ history: [id, ...s.history.filter((h) => h !== id)].slice(0, 60) }));
}

export function saveProgress(id: string, seconds: number) {
  libraryStore.set((s) => ({ progress: { ...s.progress, [id]: Math.floor(seconds) } }));
}

// ── Playlists ─────────────────────────────────────────────────
const PALETTE = ['#8b7cff', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export function createPlaylist(name: string, trackIds: string[] = [], smart = false, description = ''): Playlist {
  const pl: Playlist = {
    id: `pl-${Date.now().toString(36)}`,
    name: name.trim() || 'Untitled',
    description,
    color: PALETTE[libraryStore.get().playlists.length % PALETTE.length],
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

export function toggleInPlaylist(playlistId: string, trackId: string) {
  libraryStore.set((s) => ({
    playlists: s.playlists.map((p) =>
      p.id !== playlistId
        ? p
        : { ...p, trackIds: p.trackIds.includes(trackId) ? p.trackIds.filter((t) => t !== trackId) : [...p.trackIds, trackId] },
    ),
  }));
}

/** The agent's always-fresh daily mix, derived from history and favorites. */
export function smartMix(): Playlist {
  const { history, favorites } = libraryStore.get();
  const ids = [...new Set([...favorites, ...history, ...SEED_TRACKS.map((t) => t.id)])].slice(0, 10);
  return {
    id: 'smart-mix',
    name: 'Daily Mix',
    description: 'Tuned by your agent from what you love lately.',
    color: '#ff3c00',
    trackIds: ids,
    smart: true,
    createdAt: new Date().toISOString(),
  };
}

export const playlistById = (id?: string): Playlist | undefined =>
  id === 'smart-mix' ? smartMix() : libraryStore.get().playlists.find((p) => p.id === id);

// ── Notifications ────────────────────────────────────────────
export const useUnreadCount = () => useStore(libraryStore, (s) => s.notifications.filter((n) => !n.read).length);

export function pushNotification(n: Omit<NotificationItem, 'id' | 'time' | 'read'>) {
  const item: NotificationItem = { ...n, id: `n-${Date.now()}`, time: new Date().toISOString(), read: false };
  libraryStore.set((s) => ({ notifications: [item, ...s.notifications].slice(0, 50) }));
  return item;
}

export function markRead(id?: string) {
  libraryStore.set((s) => ({ notifications: s.notifications.map((n) => (!id || n.id === id ? { ...n, read: true } : n)) }));
}

export function clearNotifications() {
  libraryStore.set({ notifications: [] });
}

// ── Local files ──────────────────────────────────────────────
const LOCAL_COLORS = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

export async function importFiles(files: FileList | File[]): Promise<number> {
  const audioFiles = [...files].filter((f) => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac|opus)$/i.test(f.name));
  const tracks = await Promise.all(
    audioFiles.map(
      (file, i) =>
        new Promise<Track>((resolve) => {
          const url = URL.createObjectURL(file);
          const base = file.name.replace(/\.[^/.]+$/, '');
          const [maybeArtist, ...rest] = base.split(' - ');
          const t: Track = {
            id: `local-${Date.now().toString(36)}-${i}`,
            title: rest.length ? rest.join(' - ').trim() : base,
            artist: rest.length ? maybeArtist.trim() : 'Local file',
            album: 'Imported',
            durationSeconds: 0,
            filePath: url,
            dominantColorHex: LOCAL_COLORS[(Date.now() + i) % LOCAL_COLORS.length],
            isFavorite: false,
            addedAt: new Date().toISOString(),
            kind: 'music',
          };
          const probe = new Audio();
          probe.preload = 'metadata';
          probe.onloadedmetadata = () => resolve({ ...t, durationSeconds: Math.round(probe.duration) || 0 });
          probe.onerror = () => resolve(t);
          probe.src = url;
        }),
    ),
  );
  localTracksStore.set((s) => ({ tracks: [...tracks, ...s.tracks] }));
  return tracks.length;
}

/** Resolve any (kind, id) pair into something a card can render. */
export function resolveEntity(kind: BookmarkKind, id: string): Entity | null | undefined {
  switch (kind) {
    case 'track': {
      const t = trackById(id);
      return t && { kind, id, title: t.title, subtitle: t.artist, color: t.dominantColorHex, src: t.coverUrl, route: t.albumId ? { name: 'album', id: t.albumId } : undefined };
    }
    case 'artist': {
      const a = artistById(id);
      return a && { kind, id, title: a.name, subtitle: 'Artist', color: a.color, circle: true, glyph: Mic2, route: { name: 'artist', id } };
    }
    case 'album': {
      const a = albumById(id);
      return a && { kind, id, title: a.title, subtitle: `${artistById(a.artistId)?.name ?? ''} · ${a.year}`, color: a.color, src: a.coverUrl, glyph: Disc3, route: { name: 'album', id } };
    }
    case 'playlist': {
      const p = playlistById(id);
      return p && { kind, id, title: p.name, subtitle: `${p.trackIds.length} tracks`, color: p.color, glyph: ListMusic, route: { name: 'playlist', id } };
    }
    case 'show': {
      const s = showById(id);
      return s && { kind, id, title: s.title, subtitle: s.host, color: s.color, glyph: Podcast, route: { name: 'show', id } };
    }
    case 'book': {
      const b = bookById(id);
      return b && { kind, id, title: b.title, subtitle: b.author, color: b.color, route: { name: 'book', id } };
    }
    case 'station': {
      const s = stationById(id);
      return s && { kind, id, title: s.title, subtitle: 'Live radio', color: s.dominantColorHex, src: s.coverUrl, glyph: RadioTower, route: { name: 'radio' } };
    }
    case 'wiki': {
      const w = wikiById(id);
      return w && { kind, id, title: w.title, subtitle: w.era, color: w.color, glyph: Landmark, route: { name: 'article', id } };
    }
    case 'genre': {
      const g = genreById(id);
      return g && { kind, id, title: g.name, subtitle: g.era, color: g.colors[0], glyph: Shapes, route: { name: 'genre', id } };
    }
  }
  return null;
}
