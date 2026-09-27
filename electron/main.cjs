// ─────────────────────────────────────────────────────────────
// electron/main.cjs: vyv desktop shell (Windows · macOS · Linux)
//
// A frameless, transparent window: the renderer draws its own
// curved body and minimal window controls. Player modes resize the
// real OS window (Cover = square, Micro = pill, Nano = orb) and the
// floating ones stay on top. OAuth runs out-of-process here, the way
// Google and Facebook require for desktop apps.
// ─────────────────────────────────────────────────────────────

const { app, BrowserWindow, Menu, ipcMain, screen, shell } = require('electron');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DEV = process.argv.includes('--dev');
const DEV_URL = process.env.VYV_DEV_URL || 'http://localhost:3000';
const DIST = path.join(__dirname, '..', 'dist');

/** Player-mode window geometry. `null` size means "restore the saved full bounds". */
const MODES = {
  Full: { size: null, onTop: false, aspect: 0, min: [960, 620] },
  Cover: { size: [560, 560], onTop: false, aspect: 1, min: [360, 360] },
  Micro: { size: [420, 88], onTop: true, aspect: 0, min: [420, 88] },
  Nano: { size: [168, 168], onTop: true, aspect: 1, min: [168, 168] },
};

let win = null;
let mode = 'Full';
let fullBounds = null;
let maximized = false;
let restoreBounds = null;

// ── Local static server ──────────────────────────────────────
// Serving the build from http://127.0.0.1 (not file://) gives the app a
// real origin, which YouTube embeds and media CDNs expect.
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

function serveDist() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent((req.url || '/').split('?')[0]);
      let file = path.normalize(path.join(DIST, url));
      if (!file.startsWith(DIST)) file = path.join(DIST, 'index.html');
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
      res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    });
    // A fixed port keeps localStorage (library, settings, session) stable across launches.
    server.once('error', () => server.listen(0, '127.0.0.1'));
    server.on('listening', () => resolve(`http://127.0.0.1:${server.address().port}`));
    server.listen(47823, '127.0.0.1');
  });
}

// ── Window ───────────────────────────────────────────────────
function sendState() {
  win?.webContents.send('win:state', { maximized, mode, platform: process.platform });
}

async function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: MODES.Full.min[0],
    minHeight: MODES.Full.min[1],
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: true,
    resizable: true,
    roundedCorners: true,
    show: false,
    title: 'vyv',
    icon: path.join(__dirname, '..', 'public', 'favicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.on('focus', sendState);

  await win.loadURL(DEV ? DEV_URL : await serveDist());
}

function workAreaFor(bounds) {
  return screen.getDisplayMatching(bounds).workArea;
}

function toggleMaximize() {
  if (!win || mode !== 'Full') return;
  if (maximized) {
    if (restoreBounds) win.setBounds(restoreBounds);
    maximized = false;
  } else {
    restoreBounds = win.getBounds();
    win.setBounds(workAreaFor(restoreBounds));
    maximized = true;
  }
  sendState();
}

function applyMode(next) {
  if (!win || !MODES[next] || next === mode) return;
  const spec = MODES[next];
  const current = win.getBounds();
  if (mode === 'Full') fullBounds = maximized ? restoreBounds ?? current : current;
  maximized = false;

  win.setAspectRatio(0);
  win.setMinimumSize(spec.min[0], spec.min[1]);
  win.setAlwaysOnTop(spec.onTop, 'floating');
  win.setVisibleOnAllWorkspaces?.(spec.onTop);

  if (!spec.size) {
    win.setBounds(fullBounds ?? { width: 1280, height: 820, x: current.x, y: current.y });
  } else {
    const [w, h] = spec.size;
    const area = workAreaFor(current);
    // Floating players dock to the bottom-right corner; Cover centers on the old window.
    const x = spec.onTop ? area.x + area.width - w - 28 : Math.round(current.x + (current.width - w) / 2);
    const y = spec.onTop ? area.y + area.height - h - 28 : Math.round(current.y + (current.height - h) / 2);
    win.setBounds({ x: Math.max(area.x, x), y: Math.max(area.y, y), width: w, height: h });
  }
  if (spec.aspect) win.setAspectRatio(spec.aspect);
  mode = next;
  sendState();
}

// ── Custom edge resize ───────────────────────────────────────
// Transparent windows can't rely on OS resize borders, so the renderer
// reports which edge was grabbed and we follow the cursor from here.
let resizeTimer = null;
function startResize(edge) {
  if (!win || maximized) return;
  const start = win.getBounds();
  const origin = screen.getCursorScreenPoint();
  const [minW, minH] = win.getMinimumSize();
  const aspect = MODES[mode].aspect;
  clearInterval(resizeTimer);
  resizeTimer = setInterval(() => {
    const p = screen.getCursorScreenPoint();
    const dx = p.x - origin.x;
    const dy = p.y - origin.y;
    const b = { ...start };
    if (edge.includes('e')) b.width = Math.max(minW, start.width + dx);
    if (edge.includes('s')) b.height = Math.max(minH, start.height + dy);
    if (edge.includes('w')) {
      b.width = Math.max(minW, start.width - dx);
      b.x = start.x + start.width - b.width;
    }
    if (edge.includes('n')) {
      b.height = Math.max(minH, start.height - dy);
      b.y = start.y + start.height - b.height;
    }
    if (aspect) b.height = b.width = Math.max(b.width, b.height);
    win.setBounds(b);
  }, 16);
}
function endResize() {
  clearInterval(resizeTimer);
  resizeTimer = null;
}

// ── OAuth (desktop) ──────────────────────────────────────────
const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Google: system browser + loopback redirect + PKCE (RFC 8252), as Google requires for installed apps. */
function googleOAuth({ clientId, scope }) {
  return new Promise((resolve, reject) => {
    const verifier = b64url(crypto.randomBytes(48));
    const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
    const state = b64url(crypto.randomBytes(16));
    const server = http.createServer(async (req, res) => {
      const u = new URL(req.url, 'http://127.0.0.1');
      if (u.pathname !== '/callback') return res.end();
      const done = (msg) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(`<body style="font:15px system-ui;background:#07080a;color:#f5f5f7;display:grid;place-items:center;height:100vh;margin:0"><p>${msg}</p></body>`);
        server.close();
        win?.focus();
      };
      if (u.searchParams.get('state') !== state || !u.searchParams.get('code')) {
        done('Sign-in was cancelled. You can close this tab.');
        return reject(new Error(u.searchParams.get('error') || 'cancelled'));
      }
      try {
        const body = new URLSearchParams({
          code: u.searchParams.get('code'),
          client_id: clientId,
          code_verifier: verifier,
          grant_type: 'authorization_code',
          redirect_uri: redirect,
        });
        // Desktop-type Google clients issue a non-confidential "secret"; pass it when configured.
        if (process.env.VYV_GOOGLE_CLIENT_SECRET) body.set('client_secret', process.env.VYV_GOOGLE_CLIENT_SECRET);
        const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body });
        const tok = await r.json();
        if (!tok.access_token) throw new Error(tok.error_description || tok.error || 'token exchange failed');
        done('Signed in to vyv. You can close this tab.');
        resolve({ accessToken: tok.access_token, expiresIn: tok.expires_in });
      } catch (e) {
        done('Sign-in failed. You can close this tab.');
        reject(e);
      }
    });
    let redirect = '';
    server.listen(0, '127.0.0.1', () => {
      redirect = `http://127.0.0.1:${server.address().port}/callback`;
      const q = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirect,
        response_type: 'code',
        scope,
        code_challenge: challenge,
        code_challenge_method: 'S256',
        state,
        prompt: 'select_account',
      });
      shell.openExternal(`https://accounts.google.com/o/oauth2/v2/auth?${q}`);
    });
    setTimeout(() => {
      server.close();
      reject(new Error('timeout'));
    }, 5 * 60_000);
  });
}

/** Facebook: the documented "manual login flow" for desktop apps, in a modal window. */
function facebookOAuth({ appId, scope }) {
  return new Promise((resolve, reject) => {
    const redirect = 'https://www.facebook.com/connect/login_success.html';
    const auth = new BrowserWindow({
      parent: win,
      modal: true,
      width: 520,
      height: 680,
      autoHideMenuBar: true,
      title: 'Continue with Facebook',
      webPreferences: { partition: 'persist:fb-auth', contextIsolation: true, sandbox: true },
    });
    let settled = false;
    const check = (url) => {
      if (!url.startsWith(redirect)) return;
      const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
      settled = true;
      auth.close();
      if (params.get('access_token')) resolve({ accessToken: params.get('access_token'), expiresIn: Number(params.get('expires_in')) });
      else reject(new Error(params.get('error_reason') || 'cancelled'));
    };
    auth.webContents.on('will-redirect', (_e, url) => check(url));
    auth.webContents.on('did-navigate', (_e, url) => check(url));
    auth.on('closed', () => !settled && reject(new Error('cancelled')));
    const q = new URLSearchParams({ client_id: appId, redirect_uri: redirect, response_type: 'token', scope, display: 'popup' });
    auth.loadURL(`https://www.facebook.com/v21.0/dialog/oauth?${q}`);
  });
}

// ── IPC ──────────────────────────────────────────────────────
ipcMain.on('win:minimize', () => win?.minimize());
ipcMain.on('win:toggle-maximize', toggleMaximize);
ipcMain.on('win:close', () => win?.close());
ipcMain.on('win:mode', (_e, next) => applyMode(next));
ipcMain.on('win:resize-start', (_e, edge) => startResize(String(edge)));
ipcMain.on('win:resize-end', endResize);
ipcMain.handle('win:state', () => ({ maximized, mode, platform: process.platform }));
ipcMain.on('win:mode-menu', (_e, current) => {
  const labels = { Full: 'Full app', Cover: 'Cover', Micro: 'Micro', Nano: 'Nano' };
  Menu.buildFromTemplate(
    Object.keys(MODES).map((m) => ({
      label: labels[m],
      type: 'radio',
      checked: m === current,
      click: () => win?.webContents.send('win:set-mode', m),
    })),
  ).popup({ window: win });
});
ipcMain.handle('auth:oauth', async (_e, { provider, clientId, scope }) => {
  if (provider === 'google') return googleOAuth({ clientId, scope });
  if (provider === 'facebook') return facebookOAuth({ appId: clientId, scope });
  throw new Error('unknown provider');
});
ipcMain.on('open-external', (_e, url) => /^https:\/\//.test(url) && shell.openExternal(url));

app.whenReady().then(createWindow);
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
