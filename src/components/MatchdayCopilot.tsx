import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Globe2, LayoutGrid, MessageCircle, Users } from 'lucide-react';
import { BAND_WORDS, LANGS, STAND_WORDS, STRINGS } from '../i18n';
import { COLOR, FONT_BODY, FONT_DISPLAY, FONT_MONO, SHADOW_CARD, SHADOW_RAISED } from '../theme';
import type { ChatMessage, Lang, Zone } from '../types';
import { TRANSIT_LINES, ZONE_META, clamp } from '../zones';
import StadiumMap from './StadiumMap';
import ZoneList from './ZoneList';
import ChatPanel from './ChatPanel';
import OpsView from './OpsView';

type ViewMode = 'fan' | 'staff';

export default function MatchdayCopilot() {
  const [lang, setLang] = useState<Lang>('en');
  const [view, setView] = useState<ViewMode>('fan');
  const [query, setQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [zones, setZones] = useState<Zone[]>(() => ZONE_META.map((z) => ({ ...z, density: z.base })));
  const [clock, setClock] = useState(new Date());
  const [reducedMotion, setReducedMotion] = useState(false);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const t = STRINGS[lang];
  const dir = LANGS.find((l) => l.code === lang)?.dir ?? 'ltr';

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      setZones((prev) => prev.map((z) => ({ ...z, density: clamp(z.density + (Math.random() * 10 - 5), 4, 96) })));
    }, 4000);
    return () => clearInterval(id);
  }, [reducedMotion]);

  useEffect(() => {
    if (chatLogRef.current) chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
  }, [messages, chatOpen]);

  const zoneName = useCallback((z: Zone): string => `${BAND_WORDS[lang][z.band]} · ${STAND_WORDS[lang][z.stand]}`, [lang]);

  const filteredZones = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((z) => zoneName(z).toLowerCase().includes(q));
  }, [zones, query, zoneName]);

  function respond(text: string): void {
    const lower = text.toLowerCase();
    let answer = t.fallbackGeneric;

    if (/(quiet|calm|tranquil|هادئ)/.test(lower)) {
      const quietZones = zones.filter((z) => z.quiet).map(zoneName);
      answer = quietZones.length ? `${quietZones.join(' and ')} ${quietZones.length > 1 ? 'are' : 'is'} marked as a quiet zone right now.` : 'No quiet zones are marked right now.';
    } else if (/(wheelchair|accessib|silla|cadeira|fauteuil|احتياج)/.test(lower)) {
      const accessible = zones.filter((z) => z.wheelchair).map(zoneName);
      answer = accessible.length ? `${accessible.join(' and ')} ${accessible.length > 1 ? 'offer' : 'offers'} wheelchair access.` : 'No wheelchair-accessible zones are marked right now.';
    } else if (/(crowd|busy|wait|line|espera|lotad|attente|ازدحام)/.test(lower)) {
      const quietest = [...zones].sort((a, b) => a.density - b.density)[0];
      answer = `${zoneName(quietest)} currently has the shortest wait, at about ${Math.round(quietest.density)}%.`;
    }

    setMessages((m) => [...m, { role: 'user', text }, { role: 'assistant', text: answer, mode: 'offline' }]);
  }

  function handleSend(): void {
    const text = draft.trim();
    if (!text) return;
    respond(text);
    setDraft('');
  }

  function selectZone(id: string): void {
    setSelectedZone((prev) => (prev === id ? null : id));
  }

  return (
    <div dir={dir} style={{ background: COLOR.page, color: COLOR.ink, fontFamily: FONT_BODY, minHeight: '100vh' }} className="w-full">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10 grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
        <div className="min-w-0">
          <header className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <p style={{ fontFamily: FONT_MONO, color: COLOR.gold, letterSpacing: '0.14em' }} className="text-xs mb-1">
                {t.eyebrow}
              </p>
              <h1 style={{ fontFamily: FONT_DISPLAY, color: COLOR.ink }} className="text-2xl md:text-3xl font-semibold">
                {t.title}
              </h1>
              <p style={{ color: COLOR.inkMuted, fontFamily: FONT_MONO }} className="text-sm mt-1">
                {t.kickoff} 19:07 · {t.localTime}{' '}
                <span style={{ color: COLOR.ink }}>
                  {clock.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : lang, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="lang-select">Language</label>
              <div style={{ background: COLOR.surface, borderColor: COLOR.line, boxShadow: SHADOW_CARD }} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                <Globe2 size={16} color={COLOR.primary} aria-hidden="true" />
                <select id="lang-select" value={lang} onChange={(e) => setLang(e.target.value as Lang)} style={{ background: 'transparent', color: COLOR.ink, fontFamily: FONT_BODY }} className="text-sm outline-none focus-visible:ring-2 rounded">
                  {LANGS.map((l) => (<option key={l.code} value={l.code}>{l.label}</option>))}
                </select>
              </div>
            </div>
          </header>

          {/* Fan / Staff view toggle */}
          <div role="tablist" aria-label="View mode" style={{ borderColor: COLOR.line, background: COLOR.surfaceAlt }} className="inline-flex rounded-lg border p-1 mb-6">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'fan'}
              onClick={() => setView('fan')}
              style={{ background: view === 'fan' ? COLOR.surface : 'transparent', color: view === 'fan' ? COLOR.ink : COLOR.inkMuted, boxShadow: view === 'fan' ? SHADOW_CARD : 'none' }}
              className="flex items-center gap-1.5 text-sm rounded-md px-3 py-1.5 focus-visible:ring-2"
            >
              <Users size={14} aria-hidden="true" /> {t.opsToggleFan}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'staff'}
              onClick={() => setView('staff')}
              style={{ background: view === 'staff' ? COLOR.surface : 'transparent', color: view === 'staff' ? COLOR.ink : COLOR.inkMuted, boxShadow: view === 'staff' ? SHADOW_CARD : 'none' }}
              className="flex items-center gap-1.5 text-sm rounded-md px-3 py-1.5 focus-visible:ring-2"
            >
              <LayoutGrid size={14} aria-hidden="true" /> {t.opsToggleStaff}
            </button>
          </div>

          {view === 'fan' ? (
            <>
              <StadiumMap zones={zones} loading={loading} reducedMotion={reducedMotion} selectedZone={selectedZone} onSelectZone={selectZone} t={t} zoneName={zoneName} />
              <ZoneList zones={filteredZones} query={query} setQuery={setQuery} selectedZone={selectedZone} onSelectZone={selectZone} loading={loading} reducedMotion={reducedMotion} t={t} zoneName={zoneName} />
            </>
          ) : (
            <OpsView zones={zones} transitLines={TRANSIT_LINES} t={t} zoneName={zoneName} />
          )}
        </div>

        <div className="hidden md:block">
          <ChatPanel t={t} messages={messages} draft={draft} setDraft={setDraft} handleSend={handleSend} respond={respond} chatLogRef={chatLogRef} docked />
        </div>

        <button type="button" onClick={() => setChatOpen(true)} aria-label={t.openChat} style={{ background: COLOR.primary, color: '#FFFFFF', boxShadow: SHADOW_RAISED }} className="md:hidden fixed bottom-5 right-5 rounded-full p-4 focus-visible:ring-2 z-30">
          <MessageCircle size={22} aria-hidden="true" />
        </button>

        {chatOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex items-end">
            <div className="absolute inset-0" style={{ background: 'rgba(16,35,26,0.35)' }} onClick={() => setChatOpen(false)} aria-hidden="true" />
            <div style={{ background: COLOR.page, maxHeight: '85vh' }} className="relative w-full rounded-t-2xl overflow-hidden flex flex-col">
              <ChatPanel t={t} messages={messages} draft={draft} setDraft={setDraft} handleSend={handleSend} respond={respond} chatLogRef={chatLogRef} onClose={() => setChatOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
