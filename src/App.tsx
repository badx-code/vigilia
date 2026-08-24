import React, { useState } from 'react';
import { VigiliaProvider, useVigilia } from './context/VigiliaContext';
import { LandingGatewayView } from './views/LandingGatewayView';
import { MemberView } from './views/MemberView';
import { DirigenteDashboardView } from './views/DirigenteDashboardView';
import { ProjectorScreenView } from './views/ProjectorScreenView';
import { AccessCodeModal } from './components/AccessCodeModal';
import { UserRole } from './types';

const MainAppRouter: React.FC = () => {
  const { userRole, setUserRole } = useVigilia();
  const [showProjector, setShowProjector] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [hasChosenRole, setHasChosenRole] = useState(false);

  // If Projector Mode is active, render the Projector screen
  if (showProjector) {
    return <ProjectorScreenView onClose={() => setShowProjector(false)} />;
  }

  // If user hasn't entered via the gateway or logged out, show the clean LandingGatewayView
  if (!hasChosenRole) {
    return (
      <LandingGatewayView
        onSelectRole={(role: UserRole) => {
          setUserRole(role);
          setHasChosenRole(true);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0B0D10] text-[#F2F2F2] font-sans selection:bg-[#C9B27C]/30">
      {/* Render Specific View based on User Role */}
      {userRole === 'membro' ? (
        <MemberView
          onOpenDirigenteAuth={() => setShowAccessModal(true)}
          onOpenProjector={() => setShowProjector(true)}
          onLogout={() => {
            setHasChosenRole(false);
          }}
        />
      ) : (
        <DirigenteDashboardView
          onOpenProjector={() => setShowProjector(true)}
          onLogout={() => {
            setHasChosenRole(false);
          }}
        />
      )}

      {/* Access Code Modal (can be opened anytime if needed) */}
      <AccessCodeModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onSelectRole={(role: UserRole) => {
          setUserRole(role);
          setHasChosenRole(true);
        }}
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
