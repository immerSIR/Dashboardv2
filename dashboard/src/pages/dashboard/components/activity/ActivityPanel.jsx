import React from 'react';
import { TickCircle, Danger, People, DocumentText, Camera, Warning2, InfoCircle, MessageText, Task, Archive } from 'iconsax-react';
import './activity-panel.css';

// Map l'état d'un incident vers un type d'activité (icône), une sévérité (couleur)
// et un libellé d'action.
const ETAT_MAP = {
  declared:            { type: 'alert',            severity: 'danger',  action: 'a été signalé' },
  taken_into_account:  { type: 'incident-taken',   severity: 'info',    action: 'a été pris en compte' },
  resolution_prepared: { type: 'task',             severity: 'warning', action: 'résolution en préparation' },
  in_validation:       { type: 'info',             severity: 'warning', action: 'en attente de validation' },
  resolved:            { type: 'incident-resolved', severity: 'success', action: 'a été résolu' },
  resolved_definitive: { type: 'incident-resolved', severity: 'success', action: 'résolu définitivement' },
};

// Temps relatif en français à partir d'une date ISO
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const min = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
};

export const ActivityPanel = ({ activity, isLoading = false }) => {
  // Fonction pour obtenir l'icône selon le type d'activité
  const getActivityIcon = (type) => {
    const iconProps = { size: 20, variant: "Bold" };
    switch (type) {
      case 'incident-taken':    return <DocumentText {...iconProps} color="#3AA2DD" />;
      case 'incident-resolved': return <TickCircle {...iconProps} color="#22C55E" />;
      case 'collaboration':     return <People {...iconProps} color="#F59E0B" />;
      case 'report':            return <Camera {...iconProps} color="#3AA2DD" />;
      case 'alert':             return <Danger {...iconProps} color="#EF4444" />;
      case 'warning':           return <Warning2 {...iconProps} color="#F59E0B" />;
      case 'info':              return <InfoCircle {...iconProps} color="#6C7278" />;
      case 'message':           return <MessageText {...iconProps} color="#3AA2DD" />;
      case 'task':              return <Task {...iconProps} color="#22C55E" />;
      case 'archive':           return <Archive {...iconProps} color="#6C7278" />;
      default:                  return <InfoCircle {...iconProps} color="#6C7278" />;
    }
  };

  // Construit le flux d'activité à partir des incidents récents (données réelles)
  const activities = (activity || []).map((inc) => {
    const m = ETAT_MAP[inc.etat] || { type: 'info', severity: 'info', action: 'mis à jour' };
    const minutes = (Date.now() - new Date(inc.created_at).getTime()) / 60000;
    const zone = (inc.zone || '').trim();
    return {
      id: inc.id,
      type: m.type,
      title: inc.title || 'Incident',
      description: m.action + (zone ? ` à ${zone}` : ''),
      time: timeAgo(inc.created_at),
      severity: m.severity,
      unread: minutes < 120, // moins de 2 h
    };
  });

  const unreadCount = activities.filter(a => a.unread).length;
  const loading = isLoading || activity === undefined;

  return (
    <div className="activity-panel">
      <div className="activity-header">
        <div className="activity-header-top">
          <h3 className="activity-title">
            Activité en temps réel
            <span className="live-indicator">
              <span className="live-dot"></span>
            </span>
          </h3>
          {unreadCount > 0 && (
            <span className="activity-unread-badge">{unreadCount} non lues</span>
          )}
        </div>
        <p className="activity-subtitle">Dernières mises à jour des flux</p>
      </div>

      <div className="activity-list">
        {loading ? (
          <div className="activity-item"><div className="activity-content"><p className="activity-text">Chargement…</p></div></div>
        ) : activities.length === 0 ? (
          <div className="activity-item"><div className="activity-content"><p className="activity-text">Aucune activité récente</p></div></div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className={`activity-item activity-${item.severity} ${item.unread ? 'unread' : ''}`}
            >
              <div className="activity-icon-wrapper">
                {getActivityIcon(item.type)}
              </div>
              <div className="activity-content">
                <p className="activity-text">
                  <strong>{item.title}</strong> {item.description}
                </p>
                <span className="activity-time">{item.time}</span>
              </div>
              {item.unread && <div className="activity-unread-dot"></div>}
            </div>
          ))
        )}
      </div>

      <div className="activity-footer">
        <button className="activity-footer-btn">
          Voir tout l'historique
        </button>
      </div>
    </div>
  );
};

export default ActivityPanel;
