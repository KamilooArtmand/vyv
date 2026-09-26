import React from 'react';
import { Track, PlayerMode } from '../types';
import { Play, Pause, Maximize2 } from 'lucide-react';

interface NanoPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onSetMode: (mode: PlayerMode) => void;
  onTogglePlayPause: () => void;
  dominantColor: string;
}

export const NanoPlayer: React.FC<NanoPlayerProps> = ({
  currentTrack,
  isPlaying,
  onSetMode,
  onTogglePlayPause,
  dominantColor,
}) => {
  const coverUrl =
    currentTrack?.coverUrl ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-zinc-950/80">
      <div className="relative group">
        {/* Circular Nano Badge */}
        <div
          onDoubleClick={() => onSetMode('Full')}
          className="w-36 h-36 rounded-full bg-cover bg-center border-2 border-white/20 shadow-2xl relative overflow-hidden cursor-pointer select-none transition-transform group-hover:scale-105"
          style={{
            backgroundImage: `url(${coverUrl})`,
            boxShadow: `0 0 35px ${dominantColor}55`,
          }}
          title="Double-click to return to Full Player"
        >
          {/* Pulsing ring when playing */}
          {isPlaying && (
            <div
              className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping opacity-25 pointer-events-none"
              style={{ borderColor: dominantColor }}
            />
          )}

          {/* Hover Play/Pause Glass Overlay */}
          <div
            onClick={onTogglePlayPause}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            {isPlaying ? (
              <Pause size={36} className="fill-white drop-shadow" />
            ) : (
              <Play size={36} className="fill-white ml-1 drop-shadow" />
            )}
          </div>
        </div>

        {/* Restore Mode Button Pill */}
        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={() => onSetMode('Full')}
            className="px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/15 text-[11px] text-zinc-300 hover:text-white flex items-center gap-1.5 backdrop-blur shadow"
          >
            <Maximize2 size={12} />
            <span>Full Player</span>
          </button>
        </div>
      </div>
    </div>
  );
};
