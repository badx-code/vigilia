import React, { useState, useEffect } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { getCurrentMomentStatus } from '../utils/timeUtils';
import { MomentBadge } from './MomentBadge';
import {
  Clock,
  ChevronRight,
  Maximize2,
  Minimize2,
  Calendar,
  Sparkles,
  Play,
  RotateCcw,
  SlidersHorizontal,
  User,
  Users,
  BookOpen,
  Monitor,
  Music,
  HeartHandshake,
  Lock,
} from 'lucide-react';

interface LiveVigilScreenProps {
  onOpenSchedule: () => void;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const LiveVigilScreen: React.FC<LiveVigilScreenProps> = ({
  onOpenSchedule,
  onClose,
  isEmbedded = false,
}) => {
  const {
    config,
    moments,
    currentTime,
    isSimulatedTime,
    setSimulatedTime,
    userRole,
  } = useVigilia();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSimControls, setShowSimControls] = useState(false);
  const [tempSimTime, setTempSimTime] = useState(currentTime);

  const status = getCurrentMomentStatus(
    moments,
    currentTime,
    config.startTime,
    config.endTime
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleApplySimTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSimTime) {
      setSimulatedTime(tempSimTime);
    }
  };

  const handleResetToRealTime = () => {
    setSimulatedTime(null);
    const d = new Date();
    setTempSimTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
  };

  return (
    <div
      id="live-vigil-mode"
      className={`bg-[#0B0D10] text-[#F2F2F2] flex flex-col justify-between ${
        isEmbedded
          ? 'rounded-2xl border border-[#292E36] p-4 sm:p-6 shadow-2xl bg-gradient-to-b from-[#14171C] to-[#0B0D10]'
          : 'min-h-[85vh] p-4 sm:p-8'
      }`}
    >
      {/* Top Bar with Clock and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#292E36]/80 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-xs uppercase tracking-widest text-[#9FA4AD] font-mono">
              MODO VIGÍLIA AO VIVO
            </span>
            <h2 className="text-sm sm:text-base font-semibold text-[#F2F2F2]">
              {config.vigilName}
            </h2>
          </div>
        </div>

        {/* Live Clock Display */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl sm:text-4xl font-bold font-mono tracking-tight text-[#F2F2F2] flex items-center gap-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#C9B27C]" />
              <span>{currentTime}</span>
            </div>
            {isSimulatedTime && (
              <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40">
                Horário Simulado
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSimControls(!showSimControls)}
              title="Ajustar horário de teste"
              className="p-2 rounded-lg bg-[#191D23] hover:bg-[#292E36] text-[#9FA4AD] hover:text-[#F2F2F2] transition border border-[#292E36]"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            {!isEmbedded && (
              <button
                onClick={toggleFullscreen}
                title="Tela Cheia"
                className="p-2 rounded-lg bg-[#191D23] hover:bg-[#292E36] text-[#9FA4AD] hover:text-[#F2F2F2] transition border border-[#292E36]"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Quick Time Bar */}
      {showSimControls && (
        <form
          onSubmit={handleApplySimTime}
          className="mb-6 p-3 sm:p-4 rounded-xl bg-[#14171C] border border-[#292E36] flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="text-[#9FA4AD]">Simular Horário:</span>
            <input
              type="time"
              value={tempSimTime}
              onChange={(e) => setTempSimTime(e.target.value)}
              className="bg-[#0B0D10] text-[#F2F2F2] border border-[#292E36] rounded px-2 py-1 text-sm font-mono focus:border-[#C9B27C] focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#C9B27C] text-[#0B0D10] font-semibold rounded hover:bg-[#b8a16c] transition"
            >
              Aplicar
            </button>
            {isSimulatedTime && (
              <button
                type="button"
                onClick={handleResetToRealTime}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#191D23] text-[#9FA4AD] hover:text-[#F2F2F2] rounded border border-[#292E36] transition"
              >
                <RotateCcw className="w-3 h-3" />
                Hora Real
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1 text-[11px] text-[#9FA4AD]">
            <span>Atalhos:</span>
            {['21:00', '22:15', '00:00', '01:15', '02:30', '04:00', '04:55'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTempSimTime(t);
                  setSimulatedTime(t);
                }}
                className="px-1.5 py-0.5 bg-[#0B0D10] hover:bg-[#292E36] rounded text-[#F2F2F2] border border-[#292E36]"
              >
                {t}
              </button>
            ))}
          </div>
        </form>
      )}

      {/* Main Focus Area: AGORA & PRÓXIMO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
        {/* CURRENT MOMENT (AGORA) - 7 cols */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[#14171C] border-2 border-[#C9B27C]/50 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow Backdrop */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9B27C]/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 uppercase tracking-wider animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  AGORA
                </span>
                {status.activeMoment && (
                  <MomentBadge type={status.activeMoment.type} size="md" />
                )}
              </div>

              {status.activeMoment && (
                <div className="text-xs sm:text-sm font-mono text-[#C9B27C] font-semibold">
                  {status.activeMoment.startTime} – {status.activeMoment.endTime}
                </div>
              )}
            </div>

            {/* Title & Description */}
            {status.activeMoment ? (
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#F2F2F2] leading-tight">
                  {status.activeMoment.title}
                </h1>
                {status.activeMoment.description && (
                  <p className="text-sm sm:text-base text-[#9FA4AD] max-w-2xl leading-relaxed">
                    {status.activeMoment.description}
                  </p>
                )}
                {status.activeMoment.scripture && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[#C9B27C] bg-[#0B0D10]/60 p-2.5 rounded-lg border border-[#292E36]">
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    <span className="font-serif italic">{status.activeMoment.scripture}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <p className="text-xl font-semibold text-[#F2F2F2]">
                  {status.isBeforeVigil
                    ? 'A vigília ainda não começou'
                    : status.isAfterVigil
                    ? 'Vigília concluída'
                    : 'Intervalo / Próxima atividade em breve'}
                </p>
                <p className="text-sm text-[#9FA4AD]">
                  Horário oficial: {config.startTime} às {config.endTime}
                </p>
              </div>
            )}
          </div>

          {/* Progress & Details Footer */}
          {status.activeMoment && (
            <div className="mt-8 pt-6 border-t border-[#292E36] space-y-4">
              {/* Remaining Countdown & Progress */}
              <div>
                <div className="flex items-center justify-between text-xs sm:text-sm font-mono mb-2">
                  <span className="text-[#9FA4AD]">Progresso do momento</span>
                  <span className="text-[#C9B27C] font-semibold">
                    {status.minutesRemaining > 0
                      ? `Faltam ${status.minutesRemaining} minuto${status.minutesRemaining > 1 ? 's' : ''}`
                      : 'Finalizando momento'}
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-3 bg-[#0B0D10] rounded-full overflow-hidden border border-[#292E36]">
                  <div
                    className="h-full bg-gradient-to-r from-[#C9B27C] to-[#e4cf9b] transition-all duration-1000 ease-out"
                    style={{ width: `${status.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Responsible and Team */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                {status.activeMoment.responsible && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2]">
                    <User className="w-3.5 h-3.5 text-[#C9B27C]" />
                    <span className="text-[#9FA4AD]">Responsável:</span>
                    <span className="font-medium">{status.activeMoment.responsible}</span>
                  </div>
                )}
                {status.activeMoment.team && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2]">
                    <Users className="w-3.5 h-3.5 text-[#C9B27C]" />
                    <span className="text-[#9FA4AD]">Equipe:</span>
                    <span className="font-medium">{status.activeMoment.team}</span>
                  </div>
                )}

                {/* Operational Quick Pill (Dirigente only) */}
                {userRole === 'dirigente' && (status.activeMoment.useSlide || status.activeMoment.songsList || status.activeMoment.prayerMotives || status.activeMoment.sermonTopic) && (
                  <div className="w-full mt-2 p-2.5 rounded-xl bg-[#0B0D10] border border-[#C9B27C]/30 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#C9B27C]">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Orientações de Púlpito (Dirigente):</span>
                      </span>
                      {status.activeMoment.useSlide && (
                        <span className="text-blue-300 flex items-center gap-1">
                          <Monitor className="w-3 h-3" />
                          <span>Usa Slide {status.activeMoment.slideNotes ? `(${status.activeMoment.slideNotes})` : ''}</span>
                        </span>
                      )}
                    </div>
                    {status.activeMoment.songsList && (
                      <p className="text-[#F2F2F2]"><strong className="text-[#C9B27C]">Músicas:</strong> {status.activeMoment.songsList}</p>
                    )}
                    {status.activeMoment.prayerMotives && (
                      <p className="text-[#F2F2F2]"><strong className="text-purple-300">Motivo da Oração:</strong> {status.activeMoment.prayerMotives}</p>
                    )}
                    {status.activeMoment.sermonTopic && (
                      <p className="text-[#F2F2F2]"><strong className="text-emerald-300">Tema do Sermão:</strong> {status.activeMoment.sermonTopic}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* UPCOMING MOMENT (PRÓXIMO) & QUICK INFO - 5 cols */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* PRÓXIMO CARD */}
          <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#9FA4AD] bg-[#191D23] px-2.5 py-1 rounded border border-[#292E36]">
                PRÓXIMO
              </span>
              {status.nextMoment && (
                <span className="text-xs font-mono text-[#C9B27C]">
                  {status.nextMoment.startTime} – {status.nextMoment.endTime}
                </span>
              )}
            </div>

            {status.nextMoment ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MomentBadge type={status.nextMoment.type} size="sm" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#F2F2F2]">
                  {status.nextMoment.title}
                </h3>
                {status.nextMoment.description && (
                  <p className="text-xs text-[#9FA4AD] line-clamp-2">
                    {status.nextMoment.description}
                  </p>
                )}
                <div className="pt-2 text-xs text-[#9FA4AD] flex flex-wrap gap-2">
                  {status.nextMoment.responsible && (
                    <span>Dirigido por: <strong className="text-[#F2F2F2]">{status.nextMoment.responsible}</strong></span>
                  )}
                  {status.nextMoment.team && (
                    <span>• Equipe: <strong className="text-[#F2F2F2]">{status.nextMoment.team}</strong></span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#9FA4AD] italic">
                Nenhum momento posterior cadastrado.
              </p>
            )}
          </div>

          {/* SCRIPTURE / INSPIRATIONAL BANNER */}
          <div className="p-5 rounded-2xl bg-[#191D23]/60 border border-[#292E36] space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#C9B27C] font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PALAVRA DA VIGÍLIA</span>
            </div>
            <p className="text-sm text-[#F2F2F2] font-serif italic leading-relaxed">
              "{config.keyVerse}"
            </p>
            <p className="text-xs text-[#9FA4AD] text-right font-medium">
              — {config.verseReference}
            </p>
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={onOpenSchedule}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#191D23] hover:bg-[#292E36] text-[#F2F2F2] font-medium border border-[#292E36] transition shadow-md group"
          >
            <span>Ver Cronograma Completo</span>
            <ChevronRight className="w-4 h-4 text-[#C9B27C] group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-[#292E36]/60 flex flex-wrap items-center justify-between gap-2 text-xs text-[#9FA4AD]">
        <div>
          <span>{config.location}</span>
          {config.city && <span> • {config.city}</span>}
        </div>
        <div>
          Programação sujeita a ajustes pela coordenação
        </div>
      </div>
    </div>
  );
};
