import React, { useState, useMemo } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  CloseCircle,
  Location,
  Calendar,
  Category2,
  People,
  Danger,
  TickCircle,
  VideoSquare,
  MagicStar,
  ClipboardTick
} from 'iconsax-react';
import { projects } from '../../../collaboration-project/data/projects';
import './map.css';

// Token Mapbox depuis les variables d'environnement
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Détermine la sévérité d'un incident à partir de ses badges
const getSeverity = (project) => {
  const badges = (project.badges || []).map((b) => b.variant);
  if (badges.includes('critical')) return 'critical';
  if (badges.includes('expert-needed')) return 'high';
  if (badges.includes('in-progress')) return 'medium';
  return 'low';
};

const SEVERITY_LABEL = {
  critical: 'Critique',
  high: 'Élevée',
  medium: 'Moyenne',
  low: 'Faible'
};

const INCIDENT_STATUS_STEPS = [
  { id: 'declared', label: 'Déclaré' },
  { id: 'analysis', label: 'Analyse' },
  { id: 'taken', label: 'Pris en compte' },
  { id: 'resolved', label: 'Résolu' }
];

// Style "Humanitaire" inspiré d'OpenStreetMap HOT (Humanitarian OSM Team)
// Utilise les tiles HOT-OSM directement
const HOT_OSM_STYLE = {
  version: 8,
  sources: {
    'hot-osm': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution:
        '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team'
    }
  },
  layers: [
    {
      id: 'hot-osm-layer',
      type: 'raster',
      source: 'hot-osm',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

const MAP_STYLES = {
  humanitarian: {
    id: 'humanitarian',
    label: 'Humanitaire',
    style: HOT_OSM_STYLE
  },
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    style: 'mapbox://styles/mapbox/satellite-streets-v12'
  }
};

export const MapContainer = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalClosing, setModalClosing] = useState(false);
  const [activeStyle, setActiveStyle] = useState('humanitarian');

  // On filtre uniquement les projets avec des coordonnées
  const incidents = useMemo(
    () => projects.filter((p) => p.coordinates),
    []
  );

  const openModal = (incident) => {
    setModalClosing(false);
    setSelectedIncident(incident);
  };

  const closeModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setSelectedIncident(null);
      setModalClosing(false);
    }, 250);
  };

  // Centre de la carte basé sur la moyenne des coordonnées
  const center = useMemo(() => {
    if (incidents.length === 0) return { lng: -8.0, lat: 12.65 };
    const avg = incidents.reduce(
      (acc, inc) => ({
        lng: acc.lng + inc.coordinates.lng,
        lat: acc.lat + inc.coordinates.lat
      }),
      { lng: 0, lat: 0 }
    );
    return {
      lng: avg.lng / incidents.length,
      lat: avg.lat / incidents.length
    };
  }, [incidents]);

  // Index de l'étape de statut courante
  const statusIndex = selectedIncident
    ? Math.max(
        0,
        INCIDENT_STATUS_STEPS.findIndex(
          (s) => s.id === (selectedIncident.incidentStatus || 'analysis')
        )
      )
    : 0;

  return (
    <div className="card">
      <div className="map-container">
        <Map
          initialViewState={{
            longitude: center.lng,
            latitude: center.lat,
            zoom: 6
          }}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLES[activeStyle].style}
          cooperativeGestures={true}
          touchZoomRotate={true}
          touchPitch={true}
        >
          {/* Markers d'incidents */}
          {incidents.map((incident) => {
            const severity = getSeverity(incident);
            return (
              <Marker
                key={incident.id}
                longitude={incident.coordinates.lng}
                latitude={incident.coordinates.lat}
                anchor="center"
              >
                <button
                  type="button"
                  className={`incident-marker severity-${severity}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(incident);
                  }}
                  aria-label={`Voir l'incident ${incident.title}`}
                  title={incident.title}
                >
                  <span className="incident-marker-pulse" />
                  <span className="incident-marker-dot" />
                </button>
              </Marker>
            );
          })}
        </Map>

        {/* Bandeau titre */}
        <div className="map-title-overlay">
          <span className="map-title-overlay-label">ALERTE · INCIDENTS ACTIFS</span>
          <span className="map-title-overlay-count">{incidents.length}</span>
        </div>

        {/* Switcher de style de carte */}
        <div className="map-style-switcher">
          {Object.values(MAP_STYLES).map((s) => (
            <button
              key={s.id}
              type="button"
              className={`map-style-btn ${activeStyle === s.id ? 'is-active' : ''}`}
              onClick={() => setActiveStyle(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Légende stylisée */}
        <div className="map-legend-modern">
          <p className="map-legend-title">SÉVÉRITÉ</p>
          <div className="map-legend-list">
            <div className="map-legend-item">
              <span
                className="map-legend-dot"
                style={{ backgroundColor: '#EF4444' }}
              />
              Critique
            </div>
            <div className="map-legend-item">
              <span
                className="map-legend-dot"
                style={{ backgroundColor: '#F59E0B' }}
              />
              Élevée
            </div>
            <div className="map-legend-item">
              <span
                className="map-legend-dot"
                style={{ backgroundColor: '#3AA2DD' }}
              />
              Moyenne
            </div>
            <div className="map-legend-item">
              <span
                className="map-legend-dot"
                style={{ backgroundColor: '#22C55E' }}
              />
              Faible
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'incident (pattern tasks-modal, slide depuis la droite) */}
      {selectedIncident && (
        <div
          className={`incident-modal-overlay ${modalClosing ? 'closing' : ''}`}
          onClick={closeModal}
          role="dialog"
        >
          <aside
            className={`incident-modal ${modalClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec titre + sous-titre + close */}
            <header className="incident-modal-header">
              <div className="incident-modal-header-main">
                <h3 className="incident-modal-title">
                  {selectedIncident.title}
                </h3>
                <p className="incident-modal-subtitle">
                  <Location size={14} variant="Bold" color="#6C7278" />
                  {selectedIncident.location} • {selectedIncident.type}
                </p>
              </div>
              <button
                type="button"
                className="incident-modal-close"
                onClick={closeModal}
                aria-label="Fermer"
              >
                <CloseCircle size={24} variant="Linear" color="#1A1C1E" />
              </button>
            </header>

            {/* Body scrollable */}
            <div className="incident-modal-body">
              {/* Cover image */}
              <div
                className="incident-modal-cover"
                style={{ backgroundImage: `url(${selectedIncident.image})` }}
              />

              {/* Badges */}
              <div className="incident-modal-badges">
                {(selectedIncident.badges || []).map((badge, idx) => (
                  <span
                    key={idx}
                    className={`incident-modal-badge variant-${badge.variant}`}
                  >
                    {badge.label}
                  </span>
                ))}
                <span
                  className={`incident-modal-badge variant-${
                    getSeverity(selectedIncident) === 'critical'
                      ? 'critical'
                      : 'in-progress'
                  }`}
                >
                  SÉVÉRITÉ : {SEVERITY_LABEL[getSeverity(selectedIncident)].toUpperCase()}
                </span>
              </div>

              {/* Méta-données */}
              <div className="incident-modal-meta">
                <div className="incident-modal-meta-row">
                  <Category2 size={16} variant="Bold" color="#3AA2DD" />
                  <span>
                    <strong>Type :</strong> {selectedIncident.type}
                  </span>
                </div>
                <div className="incident-modal-meta-row">
                  <Calendar size={16} variant="Bold" color="#3AA2DD" />
                  <span>
                    <strong>Période :</strong> {selectedIncident.startDate} → {selectedIncident.endDate}
                  </span>
                </div>
                {selectedIncident.participantsCount && (
                  <div className="incident-modal-meta-row">
                    <People size={16} variant="Bold" color="#3AA2DD" />
                    <span>
                      <strong>Participants :</strong> {selectedIncident.participantsCount}
                    </span>
                  </div>
                )}
                <div className="incident-modal-meta-row">
                  <Location size={16} variant="Bold" color="#3AA2DD" />
                  <span>
                    {selectedIncident.coordinates.lat.toFixed(4)}°N,{' '}
                    {selectedIncident.coordinates.lng.toFixed(4)}°E
                  </span>
                </div>
              </div>

              {/* Statut de l'incident */}
              <div className="incident-modal-section">
                <h4 className="incident-modal-section-label">
                  <ClipboardTick size={14} variant="Bold" color="#3AA2DD" />
                  STATUT DE L'INCIDENT
                </h4>
                <div>
                  <div className="incident-modal-status-bar">
                    {INCIDENT_STATUS_STEPS.map((step, idx) => (
                      <div
                        key={step.id}
                        className={`incident-modal-status-segment ${
                          idx < statusIndex ? 'is-done' : ''
                        } ${idx === statusIndex ? 'is-current' : ''}`}
                      />
                    ))}
                  </div>
                  <div className="incident-modal-status-steps">
                    {INCIDENT_STATUS_STEPS.map((step, idx) => (
                      <div
                        key={step.id}
                        className={`incident-modal-status-step ${
                          idx < statusIndex ? 'is-done' : ''
                        } ${idx === statusIndex ? 'is-current' : ''}`}
                      >
                        <span className="incident-modal-status-dot" />
                        <span>{step.label.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analyse IA */}
              {selectedIncident.aiAnalysis?.text && (
                <div className="incident-modal-section">
                  <h4 className="incident-modal-section-label">
                    <MagicStar size={14} variant="Bold" color="#3AA2DD" />
                    ANALYSE IA DE L'INCIDENT
                  </h4>
                  <p className="incident-modal-ai">
                    {selectedIncident.aiAnalysis.text}
                  </p>
                </div>
              )}

              {/* Description complète */}
              <div className="incident-modal-section">
                <h4 className="incident-modal-section-label">DESCRIPTION</h4>
                <p className="incident-modal-description">
                  {selectedIncident.fullDescription || selectedIncident.description}
                </p>
              </div>

              {/* Objectifs */}
              {selectedIncident.objectives?.length > 0 && (
                <div className="incident-modal-section">
                  <h4 className="incident-modal-section-label">OBJECTIFS CLÉS</h4>
                  <div className="incident-modal-objectives">
                    {selectedIncident.objectives.map((obj, idx) => (
                      <div key={idx} className="incident-modal-objective">
                        <TickCircle size={16} variant="Bold" color="#22C55E" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vidéo */}
              {selectedIncident.video && (
                <div className="incident-modal-section">
                  <h4 className="incident-modal-section-label">
                    <VideoSquare size={14} variant="Bold" color="#3AA2DD" />
                    VIDÉO DE PRÉSENTATION
                  </h4>
                  <div className="incident-modal-video">
                    <iframe
                      src={selectedIncident.video}
                      title={`Vidéo - ${selectedIncident.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Organisations participantes */}
              {selectedIncident.participants?.length > 0 && (
                <div className="incident-modal-section">
                  <h4 className="incident-modal-section-label">
                    ORGANISATIONS MOBILISÉES
                  </h4>
                  <div className="incident-modal-orgs">
                    {selectedIncident.participants.map((p, idx) => (
                      <div key={idx} className="incident-modal-org">
                        <div
                          className="incident-modal-org-avatar"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.initials}
                        </div>
                        <span className="incident-modal-org-name">
                          {p.name}
                        </span>
                      </div>
                    ))}
                    {selectedIncident.extraParticipants > 0 && (
                      <div className="incident-modal-org">
                        <div
                          className="incident-modal-org-avatar"
                          style={{ backgroundColor: '#9CA3AF' }}
                        >
                          +{selectedIncident.extraParticipants}
                        </div>
                        <span className="incident-modal-org-name">
                          Autres organisations
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
