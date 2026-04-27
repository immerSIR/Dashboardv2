import React, { useMemo, useState } from 'react';
import {
  People,
  Box1,
  Building,
  Tree,
  Heart,
  Calendar,
  Location,
  TickCircle,
  SearchNormal1,
  ArrowRight2,
  Award,
  Chart2,
  Profile2User,
  Clock,
  Briefcase
} from 'iconsax-react';
import { Header, Sidebar } from '../../components/layout';
import {
  resolvedIncidents,
  IMPACT_CATEGORIES,
  SEVERITY_META,
  computeGlobalImpact
} from './data/impacts';
import './impact.css';

const formatNumber = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toString();
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const CATEGORY_ICONS = {
  people: People,
  resources: Box1,
  infrastructure: Building,
  environment: Tree,
  health: Heart
};

export const Impact = ({ onLogout, user, activeNav, onNavChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all'); // all | 30d | 90d | year
  const [expanded, setExpanded] = useState(null);

  // Filtrage
  const filteredIncidents = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = new Date();

    return resolvedIncidents.filter((inc) => {
      // Période
      if (periodFilter !== 'all') {
        const resolved = new Date(inc.resolvedAt);
        const diffDays = (now - resolved) / (1000 * 60 * 60 * 24);
        if (periodFilter === '30d' && diffDays > 30) return false;
        if (periodFilter === '90d' && diffDays > 90) return false;
        if (periodFilter === 'year' && diffDays > 365) return false;
      }

      // Catégorie d'impact
      if (categoryFilter !== 'all' && !inc.impacts[categoryFilter]) return false;

      // Recherche
      if (!q) return true;
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.type.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q)
      );
    });
  }, [search, categoryFilter, periodFilter]);

  const globals = useMemo(
    () => computeGlobalImpact(filteredIncidents),
    [filteredIncidents]
  );

  // Répartition par catégorie pour visualisation barres
  const categoryBreakdown = useMemo(() => {
    const counts = {};
    Object.keys(IMPACT_CATEGORIES).forEach((k) => (counts[k] = 0));
    filteredIncidents.forEach((inc) => {
      Object.keys(IMPACT_CATEGORIES).forEach((k) => {
        if (inc.impacts[k]) counts[k] += inc.impacts[k].total || 0;
      });
    });
    const max = Math.max(...Object.values(counts), 1);
    return Object.keys(IMPACT_CATEGORIES).map((k) => ({
      ...IMPACT_CATEGORIES[k],
      value: counts[k],
      percent: Math.round((counts[k] / max) * 100)
    }));
  }, [filteredIncidents]);

  return (
    <div className="impact-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeNav}
        onItemClick={onNavChange}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className={`impact-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      >
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          onLogout={onLogout}
          onNavChange={onNavChange}
        />

        <main className="impact-content">
          <div className="impact-page">
            {/* En-tête */}
            <div className="impact-page-header">
              <div className="impact-header-left">
                
                <div>
                  <h1 className="impact-title">Impact des interventions</h1>
                  <p className="impact-subtitle">
                    Bilan consolidé des incidents résolus : personnes aidées,
                    ressources mobilisées, infrastructures restaurées et
                    impact environnemental.
                  </p>
                </div>
              </div>
            </div>

            {/* Filtres période */}
            <div className="impact-period-filters">
              <button
                type="button"
                className={`impact-period-btn ${periodFilter === 'all' ? 'is-active' : ''}`}
                onClick={() => setPeriodFilter('all')}
              >
                Toute la période
              </button>
              <button
                type="button"
                className={`impact-period-btn ${periodFilter === '30d' ? 'is-active' : ''}`}
                onClick={() => setPeriodFilter('30d')}
              >
                30 derniers jours
              </button>
              <button
                type="button"
                className={`impact-period-btn ${periodFilter === '90d' ? 'is-active' : ''}`}
                onClick={() => setPeriodFilter('90d')}
              >
                90 derniers jours
              </button>
              <button
                type="button"
                className={`impact-period-btn ${periodFilter === 'year' ? 'is-active' : ''}`}
                onClick={() => setPeriodFilter('year')}
              >
                Cette année
              </button>
            </div>

            {/* KPIs */}
            <div className="impact-kpis">
              <div className="impact-kpi impact-kpi-primary">
                <div className="impact-kpi-icon">
                  <TickCircle size={22} variant="Bold" color="#FFFFFF" />
                </div>
                <div className="impact-kpi-body">
                  <div className="impact-kpi-value">
                    {globals.incidentsResolved}
                  </div>
                  <div className="impact-kpi-label">Incidents résolus</div>
                </div>
              </div>

              <div className="impact-kpi" style={{ '--kpi-color': '#3AA2DD' }}>
                <div className="impact-kpi-icon">
                  <Profile2User size={22} variant="Bold" color="#3AA2DD" />
                </div>
                <div className="impact-kpi-body">
                  <div className="impact-kpi-value">
                    {globals.peopleHelped.toLocaleString('fr-FR')}
                  </div>
                  <div className="impact-kpi-label">Personnes aidées</div>
                </div>
              </div>

              <div className="impact-kpi" style={{ '--kpi-color': '#F59E0B' }}>
                <div className="impact-kpi-icon">
                  <Box1 size={22} variant="Bold" color="#F59E0B" />
                </div>
                <div className="impact-kpi-body">
                  <div className="impact-kpi-value">
                    {globals.resourcesDelivered.toLocaleString('fr-FR')}
                  </div>
                  <div className="impact-kpi-label">Ressources distribuées</div>
                </div>
              </div>

              <div className="impact-kpi" style={{ '--kpi-color': '#8B5CF6' }}>
                <div className="impact-kpi-icon">
                  <Building size={22} variant="Bold" color="#8B5CF6" />
                </div>
                <div className="impact-kpi-body">
                  <div className="impact-kpi-value">
                    {globals.infrastructureRestored}
                  </div>
                  <div className="impact-kpi-label">Infrastructures restaurées</div>
                </div>
              </div>

              <div className="impact-kpi" style={{ '--kpi-color': '#22C55E' }}>
                <div className="impact-kpi-icon">
                  <Tree size={22} variant="Bold" color="#22C55E" />
                </div>
                <div className="impact-kpi-body">
                  <div className="impact-kpi-value">
                    {globals.environmentHectares}
                  </div>
                  <div className="impact-kpi-label">Hectares préservés</div>
                </div>
              </div>

              <div className="impact-kpi" style={{ '--kpi-color': '#EF4444' }}>
                <div className="impact-kpi-icon">
                  <Heart size={22} variant="Bold" color="#EF4444" />
                </div>
                <div className="impact-kpi-body">
                  <div className="impact-kpi-value">
                    {globals.healthConsultations.toLocaleString('fr-FR')}
                  </div>
                  <div className="impact-kpi-label">Soins prodigués</div>
                </div>
              </div>
            </div>

            {/* Contexte secondaire */}
            <div className="impact-context">
              <div className="impact-context-item">
                <Location size={18} variant="Bold" color="#3AA2DD" />
                <div>
                  <div className="impact-context-value">
                    {globals.regionsCount}
                  </div>
                  <div className="impact-context-label">Régions couvertes</div>
                </div>
              </div>
              <div className="impact-context-item">
                <Briefcase size={18} variant="Bold" color="#F59E0B" />
                <div>
                  <div className="impact-context-value">
                    {globals.organisationsCount}
                  </div>
                  <div className="impact-context-label">
                    Organisations mobilisées
                  </div>
                </div>
              </div>
              <div className="impact-context-item">
                <Clock size={18} variant="Bold" color="#22C55E" />
                <div>
                  <div className="impact-context-value">
                    {globals.avgDurationDays}j
                  </div>
                  <div className="impact-context-label">
                    Durée moyenne de résolution
                  </div>
                </div>
              </div>
            </div>

            {/* Répartition par catégorie */}
            <div className="impact-section">
              <div className="impact-section-header">
                <Chart2 size={20} variant="Bold" color="#3AA2DD" />
                <h2 className="impact-section-title">Répartition par type d'impact</h2>
              </div>

              <div className="impact-breakdown">
                {categoryBreakdown.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.id];
                  return (
                    <div key={cat.id} className="impact-breakdown-row">
                      <div className="impact-breakdown-label">
                        <div
                          className="impact-breakdown-icon"
                          style={{ backgroundColor: cat.bgColor }}
                        >
                          <Icon size={16} variant="Bold" color={cat.color} />
                        </div>
                        <span>{cat.label}</span>
                      </div>
                      <div className="impact-breakdown-bar">
                        <div
                          className="impact-breakdown-fill"
                          style={{
                            width: `${cat.percent}%`,
                            backgroundColor: cat.color
                          }}
                        />
                      </div>
                      <div
                        className="impact-breakdown-value"
                        style={{ color: cat.color }}
                      >
                        {cat.value.toLocaleString('fr-FR')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filtres catégorie */}
            <div className="impact-toolbar">
              <div className="impact-search">
                <SearchNormal1 size={18} variant="Linear" color="#6C7278" />
                <input
                  type="text"
                  placeholder="Rechercher un incident, un lieu, un type…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="impact-cat-filters">
                <button
                  type="button"
                  className={`impact-cat-pill ${categoryFilter === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilter('all')}
                >
                  Toutes catégories
                </button>
                {Object.values(IMPACT_CATEGORIES).map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.id];
                  const active = categoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`impact-cat-pill ${active ? 'is-active' : ''}`}
                      onClick={() => setCategoryFilter(cat.id)}
                      style={
                        active
                          ? {
                              backgroundColor: cat.bgColor,
                              borderColor: cat.color,
                              color: cat.color
                            }
                          : undefined
                      }
                    >
                      <Icon
                        size={14}
                        variant="Bold"
                        color={active ? cat.color : '#6C7278'}
                      />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Liste actions */}
            <div className="impact-section">
              <div className="impact-section-header">
                <TickCircle size={20} variant="Bold" color="#22C55E" />
                <h2 className="impact-section-title">
                  Incidents résolus ({filteredIncidents.length})
                </h2>
              </div>

              {filteredIncidents.length === 0 ? (
                <div className="impact-empty">
                  <Award size={48} variant="Linear" color="#9CA3AF" />
                  <p>Aucun incident ne correspond à vos critères.</p>
                </div>
              ) : (
                <div className="impact-list">
                  {filteredIncidents.map((inc) => {
                    const sev = SEVERITY_META[inc.severity];
                    const isOpen = expanded === inc.id;

                    return (
                      <article
                        key={inc.id}
                        className={`impact-incident-card ${isOpen ? 'is-open' : ''}`}
                      >
                        <div
                          className="impact-card-main"
                          onClick={() =>
                            setExpanded(isOpen ? null : inc.id)
                          }
                        >
                          <div
                            className="impact-card-thumb"
                            style={{ backgroundImage: `url(${inc.image})` }}
                          >
                            <span
                              className="impact-severity-tag"
                              style={{ backgroundColor: sev.color }}
                            >
                              {sev.label}
                            </span>
                          </div>

                          <div className="impact-card-info">
                            <div className="impact-card-top">
                              <span className="impact-card-type">
                                {inc.type}
                              </span>
                              <span className="impact-card-dot">•</span>
                              <span className="impact-incident-location">{inc.location}</span>
                              <span className="impact-card-region">
                                <Location
                                  size={12}
                                  variant="Bold"
                                  color="#6C7278"
                                />
                                {inc.location}
                              </span>
                            </div>

                            <h3 className="impact-card-title">{inc.title}</h3>

                            <p className="impact-card-summary">
                              {inc.summary}
                            </p>

                            {/* Métriques inline */}
                            <div className="impact-incident-meta-inline">
                              {Object.keys(inc.impacts).map((catKey) => {
                                const cat = IMPACT_CATEGORIES[catKey];
                                const val = inc.impacts[catKey]?.total;
                                if (!cat || !val) return null;
                                const Icon = CATEGORY_ICONS[catKey];
                                return (
                                  <div
                                    key={catKey}
                                    className="impact-card-metric"
                                    style={{
                                      backgroundColor: cat.bgColor,
                                      color: cat.color
                                    }}
                                  >
                                    <Icon
                                      size={13}
                                      variant="Bold"
                                      color={cat.color}
                                    />
                                    <strong>
                                      {val.toLocaleString('fr-FR')}
                                    </strong>
                                    <span>{cat.label.toLowerCase()}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="impact-card-meta">
                              <div className="impact-meta-row">
                                <Calendar
                                  size={13}
                                  variant="Bold"
                                  color="#6C7278"
                                />
                                <span>
                                  Résolu le {formatDate(inc.resolvedAt)} ·{' '}
                                  {inc.durationDays} jour{inc.durationDays > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`impact-toggle ${isOpen ? 'is-open' : ''}`}
                            aria-label={isOpen ? 'Réduire' : 'Voir le détail'}
                          >
                            <ArrowRight2
                              size={18}
                              variant="Linear"
                              color="#6C7278"
                            />
                          </button>
                        </div>

                        {isOpen && (
                          <div className="impact-card-body">
                            {/* Détails par catégorie */}
                            <div className="impact-detail-grid">
                              {Object.entries(inc.impacts).map(([key, data]) => {
                                const cat = IMPACT_CATEGORIES[key];
                                if (!cat || !data) return null;
                                const Icon = CATEGORY_ICONS[key];
                                const subEntries = Object.entries(data).filter(
                                  ([k]) => k !== 'total'
                                );
                                return (
                                  <div
                                    key={key}
                                    className="impact-detail-card"
                                    style={{ borderColor: cat.color }}
                                  >
                                    <div
                                      className="impact-detail-header"
                                      style={{ backgroundColor: cat.bgColor }}
                                    >
                                      <Icon
                                        size={16}
                                        variant="Bold"
                                        color={cat.color}
                                      />
                                      <span style={{ color: cat.color }}>
                                        {cat.label}
                                      </span>
                                    </div>
                                    <ul className="impact-detail-list">
                                      {subEntries.map(([k, v]) => (
                                        <li key={k}>
                                          <span className="impact-detail-key">
                                            {labelizeKey(k)}
                                          </span>
                                          <span className="impact-detail-val">
                                            {v.toLocaleString('fr-FR')}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Organisations */}
                            {inc.organisations &&
                              inc.organisations.length > 0 && (
                                <div className="impact-orgs">
                                  <h4 className="impact-orgs-label">
                                    Organisations mobilisées
                                  </h4>
                                  <div className="impact-orgs-list">
                                    {inc.organisations.map((org, idx) => (
                                      <span
                                        key={idx}
                                        className="impact-org-chip"
                                      >
                                        {org}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Helpers de labellisation
const KEY_LABELS = {
  rescued: 'Personnes secourues',
  relocated: 'Personnes relogées',
  treated: 'Personnes soignées',
  screened: 'Personnes dépistées',
  total: 'Total',
  foodKits: 'Kits alimentaires',
  waterLiters: "Litres d'eau",
  blankets: 'Couvertures',
  medicalKits: 'Kits médicaux',
  homesAssessed: 'Habitations évaluées',
  homesRepaired: 'Habitations réparées',
  roadsCleared: 'Routes dégagées',
  buildingsSecured: 'Bâtiments sécurisés',
  debrisRemovedTons: 'Débris retirés (t)',
  zonesCleanedHa: 'Zones nettoyées (ha)',
  treesPlanted: 'Arbres plantés',
  consultations: 'Consultations',
  vaccinations: 'Vaccinations',
  emergencyEvacs: "Évacuations d'urgence"
};

function labelizeKey(k) {
  return KEY_LABELS[k] || k;
}

export default Impact;
