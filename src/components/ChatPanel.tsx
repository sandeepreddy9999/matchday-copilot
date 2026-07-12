import { Info, Send, X } from 'lucide-react';
import type { RefObject } from 'react';
import type { Strings } from '../i18n';
import type { ChatMessage } from '../types';
import { COLOR, FONT_DISPLAY, FONT_MONO, SHADOW_CARD } from '../theme';

interface ChatPanelProps {
  t: Strings;
  messages: ChatMessage[];
  draft: string;
  setDraft: (value: string) => void;
  handleSend: () => void;
  respond: (text: string) => void;
  chatLogRef: RefObject<HTMLDivElement | null>;
  docked?: boolean;
  onClose?: () => void;
}

export default function ChatPanel({ t, messages, draft, setDraft, handleSend, respond, chatLogRef, docked, onClose }: ChatPanelProps) {
  return (
    <div style={{ background: COLOR.surface, borderColor: COLOR.line, boxShadow: docked ? SHADOW_CARD : 'none' }} className={docked ? 'rounded-2xl border flex flex-col h-full min-h-[520px]' : 'flex flex-col h-full'}>
      <div style={{ borderColor: COLOR.line }} className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLOR.ink }} className="font-semibold text-base">
          {t.chatTitle}
        </h2>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={t.closeChat} style={{ color: COLOR.inkMuted }} className="p-1 rounded focus-visible:ring-2">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <div style={{ borderColor: COLOR.line, color: COLOR.inkMuted, background: COLOR.goldTint }} className="flex items-start gap-2 border-b px-4 py-2 text-xs">
        <Info size={14} className="mt-0.5 shrink-0" color={COLOR.gold} aria-hidden="true" />
        <span>{t.offlineNote}</span>
      </div>

      <div ref={chatLogRef} aria-live="polite" className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarGutter: 'stable' }}>
        {messages.length === 0 && (
          <p style={{ color: COLOR.inkFaint }} className="text-sm">
            Try a quick question below, or type your own.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span style={{ background: m.role === 'user' ? COLOR.primaryTint : COLOR.surfaceAlt, color: COLOR.ink }} className="inline-block rounded-xl px-3 py-2 text-sm max-w-[85%]">
              {m.text}
            </span>
            {m.role === 'assistant' && (
              <div style={{ color: COLOR.inkFaint, fontFamily: FONT_MONO }} className="text-[10px] mt-1">
                {t.offlineTag}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-4 pt-2 flex flex-wrap gap-2">
        {t.chips.map((c) => (
          <button key={c} type="button" onClick={() => respond(c)} style={{ borderColor: COLOR.line, color: COLOR.inkMuted, background: COLOR.surface }} className="text-xs rounded-full border px-3 py-1.5 hover:border-current focus-visible:ring-2">
            {c}
          </button>
        ))}
      </div>

      <div className="p-4 flex items-center gap-2">
        <label className="sr-only" htmlFor="chat-input">
          {t.chatPlaceholder}
        </label>
        <input
          id="chat-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t.chatPlaceholder}
          style={{ background: COLOR.surfaceAlt, color: COLOR.ink, borderColor: COLOR.line }}
          className="flex-1 text-sm rounded-lg border px-3 py-2 outline-none focus-visible:ring-2"
        />
        <button type="button" onClick={handleSend} aria-label={t.send} style={{ background: COLOR.primary, color: '#FFFFFF' }} className="rounded-lg p-2.5 focus-visible:ring-2">
          <Send size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
