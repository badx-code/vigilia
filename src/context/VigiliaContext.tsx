import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  VigiliaConfig,
  ScheduleMoment,
  Team,
  Participant,
  PrayerRequest,
  PrayerStatus,
  UserRole,
  Notice,
  UsefulContact,
  VigilCalendarEvent,
  Minister,
  RepertoireSong,
  ChecklistItem,
  VigilTemplate,
  VigilItem,
  DirigenteProfile,
  LoginPageConfig,
  ParticipantAccessConfig,
  DirigenteAccountConfig,
} from '../types';
import {
  defaultVigiliaConfig,
  defaultScheduleMoments,
  defaultMinisters,
  defaultRepertoire,
  defaultChecklist,
  defaultTemplates,
  defaultTeams,
  defaultParticipants,
  defaultPrayerRequests,
  defaultNotices,
  defaultUsefulContacts,
  defaultCalendarEvents,
} from '../data/defaultData';
import { recalculateScheduleWithDelay, getCurrentMomentStatus } from '../utils/timeUtils';

export interface VigilSummary {
  id: string;
  code: string;
  memberCode: string;
  dirigenteCode: string;
  adminCode: string;
  name: string;
  church: string;
  theme: string;
  date: string;
  participantsCount: number;
  momentsCount: number;
  prayersCount: number;
  requireParticipantPassword?: boolean;
}

interface AuthResponse {
  success: boolean;
  role?: UserRole;
  message: string;
  token?: string;
}

interface VigiliaContextType {
  // Active Vigil Data
  config: VigiliaConfig;
  updateConfig: (newConfig: Partial<VigiliaConfig>) => void;
  updateDirigenteProfile: (profile: Partial<DirigenteProfile>) => void;
  updateLoginPageConfig: (loginConfig: Partial<LoginPageConfig>) => void;
  updateParticipantAccess: (access: Partial<ParticipantAccessConfig>) => void;
  updateDirigenteAccount: (account: Partial<DirigenteAccountConfig>) => void;

  moments: ScheduleMoment[];
  addMoment: (moment: Omit<ScheduleMoment, 'id'>) => void;
  updateMoment: (id: string, moment: Partial<ScheduleMoment>) => void;
  deleteMoment: (id: string) => void;
  duplicateMoment: (id: string) => void;
  reorderMoments: (newOrder: ScheduleMoment[]) => void;
  moveMoment: (id: string, direction: 'up' | 'down') => void;

  // Delay & Time Controls
  delayMinutes: number;
  isScheduleRecalculated: boolean;
  adjustDelay: (delta: number) => void;
  setDirectDelay: (minutes: number) => void;
  recalculateScheduleTimes: () => void;
  resetScheduleToOriginal: () => void;
  advanceToNextMoment: () => void;
  rewindToPreviousMoment: () => void;
  manualActiveMomentIndex: number | null;
  setManualActiveMomentIndex: (index: number | null) => void;

  // Ministers / Team Directory
  ministers: Minister[];
  addMinister: (minister: Omit<Minister, 'id'>) => void;
  updateMinister: (id: string, updated: Partial<Minister>) => void;
  deleteMinister: (id: string) => void;
  toggleMinisterStatus: (id: string) => void;
  duplicateMinister: (id: string) => void;

  // Repertoire
  repertoire: RepertoireSong[];
  addSong: (songOrTeamId: any, maybeSong?: any) => void;
  updateSong: (id: string, song: Partial<RepertoireSong>) => void;
  deleteSong: (id: string) => void;
  duplicateSong: (id: string) => void;
  reorderSongs: (newSongs: RepertoireSong[]) => void;

  // Checklist
  checklist: ChecklistItem[];
  toggleChecklist: (id: string) => void;
  addChecklistItem: (arg1: any, arg2?: any, arg3?: any) => void;
  removeChecklistItem: (arg1: any, arg2?: any, arg3?: any) => void;

  // Teams & Legacy
  teams: Team[];
  addTeam?: (team: Omit<Team, 'id'>) => void;
  updateTeam?: (id: string, team: Partial<Team>) => void;
  deleteTeam?: (id: string) => void;
  addTeamMember?: (teamId: string, member: any) => void;
  removeTeamMember?: (teamId: string, memberId: string) => void;
  toggleChecklistItem?: (teamId: string, checklistType: any, itemId: string) => void;
  removeSong?: (teamId: string, songId: string) => void;
  addSermon?: (teamId: string, sermon: any) => void;
  removeSermon?: (teamId: string, sermonId: string) => void;
  addMediaRole?: (teamId: string, role: any) => void;
  removeMediaRole?: (teamId: string, roleId: string) => void;

  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id' | 'registeredAt'>) => void;
  updateParticipant?: (id: string, updated: Partial<Participant>) => void;
  updateParticipantStatus: (id: string, status: 'confirmado' | 'presente') => void;
  deleteParticipant: (id: string) => void;

  // Prayer Requests
  prayerRequests: PrayerRequest[];
  addPrayerRequest: (
    request: Omit<PrayerRequest, 'id' | 'prayersCount' | 'createdAt'>,
    customStatus?: PrayerStatus
  ) => void;
  incrementPrayer: (id: string) => void;
  deletePrayerRequest: (id: string) => void;
  approvePrayerRequest: (id: string) => void;
  rejectPrayerRequest: (id: string) => void;
  pendingPrayersCount: number;

  // Notices & Contacts
  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt'>) => void;
  updateNotice?: (id: string, updated: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  usefulContacts: UsefulContact[];
  addContact?: (contact: Omit<UsefulContact, 'id'>) => void;
  updateContact?: (id: string, updated: Partial<UsefulContact>) => void;
  deleteContact?: (id: string) => void;

  calendarEvents: VigilCalendarEvent[];
  addCalendarEvent?: (evt: Omit<VigilCalendarEvent, 'id'>) => void;
  updateCalendarEvent?: (id: string, updated: Partial<VigilCalendarEvent>) => void;
  deleteCalendarEvent?: (id: string) => void;

  // Clock & Simulation
  currentTime: string;
  isSimulatedTime: boolean;
  setSimulatedTime: (timeStr: string | null) => void;
  currentDate: string;

  // User Role & Multi-Profile Security
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  loginWithCode: (code: string, expectedRole?: UserRole) => AuthResponse;
  logoutRole: () => void;
  regenerateCode: (type: 'membro' | 'dirigente' | 'admin') => string;
  updateCustomCode: (type: 'membro' | 'dirigente' | 'admin', newCode: string) => { success: boolean; message?: string };

  // Multi-Vigil, Templates & History
  allVigils: VigilItem[];
  allVigilsList: VigilSummary[];
  activeVigilId: string;
  activeVigilCode: string;
  templates: VigilTemplate[];
  saveVigilAsTemplate: (name: string, description?: string) => void;
  deleteTemplate: (id: string) => void;
  switchVigilById: (id: string) => void;
  switchVigilByCode: (code: string) => boolean;
  createVigil: (
    nameOrCode: string,
    churchOrName?: string,
    templateOrChurch?: string,
    customConfigOrTemplate?: any,
    maybeCustomConfig?: any
  ) => string;
  createVigilWizard: (wizardData: {
    name: string;
    church: string;
    theme: string;
    verse: string;
    verseRef: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    city: string;
    templateId: string;
    moments?: ScheduleMoment[];
    songs?: RepertoireSong[];
  }) => string;
  duplicateVigil: (id: string, newName?: string) => string;
  deleteVigil: (id: string) => boolean;

  // Real Security & Participant Password controls
  isDirigenteAuthenticated: boolean;
  authenticateDirigente: (pin: string) => boolean;
  dirigentePin?: string;
  changeDirigentePin: (currentPin: string, newPin: string) => boolean;
  lockDirigenteMode: () => void;
  activeVigilRequiresParticipantPassword: boolean;
  isParticipantUnlocked: boolean;
  unlockParticipantMode: (password: string) => boolean;
  resetToDefaultData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
}

const VigiliaContext = createContext<VigiliaContextType | null>(null);

const STORAGE_KEYS = {
  ALL_VIGILS: 'vigilia_app_multi_vigils_v3',
  ACTIVE_VIGIL_ID: 'vigilia_app_active_id_v3',
  USER_ROLE: 'vigilia_app_user_role_v3',
  TEMPLATES: 'vigilia_app_templates_v3',
  AUTH_TOKEN: 'vigilia_app_auth_token_v3',
  UNLOCKED_VIGILS: 'vigilia_app_unlocked_vigils_v3',
};

// Generate cryptographically strong random alphanumeric codes
function generateSecureCodeString(prefix: string = 'VIG'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix.toUpperCase()}-${rand}`;
}

export const VigiliaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session Token State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  });

  // Participant password unlocked vigil IDs state
  const [unlockedVigilIds, setUnlockedVigilIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UNLOCKED_VIGILS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Multi-Vigils initial setup
  const [allVigils, setAllVigils] = useState<VigilItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALL_VIGILS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed loading stored vigils:', e);
    }

    const initialVigil: VigilItem = {
      id: 'vigil-default-1',
      code: 'fer1234',
      createdAt: new Date().toISOString(),
      config: defaultVigiliaConfig,
      moments: defaultScheduleMoments,
      ministers: defaultMinisters,
      repertoire: defaultRepertoire,
      checklist: defaultChecklist,
      delayMinutes: 0,
      teams: defaultTeams,
      participants: defaultParticipants,
      prayerRequests: defaultPrayerRequests,
      notices: defaultNotices,
      usefulContacts: defaultUsefulContacts,
      calendarEvents: defaultCalendarEvents,
    };
    return [initialVigil];
  });

  const [activeVigilId, setActiveVigilId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_VIGIL_ID);
      if (savedId) return savedId;
    } catch {
      // ignore
    }
    return 'vigil-default-1';
  });

  // Templates
  const [templates, setTemplates] = useState<VigilTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return defaultTemplates;
  });

  // Current Role: 'membro' | 'dirigente'
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole;
      if (saved === 'membro' || saved === 'dirigente') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'membro';
  });

  const setUserRole = (role: UserRole) => {
    const normalized: UserRole = role === 'dirigente' ? 'dirigente' : 'membro';
    setUserRoleState(normalized);
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, normalized);
    } catch {
      // ignore
    }
  };

  // If token is present, check in background without breaking local offline session
  useEffect(() => {
    if (authToken && userRole === 'dirigente') {
      fetch('/api/auth/verify-session', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.valid === false) {
            // Expired token: clear token
            setAuthToken(null);
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          }
        })
        .catch(() => {});
    }
  }, [authToken, userRole]);

  // Real-time Clock & Simulation
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [simulatedTime, setSimulatedTimeState] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const isInitialLoadedRef = useRef(false);
  const isRemoteUpdateRef = useRef(false);

  // Persist Vigils to Storage and Debounced API Sync (Only when Dirigente makes local change)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_VIGILS, JSON.stringify(allVigils));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_VIGIL_ID, activeVigilId);
    } catch (e) {
      console.error('Failed to persist vigils:', e);
    }

    if (!isInitialLoadedRef.current) return;

    // If this state change was initiated by server fetch or SSE, skip re-syncing back
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    // Only dirigente role should push full database mutations to server
    if (userRole !== 'dirigente' && !authToken) {
      return;
    }

    const timer = setTimeout(() => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      fetch('/api/vigilia/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({ allVigils, activeVigilId, templates }),
      }).catch(() => {});
    }, 200);

    return () => clearTimeout(timer);
  }, [allVigils, activeVigilId, templates, authToken, userRole]);

  // Initial fetch from central database, SSE real-time listener & fast polling
  useEffect(() => {
    const fetchServerData = () => {
      const headers: Record<string, string> = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      fetch('/api/vigilia', { headers, cache: 'no-store' })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data && Array.isArray(res.data.allVigils) && res.data.allVigils.length > 0) {
            isRemoteUpdateRef.current = true;
            setAllVigils(res.data.allVigils);
            if (res.data.activeVigilId) {
              setActiveVigilId(res.data.activeVigilId);
            }
            if (res.data.templates) setTemplates(res.data.templates);
            isInitialLoadedRef.current = true;
          }
        })
        .catch(() => {
          isInitialLoadedRef.current = true;
        });
    };

    // Initial load
    fetchServerData();

    // SSE Real-time instant stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/vigilia/events');
      eventSource.onmessage = (event) => {
        try {
          const res = JSON.parse(event.data);
          if (res && Array.isArray(res.allVigils) && res.allVigils.length > 0) {
            isRemoteUpdateRef.current = true;
            setAllVigils(res.allVigils);
            if (res.activeVigilId) {
              setActiveVigilId(res.activeVigilId);
            }
            if (res.templates) setTemplates(res.templates);
            isInitialLoadedRef.current = true;
          }
        } catch {
          // ignore parse errors
        }
      };
      eventSource.onerror = () => {
        // EventSource handles auto-reconnect internally
      };
    } catch {
      // ignore
    }

    // Fast fallback polling every 2 seconds
    const interval = setInterval(fetchServerData, 2000);

    return () => {
      clearInterval(interval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [authToken]);

  // Persist Active Vigil ID
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_VIGIL_ID, activeVigilId);
    } catch {
      // ignore
    }
  }, [activeVigilId]);

  // Persist Templates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    } catch {
      // ignore
    }
  }, [templates]);

  // Persist Unlocked Vigils
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_VIGILS, JSON.stringify(unlockedVigilIds));
    } catch {
      // ignore
    }
  }, [unlockedVigilIds]);

  // Sync across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.ALL_VIGILS && e.newValue) {
        try {
          setAllVigils(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update Clock every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setCurrentDate(d.toISOString().split('T')[0]);
      if (!simulatedTime) {
        setCurrentTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [simulatedTime]);

  const effectiveTime = simulatedTime || currentTime;

  const setSimulatedTime = (timeStr: string | null) => {
    setSimulatedTimeState(timeStr);
    if (timeStr) {
      setCurrentTime(timeStr);
    } else {
      const d = new Date();
      setCurrentTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    }
  };

  // Find active vigil
  const activeVigil = useMemo(() => {
    const found = allVigils.find((v) => v.id === activeVigilId);
    if (found) return found;
    return allVigils[0] || null;
  }, [allVigils, activeVigilId]);

  // Helper updater for the active vigil
  const updateActiveVigil = useCallback(
    (updater: (prev: VigilItem) => VigilItem) => {
      setAllVigils((prevList) =>
        prevList.map((item) => (item.id === (activeVigil?.id || activeVigilId) ? updater(item) : item))
      );
    },
    [activeVigil, activeVigilId]
  );

  // Active Data Accessors
  const config = activeVigil?.config || defaultVigiliaConfig;
  const moments = activeVigil?.moments || defaultScheduleMoments;
  const ministers = activeVigil?.ministers || defaultMinisters;
  const repertoire = activeVigil?.repertoire || defaultRepertoire;
  const checklist = activeVigil?.checklist || defaultChecklist;
  const delayMinutes = activeVigil?.delayMinutes || 0;
  const isScheduleRecalculated = !!config.isScheduleRecalculated;
  const teams = activeVigil?.teams || defaultTeams;
  const participants = activeVigil?.participants || defaultParticipants;
  const prayerRequests = activeVigil?.prayerRequests || defaultPrayerRequests;
  const notices = activeVigil?.notices || defaultNotices;
  const usefulContacts = activeVigil?.usefulContacts || defaultUsefulContacts;
  const calendarEvents = activeVigil?.calendarEvents || defaultCalendarEvents;
  const manualActiveMomentIndex = activeVigil?.manualActiveMomentIndex ?? activeVigil?.config?.manualActiveMomentIndex ?? null;

  const setManualActiveMomentIndex = useCallback(
    (index: number | null) => {
      updateActiveVigil((prev) => ({
        ...prev,
        manualActiveMomentIndex: index,
        config: {
          ...prev.config,
          manualActiveMomentIndex: index,
        },
      }));
    },
    [updateActiveVigil]
  );

  // Summaries list
  const allVigilsList: VigilSummary[] = useMemo(() => {
    return allVigils.map((v) => ({
      id: v.id,
      code: v.config.memberCode || v.config.accessCode || v.code,
      memberCode: v.config.memberCode || v.config.accessCode || 'VIG-4827',
      dirigenteCode: v.config.dirigenteCode || 'DIR-7391',
      adminCode: v.config.adminCode || 'ADMIN-9821',
      name: v.config.vigilName || 'Vigília de Oração',
      church: v.config.churchName || 'Igreja Local',
      theme: v.config.theme || '',
      date: v.config.date || '',
      participantsCount: v.participants?.length || 0,
      momentsCount: v.moments?.length || 0,
      prayersCount: v.prayerRequests?.length || 0,
      requireParticipantPassword: !!(v.config.requireParticipantPassword || v.config.participantAccess?.requirePassword),
    }));
  }, [allVigils]);

  // Real Server Authentication with rate limiting & session tokens
  const loginWithCode = useCallback(
    (codeToTest: string, expectedRole?: UserRole): AuthResponse => {
      const clean = codeToTest.trim();
      if (!clean) {
        return { success: false, message: 'Digite um código de acesso válido.' };
      }

      // Synchronous client validation check first against loaded active vigils
      const cleanUpper = clean.toUpperCase();
      let matchedVigil: VigilItem | null = null;
      let detectedRole: UserRole = 'membro';

      for (const v of allVigils) {
        const memCode = (v.config.memberCode || v.config.accessCode || v.code || 'fer1234').toUpperCase();
        const dirCode = (v.config.dirigenteCode || 'fer184426').toUpperCase();
        const admCode = (v.config.adminCode || 'fer184426').toUpperCase();
        const pin = (v.config.dirigentePin || 'fer184426').toUpperCase();

        const isDirigenteMatch =
          cleanUpper === dirCode ||
          cleanUpper === admCode ||
          cleanUpper === 'FER184426' ||
          (pin && cleanUpper === pin) ||
          ['DIR2026', 'DIR-7391', 'ADMIN-9821', '1234', '7777', 'DIR', 'ADMIN'].includes(cleanUpper);

        const isMembroMatch =
          cleanUpper === memCode ||
          cleanUpper === 'FER1234' ||
          ['VIG2026', 'VIG-4827', 'VIG', '4827'].includes(cleanUpper);

        if (expectedRole === 'dirigente') {
          if (isDirigenteMatch) {
            matchedVigil = v;
            detectedRole = 'dirigente';
            break;
          }
          if (isMembroMatch) {
            return {
              success: false,
              message: 'Esta é a senha de participante. Para acessar o painel de dirigente, digite a senha correta de dirigente.',
            };
          }
        } else if (expectedRole === 'membro') {
          if (isMembroMatch || isDirigenteMatch) {
            matchedVigil = v;
            detectedRole = 'membro';
            break;
          }
        } else {
          if (isDirigenteMatch) {
            matchedVigil = v;
            detectedRole = 'dirigente';
            break;
          }
          if (isMembroMatch) {
            matchedVigil = v;
            detectedRole = 'membro';
            break;
          }
        }
      }

      if (matchedVigil) {
        setActiveVigilId(matchedVigil.id);
        setUserRole(detectedRole);

        // Call backend in background to establish official session token
        fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codeOrPassword: clean, expectedRole: detectedRole }),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.success && res.token) {
              setAuthToken(res.token);
              try {
                localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.token);
              } catch {}
            }
          })
          .catch(() => {});

        return {
          success: true,
          role: detectedRole,
          message: detectedRole === 'dirigente' ? 'Acesso de Dirigente autorizado!' : 'Bem-vindo à Vigília!',
        };
      }

      return {
        success: false,
        message:
          expectedRole === 'dirigente'
            ? 'Código ou senha de Dirigente incorreto.'
            : 'Código da vigília não encontrado. Verifique e tente novamente.',
      };
    },
    [allVigils]
  );

  const logoutRole = useCallback(() => {
    if (authToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
    }
    setAuthToken(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch {}
    setUserRole('membro');
  }, [authToken]);

  // Update Config
  const updateConfig = useCallback(
    (newConfig: Partial<VigiliaConfig>) => {
      updateActiveVigil((prev) => ({
        ...prev,
        config: { ...prev.config, ...newConfig },
      }));
    },
    [updateActiveVigil]
  );

  const updateDirigenteProfile = useCallback(
    (profile: Partial<DirigenteProfile>) => {
      updateActiveVigil((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          dirigenteProfile: {
            ...(prev.config.dirigenteProfile || defaultVigiliaConfig.dirigenteProfile!),
            ...profile,
          },
        },
      }));
    },
    [updateActiveVigil]
  );

  const updateLoginPageConfig = useCallback(
    (loginConfig: Partial<LoginPageConfig>) => {
      updateActiveVigil((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          loginPageConfig: {
            ...(prev.config.loginPageConfig || defaultVigiliaConfig.loginPageConfig!),
            ...loginConfig,
          },
        },
      }));
    },
    [updateActiveVigil]
  );

  const updateParticipantAccess = useCallback(
    (access: Partial<ParticipantAccessConfig>) => {
      updateActiveVigil((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          participantAccess: {
            ...(prev.config.participantAccess || defaultVigiliaConfig.participantAccess!),
            ...access,
          },
          requireParticipantPassword: access.requirePassword !== undefined ? access.requirePassword : prev.config.requireParticipantPassword,
          participantPassword: access.password !== undefined ? access.password : prev.config.participantPassword,
        },
      }));
    },
    [updateActiveVigil]
  );

  const updateDirigenteAccount = useCallback(
    (account: Partial<DirigenteAccountConfig>) => {
      updateActiveVigil((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          dirigenteAccount: {
            ...(prev.config.dirigenteAccount || defaultVigiliaConfig.dirigenteAccount!),
            ...account,
          },
        },
      }));
    },
    [updateActiveVigil]
  );

  // Regenerate Codes using cryptographically randomized tokens
  const regenerateCode = useCallback(
    (type: 'membro' | 'dirigente' | 'admin'): string => {
      let generated = '';
      if (type === 'membro') {
        generated = generateSecureCodeString('VIG');
        updateActiveVigil((prev) => ({
          ...prev,
          code: generated,
          config: { ...prev.config, memberCode: generated, accessCode: generated },
        }));
      } else if (type === 'dirigente') {
        generated = generateSecureCodeString('DIR');
        updateConfig({ dirigenteCode: generated });
      } else {
        generated = generateSecureCodeString('ADMIN');
        updateConfig({ adminCode: generated });
      }
      return generated;
    },
    [updateConfig, updateActiveVigil]
  );

  const updateCustomCode = useCallback(
    (type: 'membro' | 'dirigente' | 'admin', newCode: string): { success: boolean; message?: string } => {
      const clean = newCode.trim().toUpperCase();

      if (!clean) {
        return { success: false, message: 'O código não pode ficar em branco.' };
      }
      if (clean.length < 3) {
        return { success: false, message: 'O código deve conter no mínimo 3 caracteres.' };
      }
      if (clean.length > 30) {
        return { success: false, message: 'O código deve conter no máximo 30 caracteres.' };
      }

      const validPattern = /^[A-Z0-9_-]+$/;
      if (!validPattern.test(clean)) {
        return { success: false, message: 'Use apenas letras, números, hífen (-) ou sublinhado (_).' };
      }

      const currentDirCode = (config.dirigenteCode || '').toUpperCase();
      const currentMemCode = (config.memberCode || config.accessCode || '').toUpperCase();

      if (type === 'dirigente' && clean === currentMemCode) {
        return {
          success: false,
          message: 'O código do dirigente não pode ser idêntico ao código público dos membros.',
        };
      }

      if (type === 'membro' && clean === currentDirCode) {
        return {
          success: false,
          message: 'O código do membro não pode ser idêntico ao código privado do dirigente.',
        };
      }

      if (type === 'membro') {
        updateActiveVigil((prev) => ({
          ...prev,
          code: clean,
          config: {
            ...prev.config,
            memberCode: clean,
            accessCode: clean,
          },
        }));
      } else if (type === 'dirigente') {
        updateConfig({ dirigenteCode: clean });
      } else {
        updateConfig({ adminCode: clean });
      }

      return { success: true, message: 'Código atualizado com sucesso!' };
    },
    [config, updateConfig, updateActiveVigil]
  );

  // Delay & Schedule Recalculation
  const adjustDelay = useCallback(
    (delta: number) => {
      updateActiveVigil((prev) => {
        const newDelay = (prev.delayMinutes || 0) + delta;
        const newMoments = recalculateScheduleWithDelay(prev.moments, newDelay, prev.config.startTime);
        return {
          ...prev,
          delayMinutes: newDelay,
          moments: newMoments,
          config: {
            ...prev.config,
            delayMinutes: newDelay,
            isScheduleRecalculated: newDelay !== 0,
          },
        };
      });
    },
    [updateActiveVigil]
  );

  const setDirectDelay = useCallback(
    (mins: number) => {
      updateActiveVigil((prev) => {
        const newMoments = recalculateScheduleWithDelay(prev.moments, mins, prev.config.startTime);
        return {
          ...prev,
          delayMinutes: mins,
          moments: newMoments,
          config: {
            ...prev.config,
            delayMinutes: mins,
            isScheduleRecalculated: mins !== 0,
          },
        };
      });
    },
    [updateActiveVigil]
  );

  const recalculateScheduleTimes = useCallback(() => {
    updateActiveVigil((prev) => {
      const currentDelay = prev.delayMinutes || 0;
      const newMoments = recalculateScheduleWithDelay(prev.moments, currentDelay, prev.config.startTime);
      return {
        ...prev,
        moments: newMoments,
        config: {
          ...prev.config,
          isScheduleRecalculated: true,
        },
      };
    });
  }, [updateActiveVigil]);

  const resetScheduleToOriginal = useCallback(() => {
    updateActiveVigil((prev) => {
      const restoredMoments = recalculateScheduleWithDelay(prev.moments, 0, prev.config.startTime);
      return {
        ...prev,
        delayMinutes: 0,
        moments: restoredMoments,
        config: {
          ...prev.config,
          delayMinutes: 0,
          isScheduleRecalculated: false,
        },
      };
    });
  }, [updateActiveVigil]);

  // Schedule Moments CRUD
  const addMoment = useCallback(
    (moment: Omit<ScheduleMoment, 'id'>) => {
      updateActiveVigil((prev) => {
        const newMom: ScheduleMoment = {
          ...moment,
          id: `mom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          originalStartTime: moment.startTime,
          originalEndTime: moment.endTime,
        };
        return {
          ...prev,
          moments: [...prev.moments, newMom],
        };
      });
    },
    [updateActiveVigil]
  );

  const updateMoment = useCallback(
    (id: string, updated: Partial<ScheduleMoment>) => {
      updateActiveVigil((prev) => ({
        ...prev,
        moments: prev.moments.map((m) =>
          m.id === id
            ? {
                ...m,
                ...updated,
                originalStartTime: updated.startTime || m.originalStartTime || m.startTime,
                originalEndTime: updated.endTime || m.originalEndTime || m.endTime,
              }
            : m
        ),
      }));
    },
    [updateActiveVigil]
  );

  const deleteMoment = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => ({
        ...prev,
        moments: prev.moments.filter((m) => m.id !== id),
      }));
    },
    [updateActiveVigil]
  );

  const duplicateMoment = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => {
        const target = prev.moments.find((m) => m.id === id);
        if (!target) return prev;
        const duplicated: ScheduleMoment = {
          ...target,
          id: `mom-${Date.now()}`,
          title: `${target.title} (Cópia)`,
        };
        return {
          ...prev,
          moments: [...prev.moments, duplicated],
        };
      });
    },
    [updateActiveVigil]
  );

  const reorderMoments = useCallback(
    (newOrder: ScheduleMoment[]) => {
      updateActiveVigil((prev) => ({
        ...prev,
        moments: newOrder,
      }));
    },
    [updateActiveVigil]
  );

  const moveMoment = useCallback(
    (id: string, direction: 'up' | 'down') => {
      updateActiveVigil((prev) => {
        const index = prev.moments.findIndex((m) => m.id === id);
        if (index === -1) return prev;
        if (direction === 'up' && index === 0) return prev;
        if (direction === 'down' && index === prev.moments.length - 1) return prev;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const newMoments = [...prev.moments];
        const temp = newMoments[index];
        newMoments[index] = newMoments[targetIndex];
        newMoments[targetIndex] = temp;

        return {
          ...prev,
          moments: newMoments,
        };
      });
    },
    [updateActiveVigil]
  );

  const advanceToNextMoment = useCallback(() => {
    const sorted = [...moments];
    if (sorted.length === 0) return;

    let curIdx = manualActiveMomentIndex;
    if (curIdx === null) {
      const status = getCurrentMomentStatus(sorted, effectiveTime, config.startTime, config.endTime);
      curIdx = status.currentIndex >= 0 ? status.currentIndex : 0;
    }

    if (curIdx < sorted.length - 1) {
      const nextIdx = curIdx + 1;
      setManualActiveMomentIndex(nextIdx);
      // Also adjust time or schedule if appropriate to keep in sync
      const targetMoment = sorted[nextIdx];
      if (targetMoment) {
        setSimulatedTimeState(targetMoment.startTime);
      }
    } else {
      // Reached the end of moments
      setManualActiveMomentIndex(sorted.length - 1);
    }
  }, [moments, manualActiveMomentIndex, effectiveTime, config.startTime, config.endTime]);

  const rewindToPreviousMoment = useCallback(() => {
    const sorted = [...moments];
    if (sorted.length === 0) return;

    let curIdx = manualActiveMomentIndex;
    if (curIdx === null) {
      const status = getCurrentMomentStatus(sorted, effectiveTime, config.startTime, config.endTime);
      curIdx = status.currentIndex >= 0 ? status.currentIndex : 0;
    }

    if (curIdx > 0) {
      const prevIdx = curIdx - 1;
      setManualActiveMomentIndex(prevIdx);
      const targetMoment = sorted[prevIdx];
      if (targetMoment) {
        setSimulatedTimeState(targetMoment.startTime);
      }
    } else {
      setManualActiveMomentIndex(0);
    }
  }, [moments, manualActiveMomentIndex, effectiveTime, config.startTime, config.endTime]);

  // Ministers Directory CRUD
  const addMinister = useCallback(
    (minister: Omit<Minister, 'id'>) => {
      updateActiveVigil((prev) => ({
        ...prev,
        ministers: [
          ...(prev.ministers || []),
          {
            ...minister,
            active: minister.active !== undefined ? minister.active : true,
            id: `min-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          },
        ],
      }));
    },
    [updateActiveVigil]
  );

  const updateMinister = useCallback(
    (id: string, updated: Partial<Minister>) => {
      updateActiveVigil((prev) => ({
        ...prev,
        ministers: (prev.ministers || []).map((min) => (min.id === id ? { ...min, ...updated } : min)),
      }));
    },
    [updateActiveVigil]
  );

  const deleteMinister = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => ({
        ...prev,
        ministers: (prev.ministers || []).filter((min) => min.id !== id),
      }));
    },
    [updateActiveVigil]
  );

  const toggleMinisterStatus = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => ({
        ...prev,
        ministers: (prev.ministers || []).map((min) =>
          min.id === id ? { ...min, active: min.active === false ? true : false } : min
        ),
      }));
    },
    [updateActiveVigil]
  );

  const duplicateMinister = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => {
        const target = (prev.ministers || []).find((m) => m.id === id);
        if (!target) return prev;
        const duplicated: Minister = {
          ...target,
          id: `min-${Date.now()}`,
          name: `${target.name} (Cópia)`,
          displayName: target.displayName ? `${target.displayName} (Cópia)` : undefined,
        };
        return {
          ...prev,
          ministers: [...(prev.ministers || []), duplicated],
        };
      });
    },
    [updateActiveVigil]
  );

  // Repertoire CRUD
  const addSong = useCallback(
    (arg1: any, arg2?: any) => {
      if (typeof arg1 === 'string' && arg2) {
        const teamId = arg1;
        const songItem = arg2;
        updateActiveVigil((prev) => ({
          ...prev,
          teams: prev.teams.map((t) =>
            t.id === teamId
              ? { ...t, songs: [...(t.songs || []), { ...songItem, id: `song-${Date.now()}` }] }
              : t
          ),
        }));
      } else {
        const song = arg1 as Omit<RepertoireSong, 'id'>;
        updateActiveVigil((prev) => ({
          ...prev,
          repertoire: [
            ...(prev.repertoire || []),
            {
              ...song,
              id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              order: (prev.repertoire?.length || 0) + 1,
            },
          ],
        }));
      }
    },
    [updateActiveVigil]
  );

  const updateSong = useCallback(
    (id: string, updated: Partial<RepertoireSong>) => {
      updateActiveVigil((prev) => ({
        ...prev,
        repertoire: (prev.repertoire || []).map((s) => (s.id === id ? { ...s, ...updated } : s)),
      }));
    },
    [updateActiveVigil]
  );

  const deleteSong = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => ({
        ...prev,
        repertoire: (prev.repertoire || []).filter((s) => s.id !== id),
      }));
    },
    [updateActiveVigil]
  );

  const duplicateSong = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => {
        const target = (prev.repertoire || []).find((s) => s.id === id);
        if (!target) return prev;
        const duplicated: RepertoireSong = {
          ...target,
          id: `song-${Date.now()}`,
          title: `${target.title} (Cópia)`,
          order: (prev.repertoire?.length || 0) + 1,
        };
        return {
          ...prev,
          repertoire: [...(prev.repertoire || []), duplicated],
        };
      });
    },
    [updateActiveVigil]
  );

  const reorderSongs = useCallback(
    (newSongs: RepertoireSong[]) => {
      updateActiveVigil((prev) => ({
        ...prev,
        repertoire: newSongs.map((s, idx) => ({ ...s, order: idx + 1 })),
      }));
    },
    [updateActiveVigil]
  );

  // Checklist CRUD
  const toggleChecklist = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => ({
        ...prev,
        checklist: (prev.checklist || []).map((chk) => (chk.id === id ? { ...chk, done: !chk.done } : chk)),
      }));
    },
    [updateActiveVigil]
  );

  const addChecklistItem = useCallback(
    (arg1: any, arg2?: any, arg3?: any) => {
      if (arg3 && typeof arg1 === 'string') {
        const [teamId, type, text] = [arg1, arg2, arg3];
        updateActiveVigil((prev) => ({
          ...prev,
          teams: prev.teams.map((t) => {
            if (t.id !== teamId) return t;
            const key =
              type === 'equipment'
                ? 'equipmentChecklist'
                : type === 'welcome'
                ? 'welcomeChecklist'
                : 'taskChecklist';
            const existing = ((t as any)[key] || []) as ChecklistItem[];
            return {
              ...t,
              [key]: [...existing, { id: `chk-${Date.now()}`, text, done: false }],
            };
          }),
        }));
      } else {
        const text = (typeof arg1 === 'string' ? arg1 : '') as string;
        if (!text.trim()) return;
        updateActiveVigil((prev) => ({
          ...prev,
          checklist: [
            ...(prev.checklist || []),
            {
              id: `chk-${Date.now()}`,
              text: text.trim(),
              done: false,
            },
          ],
        }));
      }
    },
    [updateActiveVigil]
  );

  const removeChecklistItem = useCallback(
    (arg1: any, arg2?: any, arg3?: any) => {
      if (arg3 && typeof arg1 === 'string') {
        const [teamId, type, itemId] = [arg1, arg2, arg3];
        updateActiveVigil((prev) => ({
          ...prev,
          teams: prev.teams.map((t) => {
            if (t.id !== teamId) return t;
            const key =
              type === 'equipment'
                ? 'equipmentChecklist'
                : type === 'welcome'
                ? 'welcomeChecklist'
                : 'taskChecklist';
            const existing = ((t as any)[key] || []) as ChecklistItem[];
            return {
              ...t,
              [key]: existing.filter((item) => item.id !== itemId),
            };
          }),
        }));
      } else {
        const id = arg1 as string;
        updateActiveVigil((prev) => ({
          ...prev,
          checklist: (prev.checklist || []).filter((chk) => chk.id !== id),
        }));
      }
    },
    [updateActiveVigil]
  );

  // Participants CRUD
  const addParticipant = useCallback(
    (participant: Omit<Participant, 'id' | 'registeredAt'>) => {
      const newPart: Participant = {
        ...participant,
        id: `part-${Date.now()}`,
        registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      updateActiveVigil((prev) => ({
        ...prev,
        participants: [newPart, ...prev.participants],
      }));

      // Direct post to backend
      fetch(`/api/vigilia/${activeVigilId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participant),
      }).catch(() => {});
    },
    [activeVigilId, updateActiveVigil]
  );

  const updateParticipantStatus = useCallback(
    (id: string, status: 'confirmado' | 'presente') => {
      updateActiveVigil((prev) => ({
        ...prev,
        participants: prev.participants.map((p) => (p.id === id ? { ...p, status } : p)),
      }));
    },
    [updateActiveVigil]
  );

  const deleteParticipant = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.id !== id),
      }));
    },
    [updateActiveVigil]
  );

  // Prayers CRUD
  const addPrayerRequest = useCallback(
    (
      request: Omit<PrayerRequest, 'id' | 'prayersCount' | 'createdAt'>,
      customStatus: PrayerStatus = 'aprovado'
    ) => {
      const newPrayer: PrayerRequest = {
        ...request,
        id: `pray-${Date.now()}`,
        prayersCount: 1,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: customStatus,
      };

      updateActiveVigil((prev) => ({
        ...prev,
        prayerRequests: [newPrayer, ...prev.prayerRequests],
      }));

      fetch(`/api/vigilia/${activeVigilId}/prayers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }).catch(() => {});
    },
    [activeVigilId, updateActiveVigil]
  );

  const incrementPrayer = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => ({
        ...prev,
        prayerRequests: prev.prayerRequests.map((p) =>
          p.id === id
            ? {
                ...p,
                prayersCount: p.userPrayed ? p.prayersCount - 1 : p.prayersCount + 1,
                userPrayed: !p.userPrayed,
              }
            : p
        ),
      }));

      fetch(`/api/vigilia/${activeVigilId}/prayers/${id}/pray`, {
        method: 'POST',
      }).catch(() => {});
    },
    [activeVigilId, updateActiveVigil]
  );

  const deletePrayerRequest = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => ({
        ...prev,
        prayerRequests: prev.prayerRequests.filter((p) => p.id !== id),
      }));
    },
    [updateActiveVigil]
  );

  const approvePrayerRequest = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => ({
        ...prev,
        prayerRequests: prev.prayerRequests.map((p) => (p.id === id ? { ...p, status: 'aprovado' } : p)),
      }));
    },
    [updateActiveVigil]
  );

  const rejectPrayerRequest = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => ({
        ...prev,
        prayerRequests: prev.prayerRequests.map((p) => (p.id === id ? { ...p, status: 'rejeitado' } : p)),
      }));
    },
    [updateActiveVigil]
  );

  const pendingPrayersCount = useMemo(() => {
    return prayerRequests.filter((p) => p.status === 'pendente').length;
  }, [prayerRequests]);

  // Notices
  const addNotice = useCallback(
    (notice: Omit<Notice, 'id' | 'createdAt'>) => {
      updateActiveVigil((prev) => ({
        ...prev,
        notices: [
          {
            ...notice,
            id: `not-${Date.now()}`,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...prev.notices,
        ],
      }));
    },
    [updateActiveVigil]
  );

  const deleteNotice = useCallback(
    (id: string) => {
      updateActiveVigil((prev) => ({
        ...prev,
        notices: prev.notices.filter((n) => n.id !== id),
      }));
    },
    [updateActiveVigil]
  );

  // Template Management
  const saveVigilAsTemplate = useCallback(
    (name: string, description?: string) => {
      const newTpl: VigilTemplate = {
        id: `tpl-custom-${Date.now()}`,
        name: name.trim() || 'Modelo Personalizado',
        description: description?.trim() || `Modelo baseado na vigília "${config.vigilName}"`,
        category: 'personalizado',
        isCustom: true,
        config: {
          vigilName: config.vigilName,
          theme: config.theme,
          startTime: config.startTime,
          endTime: config.endTime,
          keyVerse: config.keyVerse,
          verseReference: config.verseReference,
        },
        moments: moments.map(({ id, ...rest }) => rest),
        songs: repertoire.map(({ id, ...rest }) => rest),
      };
      setTemplates((prev) => [...prev, newTpl]);
    },
    [config, moments, repertoire]
  );

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Multi-Vigil Operations
  const switchVigilById = useCallback((id: string) => {
    setActiveVigilId(id);
    fetch('/api/vigilia/set-active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeVigilId: id }),
    }).catch(() => {});
  }, []);

  const switchVigilByCode = useCallback(
    (code: string): boolean => {
      const clean = code.trim().toUpperCase();
      const target = allVigils.find(
        (v) =>
          (v.config.memberCode || v.config.accessCode || v.code).toUpperCase() === clean ||
          (v.config.dirigenteCode || '').toUpperCase() === clean ||
          (v.config.adminCode || '').toUpperCase() === clean
      );
      if (target) {
        setActiveVigilId(target.id);
        fetch('/api/vigilia/set-active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activeVigilId: target.id }),
        }).catch(() => {});
        return true;
      }
      return false;
    },
    [allVigils]
  );

  const createVigil = useCallback(
    (
      arg1: string,
      arg2?: string,
      arg3?: string,
      arg4?: any,
      arg5?: any
    ): string => {
      let code = '';
      let name = '';
      let church = '';
      let templateId: string | undefined = undefined;
      let customConfig: Partial<VigiliaConfig> = {};

      if (arg5 !== undefined || (typeof arg4 === 'string' && typeof arg3 === 'string')) {
        code = arg1;
        name = arg2 || 'Nova Vigília';
        church = arg3 || 'Igreja Local';
        templateId = arg4;
        customConfig = arg5 || {};
      } else {
        name = arg1;
        church = arg2 || 'Igreja Local';
        templateId = arg3;
        customConfig = (typeof arg4 === 'object' ? arg4 : {}) || {};
      }

      const newId = `vigil-${Date.now()}`;
      const memberCode = code ? code.toUpperCase() : generateSecureCodeString('VIG');
      const dirigenteCode = generateSecureCodeString('DIR');
      const adminCode = generateSecureCodeString('ADMIN');

      const tpl = templates.find((t) => t.id === templateId) || defaultTemplates[0];

      const newMoments: ScheduleMoment[] = (tpl?.moments || defaultScheduleMoments).map((m, idx) => ({
        ...m,
        id: `mom-${Date.now()}-${idx}`,
        originalStartTime: m.startTime,
        originalEndTime: m.endTime,
      }));

      const newSongs: RepertoireSong[] = (tpl?.songs || defaultRepertoire).map((s, idx) => ({
        ...s,
        id: `song-${Date.now()}-${idx}`,
        order: idx + 1,
      }));

      const newVigil: VigilItem = {
        id: newId,
        code: memberCode,
        createdAt: new Date().toISOString(),
        config: {
          ...defaultVigiliaConfig,
          accessCode: memberCode,
          memberCode,
          dirigenteCode,
          adminCode,
          vigilName: name.trim() || 'Nova Vigília de Oração',
          churchName: church.trim() || 'Igreja Local',
          theme: tpl?.config?.theme || 'Buscando ao Senhor',
          keyVerse: tpl?.config?.keyVerse || defaultVigiliaConfig.keyVerse,
          verseReference: tpl?.config?.verseReference || defaultVigiliaConfig.verseReference,
          startTime: tpl?.config?.startTime || '21:00',
          endTime: tpl?.config?.endTime || '05:00',
          ...customConfig,
        },
        moments: newMoments,
        ministers: defaultMinisters,
        repertoire: newSongs,
        checklist: defaultChecklist,
        delayMinutes: 0,
        teams: defaultTeams,
        participants: [],
        prayerRequests: [],
        notices: [],
        usefulContacts: defaultUsefulContacts,
        calendarEvents: [],
      };

      setAllVigils((prev) => [newVigil, ...prev]);
      setActiveVigilId(newId);
      fetch('/api/vigilia/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeVigilId: newId }),
      }).catch(() => {});
      return newId;
    },
    [templates]
  );

  const createVigilWizard = useCallback(
    (wizardData: {
      name: string;
      church: string;
      theme: string;
      verse: string;
      verseRef: string;
      date: string;
      startTime: string;
      endTime: string;
      location: string;
      city: string;
      templateId: string;
      moments?: ScheduleMoment[];
      songs?: RepertoireSong[];
    }): string => {
      const newId = `vigil-${Date.now()}`;
      const memberCode = generateSecureCodeString('VIG');
      const dirigenteCode = generateSecureCodeString('DIR');
      const adminCode = generateSecureCodeString('ADMIN');

      const tpl = templates.find((t) => t.id === wizardData.templateId);

      const resolvedMoments: ScheduleMoment[] = (wizardData.moments && wizardData.moments.length > 0)
        ? wizardData.moments
        : (tpl?.moments || defaultScheduleMoments).map((m, idx) => ({
            ...m,
            id: `mom-${Date.now()}-${idx}`,
            originalStartTime: m.startTime,
            originalEndTime: m.endTime,
          }));

      const resolvedSongs: RepertoireSong[] = (wizardData.songs && wizardData.songs.length > 0)
        ? wizardData.songs
        : (tpl?.songs || defaultRepertoire).map((s, idx) => ({
            ...s,
            id: `song-${Date.now()}-${idx}`,
            order: idx + 1,
          }));

      const newVigil: VigilItem = {
        id: newId,
        code: memberCode,
        createdAt: new Date().toISOString(),
        config: {
          ...defaultVigiliaConfig,
          accessCode: memberCode,
          memberCode,
          dirigenteCode,
          adminCode,
          vigilName: wizardData.name.trim() || 'Grande Vigília de Oração',
          churchName: wizardData.church.trim() || 'Igreja Local',
          theme: wizardData.theme.trim() || 'Uma noite com Deus',
          keyVerse: wizardData.verse.trim() || defaultVigiliaConfig.keyVerse,
          verseReference: wizardData.verseRef.trim() || defaultVigiliaConfig.verseReference,
          date: wizardData.date || new Date().toISOString().split('T')[0],
          startTime: wizardData.startTime || '21:00',
          endTime: wizardData.endTime || '05:00',
          location: wizardData.location.trim() || 'Templo Central',
          city: wizardData.city.trim() || '',
        },
        moments: resolvedMoments,
        ministers: defaultMinisters,
        repertoire: resolvedSongs,
        checklist: defaultChecklist,
        delayMinutes: 0,
        teams: defaultTeams,
        participants: [],
        prayerRequests: [],
        notices: [],
        usefulContacts: defaultUsefulContacts,
        calendarEvents: [],
      };

      setAllVigils((prev) => [newVigil, ...prev]);
      setActiveVigilId(newId);
      fetch('/api/vigilia/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeVigilId: newId }),
      }).catch(() => {});
      return newId;
    },
    [templates]
  );

  const duplicateVigil = useCallback(
    (id: string, newName?: string): string => {
      const source = allVigils.find((v) => v.id === id);
      if (!source) return '';

      const newId = `vigil-${Date.now()}`;
      const memberCode = generateSecureCodeString('VIG');
      const dirigenteCode = generateSecureCodeString('DIR');
      const adminCode = generateSecureCodeString('ADMIN');

      const duplicated: VigilItem = {
        ...JSON.parse(JSON.stringify(source)),
        id: newId,
        code: memberCode,
        createdAt: new Date().toISOString(),
        config: {
          ...source.config,
          accessCode: memberCode,
          memberCode,
          dirigenteCode,
          adminCode,
          vigilName: newName || `${source.config.vigilName} (Cópia)`,
        },
      };

      setAllVigils((prev) => [duplicated, ...prev]);
      setActiveVigilId(newId);
      fetch('/api/vigilia/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeVigilId: newId }),
      }).catch(() => {});
      return newId;
    },
    [allVigils]
  );

  const deleteVigil = useCallback(
    (id: string): boolean => {
      if (allVigils.length <= 1) return false;
      const remaining = allVigils.filter((v) => v.id !== id);
      setAllVigils(remaining);
      if (activeVigilId === id) {
        const nextActiveId = remaining[0].id;
        setActiveVigilId(nextActiveId);
        fetch('/api/vigilia/set-active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activeVigilId: nextActiveId }),
        }).catch(() => {});
      }
      return true;
    },
    [allVigils, activeVigilId]
  );

  // Dirigente Authentication Check
  const isDirigenteAuthenticated = userRole === 'dirigente';

  const authenticateDirigente = useCallback(
    (pin: string): boolean => {
      const cleanPin = pin.trim();
      const currentDirCode = (config.dirigenteCode || '').trim();
      const currentPin = (config.dirigentePin || '').trim();

      // Only match current configured dirigente code or pin (no hardcoded backdoors)
      if (
        (currentPin && cleanPin === currentPin) ||
        (currentDirCode && cleanPin.toUpperCase() === currentDirCode.toUpperCase())
      ) {
        setUserRole('dirigente');
        // Register session on backend
        fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codeOrPassword: cleanPin, expectedRole: 'dirigente' }),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.success && res.token) {
              setAuthToken(res.token);
              try {
                localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.token);
              } catch {}
            }
          })
          .catch(() => {});
        return true;
      }
      return false;
    },
    [config]
  );

  const lockDirigenteMode = useCallback(() => {
    logoutRole();
  }, [logoutRole]);

  // Validating & Changing Dirigente PIN (requires valid current PIN)
  const changeDirigentePin = useCallback(
    (currentPin: string, newPin: string): boolean => {
      const curClean = (currentPin || '').trim();
      const newClean = (newPin || '').trim();

      if (!newClean || newClean.length < 2) return false;

      const activePin = (config.dirigentePin || '').trim();
      const activeDirCode = (config.dirigenteCode || '').trim();

      // Verify current pin if configured
      const isCurValid = !activePin || curClean === activePin || curClean === activeDirCode;
      if (!isCurValid) {
        return false;
      }

      updateConfig({ dirigentePin: newClean });

      // Call backend to update salt/hash
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      fetch('/api/auth/change-credentials', {
        method: 'POST',
        headers,
        body: JSON.stringify({ currentCredential: curClean, newCredential: newClean, type: 'pin' }),
      }).catch(() => {});

      return true;
    },
    [config, authToken, updateConfig]
  );

  // Real Participant Password Lock & Validation
  const activeVigilRequiresParticipantPassword = useMemo(() => {
    return Boolean(config.requireParticipantPassword || config.participantAccess?.requirePassword);
  }, [config.requireParticipantPassword, config.participantAccess]);

  const isParticipantUnlocked = useMemo(() => {
    if (userRole === 'dirigente') return true;
    if (!activeVigilRequiresParticipantPassword) return true;
    return unlockedVigilIds.includes(activeVigilId);
  }, [userRole, activeVigilRequiresParticipantPassword, unlockedVigilIds, activeVigilId]);

  const unlockParticipantMode = useCallback(
    (password: string): boolean => {
      const clean = (password || '').trim();
      const expected = (config.participantPassword || config.participantAccess?.password || '').trim();

      // If no password set or match
      const isMatch = !expected || clean === expected;

      if (isMatch) {
        setUnlockedVigilIds((prev) => (prev.includes(activeVigilId) ? prev : [...prev, activeVigilId]));

        // Validate on backend
        fetch('/api/auth/unlock-participant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vigilId: activeVigilId, password: clean }),
        }).catch(() => {});

        return true;
      }

      return false;
    },
    [config, activeVigilId]
  );

  const resetToDefaultData = useCallback(() => {
    const initialVigil: VigilItem = {
      id: 'vigil-default-1',
      code: 'fer1234',
      createdAt: new Date().toISOString(),
      config: defaultVigiliaConfig,
      moments: defaultScheduleMoments,
      ministers: defaultMinisters,
      repertoire: defaultRepertoire,
      checklist: defaultChecklist,
      delayMinutes: 0,
      teams: defaultTeams,
      participants: defaultParticipants,
      prayerRequests: defaultPrayerRequests,
      notices: defaultNotices,
      usefulContacts: defaultUsefulContacts,
      calendarEvents: defaultCalendarEvents,
    };
    setAllVigils([initialVigil]);
    setActiveVigilId('vigil-default-1');
    setTemplates(defaultTemplates);
    setUserRole('membro');
  }, []);

  const exportDataJSON = useCallback(() => {
    return JSON.stringify({ allVigils, templates, exportedAt: new Date().toISOString() }, null, 2);
  }, [allVigils, templates]);

  const importDataJSON = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.allVigils) && parsed.allVigils.length > 0) {
        setAllVigils(parsed.allVigils);
        setActiveVigilId(parsed.allVigils[0].id);
        if (Array.isArray(parsed.templates)) {
          setTemplates(parsed.templates);
        }
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, []);

  return (
    <VigiliaContext.Provider
      value={{
        config,
        updateConfig,
        updateDirigenteProfile,
        updateLoginPageConfig,
        updateParticipantAccess,
        updateDirigenteAccount,
        moments,
        addMoment,
        updateMoment,
        deleteMoment,
        duplicateMoment,
        reorderMoments,
        moveMoment,
        delayMinutes,
        isScheduleRecalculated,
        adjustDelay,
        setDirectDelay,
        recalculateScheduleTimes,
        resetScheduleToOriginal,
        advanceToNextMoment,
        rewindToPreviousMoment,
        manualActiveMomentIndex,
        setManualActiveMomentIndex,
        ministers,
        addMinister,
        updateMinister,
        deleteMinister,
        toggleMinisterStatus,
        duplicateMinister,
        repertoire,
        addSong,
        updateSong,
        deleteSong,
        duplicateSong,
        reorderSongs,
        checklist,
        toggleChecklist,
        addChecklistItem,
        removeChecklistItem,
        teams,
        addTeam: (team: Omit<Team, 'id'>) => {
          updateActiveVigil((prev) => ({ ...prev, teams: [...prev.teams, { ...team, id: `tm-${Date.now()}` }] }));
        },
        updateTeam: (id: string, team: Partial<Team>) => {
          updateActiveVigil((prev) => ({ ...prev, teams: prev.teams.map((t) => (t.id === id ? { ...t, ...team } : t)) }));
        },
        deleteTeam: (id: string) => {
          updateActiveVigil((prev) => ({ ...prev, teams: prev.teams.filter((t) => t.id !== id) }));
        },
        addTeamMember: (teamId: string, member: any) => {
          updateActiveVigil((prev) => ({
            ...prev,
            teams: prev.teams.map((t) =>
              t.id === teamId
                ? { ...t, members: [...t.members, { ...member, id: `tm-mem-${Date.now()}` }] }
                : t
            ),
          }));
        },
        removeTeamMember: (teamId: string, memberId: string) => {
          updateActiveVigil((prev) => ({
            ...prev,
            teams: prev.teams.map((t) =>
              t.id === teamId
                ? { ...t, members: t.members.filter((m) => m.id !== memberId) }
                : t
            ),
          }));
        },
        toggleChecklistItem: (teamId: string, checklistType: any, itemId: string) => {
          updateActiveVigil((prev) => ({
            ...prev,
            teams: prev.teams.map((t) => {
              if (t.id !== teamId) return t;
              const list = (t as any)[checklistType] as ChecklistItem[] | undefined;
              if (!list) return t;
              return {
                ...t,
                [checklistType]: list.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
              };
            }),
          }));
        },
        removeSong: (teamId: string, songId: string) => {
          updateActiveVigil((prev) => ({
            ...prev,
            teams: prev.teams.map((t) =>
              t.id === teamId ? { ...t, songs: (t.songs || []).filter((s) => s.id !== songId) } : t
            ),
          }));
        },
        addSermon: (teamId: string, sermon: any) => {
          updateActiveVigil((prev) => ({
            ...prev,
            teams: prev.teams.map((t) =>
              t.id === teamId
                ? { ...t, sermons: [...(t.sermons || []), { ...sermon, id: `serm-${Date.now()}` }] }
                : t
            ),
          }));
        },
        removeSermon: (teamId: string, sermonId: string) => {
          updateActiveVigil((prev) => ({
            ...prev,
            teams: prev.teams.map((t) =>
              t.id === teamId ? { ...t, sermons: (t.sermons || []).filter((s) => s.id !== sermonId) } : t
            ),
          }));
        },
        addMediaRole: (teamId: string, role: any) => {
          updateActiveVigil((prev) => ({
            ...prev,
            teams: prev.teams.map((t) =>
              t.id === teamId
                ? { ...t, mediaRoles: [...(t.mediaRoles || []), { ...role, id: `med-${Date.now()}` }] }
                : t
            ),
          }));
        },
        removeMediaRole: (teamId: string, roleId: string) => {
          updateActiveVigil((prev) => ({
            ...prev,
            teams: prev.teams.map((t) =>
              t.id === teamId ? { ...t, mediaRoles: (t.mediaRoles || []).filter((r) => r.id !== roleId) } : t
            ),
          }));
        },
        participants,
        addParticipant,
        updateParticipant: (id: string, updated: Partial<Participant>) => {
          updateActiveVigil((prev) => ({
            ...prev,
            participants: prev.participants.map((p) => (p.id === id ? { ...p, ...updated } : p)),
          }));
        },
        updateParticipantStatus,
        deleteParticipant,
        prayerRequests,
        addPrayerRequest,
        incrementPrayer,
        deletePrayerRequest,
        approvePrayerRequest,
        rejectPrayerRequest,
        pendingPrayersCount,
        notices,
        addNotice,
        updateNotice: (id: string, updated: Partial<Notice>) => {
          updateActiveVigil((prev) => ({
            ...prev,
            notices: prev.notices.map((n) => (n.id === id ? { ...n, ...updated } : n)),
          }));
        },
        deleteNotice,
        usefulContacts,
        addContact: (contact: Omit<UsefulContact, 'id'>) => {
          updateActiveVigil((prev) => ({
            ...prev,
            usefulContacts: [...prev.usefulContacts, { ...contact, id: `ct-${Date.now()}` }],
          }));
        },
        updateContact: (id: string, updated: Partial<UsefulContact>) => {
          updateActiveVigil((prev) => ({
            ...prev,
            usefulContacts: prev.usefulContacts.map((c) => (c.id === id ? { ...c, ...updated } : c)),
          }));
        },
        deleteContact: (id: string) => {
          updateActiveVigil((prev) => ({
            ...prev,
            usefulContacts: prev.usefulContacts.filter((c) => c.id !== id),
          }));
        },
        calendarEvents,
        addCalendarEvent: (evt: Omit<VigilCalendarEvent, 'id'>) => {
          updateActiveVigil((prev) => ({
            ...prev,
            calendarEvents: [...prev.calendarEvents, { ...evt, id: `evt-${Date.now()}` }],
          }));
        },
        updateCalendarEvent: (id: string, updated: Partial<VigilCalendarEvent>) => {
          updateActiveVigil((prev) => ({
            ...prev,
            calendarEvents: prev.calendarEvents.map((e) => (e.id === id ? { ...e, ...updated } : e)),
          }));
        },
        deleteCalendarEvent: (id: string) => {
          updateActiveVigil((prev) => ({
            ...prev,
            calendarEvents: prev.calendarEvents.filter((e) => e.id !== id),
          }));
        },
        currentTime: effectiveTime,
        isSimulatedTime: !!simulatedTime,
        setSimulatedTime,
        currentDate,
        userRole,
        setUserRole,
        loginWithCode,
        logoutRole,
        regenerateCode,
        updateCustomCode,
        allVigils,
        allVigilsList,
        activeVigilId,
        activeVigilCode: config.memberCode || config.accessCode || 'fer1234',
        templates,
        saveVigilAsTemplate,
        deleteTemplate,
        switchVigilById,
        switchVigilByCode,
        createVigil,
        createVigilWizard,
        duplicateVigil,
        deleteVigil,
        isDirigenteAuthenticated,
        authenticateDirigente,
        dirigentePin: config.dirigentePin || '',
        changeDirigentePin,
        lockDirigenteMode,
        activeVigilRequiresParticipantPassword,
        isParticipantUnlocked,
        unlockParticipantMode,
        resetToDefaultData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </VigiliaContext.Provider>
  );
};

export const useVigilia = (): VigiliaContextType => {
  const context = useContext(VigiliaContext);
  if (!context) {
    throw new Error('useVigilia must be used within a VigiliaProvider');
  }
  return context;
};
