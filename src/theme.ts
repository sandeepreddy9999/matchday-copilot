/**
 * theme.ts
 * The "matchday, daylight" design tokens, extracted so palette/typography
 * decisions live in one place instead of inline inside a component.
 */

export const COLOR = {
  page: '#F6F8F6',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2EE',
  line: '#DCE5DE',
  lineStrong: '#C3D2C7',
  ink: '#10231A',
  inkMuted: '#4B5D53',
  inkFaint: '#8CA093',
  primary: '#1F7A4D',
  primaryTint: '#E3F1E8',
  gold: '#B9791F',
  goldTint: '#F6E9D3',
  alert: '#B23A2E',
  alertTint: '#F6DEDA',
} as const;

export const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif";
export const FONT_BODY = "'Inter', system-ui, sans-serif";
export const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

export const SHADOW_CARD = '0 1px 2px rgba(16,35,26,0.05), 0 4px 16px rgba(16,35,26,0.05)';
export const SHADOW_RAISED = '0 2px 4px rgba(16,35,26,0.06), 0 8px 24px rgba(16,35,26,0.08)';
