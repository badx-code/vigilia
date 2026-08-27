import React, { useState, useMemo } from 'react';
import { useVigilia } from '../../context/VigiliaContext';
import {
  Music,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  User,
  Sparkles,
} from 'lucide-react';
import { RepertoireSong } from '../../types';

export const RepertoireManagerSection: React.FC = () => {
  const {
    repertoire,
    addSong,
    updateSong,
    deleteSong,
    duplicateSong,
    reorderSongs,
    ministers,
  } = useVigilia();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<RepertoireSong>>({
    title: '',
    artist: '',
    key: 'G',
    responsible: '',
    momentTitle: '',
    notes: '',
  });

  const filteredSongs = useMemo(() => {
    if (!search.trim()) return repertoire;
    const q = search.toLowerCase();
    return repertoire.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.artist && s.artist.toLowerCase().includes(q)) ||
        (s.responsible && s.responsible.toLowerCase().includes(q)) ||
        (s.key && s.key.toLowerCase().includes(q))
    );
  }, [repertoire, search]);

  const handleMoveSong = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= repertoire.length) return;
    const updated = [...repertoire];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    reorderSongs(updated);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      title: '',
      artist: '',
      key: 'G',
      responsible: ministers.find((m) => m.role === 'Cantor' || m.role === 'Músico')?.name || '',
      momentTitle: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (s: RepertoireSong) => {
    setEditingId(s.id);
    setForm({ ...s });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    if (editingId) {
      updateSong(editingId, form);
    } else {
      addSong(form as Omit<RepertoireSong, 'id'>);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#14171C] border border-[#292E36]">
        <div>
          <h2 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
            <Music className="w-5 h-5 text-[#C9B27C]" />
            <span>Repertório Musical e Cânticos de Louvor</span>
          </h2>
          <p className="text-xs text-[#9FA4AD] mt-0.5">
            Músicas, tons, ministros responsáveis e ordens de louvor para a madrugada. Total de {repertoire.length} louvores.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#C9B27C]/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADICIONAR MÚSICA</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#9FA4AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título do louvor, cantor ou tom..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14171C] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredSongs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#14171C] border border-[#292E36] text-xs text-[#9FA4AD]">
            Nenhuma música cadastrada no repertório.
          </div>
        ) : (
          filteredSongs.map((s, index) => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/40 transition shadow space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0B0D10] border border-[#292E36] flex items-center justify-center font-bold text-xs text-[#C9B27C] shrink-0">
                    {index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[#F2F2F2]">{s.title}</h4>
                      {s.key && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                          Tom: {s.key}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#9FA4AD] mt-1">
                      {s.artist && <span>Versão: {s.artist}</span>}
                      {s.responsible && (
                        <span className="text-[#C9B27C] flex items-center gap-1">
                          <User className="w-3 h-3" /> {s.responsible}
                        </span>
                      )}
                      {s.momentTitle && <span className="text-indigo-400">Momento: {s.momentTitle}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMoveSong(index, index - 1)}
                    className="p-2 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] disabled:opacity-30 disabled:cursor-not-allowed transition border border-[#292E36]"
                    title="Subir"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === repertoire.length - 1}
                    onClick={() => handleMoveSong(index, index + 1)}
                    className="p-2 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] disabled:opacity-30 disabled:cursor-not-allowed transition border border-[#292E36]"
                    title="Descer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => duplicateSong(s.id)}
                    className="p-2 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#C9B27C] transition border border-[#292E36]"
                    title="Duplicar"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-2 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-amber-400 transition border border-[#292E36]"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remover "${s.title}" do repertório?`)) deleteSong(s.id);
                    }}
                    className="p-2 rounded-lg bg-[#0B0D10] hover:bg-rose-950/40 text-[#9FA4AD] hover:text-rose-400 transition border border-[#292E36]"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {s.notes && (
                <p className="text-[11px] text-[#9FA4AD] italic bg-[#0B0D10] p-2.5 rounded-xl border border-[#292E36]">
                  "{s.notes}"
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Add/Edit Song */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto flex items-center justify-center">
          <div className="relative w-full max-w-md my-auto rounded-3xl bg-[#14171C] border border-[#292E36] shadow-2xl animate-scaleUp flex flex-col max-h-[92vh]">
            {/* Header: Always visible */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#292E36] shrink-0 bg-[#14171C] rounded-t-3xl">
              <h3 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
                <Music className="w-4 h-4 text-[#C9B27C]" />
                <span>{editingId ? 'Editar Louvor' : 'Adicionar Louvor ao Repertório'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] flex items-center justify-center text-sm font-bold transition border border-[#292E36] cursor-pointer"
                title="Fechar"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="repertoire-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1.5">Título da Música *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Bondade de Deus / Porque Ele Vive"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1.5">Artista / Intérprete</label>
                  <input
                    type="text"
                    value={form.artist || ''}
                    onChange={(e) => setForm({ ...form, artist: e.target.value })}
                    placeholder="Ex: Isaías Saad"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1.5">Tom Musical</label>
                  <input
                    type="text"
                    value={form.key || 'G'}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                    placeholder="Ex: G, Em, Bb"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1.5">Ministro / Vocalista Principal</label>
                <input
                  type="text"
                  value={form.responsible || ''}
                  onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                  placeholder="Ex: Levita Débora"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1.5">Momento da Vigília Associado</label>
                <input
                  type="text"
                  value={form.momentTitle || ''}
                  onChange={(e) => setForm({ ...form, momentTitle: e.target.value })}
                  placeholder="Ex: Abertura / Clamor da Meia-Noite"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1.5">Observações da Banda / Arranjo</label>
                <textarea
                  rows={2}
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ex: Iniciar suave no teclado, solo de guitarra no refrão final..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>
            </form>

            {/* Footer Buttons: Always visible */}
            <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-[#292E36] bg-[#0E1116] rounded-b-3xl shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] font-bold transition border border-[#292E36] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="repertoire-form"
                className="px-5 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-extrabold shadow transition cursor-pointer"
              >
                {editingId ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR LOUVOR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
