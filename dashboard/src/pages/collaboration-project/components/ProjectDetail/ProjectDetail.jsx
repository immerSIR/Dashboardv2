import React, { useState } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  ArrowLeft2,
  Location,
  Calendar,
  Category2,
  TickCircle,
  Briefcase,
  VideoSquare,
  Map as MapIcon,
  UserAdd,
  CloseCircle,
  Crown1,
  People,
  Eye,
  Add,
  SearchNormal1,
  Buildings2
} from 'iconsax-react';
import './project-detail.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Liste des organisations disponibles pour invitation
const AVAILABLE_ORGS = [
  { id: 'org-1', name: 'Croix-Rouge Sénégalaise', initials: 'CR', color: '#EF4444' },
  { id: 'org-2', name: 'OCHA', initials: 'OC', color: '#3AA2DD' },
  { id: 'org-3', name: 'PNUD Sénégal', initials: 'PN', color: '#22C55E' },
  { id: 'org-4', name: 'UNICEF', initials: 'UN', color: '#1E40AF' },
  { id: 'org-5', name: 'Médecins Sans Frontières', initials: 'MS', color: '#F59E0B' },
  { id: 'org-6', name: 'Action Contre la Faim', initials: 'AF', color: '#A855F7' },
  { id: 'org-7', name: 'OXFAM', initials: 'OX', color: '#10B981' },
  { id: 'org-8', name: 'Care International', initials: 'CI', color: '#EC4899' },
  { id: 'org-9', name: 'Save the Children', initials: 'SC', color: '#F97316' },
  { id: 'org-10', name: 'World Vision', initials: 'WV', color: '#6366F1' }
];

const ROLE_OPTIONS = [
  {
    id: 'leader',
    label: 'Leader',
    description: 'Pilote l\'action et coordonne les autres organisations',
    icon: Crown1,
    color: '#F59E0B'
  },
  {
    id: 'contributeur',
    label: 'Contributeur',
    description: 'Participe activement à la réalisation des tâches',
    icon: People,
    color: '#3AA2DD'
  },
  {
    id: 'observateur',
    label: 'Observateur',
    description: 'Suit l\'avancement sans participer directement',
    icon: Eye,
    color: '#6C7278'
  }
];

export const ProjectDetail = ({ project, onBack }) => {
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinClosing, setJoinClosing] = useState(false);
  const [motif, setMotif] = useState('');
  const [invitedOrgs, setInvitedOrgs] = useState([]);
  const [orgSearch, setOrgSearch] = useState('');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [selfRole, setSelfRole] = useState('contributeur');

  const openJoinModal = () => {
    setJoinClosing(false);
    setJoinOpen(true);
  };

  const closeJoinModal = () => {
    setJoinClosing(true);
    setTimeout(() => {
      setJoinOpen(false);
      setJoinClosing(false);
      setMotif('');
      setInvitedOrgs([]);
      setOrgSearch('');
      setShowOrgDropdown(false);
      setSelfRole('contributeur');
    }, 280);
  };

  const addInvitedOrg = (org) => {
    if (invitedOrgs.find((o) => o.id === org.id)) return;
    setInvitedOrgs((prev) => [...prev, { ...org, role: 'contributeur' }]);
    setOrgSearch('');
    setShowOrgDropdown(false);
  };

  const removeInvitedOrg = (orgId) => {
    setInvitedOrgs((prev) => prev.filter((o) => o.id !== orgId));
  };

  const updateOrgRole = (orgId, role) => {
    setInvitedOrgs((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, role } : o))
    );
  };

  const filteredOrgs = AVAILABLE_ORGS.filter(
    (org) =>
      !invitedOrgs.find((o) => o.id === org.id) &&
      org.name.toLowerCase().includes(orgSearch.toLowerCase())
  );

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    // TODO: envoyer au backend
    console.log('Rejoindre projet', project?.id, {
      motif,
      selfRole,
      invitedOrgs
    });
    closeJoinModal();
  };

  if (!project) {
    return (
      <section className="project-detail empty">
        <div className="project-detail-empty">
          <Briefcase size={48} variant="Linear" color="#9CA3AF" />
          <p>Sélectionnez un projet dans la liste pour voir ses détails</p>
        </div>
      </section>
    );
  }

  return (
    <section className="project-detail">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-title-block">
          <button
            type="button"
            className="detail-back-btn"
            onClick={onBack}
            aria-label="Retour à la liste"
          >
            <ArrowLeft2 size={20} variant="Linear" color="#1A1C1E" />
          </button>
          <h2 className="detail-title">{project.title}</h2>
          <button
            type="button"
            className="btn-join-action"
            onClick={openJoinModal}
          >
            <UserAdd size={16} variant="Bold" color="#FFFFFF" />
            {project.isOwner ? 'Inviter des organisations' : "Rejoindre l'action"}
          </button>
        </div>

        <div className="project-badges">
          {project.badges.map((badge, idx) => (
            <span
              key={idx}
              className={`project-badge project-badge-${badge.variant}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <div className="detail-meta">
          <div className="detail-meta-item">
            <Location size={16} variant="Bold" color="#6C7278" />
            <span>{project.location}</span>
          </div>
          <div className="detail-meta-item">
            <Calendar size={16} variant="Bold" color="#6C7278" />
            <span>
              {project.startDate} → {project.endDate}
            </span>
          </div>
          <div className="detail-meta-item">
            <Category2 size={16} variant="Bold" color="#6C7278" />
            <span>{project.type}</span>
          </div>
        </div>
      </div>

      {/* Zone supérieure scrollable (cover + objectifs) */}
      <div className="project-detail-top">
        <div className="detail-map-row">
          {/* Cover image (équivalent map) */}
          <div className="detail-map">
            <div
              className="detail-map-image"
              style={{ backgroundImage: `url(${project.image})` }}
            >
              <div className="map-fake-bg"></div>
              <div className="map-overlay-bottom">
                <span className="map-overlay-label">À PROPOS DU PROJET</span>
                <h4 className="map-overlay-title">{project.location}</h4>
                <span className="map-overlay-tag">{project.type}</span>
              </div>
            </div>
          </div>

          {/* Side panel - Objectifs (équivalent Shared Assets) */}
          <div className="detail-assets">
            <h4 className="detail-assets-title">OBJECTIFS CLÉS</h4>
            <div className="detail-assets-list">
              {project.objectives.map((obj, idx) => (
                <div key={idx} className="asset-item">
                  <div className="asset-icon">
                    <TickCircle size={18} variant="Bold" color="#22C55E" />
                  </div>
                  <div className="asset-info">
                    <div className="asset-name">{obj}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="detail-description">
          <h4 className="detail-section-label">DESCRIPTION</h4>
          <p>{project.fullDescription}</p>
        </div>

        {/* Video */}
        {project.video && (
          <div className="detail-video">
            <h4 className="detail-section-label">
              <VideoSquare size={16} variant="Bold" color="#3AA2DD" />
              VIDÉO DE PRÉSENTATION
            </h4>
            <div className="detail-video-frame">
              <iframe
                src={project.video}
                title={`Vidéo - ${project.title}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Map / Geolocation */}
        {project.coordinates && (
          <div className="detail-geo">
            <h4 className="detail-section-label">
              <MapIcon size={16} variant="Bold" color="#3AA2DD" />
              GÉOLOCALISATION
            </h4>
            <div className="detail-geo-info">
              <Location size={16} variant="Bold" color="#3AA2DD" />
              <span>{project.location}</span>
              <span className="detail-geo-coords">
                {project.coordinates.lat.toFixed(4)}°N,{' '}
                {project.coordinates.lng.toFixed(4)}°E
              </span>
            </div>
            <div className="detail-geo-map">
              <Map
                initialViewState={{
                  longitude: project.coordinates.lng,
                  latitude: project.coordinates.lat,
                  zoom: 11
                }}
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
              >
                <Marker
                  longitude={project.coordinates.lng}
                  latitude={project.coordinates.lat}
                  anchor="bottom"
                >
                  <div className="project-map-marker">
                    <Location size={28} variant="Bold" color="#EF4444" />
                  </div>
                </Marker>
              </Map>
            </div>
          </div>
        )}

        {/* Participating orgs */}
        <div className="detail-orgs">
          <h4 className="detail-section-label">ORGANISATIONS PARTICIPANTES</h4>
          <div className="detail-orgs-list">
            {project.participants.map((p, idx) => (
              <div key={idx} className="org-chip">
                <div
                  className="org-chip-avatar"
                  style={{ backgroundColor: p.color }}
                >
                  {p.initials.slice(0, 2)}
                </div>
                <span>{p.name}</span>
              </div>
            ))}
            {project.extraParticipants > 0 && (
              <div className="org-chip">
                <div className="org-chip-avatar org-chip-extra">
                  +{project.extraParticipants}
                </div>
                <span>Autres</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Rejoindre l'action - slide depuis la droite */}
      {joinOpen && (
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
                  {project.isOwner ? 'Inviter des organisations' : "Rejoindre l'action"}
                </h3>
                <p className="join-modal-subtitle">{project.title}</p>
              </div>
              <button
                type="button"
                className="join-modal-close"
                onClick={closeJoinModal}
                aria-label="Fermer"
              >
                <CloseCircle size={24} variant="Linear" color="#1A1C1E" />
              </button>
            </header>

            <form className="join-modal-form" onSubmit={handleJoinSubmit}>
              <div className="join-modal-body">
                {!project.isOwner && (
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
                )}

                {/* Section Inviter des organisations - uniquement pour le propriétaire */}
                {project.isOwner && (
                <div className={`invite-orgs-section ${project.isOwner ? 'is-owner' : ''}`}>
                  <div className="invite-orgs-header">
                    <Buildings2 size={18} variant="Bold" color="#3AA2DD" />
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
                      <SearchNormal1 size={16} variant="Linear" color="#6C7278" />
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
                          <CloseCircle size={16} variant="Linear" color="#6C7278" />
                        </button>
                      )}
                    </div>

                    {showOrgDropdown && filteredOrgs.length > 0 && (
                      <div className="invite-orgs-dropdown">
                        {filteredOrgs.map((org) => (
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
                            <Add size={18} variant="Linear" color="#3AA2DD" />
                          </button>
                        ))}
                      </div>
                    )}

                    {showOrgDropdown && orgSearch && filteredOrgs.length === 0 && (
                      <div className="invite-orgs-dropdown">
                        <div className="invite-orgs-empty">
                          Aucune organisation trouvée
                        </div>
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
                                <CloseCircle size={18} variant="Linear" color="#EF4444" />
                              </button>
                            </div>

                            <div className="invited-org-roles">
                              <span className="invited-org-role-label">Rôle :</span>
                              <div className="role-options">
                                {ROLE_OPTIONS.map((role) => {
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
                    project.isOwner
                      ? invitedOrgs.length === 0
                      : !motif.trim()
                  }
                >
                  <UserAdd size={16} variant="Bold" color="#FFFFFF" />
                  {project.isOwner ? 'Envoyer les invitations' : 'Confirmer'}
                </button>
              </footer>
            </form>
          </aside>
        </div>
      )}
    </section>
  );
};

export default ProjectDetail;
