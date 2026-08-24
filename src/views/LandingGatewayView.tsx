import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { Sparkles, Shield, User, Key, ArrowRight, AlertCircle, CheckCircle2, Church, Flame } from 'lucide-react';
import { UserRole } from '../types';

export const LandingGatewayView: React.FC<{
  onSelectRole: (role: UserRole) => void;
}> = ({ onSelectRole }) => {
  const { config, loginWithCode, setUserRole } = useVigilia();

  const [dirigenteInput, setDirigenteInput] = useState('');
  const [membroInput, setMembroInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<{ side: 'dir' | 'mem' | null; text: string }>({ side: null, text: '' });
  const [successMsg, setSuccessMsg] = useState<{ side: 'dir' | 'mem' | null; text: string }>({ side: null, text: '' });

  const handleDirigenteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg({ side: null, text: '' });
    setSuccessMsg({ side: null, text: '' });

    const code = dirigenteInput.trim().toUpperCase();
    if (!code) return;

    const res = loginWithCode(code);
    if (res.success && (res.role === 'dirigente' || res.role === 'membro')) {
      setSuccessMsg({ side: 'dir', text: res.message });
      setTimeout(() => {
        onSelectRole('dirigente');
      }, 500);
    } else {
      setErrorMsg({ side: 'dir', text: res.message || 'Código de liderança inválido.' });
    }
  };

  const handleMembroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg({ side: null, text: '' });
    setSuccessMsg({ side: null, text: '' });

    const code = membroInput.trim().toUpperCase();
    if (!code) return;

    const res = loginWithCode(code);
    if (res.success) {
      setSuccessMsg({ side: 'mem', text: res.message });
      setTimeout(() => {
        onSelectRole('membro');
      }, 500);
    } else {
      setErrorMsg({ side: 'mem', text: res.message || 'Código da vigília não encontrado.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F2F2F2] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#C9B27C]/30 relative overflow-hidden">
      {/* Background ambient halos */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-96 bg-[#C9B27C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Brand */}
      <header className="relative z-10 max-w-md mx-auto text-center pt-6 sm:pt-12">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#191D24] via-[#14171C] to-[#0E1116] border-2 border-[#C9B27C]/40 text-[#C9B27C] shadow-xl shadow-[#C9B27C]/10 mb-4">
          <Flame className="w-8 h-8 text-[#C9B27C] animate-pulse" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F2F2F2] font-serif mb-2 flex items-center justify-center gap-2">
          <span>VIGÍLIA PLANNER</span>
        </h1>
        <p className="text-sm sm:text-base text-[#9FA4AD] font-medium max-w-xs sm:max-w-sm mx-auto">
          Organize e acompanhe sua vigília.
        </p>

        {config.churchName && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14171C] border border-[#292E36] text-[#C9B27C] text-xs font-semibold">
            <Church className="w-3.5 h-3.5" />
            <span>{config.churchName}</span>
          </div>
        )}
      </header>

      {/* Main Dual Cards Container */}
      <main className="relative z-10 max-w-4xl w-full mx-auto my-8 sm:my-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* SOU DIRIGENTE CARD */}
          <div className="rounded-3xl bg-[#14171C] border-2 border-[#292E36] hover:border-[#C9B27C]/40 p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#C9B27C]/15 border border-[#C9B27C]/30 text-[#C9B27C] flex items-center justify-center font-bold">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#0B0D10] text-[#C9B27C] border border-[#C9B27C]/30 text-xs font-mono font-bold uppercase">
                  Painel da Liderança
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F2F2F2] font-serif flex items-center gap-2">
                  👑 SOU DIRIGENTE
                </h2>
                <p className="text-xs sm:text-sm text-[#9FA4AD] mt-1">
                  Digite o código da liderança para conduzir o cronograma, gerenciar atrasos e equipes.
                </p>
              </div>

              <form onSubmit={handleDirigenteSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-[#9FA4AD] uppercase tracking-wider block mb-1.5">
                    Código de Liderança:
                  </label>
                  <input
                    type="text"
                    placeholder={`Ex: ${config.dirigenteCode || 'DIR-7391'}`}
                    value={dirigenteInput}
                    onChange={(e) => setDirigenteInput(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0D10] border border-[#292E36] text-base font-mono font-bold text-[#C9B27C] placeholder-[#9FA4AD]/40 focus:outline-none focus:border-[#C9B27C] uppercase transition"
                  />
                </div>

                {errorMsg.side === 'dir' && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg.text}</span>
                  </div>
                )}

                {successMsg.side === 'dir' && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-sm font-extrabold shadow-lg shadow-[#C9B27C]/10 transition flex items-center justify-center gap-2"
                >
                  <span>ENTRAR NO PAINEL</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="mt-5 pt-4 border-t border-[#292E36] flex items-center justify-between text-xs text-[#9FA4AD]">
              <span>Código atual: <strong className="font-mono text-[#C9B27C]">{config.dirigenteCode || 'DIR-7391'}</strong></span>
              <button
                type="button"
                onClick={() => onSelectRole('dirigente')}
                className="text-[#C9B27C] hover:underline font-semibold"
              >
                Acesso Rápido →
              </button>
            </div>
          </div>

          {/* QUERO ACOMPANHAR CARD */}
          <div className="rounded-3xl bg-[#14171C] border-2 border-[#292E36] hover:border-[#C9B27C]/40 p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold">
                  <User className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#0B0D10] text-[#9FA4AD] border border-[#292E36] text-xs font-mono font-bold uppercase">
                  Área do Membro
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F2F2F2] font-serif flex items-center gap-2">
                  👥 QUERO ACOMPANHAR
                </h2>
                <p className="text-xs sm:text-sm text-[#9FA4AD] mt-1">
                  Digite o código da vigília para ver a programação ao vivo, louvores e sua escala.
                </p>
              </div>

              <form onSubmit={handleMembroSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-[#9FA4AD] uppercase tracking-wider block mb-1.5">
                    Código da Vigília:
                  </label>
                  <input
                    type="text"
                    placeholder={`Ex: ${config.memberCode || 'VIG-4827'}`}
                    value={membroInput}
                    onChange={(e) => setMembroInput(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0D10] border border-[#292E36] text-base font-mono font-bold text-[#F2F2F2] placeholder-[#9FA4AD]/40 focus:outline-none focus:border-[#C9B27C] uppercase transition"
                  />
                </div>

                {errorMsg.side === 'mem' && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg.text}</span>
                  </div>
                )}

                {successMsg.side === 'mem' && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#191D24] hover:bg-[#20252e] text-[#F2F2F2] border border-[#292E36] hover:border-[#C9B27C]/50 text-sm font-extrabold shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>ACESSAR VIGÍLIA</span>
                  <ArrowRight className="w-4 h-4 text-[#C9B27C]" />
                </button>
              </form>
            </div>

            <div className="mt-5 pt-4 border-t border-[#292E36] flex items-center justify-between text-xs text-[#9FA4AD]">
              <span>Código da Vigília: <strong className="font-mono text-[#C9B27C]">{config.memberCode || 'VIG-4827'}</strong></span>
              <button
                type="button"
                onClick={() => onSelectRole('membro')}
                className="text-[#C9B27C] hover:underline font-semibold"
              >
                Acessar Direto →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 text-center text-xs text-[#9FA4AD]/60 pb-4">
        <span>Vigília Planner • Plataforma de Gestão de Vigílias de Oração</span>
      </footer>
    </div>
  );
};
