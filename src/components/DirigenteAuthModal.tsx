import React, { useState, useEffect } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { ShieldCheck, Lock, KeyRound, X, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface DirigenteAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DirigenteAuthModal: React.FC<DirigenteAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { authenticateDirigente } = useVigilia();
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setError(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pinInput.length < 20) {
      const newPin = pinInput + digit;
      setPinInput(newPin);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPinInput('');
    setError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) return;

    const ok = authenticateDirigente(pinInput);
    if (ok) {
      setError(false);
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-sm bg-[#14171C] border border-[#292E36] rounded-3xl p-6 sm:p-7 shadow-2xl relative transition-all ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#0B0D10] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#0B0D10] border border-[#C9B27C]/40 flex items-center justify-center text-[#C9B27C] shadow-lg mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#F2F2F2]">Acesso do Dirigente / Pastor</h3>
          <p className="text-xs text-[#9FA4AD] mt-1 max-w-[260px]">
            Insira a senha de segurança para coordenar e editar as atividades da vigília.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* PIN Input Display */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              maxLength={20}
              autoFocus
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setError(false);
              }}
              placeholder="Digite a senha / PIN"
              className={`w-full bg-[#0B0D10] text-center text-lg tracking-[0.2em] font-mono text-[#C9B27C] font-bold py-3 px-10 rounded-xl border transition ${
                error
                  ? 'border-rose-500 ring-1 ring-rose-500 text-rose-400'
                  : 'border-[#292E36] focus:border-[#C9B27C] focus:outline-none'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FA4AD] hover:text-[#F2F2F2] p-1 rounded-md transition"
              title={showPassword ? 'Ocultar senha' : 'Ver senha digitada'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Senha / PIN incorreto. Tente novamente!</span>
            </div>
          )}

          {/* Quick Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigit(num)}
                className="py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D23] text-[#F2F2F2] font-mono text-base font-semibold border border-[#292E36] active:scale-95 transition"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D23] text-[#9FA4AD] text-xs font-semibold border border-[#292E36] active:scale-95 transition"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D23] text-[#F2F2F2] font-mono text-base font-semibold border border-[#292E36] active:scale-95 transition"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D23] text-[#9FA4AD] text-xs font-semibold border border-[#292E36] active:scale-95 transition"
            >
              Apagar
            </button>
          </div>

          {/* Submit Action */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={!pinInput}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition shadow-lg ${
                pinInput
                  ? 'bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] cursor-pointer'
                  : 'bg-[#191D23] text-[#9FA4AD] cursor-not-allowed border border-[#292E36]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Desbloquear Modo Dirigente</span>
            </button>
          </div>

          <div className="text-center pt-1 border-t border-[#292E36]/60">
            <p className="text-[11px] text-[#9FA4AD] flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9B27C]" />
              <span>Acesso restrito para pastores e equipe de moderação</span>
            </p>
            <p className="text-[10px] text-[#9FA4AD]/70 mt-0.5">
              A senha é configurada e gerenciada pelos dirigentes da vigília
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
