import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { Lock, KeyRound, ArrowRight, ShieldCheck, FolderTree, AlertCircle } from 'lucide-react';

interface ParticipantLockScreenProps {
  onOpenDirigenteAuth: () => void;
  onOpenVigilsPanel: () => void;
}

export const ParticipantLockScreen: React.FC<ParticipantLockScreenProps> = ({
  onOpenDirigenteAuth,
  onOpenVigilsPanel,
}) => {
  const { config, activeVigilCode, unlockParticipantMode } = useVigilia();
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    const success = unlockParticipantMode(passwordInput);
    if (!success) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPasswordInput('');
    } else {
      setError(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md bg-[#14171C] border border-[#292E36] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center transition-all ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#0B0D10] border border-[#C9B27C]/50 flex items-center justify-center text-[#C9B27C] shadow-lg mx-auto">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="px-2.5 py-1 rounded-full bg-[#0B0D10] text-[#C9B27C] border border-[#292E36] font-mono text-xs font-bold uppercase tracking-wider inline-block mb-2">
            Código: {activeVigilCode}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F2F2F2]">
            {config.vigilName || 'Vigília de Oração'}
          </h2>
          <p className="text-xs sm:text-sm text-[#9FA4AD] mt-1.5 max-w-sm mx-auto">
            Esta vigília possui acesso protegido por senha. Solicite a senha aos dirigentes da igreja para visualizar a programação.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Senha incorreta. Verifique com a coordenação.</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9FA4AD] text-left mb-1.5 uppercase tracking-wider">
              Senha de Acesso do Participante
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                placeholder="Digite a senha da vigília"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setError(false);
                }}
                className="w-full bg-[#0B0D10] text-[#F2F2F2] px-4 py-3 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none tracking-wider"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Desbloquear e Entrar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Secondary Actions */}
        <div className="pt-4 border-t border-[#292E36] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            onClick={onOpenDirigenteAuth}
            className="text-[#C9B27C] hover:underline flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sou Dirigente (Entrar com PIN)</span>
          </button>

          <button
            onClick={onOpenVigilsPanel}
            className="text-[#9FA4AD] hover:text-[#F2F2F2] flex items-center gap-1.5"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Trocar de Vigília</span>
          </button>
        </div>
      </div>
    </div>
  );
};
