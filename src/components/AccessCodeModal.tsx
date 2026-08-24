import React, { useState } from 'react';
import { Key, Shield, User, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useVigilia } from '../context/VigiliaContext';
import { UserRole } from '../types';

export const AccessCodeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectRole?: (role: UserRole) => void;
}> = ({ isOpen, onClose, onSelectRole }) => {
  const { loginWithCode, config, userRole, setUserRole } = useVigilia();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const res = loginWithCode(code);
    if (res.success && res.role) {
      setSuccessMessage(res.message);
      if (onSelectRole) onSelectRole(res.role);
      setTimeout(() => {
        onClose();
        setCode('');
        setSuccessMessage('');
      }, 900);
    } else {
      setErrorMessage(res.message || 'Código inválido.');
    }
  };

  const handleQuickRole = (role: UserRole) => {
    setUserRole(role);
    if (onSelectRole) onSelectRole(role);
    onClose();
  };

  return (
    <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D10]/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-[#14171C] border border-[#292E36] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C9B27C]/15 text-[#C9B27C] flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F2F2F2]">Acessar Vigília</h3>
              <p className="text-[11px] text-[#9FA4AD]">Digite o código de Membro ou Dirigente</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9FA4AD] hover:text-[#F2F2F2] p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#F2F2F2] block mb-1">
              Código de Acesso
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: VIG-4827 ou DIR-7391"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-sm font-mono font-bold text-[#C9B27C] focus:outline-none focus:border-[#C9B27C] uppercase transition placeholder-[#9FA4AD]/40"
            />
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-bold shadow-lg transition"
          >
            Entrar com este Código
          </button>
        </form>

        {/* Quick Access By Level */}
        <div className="pt-2 border-t border-[#292E36] space-y-2">
          <span className="text-[11px] font-bold text-[#9FA4AD] uppercase tracking-wider block">
            Níveis de Acesso:
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleQuickRole('membro')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                userRole === 'membro'
                  ? 'bg-[#C9B27C]/15 border-[#C9B27C]/50'
                  : 'bg-[#0B0D10] border-[#292E36] hover:border-[#C9B27C]/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#F2F2F2]">👥 Membro</span>
                <User className="w-4 h-4 text-[#C9B27C]" />
              </div>
              <span className="text-[10px] text-[#9FA4AD] line-clamp-1">Acompanhamento público</span>
              <span className="text-[11px] font-mono font-bold text-[#C9B27C] mt-2 block">
                {config.memberCode || config.accessCode}
              </span>
            </button>

            <button
              onClick={() => handleQuickRole('dirigente')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                userRole === 'dirigente'
                  ? 'bg-[#C9B27C]/15 border-[#C9B27C]/50'
                  : 'bg-[#0B0D10] border-[#292E36] hover:border-[#C9B27C]/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#C9B27C]">👑 Dirigente</span>
                <Shield className="w-4 h-4 text-[#C9B27C]" />
              </div>
              <span className="text-[10px] text-[#9FA4AD] line-clamp-1">Painel da liderança</span>
              <span className="text-[11px] font-mono font-bold text-[#C9B27C] mt-2 block">
                {config.dirigenteCode || 'DIR-7391'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
