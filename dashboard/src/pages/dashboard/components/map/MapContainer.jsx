import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ShimmerThumbnail, ShimmerTitle, ShimmerText } from 'react-shimmer-effects';
import { getIncidentService } from '../../../incident/service/incident_service';
import {
  CloseCircle,
  Location,
  Calendar,
 
  VideoSquare,
  MagicStar,
  ClipboardTick
} from 'iconsax-react';
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
  { id: 'declared', label: 'Déclaré',   },
  { id: 'taken_into_account', label: 'Pris en compte',  },
  { id: 'in_progress', label: 'En cours',   },
  { id: 'resolved', label: 'Résolu'  }
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

export const MapContainer = ({ incidents = [], isLoading = false }) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [modalClosing, setModalClosing] = useState(false);
  const [activeStyle, setActiveStyle] = useState('humanitarian');

  // Utiliser useSWR pour récupérer les détails de l'incident sélectionné
  const { data: selectedIncident, isLoading: isLoadingIncident } = useSWR(
    selectedIncidentId ? `/incident/${selectedIncidentId}` : null,
    () => getIncidentService(selectedIncidentId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
      onError: (err) => {
        console.error('[MAP] Erreur chargement incident:', err);
      },
      onSuccess: (data) => {
        console.log('[MAP] Incident chargé:', data);
      }
    }
  );

  // Filtre uniquement les incidents avec lattitude et longitude valides
  const validIncidents = useMemo(
    () => incidents.filter((inc) => {
      const lat = parseFloat(inc.lattitude);
      const lng = parseFloat(inc.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    }),
    [incidents]
  );

  const openModal = (incident) => {
    setModalClosing(false);
    setSelectedIncidentId(incident.id);
  };

  const closeModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setSelectedIncidentId(null);
      setModalClosing(false);
    }, 250);
  };

  // Centre de la carte basé sur la moyenne des coordonnées
  const center = useMemo(() => {
    if (validIncidents.length === 0) return { lng: -8.0, lat: 12.65 };
    const avg = validIncidents.reduce(
      (acc, inc) => ({
        lng: acc.lng + parseFloat(inc.longitude),
        lat: acc.lat + parseFloat(inc.lattitude)
      }),
      { lng: 0, lat: 0 }
    );
    return {
      lng: avg.lng / validIncidents.length,
      lat: avg.lat / validIncidents.length
    };
  }, [validIncidents]);

  // Index de l'étape de statut courante
  const statusIndex = selectedIncident
    ? Math.max(
        0,
        INCIDENT_STATUS_STEPS.findIndex(
          (s) => s.id === (selectedIncident.etat || 'declared')
        )
      )
    : 0;

  return (
    <div className="card">
      <div className="map-container">
        {/* Loader overlay */}
        {isLoading && (
          <div className="map-loading-overlay">
            <div className="map-loading-spinner">
              <div className="spinner"></div>
              <p>Chargement des incidents...</p>
            </div>
          </div>
        )}

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
          {!isLoading && validIncidents.map((incident) => {
            const severity = incident.etat === 'declared' ? 'critical' : 'medium';
            return (
              <Marker
                key={incident.id}
                longitude={parseFloat(incident.longitude)}
                latitude={parseFloat(incident.lattitude)}
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
          <span className="map-title-overlay-label">INCIDENTS ACTIFS</span>
          <span className="map-title-overlay-count">{validIncidents.length}</span>
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
                style={{ backgroundColor: 'var(--color-severity-high)' }}
              />
              Critique
            </div>
            <div className="map-legend-item">
              <span
                className="map-legend-dot"
                style={{ backgroundColor: 'var(--color-severity-medium)' }}
              />
              Élevée
            </div>
            <div className="map-legend-item">
              <span
                className="map-legend-dot"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              Moyenne
            </div>
            <div className="map-legend-item">
              <span
                className="map-legend-dot"
                style={{ backgroundColor: 'var(--color-severity-low)' }}
              />
              Faible
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'incident (pattern tasks-modal, slide depuis la droite) */}
      {selectedIncidentId && (
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
                  {isLoadingIncident ? (
                    <ShimmerTitle line={1} gap={10} variant="primary" />
                  ) : (
                    selectedIncident?.title || 'Chargement...'
                  )}
                </h3>
                <p className="incident-modal-subtitle">
                  {isLoadingIncident ? (
                    <ShimmerText line={1} gap={10} />
                  ) : (
                    <>
                      <Location size={14} variant="Bold" color="var(--color-text-secondary)" />
                      {selectedIncident?.zone} • {selectedIncident?.etat}
                    </>
                  )}
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
              {isLoadingIncident || !selectedIncident ? (
                /* Shimmer Loader */
                <div className="incident-modal-shimmer">
                  {/* Cover shimmer */}
                  <ShimmerThumbnail height={240} rounded />
                  
                  {/* Badges shimmer */}
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
                    <ShimmerTitle line={1} gap={10} variant="secondary" />
                  </div>
                  
                  {/* Meta rows shimmer */}
                  <div style={{ marginBottom: 'var(--spacing-6)' }}>
                    <ShimmerText line={3} gap={10} />
                  </div>
                  
                  {/* Status bar shimmer */}
                  <div style={{ marginBottom: 'var(--spacing-4)' }}>
                    <ShimmerThumbnail height={120} rounded />
                  </div>
                  
                  {/* Content shimmer */}
                  <ShimmerText line={5} gap={10} />
                </div>
              ) : (
                <>
                  {/* Cover image */}
                  {selectedIncident.photo && (
                    <div
                      className="incident-modal-cover"
                      style={{ backgroundImage: `url(${selectedIncident.photo})` }}
                    />
                  )}

                  {/* Badges */}
                  <div className="incident-modal-badges">
                <span
                  className={`incident-modal-badge variant-${
                    selectedIncident.etat === 'declared' ? 'critical' : 'in-progress'
                  }`}
                >
                  STATUT : {selectedIncident.etat?.toUpperCase() || 'DÉCLARÉ'}
                </span>
                {selectedIncident.zone && (
                  <span className="incident-modal-badge variant-info">
                    {selectedIncident.zone}
                  </span>
                )}
              </div>

              {/* Description */}
              {selectedIncident.description && (
                <div className="incident-modal-meta">
                  <p style={{ margin: '0 0 var(--spacing-4) 0', color: 'var(--color-text-secondary)' }}>
                    {selectedIncident.description}
                  </p>
                </div>
              )}

              {/* Méta-données */}
              <div className="incident-modal-meta">
                <div className="incident-modal-meta-row">
                  <Calendar size={16} variant="Bold" color="var(--color-primary)" />
                  <span>
                    <strong>Créé le :</strong>{' '}
                    {new Date(selectedIncident.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="incident-modal-meta-row">
                  <Location size={16} variant="Bold" color="var(--color-primary)" />
                  <span>
                    {parseFloat(selectedIncident.lattitude).toFixed(4)}°N,{' '}
                    {parseFloat(selectedIncident.longitude).toFixed(4)}°E
                  </span>
                </div>
              </div>

              {/* Statut de l'incident */}
              <div className="incident-modal-section">
                <h4 className="incident-modal-section-label">
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

              {/* Médias */}
              {selectedIncident.audio && (
                <div className="incident-modal-section">
                  <h4 className="incident-modal-section-label">
                    <MagicStar size={14} variant="Bold" color="var(--color-primary)" />
                    AUDIO
                  </h4>
                  <audio controls style={{ width: '100%' }}>
                    <source src={selectedIncident.audio} type="audio/mpeg" />
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                </div>
              )}

              {/* Vidéo */}
              {selectedIncident.video && (
                <div className="incident-modal-section">
                  <h4 className="incident-modal-section-label">
                    <VideoSquare size={14} variant="Bold" color="var(--color-primary)" />
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
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
