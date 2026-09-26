import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Track, PlayerMode, TabType, LyricLine, AudioDevice, User, NotificationItem } from './types';
import { AudioService } from './services/audioService';
import { LibraryService } from './services/libraryService';
import { RadioService } from './services/radioService';
import { LyricsService } from './services/lyricsService';
import { AIAgentService } from './services/aiAgentService';
import { AuthService } from './services/authService';
import { NotificationService } from './services/notificationService';
import { FullPlayer } from './components/FullPlayer';
import { CoverPlayer } from './components/CoverPlayer';
import { MicroPlayer } from './components/MicroPlayer';
import { NanoPlayer } from './components/NanoPlayer';
import { AuthPanel } from './components/AuthPanel';
import { NotificationToast } from './components/NotificationToast';

export const App: React.FC = () => {
  const [playerMode, setPlayerMode] = useState<PlayerMode>('Cover');
  const [currentTab, setCurrentTab] = useState<TabType>('Archive');

  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [radioStations, setRadioStations] = useState<Track[]>([]);
  const [displayedTracks, setDisplayedTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);

  const [fftBands, setFftBands] = useState<number[]>(new Array(16).fill(0));
  const [dominantColor, setDominantColor] = useState<string>('#6366f1');

  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(-1);

  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);

  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('default');

  const [eqLow, setEqLow] = useState<number>(0);
  const [eqMid, setEqMid] = useState<number>(0);
  const [eqHigh, setEqHigh] = useState<number>(0);

  const [aiMessage, setAiMessage] = useState<string>('');

  const currentTrackRef = useRef<Track | null>(null);
  currentTrackRef.current = currentTrack;

  const displayedTracksRef = useRef<Track[]>([]);
  displayedTracksRef.current = displayedTracks;

  // Initial Boot
  useEffect(() => {
    LibraryService.init();
    AuthService.init();
    AudioService.initialize();

    const initialTracks = LibraryService.getAllTracks();
    const stations = RadioService.getRadioStations();
    setAllTracks(initialTracks);
    setRadioStations(stations);
    setDisplayedTracks(initialTracks);

    if (initialTracks.length > 0) {
      const first = initialTracks[0];
      setCurrentTrack(first);
      setDominantColor(first.dominantColorHex || '#6366f1');
      if (first.lrcLyrics) {
        setLyrics(LyricsService.parseLrc(first.lrcLyrics));
      }
    }

    setUser(AuthService.getCurrentUser());

    // Audio devices enumeration
    AudioService.getAudioDevices().then((devices) => {
      setAudioDevices(devices);
      if (devices.length > 0) {
        setSelectedDeviceId(devices[0].id);
      }
    });

    // Time update callback
    const unsubTime = AudioService.onTimeUpdate((time, dur) => {
      setCurrentTime(time);
      setDuration(dur);
    });

    // State change callback
    const unsubState = AudioService.onStateChange((playing) => {
      setIsPlaying(playing);
    });

    // Auto next on end
    const unsubEnd = AudioService.onPlaybackEnded(() => {
      handlePlayNext();
    });

    // Auto notification after 5s
    const notifTimer = setTimeout(() => {
      setActiveNotification(NotificationService.getRandomNews());
    }, 4500);

    return () => {
      unsubTime();
      unsubState();
      unsubEnd();
      clearTimeout(notifTimer);
    };
  }, []);

  // Real-time FFT Visualizer Animation Loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      if (AudioService.isPlaying) {
        setFftBands(AudioService.getFFT());
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Update active synchronized lyric line
  useEffect(() => {
    if (lyrics.length > 0) {
      const idx = LyricsService.getActiveLyricIndex(lyrics, currentTime);
      setActiveLyricIndex(idx);
    } else {
      setActiveLyricIndex(-1);
    }
  }, [currentTime, lyrics]);

  // Tab change handler
  const handleTabChange = useCallback((tab: TabType) => {
    setCurrentTab(tab);
    if (tab === 'Archive') {
      setDisplayedTracks(LibraryService.getAllTracks());
    } else if (tab === 'Radio') {
      setDisplayedTracks(RadioService.getRadioStations());
    } else if (tab === 'Favorites') {
      setDisplayedTracks(LibraryService.getFavorites());
    } else if (tab === 'History') {
      setDisplayedTracks(LibraryService.getHistory());
    }
  }, []);

  // Track select & play
  const handleSelectTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setDominantColor(track.dominantColorHex || '#6366f1');

    if (track.lrcLyrics) {
      setLyrics(LyricsService.parseLrc(track.lrcLyrics));
    } else {
      setLyrics([]);
    }

    if (!track.isRadio) {
      LibraryService.addToHistory(track.id);
    }

    AudioService.play(track.filePath);
  }, []);

  // Play / Pause toggle
  const handleTogglePlayPause = useCallback(() => {
    if (!currentTrackRef.current) {
      if (displayedTracksRef.current.length > 0) {
        handleSelectTrack(displayedTracksRef.current[0]);
      }
      return;
    }

    if (AudioService.isPlaying) {
      AudioService.pause();
    } else {
      AudioService.resume();
    }
  }, [handleSelectTrack]);

  // Next track
  const handlePlayNext = useCallback(() => {
    const list = displayedTracksRef.current;
    if (list.length === 0) return;
    const current = currentTrackRef.current;
    if (!current) {
      handleSelectTrack(list[0]);
      return;
    }

    const idx = list.findIndex((t) => t.id === current.id);
    if (idx !== -1 && idx < list.length - 1) {
      handleSelectTrack(list[idx + 1]);
    } else {
      handleSelectTrack(list[0]);
    }
  }, [handleSelectTrack]);

  // Previous track
  const handlePlayPrev = useCallback(() => {
    const list = displayedTracksRef.current;
    if (list.length === 0) return;
    const current = currentTrackRef.current;
    if (!current) {
      handleSelectTrack(list[0]);
      return;
    }

    const idx = list.findIndex((t) => t.id === current.id);
    if (idx > 0) {
      handleSelectTrack(list[idx - 1]);
    } else {
      handleSelectTrack(list[list.length - 1]);
    }
  }, [handleSelectTrack]);

  // Seek
  const handleSeek = (seconds: number) => {
    AudioService.setPosition(seconds);
    setCurrentTime(seconds);
  };

  // Volume
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    AudioService.setVolume(vol);
  };

  // Toggle Favorite
  const handleToggleFavorite = (track: Track) => {
    LibraryService.toggleFavorite(track.id);
    // Refresh lists
    setAllTracks(LibraryService.getAllTracks());
    if (currentTab === 'Favorites') {
      setDisplayedTracks(LibraryService.getFavorites());
    } else if (currentTab === 'Archive') {
      setDisplayedTracks(LibraryService.getAllTracks());
    }
    if (currentTrack?.id === track.id) {
      setCurrentTrack({ ...currentTrack, isFavorite: !currentTrack.isFavorite });
    }
  };

  // Add local files
  const handleAddLocalFiles = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i)) {
        await LibraryService.addCustomTrack(file);
      }
    }
    const updated = LibraryService.getAllTracks();
    setAllTracks(updated);
    if (currentTab === 'Archive') {
      setDisplayedTracks(updated);
    }
  };

  // Trigger manual notification
  const handleTriggerNotification = () => {
    setActiveNotification(NotificationService.getRandomNews());
  };

  // Equalizer
  const handleSetEQ = (low: number, mid: number, high: number) => {
    setEqLow(low);
    setEqMid(mid);
    setEqHigh(high);
    AudioService.setEqualizer(low, mid, high);
  };

  // Audio Device
  const handleSelectDevice = (id: string) => {
    setSelectedDeviceId(id);
    AudioService.setAudioDevice(id);
  };

  // AI Command processing
  const handleAiCommand = (command: string) => {
    const result = AIAgentService.processCommand(command, allTracks);
    setAiMessage(result.message);

    if (result.action === 'Play') {
      if (result.targetTrack) {
        handleSelectTrack(result.targetTrack);
      } else {
        AudioService.resume();
      }
    } else if (result.action === 'Pause') {
      AudioService.pause();
    } else if (result.action === 'Next') {
      handlePlayNext();
    } else if (result.action === 'Prev') {
      handlePlayPrev();
    } else if (result.action === 'Search' && result.filteredTracks) {
      setDisplayedTracks(result.filteredTracks);
    }

    setTimeout(() => {
      setAiMessage('');
    }, 4000);
  };

  return (
    <div
      className="w-full h-full relative transition-all duration-1000 overflow-hidden font-sans"
      style={{
        backgroundImage: `radial-gradient(circle at 18% 25%, ${dominantColor}30 0%, transparent 55%), radial-gradient(circle at 82% 75%, #18181b 0%, transparent 60%)`,
        backgroundColor: '#09090b',
      }}
    >
      {/* Toast Notification */}
      <NotificationToast
        notification={activeNotification}
        onClose={() => setActiveNotification(null)}
      />

      {/* Auth Modal */}
      {isAuthOpen && (
        <AuthPanel
          user={user}
          onClose={() => setIsAuthOpen(false)}
          onUserChange={(newUser) => setUser(newUser)}
        />
      )}

      {/* Render Current Player Mode */}
      {playerMode === 'Full' && (
        <FullPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          fftBands={fftBands}
          currentTab={currentTab}
          tracks={displayedTracks}
          onSelectTrack={handleSelectTrack}
          onTogglePlayPause={handleTogglePlayPause}
          onPlayNext={handlePlayNext}
          onPlayPrev={handlePlayPrev}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          volume={volume}
          onToggleFavorite={handleToggleFavorite}
          onSetTab={handleTabChange}
          onSetMode={setPlayerMode}
          onAddLocalFiles={handleAddLocalFiles}
          onTriggerNotification={handleTriggerNotification}
          onOpenAuth={() => setIsAuthOpen(true)}
          user={user}
          dominantColor={dominantColor}
          audioDevices={audioDevices}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={handleSelectDevice}
          eqLow={eqLow}
          eqMid={eqMid}
          eqHigh={eqHigh}
          onSetEQ={handleSetEQ}
          onAiCommand={handleAiCommand}
          aiMessage={aiMessage}
        />
      )}

      {playerMode === 'Cover' && (
        <CoverPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          lyrics={lyrics}
          activeLyricIndex={activeLyricIndex}
          onSetMode={setPlayerMode}
          onTogglePlayPause={handleTogglePlayPause}
          onPlayNext={handlePlayNext}
          onPlayPrev={handlePlayPrev}
          onSeek={handleSeek}
          onToggleFavorite={handleToggleFavorite}
          dominantColor={dominantColor}
        />
      )}

      {playerMode === 'Micro' && (
        <MicroPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          fftBands={fftBands}
          onSetMode={setPlayerMode}
          onTogglePlayPause={handleTogglePlayPause}
          onPlayNext={handlePlayNext}
          onPlayPrev={handlePlayPrev}
          dominantColor={dominantColor}
        />
      )}

      {playerMode === 'Nano' && (
        <NanoPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onSetMode={setPlayerMode}
          onTogglePlayPause={handleTogglePlayPause}
          dominantColor={dominantColor}
        />
      )}
    </div>
  );
};
