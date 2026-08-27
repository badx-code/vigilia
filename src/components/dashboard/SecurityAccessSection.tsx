import React, { useState } from 'react';
import { useVigilia } from '../../context/VigiliaContext';
import {
  Shield,
  Key,
  Lock,
  Edit2,
  CheckCircle2,
  Copy,
  Share2,
  Link2,
  QrCode,
  AlertTriangle,
  Users,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const SecurityAccessSection: React.FC = () => {
  const {
    config,
    updateCustomCode,
    updateParticipantAccess,
    updateDirigenteAccount,
  } = useVigilia();

  const [revealDirCode, setRevealDirCode] = useState(false);
  const [revealMemCode, setRevealMemCode] = useState(false);

  // Edit Code Modal State
  const [showEditCodeModal, setShowEditCodeModal] = useState(false);
  const [editingType, setEditingType] = useState<'dirigente' | 'membro'>('dirigente');
  const [newCodeInput, setNewCodeInput] = useState('');
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // QR Modal
  const [showQrModal, setShowQrModal] = useState(false);

  const dirigenteCode = config.dirigenteCode || 'DIR-7391';
  const memberCode = config.memberCode || config.accessCode || 'VIG-4827';
  const memberLink = `${window.location.origin}${window.location.pathname}?code=${memberCode}`;

  const handleOpenEdit = (type: 'dirigente' | 'membro') => {
    setEditingType(type);
    setNewCodeInput(type === 'dirigente' ? dirigenteCode : memberCode);
    setStep('input');
    setErrorMsg('');
    setSuccessMsg('');
    setShowEditCodeModal(true);
  };

  const handleValidateNewCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = newCodeInput.trim().toUpperCase();

    if (!clean) {
      setErrorMsg('O código de acesso não pode ficar vazio.');
      return;
    }
    if (clean.length < 3) {
      setErrorMsg('O código deve ter pelo menos 3 caracteres.');
      return;
    }
    if (clean.length > 25) {
      setErrorMsg('O código deve ter no máximo 25 caracteres.');
      return;
    }
    if (!/^[A-Z0-9_-]+$/.test(clean)) {
      setErrorMsg('Use apenas letras, números, hífen (-) ou sublinhado (_).');
      return;
    }

    if (editingType === 'dirigente' && clean === memberCode.toUpperCase()) {
      setErrorMsg('O código do dirigente não pode ser idêntico ao código público dos membros.');
      return;
    }
    if (editingType === 'membro' && clean === dirigenteCode.toUpperCase()) {
      setErrorMsg('O código dos membros não pode ser idêntico ao código do dirigente.');
      return;
    }

    setStep('confirm');
  };

  const handleExecuteSave = () => {
    const res = updateCustomCode(editingType, newCodeInput);
    if (res.success) {
      setSuccessMsg(res.message || 'Código atualizado com sucesso!');
      setTimeout(() => {
        setShowEditCodeModal(false);
        setSuccessMsg('');
        setStep('input');
      }, 1200);
    } else {
      setErrorMsg(res.message || 'Erro ao alterar o código.');
      setStep('input');
    }
  };

  const handleWhatsAppShare = () => {
    const text = `🙌 *${config.vigilName}* - ${config.churchName}\n\nConvite para acompanhar a nossa vigília ao vivo pelo celular!\n\n🔑 *Código da Vigília:* \`${memberCode}\`\n🔗 *Link Direto:* ${memberLink}\n\nDeus abençoe!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#191D24] to-[#14171C] border border-[#292E36]">
        <h2 className="text-lg font-bold text-[#F2F2F2] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#C9B27C]" />
          <span>Códigos de Acesso & Segurança</span>
        </h2>
        <p className="text-xs text-[#9FA4AD] mt-1">
          Gerencie e edite os códigos de acesso privados do Dirigente e públicos dos Membros com total segurança.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: CÓDIGO DO DIRIGENTE */}
        <div className="p-6 rounded-3xl bg-[#14171C] border-2 border-[#C9B27C]/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#C9B27C]/10 border border-[#C9B27C]/30 flex items-center justify-center text-[#C9B27C]">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F2F2F2]">👑 Código do Dirigente</h3>
                <span className="text-[11px] text-[#9FA4AD]">Acesso restrito administrativo</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#C9B27C]/20 border border-[#C9B27C]/40 text-[#C9B27C] text-[10px] font-bold uppercase">
              Privado
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0D10] border border-[#292E36] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9FA4AD] block">
                Código Atual:
              </span>
              <span className="text-lg font-mono font-extrabold text-[#C9B27C] tracking-wider">
                {revealDirCode ? dirigenteCode : '••••••••••••'}
              </span>
            </div>

            <button
              onClick={() => setRevealDirCode(!revealDirCode)}
              className="p-2 rounded-xl bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] transition"
              title={revealDirCode ? 'Ocultar código' : 'Mostrar código'}
            >
              {revealDirCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#C9B27C]" />}
            </button>
          </div>

          <button
            onClick={() => handleOpenEdit('dirigente')}
            className="w-full py-3 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#C9B27C]/20 transition cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            <span>✏️ EDITAR CÓDIGO DO DIRIGENTE</span>
          </button>
        </div>

        {/* CARD 2: CÓDIGO DOS MEMBROS & COMPARTILHAMENTO */}
        <div className="p-6 rounded-3xl bg-[#14171C] border border-[#292E36] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F2F2F2]">👥 Código dos Participantes</h3>
                <span className="text-[11px] text-[#9FA4AD]">Para os membros acompanharem</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold uppercase">
              Público
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0D10] border border-[#292E36] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9FA4AD] block">
                Código dos Membros:
              </span>
              <span className="text-lg font-mono font-extrabold text-[#F2F2F2] tracking-wider">
                {revealMemCode ? memberCode : memberCode}
              </span>
            </div>

            <button
              onClick={() => copyToClipboard(memberCode, 'memCode')}
              className="p-2 rounded-xl bg-[#191D24] text-[#9FA4AD] hover:text-[#C9B27C] transition"
              title="Copiar código"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleOpenEdit('membro')}
              className="py-2.5 px-3 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#C9B27C]" />
              <span>Editar Código</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => copyToClipboard(memberLink, 'link')}
              className="py-2.5 px-3 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Link2 className="w-3.5 h-3.5 text-[#C9B27C]" />
              <span>{copiedKey === 'link' ? 'Link Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="py-2.5 px-3 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#C9B27C] border border-[#C9B27C]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Gerar QR Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Edit Code */}
      {showEditCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#14171C] border border-[#292E36] p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
              <h3 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#C9B27C]" />
                <span>
                  {editingType === 'dirigente' ? 'Alterar Código do Dirigente' : 'Alterar Código dos Membros'}
                </span>
              </h3>
              <button
                onClick={() => setShowEditCodeModal(false)}
                className="text-[#9FA4AD] hover:text-[#F2F2F2] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {step === 'input' ? (
              <form onSubmit={handleValidateNewCode} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1.5">
                    Digite o novo código de acesso desejado:
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newCodeInput}
                    onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ex: VIGILIA2026"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#0B0D10] border border-[#292E36] text-base font-mono font-bold text-[#C9B27C] tracking-wider focus:outline-none focus:border-[#C9B27C] uppercase"
                  />
                  <p className="text-[11px] text-[#9FA4AD] mt-1.5">
                    Mínimo 3 caracteres. Você pode usar palavras fáceis de memorizar como{' '}
                    <span className="text-[#C9B27C]">VIGILIA2026</span> ou códigos padrão.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#292E36]">
                  <button
                    type="button"
                    onClick={() => setShowEditCodeModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-[#0B0D10] text-[#9FA4AD] font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-extrabold shadow"
                  >
                    AVANÇAR
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#0B0D10] border border-[#292E36] text-center space-y-2">
                  <span className="text-xs text-[#9FA4AD]">Confirmar novo código:</span>
                  <div className="text-xl font-mono font-extrabold text-[#C9B27C] tracking-widest">
                    {newCodeInput.trim().toUpperCase()}
                  </div>
                  <p className="text-[11px] text-[#9FA4AD]">
                    Ao salvar, o código anterior deixará de funcionar imediatamente.
                  </p>
                </div>

                {successMsg ? (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{successMsg}</span>
                  </div>
                ) : null}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#292E36]">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="px-3.5 py-2 rounded-xl bg-[#0B0D10] text-[#9FA4AD] font-bold"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteSave}
                    className="px-5 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-extrabold shadow"
                  >
                    SALVAR NOVO CÓDIGO
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#14171C] border border-[#292E36] p-6 space-y-4 shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
              <h3 className="text-sm font-bold text-[#F2F2F2]">QR Code de Acesso da Vigília</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-[#9FA4AD] hover:text-[#F2F2F2] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-xl">
              <QRCodeSVG value={memberLink} size={200} />
            </div>

            <p className="text-xs text-[#9FA4AD]">
              Exiba na tela do projetor ou imprima para os irmãos acessarem com a câmera do celular.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#C9B27C] text-[#0B0D10] font-bold text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
