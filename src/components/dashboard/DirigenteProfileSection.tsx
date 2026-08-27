import React, { useState } from 'react';
import { useVigilia } from '../../context/VigiliaContext';
import { User, Phone, Mail, Instagram, MessageSquare, CheckCircle2, Save, Sparkles, Shield } from 'lucide-react';
import { DirigenteProfile } from '../../types';

export const DirigenteProfileSection: React.FC = () => {
  const { config, updateDirigenteProfile } = useVigilia();
  const profile = config.dirigenteProfile || {
    name: 'Pastor Marcos Silva',
    title: 'Pastor Titular',
    photoUrl: '',
    phone: '(11) 99999-8888',
    email: 'pastor@igreja.com',
    instagram: '@pr.marcossilva',
    bio: 'Dirigente geral da vigília. Em oração e intercessão pela igreja.',
    welcomeMessage: 'Sejam todos bem-vindos à nossa vigília de oração e poder!',
  };

  const [form, setForm] = useState<DirigenteProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDirigenteProfile(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#191D24] to-[#14171C] border border-[#292E36]">
        <div>
          <h2 className="text-lg font-bold text-[#F2F2F2] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C9B27C]" />
            <span>Dados do Dirigente da Vigília</span>
          </h2>
          <p className="text-xs text-[#9FA4AD] mt-1">
            Mantenha suas informações de liderança, contatos oficiais e mensagem pastoral sempre atualizadas.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Salvo com sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
          <h3 className="text-sm font-bold text-[#C9B27C] flex items-center gap-2 border-b border-[#292E36] pb-2">
            <User className="w-4 h-4" />
            <span>1. Perfil & Identificação do Dirigente</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Nome Completo do Dirigente *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Pr. Carlos Eduardo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Título / Cargo Eclesiástico *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Pastor Presidente / Líder de Intercessão / Bispo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[#9FA4AD] block mb-1.5">URL da Foto do Dirigente</label>
              <input
                type="url"
                value={form.photoUrl || ''}
                onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                placeholder="https://exemplo.com/pastor-foto.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
              {form.photoUrl && (
                <div className="mt-2 p-2 bg-[#0B0D10] rounded-xl border border-[#292E36] flex items-center gap-3 w-fit">
                  <img src={form.photoUrl} alt="Foto Preview" className="w-12 h-12 object-cover rounded-full border border-[#C9B27C]" />
                  <span className="text-xs text-[#9FA4AD]">Prévia da foto de perfil</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bloco 2: Contatos Oficiais */}
        <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
          <h3 className="text-sm font-bold text-[#C9B27C] flex items-center gap-2 border-b border-[#292E36] pb-2">
            <Phone className="w-4 h-4" />
            <span>2. Contatos & Redes Sociais</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Telefone / WhatsApp</label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">E-mail</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="dirigente@igreja.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Instagram / Rede Social</label>
              <input
                type="text"
                value={form.instagram || ''}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="@seu.perfil"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Mensagem Pastoral & Biografia */}
        <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
          <h3 className="text-sm font-bold text-[#C9B27C] flex items-center gap-2 border-b border-[#292E36] pb-2">
            <MessageSquare className="w-4 h-4" />
            <span>3. Biografia & Palavra de Boas-Vindas aos Participantes</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Mensagem de Boas-Vindas (Exibida no topo para os membros)</label>
              <textarea
                rows={2}
                value={form.welcomeMessage || ''}
                onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
                placeholder="Ex: Sejam todos bem-vindos! Que o Senhor derrame da Sua glória sobre cada vida nesta madrugada."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Biografia / Sobre o Dirigente</label>
              <textarea
                rows={3}
                value={form.bio || ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Breve histórico ministerial ou informações para a congregação..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#14171C] border border-[#292E36]">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Perfil do dirigente atualizado com sucesso!
            </span>
          ) : (
            <span className="text-xs text-[#9FA4AD]">
              Essas informações serão visíveis para os membros e equipes da vigília.
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#C9B27C]/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>SALVAR DADOS DO DIRIGENTE</span>
          </button>
        </div>
      </form>
    </div>
  );
};
