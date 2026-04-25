import React, { useEffect, useMemo, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { fr } from 'date-fns/locale/fr';
import 'react-datepicker/dist/react-datepicker.css';
import {
  SearchNormal1,
  ArrowDown2,
  Calendar,
  CalendarRemove,
  Location,
  TickCircle,
  Clock,
  People
} from 'iconsax-react';
import { Header, Sidebar } from '../../components/layout';
import { collaborations as allCollaborations } from './data/collaborations';
import './collaboration.css';

registerLocale('fr', fr);

export const Collaboration = ({ onLogout, user, activeNav, onNavChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [dateFrom, dateTo] = dateRange;

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = (e) => setIsMobile(e.matches);
    update(mq);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allCollaborations.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;

      // Filtre période : on garde les collab dont la période chevauche [from, to]
      if (dateFrom || dateTo) {
        const cStart = new Date(c.startAt);
        const cEnd = new Date(c.endAt);
        if (dateFrom && cEnd < dateFrom) return false;
        if (dateTo && cStart > dateTo) return false;
      }

      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.organisation.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter, dateFrom, dateTo]);

  const resetDateRange = () => setDateRange([null, null]);

  const counts = useMemo(
    () => ({
      all: allCollaborations.length,
      'in-progress': allCollaborations.filter((c) => c.status === 'in-progress')
        .length,
      completed: allCollaborations.filter((c) => c.status === 'completed')
        .length
    }),
    []
  );

  return (
    <div className="collaboration-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeNav}
        onItemClick={onNavChange}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className={`collaboration-main ${
          sidebarCollapsed ? 'sidebar-collapsed' : ''
        }`}
      >
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          onLogout={onLogout}
          onNavChange={onNavChange}
        />

        <main className="collaboration-content">
          <div className="collab-page">
            {/* Header */}
            <div className="collab-page-header">
              <div>
                <h1 className="collab-title">Mes collaborations</h1>
                <p className="collab-subtitle">
                  Retrouvez toutes les actions auxquelles vous participez ou
                  avez participé.
                </p>
              </div>
          
            </div>

            {/* Toolbar */}
            <div className="collab-toolbar">
              <div className="collab-search">
                <SearchNormal1 size={18} variant="Linear" color="#6C7278" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, organisation, lieu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="collab-filters">
                      {/* Filtre par période */}
              <div className="collab-date-range">
                <Calendar size={16} variant="Bold" color="#3AA2DD" />
                <span className="collab-date-label">Période :</span>
                <DatePicker
                  selectsRange
                  startDate={dateFrom}
                  endDate={dateTo}
                  onChange={(update) => setDateRange(update)}
                  locale="fr"
                  dateFormat="dd MMM yyyy"
                  placeholderText={
                    isMobile ? 'Période…' : 'Sélectionner une période…'
                  }
                  isClearable={false}
                  monthsShown={isMobile ? 1 : 2}
                  withPortal={isMobile}
                  shouldCloseOnSelect={!isMobile}
                  className="collab-date-input"
                  calendarClassName="collab-datepicker"
                  popperClassName="collab-datepicker-popper"
                  portalId="collab-datepicker-portal"
                />
                {(dateFrom || dateTo) && (
                  <button
                    type="button"
                    className="collab-date-clear"
                    onClick={resetDateRange}
                    aria-label="Réinitialiser la période"
                    title="Réinitialiser"
                  >
                    <CalendarRemove
                      size={16}
                      variant="Bold"
                      color="#EF4444"
                    />
                  </button>
                )}
              </div>
                <button
                  type="button"
                  className={`collab-filter-pill ${
                    statusFilter === 'all' ? 'is-active' : ''
                  }`}
                  onClick={() => setStatusFilter('all')}
                >
                  Toutes
                  <span className="collab-filter-count">{counts.all}</span>
                </button>
                <button
                  type="button"
                  className={`collab-filter-pill ${
                    statusFilter === 'in-progress' ? 'is-active' : ''
                  }`}
                  onClick={() => setStatusFilter('in-progress')}
                >
                  En cours
                  <span className="collab-filter-count">
                    {counts['in-progress']}
                  </span>
                </button>
                <button
                  type="button"
                  className={`collab-filter-pill ${
                    statusFilter === 'completed' ? 'is-active' : ''
                  }`}
                  onClick={() => setStatusFilter('completed')}
                >
                  Terminées
                  <span className="collab-filter-count">
                    {counts.completed}
                  </span>
                </button>

                <div className="collab-select">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filtrer par statut"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="in-progress">En cours</option>
                    <option value="completed">Terminées</option>
                  </select>
                  <ArrowDown2 size={16} variant="Linear" color="#6C7278" />
                </div>
              </div>

        
            </div>

            {/* Liste */}
            {filtered.length === 0 ? (
              <div className="collab-empty">
                <p>Aucune collaboration ne correspond à vos critères.</p>
              </div>
            ) : (
              <div className="collab-grid">
                {filtered.map((c) => (
                  <article key={c.id} className="collab-card">
                    <div
                      className="collab-card-cover"
                      style={{ backgroundImage: `url(${c.image})` }}
                    >
                      <span
                        className={`collab-status-badge collab-status-${c.status}`}
                      >
                        {c.status === 'completed' ? (
                          <>
                            <TickCircle
                              size={14}
                              variant="Bold"
                              color="#FFFFFF"
                            />
                            Terminée
                          </>
                        ) : (
                          <>
                            <Clock size={14} variant="Bold" color="#FFFFFF" />
                            En cours
                          </>
                        )}
                      </span>
                    </div>

                    <div className="collab-card-body">
                      <div className="collab-card-org">{c.organisation}</div>
                      <h3 className="collab-card-title">{c.title}</h3>
                      <p className="collab-card-role">
                        Mon rôle : <strong>{c.role}</strong>
                      </p>
                      <p className="collab-card-desc">{c.description}</p>

                      <div className="collab-card-meta">
                        <div className="collab-meta-row">
                          <Location
                            size={14}
                            variant="Bold"
                            color="#6C7278"
                          />
                          <span>{c.location}</span>
                        </div>
                        <div className="collab-meta-row">
                          <Calendar
                            size={14}
                            variant="Bold"
                            color="#6C7278"
                          />
                          <span>
                            {c.startDate} → {c.endDate}
                          </span>
                        </div>
                      </div>

                      <div className="collab-progress">
                        <div className="collab-progress-head">
                          <span>Progression</span>
                          <span className="collab-progress-value">
                            {c.progress}%
                          </span>
                        </div>
                        <div className="collab-progress-bar">
                          <div
                            className={`collab-progress-fill collab-progress-${c.status}`}
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Collaboration;
