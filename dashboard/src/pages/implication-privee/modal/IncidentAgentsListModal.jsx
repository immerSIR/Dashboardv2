import React from 'react';
import { useImplicationModalContext } from '../ImplicationModalContext';
import { CloseCircle, Profile, Edit2 } from 'iconsax-react';

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');

export const IncidentAgentsListModal = () => {
  const {
    agentsModal,
    agentsClosing,
    closeAgentsModal,
    assignments,
    openAssignModal
  } = useImplicationModalContext();

  if (!agentsModal.open || !agentsModal.incident) return null;

  const currentIncident = agentsModal.incident;
  const assignedAgents = assignments[currentIncident.id] || [];

  const handleOverlayClick = () => {
    closeAgentsModal();
  };

  const handleOpenEditModal = () => {
    closeAgentsModal();
    // Ouvrir le modal d'assignation pour ce même incident après la fermeture du premier modal
    setTimeout(() => {
      openAssignModal(currentIncident);
    }, 300);
  };

  const panelClass = [
    'am-offcanvas-panel',
    agentsClosing ? 'am-offcanvas-panel--closing' : '',
  ].filter(Boolean).join(' ');

  const backdropClass = [
    'am-offcanvas-backdrop',
    agentsClosing ? 'am-offcanvas-backdrop--closing' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={backdropClass} onClick={handleOverlayClick} />
      <div
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-label="Liste des agents assignés"
      >
        <div className="am-offcanvas-header">
          <div>
            <h5 className="am-offcanvas-title">
              Équipe sur le terrain
            </h5>
            <p className="text-muted" style={{ fontSize: '13px', margin: '4px 0 0 0' }}>
              {currentIncident.title || 'Sans titre'}
            </p>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={handleOverlayClick}
            aria-label="Fermer"
          />
        </div>

        <div className="am-offcanvas-body">
          {assignedAgents.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center p-5 border rounded bg-light text-center" style={{ gap: '12px' }}>
              <Profile size={48} variant="Linear" color="#9CA3AF" />
              <div>
                <span className="fw-semibold d-block" style={{ fontSize: '14px', color: '#4B5563' }}>
                  Aucun agent sur le terrain
                </span>
                <span className="text-muted d-block mt-1" style={{ fontSize: '12px' }}>
                  Aucun collaborateur n'est assigné à cet incident pour le moment.
                </span>
              </div>
              <button
                type="button"
                className="am-btn am-btn--primary mt-2"
                onClick={handleOpenEditModal}
                style={{ minHeight: '38px', fontSize: '13px' }}
              >
                <Edit2 size={14} variant="Linear" color="#FFFFFF" />
                Assigner des agents
              </button>
            </div>
          ) : (
            <div className="incidents-agents-list">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Collaborateur(s) actif(s) ({assignedAgents.length})
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleOpenEditModal}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '34px', padding: '0 12px', fontSize: '12px' }}
                >
                  <Edit2 size={14} variant="Linear" color="var(--color-primary)" />
                  Modifier l'équipe
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {assignedAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="incidents-agent-item"
                    style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: agent.avatarColor,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '14px',
                        marginRight: '12px',
                        flexShrink: 0
                      }}
                    >
                      {getInitials(agent.fullName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {agent.fullName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {agent.role} &bull; {agent.orgName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {agent.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="am-offcanvas-footer">
          <button
            type="button"
            className="am-btn am-btn--secondary w-full"
            onClick={handleOverlayClick}
          >
            Fermer
          </button>
        </div>
      </div>
    </>
  );
};

export default IncidentAgentsListModal;
