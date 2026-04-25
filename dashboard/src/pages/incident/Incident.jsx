import React, { useState } from 'react';
import { DocumentText, Messages2, People } from 'iconsax-react';
import { Header, Sidebar } from '../../components/layout';
import IncidentQueue from './components/IncidentQueue/IncidentQueue';
import IncidentDetail from './components/IncidentDetail/IncidentDetail';
import OnlineNow from './components/OnlineNow/OnlineNow';
import { incidents } from './data/incidents';
import './incident.css';

export const Incident = ({ onLogout, user, activeNav, onNavChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  // Mobile tab: null (queue), 'detail', 'chat', 'online'
  const [mobileTab, setMobileTab] = useState(null);

  const selectedIncident = incidents.find((i) => i.id === selectedId);

  const handleSelectIncident = (id) => {
    setSelectedId(id);
    setMobileTab('detail');
  };

  const handleBackToQueue = () => {
    setMobileTab(null);
  };

  const workspaceClass = [
    'incident-workspace',
    mobileTab ? `mobile-tab-${mobileTab}` : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="incident-page">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeNav}
        onItemClick={onNavChange}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div className={`incident-page-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          onLogout={onLogout}
          onNavChange={onNavChange}
        />

        <div className={workspaceClass}>
          {/* Colonne 1 - Incident Queue (gauche) */}
          <IncidentQueue
            selectedId={selectedId}
            onSelect={handleSelectIncident}
          />

          {/* Colonne 2 - Détails de l'incident sélectionné (centre) */}
          <IncidentDetail
            incident={selectedIncident}
            onBack={handleBackToQueue}
          />

          {/* Colonne 3 - Online Now (droite) */}
          <OnlineNow />
        </div>
      </div>

      {/* Bottom nav bar mobile - affichée quand un incident est sélectionné */}
      {selectedIncident && mobileTab && (
        <nav className="mobile-bottom-nav">
          <button
            className={`bottom-nav-btn ${mobileTab === 'detail' ? 'active' : ''}`}
            onClick={() => setMobileTab('detail')}
            aria-label="Détails"
          >
            <DocumentText
              size={22}
              variant={mobileTab === 'detail' ? 'Bold' : 'Linear'}
              color={mobileTab === 'detail' ? '#3AA2DD' : '#6C7278'}
            />
            <span className="bottom-nav-label">Détail</span>
          </button>

          <button
            className={`bottom-nav-btn ${mobileTab === 'chat' ? 'active' : ''}`}
            onClick={() => setMobileTab('chat')}
            aria-label="Messagerie"
          >
            <Messages2
              size={22}
              variant={mobileTab === 'chat' ? 'Bold' : 'Linear'}
              color={mobileTab === 'chat' ? '#3AA2DD' : '#6C7278'}
            />
            <span className="bottom-nav-label">Chat</span>
            {selectedIncident.messages.length > 0 && (
              <span className="bottom-nav-badge">{selectedIncident.messages.length}</span>
            )}
          </button>

          <button
            className={`bottom-nav-btn ${mobileTab === 'online' ? 'active' : ''}`}
            onClick={() => setMobileTab('online')}
            aria-label="Membres en ligne"
          >
            <People
              size={22}
              variant={mobileTab === 'online' ? 'Bold' : 'Linear'}
              color={mobileTab === 'online' ? '#3AA2DD' : '#6C7278'}
            />
            <span className="bottom-nav-label">En ligne</span>
            <span className="bottom-nav-badge success">12</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default Incident;
