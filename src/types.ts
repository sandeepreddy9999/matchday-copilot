/**
 * types.ts
 * Domain types shared across the fan view, ops view, and chat panel.
 */

export type Lang = 'en' | 'es' | 'pt' | 'fr' | 'ar';
export type Stand = 'N' | 'S' | 'E' | 'W';
export type Band = 'lower' | 'upper';
export type DensityStatus = 'low' | 'moderate' | 'high';

export interface ZoneMeta {
  id: string;
  stand: Stand;
  band: Band;
  wheelchair: boolean;
  quiet: boolean;
  base: number;
}

export interface Zone extends ZoneMeta {
  density: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  mode?: 'offline' | 'live';
}

export interface TransitLine {
  id: string;
  name: string;
  status: 'onTime' | 'delayed' | 'suspended';
  crowding: number; // 0-100, crowding at the nearest platform/stop
}
