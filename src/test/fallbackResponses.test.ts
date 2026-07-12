import { describe, expect, it } from 'vitest';
import { generateFallbackResponse, type ZoneSnapshot } from '../services/fallbackResponses';

const zones: ZoneSnapshot[] = [
  { name: 'Lower Bowl · North', densityPercent: 46, wheelchairAccessible: false, quietZone: true },
  { name: 'Upper Bowl · South', densityPercent: 34, wheelchairAccessible: true, quietZone: false },
  { name: 'Lower Bowl · East', densityPercent: 72, wheelchairAccessible: false, quietZone: false },
];

describe('generateFallbackResponse', () => {
  it('answers quiet-zone questions from zone data', () => {
    const answer = generateFallbackResponse('Where is the nearest quiet zone?', zones, 'en');
    expect(answer).toContain('Lower Bowl · North');
  });

  it('answers wheelchair-accessibility questions from zone data', () => {
    const answer = generateFallbackResponse('Is there wheelchair access nearby?', zones, 'en');
    expect(answer).toContain('Upper Bowl · South');
  });

  it('answers crowding questions with the least-dense zone', () => {
    const answer = generateFallbackResponse('Which zone has the shortest wait?', zones, 'en');
    expect(answer).toContain('Upper Bowl · South');
    expect(answer).toContain('34');
  });

  it('falls back to a generic answer for unrelated questions', () => {
    const answer = generateFallbackResponse('What time does the match start?', zones, 'en');
    expect(answer.length).toBeGreaterThan(0);
  });

  it('reports when no quiet zones exist', () => {
    const noQuietZones: ZoneSnapshot[] = zones.map((z) => ({ ...z, quietZone: false }));
    const answer = generateFallbackResponse('quiet zone please', noQuietZones, 'en');
    expect(answer).toMatch(/no quiet zones/i);
  });
});
