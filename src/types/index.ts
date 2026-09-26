export type MediaKind = 'music' | 'radio' | 'podcast' | 'audiobook';

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
  /** Mood tags used by the AI agent for predictive mixes. */
  moods?: Mood[];
}

export type Mood = 'calm' | 'focus' | 'energy' | 'night' | 'happy' | 'melancholy';

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

export interface Show {
  id: string;
  title: string;
  host: string;
  color: string;
  category: string;
  about: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  summary: string;
  durationSeconds: number;
  date: string;
  filePath: string;
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
  /** Built by the AI agent rather than by the user. */
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

export type BookmarkKind = 'track' | 'artist' | 'album' | 'playlist' | 'show' | 'book' | 'station' | 'wiki' | 'genre';

export interface Bookmark {
  kind: BookmarkKind;
  id: string;
  at: string;
}

export interface AudioDevice {
  id: string;
  name: string;
}

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
  | 'settings';

export interface Route {
  name: RouteName;
  id?: string;
}

export type AgentAction =
  | { type: 'play'; track?: Track; queue?: Track[] }
  | { type: 'pause' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'navigate'; route: Route }
  | { type: 'theme'; theme: ThemePref }
  | { type: 'volume'; value: number }
  | { type: 'shuffle' }
  | { type: 'repeat' }
  | { type: 'like' }
  | { type: 'bookmark' }
  | { type: 'sleep'; minutes: number }
  | { type: 'speed'; value: number }
  | { type: 'mode'; mode: PlayerMode }
  | { type: 'playlist'; playlist: Playlist }
  | { type: 'none' };

export interface AgentReply {
  text: string;
  action: AgentAction;
  cards?: { kind: BookmarkKind; id: string }[];
  suggestions?: string[];
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  cards?: { kind: BookmarkKind; id: string }[];
  suggestions?: string[];
}

export type ThemePref = 'dark' | 'light' | 'auto';
export type RepeatMode = 'off' | 'all' | 'one';
