import React, { useState, useMemo } from 'react';
import { useVigilia } from '../../context/VigiliaContext';
import {
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  Search,
  Download,
  CheckCircle2,
  Phone,
  Calendar,
  Users,
  Check,
} from 'lucide-react';
import { Participant } from '../../types';

export const ParticipantsManagerSection: React.FC = () => {
  const {
    participants,
    addParticipant,
    updateParticipant,
    updateParticipantStatus,
    deleteParticipant,
  } = useVigilia();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const stats = useMemo(() => {
    const total = participants.length;
    const presentes = participants.filter((p) => p.status === 'presente').length;
    const confirmados = participants.filter((p) => p.status === 'confirmado').length;
    return { total, presentes, confirmados };
  }, [participants]);

  const filteredParticipants = useMemo(() => {
    if (!search.trim()) return participants;
    const q = search.toLowerCase();
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
    );
  }, [participants, search]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Participant) => {
    setEditingId(p.id);
    setName(p.name);
    setPhone(p.phone || '');
    setNotes(p.notes || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId && updateParticipant) {
      updateParticipant(editingId, { name, phone, notes });
    } else {
      addParticipant({
        name,
        phone,
        notes,
        status: 'confirmado',
      });
    }
    setShowModal(false);
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Status', 'Data Cadastro', 'Observacoes'];
    const rows = participants.map((p) => [
      `"${p.name}"`,
      `"${p.phone || ''}"`,
      `"${p.status}"`,
      `"${p.registeredAt}"`,
      `"${p.notes || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `participantes_vigilia_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Stats */}
      <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#C9B27C]" />
              <span>Gestão de Participantes & Lista de Presença</span>
            </h2>
            <p className="text-xs text-[#9FA4AD] mt-0.5">
              Controle de presença dos irmãos e convidados na vigília.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-2 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold flex items-center gap-1.5 transition"
              title="Exportar lista em CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#C9B27C]" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-[#C9B27C]/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ADICIONAR</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#292E36]">
            <span className="text-[#9FA4AD] block text-[11px]">Total Inscritos</span>
            <span className="text-base font-bold text-[#F2F2F2]">{stats.total}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <span className="text-emerald-400 block text-[11px]">Presentes no Local</span>
            <span className="text-base font-bold text-emerald-300">{stats.presentes}</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
            <span className="text-indigo-400 block text-[11px]">Confirmados</span>
            <span className="text-base font-bold text-indigo-300">{stats.confirmados}</span>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#9FA4AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar participante por nome ou telefone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14171C] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
        />
      </div>

      {/* List of Participants */}
      <div className="space-y-2.5">
        {filteredParticipants.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#14171C] border border-[#292E36] text-xs text-[#9FA4AD]">
            Nenhum participante encontrado.
          </div>
        ) : (
          filteredParticipants.map((p) => {
            const isPresent = p.status === 'presente';
            return (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateParticipantStatus(p.id, isPresent ? 'confirmado' : 'presente')}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition shrink-0 ${
                      isPresent
                        ? 'bg-emerald-500 text-[#0B0D10] border-emerald-400'
                        : 'bg-[#0B0D10] text-transparent border-[#292E36] hover:border-emerald-500'
                    }`}
                    title={isPresent ? 'Marcar como apenas confirmado' : 'Marcar como presente na igreja'}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div>
                    <h4 className="text-xs font-bold text-[#F2F2F2]">{p.name}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#9FA4AD] mt-0.5">
                      {p.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#C9B27C]" /> {p.phone}
                        </span>
                      )}
                      {p.registeredAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-400" /> {p.registeredAt}
                        </span>
                      )}
                      {p.notes && <span className="italic text-[#9FA4AD]/80">"{p.notes}"</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      isPresent
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                        : 'bg-indigo-950/50 text-indigo-300 border-indigo-500/40'
                    }`}
                  >
                    {isPresent ? '🟢 Presente' : '🔵 Confirmado'}
                  </span>

                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-amber-400 transition border border-[#292E36]"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir participante "${p.name}"?`)) {
                        deleteParticipant(p.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-rose-950/40 text-[#9FA4AD] hover:text-rose-400 transition border border-[#292E36]"
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

      {/* Modal Add/Edit Participant */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#14171C] border border-[#292E36] p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
              <h3 className="text-sm font-bold text-[#F2F2F2]">
                {editingId ? 'Editar Participante' : 'Adicionar Participante'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#9FA4AD] hover:text-[#F2F2F2] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do irmão ou visitante"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Observações (opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Visitante da igreja vizinha"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-[#0B0D10] text-[#9FA4AD] font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-extrabold shadow"
                >
                  {editingId ? 'SALVAR' : 'ADICIONAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
