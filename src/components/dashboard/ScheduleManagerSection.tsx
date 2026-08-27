import React, { useState, useMemo } from 'react';
import { useVigilia } from '../../context/VigiliaContext';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  Flame,
  User,
  BookOpen,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Tv,
} from 'lucide-react';
import { ScheduleMoment, MomentType } from '../../types';
import {
  calculateDurationMinutes,
  addMinutesToTime,
  formatDurationHuman,
} from '../../utils/timeUtils';

export const ScheduleManagerSection: React.FC = () => {
  const {
    config,
    moments,
    addMoment,
    updateMoment,
    deleteMoment,
    duplicateMoment,
    moveMoment,
    ministers,
    delayMinutes,
    adjustDelay,
    recalculateScheduleTimes,
    resetScheduleToOriginal,
    currentTime,
  } = useVigilia();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<ScheduleMoment>>({
    title: '',
    type: 'oracao',
    startTime: '22:00',
    endTime: '22:30',
    responsible: '',
    description: '',
    scripture: '',
    useSlide: false,
    slideNotes: '',
    prayerMotives: '',
    sermonTopic: '',
    dynamicNotes: '',
    songsList: '',
  });

  const filteredMoments = useMemo(() => {
    if (!search.trim()) return moments;
    const q = search.toLowerCase();
    return moments.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.responsible && m.responsible.toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.type && m.type.toLowerCase().includes(q))
    );
  }, [moments, search]);

  const handleOpenAdd = () => {
    setEditingId(null);
    const last = moments[moments.length - 1];
    const newStart = last ? last.endTime : config.startTime || '22:00';
    const newEnd = addMinutesToTime(newStart, 25);

    setForm({
      title: '',
      type: 'oracao',
      startTime: newStart,
      endTime: newEnd,
      responsible: ministers[0]?.name || config.dirigenteProfile?.fullName || '',
      description: '',
      scripture: '',
      useSlide: false,
      slideNotes: '',
      prayerMotives: '',
      sermonTopic: '',
      dynamicNotes: '',
      songsList: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m: ScheduleMoment) => {
    setEditingId(m.id);
    setForm({ ...m });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startTime || !form.endTime) return;

    if (editingId) {
      updateMoment(editingId, form);
    } else {
      addMoment(form as Omit<ScheduleMoment, 'id'>);
    }
    setShowModal(false);
  };

  const getMomentBadge = (type: MomentType) => {
    switch (type) {
      case 'louvor':
      case 'louvor_especial':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">🎵 Louvor</span>;
      case 'pregacao':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">📖 Palavra</span>;
      case 'oracao':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">🙏 Oração</span>;
      case 'intercessao':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">🔥 Intercessão</span>;
      case 'ceia':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🍞 Ceia</span>;
      case 'pausa':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">☕ Intervalo</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">✨ Geral</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls: Delay & Quick Actions */}
      <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C9B27C]" />
              <span>Gerenciador do Cronograma da Vigília</span>
            </h2>
            <p className="text-xs text-[#9FA4AD] mt-0.5">
              Total de {moments.length} momentos cadastrados na ordem sequencial da madrugada.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#C9B27C]/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>ADICIONAR NOVO MOMENTO</span>
          </button>
        </div>

        {/* Delay Recalculation Bar */}
        <div className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#292E36] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#9FA4AD] font-semibold">Ajuste de Atraso / Adiantamento:</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded border ${
                delayMinutes > 0
                  ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                  : delayMinutes < 0
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                  : 'bg-[#191D24] text-[#9FA4AD] border-[#292E36]'
              }`}
            >
              {delayMinutes > 0 ? `+${delayMinutes} min (Atraso)` : delayMinutes < 0 ? `${delayMinutes} min (Adiantado)` : 'No Horário'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => adjustDelay(-5)}
              className="px-2.5 py-1 rounded-lg bg-[#191D24] hover:bg-[#222832] text-[#F2F2F2] border border-[#292E36] font-bold"
              title="Reduzir 5 minutos"
            >
              -5m
            </button>
            <button
              onClick={() => adjustDelay(5)}
              className="px-2.5 py-1 rounded-lg bg-[#191D24] hover:bg-[#222832] text-[#F2F2F2] border border-[#292E36] font-bold"
              title="Adicionar 5 minutos"
            >
              +5m
            </button>
            <button
              onClick={() => adjustDelay(15)}
              className="px-2.5 py-1 rounded-lg bg-[#191D24] hover:bg-[#222832] text-[#F2F2F2] border border-[#292E36] font-bold"
              title="Adicionar 15 minutos"
            >
              +15m
            </button>
            {delayMinutes !== 0 && (
              <button
                onClick={resetScheduleToOriginal}
                className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1"
                title="Zerar atraso"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Zerar</span>
              </button>
            )}
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
          placeholder="Buscar por momento, responsável, tipo ou palavra..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14171C] border border-[#292E36] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
        />
      </div>

      {/* Moments List */}
      <div className="space-y-3">
        {filteredMoments.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#14171C] border border-[#292E36] text-xs text-[#9FA4AD]">
            Nenhum momento encontrado. Clique em "Adicionar Novo Momento" acima para cadastrar.
          </div>
        ) : (
          filteredMoments.map((m, index) => {
            const duration = calculateDurationMinutes(m.startTime, m.endTime, config.startTime);
            return (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] hover:border-[#C9B27C]/40 transition shadow space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#0B0D10] border border-[#292E36] flex items-center justify-center text-xs font-mono font-bold text-[#C9B27C] shrink-0">
                      {index + 1}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#F2F2F2] bg-[#0B0D10] px-2 py-0.5 rounded border border-[#292E36]">
                          {m.startTime} → {m.endTime}
                        </span>
                        <span className="text-[11px] text-[#9FA4AD]">({formatDurationHuman(duration)})</span>
                        {getMomentBadge(m.type)}
                      </div>

                      <h4 className="text-sm font-bold text-[#F2F2F2] mt-1">{m.title}</h4>

                      {m.responsible && (
                        <p className="text-xs text-[#C9B27C] flex items-center gap-1 font-semibold mt-0.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{m.responsible}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Reorder, Duplicate, Edit, Delete */}
                  <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                    <button
                      disabled={index === 0}
                      onClick={() => moveMoment(m.id, 'up')}
                      className="p-2 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] disabled:opacity-30 disabled:cursor-not-allowed transition border border-[#292E36]"
                      title="Mover para Cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === moments.length - 1}
                      onClick={() => moveMoment(m.id, 'down')}
                      className="p-2 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] disabled:opacity-30 disabled:cursor-not-allowed transition border border-[#292E36]"
                      title="Mover para Baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => duplicateMoment(m.id)}
                      className="p-2 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-[#C9B27C] transition border border-[#292E36]"
                      title="Duplicar Momento"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-2 rounded-lg bg-[#0B0D10] hover:bg-[#191D24] text-[#9FA4AD] hover:text-amber-400 transition border border-[#292E36]"
                      title="Editar Momento"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir "${m.title}" do cronograma?`)) {
                          deleteMoment(m.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-[#0B0D10] hover:bg-rose-950/40 text-[#9FA4AD] hover:text-rose-400 transition border border-[#292E36]"
                      title="Excluir Momento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Additional Info / Description */}
                {(m.description || m.scripture || m.prayerMotives) && (
                  <div className="pt-2 border-t border-[#292E36]/60 text-xs text-[#9FA4AD] space-y-1">
                    {m.description && <p>{m.description}</p>}
                    {m.scripture && (
                      <p className="text-[#C9B27C] font-semibold flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Passagem bíblica: {m.scripture}</span>
                      </p>
                    )}
                    {m.prayerMotives && (
                      <p className="text-purple-300">
                        <span className="font-bold">Motivos:</span> {m.prayerMotives}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add/Edit Moment */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#14171C] border border-[#292E36] p-6 space-y-5 shadow-2xl animate-scaleUp my-8">
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
              <h3 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C9B27C]" />
                <span>{editingId ? 'Editar Momento da Vigília' : 'Cadastrar Novo Momento'}</span>
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
                <label className="font-bold text-[#9FA4AD] block mb-1">Título do Momento *</label>
                <input
                  type="text"
                  required
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Clamor pelas Famílias / Ministração da Palavra"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1">Tipo *</label>
                  <select
                    value={form.type || 'oracao'}
                    onChange={(e) => setForm({ ...form, type: e.target.value as MomentType })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  >
                    <option value="louvor">Louvor</option>
                    <option value="palavra">Palavra</option>
                    <option value="oracao">Oração</option>
                    <option value="clamor">Clamor</option>
                    <option value="ceia">Santa Ceia</option>
                    <option value="intervalo">Intervalo</option>
                    <option value="testemunho">Testemunho</option>
                    <option value="geral">Geral / Encerramento</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1">Início *</label>
                  <input
                    type="time"
                    required
                    value={form.startTime || '22:00'}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#9FA4AD] block mb-1">Término *</label>
                  <input
                    type="time"
                    required
                    value={form.endTime || '22:30'}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Responsável / Ministro</label>
                <input
                  type="text"
                  value={form.responsible || ''}
                  onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                  placeholder="Nome do pastor, cantor ou equipe responsável"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Texto Bíblico / Referência</label>
                <input
                  type="text"
                  value={form.scripture || ''}
                  onChange={(e) => setForm({ ...form, scripture: e.target.value })}
                  placeholder="Ex: Isaías 6:1-8"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Instruções / Motivos de Oração</label>
                <textarea
                  rows={2}
                  value={form.prayerMotives || ''}
                  onChange={(e) => setForm({ ...form, prayerMotives: e.target.value })}
                  placeholder="Pontos específicos de clamor ou dinâmica do momento..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#9FA4AD] block mb-1">Descrição / Detalhes para o Púlpito</label>
                <textarea
                  rows={2}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Orientações aos sonoplastas, músicos ou auxiliares..."
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
                  {editingId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR MOMENTO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
