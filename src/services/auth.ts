// ─────────────────────────────────────────────────────────────
// services/auth.ts: Real Google & Facebook sign-in (no passwords)
//
// Web:     Google Identity Services token client + Facebook JS SDK.
// Desktop: the Electron shell runs the provider flow out-of-process
//          (system browser + loopback/PKCE for Google, the manual
//          login dialog for Facebook) and hands back an access token.
// Either way the token is used once to read the public profile.
// ─────────────────────────────────────────────────────────────

import { desktop } from '../core/core-desktop';
import { cloudEnabled } from './cloud';
import type { AuthProvider, LinkedAccount } from '../core/core-types';

const env = import.meta.env;
export const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID ?? '';
export const GOOGLE_DESKTOP_CLIENT_ID = env.VITE_GOOGLE_DESKTOP_CLIENT_ID || GOOGLE_CLIENT_ID;
export const FACEBOOK_APP_ID = env.VITE_FACEBOOK_APP_ID ?? '';

const GOOGLE_SCOPE = 'openid email profile';
const FACEBOOK_SCOPE = 'public_profile,email';
const FB_VERSION = 'v21.0';

export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'not-configured' | 'cancelled' | 'failed',
  ) {
    super(message);
  }
}

export function isConfigured(provider: AuthProvider): boolean {
  // With Supabase, provider credentials live in the Supabase dashboard, not in the app.
  if (cloudEnabled) return true;
  return provider === 'google' ? !!(desktop ? GOOGLE_DESKTOP_CLIENT_ID : GOOGLE_CLIENT_ID) : !!FACEBOOK_APP_ID;
}

const scripts = new Map<string, Promise<void>>();
function loadScript(src: string): Promise<void> {
  if (!scripts.has(src)) {
    scripts.set(
      src,
      new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.src = src;
        el.async = true;
        el.defer = true;
        el.crossOrigin = 'anonymous';
        el.onload = () => resolve();
        el.onerror = () => {
          scripts.delete(src);
          reject(new AuthError('Could not reach the sign-in service. Check your connection.', 'failed'));
        };
        document.head.appendChild(el);
      }),
    );
  }
  return scripts.get(src)!;
}

// ── Google ───────────────────────────────────────────────────
interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}
interface GoogleOAuth2 {
  initTokenClient: (cfg: {
    client_id: string;
    scope: string;
    prompt?: string;
    callback: (r: GoogleTokenResponse) => void;
    error_callback?: (e: { type: string }) => void;
  }) => { requestAccessToken: () => void };
  revoke: (token: string, done?: () => void) => void;
}
const gis = () => (window as unknown as { google?: { accounts: { oauth2: GoogleOAuth2 } } }).google?.accounts.oauth2;

let googleToken: string | null = null;

async function googleAccessToken(): Promise<string> {
  if (desktop) {
    try {
      const { accessToken } = await desktop.oauth('google', GOOGLE_DESKTOP_CLIENT_ID, GOOGLE_SCOPE);
      return accessToken;
    } catch (e) {
      throw new AuthError(String((e as Error).message).includes('cancel') ? 'Sign-in cancelled' : 'Google sign-in failed', 'cancelled');
    }
  }
  await loadScript('https://accounts.google.com/gsi/client');
  const oauth2 = gis();
  if (!oauth2) throw new AuthError('Google sign-in is unavailable', 'failed');
  return new Promise((resolve, reject) => {
    oauth2
      .initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPE,
        prompt: 'select_account',
        callback: (r) => (r.access_token ? resolve(r.access_token) : reject(new AuthError(r.error_description || 'Google sign-in failed', 'failed'))),
        error_callback: (e) => reject(new AuthError(e.type === 'popup_closed' ? 'Sign-in cancelled' : 'Google sign-in failed', 'cancelled')),
      })
      .requestAccessToken();
  });
}

async function signInGoogle(): Promise<LinkedAccount> {
  const token = await googleAccessToken();
  googleToken = token;
  const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new AuthError('Could not read your Google profile', 'failed');
  const p = (await r.json()) as { sub: string; name?: string; email?: string; picture?: string };
  return { provider: 'google', sub: p.sub, name: p.name || p.email || 'Google user', email: p.email, picture: p.picture, linkedAt: new Date().toISOString() };
}

// ── Facebook ─────────────────────────────────────────────────
interface FBAuthResponse {
  status: string;
  authResponse?: { accessToken: string };
}
interface FBSdk {
  init: (cfg: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }) => void;
  login: (cb: (r: FBAuthResponse) => void, opts: { scope: string }) => void;
  logout: (cb?: () => void) => void;
  getLoginStatus: (cb: (r: FBAuthResponse) => void) => void;
}
const fbSdk = () => (window as unknown as { FB?: FBSdk }).FB;
let fbReady: Promise<FBSdk> | null = null;

function loadFacebook(): Promise<FBSdk> {
  fbReady ??= loadScript('https://connect.facebook.net/en_US/sdk.js').then(() => {
    const FB = fbSdk();
    if (!FB) throw new AuthError('Facebook sign-in is unavailable', 'failed');
    FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: FB_VERSION });
    return FB;
  });
  return fbReady;
}

async function facebookAccessToken(): Promise<string> {
  if (desktop) {
    try {
      const { accessToken } = await desktop.oauth('facebook', FACEBOOK_APP_ID, FACEBOOK_SCOPE);
      return accessToken;
    } catch {
      throw new AuthError('Sign-in cancelled', 'cancelled');
    }
  }
  const FB = await loadFacebook();
  return new Promise((resolve, reject) =>
    FB.login((r) => (r.authResponse?.accessToken ? resolve(r.authResponse.accessToken) : reject(new AuthError('Sign-in cancelled', 'cancelled'))), {
      scope: FACEBOOK_SCOPE,
    }),
  );
}

async function signInFacebook(): Promise<LinkedAccount> {
  const token = await facebookAccessToken();
  const r = await fetch(`https://graph.facebook.com/${FB_VERSION}/me?fields=id,name,email,picture.width(256).height(256)&access_token=${encodeURIComponent(token)}`);
  if (!r.ok) throw new AuthError('Could not read your Facebook profile', 'failed');
  const p = (await r.json()) as { id: string; name: string; email?: string; picture?: { data?: { url?: string; is_silhouette?: boolean } } };
  const pic = p.picture?.data;
  return { provider: 'facebook', sub: p.id, name: p.name, email: p.email, picture: pic && !pic.is_silhouette ? pic.url : undefined, linkedAt: new Date().toISOString() };
}

// ── Public API ───────────────────────────────────────────────
export async function signInWith(provider: AuthProvider): Promise<LinkedAccount> {
  if (!isConfigured(provider)) {
    throw new AuthError(
      provider === 'google' ? 'Google sign-in needs VITE_GOOGLE_CLIENT_ID in .env' : 'Facebook sign-in needs VITE_FACEBOOK_APP_ID in .env',
      'not-configured',
    );
  }
  return provider === 'google' ? signInGoogle() : signInFacebook();
}

/** Best-effort provider sign-out; the local session is cleared regardless. */
export function signOutProviders() {
  if (googleToken) gis()?.revoke(googleToken);
  googleToken = null;
  if (!desktop && FACEBOOK_APP_ID && fbSdk()) {
    fbSdk()!.getLoginStatus((r) => r.status === 'connected' && fbSdk()!.logout());
  }
}
