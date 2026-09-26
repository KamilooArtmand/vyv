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
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export type PlayerMode = 'Full' | 'Cover' | 'Micro' | 'Nano';
export type TabType = 'Archive' | 'Radio' | 'Favorites' | 'History';

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
}

export interface AudioDevice {
  id: string;
  name: string;
}

export interface AICommandResult {
  action: 'Play' | 'Pause' | 'Next' | 'Prev' | 'Search' | 'None';
  targetTrack?: Track;
  filteredTracks?: Track[];
  message: string;
}
