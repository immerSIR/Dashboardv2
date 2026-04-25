import React, { useMemo, useState } from 'react';
import {
  SearchNormal1,
  Clock,
  TickCircle,
  CloseCircle,
  Briefcase,
  Calendar,
  MessageText1,
  ArrowRight2,
  CloseSquare
} from 'iconsax-react';
import { Header, Sidebar } from '../../components/layout';
import { collaborationRequests as allRequests } from './data/requests';
import './collaboration-requests.css';

const STATUS_META = {
  pending: {
    label: 'En attente',
    icon: Clock,
    color: '#F59E0B',
    className: 'status-pending'
  },
  accepted: {
    label: 'Acceptée',
    icon: TickCircle,
    color: '#22C55E',
    className: 'status-accepted'
  },
  rejected: {
    label: 'Refusée',
    icon: CloseCircle,
    color: '#EF4444',
    className: 'status-rejected'
  }
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

export const CollaborationRequests = ({
  onLogout,
  user,
  activeNav,
  onNavChange
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [requests, setRequests] = useState(allRequests);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  // Modal de décision (un seul, avec choix interne)
  const [decisionRequest, setDecisionRequest] = useState(null);
  const [decisionAction, setDecisionAction] = useState(null); // 'accept' | 'reject' | null
  const [decisionClosing, setDecisionClosing] = useState(false);
  const [responseText, setResponseText] = useState('');

  const openDecision = (request) => {
    setDecisionRequest(request);
    setDecisionAction(null);
    setResponseText('');
    setDecisionClosing(false);
  };

  const closeDecision = () => {
    setDecisionClosing(true);
    setTimeout(() => {
      setDecisionRequest(null);
      setDecisionAction(null);
      setDecisionClosing(false);
      setResponseText('');
    }, 280);
  };

  const handleConfirmDecision = (e) => {
    e.preventDefault();
    if (!decisionRequest || !decisionAction) return;
    const newStatus = decisionAction === 'accept' ? 'accepted' : 'rejected';
    setRequests((prev) =>
      prev.map((r) =>
        r.id === decisionRequest.id
          ? {
              ...r,
              status: newStatus,
              respondedAt: new Date().toISOString(),
              response: responseText.trim() || null
            }
          : r
      )
    );
    closeDecision();
  };

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      accepted: requests.filter((r) => r.status === 'accepted').length,
      rejected: requests.filter((r) => r.status === 'rejected').length
    }),
    [requests]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.projectTitle.toLowerCase().includes(q) ||
        r.organisation.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter, requests]);

  return (
    <div className="requests-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeNav}
        onItemClick={onNavChange}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className={`requests-main ${
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

        <main className="requests-content">
          <div className="requests-page">
            {/* Header */}
            <div className="requests-page-header">
              <div>
                <h1 className="requests-title">Demandes de collaboration</h1>
                <p className="requests-subtitle">
                  Suivez l'état de vos demandes de participation aux actions
                  des organisations.
                </p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="requests-toolbar">
              <div className="requests-search">
                <SearchNormal1 size={18} variant="Linear" color="#6C7278" />
                <input
                  type="text"
                  placeholder="Rechercher un projet, organisation, rôle…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="requests-filters">
                <button
                  type="button"
                  className={`requests-filter-pill ${
                    statusFilter === 'all' ? 'is-active' : ''
                  }`}
                  onClick={() => setStatusFilter('all')}
                >
                  Toutes
                  <span className="requests-filter-count">{counts.all}</span>
                </button>
                <button
                  type="button"
                  className={`requests-filter-pill ${
                    statusFilter === 'pending' ? 'is-active' : ''
                  }`}
                  onClick={() => setStatusFilter('pending')}
                >
                  <Clock size={14} variant="Bold" color="currentColor" />
                  En attente
                  <span className="requests-filter-count">
                    {counts.pending}
                  </span>
                </button>
                <button
                  type="button"
                  className={`requests-filter-pill ${
                    statusFilter === 'accepted' ? 'is-active' : ''
                  }`}
                  onClick={() => setStatusFilter('accepted')}
                >
                  <TickCircle size={14} variant="Bold" color="currentColor" />
                  Acceptées
                  <span className="requests-filter-count">
                    {counts.accepted}
                  </span>
                </button>
                <button
                  type="button"
                  className={`requests-filter-pill ${
                    statusFilter === 'rejected' ? 'is-active' : ''
                  }`}
                  onClick={() => setStatusFilter('rejected')}
                >
                  <CloseCircle size={14} variant="Bold" color="currentColor" />
                  Refusées
                  <span className="requests-filter-count">
                    {counts.rejected}
                  </span>
                </button>
              </div>
            </div>

            {/* Liste */}
            {filtered.length === 0 ? (
              <div className="requests-empty">
                <Briefcase size={48} variant="Linear" color="#9CA3AF" />
                <p>Aucune demande ne correspond à vos critères.</p>
              </div>
            ) : (
              <div className="requests-list">
                {filtered.map((r) => {
                  const meta = STATUS_META[r.status];
                  const StatusIcon = meta.icon;
                  const isOpen = expanded === r.id;

                  return (
                    <article
                      key={r.id}
                      className={`request-card ${meta.className} ${
                        isOpen ? 'is-open' : ''
                      }`}
                    >
                      <div
                        className="request-card-main"
                        onClick={() => setExpanded(isOpen ? null : r.id)}
                      >
                        <div
                          className="request-thumb"
                          style={{ backgroundImage: `url(${r.projectImage})` }}
                        />

                        <div className="request-info">
                          <div className="request-info-top">
                            <div
                              className="request-org-avatar"
                              style={{
                                backgroundColor: r.organisationColor
                              }}
                            >
                              {r.organisationInitials}
                            </div>
                            <span className="request-org">
                              {r.organisation}
                            </span>
                            <span className="request-dot">•</span>
                            <span className="request-role">{r.role}</span>
                          </div>

                          <h3 className="request-project">{r.projectTitle}</h3>

                          <div className="request-meta">
                            <div className="request-meta-row">
                              <Calendar
                                size={13}
                                variant="Bold"
                                color="#6C7278"
                              />
                              <span>
                                Envoyée le {formatDate(r.submittedAt)}
                              </span>
                            </div>
                            {r.respondedAt && (
                              <div className="request-meta-row">
                                <MessageText1
                                  size={13}
                                  variant="Bold"
                                  color="#6C7278"
                                />
                                <span>
                                  Réponse le {formatDate(r.respondedAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="request-side">
                          <span
                            className={`request-status-badge ${meta.className}`}
                          >
                            <StatusIcon
                              size={14}
                              variant="Bold"
                              color="#FFFFFF"
                            />
                            {meta.label}
                          </span>
                          <button
                            type="button"
                            className="request-toggle"
                            aria-label={isOpen ? 'Réduire' : 'Voir le détail'}
                          >
                            <ArrowRight2
                              size={18}
                              variant="Linear"
                              color="#6C7278"
                            />
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="request-card-body">
                          <div className="request-block">
                            <h4 className="request-block-label">
                              Mon motif
                            </h4>
                            <p className="request-block-text">{r.motif}</p>
                          </div>

                          {r.response && (
                            <div
                              className={`request-block request-response ${meta.className}`}
                            >
                              <h4 className="request-block-label">
                                Réponse de l'organisation
                              </h4>
                              <p className="request-block-text">
                                {r.response}
                              </p>
                            </div>
                          )}

                          {r.status === 'pending' && (
                            <>
                              <div className="request-pending-info">
                                <Clock
                                  size={16}
                                  variant="Bold"
                                  color="#F59E0B"
                                />
                                <span>
                                  Cette demande est en attente de votre
                                  décision.
                                </span>
                              </div>

                              <div className="request-actions">
                                <button
                                  type="button"
                                  className="request-btn request-btn-respond"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDecision(r);
                                  }}
                                >
                                  <MessageText1
                                    size={16}
                                    variant="Bold"
                                    color="#FFFFFF"
                                  />
                                  Répondre à la demande
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Decision modal */}
      {decisionRequest && (
        <div
          className={`decision-modal-overlay ${
            decisionClosing ? 'closing' : ''
          }`}
          onClick={closeDecision}
        >
          <aside
            className={`decision-modal ${
              decisionAction
                ? decisionAction === 'accept'
                  ? 'is-accept'
                  : 'is-reject'
                : ''
            } ${decisionClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Répondre à la demande"
          >
            <header className="decision-modal-header">
              <div>
                <h3 className="decision-modal-title">
                  Répondre à la demande
                </h3>
                <p className="decision-modal-subtitle">
                  {decisionRequest.projectTitle}
                </p>
              </div>
              <button
                type="button"
                className="decision-modal-close"
                onClick={closeDecision}
                aria-label="Fermer"
              >
                <CloseCircle size={22} variant="Linear" color="#1A1C1E" />
              </button>
            </header>

            <form
              className="decision-modal-form"
              onSubmit={handleConfirmDecision}
            >
              <div className="decision-modal-body">
                <div className="decision-summary">
                  <div
                    className="decision-summary-avatar"
                    style={{
                      backgroundColor: decisionRequest.organisationColor
                    }}
                  >
                    {decisionRequest.organisationInitials}
                  </div>
                  <div>
                    <span className="decision-summary-org">
                      {decisionRequest.organisation}
                    </span>
                    <span className="decision-summary-role">
                      Rôle demandé : <strong>{decisionRequest.role}</strong>
                    </span>
                  </div>
                </div>

                <div className="decision-motif">
                  <h4 className="decision-block-label">Motif fourni</h4>
                  <p className="decision-motif-text">
                    {decisionRequest.motif}
                  </p>
                </div>

                {/* Choix de la décision */}
                <div className="decision-choice-group" role="radiogroup">
                  <h4 className="decision-block-label">Votre décision</h4>
                  <div className="decision-choices">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={decisionAction === 'accept'}
                      className={`decision-choice is-accept ${
                        decisionAction === 'accept' ? 'is-selected' : ''
                      }`}
                      onClick={() => setDecisionAction('accept')}
                    >
                      <TickCircle
                        size={22}
                        variant="Bold"
                        color={
                          decisionAction === 'accept' ? '#FFFFFF' : '#22C55E'
                        }
                      />
                      <span>Accepter</span>
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={decisionAction === 'reject'}
                      className={`decision-choice is-reject ${
                        decisionAction === 'reject' ? 'is-selected' : ''
                      }`}
                      onClick={() => setDecisionAction('reject')}
                    >
                      <CloseSquare
                        size={22}
                        variant="Bold"
                        color={
                          decisionAction === 'reject' ? '#FFFFFF' : '#EF4444'
                        }
                      />
                      <span>Refuser</span>
                    </button>
                  </div>
                </div>

                <label htmlFor="decision-response" className="decision-label">
                  Message de réponse
                  <span className="decision-optional">(optionnel)</span>
                </label>
                <textarea
                  id="decision-response"
                  className="decision-textarea"
                  rows={5}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder={
                    decisionAction === 'accept'
                      ? "Ex : Bienvenue dans l'équipe ! Vous serez recontacté(e) sous 48h."
                      : decisionAction === 'reject'
                      ? 'Ex : Merci pour votre intérêt. Le poste a déjà été pourvu.'
                      : 'Saisissez un message à transmettre au demandeur…'
                  }
                />
              </div>

              <footer className="decision-modal-footer">
                <button
                  type="button"
                  className="decision-btn-secondary"
                  onClick={closeDecision}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`decision-btn-primary ${
                    decisionAction === 'accept'
                      ? 'is-accept'
                      : decisionAction === 'reject'
                      ? 'is-reject'
                      : ''
                  }`}
                  disabled={!decisionAction}
                >
                  {decisionAction === 'reject' ? (
                    <>
                      <CloseSquare
                        size={16}
                        variant="Bold"
                        color="#FFFFFF"
                      />
                      Confirmer le refus
                    </>
                  ) : (
                    <>
                      <TickCircle
                        size={16}
                        variant="Bold"
                        color="#FFFFFF"
                      />
                      {decisionAction === 'accept'
                        ? "Confirmer l'acceptation"
                        : 'Confirmer'}
                    </>
                  )}
                </button>
              </footer>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CollaborationRequests;
