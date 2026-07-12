import { describe, expect, it } from 'vitest';
import { MAX_MESSAGE_LENGTH, sanitizeMessage } from '../utils/sanitize';

describe('sanitizeMessage', () => {
  it('strips HTML tags', () => {
    const result = sanitizeMessage('<script>alert(1)</script>hello');
    expect(result.text).toBe('alert(1)hello');
  });

  it('strips control characters', () => {
    const result = sanitizeMessage('hello\u0000world');
    expect(result.text).toBe('helloworld');
  });

  it('collapses repeated whitespace and trims', () => {
    const result = sanitizeMessage('  hello    world  ');
    expect(result.text).toBe('hello world');
  });

  it('leaves clean input unmodified', () => {
    const result = sanitizeMessage('Where is the quiet zone?');
    expect(result.text).toBe('Where is the quiet zone?');
    expect(result.wasModified).toBe(false);
    expect(result.wasTruncated).toBe(false);
  });

  it('truncates input longer than the max length and reports it', () => {
    const longInput = 'a'.repeat(MAX_MESSAGE_LENGTH + 50);
    const result = sanitizeMessage(longInput);
    expect(result.text.length).toBe(MAX_MESSAGE_LENGTH);
    expect(result.wasTruncated).toBe(true);
  });

  it('handles empty input without throwing', () => {
    expect(() => sanitizeMessage('')).not.toThrow();
    expect(sanitizeMessage('').text).toBe('');
  });
});
