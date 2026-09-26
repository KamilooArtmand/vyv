import { useEffect, useRef, useState } from 'react';
import { ArrowUp, CloudSun, Headphones, History, Landmark, Mic, MoonStar, Sparkles, Timer, Wand2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { cn } from '../../lib/format';
import { uiStore, navigate } from '../../state/ui';
import { ask, listen, voiceSupported } from '../../state/agent';
import { playerStore } from '../../state/player';
import { libraryStore, allTracks } from '../../state/library';
import { settingsStore } from '../../state/settings';
import { predict } from '../../services/aiAgentService';
import { resolveEntity } from '../../lib/entities';
import { Artwork } from '../ui/Artwork';
import { IconButton } from '../ui/IconButton';
import type { AgentMessage } from '../../types';

const CAPABILITIES = [
  { icon: Wand2, text: 'Make me a focus mix' },
  { icon: History, text: 'What happened in 1979?' },
  { icon: Landmark, text: 'Tell me about the dastgah' },
  { icon: Timer, text: 'Sleep in 20 minutes' },
  { icon: MoonStar, text: 'Dark mode' },
  { icon: Headphones, text: 'What is this song?' },
];

function EntityChip({ kind, id }: { kind: Parameters<typeof resolveEntity>[0]; id: string }) {
  const e = resolveEntity(kind, id);
  if (!e) return null;
  return (
    <button
      type="button"
      onClick={() => e.route && navigate(e.route)}
      className="press flex w-full items-center gap-3 rounded-[var(--radius-md)] bg-surface p-2 text-left hover:bg-surface-2"
    >
      <Artwork seed={e.id} color={e.color} src={e.src} glyph={e.glyph} shape={e.circle ? 'circle' : 'square'} className="size-10 [--art-r:10px]" />
      <div className="min-w-0">
        <div className="truncate text-[13.5px] font-medium">{e.title}</div>
        <div className="truncate text-[12px] text-fg-3">{e.subtitle}</div>
      </div>
    </button>
  );
}

function Bubble({ m, onSuggest }: { m: AgentMessage; onSuggest: (s: string) => void }) {
  if (m.role === 'user') {
    return (
      <div className="anim-rise ml-auto max-w-[85%] rounded-[20px] rounded-br-md bg-fg px-4 py-2.5 text-[14px] text-bg">{m.text}</div>
    );
  }
  return (
    <div className="anim-rise flex max-w-[92%] flex-col gap-2">
      <div className="flex gap-2.5">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
          <Sparkles size={13} />
        </span>
        <p className="text-[14px] leading-relaxed text-fg">{m.text}</p>
      </div>
      {m.cards && (
        <div className="ml-8 flex flex-col gap-1.5">
          {m.cards.map((c) => (
            <EntityChip key={`${c.kind}-${c.id}`} kind={c.kind} id={c.id} />
          ))}
        </div>
      )}
      {m.suggestions && (
        <div className="ml-8 flex flex-wrap gap-1.5">
          {m.suggestions.map((s) => (
            <button key={s} type="button" onClick={() => onSuggest(s)} className="press rounded-full border border-line-2 px-3 py-1.5 text-[12.5px] text-fg-2 hover:bg-surface-2 hover:text-fg">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Conversational AI agent: understands intent, acts, and predicts. */
export function AgentPanel({ autoFocus }: { autoFocus?: boolean }) {
  const messages = useStore(uiStore, (s) => s.agent);
  const busy = useStore(uiStore, (s) => s.agentBusy);
  const current = useStore(playerStore, (s) => s.track);
  const voiceOn = useStore(settingsStore, (s) => s.agentVoice);
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const stopRef = useRef<() => void>(() => {});
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, busy]);

  const send = (t = text) => {
    if (!t.trim()) return;
    ask(t);
    setText('');
  };

  const mic = () => {
    if (listening) return stopRef.current();
    setListening(true);
    stopRef.current = listen(
      (t) => send(t),
      () => setListening(false),
    );
  };

  const nudge = predict({ tracks: allTracks(), current, history: libraryStore.get().history });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="scrollbar-none flex-1 overflow-y-auto px-1 pb-4">
        {messages.length === 0 ? (
          <div className="stagger flex flex-col gap-4 pt-2">
            <div>
              <div className="mb-3 flex size-12 items-center justify-center rounded-[16px] bg-fg text-bg shadow-[0_16px_40px_-12px_var(--accent)]">
                <Sparkles size={22} />
              </div>
              <h3 className="text-[22px] font-semibold tracking-[-0.03em]">How should it sound?</h3>
              <p className="mt-1 text-[13.5px] text-fg-3">Moods, artists, years, questions, or commands — in any words.</p>
            </div>
            <button
              type="button"
              onClick={() => send(nudge.prompt)}
              className="press relative overflow-hidden rounded-[var(--radius-lg)] bg-accent-soft p-4 text-left"
            >
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-accent-ink">
                <CloudSun size={13} /> Predicted for now
              </div>
              <div className="text-[14.5px] font-medium leading-snug">{nudge.title}</div>
            </button>
            <div className="grid grid-cols-2 gap-2">
              {CAPABILITIES.map(({ icon: Icon, text: t }) => (
                <button key={t} type="button" onClick={() => send(t)} className="press flex flex-col gap-2 rounded-[var(--radius-md)] bg-surface p-3 text-left text-[13px] leading-snug text-fg-2 hover:bg-surface-2 hover:text-fg">
                  <Icon size={16} strokeWidth={1.75} className="text-fg-3" />
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-2">
            {messages.map((m) => (
              <Bubble key={m.id} m={m} onSuggest={send} />
            ))}
            {busy && (
              <div className="flex items-center gap-1.5 pl-8" aria-label="Thinking">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="anim-live size-1.5 rounded-full bg-fg-3" style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-1.5 rounded-full bg-surface-2 p-1.5 pl-4 ring-1 ring-transparent transition focus-within:bg-surface focus-within:ring-line-2"
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={listening ? 'Listening…' : 'Ask vyv…'}
          aria-label="Message the agent"
          enterKeyHint="send"
          className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-fg-3"
        />
        {voiceOn && voiceSupported() && (
          <IconButton icon={Mic} label={listening ? 'Stop' : 'Voice'} size="sm" tip={false} onClick={mic} className={cn(listening && 'anim-live !bg-live !text-white')} />
        )}
        <IconButton icon={ArrowUp} label="Send" size="sm" variant="solid" tip={false} type="submit" disabled={!text.trim()} />
      </form>
    </div>
  );
}
