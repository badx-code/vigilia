import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import {
  Shield,
  Users,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Flame,
  MapPin,
  Calendar,
  Clock,
  Church,
  BookOpen,
  Sparkles,
  Lock,
} from 'lucide-react';
import { UserRole } from '../types';

export const LandingGatewayView: React.FC<{
  onSelectRole: (role: UserRole) => void;
}> = ({ onSelectRole }) => {
  const { loginWithCode, config } = useVigilia();
  const loginCfg = config.loginPageConfig;

  const [dirigenteInput, setDirigenteInput] = useState('');
  const [membroInput, setMembroInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<{ side: 'dir' | 'mem' | null; text: string }>({ side: null, text: '' });
  const [successMsg, setSuccessMsg] = useState<{ side: 'dir' | 'mem' | null; text: string }>({ side: null, text: '' });

  // Format display date
  const formatDateBr = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) {
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        return dateObj.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  const handleDirigenteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg({ side: null, text: '' });
    setSuccessMsg({ side: null, text: '' });

    const code = dirigenteInput.trim();
    if (!code) {
      setErrorMsg({ side: 'dir', text: 'Por favor, digite a senha do dirigente.' });
      return;
    }

    const res = loginWithCode(code, 'dirigente');
    if (res.success && res.role === 'dirigente') {
      setSuccessMsg({ side: 'dir', text: res.message });
      setTimeout(() => {
        onSelectRole('dirigente');
      }, 400);
    } else {
      setErrorMsg({ side: 'dir', text: res.message || 'Senha de dirigente incorreta.' });
    }
  };

  const handleMembroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg({ side: null, text: '' });
    setSuccessMsg({ side: null, text: '' });

    const code = membroInput.trim();
    if (!code) {
      setErrorMsg({ side: 'mem', text: 'Por favor, digite a senha do participante.' });
      return;
    }

    const res = loginWithCode(code, 'membro');
    if (res.success) {
      setSuccessMsg({ side: 'mem', text: res.message });
      setTimeout(() => {
        onSelectRole('membro');
      }, 400);
    } else {
      setErrorMsg({ side: 'mem', text: res.message || 'Senha de participante incorreta.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F2F2F2] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#C9B27C]/30 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-96 bg-[#C9B27C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Church & Vigil Identity Card */}
      <header className="relative z-10 max-w-4xl mx-auto w-full text-center pt-6 sm:pt-10">
        {/* Church Name Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14171C] border border-[#C9B27C]/30 text-[#C9B27C] text-xs sm:text-sm font-semibold mb-4 shadow-lg shadow-[#C9B27C]/5">
          <Church className="w-4 h-4 text-[#C9B27C]" />
          <span>{config.churchName || 'Igreja Local'}</span>
        </div>

        {/* Vigil Main Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F2F2F2] font-serif mb-3 leading-tight">
          {config.vigilName || loginCfg?.pageTitle || 'Grande Vigília de Oração'}
        </h1>

        {/* Spiritual Theme or Subtitle */}
        {config.theme ? (
          <p className="text-base sm:text-lg text-[#C9B27C] font-medium max-w-2xl mx-auto mb-4 italic">
            "{config.theme}"
          </p>
        ) : (
          <p className="text-sm sm:text-base text-[#9FA4AD] font-medium max-w-lg mx-auto mb-4">
            {loginCfg?.pageSubtitle || 'Organize, acompanhe e participe da vigília em tempo real.'}
          </p>
        )}

        {/* Scripture Quote if configured */}
        {config.keyVerse && (
          <div className="max-w-xl mx-auto mb-5 p-3 sm:p-4 rounded-2xl bg-[#14171C]/70 border border-[#292E36] text-xs sm:text-sm text-[#9FA4AD] flex items-center justify-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#C9B27C] shrink-0" />
            <span>
              "{config.keyVerse}"{' '}
              {config.verseReference && (
                <strong className="text-[#F2F2F2] font-semibold">({config.verseReference})</strong>
              )}
            </span>
          </div>
        )}

        {/* Event Meta Badges: Location, Date & Time */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#9FA4AD] max-w-2xl mx-auto">
          {/* Location & City */}
          {(config.location || config.city) && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14171C] border border-[#292E36]">
              <MapPin className="w-4 h-4 text-[#C9B27C]" />
              <span className="text-[#F2F2F2] font-medium">
                {config.location}
                {config.city && config.location ? ` • ${config.city}` : config.city}
              </span>
            </div>
          )}

          {/* Date */}
          {config.date && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14171C] border border-[#292E36]">
              <Calendar className="w-4 h-4 text-[#C9B27C]" />
              <span className="text-[#F2F2F2] font-medium capitalize">
                {formatDateBr(config.date)}
              </span>
            </div>
          )}

          {/* Time */}
          {config.startTime && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14171C] border border-[#292E36]">
              <Clock className="w-4 h-4 text-[#C9B27C]" />
              <span className="text-[#F2F2F2] font-mono font-semibold">
                {config.startTime} {config.endTime ? `às ${config.endTime}` : ''}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Dual Access Cards */}
      <main className="relative z-10 max-w-4xl w-full mx-auto my-8 sm:my-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 👑 SOU DIRIGENTE */}
          <div className="rounded-3xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/50 p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all relative group">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#C9B27C]/15 border border-[#C9B27C]/30 text-[#C9B27C] flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#F2F2F2] font-serif">
                    👑 SOU DIRIGENTE
                  </h2>
                  <p className="text-xs text-[#9FA4AD]">
                    Gestão da liturgia, cronograma, equipes e configurações
                  </p>
                </div>
              </div>

              <form onSubmit={handleDirigenteSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-[#9FA4AD] block mb-2">
                    Senha de acesso do Dirigente:
                  </label>
                  <input
                    type="password"
                    value={dirigenteInput}
                    onChange={(e) => setDirigenteInput(e.target.value)}
                    placeholder="Digite sua senha de dirigente..."
                    autoComplete="current-password"
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0D10] border border-[#292E36] text-base font-mono font-bold text-[#C9B27C] focus:outline-none focus:border-[#C9B27C] transition"
                  />
                </div>

                {errorMsg.side === 'dir' && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg.text}</span>
                  </div>
                )}

                {successMsg.side === 'dir' && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-sm font-extrabold shadow-lg shadow-[#C9B27C]/10 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{loginCfg?.dirigenteButtonText || 'ACESSAR PAINEL DO DIRIGENTE'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* 👥 ACOMPANHAR VIGÍLIA / PARTICIPANTE */}
          <div className="rounded-3xl bg-[#14171C] border border-[#292E36] hover:border-indigo-500/40 p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all relative group">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#F2F2F2] font-serif">
                    👥 SOU PARTICIPANTE
                  </h2>
                  <p className="text-xs text-[#9FA4AD]">
                    Cronograma ao vivo, pedidos de oração, louvores e presença
                  </p>
                </div>
              </div>

              <form onSubmit={handleMembroSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-[#9FA4AD] block mb-2">
                    Senha de acesso do Participante:
                  </label>
                  <input
                    type="password"
                    value={membroInput}
                    onChange={(e) => setMembroInput(e.target.value)}
                    placeholder="Digite a senha de participante..."
                    autoComplete="current-password"
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0D10] border border-[#292E36] text-base font-mono font-bold text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] transition"
                  />
                </div>

                {errorMsg.side === 'mem' && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg.text}</span>
                  </div>
                )}

                {successMsg.side === 'mem' && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#191D24] hover:bg-[#222832] text-[#F2F2F2] border border-[#292E36] hover:border-[#C9B27C]/50 text-sm font-extrabold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{loginCfg?.membrosButtonText || 'ENTRAR NA VIGÍLIA'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C9B27C]" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 text-center text-xs text-[#9FA4AD]/70 pb-4">
        <p className="font-medium">
          {loginCfg?.footerText || `${config.churchName || 'Igreja Local'} • Plataforma de Gestão de Vigílias`}
        </p>
      </footer>
    </div>
  );
};
