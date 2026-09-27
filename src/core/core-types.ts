// ─────────────────────────────────────────────────────────────
// core-types.ts: Universal Data Contracts & Domain Types
// ─────────────────────────────────────────────────────────────

export type MediaKind = 'music' | 'radio' | 'podcast' | 'audiobook' | 'video';

/** Where a playable item comes from. Everything except `vyv` and `local` is a live, real service. */
export type SourceId = 'vyv' | 'local' | 'radiobrowser' | 'audius' | 'itunes' | 'archive' | 'youtube';

export type Mood = 'calm' | 'focus' | 'energy' | 'night' | 'happy' | 'melancholy';

export interface Track {
  id: string;
  filePath: string;
  title: string;
  artist: string;
  album: string;
  durationSeconds: number;
  dominantColorHex: string;
  coverUrl?: string;
  isFavorite: boolean;
  addedAt: string;
  isRadio?: boolean;
  lrcLyrics?: string;
  kind?: MediaKind;
  artistId?: string;
  albumId?: string;
  genreId?: string;
  year?: number;
  moods?: Mood[];
  /** Origin service; absent means the built-in vyv catalogue. */
  source?: SourceId;
  /** False when the media host sends no CORS headers: play it outside the Web Audio graph. */
  cors?: boolean;
  /** Page on the origin service (attribution / "open in"). */
  pageUrl?: string;
  /** YouTube video id (video items rendered with the IFrame player). */
  youtubeId?: string;
  description?: string;
}

export type AuthProvider = 'google' | 'facebook';

/** A social identity linked to the vyv profile. vyv has no passwords: these ARE the account. */
export interface LinkedAccount {
  provider: AuthProvider;
  /** Provider's stable subject id. */
  sub: string;
  name: string;
  email?: string;
  picture?: string;
  linkedAt: string;
}

export interface User {
  id: string;
  username: string;
  handle: string;
  email: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  /** Provider used to create the account. */
  provider: AuthProvider;
  accounts: LinkedAccount[];
}

export interface LyricLine {
  time: number;
  text: string;
}

export type PlayerMode = 'Full' | 'Cover' | 'Micro' | 'Nano';

export interface Artist {
  id: string;
  name: string;
  color: string;
  genres: string[];
  bio: string;
  origin: string;
  since: number;
  listeners: number;
  related: string[];
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  year: number;
  color: string;
  coverUrl?: string;
  genreId: string;
  trackIds: string[];
}

export interface Genre {
  id: string;
  name: string;
  colors: [string, string];
  era: string;
  origin: string;
  about: string;
  related: string[];
}

export interface Episode {
  id: string;
  title: string;
  summary: string;
  durationSeconds: number;
  date: string;
  filePath: string;
}

export interface Show {
  id: string;
  title: string;
  host: string;
  color: string;
  category: string;
  about: string;
  episodes: Episode[];
}

export interface Audiobook {
  id: string;
  title: string;
  author: string;
  narrator: string;
  year: string;
  color: string;
  about: string;
  chapters: { id: string; title: string; durationSeconds: number; filePath: string }[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  color: string;
  trackIds: string[];
  smart?: boolean;
  createdAt: string;
}

export interface TimelineYear {
  year: number;
  headline: string;
  events: string[];
  wave: string[];
  wikiId?: string;
}

export interface WikiArticle {
  id: string;
  title: string;
  era: string;
  color: string;
  summary: string;
  sections: { heading: string; body: string }[];
  related: string[];
  genreId?: string;
}

export type NotificationType = 'release' | 'podcast' | 'agent' | 'social' | 'system';

export type RouteName =
  | 'home'
  | 'search'
  | 'library'
  | 'playlist'
  | 'bookmarks'
  | 'notifications'
  | 'podcasts'
  | 'show'
  | 'radio'
  | 'audiobooks'
  | 'book'
  | 'albums'
  | 'album'
  | 'artists'
  | 'artist'
  | 'genres'
  | 'genre'
  | 'timeline'
  | 'wiki'
  | 'article'
  | 'profile'
  | 'settings'
  | 'video'
  | 'discover';

export interface Route {
  name: RouteName;
  id?: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  time: string;
  read: boolean;
  route?: Route;
  imageUrl?: string;
}

export type BookmarkKind = 'track' | 'artist' | 'album' | 'playlist' | 'show' | 'book' | 'station' | 'wiki' | 'genre' | 'video';

export interface Bookmark {
  kind: BookmarkKind;
  id: string;
  at: string;
}

export interface AudioDevice {
  id: string;
  name: string;
}

export type ThemePref = 'auto' | 'light' | 'dark';

export type RepeatMode = 'off' | 'all' | 'one';

export type AgentAction =
  | { type: 'play'; track?: Track; queue?: Track[] }
  | { type: 'pause' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'shuffle'; value?: boolean }
  | { type: 'repeat'; mode?: RepeatMode }
  | { type: 'navigate'; route: Route }
  | { type: 'theme'; theme: ThemePref }
  | { type: 'volume'; value: number }
  | { type: 'favorite'; trackId: string }
  | { type: 'bookmark'; kind: BookmarkKind; id: string }
  | { type: 'sleep'; minutes: number | null }
  | { type: 'speed'; value: number }
  | { type: 'mode'; mode: PlayerMode }
  | { type: 'playlist'; playlist: Playlist }
  | { type: 'none' };

export interface AgentContext {
  tracks: Track[];
  current: Track | null;
  history: string[];
  now?: Date;
}

export interface AgentCard {
  kind: BookmarkKind;
  id: string;
}

export interface AgentReply {
  text: string;
  action: AgentAction;
  suggestions?: string[];
  cards?: AgentCard[];
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  suggestions?: string[];
  cards?: AgentCard[];
}
