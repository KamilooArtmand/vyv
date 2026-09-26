# 🎵 VYV Player — Liquid Glass Music & Radio System

> **A cutting-edge, ultra-responsive music and radio streaming player featuring a futuristic Liquid Glass design system, 3-band DSP equalizer, real-time 16-band FFT visualizer, synchronized karaoke lyrics, AI assistant command bar, and user profiles.**

---

## 🛠️ Technology Stack
* **Framework**: React 19 SPA (Functional components, hooks, modular architecture)
* **Build Tool & Bundler**: Vite 6 (Lightning-fast HMR and optimized tree-shaking)
* **Language**: TypeScript 5.7+ (Strict type checking)
* **Styling**: Tailwind CSS v4 with custom Liquid Glass design tokens, curved borders, and dynamic backdrop blur filters
* **Audio Engine**: Web Audio API
  * **DSP Equalizer**: 3-Band BiquadFilterNodes (Bass at 250Hz, Mid peaking at 1000Hz, Treble at 4000Hz, -15dB to +15dB range)
  * **Spectrum Visualizer**: Real-time 16-band FFT Frequency AnalyserNode
* **Fonts**: Inter (Sans-Serif typography)
* **Icons**: Lucide Icons
* **Platform Support**: Web SPA, Progressive Web App (PWA), and Desktop-ready (Tauri / Electron)

---

## 💻 Running & Installing on Windows

You can run and install VYV Player on Windows in multiple convenient ways:

### Option A: 1-Click Windows PWA Installation (Instant & Recommended)
1. Open the app URL in **Google Chrome** or **Microsoft Edge** on Windows.
2. Click the **"Install app"** icon in the address bar (or Menu `...` → **Apps** → **"Install VYV Player"**).
3. The app will install as a native Windows desktop application with its own window, taskbar icon, Start Menu shortcut, and offline caching support.

### Option B: Standalone Windows `.exe` via Tauri (Ultra-lightweight ~5MB)
Add Tauri to wrap the Vite build:
```bash
npm install -D @tauri-apps/cli
npx tauri init
npx tauri build
```
The resulting `.exe` and `.msix` installers will be generated in `src-tauri/target/release/bundle/`.

### Option C: Desktop Build via Electron
```bash
npm install -D electron electron-builder
# Build frontend and package into windows installer
npm run build
npx electron-builder --win
```

---

## ✨ Key Features
* **4 Distinct Player Modes**:
  * **Full Mode**: Comprehensive sidebar, search, audio device selector, EQ DSP, track table, and bottom glass controller.
  * **Cover Mode**: Immersive full-screen album artwork with dynamic ambient lighting and synchronized scrolling lyrics (.lrc).
  * **Micro Mode**: Compact floating horizontal desktop widget with 10-band mini visualizer.
  * **Nano Mode**: Circular floating badge with hover play/pause controls and pulse glow.
* **Live Radio Streams**: Curated high-fidelity stations (Lofi Girl, Synthwave Nightride, Venice Classic, Deep House Lounge, Jazz 24).
* **Local Audio Import**: Import custom audio files (.mp3, .wav, .flac, .ogg, .m4a) with automatic metadata parsing.
* **AI Command Bar**: Natural language speech and text commands for playback, navigation, and library search.
* **User Profile & Social Panel**: Google/Facebook OAuth simulation, email registration, profile editing, and follower counter.

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```
