/**
 * server/cloudflare-worker.js
 *
 * Reference proxy for the Fan Copilot. Holds the real Anthropic API key
 * server-side and forwards validated, rate-limited requests to
 * /v1/messages. This is the check that actually matters — the client's
 * token-bucket limiter (src/utils/rateLimiter.ts) is a courtesy layer that
 * a determined caller can bypass; this one can't be, since it's enforced
 * before the request ever reaches Anthropic.
 *
 * Deploy:
 *   wrangler kv namespace create RATE_LIMIT_KV
 *   wrangler secret put ANTHROPIC_API_KEY
 *   wrangler deploy
 *
 * Required bindings (wrangler.toml):
 *   - KV namespace: RATE_LIMIT_KV
 *   - Secret:       ANTHROPIC_API_KEY
 *   - Var:          ALLOWED_ORIGIN   (e.g. "https://yourname.github.io")
 *   - Var:          CLAUDE_MODEL     (optional, defaults below)
 */

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const MAX_BODY_BYTES = 8_000;
const MAX_MESSAGES = 1; // this app sends one question at a time, no history
const MAX_MESSAGE_CHARS = 500;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 20;

function corsHeaders(origin, allowedOrigin) {
  const allowOrigin = origin === allowedOrigin ? allowedOrigin : 'null';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function jsonResponse(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

async function checkRateLimit(kv, clientIp) {
  const key = `rl:${clientIp}`;
  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  return true;
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') return 'Invalid payload';
  if (typeof payload.system !== 'string' || payload.system.length > 4000) return 'Invalid system prompt';
  if (!Array.isArray(payload.messages) || payload.messages.length === 0) return 'Missing messages';
  if (payload.messages.length > MAX_MESSAGES) return 'Too many messages';

  for (const message of payload.messages) {
    if (message.role !== 'user') return 'Only user messages are accepted';
    if (typeof message.content !== 'string') return 'Message content must be a string';
    if (message.content.length === 0) return 'Empty message';
    if (message.content.length > MAX_MESSAGE_CHARS) return 'Message too long';
  }

  return null;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, headers);
    }

    if (origin !== env.ALLOWED_ORIGIN) {
      return jsonResponse({ error: 'Origin not allowed' }, 403, headers);
    }

    const contentLength = Number(request.headers.get('Content-Length') || '0');
    if (contentLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: 'Payload too large' }, 413, headers);
    }

    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    const allowed = await checkRateLimit(env.RATE_LIMIT_KV, clientIp);
    if (!allowed) {
      return jsonResponse({ error: 'Rate limit exceeded, try again shortly' }, 429, headers);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: 'Malformed JSON body' }, 400, headers);
    }

    const validationError = validatePayload(payload);
    if (validationError) {
      return jsonResponse({ error: validationError }, 400, headers);
    }

    try {
      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: env.CLAUDE_MODEL || DEFAULT_MODEL,
          max_tokens: Math.min(payload.max_tokens || 300, 300),
          system: payload.system,
          messages: payload.messages,
        }),
      });

      const data = await upstream.json();

      if (!upstream.ok) {
        // Don't leak upstream error internals to the client.
        return jsonResponse({ error: 'Upstream request failed' }, 502, headers);
      }

      return jsonResponse(data, 200, headers);
    } catch {
      return jsonResponse({ error: 'Upstream request failed' }, 502, headers);
    }
  },
};
