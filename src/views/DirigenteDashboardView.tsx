import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  Music,
  User,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ChevronRight,
  Tv,
  Share2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown,
  Monitor,
  CheckCircle2,
  LogOut,
  Shield,
  FileText,
  Sliders,
  Settings,
  Key,
  Users,
  CheckSquare,
  History,
  FileDown,
  RefreshCw,
  Download,
  Upload,
  BookOpen,
  Calendar,
  MapPin,
  Flame,
  Search,
  ExternalLink,
  ChevronDown,
  QrCode,
  Check,
  Megaphone,
  HelpCircle,
  MoreVertical,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useVigilia } from '../context/VigiliaContext';
import {
  getCurrentMomentStatus,
  formatFullDate,
  calculateDurationMinutes,
  calculateTotalVigilProgress,
  getVigilDelayStatus,
  formatDurationHuman,
  addMinutesToTime,
} from '../utils/timeUtils';
import { ScheduleMoment, RepertoireSong, MomentType, Minister, MinisterRole, Participant } from '../types';
import { generateVigilOfficialPdf } from '../utils/pdfGenerator';

export const DirigenteDashboardView: React.FC<{
  onOpenProjector: () => void;
  onLogout: () => void;
}> = ({ onOpenProjector, onLogout }) => {
  const {
    config,
    updateConfig,
    moments,
    addMoment,
    updateMoment,
    deleteMoment,
    duplicateMoment,
    reorderMoments,
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
    delayMinutes,
    adjustDelay,
    recalculateScheduleTimes,
    resetScheduleToOriginal,
    advanceToNextMoment,
    rewindToPreviousMoment,
    currentTime,
    notices,
    addNotice,
    deleteNotice,
    participants,
    updateParticipantStatus,
    deleteParticipant,
    addParticipant,
    prayerRequests,
    approvePrayerRequest,
    rejectPrayerRequest,
    exportDataJSON,
    importDataJSON,
  } = useVigilia();

  const [activeTab, setActiveTab] = useState<'cronograma' | 'repertorio' | 'equipe' | 'pulpito' | 'configuracoes'>('cronograma');

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // QR Code Fullscreen Modal
  const [showQrModal, setShowQrModal] = useState(false);

  // Moment Add/Edit Modal
  const [showMomentModal, setShowMomentModal] = useState(false);
  const [editingMomentId, setEditingMomentId] = useState<string | null>(null);
  const [momentForm, setMomentForm] = useState<Partial<ScheduleMoment>>({
    title: '',
    type: 'oracao',
    startTime: '21:00',
    endTime: '21:30',
    responsible: '',
    description: '',
    scripture: '',
    useSlide: false,
    slideNotes: '',
    prayerMotives: '',
    sermonTopic: '',
    dynamicNotes: '',
    songsList: '',
  });

  // Song Add/Edit Modal
  const [showSongModal, setShowSongModal] = useState(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [songForm, setSongForm] = useState<Partial<RepertoireSong>>({
    title: '',
    artist: '',
    key: 'G',
    responsible: '',
    momentTitle: '',
    notes: '',
  });

  // Minister Add/Edit Modal
  const [showMinisterModal, setShowMinisterModal] = useState(false);
  const [editingMinisterId, setEditingMinisterId] = useState<string | null>(null);
  const [ministerForm, setMinisterForm] = useState<Partial<Minister>>({
    name: '',
    role: 'Pastor',
    phone: '',
    notes: '',
  });

  // Notice Add Form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeIsUrgent, setNoticeIsUrgent] = useState(false);

  // Participant Add Form
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantPhone, setNewParticipantPhone] = useState('');

  // General Settings Form
  const [settingsForm, setSettingsForm] = useState({ ...config });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // State for expanded moment in schedule list (click to see full details)
  const [expandedMomentId, setExpandedMomentId] = useState<string | null>(null);

  // Search in schedule
  const [scheduleSearch, setScheduleSearch] = useState('');

  // Live Moment Status
  const momentStatus = useMemo(() => {
    return getCurrentMomentStatus(moments, currentTime, config.startTime, config.endTime);
  }, [moments, currentTime, config.startTime, config.endTime]);

  const { activeMoment, nextMoment, upcomingMoments, progressPercent, minutesRemaining } = momentStatus;
  const thirdMoment = upcomingMoments.length > 0 ? upcomingMoments[0] : null;

  // Total Vigil Progress
  const totalProgress = useMemo(() => {
    return calculateTotalVigilProgress(currentTime, config.startTime, config.endTime);
  }, [currentTime, config.startTime, config.endTime]);

  // Delay Status Helper
  const delayStatus = useMemo(() => {
    return getVigilDelayStatus(delayMinutes);
  }, [delayMinutes]);

  // Recalculated vigil end forecast when delayed
  const recalculatedEndTime = useMemo(() => {
    if (delayMinutes === 0) return config.endTime;
    return addMinutesToTime(config.endTime, delayMinutes);
  }, [config.endTime, delayMinutes]);

  // Filtered Moments
  const filteredMoments = useMemo(() => {
    if (!scheduleSearch.trim()) return moments;
    const term = scheduleSearch.toLowerCase();
    return moments.filter(
      (m) =>
        m.title.toLowerCase().includes(term) ||
        (m.responsible && m.responsible.toLowerCase().includes(term)) ||
        (m.description && m.description.toLowerCase().includes(term))
    );
  }, [moments, scheduleSearch]);

  // Moments Handlers
  const handleOpenNewMoment = () => {
    setEditingMomentId(null);
    const lastMoment = moments[moments.length - 1];
    const newStart = lastMoment ? lastMoment.endTime : currentTime;
    const newEnd = addMinutesToTime(newStart, 20);

    setMomentForm({
      title: '',
      type: 'oracao',
      startTime: newStart,
      endTime: newEnd,
      responsible: ministers[0]?.name || '',
      description: '',
      scripture: '',
      useSlide: false,
      slideNotes: '',
      prayerMotives: '',
      sermonTopic: '',
      dynamicNotes: '',
      songsList: '',
    });
    setShowMomentModal(true);
  };

  const handleEditMoment = (m: ScheduleMoment) => {
    setEditingMomentId(m.id);
    setMomentForm({ ...m });
    setShowMomentModal(true);
  };

  const handleSaveMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momentForm.title || !momentForm.startTime || !momentForm.endTime) return;

    if (editingMomentId) {
      updateMoment(editingMomentId, momentForm);
    } else {
      addMoment(momentForm as Omit<ScheduleMoment, 'id'>);
    }
    setShowMomentModal(false);
  };

  // Repertoire Handlers
  const handleOpenNewSong = () => {
    setEditingSongId(null);
    setSongForm({
      title: '',
      artist: '',
      key: 'G',
      responsible: ministers.find((m) => m.role === 'Cantor' || m.role === 'Músico')?.name || '',
      momentTitle: '',
      notes: '',
    });
    setShowSongModal(true);
  };

  const handleEditSong = (s: RepertoireSong) => {
    setEditingSongId(s.id);
    setSongForm({ ...s });
    setShowSongModal(true);
  };

  const handleSaveSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songForm.title) return;

    if (editingSongId) {
      updateSong(editingSongId, songForm);
    } else {
      addSong(songForm);
    }
    setShowSongModal(false);
  };

  // Minister Handlers
  const handleOpenNewMinister = () => {
    setEditingMinisterId(null);
    setMinisterForm({
      name: '',
      role: 'Pastor',
      phone: '',
      notes: '',
    });
    setShowMinisterModal(true);
  };

  const handleEditMinister = (min: Minister) => {
    setEditingMinisterId(min.id);
    setMinisterForm({ ...min });
    setShowMinisterModal(true);
  };

  const handleSaveMinister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ministerForm.name) return;

    if (editingMinisterId) {
      updateMinister(editingMinisterId, ministerForm);
    } else {
      addMinister(ministerForm as Omit<Minister, 'id'>);
    }
    setShowMinisterModal(false);
  };

  // Add Notice Handler
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    addNotice({
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      isUrgent: noticeIsUrgent,
      category: 'pulpito',
    });

    setNoticeTitle('');
    setNoticeContent('');
    setNoticeIsUrgent(false);
  };

  // Add Participant Handler
  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim()) return;

    addParticipant({
      name: newParticipantName.trim(),
      phone: newParticipantPhone.trim(),
      status: 'confirmado',
    });

    setNewParticipantName('');
    setNewParticipantPhone('');
  };

  // Save Settings Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const memberLink = typeof window !== 'undefined' ? `${window.location.origin}` : '';

  const getWhatsAppShareText = () => {
    return (
      `⛪ *${config.churchName || 'Igreja Local'}*\n` +
      `🌙 *${config.vigilName || 'Vigília de Oração'}*\n` +
      (config.theme ? `Tema: _"${config.theme}"_\n` : '') +
      `📅 Data: ${formatFullDate(config.date)}\n` +
      `⏰ Horário: ${config.startTime} às ${config.endTime}\n` +
      `🔑 Código de Acesso: *${config.memberCode || config.accessCode}*\n\n` +
      `Acompanhe a programação, momentos e louvores em tempo real pelo link:\n${memberLink}`
    );
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(getWhatsAppShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const getMomentTypeIcon = (type: string) => {
    switch (type) {
      case 'louvor':
      case 'louvor_especial':
        return '🎵';
      case 'oracao':
      case 'intercessao':
        return '🙏';
      case 'pregacao':
        return '📖';
      case 'testemunho':
        return '💬';
      case 'dinamica':
        return '👥';
      case 'ceia':
        return '🍞';
      case 'pausa':
        return '☕';
      default:
        return '✨';
    }
  };

  return (
    <div id="dirigente-root" className="min-h-screen bg-[#0B0D10] text-[#F2F2F2] font-sans selection:bg-[#C9B27C]/30 pb-20">
      {/* ===================== TOP HEADER & STATUS BAR ===================== */}
      <header className="sticky top-0 z-40 bg-[#14171C]/95 backdrop-blur-md border-b border-[#292E36] px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Vigil Title */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C9B27C]/20 border border-[#C9B27C]/40 text-[#C9B27C] flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-[#F2F2F2] font-serif line-clamp-1">
                    {config.vigilName || 'Painel do Dirigente'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#0B0D10] border border-[#292E36] text-[10px] font-mono text-[#C9B27C]">
                    {config.dirigenteCode || 'DIR-7391'}
                  </span>
                </div>
                <p className="text-xs text-[#9FA4AD] line-clamp-1">{config.churchName || 'Igreja Local'}</p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={onOpenProjector}
                className="p-2 rounded-xl bg-[#0B0D10] text-[#C9B27C] border border-[#292E36] text-xs font-bold flex items-center gap-1"
                title="Modo Projetor"
              >
                <Tv className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-[#0B0D10] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]"
                title="Sair do Painel"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Status Indicators */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            {/* Status: NO HORÁRIO / ADIANTADO / ATRASADO */}
            <div className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-extrabold flex items-center gap-2 shadow-sm ${delayStatus.badgeClass}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${delayStatus.type === 'on_time' ? 'bg-emerald-400 animate-pulse' : delayStatus.type === 'early' ? 'bg-amber-400' : 'bg-rose-500 animate-ping'}`} />
              <span>{delayStatus.label}</span>
            </div>

            {/* Total Vigil Progress Display */}
            <div className="hidden sm:flex items-center gap-2 bg-[#0B0D10] px-3 py-1.5 rounded-xl border border-[#292E36] text-xs text-[#9FA4AD]">
              <span className="font-mono text-[#F2F2F2] font-semibold">{config.startTime} → {config.endTime}</span>
              <div className="w-20 h-2 bg-[#191D24] rounded-full overflow-hidden border border-[#292E36]">
                <div
                  className="h-full bg-[#C9B27C] rounded-full transition-all duration-700"
                  style={{ width: `${totalProgress.percent}%` }}
                />
              </div>
              <span className="font-mono font-bold text-[#C9B27C]">{totalProgress.percent}%</span>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onOpenProjector}
                className="px-3 py-1.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#C9B27C] border border-[#C9B27C]/30 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Modo Projetor</span>
              </button>
              <button
                onClick={() => generateVigilOfficialPdf({ config, moments, repertoire })}
                className="px-3 py-1.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <FileDown className="w-3.5 h-3.5 text-[#C9B27C]" />
                <span>PDF Oficial</span>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl bg-[#0B0D10] hover:bg-rose-950/40 text-[#9FA4AD] hover:text-rose-300 border border-[#292E36] transition"
                title="Sair do Painel"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===================== SUB-NAV TABS ===================== */}
      <nav className="bg-[#0E1116] border-b border-[#292E36] px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('cronograma')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'cronograma'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>📋 Cronograma ({moments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('repertorio')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'repertorio'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>🎵 Repertório ({repertoire.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('equipe')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'equipe'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>👤 Equipe & Presença ({ministers.length + participants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pulpito')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'pulpito'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📝 Notas & Púlpito ({notices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'configuracoes'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>⚙️ Configurações & QR Code</span>
          </button>
        </div>
      </nav>

      {/* ===================== MAIN GRID (DESKTOP 2-COLUMN) ===================== */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT / MAIN CONTENT AREA (7 COLUMNS) ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* TAB: CRONOGRAMA */}
            {activeTab === 'cronograma' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Search and Add Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#9FA4AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar no cronograma..."
                      value={scheduleSearch}
                      onChange={(e) => setScheduleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14171C] border border-[#292E36] text-[#F2F2F2] placeholder-[#9FA4AD]/40 text-xs focus:outline-none focus:border-[#C9B27C] transition"
                    />
                  </div>

                  <button
                    onClick={handleOpenNewMoment}
                    className="px-4 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#C9B27C]/10 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ ADICIONAR ATIVIDADE</span>
                  </button>
                </div>

                {/* Moments List */}
                <div className="space-y-2.5">
                  {filteredMoments.map((mom, index) => {
                    const isCurrent = activeMoment?.id === mom.id;
                    const isExpanded = expandedMomentId === mom.id;
                    const duration = calculateDurationMinutes(mom.startTime, mom.endTime, config.startTime);
                    const songsCount = mom.songsList ? mom.songsList.split('\n').filter((s) => s.trim().length > 0).length : 0;

                    return (
                      <div
                        key={mom.id}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isCurrent
                            ? 'bg-[#C9B27C]/10 border-[#C9B27C]/60 shadow-xl ring-1 ring-[#C9B27C]/30'
                            : 'bg-[#14171C] border-[#292E36] hover:border-[#C9B27C]/40'
                        }`}
                      >
                        {/* Compact Header Row (Click to toggle details) */}
                        <div
                          onClick={() => setExpandedMomentId(isExpanded ? null : mom.id)}
                          className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer hover:bg-[#191D24]/50 transition select-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-center min-w-[62px] bg-[#0B0D10] px-2 py-1.5 rounded-xl border border-[#292E36] shrink-0">
                              <span className={`font-mono text-xs font-bold block ${isCurrent ? 'text-[#C9B27C]' : 'text-[#F2F2F2]'}`}>
                                {mom.startTime}
                              </span>
                              <span className="text-[10px] text-[#9FA4AD] block font-mono">
                                → {mom.endTime}
                              </span>
                            </div>

                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`text-sm sm:text-base font-bold truncate ${isCurrent ? 'text-[#C9B27C]' : 'text-[#F2F2F2]'}`}>
                                  {getMomentTypeIcon(mom.type)} {mom.title}
                                </h3>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                                    🔴 AGORA
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs text-[#9FA4AD]">
                                <span className="font-mono text-[#F2F2F2]">{duration} min</span>
                                {mom.responsible && (
                                  <>
                                    <span>•</span>
                                    <span className="text-[#C9B27C] font-semibold truncate">👤 {mom.responsible}</span>
                                  </>
                                )}
                                {songsCount > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-[#9FA4AD] font-medium">🎵 {songsCount} louvor(es)</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#292E36]/60">
                            <span className="text-[11px] text-[#9FA4AD] hover:text-[#C9B27C] font-semibold flex items-center gap-1">
                              <span>{isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180 text-[#C9B27C]' : ''}`} />
                            </span>
                          </div>
                        </div>

                        {/* Expandable Details Section */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-[#292E36] bg-[#0B0D10]/50 space-y-3 text-xs">
                            {mom.description && (
                              <p className="text-[#9FA4AD] bg-[#0B0D10] p-3 rounded-xl border border-[#292E36] leading-relaxed">
                                {mom.description}
                              </p>
                            )}

                            {mom.scripture && (
                              <p className="text-xs font-serif italic text-[#C9B27C]">
                                📖 <strong>Texto Bíblico:</strong> {mom.scripture}
                              </p>
                            )}

                            {mom.sermonTopic && (
                              <p className="text-[#F2F2F2]"><strong className="text-[#9FA4AD]">Esboço / Tema:</strong> {mom.sermonTopic}</p>
                            )}

                            {mom.prayerMotives && (
                              <p className="text-[#C9B27C]"><strong className="text-[#9FA4AD]">Motivos de Oração:</strong> {mom.prayerMotives}</p>
                            )}

                            {mom.slideNotes && (
                              <p className="text-indigo-300"><strong className="text-[#9FA4AD]">Instruções de Mídia:</strong> {mom.slideNotes}</p>
                            )}

                            {mom.songsList && (
                              <div className="bg-[#0B0D10] p-2.5 rounded-xl border border-[#292E36]">
                                <span className="font-bold text-[#9FA4AD] block mb-1">Músicas deste momento:</span>
                                <pre className="font-sans text-xs text-[#F2F2F2] whitespace-pre-wrap">{mom.songsList}</pre>
                              </div>
                            )}

                            {/* Actions bar inside details */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#292E36]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditMoment(mom);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#14171C] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold transition"
                              >
                                Editar Atividade
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateMoment(mom.id);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#14171C] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] text-xs transition"
                              >
                                Duplicar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMoment(mom.id);
                                }}
                                className="p-1.5 rounded-lg bg-[#14171C] hover:bg-rose-950/40 text-[#9FA4AD] hover:text-rose-400 border border-[#292E36] text-xs transition"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: REPERTÓRIO */}
            {activeTab === 'repertorio' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-[#F2F2F2]">🎵 Repertório de Louvores</h2>
                    <p className="text-xs text-[#9FA4AD]">Adicione e organize as músicas da vigília com os tons musicais</p>
                  </div>
                  <button
                    onClick={handleOpenNewSong}
                    className="px-4 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold shadow-md transition"
                  >
                    + ADICIONAR LOUVOR
                  </button>
                </div>

                <div className="space-y-2.5">
                  {repertoire.length === 0 ? (
                    <div className="rounded-2xl bg-[#14171C] border border-[#292E36] p-8 text-center text-xs text-[#9FA4AD]">
                      Nenhum louvor cadastrado. Clique no botão acima para adicionar.
                    </div>
                  ) : (
                    repertoire.map((song, idx) => (
                      <div
                        key={song.id}
                        className="rounded-2xl bg-[#14171C] border border-[#292E36] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-[#0B0D10] text-[#C9B27C] border border-[#292E36] flex items-center justify-center font-mono font-bold text-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-[#F2F2F2]">{song.title}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9FA4AD] mt-0.5">
                              <span>{song.artist || 'Ministério de Louvor'}</span>
                              {song.responsible && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#C9B27C]">👤 {song.responsible}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#292E36]">
                          <span className="font-mono text-xs font-bold text-[#C9B27C] bg-[#0B0D10] px-3 py-1.5 rounded-xl border border-[#292E36]">
                            Tom {song.key}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditSong(song)}
                              className="p-1.5 rounded-lg bg-[#0B0D10] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteSong(song.id)}
                              className="p-1.5 rounded-lg bg-[#0B0D10] text-[#9FA4AD] hover:text-rose-400 border border-[#292E36]"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: EQUIPE & PRESENÇA */}
            {activeTab === 'equipe' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Ministers / Scaled Officers */}
                <div className="rounded-3xl bg-[#14171C] border border-[#292E36] p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#C9B27C]" />
                        <span>Escala de Ministros & Líderes</span>
                      </h2>
                      <p className="text-xs text-[#9FA4AD]">Pastores, cantores, intercessores e equipes escaladas</p>
                    </div>
                    <button
                      onClick={handleOpenNewMinister}
                      className="px-3.5 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold transition"
                    >
                      + Novo Ministro
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ministers.map((min) => (
                      <div
                        key={min.id}
                        className="rounded-2xl bg-[#0B0D10] border border-[#292E36] p-3.5 flex items-center justify-between gap-2 shadow-sm"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-[#F2F2F2]">{min.name}</h4>
                          <span className="text-[11px] text-[#C9B27C] font-semibold block">{min.role}</span>
                          {min.phone && <span className="text-[10px] text-[#9FA4AD] block font-mono">{min.phone}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditMinister(min)}
                            className="p-1.5 rounded-lg bg-[#14171C] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMinister(min.id)}
                            className="p-1.5 rounded-lg bg-[#14171C] text-[#9FA4AD] hover:text-rose-400 border border-[#292E36]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Presença / Check-in */}
                <div className="rounded-3xl bg-[#14171C] border border-[#292E36] p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        <span>Controle de Presença dos Participantes</span>
                      </h2>
                      <p className="text-xs text-[#9FA4AD]">
                        Total: {participants.length} inscritos • {participants.filter((p) => p.status === 'presente').length} presentes
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddParticipant} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nome do participante..."
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold shadow transition"
                    >
                      Registrar
                    </button>
                  </form>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {participants.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl bg-[#0B0D10] border border-[#292E36] p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-semibold text-[#F2F2F2]">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateParticipantStatus(p.id, p.status === 'presente' ? 'confirmado' : 'presente')
                            }
                            className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                              p.status === 'presente'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : 'bg-[#14171C] text-[#9FA4AD] border border-[#292E36]'
                            }`}
                          >
                            {p.status === 'presente' ? '✓ Presente' : 'Marcar Presença'}
                          </button>
                          <button
                            onClick={() => deleteParticipant(p.id)}
                            className="p-1 text-[#9FA4AD] hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NOTAS & PÚLPITO */}
            {activeTab === 'pulpito' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Notices form and list */}
                <div className="rounded-3xl bg-[#14171C] border border-[#292E36] p-5 space-y-4 shadow-xl">
                  <div>
                    <h2 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#C9B27C]" />
                      <span>Avisos de Púlpito & Alertas da Vigília</span>
                    </h2>
                    <p className="text-xs text-[#9FA4AD]">Exibidos no topo da tela para os participantes</p>
                  </div>

                  <form onSubmit={handleAddNotice} className="space-y-3 bg-[#0B0D10] p-4 rounded-2xl border border-[#292E36]">
                    <div>
                      <input
                        type="text"
                        placeholder="Título do aviso (ex: Estacionamento, Ceia, etc.)"
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#14171C] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={2}
                        placeholder="Mensagem do aviso..."
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#14171C] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-[#9FA4AD] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noticeIsUrgent}
                          onChange={(e) => setNoticeIsUrgent(e.target.checked)}
                          className="rounded bg-[#14171C] border-[#292E36] text-[#C9B27C]"
                        />
                        <span>Destacar como Aviso Urgente</span>
                      </label>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold transition"
                      >
                        Publicar Aviso
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2.5">
                    {notices.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-2xl bg-[#0B0D10] border border-[#292E36] p-3.5 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <h4 className="font-bold text-[#F2F2F2] flex items-center gap-2">
                            {n.isUrgent && <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 text-[10px] uppercase font-bold">Urgente</span>}
                            <span>{n.title}</span>
                          </h4>
                          <p className="text-[#9FA4AD] mt-1">{n.content}</p>
                        </div>
                        <button
                          onClick={() => deleteNotice(n.id)}
                          className="text-[#9FA4AD] hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Moderation of Prayer Requests */}
                <div className="rounded-3xl bg-[#14171C] border border-[#292E36] p-5 space-y-4 shadow-xl">
                  <div>
                    <h2 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#C9B27C]" />
                      <span>Moderação de Pedidos de Oração ({prayerRequests.length})</span>
                    </h2>
                    <p className="text-xs text-[#9FA4AD]">Aprove ou examine os motivos enviados pelos membros</p>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {prayerRequests.map((pr) => (
                      <div
                        key={pr.id}
                        className="rounded-xl bg-[#0B0D10] border border-[#292E36] p-3 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#F2F2F2]">{pr.authorName}</span>
                          <span className="text-[10px] text-[#C9B27C] font-mono">{pr.category}</span>
                        </div>
                        <p className="text-[#9FA4AD]">"{pr.request}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CONFIGURAÇÕES & QR CODE */}
            {activeTab === 'configuracoes' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Access Codes & Sharing Box */}
                <div className="rounded-3xl bg-[#14171C] border border-[#292E36] p-5 sm:p-6 space-y-5 shadow-xl">
                  <div>
                    <h2 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#C9B27C]" />
                      <span>👥 ACESSO DOS MEMBROS & COMPARTILHAMENTO</span>
                    </h2>
                    <p className="text-xs text-[#9FA4AD]">Divulgue o código para a igreja acompanhar a vigília pelo celular</p>
                  </div>

                  {/* Codes Display Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#0B0D10] p-4 rounded-2xl border border-[#292E36] space-y-2">
                      <span className="text-[11px] font-bold text-[#9FA4AD] uppercase tracking-wider block">
                        Código do Membro:
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xl font-extrabold text-[#C9B27C]">
                          {config.memberCode || config.accessCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(config.memberCode || config.accessCode, 'memberCode')}
                          className="px-3 py-1.5 rounded-lg bg-[#14171C] hover:bg-[#191D24] text-xs font-semibold text-[#F2F2F2] border border-[#292E36] flex items-center gap-1.5 transition"
                        >
                          {copiedKey === 'memberCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'memberCode' ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0B0D10] p-4 rounded-2xl border border-[#292E36] space-y-2">
                      <span className="text-[11px] font-bold text-[#9FA4AD] uppercase tracking-wider block">
                        Código do Dirigente:
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xl font-extrabold text-[#F2F2F2]">
                          {config.dirigenteCode || 'DIR-7391'}
                        </span>
                        <button
                          onClick={() => copyToClipboard(config.dirigenteCode || 'DIR-7391', 'dirigenteCode')}
                          className="px-3 py-1.5 rounded-lg bg-[#14171C] hover:bg-[#191D24] text-xs font-semibold text-[#F2F2F2] border border-[#292E36] flex items-center gap-1.5 transition"
                        >
                          {copiedKey === 'dirigenteCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'dirigenteCode' ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Share Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#292E36]">
                    <button
                      onClick={handleWhatsAppShare}
                      className="px-4 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 transition"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Compartilhar no WhatsApp</span>
                    </button>

                    <button
                      onClick={() => setShowQrModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#C9B27C] border border-[#C9B27C]/40 text-xs font-bold flex items-center gap-2 transition"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Gerar QR Code na Tela</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(memberLink, 'link')}
                      className="px-4 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold flex items-center gap-2 transition"
                    >
                      <Copy className="w-4 h-4 text-[#9FA4AD]" />
                      <span>{copiedKey === 'link' ? 'Link Copiado!' : 'Copiar Link Direto'}</span>
                    </button>
                  </div>
                </div>

                {/* Edit Vigil Info Form */}
                <div className="rounded-3xl bg-[#14171C] border border-[#292E36] p-5 sm:p-6 space-y-4 shadow-xl">
                  <h3 className="text-base font-bold text-[#F2F2F2]">Editar Dados da Vigília</h3>

                  <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#9FA4AD] block mb-1">Nome da Vigília:</label>
                        <input
                          type="text"
                          value={settingsForm.vigilName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, vigilName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#9FA4AD] block mb-1">Nome da Igreja:</label>
                        <input
                          type="text"
                          value={settingsForm.churchName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, churchName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-[#9FA4AD] block mb-1">Tema:</label>
                      <input
                        type="text"
                        value={settingsForm.theme}
                        onChange={(e) => setSettingsForm({ ...settingsForm, theme: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#9FA4AD] block mb-1">Versículo Chave:</label>
                        <input
                          type="text"
                          value={settingsForm.keyVerse}
                          onChange={(e) => setSettingsForm({ ...settingsForm, keyVerse: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#9FA4AD] block mb-1">Referência:</label>
                        <input
                          type="text"
                          value={settingsForm.verseReference}
                          onChange={(e) => setSettingsForm({ ...settingsForm, verseReference: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-[#9FA4AD] block mb-1">Data:</label>
                        <input
                          type="date"
                          value={settingsForm.date}
                          onChange={(e) => setSettingsForm({ ...settingsForm, date: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#9FA4AD] block mb-1">Horário Início:</label>
                        <input
                          type="time"
                          value={settingsForm.startTime}
                          onChange={(e) => setSettingsForm({ ...settingsForm, startTime: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#9FA4AD] block mb-1">Horário Fim:</label>
                        <input
                          type="time"
                          value={settingsForm.endTime}
                          onChange={(e) => setSettingsForm({ ...settingsForm, endTime: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#292E36]">
                      {settingsSaved ? (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Dados atualizados com sucesso!
                        </span>
                      ) : <span />}

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold transition shadow"
                      >
                        SALVAR DADOS
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* ================= RIGHT / STICKY LIVE CONTROLS PANEL (5 COLUMNS) ================= */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
            {/* 🔴 CARD 1: AGORA */}
            <div className="rounded-3xl bg-gradient-to-br from-[#191D24] via-[#14171C] to-[#0E1116] border-2 border-[#C9B27C]/50 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>🔴 AGORA</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#9FA4AD] bg-[#0B0D10] px-2 py-0.5 rounded border border-[#292E36]">
                  {currentTime}
                </span>
              </div>

              {activeMoment ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#F2F2F2] leading-tight">
                      {getMomentTypeIcon(activeMoment.type)} {activeMoment.title}
                    </h3>
                    {activeMoment.responsible && (
                      <p className="text-xs sm:text-sm font-semibold text-[#C9B27C] flex items-center gap-1.5 mt-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{activeMoment.responsible}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-[#0B0D10] px-2.5 py-1 rounded-lg border border-[#292E36] font-mono text-[#F2F2F2] font-semibold">
                      {activeMoment.startTime} → {activeMoment.endTime}
                    </span>
                    <span className="text-[#9FA4AD]">
                      ({formatDurationHuman(calculateDurationMinutes(activeMoment.startTime, activeMoment.endTime, config.startTime))})
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#9FA4AD]">Tempo restante</span>
                      <span className="text-[#C9B27C] font-mono font-bold">
                        {minutesRemaining > 0 ? `${minutesRemaining} min restantes` : 'Finalizando'}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#0B0D10] rounded-full overflow-hidden border border-[#292E36]">
                      <div
                        className="h-full bg-gradient-to-r from-[#C9B27C] to-[#E3D1A5] rounded-full transition-all duration-700"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Fast advance buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#292E36]">
                    <button
                      onClick={advanceToNextMoment}
                      className="flex-1 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-extrabold transition shadow"
                    >
                      Avançar para Próximo →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-[#9FA4AD]">
                  Nenhum momento ativo no momento exato ({currentTime}).
                </div>
              )}
            </div>

            {/* ⏭️ CARD 2: PRÓXIMO */}
            {nextMoment && (
              <div className="rounded-2xl bg-[#14171C] border border-[#292E36] p-4 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#9FA4AD] uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 text-[#C9B27C]" />
                    <span>⏭️ PRÓXIMO</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-[#C9B27C]">
                    {nextMoment.startTime} → {nextMoment.endTime}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#F2F2F2]">
                  {getMomentTypeIcon(nextMoment.type)} {nextMoment.title}
                </h4>
                {nextMoment.responsible && (
                  <p className="text-xs text-[#9FA4AD] flex items-center gap-1">
                    <span>Responsável:</span>
                    <strong className="text-[#C9B27C]">{nextMoment.responsible}</strong>
                  </p>
                )}
              </div>
            )}

            {/* ⏭️ CARD 3: DEPOIS */}
            {thirdMoment && (
              <div className="rounded-2xl bg-[#14171C]/70 border border-[#292E36] p-4 shadow space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#9FA4AD] uppercase tracking-wider">
                  <span>⏭️ DEPOIS</span>
                  <span className="font-mono text-xs font-semibold text-[#9FA4AD]">
                    {thirdMoment.startTime} → {thirdMoment.endTime}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#F2F2F2]">
                  {getMomentTypeIcon(thirdMoment.type)} {thirdMoment.title}
                </h4>
                {thirdMoment.responsible && (
                  <p className="text-[11px] text-[#9FA4AD]">
                    {thirdMoment.responsible}
                  </p>
                )}
              </div>
            )}

            {/* ⏱️ CONTROLE DE ATRASO */}
            <div className="rounded-3xl bg-[#14171C] border border-[#292E36] p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#F2F2F2] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#C9B27C]" />
                  <span>Controle de Atraso & Ajustes</span>
                </h3>
                <span className="text-[11px] font-mono font-bold text-[#C9B27C]">
                  {delayMinutes > 0 ? `+${delayMinutes} min` : `${delayMinutes} min`}
                </span>
              </div>

              {/* Quick delta buttons */}
              <div className="grid grid-cols-6 gap-1.5">
                {[-10, -5, -1, 1, 5, 10].map((delta) => (
                  <button
                    key={delta}
                    onClick={() => adjustDelay(delta)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                      delta > 0
                        ? 'bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border-rose-500/30'
                        : 'bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>

              {/* Recalculate & Reset actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#292E36]">
                <button
                  onClick={recalculateScheduleTimes}
                  className="py-2 px-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#C9B27C] border border-[#C9B27C]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>RECALCULAR</span>
                </button>
                <button
                  onClick={resetScheduleToOriginal}
                  className="py-2 px-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ORIGINAL</span>
                </button>
              </div>

              {/* Recalculated forecast notification */}
              {delayMinutes !== 0 && (
                <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#9FA4AD] space-y-1">
                  <div className="flex justify-between">
                    <span>Previsão de Término:</span>
                    <strong className="text-[#C9B27C] font-mono">{recalculatedEndTime}</strong>
                  </div>
                  <p className="text-[10px] text-[#9FA4AD]/80">
                    * Todos os horários seguintes foram reajustados para manter a duração das ministrações.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== FULLSCREEN QR CODE MODAL ===================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D10]/95 backdrop-blur-md">
          <div className="max-w-md w-full rounded-3xl bg-[#14171C] border-2 border-[#C9B27C]/50 p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-scaleUp">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-[#C9B27C] font-bold font-mono">
                {config.churchName || 'IGREJA LOCAL'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F2F2F2] font-serif">
                {config.vigilName || 'Vigília de Oração'}
              </h2>
              <p className="text-xs text-[#9FA4AD]">
                Aponte a câmera do celular para acessar a área do membro
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl border-4 border-[#C9B27C]">
              <QRCodeSVG
                value={memberLink}
                size={220}
                level="H"
                includeMargin={false}
                fgColor="#0B0D10"
                bgColor="#FFFFFF"
              />
            </div>

            <div className="bg-[#0B0D10] p-3 rounded-2xl border border-[#292E36] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#9FA4AD] tracking-wider block">Código do Membro</span>
              <span className="font-mono text-2xl font-black text-[#C9B27C] tracking-wider">
                {config.memberCode || config.accessCode}
              </span>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-xs shadow-lg transition"
            >
              Fechar Tela do QR Code
            </button>
          </div>
        </div>
      )}

      {/* ===================== MOMENT ADD/EDIT MODAL ===================== */}
      {showMomentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D10]/85 backdrop-blur-md">
          <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-[#14171C] border border-[#292E36] p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
              <h3 className="text-base font-bold text-[#F2F2F2]">
                {editingMomentId ? 'Editar Atividade' : 'Adicionar Atividade ao Cronograma'}
              </h3>
              <button
                onClick={() => setShowMomentModal(false)}
                className="text-[#9FA4AD] hover:text-[#F2F2F2] text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSaveMoment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Título da Atividade:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Momento de Louvor, Clamor pelas Famílias..."
                  value={momentForm.title}
                  onChange={(e) => setMomentForm({ ...momentForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1">Tipo:</label>
                  <select
                    value={momentForm.type}
                    onChange={(e) => setMomentForm({ ...momentForm, type: e.target.value as MomentType })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  >
                    <option value="oracao">🙏 Oração</option>
                    <option value="louvor">🎵 Louvor</option>
                    <option value="pregacao">📖 Pregação</option>
                    <option value="testemunho">💬 Testemunho</option>
                    <option value="dinamica">👥 Dinâmica</option>
                    <option value="ceia">🍞 Santa Ceia</option>
                    <option value="pausa">☕ Pausa / Café</option>
                    <option value="aviso">📢 Avisos</option>
                    <option value="outro">✨ Outro</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1">Início:</label>
                  <input
                    type="time"
                    required
                    value={momentForm.startTime}
                    onChange={(e) => setMomentForm({ ...momentForm, startTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1">Término:</label>
                  <input
                    type="time"
                    required
                    value={momentForm.endTime}
                    onChange={(e) => setMomentForm({ ...momentForm, endTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Responsável / Ministério:</label>
                <input
                  type="text"
                  placeholder="Nome do pastor, cantor ou equipe..."
                  value={momentForm.responsible}
                  onChange={(e) => setMomentForm({ ...momentForm, responsible: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Texto Bíblico Base (opcional):</label>
                <input
                  type="text"
                  placeholder="Ex: Filipenses 4:6-7"
                  value={momentForm.scripture}
                  onChange={(e) => setMomentForm({ ...momentForm, scripture: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Notas de Púlpito / Instruções (privado do dirigente):</label>
                <textarea
                  rows={2}
                  placeholder="Orientações de púlpito, transição de louvor ou avisos internos..."
                  value={momentForm.prayerMotives || momentForm.sermonTopic || momentForm.description}
                  onChange={(e) => setMomentForm({ ...momentForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setShowMomentModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0B0D10] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold shadow"
                >
                  Salvar Atividade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== SONG ADD/EDIT MODAL ===================== */}
      {showSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D10]/85 backdrop-blur-md">
          <div className="max-w-md w-full rounded-3xl bg-[#14171C] border border-[#292E36] p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
              <h3 className="text-base font-bold text-[#F2F2F2]">
                {editingSongId ? 'Editar Louvor' : 'Adicionar Louvor ao Repertório'}
              </h3>
              <button
                onClick={() => setShowSongModal(false)}
                className="text-[#9FA4AD] hover:text-[#F2F2F2] text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSaveSong} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Nome do Louvor:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Porque Ele Vive, Bondade de Deus..."
                  value={songForm.title}
                  onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1">Cantor / Ministério:</label>
                  <input
                    type="text"
                    placeholder="Ex: Harpa Cristã, Fernandinho..."
                    value={songForm.artist}
                    onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1">Tom Musical (Key):</label>
                  <input
                    type="text"
                    placeholder="Ex: G, C, D, Em, F#m..."
                    value={songForm.key}
                    onChange={(e) => setSongForm({ ...songForm, key: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs font-mono font-bold text-[#C9B27C]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Dirigente / Responsável pelo Louvor:</label>
                <input
                  type="text"
                  placeholder="Nome do solista ou grupo..."
                  value={songForm.responsible}
                  onChange={(e) => setSongForm({ ...songForm, responsible: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setShowSongModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#0B0D10] text-[#9FA4AD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold shadow"
                >
                  Salvar Louvor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MINISTER ADD/EDIT MODAL ===================== */}
      {showMinisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D10]/85 backdrop-blur-md">
          <div className="max-w-md w-full rounded-3xl bg-[#14171C] border border-[#292E36] p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
              <h3 className="text-base font-bold text-[#F2F2F2]">
                {editingMinisterId ? 'Editar Ministro' : 'Cadastrar Ministro na Escala'}
              </h3>
              <button
                onClick={() => setShowMinisterModal(false)}
                className="text-[#9FA4AD] hover:text-[#F2F2F2] text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSaveMinister} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Nome:</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do irmão(ã)..."
                  value={ministerForm.name}
                  onChange={(e) => setMinisterForm({ ...ministerForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Função / Ministério:</label>
                <select
                  value={ministerForm.role}
                  onChange={(e) => setMinisterForm({ ...ministerForm, role: e.target.value as MinisterRole })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                >
                  <option value="Pastor">Pastor</option>
                  <option value="Pregador">Pregador</option>
                  <option value="Dirigente">Dirigente</option>
                  <option value="Cantor">Cantor / Solista</option>
                  <option value="Músico">Músico / Instrumentista</option>
                  <option value="Intercessor">Intercessor / Oração</option>
                  <option value="Testemunho">Testemunho</option>
                  <option value="Recepção">Recepção</option>
                  <option value="Equipe de Café">Equipe de Café / Ceia</option>
                  <option value="Mídia / Som">Mídia / Telão / Som</option>
                  <option value="Equipe de Apoio">Equipe de Apoio</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Telefone (opcional):</label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={ministerForm.phone}
                  onChange={(e) => setMinisterForm({ ...ministerForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setShowMinisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#0B0D10] text-[#9FA4AD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold shadow"
                >
                  Salvar Ministro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
