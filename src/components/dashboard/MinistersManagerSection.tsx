import React, { useState, useMemo } from 'react';
import { useVigilia } from '../../context/VigiliaContext';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  UserCheck,
  Shield,
  Music,
} from 'lucide-react';
import { Minister, MinisterRole } from '../../types';

export const MinistersManagerSection: React.FC = () => {
  const {
    ministers,
    addMinister,
    updateMinister,
    deleteMinister,
    toggleMinisterStatus,
    duplicateMinister,
  } = useVigilia();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Minister>>({
    name: '',
    role: 'Pastor',
    customRole: '',
    phone: '',
    timeSlot: '',
    notes: '',
    photoUrl: '',
    status: 'confirmado',
    active: true,
  });

  const filteredMinisters = useMemo(() => {
    if (!search.trim()) return ministers;
    const q = search.toLowerCase();
    return ministers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.phone && m.phone.toLowerCase().includes(q)) ||
        (m.church && m.church.toLowerCase().includes(q))
    );
  }, [ministers, search]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      role: 'Pastor',
      phone: '',
      notes: '',
      photoUrl: '',
      church: '',
      active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m: Minister) => {
    setEditingId(m.id);
    setForm({ ...m });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    if (editingId) {
      updateMinister(editingId, form);
    } else {
      addMinister(form as Omit<Minister, 'id'>);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#14171C] border border-[#292E36]">
        <div>
          <h2 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C9B27C]" />
            <span>Pessoas, Ministros e Equipe da Vigília</span>
          </h2>
          <p className="text-xs text-[#9FA4AD] mt-0.5">
            Gerencie pregadores, cantores, intercessores, recepcionistas e apoio técnico. Total de {ministers.length} escalados.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#C9B27C]/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ESCALAR NOVA PESSOA</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#9FA4AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, função ministerial ou telefone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14171C] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
        />
      </div>

      {/* Grid of Ministers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMinisters.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 p-8 text-center rounded-2xl bg-[#14171C] border border-[#292E36] text-xs text-[#9FA4AD]">
            Nenhuma pessoa encontrada. Clique em "Escalar Nova Pessoa" para adicionar.
          </div>
        ) : (
          filteredMinisters.map((m) => {
            const isActive = m.active !== false;
            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl bg-[#14171C] border transition shadow space-y-3 flex flex-col justify-between ${
                  isActive ? 'border-[#292E36] hover:border-[#C9B27C]/40' : 'border-rose-950/50 bg-[#14171C]/50 opacity-70'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0B0D10] border border-[#292E36] flex items-center justify-center font-bold text-xs text-[#C9B27C] overflow-hidden shrink-0">
                        {m.photoUrl ? (
                          <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{m.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#F2F2F2] leading-tight">{m.name}</h4>
                        <span className="inline-block px-2 py-0.5 mt-1 rounded bg-[#0B0D10] border border-[#292E36] text-[10px] font-bold text-[#C9B27C]">
                          {m.role || 'Ministro'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleMinisterStatus(m.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                        isActive
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50'
                          : 'bg-rose-950/40 text-rose-300 border-rose-500/30 hover:bg-rose-900/50'
                      }`}
                      title={isActive ? 'Clique para desativar' : 'Clique para ativar'}
                    >
                      {isActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-[#9FA4AD]">
                    {m.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#C9B27C]" />
                        <span>{m.phone}</span>
                      </p>
                    )}
                    {m.timeSlot && (
                      <p className="flex items-center gap-1.5 font-mono text-[#F2F2F2]">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{m.timeSlot}</span>
                      </p>
                    )}
                    {m.notes && <p className="text-[11px] italic text-[#9FA4AD]/80">"{m.notes}"</p>}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-[#292E36]/60">
                  <button
                    onClick={() => duplicateMinister(m.id)}
                    className="p-2 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#C9B27C] transition border border-[#292E36]"
                    title="Duplicar"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="p-2 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-amber-400 transition border border-[#292E36]"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remover "${m.name}" da equipe?`)) {
                        deleteMinister(m.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-[#0B0D10] hover:bg-rose-950/40 text-[#9FA4AD] hover:text-rose-400 transition border border-[#292E36]"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add/Edit Minister */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-[#14171C] border border-[#292E36] p-6 space-y-5 shadow-2xl animate-scaleUp my-8">
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
              <h3 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C9B27C]" />
                <span>{editingId ? 'Editar Integrante da Equipe' : 'Escalar Nova Pessoa'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#9FA4AD] hover:text-[#F2F2F2] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Pr. Daniel Souza / Levita Amanda"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1">Função / Cargo *</label>
                  <select
                    value={form.role || 'Pastor'}
                    onChange={(e) => setForm({ ...form, role: e.target.value as MinisterRole })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  >
                    <option value="Pastor">Pastor</option>
                    <option value="Dirigente">Dirigente</option>
                    <option value="Pregador">Pregador</option>
                    <option value="Intercessor">Intercessor</option>
                    <option value="Cantor">Cantor(a)</option>
                    <option value="Músico">Músico / Instrumentista</option>
                    <option value="Diácono">Diácono / Recepção</option>
                    <option value="Mídia">Mídia / Som / Projeção</option>
                    <option value="Apoio">Apoio Geral</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1">Horário de Atuação</label>
                  <input
                    type="text"
                    value={form.timeSlot || ''}
                    onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                    placeholder="Ex: 23:00 às 01:00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">URL da Foto / Avatar</label>
                <input
                  type="url"
                  value={form.photoUrl || ''}
                  onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Observações ou Instruções Específicas</label>
                <textarea
                  rows={2}
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ex: Responsável por conduzir o momento de unção e óleo..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-extrabold shadow"
                >
                  {editingId ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR ESCALA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
