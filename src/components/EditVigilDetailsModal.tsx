import React, { useState, useEffect } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { VigiliaConfig } from '../types';
import { calculateVigilDurationHours } from '../utils/timeUtils';
import {
  Edit3,
  Save,
  X,
  Church,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Tag,
  Lock,
  Key,
  Hourglass,
  Flame,
  Layers,
  Shield,
  ShieldCheck,
} from 'lucide-react';

interface EditVigilDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditVigilDetailsModal: React.FC<EditVigilDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { config, updateConfig } = useVigilia();
  const [formData, setFormData] = useState<VigiliaConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...config });
      setSavedSuccess(false);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#14171C] border border-[#292E36] rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#0B0D10] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#292E36] pb-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#0B0D10] border border-[#C9B27C]/40 flex items-center justify-center text-[#C9B27C] shadow">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#F2F2F2]">
              Editar Informações da Vigília
            </h2>
            <p className="text-xs text-[#9FA4AD]">
              Altere o título, tema, horários, versículo e detalhes visíveis a todos os participantes.
            </p>
          </div>
        </div>

        {savedSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#F2F2F2]">Alterações Salvas com Sucesso!</h3>
            <p className="text-xs text-[#9FA4AD]">Os novos dados já estão ativos em toda a plataforma.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome da Vigília & Igreja */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#9FA4AD] mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#C9B27C]" />
                  <span>Nome da Vigília *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Grande Vigília Jovem"
                  value={formData.vigilName}
                  onChange={(e) => setFormData({ ...formData, vigilName: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9FA4AD] mb-1.5 flex items-center gap-1.5">
                  <Church className="w-3.5 h-3.5 text-[#C9B27C]" />
                  <span>Igreja / Congregação *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: IASD Central de Fertilidade"
                  value={formData.churchName}
                  onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>
            </div>

            {/* Tema & Código de Acesso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#9FA4AD] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9B27C]" />
                  <span>Tema da Vigília</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: O Despertar do Remanescente"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9FA4AD] mb-1.5">
                  Código de Acesso (Para os participantes entrarem)
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
            <div className="space-y-2 p-3.5 bg-[#0B0D10] border border-[#292E36] rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#F2F2F2] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C9B27C]" />
                  <span>Programação de Data e Horários</span>
                </span>
                <span className="text-[11px] font-mono text-[#C9B27C] bg-[#14171C] px-2 py-0.5 rounded border border-[#292E36]">
                  Duração: {calculateVigilDurationHours(formData.startTime, formData.endTime)}h
                </span>
              </div>

              {/* Quick Date Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#9FA4AD] uppercase font-mono mr-1">Atalhos:</span>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setFormData({ ...formData, date: today });
                  }}
                  className="px-2 py-0.5 rounded bg-[#14171C] hover:bg-[#1f242d] text-[11px] text-[#F2F2F2] border border-[#292E36] transition"
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
                  className="px-2 py-0.5 rounded bg-[#14171C] hover:bg-[#1f242d] text-[11px] text-[#F2F2F2] border border-[#292E36] transition"
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
                  className="px-2 py-0.5 rounded bg-[#14171C] hover:bg-[#1f242d] text-[11px] text-[#C9B27C] border border-[#292E36] transition"
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
                  className="px-2 py-0.5 rounded bg-[#14171C] hover:bg-[#1f242d] text-[11px] text-[#C9B27C] border border-[#292E36] transition"
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
                  className="px-2 py-0.5 rounded bg-[#14171C] hover:bg-[#1f242d] text-[11px] text-[#9FA4AD] border border-[#292E36] transition"
                >
                  +7 Dias
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#9FA4AD] mb-1">
                    Data da Vigília *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#14171C] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs sm:text-sm font-mono focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9FA4AD] mb-1">
                    Horário Início *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-[#14171C] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs sm:text-sm font-mono focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9FA4AD] mb-1">
                    Horário Término *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-[#14171C] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs sm:text-sm font-mono focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Sala de Espera e Contagem Regressiva */}
            <div className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hourglass className="w-4 h-4 text-[#C9B27C]" />
                  <div>
                    <span className="text-xs font-bold text-[#F2F2F2] block">
                      Sala de Espera e Contagem Regressiva
                    </span>
                    <span className="text-[10px] text-[#9FA4AD]">
                      Exibe a tela de contagem regressiva interativa para quem acessar antes do início da vigília
                    </span>
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
                  className="bg-[#14171C] text-[#C9B27C] text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                >
                  <option value="auto">Automático (se data futura)</option>
                  <option value="always">Forçar Sala de Espera</option>
                  <option value="disabled">Desativado (Abrir Direto)</option>
                </select>
              </div>

              {formData.waitingMode !== 'disabled' && (
                <div className="space-y-3 pt-2 border-t border-[#292E36]/60">
                  <div>
                    <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                      Mensagem de Acolhimento na Sala de Espera
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Estamos em contagem regressiva para a nossa grande vigília! Prepare o seu coração..."
                      value={formData.waitingWelcomeMessage || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, waitingWelcomeMessage: e.target.value })
                      }
                      className="w-full bg-[#14171C] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#9FA4AD] mb-1 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#C9B27C]" />
                      <span>Foco de Oração e Intercessão da Semana</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Consagração das famílias, conversão dos jovens e unidade da igreja"
                      value={formData.waitingPrayerFocus || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, waitingPrayerFocus: e.target.value })
                      }
                      className="w-full bg-[#14171C] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <label className="flex items-center gap-2 p-2.5 bg-[#14171C] rounded-lg border border-[#292E36] text-xs text-[#F2F2F2] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showScheduleInWaiting !== false}
                        onChange={(e) =>
                          setFormData({ ...formData, showScheduleInWaiting: e.target.checked })
                        }
                        className="rounded border-[#292E36]"
                      />
                      <span>Mostrar prévia do cronograma na espera</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-[#14171C] rounded-lg border border-[#292E36] text-xs text-[#F2F2F2] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowEarlyCheckin !== false}
                        onChange={(e) =>
                          setFormData({ ...formData, allowEarlyCheckin: e.target.checked })
                        }
                        className="rounded border-[#292E36]"
                      />
                      <span>Permitir confirmação de presença antecipada</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Local & Cidade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#9FA4AD] mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C9B27C]" />
                  <span>Local / Endereço *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Templo Principal / Rua das Flores, 100"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9FA4AD] mb-1.5">
                  Cidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fertilidade - MG"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>
            </div>

            {/* Versículo & Referência */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#9FA4AD] mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#C9B27C]" />
                  <span>Versículo Chave</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Clama a mim, e responder-te-ei..."
                  value={formData.keyVerse}
                  onChange={(e) => setFormData({ ...formData, keyVerse: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9FA4AD] mb-1.5">
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

            {/* Proteção por Senha do Participante */}
            <div className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C9B27C]" />
                  <span className="text-xs font-bold text-[#F2F2F2]">
                    Exigir Senha para os Participantes Acessarem
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

              {formData.requireParticipantPassword && (
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-[#9FA4AD] mb-1">
                    Senha do Participante *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: oracao2026"
                    value={formData.participantPassword || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, participantPassword: e.target.value })
                    }
                    className="w-full bg-[#14171C] text-[#C9B27C] font-mono font-bold px-3.5 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Senha / PIN do Dirigente */}
            <div className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#C9B27C]" />
                <span className="text-xs font-bold text-[#F2F2F2]">
                  Senha / PIN de Acesso dos Dirigentes
                </span>
              </div>
              <p className="text-[11px] text-[#9FA4AD]">
                Senha exigida sempre que alguém quiser entrar no modo Dirigente para editar ou coordenar a vigília.
              </p>
              <input
                type="text"
                placeholder="Defina a senha de acesso dos dirigentes"
                value={formData.dirigentePin || ''}
                onChange={(e) =>
                  setFormData({ ...formData, dirigentePin: e.target.value })
                }
                className="w-full bg-[#14171C] text-[#C9B27C] font-mono font-bold px-3.5 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
              />
            </div>

            {/* Orientações aos Participantes */}
            <div>
              <label className="block text-xs font-semibold text-[#9FA4AD] mb-1.5">
                Orientações Gerais / Informações Adicionais
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Recomendamos a chegada com 15 minutos de antecedência..."
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2.5 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292E36]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D23] text-[#9FA4AD] hover:text-[#F2F2F2] text-xs font-semibold border border-[#292E36] transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-xs transition shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
