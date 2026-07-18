/**
 * useCopilotChat.ts
 * The chat UI's only connection to the copilot pipeline. Previously,
 * MatchdayCopilot.tsx had its own hand-rolled regex responder that
 * duplicated fallbackResponses.ts and never touched sanitization, rate
 * limiting, or a live proxy attempt. This hook is the fix: every message
 * now actually goes through services/copilotService.ts, so the security
 * and honesty guarantees the app claims are the ones actually running.
 */

import { useCallback, useState } from 'react';
import { ask } from '../services/copilotService';
import type { ChatMessage, Lang, Zone } from '../types';

interface UseCopilotChatParams {
  zones: Zone[];
  lang: Lang;
  zoneName: (z: Zone) => string;
}

export function useCopilotChat({ zones, lang, zoneName }: UseCopilotChatParams) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);

  const respond = useCallback(
    async (text: string) => {
      setMessages((m) => [...m, { role: 'user', text }]);
      setPending(true);

      const zoneSnapshots = zones.map((z) => ({
        name: zoneName(z),
        densityPercent: z.density,
        wheelchairAccessible: z.wheelchair,
        quietZone: z.quiet,
      }));

      const answer = await ask({ question: text, zones: zoneSnapshots, lang });

      setMessages((m) => [...m, { role: 'assistant', text: answer.text, mode: answer.mode }]);
      setPending(false);
    },
    [zones, lang, zoneName],
  );

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    void respond(text);
  }, [draft, respond]);

  return { messages, draft, setDraft, respond, handleSend, pending };
}
