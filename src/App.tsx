import React, { useState } from 'react';
import { VigiliaProvider, useVigilia } from './context/VigiliaContext';
import { MemberView } from './views/MemberView';
import { DirigenteDashboardView } from './views/DirigenteDashboardView';
import { ProjectorScreenView } from './views/ProjectorScreenView';
import { AccessCodeModal } from './components/AccessCodeModal';
import { Key, Shield, User, Tv, Sparkles } from 'lucide-react';
import { UserRole } from './types';

const MainAppRouter: React.FC = () => {
  const { userRole, setUserRole, config } = useVigilia();
  const [showProjector, setShowProjector] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  // If Projector Mode is active, render the Projector screen
  if (showProjector) {
    return <ProjectorScreenView onClose={() => setShowProjector(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-[#0B0D10] text-[#F2F2F2] font-sans selection:bg-[#C9B27C]/30">
      {/* Top Universal Quick Switcher Banner (Compact & Non-intrusive) */}
      <div
        id="universal-role-bar"
        className="bg-[#14171C]/95 border-b border-[#292E36] px-3 py-1.5 flex flex-wrap items-center justify-between text-xs gap-2 sticky top-0 z-40 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[#C9B27C] font-serif font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vigília Planner</span>
          </div>
          <span className="text-[#292E36]">•</span>
          <span className="text-[#9FA4AD] text-[11px] truncate max-w-[140px] sm:max-w-none">
            {config.vigilName || 'Vigília de Oração'}
          </span>
        </div>

        {/* Role Indicator & Access Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center bg-[#0B0D10] p-0.5 rounded-lg border border-[#292E36] text-[11px]">
            <button
              id="role-btn-membro"
              onClick={() => setUserRole('membro')}
              className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                userRole === 'membro'
                  ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-sm'
                  : 'text-[#9FA4AD] hover:text-[#F2F2F2]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Membro</span>
            </button>
            <button
              id="role-btn-dirigente"
              onClick={() => setUserRole('dirigente')}
              className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                userRole === 'dirigente'
                  ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-sm'
                  : 'text-[#9FA4AD] hover:text-[#F2F2F2]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Dirigente</span>
            </button>
          </div>

          <button
            id="btn-open-code-modal"
            onClick={() => setShowAccessModal(true)}
            className="px-2.5 py-1 rounded-lg bg-[#C9B27C]/15 hover:bg-[#C9B27C]/25 text-[#C9B27C] border border-[#C9B27C]/30 text-[11px] font-bold flex items-center gap-1 transition"
          >
            <Key className="w-3 h-3" />
            <span className="hidden sm:inline">Entrar com</span> Código
          </button>

          <button
            id="btn-quick-projector"
            onClick={() => setShowProjector(true)}
            title="Abrir Telão / TV"
            className="p-1.5 rounded-lg bg-[#191D24] hover:bg-[#1f242d] text-[#C9B27C] border border-[#292E36] text-[11px] transition"
          >
            <Tv className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Render Specific View based on User Role */}
      {userRole === 'membro' ? (
        <MemberView
          onOpenDirigenteAuth={() => setShowAccessModal(true)}
          onOpenProjector={() => setShowProjector(true)}
        />
      ) : (
        <DirigenteDashboardView
          onOpenProjector={() => setShowProjector(true)}
          onLogout={() => setUserRole('membro')}
        />
      )}

      {/* Access Code Modal */}
      <AccessCodeModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onSelectRole={(role: UserRole) => setUserRole(role)}
      />
    </div>
  );
};

export default function App() {
  return (
    <VigiliaProvider>
      <MainAppRouter />
    </VigiliaProvider>
  );
}
