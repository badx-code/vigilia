import React, { useState } from 'react';
import { useVigilia } from '../context/VigiliaContext';
import {
  Home,
  Clock,
  Radio,
  Layers,
  Menu,
  X,
  Users,
  Heart,
  Bell,
  Phone,
  Calendar,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onRequestDirigenteMode?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  onRequestDirigenteMode,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { userRole, setUserRole, pendingPrayersCount, lockDirigenteMode } = useVigilia();

  const handleSelect = (tab: string) => {
    onSelectTab(tab);
    setIsDrawerOpen(false);
  };

  const handleGoToDirigente = () => {
    setIsDrawerOpen(false);
    if (onRequestDirigenteMode) {
      onRequestDirigenteMode();
    } else {
      setUserRole('dirigente');
    }
  };

  if (userRole === 'membro') {
    const participantTabs = [
      { id: 'inicio', label: 'Início', icon: Home },
      { id: 'cronograma', label: 'Horários', icon: Clock },
      { id: 'pedidos', label: 'Orações', icon: Heart },
      { id: 'avisos', label: 'Avisos', icon: Bell },
    ];

    return (
      <div
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0D10]/95 backdrop-blur-md border-t border-[#292E36] px-2 py-1 xl:hidden"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {participantTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
                  isActive
                    ? 'text-[#C9B27C] font-bold'
                    : 'text-[#9FA4AD] hover:text-[#F2F2F2]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}

          {/* Quick Login / Dirigente Button in participant mobile nav */}
          <button
            onClick={handleGoToDirigente}
            className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[#C9B27C] hover:text-[#F2F2F2] transition"
            title="Acesso de Dirigente / Pastor (PIN)"
          >
            <ShieldCheck className="w-5 h-5 text-[#C9B27C]" />
            <span className="text-[10px] mt-0.5 font-semibold">Entrar (PIN)</span>
          </button>
        </div>
      </div>
    );
  }

  // Dirigente mode navigation
  const mainTabs = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'cronograma', label: 'Horários', icon: Clock },
    { id: 'live', label: 'Telão', icon: Radio, isSpecial: true },
    {
      id: 'pedidos',
      label: 'Orações',
      icon: Heart,
      badge: pendingPrayersCount > 0 ? pendingPrayersCount : undefined,
    },
  ];

  const drawerTabs = [
    { id: 'equipes', label: 'Equipes & Escalas', icon: Layers },
    { id: 'participantes', label: 'Participantes & Presença', icon: Users },
    { id: 'avisos', label: 'Avisos & Comunicados', icon: Bell },
    { id: 'contatos', label: 'Contatos & Apoio', icon: Phone },
    { id: 'calendario', label: 'Calendário de Vigílias', icon: Calendar },
    { id: 'configuracoes', label: 'Configurações & Backup', icon: Settings },
  ];

  return (
    <>
      {/* DRAWER MODAL */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-fadeIn xl:hidden">
          <div
            className="w-full bg-[#14171C] border-t border-[#292E36] rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-slideUp"
            style={{ animationDuration: '0.2s' }}
          >
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9FA4AD] font-mono">
                Gestão dos Dirigentes
              </span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg bg-[#0B0D10] text-[#9FA4AD] hover:text-[#F2F2F2] border border-[#292E36]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Role Switcher in mobile drawer */}
            <div className="p-1 bg-[#0B0D10] border border-[#292E36] rounded-xl flex items-center gap-1">
              <button
                onClick={() => {
                  lockDirigenteMode();
                  setIsDrawerOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-[#9FA4AD] hover:text-[#F2F2F2]"
              >
                <User className="w-3.5 h-3.5" />
                <span>Bloquear & Participante</span>
              </button>
              <button
                onClick={handleGoToDirigente}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-[#C9B27C] text-[#0B0D10]"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Modo Dirigente</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {drawerTabs.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                      isActive
                        ? 'bg-[#191D23] border-[#C9B27C] text-[#F2F2F2]'
                        : 'bg-[#0B0D10] border-[#292E36] text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-[#14171C] text-[#C9B27C] border border-[#292E36]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV BAR */}
      <div
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0D10]/95 backdrop-blur-md border-t border-[#292E36] px-2 py-1 xl:hidden"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            if (tab.isSpecial) {
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
                    isActive
                      ? 'text-rose-400 font-bold'
                      : 'text-[#C9B27C] font-semibold hover:text-[#F2F2F2]'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-full ${
                      isActive
                        ? 'bg-rose-950/80 border border-rose-800/60 shadow-lg'
                        : 'bg-[#191D23] border border-[#292E36]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <span className="text-[10px] mt-0.5">{tab.label}</span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition relative ${
                  isActive
                    ? 'text-[#C9B27C] font-bold'
                    : 'text-[#9FA4AD] hover:text-[#F2F2F2]'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 bg-amber-500 text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}

          {/* MORE BUTTON */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
              drawerTabs.some((t) => t.id === currentTab)
                ? 'text-[#C9B27C] font-bold'
                : 'text-[#9FA4AD] hover:text-[#F2F2F2]'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Mais</span>
          </button>
        </div>
      </div>
    </>
  );
};
