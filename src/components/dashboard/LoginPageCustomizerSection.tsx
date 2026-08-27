import React, { useState } from 'react';
import { useVigilia } from '../../context/VigiliaContext';
import {
  Layout,
  Type,
  Image,
  Sparkles,
  CheckCircle2,
  Save,
  Palette,
  Eye,
  Sliders,
} from 'lucide-react';
import { LoginPageConfig } from '../../types';

export const LoginPageCustomizerSection: React.FC = () => {
  const { config, updateLoginPageConfig } = useVigilia();

  const loginConfig = config.loginPageConfig || {
    title: 'Vigília Planner',
    subtitle: 'Painel Oficial de Gestão e Acompanhamento Espiritual',
    welcomeMessage: 'Bem-vindo à área de acesso da nossa vigília de oração e poder.',
    dirigenteButtonText: 'Entrar como Dirigente',
    participantButtonText: 'Entrar como Participante',
    showChurchLogo: true,
    logoUrl: '',
    bannerUrl: '',
    footerText: 'Vigília Planner • Desenvolvido para a edificação da Igreja',
    accentColor: '#C9B27C',
  };

  const [form, setForm] = useState<LoginPageConfig>({ ...loginConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLoginPageConfig(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#191D24] to-[#14171C] border border-[#292E36]">
        <div>
          <h2 className="text-lg font-bold text-[#F2F2F2] flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#C9B27C]" />
            <span>Personalização da Tela de Login & Página Pública</span>
          </h2>
          <p className="text-xs text-[#9FA4AD] mt-1">
            Altere os textos, botões, títulos e logos exibidos na primeira tela que os membros e dirigentes visualizam.
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
        {/* Bloco 1: Textos Principais */}
        <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
          <h3 className="text-sm font-bold text-[#C9B27C] flex items-center gap-2 border-b border-[#292E36] pb-2">
            <Type className="w-4 h-4" />
            <span>1. Títulos e Mensagens da Tela de Acesso</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Título Principal da Aplicação</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Vigília Planner / Vigília da Vitória"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Subtítulo / Descrição Curta</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Ex: Portal de Acompanhamento ao Vivo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Mensagem de Apresentação / Boas-Vindas</label>
              <textarea
                rows={2}
                value={form.welcomeMessage}
                onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
                placeholder="Ex: Digite seu código de acesso para acompanhar o cronograma em tempo real."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Botões & Rodapé */}
        <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
          <h3 className="text-sm font-bold text-[#C9B27C] flex items-center gap-2 border-b border-[#292E36] pb-2">
            <Sliders className="w-4 h-4" />
            <span>2. Textos dos Botões e Rodapé</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Texto do Botão: Área do Dirigente</label>
              <input
                type="text"
                value={form.dirigenteButtonText}
                onChange={(e) => setForm({ ...form, dirigenteButtonText: e.target.value })}
                placeholder="Ex: Entrar no Painel do Dirigente"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Texto do Botão: Acompanhar Vigília</label>
              <input
                type="text"
                value={form.participantButtonText}
                onChange={(e) => setForm({ ...form, participantButtonText: e.target.value })}
                placeholder="Ex: Acessar como Participante"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[#9FA4AD] block mb-1.5">Texto de Rodapé (Copyright / Informações)</label>
              <input
                type="text"
                value={form.footerText}
                onChange={(e) => setForm({ ...form, footerText: e.target.value })}
                placeholder="Ex: Vigília Planner • Ministério de Fé e Oração"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Logos & Imagens da Tela Inicial */}
        <div className="p-5 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
          <h3 className="text-sm font-bold text-[#C9B27C] flex items-center gap-2 border-b border-[#292E36] pb-2">
            <Image className="w-4 h-4" />
            <span>3. Logo & Banner da Tela de Entrada</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">URL da Imagem de Logo</label>
              <input
                type="url"
                value={form.logoUrl || ''}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="https://exemplo.com/logo-entrada.png"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9FA4AD] block mb-1.5">URL do Banner de Fundo (Opcional)</label>
              <input
                type="url"
                value={form.bannerUrl || ''}
                onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                placeholder="https://exemplo.com/fundo-login.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-[#292E36] text-[#F2F2F2] focus:outline-none focus:border-[#C9B27C]"
              />
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#14171C] border border-[#292E36]">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Configurações da página inicial salvas com sucesso!
            </span>
          ) : (
            <span className="text-xs text-[#9FA4AD]">
              Nenhum código de acesso é revelado na tela inicial (conformidade com regras de segurança).
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#C9B27C]/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>SALVAR PERSONALIZAÇÃO</span>
          </button>
        </div>
      </form>
    </div>
  );
};
