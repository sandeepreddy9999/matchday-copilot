import { AlertTriangle, Bus, Leaf } from 'lucide-react';
import type { Strings } from '../i18n';
import type { TransitLine, Zone } from '../types';
import { COLOR, FONT_DISPLAY, FONT_MONO, SHADOW_CARD } from '../theme';
import { averageDensity, findRedirectPair } from '../zones';

interface OpsViewProps {
  zones: Zone[];
  transitLines: TransitLine[];
  t: Strings;
  zoneName: (z: Zone) => string;
}

function transitStatusColor(status: TransitLine['status']): string {
  if (status === 'onTime') return COLOR.primary;
  if (status === 'delayed') return COLOR.gold;
  return COLOR.alert;
}

export default function OpsView({ zones, transitLines, t, zoneName }: OpsViewProps) {
  const occupancy = averageDensity(zones);
  const redirect = findRedirectPair(zones);
  const isLowOccupancy = occupancy < 50;

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLOR.ink }} className="text-xl font-semibold">
          {t.opsTitle}
        </h2>
        <p style={{ color: COLOR.inkMuted }} className="text-sm mt-1">
          {t.opsSubtitle}
        </p>
      </div>

      {/* Occupancy + real-time decision support */}
      <div style={{ background: COLOR.surface, borderColor: COLOR.line, boxShadow: SHADOW_CARD }} className="rounded-2xl border p-5">
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: COLOR.inkMuted, fontFamily: FONT_MONO }} className="text-xs uppercase tracking-wide">
            {t.occupancyLabel}
          </span>
          <span style={{ color: COLOR.ink, fontFamily: FONT_MONO }} className="text-sm font-medium">
            {Math.round(occupancy)}%
          </span>
        </div>
        <div style={{ background: COLOR.line }} className="h-2 rounded-full overflow-hidden mb-4">
          <div style={{ width: `${occupancy}%`, background: COLOR.primary, transition: 'width 600ms ease' }} className="h-full" />
        </div>

        <div style={{ borderColor: COLOR.line, background: redirect ? COLOR.alertTint : COLOR.surfaceAlt }} className="rounded-xl border p-3 flex items-start gap-2">
          <AlertTriangle size={16} color={redirect ? COLOR.alert : COLOR.inkFaint} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p style={{ color: COLOR.ink, fontFamily: FONT_DISPLAY }} className="text-sm font-medium">
              {t.actionRequired}
            </p>
            <p style={{ color: COLOR.inkMuted }} className="text-sm mt-0.5">
              {redirect ? t.redirectTemplate.replace('{from}', zoneName(redirect.from)).replace('{to}', zoneName(redirect.to)) : t.actionNone}
            </p>
          </div>
        </div>
      </div>

      {/* Transportation */}
      <div style={{ background: COLOR.surface, borderColor: COLOR.line, boxShadow: SHADOW_CARD }} className="rounded-2xl border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bus size={16} color={COLOR.primary} aria-hidden="true" />
          <h3 style={{ fontFamily: FONT_DISPLAY, color: COLOR.ink }} className="font-medium text-sm">
            {t.transportTitle}
          </h3>
        </div>
        <ul className="space-y-2">
          {transitLines.map((line) => (
            <li key={line.id} style={{ borderColor: COLOR.line }} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
              <span style={{ color: COLOR.ink }} className="text-sm">
                {line.name}
              </span>
              <span className="flex items-center gap-3 shrink-0">
                <span style={{ color: COLOR.inkFaint, fontFamily: FONT_MONO }} className="text-xs">
                  {t.crowdingLabel} {line.crowding}%
                </span>
                <span
                  style={{ color: transitStatusColor(line.status), background: `${transitStatusColor(line.status)}1A` }}
                  className="text-xs rounded-full px-2 py-0.5 whitespace-nowrap"
                >
                  {t.transportStatus[line.status]}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sustainability */}
      <div style={{ background: COLOR.surface, borderColor: COLOR.line, boxShadow: SHADOW_CARD }} className="rounded-2xl border p-5">
        <div className="flex items-center gap-2 mb-2">
          <Leaf size={16} color={COLOR.primary} aria-hidden="true" />
          <h3 style={{ fontFamily: FONT_DISPLAY, color: COLOR.ink }} className="font-medium text-sm">
            {t.sustainabilityTitle}
          </h3>
        </div>
        <p style={{ color: COLOR.inkMuted }} className="text-sm">
          {isLowOccupancy ? t.sustainabilityLow : t.sustainabilityHigh}
        </p>
      </div>
    </div>
  );
}
