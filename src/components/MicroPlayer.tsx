import React from 'react';
import { Track, PlayerMode } from '../types';
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from 'lucide-react';

interface MicroPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  fftBands: number[];
  onSetMode: (mode: PlayerMode) => void;
  onTogglePlayPause: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  dominantColor: string;
}

export const MicroPlayer: React.FC<MicroPlayerProps> = ({
  currentTrack,
  isPlaying,
  fftBands,
  onSetMode,
  onTogglePlayPause,
  onPlayNext,
  onPlayPrev,
  dominantColor,
}) => {
  const coverUrl =
    currentTrack?.coverUrl ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80';

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-zinc-950/80">
      <div
        onDoubleClick={() => onSetMode('Full')}
        className="w-full max-w-md bg-zinc-900/90 border border-white/15 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl flex items-center gap-4 animate-slide-up select-none cursor-pointer group"
        title="Double-click to return to Full Player"
        dir="ltr"
      >
        {/* Cover Thumbnail */}
        <div
          className="w-14 h-14 rounded-2xl bg-cover bg-center border border-white/20 shadow-md shrink-0 transition-transform group-hover:scale-105"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />

        {/* Track Info & Visualizer */}
        <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
          <div className="truncate">
            <h3 className="text-sm font-bold text-white truncate">
              {currentTrack?.title || 'VYV Player'}
            </h3>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {currentTrack?.artist || 'Ready for playback'}
            </p>
          </div>

          {/* Mini FFT spectrum (10 bands) */}
          {isPlaying && (
            <div className="flex items-end h-6 gap-1 shrink-0 px-1">
              {fftBands.slice(0, 10).map((band, idx) => (
                <div
                  key={idx}
                  className="w-0.5 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(3, Math.round(band * 24))}px`,
                    backgroundColor: dominantColor || '#ef4444',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Micro Playback Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayPrev();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition active:scale-95"
            title="Previous Track"
          >
            <SkipBack size={14} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlayPause();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition active:scale-95"
            style={{ backgroundColor: dominantColor || '#ef4444' }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={18} className="fill-white" />
            ) : (
              <Play size={18} className="fill-white ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayNext();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition active:scale-95"
            title="Next Track"
          >
            <SkipForward size={14} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSetMode('Full');
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition ml-1"
            title="Return to Full Player"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
