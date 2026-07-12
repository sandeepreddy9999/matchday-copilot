import { Radio } from 'lucide-react';
import type { Strings } from '../i18n';
import type { Stand, Zone } from '../types';
import { COLOR, FONT_MONO } from '../theme';
import { densityStatus, getZoneBox } from '../zones';

interface StadiumMapProps {
  zones: Zone[];
  loading: boolean;
  reducedMotion: boolean;
  selectedZone: string | null;
  onSelectZone: (id: string) => void;
  t: Strings;
  zoneName: (z: Zone) => string;
}

const STAND_POLYGONS: { pts: string; stand: Stand }[] = [
  { pts: '30,0 270,0 210,60 90,60', stand: 'N' },
  { pts: '90,240 210,240 270,300 30,300', stand: 'S' },
  { pts: '0,30 0,270 60,210 60,90', stand: 'W' },
  { pts: '300,30 300,270 240,210 240,90', stand: 'E' },
];

export default function StadiumMap({ zones, loading, reducedMotion, selectedZone, onSelectZone, t, zoneName }: StadiumMapProps) {
  const activeZone = zones.find((z) => z.id === selectedZone);

  return (
    <div style={{ background: COLOR.surface, borderColor: COLOR.line }} className="relative rounded-2xl border p-4 md:p-6 mb-6 shadow-[0_1px_2px_rgba(16,35,26,0.05),0_4px_16px_rgba(16,35,26,0.05)]">
      {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((pos, i) => (
        <span key={i} aria-hidden="true" style={{ borderColor: COLOR.gold, width: 22, height: 22, margin: 10 }} className={`absolute ${pos} pointer-events-none rounded-sm`} />
      ))}

      <div className="flex items-center gap-2 mb-3">
        <Radio size={14} color={COLOR.alert} aria-hidden="true" className={!reducedMotion ? 'animate-pulse' : ''} />
        <span style={{ fontFamily: FONT_MONO, color: COLOR.inkMuted, letterSpacing: '0.08em' }} className="text-xs">
          LIVE DENSITY FEED
        </span>
      </div>

      {loading ? (
        <div style={{ background: COLOR.surfaceAlt }} className="w-full aspect-square rounded-xl animate-pulse" aria-hidden="true" />
      ) : (
        <div className="relative w-full aspect-square">
          <svg viewBox="0 0 300 300" className="w-full h-full" role="img" aria-label="Stadium bowl map">
            <rect x="60" y="60" width="180" height="180" fill="none" stroke={COLOR.lineStrong} strokeWidth="1.5" />
            <circle cx="150" cy="150" r="22" fill="none" stroke={COLOR.lineStrong} strokeWidth="1.5" />
            <text x="150" y="154" textAnchor="middle" fontSize="9" fill={COLOR.inkFaint} fontFamily={FONT_MONO}>
              PITCH
            </text>
            {STAND_POLYGONS.map(({ pts, stand }) => (
              <polygon
                key={stand}
                points={pts}
                fill={COLOR.surfaceAlt}
                stroke={activeZone?.stand === stand ? COLOR.primary : COLOR.line}
                strokeWidth={activeZone?.stand === stand ? 2 : 1}
              />
            ))}
          </svg>

          {zones.map((z) => {
            const box = getZoneBox(z.stand, z.band);
            const status = densityStatus(z.density);
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => onSelectZone(z.id)}
                aria-pressed={selectedZone === z.id}
                aria-label={`${zoneName(z)}, ${t.density[status]} density, ${Math.round(z.density)} percent`}
                style={{
                  position: 'absolute',
                  top: `${box.top}%`,
                  left: `${box.left}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                  outlineColor: COLOR.primary,
                }}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
