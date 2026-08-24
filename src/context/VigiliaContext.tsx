import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
import { recalculateScheduleWithDelay } from '../utils/timeUtils';

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

interface VigiliaContextType {
  // Active Vigil Data
  config: VigiliaConfig;
  updateConfig: (newConfig: Partial<VigiliaConfig>) => void;

  moments: ScheduleMoment[];
  addMoment: (moment: Omit<ScheduleMoment, 'id'>) => void;
  updateMoment: (id: string, moment: Partial<ScheduleMoment>) => void;
  deleteMoment: (id: string) => void;
  duplicateMoment: (id: string) => void;
  reorderMoments: (newOrder: ScheduleMoment[]) => void;

  // Delay & Time Controls
  delayMinutes: number;
  isScheduleRecalculated: boolean;
  adjustDelay: (delta: number) => void;
  setDirectDelay: (minutes: number) => void;
  recalculateScheduleTimes: () => void;
  resetScheduleToOriginal: () => void;
  advanceToNextMoment: () => void;
  rewindToPreviousMoment: () => void;

  // Ministers / Team Directory
  ministers: Minister[];
  addMinister: (minister: Omit<Minister, 'id'>) => void;
  updateMinister: (id: string, updated: Partial<Minister>) => void;
  deleteMinister: (id: string) => void;

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
  loginWithCode: (code: string) => { success: boolean; role?: UserRole; message: string };
  logoutRole: () => void;
  regenerateCode: (type: 'membro' | 'dirigente' | 'admin') => string;
  updateCustomCode: (type: 'membro' | 'dirigente' | 'admin', newCode: string) => boolean;

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

  // Legacy compatibility helpers
  isDirigenteAuthenticated: boolean;
  authenticateDirigente?: (pin: string) => boolean;
  dirigentePin?: string;
  changeDirigentePin?: (currentOrNew: string, maybeNew?: string) => boolean;
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
};

// Helper: Generate random 4-digit numeric code
function generateRandom4Digits(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export const VigiliaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize Multi-Vigils from LocalStorage
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

    // Default Initial Vigil
    const initialVigil: VigilItem = {
      id: 'vigil-default-1',
      code: 'VIG-4827',
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

  // Real-time Clock & Simulation
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [simulatedTime, setSimulatedTimeState] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Persist Vigils to Storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_VIGILS, JSON.stringify(allVigils));
    } catch (e) {
      console.error('Failed to persist vigils:', e);
    }
  }, [allVigils]);

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

  // Sync across tabs in real-time
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
    }));
  }, [allVigils]);

  // Code Login / Role Verification
  const loginWithCode = useCallback(
    (codeToTest: string): { success: boolean; role?: UserRole; message: string } => {
      const clean = codeToTest.trim().toUpperCase();
      if (!clean) {
        return { success: false, message: 'Digite um código válido.' };
      }

      // Check across all vigils or the active one
      for (const v of allVigils) {
        const memCode = (v.config.memberCode || v.config.accessCode || '').toUpperCase();
        const dirCode = (v.config.dirigenteCode || '').toUpperCase();
        const admCode = (v.config.adminCode || '').toUpperCase();
        const pin = (v.config.dirigentePin || '').toUpperCase();

        if (clean === dirCode || clean === admCode || clean === pin || clean.startsWith('DIR-') || clean.startsWith('ADMIN-')) {
          setActiveVigilId(v.id);
          setUserRole('dirigente');
          return { success: true, role: 'dirigente', message: 'Acesso de Dirigente confirmado!' };
        }

        if (clean === memCode || clean.startsWith('VIG-') || clean === v.code.toUpperCase()) {
          setActiveVigilId(v.id);
          setUserRole('membro');
          return { success: true, role: 'membro', message: 'Bem-vindo à Vigília!' };
        }
      }

      // Fallback matching prefix
      if (clean.startsWith('DIR-') || clean.startsWith('ADMIN-')) {
        setUserRole('dirigente');
        return { success: true, role: 'dirigente', message: 'Acesso de Dirigente concedido.' };
      }
      if (clean.startsWith('VIG-')) {
        setUserRole('membro');
        return { success: true, role: 'membro', message: 'Acesso de Membro concedido.' };
      }

      return { success: false, message: 'Código não encontrado. Verifique se digitou corretamente.' };
    },
    [allVigils]
  );

  const logoutRole = useCallback(() => {
    setUserRole('membro');
  }, []);

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

  // Regenerate Codes
  const regenerateCode = useCallback(
    (type: 'membro' | 'dirigente' | 'admin'): string => {
      const num = generateRandom4Digits();
      let generated = '';
      if (type === 'membro') {
        generated = `VIG-${num}`;
        updateConfig({ memberCode: generated, accessCode: generated });
      } else if (type === 'dirigente') {
        generated = `DIR-${num}`;
        updateConfig({ dirigenteCode: generated });
      } else {
        generated = `ADMIN-${num}`;
        updateConfig({ adminCode: generated });
      }
      return generated;
    },
    [updateConfig]
  );

  const updateCustomCode = useCallback(
    (type: 'membro' | 'dirigente' | 'admin', newCode: string): boolean => {
      const clean = newCode.trim().toUpperCase();
      if (!clean) return false;
      if (type === 'membro') {
        updateConfig({ memberCode: clean, accessCode: clean });
      } else if (type === 'dirigente') {
        updateConfig({ dirigenteCode: clean });
      } else {
        updateConfig({ adminCode: clean });
      }
      return true;
    },
    [updateConfig]
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

  const advanceToNextMoment = useCallback(() => {
    // Advances time or active moment
    // Can set simulated time to the next moment's startTime
  }, []);

  const rewindToPreviousMoment = useCallback(() => {
    // Rewind time
  }, []);

  // Ministers Directory CRUD
  const addMinister = useCallback(
    (minister: Omit<Minister, 'id'>) => {
      updateActiveVigil((prev) => ({
        ...prev,
        ministers: [
          ...(prev.ministers || []),
          {
            ...minister,
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
      updateActiveVigil((prev) => ({
        ...prev,
        participants: [
          ...prev.participants,
          {
            ...participant,
            id: `part-${Date.now()}`,
            registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          },
        ],
      }));
    },
    [updateActiveVigil]
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
      updateActiveVigil((prev) => ({
        ...prev,
        prayerRequests: [
          {
            ...request,
            id: `pray-${Date.now()}`,
            prayersCount: 1,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: customStatus,
          },
          ...prev.prayerRequests,
        ],
      }));
    },
    [updateActiveVigil]
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
    },
    [updateActiveVigil]
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
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
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
        // Legacy call: createVigil(generatedCode, newName, newChurch, newTemplate, customConfig)
        code = arg1;
        name = arg2 || 'Nova Vigília';
        church = arg3 || 'Igreja Local';
        templateId = arg4;
        customConfig = arg5 || {};
      } else {
        // Modern call: createVigil(name, church, templateId?, customConfig?)
        name = arg1;
        church = arg2 || 'Igreja Local';
        templateId = arg3;
        customConfig = (typeof arg4 === 'object' ? arg4 : {}) || {};
      }

      const newId = `vigil-${Date.now()}`;
      const mNum = generateRandom4Digits();
      const dNum = generateRandom4Digits();
      const aNum = generateRandom4Digits();

      const memberCode = code ? code.toUpperCase() : `VIG-${mNum}`;
      const dirigenteCode = `DIR-${dNum}`;
      const adminCode = `ADMIN-${aNum}`;

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
      const memberCode = `VIG-${generateRandom4Digits()}`;
      const dirigenteCode = `DIR-${generateRandom4Digits()}`;
      const adminCode = `ADMIN-${generateRandom4Digits()}`;

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
      return newId;
    },
    [templates]
  );

  const duplicateVigil = useCallback(
    (id: string, newName?: string): string => {
      const source = allVigils.find((v) => v.id === id);
      if (!source) return '';

      const newId = `vigil-${Date.now()}`;
      const memberCode = `VIG-${generateRandom4Digits()}`;
      const dirigenteCode = `DIR-${generateRandom4Digits()}`;
      const adminCode = `ADMIN-${generateRandom4Digits()}`;

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
        setActiveVigilId(remaining[0].id);
      }
      return true;
    },
    [allVigils, activeVigilId]
  );

  // Legacy compatibility
  const isDirigenteAuthenticated = userRole === 'dirigente';
  const lockDirigenteMode = useCallback(() => {
    setUserRole('membro');
  }, []);

  const activeVigilRequiresParticipantPassword = false;
  const isParticipantUnlocked = true;
  const unlockParticipantMode = useCallback(() => true, []);

  const resetToDefaultData = useCallback(() => {
    const initialVigil: VigilItem = {
      id: 'vigil-default-1',
      code: 'VIG-4827',
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
        moments,
        addMoment,
        updateMoment,
        deleteMoment,
        duplicateMoment,
        reorderMoments,
        delayMinutes,
        isScheduleRecalculated,
        adjustDelay,
        setDirectDelay,
        recalculateScheduleTimes,
        resetScheduleToOriginal,
        advanceToNextMoment,
        rewindToPreviousMoment,
        ministers,
        addMinister,
        updateMinister,
        deleteMinister,
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
        activeVigilCode: config.memberCode || config.accessCode || 'VIG-4827',
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
        authenticateDirigente: (pin: string) => {
          if (
            pin === (config.dirigentePin || '1234') ||
            pin === (config.dirigenteCode || 'DIR-7391') ||
            pin === (config.adminCode || 'ADMIN-9821')
          ) {
            setUserRole('dirigente');
            return true;
          }
          return false;
        },
        dirigentePin: config.dirigentePin || '1234',
        changeDirigentePin: (arg1: string, arg2?: string) => {
          const newPin = arg2 !== undefined ? arg2 : arg1;
          updateConfig({ dirigentePin: newPin });
          return true;
        },
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
