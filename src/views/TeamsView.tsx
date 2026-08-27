import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { Team, TeamMember, SongItem, SermonItem, MediaRole } from '../types';
import { TeamIcon } from '../components/TeamIcon';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  UserPlus,
  Users,
  Music,
  BookOpen,
  Utensils,
  Sliders,
  Camera,
  ClipboardList,
  HandHeart,
  Shield,
  Phone,
  X,
  Sparkles,
} from 'lucide-react';

export const TeamsView: React.FC = () => {
  const {
    teams,
    addTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    toggleChecklistItem,
    addChecklistItem,
    removeChecklistItem,
    addSong,
    removeSong,
    addSermon,
    removeSermon,
    addMediaRole,
    removeMediaRole,
  } = useVigilia();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // New Team / Edit Team Form State
  const [teamForm, setTeamForm] = useState({
    name: '',
    icon: 'Users',
    leader: '',
    description: '',
  });

  // Modals for adding sub-items
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', role: '', phone: '' });

  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [songForm, setSongForm] = useState({ title: '', key: 'G (Sol)', artist: '', time: '21:05', notes: '' });

  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const [sermonForm, setSermonForm] = useState({ preacher: '', theme: '', scripture: '', time: '21:20', notes: '' });

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaForm, setMediaForm] = useState({ area: 'Fotografia', person: '', notes: '' });

  const [newChecklistText, setNewChecklistText] = useState('');

  const activeTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  const handleOpenAddTeam = () => {
    setEditingTeam(null);
    setTeamForm({ name: '', icon: 'Users', leader: '', description: '' });
    setIsTeamModalOpen(true);
  };

  const handleOpenEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      icon: team.icon,
      leader: team.leader,
      description: team.description,
    });
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name.trim()) return;

    if (editingTeam) {
      updateTeam(editingTeam.id, teamForm);
    } else {
      addTeam({
        ...teamForm,
        members: [],
      });
    }
    setIsTeamModalOpen(false);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !activeTeam) return;
    addTeamMember(activeTeam.id, memberForm);
    setMemberForm({ name: '', role: '', phone: '' });
    setIsMemberModalOpen(false);
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songForm.title.trim() || !activeTeam) return;
    addSong(activeTeam.id, songForm);
    setSongForm({ title: '', key: 'G (Sol)', artist: '', time: '21:05', notes: '' });
    setIsSongModalOpen(false);
  };

  const handleAddSermon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sermonForm.preacher.trim() || !activeTeam) return;
    addSermon(activeTeam.id, sermonForm);
    setSermonForm({ preacher: '', theme: '', scripture: '', time: '21:20', notes: '' });
    setIsSermonModalOpen(false);
  };

  const handleAddMediaRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaForm.person.trim() || !activeTeam) return;
    addMediaRole(activeTeam.id, mediaForm);
    setMediaForm({ area: 'Fotografia', person: '', notes: '' });
    setIsMediaModalOpen(false);
  };

  const handleAddChecklist = (type: 'equipment' | 'welcome' | 'task') => {
    if (!newChecklistText.trim() || !activeTeam) return;
    addChecklistItem(activeTeam.id, type, newChecklistText);
    setNewChecklistText('');
  };

  const availableIcons = [
    { key: 'Sliders', label: 'Som / Áudio' },
    { key: 'HandHeart', label: 'Recepção' },
    { key: 'Camera', label: 'Mídia / Foto' },
    { key: 'Music', label: 'Louvor' },
    { key: 'BookOpen', label: 'Palavra / Pregação' },
    { key: 'Utensils', label: 'Alimentação / Copa' },
    { key: 'ClipboardList', label: 'Organização' },
    { key: 'Shield', label: 'Intercessão' },
    { key: 'ShieldCheck', label: 'Segurança' },
    { key: 'Sparkles', label: 'Limpeza' },
    { key: 'Users', label: 'Geral / Apoio' },
  ];

  return (
    <div id="teams-view" className="space-y-6 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292E36] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F2F2F2]">
              Equipes e Responsáveis
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#191D23] border border-[#292E36] text-[#9FA4AD] font-mono">
              {teams.length} equipes
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9FA4AD] mt-1">
            Escalas, checklists técnicos, repertório de louvor e atribuições de cada equipe.
          </p>
        </div>

        <button
          onClick={handleOpenAddTeam}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-semibold text-sm transition shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Equipe</span>
        </button>
      </div>

      {/* HORIZONTAL TEAM SELECTOR CARDS (SCROLLABLE) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {teams.map((t) => {
          const isSelected = activeTeam?.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all shrink-0 border ${
                isSelected
                  ? 'bg-[#14171C] text-[#F2F2F2] border-[#C9B27C] shadow-lg shadow-[#C9B27C]/5 ring-1 ring-[#C9B27C]/30'
                  : 'bg-[#14171C] text-[#9FA4AD] hover:text-[#F2F2F2] border-[#292E36]'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isSelected ? 'bg-[#C9B27C]/20 text-[#C9B27C]' : 'bg-[#191D23] text-[#9FA4AD]'
                }`}
              >
                <TeamIcon name={t.icon} className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block font-semibold">{t.name}</span>
                <span className="text-[10px] text-[#9FA4AD] block">
                  {t.members.length} membro{t.members.length === 1 ? '' : 's'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE TEAM DETAILS PANEL */}
      {activeTeam && (
        <div className="space-y-6">
          {/* Active Team Header Card */}
          <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#191D23] border border-[#292E36] text-[#C9B27C]">
                  <TeamIcon name={activeTeam.icon} className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F2F2F2]">{activeTeam.name}</h2>
                  <p className="text-xs sm:text-sm text-[#9FA4AD] mt-0.5">{activeTeam.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditTeam(activeTeam)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#191D23] hover:bg-[#292E36] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] text-xs transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Equipe</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Deseja excluir a equipe "${activeTeam.name}"?`)) {
                      deleteTeam(activeTeam.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-[#191D23] hover:bg-rose-950/40 text-[#9FA4AD] hover:text-rose-400 border border-[#292E36] transition"
                  title="Excluir equipe"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Leader Badge */}
            <div className="mt-4 pt-4 border-t border-[#292E36] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#9FA4AD]">Responsável Geral / Líder:</span>
                <span className="font-semibold text-[#F2F2F2] bg-[#0B0D10] px-3 py-1 rounded-md border border-[#292E36]">
                  {activeTeam.leader || 'A definir'}
                </span>
              </div>
            </div>
          </div>

          {/* TEAM MEMBERS SECTION */}
          <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C9B27C]" />
                <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                  Membros da Equipe ({activeTeam.members.length})
                </h3>
              </div>

              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-semibold transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Adicionar Membro</span>
              </button>
            </div>

            {activeTeam.members.length === 0 ? (
              <p className="text-xs sm:text-sm text-[#9FA4AD] italic py-3">
                Nenhum membro cadastrado nesta equipe.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {activeTeam.members.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#292E36] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#F2F2F2] block">{m.name}</span>
                      <span className="text-[11px] text-[#C9B27C] block">{m.role}</span>
                      {m.phone && (
                        <span className="text-[10px] text-[#9FA4AD] block mt-0.5">{m.phone}</span>
                      )}
                    </div>

                    <button
                      onClick={() => removeTeamMember(activeTeam.id, m.id)}
                      title="Remover membro"
                      className="text-[#9FA4AD] hover:text-rose-400 p-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SPECIALIZED PANELS ACCORDING TO TEAM TYPE */}

          {/* 1. LOUVOR: REPERTÓRIO DE MÚSICAS */}
          {(activeTeam.name.toLowerCase().includes('louvor') || activeTeam.songs) && (
            <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-[#C9B27C]" />
                  <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                    Repertório de Louvores & Cânticos
                  </h3>
                </div>

                <button
                  onClick={() => setIsSongModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Música</span>
                </button>
              </div>

              {activeTeam.songs && activeTeam.songs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[#292E36] text-[#9FA4AD] text-[11px] uppercase font-mono">
                        <th className="pb-2.5">Música</th>
                        <th className="pb-2.5">Tom</th>
                        <th className="pb-2.5">Ministério / Autor</th>
                        <th className="pb-2.5">Horário Previsto</th>
                        <th className="pb-2.5">Observações</th>
                        <th className="pb-2.5 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#292E36]/60">
                      {activeTeam.songs.map((s) => (
                        <tr key={s.id} className="text-[#F2F2F2] hover:bg-[#191D23]/40">
                          <td className="py-3 font-semibold">{s.title}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 bg-[#0B0D10] rounded font-mono text-[#C9B27C] border border-[#292E36]">
                              {s.key}
                            </span>
                          </td>
                          <td className="py-3 text-[#9FA4AD]">{s.artist}</td>
                          <td className="py-3 font-mono text-xs">{s.time || '—'}</td>
                          <td className="py-3 text-xs text-[#9FA4AD]">{s.notes || '—'}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => removeSong(activeTeam.id, s.id)}
                              className="text-[#9FA4AD] hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#9FA4AD] italic py-2">
                  Nenhuma música cadastrada no repertório.
                </p>
              )}
            </div>
          )}

          {/* 2. PALAVRA / PREGAÇÃO: LISTA DE PREGADORES E TEMAS */}
          {(activeTeam.name.toLowerCase().includes('prega') ||
            activeTeam.name.toLowerCase().includes('palavra') ||
            activeTeam.sermons) && (
            <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#C9B27C]" />
                  <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                    Escala de Pregações e Mensagens Bíblicas
                  </h3>
                </div>

                <button
                  onClick={() => setIsSermonModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Mensagem</span>
                </button>
              </div>

              {activeTeam.sermons && activeTeam.sermons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeTeam.sermons.map((sm) => (
                    <div
                      key={sm.id}
                      className="p-4 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-[#C9B27C] bg-[#14171C] px-2 py-0.5 rounded border border-[#292E36]">
                          {sm.time}
                        </span>
                        <button
                          onClick={() => removeSermon(activeTeam.id, sm.id)}
                          className="text-[#9FA4AD] hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#F2F2F2]">{sm.theme}</h4>
                      <p className="text-xs text-[#9FA4AD]">
                        Pregador: <strong className="text-[#F2F2F2]">{sm.preacher}</strong>
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-[#C9B27C] font-serif italic">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{sm.scripture}</span>
                      </div>
                      {sm.notes && (
                        <p className="text-[11px] text-[#9FA4AD] pt-1 border-t border-[#292E36]/60">
                          Obs: {sm.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#9FA4AD] italic py-2">
                  Nenhuma mensagem cadastrada.
                </p>
              )}
            </div>
          )}

          {/* 3. SOM & ÁUDIO: CHECKLIST DE EQUIPAMENTOS E OBSERVAÇÕES */}
          {(activeTeam.name.toLowerCase().includes('som') || activeTeam.equipmentChecklist) && (
            <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#C9B27C]" />
                  <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                    Checklist de Equipamentos de Áudio & Palco
                  </h3>
                </div>
              </div>

              {/* Add checklist input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Novo item de checagem técnica de som..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2 rounded-xl border border-[#292E36] text-xs sm:text-sm focus:border-[#C9B27C] focus:outline-none"
                />
                <button
                  onClick={() => handleAddChecklist('equipment')}
                  className="px-3.5 py-2 rounded-xl bg-[#191D23] hover:bg-[#292E36] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold transition"
                >
                  Adicionar
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {activeTeam.equipmentChecklist?.map((chk) => (
                  <div
                    key={chk.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs sm:text-sm"
                  >
                    <button
                      onClick={() => toggleChecklistItem(activeTeam.id, 'equipment', chk.id)}
                      className="flex items-center gap-3 text-left flex-1"
                    >
                      {chk.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#9FA4AD] shrink-0" />
                      )}
                      <span className={chk.done ? 'line-through text-[#9FA4AD]' : 'text-[#F2F2F2]'}>
                        {chk.text}
                      </span>
                    </button>

                    <button
                      onClick={() => removeChecklistItem(activeTeam.id, 'equipment', chk.id)}
                      className="text-[#9FA4AD] hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {activeTeam.soundNotes && (
                <div className="p-3.5 rounded-xl bg-[#191D23]/60 border border-[#292E36] text-xs text-[#9FA4AD]">
                  <strong className="text-[#F2F2F2] block mb-0.5">Observações de Áudio:</strong>
                  {activeTeam.soundNotes}
                </div>
              )}
            </div>
          )}

          {/* 4. RECEPÇÃO: FUNÇÕES E ORIENTAÇÕES */}
          {(activeTeam.name.toLowerCase().includes('recep') || activeTeam.welcomeChecklist) && (
            <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
              <div className="flex items-center gap-2">
                <HandHeart className="w-5 h-5 text-[#C9B27C]" />
                <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                  Tarefas e Acolhimento da Recepção
                </h3>
              </div>

              {/* Add checklist input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nova tarefa de recepção ou orientação..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2 rounded-xl border border-[#292E36] text-xs sm:text-sm focus:border-[#C9B27C] focus:outline-none"
                />
                <button
                  onClick={() => handleAddChecklist('welcome')}
                  className="px-3.5 py-2 rounded-xl bg-[#191D23] hover:bg-[#292E36] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold transition"
                >
                  Adicionar
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {activeTeam.welcomeChecklist?.map((chk) => (
                  <div
                    key={chk.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs sm:text-sm"
                  >
                    <button
                      onClick={() => toggleChecklistItem(activeTeam.id, 'welcome', chk.id)}
                      className="flex items-center gap-3 text-left flex-1"
                    >
                      {chk.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#9FA4AD] shrink-0" />
                      )}
                      <span className={chk.done ? 'line-through text-[#9FA4AD]' : 'text-[#F2F2F2]'}>
                        {chk.text}
                      </span>
                    </button>

                    <button
                      onClick={() => removeChecklistItem(activeTeam.id, 'welcome', chk.id)}
                      className="text-[#9FA4AD] hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. MÍDIA: ROLES DE TRANSMISSÃO E FOTO */}
          {(activeTeam.name.toLowerCase().includes('mídia') ||
            activeTeam.name.toLowerCase().includes('midia') ||
            activeTeam.mediaRoles) && (
            <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#C9B27C]" />
                  <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                    Escala de Transmissão, Foto e Projeção
                  </h3>
                </div>

                <button
                  onClick={() => setIsMediaModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Função</span>
                </button>
              </div>

              {activeTeam.mediaRoles && activeTeam.mediaRoles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeTeam.mediaRoles.map((mr) => (
                    <div
                      key={mr.id}
                      className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#292E36] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#C9B27C] block uppercase font-mono text-[11px]">
                          {mr.area}
                        </span>
                        <span className="font-bold text-[#F2F2F2] block text-sm">{mr.person}</span>
                        {mr.notes && <span className="text-[#9FA4AD] block mt-0.5">{mr.notes}</span>}
                      </div>

                      <button
                        onClick={() => removeMediaRole(activeTeam.id, mr.id)}
                        className="text-[#9FA4AD] hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#9FA4AD] italic py-2">
                  Nenhuma atribuição de mídia cadastrada.
                </p>
              )}
            </div>
          )}

          {/* 6. ALIMENTAÇÃO: CARDÁPIO E HORÁRIOS */}
          {(activeTeam.name.toLowerCase().includes('alimenta') ||
            activeTeam.name.toLowerCase().includes('copa') ||
            activeTeam.menu) && (
            <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#C9B27C]" />
                <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                  Alimentação, Cardápio e Intervalo
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-2">
                  <span className="text-xs font-mono uppercase text-[#C9B27C] block font-bold">
                    Horário da Pausa
                  </span>
                  <p className="text-base font-semibold text-[#F2F2F2]">
                    {activeTeam.breakTime || '01:00 – 01:30'}
                  </p>
                  <p className="text-xs text-[#9FA4AD]">
                    Pausa para lanche, café e comunhão dos participantes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-2">
                  <span className="text-xs font-mono uppercase text-[#C9B27C] block font-bold">
                    Cardápio Previsto
                  </span>
                  <p className="text-xs sm:text-sm text-[#F2F2F2] leading-relaxed">
                    {activeTeam.menu || 'Café, chás, biscoitos, bolos e frutas.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 7. ORGANIZAÇÃO GERAL: CHECKLIST DE TAREFAS */}
          {(activeTeam.name.toLowerCase().includes('organiza') || activeTeam.taskChecklist) && (
            <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#C9B27C]" />
                <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                  Checklist Geral de Preparação do Templo
                </h3>
              </div>

              {/* Add checklist input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nova tarefa de infraestrutura, salão, banheiros..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2 rounded-xl border border-[#292E36] text-xs sm:text-sm focus:border-[#C9B27C] focus:outline-none"
                />
                <button
                  onClick={() => handleAddChecklist('task')}
                  className="px-3.5 py-2 rounded-xl bg-[#191D23] hover:bg-[#292E36] text-[#F2F2F2] border border-[#292E36] text-xs font-semibold transition"
                >
                  Adicionar
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {activeTeam.taskChecklist?.map((chk) => (
                  <div
                    key={chk.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs sm:text-sm"
                  >
                    <button
                      onClick={() => toggleChecklistItem(activeTeam.id, 'task', chk.id)}
                      className="flex items-center gap-3 text-left flex-1"
                    >
                      {chk.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#9FA4AD] shrink-0" />
                      )}
                      <span className={chk.done ? 'line-through text-[#9FA4AD]' : 'text-[#F2F2F2]'}>
                        {chk.text}
                      </span>
                    </button>

                    <button
                      onClick={() => removeChecklistItem(activeTeam.id, 'task', chk.id)}
                      className="text-[#9FA4AD] hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GENERAL TEAM NOTES */}
          {activeTeam.generalNotes && (
            <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36] text-xs text-[#9FA4AD]">
              <strong className="text-[#F2F2F2] block mb-1">Observações da Equipe:</strong>
              {activeTeam.generalNotes}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE / EDIT TEAM */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#14171C] border border-[#292E36] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#292E36]">
              <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                {editingTeam ? 'Editar Equipe' : 'Criar Nova Equipe'}
              </h3>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="p-1 text-[#9FA4AD] hover:text-[#F2F2F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                  Nome da Equipe *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Intercessão, Fotografia, Estacionamento..."
                  value={teamForm.name || ''}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">Ícone</label>
                <select
                  value={teamForm.icon || 'Users'}
                  onChange={(e) => setTeamForm({ ...teamForm, icon: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                >
                  {availableIcons.map((ic) => (
                    <option key={ic.key} value={ic.key}>
                      {ic.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                  Responsável / Líder
                </label>
                <input
                  type="text"
                  placeholder="Nome do líder da equipe"
                  value={teamForm.leader || ''}
                  onChange={(e) => setTeamForm({ ...teamForm, leader: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9FA4AD] mb-1">
                  Descrição das Atribuições
                </label>
                <textarea
                  rows={2}
                  placeholder="O que esta equipe realiza durante a vigília..."
                  value={teamForm.description || ''}
                  onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-sm focus:border-[#C9B27C] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#9FA4AD] hover:text-[#F2F2F2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C9B27C] text-[#0B0D10] font-semibold text-xs"
                >
                  Salvar Equipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TEAM MEMBER */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#14171C] border border-[#292E36] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F2F2F2]">Novo Membro da Equipe</h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-[#9FA4AD]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs text-[#9FA4AD] mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do integrante"
                  value={memberForm.name || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9FA4AD] mb-1">Função / Instrumento</label>
                <input
                  type="text"
                  placeholder="Ex: Teclado, Recepção de Jovens, Plantão..."
                  value={memberForm.role || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9FA4AD] mb-1">Telefone (opcional)</label>
                <input
                  type="text"
                  placeholder="(00) 90000-0000"
                  value={memberForm.phone || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#9FA4AD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#C9B27C] text-[#0B0D10] font-semibold text-xs"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SONG (LOUVOR) */}
      {isSongModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#14171C] border border-[#292E36] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F2F2F2]">Adicionar Louvor</h3>
              <button onClick={() => setIsSongModalOpen(false)} className="text-[#9FA4AD]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSong} className="space-y-3">
              <div>
                <label className="block text-xs text-[#9FA4AD] mb-1">Nome do Cântico / Hino *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Porque Ele Vive, Tu És Fiel..."
                  value={songForm.title || ''}
                  onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-[#9FA4AD] mb-1">Tom Musical</label>
                  <input
                    type="text"
                    placeholder="Ex: G, Em, C..."
                    value={songForm.key || ''}
                    onChange={(e) => setSongForm({ ...songForm, key: e.target.value })}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9FA4AD] mb-1">Horário Previsto</label>
                  <input
                    type="time"
                    value={songForm.time || ''}
                    onChange={(e) => setSongForm({ ...songForm, time: e.target.value })}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs font-mono focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#9FA4AD] mb-1">Artista / Ministério</label>
                <input
                  type="text"
                  placeholder="Ex: Hino Tradicional, Adoração..."
                  value={songForm.artist || ''}
                  onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9FA4AD] mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Entrada com violão suave..."
                  value={songForm.notes || ''}
                  onChange={(e) => setSongForm({ ...songForm, notes: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSongModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#9FA4AD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#C9B27C] text-[#0B0D10] font-semibold text-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERMON (PREGAÇÃO) */}
      {isSermonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#14171C] border border-[#292E36] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F2F2F2]">Cadastrar Pregação</h3>
              <button onClick={() => setIsSermonModalOpen(false)} className="text-[#9FA4AD]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSermon} className="space-y-3">
              <div>
                <label className="block text-xs text-[#9FA4AD] mb-1">Nome do(a) Pregador(a) *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do preletor"
                  value={sermonForm.preacher || ''}
                  onChange={(e) => setSermonForm({ ...sermonForm, preacher: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9FA4AD] mb-1">Tema da Mensagem</label>
                <input
                  type="text"
                  placeholder="Ex: A Oração que Move os Céus..."
                  value={sermonForm.theme || ''}
                  onChange={(e) => setSermonForm({ ...sermonForm, theme: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-[#9FA4AD] mb-1">Texto Bíblico</label>
                  <input
                    type="text"
                    placeholder="Ex: Jeremias 33:3"
                    value={sermonForm.scripture || ''}
                    onChange={(e) => setSermonForm({ ...sermonForm, scripture: e.target.value })}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9FA4AD] mb-1">Horário Previsto</label>
                  <input
                    type="text"
                    placeholder="21:20 - 21:50"
                    value={sermonForm.time || ''}
                    onChange={(e) => setSermonForm({ ...sermonForm, time: e.target.value })}
                    className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSermonModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#9FA4AD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#C9B27C] text-[#0B0D10] font-semibold text-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEDIA ROLE */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#14171C] border border-[#292E36] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F2F2F2]">Função na Mídia</h3>
              <button onClick={() => setIsMediaModalOpen(false)} className="text-[#9FA4AD]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMediaRole} className="space-y-3">
              <div>
                <label className="block text-xs text-[#9FA4AD] mb-1">Área da Mídia</label>
                <select
                  value={mediaForm.area || 'Fotografia'}
                  onChange={(e) => setMediaForm({ ...mediaForm, area: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                >
                  <option value="Fotografia">Fotografia</option>
                  <option value="Vídeo / Câmera">Vídeo / Câmera</option>
                  <option value="Projeção (Telão/Letras)">Projeção (Telão/Letras)</option>
                  <option value="Transmissão Ao Vivo">Transmissão Ao Vivo</option>
                  <option value="Redes Sociais">Redes Sociais</option>
                  <option value="Iluminação">Iluminação</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#9FA4AD] mb-1">Pessoa Escalada *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do integrante"
                  value={mediaForm.person || ''}
                  onChange={(e) => setMediaForm({ ...mediaForm, person: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9FA4AD] mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Câmera fixa no púlpito..."
                  value={mediaForm.notes || ''}
                  onChange={(e) => setMediaForm({ ...mediaForm, notes: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-2 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#9FA4AD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#C9B27C] text-[#0B0D10] font-semibold text-xs"
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
