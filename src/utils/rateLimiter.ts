/**
 * rateLimiter.ts
 * A client-side token bucket. This is a courtesy layer, not a security
 * boundary — it stops an honest client from hammering the proxy by
 * accident, but it can trivially be bypassed by anyone editing the JS.
 * The Worker's per-IP KV limiter is the check that actually matters;
 * see server/cloudflare-worker.js.
 */

export interface RateLimiterOptions {
  /** Maximum tokens the bucket can hold (burst size). */
  capacity: number;
  /** Tokens regained per second. */
  refillPerSecond: number;
}

export class TokenBucketRateLimiter {
  private tokens: number;
  private readonly capacity: number;
  private readonly refillPerSecond: number;
  private lastRefill: number;

  constructor(options: RateLimiterOptions) {
    this.capacity = options.capacity;
    this.refillPerSecond = options.refillPerSecond;
    this.tokens = options.capacity;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    if (elapsedSeconds <= 0) return;

    this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillPerSecond);
    this.lastRefill = now;
  }

  /** Returns true and consumes a token if one is available; false otherwise. */
  tryConsume(): boolean {
    this.refill();
    if (this.tokens < 1) return false;
    this.tokens -= 1;
    return true;
  }

  /** Seconds until at least one token will be available. */
  secondsUntilNextToken(): number {
    this.refill();
    if (this.tokens >= 1) return 0;
    return (1 - this.tokens) / this.refillPerSecond;
  }
}

/** Shared limiter for the copilot chat: 8 messages, refilling 1 every 6s. */
export const copilotRateLimiter = new TokenBucketRateLimiter({
  capacity: 8,
  refillPerSecond: 1 / 6,
});
