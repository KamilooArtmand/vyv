import { LyricLine } from '../types';

export class LyricsService {
  static parseLrc(lrcContent: string): LyricLine[] {
    if (!lrcContent) return [];
    const lines = lrcContent.split('\n');
    const lyrics: LyricLine[] = [];
    const regex = /\[(\d{1,2}):(\d{1,2}(?:\.\d+)?)\](.*)/;

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      const match = regex.exec(trimmed);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        const text = match[3].trim();
        if (text) {
          lyrics.push({
            time: minutes * 60 + seconds,
            text,
          });
        }
      }
    }

    return lyrics.sort((a, b) => a.time - b.time);
  }

  static getActiveLyricIndex(lyrics: LyricLine[], currentTime: number): number {
    if (!lyrics || lyrics.length === 0) return -1;
    let activeIdx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= currentTime) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  }
}
