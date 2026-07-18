import { describe, expect, it } from 'vitest';
import { ask } from '../services/copilotService';
import type { ZoneSnapshot } from '../services/fallbackResponses';

const zones: ZoneSnapshot[] = [
  { name: 'Lower Bowl · North', densityPercent: 46, wheelchairAccessible: false, quietZone: true },
  { name: 'Upper Bowl · South', densityPercent: 20, wheelchairAccessible: true, quietZone: false },
];

describe('copilotService.ask', () => {
  it('falls back to offline mode when no proxy is configured (test env has none)', async () => {
    const answer = await ask({ question: 'Where is the quiet zone?', zones, lang: 'en' });
    expect(answer.mode).toBe('offline');
    expect(answer.text).toContain('Lower Bowl · North');
  });

  it('sanitizes HTML/script content before answering', async () => {
    const answer = await ask({ question: '<script>alert(1)</script> wheelchair access?', zones, lang: 'en' });
    expect(answer.mode).toBe('offline');
    expect(answer.text).toContain('Upper Bowl · South');
    expect(answer.text).not.toContain('<script>');
  });

  it('never throws even on empty input', async () => {
    await expect(ask({ question: '   ', zones, lang: 'en' })).resolves.toBeDefined();
  });

  it('always resolves to a non-empty answer', async () => {
    const answer = await ask({ question: 'random unrelated question', zones, lang: 'en' });
    expect(answer.text.length).toBeGreaterThan(0);
  });
});
