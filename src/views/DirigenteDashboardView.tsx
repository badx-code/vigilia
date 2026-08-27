import React, { useState, useMemo } from 'react';
import {
  Clock,
  Music,
  User,
  Plus,
  Trash2,
  Edit2,
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
  Church,
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
  Lock,
  Link2,
  Layout,
  UserCheck,
  Eye,
  X,
} from 'lucide-react';
import { useVigilia } from '../context/VigiliaContext';
import {
  getCurrentMomentStatus,
  calculateDurationMinutes,
  calculateTotalVigilProgress,
  getVigilDelayStatus,
  formatDurationHuman,
  addMinutesToTime,
} from '../utils/timeUtils';
import { generateVigilOfficialPdf } from '../utils/pdfGenerator';
import { DashboardOverviewSection } from '../components/dashboard/DashboardOverviewSection';
import { VigilSettingsSection } from '../components/dashboard/VigilSettingsSection';
import { DirigenteProfileSection } from '../components/dashboard/DirigenteProfileSection';
import { ScheduleManagerSection } from '../components/dashboard/ScheduleManagerSection';
import { MinistersManagerSection } from '../components/dashboard/MinistersManagerSection';
import { ParticipantsManagerSection } from '../components/dashboard/ParticipantsManagerSection';
import { PrayersNoticesSection } from '../components/dashboard/PrayersNoticesSection';
import { RepertoireManagerSection } from '../components/dashboard/RepertoireManagerSection';
import { LoginPageCustomizerSection } from '../components/dashboard/LoginPageCustomizerSection';
import { SecurityAccessSection } from '../components/dashboard/SecurityAccessSection';
import { MemberView } from './MemberView';

export type DashboardTab =
  | 'visao_geral'
  | 'cronograma'
  | 'vigilia'
  | 'dirigente'
  | 'equipe'
  | 'participantes'
  | 'oracoes_avisos'
  | 'repertorio'
  | 'login_personalizacao'
  | 'seguranca';

export const DirigenteDashboardView: React.FC<{
  onOpenProjector: () => void;
  onLogout: () => void;
  onOpenMemberView?: () => void;
}> = ({ onOpenProjector, onLogout, onOpenMemberView }) => {
  const {
    config,
    moments,
    ministers,
    repertoire,
    checklist,
    toggleChecklist,
    addChecklistItem,
    removeChecklistItem,
    delayMinutes,
    adjustDelay,
    resetScheduleToOriginal,
    advanceToNextMoment,
    rewindToPreviousMoment,
    currentTime,
    exportDataJSON,
    importDataJSON,
    prayerRequests,
    participants,
  } = useVigilia();

  const [activeTab, setActiveTab] = useState<DashboardTab>('visao_geral');
  const [showPublicPreviewModal, setShowPublicPreviewModal] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Live Moment Status
  const momentStatus = useMemo(() => {
    return getCurrentMomentStatus(moments, currentTime, config.startTime, config.endTime);
  }, [moments, currentTime, config.startTime, config.endTime]);

  const { activeMoment, nextMoment, upcomingMoments, progressPercent, minutesRemaining } = momentStatus;

  // Delay Status Helper
  const delayStatus = useMemo(() => {
    return getVigilDelayStatus(delayMinutes);
  }, [delayMinutes]);

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    addChecklistItem(newChecklistText.trim());
    setNewChecklistText('');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          alert('Dados da vigília importados com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F2F2F2] flex flex-col selection:bg-[#C9B27C]/30 pb-16">
      {/* ===================== TOP HEADER BAR ===================== */}
      <header className="bg-[#14171C] border-b border-[#292E36] sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Title & Church Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C9B27C]/10 border border-[#C9B27C]/30 flex items-center justify-center text-[#C9B27C] shrink-0">
                <Shield className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-[#F2F2F2] truncate max-w-[200px] sm:max-w-md">
                    {config.vigilName}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#C9B27C]/20 border border-[#C9B27C]/40 text-[#C9B27C] text-[10px] font-extrabold uppercase">
                    Dirigente
                  </span>
                </div>
                <p className="text-[11px] text-[#9FA4AD] truncate max-w-[220px] sm:max-w-md">
                  {config.churchName} {config.ministryName ? `• ${config.ministryName}` : ''}
                </p>
              </div>
            </div>

            {/* Quick Utility Actions */}
            <div className="flex items-center gap-2">
              {/* Sync Status Badge */}
              <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold border bg-emerald-950/40 text-emerald-300 border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Sincronizado</span>
              </div>

              <button
                onClick={() => setShowPublicPreviewModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#C9B27C] border border-[#C9B27C]/40 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                title="Pré-visualizar a tela pública que os membros estão vendo"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Página Pública</span>
              </button>

              <button
                onClick={onOpenProjector}
                className="px-3 py-1.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold flex items-center gap-1.5 transition"
                title="Abrir tela cheia para projetor ou TV da igreja"
              >
                <Tv className="w-3.5 h-3.5 text-[#C9B27C]" />
                <span className="hidden sm:inline">Modo Telão</span>
              </button>

              <button
                onClick={() => generateVigilOfficialPdf({ config, moments, repertoire })}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold flex items-center gap-1.5 transition"
                title="Gerar PDF Oficial para Impressão"
              >
                <FileDown className="w-3.5 h-3.5 text-[#C9B27C]" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-[#0B0D10] hover:bg-rose-950/40 text-[#9FA4AD] hover:text-rose-300 border border-[#292E36] transition"
                title="Sair do Painel"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===================== HORIZONTAL NAVIGATION TABS ===================== */}
      <nav className="bg-[#0E1116] border-b border-[#292E36] px-4 py-2 sticky top-[57px] z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-start gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveTab('visao_geral')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'visao_geral'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>📊 Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('cronograma')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'cronograma'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>📋 Cronograma ({moments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vigilia')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'vigilia'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <Church className="w-3.5 h-3.5" />
            <span>⛪ Configurações da Vigília</span>
          </button>

          <button
            onClick={() => setActiveTab('dirigente')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'dirigente'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>👑 Dados do Dirigente</span>
          </button>

          <button
            onClick={() => setActiveTab('equipe')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'equipe'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>👥 Equipe & Ministros ({ministers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('participantes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'participantes'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>🎟️ Participantes ({participants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('oracoes_avisos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'oracoes_avisos'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>🙏 Pedidos & Avisos ({prayerRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('repertorio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'repertorio'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>🎵 Repertório ({repertoire.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('login_personalizacao')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'login_personalizacao'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>🎨 Tela de Entrada & Login</span>
          </button>

          <button
            onClick={() => setActiveTab('seguranca')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'seguranca'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>🔐 Códigos de Acesso</span>
          </button>
        </div>
      </nav>

      {/* ===================== MAIN GRID (DESKTOP 2-COLUMN) ===================== */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT / MAIN CONTENT AREA (7-8 COLUMNS) ================= */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'visao_geral' && (
              <DashboardOverviewSection
                onOpenProjector={onOpenProjector}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onPreviewPublic={() => setShowPublicPreviewModal(true)}
              />
            )}

            {activeTab === 'cronograma' && <ScheduleManagerSection />}

            {activeTab === 'vigilia' && <VigilSettingsSection />}

            {activeTab === 'dirigente' && <DirigenteProfileSection />}

            {activeTab === 'equipe' && <MinistersManagerSection />}

            {activeTab === 'participantes' && <ParticipantsManagerSection />}

            {activeTab === 'oracoes_avisos' && <PrayersNoticesSection />}

            {activeTab === 'repertorio' && <RepertoireManagerSection />}

            {activeTab === 'login_personalizacao' && <LoginPageCustomizerSection />}

            {activeTab === 'seguranca' && <SecurityAccessSection />}
          </div>

          {/* ================= RIGHT / STICKY LIVE CONTROLS PANEL (4 COLUMNS) ================= */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* 🔴 CARD 1: AGORA EM ANDAMENTO */}
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
                    <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2] leading-tight">
                      {activeMoment.title}
                    </h3>
                    {activeMoment.responsible && (
                      <p className="text-xs font-semibold text-[#C9B27C] flex items-center gap-1.5 mt-1">
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
                  Nenhum momento ativo no horário atual ({currentTime}).
                </div>
              )}
            </div>

            {/* ⏳ CARD 2: A SEGUIR */}
            <div className="rounded-3xl bg-[#14171C] border border-[#292E36] p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  ⏳ A SEGUIR
                </span>
                {nextMoment && (
                  <span className="text-xs font-mono text-[#9FA4AD]">
                    {nextMoment.startTime}
                  </span>
                )}
              </div>

              {nextMoment ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#F2F2F2] leading-snug">
                    {nextMoment.title}
                  </h4>
                  {nextMoment.responsible && (
                    <p className="text-xs text-[#C9B27C] flex items-center gap-1 font-semibold">
                      <User className="w-3 h-3" />
                      <span>{nextMoment.responsible}</span>
                    </p>
                  )}
                  {nextMoment.description && (
                    <p className="text-xs text-[#9FA4AD] line-clamp-2">
                      {nextMoment.description}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#9FA4AD]">Fim da programação da vigília.</p>
              )}
            </div>

            {/* 📋 CARD 3: CHECKLIST RÁPIDO DO PÚLPITO */}
            <div className="rounded-3xl bg-[#14171C] border border-[#292E36] p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#292E36] pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9B27C] flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  <span>Checklist da Vigília</span>
                </h4>
                <span className="text-[11px] text-[#9FA4AD]">
                  {checklist.filter((c) => c.done).length}/{checklist.length}
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] border border-[#292E36] text-xs cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 rounded text-[#C9B27C] bg-transparent border-[#292E36]"
                      />
                      <span className={`truncate ${item.done ? 'line-through text-[#9FA4AD]' : 'text-[#F2F2F2]'}`}>
                        {item.text}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeChecklistItem(item.id);
                      }}
                      className="text-[#9FA4AD] hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddChecklist} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="Novo item..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[#C9B27C] text-[#0B0D10] font-bold text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* 💾 CARD 4: BACKUP & EXPORTAÇÃO JSON */}
            <div className="rounded-3xl bg-[#14171C] border border-[#292E36] p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9FA4AD] flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#C9B27C]" />
                <span>Backup & Sincronização Geral</span>
              </h4>

              <p className="text-[11px] text-[#9FA4AD]">
                Exporte todo o banco de dados da vigília (momentos, equipe, participantes, louvores) para arquivo local.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={exportDataJSON}
                  className="py-2 px-3 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#C9B27C]" />
                  <span>Exportar JSON</span>
                </button>

                <label className="py-2 px-3 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Restaurar</span>
                  <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== MODAL PREVIEW DA PÁGINA PÚBLICA ===================== */}
      {showPublicPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
          {/* Top Bar inside preview */}
          <div className="bg-[#14171C] border-b border-[#292E36] px-4 py-3 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Pré-visualização da Página Pública do Membro</span>
              </span>
              <span className="text-xs text-[#9FA4AD] hidden sm:inline">
                (Visualização exata do que os fiéis e visitantes assistem no celular)
              </span>
            </div>

            <button
              onClick={() => setShowPublicPreviewModal(false)}
              className="px-4 py-1.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-bold flex items-center gap-1.5 transition"
            >
              <X className="w-4 h-4" />
              <span>Fechar Prévia</span>
            </button>
          </div>

          {/* Body with Member View */}
          <div className="flex-1 overflow-y-auto">
            <MemberView
              onOpenDirigenteAuth={() => setShowPublicPreviewModal(false)}
              onOpenProjector={() => {
                setShowPublicPreviewModal(false);
                onOpenProjector();
              }}
              onLogout={() => setShowPublicPreviewModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
