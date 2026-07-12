/**
 * zones.ts
 * Zone seed data plus pure helper functions for density status/color and
 * map geometry. Kept dependency-free (no React) so it's trivially unit
 * testable.
 */

import type { Band, DensityStatus, Stand, TransitLine, Zone, ZoneMeta } from './types';
import { COLOR } from './theme';

export const ZONE_META: ZoneMeta[] = [
  { id: 'n-lower', stand: 'N', band: 'lower', wheelchair: false, quiet: true, base: 46 },
  { id: 'n-upper', stand: 'N', band: 'upper', wheelchair: false, quiet: false, base: 28 },
  { id: 's-lower', stand: 'S', band: 'lower', wheelchair: false, quiet: false, base: 61 },
  { id: 's-upper', stand: 'S', band: 'upper', wheelchair: true, quiet: false, base: 34 },
  { id: 'e-lower', stand: 'E', band: 'lower', wheelchair: false, quiet: false, base: 72 },
  { id: 'e-upper', stand: 'E', band: 'upper', wheelchair: false, quiet: true, base: 39 },
  { id: 'w-lower', stand: 'W', band: 'lower', wheelchair: true, quiet: false, base: 43 },
  { id: 'w-upper', stand: 'W', band: 'upper', wheelchair: false, quiet: false, base: 22 },
];

export const TRANSIT_LINES: TransitLine[] = [
  { id: 'metro-red', name: 'Metro · Red Line', status: 'onTime', crowding: 54 },
  { id: 'metro-blue', name: 'Metro · Blue Line', status: 'delayed', crowding: 78 },
  { id: 'shuttle-a', name: 'Fan Shuttle A', status: 'onTime', crowding: 31 },
  { id: 'shuttle-b', name: 'Fan Shuttle B', status: 'suspended', crowding: 0 },
];

export interface ZoneBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Maps a stand + band to a percentage box on the shared 300x300 grid used
 * by both the SVG stadium bowl and the keyboard-focusable overlay buttons,
 * so the two can never drift out of alignment with each other.
 */
export function getZoneBox(stand: Stand, band: Band): ZoneBox {
  if (stand === 'N') return band === 'upper' ? { top: 0, left: 10, width: 80, height: 10 } : { top: 10, left: 10, width: 80, height: 10 };
  if (stand === 'S') return band === 'upper' ? { top: 90, left: 10, width: 80, height: 10 } : { top: 80, left: 10, width: 80, height: 10 };
  if (stand === 'W') return band === 'upper' ? { top: 10, left: 0, width: 10, height: 80 } : { top: 10, left: 10, width: 10, height: 80 };
  return band === 'upper' ? { top: 10, left: 90, width: 10, height: 80 } : { top: 10, left: 80, width: 10, height: 80 };
}

export function densityStatus(value: number): DensityStatus {
  if (value < 40) return 'low';
  if (value < 70) return 'moderate';
  return 'high';
}

export function densityColor(status: DensityStatus): string {
  if (status === 'low') return COLOR.primary;
  if (status === 'moderate') return COLOR.gold;
  return COLOR.alert;
}

export function densityTint(status: DensityStatus): string {
  if (status === 'low') return COLOR.primaryTint;
  if (status === 'moderate') return COLOR.goldTint;
  return COLOR.alertTint;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function averageDensity(zones: Zone[]): number {
  if (zones.length === 0) return 0;
  return zones.reduce((sum, z) => sum + z.density, 0) / zones.length;
}

/** The single most congested zone and the single least congested zone, for
 * operational-intelligence redirect recommendations. Returns null if there
 * isn't a meaningful gap worth acting on. */
export function findRedirectPair(zones: Zone[]): { from: Zone; to: Zone } | null {
  if (zones.length < 2) return null;
  const sorted = [...zones].sort((a, b) => b.density - a.density);
  const mostCongested = sorted[0];
  const leastCongested = sorted[sorted.length - 1];
  if (densityStatus(mostCongested.density) !== 'high') return null;
  return { from: mostCongested, to: leastCongested };
}
