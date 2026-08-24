import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { PrayerRequest, PrayerCategory, PrayerStatus } from '../types';
import {
  Heart,
  Plus,
  Search,
  Trash2,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  Eye,
  Filter,
  Check,
  RefreshCw,
} from 'lucide-react';

export const PrayersView: React.FC = () => {
  const {
    prayerRequests,
    addPrayerRequest,
    incrementPrayer,
    deletePrayerRequest,
    approvePrayerRequest,
    rejectPrayerRequest,
    userRole,
  } = useVigilia();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModerationTab, setActiveModerationTab] = useState<'aprovados' | 'pendentes' | 'rejeitados'>('aprovados');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedSuccessNotice, setSubmittedSuccessNotice] = useState(false);

  const [formData, setFormData] = useState({
    authorName: '',
    request: '',
    category: 'espiritual' as PrayerCategory,
    isAnonymous: false,
  });

  const categories: { key: PrayerCategory; label: string }[] = [
    { key: 'espiritual', label: 'Vida Espiritual' },
    { key: 'familia', label: 'Família' },
    { key: 'saude', label: 'Saúde & Cura' },
    { key: 'trabalho', label: 'Trabalho & Finanças' },
    { key: 'libertacao', label: 'Libertação' },
    { key: 'gratidao', label: 'Gratidão' },
    { key: 'jovens', label: 'Jovens & Crianças' },
    { key: 'outro', label: 'Outro' },
  ];

  const approvedRequests = prayerRequests.filter((p) => (p.status || 'aprovado') === 'aprovado');
  const pendingRequests = prayerRequests.filter((p) => p.status === 'pendente');
  const rejectedRequests = prayerRequests.filter((p) => p.status === 'rejeitado');

  const handleOpenAdd = () => {
    setFormData({
      authorName: '',
      request: '',
      category: 'espiritual',
      isAnonymous: false,
    });
    setIsModalOpen(true);
  };

  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.request.trim()) return;

    const initialStatus: PrayerStatus = userRole === 'dirigente' ? 'aprovado' : 'pendente';

    addPrayerRequest(
      {
        authorName: formData.isAnonymous
          ? 'Anônimo'
          : formData.authorName.trim() || 'Participante da Vigília',
        request: formData.request.trim(),
        category: formData.category,
        isAnonymous: formData.isAnonymous,
      },
      initialStatus
    );

    setIsModalOpen(false);

    if (userRole === 'membro') {
      setSubmittedSuccessNotice(true);
      setTimeout(() => {
        setSubmittedSuccessNotice(false);
      }, 7000);
    }
  };

  // Determine displayed list
  let displayList: PrayerRequest[] = [];
  if (userRole === 'membro') {
    displayList = approvedRequests;
  } else {
    if (activeModerationTab === 'aprovados') displayList = approvedRequests;
    else if (activeModerationTab === 'pendentes') displayList = pendingRequests;
    else displayList = rejectedRequests;
  }

  const filtered = displayList.filter((p) => {
    const matchesSearch =
      p.request.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div id="prayers-view" className="space-y-4 sm:space-y-5 animate-fadeIn">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#292E36] pb-3.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F2F2F2] flex items-center gap-2">
              <span>🙏</span> Pedidos de Oração & Clamor
            </h1>
            {userRole === 'dirigente' ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 font-mono">
                Painel de Moderação
              </span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#191D23] border border-[#292E36] text-[#9FA4AD] font-mono">
                {approvedRequests.length} no mural
              </span>
            )}
          </div>
          <p className="text-xs text-[#9FA4AD] mt-0.5">
            {userRole === 'dirigente'
              ? 'Gerencie, avalie e aprove pedidos antes de publicá-los no mural da igreja.'
              : 'Una-se em intercessão pelos irmãos ou envie seu pedido para consagração da liderança.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-semibold text-xs transition shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Fazer Pedido de Oração</span>
        </button>
      </div>

      {/* PARTICIPANT SUCCESS SUBMISSION NOTICE */}
      {submittedSuccessNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-start gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-300">Pedido enviado com sucesso!</p>
            <p className="text-emerald-300/80 mt-0.5">
              Seu pedido foi encaminhado para a equipe de dirigentes da vigília. Após a avaliação e consagração dos líderes, ele será publicado no mural para intercessão comunitária.
            </p>
          </div>
          <button
            onClick={() => setSubmittedSuccessNotice(false)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DIRIGENTE MODERATION TABS */}
      {userRole === 'dirigente' && (
        <div className="p-1.5 bg-[#14171C] border border-[#292E36] rounded-xl flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveModerationTab('aprovados')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
              activeModerationTab === 'aprovados'
                ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-sm'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2]'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Mural Público ({approvedRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveModerationTab('pendentes')}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
              activeModerationTab === 'pendentes'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-amber-300 hover:text-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Aguardando Avaliação</span>
            {pendingRequests.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeModerationTab === 'pendentes'
                    ? 'bg-black text-amber-300'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                }`}
              >
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveModerationTab('rejeitados')}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
              activeModerationTab === 'rejeitados'
                ? 'bg-rose-900 text-rose-100 font-bold shadow-sm'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2]'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejeitados ({rejectedRequests.length})</span>
          </button>
        </div>
      )}

      {/* PENDING NOTIFICATION BANNER FOR DIRIGENTES */}
      {userRole === 'dirigente' && activeModerationTab !== 'pendentes' && pendingRequests.length > 0 && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Clock className="w-4 h-4 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
            <span>
              Há <strong>{pendingRequests.length} pedido{pendingRequests.length > 1 ? 's' : ''} de oração</strong> aguardando avaliação dos dirigentes.
            </span>
          </div>
          <button
            onClick={() => setActiveModerationTab('pendentes')}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-xs transition shrink-0"
          >
            Avaliar Agora
          </button>
        </div>
      )}

      {/* SEARCH AND CATEGORY FILTER */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#9FA4AD] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por palavras no pedido ou autor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14171C] text-[#F2F2F2] pl-8.5 pr-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition shrink-0 text-xs ${
              selectedCategory === 'all'
                ? 'bg-[#C9B27C] text-[#0B0D10]'
                : 'bg-[#14171C] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]'
            }`}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-2 py-1.5 rounded-lg font-medium transition shrink-0 text-[11px] ${
                selectedCategory === c.key
                  ? 'bg-[#C9B27C] text-[#0B0D10]'
                  : 'bg-[#14171C] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* PRAYERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-[#14171C] rounded-2xl border border-[#292E36] text-[#9FA4AD] space-y-2">
            <p className="text-sm text-[#F2F2F2] font-medium">Nenhum pedido encontrado</p>
            <p className="text-xs text-[#9FA4AD]">
              {userRole === 'dirigente' && activeModerationTab === 'pendentes'
                ? 'Não há nenhum pedido aguardando avaliação no momento. Tudo em dia!'
                : 'Nenhum pedido com os filtros selecionados.'}
            </p>
          </div>
        ) : (
          filtered.map((pr) => {
            const catLabel = categories.find((c) => c.key === pr.category)?.label || 'Geral';
            const userPrayed = pr.userPrayed;
            const isPending = pr.status === 'pendente';
            const isRejected = pr.status === 'rejeitado';

            return (
              <div
                key={pr.id}
                className={`p-4 rounded-xl bg-[#14171C] border flex flex-col justify-between space-y-3 transition ${
                  isPending
                    ? 'border-amber-700/60 bg-[#161410]'
                    : isRejected
                    ? 'border-rose-900/60 bg-[#171012]'
                    : 'border-[#292E36] hover:border-[#3d4450]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#0B0D10] text-[#C9B27C] border border-[#292E36]">
                        {catLabel}
                      </span>
                      {userRole === 'dirigente' && (
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border ${
                            isPending
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                              : isRejected
                              ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                          }`}
                        >
                          {isPending ? 'Aguardando' : isRejected ? 'Rejeitado' : 'Aprovado'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#9FA4AD] truncate max-w-[140px]">
                        {pr.isAnonymous ? 'Anônimo' : pr.authorName}
                      </span>
                      {userRole === 'dirigente' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Deseja remover permanentemente este pedido?')) {
                              deletePrayerRequest(pr.id);
                            }
                          }}
                          className="text-[#9FA4AD] hover:text-rose-400 p-1"
                          title="Remover permanentemente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-[#F2F2F2] leading-relaxed font-serif italic">
                    "{pr.request}"
                  </p>
                </div>

                {/* MODERATION ACTIONS (DIRIGENTE VIEW) */}
                {userRole === 'dirigente' && (
                  <div className="pt-2.5 border-t border-[#292E36] flex items-center justify-between gap-2 text-xs flex-wrap">
                    <div className="text-[11px] text-[#9FA4AD]">
                      <strong className="text-[#F2F2F2]">{pr.prayersCount}</strong> orando
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isPending && (
                        <>
                          <button
                            onClick={() => approvePrayerRequest(pr.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm"
                            title="Aprovar e publicar no mural"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aprovar & Publicar</span>
                          </button>
                          <button
                            onClick={() => rejectPrayerRequest(pr.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs transition"
                            title="Rejeitar pedido"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Rejeitar</span>
                          </button>
                        </>
                      )}

                      {isRejected && (
                        <button
                          onClick={() => approvePrayerRequest(pr.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C9B27C] text-[#0B0D10] font-semibold text-xs hover:brightness-110 transition"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Reavaliar & Aprovar</span>
                        </button>
                      )}

                      {!isPending && !isRejected && (
                        <button
                          onClick={() => rejectPrayerRequest(pr.id)}
                          className="text-[11px] text-[#9FA4AD] hover:text-rose-300 transition"
                          title="Remover do mural público"
                        >
                          Ocultar do Mural
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* PARTICIPANT ACTION (ESTOU ORANDO) */}
                {userRole === 'membro' && (
                  <div className="pt-2.5 border-t border-[#292E36] flex items-center justify-between gap-3 text-xs">
                    <span className="text-[#9FA4AD] text-[11px]">
                      <strong className="text-[#F2F2F2]">{pr.prayersCount}</strong> pessoa
                      {pr.prayersCount === 1 ? '' : 's'} orando por este pedido
                    </span>

                    <button
                      onClick={() => incrementPrayer(pr.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium text-xs transition ${
                        userPrayed
                          ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60 shadow-sm'
                          : 'bg-[#191D23] hover:bg-[#292E36] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          userPrayed ? 'fill-rose-400 text-rose-400' : ''
                        }`}
                      />
                      <span>{userPrayed ? 'Orando' : 'Estou Orando'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: NOVO PEDIDO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#14171C] border border-[#292E36] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#292E36]">
              <div>
                <h3 className="text-base font-bold text-[#F2F2F2]">
                  Novo Pedido de Oração
                </h3>
                <p className="text-[11px] text-[#9FA4AD]">
                  {userRole === 'dirigente'
                    ? 'Será adicionado diretamente ao mural público.'
                    : 'Será enviado para avaliação e consagração dos dirigentes.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#9FA4AD] hover:text-[#F2F2F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRequest} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                  Seu Pedido ou Motivo de Clamor *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva seu pedido de oração com sinceridade de coração..."
                  value={formData.request}
                  onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as PrayerCategory })
                  }
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="rounded border-[#292E36] bg-[#0B0D10] text-[#C9B27C] focus:ring-0"
                  />
                  <span className="text-xs text-[#F2F2F2]">Enviar como pedido anônimo</span>
                </label>
              </div>

              {!formData.isAnonymous && (
                <div>
                  <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                    Seu Nome (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nome completo ou primeiro nome"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>
              )}

              {userRole === 'membro' && (
                <div className="p-2.5 rounded-lg bg-[#0B0D10] border border-[#292E36] text-[11px] text-[#9FA4AD]">
                  ℹ️ Por zelo e discrição, os dirigentes examinam cada pedido antes de exibi-lo no mural geral.
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#292E36]">
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
                  {userRole === 'dirigente' ? 'Publicar Pedido' : 'Enviar para Dirigentes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
