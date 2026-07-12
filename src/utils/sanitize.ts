/**
 * sanitize.ts
 * Strips control characters and HTML before user input reaches the DOM or
 * the AI layer. This is the client-side half of a two-layer defense — the
 * Cloudflare Worker re-validates independently, since a client-side check
 * alone can always be bypassed by a determined caller.
 */

const MAX_MESSAGE_LENGTH = 500;

/** Removes HTML tags without attempting to interpret or "fix" markup. */
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/** Removes non-printable / control characters, keeping normal whitespace. */
function stripControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

export interface SanitizeResult {
  text: string;
  wasModified: boolean;
  wasTruncated: boolean;
}

/**
 * Sanitizes a single chat message. Always returns a safe string; never
 * throws. Reports whether anything was changed, so the UI can optionally
 * surface that to the person (e.g. "some characters were removed").
 */
export function sanitizeMessage(raw: string): SanitizeResult {
  const original = raw ?? '';
  let text = stripControlChars(stripHtml(original));
  text = collapseWhitespace(text);

  const wasTruncated = text.length > MAX_MESSAGE_LENGTH;
  if (wasTruncated) {
    text = text.slice(0, MAX_MESSAGE_LENGTH);
  }

  return {
    text,
    wasModified: text !== original.trim(),
    wasTruncated,
  };
}

export { MAX_MESSAGE_LENGTH };
