import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useVigilia } from '../context/VigiliaContext';
import {
  X,
  Copy,
  Check,
  Share2,
  QrCode,
  Maximize2,
  ExternalLink,
  MessageCircle,
  Users,
  ShieldCheck,
  Sparkles,
  Lock,
  Globe,
  Key,
} from 'lucide-react';

interface ShareVigilModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareVigilModal: React.FC<ShareVigilModalProps> = ({ isOpen, onClose }) => {
  const { config, activeVigilCode } = useVigilia();
  const [copiedLink, setCopiedLink] = useState<'participante' | 'dirigente' | 'codigo' | 'whatsapp' | null>(null);
  const [isFullscreenQR, setIsFullscreenQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'participante' | 'dirigente'>('participante');

  if (!isOpen) return null;

  // Real Server / Domain Base URL
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}${window.location.pathname}`
    : '';

  const participantUrl = `${baseUrl}?codigo=${encodeURIComponent(activeVigilCode)}`;
  const dirigenteUrl = `${baseUrl}?codigo=${encodeURIComponent(activeVigilCode)}&modo=dirigente`;

  const activeUrl = activeTab === 'participante' ? participantUrl : dirigenteUrl;

  const handleCopy = (type: 'participante' | 'dirigente' | 'codigo' | 'whatsapp', textToCopy: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-https or restricted webview environments
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedLink(type);
      setTimeout(() => {
        setCopiedLink(null);
      }, 3000);
    } catch {
      // Fallback
      setCopiedLink(type);
      setTimeout(() => setCopiedLink(null), 3000);
    }
  };

  const getWhatsAppMessage = (isDirigente: boolean) => {
    if (isDirigente) {
      return (
        `🛡️ *PAINEL DO DIRIGENTE - ${config.vigilName || 'Vigília de Oração'}*\n\n` +
        `Olá líder/dirigente! Segue o link de acesso para coordenação e edição da vigília no servidor:\n\n` +
        `👉 ${dirigenteUrl}\n\n` +
        `🔒 *Atenção:* Ao abrir o link acima, o sistema solicitará a sua Senha / PIN de Dirigente para liberar a moderação e os controles.\n\n` +
        `_"${config.keyVerse}"_ — ${config.verseReference}`
      );
    }

    const passwordText =
      config.requireParticipantPassword && config.participantPassword
        ? `\n🔒 *Senha de Acesso:* ${config.participantPassword}\n(O sistema solicitará esta senha ao entrar pelo link)\n`
        : '';

    return (
      `🌙 *${config.vigilName || 'Vigília de Oração'}*\n\n` +
      `Participe conosco da vigília! Acompanhe os horários em tempo real, momentos de oração, louvores e envie seus pedidos de oração pelo link oficial do servidor:\n\n` +
      `👉 ${participantUrl}\n` +
      `${passwordText}\n` +
      `Basta clicar no link acima para abrir a vigília no seu celular ou computador!\n\n` +
      `_"${config.keyVerse}"_ — ${config.verseReference}`
    );
  };

  const handleWhatsAppShare = () => {
    const message = getWhatsAppMessage(activeTab === 'dirigente');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyWhatsAppText = () => {
    const message = getWhatsAppMessage(activeTab === 'dirigente');
    handleCopy('whatsapp', message);
  };

  if (isFullscreenQR) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0D10] flex flex-col items-center justify-center p-6 text-center animate-fadeIn select-none">
        <button
          onClick={() => setIsFullscreenQR(false)}
          className="absolute top-6 right-6 p-3 rounded-full bg-[#14171C] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] transition shadow-lg"
          title="Fechar tela cheia"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="max-w-xl w-full space-y-6 flex flex-col items-center">
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#C9B27C] uppercase tracking-widest px-3 py-1 bg-[#14171C] rounded-full border border-[#292E36]">
              🌙 Telão / Projeção para a Congregação
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#F2F2F2]">
              {config.vigilName || 'Vigília de Oração'}
            </h2>
            <p className="text-sm sm:text-base text-[#9FA4AD]">
              Aponte a câmera do seu celular para abrir o link do servidor, acompanhar a programação e enviar pedidos de oração
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl shadow-[0_0_50px_rgba(201,178,124,0.25)] border-4 border-[#C9B27C]">
            <QRCodeSVG
              value={participantUrl}
              size={280}
              level="H"
              includeMargin={false}
              fgColor="#0B0D10"
              bgColor="#FFFFFF"
            />
          </div>

          <div className="space-y-2 w-full max-w-md">
            <a
              href={participantUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C9B27C] hover:underline bg-[#14171C] px-3.5 py-1.5 rounded-lg border border-[#292E36]"
            >
              <span>{participantUrl}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
            <p className="text-xs text-[#9FA4AD] italic font-serif">
              "{config.keyVerse}" — {config.verseReference}
            </p>
          </div>

          <button
            onClick={() => setIsFullscreenQR(false)}
            className="px-6 py-2.5 bg-[#14171C] hover:bg-[#191D23] text-[#F2F2F2] rounded-xl border border-[#292E36] text-xs font-semibold transition"
          >
            Voltar para o Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#14171C] border border-[#292E36] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#292E36]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C9B27C]/10 border border-[#C9B27C]/30 text-[#C9B27C]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F2F2F2]">
                Compartilhar Link do Servidor
              </h3>
              <p className="text-[11px] text-[#9FA4AD]">
                Envie o link clicável para os irmãos ou para a equipe de liderança
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9FA4AD] hover:text-[#F2F2F2] rounded-lg hover:bg-[#191D23] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs">
          {/* Tab selector */}
          <div className="p-1 bg-[#0B0D10] border border-[#292E36] rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab('participante')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
                activeTab === 'participante'
                  ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-sm'
                  : 'text-[#9FA4AD] hover:text-[#F2F2F2]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>1. Para Participantes (Igreja)</span>
            </button>

            <button
              onClick={() => setActiveTab('dirigente')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
                activeTab === 'dirigente'
                  ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-sm'
                  : 'text-[#9FA4AD] hover:text-[#F2F2F2]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>2. Para Dirigentes (Liderança)</span>
            </button>
          </div>

          {activeTab === 'participante' ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Explanation Card */}
              <div className="p-3 bg-[#0B0D10] rounded-xl border border-[#292E36] space-y-1.5 text-[#9FA4AD]">
                <div className="flex items-center gap-1.5 text-[#C9B27C] font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ao clicar no link, o participante pode:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#C9B27C]/90">
                  <li>Acompanhar a escala, horários e equipe de oração em tempo real.</li>
                  <li>Enviar pedidos de oração diretamente pelo celular.</li>
                  <li>Acompanhar o mural de clamores aprovados e avisos oficiais.</li>
                </ul>
              </div>

              {/* Server Clickable Link & Quick Copy Card */}
              <div className="p-3.5 bg-[#0B0D10] rounded-xl border border-[#292E36] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#9FA4AD] uppercase flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#C9B27C]" />
                    Link Clicável do Servidor (com Código)
                  </span>
                  <span className="font-mono text-[11px] text-[#C9B27C] font-semibold">
                    Código: {activeVigilCode}
                  </span>
                </div>

                <div className="bg-[#14171C] p-2.5 rounded-xl border border-[#292E36] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <a
                    href={participantUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[#C9B27C] hover:text-[#e4d4aa] underline break-all flex items-center gap-1.5 group"
                    title="Clique para abrir este link em nova aba"
                  >
                    <span>{participantUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                  </a>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy('codigo', participantUrl)}
                      className="px-3 py-1.5 rounded-lg bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                      title="Copiar o link completo do servidor para colar no navegador ou mandar para alguém"
                    >
                      {copiedLink === 'codigo' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-950" />
                          <span>Link Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password info if enabled */}
              {config.requireParticipantPassword && config.participantPassword && (
                <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Lock className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="block font-semibold">Vigília Protegida com Senha de Participante</span>
                      <span className="font-mono text-amber-200">Senha: {config.participantPassword} (será solicitada ao abrir o link)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy('codigo', config.participantPassword || '')}
                    className="px-2.5 py-1 rounded bg-[#0B0D10] hover:bg-[#14171C] text-amber-300 border border-amber-500/40 text-[11px] font-mono transition shrink-0"
                  >
                    Copiar Senha
                  </button>
                </div>
              )}

              {/* WhatsApp & Telão Actions */}
              <div className="p-4 bg-[#0B0D10] rounded-xl border border-[#292E36] space-y-3">
                <div className="flex items-center gap-2 text-[#F2F2F2] font-semibold">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Compartilhamento via WhatsApp</span>
                </div>
                <p className="text-[11px] text-[#9FA4AD]">
                  O link vai configurado para abrir diretamente a vigília no servidor quando a pessoa clicar na mensagem do WhatsApp.
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleWhatsAppShare}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition text-xs shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Abrir e Enviar no WhatsApp</span>
                  </button>

                  <button
                    onClick={handleCopyWhatsAppText}
                    className="px-3.5 py-2 bg-[#191D23] hover:bg-[#20262f] text-[#F2F2F2] border border-[#292E36] rounded-xl flex items-center gap-1.5 transition text-xs"
                    title="Copiar o texto pronto para colar em conversas ou grupos"
                  >
                    {copiedLink === 'whatsapp' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Texto Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#C9B27C]" />
                        <span>Copiar Mensagem do WhatsApp</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsFullscreenQR(true)}
                    className="px-3.5 py-2 bg-[#14171C] hover:bg-[#191D23] text-[#C9B27C] border border-[#292E36] rounded-xl flex items-center gap-1.5 transition text-xs"
                    title="Projetar QR Code em tela cheia no telão da igreja"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Projetar QR Code</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              {/* Dirigente Explanation */}
              <div className="p-3 bg-[#0B0D10] rounded-xl border border-[#292E36] space-y-1.5 text-[#9FA4AD]">
                <div className="flex items-center gap-1.5 text-[#C9B27C] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Acesso de Liderança (Pastores e Dirigentes):</span>
                </div>
                <p className="text-[11px] text-[#9FA4AD]">
                  Ao abrir o link do dirigente, o sistema exigirá a <strong>Senha / PIN de Dirigente</strong> para autorizar a moderação de orações, controle de cronograma e edição da vigília.
                </p>
              </div>

              {/* Dirigente Clickable Server Link */}
              <div className="p-3.5 bg-[#0B0D10] rounded-xl border border-[#292E36] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#9FA4AD] uppercase flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#C9B27C]" />
                    Link do Painel de Dirigente
                  </span>
                  <span className="font-mono text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Exige Senha de Dirigente
                  </span>
                </div>

                <div className="bg-[#14171C] p-2.5 rounded-xl border border-[#292E36] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <a
                    href={dirigenteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[#C9B27C] hover:text-[#e4d4aa] underline break-all flex items-center gap-1.5 group"
                    title="Clique para abrir o link do dirigente em nova aba"
                  >
                    <span>{dirigenteUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                  </a>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy('dirigente', dirigenteUrl)}
                      className="px-3.5 py-1.5 bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold rounded-lg flex items-center gap-1.5 transition text-xs shadow-sm"
                    >
                      {copiedLink === 'dirigente' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-950" />
                          <span>Link Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* WhatsApp Action for Dirigente */}
              <div className="p-4 bg-[#0B0D10] rounded-xl border border-[#292E36] space-y-3">
                <div className="flex items-center gap-2 text-[#F2F2F2] font-semibold">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Enviar Acesso aos Líderes via WhatsApp</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleWhatsAppShare}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition text-xs shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar no WhatsApp</span>
                  </button>

                  <button
                    onClick={handleCopyWhatsAppText}
                    className="px-3.5 py-2 bg-[#191D23] hover:bg-[#20262f] text-[#F2F2F2] border border-[#292E36] rounded-xl flex items-center gap-1.5 transition text-xs"
                  >
                    {copiedLink === 'whatsapp' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Texto Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#C9B27C]" />
                        <span>Copiar Mensagem</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick instructions */}
          <div className="p-3 bg-[#191D23]/60 rounded-xl border border-[#292E36] text-[11px] text-[#9FA4AD] space-y-1">
            <strong className="text-[#F2F2F2] block">💡 Como funciona:</strong>
            <p>
              Qualquer pessoa que clicar no link será direcionada instantaneamente para a vigília no servidor. Se a vigília for protegida ou for link de dirigente, a senha de segurança será solicitada ao entrar.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#292E36] flex items-center justify-end bg-[#0B0D10]/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#292E36] hover:bg-[#3d4450] text-[#F2F2F2] text-xs font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
