/**
 * claudeClient.ts
 * The only place in the app that knows how to talk to the proxy. Never
 * holds an API key — that lives server-side in the Cloudflare Worker
 * (see server/cloudflare-worker.js, ANTHROPIC_API_KEY via `wrangler secret`).
 * If VITE_CLAUDE_PROXY_URL is unset, callers should skip this module
 * entirely and use fallbackResponses.ts instead.
 */

const PROXY_URL = import.meta.env.VITE_CLAUDE_PROXY_URL as string | undefined;
const REQUEST_TIMEOUT_MS = 8000;

export interface ZoneContext {
  name: string;
  densityPercent: number;
  wheelchairAccessible: boolean;
  quietZone: boolean;
}

export interface AskCopilotParams {
  question: string;
  zones: ZoneContext[];
  lang: string;
}

export class ProxyUnavailableError extends Error {}
export class ProxyRequestError extends Error {}

function buildSystemPrompt(zones: ZoneContext[], lang: string): string {
  const zoneLines = zones
    .map(
      (z) =>
        `- ${z.name}: ${Math.round(z.densityPercent)}% capacity, ` +
        `${z.wheelchairAccessible ? 'wheelchair accessible' : 'not wheelchair accessible'}, ` +
        `${z.quietZone ? 'quiet zone' : 'standard zone'}`,
    )
    .join('\n');

  return [
    'You are the Fan Copilot for a FIFA World Cup 2026 stadium.',
    `Respond in the language with code "${lang}".`,
    'Answer only from the zone data below — never invent crowd levels or accessibility details.',
    'Keep answers under three sentences.',
    '',
    'Current zone data:',
    zoneLines,
  ].join('\n');
}

/**
 * Calls the live Claude proxy. Throws ProxyUnavailableError if no proxy is
 * configured (the caller should fall back silently), or ProxyRequestError
 * on a network/timeout/HTTP failure (the caller should fall back and may
 * want to log the error).
 */
export async function askCopilot({ question, zones, lang }: AskCopilotParams): Promise<string> {
  if (!PROXY_URL) {
    throw new ProxyUnavailableError('VITE_CLAUDE_PROXY_URL is not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: buildSystemPrompt(zones, lang),
        messages: [{ role: 'user', content: question }],
      }),
    });

    if (!response.ok) {
      throw new ProxyRequestError(`Proxy responded with ${response.status}`);
    }

    const data = await response.json();
    const textBlock = Array.isArray(data?.content)
      ? data.content.find((block: { type: string }) => block.type === 'text')
      : undefined;

    if (!textBlock?.text) {
      throw new ProxyRequestError('Proxy response had no text content');
    }

    return textBlock.text as string;
  } catch (err) {
    if (err instanceof ProxyRequestError || err instanceof ProxyUnavailableError) throw err;
    throw new ProxyRequestError(err instanceof Error ? err.message : 'Unknown proxy error');
  } finally {
    clearTimeout(timeout);
  }
}

export const isProxyConfigured = Boolean(PROXY_URL);
