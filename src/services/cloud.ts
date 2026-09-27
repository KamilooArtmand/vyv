// ─────────────────────────────────────────────────────────────
// services/cloud.ts: Supabase — accounts (Google / Facebook OAuth)
// and the per-user database. Optional: without VITE_SUPABASE_URL the
// app runs local-only with the direct provider sign-in in auth.ts.
// ─────────────────────────────────────────────────────────────

import { createClient, type Session, type SupabaseClient, type UserIdentity } from '@supabase/supabase-js';
import { desktop } from '../core/core-desktop';
import type { AuthProvider, LinkedAccount, User } from '../core/core-types';

const URL_ = import.meta.env.VITE_SUPABASE_URL ?? '';
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const cloudEnabled = !!(URL_ && ANON);

/** Fixed loopback port for the desktop OAuth callback (allow-list it in Supabase → Auth → URL Configuration). */
export const DESKTOP_CALLBACK = 'http://127.0.0.1:47824/callback';

export const supabase: SupabaseClient | null = cloudEnabled
  ? createClient(URL_, ANON, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'vyv.supabase.auth' },
    })
  : null;

function toAccount(i: UserIdentity): LinkedAccount | null {
  if (i.provider !== 'google' && i.provider !== 'facebook') return null;
  const d = (i.identity_data ?? {}) as Record<string, string | undefined>;
  return {
    provider: i.provider,
    sub: d.sub || d.provider_id || i.id,
    name: d.full_name || d.name || d.email || i.provider,
    email: d.email,
    picture: d.avatar_url || d.picture,
    linkedAt: i.created_at ?? new Date().toISOString(),
  };
}

interface ProfileRow {
  username: string;
  handle: string | null;
  bio: string;
  avatar_url: string | null;
  cover_url: string | null;
}

/** Build the app's User from the Supabase session + profiles row. */
export async function userFromSession(session: Session): Promise<User> {
  const u = session.user;
  const accounts = (u.identities ?? []).map(toAccount).filter(Boolean) as LinkedAccount[];
  const meta = u.user_metadata as Record<string, string | undefined>;
  const { data } = await supabase!.from('profiles').select('username, handle, bio, avatar_url, cover_url').eq('id', u.id).maybeSingle<ProfileRow>();
  const name = data?.username || meta.full_name || meta.name || u.email?.split('@')[0] || 'Listener';
  return {
    id: u.id,
    username: name,
    handle: data?.handle || `@${(u.email?.split('@')[0] || name).toLowerCase().replace(/[^a-z0-9_.]/g, '')}`,
    email: u.email ?? '',
    avatarUrl: data?.avatar_url || meta.avatar_url || meta.picture || '',
    coverUrl: data?.cover_url || '',
    bio: data?.bio || '',
    followersCount: 0,
    followingCount: 0,
    provider: (accounts[0]?.provider ?? 'google') as AuthProvider,
    accounts,
  };
}

/** Sign in (or, with `link`, attach another provider to the signed-in account). */
export async function cloudSignIn(provider: AuthProvider, link = false): Promise<void> {
  const sb = supabase!;
  const scopes = provider === 'facebook' ? 'email public_profile' : 'openid email profile';
  const queryParams = provider === 'google' ? { prompt: 'select_account' } : undefined;

  if (desktop) {
    // Desktop: open the provider in the system browser, catch the code on a loopback port (PKCE).
    const opts = { redirectTo: DESKTOP_CALLBACK, scopes, queryParams, skipBrowserRedirect: true };
    const { data, error } = link ? await sb.auth.linkIdentity({ provider, options: opts }) : await sb.auth.signInWithOAuth({ provider, options: opts });
    if (error || !data?.url) throw new Error(error?.message || 'Could not start sign-in');
    const { code, error: cbError } = await desktop.loopback(data.url);
    if (!code) throw Object.assign(new Error(cbError || 'Sign-in cancelled'), { code: 'cancelled' });
    const { error: exErr } = await sb.auth.exchangeCodeForSession(code);
    if (exErr) throw new Error(exErr.message);
    return;
  }

  // Web: full-page redirect to the provider and back; supabase-js finishes the exchange on return.
  const redirectTo = `${location.origin}${location.pathname}`;
  const { error } = link
    ? await sb.auth.linkIdentity({ provider, options: { redirectTo, scopes, queryParams } })
    : await sb.auth.signInWithOAuth({ provider, options: { redirectTo, scopes, queryParams } });
  if (error) throw new Error(error.message);
}

export async function cloudUnlink(provider: AuthProvider): Promise<void> {
  const sb = supabase!;
  const { data } = await sb.auth.getUserIdentities();
  const identity = data?.identities.find((i) => i.provider === provider);
  if (!identity) return;
  const { error } = await sb.auth.unlinkIdentity(identity);
  if (error) throw new Error(error.message);
}

export async function cloudSignOut() {
  await supabase?.auth.signOut();
}

export async function saveProfile(userId: string, p: { username: string; handle: string; bio: string; avatarUrl: string; coverUrl: string }) {
  if (!supabase) return;
  await supabase.from('profiles').upsert({ id: userId, username: p.username, handle: p.handle, bio: p.bio, avatar_url: p.avatarUrl || null, cover_url: p.coverUrl || null });
}

/** Subscribe to account changes (initial session, sign-in, sign-out, token refresh, link/unlink). */
export function onCloudUser(cb: (user: User | null) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') return;
    // Defer: supabase-js forbids awaiting its own calls inside this callback.
    setTimeout(async () => cb(session ? await userFromSession(session) : null), 0);
  });
  return () => data.subscription.unsubscribe();
}
