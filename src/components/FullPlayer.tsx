import React, { useState, useRef } from 'react';
import { Track, PlayerMode, TabType, AudioDevice, User } from '../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Volume2,
  VolumeX,
  Sliders,
  FolderPlus,
  Sparkles,
  Bell,
  Maximize2,
  Minimize2,
  Disc,
} from 'lucide-react';

interface FullPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  fftBands: number[];
  currentTab: TabType;
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
  onTogglePlayPause: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  volume: number;
  onToggleFavorite: (track: Track) => void;
  onSetTab: (tab: TabType) => void;
  onSetMode: (mode: PlayerMode) => void;
  onAddLocalFiles: (files: FileList) => void;
  onTriggerNotification: () => void;
  onOpenAuth: () => void;
  user: User | null;
  dominantColor: string;
  audioDevices: AudioDevice[];
  selectedDeviceId: string;
  onSelectDevice: (id: string) => void;
  eqLow: number;
  eqMid: number;
  eqHigh: number;
  onSetEQ: (low: number, mid: number, high: number) => void;
  onAiCommand: (command: string) => void;
  aiMessage: string;
}

export const FullPlayer: React.FC<FullPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  fftBands,
  currentTab,
  tracks,
  onSelectTrack,
  onTogglePlayPause,
  onPlayNext,
  onPlayPrev,
  onSeek,
  onVolumeChange,
  volume,
  onToggleFavorite,
  onSetTab,
  onSetMode,
  onAddLocalFiles,
  onTriggerNotification,
  onOpenAuth,
  user,
  dominantColor,
  audioDevices,
  selectedDeviceId,
  onSelectDevice,
  eqLow,
  eqMid,
  eqHigh,
  onSetEQ,
  onAiCommand,
  aiMessage,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleKeyDownAi = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && aiInput.trim()) {
      onAiCommand(aiInput);
      setAiInput('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsScanning(true);
      onAddLocalFiles(e.target.files);
      setTimeout(() => setIsScanning(false), 500);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative" dir="ltr">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 bg-black/30 border-r border-white/10 p-5 flex flex-col justify-between overflow-y-auto backdrop-blur-xl">
          <div>
            {/* App Brand Header (Clickable Logo to switch to Cover Mode) */}
            <div
              onClick={() => onSetMode('Cover')}
              className="flex items-center gap-3 mb-6 px-1 cursor-pointer group select-none"
              title="Click logo to switch to Cover & Lyrics Mode"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 active:scale-95 group-hover:shadow-indigo-500/30"
                style={{ backgroundColor: dominantColor }}
              >
                <Disc className="w-6 h-6 text-white animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold tracking-tight text-white uppercase group-hover:text-red-400 transition">
                    VYV Player
                  </h1>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-white/10 text-zinc-300 font-mono">
                    ⇄
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono tracking-widest uppercase block">
                  Tap for Cover Mode
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => onSetTab('Archive')}
                className={`py-2 px-3 text-xs rounded-xl font-medium transition ${
                  currentTab === 'Archive'
                    ? 'bg-white/15 text-white shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Archive
              </button>
              <button
                type="button"
                onClick={() => onSetTab('Radio')}
                className={`py-2 px-3 text-xs rounded-xl font-medium transition flex items-center justify-center gap-1.5 ${
                  currentTab === 'Radio'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Live Radio
              </button>
              <button
                type="button"
                onClick={() => onSetTab('Favorites')}
                className={`py-2 px-3 text-xs rounded-xl font-medium transition ${
                  currentTab === 'Favorites'
                    ? 'bg-white/15 text-white shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Favorites
              </button>
              <button
                type="button"
                onClick={() => onSetTab('History')}
                className={`py-2 px-3 text-xs rounded-xl font-medium transition ${
                  currentTab === 'History'
                    ? 'bg-white/15 text-white shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                History
              </button>
            </div>

            {/* Tab Specific Action */}
            {currentTab === 'Archive' ? (
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="audio/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-medium transition flex items-center justify-center gap-2"
                >
                  <FolderPlus size={16} />
                  {isScanning ? 'Scanning files...' : 'Import Music Files'}
                </button>
              </div>
            ) : (
              <div className="mb-4 text-center py-2 px-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-zinc-400">
                Direct high-fidelity online radio streams
              </div>
            )}

            <div className="border-t border-white/10 my-4"></div>

            {/* View Mode Switchers */}
            <div className="flex flex-col gap-1 mb-4">
              <span className="text-[11px] text-zinc-500 font-semibold mb-1 px-1">Display Modes:</span>
              <button
                type="button"
                onClick={() => onSetMode('Cover')}
                className="w-full text-left py-2 px-3 rounded-xl hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center justify-between"
              >
                <span>[Switch to Cover Mode]</span>
                <Maximize2 size={13} className="opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => onSetMode('Micro')}
                className="w-full text-left py-2 px-3 rounded-xl hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center justify-between"
              >
                <span>[Switch to Micro Player]</span>
                <Minimize2 size={13} className="opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => onSetMode('Nano')}
                className="w-full text-left py-2 px-3 rounded-xl hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center justify-between"
              >
                <span>[Switch to Nano Player]</span>
                <Disc size={13} className="opacity-60" />
              </button>
            </div>

            <div className="border-t border-white/10 my-4"></div>

            {/* DSP / Equalizer & Settings */}
            <div>
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="w-full text-left py-2 px-3 rounded-xl hover:bg-white/10 text-xs font-medium text-zinc-300 hover:text-white transition flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sliders size={14} /> Advanced DSP & Equalizer ⚙️
                </span>
                <span className="text-zinc-500">{showSettings ? '▲' : '▼'}</span>
              </button>

              {showSettings && (
                <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-3 animate-fadeIn">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Audio Output Device:</label>
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => onSelectDevice(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-white/15 text-zinc-200 outline-none"
                    >
                      {audioDevices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-2 font-semibold">
                      DSP Parametric Equalizer:
                    </label>
                    <div className="flex flex-col gap-2.5 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-300">Bass (250Hz)</span>
                        <input
                          type="range"
                          min="-15"
                          max="15"
                          value={eqLow}
                          onChange={(e) => onSetEQ(Number(e.target.value), eqMid, eqHigh)}
                          className="w-28"
                        />
                        <span className="w-8 text-right font-mono text-zinc-400">{eqLow}dB</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-300">Mid (1kHz)</span>
                        <input
                          type="range"
                          min="-15"
                          max="15"
                          value={eqMid}
                          onChange={(e) => onSetEQ(eqLow, Number(e.target.value), eqHigh)}
                          className="w-28"
                        />
                        <span className="w-8 text-right font-mono text-zinc-400">{eqMid}dB</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-300">Treble (4kHz)</span>
                        <input
                          type="range"
                          min="-15"
                          max="15"
                          value={eqHigh}
                          onChange={(e) => onSetEQ(eqLow, eqMid, Number(e.target.value))}
                          className="w-28"
                        />
                        <span className="w-8 text-right font-mono text-zinc-400">{eqHigh}dB</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Volume Control in Sidebar */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)}
                className="text-zinc-400 hover:text-white"
              >
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-[11px] font-mono text-zinc-400 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-6 overflow-hidden pb-28">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Discover Music</h2>
              <p className="text-xs text-zinc-400">(Liquid Glass Design System)</p>
            </div>

            {/* AI Assistant Command Input */}
            <div className="flex-1 max-w-lg relative">
              <div className="relative">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={handleKeyDownAi}
                  placeholder="Ask Assistant: 'play midnight', 'pause', 'next' or search tracks..."
                  className="w-full py-2.5 pl-10 pr-4 rounded-2xl bg-white/[0.06] border border-white/15 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-red-500/50 backdrop-blur-xl transition shadow-inner"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Sparkles size={16} className="text-amber-400" />
                </div>
              </div>

              {/* AI Popover Response */}
              {aiMessage && (
                <div className="absolute top-12 left-0 z-30 px-3.5 py-2 rounded-xl bg-zinc-900/95 border border-white/20 text-xs text-white shadow-xl backdrop-blur animate-slide-up flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {aiMessage}
                </div>
              )}
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button
                type="button"
                onClick={onTriggerNotification}
                className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 hover:bg-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition relative shadow"
                title="View Announcements & News"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
              </button>

              {/* User Avatar / Profile */}
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-2.5 p-1 pl-3 rounded-2xl bg-white/[0.06] border border-white/10 hover:bg-white/15 transition shadow"
              >
                {user ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-9 h-9 rounded-xl object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-zinc-300">
                    <Disc size={18} />
                  </div>
                )}
                <div className="text-left">
                  <div className="text-xs font-semibold text-white">
                    {user ? user.username : 'Sign In / Profile'}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {user ? user.handle : 'Guest Account'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Track Table / List */}
          <div className="flex-1 overflow-y-auto rounded-3xl bg-black/20 border border-white/10 p-2 backdrop-blur-md">
            {tracks.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-400 text-sm gap-3">
                <Disc size={36} className="text-zinc-600 animate-pulse" />
                <span>No tracks found. Import your audio files or choose another tab.</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-[11px] font-semibold">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">TITLE</th>
                    <th className="py-3 px-4">ARTIST</th>
                    <th className="py-3 px-4">ALBUM</th>
                    <th className="py-3 px-4 w-16 text-center">DURATION</th>
                    <th className="py-3 px-4 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {tracks.map((track, idx) => {
                    const isSelected = currentTrack?.id === track.id;
                    return (
                      <tr
                        key={track.id}
                        onClick={() => onSelectTrack(track)}
                        className={`group cursor-pointer transition ${
                          isSelected
                            ? 'bg-white/10 font-bold text-white'
                            : 'hover:bg-white/[0.05] text-zinc-300'
                        }`}
                      >
                        <td className="py-3 px-4 text-center text-zinc-500 font-mono text-[11px]">
                          {isSelected && isPlaying ? (
                            <span className="flex items-center justify-center gap-0.5">
                              <span className="w-1 h-3 bg-red-500 animate-bounce"></span>
                              <span className="w-1 h-4 bg-red-400 animate-bounce delay-75"></span>
                              <span className="w-1 h-2 bg-red-500 animate-bounce delay-150"></span>
                            </span>
                          ) : (
                            idx + 1
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {track.coverUrl && (
                              <img
                                src={track.coverUrl}
                                alt={track.title}
                                className="w-8 h-8 rounded-lg object-cover shadow-sm"
                              />
                            )}
                            <div>
                              <div className="text-white text-xs">{track.title}</div>
                              {track.isRadio && (
                                <span className="inline-block mt-0.5 text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded font-sans tracking-wider">
                                  LIVE RADIO
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-400">{track.artist}</td>
                        <td className="py-3 px-4 text-zinc-400">{track.album}</td>
                        <td className="py-3 px-4 text-center font-mono text-zinc-500 text-[11px]">
                          {track.isRadio ? 'LIVE' : formatTime(track.durationSeconds)}
                        </td>
                        <td
                          className="py-3 px-4 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(track);
                          }}
                        >
                          <button
                            type="button"
                            className="p-1 text-zinc-500 hover:text-red-400 transition"
                          >
                            <Heart
                              size={16}
                              className={
                                track.isFavorite
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-zinc-500 hover:text-white'
                              }
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Floating Glass Player Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-zinc-950/80 border-t border-white/10 backdrop-blur-2xl px-6 flex items-center justify-between z-20"
        dir="ltr"
      >
        {/* Track Thumbnail & Info */}
        <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
          <div
            className="w-14 h-14 rounded-2xl bg-cover bg-center border border-white/15 shadow-xl shrink-0 transition-transform hover:scale-105"
            style={{
              backgroundImage: `url(${currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80'})`,
            }}
          />
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate">
              {currentTrack?.title || 'No audio selected'}
            </h4>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {currentTrack?.artist || 'VYV Audio Player'}
            </p>
          </div>

          {currentTrack && !currentTrack.isRadio && (
            <button
              type="button"
              onClick={() => onToggleFavorite(currentTrack)}
              className="p-1.5 text-zinc-400 hover:text-red-400 transition ml-2 shrink-0"
            >
              <Heart
                size={18}
                className={
                  currentTrack.isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-zinc-500 hover:text-white'
                }
              />
            </button>
          )}
        </div>

        {/* Real-time FFT Audio Spectrum Visualizer */}
        <div className="flex items-end justify-center h-10 gap-1 px-4 flex-1 max-w-xs">
          {fftBands.map((band, idx) => {
            const heightPx = isPlaying ? Math.max(4, Math.round(band * 36)) : 3;
            return (
              <div
                key={idx}
                className="w-1 rounded-full transition-all duration-75"
                style={{
                  height: `${heightPx}px`,
                  backgroundColor: dominantColor || '#f43f5e',
                  opacity: isPlaying ? 0.9 : 0.25,
                }}
              />
            );
          })}
        </div>

        {/* Timeline & Controls */}
        <div className="flex flex-col items-center gap-1.5 w-1/3 min-w-[280px]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onPlayPrev}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition active:scale-95"
            >
              <SkipBack size={16} />
            </button>

            <button
              type="button"
              onClick={onTogglePlayPause}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: dominantColor || '#ef4444' }}
            >
              {isPlaying ? (
                <Pause size={22} className="fill-white" />
              ) : (
                <Play size={22} className="fill-white ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onPlayNext}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition active:scale-95"
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Timeline Bar */}
          <div className="w-full flex items-center gap-2 text-[10px] font-mono text-zinc-400">
            <span>{currentTrack?.isRadio ? 'LIVE' : formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTrack?.isRadio ? 100 : currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              disabled={Boolean(currentTrack?.isRadio)}
              className="flex-1"
            />
            <span>{currentTrack?.isRadio ? '∞' : formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
