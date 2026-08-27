import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { ScheduleMoment, MomentType } from '../types';
import { MomentBadge, getMomentMeta } from '../components/MomentBadge';
import { getCurrentMomentStatus } from '../utils/timeUtils';
import { EditVigilDetailsModal } from '../components/EditVigilDetailsModal';
import {
  Clock,
  Plus,
  Search,
  Trash2,
  Edit2,
  Edit3,
  Copy,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Circle,
  User,
  Users,
  BookOpen,
  X,
  Sparkles,
  Monitor,
  Music,
  HeartHandshake,
  Lock,
  EyeOff,
  Sliders,
} from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const {
    moments,
    addMoment,
    updateMoment,
    deleteMoment,
    duplicateMoment,
    reorderMoments,
    currentTime,
    config,
    userRole,
  } = useVigilia();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditVigilOpen, setIsEditVigilOpen] = useState(false);
  const [editingMoment, setEditingMoment] = useState<ScheduleMoment | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Omit<ScheduleMoment, 'id'>>({
    title: '',
    type: 'oracao',
    startTime: '21:00',
    endTime: '21:15',
    responsible: '',
    team: 'Organização',
    scripture: '',
    description: '',
    notes: '',
    completed: false,
    useSlide: false,
    slideNotes: '',
    songsList: '',
    prayerMotives: '',
    sermonTopic: '',
    dynamicNotes: '',
  });

  const status = getCurrentMomentStatus(moments, currentTime, config.startTime, config.endTime);

  const handleOpenAdd = () => {
    setEditingMoment(null);
    setFormData({
      title: '',
      type: 'oracao',
      startTime: '21:00',
      endTime: '21:15',
      responsible: '',
      team: 'Organização',
      scripture: '',
      description: '',
      notes: '',
      completed: false,
      useSlide: false,
      slideNotes: '',
      songsList: '',
      prayerMotives: '',
      sermonTopic: '',
      dynamicNotes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (moment: ScheduleMoment) => {
    setEditingMoment(moment);
    setFormData({
      title: moment.title,
      type: moment.type,
      startTime: moment.startTime,
      endTime: moment.endTime,
      responsible: moment.responsible || '',
      team: moment.team || '',
      scripture: moment.scripture || '',
      description: moment.description || '',
      notes: moment.notes || '',
      completed: moment.completed || false,
      useSlide: moment.useSlide || false,
      slideNotes: moment.slideNotes || '',
      songsList: moment.songsList || '',
      prayerMotives: moment.prayerMotives || '',
      sermonTopic: moment.sermonTopic || '',
      dynamicNotes: moment.dynamicNotes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingMoment) {
      updateMoment(editingMoment.id, formData);
    } else {
      addMoment(formData);
    }
    setIsModalOpen(false);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= moments.length) return;

    const newMoments = [...moments];
    const temp = newMoments[index];
    newMoments[index] = newMoments[targetIndex];
    newMoments[targetIndex] = temp;

    reorderMoments(newMoments);
  };

  const filteredMoments = moments.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.responsible && m.responsible.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.team && m.team.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.songsList && m.songsList.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.prayerMotives && m.prayerMotives.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.sermonTopic && m.sermonTopic.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || m.type === selectedType;

    return matchesSearch && matchesType;
  });

  const momentTypesList: { type: MomentType; label: string }[] = [
    { type: 'oracao', label: 'Oração' },
    { type: 'louvor', label: 'Louvor' },
    { type: 'pregacao', label: 'Pregação' },
    { type: 'testemunho', label: 'Testemunho' },
    { type: 'dinamica', label: 'Dinâmica' },
    { type: 'louvor_especial', label: 'Louvor Especial' },
    { type: 'pausa', label: 'Pausa / Alimentação' },
    { type: 'intercessao', label: 'Intercessão' },
    { type: 'aviso', label: 'Avisos' },
    { type: 'outro', label: 'Outro' },
  ];

  return (
    <div id="schedule-view" className="space-y-4 sm:space-y-5 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#292E36] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F2F2F2]">
              Cronograma da Vigília
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#191D23] border border-[#292E36] text-[#9FA4AD] font-mono">
              {moments.length} momentos
            </span>
          </div>
          <p className="text-xs text-[#9FA4AD] mt-0.5">
            {userRole === 'dirigente'
              ? 'Gerencie horários, escalas, responsáveis e a ordem dos momentos.'
              : 'Acompanhe a programação oficial e os próximos horários da vigília.'}
          </p>
        </div>

        {/* Add Moment Action for Dirigentes */}
        {userRole === 'dirigente' && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditVigilOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#14171C] hover:bg-[#191D23] text-[#C9B27C] border border-[#292E36] font-semibold text-xs transition shadow-sm"
              title="Editar Nome, Tema, Horários e Detalhes da Vigília"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Vigília</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-semibold text-xs transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Momento</span>
            </button>
          </div>
        )}
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#9FA4AD] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por momento, pregação, responsável ou equipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14171C] text-[#F2F2F2] pl-8.5 pr-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FA4AD] hover:text-[#F2F2F2]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition shrink-0 text-xs ${
              selectedType === 'all'
                ? 'bg-[#C9B27C] text-[#0B0D10]'
                : 'bg-[#14171C] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]'
            }`}
          >
            Todos
          </button>
          {momentTypesList.map((t) => (
            <button
              key={t.type}
              onClick={() => setSelectedType(t.type)}
              className={`px-2 py-1.5 rounded-lg font-medium transition shrink-0 text-[11px] ${
                selectedType === t.type
                  ? 'bg-[#C9B27C] text-[#0B0D10]'
                  : 'bg-[#14171C] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TIMELINE LIST */}
      <div className="relative pl-3 sm:pl-6 border-l-2 border-[#292E36] space-y-3 my-4">
        {filteredMoments.length === 0 ? (
          <div className="p-6 text-center bg-[#14171C] rounded-2xl border border-[#292E36] text-[#9FA4AD] text-xs">
            Nenhum momento encontrado com os filtros atuais.
          </div>
        ) : (
          filteredMoments.map((moment, index) => {
            const isCurrent = status.activeMoment?.id === moment.id;
            const isNext = status.nextMoment?.id === moment.id;

            return (
              <div
                key={moment.id}
                className={`relative group rounded-xl p-3.5 sm:p-4 transition-all duration-200 ${
                  isCurrent
                    ? 'bg-[#14171C] border-2 border-[#C9B27C] shadow-lg shadow-[#C9B27C]/5 ring-1 ring-[#C9B27C]/30'
                    : moment.completed
                    ? 'bg-[#0E1014] border border-[#292E36]/40 opacity-75'
                    : 'bg-[#14171C] border border-[#292E36] hover:border-[#3d4450]'
                }`}
              >
                {/* Timeline Dot on the left line */}
                <div
                  className={`absolute -left-[20px] sm:-left-[32px] top-5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    isCurrent
                      ? 'bg-[#C9B27C] border-[#0B0D10] ring-4 ring-[#C9B27C]/30 animate-pulse'
                      : moment.completed
                      ? 'bg-emerald-600 border-[#0B0D10]'
                      : 'bg-[#191D23] border-[#292E36] group-hover:border-[#C9B27C]'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left Info: Time, Type, Title, Scripture, Description */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Time pill */}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B0D10] border border-[#292E36] font-mono text-[11px] text-[#C9B27C] font-semibold">
                        <Clock className="w-3 h-3" />
                        <span>
                          {moment.startTime} – {moment.endTime}
                        </span>
                      </div>

                      <MomentBadge type={moment.type} size="sm" />

                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-rose-950 text-rose-300 border border-rose-800/60 animate-pulse">
                          🔴 AGORA
                        </span>
                      )}

                      {isNext && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-[#191D23] text-[#9FA4AD] border border-[#292E36]">
                          PRÓXIMO
                        </span>
                      )}

                      {moment.completed && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                          ✓ Concluído
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-semibold ${
                        isCurrent ? 'text-[#F2F2F2]' : 'text-[#E0E2E6]'
                      }`}
                    >
                      {moment.title}
                    </h3>

                    {moment.description && (
                      <p className="text-xs text-[#9FA4AD] leading-relaxed">
                        {moment.description}
                      </p>
                    )}

                    {moment.scripture && (
                      <div className="flex items-center gap-1.5 text-xs text-[#C9B27C] font-serif italic pt-0.5">
                        <BookOpen className="w-3 h-3 flex-shrink-0" />
                        <span>{moment.scripture}</span>
                      </div>
                    )}

                    {/* Responsible single unified tag */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-[#9FA4AD]">
                      {moment.responsible && (
                        <div className="flex items-center gap-1.5 bg-[#0B0D10] px-2 py-0.5 rounded border border-[#292E36] text-[11px] text-[#F2F2F2]">
                          <User className="w-3 h-3 text-[#C9B27C]" />
                          <span><strong className="text-[#9FA4AD] font-normal">Responsável:</strong> {moment.responsible}</span>
                        </div>
                      )}

                      {moment.notes && userRole === 'dirigente' && (
                        <span className="text-[10px] italic text-[#9FA4AD] bg-[#191D23] px-1.5 py-0.5 rounded">
                          Obs: {moment.notes}
                        </span>
                      )}
                    </div>

                    {/* OPERATIONAL LEADERSHIP DETAILS (EXCLUSIVELY FOR DIRIGENTES - HIDDEN FROM PARTICIPANTS) */}
                    {userRole === 'dirigente' && (moment.useSlide || moment.slideNotes || moment.songsList || moment.prayerMotives || moment.sermonTopic || moment.dynamicNotes) && (
                      <div className="mt-2.5 pt-2.5 border-t border-[#292E36]/80 space-y-2 bg-[#0B0D10]/60 p-2.5 rounded-xl border border-[#292E36]">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9B27C] flex items-center gap-1 font-semibold">
                            <Lock className="w-3 h-3" />
                            <span>Operações do Dirigente / Púlpito:</span>
                          </span>
                          {moment.useSlide ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-950/90 text-blue-300 border border-blue-700/50 text-[10px] font-semibold flex items-center gap-1">
                              <Monitor className="w-3 h-3 text-blue-400" />
                              <span>Usa Slide {moment.slideNotes ? `• ${moment.slideNotes}` : ''}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-[#191D23] text-[#9FA4AD] border border-[#292E36] text-[10px]">
                              Sem Slide
                            </span>
                          )}
                        </div>

                        {/* Músicas do Louvor */}
                        {moment.songsList && (
                          <div className="flex items-start gap-2 text-xs bg-[#14171C] p-2 rounded-lg border border-amber-500/25 text-amber-200/90">
                            <Music className="w-3.5 h-3.5 text-[#C9B27C] shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <strong className="text-[#C9B27C] font-semibold block text-[11px]">Músicas que serão cantadas:</strong>
                              <span className="text-[#F2F2F2] leading-relaxed break-words">{moment.songsList}</span>
                            </div>
                          </div>
                        )}

                        {/* Motivo da Oração / Clamor */}
                        {moment.prayerMotives && (
                          <div className="flex items-start gap-2 text-xs bg-[#14171C] p-2 rounded-lg border border-purple-500/25 text-purple-200/90">
                            <HeartHandshake className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <strong className="text-purple-300 font-semibold block text-[11px]">Motivo da Oração / Clamor:</strong>
                              <span className="text-[#F2F2F2] leading-relaxed break-words">{moment.prayerMotives}</span>
                            </div>
                          </div>
                        )}

                        {/* Tema da Pregação */}
                        {moment.sermonTopic && (
                          <div className="flex items-start gap-2 text-xs bg-[#14171C] p-2 rounded-lg border border-emerald-500/25 text-emerald-200/90">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <strong className="text-emerald-300 font-semibold block text-[11px]">Tema da Pregação / Esboço:</strong>
                              <span className="text-[#F2F2F2] leading-relaxed break-words">{moment.sermonTopic}</span>
                            </div>
                          </div>
                        )}

                        {/* Instruções da Dinâmica */}
                        {moment.dynamicNotes && (
                          <div className="flex items-start gap-2 text-xs bg-[#14171C] p-2 rounded-lg border border-cyan-500/25 text-cyan-200/90">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <strong className="text-cyan-300 font-semibold block text-[11px]">Instruções / Materiais da Dinâmica:</strong>
                              <span className="text-[#F2F2F2] leading-relaxed break-words">{moment.dynamicNotes}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Actions: ONLY FOR DIRIGENTES */}
                  {userRole === 'dirigente' && (
                    <div className="flex items-center gap-1 sm:self-start pt-2 sm:pt-0 border-t sm:border-t-0 border-[#292E36]">
                      {/* Toggle Completed */}
                      <button
                        onClick={() => updateMoment(moment.id, { completed: !moment.completed })}
                        title={moment.completed ? 'Marcar como pendente' : 'Marcar como concluído'}
                        className={`p-1.5 rounded-lg border transition ${
                          moment.completed
                            ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                            : 'text-[#9FA4AD] hover:text-[#F2F2F2] bg-[#0B0D10] border-[#292E36]'
                        }`}
                      >
                        {moment.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Up / Down Reorder */}
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        title="Mover para cima"
                        className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D23] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === moments.length - 1}
                        title="Mover para baixo"
                        className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D23] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(moment)}
                        title="Editar momento"
                        className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D23] text-[#9FA4AD] hover:text-[#C9B27C] border border-[#292E36] transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => duplicateMoment(moment.id)}
                        title="Duplicar"
                        className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D23] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] transition hidden md:inline-flex"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja remover o momento "${moment.title}"?`)) {
                            deleteMoment(moment.id);
                          }
                        }}
                        title="Excluir"
                        className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-rose-950/40 text-[#9FA4AD] hover:text-rose-400 border border-[#292E36] transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ADICIONAR / EDITAR MOMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#14171C] border border-[#292E36] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#292E36]">
              <h3 className="text-base font-bold text-[#F2F2F2]">
                {editingMoment ? 'Editar Momento do Cronograma' : 'Novo Momento da Vigília'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#9FA4AD] hover:text-[#F2F2F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-medium text-[#9FA4AD] mb-1">Título do Momento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Abertura & Louvor Congregacional"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-[#9FA4AD] mb-1">Início *</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-2.5 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#9FA4AD] mb-1">Fim *</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-2.5 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#9FA4AD] mb-1">Tipo</label>
                  <select
                    value={formData.type || 'louvor'}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as MomentType })
                    }
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-2 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                  >
                    {momentTypesList.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#9FA4AD] mb-1">Responsável / Dirigente / Equipe</label>
                <input
                  type="text"
                  placeholder="Ex: Pr. Marcos, Equipe de Louvor, Ministério Jovem..."
                  value={formData.responsible || ''}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9FA4AD] mb-1">Texto Bíblico / Leitura</label>
                <input
                  type="text"
                  placeholder="Ex: Salmos 119:105, Efésios 6:10-18"
                  value={formData.scripture || ''}
                  onChange={(e) => setFormData({ ...formData, scripture: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9FA4AD] mb-1">Descrição / Objetivos (Público)</label>
                <textarea
                  rows={2}
                  placeholder="Instruções gerais visíveis a todos os participantes..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none resize-none"
                />
              </div>

              {/* OPERATIONAL SECTION (ONLY FOR DIRIGENTES - HIDDEN FROM PARTICIPANTS) */}
              <div className="p-3 bg-[#0B0D10] rounded-xl border border-[#C9B27C]/30 space-y-3 mt-2">
                <div className="flex items-center justify-between border-b border-[#292E36] pb-2">
                  <div className="flex items-center gap-1.5 text-[#C9B27C] font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Operações do Dirigente & Equipe Técnica</span>
                  </div>
                  <span className="text-[10px] text-amber-400/90 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                    Oculto dos Participantes
                  </span>
                </div>

                {/* 1. SLIDE / PROJEÇÃO NO TELÃO */}
                <div className="space-y-2 bg-[#14171C] p-2.5 rounded-lg border border-[#292E36]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.useSlide || false}
                      onChange={(e) => setFormData({ ...formData, useSlide: e.target.checked })}
                      className="w-4 h-4 rounded bg-[#0B0D10] border-[#292E36] text-[#C9B27C] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="font-semibold text-[#F2F2F2] flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-blue-400" />
                      <span>Vai usar Slide / Projeção no Telão?</span>
                    </span>
                  </label>

                  {formData.useSlide && (
                    <div className="pt-1 pl-6">
                      <label className="block text-[11px] text-[#9FA4AD] mb-1">
                        Identificação / Arquivo / Observações do Slide:
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Slide 03 - Letras no ProPresenter / PPT do Pregador"
                        value={formData.slideNotes || ''}
                        onChange={(e) => setFormData({ ...formData, slideNotes: e.target.value })}
                        className="w-full bg-[#0B0D10] text-[#F2F2F2] px-2.5 py-1.5 rounded-lg border border-[#292E36] focus:border-[#C9B27C] focus:outline-none text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* 2. LOUVORES: QUAIS MÚSICAS SERÃO CANTADAS */}
                <div className="space-y-1">
                  <label className="block font-medium text-[#C9B27C] flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#C9B27C]" />
                    <span>Quais músicas serão cantadas?</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: 1. Porque Ele Vive (Tom G) • 2. Bondade de Deus (Tom C) • 3. Vitorioso és (Tom Em)"
                    value={formData.songsList || ''}
                    onChange={(e) => setFormData({ ...formData, songsList: e.target.value })}
                    className="w-full bg-[#14171C] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none resize-none"
                  />
                </div>

                {/* 3. ORAÇÃO: QUAL O MOTIVO DA ORAÇÃO */}
                <div className="space-y-1">
                  <label className="block font-medium text-purple-300 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-purple-400" />
                    <span>Qual o motivo da oração / clamor?</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Clamor pelas famílias, restauração matrimonial, jovens e enfermos"
                    value={formData.prayerMotives || ''}
                    onChange={(e) => setFormData({ ...formData, prayerMotives: e.target.value })}
                    className="w-full bg-[#14171C] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none resize-none"
                  />
                </div>

                {/* 4. PREGAÇÃO: TEMA DO SERMÃO / ESBOÇO */}
                <div className="space-y-1">
                  <label className="block font-medium text-emerald-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tema da Pregação / Esboço do Sermão:</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: O Dever de Orar Sempre e Nunca Esmorecer"
                    value={formData.sermonTopic || ''}
                    onChange={(e) => setFormData({ ...formData, sermonTopic: e.target.value })}
                    className="w-full bg-[#14171C] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>

                {/* 5. DINÂMICA: MATERIAIS E INSTRUÇÕES */}
                <div className="space-y-1">
                  <label className="block font-medium text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Materiais e Instruções da Dinâmica:</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Distribuir cartões de oração, canetas e formar duplas por 5 minutos"
                    value={formData.dynamicNotes || ''}
                    onChange={(e) => setFormData({ ...formData, dynamicNotes: e.target.value })}
                    className="w-full bg-[#14171C] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none resize-none"
                  />
                </div>

                {/* 6. ANOTAÇÕES GERAIS DE BASTIDORES (NOTES) */}
                <div className="space-y-1">
                  <label className="block font-medium text-[#9FA4AD]">
                    Outras Anotações de Bastidores / Equipe Técnica:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Avisar a sonoplastia para baixar o retorno na transição"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-[#14171C] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>
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
                  {editingMoment ? 'Salvar Alterações' : 'Adicionar Momento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: EDITAR DETALHES / NOME DA VIGILIA */}
      <EditVigilDetailsModal
        isOpen={isEditVigilOpen}
        onClose={() => setIsEditVigilOpen(false)}
      />
    </div>
  );
};
