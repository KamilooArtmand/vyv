// ─────────────────────────────────────────────────────────────
// ui-agent-panel.tsx: Conversational Agent Overlay & Panel
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { ArrowUp, Sparkles, X } from 'lucide-react';
import { useStore } from '../core/core-store';
import { ask } from '../state/state-agent';
import { togglePanel, uiStore } from '../state/state-ui';
import { IconButton } from './ui-components';

export function AgentPanel() {
  const [input, setInput] = useState('');
  const messages = useStore(uiStore, (s) => s.agent);
  const busy = useStore(uiStore, (s) => s.agentBusy);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    ask(input);
    setInput('');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="py-12 text-center text-fg-3">
            <Sparkles size={28} className="mx-auto mb-2 text-accent-ink" />
            <div className="text-sm font-semibold text-fg">Ask VYV anything</div>
            <p className="text-xs text-fg-3 mt-1 max-w-xs mx-auto">
              “Play focus music”, “Dark mode”, “Tell me about ambient”, or “Next song”.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`rounded-2xl px-4 py-2.5 text-sm max-w-[85%] ${
                m.role === 'user' ? 'bg-fg text-bg' : 'bg-surface-2 text-fg'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-xs text-fg-3">
            <span className="size-2 animate-ping rounded-full bg-accent" /> Thinking…
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask vyv..."
          className="flex-1 rounded-full bg-surface-2 px-4 py-2 text-sm outline-none placeholder:text-fg-3"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="press flex size-9 items-center justify-center rounded-full bg-fg text-bg disabled:opacity-40"
        >
          <ArrowUp size={16} />
        </button>
      </form>
    </div>
  );
}

export function AgentOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] flex flex-col bg-bg/90 backdrop-blur-xl lg:hidden p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles size={18} className="text-accent-ink" />
          <span>Agent</span>
        </div>
        <IconButton icon={X} label="Close" size="sm" onClick={onClose} />
      </div>
      <div className="flex-1 min-h-0">
        <AgentPanel />
      </div>
    </div>
  );
}
