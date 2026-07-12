import { describe, expect, it } from 'vitest';
import { averageDensity, clamp, densityStatus, findRedirectPair, getZoneBox } from '../zones';
import type { Zone } from '../types';

describe('densityStatus', () => {
  it('classifies low density', () => {
    expect(densityStatus(10)).toBe('low');
    expect(densityStatus(39)).toBe('low');
  });

  it('classifies moderate density', () => {
    expect(densityStatus(40)).toBe('moderate');
    expect(densityStatus(69)).toBe('moderate');
  });

  it('classifies high density', () => {
    expect(densityStatus(70)).toBe('high');
    expect(densityStatus(96)).toBe('high');
  });
});

describe('clamp', () => {
  it('keeps values within range unchanged', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('clamps values below the minimum', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it('clamps values above the maximum', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });
});

describe('getZoneBox', () => {
  it('places the North upper band nearer the top than the North lower band', () => {
    const upper = getZoneBox('N', 'upper');
    const lower = getZoneBox('N', 'lower');
    expect(upper.top).toBeLessThan(lower.top);
  });

  it('places the South upper band nearer the bottom than the South lower band', () => {
    const upper = getZoneBox('S', 'upper');
    const lower = getZoneBox('S', 'lower');
    expect(upper.top).toBeGreaterThan(lower.top);
  });

  it('mirrors East and West boxes symmetrically around the 300-unit grid', () => {
    const west = getZoneBox('W', 'lower');
    const east = getZoneBox('E', 'lower');
    // left edge of east box + its width should mirror west's left edge across the 100% grid
    expect(east.left + east.width).toBe(100 - west.left);
  });
});

function makeZone(id: string, density: number): Zone {
  return { id, stand: 'N', band: 'lower', wheelchair: false, quiet: false, base: density, density };
}

describe('averageDensity', () => {
  it('returns 0 for an empty zone list', () => {
    expect(averageDensity([])).toBe(0);
  });

  it('averages density across zones', () => {
    const zones = [makeZone('a', 20), makeZone('b', 40), makeZone('c', 60)];
    expect(averageDensity(zones)).toBe(40);
  });
});

describe('findRedirectPair', () => {
  it('returns null when no zone is at high density', () => {
    const zones = [makeZone('a', 20), makeZone('b', 30)];
    expect(findRedirectPair(zones)).toBeNull();
  });

  it('returns the most and least congested zones when one is high density', () => {
    const zones = [makeZone('a', 90), makeZone('b', 20), makeZone('c', 50)];
    const pair = findRedirectPair(zones);
    expect(pair).not.toBeNull();
    expect(pair?.from.id).toBe('a');
    expect(pair?.to.id).toBe('b');
  });
});
