import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  Music,
  User,
  Calendar,
  Heart,
  Bell,
  Search,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Share2,
  Flame,
  Volume2,
  BookOpen,
  MapPin,
  Church,
  Info,
  LogOut,
  Key,
} from 'lucide-react';
import { useVigilia } from '../context/VigiliaContext';
import {
  getCurrentMomentStatus,
  formatFullDate,
  calculateDurationMinutes,
  calculateTotalVigilProgress,
  formatDurationHuman,
} from '../utils/timeUtils';
import { PrayerCategory, ScheduleMoment } from '../types';

export const MemberView: React.FC<{
  onOpenDirigenteAuth?: () => void;
  onOpenProjector?: () => void;
  onLogout?: () => void;
}> = ({ onOpenDirigenteAuth, onOpenProjector, onLogout }) => {
  const {
    config,
    moments,
    repertoire,
    prayerRequests,
    addPrayerRequest,
    incrementPrayer,
    notices,
    currentTime,
    ministers,
  } = useVigilia();

  const [activeTab, setActiveTab] = useState<'agora' | 'minha_escala' | 'programacao' | 'repertorio' | 'oracoes' | 'avisos'>('agora');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const [expandedMomentId, setExpandedMomentId] = useState<string | null>(null);

  // Seconds clock for ultra-smooth countdowns in active view
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Prayer Request Form State
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('geral');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);

  // Time & Status Calculation
  const momentStatus = useMemo(() => {
    return getCurrentMomentStatus(moments, currentTime, config.startTime, config.endTime);
  }, [moments, currentTime, config.startTime, config.endTime]);

  const { activeMoment, nextMoment, upcomingMoments, progressPercent, minutesRemaining } = momentStatus;

  // Total Vigil Progress
  const totalProgress = useMemo(() => {
    return calculateTotalVigilProgress(currentTime, config.startTime, config.endTime);
  }, [currentTime, config.startTime, config.endTime]);

  // Live second-by-second countdown for the active moment
  useEffect(() => {
    if (!activeMoment) {
      setSecondsRemaining(0);
      return;
    }

    const calcSeconds = () => {
      const now = new Date();
      const currentSecondsInDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      const [eh, em] = activeMoment.endTime.split(':').map(Number);
      let endSecondsInDay = eh * 3600 + em * 60;

      const [sh, sm] = activeMoment.startTime.split(':').map(Number);
      const startSecondsInDay = sh * 3600 + sm * 60;

      if (endSecondsInDay <= startSecondsInDay) {
        endSecondsInDay += 24 * 3600;
      }
      let currentNorm = currentSecondsInDay;
      if (currentNorm < startSecondsInDay && now.getHours() < 12) {
        currentNorm += 24 * 3600;
      }

      const diff = Math.max(0, endSecondsInDay - currentNorm);
      setSecondsRemaining(diff);
    };

    calcSeconds();
    const interval = setInterval(calcSeconds, 1000);
    return () => clearInterval(interval);
  }, [activeMoment]);

  const formatSecondsToMinutesSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Active moment duration
  const activeDurationMinutes = activeMoment
    ? calculateDurationMinutes(activeMoment.startTime, activeMoment.endTime, config.startTime)
    : 0;

  // List of all distinct minister and responsible names for quick selection in "Minha Escala"
  const distinctResponsibleNames = useMemo(() => {
    const namesSet = new Set<string>();
    ministers.forEach((m) => {
      if (m.name) namesSet.add(m.name.trim());
    });
    moments.forEach((m) => {
      if (m.responsible) namesSet.add(m.responsible.trim());
    });
    repertoire.forEach((s) => {
      if (s.responsible) namesSet.add(s.responsible.trim());
    });
    return Array.from(namesSet).sort();
  }, [ministers, moments, repertoire]);

  // "Minha Escala" items
  const myMoments = useMemo(() => {
    if (!selectedMemberName.trim()) return [];
    const term = selectedMemberName.toLowerCase().trim();
    return moments.filter((m) => m.responsible && m.responsible.toLowerCase().includes(term));
  }, [moments, selectedMemberName]);

  const mySongs = useMemo(() => {
    if (!selectedMemberName.trim()) return [];
    const term = selectedMemberName.toLowerCase().trim();
    return repertoire.filter((s) => s.responsible && s.responsible.toLowerCase().includes(term));
  }, [repertoire, selectedMemberName]);

  // Filtered Moments for Programação
  const filteredMoments = useMemo(() => {
    if (!searchTerm.trim()) return moments;
    const term = searchTerm.toLowerCase();
    return moments.filter(
      (m) =>
        m.title.toLowerCase().includes(term) ||
        (m.responsible && m.responsible.toLowerCase().includes(term)) ||
        (m.description && m.description.toLowerCase().includes(term)) ||
        (m.scripture && m.scripture.toLowerCase().includes(term))
    );
  }, [moments, searchTerm]);

  // WhatsApp sharing message
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `⛪ *${config.churchName || 'Igreja Local'}*\n` +
      `🌙 *${config.vigilName || 'Vigília de Oração'}*\n` +
      (config.theme ? `Tema: _"${config.theme}"_\n` : '') +
      `📅 Data: ${formatFullDate(config.date)}\n` +
      `⏰ Horário: ${config.startTime} às ${config.endTime}\n` +
      `🔑 Código da Vigília: *${config.memberCode || config.accessCode}*\n\n` +
      `Acompanhe a programação ao vivo e louvores pelo link:\n${window.location.origin}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;

    addPrayerRequest({
      authorName: isAnonymous ? 'Anônimo' : authorName.trim() || 'Participante',
      request: prayerText.trim(),
      category,
      isAnonymous,
    });

    setPrayerText('');
    setAuthorName('');
    setIsAnonymous(false);
    setPrayerSubmitted(true);
    setTimeout(() => {
      setPrayerSubmitted(false);
      setShowPrayerModal(false);
    }, 1800);
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
    <div id="member-root" className="min-h-screen bg-[#0B0D10] text-[#F2F2F2] pb-24 font-sans selection:bg-[#C9B27C]/30">
      {/* Top Header Card (Reverent, Liturgical & Clean) */}
      <header className="relative overflow-hidden border-b border-[#292E36] bg-gradient-to-b from-[#191D24] via-[#14171C] to-[#0B0D10] px-4 pt-6 pb-6 text-center">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-36 bg-[#C9B27C]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-xl mx-auto space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B0D10] border border-[#C9B27C]/30 text-[#C9B27C] text-xs font-semibold uppercase tracking-wider">
              <Church className="w-3.5 h-3.5" />
              <span>{config.churchName || 'Igreja Local'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#14171C] border border-[#292E36] text-[11px] font-mono text-[#9FA4AD]">
                Código: <strong className="text-[#C9B27C]">{config.memberCode || config.accessCode}</strong>
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Trocar de código / Sair"
                  className="p-1.5 rounded-lg bg-[#14171C] hover:bg-[#1f242d] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] transition text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F2F2F2] font-serif">
            {config.vigilName || 'Vigília de Oração e Louvor'}
          </h1>

          {config.theme && (
            <p className="text-[#C9B27C] text-sm sm:text-base font-medium font-serif italic">
              "{config.theme}"
            </p>
          )}

          {config.keyVerse && (
            <div className="bg-[#14171C]/90 border border-[#292E36] rounded-xl p-3 text-xs text-[#9FA4AD] italic max-w-md mx-auto shadow-inner">
              <span>"{config.keyVerse}"</span>
              {config.verseReference && (
                <span className="block mt-1 font-bold text-[#C9B27C] not-italic text-[11px]">
                  — {config.verseReference}
                </span>
              )}
            </div>
          )}

          {/* Date, Time and Share Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-[#9FA4AD]">
            <span className="inline-flex items-center gap-1.5 bg-[#14171C] px-3 py-1 rounded-lg border border-[#292E36] text-[#F2F2F2]">
              <Calendar className="w-3.5 h-3.5 text-[#C9B27C]" />
              {formatFullDate(config.date)}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#14171C] px-3 py-1 rounded-lg border border-[#292E36] text-[#F2F2F2]">
              <Clock className="w-3.5 h-3.5 text-[#C9B27C]" />
              {config.startTime} → {config.endTime}
            </span>
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg font-semibold transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp
            </button>
          </div>
        </div>
      </header>

      {/* Discrete Overall Vigil Progress Bar */}
      <div className="bg-[#14171C] border-b border-[#292E36] px-4 py-2">
        <div className="max-w-xl mx-auto flex items-center justify-between text-[11px] text-[#9FA4AD] gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-[#F2F2F2] font-semibold">Vigília</span>
            <span>{config.startTime} → {config.endTime}</span>
          </div>
          <div className="flex-1 max-w-[140px] sm:max-w-[200px] h-2 bg-[#0B0D10] rounded-full overflow-hidden border border-[#292E36]">
            <div
              className="h-full bg-[#C9B27C] rounded-full transition-all duration-700"
              style={{ width: `${totalProgress.percent}%` }}
            />
          </div>
          <span className="font-mono font-bold text-[#C9B27C]">
            {totalProgress.percent}% concluída
          </span>
        </div>
      </div>

      {/* Clean Navigation Tabs */}
      <nav className="sticky top-0 z-30 bg-[#0B0D10]/95 backdrop-blur-md border-b border-[#292E36] px-2 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-start sm:justify-center gap-1.5 min-w-max max-w-xl mx-auto px-2">
          <button
            onClick={() => setActiveTab('agora')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'agora'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${activeTab === 'agora' ? 'text-[#0B0D10]' : 'text-rose-400 animate-pulse'}`} />
            🔴 Agora & Próximo
          </button>

          <button
            onClick={() => setActiveTab('minha_escala')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'minha_escala'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            👤 Minha Escala
          </button>

          <button
            onClick={() => setActiveTab('programacao')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'programacao'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            📋 Programação
          </button>

          <button
            onClick={() => setActiveTab('repertorio')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'repertorio'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            🎵 Repertório ({repertoire.length})
          </button>

          <button
            onClick={() => setActiveTab('oracoes')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'oracoes'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            🙏 Orações
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-4 pt-5 space-y-5">
        {/* ===================== TAB: AGORA ===================== */}
        {activeTab === 'agora' && (
          <div className="space-y-4 animate-fadeIn">
            {/* 🔴 AGORA CARD */}
            <div className="rounded-3xl bg-gradient-to-br from-[#191D24] via-[#14171C] to-[#0E1116] border-2 border-[#C9B27C]/40 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>🔴 AGORA</span>
                </div>
                <div className="text-xs font-mono font-bold text-[#9FA4AD] bg-[#0B0D10] px-2.5 py-1 rounded-lg border border-[#292E36]">
                  Horário Atual: <span className="text-[#F2F2F2]">{currentTime}</span>
                </div>
              </div>

              {activeMoment ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#F2F2F2] leading-tight">
                      {getMomentTypeIcon(activeMoment.type)} {activeMoment.title}
                    </h2>
                    {activeMoment.responsible && (
                      <p className="text-sm font-semibold text-[#C9B27C] flex items-center gap-1.5 mt-1.5">
                        <User className="w-4 h-4 text-[#C9B27C]" />
                        <span>{activeMoment.responsible}</span>
                      </p>
                    )}
                  </div>

                  {/* Horário & Duração */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 bg-[#0B0D10] px-3 py-1.5 rounded-xl border border-[#292E36] font-mono text-[#F2F2F2] font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#C9B27C]" />
                      {activeMoment.startTime} → {activeMoment.endTime}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#0B0D10] px-3 py-1.5 rounded-xl border border-[#292E36] text-[#9FA4AD] font-medium">
                      {formatDurationHuman(activeDurationMinutes)}
                    </span>
                  </div>

                  {activeMoment.description && (
                    <p className="text-xs sm:text-sm text-[#9FA4AD] bg-[#0B0D10]/80 p-3 rounded-xl border border-[#292E36] leading-relaxed">
                      {activeMoment.description}
                    </p>
                  )}

                  {activeMoment.scripture && (
                    <div className="text-xs font-serif italic text-[#C9B27C] flex items-center gap-1.5">
                      <span>📖 Texto Base:</span>
                      <strong className="not-italic">{activeMoment.scripture}</strong>
                    </div>
                  )}

                  {/* Dynamic Progress Bar & Countdown */}
                  <div className="space-y-2 pt-2 border-t border-[#292E36]">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#9FA4AD]">Progresso</span>
                      <span className="text-[#C9B27C] font-mono font-bold">
                        {secondsRemaining > 0
                          ? `Restam ${formatSecondsToMinutesSeconds(secondsRemaining)}`
                          : minutesRemaining > 0
                          ? `Restam ${minutesRemaining} min`
                          : 'Finalizando atividade'}
                      </span>
                    </div>

                    <div className="w-full h-3 bg-[#0B0D10] border border-[#292E36] rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#C9B27C] to-[#E3D1A5] rounded-full transition-all duration-700"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <Clock className="w-10 h-10 text-[#C9B27C] mx-auto opacity-70" />
                  <h3 className="text-base font-bold text-[#F2F2F2]">
                    {momentStatus.isBeforeVigil ? 'Aguardando Início da Vigília' : 'Vigília Concluída'}
                  </h3>
                  <p className="text-xs text-[#9FA4AD] max-w-xs mx-auto">
                    {momentStatus.isBeforeVigil
                      ? `Início pontual às ${config.startTime}. Acompanhe com reverência e oração.`
                      : 'Todas as atividades foram concluídas com sucesso. Deus abençoe!'}
                  </p>
                </div>
              )}
            </div>

            {/* ⏭️ PRÓXIMO CARD */}
            {nextMoment && (
              <div className="rounded-2xl bg-[#14171C] border border-[#292E36] p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#9FA4AD] uppercase tracking-wider flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 text-[#C9B27C]" />
                    <span>⏭️ PRÓXIMO NO CRONOGRAMA</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-[#C9B27C] bg-[#0B0D10] px-2.5 py-0.5 rounded-lg border border-[#292E36]">
                    {nextMoment.startTime} → {nextMoment.endTime}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                    {getMomentTypeIcon(nextMoment.type)} {nextMoment.title}
                  </h3>
                  {nextMoment.responsible && (
                    <p className="text-xs text-[#C9B27C] font-semibold flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{nextMoment.responsible}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-[#9FA4AD]">
                    Duração: {formatDurationHuman(calculateDurationMinutes(nextMoment.startTime, nextMoment.endTime, config.startTime))}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Prayer Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-rose-950/30 via-[#14171C] to-[#14171C] border border-rose-900/40 p-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-rose-200 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" />
                  Precisa de Oração?
                </h4>
                <p className="text-[11px] text-[#9FA4AD] mt-0.5">
                  Envie seu pedido para a equipe de intercessão orar por você.
                </p>
              </div>
              <button
                onClick={() => setShowPrayerModal(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md whitespace-nowrap transition"
              >
                Pedir Oração
              </button>
            </div>
          </div>
        )}

        {/* ===================== TAB: MINHA ESCALA ===================== */}
        {activeTab === 'minha_escala' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="rounded-2xl bg-[#14171C] border border-[#292E36] p-4 space-y-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#C9B27C]/15 text-[#C9B27C] flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#F2F2F2]">👤 MINHA ESCALA</h2>
                  <p className="text-[11px] text-[#9FA4AD]">Selecione ou digite seu nome para ver seus momentos</p>
                </div>
              </div>

              {/* Selector or input for name */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-bold text-[#9FA4AD] uppercase tracking-wider block">
                  Escolha seu nome na lista:
                </label>
                <select
                  value={selectedMemberName}
                  onChange={(e) => setSelectedMemberName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs font-semibold text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] transition"
                >
                  <option value="">-- Selecione seu nome / ministério --</option>
                  {distinctResponsibleNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>

                <div className="text-center text-[10px] text-[#9FA4AD]">ou digite abaixo para buscar</div>

                <input
                  type="text"
                  placeholder="Digite seu nome ou ministério..."
                  value={selectedMemberName}
                  onChange={(e) => setSelectedMemberName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] placeholder-[#9FA4AD]/40 focus:outline-none focus:border-[#C9B27C] transition"
                />
              </div>
            </div>

            {/* Results Display */}
            {selectedMemberName.trim() ? (
              <div className="space-y-3">
                <div className="bg-[#14171C] border border-[#C9B27C]/30 rounded-xl p-3 text-xs text-[#C9B27C] font-semibold flex items-center justify-between">
                  <span>
                    Você participa de <strong>{myMoments.length + mySongs.length} momento(s)</strong> na vigília:
                  </span>
                  <span className="font-mono text-[11px] bg-[#0B0D10] px-2 py-0.5 rounded border border-[#292E36]">
                    {selectedMemberName}
                  </span>
                </div>

                {myMoments.length === 0 && mySongs.length === 0 ? (
                  <div className="rounded-2xl bg-[#14171C] border border-[#292E36] p-8 text-center text-xs text-[#9FA4AD]">
                    Nenhum momento encontrado para "{selectedMemberName}". Verifique a grafia ou selecione na lista acima.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Moments in schedule */}
                    {myMoments.map((mom) => {
                      const isExpanded = expandedMomentId === mom.id;
                      const duration = calculateDurationMinutes(mom.startTime, mom.endTime, config.startTime);
                      return (
                        <div
                          key={mom.id}
                          onClick={() => setExpandedMomentId(isExpanded ? null : mom.id)}
                          className="rounded-2xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/40 p-4 transition-all cursor-pointer shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="text-center min-w-[55px] bg-[#0B0D10] p-2 rounded-xl border border-[#292E36]">
                                <span className="font-mono text-xs font-bold text-[#C9B27C] block">
                                  {mom.startTime}
                                </span>
                                <span className="text-[10px] text-[#9FA4AD] block">
                                  {mom.endTime}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-sm sm:text-base font-bold text-[#F2F2F2] flex items-center gap-1.5">
                                  <span>{getMomentTypeIcon(mom.type)}</span>
                                  <span>{mom.title}</span>
                                </h3>
                                <p className="text-xs text-[#9FA4AD] mt-0.5">
                                  Duração: {formatDurationHuman(duration)}
                                </p>
                              </div>
                            </div>
                            <div className="text-[#9FA4AD] p-1">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-[#292E36] text-xs space-y-2 text-[#9FA4AD] animate-fadeIn">
                              {mom.description && (
                                <div>
                                  <strong className="text-[#F2F2F2] block mb-0.5">Descrição:</strong>
                                  <p className="bg-[#0B0D10] p-2.5 rounded-lg border border-[#292E36] text-xs leading-relaxed text-[#F2F2F2]">
                                    {mom.description}
                                  </p>
                                </div>
                              )}
                              {mom.scripture && (
                                <div className="flex items-center gap-1.5 text-[#C9B27C]">
                                  <span>📖 Texto Bíblico:</span>
                                  <strong>{mom.scripture}</strong>
                                </div>
                              )}
                              <p className="text-[11px] text-[#C9B27C]/80 italic">
                                * Por favor, esteja pronto 10 minutos antes do seu horário no púlpito/altar.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Songs in repertoire */}
                    {mySongs.map((song) => (
                      <div
                        key={song.id}
                        className="rounded-2xl bg-[#14171C] border border-[#292E36] p-4 flex items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-xl bg-[#0B0D10] text-[#C9B27C] border border-[#292E36]">
                            🎵
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-[#F2F2F2]">{song.title}</h4>
                            <p className="text-xs text-[#9FA4AD]">{song.artist || 'Ministério de Louvor'}</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#C9B27C] bg-[#0B0D10] px-2.5 py-1 rounded-lg border border-[#292E36]">
                          Tom {song.key}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#14171C]/60 border border-[#292E36] p-8 text-center space-y-2">
                <User className="w-8 h-8 text-[#C9B27C] mx-auto opacity-80" />
                <h3 className="text-sm font-bold text-[#F2F2F2]">Consulte seus momentos na Vigília</h3>
                <p className="text-xs text-[#9FA4AD] max-w-xs mx-auto">
                  Selecione seu nome na caixa acima para visualizar exclusivamente os horários que você irá ministrar, orar ou cantar.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: PROGRAMAÇÃO ===================== */}
        {activeTab === 'programacao' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9FA4AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por momento, responsável ou texto bíblico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14171C] border border-[#292E36] text-[#F2F2F2] placeholder-[#9FA4AD]/40 text-xs focus:outline-none focus:border-[#C9B27C] transition"
              />
            </div>

            {/* List of Moments */}
            <div className="space-y-2.5">
              {filteredMoments.map((mom) => {
                const isCurrent = activeMoment?.id === mom.id;
                const duration = calculateDurationMinutes(mom.startTime, mom.endTime, config.startTime);

                return (
                  <div
                    key={mom.id}
                    className={`rounded-2xl p-4 border transition ${
                      isCurrent
                        ? 'bg-[#C9B27C]/10 border-[#C9B27C]/50 shadow-xl'
                        : 'bg-[#14171C] border-[#292E36] hover:border-[#292E36]/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="text-center min-w-[55px] bg-[#0B0D10] p-2 rounded-xl border border-[#292E36]">
                          <span className={`font-mono text-xs font-bold block ${isCurrent ? 'text-[#C9B27C]' : 'text-[#F2F2F2]'}`}>
                            {mom.startTime}
                          </span>
                          <span className="text-[10px] text-[#9FA4AD] block font-mono">
                            {mom.endTime}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm sm:text-base font-bold ${isCurrent ? 'text-[#C9B27C]' : 'text-[#F2F2F2]'}`}>
                              {getMomentTypeIcon(mom.type)} {mom.title}
                            </h3>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                                Agora
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9FA4AD]">
                            {mom.responsible && (
                              <span className="text-[#C9B27C] font-semibold">
                                👤 {mom.responsible}
                              </span>
                            )}
                            <span>•</span>
                            <span>{formatDurationHuman(duration)}</span>
                          </div>

                          {mom.scripture && (
                            <p className="text-[11px] font-serif italic text-[#9FA4AD]">
                              📖 {mom.scripture}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================== TAB: REPERTÓRIO ===================== */}
        {activeTab === 'repertorio' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="rounded-2xl bg-[#14171C] border border-[#292E36] p-4 flex items-center justify-between gap-3 shadow-lg">
              <div>
                <h2 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                  <span>🎵 REPERTÓRIO DA VIGÍLIA</span>
                </h2>
                <p className="text-xs text-[#9FA4AD]">Louvores e cânticos selecionados para a noite</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#0B0D10] text-[#C9B27C] border border-[#C9B27C]/30 text-xs font-mono font-bold">
                {repertoire.length} louvores
              </span>
            </div>

            {repertoire.length === 0 ? (
              <div className="rounded-2xl bg-[#14171C] border border-[#292E36] p-8 text-center text-xs text-[#9FA4AD]">
                Nenhum louvor cadastrado no repertório ainda.
              </div>
            ) : (
              <div className="space-y-2.5">
                {repertoire.map((song, index) => (
                  <div
                    key={song.id || index}
                    className="rounded-2xl bg-[#14171C] border border-[#292E36] p-4 flex items-center justify-between gap-3 shadow-md hover:border-[#C9B27C]/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-[#0B0D10] text-[#C9B27C] border border-[#292E36] flex items-center justify-center font-bold text-xs font-mono">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-[#F2F2F2]">{song.title}</h4>
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

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold text-[#C9B27C] bg-[#0B0D10] px-3 py-1.5 rounded-xl border border-[#292E36] block">
                        Tom {song.key}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: ORAÇÕES ===================== */}
        {activeTab === 'oracoes' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="rounded-2xl bg-[#14171C] border border-[#292E36] p-4 flex items-center justify-between gap-3 shadow-lg">
              <div>
                <h2 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>MURAL DE ORAÇÕES</span>
                </h2>
                <p className="text-xs text-[#9FA4AD]">Ore pelos irmãos e envie seu motivo de clamor</p>
              </div>
              <button
                onClick={() => setShowPrayerModal(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition"
              >
                + Pedir Oração
              </button>
            </div>

            <div className="space-y-3">
              {prayerRequests.length === 0 ? (
                <div className="rounded-2xl bg-[#14171C] border border-[#292E36] p-8 text-center text-xs text-[#9FA4AD]">
                  Nenhum pedido de oração cadastrado ainda. Seja o primeiro a pedir oração!
                </div>
              ) : (
                prayerRequests.map((prayer) => (
                  <div
                    key={prayer.id}
                    className="rounded-2xl bg-[#14171C] border border-[#292E36] p-4 space-y-2 shadow-md"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#F2F2F2] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#C9B27C]" />
                        {prayer.authorName}
                      </span>
                      <span className="text-[10px] text-[#9FA4AD] uppercase bg-[#0B0D10] px-2 py-0.5 rounded border border-[#292E36]">
                        {prayer.category}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#F2F2F2] leading-relaxed bg-[#0B0D10] p-3 rounded-xl border border-[#292E36]">
                      "{prayer.request}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#9FA4AD]">
                        🙏 {prayer.prayersCount || 0} orações realizadas
                      </span>
                      <button
                        onClick={() => incrementPrayer(prayer.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        <span>Estou Orando</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Prayer Request Modal */}
      {showPrayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D10]/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#14171C] border border-[#292E36] p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
              <h3 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Enviar Pedido de Oração</span>
              </h3>
              <button
                onClick={() => setShowPrayerModal(false)}
                className="text-[#9FA4AD] hover:text-[#F2F2F2] text-xs font-semibold p-1"
              >
                Fechar
              </button>
            </div>

            {prayerSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-[#F2F2F2]">Pedido Enviado!</h4>
                <p className="text-xs text-[#9FA4AD]">
                  Estaremos intercedendo por você durante a vigília. Deus te abençoe!
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreatePrayer} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-[#9FA4AD] uppercase tracking-wider block mb-1">
                    Seu Nome (opcional):
                  </label>
                  <input
                    type="text"
                    disabled={isAnonymous}
                    placeholder="Seu nome"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonCheck"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded bg-[#0B0D10] border-[#292E36] text-[#C9B27C] focus:ring-0"
                  />
                  <label htmlFor="anonCheck" className="text-xs text-[#9FA4AD] cursor-pointer">
                    Manter pedido como Anônimo
                  </label>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#9FA4AD] uppercase tracking-wider block mb-1">
                    Categoria:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PrayerCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  >
                    <option value="geral">Geral / Vida Cristã</option>
                    <option value="saude">Saúde / Cura</option>
                    <option value="familia">Família / Lar</option>
                    <option value="espiritual">Vida Espiritual</option>
                    <option value="trabalho">Trabalho / Finanças</option>
                    <option value="libertacao">Libertação</option>
                    <option value="gratidao">Gratidão / Louvor</option>
                    <option value="jovens">Juventude</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#9FA4AD] uppercase tracking-wider block mb-1">
                    Motivo de Oração:
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Escreva seu motivo de oração..."
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition"
                >
                  Enviar Motivo de Oração
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
