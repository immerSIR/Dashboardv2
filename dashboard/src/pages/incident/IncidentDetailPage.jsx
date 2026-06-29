import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSidebarState } from '../../hooks/useSidebarState';
import { Header, Sidebar } from '../../components/layout';
import { IncidentDetail } from './components/IncidentDetail/IncidentDetail';
import './incident.css';

export const IncidentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    isOpen: sidebarOpen,
    setOpen: setSidebarOpen,
    isCollapsed: sidebarCollapsed,
    setCollapsed: setSidebarCollapsed,
  } = useSidebarState();

  const handleBack = () => {
    navigate('/incidents');
  };

  return (
    <div className="incident-page">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div className={`incident-page-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <div className="incident-workspace">
          {/* On rend le composant détail existant. Il gère déjà useSWR pour charger ses données. */}
          <IncidentDetail 
            incident={{ id }} 
            onBack={handleBack} 
            isLoading={false} 
          />
        </div>
      </div>
    </div>
  );
};
