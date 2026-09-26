import { useState } from 'react';
import { Flame, Headphones, Heart, ListMusic, LogOut, Pencil, Share2, Sparkles, UserPlus, Users } from 'lucide-react';
import { useStore } from '../lib/store';
import { compact } from '../lib/format';
import { AuthService } from '../services/authService';
import { authStore } from '../state/auth';
import { libraryStore, trackById, useAllTracks } from '../state/library';
import { toast } from '../state/ui';
import { ARTISTS, genreById } from '../data/catalog';
import { resolveEntity } from '../lib/entities';
import { meshGradient } from '../components/ui/Artwork';
import { MediaCard, TrackList } from '../components/ui/Cards';
import { IconButton } from '../components/ui/IconButton';
import { Section, Shelf } from '../components/ui/Layout';
import { Sheet } from '../components/ui/Sheet';
import { LogoMark } from '../components/ui/Logo';
import { AuthForm, inputClass as input } from '../components/AuthForm';
import type { Mood, Track } from '../types';

const PERSONA: Record<Mood, { name: string; line: string }> = {
  night: { name: 'Nocturnal Explorer', line: 'You come alive after dark — neon, rain and long drives.' },
  calm: { name: 'Quiet Architect', line: 'You build calm spaces out of sound.' },
  focus: { name: 'Deep Worker', line: 'Wordless, steady, locked in. Music is your flow state.' },
  energy: { name: 'Kinetic Spirit', line: 'Tempo up, volume up. You move to everything.' },
  happy: { name: 'Sunlit Optimist', line: 'Bright mornings and open windows.' },
  melancholy: { name: 'Romantic Wanderer', line: 'You find beauty in the bittersweet.' },
};

function EditProfile({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useStore(authStore, (s) => s.user);
  const [f, setF] = useState(() => ({ username: user?.username ?? '', handle: user?.handle ?? '', bio: user?.bio ?? '', avatarUrl: user?.avatarUrl ?? '', coverUrl: user?.coverUrl ?? '' }));
  const field = (k: keyof typeof f, label: string, area?: boolean) => (
    <label className="flex flex-col gap-1.5">
      <span className="px-1 text-[12px] text-fg-3">{label}</span>
      {area ? (
        <textarea rows={3} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={`${input} h-auto resize-none py-3`} />
      ) : (
        <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={input} />
      )}
    </label>
  );
  return (
    <Sheet open={open} onClose={onClose} title="Edit profile">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          AuthService.updateUserProfile(f.username, f.handle, f.bio, f.avatarUrl, f.coverUrl);
          toast('Profile saved', 'check');
          onClose();
        }}
        className="flex flex-col gap-3"
      >
        {field('username', 'Name')}
        {field('handle', 'Handle')}
        {field('bio', 'Bio', true)}
        {field('avatarUrl', 'Avatar URL')}
        {field('coverUrl', 'Cover URL')}
        <button type="submit" className="press mt-2 h-12 rounded-full bg-fg text-[15px] font-medium text-bg">
          Save
        </button>
      </form>
    </Sheet>
  );
}

export default function Profile() {
  const user = useStore(authStore, (s) => s.user);
  const history = useStore(libraryStore, (s) => s.history);
  const favorites = useStore(libraryStore, (s) => s.favorites);
  const listened = useStore(libraryStore, (s) => s.listenedSeconds);
  const streak = useStore(libraryStore, (s) => s.streak);
  const playlistCount = useStore(libraryStore, (s) => s.playlists.length);
  const tracks = useAllTracks();
  const [editing, setEditing] = useState(false);

  // Listening DNA — derived from what you actually play and love.
  const pool = [...history, ...favorites].map((id) => tracks.find((t) => t.id === id)).filter(Boolean) as Track[];
  const genres = Object.entries(
    pool.reduce<Record<string, number>>((acc, t) => ((acc[t.genreId ?? 'other'] = (acc[t.genreId ?? 'other'] ?? 0) + 1), acc), {}),
  ).sort((a, b) => b[1] - a[1]);
  const total = genres.reduce((s, [, n]) => s + n, 0) || 1;
  const moodCount = pool.flatMap((t) => t.moods ?? []).reduce<Record<string, number>>((acc, m) => ((acc[m] = (acc[m] ?? 0) + 1), acc), {});
  const topMood = (Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'calm') as Mood;
  const persona = PERSONA[topMood];
  const topArtists = [...new Set(pool.map((t) => t.artistId))].map((id) => ARTISTS.find((a) => a.id === id)).filter(Boolean).slice(0, 8);
  const recent = history.map((id) => trackById(id)).filter(Boolean).slice(0, 5) as Track[];

  const share = async () => {
    const text = `I'm a ${persona.name} on vyv.`;
    try {
      if (navigator.share) await navigator.share({ title: 'vyv', text });
      else {
        await navigator.clipboard.writeText(text);
        toast('Copied to clipboard', 'check');
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <div>
      {user ? (
        <header className="anim-rise relative mb-10">
          <div className="relative -mx-4 h-44 overflow-hidden md:mx-0 md:h-56 md:rounded-[var(--radius-2xl)]" style={{ backgroundImage: meshGradient(user.id, '#ff3c00') }}>
            <img src={user.coverUrl} alt="" className="size-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg),transparent_70%)]" />
          </div>
          <div className="relative -mt-14 flex flex-col items-center gap-4 px-2 text-center md:-mt-16 md:flex-row md:items-end md:px-8 md:text-left">
            <img src={user.avatarUrl} alt="" className="size-28 rounded-full object-cover ring-4 ring-bg md:size-32" />
            <div className="min-w-0 flex-1">
              <h1 className="text-[30px] font-semibold tracking-[-0.04em] md:text-[40px]">{user.username}</h1>
              <div className="text-[14px] text-fg-3">{user.handle}</div>
              {user.bio && <p className="mt-2 max-w-lg text-[14.5px] text-fg-2">{user.bio}</p>}
            </div>
            <div className="flex gap-1.5">
              <IconButton icon={Pencil} label="Edit" variant="soft" onClick={() => setEditing(true)} />
              <IconButton icon={Share2} label="Share" variant="soft" onClick={share} />
              <IconButton icon={LogOut} label="Sign out" variant="soft" onClick={() => (AuthService.logout(), toast('Signed out', 'check'))} />
            </div>
          </div>
        </header>
      ) : (
        <header className="anim-rise mx-auto mb-12 flex max-w-sm flex-col items-center pt-6 text-center">
          <LogoMark className="mb-5 size-14" animated />
          <h1 className="text-[30px] font-semibold tracking-[-0.04em]">Your sound, everywhere.</h1>
          <p className="mb-7 mt-2 text-[14.5px] text-fg-3">Sync likes, playlists and your agent across devices.</p>
          <div className="w-full text-left">
            <AuthForm />
          </div>
        </header>
      )}

      {/* Stats */}
      <div className="stagger mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Headphones, value: compact(Math.round(listened / 3600)), label: 'Hours' },
          { icon: Flame, value: String(streak), label: 'Day streak' },
          ...(user
            ? [
                { icon: Users, value: compact(user.followersCount), label: 'Followers' },
                { icon: UserPlus, value: compact(user.followingCount), label: 'Following' },
              ]
            : [
                { icon: Heart, value: String(favorites.length), label: 'Likes' },
                { icon: ListMusic, value: String(playlistCount), label: 'Playlists' },
              ]),
        ].map((s) => (
          <div key={s.label} className="card rounded-[var(--radius-xl)] p-4">
            <s.icon size={18} strokeWidth={1.75} className="text-fg-3" />
            <div className="mt-3 text-[28px] font-semibold tracking-[-0.04em] tabular">{s.value}</div>
            <div className="text-[12.5px] text-fg-3">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-10 grid gap-3 lg:grid-cols-2">
        {/* Persona */}
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] p-6 text-white" style={{ backgroundImage: meshGradient(topMood, '#ff3c00') }}>
          <div className="mb-10 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] backdrop-blur">
            <Sparkles size={12} /> Sound persona
          </div>
          <div className="text-[30px] font-semibold leading-none tracking-[-0.04em]">{persona.name}</div>
          <p className="mt-2 text-[14.5px] text-white/80">{persona.line}</p>
        </div>

        {/* DNA */}
        <div className="card rounded-[var(--radius-2xl)] p-6">
          <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">Listening DNA</div>
          <div className="flex h-3 overflow-hidden rounded-full">
            {genres.map(([g, n]) => (
              <span key={g} style={{ width: `${(n / total) * 100}%`, background: genreById(g)?.colors[0] ?? 'var(--fg-3)' }} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {genres.slice(0, 6).map(([g, n]) => (
              <div key={g} className="flex items-center gap-2 text-[13.5px]">
                <span className="size-2.5 rounded-full" style={{ background: genreById(g)?.colors[0] }} />
                <span className="flex-1 truncate">{genreById(g)?.name ?? g}</span>
                <span className="text-fg-3 tabular">{Math.round((n / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {topArtists.length > 0 && (
        <Section title="Top artists">
          <Shelf>
            {topArtists.map((a) => (
              <MediaCard key={a!.id} className="w-[112px] shrink-0 snap-start md:w-[136px]" entity={resolveEntity('artist', a!.id)!} />
            ))}
          </Shelf>
        </Section>
      )}

      {recent.length > 0 && (
        <Section title="Recently played">
          <TrackList tracks={recent} numbered={false} />
        </Section>
      )}

      {user && <EditProfile key={String(editing)} open={editing} onClose={() => setEditing(false)} />}
    </div>
  );
}
