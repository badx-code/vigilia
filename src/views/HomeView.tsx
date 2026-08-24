import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { formatCountdown, getCurrentMomentStatus, isVigilInWaitingMode } from '../utils/timeUtils';
import { TeamIcon } from '../components/TeamIcon';
import { WaitingRoomScreen } from '../components/WaitingRoomScreen';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ChevronRight,
  Heart,
  Users,
  Shield,
  Radio,
  FileText,
  Volume2,
  BookOpen,
  Plus,
  ShieldCheck,
  AlertCircle,
  Eye,
  Share2,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onOpenShareModal?: () => void;
  onOpenDirigenteAuth?: () => void;
  onOpenEditDetailsModal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenShareModal = () => {},
  onOpenDirigenteAuth = () => {},
  onOpenEditDetailsModal,
}) => {
  const {
    config,
    moments,
    teams,
    prayerRequests,
    incrementPrayer,
    notices,
    currentTime,
    userRole,
    pendingPrayersCount,
  } = useVigilia();

  const [showLivePreviewAnyway, setShowLivePreviewAnyway] = useState(false);

  const isWaiting = isVigilInWaitingMode(config);
  const countdown = formatCountdown(config.date, config.startTime);
  const status = getCurrentMomentStatus(moments, currentTime, config.startTime, config.endTime);

  // If vigil is in waiting mode and user hasn't explicitly chosen to preview the live dashboard:
  if (isWaiting && !showLivePreviewAnyway) {
    return (
      <WaitingRoomScreen
        onNavigate={onNavigate}
        onOpenShareModal={onOpenShareModal}
        onOpenDirigenteAuth={onOpenDirigenteAuth}
        onOpenEditDetailsModal={onOpenEditDetailsModal}
      />
    );
  }

  const formattedDate = () => {
    try {
      const [y, m, d] = config.date.split('-');
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      return dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return config.date;
    }
  };

  // Only approved prayers on public/participant view
  const approvedPrayers = prayerRequests.filter((p) => (p.status || 'aprovado') === 'aprovado');
  const displayPrayers = approvedPrayers.slice(0, 3);
  const urgentNotices = notices.filter((n) => n.isUrgent);

  // Active moment calculation for progress bar
  const calculateProgressPercent = () => {
    if (!status.activeMoment) return 0;
    try {
      const [sh, sm] = status.activeMoment.startTime.split(':').map(Number);
      const [eh, em] = status.activeMoment.endTime.split(':').map(Number);
      const [ch, cm] = currentTime.split(':').map(Number);

      const startTotal = sh * 60 + sm;
      let endTotal = eh * 60 + em;
      let currTotal = ch * 60 + cm;

      if (endTotal < startTotal) endTotal += 24 * 60;
      if (currTotal < startTotal && ch < 12) currTotal += 24 * 60;

      const duration = endTotal - startTotal;
      if (duration <= 0) return 50;
      const elapsed = currTotal - startTotal;
      const pct = Math.min(100, Math.max(0, (elapsed / duration) * 100));
      return Math.round(pct);
    } catch {
      return 50;
    }
  };

  const activeProgress = calculateProgressPercent();

  const activeTeamInfo = teams.find(
    (t) => t.name.toLowerCase() === (status.activeMoment?.team || '').toLowerCase()
  ) || teams[0];

  return (
    <div id="home-view" className="space-y-4 sm:space-y-5 animate-fadeIn">
      {/* WAITING ROOM PREVIEW RETURN BANNER */}
      {isWaiting && showLivePreviewAnyway && (
        <div className="bg-[#14171C] border border-[#C9B27C]/60 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2 text-[#C9B27C]">
            <Eye className="w-4 h-4 shrink-0" />
            <span>
              <strong>Modo de Prévia em Tempo Real:</strong> A Sala de Espera continua ativa para os participantes até a data da vigília ({config.date} às {config.startTime}).
            </span>
          </div>
          <button
            onClick={() => setShowLivePreviewAnyway(false)}
            className="px-3 py-1.5 rounded-lg bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-xs shrink-0 transition"
          >
            Voltar para Sala de Espera
          </button>
        </div>
      )}

      {/* MODERATION ALERT BANNER FOR DIRIGENTES */}
      {userRole === 'dirigente' && pendingPrayersCount > 0 && (
        <div className="bg-amber-950/50 border border-amber-600/60 rounded-xl p-3.5 flex items-center justify-between gap-3 text-amber-200 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-lg bg-amber-500 text-black font-bold text-xs shrink-0 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {pendingPrayersCount}
            </span>
            <div className="text-xs">
              <strong className="font-semibold text-amber-300">
                {pendingPrayersCount === 1
                  ? 'Existe 1 pedido de oração aguardando avaliação'
                  : `Existem ${pendingPrayersCount} pedidos de oração aguardando avaliação`}
              </strong>
              <p className="text-amber-200/80 text-[11px]">
                Examine e aprove antes de disponibilizar no mural público para todos os participantes.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('pedidos')}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition shrink-0 shadow-sm"
          >
            Avaliar Pedidos →
          </button>
        </div>
      )}

      {/* URGENT NOTICE BANNER IF ANY */}
      {urgentNotices.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 flex items-start gap-2.5 text-rose-200 text-xs">
          <span className="p-1 rounded bg-rose-900 text-rose-300 font-mono text-[9px] uppercase font-bold shrink-0">
            Aviso Urgente
          </span>
          <div className="flex-1">
            <strong className="font-semibold">{urgentNotices[0].title}: </strong>
            <span className="text-rose-200/90">{urgentNotices[0].content}</span>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE VIGIL IDENTITY CARD FOR MOBILE AND DESKTOP */}
      <div className="bg-gradient-to-r from-[#191D24] via-[#14171C] to-[#0E1116] border border-[#292E36] rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0B0D10] text-[#C9B27C] border border-[#C9B27C]/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Vigília Ativa
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#191D23] text-[#9FA4AD] border border-[#292E36] text-[10px] font-mono">
                Código: <strong className="text-[#F2F2F2]">{config.churchName ? config.vigilName : 'Vigília'}</strong>
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-bold text-[#F2F2F2] tracking-tight">
              {config.vigilName || 'Grande Vigília de Oração'}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#9FA4AD]">
              <span className="text-[#C9B27C] font-semibold">{config.churchName || 'Igreja Local'}</span>
              {config.theme && (
                <>
                  <span>•</span>
                  <span className="italic text-[#F2F2F2]/90">Tema: "{config.theme}"</span>
                </>
              )}
            </div>

            {/* Quick meta details: Date, Hours, Location */}
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 pt-1.5 text-xs text-[#9FA4AD]">
              <div className="flex items-center gap-1.5 text-[#F2F2F2]">
                <Calendar className="w-3.5 h-3.5 text-[#C9B27C] shrink-0" />
                <span className="capitalize">{formattedDate()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#F2F2F2]">
                <Clock className="w-3.5 h-3.5 text-[#C9B27C] shrink-0" />
                <span className="font-mono">{config.startTime} às {config.endTime}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#F2F2F2]">
                <MapPin className="w-3.5 h-3.5 text-[#C9B27C] shrink-0" />
                <span>{config.location}{config.city ? `, ${config.city}` : ''}</span>
              </div>
            </div>
          </div>

          {/* Quick Share / Invite Action */}
          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#292E36]/60">
            <button
              onClick={onOpenShareModal}
              className="w-full md:w-auto px-4 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Convidar / QR Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* 12-COLUMN IMMERSIVE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* LEFT COLUMN: MOMENTO ATUAL, SUB-CARDS, ORAÇÕES & VERSÍCULO */}
        <div className="xl:col-span-8 space-y-4">
          {/* MOMENTO ATUAL HERO CARD */}
          <div className="bg-[#14171C] border border-[#C9B27C]/30 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
            {/* Watermark Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl select-none pointer-events-none text-[#C9B27C]">
              🌙
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-[#C9B27C] text-[11px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9B27C] animate-ping" />
                  Momento em Andamento
                </p>
                {status.activeMoment && (
                  <span className="text-xs font-mono text-[#C9B27C] bg-[#191D23] px-2.5 py-0.5 rounded-full border border-[#292E36]">
                    {status.activeMoment.startTime} — {status.activeMoment.endTime}
                  </span>
                )}
              </div>

              {status.activeMoment ? (
                <div>
                  <h3 className="text-xl sm:text-3xl font-medium text-[#F2F2F2] mb-2 leading-tight">
                    {status.activeMoment.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#9FA4AD] mb-4">
                    {status.activeMoment.responsible && (
                      <span className="flex items-center gap-1 text-[#F2F2F2]">
                        <span className="text-[#C9B27C]">Dirigente:</span>
                        <strong className="font-medium">{status.activeMoment.responsible}</strong>
                      </span>
                    )}
                    {status.activeMoment.team && (
                      <span className="text-[11px] text-[#9FA4AD] bg-[#191D23] px-2 py-0.5 rounded border border-[#292E36]">
                        {status.activeMoment.team}
                      </span>
                    )}
                  </div>

                  {/* Gold Glowing Progress Bar */}
                  <div className="w-full bg-[#0B0D10] h-2 rounded-full overflow-hidden border border-[#292E36]/50">
                    <div
                      className="bg-[#C9B27C] h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${activeProgress}%`,
                        boxShadow: '0 0 8px #C9B27C',
                      }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#9FA4AD]">
                    <span>Progresso: {activeProgress}%</span>
                    <span className="text-[#C9B27C] font-mono font-medium">
                      {status.minutesRemaining > 0
                        ? `Restam ~${status.minutesRemaining} min`
                        : 'Concluindo momento'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#F2F2F2] mb-1">
                        Aguardando Início da Vigília
                      </h3>
                      <p className="text-xs text-[#9FA4AD]">
                        Início previsto para às <strong className="text-[#C9B27C] font-mono text-sm">{config.startTime}</strong> no {config.location}.
                      </p>
                    </div>
                    <span className="self-start sm:self-auto text-[11px] font-mono text-[#C9B27C] bg-[#C9B27C]/10 border border-[#C9B27C]/30 px-2.5 py-1 rounded-lg">
                      Data: {config.date}
                    </span>
                  </div>

                  {/* HIGH-IMPACT COUNTDOWN CLOCK */}
                  <div className="bg-[#0B0D10]/80 border border-[#C9B27C]/40 rounded-xl p-3.5 my-3 shadow-inner">
                    <p className="text-[10px] text-[#9FA4AD] uppercase tracking-wider font-semibold mb-2 text-center">
                      Tempo Restante para o Início da Vigília
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center max-w-md mx-auto">
                      <div className="bg-[#14171C] border border-[#292E36] rounded-lg p-2">
                        <span className="text-xl sm:text-2xl font-black font-mono text-[#F2F2F2] block">
                          {String(countdown.days).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] text-[#9FA4AD] uppercase">Dias</span>
                      </div>
                      <div className="bg-[#14171C] border border-[#292E36] rounded-lg p-2">
                        <span className="text-xl sm:text-2xl font-black font-mono text-[#C9B27C] block">
                          {String(countdown.hours).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] text-[#9FA4AD] uppercase">Horas</span>
                      </div>
                      <div className="bg-[#14171C] border border-[#292E36] rounded-lg p-2">
                        <span className="text-xl sm:text-2xl font-black font-mono text-[#C9B27C] block">
                          {String(countdown.minutes).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] text-[#9FA4AD] uppercase">Minutos</span>
                      </div>
                      <div className="bg-[#14171C] border border-[#292E36] rounded-lg p-2">
                        <span className="text-xl sm:text-2xl font-black font-mono text-[#F2F2F2] block animate-pulse">
                          {String(countdown.seconds).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] text-[#9FA4AD] uppercase">Segundos</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions inside Card */}
              <div className="mt-4 pt-3 border-t border-[#292E36]/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {userRole === 'dirigente' ? (
                    <button
                      onClick={() => onNavigate('live')}
                      className="px-3.5 py-1.5 bg-[#C9B27C] hover:bg-[#b8a16c] text-[#0B0D10] font-semibold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Abrir Modo Telão / Púlpito</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => onNavigate('pedidos')}
                        className="px-3.5 py-1.5 bg-[#C9B27C] hover:bg-[#b8a16c] text-[#0B0D10] font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Enviar Pedido de Oração</span>
                      </button>
                      <button
                        onClick={onOpenDirigenteAuth}
                        className="px-3 py-1.5 bg-[#14171C] hover:bg-[#1E232B] text-[#C9B27C] hover:text-[#f2f2f2] border border-[#C9B27C]/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Acesso Dirigente / Pastor</span>
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => onNavigate('cronograma')}
                  className="text-xs text-[#9FA4AD] hover:text-[#F2F2F2] flex items-center gap-1 group font-medium"
                >
                  <span>Ver cronograma detalhado</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>
          </div>

          {/* 2-COLUMN SUB-GRID: PRÓXIMO MOMENTO & EQUIPE EM AÇÃO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* PRÓXIMO MOMENTO */}
            <div className="bg-[#14171C] border border-[#292E36] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-[#C9B27C] text-[10px] font-bold uppercase tracking-wider mb-2">
                  A Seguir
                </p>

                {status.nextMoment ? (
                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-medium text-[#F2F2F2]">
                      {status.nextMoment.title}
                    </h4>
                    <p className="text-xs text-[#9FA4AD] font-mono">
                      {status.nextMoment.startTime} às {status.nextMoment.endTime}
                    </p>
                    {status.nextMoment.responsible && (
                      <p className="text-xs text-[#9FA4AD]">
                        Dirigente: <span className="text-[#F2F2F2]">{status.nextMoment.responsible}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#9FA4AD] italic py-1">
                    Nenhum momento subsequente agendado.
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-[#292E36]/50 flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#9FA4AD]">
                  {status.nextMoment ? `Tipo: ${status.nextMoment.type}` : 'Encerramento'}
                </span>
                <button
                  onClick={() => onNavigate('cronograma')}
                  className="text-[#9FA4AD] hover:text-[#C9B27C] transition text-xs"
                >
                  Linha do tempo →
                </button>
              </div>
            </div>

            {/* EQUIPE / LOUVOR EM AÇÃO */}
            <div className="bg-[#14171C] border border-[#292E36] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-[#C9B27C] text-[10px] font-bold uppercase tracking-wider mb-2">
                  {userRole === 'dirigente' ? 'Equipe Responsável' : 'Ministração & Louvor'}
                </p>

                {activeTeamInfo ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <TeamIcon iconName={activeTeamInfo.icon} className="w-3.5 h-3.5 text-[#C9B27C]" />
                      <h4 className="text-sm sm:text-base font-medium text-[#F2F2F2]">
                        {status.activeMoment?.team || activeTeamInfo.name}
                      </h4>
                    </div>
                    <p className="text-xs text-[#9FA4AD]">
                      Líder: <span className="text-[#F2F2F2]">{activeTeamInfo.leader || 'Coordenação'}</span>
                    </p>
                    <p className="text-[11px] text-[#9FA4AD] truncate">
                      {activeTeamInfo.members.slice(0, 3).map((m) => m.name).join(', ') || 'Equipe escalada'}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#9FA4AD] italic py-1">
                    Equipe geral de apoio e louvor.
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-[#292E36]/50 flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#9FA4AD]">
                  {userRole === 'dirigente' ? `${teams.length} equipes ativas` : 'Apoio em serviço'}
                </span>
                {userRole === 'dirigente' ? (
                  <button
                    onClick={() => onNavigate('equipes')}
                    className="text-[#9FA4AD] hover:text-[#C9B27C] transition text-xs"
                  >
                    Ver escalas →
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('contatos')}
                    className="text-[#9FA4AD] hover:text-[#C9B27C] transition text-xs"
                  >
                    Contatos de apoio →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PEDIDOS DE ORAÇÃO SECTION */}
          <div className="bg-[#14171C] border border-[#292E36] rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs sm:text-sm font-semibold text-[#F2F2F2]">
                  {userRole === 'dirigente'
                    ? 'Mural de Intercessão (Aprovados)'
                    : 'Mural de Intercessão Comunitária'}
                </h4>
              </div>
              <span className="text-[10px] text-[#C9B27C] border border-[#C9B27C] px-2 py-0.5 rounded font-mono">
                {approvedPrayers.length} no Mural
              </span>
            </div>

            {displayPrayers.length > 0 ? (
              <div className="space-y-2.5">
                {displayPrayers.map((prayer) => (
                  <div
                    key={prayer.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-[#0B0D10] rounded-lg border-l-2 border-[#C9B27C]"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs italic text-[#F2F2F2] leading-snug">
                        "{prayer.request}"
                      </p>
                      <p className="text-[10px] text-[#9FA4AD]">
                        Por: <strong className="text-[#F2F2F2]">{prayer.isAnonymous ? 'Anônimo' : prayer.authorName}</strong>
                        {prayer.category && (
                          <span className="ml-2 px-1.5 py-0.2 bg-[#191D23] rounded text-[9px] border border-[#292E36] capitalize">
                            {prayer.category}
                          </span>
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => incrementPrayer(prayer.id)}
                      className={`self-start sm:self-center text-[10px] font-mono px-2.5 py-1 rounded border transition flex items-center gap-1 shrink-0 ${
                        prayer.userPrayed
                          ? 'bg-[#C9B27C] text-[#0B0D10] font-bold border-[#C9B27C]'
                          : 'text-[#F2F2F2] bg-[#191D23] hover:bg-[#292E36] border-[#292E36]'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${prayer.userPrayed ? 'fill-black' : ''}`} />
                      <span>{prayer.userPrayed ? 'ORANDO' : 'ESTOU ORANDO'} ({prayer.prayersCount || 0})</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#9FA4AD] italic py-2 text-center">
                Nenhum pedido de oração publicado no mural até o momento.
              </p>
            )}

            <div className="mt-3 pt-2.5 border-t border-[#292E36]/50 flex items-center justify-between text-xs">
              <span className="text-[#9FA4AD] text-[11px]">
                {userRole === 'membro'
                  ? 'Você pode adicionar seus próprios pedidos de oração'
                  : 'Modere e aprove novos pedidos na aba Orações'}
              </span>
              <button
                onClick={() => onNavigate('pedidos')}
                className="text-[#C9B27C] hover:underline font-medium text-xs"
              >
                Ver todos os pedidos →
              </button>
            </div>
          </div>

          {/* SCRIPTURE VERSE CARD */}
          <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36] space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#C9B27C] uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Versículo Tema da Vigília</span>
            </div>
            <blockquote className="text-xs sm:text-sm text-[#F2F2F2] font-serif italic leading-relaxed">
              "{config.keyVerse}"
            </blockquote>
            <p className="text-[11px] text-[#9FA4AD] text-right font-medium">
              — {config.verseReference}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: CRONOGRAMA COMPLETO CONNECTED TIMELINE */}
        <div className="xl:col-span-4 bg-[#14171C] border border-[#292E36] rounded-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#292E36] flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-[#F2F2F2]">
                Linha do Tempo
              </h3>
              <p className="text-[10px] text-[#9FA4AD] font-mono uppercase tracking-wider mt-0.5">
                {formattedDate()}
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#C9B27C] bg-[#0B0D10] px-2 py-0.5 rounded border border-[#292E36]">
              {moments.length} blocos
            </span>
          </div>

          {/* Connected Timeline with Compact Inner Scroll */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[460px] scrollbar-thin">
            {moments.map((moment, index) => {
              const isPast = moment.completed;
              const isActive = status.activeMoment?.id === moment.id;
              const isLast = index === moments.length - 1;

              return (
                <div
                  key={moment.id}
                  className={`flex gap-2.5 relative ${isPast ? 'opacity-40' : ''}`}
                >
                  {/* Timeline Node & Connecting Line */}
                  <div className="flex flex-col items-center shrink-0 w-3.5">
                    {isActive ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#C9B27C] border-2 border-[#0B0D10] shadow-[0_0_8px_#C9B27C] shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#292E36] border border-[#0B0D10] shrink-0 mt-1" />
                    )}

                    {!isLast && (
                      <div className="w-0.5 flex-1 bg-[#292E36] my-1" />
                    )}
                  </div>

                  {/* Moment Details */}
                  <div className="flex-1 pb-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isActive ? 'text-[#C9B27C]' : 'text-[#9FA4AD]'
                        }`}
                      >
                        {moment.startTime}
                      </span>
                      <span className="text-[9px] text-[#9FA4AD] uppercase font-mono">
                        {moment.type}
                      </span>
                    </div>

                    <p
                      className={`text-xs font-medium leading-snug mt-0.5 ${
                        isActive ? 'text-[#F2F2F2] font-semibold' : 'text-[#9FA4AD]'
                      }`}
                    >
                      {moment.title}
                    </p>

                    {isActive && (
                      <p className="text-[10px] text-[#C9B27C] mt-0.5 font-mono">
                        ● Em andamento agora
                      </p>
                    )}

                    {moment.responsible && (
                      <p className="text-[10px] text-[#9FA4AD]/80 mt-0.5">
                        Resp: {moment.responsible}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Link */}
          <div className="p-3 border-t border-[#292E36] shrink-0 bg-[#0B0D10]/40">
            <button
              onClick={() => onNavigate('cronograma')}
              className="w-full py-2 bg-[#0B0D10] hover:bg-[#191D23] text-[#9FA4AD] hover:text-[#F2F2F2] text-xs font-semibold border border-[#292E36] rounded-xl transition"
            >
              Ver Cronograma Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
