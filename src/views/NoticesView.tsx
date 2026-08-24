import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { Notice } from '../types';
import {
  Bell,
  Plus,
  AlertTriangle,
  Trash2,
  Edit2,
  X,
  Pin,
  Clock,
  Megaphone,
} from 'lucide-react';

export const NoticesView: React.FC = () => {
  const { notices, addNotice, updateNotice, deleteNotice, userRole } = useVigilia();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Geral',
    isUrgent: false,
  });

  const handleOpenAdd = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      category: 'Geral',
      isUrgent: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      isUrgent: notice.isUrgent,
    });
    setIsModalOpen(true);
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingNotice) {
      updateNotice(editingNotice.id, formData);
    } else {
      addNotice(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div id="notices-view" className="space-y-4 sm:space-y-5 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#292E36] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F2F2F2] flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#C9B27C]" />
              <span>Avisos & Comunicados</span>
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#191D23] border border-[#292E36] text-[#9FA4AD] font-mono">
              {notices.length} avisos
            </span>
          </div>
          <p className="text-xs text-[#9FA4AD] mt-0.5">
            {userRole === 'dirigente'
              ? 'Publique comunicados oficiais, alterações no cronograma e avisos gerais para a congregação.'
              : 'Mural de comunicados oficiais e avisos da coordenação da vigília.'}
          </p>
        </div>

        {userRole === 'dirigente' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-semibold text-xs transition shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Aviso</span>
          </button>
        )}
      </div>

      {/* NOTICES LIST */}
      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className="p-8 text-center bg-[#14171C] rounded-2xl border border-[#292E36] text-[#9FA4AD] text-xs">
            Nenhum comunicado publicado no momento.
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className={`p-4 rounded-xl border transition ${
                notice.isUrgent
                  ? 'bg-[#191314] border-rose-800/60 shadow-md shadow-rose-950/20'
                  : 'bg-[#14171C] border-[#292E36]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {notice.isUrgent ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono uppercase bg-rose-950/90 text-rose-300 px-2 py-0.5 rounded border border-rose-800/60 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        IMPORTANTE / URGENTE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase bg-[#0B0D10] text-[#9FA4AD] px-2 py-0.5 rounded border border-[#292E36]">
                        {notice.category}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-[#F2F2F2]">
                    {notice.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#9FA4AD] leading-relaxed">
                    {notice.content}
                  </p>
                </div>

                {userRole === 'dirigente' && (
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => handleOpenEdit(notice)}
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D23] text-[#9FA4AD] hover:text-[#C9B27C] border border-[#292E36] transition"
                      title="Editar aviso"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Deseja excluir este aviso?')) {
                          deleteNotice(notice.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-rose-950/40 text-[#9FA4AD] hover:text-rose-400 border border-[#292E36] transition"
                      title="Excluir aviso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: ADD / EDIT NOTICE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#14171C] border border-[#292E36] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#292E36]">
              <h3 className="text-base font-bold text-[#F2F2F2]">
                {editingNotice ? 'Editar Aviso' : 'Publicar Novo Aviso'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#9FA4AD] hover:text-[#F2F2F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#9FA4AD] mb-1">
                  Título do Aviso *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mudança no Horário do Intervalo, Chegada..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9FA4AD] mb-1">Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Geral, Louvor, Alimentação, Estacionamento"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9FA4AD] mb-1">
                  Conteúdo da Mensagem *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Escreva a mensagem clara para os participantes e equipes..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.isUrgent}
                    onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                    className="rounded border-[#292E36] bg-[#0B0D10] text-rose-500 focus:ring-0"
                  />
                  <span className="text-xs text-rose-300 font-semibold">
                    Destacar como Aviso Urgente (banner na tela inicial)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#9FA4AD] hover:text-[#F2F2F2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#C9B27C] text-[#0B0D10] font-semibold text-xs shadow-md hover:bg-[#bfa872] transition"
                >
                  {editingNotice ? 'Salvar Alterações' : 'Publicar Agora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
