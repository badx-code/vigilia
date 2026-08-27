export type MomentType =
  | 'oracao'
  | 'louvor'
  | 'pregacao'
  | 'testemunho'
  | 'dinamica'
  | 'aviso'
  | 'pausa'
  | 'ceia'
  | 'intercessao'
  | 'louvor_especial'
  | 'outro';

export interface ScheduleMoment {
  id: string;
  title: string;
  type: MomentType;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  responsible?: string;
  team?: string;
  scripture?: string;
  description?: string;
  notes?: string;
  completed?: boolean;
  // Detalhes Operacionais do Dirigente (Ocultos para os membros)
  useSlide?: boolean; // Se vai usar projeção / slide no telão
  slideNotes?: string; // Detalhes ou orientações do Slide / Operador de Mídia
  songsList?: string; // Músicas que serão cantadas no louvor
  prayerMotives?: string; // Qual o motivo da oração / clamor
  sermonTopic?: string; // Tema central / esboço da pregação
  dynamicNotes?: string; // Materiais, regras ou instruções da dinâmica
  originalStartTime?: string; // Horário original antes do recálculo de atraso
  originalEndTime?: string;   // Horário original antes do recálculo de atraso
}

export type MinisterRole =
  | 'Pastor'
  | 'Pregador'
  | 'Dirigente'
  | 'Cantor'
  | 'Músico'
  | 'Intercessor'
  | 'Testemunho'
  | 'Recepção'
  | 'Equipe de Café'
  | 'Equipe de Apoio'
  | 'Mídia / Som'
  | 'Outro';

export interface Minister {
  id: string;
  name: string;
  displayName?: string;
  role: MinisterRole;
  phone?: string;
  whatsapp?: string;
  email?: string;
  church?: string;
  city?: string;
  state?: string;
  photoUrl?: string;
  notes?: string;
  description?: string;
  active?: boolean; // Status ativo/inativo
}

export interface RepertoireSong {
  id: string;
  title: string;
  artist: string;
  key: string; // Tom musical (ex: C, G, D, Em, F#m)
  responsible?: string;
  momentId?: string; // ID da atividade vinculada
  momentTitle?: string;
  notes?: string;
  order?: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  category?: string;
}

export type UserRole = 'membro' | 'dirigente';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
}

export interface SongItem {
  id: string;
  title: string;
  key: string;
  artist: string;
  time?: string;
  notes?: string;
}

export interface SermonItem {
  id: string;
  preacher: string;
  theme: string;
  scripture: string;
  time: string;
  notes?: string;
}

export interface MediaRole {
  id: string;
  area: string;
  person: string;
  notes?: string;
}

export interface Team {
  id: string;
  name: string;
  icon: string;
  leader: string;
  description: string;
  members: TeamMember[];
  equipmentChecklist?: ChecklistItem[];
  soundNotes?: string;
  songs?: SongItem[];
  sermons?: SermonItem[];
  menu?: string;
  breakTime?: string;
  feedingNotes?: string;
  welcomeChecklist?: ChecklistItem[];
  mediaRoles?: MediaRole[];
  mediaNotes?: string;
  taskChecklist?: ChecklistItem[];
  generalNotes?: string;
}

export interface Participant {
  id: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  church?: string;
  city?: string;
  state?: string;
  photoUrl?: string;
  status: 'confirmado' | 'presente' | 'pendente';
  registeredAt: string;
  notes?: string;
}

export type PrayerCategory =
  | 'geral'
  | 'saude'
  | 'familia'
  | 'espiritual'
  | 'trabalho'
  | 'libertacao'
  | 'gratidao'
  | 'jovens'
  | 'outro';

export type PrayerStatus = 'aprovado' | 'pendente' | 'rejeitado';

export interface PrayerRequest {
  id: string;
  authorName: string;
  request: string;
  category: PrayerCategory;
  isAnonymous: boolean;
  prayersCount: number;
  createdAt: string;
  userPrayed?: boolean;
  status?: PrayerStatus;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  isUrgent: boolean;
  category: string;
  createdAt: string;
}

export interface UsefulContact {
  id: string;
  title: string;
  name: string;
  phone: string;
  role: string;
}

export interface VigilCalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: 'vigilia' | 'ensaio' | 'reuniao' | 'evento';
  location?: string;
  notes?: string;
}

export interface DirigenteProfile {
  fullName: string;
  displayName: string;
  roleTitle: string;
  phone: string;
  whatsapp: string;
  email: string;
  photoUrl?: string;
  bio?: string;
  church: string;
  city: string;
  state: string;
  socialInstagram?: string;
  socialYoutube?: string;
}

export interface LoginPageConfig {
  systemName: string;
  pageTitle: string;
  pageSubtitle: string;
  presentationText: string;
  logoUrl?: string;
  backgroundImageUrl?: string;
  bannerUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  dirigenteButtonText: string;
  dirigenteButtonSubtext?: string;
  membrosButtonText: string;
  membrosButtonSubtext?: string;
  footerText: string;
  contactInfoText?: string;
}

export interface ParticipantAccessConfig {
  accessTitle: string;
  presentationText: string;
  welcomeMessage: string;
  requirePassword?: boolean;
  password?: string;
  allowSelfRegistration?: boolean;
  registrationFields: {
    fullName: boolean;
    phone: boolean;
    whatsapp: boolean;
    email: boolean;
    city: boolean;
    church: boolean;
    photo: boolean;
  };
  logoUrl?: string;
  imageUrl?: string;
}

export interface DirigenteAccountConfig {
  username: string;
  email: string;
  passwordHash?: string;
  fullName: string;
  photoUrl?: string;
  permissions: string[];
  status: 'active' | 'inactive';
  sessionTimeoutMinutes: number;
  failedAttemptsCount: number;
  lockedUntil?: string | null;
}

export interface VigiliaConfig {
  // Códigos de Acesso
  accessCode: string;       // Fallback
  memberCode: string;       // Ex: VIG-4827
  dirigenteCode: string;    // Ex: DIR-7391
  adminCode: string;        // Ex: ADMIN-9821

  // 1. CONFIGURAÇÕES DA VIGÍLIA
  vigilName: string;
  date: string;             // YYYY-MM-DD
  startTime: string;        // HH:mm
  endTime: string;          // HH:mm
  location: string;
  address?: string;
  city: string;
  state?: string;
  theme: string;
  subtheme?: string;
  keyVerse: string;
  verseReference: string;
  description: string;
  churchName: string;
  ministryName?: string;
  churchLogo?: string;
  vigilBanner?: string;
  mainImage?: string;
  presentationText?: string;
  additionalInfo: string;
  contactPhone: string;
  whatsapp?: string;
  instagram?: string;
  youtube?: string;
  liveStreamUrl?: string;
  mapUrl?: string;
  accentColor: string;
  secondaryColor?: string;

  // 2. DADOS DO DIRIGENTE
  dirigenteProfile?: DirigenteProfile;

  // 5. PÁGINA DE LOGIN
  loginPageConfig?: LoginPageConfig;

  // 6. ACESSO DO DIRIGENTE & SEGURANÇA
  dirigenteAccount?: DirigenteAccountConfig;

  // 7. ACESSO DOS PARTICIPANTES
  participantAccess?: ParticipantAccessConfig;

  // Delay & Recálculo
  delayMinutes?: number;
  isScheduleRecalculated?: boolean;

  // Checklist
  checklist?: ChecklistItem[];

  // Proteção por Senha / PIN
  requireParticipantPassword?: boolean;
  participantPassword?: string;
  dirigentePin?: string;

  // Sala de Espera
  waitingMode?: 'auto' | 'always' | 'disabled';
  waitingWelcomeMessage?: string;
  waitingPrayerFocus?: string;
  waitingMusicPlaylistUrl?: string;
  showScheduleInWaiting?: boolean;
  allowEarlyCheckin?: boolean;
  allowEarlyPrayers?: boolean;
}

export interface VigilTemplate {
  id: string;
  name: string;
  description: string;
  category: 'tradicional' | 'jovens' | 'intercessao' | 'em_branco' | 'personalizado';
  isCustom?: boolean;
  config: Partial<VigiliaConfig>;
  moments: Omit<ScheduleMoment, 'id'>[];
  songs?: Omit<RepertoireSong, 'id'>[];
}

export interface VigilItem {
  id: string;
  code: string;
  createdAt: string;
  config: VigiliaConfig;
  moments: ScheduleMoment[];
  ministers: Minister[];
  repertoire: RepertoireSong[];
  checklist: ChecklistItem[];
  delayMinutes: number;
  teams: Team[];
  participants: Participant[];
  prayerRequests: PrayerRequest[];
  notices: Notice[];
  usefulContacts: UsefulContact[];
  calendarEvents: VigilCalendarEvent[];
}
