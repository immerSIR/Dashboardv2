import { useState } from 'react';
import { Clock, CloseCircle } from 'iconsax-react';
import { Header, Sidebar } from '../../components/layout';
import MetricsCards from './components/metrics/MetricsCards';
import MapContainer from './components/map/MapContainer';
import StatsWidgets from './components/widgets/StatsWidgets';
import ActivityPanel from './components/activity/ActivityPanel';
import './dashboard.css';

export const Dashboard = ({ onLogout, user, activeNav = 'dashboard', onNavChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const setActiveNav = onNavChange || (() => {});
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityModalClosing, setActivityModalClosing] = useState(false);

  const openActivityModal = () => {
    setActivityModalOpen(true);
    setActivityModalClosing(false);
  };

  const closeActivityModal = () => {
    setActivityModalClosing(true);
    setTimeout(() => {
      setActivityModalOpen(false);
      setActivityModalClosing(false);
    }, 250);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar gauche */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeNav}
        onItemClick={setActiveNav}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      {/* Contenu principal */}
      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header */}
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          onLogout={onLogout}
          onNavChange={onNavChange}
        />
        
        {/* Zone centrale avec scroll */}
        <main className="dashboard-content py-5 mt-5">
          <div className="dashboard-grid">
            {/* Carte en premier (grande) */}
            <MapContainer />
            
            {/* 3 cartes métriques */}
            <MetricsCards />
            
            {/* 3 widgets statistiques */}
            <StatsWidgets />
          </div>
        </main>
        
        {/* Sidebar droite fixe - Activité en temps réel */}
        <aside className="dashboard-sidebar-right">
          <ActivityPanel />
        </aside>
      </div>

      {/* Bouton flottant mobile - Historique des activités */}
      <button
        className="activity-fab"
        onClick={openActivityModal}
        aria-label="Voir l'historique des activités"
      >
        <Clock size={24} variant="Bold" color="#FFFFFF" />
        <span className="activity-fab-badge">4</span>
      </button>

      {/* Modal Activité pour mobile */}
      {activityModalOpen && (
        <div
          className={`activity-modal-overlay ${activityModalClosing ? 'closing' : ''}`}
          onClick={closeActivityModal}
        >
          <div
            className={`activity-modal ${activityModalClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="activity-modal-close"
              onClick={closeActivityModal}
              aria-label="Fermer"
            >
              <CloseCircle size={28} variant="Bold" color="#6C7278" />
            </button>
            <ActivityPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
