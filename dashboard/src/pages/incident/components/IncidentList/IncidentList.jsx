import React, { useState, useMemo } from 'react';
import { SearchNormal1, ArrowDown2 } from 'iconsax-react';
import { ShimmerThumbnail, ShimmerTitle, ShimmerText, ShimmerCircularImage } from 'react-shimmer-effects';
import './incident-list.css';

import { Eye, Edit2, Trash } from 'iconsax-react';

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
          <th>Organisations participantes</th>
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
            <td><ShimmerText line={1} width={60} /></td>
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

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      const matchesSearch =
        !search ||
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i.location?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        i.badges?.some((b) => b.variant === statusFilter);

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
            placeholder="Rechercher un projet, une commune..."
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
              <option value="">Statut</option>
              <option value="in-progress">En cours</option>
              <option value="planned">Planifié</option>
              <option value="critical">Critique</option>
              <option value="expert-needed">Besoin expert</option>
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
              <SearchNormal1 size={48} variant="Linear" />
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
                  <th>Organisations participantes</th>
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
                      <td className="incident-table-cell-text" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '24px', height: '24px', borderRadius: '50%',
                            backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '11px'
                          }}>
                            {incident.participantsCount || 0}
                          </span>
                          <span style={{ fontSize: '12px' }}>
                            {incident.participantsCount > 1 ? 'Orgs' : 'Org'}
                          </span>
                        </div>
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
