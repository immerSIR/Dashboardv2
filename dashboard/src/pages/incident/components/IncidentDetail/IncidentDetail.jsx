import React from 'react';
import {
  Location,
  Clock,
  Export,
  TickCircle,
  UserAdd,
  Add,
  DocumentText,
  Image as ImageIcon,
  Microphone2,
  Send2,
  ArrowLeft2
} from 'iconsax-react';
import './incident-detail.css';

export const IncidentDetail = ({ incident, onBack }) => {
  if (!incident) {
    return (
      <section className="incident-detail empty">
        <div className="incident-detail-empty">
          <DocumentText size={48} variant="Linear" color="#9CA3AF" />
          <p>Select an incident from the queue to view details</p>
        </div>
      </section>
    );
  }

  const assetIcon = (type) => {
    if (type === 'image') return <ImageIcon size={18} variant="Bold" color="#EF4444" />;
    if (type === 'audio') return <Microphone2 size={18} variant="Bold" color="#3AA2DD" />;
    return <DocumentText size={18} variant="Bold" color="#3AA2DD" />;
  };

  return (
    <section className="incident-detail">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-top">
          <div className="detail-title-block">
            <button
              type="button"
              className="detail-back-btn"
              onClick={onBack}
              aria-label="Retour à la liste"
            >
              <ArrowLeft2 size={20} variant="Linear" color="#1A1C1E" />
            </button>
            <h2 className="detail-title">
              {incident.title}
            </h2>
          </div>
          <div className="detail-header-actions">
            <button className="btn-action-taken">
              <TickCircle size={16} variant="Bold" color="#22C55E" />
              Action Taken
            </button>
            <button className="btn-assign-task">
              <UserAdd size={16} variant="Bold" color="#FFFFFF" />
              Assign Task
            </button>
          </div>
        </div>

        <div className="detail-meta">
          <div className="detail-meta-item">
            <Location size={16} variant="Bold" color="#6C7278" />
            <span>{incident.fullLocation}</span>
          </div>
          <div className="detail-meta-item">
            <Clock size={16} variant="Bold" color="#6C7278" />
            <span>Reported {incident.reportedAt}</span>
          </div>
        </div>
      </div>

      {/* Zone supérieure scrollable (map + assets) */}
      <div className="incident-detail-top">
      {/* Map + Shared Assets */}
      <div className="detail-map-row">
        <div className="detail-map">
          <div className="detail-map-image">
            <div className="map-fake-bg"></div>
            <div className="map-overlay-bottom">
              <span className="map-overlay-label">LIVE MAP DATA</span>
              <h4 className="map-overlay-title">Contamination Vector Analysis</h4>
              <span className="map-overlay-tag">Safe Work</span>
            </div>
            <div className="map-ctrls">
              <button className="map-ctrl-btn" aria-label="Zoom">
                <Add size={18} variant="Linear" color="#1A1C1E" />
              </button>
              <button className="map-ctrl-btn" aria-label="Layers">
                <DocumentText size={18} variant="Linear" color="#1A1C1E" />
              </button>
            </div>
          </div>
        </div>

        <div className="detail-assets">
          <h4 className="detail-assets-title">SHARED ASSETS</h4>
          <div className="detail-assets-list">
            {incident.assets.length === 0 && (
              <div className="no-assets">No assets shared</div>
            )}
            {incident.assets.map((asset) => (
              <div key={asset.id} className="asset-item">
                <div className="asset-icon">{assetIcon(asset.type)}</div>
                <div className="asset-info">
                  <div className="asset-name">{asset.name}</div>
                  <div className="asset-meta">
                    {asset.size} • {asset.meta}
                  </div>
                </div>
              </div>
            ))}
            <button className="add-evidence-btn">
              <Add size={16} variant="Linear" color="#3AA2DD" />
              Add Evidence
            </button>
          </div>
        </div>
      </div>
      </div>
      {/* fin zone supérieure */}

      {/* Agency Collaboration Feed - zone bas avec scroll propre */}
      <div className="detail-feed">
        <div className="detail-feed-header">
          <h4 className="detail-feed-title">AGENCY COLLABORATION FEED</h4>
          <span className="detail-feed-badge">
            <span className="badge-dot"></span>
            {incident.agenciesActive} AGENCIES ACTIVE
          </span>
        </div>

        <div className="detail-feed-messages">
          {incident.messages.length === 0 && (
            <div className="no-messages">No messages yet. Start the conversation.</div>
          )}
          {incident.messages.map((msg) => (
            <div key={msg.id} className="feed-message">
              <div className="feed-avatar"></div>
              <div className="feed-content">
                <div className="feed-top">
                  <span className="feed-author">{msg.author}</span>
                  <span className={`feed-role feed-role-${msg.roleColor}`}>{msg.role}</span>
                  <span className="feed-time">{msg.time}</span>
                </div>
                <div className="feed-bubble">{msg.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="feed-composer">
          <input
            type="text"
            placeholder="Type a message to the team..."
            className="feed-composer-input"
          />
          <button className="feed-composer-send" aria-label="Send">
            <Send2 size={18} variant="Bold" color="#FFFFFF" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default IncidentDetail;
