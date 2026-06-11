import React, { useState, useEffect } from 'react';
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
  Export,
  InfoCircle
} from 'iconsax-react';
import { Header, Sidebar } from '../../components/layout';
import {
  listPartnerSuggestionsService,
  getPartnerSuggestionService,
  getMyPendingReceivedSuggestionsService,
  acceptPartnerSuggestionService,
  rejectPartnerSuggestionService,
  listCollaborationsService,
  getCollaborationDashboardService,
  acceptCollaborationService,
  rejectCollaborationService
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
    label: 'Active',
    icon: TickCircle,
    color: '#22C55E',
    className: 'status-accepted'
  },
  rejected: {
    label: 'Refusée',
    icon: CloseCircle,
    color: '#EF4444',
    className: 'status-rejected'
  },
  declined: {
    label: 'Refusée',
    icon: CloseCircle,
    color: '#EF4444',
    className: 'status-rejected'
  }
};

const ROLE_META = {
  leader: { label: 'Leader', icon: Crown1, color: '#F59E0B' },
  contributeur: { label: 'Contributeur', icon: People, color: '#3AA2DD' },
  observateur: { label: 'Observateur', icon: Eye, color: '#6C7278' },
  contributor: { label: 'Contributeur', icon: People, color: '#3AA2DD' },
  observer: { label: 'Observateur', icon: Eye, color: '#6C7278' }
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

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');

export const CollaborationRequests = ({
  embedded = false
}) => {
  const {
    isOpen: sidebarOpen,
    setOpen: setSidebarOpen,
    isCollapsed: sidebarCollapsed,
    setCollapsed: setSidebarCollapsed,
  } = useSidebarState();

  const [localRequests, setLocalRequests] = useState([]);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedIncident, setExpandedIncident] = useState(null);

  // Modal de décision
  const [decisionRequest, setDecisionRequest] = useState(null);
  const [decisionAction, setDecisionAction] = useState(null); // 'accept' | 'reject' | null
  const [decisionClosing, setDecisionClosing] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [suggestionsStatus, setSuggestionsStatus] = useState({}); // {orgName: 'accepted' | 'rejected'}
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionError, setDecisionError] = useState(null);

  // Clé SWR pour la suggestion sélectionnée
  const [selectedSuggestionKey, setSelectedSuggestionKey] = useState(null);

  // SWR Calls
  const { data: pendingSuggestions, mutate: mutatePendingSuggestions } = useSWR(
    typeFilter === 'sug-received' || typeFilter === 'all' ? 'my-pending-received-suggestions' : null,
    getMyPendingReceivedSuggestionsService,
    { revalidateOnFocus: false }
  );

  const { data: activeCollabs, mutate: mutateActiveCollabs } = useSWR(
    typeFilter === 'app-sent' || typeFilter === 'all' ? ['my-active-collaborations', { status: 'in-progress' }] : null,
    ([, params]) => getCollaborationDashboardService(params),
    { revalidateOnFocus: false }
  );

  const { data: pendingInvitations, mutate: mutatePendingInvitations } = useSWR(
    typeFilter === 'app-received' || typeFilter === 'all' ? ['my-pending-contributor-invitations', { status: 'pending', role: 'contributor' }] : null,
    ([, params]) => listCollaborationsService(params),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (typeFilter === 'all') {
      mutatePendingSuggestions();
      mutateActiveCollabs();
      mutatePendingInvitations();
    } else if (typeFilter === 'app-sent') {
      mutateActiveCollabs();
    } else if (typeFilter === 'app-received') {
      mutatePendingInvitations();
    } else if (typeFilter === 'sug-received') {
      mutatePendingSuggestions();
    }
  }, [typeFilter, mutatePendingSuggestions, mutateActiveCollabs, mutatePendingInvitations]);

  const { data: selectedSuggestionDetail } = useSWR(
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
    setDecisionError(null);
    if (request?.incidentId && (request?.apiId || request?.id)) {
      setSelectedSuggestionKey([request.incidentId, request.apiId || request.id]);
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
      setDecisionError(null);
    }, 280);
  };

  const handleConfirmDecision = async (e) => {
    e.preventDefault();
    if (!decisionRequest || !decisionAction) return;
    setIsSubmittingDecision(true);
    setDecisionError(null);

    const newStatus = decisionAction === 'accept' ? 'accepted' : 'rejected';

    try {
      if (typeof decisionRequest.id === 'string' && decisionRequest.id.startsWith('sug_received_')) {
        const suggestionId = decisionRequest.apiId;
        const incidentId = decisionRequest.incidentId;

        if (decisionAction === 'accept') {
          await acceptPartnerSuggestionService(incidentId, suggestionId);
        } else {
          await rejectPartnerSuggestionService(incidentId, suggestionId);
        }
        mutatePendingSuggestions();
      } else if (typeof decisionRequest.id === 'string' && decisionRequest.id.startsWith('invitation_pending_')) {
        const collaborationId = decisionRequest.apiId;

        if (decisionAction === 'accept') {
          await acceptCollaborationService(collaborationId);
        } else {
          await rejectCollaborationService(collaborationId);
        }
        mutatePendingInvitations();
      } else {
        setLocalRequests((prev) =>
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
      }
      closeDecision();
    } catch (err) {
      console.error('[Decision] Erreur lors du traitement:', err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Une erreur est survenue lors de l'enregistrement de votre décision.";
      setDecisionError(msg);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Compile flat requests list
  const requests = [
    ...localRequests,
    ...(pendingSuggestions || []).map((item) => {
      const orgName = item.suggested_partner_name || item.partner_name || 'Partenaire';
      return {
        id: `sug_received_${item.id}`,
        type: 'suggestion',
        direction: 'received',
        projectTitle: item.incident_details?.title || item.incident_title || (item.incident_id ? `Incident #${item.incident_id}` : 'Incident sans titre'),
        projectImage: item.incident_details?.photo || item.incident_details?.image || '',
        organisation: orgName,
        organisationInitials: getInitials(orgName),
        organisationColor: '#3AA2DD',
        suggestedBy: item.suggested_by_name || 'Leader',
        suggestedByRole: item.suggested_by_role || 'Leader',
        suggestionMessage: item.justification || item.message || 'Pas de message.',
        proposedCollaborators: (item.proposed_collaborators || []).map((pc) => ({
          name: pc.partner_name || 'Partenaire',
          initials: getInitials(pc.partner_name || 'PT'),
          color: '#10B981',
          role: pc.role || 'contributeur',
          comment: pc.justification || ''
        })),
        status: item.status || 'pending',
        submittedAt: item.created_at || new Date().toISOString(),
        respondedAt: item.updated_at || null,
        response: item.response_message || null,
        incidentId: item.incident_id,
        apiId: item.id
      };
    }),
    ...(activeCollabs || []).map((item) => {
      const orgName = item.organisation_name || item.leader_name || 'Organisation sans nom';
      const projTitle = item.incident_details?.title || item.incident_title || (item.incident_id ? `Incident #${item.incident_id}` : 'Incident sans titre');
      const projImg = item.incident_details?.photo || item.incident_details?.image || '';
      return {
        id: `collab_active_${item.id}`,
        direction: 'sent',
        projectTitle: projTitle,
        projectImage: projImg,
        organisation: orgName,
        organisationInitials: getInitials(orgName),
        organisationColor: '#22C55E',
        role: item.role === 'leader' ? 'Leader' : (item.role === 'contributor' || item.role === 'contributeur') ? 'Contributeur' : 'Observateur',
        motif: item.justification || 'Collaboration acceptée en cours.',
        status: 'accepted',
        submittedAt: item.created_at || new Date().toISOString(),
        respondedAt: item.updated_at || null,
        response: null,
        incidentId: item.incident_details?.id || item.incident_id,
        apiId: item.id
      };
    }),
    ...(pendingInvitations || []).map((item) => {
      const orgName = item.organisation_name || item.leader_name || 'Organisation sans nom';
      const projTitle = item.incident_details?.title || item.incident_title || (item.incident_id ? `Incident #${item.incident_id}` : 'Incident sans titre');
      const projImg = item.incident_details?.photo || item.incident_details?.image || '';
      return {
        id: `invitation_pending_${item.id}`,
        direction: 'received',
        applicantName: item.user_full_name || item.invited_member_name || 'Membre',
        applicantOrg: orgName,
        projectTitle: projTitle,
        projectImage: projImg,
        organisation: orgName,
        organisationInitials: getInitials(orgName),
        organisationColor: '#F59E0B',
        role: item.role === 'leader' ? 'Leader' : (item.role === 'contributor' || item.role === 'contributeur') ? 'Contributeur' : 'Observateur',
        motif: item.justification || 'Invitation en attente de réponse.',
        status: 'pending',
        submittedAt: item.created_at || new Date().toISOString(),
        respondedAt: null,
        response: null,
        incidentId: item.incident_details?.id || item.incident_id,
        apiId: item.id
      };
    })
  ];

  const q = search.trim().toLowerCase();
  const filtered = requests.filter((r) => {
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

  // Incident-centric grouping
  const groupedIncidents = [];
  const incidentsMap = {};

  filtered.forEach((r) => {
    const incidentId = r.incidentId || 'unknown';
    if (!incidentsMap[incidentId]) {
      incidentsMap[incidentId] = {
        id: incidentId,
        projectTitle: r.projectTitle || 'Incident sans titre',
        projectImage: r.projectImage || '',
        leader: null,
        userCollab: null,
        otherCollabs: [],
        suggestions: []
      };
      groupedIncidents.push(incidentsMap[incidentId]);
    }

    const group = incidentsMap[incidentId];

    if (r.type === 'suggestion') {
      group.suggestions.push(r);
    } else {
      if (r.role?.toLowerCase() === 'leader' && r.status === 'accepted') {
        group.leader = {
          name: r.applicantName || r.organisation || 'Leader',
          org: r.applicantOrg || r.organisation,
          color: r.organisationColor || '#F59E0B'
        };
      }
      const isForCurrentUser = r.direction === 'sent' || (r.direction === 'received' && !r.applicantName);
      if (isForCurrentUser) {
        group.userCollab = r;
      } else {
        group.otherCollabs.push(r);
      }
    }
  });

  // Resolve leader presence
  groupedIncidents.forEach((group) => {
    if (group.userCollab && group.userCollab.role?.toLowerCase() === 'leader') {
      group.leader = {
        name: 'Vous',
        isMe: true,
        color: '#F59E0B'
      };
    }
    if (!group.leader) {
      const activeLeader = group.otherCollabs.find(oc => oc.role?.toLowerCase() === 'leader' && oc.status === 'accepted');
      if (activeLeader) {
        group.leader = {
          name: activeLeader.applicantName || activeLeader.organisation || 'Leader',
          org: activeLeader.applicantOrg || activeLeader.organisation,
          color: activeLeader.organisationColor || '#F59E0B'
        };
      }
    }
  });

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    appSent: requests.filter((r) => r.type !== 'suggestion' && r.direction === 'sent').length,
    appReceived: requests.filter((r) => r.type !== 'suggestion' && r.direction === 'received').length,
    sugSent: requests.filter((r) => r.type === 'suggestion' && r.direction === 'sent').length,
    sugReceived: requests.filter((r) => r.type === 'suggestion' && r.direction === 'received').length
  };

  const content = (
    <>
      {!embedded && (
        <div className="requests-page-header">
          <div>
            <h1 className="requests-title">Demandes de collaboration</h1>
            <p className="requests-subtitle">
              Gérez vos demandes de participation et suivez les rôles associés aux incidents.
            </p>
          </div>
        </div>
      )}

      {/* Onglets type */}
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
            placeholder="Rechercher un incident, rôle, organisation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="requests-filters">
          <button
            type="button"
            className={`requests-filter-pill ${statusFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Toutes
            <span className="requests-filter-count">{counts.all}</span>
          </button>
          <button
            type="button"
            className={`requests-filter-pill ${statusFilter === 'pending' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            <Clock size={14} variant="Bold" color="currentColor" />
            En attente
            <span className="requests-filter-count">{counts.pending}</span>
          </button>
          <button
            type="button"
            className={`requests-filter-pill ${statusFilter === 'accepted' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('accepted')}
          >
            <TickCircle size={14} variant="Bold" color="currentColor" />
            Actives
            <span className="requests-filter-count">{counts.accepted}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Info Banner (Scenarios 2 & 3 Explanation) */}
      {showInfoBanner && (
        <div className="collaboration-info-banner">
          <div className="info-banner-content">
            <InfoCircle size={24} variant="Bold" className="info-banner-icon" />
            <div className="info-banner-text">
              <h4>Règles de collaboration sur les Incidents</h4>
              <p>
                <strong>1. Sans Leader :</strong> Si aucun leader n'a encore pris l'incident en charge, toute demande d'observation ou de contribution est <strong>automatiquement acceptée</strong>.
              </p>
              <p>
                <strong>2. Prise en charge par un Leader :</strong> Dès qu'une organisation prend en charge l'incident en tant que <strong>Leader</strong>, toutes les contributions existantes repassent en status <strong>"En attente"</strong> pour lui permettre de les valider manuellement. Les observateurs restent actifs.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="info-banner-close"
            onClick={() => setShowInfoBanner(false)}
            aria-label="Fermer"
          >
            <CloseCircle size={20} variant="Linear" />
          </button>
        </div>
      )}

      {/* Grouped Incident List */}
      {groupedIncidents.length === 0 ? (
        <div className="requests-empty">
          <Briefcase size={48} variant="Linear" color="#9CA3AF" />
          <p>Aucune collaboration ne correspond à vos critères.</p>
        </div>
      ) : (
        <div className="incident-centric-list">
          {groupedIncidents.map((incident) => {
            const isExpanded = expandedIncident === incident.id;
            const hasLeader = !!incident.leader;
            const isUserLeader = incident.leader?.isMe;

            // Status details for user's own participation
            const myCollab = incident.userCollab;
            const meta = myCollab ? STATUS_META[myCollab.status] : null;
            const myRoleKey = myCollab?.role?.toLowerCase() === 'leader' ? 'leader' : 
                              (myCollab?.role?.toLowerCase() === 'contributeur' || myCollab?.role?.toLowerCase() === 'contributor') ? 'contributor' : 'observer';
            const myRoleMeta = myCollab ? ROLE_META[myRoleKey] : null;

            // Find other accepted collaborators
            const acceptedOthers = incident.otherCollabs.filter(c => c.status === 'accepted');
            const pendingOthers = incident.otherCollabs.filter(c => c.status === 'pending');

            return (
              <section
                key={incident.id}
                className={`incident-group-card ${isExpanded ? 'is-expanded' : ''} ${hasLeader ? 'has-leader' : 'no-leader'}`}
              >
                {/* Incident Group Header */}
                <header
                  className="incident-group-header"
                  onClick={() => setExpandedIncident(isExpanded ? null : incident.id)}
                >
                  <div
                    className="incident-group-thumb"
                    style={{ backgroundImage: `url(${incident.projectImage})` }}
                  />
                  
                  <div className="incident-group-title-section">
                    <h3 className="incident-group-title">{incident.projectTitle}</h3>
                    
                    <div className="incident-group-status-badges">
                      {/* Leader presence status */}
                      {hasLeader ? (
                        <span className={`leader-badge ${isUserLeader ? 'is-me' : ''}`}>
                          <Crown1 size={13} variant="Bold" />
                          {isUserLeader ? "Vous êtes le leader" : `Leader : ${incident.leader.name}`}
                        </span>
                      ) : (
                        <span className="leader-badge no-leader">
                          <InfoCircle size={13} variant="Bold" />
                          Aucun leader (Contributions auto-acceptées)
                        </span>
                      )}

                      {/* User's own role badge if participating */}
                      {myCollab && myRoleMeta && (
                        <span className="my-participation-badge" style={{ color: myRoleMeta.color, borderColor: myRoleMeta.color, backgroundColor: `${myRoleMeta.color}15` }}>
                          {myRoleMeta.icon && <myRoleMeta.icon size={13} variant="Bold" />}
                          Rôle : {myCollab.role}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="incident-group-summary-side">
                    {/* User's active/pending badge */}
                    {myCollab && meta && (
                      <span className={`request-status-badge ${meta.className}`}>
                        {meta.label}
                      </span>
                    )}

                    <button
                      type="button"
                      className="incident-group-toggle"
                      aria-label={isExpanded ? 'Réduire' : 'Développer'}
                    >
                      <ArrowRight2 size={18} />
                    </button>
                  </div>
                </header>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="incident-group-body">
                    <div className="incident-details-grid">
                      {/* Left: Your collaboration state details */}
                      <div className="grid-column my-collab-details">
                        <h4 className="detail-section-title">Votre participation</h4>
                        {myCollab ? (
                          <div className="my-collab-info-box">
                            <p className="my-collab-motif">
                              <strong>Votre motif :</strong> "{myCollab.motif || myCollab.suggestionMessage || 'Aucun motif renseigné'}"
                            </p>
                            
                            {/* Contextual pending/accepted help text depending on Leader presence (Scenarios 2 & 3) */}
                            <div className="scenario-explanation-box">
                              {myCollab.status === 'pending' ? (
                                <p className="status-note status-pending">
                                  <Clock size={16} variant="Bold" />
                                  {hasLeader ? (
                                    <>
                                      En attente de validation par le leader (<strong>{incident.leader.name}</strong>). 
                                      <br /><span className="fine-note">Note : Un leader est en place, votre contribution est soumise à son approbation.</span>
                                    </>
                                  ) : (
                                    <>
                                      En attente. En l'absence de leader, votre demande sera acceptée automatiquement.
                                    </>
                                  )}
                                </p>
                              ) : myCollab.status === 'accepted' ? (
                                <p className="status-note status-accepted">
                                  <TickCircle size={16} variant="Bold" />
                                  {myCollab.role?.toLowerCase() === 'observer' || myCollab.role?.toLowerCase() === 'observateur' ? (
                                    <>Participation active en tant qu'observateur (Toujours approuvée).</>
                                  ) : hasLeader ? (
                                    <>Approuvée par le leader (<strong>{incident.leader.name}</strong>).</>
                                  ) : (
                                    <>Active (Auto-acceptée car aucun leader n'est désigné sur l'incident).</>
                                  )}
                                </p>
                              ) : (
                                <p className="status-note status-rejected">
                                  <CloseCircle size={16} variant="Bold" />
                                  Collaboration refusée. {myCollab.response && `Motif : "${myCollab.response}"`}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="no-participation-text">Vous ne participez pas encore à cet incident.</p>
                        )}
                      </div>

                      {/* Center: Collaborators Stack */}
                      <div className="grid-column collaborators-section">
                        <h4 className="detail-section-title">Collaborateurs actifs ({acceptedOthers.length})</h4>
                        {acceptedOthers.length === 0 ? (
                          <p className="no-collabs-text">Aucun autre collaborateur actif.</p>
                        ) : (
                          <div className="collabs-avatar-grid">
                            {acceptedOthers.map((collab, idx) => {
                              const key = collab.role?.toLowerCase() === 'leader' ? 'leader' : 
                                          (collab.role?.toLowerCase() === 'contributeur' || collab.role?.toLowerCase() === 'contributor') ? 'contributor' : 'observer';
                              const roleMeta = ROLE_META[key];
                              return (
                                <div key={idx} className="collab-avatar-card" title={`${collab.organisation || collab.applicantName} - ${collab.role}`}>
                                  <div className="avatar-bubble" style={{ backgroundColor: collab.organisationColor || '#6C7278' }}>
                                    {collab.organisationInitials || getInitials(collab.organisation || 'PT')}
                                  </div>
                                  <div className="avatar-details">
                                    <span className="collab-name">{collab.organisation || collab.applicantName}</span>
                                    <span className="collab-role" style={{ color: roleMeta?.color }}>
                                      {roleMeta?.label || collab.role}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right: Validation Actions for Leader or Suggestions */}
                      <div className="grid-column actions-section">
                        {/* Scenario validation box for leaders */}
                        {isUserLeader ? (
                          <>
                            <h4 className="detail-section-title text-gold">Demandes à valider ({pendingOthers.length})</h4>
                            {pendingOthers.length === 0 ? (
                              <p className="no-actions-text">Aucune demande en attente de votre décision.</p>
                            ) : (
                              <div className="leader-pending-requests">
                                {pendingOthers.map((pendingReq) => (
                                  <div key={pendingReq.id} className="leader-action-box">
                                    <div className="leader-action-info">
                                      <strong>{pendingReq.applicantName || pendingReq.organisation}</strong>
                                      <span className="request-role-badge contribution-pill">
                                        {pendingReq.role}
                                      </span>
                                    </div>
                                    <p className="leader-action-motif">"{pendingReq.motif}"</p>
                                    
                                    <div className="leader-action-buttons">
                                      <button
                                        type="button"
                                        className="btn-action-accept"
                                        onClick={() => openDecision(pendingReq)}
                                      >
                                        Accepter / Rejeter
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <h4 className="detail-section-title">Suggestions de partenaires ({incident.suggestions.length})</h4>
                            {incident.suggestions.length === 0 ? (
                              <p className="no-actions-text">Aucune suggestion pour cet incident.</p>
                            ) : (
                              <div className="incident-suggestions-list">
                                {incident.suggestions.map((sug) => (
                                  <div key={sug.id} className="sug-action-card">
                                    <div className="sug-card-header">
                                      <strong>{sug.organisation}</strong>
                                      <span className="sug-count">({sug.proposedCollaborators?.length || 0} orgs)</span>
                                    </div>
                                    <p className="sug-justification">"{sug.suggestionMessage}"</p>
                                    
                                    {sug.status === 'pending' && (
                                      <button
                                        type="button"
                                        className="sug-action-btn"
                                        onClick={() => openDecision(sug)}
                                      >
                                        Traiter la suggestion
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Decision modal */}
      {decisionRequest && (
        <div
          className={`decision-modal-overlay ${decisionClosing ? 'closing' : ''}`}
          onClick={closeDecision}
        >
          <aside
            className={`decision-modal ${decisionAction ? (decisionAction === 'accept' ? 'is-accept' : 'is-reject') : ''} ${decisionClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Répondre"
          >
            <header className="decision-modal-header">
              <div>
                <h3 className="decision-modal-title">
                  {decisionRequest.type === 'suggestion' ? 'Traiter la suggestion' : 'Répondre à la demande'}
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
                {decisionError && (
                  <div className="am-alert am-alert--danger" role="alert" style={{ marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CloseCircle size={18} variant="Bold" color="var(--color-danger)" />
                    <span className="am-alert__message">{decisionError}</span>
                  </div>
                )}
                
                <div className="decision-summary">
                  <div
                    className="decision-summary-avatar"
                    style={{ backgroundColor: decisionRequest.organisationColor }}
                  >
                    {decisionRequest.organisationInitials}
                  </div>
                  <div>
                    <span className="decision-summary-org">
                      {decisionRequest.organisation || decisionRequest.applicantName}
                    </span>
                    <span className="decision-summary-role">
                      {decisionRequest.type === 'suggestion' ? (
                        <>{decisionRequest.proposedCollaborators?.length || 0} organisation(s) proposée(s)</>
                      ) : (
                        <>Rôle : <strong>{decisionRequest.role}</strong></>
                      )}
                    </span>
                  </div>
                </div>

                <div className="decision-motif">
                  <h4 className="decision-block-label">
                    {decisionRequest.type === 'suggestion' ? 'Message du leader' : 'Motif de participation'}
                  </h4>
                  <p className="decision-motif-text">
                    {decisionRequest.type === 'suggestion' ? decisionRequest.suggestionMessage : decisionRequest.motif}
                  </p>
                </div>

                {/* Suggestions display */}
                {decisionRequest.type === 'suggestion' && decisionRequest.proposedCollaborators && (
                  <div className="decision-proposed">
                    <h4 className="decision-block-label">Organisations à inviter ({decisionRequest.proposedCollaborators.length})</h4>
                    <div className="proposed-collabs-list">
                      {decisionRequest.proposedCollaborators.map((collab, idx) => {
                        const cRoleMeta = ROLE_META[collab.role];
                        return (
                          <div key={idx} className="proposed-collab-card">
                            <div className="proposed-collab-header">
                              <div className="proposed-collab-avatar" style={{ backgroundColor: collab.color }}>
                                {collab.initials}
                              </div>
                              <div className="proposed-collab-info">
                                <span className="proposed-collab-name">{collab.name}</span>
                                <span className="proposed-collab-role" style={{ color: cRoleMeta?.color }}>
                                  {cRoleMeta?.label || collab.role}
                                </span>
                              </div>
                            </div>
                            {collab.comment && <p className="proposed-collab-comment">{collab.comment}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="decision-choice-group" role="radiogroup">
                  <h4 className="decision-block-label">Votre décision</h4>
                  <div className="decision-choices">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={decisionAction === 'accept'}
                      className={`decision-choice is-accept ${decisionAction === 'accept' ? 'is-selected' : ''}`}
                      onClick={() => setDecisionAction('accept')}
                    >
                      <TickCircle size={22} variant="Bold" color={decisionAction === 'accept' ? '#FFFFFF' : '#22C55E'} />
                      <span>Accepter</span>
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={decisionAction === 'reject'}
                      className={`decision-choice is-reject ${decisionAction === 'reject' ? 'is-selected' : ''}`}
                      onClick={() => setDecisionAction('reject')}
                    >
                      <CloseSquare size={22} variant="Bold" color={decisionAction === 'reject' ? '#FFFFFF' : '#EF4444'} />
                      <span>Refuser</span>
                    </button>
                  </div>
                </div>

                <label htmlFor="decision-response" className="decision-label">
                  Message de réponse <span className="decision-optional">(optionnel)</span>
                </label>
                <textarea
                  id="decision-response"
                  className="decision-textarea"
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Saisissez votre réponse..."
                />
              </div>

              <footer className="decision-modal-footer">
                <button
                  type="button"
                  className="decision-btn-secondary"
                  onClick={closeDecision}
                  disabled={isSubmittingDecision}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`decision-btn-primary ${decisionAction === 'accept' ? 'is-accept' : decisionAction === 'reject' ? 'is-reject' : ''}`}
                  disabled={!decisionAction || isSubmittingDecision}
                >
                  {isSubmittingDecision && (
                    <span className="spinner-mini" />
                  )}
                  {decisionAction === 'reject' ? 'Confirmer le refus' : 'Confirmer l\'acceptation'}
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

      <div className={`requests-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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
