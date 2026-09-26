import React from 'react';
import { Track, LyricLine, PlayerMode } from '../types';
import { Play, Pause, SkipBack, SkipForward, ArrowLeft, Minimize2, Heart, Disc, Maximize2 } from 'lucide-react';

interface CoverPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  lyrics: LyricLine[];
  activeLyricIndex: number;
  onSetMode: (mode: PlayerMode) => void;
  onTogglePlayPause: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onSeek: (seconds: number) => void;
  onToggleFavorite: (track: Track) => void;
  dominantColor: string;
}

export const CoverPlayer: React.FC<CoverPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  lyrics,
  activeLyricIndex,
  onSetMode,
  onTogglePlayPause,
  onPlayNext,
  onPlayPrev,
  onSeek,
  onToggleFavorite,
  dominantColor,
}) => {
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const coverUrl =
    currentTrack?.coverUrl ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80';

  // Quick cycle between modes by tapping on the brand/logo
  const handleCycleNextMode = () => {
    onSetMode('Micro');
  };

  return (
    <div
      className="w-full h-full relative overflow-y-auto sm:overflow-hidden flex flex-col justify-between bg-black animate-fadeIn select-none"
      dir="ltr"
    >
      {/* Dynamic Background Image with Ambient Glass Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-110 filter blur-2xl opacity-40"
        style={{ backgroundImage: `url(${coverUrl})` }}
      />
      <div className="absolute inset-0 bg-black/75 backdrop-blur-3xl" />
      <div
        className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${dominantColor} 0%, transparent 65%)`,
        }}
      />

      {/* Top Header Navigation (Mobile & Desktop Unified) */}
      <header className="relative z-20 px-4 py-3 sm:px-8 sm:py-5 flex items-center justify-between">
        {/* Interactive Logo Button with Modes switcher built-in */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCycleNextMode}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-90 hover:scale-105 group relative"
            style={{ backgroundColor: dominantColor }}
            title="Tap logo to switch player size (Micro / Nano / Full)"
          >
            <Disc className="w-5 h-5 text-white animate-spin-slow" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-black/70 rounded-full flex items-center justify-center border border-white/30 text-[8px] text-white">
              ⇄
            </div>
          </button>

          <div
            onClick={handleCycleNextMode}
            className="cursor-pointer group flex flex-col"
            title="Tap to cycle modes"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-red-300 transition">
                VYV
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-white/10 text-zinc-300 border border-white/10">
                Cover
              </span>
            </div>
            <span className="text-[9px] text-zinc-400 font-mono tracking-wider">
              Tap logo to switch size
            </span>
          </div>
        </div>

        {/* Action Controls right next to each other */}
        <div className="flex items-center gap-2">
          {/* Switch to Full Mode */}
          <button
            type="button"
            onClick={() => onSetMode('Full')}
            className="flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-xs backdrop-blur-md transition shadow"
            title="Switch to Full Expanded Player"
          >
            <Maximize2 size={14} />
            <span className="hidden sm:inline font-medium">Full</span>
          </button>

          {/* Switch to Micro Mode */}
          <button
            type="button"
            onClick={() => onSetMode('Micro')}
            className="flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-xs backdrop-blur-md transition shadow"
            title="Switch to Micro Player"
          >
            <Minimize2 size={14} />
            <span className="hidden sm:inline font-medium">Micro</span>
          </button>

          {/* Switch to Nano Mode */}
          <button
            type="button"
            onClick={() => onSetMode('Nano')}
            className="p-1.5 sm:py-2 sm:px-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-xs backdrop-blur-md transition shadow"
            title="Switch to Nano Bubble Mode"
          >
            <Disc size={15} />
          </button>
        </div>
      </header>

      {/* Main Center Area: Mobile Stacked, Desktop Side-by-Side */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12 px-4 sm:px-8 max-w-6xl mx-auto w-full my-auto">
        {/* Album Artwork with Ambient Glow */}
        <div className="flex flex-col items-center">
          <div
            className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative group shrink-0 transition-transform duration-500 hover:scale-102"
            style={{
              boxShadow: `0 20px 50px -10px ${dominantColor}66`,
            }}
          >
            <img
              src={coverUrl}
              alt="Album Artwork"
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-white flex items-center gap-1 font-mono">
                <Disc size={12} className="animate-spin-slow text-red-400" />
                PLAYING
              </div>
            )}
          </div>

          {/* Track Title and Artist on Mobile under Artwork */}
          <div className="mt-3 text-center md:hidden max-w-xs">
            <h2 className="text-base font-bold text-white truncate drop-shadow">
              {currentTrack?.title || 'VYV Player'}
            </h2>
            <p className="text-xs text-zinc-300 truncate mt-0.5">
              {currentTrack?.artist || 'Ready for playback'}
            </p>
          </div>
        </div>

        {/* Synchronized Karaoke Lyrics Display */}
        <div className="flex-1 max-w-xl h-44 sm:h-64 md:h-80 flex flex-col justify-center items-center text-center overflow-hidden px-2">
          {lyrics.length > 0 && activeLyricIndex >= 0 ? (
            <div className="space-y-2 sm:space-y-4 transition-all duration-300 w-full">
              {/* Previous lyric line */}
              {activeLyricIndex > 0 && (
                <p className="text-xs sm:text-sm md:text-base text-zinc-500 opacity-60 transition duration-300 truncate">
                  {lyrics[activeLyricIndex - 1].text}
                </p>
              )}

              {/* Active Current Lyric Line */}
              <h2
                className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-relaxed drop-shadow-xl scale-102 transition-all duration-300 px-4 py-2.5 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/15"
                style={{ textShadow: `0 0 25px ${dominantColor}` }}
              >
                {lyrics[activeLyricIndex].text}
              </h2>

              {/* Next lyric line */}
              {activeLyricIndex < lyrics.length - 1 && (
                <p className="text-xs sm:text-sm md:text-base text-zinc-400 opacity-70 transition duration-300 truncate">
                  {lyrics[activeLyricIndex + 1].text}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center p-4">
              <div className="hidden md:block">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {currentTrack?.title || 'VYV Player'}
                </h2>
                <p className="text-sm text-zinc-300 mb-3">
                  {currentTrack?.artist || 'Ambient Soundscapes'}
                </p>
              </div>
              <span className="inline-block text-[11px] text-zinc-300 bg-white/10 py-1.5 px-3 rounded-full border border-white/15 backdrop-blur-sm">
                {currentTrack?.isRadio ? 'Live Radio Streaming' : 'Synchronized lyrics ready for playback'}
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Floating Glass Control Bar (Mobile-first Touch friendly) */}
      <footer className="relative z-20 p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full" dir="ltr">
        {/* Timeline Bar */}
        <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-300 mb-3 sm:mb-4 px-1">
          <span className="w-10 text-left">{currentTrack?.isRadio ? 'LIVE' : formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTrack?.isRadio ? 100 : currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            disabled={Boolean(currentTrack?.isRadio)}
            className="flex-1 cursor-pointer"
          />
          <span className="w-10 text-right">{currentTrack?.isRadio ? '∞' : formatTime(duration)}</span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-7">
          {currentTrack && !currentTrack.isRadio && (
            <button
              type="button"
              onClick={() => onToggleFavorite(currentTrack)}
              className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur active:scale-90 transition"
              title="Add to Favorites"
            >
              <Heart
                size={18}
                className={currentTrack.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}
              />
            </button>
          )}

          <button
            type="button"
            onClick={onPlayPrev}
            className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition active:scale-90 hover:scale-105"
            title="Previous Track"
          >
            <SkipBack size={20} />
          </button>

          <button
            type="button"
            onClick={onTogglePlayPause}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition hover:scale-105 active:scale-90"
            style={{ backgroundColor: dominantColor || '#ef4444' }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={26} className="fill-white" />
            ) : (
              <Play size={26} className="fill-white ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onPlayNext}
            className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition active:scale-90 hover:scale-105"
            title="Next Track"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
};
