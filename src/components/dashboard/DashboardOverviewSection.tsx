import React from 'react';
import { useVigilia } from '../../context/VigiliaContext';
import {
  Clock,
  Users,
  UserCheck,
  Flame,
  Tv,
  FileDown,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Church,
  Calendar,
  MapPin,
  Play,
  ArrowRight,
  Shield,
  Layout,
  Key,
} from 'lucide-react';
import {
  getCurrentMomentStatus,
  calculateTotalVigilProgress,
  formatDurationHuman,
  calculateDurationMinutes,
} from '../../utils/timeUtils';
import { generateVigilOfficialPdf } from '../../utils/pdfGenerator';

export const DashboardOverviewSection: React.FC<{
  onOpenProjector: () => void;
  onNavigateTab: (tab: any) => void;
  onPreviewPublic: () => void;
}> = ({ onOpenProjector, onNavigateTab, onPreviewPublic }) => {
  const {
    config,
    moments,
    ministers,
    participants,
    prayerRequests,
    repertoire,
    currentTime,
    advanceToNextMoment,
  } = useVigilia();

  const momentStatus = getCurrentMomentStatus(moments, currentTime, config.startTime, config.endTime);
  const { activeMoment, nextMoment, progressPercent, minutesRemaining } = momentStatus;
  const totalVigilProgress = calculateTotalVigilProgress(currentTime, config.startTime, config.endTime);

  const pendingPrayers = prayerRequests.filter((p) => p.status === 'pendente').length;
  const presentParticipants = participants.filter((p) => p.status === 'presente').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Info */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#191D24] via-[#14171C] to-[#0E1116] border-2 border-[#C9B27C]/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#C9B27C]/20 border border-[#C9B27C]/40 text-[#C9B27C] text-xs font-extrabold uppercase tracking-wider">
                👑 Painel Central do Dirigente
              </span>
              <span className="text-xs font-mono text-[#9FA4AD] bg-[#0B0D10] px-2.5 py-0.5 rounded-lg border border-[#292E36]">
                Horário Atual: {currentTime}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#F2F2F2] tracking-tight">
              {config.vigilName}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#9FA4AD]">
              <span className="flex items-center gap-1">
                <Church className="w-3.5 h-3.5 text-[#C9B27C]" /> {config.churchName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {config.date} ({config.startTime} às {config.endTime})
              </span>
              {config.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> {config.location}
                </span>
              )}
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onPreviewPublic}
              className="px-4 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#C9B27C]/20 transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>👁️ VER PÁGINA PÚBLICA</span>
            </button>

            <button
              onClick={onOpenProjector}
              className="px-4 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#C9B27C] border border-[#C9B27C]/40 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Tv className="w-4 h-4" />
              <span>Modo Projetor</span>
            </button>

            <button
              onClick={() => generateVigilOfficialPdf({ config, moments, repertoire })}
              className="px-3.5 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileDown className="w-4 h-4 text-[#C9B27C]" />
              <span>PDF Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => onNavigateTab('cronograma')}
          className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/50 transition cursor-pointer space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-[#9FA4AD]">
            <span className="text-[11px] font-bold uppercase">Momentos</span>
            <Clock className="w-4 h-4 text-[#C9B27C]" />
          </div>
          <div className="text-xl font-black text-[#F2F2F2]">{moments.length}</div>
          <span className="text-[10px] text-[#9FA4AD] flex items-center gap-1">
            Ver cronograma <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('equipe')}
          className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/50 transition cursor-pointer space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-[#9FA4AD]">
            <span className="text-[11px] font-bold uppercase">Equipe & Ministros</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-black text-[#F2F2F2]">{ministers.length}</div>
          <span className="text-[10px] text-[#9FA4AD] flex items-center gap-1">
            Gerenciar escala <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('participantes')}
          className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/50 transition cursor-pointer space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-[#9FA4AD]">
            <span className="text-[11px] font-bold uppercase">Presença no Templo</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">
            {presentParticipants} <span className="text-xs font-normal text-[#9FA4AD]">/ {participants.length}</span>
          </div>
          <span className="text-[10px] text-[#9FA4AD] flex items-center gap-1">
            Lista de presença <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('oracoes_avisos')}
          className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/50 transition cursor-pointer space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-[#9FA4AD]">
            <span className="text-[11px] font-bold uppercase">Pedidos de Clamor</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-300">
            {prayerRequests.length}{' '}
            {pendingPrayers > 0 && <span className="text-xs text-amber-400 font-bold">({pendingPrayers} pendentes)</span>}
          </div>
          <span className="text-[10px] text-[#9FA4AD] flex items-center gap-1">
            Moderar pedidos <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Live Active Moment Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card: Momento Atual */}
        <div className="p-5 rounded-3xl bg-[#14171C] border-2 border-[#C9B27C]/40 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              🔴 MOMENTO EM ANDAMENTO
            </span>
            <span className="font-mono text-xs font-bold text-[#C9B27C]">
              {minutesRemaining > 0 ? `${minutesRemaining}m restantes` : 'Finalizando'}
            </span>
          </div>

          {activeMoment ? (
            <div className="space-y-2 pt-1">
              <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2] leading-snug">
                {activeMoment.title}
              </h3>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#C9B27C]">
                <span>{activeMoment.responsible || 'Equipe Geral'}</span>
                <span>•</span>
                <span className="font-mono text-[#F2F2F2] bg-[#0B0D10] px-2 py-0.5 rounded border border-[#292E36]">
                  {activeMoment.startTime} → {activeMoment.endTime}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-2">
                <div className="w-full h-2 bg-[#0B0D10] rounded-full overflow-hidden border border-[#292E36]">
                  <div
                    className="h-full bg-gradient-to-r from-[#C9B27C] to-[#E3D1A5] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={advanceToNextMoment}
                  className="w-full py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-extrabold transition shadow"
                >
                  Concluir & Avançar para o Próximo →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-[#9FA4AD]">
              Vigília aguardando início ou intervalo programado.
            </div>
          )}
        </div>

        {/* Card: Próximo Momento */}
        <div className="p-5 rounded-3xl bg-[#14171C] border border-[#292E36] space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase">
              ⏳ A SEGUIR
            </span>
          </div>

          {nextMoment ? (
            <div className="space-y-2 pt-1">
              <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2] leading-snug">
                {nextMoment.title}
              </h3>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <span>{nextMoment.responsible || 'Equipe Geral'}</span>
                <span>•</span>
                <span className="font-mono text-[#F2F2F2] bg-[#0B0D10] px-2 py-0.5 rounded border border-[#292E36]">
                  {nextMoment.startTime} → {nextMoment.endTime}
                </span>
              </div>
              {nextMoment.description && (
                <p className="text-xs text-[#9FA4AD] pt-1 line-clamp-2">
                  {nextMoment.description}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-[#9FA4AD]">
              Nenhum momento subsequente agendado.
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Sections Grid */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C9B27C]" />
          <span>Atalhos Rápidos de Edição e Configuração</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onNavigateTab('vigilia')}
            className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/50 text-left transition space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#C9B27C]/10 border border-[#C9B27C]/30 flex items-center justify-center text-[#C9B27C]">
              <Church className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#F2F2F2] group-hover:text-[#C9B27C] transition">
              Configurações da Vigília
            </h4>
            <p className="text-[11px] text-[#9FA4AD]">
              Nome, igreja, local, temas, versículos e datas.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('dirigente')}
            className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/50 text-left transition space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#F2F2F2] group-hover:text-indigo-300 transition">
              Dados do Dirigente
            </h4>
            <p className="text-[11px] text-[#9FA4AD]">
              Perfil, telefone/WhatsApp, biografia e mensagem pastoral.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('login_personalizacao')}
            className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/50 text-left transition space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Layout className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#F2F2F2] group-hover:text-purple-300 transition">
              Personalização da Tela de Login
            </h4>
            <p className="text-[11px] text-[#9FA4AD]">
              Títulos, subtítulos, textos de botões e logos da entrada.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
