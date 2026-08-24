import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { Shield, Users, ArrowRight, AlertCircle, CheckCircle2, Flame, Lock, Key } from 'lucide-react';
import { UserRole } from '../types';

export const LandingGatewayView: React.FC<{
  onSelectRole: (role: UserRole) => void;
}> = ({ onSelectRole }) => {
  const { loginWithCode } = useVigilia();

  const [dirigenteInput, setDirigenteInput] = useState('');
  const [membroInput, setMembroInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<{ side: 'dir' | 'mem' | null; text: string }>({ side: null, text: '' });
  const [successMsg, setSuccessMsg] = useState<{ side: 'dir' | 'mem' | null; text: string }>({ side: null, text: '' });

  const handleDirigenteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg({ side: null, text: '' });
    setSuccessMsg({ side: null, text: '' });

    const code = dirigenteInput.trim().toUpperCase();
    if (!code) {
      setErrorMsg({ side: 'dir', text: 'Por favor, digite seu código de acesso.' });
      return;
    }

    const res = loginWithCode(code, 'dirigente');
    if (res.success && res.role === 'dirigente') {
      setSuccessMsg({ side: 'dir', text: res.message });
      setTimeout(() => {
        onSelectRole('dirigente');
      }, 400);
    } else {
      setErrorMsg({ side: 'dir', text: res.message || 'Código de acesso incorreto.' });
    }
  };

  const handleMembroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg({ side: null, text: '' });
    setSuccessMsg({ side: null, text: '' });

    const code = membroInput.trim().toUpperCase();
    if (!code) {
      setErrorMsg({ side: 'mem', text: 'Por favor, digite o código da vigília.' });
      return;
    }

    const res = loginWithCode(code, 'membro');
    if (res.success) {
      setSuccessMsg({ side: 'mem', text: res.message });
      setTimeout(() => {
        onSelectRole('membro');
      }, 400);
    } else {
      setErrorMsg({ side: 'mem', text: res.message || 'Código da vigília não encontrado.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F2F2F2] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#C9B27C]/30 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[500px] h-80 bg-[#C9B27C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Brand */}
      <header className="relative z-10 max-w-md mx-auto text-center pt-8 sm:pt-14">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#191D24] via-[#14171C] to-[#0E1116] border-2 border-[#C9B27C]/40 text-[#C9B27C] shadow-xl shadow-[#C9B27C]/10 mb-4">
          <Flame className="w-8 h-8 text-[#C9B27C]" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F2F2F2] font-serif mb-2 flex items-center justify-center gap-2">
          <span>⛪ VIGÍLIA PLANNER</span>
        </h1>
        <p className="text-sm sm:text-base text-[#9FA4AD] font-medium max-w-xs sm:max-w-sm mx-auto">
          Organize e acompanhe sua vigília.
        </p>
      </header>

      {/* Main Dual Access Cards */}
      <main className="relative z-10 max-w-3xl w-full mx-auto my-8 sm:my-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 👑 SOU DIRIGENTE */}
          <div className="rounded-3xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/50 p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9B27C]/15 border border-[#C9B27C]/30 text-[#C9B27C] flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#F2F2F2] font-serif">
                    👑 SOU DIRIGENTE
                  </h2>
                </div>
              </div>

              <form onSubmit={handleDirigenteSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-[#9FA4AD] block mb-2">
                    Digite seu código de acesso:
                  </label>
                  <input
                    type="text"
                    value={dirigenteInput}
                    onChange={(e) => setDirigenteInput(e.target.value.toUpperCase())}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0D10] border border-[#292E36] text-base font-mono font-bold text-[#C9B27C] focus:outline-none focus:border-[#C9B27C] uppercase transition"
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
                  <span>ENTRAR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* 👥 ACOMPANHAR VIGÍLIA */}
          <div className="rounded-3xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/50 p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#F2F2F2] font-serif">
                    👥 ACOMPANHAR VIGÍLIA
                  </h2>
                </div>
              </div>

              <form onSubmit={handleMembroSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-[#9FA4AD] block mb-2">
                    Digite o código da vigília:
                  </label>
                  <input
                    type="text"
                    value={membroInput}
                    onChange={(e) => setMembroInput(e.target.value.toUpperCase())}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0D10] border border-[#292E36] text-base font-mono font-bold text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] uppercase transition"
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
                  <span>ENTRAR</span>
                  <ArrowRight className="w-4 h-4 text-[#C9B27C]" />
                </button>
              </form>
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
