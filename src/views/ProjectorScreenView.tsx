import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  User,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  ChevronRight,
  Tv,
} from 'lucide-react';
import { useVigilia } from '../context/VigiliaContext';
import { getCurrentMomentStatus } from '../utils/timeUtils';

export const ProjectorScreenView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { config, moments, currentTime } = useVigilia();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [secondsClock, setSecondsClock] = useState<string>('');

  useEffect(() => {
    const updateSeconds = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      setSecondsClock(`${h}:${m}:${s}`);
    };
    updateSeconds();
    const interval = setInterval(updateSeconds, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const momentStatus = useMemo(() => {
    return getCurrentMomentStatus(moments, currentTime, config.startTime, config.endTime);
  }, [moments, currentTime, config.startTime, config.endTime]);

  const { activeMoment, nextMoment, progressPercent, minutesRemaining } = momentStatus;

  return (
    <div id="projector-root" className="fixed inset-0 z-50 bg-[#0B0D10] text-[#F2F2F2] flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-sans">
      {/* Background glowing ambience */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#C9B27C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#C9B27C]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="relative flex items-center justify-between border-b border-[#292E36] pb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C9B27C]/15 border border-[#C9B27C]/30 flex items-center justify-center text-[#C9B27C]">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#C9B27C] font-bold font-mono">
              {config.churchName || 'IGREJA LOCAL'}
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-[#F2F2F2] font-serif tracking-tight">
              {config.vigilName || 'Vigília de Oração'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Digital Clock with seconds */}
          <div className="text-right font-mono">
            <span className="text-2xl sm:text-4xl font-bold tracking-wider text-[#C9B27C]">
              {secondsClock || currentTime}
            </span>
            <span className="block text-[11px] text-[#9FA4AD] uppercase tracking-wider">
              Horário Oficial
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              title="Tela Cheia"
              className="p-2.5 rounded-xl bg-[#14171C] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] transition"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              title="Fechar Telão"
              className="p-2.5 rounded-xl bg-[#14171C] hover:bg-rose-900/40 text-[#F2F2F2] hover:text-rose-400 border border-[#292E36] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Center Main Live Section */}
      <main className="relative my-auto py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* ACONTECENDO AGORA */}
          <div className="rounded-3xl bg-[#14171C] border-2 border-[#C9B27C]/50 p-8 sm:p-12 shadow-2xl shadow-[#C9B27C]/5">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm sm:text-base font-bold uppercase tracking-wider">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span>Acontecendo Agora</span>
              </div>
              <span className="font-mono text-base sm:text-xl font-bold text-[#C9B27C]">
                {activeMoment ? `${activeMoment.startTime} às ${activeMoment.endTime}` : ''}
              </span>
            </div>

            {activeMoment ? (
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-5xl font-black text-[#F2F2F2] tracking-tight leading-tight">
                  {activeMoment.title}
                </h2>

                {activeMoment.responsible && (
                  <p className="text-lg sm:text-2xl font-bold text-[#C9B27C] flex items-center gap-2">
                    <User className="w-6 h-6 text-[#C9B27C]" />
                    {activeMoment.responsible}
                  </p>
                )}

                {activeMoment.scripture && (
                  <p className="text-base sm:text-xl font-serif italic text-[#9FA4AD]">
                    📖 {activeMoment.scripture}
                  </p>
                )}

                {/* Big Progress Bar */}
                <div className="pt-6 space-y-2">
                  <div className="flex justify-between text-sm sm:text-base font-semibold text-[#9FA4AD]">
                    <span>Tempo da Atividade</span>
                    <span className="text-[#C9B27C] font-bold font-mono">
                      {minutesRemaining > 0 ? `${minutesRemaining} minutos restantes` : 'Finalizando...'}
                    </span>
                  </div>
                  <div className="w-full h-4 sm:h-5 bg-[#0B0D10] rounded-full overflow-hidden p-0.5 border border-[#292E36]">
                    <div
                      className="h-full bg-gradient-to-r from-[#C9B27C] to-[#E3D1A5] rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#F2F2F2]">
                  {momentStatus.isBeforeVigil ? 'Aguardando Início da Vigília' : 'Vigília Concluída'}
                </h2>
                <p className="text-base sm:text-lg text-[#9FA4AD] mt-2">
                  {config.theme}
                </p>
              </div>
            )}
          </div>

          {/* A SEGUIR CARD */}
          {nextMoment && (
            <div className="rounded-2xl bg-[#14171C]/80 border border-[#292E36] p-5 sm:p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#0B0D10] text-[#C9B27C] border border-[#292E36]">
                  <ChevronRight className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-[#9FA4AD] block">
                    A Seguir no Cronograma
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#F2F2F2] mt-0.5">
                    {nextMoment.title}
                  </h3>
                  {nextMoment.responsible && (
                    <p className="text-xs sm:text-sm text-[#C9B27C] font-medium">
                      {nextMoment.responsible}
                    </p>
                  )}
                </div>
              </div>

              <span className="font-mono text-lg sm:text-xl font-bold text-[#F2F2F2] bg-[#0B0D10] border border-[#292E36] px-4 py-2 rounded-xl">
                {nextMoment.startTime}
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative border-t border-[#292E36] pt-4 flex flex-wrap items-center justify-between text-xs sm:text-sm text-[#9FA4AD]">
        <div>
          <span>Tema: </span>
          <strong className="text-[#F2F2F2]">{config.theme || 'Uma noite com Deus'}</strong>
        </div>
        <div className="font-mono">
          Acompanhe no celular com o Código: <strong className="text-[#C9B27C]">{config.memberCode || config.accessCode}</strong>
        </div>
      </footer>
    </div>
  );
};
