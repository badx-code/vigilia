import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { VigiliaConfig } from '../types';
import { calculateVigilDurationHours } from '../utils/timeUtils';
import {
  Settings,
  Sliders,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Users,
  CheckCircle2,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Save,
  BookOpen,
  Phone,
  FileText,
  Key,
  Lock,
  AlertCircle,
  Hourglass,
  Flame,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const {
    config,
    updateConfig,
    moments,
    teams,
    participants,
    prayerRequests,
    notices,
    resetToDefaultData,
    exportDataJSON,
    importDataJSON,
    dirigentePin,
    changeDirigentePin,
    lockDirigenteMode,
  } = useVigilia();

  const [formData, setFormData] = useState<VigiliaConfig>({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // PIN Change State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showActivePin, setShowActivePin] = useState(false);
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activePinValue = (config.dirigentePin || dirigentePin || '').trim();

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinInput.trim()) {
      setPinChangeMsg({ type: 'error', text: 'Por favor, digite a nova senha / PIN.' });
      return;
    }
    if (newPinInput.trim().length < 2) {
      setPinChangeMsg({ type: 'error', text: 'A nova senha deve conter no mínimo 2 caracteres.' });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinChangeMsg({ type: 'error', text: 'A confirmação da nova senha não coincide.' });
      return;
    }
    const success = changeDirigentePin(currentPinInput || activePinValue || '1234', newPinInput);
    if (success) {
      setPinChangeMsg({ type: 'success', text: `Senha / PIN do Dirigente atualizada com sucesso para todos os acessos!` });
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    } else {
      setPinChangeMsg({ type: 'error', text: 'Não foi possível alterar. Verifique os dados e tente novamente.' });
    }
    setTimeout(() => setPinChangeMsg(null), 5000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExport = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-vigilia-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        const success = importDataJSON(text);
        if (success) {
          setImportStatus('Dados importados com sucesso!');
          setFormData({ ...config });
        } else {
          setImportStatus('Falha ao importar arquivo JSON.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="admin-settings-view" className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="border-b border-[#292E36] pb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#C9B27C]" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F2F2F2]">
            Administração & Configurações da Vigília
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#9FA4AD] mt-1">
          Personalize as informações gerais da vigília, tema, versículo, escalas e faça backup dos dados.
        </p>
      </div>

      {/* DASHBOARD STATS OVERVIEW */}
      <div>
        <h2 className="text-xs font-mono uppercase text-[#9FA4AD] tracking-wider mb-3">
          Resumo Geral da Programação
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36]">
            <span className="text-[11px] text-[#9FA4AD] font-mono uppercase block">Atividades</span>
            <span className="text-xl sm:text-2xl font-bold text-[#F2F2F2] mt-1 block">
              {moments.length}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36]">
            <span className="text-[11px] text-[#9FA4AD] font-mono uppercase block">Equipes</span>
            <span className="text-xl sm:text-2xl font-bold text-[#F2F2F2] mt-1 block">
              {teams.length}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36]">
            <span className="text-[11px] text-[#9FA4AD] font-mono uppercase block">Participantes</span>
            <span className="text-xl sm:text-2xl font-bold text-[#F2F2F2] mt-1 block">
              {participants.length}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36]">
            <span className="text-[11px] text-[#9FA4AD] font-mono uppercase block">Pedidos de Oração</span>
            <span className="text-xl sm:text-2xl font-bold text-[#F2F2F2] mt-1 block">
              {prayerRequests.length}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONFIGURATION FORM */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-6">
        <div className="flex items-center justify-between border-b border-[#292E36] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#F2F2F2]">Dados Principais da Vigília</h2>
            <p className="text-xs text-[#9FA4AD]">
              Estes dados serão exibidos na tela inicial, modo ao vivo e cabeçalho.
            </p>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 text-xs border border-emerald-800/50">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                Nome da Vigília *
              </label>
              <input
                type="text"
                required
                value={formData.vigilName}
                onChange={(e) => setFormData({ ...formData, vigilName: e.target.value })}
                className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                Nome da Igreja / Comunidade *
              </label>
              <input
                type="text"
                required
                value={formData.churchName}
                onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                Tema da Vigília
              </label>
              <input
                type="text"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                Código de Acesso da Vigília (ex: VIG-2026)
              </label>
              <input
                type="text"
                placeholder="Ex: VIG-2026"
                value={formData.accessCode || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accessCode: e.target.value.toUpperCase().replace(/[^A-Z0-9\-_]/g, ''),
                  })
                }
                className="w-full bg-[#0B0D10] text-[#C9B27C] font-mono font-bold px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Data & Horários com Atalhos Rápidos */}
          <div className="space-y-2.5 p-4 bg-[#0B0D10] border border-[#292E36] rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#F2F2F2] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#C9B27C]" />
                <span>Programação de Data e Horários da Vigília</span>
              </span>
              <span className="text-[11px] font-mono text-[#C9B27C] bg-[#14171C] px-2.5 py-1 rounded border border-[#292E36]">
                Duração total calculada: {calculateVigilDurationHours(formData.startTime, formData.endTime)}h
              </span>
            </div>

            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-[#9FA4AD] uppercase font-mono mr-1">Atalhos rápidos:</span>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setFormData({ ...formData, date: today });
                }}
                className="px-2.5 py-1 rounded bg-[#14171C] hover:bg-[#1f242d] text-xs text-[#F2F2F2] border border-[#292E36] transition"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setFormData({ ...formData, date: tomorrow.toISOString().split('T')[0] });
                }}
                className="px-2.5 py-1 rounded bg-[#14171C] hover:bg-[#1f242d] text-xs text-[#F2F2F2] border border-[#292E36] transition"
              >
                Amanhã
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  const diff = (5 + 7 - d.getDay()) % 7 || 7; // Next Friday
                  d.setDate(d.getDate() + diff);
                  setFormData({ ...formData, date: d.toISOString().split('T')[0] });
                }}
                className="px-2.5 py-1 rounded bg-[#14171C] hover:bg-[#1f242d] text-xs text-[#C9B27C] border border-[#292E36] transition"
              >
                Próxima Sexta
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  const diff = (6 + 7 - d.getDay()) % 7 || 7; // Next Saturday
                  d.setDate(d.getDate() + diff);
                  setFormData({ ...formData, date: d.toISOString().split('T')[0] });
                }}
                className="px-2.5 py-1 rounded bg-[#14171C] hover:bg-[#1f242d] text-xs text-[#C9B27C] border border-[#292E36] transition"
              >
                Próximo Sábado
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 7);
                  setFormData({ ...formData, date: d.toISOString().split('T')[0] });
                }}
                className="px-2.5 py-1 rounded bg-[#14171C] hover:bg-[#1f242d] text-xs text-[#9FA4AD] border border-[#292E36] transition"
              >
                +7 Dias
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#9FA4AD] mb-1">Data *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#14171C] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-xs sm:text-sm font-mono focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9FA4AD] mb-1">
                  Horário Inicial *
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-[#14171C] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-xs sm:text-sm font-mono focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9FA4AD] mb-1">
                  Horário Final Previsto *
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full bg-[#14171C] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-xs sm:text-sm font-mono focus:border-[#C9B27C] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sala de Espera e Contagem Regressiva */}
          <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-[#C9B27C]/10 text-[#C9B27C]">
                  <Hourglass className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#F2F2F2]">
                    Sala de Espera e Contagem Regressiva Interativa
                  </h3>
                  <p className="text-[11px] text-[#9FA4AD]">
                    Configura o comportamento da tela de pré-vigília quando os irmãos acessarem antes do horário de início.
                  </p>
                </div>
              </div>

              <select
                value={formData.waitingMode || 'auto'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    waitingMode: e.target.value as 'auto' | 'always' | 'disabled',
                  })
                }
                className="bg-[#14171C] text-[#C9B27C] text-xs font-semibold px-3 py-2 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
              >
                <option value="auto">Automático (ativo se data for futura)</option>
                <option value="always">Forçar Sala de Espera Sempre</option>
                <option value="disabled">Desativado (Abrir Painel Direto)</option>
              </select>
            </div>

            {formData.waitingMode !== 'disabled' && (
              <div className="space-y-3.5 pt-3 border-t border-[#292E36]/60">
                <div>
                  <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                    Mensagem de Acolhimento na Espera
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Estamos em contagem regressiva para a nossa vigília! Prepare seu coração..."
                    value={formData.waitingWelcomeMessage || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, waitingWelcomeMessage: e.target.value })
                    }
                    className="w-full bg-[#14171C] text-[#F2F2F2] px-3.5 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9FA4AD] mb-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#C9B27C]" />
                    <span>Foco Espiritual & Intercessão da Semana</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Consagração das famílias, conversão dos jovens e unidade da igreja"
                    value={formData.waitingPrayerFocus || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, waitingPrayerFocus: e.target.value })
                    }
                    className="w-full bg-[#14171C] text-[#F2F2F2] px-3.5 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 p-3 bg-[#14171C] rounded-xl border border-[#292E36] text-xs text-[#F2F2F2] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showScheduleInWaiting !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, showScheduleInWaiting: e.target.checked })
                      }
                      className="rounded border-[#292E36]"
                    />
                    <span>Exibir prévia da programação na sala de espera</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-[#14171C] rounded-xl border border-[#292E36] text-xs text-[#F2F2F2] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowEarlyCheckin !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, allowEarlyCheckin: e.target.checked })
                      }
                      className="rounded border-[#292E36]"
                    />
                    <span>Permitir confirmação de presença antecipada ("Eu vou!")</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                Local / Endereço *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9FA4AD] mb-1">Cidade</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                Versículo Tema
              </label>
              <input
                type="text"
                value={formData.keyVerse}
                onChange={(e) => setFormData({ ...formData, keyVerse: e.target.value })}
                className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                Referência Bíblica
              </label>
              <input
                type="text"
                placeholder="Ex: Jeremias 33:3"
                value={formData.verseReference}
                onChange={(e) => setFormData({ ...formData, verseReference: e.target.value })}
                className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
              Descrição da Vigília
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none resize-none"
            />
          </div>

          {/* Proteção por Senha do Participante */}
          <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#C9B27C]" />
                <span className="text-xs font-bold text-[#F2F2F2]">
                  Proteção por Senha para os Participantes
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requireParticipantPassword || false}
                  onChange={(e) =>
                    setFormData({ ...formData, requireParticipantPassword: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#292E36] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9B27C]"></div>
              </label>
            </div>
            <p className="text-[11px] text-[#9FA4AD]">
              Quando ativado, qualquer pessoa que acessar a vigília pelo link ou código precisará digitar a senha definida abaixo antes de visualizar a programação.
            </p>

            {formData.requireParticipantPassword && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#9FA4AD] mb-1">
                  Senha dos Participantes *
                </label>
                <input
                  type="text"
                  placeholder="Ex: oracao2026, vigiliaja..."
                  value={formData.participantPassword || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, participantPassword: e.target.value })
                  }
                  className="w-full bg-[#14171C] text-[#C9B27C] font-mono font-bold px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
              Orientações Adicionais para os Participantes
            </label>
            <input
              type="text"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-[#292E36]">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-sm transition shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Todas as Configurações</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECURITY & DIRIGENTE PIN MANAGEMENT */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#292E36] pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B0D10] border border-[#C9B27C]/40 flex items-center justify-center text-[#C9B27C] shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                Segurança & Senha / PIN dos Dirigentes
              </h2>
              <p className="text-xs text-[#9FA4AD]">
                Esta senha impede o acesso de participantes aos controles de moderação e edição. Ao sair para o modo participante, o aplicativo sempre exigirá esta senha para reentrar.
              </p>
            </div>
          </div>
          <button
            onClick={lockDirigenteMode}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B0D10] hover:bg-rose-950/40 text-[#9FA4AD] hover:text-rose-300 text-xs font-semibold border border-[#292E36] transition shrink-0"
            title="Bloquear agora e alternar para a visão de participante"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sair / Bloquear Agora</span>
          </button>
        </div>

        {/* Current Active Password Viewer Card */}
        <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#292E36] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#C9B27C]" />
            <div>
              <p className="text-xs font-semibold text-[#F2F2F2]">Senha / PIN Atual Configurado</p>
              <p className="text-[11px] text-[#9FA4AD]">Utilize esta senha ao fazer login como Dirigente</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 bg-[#14171C] border border-[#292E36] rounded-xl font-mono text-sm font-bold text-[#C9B27C] tracking-wider min-w-[100px] text-center">
              {showActivePin ? activePinValue : '••••••••'}
            </div>
            <button
              type="button"
              onClick={() => setShowActivePin(!showActivePin)}
              className="p-2 rounded-xl bg-[#14171C] hover:bg-[#191D23] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] transition"
              title={showActivePin ? 'Ocultar Senha' : 'Ver Senha Atual'}
            >
              {showActivePin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {pinChangeMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              pinChangeMsg.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{pinChangeMsg.text}</span>
          </div>
        )}

        {/* Change Password Form */}
        <form onSubmit={handlePinSubmit} className="space-y-3">
          <p className="text-xs font-semibold text-[#F2F2F2]">Alterar Senha do Dirigente:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#9FA4AD] mb-1.5">
                Nova Senha / PIN *
              </label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="Digite a nova senha desejada"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm font-mono focus:border-[#C9B27C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9FA4AD] mb-1.5">
                Confirmar Nova Senha *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  maxLength={20}
                  placeholder="Repita a nova senha"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm font-mono focus:border-[#C9B27C] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-xs rounded-xl shrink-0 transition shadow-md"
                >
                  Salvar Senha
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* BACKUP & DATA MANAGEMENT */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
          Gerenciamento de Dados & Backup
        </h2>
        <p className="text-xs text-[#9FA4AD]">
          Você pode exportar a estrutura da vigília em arquivo JSON para usar em outros computadores ou restaurar caso precise.
        </p>

        {importStatus && (
          <div className="p-3 rounded-lg bg-[#191D23] border border-[#292E36] text-xs text-[#C9B27C]">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#191D23] hover:bg-[#292E36] text-[#F2F2F2] text-xs font-semibold border border-[#292E36] transition"
          >
            <Download className="w-4 h-4 text-[#C9B27C]" />
            <span>Exportar Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#191D23] hover:bg-[#292E36] text-[#F2F2F2] text-xs font-semibold border border-[#292E36] cursor-pointer transition">
            <Upload className="w-4 h-4 text-[#C9B27C]" />
            <span>Importar Backup (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={resetToDefaultData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 text-xs font-semibold border border-rose-800/40 transition"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Restaurar Dados Padrões</span>
          </button>
        </div>
      </div>
    </div>
  );
};
