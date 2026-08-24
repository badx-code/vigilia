import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Share2,
  Lock,
  Flame,
  Volume2,
  Compass,
} from 'lucide-react';
import { useVigilia } from '../context/VigiliaContext';
import { getCurrentMomentStatus, formatFullDate } from '../utils/timeUtils';
import { PrayerCategory } from '../types';

export const MemberView: React.FC<{
  onOpenDirigenteAuth?: () => void;
  onOpenProjector?: () => void;
  onOpenAuthModal?: () => void;
}> = ({ onOpenDirigenteAuth, onOpenProjector, onOpenAuthModal }) => {
  const handleOpenAuth = onOpenDirigenteAuth || onOpenAuthModal;
  const {
    config,
    moments,
    repertoire,
    prayerRequests,
    addPrayerRequest,
    incrementPrayer,
    notices,
    currentTime,
  } = useVigilia();

  const [activeTab, setActiveTab] = useState<'ao_vivo' | 'escala' | 'repertorio' | 'minha_escala' | 'oracao' | 'avisos'>('ao_vivo');
  const [searchTerm, setSearchTerm] = useState('');
  const [myScaleSearch, setMyScaleSearch] = useState('');

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

  // Filtered Moments for Schedule Tab
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

  // "Minha Escala" calculation
  const myScaleItems = useMemo(() => {
    if (!myScaleSearch.trim()) return [];
    const term = myScaleSearch.toLowerCase();
    return moments.filter((m) => m.responsible && m.responsible.toLowerCase().includes(term));
  }, [moments, myScaleSearch]);

  const myScaleSongs = useMemo(() => {
    if (!myScaleSearch.trim()) return [];
    const term = myScaleSearch.toLowerCase();
    return repertoire.filter((s) => s.responsible && s.responsible.toLowerCase().includes(term));
  }, [repertoire, myScaleSearch]);

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `⛪ *${config.churchName}*\n🌟 *${config.vigilName}*\n\nAcompanhe a programação ao vivo pelo link: ${window.location.origin}\nCódigo de Acesso: *${config.memberCode || config.accessCode}*`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;

    addPrayerRequest({
      authorName: isAnonymous ? 'Anônimo' : authorName.trim() || 'Irmão(ã) em Cristo',
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

  return (
    <div id="member-root" className="min-h-screen bg-[#0B0D10] text-[#F2F2F2] pb-20 font-sans selection:bg-[#C9B27C]/30">
      {/* Top Header Card */}
      <header id="member-header" className="relative overflow-hidden border-b border-[#292E36] bg-gradient-to-b from-[#191D24] via-[#14171C] to-[#0B0D10] px-4 pt-6 pb-6 text-center">
        {/* Subtle glowing accents */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#C9B27C]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B0D10] border border-[#C9B27C]/30 text-[#C9B27C] text-xs font-semibold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{config.churchName || 'Igreja Local'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F2F2F2] mb-2 leading-tight font-serif">
            {config.vigilName || 'Vigília de Oração'}
          </h1>

          {config.theme && (
            <p className="text-[#9FA4AD] text-sm font-medium mb-3 max-w-md mx-auto line-clamp-2">
              "{config.theme}"
            </p>
          )}

          {config.keyVerse && (
            <div className="bg-[#14171C] border border-[#292E36] rounded-xl p-3 text-xs text-[#9FA4AD] italic mb-4 max-w-md mx-auto shadow-inner">
              <span className="text-[#C9B27C] font-semibold not-italic">📖 </span>
              "{config.keyVerse}"
              {config.verseReference && (
                <span className="block mt-1 font-bold text-[#C9B27C] not-italic text-[11px]">
                  — {config.verseReference}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#9FA4AD]">
            <span className="inline-flex items-center gap-1 bg-[#14171C] px-2.5 py-1 rounded-lg border border-[#292E36] text-[#F2F2F2]">
              <Calendar className="w-3.5 h-3.5 text-[#C9B27C]" />
              {formatFullDate(config.date)}
            </span>
            <span className="inline-flex items-center gap-1 bg-[#14171C] px-2.5 py-1 rounded-lg border border-[#292E36] text-[#F2F2F2]">
              <Clock className="w-3.5 h-3.5 text-[#C9B27C]" />
              {config.startTime} às {config.endTime}
            </span>
            <button
              id="btn-member-share"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-medium transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartilhar
            </button>
          </div>
        </div>
      </header>

      {/* Modern Tab Navigation Pills */}
      <nav id="member-nav" className="sticky top-0 z-30 bg-[#0B0D10]/95 backdrop-blur-md border-b border-[#292E36] px-2 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-start sm:justify-center gap-1.5 min-w-max max-w-xl mx-auto px-2">
          <button
            id="tab-btn-ao-vivo"
            onClick={() => setActiveTab('ao_vivo')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'ao_vivo'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${activeTab === 'ao_vivo' ? 'text-[#0B0D10] animate-pulse' : 'text-[#C9B27C]'}`} />
            Ao Vivo
          </button>

          <button
            id="tab-btn-escala"
            onClick={() => setActiveTab('escala')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'escala'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Cronograma
          </button>

          <button
            id="tab-btn-repertorio"
            onClick={() => setActiveTab('repertorio')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'repertorio'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Repertório ({repertoire.length})
          </button>

          <button
            id="tab-btn-minha-escala"
            onClick={() => setActiveTab('minha_escala')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'minha_escala'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Minha Escala
          </button>

          <button
            id="tab-btn-oracao"
            onClick={() => setActiveTab('oracao')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'oracao'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Oração ({prayerRequests.length})
          </button>

          <button
            id="tab-btn-avisos"
            onClick={() => setActiveTab('avisos')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'avisos'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
                : 'bg-[#14171C] text-[#9FA4AD] hover:bg-[#191D24] border border-[#292E36]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Avisos ({notices.length})
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 pt-5">
        {/* ===================== TAB: AO VIVO ===================== */}
        {activeTab === 'ao_vivo' && (
          <div id="section-ao-vivo" className="space-y-4">
            {/* Live Card: AGORA */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#191D24] via-[#14171C] to-[#0B0D10] border-2 border-[#C9B27C]/40 p-5 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Acontecendo Agora</span>
                </div>
                <div className="text-xs font-mono font-semibold text-[#9FA4AD]">
                  Horário: <span className="text-[#F2F2F2] font-bold">{currentTime}</span>
                </div>
              </div>

              {activeMoment ? (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F2F2F2] mb-2">
                    {activeMoment.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-[#9FA4AD] mb-4">
                    {activeMoment.responsible && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#C9B27C] bg-[#C9B27C]/10 px-2.5 py-1 rounded-lg border border-[#C9B27C]/20">
                        <User className="w-3.5 h-3.5" />
                        {activeMoment.responsible}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-[#F2F2F2] bg-[#0B0D10] border border-[#292E36] px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-[#C9B27C]" />
                      {activeMoment.startTime} às {activeMoment.endTime}
                    </span>
                  </div>

                  {activeMoment.description && (
                    <p className="text-xs sm:text-sm text-[#9FA4AD] leading-relaxed mb-4 bg-[#0B0D10]/80 p-3 rounded-xl border border-[#292E36]">
                      {activeMoment.description}
                    </p>
                  )}

                  {activeMoment.scripture && (
                    <div className="text-xs font-serif italic text-[#C9B27C]/90 mb-4 flex items-center gap-1.5">
                      <span>📖 Texto Base:</span>
                      <span className="font-semibold">{activeMoment.scripture}</span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-[#292E36]">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#9FA4AD]">Progresso da atividade</span>
                      <span className="text-[#C9B27C] font-bold font-mono">
                        {minutesRemaining > 0 ? `${minutesRemaining} min restantes` : 'Finalizando...'}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#0B0D10] border border-[#292E36] rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#C9B27C] to-[#bfa872] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="w-10 h-10 text-[#C9B27C] mx-auto mb-2 opacity-80" />
                  <h3 className="text-lg font-bold text-[#F2F2F2] mb-1">
                    {momentStatus.isBeforeVigil ? 'Aguardando Início da Vigília' : 'Vigília Concluída'}
                  </h3>
                  <p className="text-xs text-[#9FA4AD] max-w-sm mx-auto">
                    {momentStatus.isBeforeVigil
                      ? `A vigília começará pontualmente às ${config.startTime}. Prepare seu coração em oração!`
                      : 'Obrigado por participar desta noite abençoada na presença do Senhor.'}
                  </p>
                </div>
              )}
            </div>

            {/* Next Card: A SEGUIR */}
            {nextMoment && (
              <div className="rounded-2xl bg-[#14171C] border border-[#292E36] p-4 shadow-md">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#9FA4AD] uppercase tracking-wider mb-2">
                  <ChevronRight className="w-4 h-4 text-[#C9B27C]" />
                  <span>A Seguir</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                      {nextMoment.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#9FA4AD]">
                      <span className="text-[#C9B27C] font-medium">{nextMoment.startTime}</span>
                      <span>•</span>
                      <span>{nextMoment.responsible || 'Equipe Geral'}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold bg-[#0B0D10] text-[#C9B27C] px-2 py-1 rounded-lg border border-[#292E36]">
                    Próximo
                  </span>
                </div>
              </div>
            )}

            {/* Upcoming Next 2 Moments */}
            {upcomingMoments.length > 0 && (
              <div className="rounded-2xl bg-[#14171C]/70 border border-[#292E36] p-4">
                <h4 className="text-xs font-bold text-[#9FA4AD] uppercase tracking-wider mb-3">
                  Próximos Momentos da Madrugada
                </h4>
                <div className="space-y-2.5">
                  {upcomingMoments.map((mom, idx) => (
                    <div
                      key={mom.id || idx}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-[#C9B27C] w-11">{mom.startTime}</span>
                        <div>
                          <p className="font-medium text-[#F2F2F2]">{mom.title}</p>
                          <p className="text-[11px] text-[#9FA4AD]">{mom.responsible || '—'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#9FA4AD] uppercase">{mom.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Prayer Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-rose-950/30 via-[#14171C] to-[#191D24] border border-rose-900/40 p-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-rose-200 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" />
                  Precisa de Oração?
                </h4>
                <p className="text-xs text-[#9FA4AD] mt-0.5">
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

        {/* ===================== TAB: CRONOGRAMA ===================== */}
        {activeTab === 'escala' && (
          <div id="section-escala" className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9FA4AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar atividade, responsável ou horário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14171C] border border-[#292E36] text-[#F2F2F2] placeholder-[#9FA4AD]/50 text-xs focus:outline-none focus:border-[#C9B27C] transition"
              />
            </div>

            {/* Moments Table List */}
            <div className="space-y-2.5">
              {filteredMoments.map((mom, idx) => {
                const isCurrent = activeMoment?.id === mom.id;
                return (
                  <div
                    key={mom.id || idx}
                    className={`rounded-xl p-3.5 border transition ${
                      isCurrent
                        ? 'bg-[#C9B27C]/10 border-[#C9B27C]/50 shadow-lg'
                        : 'bg-[#14171C] border-[#292E36] hover:border-[#292E36]/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="text-center min-w-[50px]">
                          <span className={`font-mono text-xs font-bold block ${isCurrent ? 'text-[#C9B27C]' : 'text-[#F2F2F2]'}`}>
                            {mom.startTime}
                          </span>
                          <span className="text-[10px] text-[#9FA4AD] block">
                            às {mom.endTime}
                          </span>
                        </div>
                        <div className="border-l border-[#292E36] pl-3">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-bold ${isCurrent ? 'text-[#C9B27C]' : 'text-[#F2F2F2]'}`}>
                              {mom.title}
                            </h4>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                                Agora
                              </span>
                            )}
                          </div>

                          {mom.responsible && (
                            <p className="text-xs text-[#C9B27C]/90 font-medium mt-0.5 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {mom.responsible}
                            </p>
                          )}

                          {mom.scripture && (
                            <p className="text-[11px] text-[#9FA4AD] italic mt-1">
                              📖 {mom.scripture}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#0B0D10] text-[#9FA4AD] border border-[#292E36] shrink-0">
                        {mom.type}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredMoments.length === 0 && (
                <div className="text-center py-10 bg-[#14171C] rounded-2xl border border-[#292E36]">
                  <p className="text-xs text-[#9FA4AD]">Nenhuma atividade encontrada com "{searchTerm}".</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: REPERTÓRIO ===================== */}
        {activeTab === 'repertorio' && (
          <div id="section-repertorio" className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#F2F2F2]">Repertório de Louvores</h3>
                <p className="text-xs text-[#9FA4AD]">Músicas e cânticos para acompanhar na vigília</p>
              </div>
              <span className="text-xs font-bold text-[#C9B27C] bg-[#C9B27C]/10 px-2.5 py-1 rounded-lg border border-[#C9B27C]/20">
                {repertoire.length} Louvores
              </span>
            </div>

            <div className="space-y-2.5">
              {repertoire.map((song, idx) => (
                <div
                  key={song.id || idx}
                  className="rounded-xl bg-[#14171C] border border-[#292E36] p-3.5 hover:border-[#C9B27C]/30 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#0B0D10] text-[#C9B27C] border border-[#292E36] font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#F2F2F2]">{song.title}</h4>
                        <p className="text-xs text-[#9FA4AD]">{song.artist || 'Cantor / Ministério'}</p>

                        {song.responsible && (
                          <p className="text-[11px] text-[#C9B27C] font-medium mt-1">
                            Resp: {song.responsible}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {song.key && (
                        <span className="inline-block text-xs font-bold font-mono bg-[#C9B27C]/15 text-[#C9B27C] border border-[#C9B27C]/30 px-2 py-0.5 rounded-md">
                          Tom: {song.key}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {repertoire.length === 0 && (
                <div className="text-center py-10 bg-[#14171C] rounded-2xl border border-[#292E36]">
                  <Music className="w-8 h-8 text-[#9FA4AD] mx-auto mb-2" />
                  <p className="text-xs text-[#9FA4AD]">Nenhum louvor cadastrado no repertório ainda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: MINHA ESCALA ===================== */}
        {activeTab === 'minha_escala' && (
          <div id="section-minha-escala" className="space-y-4">
            <div className="bg-[#14171C] rounded-2xl border border-[#292E36] p-4">
              <h3 className="text-base font-bold text-[#F2F2F2] mb-1 flex items-center gap-2">
                <User className="w-4 h-4 text-[#C9B27C]" />
                Consultar Minha Escala
              </h3>
              <p className="text-xs text-[#9FA4AD] mb-3">
                Digite seu nome ou ministério para ver suas atividades e horários na vigília:
              </p>

              <div className="relative">
                <Search className="w-4 h-4 text-[#9FA4AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ex: Carlos, Sarah, Louvor, Intercessão..."
                  value={myScaleSearch}
                  onChange={(e) => setMyScaleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] placeholder-[#9FA4AD]/50 text-xs focus:outline-none focus:border-[#C9B27C] transition font-medium"
                />
              </div>
            </div>

            {myScaleSearch.trim() ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#C9B27C] uppercase tracking-wider">
                  Suas Atividades no Cronograma ({myScaleItems.length})
                </h4>

                {myScaleItems.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="rounded-xl bg-[#14171C] border border-[#C9B27C]/30 p-3.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-[#C9B27C]">
                        {m.startTime} às {m.endTime}
                      </span>
                      <span className="text-[10px] font-semibold bg-[#0B0D10] text-[#9FA4AD] px-2 py-0.5 rounded uppercase border border-[#292E36]">
                        {m.type}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F2F2F2]">{m.title}</h4>
                    {m.description && <p className="text-xs text-[#9FA4AD] mt-1">{m.description}</p>}
                  </div>
                ))}

                {myScaleSongs.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-[#C9B27C] uppercase tracking-wider mb-2">
                      Seus Louvores no Repertório ({myScaleSongs.length})
                    </h4>
                    <div className="space-y-2">
                      {myScaleSongs.map((s, idx) => (
                        <div key={s.id || idx} className="rounded-xl bg-[#14171C] border border-[#292E36] p-3 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-[#F2F2F2]">{s.title}</span>
                            <span className="text-[#9FA4AD] block">{s.artist}</span>
                          </div>
                          {s.key && (
                            <span className="font-mono font-bold text-[#C9B27C] bg-[#C9B27C]/15 border border-[#C9B27C]/30 px-2 py-1 rounded">
                              Tom: {s.key}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {myScaleItems.length === 0 && myScaleSongs.length === 0 && (
                  <div className="text-center py-8 bg-[#14171C] rounded-xl border border-[#292E36]">
                    <p className="text-xs text-[#9FA4AD]">
                      Nenhuma atividade encontrada para "{myScaleSearch}".
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-[#14171C] rounded-2xl border border-[#292E36]">
                <Compass className="w-8 h-8 text-[#C9B27C] mx-auto mb-2 opacity-80" />
                <p className="text-xs text-[#9FA4AD] max-w-xs mx-auto">
                  Digite seu nome no campo acima para filtrar sua escala individual.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: ORAÇÃO ===================== */}
        {activeTab === 'oracao' && (
          <div id="section-oracao" className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#F2F2F2]">Mural de Oração</h3>
                <p className="text-xs text-[#9FA4AD]">Junte-se em oração pelos irmãos</p>
              </div>
              <button
                onClick={() => setShowPrayerModal(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition"
              >
                <Heart className="w-3.5 h-3.5" />
                Enviar Pedido
              </button>
            </div>

            <div className="space-y-3">
              {prayerRequests.map((prayer) => (
                <div
                  key={prayer.id}
                  className="rounded-xl bg-[#14171C] border border-[#292E36] p-4 hover:border-[#C9B27C]/30 transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F2F2F2]">{prayer.authorName}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#0B0D10] border border-[#292E36] text-[#9FA4AD]">
                        {prayer.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#9FA4AD]">{prayer.createdAt}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#F2F2F2]/90 leading-relaxed mb-3">
                    {prayer.request}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#292E36]">
                    <span className="text-xs text-[#9FA4AD] font-medium flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                      {prayer.prayersCount} orando
                    </span>

                    <button
                      onClick={() => incrementPrayer(prayer.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        prayer.userPrayed
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-[#0B0D10] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36]'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${prayer.userPrayed ? 'fill-rose-400 text-rose-400' : ''}`} />
                      {prayer.userPrayed ? 'Orando!' : 'Vou Orar'}
                    </button>
                  </div>
                </div>
              ))}

              {prayerRequests.length === 0 && (
                <div className="text-center py-10 bg-[#14171C] rounded-2xl border border-[#292E36]">
                  <p className="text-xs text-[#9FA4AD]">Nenhum pedido de oração enviado ainda. Seja o primeiro!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: AVISOS ===================== */}
        {activeTab === 'avisos' && (
          <div id="section-avisos" className="space-y-4">
            <h3 className="text-base font-bold text-[#F2F2F2]">Comunicados & Avisos</h3>

            <div className="space-y-3">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`rounded-xl p-4 border ${
                    notice.isUrgent
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-[#14171C] border-[#292E36]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-[#F2F2F2]">{notice.title}</h4>
                    {notice.isUrgent && (
                      <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded uppercase">
                        Importante
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9FA4AD] leading-relaxed">{notice.content}</p>
                </div>
              ))}

              {notices.length === 0 && (
                <div className="text-center py-10 bg-[#14171C] rounded-2xl border border-[#292E36]">
                  <p className="text-xs text-[#9FA4AD]">Nenhum aviso no momento.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer: Leadership / Change Code Button */}
        <footer className="mt-12 text-center border-t border-[#292E36] pt-6">
          <p className="text-[11px] text-[#9FA4AD] mb-2">
            Vigília Planner • Código Ativo: <span className="font-mono text-[#C9B27C] font-bold">{config.memberCode || config.accessCode}</span>
          </p>
          <button
            id="btn-open-leadership-access"
            onClick={handleOpenAuth}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14171C] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] text-xs font-semibold transition"
          >
            <Lock className="w-3.5 h-3.5 text-[#C9B27C]" />
            <span>Área da Liderança / Trocar Código</span>
          </button>
        </footer>
      </main>

      {/* Modal: Enviar Pedido de Oração */}
      {showPrayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D10]/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#14171C] border border-[#292E36] p-5 shadow-2xl">
            {prayerSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
                <h4 className="text-lg font-bold text-[#F2F2F2] mb-1">Pedido Enviado!</h4>
                <p className="text-xs text-[#9FA4AD]">
                  Seu pedido foi registrado e a igreja estará orando por você.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreatePrayer} className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
                  <h4 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    Enviar Pedido de Oração
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowPrayerModal(false)}
                    className="text-[#9FA4AD] hover:text-[#F2F2F2] text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F2F2F2]">Seu Nome (opcional)</label>
                  <input
                    type="text"
                    disabled={isAnonymous}
                    placeholder="Como prefere ser chamado"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] disabled:opacity-50"
                  />
                  <label className="flex items-center gap-2 text-xs text-[#9FA4AD] mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded border-[#292E36] bg-[#0B0D10] text-[#C9B27C] focus:ring-0"
                    />
                    Enviar como anônimo
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F2F2F2]">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PrayerCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  >
                    <option value="geral">Geral</option>
                    <option value="saude">Saúde / Cura</option>
                    <option value="familia">Família / Casamento</option>
                    <option value="espiritual">Vida Espiritual</option>
                    <option value="trabalho">Trabalho / Finanças</option>
                    <option value="libertacao">Libertação</option>
                    <option value="gratidao">Gratidão</option>
                    <option value="jovens">Jovens e Filhos</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F2F2F2]">Motivo de Oração</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Descreva o que Deus pode fazer na sua vida..."
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPrayerModal(false)}
                    className="flex-1 py-2 rounded-xl bg-[#14171C] hover:bg-[#191D24] text-[#9FA4AD] text-xs font-bold border border-[#292E36]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
                  >
                    Confirmar Pedido
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
