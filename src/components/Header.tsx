import React from 'react';
import { useVigilia } from '../context/VigiliaContext';
import { formatCountdown } from '../utils/timeUtils';
import {
  Moon,
  Clock,
  Radio,
  Settings,
  Calendar,
  Layers,
  Heart,
  Users,
  Bell,
  Phone,
  Sparkles,
  Lock,
  ShieldCheck,
  User,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLoginModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, onOpenLoginModal }) => {
  const { config, currentTime, isSimulatedTime, userRole, setUserRole, isDirigenteAuthenticated } = useVigilia();
  const countdown = formatCountdown(config.date, config.startTime);

  const navItems = [
    { id: 'inicio', label: 'Início' },
    { id: 'cronograma', label: 'Cronograma' },
    { id: 'live', label: 'Modo Vigília (Ao Vivo)', isSpecial: true },
    { id: 'equipes', label: 'Equipes & Escalas' },
    { id: 'participantes', label: 'Participantes' },
    { id: 'pedidos', label: 'Pedidos de Oração' },
    { id: 'avisos', label: 'Avisos' },
    { id: 'contatos', label: 'Contatos' },
    { id: 'calendario', label: 'Calendário' },
    { id: 'configuracoes', label: 'Configurações' },
  ];

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 bg-[#0B0D10]/95 backdrop-blur-md border-b border-[#292E36]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo / Title Area */}
          <button
            onClick={() => onSelectTab('inicio')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#14171C] border border-[#292E36] flex items-center justify-center text-[#C9B27C] group-hover:border-[#C9B27C] transition shadow-md">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-[#F2F2F2] tracking-tight group-hover:text-[#C9B27C] transition truncate max-w-[200px] sm:max-w-xs">
                  {config.vigilName}
                </span>
              </div>
              <span className="text-[11px] text-[#9FA4AD] block truncate max-w-[180px]">
                {config.churchName}
              </span>
            </div>
          </button>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              if (item.isSpecial) {
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      isActive
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/60 shadow-md'
                        : 'bg-[#14171C] text-[#C9B27C] hover:bg-[#191D23] border-[#292E36]'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Modo Ao Vivo</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#191D23] text-[#F2F2F2] border border-[#292E36]'
                      : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#14171C]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Clock & Quick Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14171C] border border-[#292E36]">
              <Clock className="w-4 h-4 text-[#C9B27C]" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold font-mono text-[#F2F2F2] leading-none">
                  {currentTime}
                </span>
                <span className="text-[9px] text-[#9FA4AD] uppercase font-mono">
                  {countdown.isPast ? 'Em Andamento' : 'Aguardando'}
                </span>
              </div>
            </div>

            {/* Dirigente / Login Button */}
            {userRole === 'dirigente' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C9B27C] text-[#0B0D10] font-bold text-xs shadow-md">
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Dirigente Ativo</span>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14171C] hover:bg-[#191D23] text-[#C9B27C] border border-[#C9B27C]/50 text-xs font-bold transition shadow-sm"
                title="Acesso de Dirigentes e Pastores com PIN"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Entrar (PIN)</span>
              </button>
            )}

            {/* Quick Live Mode Shortcut Button on Mobile/Tablet */}
            <button
              onClick={() => onSelectTab('live')}
              className="xl:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#191D23] hover:bg-[#292E36] text-[#C9B27C] text-xs font-semibold border border-[#292E36] transition shadow-md"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Ao Vivo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
