import { Accessibility, Search, VolumeX } from 'lucide-react';
import type { Strings } from '../i18n';
import type { Zone } from '../types';
import { COLOR, FONT_BODY, FONT_DISPLAY, FONT_MONO, SHADOW_CARD, SHADOW_RAISED } from '../theme';
import { densityColor, densityStatus, densityTint } from '../zones';

interface ZoneListProps {
  zones: Zone[];
  query: string;
  setQuery: (value: string) => void;
  selectedZone: string | null;
  onSelectZone: (id: string) => void;
  loading: boolean;
  reducedMotion: boolean;
  t: Strings;
  zoneName: (z: Zone) => string;
}

export default function ZoneList({ zones, query, setQuery, selectedZone, onSelectZone, loading, reducedMotion, t, zoneName }: ZoneListProps) {
  return (
    <>
      <div className="mb-3">
        <label htmlFor="zone-search" style={{ color: COLOR.ink, fontFamily: FONT_DISPLAY }} className="block font-semibold mb-2">
          {t.searchLabel}
        </label>
        <div style={{ background: COLOR.surface, borderColor: COLOR.line, boxShadow: SHADOW_CARD }} className="flex items-center gap-2 rounded-lg border px-3 py-2 focus-within:ring-2">
          <Search size={16} color={COLOR.inkFaint} aria-hidden="true" />
          <input
            id="zone-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{ background: 'transparent', color: COLOR.ink, fontFamily: FONT_BODY }}
            className="w-full text-sm outline-none placeholder:opacity-60"
          />
        </div>
      </div>

      <ul style={{ scrollbarGutter: 'stable', maxHeight: 320 }} className="overflow-y-auto pr-2 space-y-2 list-none">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <li key={i} style={{ background: COLOR.surfaceAlt }} className="h-16 rounded-xl animate-pulse" aria-hidden="true" />)
        ) : zones.length === 0 ? (
          <li style={{ color: COLOR.inkFaint }} className="text-sm py-6 text-center">
            {t.noResults}
          </li>
        ) : (
          zones.map((z) => {
            const status = densityStatus(z.density);
            const isActive = selectedZone === z.id;
            return (
              <li key={z.id}>
                <button
                  type="button"
                  onClick={() => onSelectZone(z.id)}
                  aria-pressed={isActive}
                  style={{
                    background: isActive ? COLOR.primaryTint : COLOR.surface,
                    borderColor: isActive ? COLOR.primary : COLOR.line,
                    boxShadow: isActive ? SHADOW_RAISED : SHADOW_CARD,
                  }}
                  className="w-full text-left rounded-xl border px-4 py-3 flex items-center justify-between gap-3 transition-all focus-visible:ring-2"
                >
                  <span className="min-w-0">
                    <span style={{ color: COLOR.ink, fontFamily: FONT_DISPLAY }} className="block font-medium truncate">
                      {zoneName(z)}
                    </span>
                    {(z.wheelchair || z.quiet) && (
                      <span className="flex items-center gap-3 mt-1">
                        {z.wheelchair && (
                          <span style={{ color: COLOR.inkMuted }} className="inline-flex items-center gap-1 text-xs">
                            <Accessibility size={13} aria-hidden="true" /> {t.wheelchair}
                          </span>
                        )}
                        {z.quiet && (
                          <span style={{ color: COLOR.inkMuted }} className="inline-flex items-center gap-1 text-xs">
                            <VolumeX size={13} aria-hidden="true" /> {t.quiet}
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                  <span className="flex flex-col items-end gap-1 shrink-0">
                    <span style={{ fontFamily: FONT_MONO, color: densityColor(status), background: densityTint(status) }} className="text-xs rounded-full px-2 py-0.5 whitespace-nowrap">
                      {t.density[status]} · {Math.round(z.density)}%
                    </span>
                    <span style={{ background: COLOR.line, width: 72, height: 4 }} className="rounded-full overflow-hidden">
                      <span
                        style={{
                          display: 'block',
                          height: '100%',
                          width: `${z.density}%`,
                          background: densityColor(status),
                          transition: reducedMotion ? 'none' : 'width 600ms ease, background 600ms ease',
                        }}
                      />
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </>
  );
}
