import React, { useState, useEffect } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import {
  formatCountdown,
  formatFullDate,
  calculateVigilDurationHours,
  getGoogleCalendarUrl,
  downloadIcsFile,
} from '../utils/timeUtils';
import {
  Clock,
  Calendar,
  MapPin,
  Sparkles,
  Share2,
  Heart,
  UserCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Volume2,
  ShieldCheck,
  Radio,
  ExternalLink,
  Plus,
  Flame,
  CalendarPlus,
  Layers,
  Lock,
} from 'lucide-react';

interface WaitingRoomScreenProps {
  onNavigate: (tab: string) => void;
  onOpenShareModal: () => void;
  onOpenDirigenteAuth: () => void;
  onOpenEditDetailsModal?: () => void;
}

export const WaitingRoomScreen: React.FC<WaitingRoomScreenProps> = ({
  onNavigate,
  onOpenShareModal,
  onOpenDirigenteAuth,
  onOpenEditDetailsModal,
}) => {
  const {
    config,
    moments,
    participants,
    addParticipant,
    prayerRequests,
    addPrayerRequest,
    incrementPrayer,
    userRole,
    isDirigenteAuthenticated,
    updateConfig,
    activeVigilCode,
  } = useVigilia();

  // Real-time ticking countdown
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(config.date, config.startTime)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdown(config.date, config.startTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [config.date, config.startTime]);

  // Early Check-in State
  const [checkinName, setCheckinName] = useState('');
  const [checkinPhone, setCheckinPhone] = useState('');
  const [checkinChurch, setCheckinChurch] = useState('');
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [showCheckinForm, setShowCheckinForm] = useState(false);

  // Early Prayer State
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [prayerAuthor, setPrayerAuthor] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [prayerSuccess, setPrayerSuccess] = useState(false);

  // Accordion for Schedule preview
  const [showScheduleAccordion, setShowScheduleAccordion] = useState(false);

  // Calendar dropdown menu
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);

  const durationHours = calculateVigilDurationHours(config.startTime, config.endTime);
  const formattedDate = formatFullDate(config.date);

  const confirmedCount = participants.filter((p) => p.status === 'confirmado' || p.status === 'presente').length;
  const approvedPrayers = prayerRequests.filter((p) => (p.status || 'aprovado') === 'aprovado').slice(0, 3);

  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinName.trim()) return;

    addParticipant({
      name: checkinName.trim(),
      phone: checkinPhone.trim() || undefined,
      church: checkinChurch.trim() || undefined,
      status: 'confirmado',
    });

    setCheckinSuccess(true);
    setCheckinName('');
    setCheckinPhone('');
    setCheckinChurch('');
    setTimeout(() => {
      setCheckinSuccess(false);
      setShowCheckinForm(false);
    }, 3000);
  };

  const handlePrayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;

    addPrayerRequest({
      authorName: isAnonymous ? 'Anônimo' : (prayerAuthor.trim() || 'Irmão(ã) em Cristo'),
      request: prayerText.trim(),
      category: 'geral',
      isAnonymous,
    });

    setPrayerSuccess(true);
    setPrayerText('');
    setPrayerAuthor('');
    setIsAnonymous(false);
    setTimeout(() => {
      setPrayerSuccess(false);
      setShowPrayerForm(false);
    }, 3000);
  };

  const handleStartVigilNow = () => {
    const now = new Date();
    const curHour = String(now.getHours()).padStart(2, '0');
    const curMin = String(now.getMinutes()).padStart(2, '0');
    const curDate = now.toISOString().split('T')[0];

    updateConfig({
      date: curDate,
      startTime: `${curHour}:${curMin}`,
      waitingMode: 'disabled',
    });
    onNavigate('inicio');
  };

  return (
    <div id="waiting-room-screen" className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* HERO BANNER & COUNTDOWN SECTION */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#191D24] to-[#0E1116] border border-[#292E36] p-6 sm:p-10 shadow-2xl text-center overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C9B27C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#0B0D10] text-[#C9B27C] border border-[#C9B27C]/40 font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Sala de Espera Oficial
            </span>
            <span className="px-3 py-1 rounded-full bg-[#14171C] text-[#9FA4AD] border border-[#292E36] font-mono text-xs">
              🔑 Código: <strong className="text-[#F2F2F2]">{activeVigilCode}</strong>
            </span>
          </div>

          {/* Title & Church */}
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#F2F2F2] tracking-tight">
              {config.vigilName || 'Grande Vigília de Oração'}
            </h1>
            <p className="text-sm sm:text-base text-[#C9B27C] font-medium mt-1.5">
              {config.churchName || 'Igreja Local'}
            </p>
            {config.theme && (
              <p className="text-xs sm:text-sm text-[#9FA4AD] mt-2 max-w-xl mx-auto italic">
                "{config.theme}"
              </p>
            )}
          </div>

          {/* COUNTDOWN CLOCK BOXES */}
          <div className="py-2">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto">
              {/* Days */}
              <div className="bg-[#0B0D10] border border-[#292E36] rounded-2xl p-3 sm:p-5 shadow-lg flex flex-col items-center">
                <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-mono text-[#F2F2F2]">
                  {String(countdown.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#9FA4AD] mt-1">
                  Dias
                </span>
              </div>

              {/* Hours */}
              <div className="bg-[#0B0D10] border border-[#292E36] rounded-2xl p-3 sm:p-5 shadow-lg flex flex-col items-center">
                <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-mono text-[#F2F2F2]">
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#9FA4AD] mt-1">
                  Horas
                </span>
              </div>

              {/* Minutes */}
              <div className="bg-[#0B0D10] border border-[#292E36] rounded-2xl p-3 sm:p-5 shadow-lg flex flex-col items-center">
                <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-mono text-[#F2F2F2]">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#9FA4AD] mt-1">
                  Minutos
                </span>
              </div>

              {/* Seconds */}
              <div className="bg-[#0B0D10] border border-[#C9B27C]/40 rounded-2xl p-3 sm:p-5 shadow-lg flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-2 bg-[#C9B27C] rounded-full animate-ping m-1.5" />
                <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-mono text-[#C9B27C]">
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#C9B27C] mt-1">
                  Segundos
                </span>
              </div>
            </div>
          </div>

          {/* Event Metadata Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-[#9FA4AD] pt-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#C9B27C]" />
              <span className="text-[#F2F2F2] capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C9B27C]" />
              <span className="text-[#F2F2F2] font-mono font-medium">
                {config.startTime} às {config.endTime} ({durationHours}h de vigília)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C9B27C]" />
              <span className="text-[#F2F2F2]">{config.location}, {config.city}</span>
            </div>
          </div>

          {/* Main Action Buttons for Participants */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {/* Add to Calendar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                className="px-4 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Salvar no Calendário</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showCalendarMenu && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-52 bg-[#14171C] border border-[#292E36] rounded-xl shadow-2xl p-1.5 z-30 text-left animate-fadeIn">
                  <a
                    href={getGoogleCalendarUrl(config)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setShowCalendarMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#F2F2F2] hover:bg-[#191D23] transition"
                  >
                    <span>📅</span>
                    <span>Google Calendar</span>
                    <ExternalLink className="w-3 h-3 ml-auto text-[#9FA4AD]" />
                  </a>
                  <button
                    onClick={() => {
                      downloadIcsFile(config);
                      setShowCalendarMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#F2F2F2] hover:bg-[#191D23] transition text-left"
                  >
                    <span>🍎</span>
                    <span>Apple / Outlook (.ics)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Share Button */}
            <button
              onClick={onOpenShareModal}
              className="px-4 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#14171C] text-[#F2F2F2] border border-[#292E36] font-semibold text-xs sm:text-sm transition flex items-center gap-2 shadow-sm"
            >
              <Share2 className="w-4 h-4 text-[#C9B27C]" />
              <span>Convidar Irmãos</span>
            </button>

            {/* Early Check-in Trigger */}
            <button
              onClick={() => setShowCheckinForm(!showCheckinForm)}
              className="px-4 py-2.5 rounded-xl bg-[#191D23] hover:bg-[#20252D] text-[#C9B27C] border border-[#292E36] font-semibold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Confirmar Presença ({confirmedCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXPANDABLE EARLY CHECK-IN FORM */}
      {showCheckinForm && (
        <div className="bg-[#14171C] border border-[#C9B27C]/40 rounded-2xl p-5 sm:p-6 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#C9B27C]" />
              <h3 className="text-base font-bold text-[#F2F2F2]">
                Confirmação Antecipada de Presença
              </h3>
            </div>
            <button
              onClick={() => setShowCheckinForm(false)}
              className="text-xs text-[#9FA4AD] hover:text-[#F2F2F2]"
            >
              Fechar ✕
            </button>
          </div>

          {checkinSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2 justify-center">
              <Check className="w-5 h-5" />
              <span>Glória a Deus! Sua presença foi confirmada com sucesso na vigília.</span>
            </div>
          ) : (
            <form onSubmit={handleCheckinSubmit} className="space-y-4">
              <p className="text-xs text-[#9FA4AD]">
                Deixe seu nome para que a coordenação prepare o espaço e os materiais com carinho.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Seu Nome Completo *"
                  value={checkinName}
                  onChange={(e) => setCheckinName(e.target.value)}
                  className="bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-xs sm:text-sm focus:border-[#C9B27C] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Igreja / Congregação (Opcional)"
                  value={checkinChurch}
                  onChange={(e) => setCheckinChurch(e.target.value)}
                  className="bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-xs sm:text-sm focus:border-[#C9B27C] focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp / Telefone (Opcional)"
                  value={checkinPhone}
                  onChange={(e) => setCheckinPhone(e.target.value)}
                  className="bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-xs sm:text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-xs sm:text-sm transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Minha Presença</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TWO COLUMNS: PRE-VIGIL FOCUS & EARLY PRAYERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* LEFT: DEVOTIONAL & PRAYER FOCUS */}
        <div className="bg-[#14171C] border border-[#292E36] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#C9B27C] font-mono text-xs uppercase font-bold tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Foco Espiritual & Preparação</span>
          </div>

          {config.waitingWelcomeMessage && (
            <p className="text-xs sm:text-sm text-[#F2F2F2] leading-relaxed bg-[#0B0D10] p-3.5 rounded-xl border border-[#292E36]">
              {config.waitingWelcomeMessage}
            </p>
          )}

          {config.waitingPrayerFocus && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9FA4AD]">
                Motivo de Intercessão da Semana:
              </span>
              <p className="text-xs sm:text-sm text-[#C9B27C] font-medium leading-snug">
                🙏 {config.waitingPrayerFocus}
              </p>
            </div>
          )}

          {/* Scripture Card */}
          <div className="pt-2 border-t border-[#292E36]/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9FA4AD] block mb-1">
              Versículo Tema:
            </span>
            <blockquote className="text-xs sm:text-sm text-[#F2F2F2] font-serif italic leading-relaxed">
              "{config.keyVerse}"
            </blockquote>
            <p className="text-[11px] text-[#C9B27C] text-right font-medium mt-1">
              — {config.verseReference}
            </p>
          </div>

          {config.additionalInfo && (
            <div className="pt-2 border-t border-[#292E36]/60 text-xs text-[#9FA4AD]">
              <strong className="text-[#F2F2F2]">Orientações: </strong>
              {config.additionalInfo}
            </div>
          )}
        </div>

        {/* RIGHT: EARLY PRAYERS & INTERCESSION */}
        <div className="bg-[#14171C] border border-[#292E36] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase font-bold tracking-wider">
              <Heart className="w-4 h-4" />
              <span>Intercessão Antecipada</span>
            </div>
            <button
              onClick={() => setShowPrayerForm(!showPrayerForm)}
              className="px-2.5 py-1 rounded-lg bg-[#0B0D10] hover:bg-[#191D23] text-[#C9B27C] border border-[#292E36] text-xs font-semibold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deixar Pedido</span>
            </button>
          </div>

          {/* Inline Prayer Form */}
          {showPrayerForm && (
            <div className="bg-[#0B0D10] border border-[#292E36] rounded-xl p-4 space-y-3 animate-fadeIn">
              {prayerSuccess ? (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Pedido enviado para intercessão! Estaremos orando.</span>
                </div>
              ) : (
                <form onSubmit={handlePrayerSubmit} className="space-y-2.5">
                  <textarea
                    required
                    rows={2}
                    placeholder="Descreva seu motivo de oração..."
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    className="w-full bg-[#14171C] text-[#F2F2F2] p-2.5 rounded-lg border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none resize-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <input
                      type="text"
                      disabled={isAnonymous}
                      placeholder={isAnonymous ? 'Anônimo' : 'Seu Nome (opcional)'}
                      value={prayerAuthor}
                      onChange={(e) => setPrayerAuthor(e.target.value)}
                      className="bg-[#14171C] text-[#F2F2F2] px-2.5 py-1.5 rounded-lg border border-[#292E36] text-xs flex-1 min-w-[120px]"
                    />
                    <label className="flex items-center gap-1.5 text-[11px] text-[#9FA4AD] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-[#292E36]"
                      />
                      <span>Anônimo</span>
                    </label>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-[#C9B27C] text-[#0B0D10] font-bold text-xs transition"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Display recent approved prayers */}
          {approvedPrayers.length > 0 ? (
            <div className="space-y-2.5">
              {approvedPrayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#0B0D10] border-l-2 border-[#C9B27C]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#F2F2F2] italic line-clamp-2">
                      "{prayer.request}"
                    </p>
                    <span className="text-[10px] text-[#9FA4AD]">
                      Por: {prayer.isAnonymous ? 'Anônimo' : prayer.authorName}
                    </span>
                  </div>
                  <button
                    onClick={() => incrementPrayer(prayer.id)}
                    className="px-2 py-1 rounded bg-[#191D23] hover:bg-[#292E36] text-[10px] font-mono text-[#C9B27C] border border-[#292E36] shrink-0 transition flex items-center gap-1"
                  >
                    <Heart className="w-3 h-3 fill-[#C9B27C]" />
                    <span>{prayer.prayersCount || 0}</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#9FA4AD] italic text-center py-4">
              Nenhum pedido cadastrado ainda. Seja o primeiro a enviar!
            </p>
          )}

          <div className="text-right">
            <button
              onClick={() => onNavigate('pedidos')}
              className="text-xs text-[#C9B27C] hover:underline"
            >
              Ver todos os pedidos de oração →
            </button>
          </div>
        </div>
      </div>

      {/* SCHEDULE PREVIEW ACCORDION (IF ENABLED) */}
      {config.showScheduleInWaiting !== false && moments.length > 0 && (
        <div className="bg-[#14171C] border border-[#292E36] rounded-2xl overflow-hidden shadow-lg">
          <button
            onClick={() => setShowScheduleAccordion(!showScheduleAccordion)}
            className="w-full p-4 sm:p-5 flex items-center justify-between bg-[#14171C] hover:bg-[#191D24] transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#C9B27C]" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F2F2F2]">
                  Prévia da Programação da Vigília ({moments.length} Blocos)
                </h3>
                <p className="text-[11px] text-[#9FA4AD]">
                  Veja como será estruturada a noite de louvor e adoração
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#C9B27C]">
              <span>{showScheduleAccordion ? 'Ocultar' : 'Ver Cronograma'}</span>
              {showScheduleAccordion ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {showScheduleAccordion && (
            <div className="p-4 sm:p-6 border-t border-[#292E36] bg-[#0B0D10]/50 space-y-3 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {moments.map((moment, idx) => (
                  <div
                    key={moment.id}
                    className="p-3 bg-[#14171C] border border-[#292E36] rounded-xl flex items-start gap-3"
                  >
                    <span className="px-2 py-1 bg-[#0B0D10] text-[#C9B27C] font-mono text-xs font-bold rounded-lg border border-[#292E36] shrink-0">
                      {moment.startTime}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#F2F2F2] truncate">
                        {moment.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[#9FA4AD] mt-0.5">
                        <span className="uppercase font-mono">{moment.type}</span>
                        {moment.responsible && <span>• Resp: {moment.responsible}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => onNavigate('cronograma')}
                  className="text-xs text-[#C9B27C] hover:underline font-semibold"
                >
                  Abrir Cronograma Completo e Detalhado →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#292E36] text-xs text-[#9FA4AD]">
        <span>
          © {config.churchName || 'Igreja'} • Sistema Oficial de Vigílias
        </span>

        {!isDirigenteAuthenticated && (
          <button
            onClick={onOpenDirigenteAuth}
            className="text-[#C9B27C] hover:underline flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Acesso de Dirigente / Pastor (Entrar com PIN)</span>
          </button>
        )}
      </div>
    </div>
  );
};
