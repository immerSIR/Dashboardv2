import React, { useState, useMemo } from 'react';
import { SearchNormal1, ArrowDown2 } from 'iconsax-react';
import { ShimmerThumbnail, ShimmerTitle, ShimmerText, ShimmerCircularImage } from 'react-shimmer-effects';
import { Eye, Edit2, Trash, UserAdd } from 'iconsax-react';
import { useIncidentModalContext } from '../../modale/IncidentModalContext';
import './incident-list.css';

// Composant shimmer pour le chargement (version table)
const IncidentTableSkeleton = () => (
  <div className="incident-table-wrap">
    <table className="incident-table">
      <thead>
        <tr>
          <th>Incident</th>
          <th>Localisation</th>
          <th>Date de déclaration</th>
          <th>Date de résolution</th>
          <th>Statut</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, idx) => (
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
            <td><ShimmerThumbnail height={24} width={80} rounded /></td>
            <td><ShimmerCircularImage size={32} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const IncidentList = ({ incidents = [], onSelectIncident, selectedId, isLoading = false }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { openDeleteModal, openAssignModal } = useIncidentModalContext();

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      const matchesSearch =
        !search ||
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i.location?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        i.etat === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [incidents, search, statusFilter]);

  return (
    <section className="project-list-section">
      {/* Header */}
      <header className="project-list-header">
        <h1 className="project-list-title">Incidents</h1>
        <p className="project-list-subtitle">
          Rejoignez des initiatives environnementales en cours ou proposez votre
          expertise pour soutenir les communautés locales.
        </p>
      </header>

      {/* Filters bar */}
      <div className="project-filters">
        <div className="project-search">
          <SearchNormal1 size={18} variant="Linear" color="#6C7278" />
          <input
            type="text"
            placeholder="Rechercher un incident, une commune..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="project-filters-row">

          <div className="project-select">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="declared">Déclaré</option>
              <option value="taken_into_account">Pris en compte</option>
              <option value="resolved">Résolu</option>
            </select>
            <ArrowDown2 size={16} variant="Linear" color="#6C7278" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 var(--spacing-5) var(--spacing-5)' }}>
        {isLoading ? (
          <IncidentTableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="project-empty">
            <div style={{ opacity: 0.3, marginBottom: '16px' }}>
              <SearchNormal1 size={48} variant="Linear" color="var(--color-text-muted)" />
            </div>
            <p>Aucun incident ne correspond à vos critères.</p>
          </div>
        ) : (
          <div className="incident-table-wrap">
            <table className="incident-table">
              <thead>
                <tr>
                  <th>Incident</th>
                  <th>Localisation</th>
                  <th>Date de déclaration</th>
                  <th>Date de résolution</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((incident) => {
                  const defaultImg = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=150';
                  return (
                    <tr
                      key={incident.id}
                      onClick={() => onSelectIncident && onSelectIncident(incident.id)}
                      className={incident.id === selectedId ? 'is-selected' : ''}
                    >
                      <td>
                        <div className="incident-table-main-col">
                          <img
                            src={incident.photo || defaultImg}
                            alt={incident.title}
                            className="incident-table-img"
                            onError={(e) => { e.target.src = defaultImg; }}
                          />
                          <div>
                            <span className="incident-table-title">
                              {incident.title || 'Sans titre'}
                              {incident.isOwner && (
                                <span className="incident-owner-tag" style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 6px', background: 'var(--color-primary)', color: 'white', borderRadius: '4px' }}>Assigné</span>
                              )}
                            </span>
                            <span className="incident-table-subtitle">{incident.description?.substring(0, 50)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="incident-table-cell-text">
                        {incident.location || 'Inconnue'}
                        {incident.coordinates && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {incident.coordinates.lat.toFixed(3)}, {incident.coordinates.lng.toFixed(3)}
                          </div>
                        )}
                      </td>
                      <td className="incident-table-cell-text">{incident.startDate}</td>
                      <td className="incident-table-cell-text">
                        {incident.endDate === 'En cours' ? (
                          <span className="incident-date-badge is-pending">En cours</span>
                        ) : (
                          <span className="incident-date-badge is-resolved">{incident.endDate}</span>
                        )}
                      </td>
                      <td>
                        <div className="incident-table-badges">
                          {incident.badges?.map((b, idx) => (
                            <span key={idx} className={`incident-badge-glow variant-${b.variant}`}>
                              <span className="badge-dot"></span>
                              {b.label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="incident-action-btn assign-btn"
                            onClick={() => openAssignModal(incident)}
                            title="Assigner un agent"
                          >
                            <UserAdd size={16} variant="Bold" color="var(--color-primary)" />
                          </button>
                          <button
                            type="button"
                            className="incident-action-btn delete-btn"
                            onClick={() => openDeleteModal(incident)}
                            title="Supprimer l'incident"
                          >
                            <Trash size={16} variant="Bold" color="var(--color-danger)" />
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
      </div>
    </section>
  );
};

export default IncidentList;
