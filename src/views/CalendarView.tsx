import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { VigilCalendarEvent } from '../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit2,
  X,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useVigilia();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<VigilCalendarEvent | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '21:00 – 05:00',
    type: 'vigilia' as 'vigilia' | 'ensaio' | 'reuniao' | 'evento',
    location: '',
    notes: '',
  });

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '21:00 – 05:00',
      type: 'vigilia',
      location: 'Templo Principal',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: VigilCalendarEvent) => {
    setEditingEvent(ev);
    setFormData({
      title: ev.title,
      date: ev.date,
      time: ev.time,
      type: ev.type,
      location: ev.location || '',
      notes: ev.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, formData);
    } else {
      addCalendarEvent(formData);
    }
    setIsModalOpen(false);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vigilia':
        return { label: 'Vigília', bg: 'bg-[#C9B27C]/20 text-[#C9B27C] border-[#C9B27C]/40' };
      case 'ensaio':
        return { label: 'Ensaio', bg: 'bg-amber-950/60 text-amber-300 border-amber-800/40' };
      case 'reuniao':
        return { label: 'Reunião de Líderes', bg: 'bg-blue-950/60 text-blue-300 border-blue-800/40' };
      case 'evento':
      default:
        return { label: 'Evento', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' };
    }
  };

  const sortedEvents = [...calendarEvents].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div id="calendar-view" className="space-y-6 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292E36] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F2F2F2]">
              Calendário de Vigílias & Ensaios
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#191D23] border border-[#292E36] text-[#9FA4AD] font-mono">
              {calendarEvents.length} datas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9FA4AD] mt-1">
            Planejamento de vigílias futuras, ensaios de som/louvor e reuniões preparatórias.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-semibold text-sm transition shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Evento</span>
        </button>
      </div>

      {/* EVENTS TIMELINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedEvents.map((ev) => {
          const typeMeta = getTypeLabel(ev.type);
          return (
            <div
              key={ev.id}
              className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-md border ${typeMeta.bg}`}
                  >
                    {typeMeta.label}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(ev)}
                      className="text-[#9FA4AD] hover:text-[#F2F2F2] p-1"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja excluir "${ev.title}"?`)) {
                          deleteCalendarEvent(ev.id);
                        }
                      }}
                      className="text-[#9FA4AD] hover:text-rose-400 p-1"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">{ev.title}</h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#9FA4AD]">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#C9B27C]" />
                    <span className="font-mono">{ev.date}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#C9B27C]" />
                    <span>{ev.time}</span>
                  </div>

                  {ev.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C9B27C]" />
                      <span>{ev.location}</span>
                    </div>
                  )}
                </div>

                {ev.notes && (
                  <p className="text-xs text-[#9FA4AD] pt-1 leading-relaxed">{ev.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT CALENDAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#14171C] border border-[#292E36] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#292E36]">
              <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                {editingEvent ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#9FA4AD] hover:text-[#F2F2F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vigília Geral, Ensaio de Louvor..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9FA4AD] mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'vigilia' | 'ensaio' | 'reuniao' | 'evento',
                      })
                    }
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                  >
                    <option value="vigilia">Vigília</option>
                    <option value="ensaio">Ensaio</option>
                    <option value="reuniao">Reunião de Líderes</option>
                    <option value="evento">Evento Especial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9FA4AD] mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9FA4AD] mb-1">Horário</label>
                  <input
                    type="text"
                    placeholder="21:00 – 05:00"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9FA4AD] mb-1">Local</label>
                  <input
                    type="text"
                    placeholder="Ex: Templo Principal"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais para a equipe..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#9FA4AD] hover:text-[#F2F2F2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C9B27C] text-[#0B0D10] font-semibold text-xs shadow-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
