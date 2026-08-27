import React, { useState } from 'react';
import { useVigilia } from '../../context/VigiliaContext';
import {
  Flame,
  Megaphone,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  AlertTriangle,
  Heart,
  Clock,
  User,
  Bell,
} from 'lucide-react';
import { PrayerRequest } from '../../types';

export const PrayersNoticesSection: React.FC = () => {
  const {
    prayerRequests,
    approvePrayerRequest,
    rejectPrayerRequest,
    deletePrayerRequest,
    notices,
    addNotice,
    deleteNotice,
  } = useVigilia();

  const [activeTab, setActiveTab] = useState<'oracoes' | 'avisos'>('oracoes');

  // New Notice form state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeIsUrgent, setNoticeIsUrgent] = useState(false);
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);

  const pendingPrayers = prayerRequests.filter((p) => p.status === 'pendente');
  const approvedPrayers = prayerRequests.filter((p) => p.status === 'aprovado');

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    addNotice({
      title: noticeTitle,
      content: noticeContent,
      isUrgent: noticeIsUrgent,
      category: 'Geral',
    });

    setNoticeTitle('');
    setNoticeContent('');
    setNoticeIsUrgent(false);
    setShowAddNoticeModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub tabs switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#14171C] border border-[#292E36] w-fit">
        <button
          onClick={() => setActiveTab('oracoes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'oracoes'
              ? 'bg-[#C9B27C] text-[#0B0D10] shadow'
              : 'text-[#9FA4AD] hover:text-[#F2F2F2]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Pedidos de Oração</span>
          {pendingPrayers.length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-mono">
              {pendingPrayers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('avisos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'avisos'
              ? 'bg-[#C9B27C] text-[#0B0D10] shadow'
              : 'text-[#9FA4AD] hover:text-[#F2F2F2]'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Avisos & Comunicados ({notices.length})</span>
        </button>
      </div>

      {/* ABA 1: PEDIDOS DE ORAÇÃO */}
      {activeTab === 'oracoes' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Moderação de Clamor e Intercessão</span>
              </h3>
              <p className="text-xs text-[#9FA4AD] mt-0.5">
                Os pedidos aprovados aparecem na tela pública dos membros e na projeção da igreja.
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="text-[#9FA4AD]">Pendentes: </span>
              <span className="font-bold text-amber-400">{pendingPrayers.length}</span>
              <span className="text-[#9FA4AD] ml-3">Aprovados: </span>
              <span className="font-bold text-emerald-400">{approvedPrayers.length}</span>
            </div>
          </div>

          <div className="space-y-3">
            {prayerRequests.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#14171C] border border-[#292E36] text-xs text-[#9FA4AD]">
                Nenhum pedido de oração enviado até o momento.
              </div>
            ) : (
              prayerRequests.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl bg-[#14171C] border transition shadow-sm space-y-2.5 ${
                    p.status === 'pendente'
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : p.status === 'aprovado'
                      ? 'border-emerald-500/30'
                      : 'border-rose-950/40 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#F2F2F2] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#C9B27C]" />
                          <span>{p.authorName || 'Anônimo'}</span>
                        </h4>
                        <span className="text-[10px] text-[#9FA4AD] font-mono">{p.createdAt}</span>
                      </div>
                      {p.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#0B0D10] text-[10px] font-bold text-indigo-300 border border-[#292E36]">
                          {p.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => approvePrayerRequest(p.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0B0D10] text-xs font-bold flex items-center gap-1 transition"
                            title="Aprovar e exibir publicamente"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprovar</span>
                          </button>
                          <button
                            onClick={() => rejectPrayerRequest(p.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition"
                            title="Rejeitar pedido"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rejeitar</span>
                          </button>
                        </>
                      )}

                      {p.status === 'aprovado' && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          ✓ Aprovado
                        </span>
                      )}

                      {p.status === 'rejeitado' && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                          ✕ Rejeitado
                        </span>
                      )}

                      {deletePrayerRequest && (
                        <button
                          onClick={() => {
                            if (confirm('Excluir este pedido?')) deletePrayerRequest(p.id);
                          }}
                          className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-rose-950 text-[#9FA4AD] hover:text-rose-400 transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#D1D5DB] bg-[#0B0D10] p-3 rounded-xl border border-[#292E36] leading-relaxed">
                    "{p.request}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ABA 2: AVISOS OFICIAIS */}
      {activeTab === 'avisos' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#C9B27C]" />
                <span>Mural de Avisos da Vigília</span>
              </h3>
              <p className="text-xs text-[#9FA4AD] mt-0.5">
                Publique recados de transporte, lanches, escala e lembretes da liderança.
              </p>
            </div>

            <button
              onClick={() => setShowAddNoticeModal(true)}
              className="px-4 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-extrabold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>NOVO AVISO</span>
            </button>
          </div>

          <div className="space-y-3">
            {notices.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#14171C] border border-[#292E36] text-xs text-[#9FA4AD]">
                Nenhum aviso publicado.
              </div>
            ) : (
              notices.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl bg-[#14171C] border transition shadow-sm space-y-2 ${
                    n.isUrgent ? 'border-rose-500/50 bg-rose-950/10' : 'border-[#292E36]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {n.isUrgent && (
                        <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          Urgente
                        </span>
                      )}
                      <h4 className="text-xs font-bold text-[#F2F2F2]">{n.title}</h4>
                      {n.createdAt && <span className="text-[10px] text-[#9FA4AD] font-mono">{n.createdAt}</span>}
                    </div>

                    <button
                      onClick={() => deleteNotice(n.id)}
                      className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-rose-950 text-[#9FA4AD] hover:text-rose-400 transition"
                      title="Excluir aviso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-[#D1D5DB] leading-relaxed">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Add Notice */}
      {showAddNoticeModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto flex items-center justify-center">
          <div className="relative w-full max-w-md my-auto rounded-3xl bg-[#14171C] border border-[#292E36] shadow-2xl animate-scaleUp flex flex-col max-h-[92vh]">
            {/* Header: Always visible */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#292E36] shrink-0 bg-[#14171C] rounded-t-3xl">
              <h3 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#C9B27C]" />
                <span>Publicar Novo Aviso Oficial</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddNoticeModal(false)}
                className="w-8 h-8 rounded-full bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] flex items-center justify-center text-sm font-bold transition border border-[#292E36] cursor-pointer"
                title="Fechar"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="notice-form" onSubmit={handleAddNotice} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1.5">Título do Comunicado *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="Ex: Horário do Café da Madrugada"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1.5">Conteúdo do Aviso *</label>
                <textarea
                  rows={3}
                  required
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Escreva os detalhes e orientações para a igreja..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={noticeIsUrgent}
                  onChange={(e) => setNoticeIsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 bg-[#0B0D10] border-[#292E36]"
                />
                <label htmlFor="urgentCheck" className="text-xs font-semibold text-rose-300 cursor-pointer">
                  Marcar como Aviso Urgente / Destaque
                </label>
              </div>
            </form>

            {/* Footer Buttons: Always visible */}
            <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-[#292E36] bg-[#0E1116] rounded-b-3xl shrink-0">
              <button
                type="button"
                onClick={() => setShowAddNoticeModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] font-bold transition border border-[#292E36] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="notice-form"
                className="px-5 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-extrabold shadow transition cursor-pointer"
              >
                PUBLICAR AVISO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
