import React, { useState } from 'react';
import useSWR from 'swr';
import { useSidebarState } from '../../hooks/useSidebarState';
import { Header, Sidebar } from '../../components/layout';
import {
  SearchNormal1, ArrowDown2, Add, Edit2, Trash,
  People, TickCircle, ShieldTick, Briefcase,
} from 'iconsax-react';
import { ShimmerTable } from 'react-shimmer-effects';
import { ROLES, AVATAR_COLORS } from './data/agents';
import { idSeed } from '../../utils/idSeed';
import { getOrganisationsService } from '../organisations/service/organisation_service';
import { getAgentsService } from './service/members_service';
import AgentsContext from './modale/AgentsModalContext';
import { AgentFormModal, AgentDeleteModal } from './modale';
import './agents.css';

// ── Helpers ───────────────────────────────────────────────────────
const getRoleConfig = (roleId) =>
  ROLES.find((r) => r.id === roleId) || { label: roleId, color: '#9CA3AF' };

const getInitials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');

const EMPTY_ARRAY = [];


// Un seul appel : GET /agents/ — le backend filtre selon le rôle (Super Admin =
// tous les agents ; admin d'org = uniquement ceux de SON organisation). Plus de
// boucle par organisation (qui renvoyait 403 pour les orgs étrangères).
const fetcher = async () => {
  const data = await getAgentsService();
  const members = data.results || data || [];
  return members.map((m) => {
    let role = 'bureau';
    if (m.org_role === 'org_admin') role = 'admin';
    if (m.org_role === 'field_agent') role = 'terrain';
    if (m.org_role === 'bureau_agent') role = 'bureau';
    return {
      id: m.id,
      firstName: m.first_name || '',
      lastName: m.last_name || '',
      fullName: `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email,
      email: m.email,
      role,
      organisationId: m.organisation_member,
      organisationName: m.organisation_name,
      status: m.is_active ? 'active' : 'inactive',
      avatarColor: AVATAR_COLORS[idSeed(m.id) % AVATAR_COLORS.length] || '#3AA2DD',
    };
  });
};

export const Agents = () => {
  const {
    isOpen: sidebarOpen,
    setOpen: setSidebarOpen,
    isCollapsed: sidebarCollapsed,
    setCollapsed: setSidebarCollapsed,
  } = useSidebarState();

  // ── Chargement des données ────────────────────────────────────
  const { data: rawOrgs } = useSWR('organisation_list', getOrganisationsService);
  const organisationsList = rawOrgs || EMPTY_ARRAY;



  const {
    data: fetchedAgents,
    isLoading: loadingMembers,
    mutate: mutateAgents,
  } = useSWR(
    'agents_list',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const agents = fetchedAgents || EMPTY_ARRAY;

  // ── Filtres ───────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState('');

  // ── Modal form ────────────────────────────────────────────────
  const [formModal, setFormModal] = useState({ open: false, mode: 'create', agent: null });
  const [showPassword, setShowPassword] = useState(false);
  const [modalAlert, setModalAlert] = useState({ type: null, message: null });
  const [formAnimating, setFormAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Modal suppression ─────────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState({ open: false, agent: null });
  const [deleteAlert, setDeleteAlert] = useState({ type: null, message: null });
  const [deleteAnimating, setDeleteAnimating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Ouvrir modal création ─────────────────────────────────────
  const openCreate = () => {
    setModalAlert({ type: null, message: null });
    setShowPassword(false);
    setFormAnimating('opening');
    setFormModal({ open: true, mode: 'create', agent: null });
    setTimeout(() => setFormAnimating(false), 350);
  };

  // ── Ouvrir modal édition ──────────────────────────────────────
  const openEdit = (agent, e) => {
    e?.stopPropagation();
    setModalAlert({ type: null, message: null });
    setShowPassword(false);
    setFormAnimating('opening');
    setFormModal({ open: true, mode: 'edit', agent });
    setTimeout(() => setFormAnimating(false), 350);
  };

  // ── Fermer modal form ─────────────────────────────────────────
  const closeFormModal = () => {
    if (isSubmitting) return;
    setFormAnimating('closing');
    setTimeout(() => {
      setFormModal({ open: false, mode: 'create', agent: null });
      setFormAnimating(false);
      setModalAlert({ type: null, message: null });
    }, 320);
  };

  // ── Ouvrir modal suppression ──────────────────────────────────
  const openDelete = (agent, e) => {
    e?.stopPropagation();
    setDeleteAlert({ type: null, message: null });
    setDeleteAnimating('opening');
    setDeleteModal({ open: true, agent });
    setTimeout(() => setDeleteAnimating(false), 350);
  };

  // ── Fermer modal suppression ──────────────────────────────────
  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteAnimating('closing');
    setTimeout(() => {
      setDeleteModal({ open: false, agent: null });
      setDeleteAnimating(false);
    }, 320);
  };

  // ── Stats ─────────────────────────────────────────────────────
  const statsTotal = agents.length;
  const statsActive = agents.filter((a) => a.status === 'active').length;
  const statsAdmins = agents.filter((a) => a.role === 'admin').length;
  const statsTerrain = agents.filter((a) => a.role === 'terrain').length;

  // ── Filtrage ──────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filtered = agents.filter((a) => {
    const matchSearch =
      !q ||
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.organisationName?.toLowerCase().includes(q);
    const matchRole = !roleFilter || a.role === roleFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;
    const matchOrg = !orgFilter || a.organisationId === orgFilter;
    return matchSearch && matchRole && matchStatus && matchOrg;
  });

  // ── contextValue (même pattern que Organisations.jsx) ─────────
  const contextValue = {
    // Form modal
    formModal,
    showPassword,
    setShowPassword,
    modalAlert,
    setModalAlert,
    formAnimating,
    isSubmitting,
    setIsSubmitting,
    openCreate,
    openEdit,
    closeFormModal,
    // Delete modal
    deleteModal,
    deleteAlert,
    setDeleteAlert,
    deleteAnimating,
    isDeleting,
    setIsDeleting,
    openDelete,
    closeDeleteModal,
    // Shared
    mutateAgents,
    organisationsList,
  };

  return (
    <AgentsContext.Provider value={contextValue}>
      <div className="agents-layout">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        <div className={`agents-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Header
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            sidebarCollapsed={sidebarCollapsed}
          />

          <main className="agents-content">
            <div className="agents-page">

              {/* ── En-tête ── */}
              <div className="agents-page-header">
                <div>
                  <h1 className="agents-title">Agents</h1>
                  <p className="agents-subtitle">Gérez les agents et leurs accès à Map Action.</p>
                </div>
                <button className="agents-add-btn" onClick={openCreate}>
                  <Add size={18} color="#fff" />
                  Nouvel agent
                </button>
              </div>

              {/* ── Statistiques ── */}
              <div className="agents-stats">
                <div className="agents-stat">
                  <div className="agents-stat-icon agents-stat-icon-primary">
                    <People size={20} variant="Bold" color="var(--color-primary)" />
                  </div>
                  <div>
                    <div className="agents-stat-value">{statsTotal}</div>
                    <div className="agents-stat-label">Total agents</div>
                  </div>
                </div>
                <div className="agents-stat">
                  <div className="agents-stat-icon agents-stat-icon-success">
                    <TickCircle size={20} variant="Bold" color="var(--color-success)" />
                  </div>
                  <div>
                    <div className="agents-stat-value">{statsActive}</div>
                    <div className="agents-stat-label">Actifs</div>
                  </div>
                </div>
                <div className="agents-stat">
                  <div className="agents-stat-icon agents-stat-icon-warning">
                    <ShieldTick size={20} variant="Bold" color="var(--color-warning)" />
                  </div>
                  <div>
                    <div className="agents-stat-value">{statsAdmins}</div>
                    <div className="agents-stat-label">Admins</div>
                  </div>
                </div>
                <div className="agents-stat">
                  <div className="agents-stat-icon agents-stat-icon-danger">
                    <Briefcase size={20} variant="Bold" color="var(--color-danger)" />
                  </div>
                  <div>
                    <div className="agents-stat-value">{statsTerrain}</div>
                    <div className="agents-stat-label">Agents terrain</div>
                  </div>
                </div>
              </div>

              {/* ── Toolbar ── */}
              <div className="agents-toolbar">
                <div className="agents-search">
                  <SearchNormal1 size={16} variant="Linear" color="var(--color-text-muted)" />
                  <input
                    type="text"
                    placeholder="Nom, email, organisation..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="agents-select-wrap">
                  <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">Tous les rôles</option>
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                  <ArrowDown2 size={14} variant="Linear" color="var(--color-text-muted)" />
                </div>

                <div className="agents-select-wrap">
                  <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)}>
                    <option value="">Toutes les organisations</option>
                    {organisationsList.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  <ArrowDown2 size={14} variant="Linear" color="var(--color-text-muted)" />
                </div>

                <div className="agents-select-wrap">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                  <ArrowDown2 size={14} variant="Linear" color="var(--color-text-muted)" />
                </div>

                <span className="agents-count-label">
                  {filtered.length} agent{filtered.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* ── Tableau ── */}
              {loadingMembers ? (
                <div className="agents-table-wrap">
                  <ShimmerTable loading={loadingMembers} mode="light" row={5} col={6} />
                </div>
              ) : (
                <div className="agents-table-wrap">
                  <table className="agents-table">
                    <thead>
                      <tr>
                        <th>Agent</th><th>Rôle</th><th>Organisation</th>
                        <th>Depuis</th><th>Statut</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((agent) => {
                        const roleConfig = getRoleConfig(agent.role);
                        return (
                          <tr key={agent.id}>
                            <td>
                              <div className="agents-cell-identity">
                                <div className="agents-avatar" style={{ backgroundColor: agent.avatarColor }}>
                                  {getInitials(agent.fullName)}
                                </div>
                                <div>
                                  <span className="agents-full-name">{agent.fullName}</span>
                                  <span className="agents-email">{agent.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                  className="agents-role"
                                  style={{ backgroundColor: `${roleConfig.color}18`, color: roleConfig.color }}
                                  title={roleConfig.description}
                                >
                                  {roleConfig.label}
                                </span>
                                {roleConfig.mobileOnly && (
                                  <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '999px', backgroundColor: 'rgba(34,197,94,0.1)', color: '#22C55E', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                    Mobile
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ fontSize: 'var(--font-size-body-small)', color: 'var(--color-text-secondary)' }}>
                              {agent.organisationName || '—'}
                            </td>
                            <td style={{ fontSize: 'var(--font-size-body-small)', color: 'var(--color-text-secondary)' }}>
                              {new Date(agent.joinedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td>
                              <span className={`agents-status agents-status-${agent.status}`}>
                                <span className="agents-status-dot" />
                                {agent.status === 'active' ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td>
                              <div className="agents-row-actions">
                                <button
                                  className="agents-icon-btn agents-icon-btn-edit"
                                  onClick={(e) => openEdit(agent, e)}
                                  title="Modifier"
                                >
                                  <Edit2 size={16} variant="Bold" color="var(--color-primary)" />
                                </button>
                                <button
                                  className="agents-icon-btn agents-icon-btn-delete"
                                  onClick={(e) => openDelete(agent, e)}
                                  title="Supprimer"
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
          </main>
        </div>

        {/* ── Modals ── */}
        <AgentFormModal key="AgentFormModalKey" />
        <AgentDeleteModal key="AgentDeleteModalKey" />

      </div>
    </AgentsContext.Provider>
  );
};

export default Agents;
