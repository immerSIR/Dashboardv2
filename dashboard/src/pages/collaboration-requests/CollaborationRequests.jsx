import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useSidebarState } from '../../hooks/useSidebarState';
import {
  SearchNormal1,
  Clock,
  TickCircle,
  CloseCircle,
  Briefcase,
  Calendar,
  MessageText1,
  ArrowRight2,
  CloseSquare,
  Building,
  Crown1,
  People,
  Eye,
  UserAdd,
  Send2,
  Import,
  Export
} from 'iconsax-react';
import { Header, Sidebar } from '../../components/layout';
import { collaborationRequests as allRequests } from './data/requests';
import {
  listPartnerSuggestionsService,
  getPartnerSuggestionService
} from './service/partner_service';
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

const ROLE_META = {
  leader: { label: 'Leader', icon: Crown1, color: '#F59E0B' },
  contributeur: { label: 'Contributeur', icon: People, color: '#3AA2DD' },
  observateur: { label: 'Observateur', icon: Eye, color: '#6C7278' }
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
  embedded = false
}) => {
  const {
    isOpen: sidebarOpen,
    setOpen: setSidebarOpen,
    isCollapsed: sidebarCollapsed,
    setCollapsed: setSidebarCollapsed,
  } = useSidebarState();

  // Si embedded, on ne gère pas le layout complet

  const [requests, setRequests] = useState(allRequests);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // 'all' | 'app-sent' | 'app-received' | 'sug-sent' | 'sug-received'
  const [typeFilter, setTypeFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  // Modal de décision (un seul, avec choix interne)
  const [decisionRequest, setDecisionRequest] = useState(null);
  const [decisionAction, setDecisionAction] = useState(null); // 'accept' | 'reject' | null
  const [decisionClosing, setDecisionClosing] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [suggestionsStatus, setSuggestionsStatus] = useState({}); // {orgName: 'accepted' | 'rejected'}

  // Clé SWR pour la suggestion sélectionnée [incidentId, suggestionId]
  const [selectedSuggestionKey, setSelectedSuggestionKey] = useState(null);

  // ── SWR : liste des suggestions de partenaires ──────────────────────────
  // listPartnerSuggestionsService attend un incidentId précis.
  // On garde la clé null par défaut (désactivé) — à passer un incidentId
  // spécifique si tu veux charger les suggestions d'un incident en particulier.
  const {
    data: apiSuggestions,
    isLoading: isLoadingSuggestions,
    error: suggestionsError,
    mutate: mutateSuggestions
  } = useSWR(
    null, // remplacer par ['partner-suggestions', incidentId] pour activer
    null,
    { revalidateOnFocus: false }
  );

  // ── SWR conditionnel : détail d'une suggestion sélectionnée ────────────
  const {
    data: selectedSuggestionDetail,
    isLoading: isLoadingDetail
  } = useSWR(
    selectedSuggestionKey
      ? `partner-suggestion-${selectedSuggestionKey[0]}-${selectedSuggestionKey[1]}`
      : null,
    selectedSuggestionKey
      ? () => getPartnerSuggestionService(selectedSuggestionKey[0], selectedSuggestionKey[1])
      : null,
    { revalidateOnFocus: false }
  );


  const openDecision = (request) => {
    setDecisionRequest(request);
    setDecisionAction(null);
    setResponseText('');
    setDecisionClosing(false);
    setSuggestionsStatus({});
    // Charger le détail de la suggestion via API si elle a un incidentId
    if (request?.incidentId && request?.id) {
      setSelectedSuggestionKey([request.incidentId, request.id]);
    } else {
      setSelectedSuggestionKey(null);
    }
  };

  const closeDecision = () => {
    setDecisionClosing(true);
    setTimeout(() => {
      setDecisionRequest(null);
      setDecisionAction(null);
      setDecisionClosing(false);
      setResponseText('');
      setSuggestionsStatus({});
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
      rejected: requests.filter((r) => r.status === 'rejected').length,
      appSent: requests.filter((r) => r.type !== 'suggestion' && r.direction === 'sent').length,
      appReceived: requests.filter((r) => r.type !== 'suggestion' && r.direction === 'received').length,
      sugSent: requests.filter((r) => r.type === 'suggestion' && r.direction === 'sent').length,
      sugReceived: requests.filter((r) => r.type === 'suggestion' && r.direction === 'received').length
    }),
    [requests]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const isSuggestion = r.type === 'suggestion';
      const isSent = r.direction === 'sent';
      if (typeFilter === 'app-sent' && (isSuggestion || !isSent)) return false;
      if (typeFilter === 'app-received' && (isSuggestion || isSent)) return false;
      if (typeFilter === 'sug-sent' && (!isSuggestion || !isSent)) return false;
      if (typeFilter === 'sug-received' && (!isSuggestion || isSent)) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.projectTitle.toLowerCase().includes(q) ||
        r.organisation.toLowerCase().includes(q) ||
        (r.role || r.proposedRole || '').toLowerCase().includes(q) ||
        (r.applicantName || '').toLowerCase().includes(q) ||
        (r.applicantOrg || '').toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter, typeFilter, requests]);

  const content = (
    <>
      {/* Header (seulement si non embedded) */}
      {!embedded && (
        <div className="requests-page-header">
          <div>
            <h1 className="requests-title">Demandes de collaboration</h1>
            <p className="requests-subtitle">
              Gérez vos demandes envoyées et les invitations reçues des organisations.
            </p>
          </div>
        </div>
      )}

      {/* Onglets type + direction */}
      <div className="requests-type-tabs">
        <button
          type="button"
          className={`requests-type-tab ${typeFilter === 'all' ? 'is-active' : ''}`}
          onClick={() => setTypeFilter('all')}
        >
          <Briefcase size={16} variant="Bold" color="currentColor" />
          Toutes
          <span className="requests-tab-badge">{counts.all}</span>
        </button>
        <button
          type="button"
          className={`requests-type-tab ${typeFilter === 'app-sent' ? 'is-active' : ''}`}
          onClick={() => setTypeFilter('app-sent')}
        >
          <Export size={16} variant="Bold" color="currentColor" />
          Demandes envoyées
          <span className="requests-tab-badge">{counts.appSent}</span>
        </button>
        <button
          type="button"
          className={`requests-type-tab ${typeFilter === 'app-received' ? 'is-active' : ''}`}
          onClick={() => setTypeFilter('app-received')}
        >
          <Import size={16} variant="Bold" color="currentColor" />
          Demandes reçues
          <span className="requests-tab-badge">{counts.appReceived}</span>
        </button>
        <button
          type="button"
          className={`requests-type-tab ${typeFilter === 'sug-sent' ? 'is-active' : ''}`}
          onClick={() => setTypeFilter('sug-sent')}
        >
          <Send2 size={16} variant="Bold" color="currentColor" />
          Suggestions envoyées
          <span className="requests-tab-badge">{counts.sugSent}</span>
        </button>
        <button
          type="button"
          className={`requests-type-tab ${typeFilter === 'sug-received' ? 'is-active' : ''}`}
          onClick={() => setTypeFilter('sug-received')}
        >
          <UserAdd size={16} variant="Bold" color="currentColor" />
          Suggestions reçues
          {counts.sugReceived > 0 && (
            <span className="requests-tab-badge requests-tab-badge-highlight">
              {counts.sugReceived}
            </span>
          )}
        </button>
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
            className={`requests-filter-pill ${statusFilter === 'all' ? 'is-active' : ''
              }`}
            onClick={() => setStatusFilter('all')}
          >
            Toutes
            <span className="requests-filter-count">{counts.all}</span>
          </button>
          <button
            type="button"
            className={`requests-filter-pill ${statusFilter === 'pending' ? 'is-active' : ''
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
            className={`requests-filter-pill ${statusFilter === 'accepted' ? 'is-active' : ''
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
            className={`requests-filter-pill ${statusFilter === 'rejected' ? 'is-active' : ''
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
            const isSuggestion = r.type === 'suggestion';
            const isSent = r.direction === 'sent';
            const collaboratorsCount = r.proposedCollaborators?.length || 0;

            const directionLabel = isSuggestion
              ? isSent
                ? 'Sugges. envoyée'
                : 'Sugges. reçue'
              : isSent
                ? 'Deman. envoyée'
                : 'Deman. reçue';
            const DirectionIcon = isSent ? Export : Import;

            return (
              <article
                key={r.id}
                className={`request-card ${meta.className} ${isOpen ? 'is-open' : ''
                  } ${isSuggestion ? 'is-suggestion' : ''} ${isSent ? 'is-sent' : 'is-received'
                  }`}
              >
                <div
                  className="request-card-main"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                >
                  <div
                    className="request-thumb"
                    style={{ backgroundImage: `url(${r.projectImage})` }}
                  >
                    <span
                      className={`request-direction-tag ${isSent
                          ? isSuggestion
                            ? 'is-sent-suggestion'
                            : 'is-sent-application'
                          : isSuggestion
                            ? 'is-received-suggestion'
                            : 'is-received-application'
                        }`}
                    >

                      {directionLabel}
                    </span>
                  </div>

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
                      {isSuggestion ? (
                        <span className="request-role-badge request-suggestion-count">
                          <Building size={12} variant="Bold" color="#F59E0B" />
                          {collaboratorsCount} org.{collaboratorsCount > 1 ? 's' : ''} proposée{collaboratorsCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="request-role">{r.role}</span>
                      )}
                    </div>

                    <h3 className="request-project">{r.projectTitle}</h3>

                    {!isSuggestion && !isSent && r.applicantName && (
                      <div className="request-applicant">
                        <span className="request-applicant-label">
                          Candidat :
                        </span>
                        <strong>{r.applicantName}</strong>
                        {r.applicantOrg && (
                          <span className="request-applicant-org">
                            — {r.applicantOrg}
                          </span>
                        )}
                      </div>
                    )}



                    <div className="request-meta">
                      <div className="request-meta-row">
                        <Calendar
                          size={13}
                          variant="Bold"
                          color="#6C7278"
                        />
                        <span>
                          {isSent ? 'Envoyée' : 'Reçue'} le{' '}
                          {formatDate(r.submittedAt)}
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
                    {isSuggestion ? (
                      <>
                        <div className="request-block request-invitation-block">
                          <h4 className="request-block-label">
                            <Crown1 size={14} variant="Bold" color="#F59E0B" />
                            Message du leader
                          </h4>
                          <p className="request-block-text">
                            {r.suggestionMessage}
                          </p>
                          {r.suggestedBy && (
                            <div className="request-invited-by">
                              Suggéré par <strong>{r.suggestedBy}</strong>
                              {r.suggestedByRole && (
                                <span className="request-invited-role">
                                  {' '}— {r.suggestedByRole}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {r.proposedCollaborators &&
                          r.proposedCollaborators.length > 0 && (
                            <div className="request-block">
                              <h4 className="request-block-label">
                                <Building size={14} variant="Bold" color="#3AA2DD" />
                                Organisations proposées ({r.proposedCollaborators.length})
                              </h4>
                              <div className="proposed-collabs-list">
                                {r.proposedCollaborators.map((collab, idx) => {
                                  const cRoleMeta = ROLE_META[collab.role];
                                  const CRoleIcon = cRoleMeta?.icon;
                                  return (
                                    <div key={idx} className="proposed-collab-card">
                                      <div className="proposed-collab-header">
                                        <div
                                          className="proposed-collab-avatar"
                                          style={{ backgroundColor: collab.color }}
                                        >
                                          {collab.initials}
                                        </div>
                                        <div className="proposed-collab-info">
                                          <div className="proposed-collab-name">
                                            {collab.name}
                                          </div>
                                          {cRoleMeta && (
                                            <span
                                              className="proposed-collab-role"
                                              style={{ color: cRoleMeta.color }}
                                            >
                                              {CRoleIcon && (
                                                <CRoleIcon
                                                  size={11}
                                                  variant="Bold"
                                                  color={cRoleMeta.color}
                                                />
                                              )}
                                              {cRoleMeta.label}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {collab.comment && (
                                        <p className="proposed-collab-comment">
                                          {collab.comment}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="request-block">
                        <h4 className="request-block-label">Mon motif</h4>
                        <p className="request-block-text">{r.motif}</p>
                      </div>
                    )}



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
                            {isSent
                              ? isSuggestion
                                ? 'Suggestion en attente de validation par l\'organisation.'
                                : 'Demande en attente de réponse de l\'organisation.'
                              : isSuggestion
                                ? 'Acceptez pour envoyer les invitations aux organisations proposées.'
                                : 'Cette demande est en attente de votre décision.'}
                          </span>
                        </div>

                        {!isSent && (
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
                              {isSuggestion
                                ? 'Traiter la suggestion'
                                : 'Répondre à la demande'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Decision modal */}
      {decisionRequest && (
        <div
          className={`decision-modal-overlay ${decisionClosing ? 'closing' : ''
            }`}
          onClick={closeDecision}
        >
          <aside
            className={`decision-modal ${decisionAction
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
                  {decisionRequest.type === 'suggestion'
                    ? 'Traiter la suggestion'
                    : 'Répondre à la demande'}
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
                      {decisionRequest.type === 'suggestion' ? (
                        <>
                          {decisionRequest.proposedCollaborators?.length || 0}{' '}
                          organisation
                          {(decisionRequest.proposedCollaborators?.length || 0) > 1
                            ? 's'
                            : ''}{' '}
                          proposée
                          {(decisionRequest.proposedCollaborators?.length || 0) > 1
                            ? 's'
                            : ''}
                        </>
                      ) : (
                        <>
                          Rôle demandé : <strong>{decisionRequest.role}</strong>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="decision-motif">
                  <h4 className="decision-block-label">
                    {decisionRequest.type === 'suggestion'
                      ? 'Message du leader'
                      : 'Motif fourni'}
                  </h4>
                  <p className="decision-motif-text">
                    {decisionRequest.type === 'suggestion'
                      ? decisionRequest.suggestionMessage
                      : decisionRequest.motif}
                  </p>
                  {decisionRequest.type === 'suggestion' &&
                    decisionRequest.suggestedBy && (
                      <div className="decision-invited-by">
                        Suggéré par <strong>{decisionRequest.suggestedBy}</strong>
                        {decisionRequest.suggestedByRole && (
                          <span> — {decisionRequest.suggestedByRole}</span>
                        )}
                      </div>
                    )}
                </div>

                {/* Liste des organisations proposées */}
                {decisionRequest.type === 'suggestion' &&
                  decisionRequest.proposedCollaborators &&
                  decisionRequest.proposedCollaborators.length > 0 && (
                    <div className="decision-proposed">
                      <h4 className="decision-block-label">
                        Organisations à inviter ({decisionRequest.proposedCollaborators.length})
                      </h4>
                      <p className="decision-proposed-hint">
                        Si vous acceptez, des invitations seront envoyées à ces organisations avec les rôles indiqués.
                      </p>
                      <div className="proposed-collabs-list">
                        {decisionRequest.proposedCollaborators.map((collab, idx) => {
                          const cRoleMeta = ROLE_META[collab.role];
                          const CRoleIcon = cRoleMeta?.icon;
                          return (
                            <div key={idx} className="proposed-collab-card">
                              <div className="proposed-collab-header">
                                <div
                                  className="proposed-collab-avatar"
                                  style={{ backgroundColor: collab.color }}
                                >
                                  {collab.initials}
                                </div>
                                <div className="proposed-collab-info">
                                  <div className="proposed-collab-name">
                                    {collab.name}
                                  </div>
                                  {cRoleMeta && (
                                    <span
                                      className="proposed-collab-role"
                                      style={{ color: cRoleMeta.color }}
                                    >
                                      {CRoleIcon && (
                                        <CRoleIcon
                                          size={11}
                                          variant="Bold"
                                          color={cRoleMeta.color}
                                        />
                                      )}
                                      {cRoleMeta.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {collab.comment && (
                                <p className="proposed-collab-comment">
                                  {collab.comment}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Suggestions d'organisations */}
                {decisionRequest.suggestedOrganisations &&
                  decisionRequest.suggestedOrganisations.length > 0 && (
                    <div className="decision-suggestions">
                      <h4 className="decision-block-label">
                        Organisations suggérées ({decisionRequest.suggestedOrganisations.length})
                      </h4>
                      <p className="decision-suggestions-hint">
                        {decisionRequest.organisation} recommande d'impliquer ces organisations. Acceptez ou refusez chaque suggestion :
                      </p>
                      <div className="decision-suggestions-list">
                        {decisionRequest.suggestedOrganisations.map((org, idx) => {
                          const status = suggestionsStatus[org.name];
                          return (
                            <div key={idx} className={`decision-suggestion-item ${status ? `is-${status}` : ''}`}>
                              <div className="decision-suggestion-left">
                                <div
                                  className="decision-suggestion-avatar"
                                  style={{ backgroundColor: org.color }}
                                >
                                  {org.initials}
                                </div>
                                <div className="decision-suggestion-info">
                                  <div className="decision-suggestion-name">
                                    {org.name}
                                  </div>
                                  <div className="decision-suggestion-reason">
                                    {org.reason}
                                  </div>
                                </div>
                              </div>
                              <div className="decision-suggestion-actions">
                                <button
                                  type="button"
                                  className={`decision-suggestion-btn is-accept ${status === 'accepted' ? 'is-active' : ''}`}
                                  onClick={() =>
                                    setSuggestionsStatus((prev) => ({
                                      ...prev,
                                      [org.name]: prev[org.name] === 'accepted' ? null : 'accepted'
                                    }))
                                  }
                                  title="Accepter cette organisation"
                                >
                                  <TickCircle
                                    size={18}
                                    variant="Bold"
                                    color={status === 'accepted' ? '#FFFFFF' : '#22C55E'}
                                  />
                                </button>
                                <button
                                  type="button"
                                  className={`decision-suggestion-btn is-reject ${status === 'rejected' ? 'is-active' : ''}`}
                                  onClick={() =>
                                    setSuggestionsStatus((prev) => ({
                                      ...prev,
                                      [org.name]: prev[org.name] === 'rejected' ? null : 'rejected'
                                    }))
                                  }
                                  title="Refuser cette organisation"
                                >
                                  <CloseSquare
                                    size={18}
                                    variant="Bold"
                                    color={status === 'rejected' ? '#FFFFFF' : '#EF4444'}
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Choix de la décision */}
                <div className="decision-choice-group" role="radiogroup">
                  <h4 className="decision-block-label">Votre décision</h4>
                  <div className="decision-choices">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={decisionAction === 'accept'}
                      className={`decision-choice is-accept ${decisionAction === 'accept' ? 'is-selected' : ''
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
                      className={`decision-choice is-reject ${decisionAction === 'reject' ? 'is-selected' : ''
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
                  className={`decision-btn-primary ${decisionAction === 'accept'
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
                      {decisionRequest.type === 'suggestion'
                        ? 'Refuser la suggestion'
                        : 'Confirmer le refus'}
                    </>
                  ) : (
                    <>
                      <TickCircle
                        size={16}
                        variant="Bold"
                        color="#FFFFFF"
                      />
                      {decisionAction === 'accept'
                        ? decisionRequest.type === 'suggestion'
                          ? 'Accepter et envoyer les invitations'
                          : "Confirmer l'acceptation"
                        : 'Confirmer'}
                    </>
                  )}
                </button>
              </footer>
            </form>
          </aside>
        </div>
      )}
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="requests-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className={`requests-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''
          }`}
      >
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="requests-content">
          <div className="requests-page">
            {content}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CollaborationRequests;
