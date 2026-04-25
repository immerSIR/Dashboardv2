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
  CloseCircle
} from 'iconsax-react';
import './project-detail.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

export const ProjectDetail = ({ project, onBack }) => {
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinClosing, setJoinClosing] = useState(false);
  const [motif, setMotif] = useState('');

  const openJoinModal = () => {
    setJoinClosing(false);
    setJoinOpen(true);
  };

  const closeJoinModal = () => {
    setJoinClosing(true);
    setTimeout(() => {
      setJoinOpen(false);
      setJoinClosing(false);
    }, 280);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    // TODO: envoyer le motif au backend
    console.log('Rejoindre projet', project?.id, 'motif:', motif);
    setMotif('');
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
            Rejoindre l'action
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
      <div className="incident-detail-top">
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
                <h3 className="join-modal-title">Rejoindre l'action</h3>
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
                  rows={8}
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Ex : Je suis ingénieure environnementale et je souhaite contribuer..."
                  required
                />
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
                  disabled={!motif.trim()}
                >
                  <UserAdd size={16} variant="Bold" color="#FFFFFF" />
                  Confirmer 
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
