import React, { useState } from 'react';
import { useCollaborationDetail } from '../context/CollaborationDetailContext';
import {
  CloseCircle,
  Crown1,
  SearchNormal1,
  Buildings2,
  Add,
  People,
  Edit2,
  TickCircle
} from 'iconsax-react';
import { suggestCollaborationPartnerService } from '../service/collab_detail_service';

export const SuggestOrgModal = () => {
  const {
    collaboration,
    showSuggestModal,
    suggestModalClosing,
    closeSuggestModal,
    suggestSearch,
    setSuggestSearch,
    suggestedOrgs,
    toggleSuggestedOrg,
    updateSuggestedRole,
    updateSuggestedComment,
    suggestAlert,
    setSuggestAlert,
    suggestSubmitting,
    handleSuggestSubmit,
    ROLE_OPTIONS,
    AVAILABLE_ORGS
  } = useCollaborationDetail();

  const getOrgInitials = (org) => {
    if (org.acronym) return org.acronym.substring(0, 2).toUpperCase();
    return org.name ? org.name.substring(0, 2).toUpperCase() : 'OR';
  };

  const getOrgColor = (org) => {
    return org.primary_color || '#3AA2DD';
  };

  const [showDropdown, setShowDropdown] = useState(false);

  if (!showSuggestModal) return null;


  return (
    <div
      className={`tasks-modal-overlay ${suggestModalClosing ? 'closing' : ''}`}
      onClick={closeSuggestModal}
    >
      <aside
        className={`tasks-modal ${suggestModalClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <header className="tasks-modal-header">
          <div>
            <h3 className="tasks-modal-title">
              <Crown1
                size={20}
                variant="Bold"
                color="#F59E0B"
                style={{ marginRight: 6, verticalAlign: 'middle' }}
              />
              Suggérer des organisations
            </h3>
            <p className="tasks-modal-subtitle">
              {collaboration?.title}
            </p>
          </div>
          <button
            type="button"
            className="tasks-modal-close"
            onClick={closeSuggestModal}
          >
            <CloseCircle size={24} variant="Linear" color="#1A1C1E" />
          </button>
        </header>

        <div className="tasks-modal-body">
          {/* Alerte de retour */}
          {suggestAlert && (
            <div
              className={`alert alert-${suggestAlert.type}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '8px', marginBottom: '12px',
                fontSize: '13px', gap: '8px',
                backgroundColor: suggestAlert.type === 'success' ? 'rgba(34,197,94,0.1)' : suggestAlert.type === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${suggestAlert.type === 'success' ? '#22c55e' : suggestAlert.type === 'warning' ? '#f59e0b' : '#ef4444'}`,
                color: suggestAlert.type === 'success' ? '#15803d' : suggestAlert.type === 'warning' ? '#92400e' : '#b91c1c'
              }}
            >
              <span>{suggestAlert.message}</span>
              <button
                type="button"
                onClick={() => setSuggestAlert(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', fontWeight: '700', color: 'inherit' }}
              >×</button>
            </div>
          )}
          {/* Bandeau d'info */}
          <div className="suggest-info-banner">
            <Crown1 size={18} variant="Bold" color="#F59E0B" />
            <span>
              En tant que <strong>leader</strong>, vous pouvez suggérer d'autres
              organisations et leur attribuer un rôle.
            </span>
          </div>

          {/* Recherche */}
          <div className="suggest-section">
            <label className="suggest-section-label">
              Rechercher une organisation
            </label>
            <div className="suggest-search-wrapper">
              <div className="suggest-search">
                <SearchNormal1 size={16} variant="Linear" color="#6C7278" />
                <input
                  type="text"
                  className="suggest-search-input"
                  placeholder="Tapez le nom d'une organisation..."
                  value={suggestSearch}
                  onChange={(e) => { setSuggestSearch(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                />
                {suggestSearch && (
                  <button
                    type="button"
                    className="suggest-search-clear"
                    onClick={() => { setSuggestSearch(''); setShowDropdown(false); }}
                  >
                    <CloseCircle size={16} variant="Linear" color="#6C7278" />
                  </button>
                )}
              </div>

              {/* Résultats déroulants */}
              {showDropdown && <div className="suggest-search-results">
                {AVAILABLE_ORGS.filter(o =>
                  o.name.toLowerCase().includes(suggestSearch.toLowerCase()) &&
                  !suggestedOrgs.find(s => s.id === o.id)
                ).length === 0 ? (
                  <div className="suggest-search-empty">
                    <Buildings2 size={20} variant="Linear" color="#9CA3AF" />
                    <span>Aucune organisation disponible</span>
                  </div>
                ) : (
                  AVAILABLE_ORGS
                    .filter(o =>
                      o.name.toLowerCase().includes(suggestSearch.toLowerCase()) &&
                      !suggestedOrgs.find(s => s.id === o.id)
                    )
                    .map(org => (
                      <button
                        type="button"
                        key={org.id}
                        className="suggest-search-result"
                        onClick={() => toggleSuggestedOrg(org)}
                      >
                        <div
                          className="suggest-org-avatar"
                          style={{ backgroundColor: getOrgColor(org) }}
                        >
                          {getOrgInitials(org)}
                        </div>
                        <span className="suggest-org-name">{org.name}</span>
                        <Add size={18} variant="Linear" color="#3AA2DD" />
                      </button>
                    ))
                )}
              </div>}
            </div>
          </div>

          {/* Organisations sélectionnées */}
          <div className="suggest-section">
            <label className="suggest-section-label">
              <People size={16} variant="Bold" color="#3AA2DD" />
              Sélectionnées ({suggestedOrgs.length})
            </label>

            {suggestedOrgs.length === 0 ? (
              <div className="suggest-empty">
                <People size={28} variant="Linear" color="#9CA3AF" />
                <p>Aucune organisation sélectionnée pour le moment.</p>
              </div>
            ) : (
              <div className="suggest-roles-list">
                {suggestedOrgs.map(org => {
                  const currentRole = ROLE_OPTIONS.find(r => r.id === org.role);
                  return (
                    <div key={org.id} className="suggest-role-row">
                      <div className="suggest-role-row-header">
                        <div className="suggest-role-org">
                          <div
                            className="suggest-org-avatar"
                            style={{ backgroundColor: getOrgColor(org) }}
                          >
                            {getOrgInitials(org)}
                          </div>
                          <span className="suggest-org-name">{org.name}</span>
                        </div>
                        <button
                          type="button"
                          className="suggest-remove-btn"
                          onClick={() => toggleSuggestedOrg(org)}
                          title="Retirer"
                        >
                          <CloseCircle size={18} variant="Linear" color="#EF4444" />
                        </button>
                      </div>

                      <div className="suggest-role-attribution">
                        <span className="suggest-role-attribution-label">Rôle :</span>
                        <div className="role-options">
                          {ROLE_OPTIONS.map(role => {
                            const RoleIcon = role.icon;
                            const isRoleSel = org.role === role.id;
                            return (
                              <button
                                type="button"
                                key={role.id}
                                className={`role-option ${isRoleSel ? 'is-selected' : ''}`}
                                onClick={() => updateSuggestedRole(org.id, role.id)}
                                style={
                                  isRoleSel
                                    ? { borderColor: role.color, color: role.color }
                                    : {}
                                }
                              >
                                <RoleIcon
                                  size={12}
                                  variant={isRoleSel ? 'Bold' : 'Linear'}
                                  color={isRoleSel ? role.color : '#6C7278'}
                                />
                                {role.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {currentRole && (
                        <p className="suggest-role-desc">
                          {currentRole.description}
                        </p>
                      )}

                      <div className="suggest-role-comment">
                        <label className="suggest-role-attribution-label">
                          <Edit2 size={12} variant="Bold" color="#3AA2DD" />
                          Commentaire (optionnel)
                        </label>
                        <textarea
                          className="suggest-textarea"
                          rows={2}
                          value={org.comment || ''}
                          onChange={(e) => updateSuggestedComment(org.id, e.target.value)}
                          placeholder="Pourquoi suggérez-vous cette organisation ?"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <footer className="tasks-modal-footer">
          <div className="tasks-footer-actions">
            <button
              type="button"
              className="tasks-footer-close-btn"
              onClick={closeSuggestModal}
            >
              <CloseCircle size={16} variant="Linear" color="currentColor" />
              Annuler
            </button>
            <button
              type="button"
              className="tasks-close-collab-btn"
              onClick={handleSuggestSubmit}
              disabled={suggestedOrgs.length === 0 || suggestSubmitting}
              style={{ opacity: suggestedOrgs.length === 0 || suggestSubmitting ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {suggestSubmitting ? (
                <>
                  <svg style={{ animation: 'spin 0.8s linear infinite', width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <TickCircle size={16} variant="Bold" color="#FFFFFF" />
                  Envoyer les suggestions
                </>
              )}
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
};

export default SuggestOrgModal;
