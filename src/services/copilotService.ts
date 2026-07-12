/**
 * copilotService.ts
 * The single entry point the UI calls. Orchestrates sanitization, the
 * client-side rate limit, a live attempt via claudeClient, and an honest
 * fallback via fallbackResponses — and always tells the caller which one
 * actually produced the answer, so the UI can label it truthfully.
 */

import { sanitizeMessage } from '../utils/sanitize';
import { copilotRateLimiter } from '../utils/rateLimiter';
import { askCopilot, isProxyConfigured, ProxyRequestError, ProxyUnavailableError } from './claudeClient';
import { generateFallbackResponse, type SupportedLang, type ZoneSnapshot } from './fallbackResponses';

export type AnswerMode = 'live' | 'offline';

export interface CopilotAnswer {
  text: string;
  mode: AnswerMode;
  /** Present only when mode is 'offline' and a live attempt was actually made and failed. */
  liveErrorReason?: string;
}

export interface AskParams {
  question: string;
  zones: ZoneSnapshot[];
  lang: SupportedLang;
}

/**
 * Always resolves — never throws — so the UI never has to handle a
 * rejected promise just to show a message. Failure states are represented
 * as a normal offline-mode CopilotAnswer instead.
 */
export async function ask({ question, zones, lang }: AskParams): Promise<CopilotAnswer> {
  const { text: cleanQuestion } = sanitizeMessage(question);

  if (!cleanQuestion) {
    return { text: generateFallbackResponse('', zones, lang), mode: 'offline' };
  }

  if (!isProxyConfigured) {
    return { text: generateFallbackResponse(cleanQuestion, zones, lang), mode: 'offline' };
  }

  if (!copilotRateLimiter.tryConsume()) {
    return {
      text: generateFallbackResponse(cleanQuestion, zones, lang),
      mode: 'offline',
      liveErrorReason: 'client rate limit reached',
    };
  }

  try {
    const liveText = await askCopilot({
      question: cleanQuestion,
      zones: zones.map((z) => ({
        name: z.name,
        densityPercent: z.densityPercent,
        wheelchairAccessible: z.wheelchairAccessible,
        quietZone: z.quietZone,
      })),
      lang,
    });
    return { text: liveText, mode: 'live' };
  } catch (err) {
    const reason =
      err instanceof ProxyUnavailableError
        ? 'proxy not configured'
        : err instanceof ProxyRequestError
          ? err.message
          : 'unknown error';
    return {
      text: generateFallbackResponse(cleanQuestion, zones, lang),
      mode: 'offline',
      liveErrorReason: reason,
    };
  }
}
