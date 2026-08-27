import React, { useState } from 'react';
import { useVigilia } from '../../context/VigiliaContext';
import {
  Church,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Image,
  CheckCircle2,
  Save,
  Sparkles,
  Palette,
  Layers,
} from 'lucide-react';

export const VigilSettingsSection: React.FC = () => {
  const { config, updateConfig } = useVigilia();

  const [form, setForm] = useState({
    vigilName: config.vigilName || '',
    churchName: config.churchName || '',
    ministryName: config.ministryName || '',
    date: config.date || '',
    startTime: config.startTime || '22:00',
    endTime: config.endTime || '06:00',
    location: config.location || '',
    address: config.address || '',
    city: config.city || '',
    state: config.state || '',
    theme: config.theme || '',
    subtheme: config.subtheme || '',
    keyVerse: config.keyVerse || '',
    verseReference: config.verseReference || '',
    description: config.description || '',
    churchLogo: config.churchLogo || '',
    vigilBanner: config.vigilBanner || '',
    accentColor: config.accentColor || '#C9B27C',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#191D24] to-[#14171C] border border-[#292E36]">
        <div>
          <h2 className="text-lg font-bold text-[#F2F2F2] flex items-center gap-2">
            <Church className="w-5 h-5 text-[#C9B27C]" />
            <span>Configurações da Vigília</span>
          </h2>
          <p className="text-xs text-[#9FA4AD] mt-1">
            Personalize todos os dados fundamentais do evento. As alterações refletem imediatamente na página pública.
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
        {/* Bloco 1: Identificação & Igreja */}
        <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
          <h3 className="text-sm font-bold text-[#C9B27C] flex items-center gap-2 border-b border-[#292E36] pb-2">
            <Church className="w-4 h-4" />
            <span>1. Identificação da Vigília & Igreja</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Nome da Vigília *</label>
              <input
                type="text"
                required
                value={form.vigilName}
                onChange={(e) => setForm({ ...form, vigilName: e.target.value })}
                placeholder="Ex: Vigília do Clamor e Avivamento"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] transition"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Nome da Igreja *</label>
              <input
                type="text"
                required
                value={form.churchName}
                onChange={(e) => setForm({ ...form, churchName: e.target.value })}
                placeholder="Ex: Igreja Batista Central"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Nome do Ministério / Departamento</label>
              <input
                type="text"
                value={form.ministryName}
                onChange={(e) => setForm({ ...form, ministryName: e.target.value })}
                placeholder="Ex: Ministério de Louvor e Intercessão / Jovens Fortes"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] transition"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Tema & Palavra */}
        <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
          <h3 className="text-sm font-bold text-[#C9B27C] flex items-center gap-2 border-b border-[#292E36] pb-2">
            <BookOpen className="w-4 h-4" />
            <span>2. Tema, Mensagem & Versículo Principal</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Tema da Vigília *</label>
              <input
                type="text"
                required
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                placeholder="Ex: Chamados para a Presença"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] transition"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Subtema / Lema</label>
              <input
                type="text"
                value={form.subtheme}
                onChange={(e) => setForm({ ...form, subtheme: e.target.value })}
                placeholder="Ex: Uma noite de intercessão e milagres"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] transition"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Versículo Principal</label>
              <textarea
                rows={2}
                value={form.keyVerse}
                onChange={(e) => setForm({ ...form, keyVerse: e.target.value })}
                placeholder="Ex: Se o meu povo, que se chama pelo meu nome, se humilhar, e orar..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] transition"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Referência Bíblica</label>
              <input
                type="text"
                value={form.verseReference}
                onChange={(e) => setForm({ ...form, verseReference: e.target.value })}
                placeholder="Ex: 2 Crônicas 7:14"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Descrição Geral da Vigília</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Escreva uma breve apresentação sobre o propósito desta vigília..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] transition"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Horários, Datas & Localização */}
        <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
          <h3 className="text-sm font-bold text-[#C9B27C] flex items-center gap-2 border-b border-[#292E36] pb-2">
            <MapPin className="w-4 h-4" />
            <span>3. Data, Horários & Local</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Data da Vigília *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Hora de Início *</label>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Hora de Término *</label>
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Local / Templo</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ex: Templo Principal / Salão Nobre"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Endereço Completo</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ex: Av. Central, 1200"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Cidade</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Ex: São Paulo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Estado (UF)</label>
              <input
                type="text"
                maxLength={2}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                placeholder="Ex: SP"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C] uppercase"
              />
            </div>
          </div>
        </div>

        {/* Bloco 4: Identidade Visual & Banners */}
        <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
          <h3 className="text-sm font-bold text-[#C9B27C] flex items-center gap-2 border-b border-[#292E36] pb-2">
            <Palette className="w-4 h-4" />
            <span>4. Identidade Visual, Logos & Banner</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">URL da Logo da Igreja</label>
              <input
                type="url"
                value={form.churchLogo}
                onChange={(e) => setForm({ ...form, churchLogo: e.target.value })}
                placeholder="https://exemplo.com/logo.png"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
              {form.churchLogo && (
                <div className="mt-2 p-2 bg-[#0B0D10] rounded-lg border border-[#292E36] flex items-center gap-3">
                  <img src={form.churchLogo} alt="Logo Preview" className="w-10 h-10 object-contain rounded" />
                  <span className="text-[11px] text-[#9FA4AD]">Pré-visualização da Logo</span>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">URL do Banner da Vigília</label>
              <input
                type="url"
                value={form.vigilBanner}
                onChange={(e) => setForm({ ...form, vigilBanner: e.target.value })}
                placeholder="https://exemplo.com/banner.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
              {form.vigilBanner && (
                <div className="mt-2 p-2 bg-[#0B0D10] rounded-lg border border-[#292E36] flex items-center gap-3">
                  <img src={form.vigilBanner} alt="Banner Preview" className="w-16 h-8 object-cover rounded" />
                  <span className="text-[11px] text-[#9FA4AD]">Pré-visualização do Banner</span>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Cor Principal de Destaque (Dourado/Nobre)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#0B0D10] border border-[#292E36] text-xs font-mono text-[#F2F2F2]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Salvar Fixo / Final */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#14171C] border border-[#292E36]">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Todas as alterações foram salvas com sucesso!
            </span>
          ) : (
            <span className="text-xs text-[#9FA4AD]">
              Lembre-se de clicar em salvar para atualizar todos os dispositivos dos membros.
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#C9B27C]/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>SALVAR CONFIGURAÇÕES</span>
          </button>
        </div>
      </form>
    </div>
  );
};
