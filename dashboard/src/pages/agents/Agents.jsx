import React, { useState, useMemo, useEffect } from 'react';
import { useSidebarState } from '../../hooks/useSidebarState';
import { Header, Sidebar } from '../../components/layout';
import {
  SearchNormal1, ArrowDown2, Add, Edit2, Trash,
  People, TickCircle, CloseCircle, Eye, EyeSlash,
  Profile2User, ShieldTick, Briefcase, Magicpen
} from 'iconsax-react';
import useSWR from 'swr';
import { ShimmerThumbnail, ShimmerTitle, ShimmerText } from 'react-shimmer-effects';
import { ROLES, AVATAR_COLORS } from './data/agents';
import { getOrganisationsService } from '../organisations/service/organisation_service';
import {
  getOrganisationMembersService,
  createOrganisationAgentService,
  addOrganisationMemberService,
  updateOrganisationMemberService,
  removeOrganisationMemberService
} from './service/members_service';
import './agents.css';

const EMPTY_FORM = {
  creationMode: 'new', // 'new' ou 'existing'
  userId: '',
  fullName: '',
  email: '',
  password: '',
  role: '',
  organisationId: '',
  status: 'active',
  avatarColor: '#3AA2DD',
};

const getRoleConfig = (roleId) =>
  ROLES.find((r) => r.id === roleId) || { label: roleId, color: '#9CA3AF' };

const getInitials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');

export const Agents = () => {
  const {
    isOpen: sidebarOpen,
    setOpen: setSidebarOpen,
    isCollapsed: sidebarCollapsed,
    setCollapsed: setSidebarCollapsed,
  } = useSidebarState();

  const { data: rawOrgs } = useSWR('organisation_list', getOrganisationsService);
  const organisationsList = useMemo(() => rawOrgs || [], [rawOrgs]);

  const fetcher = async () => {
    if (!organisationsList || organisationsList.length === 0) return [];
    const allMembers = [];
    for (const org of organisationsList) {
      try {
        const data = await getOrganisationMembersService(org.id);
        const members = data.results || data || [];
        members.forEach((m) => {
          let role = 'bureau';
          if (m.org_role === 'org_admin') role = 'admin';
          if (m.org_role === 'field_agent') role = 'terrain';
          if (m.org_role === 'bureau_agent') role = 'bureau';

          allMembers.push({
            id: m.id,
            fullName: `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email,
            email: m.email,
            role: role,
            organisationId: org.id,
            organisationName: org.name,
            status: 'active',
            avatarColor: AVATAR_COLORS[Math.abs(m.id) % AVATAR_COLORS.length] || '#3AA2DD',
          });
        });
      } catch (err) {
        console.error(`[Agents] Erreur chargement membres de l'organisation ${org.id}:`, err);
      }
    }
    return allMembers;
  };

  const { data: fetchedAgents, isLoading: loadingMembers, mutate: mutateAgents } = useSWR(
    organisationsList.length > 0 ? ['agents_list', organisationsList] : null,
    fetcher
  );

  const agents = useMemo(() => fetchedAgents || [], [fetchedAgents]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState('');

  const [formModal, setFormModal] = useState({ open: false, mode: 'create', agent: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, agent: null });
  const [toast, setToast] = useState(null);

  // Alertes pour les modals
  const [modalAlert, setModalAlert] = useState({ type: null, message: null });
  const [deleteAlert, setDeleteAlert] = useState({ type: null, message: null });

  // Animations de fermeture
  const [formClosing, setFormClosing] = useState(false);
  const [deleteClosing, setDeleteClosing] = useState(false);

  // Soumission / Suppression en cours
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Stats ──────────────────────────────────────────────
  const statsTotal = agents.length;
  const statsActive = agents.filter((a) => a.status === 'active').length;
  const statsAdmins = agents.filter((a) => a.role === 'admin').length;
  const statsTerrain = agents.filter((a) => a.role === 'terrain').length;

  // ── Filtrage ───────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return agents.filter((a) => {
      const matchSearch = !q
        || a.fullName.toLowerCase().includes(q)
        || a.email.toLowerCase().includes(q)
        || a.organisationName?.toLowerCase().includes(q);
      const matchRole = !roleFilter || a.role === roleFilter;
      const matchStatus = !statusFilter || a.status === statusFilter;
      const matchOrg = !orgFilter || a.organisationId === orgFilter;
      return matchSearch && matchRole && matchStatus && matchOrg;
    });
  }, [agents, search, roleFilter, statusFilter, orgFilter]);

  // ── Toast ──────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  // ── Validation ─────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (formModal.mode === 'create' && form.creationMode === 'existing') {
      if (!form.userId || !form.userId.trim()) errs.userId = 'L\'identifiant de l\'utilisateur est requis.';
      else if (isNaN(form.userId)) errs.userId = 'L\'identifiant doit être un entier.';
    } else {
      if (!form.fullName.trim()) errs.fullName = 'Le nom complet est requis.';
      if (!form.email.trim()) errs.email = 'L\'email est requis.';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide.';
      if (formModal.mode === 'create' && !form.password.trim())
        errs.password = 'Le mot de passe est requis.';
      if (form.password && form.password.length < 6)
        errs.password = 'Minimum 6 caractères.';
    }
    if (!form.role) errs.role = 'Le rôle est requis.';
    if (!form.organisationId) errs.organisationId = 'L\'organisation est requise.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Create ─────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalAlert({ type: null, message: null });
    setShowPassword(false);
    setFormModal({ open: true, mode: 'create', agent: null });
  };

  // ── Edit ───────────────────────────────────────────────
  const openEdit = (agent, e) => {
    e.stopPropagation();
    setForm({
      creationMode: 'new',
      userId: '',
      fullName: agent.fullName,
      email: agent.email,
      password: '', // never pre-fill password
      role: agent.role,
      organisationId: agent.organisationId,
      status: agent.status,
      avatarColor: agent.avatarColor,
    });
    setFormErrors({});
    setModalAlert({ type: null, message: null });
    setShowPassword(false);
    setFormModal({ open: true, mode: 'edit', agent });
  };

  const closeFormModal = () => {
    setFormClosing(true);
    setTimeout(() => {
      setFormModal({ open: false, mode: 'create', agent: null });
      setFormClosing(false);
    }, 200);
  };

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setModalAlert({ type: null, message: null });

    try {
      const orgRole = form.role === 'admin' ? 'org_admin' : (form.role === 'terrain' ? 'field_agent' : 'bureau_agent');

      if (formModal.mode === 'create') {
        if (form.creationMode === 'existing') {
          const payload = {
            user_id: parseInt(form.userId, 10),
            org_role: orgRole
          };
          await addOrganisationMemberService(form.organisationId, payload);
          setModalAlert({ type: 'success', message: 'Membre existant ajouté avec succès !' });
        } else {
          const payload = {
            first_name: form.fullName.split(' ')[0] || '',
            last_name: form.fullName.split(' ').slice(1).join(' ') || form.fullName,
            email: form.email,
            password: form.password,
            org_role: orgRole
          };
          await createOrganisationAgentService(form.organisationId, payload);
          setModalAlert({ type: 'success', message: 'Agent créé avec succès !' });
        }
      } else {
        const payload = {
          org_role: orgRole
        };
        await updateOrganisationMemberService(form.organisationId, formModal.agent.id, payload);
        setModalAlert({ type: 'success', message: 'Agent mis à jour avec succès !' });
      }

      mutateAgents();
      setTimeout(() => {
        closeFormModal();
      }, 2000);
    } catch (err) {
      const msg = err?.response?.data?.detail
        || err?.response?.data?.message
        || `Erreur lors de la ${formModal.mode === 'create' ? 'création' : 'modification'}. Veuillez réessayer.`;
      setModalAlert({ type: 'danger', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────
  const openDelete = (agent, e) => {
    e.stopPropagation();
    setDeleteAlert({ type: null, message: null });
    setDeleteModal({ open: true, agent });
  };

  const closeDeleteModal = () => {
    setDeleteClosing(true);
    setTimeout(() => {
      setDeleteModal({ open: false, agent: null });
      setDeleteClosing(false);
    }, 200);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setDeleteAlert({ type: null, message: null });
    try {
      await removeOrganisationMemberService(deleteModal.agent.organisationId, deleteModal.agent.id);
      setDeleteAlert({ type: 'success', message: 'Agent supprimé avec succès !' });
      mutateAgents();
      setTimeout(() => {
        closeDeleteModal();
      }, 2000);
    } catch (err) {
      const msg = err?.response?.data?.detail
        || err?.response?.data?.message
        || 'Erreur lors de la suppression. Veuillez réessayer.';
      setDeleteAlert({ type: 'danger', message: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (formErrors[key]) setFormErrors((e) => ({ ...e, [key]: undefined }));
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    setField('password', pwd);
    setShowPassword(true); // Afficher le mot de passe généré pour qu'il puisse le copier
  };

  return (
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
              <div className = "agents-table-wrap" >
                          <table className="agents-table">
                            <thead>
                              <tr>
                                <th>Agent</th>
                                <th>Rôle</th>
                                <th>Organisation</th>
                                <th>Depuis</th>
                                <th>Statut</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <div className="agents-cell-identity">
                                      <ShimmerThumbnail height={32} width={32} rounded className="m-0" />
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '120px' }}>
                                        <ShimmerTitle line={1} gap={0} variant="primary" style={{ margin: 0, height: '14px', width: '100px' }} />
                                        <ShimmerText line={1} gap={0} style={{ margin: 0, height: '10px', width: '120px' }} />
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <ShimmerThumbnail height={20} width={80} rounded className="m-0" />
                                  </td>
                                  <td>
                                    <ShimmerThumbnail height={16} width={100} rounded className="m-0" />
                                  </td>
                                  <td>
                                    <ShimmerThumbnail height={16} width={70} rounded className="m-0" />
                                  </td>
                                  <td>
                                    <ShimmerThumbnail height={20} width={60} rounded className="m-0" />
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <ShimmerThumbnail height={28} width={28} rounded className="m-0" />
                                      <ShimmerThumbnail height={28} width={28} rounded className="m-0" />
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
              </div>
              ) : filtered.length === 0 ? (
              <div className="agents-empty">
                <div className="agents-empty-icon">
                  <People size={48} variant="Linear" color="var(--color-border)" />
                </div>
                <p>Aucun agent ne correspond à vos critères.</p>
              </div>
              ) : (
              <div className="agents-table-wrap">
                <table className="agents-table">
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Rôle</th>
                      <th>Organisation</th>
                      <th>Depuis</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((agent) => {
                      const roleConfig = getRoleConfig(agent.role);
                      return (
                        <tr key={agent.id}>
                          <td>
                            <div className="agents-cell-identity">
                              <div
                                className="agents-avatar"
                                style={{ backgroundColor: agent.avatarColor }}
                              >
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
                                style={{
                                  backgroundColor: `${roleConfig.color}18`,
                                  color: roleConfig.color,
                                }}
                                title={roleConfig.description}
                              >
                                {roleConfig.label}
                              </span>
                              {roleConfig.mobileOnly && (
                                <span
                                  title="Accès mobile uniquement"
                                  style={{
                                    fontSize: '11px',
                                    padding: '2px 6px',
                                    borderRadius: '999px',
                                    backgroundColor: 'rgba(34,197,94,0.1)',
                                    color: '#22C55E',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
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

      {/* ── Modal Création / Édition ── */}
      {formModal.open && (
    <div className={`agents-modal-overlay ${formClosing ? 'closing' : ''}`} onClick={closeFormModal}>
      <div className={`agents-modal ${formClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="agents-modal-header">
          <h2 className="agents-modal-title">
            {formModal.mode === 'create' ? 'Nouvel agent' : 'Modifier l\'agent'}
          </h2>
          <button className="agents-modal-close" onClick={closeFormModal} disabled={isSubmitting || modalAlert.type === 'success'}>
            <CloseCircle size={22} variant="Bold" color="var(--color-text-muted)" />
          </button>
        </div>

        <div className="agents-modal-body">
          {modalAlert.message && (
            <div className={`agents-bootstrap-alert alert-${modalAlert.type}`}>
              {modalAlert.type === 'success' ? (
                <TickCircle size={18} variant="Bold" />
              ) : (
                <CloseCircle size={18} variant="Bold" />
              )}
              <span>{modalAlert.message}</span>
            </div>
          )}

          {/* Choix du mode de création (uniquement à la création) */}
          {formModal.mode === 'create' && (
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)'
            }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: form.creationMode === 'new' ? 'var(--color-primary)' : 'transparent',
                  color: form.creationMode === 'new' ? '#fff' : 'var(--color-text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => !isSubmitting && setField('creationMode', 'new')}
              >
                Créer un nouvel agent
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: form.creationMode === 'existing' ? 'var(--color-primary)' : 'transparent',
                  color: form.creationMode === 'existing' ? '#fff' : 'var(--color-text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => !isSubmitting && setField('creationMode', 'existing')}
              >
                Associer membre existant
              </button>
            </div>
          )}

          {/* Preview avatar + couleur (uniquement pour création nouvel agent ou édition) */}
          {(formModal.mode === 'edit' || form.creationMode === 'new') && (
            <div className="agents-modal-preview">
              <div
                className="agents-avatar agents-avatar-lg"
                style={{ backgroundColor: form.avatarColor }}
              >
                {getInitials(form.fullName) || '?'}
              </div>
              <div className="agents-color-row">
                <span className="agents-color-label">Couleur de l'avatar</span>
                <div className="agents-color-swatches">
                  {AVATAR_COLORS.map((c) => (
                    <div
                      key={c}
                      className={`agents-color-swatch ${form.avatarColor === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => !isSubmitting && setField('avatarColor', c)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="agents-form-grid">

            {formModal.mode === 'create' && form.creationMode === 'existing' ? (
              /* Associer membre existant par User ID */
              <div className="agents-field full-width">
                <label>Identifiant numérique de l'utilisateur (User ID) *</label>
                <input
                  type="number"
                  placeholder="Ex. 42"
                  value={form.userId}
                  onChange={(e) => setField('userId', e.target.value)}
                  style={formErrors.userId ? { borderColor: 'var(--color-danger)' } : {}}
                  disabled={isSubmitting}
                />
                {formErrors.userId && <span className="agents-field-error">{formErrors.userId}</span>}
              </div>
            ) : (
              <>
                {/* Nom complet */}
                <div className="agents-field full-width">
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    placeholder="Ex. Amadou Diallo"
                    value={form.fullName}
                    onChange={(e) => setField('fullName', e.target.value)}
                    style={formErrors.fullName ? { borderColor: 'var(--color-danger)' } : {}}
                    disabled={isSubmitting || formModal.mode === 'edit'}
                  />
                  {formErrors.fullName && <span className="agents-field-error">{formErrors.fullName}</span>}
                </div>

                {/* Email */}
                <div className="agents-field">
                  <label>Adresse e-mail *</label>
                  <input
                    type="email"
                    placeholder="agent@mapaction.org"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    style={formErrors.email ? { borderColor: 'var(--color-danger)' } : {}}
                    disabled={isSubmitting || formModal.mode === 'edit'}
                  />
                  {formErrors.email && <span className="agents-field-error">{formErrors.email}</span>}
                </div>

                {/* Mot de passe */}
                <div className="agents-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Mot de passe {formModal.mode === 'edit' ? '(non modifiable)' : '*'}</label>
                    {formModal.mode === 'create' && (
                      <button
                        type="button"
                        onClick={generatePassword}
                        disabled={isSubmitting}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 500
                        }}
                      >
                        <Magicpen size={14} variant="Linear" />
                        Générer
                      </button>
                    )}
                  </div>
                  <div className="agents-password-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={formModal.mode === 'edit' ? "••••••••" : "Saisir un mot de passe"}
                      value={form.password}
                      onChange={(e) => setField('password', e.target.value)}
                      style={formErrors.password ? { borderColor: 'var(--color-danger)' } : {}}
                      disabled={isSubmitting || formModal.mode === 'edit'}
                    />
                    {formModal.mode === 'create' && (
                      <button
                        type="button"
                        className="agents-password-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={isSubmitting}
                      >
                        {showPassword
                          ? <EyeSlash size={18} variant="Linear" color="var(--color-text-muted)" />
                          : <Eye size={18} variant="Linear" color="var(--color-text-muted)" />
                        }
                      </button>
                    )}
                  </div>
                  {formErrors.password && <span className="agents-field-error">{formErrors.password}</span>}
                </div>
              </>
            )}

            {/* Rôle */}
            <div className="agents-field">
              <label>Rôle *</label>
              <select
                value={form.role}
                onChange={(e) => setField('role', e.target.value)}
                style={formErrors.role ? { borderColor: 'var(--color-danger)' } : {}}
                disabled={isSubmitting}
              >
                <option value="">Sélectionner un rôle…</option>
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id} title={r.description}>
                    {r.label}{r.mobileOnly ? ' (mobile uniquement)' : ''}
                  </option>
                ))}
              </select>
              {formErrors.role && <span className="agents-field-error">{formErrors.role}</span>}
            </div>

            {/* Organisation */}
            <div className="agents-field">
              <label>Organisation *</label>
              <select
                value={form.organisationId}
                onChange={(e) => setField('organisationId', e.target.value)}
                style={formErrors.organisationId ? { borderColor: 'var(--color-danger)' } : {}}
                disabled={isSubmitting || formModal.mode === 'edit'}
              >
                <option value="">Sélectionner une organisation…</option>
                {organisationsList.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
              {formErrors.organisationId && <span className="agents-field-error">{formErrors.organisationId}</span>}
            </div>

            {/* Statut */}
            <div className="agents-field">
              <label>Statut</label>
              <select value={form.status} onChange={(e) => setField('status', e.target.value)} disabled={isSubmitting || formModal.mode === 'edit'}>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>

          </div>
        </div>

        <div className="agents-modal-footer">
          <button className="agents-btn-cancel" onClick={closeFormModal} disabled={isSubmitting || modalAlert.type === 'success'}>Annuler</button>
          <button className="agents-btn-save" onClick={handleSubmit} disabled={isSubmitting || modalAlert.type === 'success'} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isSubmitting && <span className="agents-spinner" />}
            {formModal.mode === 'create' ? "Créer l'agent" : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )}

      {/* ── Modal Suppression ── */}
      {deleteModal.open && (
        <div className={`agents-modal-overlay ${deleteClosing ? 'closing' : ''}`} onClick={closeDeleteModal}>
          <div className={`agents-modal agents-confirm-modal ${deleteClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="agents-confirm-body">
              {deleteAlert.message && (
                <div className={`agents-bootstrap-alert alert-${deleteAlert.type}`} style={{ width: '100%' }}>
                  {deleteAlert.type === 'success' ? (
                    <TickCircle size={18} variant="Bold" />
                  ) : (
                    <CloseCircle size={18} variant="Bold" />
                  )}
                  <span>{deleteAlert.message}</span>
                </div>
              )}
              <div className="agents-confirm-icon">
                <Trash size={30} variant="Bold" color="var(--color-danger)" />
              </div>
              <h2 className="agents-confirm-title">Supprimer l'agent</h2>
              <p className="agents-confirm-text">
                Vous êtes sur le point de supprimer <strong>"{deleteModal.agent?.fullName}"</strong>. Cette action est <strong>irréversible</strong>.
              </p>
              <div className="agents-confirm-actions">
                <button className="agents-btn-cancel" onClick={closeDeleteModal} disabled={isDeleting || deleteAlert.type === 'success'}>
                  Annuler
                </button>
                <button className="agents-btn-confirm-delete" onClick={confirmDelete} disabled={isDeleting || deleteAlert.type === 'success'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {isDeleting && <span className="agents-spinner" />}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="agents-toast">
          <TickCircle size={16} variant="Linear" color="#fff" />
          {toast}
        </div>
      )}
    </div>
  );
};

export default Agents;
