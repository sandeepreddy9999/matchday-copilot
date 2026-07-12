/**
 * i18n.ts
 * Copy for both the fan-facing view and the staff ops view, in all five
 * supported languages, so adding the ops view doesn't create an
 * English-only silo inside an otherwise multilingual app.
 */

import type { Band, Lang, Stand, DensityStatus } from './types';

export const LANGS: { code: Lang; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'pt', label: 'Português', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
];

export const STAND_WORDS: Record<Lang, Record<Stand, string>> = {
  en: { N: 'North', S: 'South', E: 'East', W: 'West' },
  es: { N: 'Norte', S: 'Sur', E: 'Este', W: 'Oeste' },
  pt: { N: 'Norte', S: 'Sul', E: 'Leste', W: 'Oeste' },
  fr: { N: 'Nord', S: 'Sud', E: 'Est', W: 'Ouest' },
  ar: { N: 'الشمال', S: 'الجنوب', E: 'الشرق', W: 'الغرب' },
};

export const BAND_WORDS: Record<Lang, Record<Band, string>> = {
  en: { lower: 'Lower Bowl', upper: 'Upper Bowl' },
  es: { lower: 'Nivel Bajo', upper: 'Nivel Alto' },
  pt: { lower: 'Nível Inferior', upper: 'Nível Superior' },
  fr: { lower: 'Niveau Inférieur', upper: 'Niveau Supérieur' },
  ar: { lower: 'الطابق السفلي', upper: 'الطابق العلوي' },
};

export interface Strings {
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
  // Ops view
  opsToggleFan: string;
  opsToggleStaff: string;
  opsTitle: string;
  opsSubtitle: string;
  occupancyLabel: string;
  actionRequired: string;
  actionNone: string;
  redirectTemplate: string; // use {from} and {to} placeholders
  transportTitle: string;
  transportStatus: Record<'onTime' | 'delayed' | 'suspended', string>;
  crowdingLabel: string;
  sustainabilityTitle: string;
  sustainabilityLow: string;
  sustainabilityHigh: string;
}

export const STRINGS: Record<Lang, Strings> = {
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
    opsToggleFan: 'Fan view',
    opsToggleStaff: 'Staff ops view',
    opsTitle: 'Operations overview',
    opsSubtitle: 'Live venue intelligence for staff and volunteers',
    occupancyLabel: 'Overall occupancy',
    actionRequired: 'Action recommended',
    actionNone: 'No congestion alerts right now.',
    redirectTemplate: 'Redirect incoming queues from {from} toward {to}.',
    transportTitle: 'Transport status',
    transportStatus: { onTime: 'On time', delayed: 'Delayed', suspended: 'Suspended' },
    crowdingLabel: 'Platform crowding',
    sustainabilityTitle: 'Sustainability insight',
    sustainabilityLow: 'Occupancy is low — consider consolidating shuttle frequency to cut idle emissions.',
    sustainabilityHigh: 'Occupancy is high — increase shuttle frequency to reduce walk-in idling and queue time.',
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
    opsToggleFan: 'Vista de aficionado',
    opsToggleStaff: 'Vista de operaciones',
    opsTitle: 'Resumen de operaciones',
    opsSubtitle: 'Inteligencia del recinto en vivo para personal y voluntarios',
    occupancyLabel: 'Ocupación general',
    actionRequired: 'Acción recomendada',
    actionNone: 'No hay alertas de congestión por ahora.',
    redirectTemplate: 'Redirigir las filas de entrada de {from} hacia {to}.',
    transportTitle: 'Estado del transporte',
    transportStatus: { onTime: 'A tiempo', delayed: 'Retrasado', suspended: 'Suspendido' },
    crowdingLabel: 'Aforo en el andén',
    sustainabilityTitle: 'Información de sostenibilidad',
    sustainabilityLow: 'La ocupación es baja — considere reducir la frecuencia de los autobuses lanzadera.',
    sustainabilityHigh: 'La ocupación es alta — aumente la frecuencia de los autobuses para reducir las esperas.',
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
    opsToggleFan: 'Visão do torcedor',
    opsToggleStaff: 'Visão de operações',
    opsTitle: 'Visão geral das operações',
    opsSubtitle: 'Inteligência do local em tempo real para equipe e voluntários',
    occupancyLabel: 'Ocupação geral',
    actionRequired: 'Ação recomendada',
    actionNone: 'Nenhum alerta de congestionamento no momento.',
    redirectTemplate: 'Redirecionar filas de entrada de {from} para {to}.',
    transportTitle: 'Status do transporte',
    transportStatus: { onTime: 'No horário', delayed: 'Atrasado', suspended: 'Suspenso' },
    crowdingLabel: 'Lotação na plataforma',
    sustainabilityTitle: 'Insight de sustentabilidade',
    sustainabilityLow: 'Ocupação baixa — considere reduzir a frequência dos ônibus para diminuir emissões ociosas.',
    sustainabilityHigh: 'Ocupação alta — aumente a frequência dos ônibus para reduzir o tempo de espera.',
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
    opsToggleFan: 'Vue supporter',
    opsToggleStaff: 'Vue opérations',
    opsTitle: 'Aperçu des opérations',
    opsSubtitle: 'Renseignements en direct pour le personnel et les bénévoles',
    occupancyLabel: 'Occupation globale',
    actionRequired: 'Action recommandée',
    actionNone: 'Aucune alerte de congestion pour le moment.',
    redirectTemplate: "Rediriger les files d'entrée de {from} vers {to}.",
    transportTitle: 'État des transports',
    transportStatus: { onTime: 'À l’heure', delayed: 'Retardé', suspended: 'Suspendu' },
    crowdingLabel: 'Affluence sur le quai',
    sustainabilityTitle: 'Aperçu de durabilité',
    sustainabilityLow: "L'occupation est faible — envisagez de réduire la fréquence des navettes.",
    sustainabilityHigh: "L'occupation est élevée — augmentez la fréquence des navettes pour réduire l'attente.",
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
    opsToggleFan: 'عرض المشجع',
    opsToggleStaff: 'عرض العمليات',
    opsTitle: 'نظرة عامة على العمليات',
    opsSubtitle: 'معلومات حية عن الملعب لفريق العمل والمتطوعين',
    occupancyLabel: 'الإشغال الكلي',
    actionRequired: 'إجراء موصى به',
    actionNone: 'لا توجد تنبيهات ازدحام حاليًا.',
    redirectTemplate: 'إعادة توجيه الطوابير من {from} نحو {to}.',
    transportTitle: 'حالة النقل',
    transportStatus: { onTime: 'في الموعد', delayed: 'متأخر', suspended: 'معلّق' },
    crowdingLabel: 'ازدحام الرصيف',
    sustainabilityTitle: 'رؤية الاستدامة',
    sustainabilityLow: 'الإشغال منخفض — يُنصح بتقليل عدد رحلات الحافلات لتقليل الانبعاثات.',
    sustainabilityHigh: 'الإشغال مرتفع — زد عدد رحلات الحافلات لتقليل وقت الانتظار.',
  },
};
