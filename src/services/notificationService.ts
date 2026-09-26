import { NotificationItem } from '../types';

export class NotificationService {
  private static newsList: NotificationItem[] = [
    {
      id: 'news-1',
      title: 'New Album Released! 🎵',
      content: 'The Weeknd — "Dawn FM" is now streaming in high fidelity.',
      imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80',
    },
    {
      id: 'news-2',
      title: 'New Podcast Episode 🎙️',
      content: 'Tech Talk Episode #42 is now live with ambient electronic discussions.',
      imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80',
    },
    {
      id: 'news-3',
      title: 'VYV Engine v2.0 Live ⚙️',
      content: 'Enjoy real-time 3-band DSP equalizer and liquid glass visualizer.',
      imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80',
    },
  ];

  static getRandomNews(): NotificationItem {
    const idx = Math.floor(Math.random() * this.newsList.length);
    return {
      ...this.newsList[idx],
      id: `toast-${Date.now()}`,
    };
  }

  static getAllNews(): NotificationItem[] {
    return this.newsList;
  }
}
