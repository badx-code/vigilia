import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useVigilia } from '../context/VigiliaContext';
import { getCurrentMomentStatus, formatFullDate } from '../utils/timeUtils';
import { ScheduleMoment, RepertoireSong, MomentType, Minister, MinisterRole } from '../types';
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
    currentTime,
    allVigils,
    activeVigilId,
    switchVigilById,
    duplicateVigil,
    deleteVigil,
    templates,
    saveVigilAsTemplate,
    deleteTemplate,
    createVigilWizard,
    regenerateCode,
    updateCustomCode,
    exportDataJSON,
    importDataJSON,
  } = useVigilia();

  const [activeTab, setActiveTab] = useState<
    'ao_vivo' | 'cronograma' | 'repertorio' | 'pulpito' | 'equipe' | 'checklist' | 'wizard' | 'historico' | 'configuracoes'
  >('ao_vivo');

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Schedule Modal State
  const [showMomentModal, setShowMomentModal] = useState(false);
  const [editingMomentId, setEditingMomentId] = useState<string | null>(null);
  const [momentForm, setMomentForm] = useState<Partial<ScheduleMoment>>({
    title: '',
    type: 'oracao',
    startTime: '21:00',
    endTime: '21:15',
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

  // Repertoire Modal State
  const [showSongModal, setShowSongModal] = useState(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [songForm, setSongForm] = useState<Partial<RepertoireSong>>({
    title: '',
    artist: '',
    key: 'C',
    responsible: '',
    momentTitle: '',
    notes: '',
  });

  // Minister Modal State
  const [showMinisterModal, setShowMinisterModal] = useState(false);
  const [editingMinisterId, setEditingMinisterId] = useState<string | null>(null);
  const [ministerForm, setMinisterForm] = useState<Partial<Minister>>({
    name: '',
    role: 'Pastor',
    phone: '',
    notes: '',
  });

  // Checklist New Item State
  const [newChecklistText, setNewChecklistText] = useState('');

  // General Settings Form State
  const [settingsForm, setSettingsForm] = useState({ ...config });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Template Save State
  const [newTemplateName, setNewTemplateName] = useState('');
  const [templateSavedMsg, setTemplateSavedMsg] = useState(false);

  // Wizard State (6 steps)
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    templateId: templates[0]?.id || 'tpl-trad-1',
    name: 'Grande Vigília de Oração',
    church: config.churchName || 'Igreja Local',
    theme: 'Uma Noite com Deus',
    verse: 'Clama a mim, e responder-te-ei...',
    verseRef: 'Jeremias 33:3',
    date: new Date().toISOString().split('T')[0],
    startTime: '21:00',
    endTime: '05:00',
    location: 'Templo Central',
    city: config.city || '',
  });
  const [wizardSuccessId, setWizardSuccessId] = useState<string | null>(null);

  // Calculate Live Moment Status
  const momentStatus = useMemo(() => {
    return getCurrentMomentStatus(moments, currentTime, config.startTime, config.endTime);
  }, [moments, currentTime, config.startTime, config.endTime]);

  const { activeMoment, nextMoment, upcomingMoments, progressPercent, minutesRemaining } = momentStatus;

  // Search filter for schedule
  const [scheduleSearch, setScheduleSearch] = useState('');
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

  // Handlers for Moments
  const handleOpenNewMoment = () => {
    setEditingMomentId(null);
    setMomentForm({
      title: '',
      type: 'oracao',
      startTime: currentTime,
      endTime: '22:00',
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

  const handleMoveMoment = (index: number, direction: 'up' | 'down') => {
    const newMoments = [...moments];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newMoments.length) return;

    const temp = newMoments[index];
    newMoments[index] = newMoments[targetIndex];
    newMoments[targetIndex] = temp;
    reorderMoments(newMoments);
  };

  // Handlers for Songs
  const handleOpenNewSong = () => {
    setEditingSongId(null);
    setSongForm({
      title: '',
      artist: '',
      key: 'C',
      responsible: '',
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

  // Handlers for Ministers
  const handleOpenNewMinister = () => {
    setEditingMinisterId(null);
    setMinisterForm({ name: '', role: 'Pastor', phone: '', notes: '' });
    setShowMinisterModal(true);
  };

  const handleEditMinister = (m: Minister) => {
    setEditingMinisterId(m.id);
    setMinisterForm({ ...m });
    setShowMinisterModal(true);
  };

  const handleSaveMinister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ministerForm.name?.trim()) return;

    if (editingMinisterId) {
      updateMinister(editingMinisterId, ministerForm);
    } else {
      addMinister(ministerForm as Omit<Minister, 'id'>);
    }
    setShowMinisterModal(false);
  };

  // Handlers for Checklist
  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    addChecklistItem(newChecklistText.trim());
    setNewChecklistText('');
  };

  // Handlers for Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Handlers for Templates
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    saveVigilAsTemplate(newTemplateName.trim());
    setNewTemplateName('');
    setTemplateSavedMsg(true);
    setTimeout(() => setTemplateSavedMsg(false), 2500);
  };

  // Handlers for Wizard
  const handleFinishWizard = () => {
    const newId = createVigilWizard(wizardData);
    setWizardSuccessId(newId);
    setActiveTab('cronograma');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `👑 *VIGÍLIA DE ORAÇÃO: ${config.vigilName}*\n⛪ ${config.churchName}\n📅 ${formatFullDate(config.date)} às ${config.startTime}\n\n👥 *Código do Membro:* ${config.memberCode || config.accessCode}\n👑 *Código do Dirigente:* ${config.dirigenteCode || 'DIR-7391'}\n\nAcesse: ${window.location.origin}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDownloadPdf = () => {
    generateVigilOfficialPdf({
      config,
      moments,
      repertoire,
      includeRepertoire: true,
    });
  };

  return (
    <div id="dirigente-dashboard-root" className="min-h-screen bg-[#0B0D10] text-[#F2F2F2] pb-16 font-sans">
      {/* Header Banner */}
      <header className="bg-[#14171C] border-b border-[#292E36] px-4 py-3.5 sticky top-[33px] z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#C9B27C] text-[#0B0D10] font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Shield className="w-3.5 h-3.5" />
                Área do Dirigente
              </span>
              <h2 className="text-sm sm:text-base font-bold text-[#F2F2F2] truncate">
                {config.vigilName || 'Vigília de Oração'}
              </h2>
            </div>
            <p className="text-[11px] text-[#9FA4AD] mt-0.5">
              {config.churchName} • {formatFullDate(config.date)}
            </p>
          </div>

          {/* Quick Access Badges & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Dirigente Code Badge */}
            <div className="flex items-center gap-1.5 bg-[#0B0D10] px-2.5 py-1 rounded-lg border border-[#C9B27C]/40 text-xs">
              <span className="text-[10px] text-[#9FA4AD]">👑 Liderança:</span>
              <span className="font-mono font-bold text-[#C9B27C]">{config.dirigenteCode || 'DIR-7391'}</span>
              <button
                onClick={() => copyToClipboard(config.dirigenteCode || 'DIR-7391', 'dir-header')}
                className="text-[#9FA4AD] hover:text-[#F2F2F2] p-0.5"
                title="Copiar Código"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>

            {/* Member Code Badge */}
            <div className="flex items-center gap-1.5 bg-[#0B0D10] px-2.5 py-1 rounded-lg border border-[#292E36] text-xs">
              <span className="text-[10px] text-[#9FA4AD]">👥 Membro:</span>
              <span className="font-mono font-bold text-[#F2F2F2]">{config.memberCode || config.accessCode}</span>
              <button
                onClick={() => copyToClipboard(config.memberCode || config.accessCode, 'mem-header')}
                className="text-[#9FA4AD] hover:text-[#F2F2F2] p-0.5"
                title="Copiar Código"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              id="btn-open-projector-dirigente"
              onClick={onOpenProjector}
              className="px-2.5 py-1 rounded-lg bg-[#C9B27C]/15 hover:bg-[#C9B27C]/25 text-[#C9B27C] border border-[#C9B27C]/30 text-xs font-bold flex items-center gap-1 transition"
              title="Abrir Telão / Projetor"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Telão</span>
            </button>

            <button
              id="btn-download-pdf-dirigente"
              onClick={handleDownloadPdf}
              className="px-2.5 py-1 rounded-lg bg-[#191D24] hover:bg-[#20252e] text-[#F2F2F2] border border-[#292E36] text-xs font-medium flex items-center gap-1 transition"
              title="Baixar Programação em PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-[#C9B27C]" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              id="btn-share-whatsapp-dirigente"
              onClick={handleShareWhatsApp}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 transition"
              title="Compartilhar no WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              id="btn-logout-dirigente"
              onClick={onLogout}
              className="px-2.5 py-1 rounded-lg bg-[#0B0D10] hover:bg-rose-950/30 text-[#9FA4AD] hover:text-rose-300 border border-[#292E36] text-xs font-medium flex items-center gap-1 transition"
              title="Sair para Área do Membro"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Pills Bar */}
      <nav id="dirigente-nav-tabs" className="sticky top-[86px] z-20 bg-[#0B0D10]/95 backdrop-blur-md border-b border-[#292E36] px-2 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-start sm:justify-center gap-1.5 min-w-max max-w-6xl mx-auto px-2">
          <button
            id="tab-dir-ao-vivo"
            onClick={() => setActiveTab('ao_vivo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'ao_vivo'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${activeTab === 'ao_vivo' ? 'text-[#0B0D10] animate-pulse' : 'text-[#C9B27C]'}`} />
            Ao Vivo
          </button>

          <button
            id="tab-dir-cronograma"
            onClick={() => setActiveTab('cronograma')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'cronograma'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Cronograma ({moments.length})
          </button>

          <button
            id="tab-dir-repertorio"
            onClick={() => setActiveTab('repertorio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'repertorio'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Repertório ({repertoire.length})
          </button>

          <button
            id="tab-dir-pulpito"
            onClick={() => setActiveTab('pulpito')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'pulpito'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Púlpito & Mídia
          </button>

          <button
            id="tab-dir-equipe"
            onClick={() => setActiveTab('equipe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'equipe'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Equipe ({ministers.length})
          </button>

          <button
            id="tab-dir-checklist"
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Checklist ({checklist.filter((c) => c.done).length}/{checklist.length})
          </button>

          <button
            id="tab-dir-wizard"
            onClick={() => setActiveTab('wizard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'wizard'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9B27C]" />
            Nova Vigília
          </button>

          <button
            id="tab-dir-historico"
            onClick={() => setActiveTab('historico')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'historico'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Histórico ({allVigils.length})
          </button>

          <button
            id="tab-dir-configuracoes"
            onClick={() => setActiveTab('configuracoes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'configuracoes'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Configurações & Códigos
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        {/* ===================== TAB: AO VIVO ===================== */}
        {activeTab === 'ao_vivo' && (
          <div id="section-dirigente-ao-vivo" className="space-y-6">
            {/* Real-time Delay Control Panel */}
            <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#292E36]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${delayMinutes > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F2F2F2]">Controle de Horário & Atraso</h3>
                    <p className="text-xs text-[#9FA4AD]">
                      Ajuste atrasos e o sistema recalcula toda a grade automaticamente
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#9FA4AD] block">Atraso Atual:</span>
                    <span className={`text-lg font-mono font-bold ${delayMinutes > 0 ? 'text-amber-400' : delayMinutes < 0 ? 'text-blue-400' : 'text-emerald-400'}`}>
                      {delayMinutes > 0 ? `+${delayMinutes} min` : delayMinutes < 0 ? `${delayMinutes} min` : 'No Horário (0 min)'}
                    </span>
                  </div>

                  {delayMinutes !== 0 && (
                    <button
                      onClick={resetScheduleToOriginal}
                      className="px-3 py-1.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurar Grade
                    </button>
                  )}
                </div>
              </div>

              {/* Delay Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#9FA4AD] mr-2">Adicionar / Reduzir Atraso:</span>
                <button
                  onClick={() => adjustDelay(-10)}
                  className="px-3 py-1.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-blue-300 border border-[#292E36] text-xs font-mono font-bold transition"
                >
                  -10 min
                </button>
                <button
                  onClick={() => adjustDelay(-5)}
                  className="px-3 py-1.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-blue-300 border border-[#292E36] text-xs font-mono font-bold transition"
                >
                  -5 min
                </button>
                <button
                  onClick={() => adjustDelay(5)}
                  className="px-3 py-1.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-amber-300 border border-[#292E36] text-xs font-mono font-bold transition"
                >
                  +5 min
                </button>
                <button
                  onClick={() => adjustDelay(10)}
                  className="px-3 py-1.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-amber-300 border border-[#292E36] text-xs font-mono font-bold transition"
                >
                  +10 min
                </button>
                <button
                  onClick={() => adjustDelay(15)}
                  className="px-3 py-1.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-amber-300 border border-[#292E36] text-xs font-mono font-bold transition"
                >
                  +15 min
                </button>
                <button
                  onClick={() => adjustDelay(30)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition"
                >
                  +30 min
                </button>
              </div>
            </div>

            {/* Active & Next Moment Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card: Agora */}
              <div className="p-5 rounded-2xl bg-[#14171C] border border-[#C9B27C]/50 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#C9B27C] text-[#0B0D10] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#0B0D10] animate-ping" />
                    Acontecendo Agora
                  </span>
                  <span className="text-xs font-mono text-[#C9B27C] font-bold">
                    {activeMoment ? `${activeMoment.startTime} - ${activeMoment.endTime}` : '--:--'}
                  </span>
                </div>

                {activeMoment ? (
                  <div className="space-y-3">
                    <h4 className="text-xl font-bold text-[#F2F2F2]">{activeMoment.title}</h4>
                    {activeMoment.responsible && (
                      <p className="text-xs text-[#C9B27C] flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5" />
                        {activeMoment.responsible}
                      </p>
                    )}

                    {activeMoment.scripture && (
                      <p className="text-xs italic text-[#9FA4AD] bg-[#0B0D10] p-2.5 rounded-xl border border-[#292E36]">
                        📖 {activeMoment.scripture}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] text-[#9FA4AD]">
                        <span>Progresso do Momento</span>
                        <span>{minutesRemaining} min restantes</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#0B0D10] overflow-hidden border border-[#292E36]">
                        <div
                          className="h-full bg-[#C9B27C] transition-all duration-500 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-[#9FA4AD] text-xs">
                    Nenhuma atividade em andamento no momento atual ({currentTime}).
                  </div>
                )}
              </div>

              {/* Card: Próximo Momento */}
              <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#191D24] text-[#9FA4AD] text-[10px] font-extrabold uppercase tracking-wider">
                    A Seguir
                  </span>
                  <span className="text-xs font-mono text-[#9FA4AD] font-bold">
                    {nextMoment ? `${nextMoment.startTime} - ${nextMoment.endTime}` : '--:--'}
                  </span>
                </div>

                {nextMoment ? (
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-[#F2F2F2]">{nextMoment.title}</h4>
                    {nextMoment.responsible && (
                      <p className="text-xs text-[#9FA4AD] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#C9B27C]" />
                        {nextMoment.responsible}
                      </p>
                    )}

                    {nextMoment.description && (
                      <p className="text-xs text-[#9FA4AD] line-clamp-2">
                        {nextMoment.description}
                      </p>
                    )}

                    {nextMoment.useSlide && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                        <Tv className="w-3 h-3" /> Usa Slide no Telão
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-[#9FA4AD] text-xs">
                    Fim da programação ou nenhuma atividade subsequente.
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Sequence Preview */}
            <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-3">
              <h4 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C9B27C]" />
                Sequência das Próximas Atividades
              </h4>

              <div className="space-y-2">
                {upcomingMoments.slice(0, 4).map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-[#0B0D10] border border-[#292E36] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[#C9B27C] font-bold">{m.startTime}</span>
                      <span className="font-bold text-[#F2F2F2]">{m.title}</span>
                      {m.responsible && <span className="text-[#9FA4AD]">({m.responsible})</span>}
                    </div>
                    <span className="text-[11px] text-[#9FA4AD]">{m.endTime}</span>
                  </div>
                ))}

                {upcomingMoments.length === 0 && (
                  <p className="text-xs text-[#9FA4AD] py-4 text-center">Nenhum momento posterior.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: CRONOGRAMA ===================== */}
        {activeTab === 'cronograma' && (
          <div id="section-dirigente-cronograma" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#F2F2F2]">Programação Completa</h3>
                <p className="text-xs text-[#9FA4AD]">
                  Adicione, edite, altere horários e reordene todas as atividades da vigília
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9FA4AD]" />
                  <input
                    type="text"
                    placeholder="Filtrar momento..."
                    value={scheduleSearch}
                    onChange={(e) => setScheduleSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-[#14171C] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  />
                </div>

                <button
                  id="btn-add-moment-dirigente"
                  onClick={handleOpenNewMoment}
                  className="px-3.5 py-1.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold flex items-center gap-1.5 shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  Nova Atividade
                </button>
              </div>
            </div>

            {/* List of Moments */}
            <div className="space-y-2.5">
              {filteredMoments.map((moment, index) => (
                <div
                  key={moment.id}
                  className="p-4 rounded-xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#0B0D10] border border-[#292E36] min-w-[70px]">
                      <span className="text-xs font-mono font-bold text-[#C9B27C]">{moment.startTime}</span>
                      <span className="text-[10px] font-mono text-[#9FA4AD]">{moment.endTime}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#F2F2F2]">{moment.title}</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#0B0D10] text-[#9FA4AD] border border-[#292E36] text-[10px] uppercase font-bold">
                          {moment.type}
                        </span>
                        {moment.useSlide && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                            Slide
                          </span>
                        )}
                      </div>

                      {moment.responsible && (
                        <p className="text-xs text-[#C9B27C] flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {moment.responsible}
                        </p>
                      )}

                      {moment.description && (
                        <p className="text-xs text-[#9FA4AD] line-clamp-1">{moment.description}</p>
                      )}

                      {moment.scripture && (
                        <p className="text-[11px] italic text-[#9FA4AD]">📖 {moment.scripture}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 self-end md:self-center">
                    <button
                      onClick={() => handleMoveMoment(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] disabled:opacity-30 border border-[#292E36]"
                      title="Subir na Ordem"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveMoment(index, 'down')}
                      disabled={index === filteredMoments.length - 1}
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] disabled:opacity-30 border border-[#292E36]"
                      title="Descer na Ordem"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => duplicateMoment(moment.id)}
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]"
                      title="Duplicar Momento"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEditMoment(moment)}
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#C9B27C] border border-[#292E36]"
                      title="Editar Atividade"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMoment(moment.id)}
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-rose-950/40 text-rose-400 border border-[#292E36]"
                      title="Excluir Atividade"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredMoments.length === 0 && (
                <div className="text-center py-12 bg-[#14171C] rounded-2xl border border-[#292E36]">
                  <p className="text-xs text-[#9FA4AD]">Nenhuma atividade encontrada.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: REPERTÓRIO ===================== */}
        {activeTab === 'repertorio' && (
          <div id="section-dirigente-repertorio" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#F2F2F2]">Repertório de Louvores</h3>
                <p className="text-xs text-[#9FA4AD]">
                  Gerencie as músicas, tons musicais, cantores e momentos de adoração
                </p>
              </div>

              <button
                id="btn-add-song-dirigente"
                onClick={handleOpenNewSong}
                className="px-3.5 py-1.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold flex items-center gap-1.5 shadow-md transition self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Adicionar Louvor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {repertoire.map((song, idx) => (
                <div
                  key={song.id}
                  className="p-4 rounded-xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/30 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0B0D10] border border-[#292E36] flex flex-col items-center justify-center font-bold text-[#C9B27C] shrink-0">
                      <span className="text-xs font-mono">{song.key || 'C'}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#F2F2F2]">{song.title}</h4>
                      <p className="text-xs text-[#9FA4AD]">{song.artist || 'Artista não informado'}</p>
                      {song.responsible && (
                        <p className="text-[11px] text-[#C9B27C] mt-0.5">Vocal: {song.responsible}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateSong(song.id)}
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] border border-[#292E36]"
                      title="Duplicar Louvor"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEditSong(song)}
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#C9B27C] border border-[#292E36]"
                      title="Editar Louvor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSong(song.id)}
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-rose-950/40 text-rose-400 border border-[#292E36]"
                      title="Excluir Louvor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {repertoire.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-[#14171C] rounded-2xl border border-[#292E36]">
                  <p className="text-xs text-[#9FA4AD]">Nenhum louvor cadastrado.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: PÚLPITO & MÍDIA ===================== */}
        {activeTab === 'pulpito' && (
          <div id="section-dirigente-pulpito" className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#F2F2F2]">Notas de Púlpito, Palavra & Mídia</h3>
              <p className="text-xs text-[#9FA4AD]">
                Visão detalhada de todas as pregações, motivos de clamor, dinâmicas e projeções
              </p>
            </div>

            {/* Grid of operational moments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moments.map((moment) => (
                <div
                  key={moment.id}
                  className="p-4 rounded-xl bg-[#14171C] border border-[#292E36] space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-[#292E36] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#C9B27C]">
                        {moment.startTime} - {moment.endTime}
                      </span>
                      <span className="text-xs font-bold text-[#F2F2F2]">{moment.title}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#9FA4AD]">{moment.type}</span>
                  </div>

                  {moment.responsible && (
                    <p className="text-xs text-[#C9B27C] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Responsável: {moment.responsible}
                    </p>
                  )}

                  {moment.scripture && (
                    <div className="p-2.5 rounded-lg bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]">
                      <span className="text-[#C9B27C] font-bold block mb-0.5">Texto Bíblico:</span>
                      {moment.scripture}
                    </div>
                  )}

                  {moment.sermonTopic && (
                    <div className="p-2.5 rounded-lg bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]">
                      <span className="text-[#C9B27C] font-bold block mb-0.5">Tema / Esboço da Palavra:</span>
                      {moment.sermonTopic}
                    </div>
                  )}

                  {moment.prayerMotives && (
                    <div className="p-2.5 rounded-lg bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]">
                      <span className="text-rose-400 font-bold block mb-0.5">Motivos de Oração / Clamor:</span>
                      {moment.prayerMotives}
                    </div>
                  )}

                  {moment.useSlide && (
                    <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200">
                      <span className="font-bold flex items-center gap-1 text-blue-400 mb-0.5">
                        <Tv className="w-3 h-3" /> Projeção / Telão:
                      </span>
                      {moment.slideNotes || 'Projetar versículos e apoio visual no telão.'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB: EQUIPE & MINISTROS ===================== */}
        {activeTab === 'equipe' && (
          <div id="section-dirigente-equipe" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#F2F2F2]">Diretório da Liderança & Voluntários</h3>
                <p className="text-xs text-[#9FA4AD]">
                  Cadastre pastores, pregadores, cantores, músicos e equipes de apoio
                </p>
              </div>

              <button
                id="btn-add-minister-dirigente"
                onClick={handleOpenNewMinister}
                className="px-3.5 py-1.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold flex items-center gap-1.5 shadow-md transition self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Membro da Equipe
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ministers.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl bg-[#14171C] border border-[#292E36] flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-[#0B0D10] border border-[#292E36] text-[#C9B27C] text-[10px] font-bold uppercase">
                        {m.role}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditMinister(m)}
                          className="p-1 rounded bg-[#0B0D10] text-[#9FA4AD] hover:text-[#F2F2F2]"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteMinister(m.id)}
                          className="p-1 rounded bg-[#0B0D10] text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-[#F2F2F2]">{m.name}</h4>
                    {m.phone && <p className="text-xs text-[#9FA4AD]">📞 {m.phone}</p>}
                    {m.notes && <p className="text-[11px] text-[#9FA4AD] line-clamp-2">{m.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB: CHECKLIST ===================== */}
        {activeTab === 'checklist' && (
          <div id="section-dirigente-checklist" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#F2F2F2]">Checklist Operacional</h3>
                <p className="text-xs text-[#9FA4AD]">
                  Verificação de itens pré-vigília (som, projetor, escala, água e recepção)
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-[#14171C] border border-[#292E36] text-xs font-mono font-bold text-[#C9B27C]">
                Concluídos: {checklist.filter((c) => c.done).length} de {checklist.length}
              </span>
            </div>

            {/* Add New Item Form */}
            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <input
                type="text"
                placeholder="Adicionar novo item ao checklist..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#14171C] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold transition"
              >
                Adicionar
              </button>
            </form>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    item.done
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-[#9FA4AD]'
                      : 'bg-[#14171C] border-[#292E36] text-[#F2F2F2] hover:border-[#C9B27C]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        item.done ? 'bg-emerald-500 border-emerald-500 text-[#0B0D10]' : 'border-[#292E36]'
                      }`}
                    >
                      {item.done && <CheckCircle2 className="w-3.5 h-3.5 font-bold" />}
                    </div>
                    <span className={`text-xs ${item.done ? 'line-through text-[#9FA4AD]' : 'font-medium'}`}>
                      {item.text}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChecklistItem(item.id);
                    }}
                    className="p-1 text-[#9FA4AD] hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB: WIZARD / CRIAR VIGÍLIA ===================== */}
        {activeTab === 'wizard' && (
          <div id="section-dirigente-wizard" className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold text-[#C9B27C] uppercase tracking-wider">Passo {wizardStep} de 6</span>
              <h3 className="text-lg font-bold text-[#F2F2F2]">Assistente de Criação de Vigília</h3>
              <p className="text-xs text-[#9FA4AD]">
                Configure rapidamente uma nova vigília com cronograma completo pré-definido
              </p>
            </div>

            {/* Step 1: Model Choice */}
            {wizardStep === 1 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#F2F2F2] block">Escolha o Modelo Inicial:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => setWizardData({ ...wizardData, templateId: tpl.id })}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        wizardData.templateId === tpl.id
                          ? 'bg-[#C9B27C]/15 border-[#C9B27C]'
                          : 'bg-[#0B0D10] border-[#292E36] hover:border-[#C9B27C]/30'
                      }`}
                    >
                      <h4 className="text-sm font-bold text-[#F2F2F2]">{tpl.name}</h4>
                      <p className="text-xs text-[#9FA4AD] mt-1">{tpl.description}</p>
                      <span className="text-[10px] font-mono text-[#C9B27C] mt-2 block">
                        {tpl.moments.length} atividades pré-programadas
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Church & Event Name */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Nome da Igreja / Ministério</label>
                  <input
                    type="text"
                    value={wizardData.church}
                    onChange={(e) => setWizardData({ ...wizardData, church: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Título da Vigília</label>
                  <input
                    type="text"
                    value={wizardData.name}
                    onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Theme & Key Verse */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Tema Principal</label>
                  <input
                    type="text"
                    value={wizardData.theme}
                    onChange={(e) => setWizardData({ ...wizardData, theme: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Versículo Chave</label>
                  <textarea
                    rows={2}
                    value={wizardData.verse}
                    onChange={(e) => setWizardData({ ...wizardData, verse: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Referência Bíblica</label>
                  <input
                    type="text"
                    value={wizardData.verseRef}
                    onChange={(e) => setWizardData({ ...wizardData, verseRef: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Date & Times */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Data do Evento</label>
                  <input
                    type="date"
                    value={wizardData.date}
                    onChange={(e) => setWizardData({ ...wizardData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Horário de Início</label>
                    <input
                      type="time"
                      value={wizardData.startTime}
                      onChange={(e) => setWizardData({ ...wizardData, startTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Horário de Término</label>
                    <input
                      type="time"
                      value={wizardData.endTime}
                      onChange={(e) => setWizardData({ ...wizardData, endTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Location */}
            {wizardStep === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Local / Templo</label>
                  <input
                    type="text"
                    value={wizardData.location}
                    onChange={(e) => setWizardData({ ...wizardData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Cidade / Estado</label>
                  <input
                    type="text"
                    value={wizardData.city}
                    onChange={(e) => setWizardData({ ...wizardData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Confirmation */}
            {wizardStep === 6 && (
              <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-2 text-xs">
                <h4 className="font-bold text-[#C9B27C]">Resumo da Nova Vigília:</h4>
                <p><span className="text-[#9FA4AD]">Igreja:</span> {wizardData.church}</p>
                <p><span className="text-[#9FA4AD]">Título:</span> {wizardData.name}</p>
                <p><span className="text-[#9FA4AD]">Tema:</span> {wizardData.theme}</p>
                <p><span className="text-[#9FA4AD]">Horário:</span> {wizardData.startTime} às {wizardData.endTime}</p>
                <p><span className="text-[#9FA4AD]">Local:</span> {wizardData.location} - {wizardData.city}</p>
                <p className="text-emerald-400 font-bold mt-2">
                  ✓ Novos códigos DIR-xxxx e VIG-xxxx serão gerados automaticamente.
                </p>
              </div>
            )}

            {/* Wizard Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-[#292E36]">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((s) => s - 1)}
                  className="px-4 py-2 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] text-xs font-bold border border-[#292E36]"
                >
                  Voltar
                </button>
              ) : <div />}

              {wizardStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((s) => s + 1)}
                  className="px-5 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold"
                >
                  Próximo Passo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishWizard}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0B0D10] text-xs font-extrabold shadow-lg"
                >
                  Criar Vigília Agora
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: HISTÓRICO & MODELOS ===================== */}
        {activeTab === 'historico' && (
          <div id="section-dirigente-historico" className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#F2F2F2]">Vigílias Criadas & Modelos</h3>
              <p className="text-xs text-[#9FA4AD]">
                Alterne entre vigílias, duplique eventos anteriores ou salve a grade atual como modelo
              </p>
            </div>

            {/* Save Current as Template Form */}
            <form onSubmit={handleSaveTemplate} className="p-4 rounded-xl bg-[#14171C] border border-[#292E36] space-y-3">
              <h4 className="text-xs font-bold text-[#C9B27C] uppercase tracking-wider">
                Salvar Vigília Atual como Modelo Reutilizável
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome do Modelo (ex: Vigília dos Jovens de Férias)..."
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold"
                >
                  Salvar Modelo
                </button>
              </div>
              {templateSavedMsg && (
                <p className="text-xs text-emerald-400">✓ Modelo salvo com sucesso!</p>
              )}
            </form>

            {/* List of all Vigils */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#9FA4AD] uppercase tracking-wider">Todas as Vigílias:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allVigils.map((v) => {
                  const isActive = v.id === activeVigilId;
                  return (
                    <div
                      key={v.id}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 ${
                        isActive
                          ? 'bg-[#C9B27C]/15 border-[#C9B27C]'
                          : 'bg-[#14171C] border-[#292E36] hover:border-[#C9B27C]/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-[#F2F2F2]">{v.config.vigilName}</span>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded bg-[#C9B27C] text-[#0B0D10] text-[10px] font-extrabold">
                              Ativa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#9FA4AD]">{v.config.churchName} • {v.config.date}</p>
                        <div className="flex items-center gap-2 mt-2 font-mono text-[11px]">
                          <span className="text-[#C9B27C]">👑 {v.config.dirigenteCode || 'DIR'}</span>
                          <span className="text-[#9FA4AD]">•</span>
                          <span className="text-[#F2F2F2]">👥 {v.config.memberCode || v.code}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#292E36]">
                        {!isActive && (
                          <button
                            onClick={() => switchVigilById(v.id)}
                            className="flex-1 py-1.5 rounded-lg bg-[#C9B27C] text-[#0B0D10] text-xs font-bold"
                          >
                            Ativar Esta Vigília
                          </button>
                        )}
                        <button
                          onClick={() => duplicateVigil(v.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#0B0D10] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] text-xs font-medium"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {allVigils.length > 1 && (
                          <button
                            onClick={() => deleteVigil(v.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#0B0D10] text-rose-400 hover:text-rose-300 border border-[#292E36] text-xs font-medium"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: CONFIGURAÇÕES & CÓDIGOS ===================== */}
        {activeTab === 'configuracoes' && (
          <div id="section-dirigente-configuracoes" className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#F2F2F2]">Configurações Gerais & Códigos</h3>
              <p className="text-xs text-[#9FA4AD]">
                Gerencie os códigos de acesso da liderança e dos membros, dados da igreja e opções
              </p>
            </div>

            {/* Access Codes Manager Card */}
            <div className="p-5 rounded-2xl bg-[#14171C] border border-[#C9B27C]/40 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-[#C9B27C] flex items-center gap-2">
                <Key className="w-4 h-4" />
                Gerenciador de Códigos de Acesso
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dirigente Code */}
                <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#C9B27C]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#C9B27C] block">👑 Código do Dirigente (Privado)</span>
                      <span className="text-[10px] text-[#9FA4AD]">Dá acesso total a esta área de liderança</span>
                    </div>
                    <button
                      onClick={() => regenerateCode('dirigente')}
                      className="px-2 py-1 rounded bg-[#14171C] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-medium flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Gerar Novo
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config.dirigenteCode || ''}
                      onChange={(e) => updateCustomCode('dirigente', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#14171C] border border-[#292E36] font-mono font-bold text-[#C9B27C] text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(config.dirigenteCode || '', 'dirigente-tab')}
                      className="px-3 py-2 rounded-xl bg-[#14171C] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-bold"
                    >
                      {copiedKey === 'dirigente-tab' ? '✓' : 'Copiar'}
                    </button>
                  </div>
                </div>

                {/* Member Code */}
                <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#F2F2F2] block">👥 Código do Membro (Público)</span>
                      <span className="text-[10px] text-[#9FA4AD]">Para visualização apenas, sem edição</span>
                    </div>
                    <button
                      onClick={() => regenerateCode('membro')}
                      className="px-2 py-1 rounded bg-[#14171C] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-medium flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Gerar Novo
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config.memberCode || config.accessCode || ''}
                      onChange={(e) => updateCustomCode('membro', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#14171C] border border-[#292E36] font-mono font-bold text-[#F2F2F2] text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(config.memberCode || config.accessCode || '', 'member-tab')}
                      className="px-3 py-2 rounded-xl bg-[#14171C] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-bold"
                    >
                      {copiedKey === 'member-tab' ? '✓' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* General Info Form */}
            <form onSubmit={handleSaveSettings} className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
              <h4 className="text-sm font-bold text-[#F2F2F2]">Dados Gerais do Evento</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Título da Vigília</label>
                  <input
                    type="text"
                    value={settingsForm.vigilName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, vigilName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Igreja / Congregação</label>
                  <input
                    type="text"
                    value={settingsForm.churchName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, churchName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Tema Principal</label>
                  <input
                    type="text"
                    value={settingsForm.theme}
                    onChange={(e) => setSettingsForm({ ...settingsForm, theme: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Data</label>
                  <input
                    type="date"
                    value={settingsForm.date}
                    onChange={(e) => setSettingsForm({ ...settingsForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Horário de Início</label>
                  <input
                    type="time"
                    value={settingsForm.startTime}
                    onChange={(e) => setSettingsForm({ ...settingsForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Horário de Término</label>
                  <input
                    type="time"
                    value={settingsForm.endTime}
                    onChange={(e) => setSettingsForm({ ...settingsForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#F2F2F2] block mb-1">Versículo Chave</label>
                <textarea
                  rows={2}
                  value={settingsForm.keyVerse}
                  onChange={(e) => setSettingsForm({ ...settingsForm, keyVerse: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {settingsSaved ? (
                  <span className="text-xs text-emerald-400 font-bold">✓ Configurações salvas com sucesso!</span>
                ) : <div />}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold shadow-md"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Modal: Adicionar/Editar Momento */}
      {showMomentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D10]/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#14171C] border border-[#292E36] p-5 shadow-2xl my-8">
            <form onSubmit={handleSaveMoment} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
                <h4 className="text-base font-bold text-[#F2F2F2]">
                  {editingMomentId ? 'Editar Atividade' : 'Nova Atividade no Cronograma'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowMomentModal(false)}
                  className="text-[#9FA4AD] hover:text-[#F2F2F2]"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-[#F2F2F2]">Título da Atividade</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Clamor pelas Famílias, Louvor Congregacional..."
                  value={momentForm.title || ''}
                  onChange={(e) => setMomentForm({ ...momentForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2]">Tipo</label>
                  <select
                    value={momentForm.type || 'oracao'}
                    onChange={(e) => setMomentForm({ ...momentForm, type: e.target.value as MomentType })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  >
                    <option value="oracao">Oração</option>
                    <option value="louvor">Louvor</option>
                    <option value="pregacao">Pregação</option>
                    <option value="testemunho">Testemunho</option>
                    <option value="dinamica">Dinâmica</option>
                    <option value="ceia">Ceia</option>
                    <option value="intercessao">Intercessão</option>
                    <option value="aviso">Aviso</option>
                    <option value="pausa">Pausa / Café</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#F2F2F2]">Horário Início</label>
                  <input
                    type="time"
                    required
                    value={momentForm.startTime || ''}
                    onChange={(e) => setMomentForm({ ...momentForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#F2F2F2]">Horário Fim</label>
                  <input
                    type="time"
                    required
                    value={momentForm.endTime || ''}
                    onChange={(e) => setMomentForm({ ...momentForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#F2F2F2]">Responsável / Ministro</label>
                <input
                  type="text"
                  placeholder="Ex: Pr. Carlos, Ministério Adoração Viva"
                  value={momentForm.responsible || ''}
                  onChange={(e) => setMomentForm({ ...momentForm, responsible: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#F2F2F2]">Texto Bíblico / Leitura</label>
                <input
                  type="text"
                  placeholder="Ex: Salmos 121:1-2"
                  value={momentForm.scripture || ''}
                  onChange={(e) => setMomentForm({ ...momentForm, scripture: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
              </div>

              {/* Internal Notes */}
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-3">
                <span className="text-[11px] font-bold text-[#C9B27C] block">
                  Notas Internas do Dirigente / Púlpito
                </span>

                <div>
                  <label className="text-[11px] text-[#9FA4AD] block mb-1">Esboço / Tema da Palavra:</label>
                  <input
                    type="text"
                    value={momentForm.sermonTopic || ''}
                    onChange={(e) => setMomentForm({ ...momentForm, sermonTopic: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#14171C] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#9FA4AD] block mb-1">Motivos de Oração / Clamor:</label>
                  <input
                    type="text"
                    value={momentForm.prayerMotives || ''}
                    onChange={(e) => setMomentForm({ ...momentForm, prayerMotives: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#14171C] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="chk-slide"
                    checked={!!momentForm.useSlide}
                    onChange={(e) => setMomentForm({ ...momentForm, useSlide: e.target.checked })}
                    className="rounded border-[#292E36]"
                  />
                  <label htmlFor="chk-slide" className="text-xs text-[#F2F2F2]">
                    Exibir Projeção / Slide no Telão
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMomentModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] text-xs font-bold border border-[#292E36]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold shadow-md"
                >
                  Salvar Atividade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar/Editar Louvor */}
      {showSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D10]/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#14171C] border border-[#292E36] p-5 shadow-2xl">
            <form onSubmit={handleSaveSong} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
                <h4 className="text-base font-bold text-[#F2F2F2]">
                  {editingSongId ? 'Editar Louvor' : 'Novo Louvor no Repertório'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowSongModal(false)}
                  className="text-[#9FA4AD] hover:text-[#F2F2F2]"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-[#F2F2F2]">Nome da Música</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bondade de Deus, Porque Ele Vive..."
                  value={songForm.title || ''}
                  onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2]">Cantor / Ministério</label>
                  <input
                    type="text"
                    placeholder="Ex: Isaías Saad, Harpa"
                    value={songForm.artist || ''}
                    onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2]">Tom Musical</label>
                  <input
                    type="text"
                    placeholder="Ex: C, G, D, Em, F#m"
                    value={songForm.key || ''}
                    onChange={(e) => setSongForm({ ...songForm, key: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#F2F2F2]">Vocalista / Responsável</label>
                <input
                  type="text"
                  placeholder="Ex: Sarah Beatriz, Ministério Jovem"
                  value={songForm.responsible || ''}
                  onChange={(e) => setSongForm({ ...songForm, responsible: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSongModal(false)}
                  className="flex-1 py-2 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] text-xs font-bold border border-[#292E36]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold"
                >
                  Salvar Louvor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar/Editar Ministro */}
      {showMinisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D10]/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#14171C] border border-[#292E36] p-5 shadow-2xl">
            <form onSubmit={handleSaveMinister} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
                <h4 className="text-base font-bold text-[#F2F2F2]">
                  {editingMinisterId ? 'Editar Membro da Equipe' : 'Cadastrar Membro da Equipe'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowMinisterModal(false)}
                  className="text-[#9FA4AD] hover:text-[#F2F2F2]"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-[#F2F2F2]">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pr. Carlos Eduardo"
                  value={ministerForm.name || ''}
                  onChange={(e) => setMinisterForm({ ...ministerForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#F2F2F2]">Função / Cargo</label>
                  <select
                    value={ministerForm.role || 'Pastor'}
                    onChange={(e) => setMinisterForm({ ...ministerForm, role: e.target.value as MinisterRole })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  >
                    <option value="Pastor">Pastor</option>
                    <option value="Pregador">Pregador</option>
                    <option value="Dirigente">Dirigente</option>
                    <option value="Cantor">Cantor</option>
                    <option value="Músico">Músico</option>
                    <option value="Intercessor">Intercessor</option>
                    <option value="Testemunho">Testemunho</option>
                    <option value="Recepção">Recepção</option>
                    <option value="Equipe de Café">Equipe de Café</option>
                    <option value="Equipe de Apoio">Equipe de Apoio</option>
                    <option value="Mídia / Som">Mídia / Som</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#F2F2F2]">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={ministerForm.phone || ''}
                    onChange={(e) => setMinisterForm({ ...ministerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#F2F2F2]">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Responsável pelo louvor de abertura"
                  value={ministerForm.notes || ''}
                  onChange={(e) => setMinisterForm({ ...ministerForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMinisterModal(false)}
                  className="flex-1 py-2 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] text-xs font-bold border border-[#292E36]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
