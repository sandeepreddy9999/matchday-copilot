import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  Search,
  X,
  Send,
  Globe2,
  VolumeX,
  Radio,
  Info,
  MessageCircle,
  Accessibility,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * DESIGN TOKENS — "matchday, daylight" palette
 * ------------------------------------------------------------------------- */
const COLOR = {
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

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

const SHADOW_CARD = '0 1px 2px rgba(16,35,26,0.05), 0 4px 16px rgba(16,35,26,0.05)';
const SHADOW_RAISED = '0 2px 4px rgba(16,35,26,0.06), 0 8px 24px rgba(16,35,26,0.08)';

/* ---------------------------------------------------------------------------
 * TYPES
 * ------------------------------------------------------------------------- */
type Lang = 'en' | 'es' | 'pt' | 'fr' | 'ar';
type Stand = 'N' | 'S' | 'E' | 'W';
type Band = 'lower' | 'upper';
type DensityStatus = 'low' | 'moderate' | 'high';

interface ZoneMeta {
  id: string;
  stand: Stand;
  band: Band;
  wheelchair: boolean;
  quiet: boolean;
  base: number;
}

interface Zone extends ZoneMeta {
  density: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  mode?: 'offline' | 'live';
}

interface Strings {
  eyebrow: string;
  title: string;
  kickoff: string;
  localTime: string;
  searchLabel: string;
  searchPlaceholder: string;
  noResults: string;
  wheelchair: string;
  quiet: string;
  density: Record<DensityStatus, string>;
  openChat: string;
  closeChat: string;
  chatTitle: string;
  chatPlaceholder: string;
  offlineTag: string;
  offlineNote: string;
  chips: string[];
  fallbackGeneric: string;
  send: string;
}

/* ---------------------------------------------------------------------------
 * COPY / i18n
 * ------------------------------------------------------------------------- */
const LANGS: { code: Lang; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'pt', label: 'Português', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
];

const STAND_WORDS: Record<Lang, Record<Stand, string>> = {
  en: { N: 'North', S: 'South', E: 'East', W: 'West' },
  es: { N: 'Norte', S: 'Sur', E: 'Este', W: 'Oeste' },
  pt: { N: 'Norte', S: 'Sul', E: 'Leste', W: 'Oeste' },
  fr: { N: 'Nord', S: 'Sud', E: 'Est', W: 'Ouest' },
  ar: { N: 'الشمال', S: 'الجنوب', E: 'الشرق', W: 'الغرب' },
};

const BAND_WORDS: Record<Lang, Record<Band, string>> = {
  en: { lower: 'Lower Bowl', upper: 'Upper Bowl' },
  es: { lower: 'Nivel Bajo', upper: 'Nivel Alto' },
  pt: { lower: 'Nível Inferior', upper: 'Nível Superior' },
  fr: { lower: 'Niveau Inférieur', upper: 'Niveau Supérieur' },
  ar: { lower: 'الطابق السفلي', upper: 'الطابق العلوي' },
};

const STRINGS: Record<Lang, Strings> = {
  en: {
    eyebrow: 'MERIDIAN PARK STADIUM',
    title: 'Group Stage · Match 34',
    kickoff: 'Kickoff',
    localTime: 'Local time',
    searchLabel: 'Find a section',
    searchPlaceholder: 'Search a section, e.g. Upper Bowl',
    noResults: 'No sections match your search.',
    wheelchair: 'Wheelchair accessible',
    quiet: 'Quiet zone',
    density: { low: 'Low', moderate: 'Moderate', high: 'High' },
    openChat: 'Ask the copilot',
    closeChat: 'Close copilot',
    chatTitle: 'Fan Copilot',
    chatPlaceholder: 'Ask about crowds, access, or transport…',
    offlineTag: 'Offline answer',
    offlineNote: 'No live proxy configured in this preview — every answer here is the local fallback, labeled honestly.',
    chips: ['Which zone has the shortest wait?', "Where's the nearest quiet zone?", 'Is there wheelchair access nearby?'],
    fallbackGeneric: 'I can help you find the least crowded zone, wheelchair access, or a quiet area — try one of the questions above.',
    send: 'Send',
  },
  es: {
    eyebrow: 'ESTADIO MERIDIAN PARK',
    title: 'Fase de Grupos · Partido 34',
    kickoff: 'Inicio',
    localTime: 'Hora local',
    searchLabel: 'Buscar sección',
    searchPlaceholder: 'Busca una sección, ej. Nivel Alto',
    noResults: 'No hay secciones que coincidan.',
    wheelchair: 'Acceso para silla de ruedas',
    quiet: 'Zona tranquila',
    density: { low: 'Baja', moderate: 'Moderada', high: 'Alta' },
    openChat: 'Preguntar al copiloto',
    closeChat: 'Cerrar copiloto',
    chatTitle: 'Copiloto del Aficionado',
    chatPlaceholder: 'Pregunta sobre aforo, acceso o transporte…',
    offlineTag: 'Respuesta sin conexión',
    offlineNote: 'No hay proxy en vivo en esta vista previa — cada respuesta es local, indicada con honestidad.',
    chips: ['¿Qué zona tiene menos espera?', '¿Dónde está la zona tranquila más cercana?', '¿Hay acceso para silla de ruedas cerca?'],
    fallbackGeneric: 'Puedo ayudarte a encontrar la zona con menos aforo, acceso para silla de ruedas o una zona tranquila.',
    send: 'Enviar',
  },
  pt: {
    eyebrow: 'ESTÁDIO MERIDIAN PARK',
    title: 'Fase de Grupos · Partida 34',
    kickoff: 'Início',
    localTime: 'Hora local',
    searchLabel: 'Encontrar setor',
    searchPlaceholder: 'Buscar um setor, ex. Nível Superior',
    noResults: 'Nenhum setor corresponde à busca.',
    wheelchair: 'Acesso para cadeira de rodas',
    quiet: 'Zona tranquila',
    density: { low: 'Baixa', moderate: 'Moderada', high: 'Alta' },
    openChat: 'Perguntar ao copiloto',
    closeChat: 'Fechar copiloto',
    chatTitle: 'Copiloto do Torcedor',
    chatPlaceholder: 'Pergunte sobre lotação, acesso ou transporte…',
    offlineTag: 'Resposta offline',
    offlineNote: 'Sem proxy ao vivo nesta prévia — toda resposta aqui é local, identificada com honestidade.',
    chips: ['Qual setor tem menor espera?', 'Onde fica a zona tranquila mais próxima?', 'Há acesso para cadeira de rodas por perto?'],
    fallbackGeneric: 'Posso ajudar a encontrar o setor menos lotado, acesso para cadeira de rodas ou uma zona tranquila.',
    send: 'Enviar',
  },
  fr: {
    eyebrow: 'STADE MERIDIAN PARK',
    title: 'Phase de Groupes · Match 34',
    kickoff: 'Coup d’envoi',
    localTime: 'Heure locale',
    searchLabel: 'Trouver une section',
    searchPlaceholder: 'Rechercher une section, ex. Niveau Supérieur',
    noResults: 'Aucune section ne correspond.',
    wheelchair: 'Accès fauteuil roulant',
    quiet: 'Zone calme',
    density: { low: 'Faible', moderate: 'Modérée', high: 'Élevée' },
    openChat: 'Demander au copilote',
    closeChat: 'Fermer le copilote',
    chatTitle: 'Copilote des Supporters',
    chatPlaceholder: "Posez une question sur l'affluence, l'accès…",
    offlineTag: 'Réponse hors ligne',
    offlineNote: "Aucun proxy en direct ici — chaque réponse est locale, indiquée honnêtement.",
    chips: ['Quelle zone a le moins d’attente ?', 'Où est la zone calme la plus proche ?', 'Y a-t-il un accès fauteuil roulant ?'],
    fallbackGeneric: 'Je peux vous aider à trouver la zone la moins fréquentée, un accès fauteuil roulant ou une zone calme.',
    send: 'Envoyer',
  },
  ar: {
    eyebrow: 'ملعب ميريديان بارك',
    title: 'دور المجموعات · المباراة 34',
    kickoff: 'الانطلاق',
    localTime: 'التوقيت المحلي',
    searchLabel: 'ابحث عن قسم',
    searchPlaceholder: 'ابحث عن قسم، مثل الطابق العلوي',
    noResults: 'لا توجد أقسام مطابقة.',
    wheelchair: 'مدخل لذوي الاحتياجات',
    quiet: 'منطقة هادئة',
    density: { low: 'منخفض', moderate: 'متوسط', high: 'مرتفع' },
    openChat: 'اسأل المساعد',
    closeChat: 'إغلاق المساعد',
    chatTitle: 'مساعد المشجع',
    chatPlaceholder: 'اسأل عن الازدحام أو الوصول أو النقل…',
    offlineTag: 'إجابة دون اتصال',
    offlineNote: 'لا يوجد وسيط مباشر في هذه المعاينة — كل إجابة هنا محلية ومعلنة بصدق.',
    chips: ['أي منطقة أقل ازدحامًا؟', 'أين أقرب منطقة هادئة؟', 'هل يوجد مدخل لذوي الاحتياجات قريبًا؟'],
    fallbackGeneric: 'يمكنني مساعدتك في إيجاد أقل المناطق ازدحامًا أو مدخل لذوي الاحتياجات أو منطقة هادئة.',
    send: 'إرسال',
  },
};

/* ---------------------------------------------------------------------------
 * ZONE DATA + MAP GEOMETRY
 * ------------------------------------------------------------------------- */
const ZONE_META: ZoneMeta[] = [
  { id: 'n-lower', stand: 'N', band: 'lower', wheelchair: false, quiet: true, base: 46 },
  { id: 'n-upper', stand: 'N', band: 'upper', wheelchair: false, quiet: false, base: 28 },
  { id: 's-lower', stand: 'S', band: 'lower', wheelchair: false, quiet: false, base: 61 },
  { id: 's-upper', stand: 'S', band: 'upper', wheelchair: true, quiet: false, base: 34 },
  { id: 'e-lower', stand: 'E', band: 'lower', wheelchair: false, quiet: false, base: 72 },
  { id: 'e-upper', stand: 'E', band: 'upper', wheelchair: false, quiet: true, base: 39 },
  { id: 'w-lower', stand: 'W', band: 'lower', wheelchair: true, quiet: false, base: 43 },
  { id: 'w-upper', stand: 'W', band: 'upper', wheelchair: false, quiet: false, base: 22 },
];

interface ZoneBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getZoneBox(stand: Stand, band: Band): ZoneBox {
  if (stand === 'N') return band === 'upper' ? { top: 0, left: 10, width: 80, height: 10 } : { top: 10, left: 10, width: 80, height: 10 };
  if (stand === 'S') return band === 'upper' ? { top: 90, left: 10, width: 80, height: 10 } : { top: 80, left: 10, width: 80, height: 10 };
  if (stand === 'W') return band === 'upper' ? { top: 10, left: 0, width: 10, height: 80 } : { top: 10, left: 10, width: 10, height: 80 };
  return band === 'upper' ? { top: 10, left: 90, width: 10, height: 80 } : { top: 10, left: 80, width: 10, height: 80 };
}

function densityStatus(value: number): DensityStatus {
  if (value < 40) return 'low';
  if (value < 70) return 'moderate';
  return 'high';
}

function densityColor(status: DensityStatus): string {
  if (status === 'low') return COLOR.primary;
  if (status === 'moderate') return COLOR.gold;
  return COLOR.alert;
}

function densityTint(status: DensityStatus): string {
  if (status === 'low') return COLOR.primaryTint;
  if (status === 'moderate') return COLOR.goldTint;
  return COLOR.alertTint;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/* ---------------------------------------------------------------------------
 * COMPONENT
 * ------------------------------------------------------------------------- */
export default function MatchdayCopilot() {
  const [lang, setLang] = useState<Lang>('en');
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

  const zoneName = (z: Zone): string => `${BAND_WORDS[lang][z.band]} · ${STAND_WORDS[lang][z.stand]}`;

  const filteredZones = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((z) => zoneName(z).toLowerCase().includes(q));
  }, [zones, query, lang]);

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

  const activeZone = zones.find((z) => z.id === selectedZone);

  return (
    <div dir={dir} style={{ background: COLOR.page, color: COLOR.ink, fontFamily: FONT_BODY, minHeight: '100vh' }} className="w-full">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10 grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
        <div className="min-w-0">
          <header className="flex items-start justify-between gap-4 mb-6 flex-wrap">
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

          <div style={{ background: COLOR.surface, borderColor: COLOR.line, boxShadow: SHADOW_CARD }} className="relative rounded-2xl border p-4 md:p-6 mb-6">
            {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((pos, i) => (
              <span key={i} aria-hidden="true" style={{ borderColor: COLOR.gold, width: 22, height: 22, margin: 10 }} className={`absolute ${pos} pointer-events-none rounded-sm`} />
            ))}

            <div className="flex items-center gap-2 mb-3">
              <Radio size={14} color={COLOR.alert} aria-hidden="true" className={!reducedMotion ? 'animate-pulse' : ''} />
              <span style={{ fontFamily: FONT_MONO, color: COLOR.inkMuted, letterSpacing: '0.08em' }} className="text-xs">LIVE DENSITY FEED</span>
            </div>

            {loading ? (
              <div style={{ background: COLOR.surfaceAlt }} className="w-full aspect-square rounded-xl animate-pulse" aria-hidden="true" />
            ) : (
              <div className="relative w-full aspect-square">
                <svg viewBox="0 0 300 300" className="w-full h-full" role="img" aria-label="Stadium bowl map">
                  <rect x="60" y="60" width="180" height="180" fill="none" stroke={COLOR.lineStrong} strokeWidth="1.5" />
                  <circle cx="150" cy="150" r="22" fill="none" stroke={COLOR.lineStrong} strokeWidth="1.5" />
                  <text x="150" y="154" textAnchor="middle" fontSize="9" fill={COLOR.inkFaint} fontFamily={FONT_MONO}>PITCH</text>
                  {(
                    [
                      { pts: '30,0 270,0 210,60 90,60', stand: 'N' as Stand },
                      { pts: '90,240 210,240 270,300 30,300', stand: 'S' as Stand },
                      { pts: '0,30 0,270 60,210 60,90', stand: 'W' as Stand },
                      { pts: '300,30 300,270 240,210 240,90', stand: 'E' as Stand },
                    ]
                  ).map(({ pts, stand }) => (
                    <polygon key={stand} points={pts} fill={COLOR.surfaceAlt} stroke={activeZone?.stand === stand ? COLOR.primary : COLOR.line} strokeWidth={activeZone?.stand === stand ? 2 : 1} />
                  ))}
                </svg>

                {zones.map((z) => {
                  const box = getZoneBox(z.stand, z.band);
                  const status = densityStatus(z.density);
                  return (
                    <button key={z.id} type="button" onClick={() => selectZone(z.id)} aria-pressed={selectedZone === z.id} aria-label={`${zoneName(z)}, ${t.density[status]} density, ${Math.round(z.density)} percent`} style={{ position: 'absolute', top: `${box.top}%`, left: `${box.left}%`, width: `${box.width}%`, height: `${box.height}%`, outlineColor: COLOR.primary }} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm" />
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="zone-search" style={{ color: COLOR.ink, fontFamily: FONT_DISPLAY }} className="block font-semibold mb-2">{t.searchLabel}</label>
            <div style={{ background: COLOR.surface, borderColor: COLOR.line, boxShadow: SHADOW_CARD }} className="flex items-center gap-2 rounded-lg border px-3 py-2 focus-within:ring-2">
              <Search size={16} color={COLOR.inkFaint} aria-hidden="true" />
              <input id="zone-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.searchPlaceholder} style={{ background: 'transparent', color: COLOR.ink, fontFamily: FONT_BODY }} className="w-full text-sm outline-none placeholder:opacity-60" />
            </div>
          </div>

          <ul style={{ scrollbarGutter: 'stable', maxHeight: 320 }} className="overflow-y-auto pr-2 space-y-2 list-none">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (<li key={i} style={{ background: COLOR.surfaceAlt }} className="h-16 rounded-xl animate-pulse" aria-hidden="true" />))
            ) : filteredZones.length === 0 ? (
              <li style={{ color: COLOR.inkFaint }} className="text-sm py-6 text-center">{t.noResults}</li>
            ) : (
              filteredZones.map((z) => {
                const status = densityStatus(z.density);
                const isActive = selectedZone === z.id;
                return (
                  <li key={z.id}>
                    <button type="button" onClick={() => selectZone(z.id)} aria-pressed={isActive} style={{ background: isActive ? COLOR.primaryTint : COLOR.surface, borderColor: isActive ? COLOR.primary : COLOR.line, boxShadow: isActive ? SHADOW_RAISED : SHADOW_CARD }} className="w-full text-left rounded-xl border px-4 py-3 flex items-center justify-between gap-3 transition-all focus-visible:ring-2">
                      <span className="min-w-0">
                        <span style={{ color: COLOR.ink, fontFamily: FONT_DISPLAY }} className="block font-medium truncate">{zoneName(z)}</span>
                        {(z.wheelchair || z.quiet) && (
                          <span className="flex items-center gap-3 mt-1">
                            {z.wheelchair && (<span style={{ color: COLOR.inkMuted }} className="inline-flex items-center gap-1 text-xs"><Accessibility size={13} aria-hidden="true" /> {t.wheelchair}</span>)}
                            {z.quiet && (<span style={{ color: COLOR.inkMuted }} className="inline-flex items-center gap-1 text-xs"><VolumeX size={13} aria-hidden="true" /> {t.quiet}</span>)}
                          </span>
                        )}
                      </span>
                      <span className="flex flex-col items-end gap-1 shrink-0">
                        <span style={{ fontFamily: FONT_MONO, color: densityColor(status), background: densityTint(status) }} className="text-xs rounded-full px-2 py-0.5 whitespace-nowrap">{t.density[status]} · {Math.round(z.density)}%</span>
                        <span style={{ background: COLOR.line, width: 72, height: 4 }} className="rounded-full overflow-hidden">
                          <span style={{ display: 'block', height: '100%', width: `${z.density}%`, background: densityColor(status), transition: reducedMotion ? 'none' : 'width 600ms ease, background 600ms ease' }} />
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
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

/* ---------------------------------------------------------------------------
 * CHAT PANEL
 * ------------------------------------------------------------------------- */
interface ChatPanelProps {
  t: Strings;
  messages: ChatMessage[];
  draft: string;
  setDraft: (value: string) => void;
  handleSend: () => void;
  respond: (text: string) => void;
  chatLogRef: RefObject<HTMLDivElement | null>;
  docked?: boolean;
  onClose?: () => void;
}

function ChatPanel({ t, messages, draft, setDraft, handleSend, respond, chatLogRef, docked, onClose }: ChatPanelProps) {
  return (
    <div style={{ background: COLOR.surface, borderColor: COLOR.line, boxShadow: docked ? SHADOW_CARD : 'none' }} className={docked ? 'rounded-2xl border flex flex-col h-full min-h-[520px]' : 'flex flex-col h-full'}>
      <div style={{ borderColor: COLOR.line }} className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLOR.ink }} className="font-semibold text-base">{t.chatTitle}</h2>
        {onClose && (<button type="button" onClick={onClose} aria-label={t.closeChat} style={{ color: COLOR.inkMuted }} className="p-1 rounded focus-visible:ring-2"><X size={18} aria-hidden="true" /></button>)}
      </div>

      <div style={{ borderColor: COLOR.line, color: COLOR.inkMuted, background: COLOR.goldTint }} className="flex items-start gap-2 border-b px-4 py-2 text-xs">
        <Info size={14} className="mt-0.5 shrink-0" color={COLOR.gold} aria-hidden="true" />
        <span>{t.offlineNote}</span>
      </div>

      <div ref={chatLogRef} aria-live="polite" className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarGutter: 'stable' }}>
        {messages.length === 0 && (<p style={{ color: COLOR.inkFaint }} className="text-sm">Try a quick question below, or type your own.</p>)}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span style={{ background: m.role === 'user' ? COLOR.primaryTint : COLOR.surfaceAlt, color: COLOR.ink }} className="inline-block rounded-xl px-3 py-2 text-sm max-w-[85%]">{m.text}</span>
            {m.role === 'assistant' && (<div style={{ color: COLOR.inkFaint, fontFamily: FONT_MONO }} className="text-[10px] mt-1">{t.offlineTag}</div>)}
          </div>
        ))}
      </div>

      <div className="px-4 pt-2 flex flex-wrap gap-2">
        {t.chips.map((c) => (<button key={c} type="button" onClick={() => respond(c)} style={{ borderColor: COLOR.line, color: COLOR.inkMuted, background: COLOR.surface }} className="text-xs rounded-full border px-3 py-1.5 hover:border-current focus-visible:ring-2">{c}</button>))}
      </div>

      <div className="p-4 flex items-center gap-2">
        <label className="sr-only" htmlFor="chat-input">{t.chatPlaceholder}</label>
        <input id="chat-input" type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t.chatPlaceholder} style={{ background: COLOR.surfaceAlt, color: COLOR.ink, borderColor: COLOR.line }} className="flex-1 text-sm rounded-lg border px-3 py-2 outline-none focus-visible:ring-2" />
        <button type="button" onClick={handleSend} aria-label={t.send} style={{ background: COLOR.primary, color: '#FFFFFF' }} className="rounded-lg p-2.5 focus-visible:ring-2"><Send size={16} aria-hidden="true" /></button>
      </div>
    </div>
  );
}
