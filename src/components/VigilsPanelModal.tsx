import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import {
  Layers,
  Plus,
  KeyRound,
  CheckCircle2,
  Copy,
  Trash2,
  ExternalLink,
  X,
  Sparkles,
  Calendar,
  Building,
  Users,
  Clock,
  ArrowRight,
  Shield,
  FileText,
  Lock,
} from 'lucide-react';

interface VigilsPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VigilsPanelModal: React.FC<VigilsPanelModalProps> = ({ isOpen, onClose }) => {
  const {
    allVigilsList,
    activeVigilId,
    activeVigilCode,
    switchVigilById,
    switchVigilByCode,
    createVigil,
    duplicateVigil,
    deleteVigil,
    userRole,
  } = useVigilia();

  const [activeTab, setActiveTab] = useState<'lista' | 'codigo' | 'criar'>('lista');
  const [inputCode, setInputCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form for new vigil
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newChurch, setNewChurch] = useState('');
  const [newTemplate, setNewTemplate] = useState<'padrao' | 'vazia'>('padrao');
  const [newRequirePassword, setNewRequirePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newDirigentePin, setNewDirigentePin] = useState('');

  if (!isOpen) return null;

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    setCodeSuccess('');
    const clean = inputCode.trim().toUpperCase();
    if (!clean) {
      setCodeError('Digite um código de acesso válido.');
      return;
    }

    const ok = switchVigilByCode(clean);
    if (ok) {
      setCodeSuccess(`Conectado à vigília [${clean}] com sucesso!`);
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setCodeError(`Nenhuma vigília encontrada com o código "${clean}". Verifique com os dirigentes ou crie uma nova.`);
    }
  };

  const handleCreateVigil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const generatedCode = newCode.trim().toUpperCase() || `VIG-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdId = createVigil(generatedCode, newName, newChurch, newTemplate, {
      requireParticipantPassword: newRequirePassword,
      participantPassword: newPassword.trim(),
      dirigentePin: newDirigentePin.trim() || undefined,
    });

    setNewCode('');
    setNewName('');
    setNewChurch('');
    setNewRequirePassword(false);
    setNewPassword('');
    setNewDirigentePin('');
    setActiveTab('lista');
    onClose();
  };

  const handleCopyLink = (code: string, role: 'participante' | 'dirigente') => {
    try {
      const origin = typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.host}${window.location.pathname}`
        : '';
      const url = role === 'dirigente'
        ? `${origin}?codigo=${encodeURIComponent(code)}&modo=dirigente`
        : `${origin}?codigo=${encodeURIComponent(code)}`;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedId(`${code}-${role}`);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      setCopiedId(`${code}-${role}`);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#14171C] border border-[#292E36] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#292E36] bg-[#0E1115]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#191D23] border border-[#292E36] flex items-center justify-center text-[#C9B27C]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F2F2F2] flex items-center gap-2">
                Painel de Vigílias & Código de Acesso
              </h2>
              <p className="text-xs text-[#9FA4AD]">
                Vigília ativa no momento: <span className="font-mono text-[#C9B27C] font-semibold">[{activeVigilCode}]</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#191D23] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-[#292E36] bg-[#111418] px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('lista')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'lista'
                ? 'border-[#C9B27C] text-[#C9B27C]'
                : 'border-transparent text-[#9FA4AD] hover:text-[#F2F2F2]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Vigílias Cadastradas ({allVigilsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('codigo')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'codigo'
                ? 'border-[#C9B27C] text-[#C9B27C]'
                : 'border-transparent text-[#9FA4AD] hover:text-[#F2F2F2]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Acessar por Código</span>
          </button>

          <button
            onClick={() => setActiveTab('criar')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'criar'
                ? 'border-[#C9B27C] text-[#C9B27C]'
                : 'border-transparent text-[#9FA4AD] hover:text-[#F2F2F2]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Criar Nova Vigília</span>
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: LIST OF VIGILS */}
          {activeTab === 'lista' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#9FA4AD] uppercase">
                  Selecione uma vigília para gerenciar ou visualizar
                </span>
                <button
                  onClick={() => setActiveTab('criar')}
                  className="text-xs text-[#C9B27C] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Criar outra
                </button>
              </div>

              {allVigilsList.map((v) => {
                const isActive = v.id === activeVigilId;
                return (
                  <div
                    key={v.id}
                    className={`p-4 rounded-xl border transition ${
                      isActive
                        ? 'bg-[#191D23] border-[#C9B27C] shadow-md ring-1 ring-[#C9B27C]/30'
                        : 'bg-[#0E1115] border-[#292E36] hover:border-[#3d4450]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-[#F2F2F2]">
                            {v.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#0B0D10] text-[#C9B27C] border border-[#292E36] font-mono text-xs font-bold">
                            🔑 {v.code}
                          </span>
                          {v.requireParticipantPassword && (
                            <span className="px-2 py-0.5 rounded-md bg-[#0B0D10] text-amber-300 border border-amber-500/40 text-[10px] font-semibold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Senha Ativa
                            </span>
                          )}
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 text-[10px] font-mono font-semibold uppercase">
                              Ativa Agora
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#9FA4AD]">
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-[#C9B27C]" />
                            <span>{v.church}</span>
                          </div>
                          {v.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#C9B27C]" />
                              <span>{v.date}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#C9B27C]" />
                            <span>{v.momentsCount} blocos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-[#C9B27C]" />
                            <span>{v.participantsCount} pessoas</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                        {!isActive ? (
                          <button
                            onClick={() => {
                              switchVigilById(v.id);
                              onClose();
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-semibold text-xs transition shadow-sm flex items-center gap-1"
                          >
                            <span>Abrir</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Aberta
                          </span>
                        )}

                        {/* Copy Participant Link */}
                        <button
                          onClick={() => handleCopyLink(v.code, 'participante')}
                          title="Copiar link direto para os participantes"
                          className="px-2.5 py-1.5 rounded-lg bg-[#14171C] hover:bg-[#1f242c] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] text-xs font-mono transition flex items-center gap-1"
                        >
                          {copiedId === `${v.code}-participante` ? (
                            <span className="text-emerald-400">Copiado!</span>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Link Igreja</span>
                            </>
                          )}
                        </button>

                        {/* Clone */}
                        <button
                          onClick={() => {
                            const newClonedCode = prompt(
                              'Digite o código para a cópia:',
                              `${v.code}-2`
                            );
                            if (newClonedCode) {
                              duplicateVigil(v.id, newClonedCode);
                            }
                          }}
                          title="Duplicar esta vigília"
                          className="p-1.5 rounded-lg bg-[#14171C] hover:bg-[#1f242c] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        {allVigilsList.length > 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Deseja excluir permanentemente a vigília "${v.name}" [${v.code}]?`)) {
                                deleteVigil(v.id);
                              }
                            }}
                            title="Excluir"
                            className="p-1.5 rounded-lg bg-[#14171C] hover:bg-rose-950/50 text-[#9FA4AD] hover:text-rose-400 border border-[#292E36] transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ACCESS BY CODE */}
          {activeTab === 'codigo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0E1115] border border-[#292E36] space-y-2">
                <h3 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#C9B27C]" />
                  Entrar com Código da Vigília
                </h3>
                <p className="text-xs text-[#9FA4AD]">
                  Digite o código compartilhado pelos pastores ou dirigentes (ex: <span className="font-mono text-[#F2F2F2]">VIG-2026</span>, <span className="font-mono text-[#F2F2F2]">JA-2026</span>) para carregar o cronograma e orações instantaneamente.
                </p>
              </div>

              <form onSubmit={handleJoinByCode} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9FA4AD] mb-1 uppercase tracking-wider">
                    Código de Acesso
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: VIG-2026"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      className="w-full bg-[#0B0D10] text-[#C9B27C] font-mono font-bold text-lg px-4 py-3 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none uppercase tracking-widest"
                      autoFocus
                    />
                  </div>
                </div>

                {codeError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                    {codeError}
                  </div>
                )}

                {codeSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{codeSuccess}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span>Carregar Vigília</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: CREATE NEW VIGIL */}
          {activeTab === 'criar' && (
            <form onSubmit={handleCreateVigil} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#0E1115] border border-[#292E36] text-xs text-[#9FA4AD]">
                Crie um novo evento de vigília com seu próprio cronograma, participantes e mural de oração isolado.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                    Nome da Vigília *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vigília Jovem do Distrito, Vigília de Páscoa..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                    Código de Acesso Único
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: JOVEM-26 (ou deixe vazio para gerar)"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#0B0D10] text-[#C9B27C] font-mono px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                    Igreja / Congregação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: IASD Central, Distrito Sul..."
                    value={newChurch}
                    onChange={(e) => setNewChurch(e.target.value)}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#C9B27C]" />
                      <span className="text-xs font-bold text-[#F2F2F2]">
                        Proteger Participantes com Senha (Opcional)
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRequirePassword}
                        onChange={(e) => setNewRequirePassword(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#292E36] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9B27C]"></div>
                    </label>
                  </div>

                  {newRequirePassword && (
                    <div>
                      <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                        Senha dos Participantes *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: oracao2026"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#14171C] text-[#C9B27C] font-mono font-bold px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                    Senha / PIN do Dirigente desta Vigília
                  </label>
                  <input
                    type="password"
                    maxLength={20}
                    placeholder="Defina a senha do dirigente"
                    value={newDirigentePin}
                    onChange={(e) => setNewDirigentePin(e.target.value)}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-sm font-mono tracking-widest focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                    Modelo Inicial
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewTemplate('padrao')}
                      className={`p-3 rounded-xl border text-left transition ${
                        newTemplate === 'padrao'
                          ? 'bg-[#191D23] border-[#C9B27C] text-[#F2F2F2]'
                          : 'bg-[#0B0D10] border-[#292E36] text-[#9FA4AD]'
                      }`}
                    >
                      <span className="font-bold text-xs block text-[#F2F2F2]">
                        ✨ Modelo Padrão (Recomendado)
                      </span>
                      <span className="text-[11px] text-[#9FA4AD] block mt-0.5">
                        Vem pré-preenchida com momentos de oração, louvor, avisos e escalas.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTemplate('vazia')}
                      className={`p-3 rounded-xl border text-left transition ${
                        newTemplate === 'vazia'
                          ? 'bg-[#191D23] border-[#C9B27C] text-[#F2F2F2]'
                          : 'bg-[#0B0D10] border-[#292E36] text-[#9FA4AD]'
                      }`}
                    >
                      <span className="font-bold text-xs block text-[#F2F2F2]">
                        📄 Em Branco
                      </span>
                      <span className="text-[11px] text-[#9FA4AD] block mt-0.5">
                        Comece com um cronograma totalmente limpo.
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setActiveTab('lista')}
                  className="px-4 py-2 text-xs text-[#9FA4AD] hover:text-[#F2F2F2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C9B27C] text-[#0B0D10] font-bold text-xs shadow-md hover:bg-[#bfa872] transition"
                >
                  Salvar e Abrir Vigília
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
