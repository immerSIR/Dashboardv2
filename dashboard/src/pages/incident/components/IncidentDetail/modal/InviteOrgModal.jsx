import React from 'react';
import { useIncidentDetail } from '../IncidentDetailContext';
import {
  CloseCircle,
  Buildings2,
  SearchNormal1,
  Add,
  People,
  UserAdd
} from 'iconsax-react';

export const InviteOrgModal = () => {
  const {
    joinOpen,
    joinClosing,
    closeJoinModal,
    safeIncident,
    handleJoinSubmit,
    alertMessage,
    alertType,
    setAlertMessage,
    motif,
    setMotif,
    selfRole,
    setSelfRole,
    orgSearch,
    setOrgSearch,
    showOrgDropdown,
    setShowOrgDropdown,
    isLoadingOrgs,
    filteredOrgs,
    availableOrgs,
    addInvitedOrg,
    invitedOrgs,
    removeInvitedOrg,
    updateOrgRole,
    updateOrgComment,
    isSubmitting,
    ROLE_OPTIONS,
    ORG_ROLE_OPTIONS
  } = useIncidentDetail();

  if (!joinOpen) return null;

  return (
    <div
      className={`join-modal-overlay ${joinClosing ? 'closing' : ''}`}
      onClick={closeJoinModal}
    >
      <aside
        className={`join-modal ${joinClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Rejoindre l'action"
      >
        <header className="join-modal-header">
          <div>
            <h3 className="join-modal-title">
              {safeIncident.isOwner ? 'Inviter des organisations' : "Rejoindre l'action"}
            </h3>
            <p className="join-modal-subtitle">{safeIncident.title}</p>
          </div>
          <button
            type="button"
            className="join-modal-close"
            onClick={closeJoinModal}
            aria-label="Fermer"
          >
            <CloseCircle size={24} variant="Linear" color="var(--color-text-primary)" />
          </button>
        </header>

        <form className="join-modal-form" onSubmit={handleJoinSubmit}>
          <div className="join-modal-body">
            {/* Alerte Bootstrap */}
            {alertMessage && (
              <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert" style={{ marginBottom: 'var(--spacing-4)' }}>
                {alertMessage}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setAlertMessage(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {!safeIncident.isOwner && (
              <>
                {/* Si l'incident est déjà pris en charge, demander motif et rôle */}
                {safeIncident?.etat !== 'declared' ? (
                  <>
                    <label htmlFor="join-motif" className="join-modal-label">
                      Motif <span className="required">*</span>
                    </label>
                    <p className="join-modal-help">
                      Expliquez pourquoi vous souhaitez rejoindre ce projet et ce
                      que vous pouvez apporter.
                    </p>
                    <textarea
                      id="join-motif"
                      className="join-modal-textarea"
                      rows={6}
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                      placeholder="Ex : Je suis ingénieure environnementale et je souhaite contribuer..."
                      required
                    />

                    {/* Sélecteur de rôle pour soi-même */}
                    <div className="self-role-section">
                      <label className="join-modal-label">
                        Rôle souhaité <span className="required">*</span>
                      </label>
                      <p className="join-modal-help">
                        Choisissez le rôle que vous souhaitez avoir dans ce projet.
                      </p>
                      <div className="role-options">
                        {ROLE_OPTIONS.map((role) => {
                          const RoleIcon = role.icon;
                          const isSelected = selfRole === role.id;
                          return (
                            <button
                              type="button"
                              key={role.id}
                              className={`role-option ${isSelected ? 'is-selected' : ''}`}
                              onClick={() => setSelfRole(role.id)}
                              style={isSelected ? { borderColor: role.color, color: role.color } : {}}
                              title={role.description}
                            >
                              <RoleIcon
                                size={14}
                                variant={isSelected ? 'Bold' : 'Linear'}
                                color={isSelected ? role.color : '#6C7278'}
                              />
                              {role.label}
                            </button>
                          );
                        })}
                      </div>
                      {(() => {
                        const role = ROLE_OPTIONS.find((r) => r.id === selfRole);
                        return role ? (
                          <p className="invited-org-role-desc">{role.description}</p>
                        ) : null;
                      })()}
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: 'var(--spacing-5)',
                    backgroundColor: 'var(--color-background)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    marginBottom: 'var(--spacing-5)'
                  }}>
                    <p style={{ margin: 0, color: 'var(--color-info)', fontSize: 'var(--font-size-body)', lineHeight: '1.6' }}>
                      <strong>Prendre en charge cet incident</strong><br />
                      En confirmant, vous deviendrez le <strong>leader</strong> de cet incident et serez responsable de sa gestion et de sa résolution.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Section Inviter des organisations - uniquement pour le propriétaire */}
            {safeIncident.isOwner && (
              <div className={`invite-orgs-section ${safeIncident.isOwner ? 'is-owner' : ''}`}>
                <div className="invite-orgs-header">
                  <Buildings2 size={18} variant="Bold" color="var(--color-primary)" />
                  <div>
                    <label className="join-modal-label">
                      Inviter des organisations
                    </label>
                    <p className="join-modal-help">
                      Invitez d'autres organisations à participer et attribuez-leur un rôle.
                    </p>
                  </div>
                </div>

                {/* Champ recherche */}
                <div className="invite-orgs-search-wrapper">
                  <div className="invite-orgs-search">
                    <SearchNormal1 size={16} variant="Linear" color="var(--color-text-secondary)" />
                    <input
                      type="text"
                      className="invite-orgs-search-input"
                      placeholder="Rechercher une organisation..."
                      value={orgSearch}
                      onChange={(e) => {
                        setOrgSearch(e.target.value);
                        setShowOrgDropdown(true);
                      }}
                      onFocus={() => setShowOrgDropdown(true)}
                    />
                    {orgSearch && (
                      <button
                        type="button"
                        className="invite-orgs-clear"
                        onClick={() => setOrgSearch('')}
                      >
                        <CloseCircle size={16} variant="Linear" color="var(--color-text-secondary)" />
                      </button>
                    )}
                  </div>

                  {showOrgDropdown && (
                    <div className="invite-orgs-dropdown">
                      {isLoadingOrgs ? (
                        <div className="invite-orgs-empty">
                          Chargement des organisations...
                        </div>
                      ) : filteredOrgs.length > 0 ? (
                        filteredOrgs.map((org) => (
                          <button
                            type="button"
                            key={org.id}
                            className="invite-orgs-option"
                            onClick={() => addInvitedOrg(org)}
                          >
                            <div
                              className="invite-orgs-avatar"
                              style={{ backgroundColor: org.color }}
                            >
                              {org.initials}
                            </div>
                            <span className="invite-orgs-option-name">{org.name}</span>
                            <Add size={18} variant="Linear" color="var(--color-primary)" />
                          </button>
                        ))
                      ) : (
                        <div className="invite-orgs-empty">
                          {availableOrgs.length === 0
                            ? 'Aucune organisation disponible'
                            : 'Aucune organisation trouvée'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Liste des organisations invitées */}
                {invitedOrgs.length > 0 && (
                  <div className="invite-orgs-list">
                    <div className="invite-orgs-list-label">
                      {invitedOrgs.length} organisation{invitedOrgs.length > 1 ? 's' : ''} invitée{invitedOrgs.length > 1 ? 's' : ''}
                    </div>
                    {invitedOrgs.map((org) => {
                      const currentRole = ROLE_OPTIONS.find((r) => r.id === org.role);
                      return (
                        <div key={org.id} className="invited-org-card">
                          <div className="invited-org-info">
                            <div
                              className="invited-org-avatar"
                              style={{ backgroundColor: org.color }}
                            >
                              {org.initials}
                            </div>
                            <div className="invited-org-name">{org.name}</div>
                            <button
                              type="button"
                              className="invited-org-remove"
                              onClick={() => removeInvitedOrg(org.id)}
                              aria-label="Retirer"
                            >
                              <CloseCircle size={18} variant="Linear" color="var(--color-danger)" />
                            </button>
                          </div>

                          <div className="invited-org-roles">
                            <span className="invited-org-role-label">Rôle :</span>
                            <div className="role-options">
                              {ORG_ROLE_OPTIONS.map((role) => {
                                const RoleIcon = role.icon;
                                const isSelected = org.role === role.id;
                                return (
                                  <button
                                    type="button"
                                    key={role.id}
                                    className={`role-option ${isSelected ? 'is-selected' : ''}`}
                                    onClick={() => updateOrgRole(org.id, role.id)}
                                    style={isSelected ? { borderColor: role.color, color: role.color } : {}}
                                    title={role.description}
                                  >
                                    <RoleIcon
                                      size={14}
                                      variant={isSelected ? 'Bold' : 'Linear'}
                                      color={isSelected ? role.color : '#6C7278'}
                                    />
                                    {role.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="invited-org-comment" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="invited-org-role-label" style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Motif de l'invitation / Justification :</span>
                            <input
                              type="text"
                              className="invite-orgs-search-input"
                              style={{ width: '100%', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)' }}
                              placeholder="Ex: Expert en biodiversité pour aider sur la zone A..."
                              value={org.comment || ''}
                              onChange={(e) => updateOrgComment(org.id, e.target.value)}
                            />
                          </div>

                          {currentRole && (
                            <p className="invited-org-role-desc">
                              {currentRole.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <footer className="join-modal-footer">
            <button
              type="button"
              className="join-btn-secondary"
              onClick={closeJoinModal}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="join-btn-primary"
              disabled={
                isSubmitting ||
                (safeIncident.isOwner
                  ? invitedOrgs.length === 0
                  : safeIncident?.etat !== 'declared' && !motif.trim())
              }
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid var(--color-surface)',
                    borderTopColor: 'transparent',
                    borderRadius: 'var(--radius-full)',
                    animation: 'spin 0.6s linear infinite'
                  }} />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <UserAdd size={16} variant="Bold" color="var(--color-surface)" />
                  {safeIncident.isOwner
                    ? 'Envoyer les invitations'
                    : safeIncident?.etat === 'declared'
                      ? 'Prendre en charge'
                      : 'Demander à rejoindre'
                  }
                </>
              )}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
};

export default InviteOrgModal;
