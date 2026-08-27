import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { Participant } from '../types';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Trash2,
  Phone,
  Building,
  MapPin,
  X,
  CheckCircle2,
  Clock,
  Edit2,
  ShieldCheck,
  Filter,
  Check,
} from 'lucide-react';

export const ParticipantsView: React.FC = () => {
  const {
    participants,
    addParticipant,
    updateParticipant,
    updateParticipantStatus,
    deleteParticipant,
    config,
    userRole,
  } = useVigilia();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmado' | 'presente'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    church: '',
    city: config.city || '',
    status: 'confirmado' as 'confirmado' | 'presente',
  });

  const confirmedCount = participants.filter((p) => p.status === 'confirmado').length;
  const presentCount = participants.filter((p) => p.status === 'presente').length;
  const totalCount = participants.length;

  const handleOpenAdd = () => {
    setEditingParticipant(null);
    setFormData({
      name: '',
      phone: '',
      church: '',
      city: config.city || '',
      status: 'confirmado',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Participant) => {
    setEditingParticipant(p);
    setFormData({
      name: p.name,
      phone: p.phone || '',
      church: p.church || '',
      city: p.city || config.city || '',
      status: p.status,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingParticipant) {
      updateParticipant(editingParticipant.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        church: formData.church.trim() || undefined,
        city: formData.city.trim() || undefined,
        status: formData.status,
      });
    } else {
      addParticipant({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        church: formData.church.trim() || undefined,
        city: formData.city.trim() || undefined,
        status: formData.status,
      });
    }
    setIsAddModalOpen(false);
  };

  const filtered = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.church && p.church.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.phone && p.phone.includes(searchQuery));

    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div id="participants-view" className="space-y-6 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292E36] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F2F2F2]">
              Participantes e Presença
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#191D23] border border-[#292E36] text-[#9FA4AD] font-mono">
              {totalCount} cadastrados
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9FA4AD] mt-1">
            Controle de confirmação de presença, check-in na portaria e edição da lista de participantes.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-semibold text-sm transition shadow-lg shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Confirmar Presença</span>
        </button>
      </div>

      {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#9FA4AD] uppercase block">Total Geral</span>
            <span className="text-2xl font-bold text-[#F2F2F2]">{totalCount}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#191D23] text-[#C9B27C]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-amber-400/90 uppercase block">Confirmados</span>
            <span className="text-2xl font-bold text-amber-300">{confirmedCount}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-950/40 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-emerald-400/90 uppercase block">Presentes no Local</span>
            <span className="text-2xl font-bold text-emerald-300">{presentCount}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-950/40 text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9FA4AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar participante por nome, telefone ou igreja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14171C] text-[#F2F2F2] pl-10 pr-4 py-2.5 rounded-xl border border-[#292E36] text-xs sm:text-sm focus:border-[#C9B27C] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9FA4AD] hover:text-[#F2F2F2]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-2 rounded-lg font-medium transition ${
              filterStatus === 'all'
                ? 'bg-[#C9B27C] text-[#0B0D10]'
                : 'bg-[#14171C] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]'
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('presente')}
            className={`px-3 py-2 rounded-lg font-medium transition ${
              filterStatus === 'presente'
                ? 'bg-emerald-600 text-[#F2F2F2]'
                : 'bg-[#14171C] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]'
            }`}
          >
            Presentes ({presentCount})
          </button>
          <button
            onClick={() => setFilterStatus('confirmado')}
            className={`px-3 py-2 rounded-lg font-medium transition ${
              filterStatus === 'confirmado'
                ? 'bg-amber-600 text-[#F2F2F2]'
                : 'bg-[#14171C] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]'
            }`}
          >
            Confirmados ({confirmedCount})
          </button>
        </div>
      </div>

      {/* PARTICIPANTS LIST */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-[#14171C] rounded-2xl border border-[#292E36] text-[#9FA4AD]">
            Nenhum participante encontrado.
          </div>
        ) : (
          filtered.map((p) => {
            const isPresent = p.status === 'presente';
            return (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-[#14171C] border border-[#292E36] hover:border-[#3d4450] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-[#F2F2F2]">{p.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold uppercase ${
                        isPresent
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                      }`}
                    >
                      {isPresent ? 'Presente' : 'Confirmado'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#9FA4AD]">
                    {p.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#C9B27C]" />
                        <span>{p.phone}</span>
                      </div>
                    )}
                    {p.church && (
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-[#C9B27C]" />
                        <span>{p.church}</span>
                      </div>
                    )}
                    {p.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C9B27C]" />
                        <span>{p.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() =>
                      updateParticipantStatus(p.id, isPresent ? 'confirmado' : 'presente')
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      isPresent
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50 hover:bg-amber-950/40 hover:text-amber-300 hover:border-amber-800/50'
                        : 'bg-[#191D23] text-[#9FA4AD] hover:text-emerald-300 hover:bg-emerald-950/30 border-[#292E36]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isPresent ? 'Presente (Desmarcar)' : 'Fazer Check-in'}</span>
                  </button>

                  {/* Edit Button (Dirigentes) */}
                  {userRole === 'dirigente' && (
                    <button
                      onClick={() => handleOpenEdit(p)}
                      title="Editar dados do participante"
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#1f242c] text-[#9FA4AD] hover:text-[#C9B27C] border border-[#292E36] transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete */}
                  {userRole === 'dirigente' && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja remover "${p.name}" da lista?`)) {
                          deleteParticipant(p.id);
                        }
                      }}
                      title="Excluir"
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-rose-950/40 text-[#9FA4AD] hover:text-rose-400 border border-[#292E36] transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ADICIONAR / EDITAR PARTICIPANTE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#14171C] border border-[#292E36] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#292E36]">
              <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                {editingParticipant ? 'Editar Participante' : 'Confirmar Presença na Vigília'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#9FA4AD] hover:text-[#F2F2F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveParticipant} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome e sobrenome"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                  Status de Presença
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'confirmado' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      formData.status === 'confirmado'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                        : 'bg-[#0B0D10] border-[#292E36] text-[#9FA4AD]'
                    }`}
                  >
                    Confirmado (Aguardando)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'presente' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      formData.status === 'presente'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-[#0B0D10] border-[#292E36] text-[#9FA4AD]'
                    }`}
                  >
                    Presente no Local
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                  WhatsApp / Telefone (opcional)
                </label>
                <input
                  type="text"
                  placeholder="(00) 90000-0000"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                  Igreja / Congregação (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Comunidade Local, Igreja Convidada..."
                  value={formData.church || ''}
                  onChange={(e) => setFormData({ ...formData, church: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">Cidade</label>
                <input
                  type="text"
                  placeholder="Sua cidade"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#9FA4AD] hover:text-[#F2F2F2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C9B27C] text-[#0B0D10] font-semibold text-xs shadow-md hover:bg-[#bfa872] transition"
                >
                  {editingParticipant ? 'Salvar Alterações' : 'Salvar Presença'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
