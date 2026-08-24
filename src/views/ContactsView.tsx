import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { UsefulContact } from '../types';
import {
  Phone,
  Plus,
  Trash2,
  Edit2,
  X,
  MessageCircle,
  Shield,
  Sliders,
  User,
  Users,
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const { usefulContacts, updateContact, addContact, deleteContact, userRole } = useVigilia();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<UsefulContact | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    name: '',
    phone: '',
    role: '',
  });

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormData({ title: '', name: '', phone: '', role: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: UsefulContact) => {
    setEditingContact(c);
    setFormData({ title: c.title, name: c.name, phone: c.phone, role: c.role });
    setIsModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.name.trim() || !formData.phone.trim()) return;

    if (editingContact) {
      updateContact(editingContact.id, formData);
    } else {
      addContact(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div id="contacts-view" className="space-y-4 sm:space-y-5 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#292E36] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F2F2F2] flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#C9B27C]" />
              <span>Contatos de Apoio & Plantão</span>
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#191D23] border border-[#292E36] text-[#9FA4AD] font-mono">
              {usefulContacts.length} contatos
            </span>
          </div>
          <p className="text-xs text-[#9FA4AD] mt-0.5">
            {userRole === 'dirigente'
              ? 'Mantenha os contatos de emergência, coordenação, copa e som sempre atualizados.'
              : 'Telefones e WhatsApp de apoio da coordenação durante toda a vigília.'}
          </p>
        </div>

        {userRole === 'dirigente' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-semibold text-xs transition shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Contato</span>
          </button>
        )}
      </div>

      {/* CONTACTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {usefulContacts.map((contact) => (
          <div
            key={contact.id}
            className="p-4 rounded-xl bg-[#14171C] border border-[#292E36] flex flex-col justify-between space-y-3 hover:border-[#3d4450] transition"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase text-[#C9B27C] font-semibold bg-[#0B0D10] px-2 py-0.5 rounded border border-[#292E36]">
                  {contact.title}
                </span>

                {userRole === 'dirigente' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(contact)}
                      className="text-[#9FA4AD] hover:text-[#C9B27C] p-1"
                      title="Editar"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Remover contato?')) {
                          deleteContact(contact.id);
                        }
                      }}
                      className="text-[#9FA4AD] hover:text-rose-400 p-1"
                      title="Remover"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-[#F2F2F2] pt-1">
                {contact.name}
              </h3>
              <p className="text-xs text-[#9FA4AD]">{contact.role}</p>
            </div>

            <div className="pt-2.5 border-t border-[#292E36] flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-[#F2F2F2]">
                {contact.phone}
              </span>

              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${contact.phone.replace(/\D/g, '')}`}
                  className="p-1.5 rounded-lg bg-[#0B0D10] hover:bg-[#191D23] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36] transition"
                  title="Ligar"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`https://wa.me/55${contact.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/40 transition"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT CONTACT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#14171C] border border-[#292E36] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#292E36]">
              <h3 className="text-base font-bold text-[#F2F2F2]">
                {editingContact ? 'Editar Contato' : 'Adicionar Novo Contato'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#9FA4AD] hover:text-[#F2F2F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#9FA4AD] mb-1">
                  Área / Setor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Coordenação Geral, Som, Recepção, Copa"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9FA4AD] mb-1">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do líder ou plantonista"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9FA4AD] mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: (11) 98765-4321"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9FA4AD] mb-1">
                  Função / Detalhes
                </label>
                <input
                  type="text"
                  placeholder="Ex: Plantão das 23h às 03h, Suporte Técnico..."
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] focus:border-[#C9B27C] focus:outline-none"
                />
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
                  {editingContact ? 'Salvar Alterações' : 'Salvar Contato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
