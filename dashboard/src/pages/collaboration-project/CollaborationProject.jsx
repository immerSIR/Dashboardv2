import React, { useState } from 'react';
import { Header, Sidebar } from '../../components/layout';
import ProjectList from './components/ProjectList/ProjectList';
import ProjectDetail from './components/ProjectDetail/ProjectDetail';
import { projects } from './data/projects';
import './collaboration-project.css';

export const CollaborationProject = ({ onLogout, user, activeNav, onNavChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? null);
  // Mobile tab: 'list' | 'detail'
  const [mobileTab, setMobileTab] = useState('list');

  const selectedProject = projects.find((p) => p.id === selectedId);

  const handleSelectProject = (id) => {
    setSelectedId(id);
    setMobileTab('detail');
  };

  const handleBack = () => {
    setMobileTab('list');
  };

  const workspaceClass = [
    'cp-workspace',
    `mobile-tab-${mobileTab}`
  ].join(' ');

  return (
    <div className="cp-page">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeNav}
        onItemClick={onNavChange}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div className={`cp-page-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          onLogout={onLogout}
          onNavChange={onNavChange}
        />

        <div className={workspaceClass}>
          {/* Colonne 1 - Liste des projets */}
          <ProjectList
            selectedId={selectedId}
            onSelectProject={handleSelectProject}
          />

          {/* Colonne 2 - Détail du projet sélectionné */}
          <ProjectDetail
            project={selectedProject}
            onBack={handleBack}
          />
        </div>
      </div>
    </div>
  );
};

export default CollaborationProject;
