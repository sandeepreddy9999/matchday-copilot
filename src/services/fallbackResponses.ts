/**
 * fallbackResponses.ts
 * A small rule-based responder used whenever the live Claude proxy is
 * unavailable, unset, rate-limited, or errors out. It answers from the
 * same zone data the UI renders — grounded, not guessed — so an "offline"
 * answer is still trustworthy, just less flexible than a live one.
 */

import type { Lang } from '../types';

export type SupportedLang = Lang;

export interface ZoneSnapshot {
  name: string; // already localized, e.g. "Lower Bowl · North"
  densityPercent: number;
  wheelchairAccessible: boolean;
  quietZone: boolean;
}

const PATTERNS = {
  quiet: /(quiet|calm|tranquil|هادئ|tranquila|tranquille)/i,
  accessible: /(wheelchair|accessib|silla|cadeira|fauteuil|احتياج)/i,
  crowd: /(crowd|busy|wait|line|queue|espera|lotad|attente|ازدحام)/i,
};

const FALLBACK_GENERIC: Record<SupportedLang, string> = {
  en: 'I can help you find the least crowded zone, wheelchair access, or a quiet area — try asking about one of those.',
  es: 'Puedo ayudarte a encontrar la zona con menos aforo, acceso para silla de ruedas o una zona tranquila.',
  pt: 'Posso ajudar a encontrar o setor menos lotado, acesso para cadeira de rodas ou uma zona tranquila.',
  fr: 'Je peux vous aider à trouver la zone la moins fréquentée, un accès fauteuil roulant ou une zone calme.',
  ar: 'يمكنني مساعدتك في إيجاد أقل المناطق ازدحامًا أو مدخل لذوي الاحتياجات أو منطقة هادئة.',
};

/**
 * Produces a grounded, rule-based answer from the current zone snapshot.
 * Never calls the network; always returns synchronously.
 */
export function generateFallbackResponse(question: string, zones: ZoneSnapshot[], lang: SupportedLang = 'en'): string {
  if (PATTERNS.quiet.test(question)) {
    const quietZones = zones.filter((z) => z.quietZone).map((z) => z.name);
    if (quietZones.length === 0) return 'No quiet zones are marked right now.';
    return `${quietZones.join(' and ')} ${quietZones.length > 1 ? 'are' : 'is'} marked as a quiet zone right now.`;
  }

  if (PATTERNS.accessible.test(question)) {
    const accessible = zones.filter((z) => z.wheelchairAccessible).map((z) => z.name);
    if (accessible.length === 0) return 'No wheelchair-accessible zones are marked right now.';
    return `${accessible.join(' and ')} ${accessible.length > 1 ? 'offer' : 'offers'} wheelchair access.`;
  }

  if (PATTERNS.crowd.test(question)) {
    if (zones.length === 0) return FALLBACK_GENERIC[lang];
    const quietest = [...zones].sort((a, b) => a.densityPercent - b.densityPercent)[0];
    return `${quietest.name} currently has the shortest wait, at about ${Math.round(quietest.densityPercent)}%.`;
  }

  return FALLBACK_GENERIC[lang];
}
