import { useEffect, useState } from 'react';
import { Bookmark, Headphones, Landmark, Search, Sparkles } from 'lucide-react';
import { WIKI, wikiById } from '../data/catalog';
import { toggleBookmark, useAllTracks, useIsBookmarked } from '../state/library';
import { playQueue } from '../state/player';
import { navigate, toast } from '../state/ui';
import { ask } from '../state/agent';
import { meshGradient } from '../components/ui/Artwork';
import { IconButton } from '../components/ui/IconButton';
import { EmptyState, PageHeader, Section } from '../components/ui/Layout';

export default function Wiki() {
  const [q, setQ] = useState('');
  const list = WIKI.filter((w) => `${w.title} ${w.summary} ${w.era}`.toLowerCase().includes(q.toLowerCase()));
  const [featured, ...rest] = list;

  return (
    <div>
      <PageHeader title="Wiki" subtitle="The story of music, told short." />
      <label className="anim-rise mb-8 flex h-12 max-w-md items-center gap-3 rounded-full bg-surface-2 px-4">
        <Search size={17} className="text-fg-3" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history" aria-label="Search wiki" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-fg-3" />
      </label>

      {featured ? (
        <>
          <button
            type="button"
            onClick={() => navigate({ name: 'article', id: featured.id })}
            className="anim-rise press relative mb-8 flex w-full flex-col justify-end overflow-hidden rounded-[var(--radius-2xl)] p-6 text-left text-white md:min-h-[300px] md:p-10"
            style={{ backgroundImage: meshGradient(featured.id, featured.color) }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.55),transparent)]" />
            <div className="relative mt-28 md:mt-0">
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">{featured.era}</div>
              <div className="mt-2 text-[32px] font-semibold leading-none tracking-[-0.04em] md:text-[52px]">{featured.title}</div>
              <p className="mt-3 max-w-xl text-[15px] text-white/80">{featured.summary}</p>
            </div>
          </button>
          <div className="stagger grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((w) => (
              <button key={w.id} type="button" onClick={() => navigate({ name: 'article', id: w.id })} className="card press group flex items-start gap-4 rounded-[var(--radius-xl)] p-4 text-left hover:bg-surface-2">
                <span className="size-14 shrink-0 rounded-[16px]" style={{ backgroundImage: meshGradient(w.id, w.color) }} />
                <span className="min-w-0">
                  <span className="block text-[11.5px] text-fg-3">{w.era}</span>
                  <span className="block text-[16px] font-semibold tracking-[-0.02em]">{w.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[13.5px] text-fg-2">{w.summary}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <EmptyState icon={Landmark} title="No articles found" />
      )}
    </div>
  );
}

export function ArticleView({ id }: { id?: string }) {
  const a = wikiById(id);
  const saved = useIsBookmarked('wiki', id);
  const tracks = useAllTracks();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = document.getElementById('main-scroll');
    if (!el) return;
    const onScroll = () => setProgress(Math.min(1, el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [id]);

  if (!a) return <EmptyState icon={Landmark} title="Article not found" />;
  const sound = tracks.filter((t) => t.genreId === a.genreId);

  return (
    <article className="mx-auto max-w-2xl">
      <div className="fixed inset-x-0 top-0 z-40 h-[3px]">
        <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="anim-rise mb-8 aspect-[21/9] rounded-[var(--radius-2xl)]" style={{ backgroundImage: meshGradient(a.id, a.color) }} />
      <div className="anim-rise mb-2 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{a.era}</div>
      <h1 className="anim-rise text-[36px] font-semibold leading-[1.02] tracking-[-0.045em] md:text-[54px]">{a.title}</h1>
      <p className="anim-rise mt-4 text-[19px] leading-relaxed text-fg-2">{a.summary}</p>

      <div className="anim-rise my-7 flex items-center gap-2">
        <IconButton icon={Bookmark} label={saved ? 'Saved' : 'Save'} variant="soft" active={saved} filled={saved} onClick={() => toast(toggleBookmark('wiki', a.id) ? 'Saved' : 'Removed', 'bookmark')} />
        {sound.length > 0 && <IconButton icon={Headphones} label="Hear it" variant="soft" onClick={() => playQueue(sound)} />}
        <IconButton icon={Sparkles} label="Ask agent" variant="soft" onClick={() => ask(`Tell me about ${a.title}`)} />
      </div>

      <div className="stagger">
        {a.sections.map((s) => (
          <section key={s.heading} className="mb-8">
            <h2 className="mb-2 text-[21px] font-semibold tracking-[-0.025em]">{s.heading}</h2>
            <p className="text-[16.5px] leading-[1.75] text-fg-2">{s.body}</p>
          </section>
        ))}
      </div>

      {a.related.length > 0 && (
        <Section title="Keep reading" className="mt-12">
          <div className="grid gap-2 sm:grid-cols-2">
            {a.related.map((r) => {
              const w = wikiById(r);
              return w ? (
                <button key={r} type="button" onClick={() => navigate({ name: 'article', id: r })} className="card press flex items-center gap-3 rounded-[var(--radius-lg)] p-3 text-left hover:bg-surface-2">
                  <span className="size-11 shrink-0 rounded-[12px]" style={{ backgroundImage: meshGradient(w.id, w.color) }} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14.5px] font-medium">{w.title}</span>
                    <span className="block truncate text-[12.5px] text-fg-3">{w.era}</span>
                  </span>
                </button>
              ) : null;
            })}
          </div>
        </Section>
      )}
    </article>
  );
}
