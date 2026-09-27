// ─────────────────────────────────────────────────────────────
// electron/preload.cjs: the narrow bridge the renderer may use.
// ─────────────────────────────────────────────────────────────

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vyvDesktop', {
  platform: process.platform,
  minimize: () => ipcRenderer.send('win:minimize'),
  toggleMaximize: () => ipcRenderer.send('win:toggle-maximize'),
  close: () => ipcRenderer.send('win:close'),
  setMode: (mode) => ipcRenderer.send('win:mode', mode),
  showModeMenu: (current) => ipcRenderer.send('win:mode-menu', current),
  resizeStart: (edge) => ipcRenderer.send('win:resize-start', edge),
  resizeEnd: () => ipcRenderer.send('win:resize-end'),
  getState: () => ipcRenderer.invoke('win:state'),
  onState: (cb) => {
    const fn = (_e, s) => cb(s);
    ipcRenderer.on('win:state', fn);
    return () => ipcRenderer.off('win:state', fn);
  },
  onSetMode: (cb) => {
    const fn = (_e, m) => cb(m);
    ipcRenderer.on('win:set-mode', fn);
    return () => ipcRenderer.off('win:set-mode', fn);
  },
  oauth: (provider, clientId, scope) => ipcRenderer.invoke('auth:oauth', { provider, clientId, scope }),
  openExternal: (url) => ipcRenderer.send('open-external', url),
});
