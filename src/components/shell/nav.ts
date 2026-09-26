import {
  Bell,
  Bookmark,
  BookOpen,
  Disc3,
  History,
  House,
  Landmark,
  Library,
  Mic2,
  Podcast,
  RadioTower,
  Search,
  Settings2,
  Shapes,
  type LucideIcon,
} from 'lucide-react';
import type { RouteName } from '../../types';

export interface NavItem {
  name: RouteName;
  label: string;
  icon: LucideIcon;
  /** Detail routes that should highlight this item. */
  children?: RouteName[];
}

export const NAV_GROUPS: NavItem[][] = [
  [
    { name: 'home', label: 'Home', icon: House },
    { name: 'search', label: 'Search', icon: Search },
    { name: 'library', label: 'Library', icon: Library, children: ['playlist'] },
    { name: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ],
  [
    { name: 'radio', label: 'Radio', icon: RadioTower },
    { name: 'podcasts', label: 'Podcasts', icon: Podcast, children: ['show'] },
    { name: 'audiobooks', label: 'Audiobooks', icon: BookOpen, children: ['book'] },
  ],
  [
    { name: 'albums', label: 'Albums', icon: Disc3, children: ['album'] },
    { name: 'artists', label: 'Artists', icon: Mic2, children: ['artist'] },
    { name: 'genres', label: 'Genres', icon: Shapes, children: ['genre'] },
  ],
  [
    { name: 'timeline', label: 'Timeline', icon: History },
    { name: 'wiki', label: 'Wiki', icon: Landmark, children: ['article'] },
  ],
];

export const ALL_NAV: NavItem[] = [
  ...NAV_GROUPS.flat(),
  { name: 'notifications', label: 'Inbox', icon: Bell },
  { name: 'settings', label: 'Settings', icon: Settings2 },
];

export const isActive = (item: NavItem, current: RouteName) => item.name === current || !!item.children?.includes(current);

