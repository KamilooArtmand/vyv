import { AudioDevice } from '../types';

export class AudioService {
  private static audio: HTMLAudioElement | null = null;
  private static audioContext: AudioContext | null = null;
  private static sourceNode: MediaElementAudioSourceNode | null = null;
  private static analyserNode: AnalyserNode | null = null;
  
  // Equalizer nodes
  private static lowFilter: BiquadFilterNode | null = null;
  private static midFilter: BiquadFilterNode | null = null;
  private static highFilter: BiquadFilterNode | null = null;

  public static isPlaying: boolean = false;
  public static currentTime: number = 0;
  public static duration: number = 0;
  public static volume: number = 0.85;

  private static onEndedCallbacks: (() => void)[] = [];
  private static onTimeUpdateCallbacks: ((time: number, duration: number) => void)[] = [];
  private static onStateChangeCallbacks: ((isPlaying: boolean) => void)[] = [];

  private static isInitialized = false;
  private static dataArray: Uint8Array | null = null;

  static initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.volume = this.volume;

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.currentTime = this.audio.currentTime || 0;
        this.duration = this.audio.duration || 0;
        this.onTimeUpdateCallbacks.forEach((cb) => cb(this.currentTime, this.duration));
      }
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.notifyState();
      this.onEndedCallbacks.forEach((cb) => cb());
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notifyState();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notifyState();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback notice:', e);
      this.isPlaying = false;
      this.notifyState();
    });
  }

  private static ensureAudioContext(): void {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx && this.audio) {
        try {
          this.audioContext = new AudioCtx();
          this.sourceNode = this.audioContext.createMediaElementSource(this.audio);

          // Equalizer: Low (Bass), Mid, High (Treble)
          this.lowFilter = this.audioContext.createBiquadFilter();
          this.lowFilter.type = 'lowshelf';
          this.lowFilter.frequency.value = 250;
          this.lowFilter.gain.value = 0;

          this.midFilter = this.audioContext.createBiquadFilter();
          this.midFilter.type = 'peaking';
          this.midFilter.frequency.value = 1000;
          this.midFilter.Q.value = 1;
          this.midFilter.gain.value = 0;

          this.highFilter = this.audioContext.createBiquadFilter();
          this.highFilter.type = 'highshelf';
          this.highFilter.frequency.value = 4000;
          this.highFilter.gain.value = 0;

          // Analyser
          this.analyserNode = this.audioContext.createAnalyser();
          this.analyserNode.fftSize = 64;
          this.analyserNode.smoothingTimeConstant = 0.8;
          this.dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

          // Graph: source -> low -> mid -> high -> analyser -> destination
          this.sourceNode.connect(this.lowFilter);
          this.lowFilter.connect(this.midFilter);
          this.midFilter.connect(this.highFilter);
          this.highFilter.connect(this.analyserNode);
          this.analyserNode.connect(this.audioContext.destination);
        } catch (err) {
          console.warn('Web Audio API not fully available or CORS restricted:', err);
        }
      }
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
  }

  static play(filePath: string): void {
    this.initialize();
    this.ensureAudioContext();

    if (!this.audio) return;

    if (this.audio.src !== filePath) {
      this.audio.src = filePath;
      this.audio.load();
    }

    const promise = this.audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          this.isPlaying = true;
          this.notifyState();
        })
        .catch((err) => {
          console.warn('Audio play request interrupted or requires user interaction:', err);
          this.isPlaying = false;
          this.notifyState();
        });
    }
  }

  static pause(): void {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
      this.notifyState();
    }
  }

  static resume(): void {
    if (this.audio) {
      this.ensureAudioContext();
      this.audio.play().then(() => {
        this.isPlaying = true;
        this.notifyState();
      }).catch(() => {});
    }
  }

  static stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
      this.notifyState();
    }
  }

  static setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  static setPosition(seconds: number): void {
    if (this.audio && Number.isFinite(seconds)) {
      this.audio.currentTime = seconds;
      this.currentTime = seconds;
    }
  }

  static setEqualizer(low: number, mid: number, high: number): void {
    if (this.lowFilter) this.lowFilter.gain.value = low;
    if (this.midFilter) this.midFilter.gain.value = mid;
    if (this.highFilter) this.highFilter.gain.value = high;
  }

  static getFFT(): number[] {
    const bands: number[] = new Array(16).fill(0);
    if (!this.isPlaying) {
      return bands;
    }

    if (this.analyserNode && this.dataArray) {
      try {
        this.analyserNode.getByteFrequencyData(this.dataArray as unknown as Uint8Array<ArrayBuffer>);
        // Downsample bins to 16 bands
        const binCount = this.analyserNode.frequencyBinCount;
        const step = Math.max(1, Math.floor(binCount / 16));
        let hasSignal = false;

        for (let i = 0; i < 16; i++) {
          const start = i * step;
          let sum = 0;
          for (let j = 0; j < step && (start + j) < binCount; j++) {
            sum += this.dataArray[start + j];
          }
          const avg = sum / step / 255;
          bands[i] = avg;
          if (avg > 0.02) hasSignal = true;
        }

        if (hasSignal) {
          return bands;
        }
      } catch {
        // Fallback to lively simulated bands
      }
    }

    // Animated fallback so visualizer is always active when playing
    const time = Date.now() / 150;
    for (let i = 0; i < 16; i++) {
      const val = 0.2 + 0.6 * Math.abs(Math.sin(time + i * 0.45)) * Math.cos(time * 0.7 + i * 0.2);
      bands[i] = Math.max(0.05, Math.min(1, val));
    }
    return bands;
  }

  static async getAudioDevices(): Promise<AudioDevice[]> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return [{ id: 'default', name: 'Default System Output' }];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices
        .filter((d) => d.kind === 'audiooutput')
        .map((d, index) => ({
          id: d.deviceId || `device-${index}`,
          name: d.label || `Audio Output ${index + 1}`,
        }));

      if (audioOutputs.length === 0) {
        return [{ id: 'default', name: 'Default System Output' }];
      }
      return audioOutputs;
    } catch {
      return [{ id: 'default', name: 'Default System Output' }];
    }
  }

  static async setAudioDevice(deviceId: string): Promise<void> {
    if (this.audio && 'setSinkId' in this.audio) {
      try {
        await (this.audio as HTMLAudioElement & { setSinkId: (id: string) => Promise<void> }).setSinkId(deviceId);
      } catch (err) {
        console.warn('Failed to switch audio sink device:', err);
      }
    }
  }

  static onPlaybackEnded(cb: () => void): () => void {
    this.onEndedCallbacks.push(cb);
    return () => {
      this.onEndedCallbacks = this.onEndedCallbacks.filter((c) => c !== cb);
    };
  }

  static onTimeUpdate(cb: (time: number, duration: number) => void): () => void {
    this.onTimeUpdateCallbacks.push(cb);
    return () => {
      this.onTimeUpdateCallbacks = this.onTimeUpdateCallbacks.filter((c) => c !== cb);
    };
  }

  static onStateChange(cb: (isPlaying: boolean) => void): () => void {
    this.onStateChangeCallbacks.push(cb);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter((c) => c !== cb);
    };
  }

  private static notifyState(): void {
    this.onStateChangeCallbacks.forEach((cb) => cb(this.isPlaying));
  }
}
