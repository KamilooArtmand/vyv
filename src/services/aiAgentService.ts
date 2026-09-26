import { Track, AICommandResult } from '../types';

export class AIAgentService {
  static processCommand(command: string, allTracks: Track[]): AICommandResult {
    const raw = command.trim().toLowerCase();
    if (!raw) {
      return {
        action: 'Search',
        filteredTracks: allTracks,
        message: 'All tracks restored.',
      };
    }

    // Play commands
    if (
      raw.startsWith('play') ||
      raw.includes('start') ||
      raw.includes('listen to') ||
      raw.includes('resume')
    ) {
      const cleanKeyword = raw
        .replace(/play/g, '')
        .replace(/start/g, '')
        .replace(/listen to/g, '')
        .replace(/resume/g, '')
        .trim();

      if (cleanKeyword.length > 1) {
        const found = allTracks.find(
          (t) =>
            t.title.toLowerCase().includes(cleanKeyword) ||
            t.artist.toLowerCase().includes(cleanKeyword)
        );

        if (found) {
          return {
            action: 'Play',
            targetTrack: found,
            message: `Now playing: "${found.title}" by ${found.artist}`,
          };
        }
      }

      return {
        action: 'Play',
        message: 'Resuming playback...',
      };
    }

    // Pause commands
    if (
      raw.includes('pause') ||
      raw.includes('stop') ||
      raw.includes('halt') ||
      raw.includes('mute')
    ) {
      return {
        action: 'Pause',
        message: 'Playback paused.',
      };
    }

    // Next / Skip commands
    if (
      raw.includes('next') ||
      raw.includes('skip') ||
      raw.includes('forward')
    ) {
      return {
        action: 'Next',
        message: 'Playing next track...',
      };
    }

    // Previous commands
    if (
      raw.includes('prev') ||
      raw.includes('previous') ||
      raw.includes('back')
    ) {
      return {
        action: 'Prev',
        message: 'Playing previous track...',
      };
    }

    // Reset filter / show all
    if (
      raw.includes('all') ||
      raw.includes('everything') ||
      raw.includes('reset') ||
      raw.includes('clear') ||
      raw.includes('library')
    ) {
      return {
        action: 'Search',
        filteredTracks: allTracks,
        message: 'Displaying all tracks in library.',
      };
    }

    // Fallback: search query
    const results = allTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(raw) ||
        t.artist.toLowerCase().includes(raw) ||
        t.album.toLowerCase().includes(raw)
    );

    return {
      action: 'Search',
      filteredTracks: results,
      message: `Found ${results.length} track${results.length === 1 ? '' : 's'} matching "${command}".`,
    };
  }
}
