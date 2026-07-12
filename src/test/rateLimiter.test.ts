import { describe, expect, it, vi } from 'vitest';
import { TokenBucketRateLimiter } from '../utils/rateLimiter';

describe('TokenBucketRateLimiter', () => {
  it('allows consumption up to its capacity', () => {
    const limiter = new TokenBucketRateLimiter({ capacity: 3, refillPerSecond: 0 });
    expect(limiter.tryConsume()).toBe(true);
    expect(limiter.tryConsume()).toBe(true);
    expect(limiter.tryConsume()).toBe(true);
  });

  it('rejects consumption once the bucket is empty', () => {
    const limiter = new TokenBucketRateLimiter({ capacity: 1, refillPerSecond: 0 });
    expect(limiter.tryConsume()).toBe(true);
    expect(limiter.tryConsume()).toBe(false);
  });

  it('refills over time up to capacity', () => {
    vi.useFakeTimers();
    const limiter = new TokenBucketRateLimiter({ capacity: 1, refillPerSecond: 1 });
    expect(limiter.tryConsume()).toBe(true);
    expect(limiter.tryConsume()).toBe(false);

    vi.advanceTimersByTime(1100);
    expect(limiter.tryConsume()).toBe(true);
    vi.useRealTimers();
  });

  it('reports seconds until the next token is available', () => {
    const limiter = new TokenBucketRateLimiter({ capacity: 1, refillPerSecond: 0.5 });
    limiter.tryConsume();
    expect(limiter.secondsUntilNextToken()).toBeGreaterThan(0);
  });
});
