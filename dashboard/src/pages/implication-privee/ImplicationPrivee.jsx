import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebarState } from '../../hooks/useSidebarState';
import { Header, Sidebar } from '../../components/layout';
import { SearchNormal1, ArrowDown2, Eye, DirectboxReceive, People, UserAdd } from 'iconsax-react';
import { ShimmerThumbnail, ShimmerTitle, ShimmerText, ShimmerCircularImage } from 'react-shimmer-effects';
import { ImplicationModalProvider, useImplicationModalContext } from './ImplicationModalContext';
import { IncidentMultiAssignModal } from './modal/IncidentMultiAssignModal';
import { IncidentAgentsListModal } from './modal/IncidentAgentsListModal';
import './implication-privee.css';

// Fausses données premium d'incidents
const MOCK_ASSIGNED_INCIDENTS = [
  {
    id: 101,
    title: "Inondation de la Route Nationale 1",
    description: "Suite aux fortes pluies diluviennes, la chaussée est submergée au kilomètre 12, bloquant complètement l'accès principal de Dakar.",
    zone: "Rufisque / Dakar",
    created_at: "2026-06-01T08:00:00Z",
    resolution_end_date: null,
    progress: 45,
    etat: "in_progress",
    photo: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 102,
    title: "Éboulement sur la falaise de Popenguine",
    description: "Des rochers de taille importante se sont détachés de la falaise principale et menacent directement les habitations situées en contrebas.",
    zone: "Popenguine / Thiès",
    created_at: "2026-05-28T14:30:00Z",
    resolution_end_date: null,
    progress: 15,
    etat: "taken_into_account",
    photo: "https://images.unsplash.com/photo-1525824236856-8c0a31dfe3be?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 103,
    title: "Pollution chimique dans la lagune de Hann",
    description: "Déversement accidentel de produits industriels non identifiés par une usine locale. Prélèvement d'échantillons et confinement de la zone effectués.",
    zone: "Baie de Hann / Dakar",
    created_at: "2026-05-15T10:15:00Z",
    resolution_end_date: "2026-06-03T18:00:00Z",
    progress: 100,
    etat: "resolved",
    photo: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 104,
    title: "Feu de brousse à la lisière de la forêt de Bandia",
    description: "Départ de feu suspect signalé par des éco-gardes. Les équipes de secours sont en route pour maîtriser le foyer avant la tombée de la nuit.",
    zone: "Forêt de Bandia / Mbour",
    created_at: "2026-06-08T09:00:00Z",
    resolution_end_date: null,
    progress: 0,
    etat: "declared",
    photo: "https://images.unsplash.com/photo-1602164940761-073f8373b52d?auto=format&fit=crop&q=80&w=300"
  }
];

// Initiales pour les avatars
const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');

// Adaptation des données pour l'affichage
const adaptIncidentData = (incident) => {
  if (!incident) return null;

  const getBadgeFromEtat = (etat) => {
    const badges = {
      'declared': { label: 'DÉCLARÉ', variant: 'declared' },
      'taken_into_account': { label: 'PRIS EN COMPTE', variant: 'taken' },
      'in_progress': { label: 'EN COURS', variant: 'in-progress' },
      'resolved': { label: 'RÉSOLU', variant: 'resolved' }
    };
    return badges[etat] || { label: 'EN COURS', variant: 'in-progress' };
  };

  return {
    ...incident,
    location: incident.zone || incident.location || 'Localisation non spécifiée',
    type: incident.zone || incident.type || 'Non spécifié',
    image: incident.photo || incident.image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=150',
    startDate: incident.created_at ? new Date(incident.created_at).toLocaleDateString('fr-FR') : 'Non spécifié',
    endDate: incident.resolution_end_date ? new Date(incident.resolution_end_date).toLocaleDateString('fr-FR') : 'En cours',
    badge: getBadgeFromEtat(incident.etat),
    progressValue: incident.progress || 0
  };
};

const TableSkeleton = () => (
  <div className="implication-table-wrap">
    <table className="implication-table">
      <thead>
        <tr>
          <th>Incident</th>
          <th>Localisation</th>
          <th>Date de déclaration</th>
          <th>Date de résolution</th>
          <th>Progression</th>
          <th>Équipe terrain</th>
          <th>Statut</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {[...Array(4)].map((_, idx) => (
          <tr key={idx}>
            <td>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <ShimmerThumbnail height={40} width={40} rounded />
                <div>
                  <ShimmerTitle line={1} gap={4} width={150} />
                </div>
              </div>
            </td>
            <td><ShimmerText line={1} width={100} /></td>
            <td><ShimmerText line={1} width={80} /></td>
            <td><ShimmerText line={1} width={80} /></td>
            <td><ShimmerThumbnail height={8} width={60} rounded /></td>
            <td>
              <div style={{ display: 'flex', gap: '4px' }}>
                <ShimmerCircularImage size={24} />
                <ShimmerCircularImage size={24} />
              </div>
            </td>
            <td><ShimmerThumbnail height={24} width={80} rounded /></td>
            <td><ShimmerCircularImage size={32} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ImplicationPriveeContent = () => {
  const navigate = useNavigate();
  const {
    isOpen: sidebarOpen,
    setOpen: setSidebarOpen,
    isCollapsed: sidebarCollapsed,
    setCollapsed: setSidebarCollapsed,
  } = useSidebarState();

  const {
    assignments,
    openAssignModal,
    openAgentsModal
  } = useImplicationModalContext();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);

  // Simuler le chargement des fausses données (800ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIncidents(MOCK_ASSIGNED_INCIDENTS.map(adaptIncidentData));
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Filtres locaux (recherche et statut)
  const filteredIncidents = useMemo(() => {
    return incidents.filter((i) => {
      const matchesSearch =
        !search ||
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i.location?.toLowerCase().includes(search.toLowerCase()) ||
        i.description?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = !statusFilter || i.etat === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [incidents, search, statusFilter]);

  const handleSelectIncident = (id) => {
    navigate(`/incidents/${id}`);
  };

  return (
    <div className="implication-page">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div className={`implication-page-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="implication-content">
          {/* Header de la page */}
          <header className="implication-header">
            <h1 className="implication-title">Implication privée</h1>
            <p className="implication-subtitle">
              Retrouvez la liste complète des incidents qui vous ont été assignés personnellement et suivez leur avancement.
            </p>
          </header>

          {/* Filtres et Barre de recherche */}
          <div className="implication-filters">
            <div className="implication-search">
              <SearchNormal1 size={18} variant="Linear" color="#6C7278" />
              <input
                type="text"
                placeholder="Rechercher par titre, description, localisation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="implication-select-wrapper">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filtrer par statut"
              >
                <option value="">Tous les statuts</option>
                <option value="En cours">En cours </option>
                <option value="terminer">Terminer</option>

              </select>
              <ArrowDown2 size={16} variant="Linear" color="#6C7278" />
            </div>
          </div>

          {/* Affichage des données / Chargement */}
          {isLoading ? (
            <TableSkeleton />
          ) : filteredIncidents.length === 0 ? (
            <div className="implication-empty">
              <DirectboxReceive size={48} variant="Linear" color="#9CA3AF" />
              <p className="mt-4">Aucun incident assigné ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="implication-table-wrap">
              <table className="implication-table">
                <thead>
                  <tr>
                    <th>Incident</th>
                    <th>Localisation</th>
                    <th>Date de déclaration</th>
                    <th>Date de résolution</th>
                    <th>Progression</th>
                    <th>Équipe terrain</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((incident) => {
                    const incidentAgents = assignments[incident.id] || [];
                    return (
                      <tr
                        key={incident.id}
                        onClick={() => handleSelectIncident(incident.id)}
                        className="implication-row-clickable"
                      >
                        <td>
                          <div className="implication-main-cell">
                            <img
                              src={incident.image}
                              alt={incident.title}
                              className="implication-img"
                              onError={(e) => {
                                e.target.src =
                                  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=150';
                              }}
                            />
                            <div>
                              <span className="implication-row-title">
                                {incident.title || 'Sans titre'}
                              </span>
                              <span className="implication-row-desc">
                                {incident.description
                                  ? incident.description.substring(0, 80) +
                                  (incident.description.length > 80 ? '...' : '')
                                  : 'Aucune description disponible.'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="implication-cell-text">
                          {incident.location || 'Inconnue'}
                        </td>
                        <td className="implication-cell-text">
                          {incident.startDate}
                        </td>
                        <td className="implication-cell-text">
                          {incident.endDate === 'En cours' ? (
                            <span className="implication-date-badge is-pending">En cours</span>
                          ) : (
                            <span className="implication-date-badge is-resolved">{incident.endDate}</span>
                          )}
                        </td>
                        <td className="implication-cell-text">
                          <div className="implication-progress-container">
                            <div className="implication-progress-bar-bg">
                              <div
                                className="implication-progress-bar-fill"
                                style={{ width: `${incident.progressValue}%` }}
                              />
                            </div>
                            <span className="implication-progress-label">
                              {incident.progressValue}%
                            </span>
                          </div>
                        </td>
                        <td className="implication-cell-text">
                          {incidentAgents.length === 0 ? (
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Aucun agent</span>
                          ) : (
                            <div
                              className="avatar-stack"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAgentsModal(incident);
                              }}
                              title="Voir la liste des agents assignés"
                              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                            >
                              {incidentAgents.slice(0, 3).map((agent, index) => (
                                <div
                                  key={agent.id}
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: agent.avatarColor,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    fontSize: '11px',
                                    border: '2px solid white',
                                    marginLeft: index > 0 ? '-8px' : '0',
                                    zIndex: 10 - index,
                                    boxShadow: 'var(--shadow-sm)'
                                  }}
                                >
                                  {getInitials(agent.fullName)}
                                </div>
                              ))}
                              {incidentAgents.length > 3 && (
                                <div
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: '#E2E8F0',
                                    color: '#475569',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    fontSize: '10px',
                                    border: '2px solid white',
                                    marginLeft: '-8px',
                                    zIndex: 1
                                  }}
                                >
                                  +{incidentAgents.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`implication-badge-glow variant-${incident.badge.variant}`}>
                            <span className="badge-dot" />
                            {incident.badge.label}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="implication-action-btn"
                              onClick={() => openAssignModal(incident)}
                              title="Gérer l'équipe"
                            >
                              <UserAdd size={16} variant="Bold" color="var(--color-primary)" />
                            </button>
                            <button
                              type="button"
                              className="implication-action-btn"
                              onClick={() => handleSelectIncident(incident.id)}
                              title="Voir le détail"
                            >
                              <Eye size={16} variant="Bold" color="#6C7278" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modales d'actions */}
      <IncidentMultiAssignModal />
      <IncidentAgentsListModal />
    </div>
  );
};

export const ImplicationPrivee = () => {
  return (
    <ImplicationModalProvider>
      <ImplicationPriveeContent />
    </ImplicationModalProvider>
  );
};

export default ImplicationPrivee;
