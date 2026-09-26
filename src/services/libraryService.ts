import { Track } from '../types';

const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Rain of Ambient Dreams',
    artist: 'Elysian Soundscapes',
    album: 'Serenity Vol. 1',
    durationSeconds: 236,
    filePath: 'https://cdn.freesound.org/previews/612/612644_5674468-lq.mp3',
    dominantColorHex: '#6366f1',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
    isFavorite: true,
    addedAt: '2026-01-15T10:00:00Z',
    lrcLyrics: `[00:00.00]Soft droplets falling in the tranquil evening
[00:12.50]Distant piano melodies drifting through the haze
[00:25.00]Echoes of serene raindrops washing over memories
[00:40.00]A quiet rhythm beating softly in the twilight
[00:58.00]Strings ascend like gentle night breezes
[01:15.00]Peaceful stillness touching every breath
[01:35.00]A harmonic tapestry weaving into the dark
[01:55.00]Subtle tones lingering with warmth
[02:15.00]Fading gently into golden silence`,
  },
  {
    id: 'track-2',
    title: 'Midnight City Glow',
    artist: 'Neon Odyssey',
    album: 'Future Horizon',
    durationSeconds: 198,
    filePath: 'https://cdn.freesound.org/previews/568/568853_7037-lq.mp3',
    dominantColorHex: '#ec4899',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
    isFavorite: false,
    addedAt: '2026-01-20T12:00:00Z',
    lrcLyrics: `[00:00.00]Neon lights flicker across the pavement
[00:15.00]Cruising through the electric twilight
[00:30.00]Synthesizers pulse like a heartbeat
[00:48.00]Lost in the sound of midnight city
[01:05.00]Reflections shimmering on wet glass
[01:25.00]Bass resonates deep in the night
[01:45.00]Endless horizon glowing ahead`,
  },
  {
    id: 'track-3',
    title: 'Desert Odyssey & Wind',
    artist: 'Acoustic Traveler',
    album: 'Nomad Chronicles',
    durationSeconds: 310,
    filePath: 'https://cdn.freesound.org/previews/689/689366_11861866-lq.mp3',
    dominantColorHex: '#f59e0b',
    coverUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80',
    isFavorite: true,
    addedAt: '2026-02-01T08:30:00Z',
    lrcLyrics: `[00:00.00]A lonely wind whispers over golden dunes
[00:20.00]Ancient strings echo under the desert sun
[00:45.00]Footsteps carved deep in timeless sand
[01:10.00]Rhythmic pulses guided by distant stars
[01:40.00]Campfire sparks ascending to the cosmos
[02:10.00]Rising chords echoing through mountain canyons
[02:45.00]A quiet descent into the silent night`,
  },
  {
    id: 'track-4',
    title: 'Deep Ambient Drift',
    artist: 'Solar Echoes',
    album: 'Cosmic Waves',
    durationSeconds: 245,
    filePath: 'https://cdn.freesound.org/previews/657/657954_11861866-lq.mp3',
    dominantColorHex: '#06b6d4',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
    isFavorite: false,
    addedAt: '2026-02-14T14:20:00Z',
    lrcLyrics: `[00:00.00]Floating weightless in zero gravity
[00:20.00]Gentle soundwaves expand across space
[00:50.00]Soft chords like distant stellar lights
[01:20.00]Deep resonance embracing mind and soul
[01:50.00]Calm tranquility washes over you`,
  },
  {
    id: 'track-5',
    title: 'Morning Bloom & Sunlight',
    artist: 'Verdant Symphony',
    album: 'Botanical Harmony',
    durationSeconds: 215,
    filePath: 'https://cdn.freesound.org/previews/560/560447_649468-lq.mp3',
    dominantColorHex: '#10b981',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
    isFavorite: false,
    addedAt: '2026-02-28T16:45:00Z',
    lrcLyrics: `[00:00.00]First light caressing emerald fields
[00:15.00]Acoustic strings intertwine with morning dew
[00:35.00]Flutes dancing on fresh forest winds
[00:55.00]Peaceful harmony embracing clean nature
[01:25.00]Golden rays shining through green canopies`,
  },
];

const STORAGE_KEY_TRACKS = 'vyv_player_tracks_en';
const STORAGE_KEY_FAVORITES = 'vyv_player_favorites_en';
const STORAGE_KEY_HISTORY = 'vyv_player_history_en';

export class LibraryService {
  private static tracks: Track[] = [];
  private static historyIds: string[] = [];

  static init(): void {
    try {
      const storedTracks = localStorage.getItem(STORAGE_KEY_TRACKS);
      if (storedTracks) {
        this.tracks = JSON.parse(storedTracks);
      } else {
        this.tracks = [...INITIAL_TRACKS];
        this.saveTracks();
      }

      const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (storedHistory) {
        this.historyIds = JSON.parse(storedHistory);
      }
    } catch {
      this.tracks = [...INITIAL_TRACKS];
    }
  }

  private static saveTracks(): void {
    try {
      localStorage.setItem(STORAGE_KEY_TRACKS, JSON.stringify(this.tracks));
    } catch {
      // Storage quota or disabled
    }
  }

  static getAllTracks(): Track[] {
    if (this.tracks.length === 0) {
      this.init();
    }
    return [...this.tracks];
  }

  static toggleFavorite(trackId: string): void {
    const track = this.tracks.find((t) => t.id === trackId);
    if (track) {
      track.isFavorite = !track.isFavorite;
      this.saveTracks();
    }
  }

  static getFavorites(): Track[] {
    return this.getAllTracks().filter((t) => t.isFavorite);
  }

  static addToHistory(trackId: string): void {
    this.historyIds = [trackId, ...this.historyIds.filter((id) => id !== trackId)].slice(0, 50);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.historyIds));
    } catch {
      // ignore
    }
  }

  static getHistory(): Track[] {
    const all = this.getAllTracks();
    return this.historyIds
      .map((id) => all.find((t) => t.id === id))
      .filter((t): t is Track => t !== undefined);
  }

  static addCustomTrack(file: File): Promise<Track> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const nameParts = file.name.replace(/\.[^/.]+$/, '').split('-');
      
      let title = file.name.replace(/\.[^/.]+$/, '');
      let artist = 'Local Artist';
      
      if (nameParts.length >= 2) {
        artist = nameParts[0].trim();
        title = nameParts.slice(1).join('-').trim();
      }

      const colors = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newTrack: Track = {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        artist,
        album: 'My Collection',
        durationSeconds: 0,
        filePath: url,
        dominantColorHex: randomColor,
        coverUrl: `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80`,
        isFavorite: false,
        addedAt: new Date().toISOString(),
      };

      const tempAudio = new Audio();
      tempAudio.src = url;
      tempAudio.onloadedmetadata = () => {
        newTrack.durationSeconds = Math.round(tempAudio.duration);
        this.tracks.unshift(newTrack);
        this.saveTracks();
        resolve(newTrack);
      };
      tempAudio.onerror = () => {
        this.tracks.unshift(newTrack);
        this.saveTracks();
        resolve(newTrack);
      };
    });
  }
}
