import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { CloseCircle, TickCircle, SearchNormal1, UserTick, Profile } from 'iconsax-react';
import { useIncidentModalContext } from './IncidentModalContext';
import { assignIncidentToAgentService } from '../service/incident_service';
import { getOrganisationsService } from '../../organisations/service/organisation_service';
import { getOrganisationMembersService } from '../../agents/service/members_service';
import { idSeed } from '../../../utils/idSeed';

const AVATAR_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#22C55E',
  '#3AA2DD', '#1E40AF', '#A855F7', '#EC4899',
  '#10B981', '#6366F1'
];

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');

export const IncidentAssignModal = () => {
  const {
    assignModal,
    assignClosing,
    isAssigning,
    setIsAssigning,
    assignAlert,
    setAssignAlert,
    closeAssignModal,
    mutateIncidents
  } = useIncidentModalContext();

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deadline, setDeadline] = useState('');

  // Réinitialiser la deadline quand l'agent change ou est désélectionné
  React.useEffect(() => {
    setDeadline('');
  }, [selectedAgent]);

  // 1. Charger la liste des organisations
  const { data: rawOrgs } = useSWR(
    assignModal.open ? 'organisation_list' : null,
    getOrganisationsService
  );
  const organisationsList = rawOrgs || [];

  // 2. Charger les membres/agents pour toutes les organisations
  const { data: fetchedAgents, isLoading: loadingAgents } = useSWR(
    assignModal.open && organisationsList.length > 0 ? ['assign_agents_list', organisationsList] : null,
    async ([, orgsList]) => {
      const list = [];
      const seenUserIds = new Set();

      for (const org of orgsList) {
        try {
          const res = await getOrganisationMembersService(org.id);
          const members = res.results || res || [];
          members.forEach((m) => {
            // Éviter les doublons si un utilisateur est dans plusieurs orgs
            const uniqueKey = `${m.id}-${org.id}`;
            if (!seenUserIds.has(uniqueKey)) {
              seenUserIds.add(uniqueKey);
              let roleLabel = 'Membre';
              if (m.org_role === 'org_admin') roleLabel = 'Administrateur';
              if (m.org_role === 'field_agent') roleLabel = 'Terrain';
              if (m.org_role === 'bureau_agent') roleLabel = 'Bureau';

              const fullName = `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email;

              list.push({
                id: m.id,
                firstName: m.first_name || '',
                lastName: m.last_name || '',
                fullName,
                email: m.email,
                role: roleLabel,
                orgId: org.id,
                orgName: org.name,
                avatarColor: AVATAR_COLORS[idSeed(m.id) % AVATAR_COLORS.length] || '#3AA2DD'
              });
            }
          });
        } catch (err) {
          console.error(`[IncidentAssignModal] Erreur chargement agents org ${org.id}:`, err);
        }
      }
      return list;
    }
  );

  const agents = fetchedAgents || [];

  // Filtrer les agents selon la recherche
  const filteredAgents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.orgName.toLowerCase().includes(q)
    );
  }, [agents, searchQuery]);

  if (!assignModal.open || !assignModal.incident) return null;

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!selectedAgent) return;

    setIsAssigning(true);
    setAssignAlert({ type: null, message: null });

    const incident = assignModal.incident;
    // Si l'incident est déclaré ('declared'), on le passe à 'taken_into_account' (Pris en compte)
    const nextEtat = incident.etat === 'declared' ? 'taken_into_account' : incident.etat;

    try {
      await assignIncidentToAgentService(incident.id, {
        taken_by: selectedAgent.id,
        etat: nextEtat,
        deadline: deadline || null
      });

      setAssignAlert({
        type: 'success',
        message: `L'incident a été assigné avec succès à ${selectedAgent.fullName}.`
      });

      // Rafraîchir les données de la table
      if (mutateIncidents) {
        await mutateIncidents();
      }

      // Fermer la modale après un délai
      setTimeout(() => {
        closeAssignModal();
        setSelectedAgent(null);
        setSearchQuery('');
        setDeadline('');
      }, 1500);
    } catch (err) {
      console.error('[IncidentAssignModal] Erreur lors de l\'assignation:', err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Une erreur est survenue lors de l'assignation de l'incident.";
      setAssignAlert({
        type: 'danger',
        message: msg
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleOverlayClick = () => {
    if (isAssigning || assignAlert.type === 'success') return;
    closeAssignModal();
    setSelectedAgent(null);
    setSearchQuery('');
    setDeadline('');
  };

  const panelClass = [
    'am-offcanvas-panel',
    assignClosing ? 'am-offcanvas-panel--closing' : '',
  ].filter(Boolean).join(' ');

  const backdropClass = [
    'am-offcanvas-backdrop',
    assignClosing ? 'am-offcanvas-backdrop--closing' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={backdropClass} onClick={handleOverlayClick} />
      <div
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-label="Assigner un agent"
      >
        <div className="am-offcanvas-header">
          <div>
            <h5 className="am-offcanvas-title">
              Assigner un agent
            </h5>
            <p className="text-muted" style={{ fontSize: '13px', margin: '4px 0 0 0' }}>
              {assignModal.incident.title || 'Sans titre'}
            </p>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={handleOverlayClick}
            aria-label="Fermer"
            disabled={isAssigning || assignAlert.type === 'success'}
          />
        </div>

        <form onSubmit={handleConfirmAssign} id="assign-incident-form" className="am-offcanvas-body" noValidate>
          {assignAlert.message && (
            <div className={`am-alert am-alert--${assignAlert.type === 'success' ? 'success' : 'danger'}`} role="alert" style={{ width: '100%' }}>
              {assignAlert.type === 'success' ? (
                <TickCircle size={18} variant="Bold" color="#22C55E" />
              ) : (
                <CloseCircle size={18} variant="Bold" color="#EF4444" />
              )}
              <span className="am-alert__message" style={{ textAlign: 'left' }}>{assignAlert.message}</span>
            </div>
          )}

          {/* Barre de recherche d'agent */}
          <div className="am-field">
            <label className="am-label" htmlFor="agent-search">
              Rechercher un collaborateur
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <SearchNormal1
                size={16}
                variant="Linear"
                color="#6C7278"
                style={{ position: 'absolute', left: '12px' }}
              />
              <input
                id="agent-search"
                type="text"
                className="am-input"
                placeholder="Tapez le nom, email ou organisation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* Liste de sélection des agents */}
          <div className="am-field">
            <label className="am-label">
              Sélectionner l'agent à assigner
            </label>

            {loadingAgents ? (
              <div className="d-flex flex-column align-items-center justify-content-center p-4 border rounded bg-light">
                <div className="spinner-border text-primary" role="status" style={{ width: '1.5rem', height: '1.5rem' }} />
                <span className="text-muted mt-2" style={{ fontSize: '12px' }}>Chargement des agents...</span>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="d-flex flex-column align-items-center justify-content-center p-4 border rounded bg-light text-center">
                <Profile size={32} variant="Linear" color="#9CA3AF" />
                <span className="fw-medium mt-2" style={{ fontSize: '13px', color: '#6B7280' }}>Aucun agent trouvé</span>
                <span className="text-muted" style={{ fontSize: '11px' }}>Assurez-vous que des agents sont enregistrés.</span>
              </div>
            ) : (
              <div className="incidents-agents-list">
                {Object.entries(
                  filteredAgents.reduce((acc, curr) => {
                    if (!acc[curr.orgName]) acc[curr.orgName] = [];
                    acc[curr.orgName].push(curr);
                    return acc;
                  }, {})
                ).map(([orgName, orgAgents]) => (
                  <div key={orgName} className="incidents-org-group">
                    <div className="incidents-org-name">{orgName}</div>
                    {orgAgents.map((agent) => {
                      const isSelected = selectedAgent?.id === agent.id;
                      return (
                        <button
                          key={agent.id}
                          type="button"
                          className={`incidents-agent-item ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => setSelectedAgent((prev) => prev?.id === agent.id ? null : agent)}
                        >
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: agent.avatarColor,
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600',
                              fontSize: '13px',
                              marginRight: '12px',
                              flexShrink: 0
                            }}
                          >
                            {getInitials(agent.fullName)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.fullName}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {agent.role} &bull; {agent.email}
                            </div>
                          </div>
                          {isSelected && (
                            <UserTick
                              size={18}
                              variant="Bold"
                              color="#3AA2DD"
                              style={{ marginLeft: '12px', flexShrink: 0 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date limite / Deadline */}
          {selectedAgent && (
            <div className="am-field animate-fade-in" style={{ marginTop: 'var(--spacing-4)' }}>
              <label className="am-label" htmlFor="assign-deadline">
                Date limite (Deadline)
              </label>
              <input
                id="assign-deadline"
                type="datetime-local"
                className="am-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
          )}
        </form>

        <div className="am-offcanvas-footer">
          <button
            type="button"
            className="am-btn am-btn--secondary"
            onClick={handleOverlayClick}
            disabled={isAssigning || assignAlert.type === 'success'}
          >
            Annuler
          </button>
          <button
            type="submit"
            form="assign-incident-form"
            className="am-btn am-btn--primary"
            disabled={!selectedAgent || isAssigning || assignAlert.type === 'success'}
          >
            {isAssigning && <span className="am-spinner" aria-hidden="true" />}
            {isAssigning ? 'Assignation...' : 'Assigner l\'agent'}
          </button>
        </div>
      </div>
    </>
  );
};

export default IncidentAssignModal;
