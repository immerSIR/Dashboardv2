import React from 'react';
import { NotificationBing, Activity, Cpu } from 'iconsax-react';
import './metrics-cards.css';

// Formate un nombre à la française (séparateur d'espace : 1 284)
const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('fr-FR') : '—');

export const MetricsCards = ({ stats, isLoading = false }) => {
  const metrics = [
    {
      id: 'total-alerts',
      label: 'Total des alertes',
      value: stats?.total_alerts,
      color: 'primary',
      icon: <NotificationBing size={24} variant="Bold" color="#3AA2DD" />
    },
    {
      id: 'active-responses',
      label: 'Réponses actives',
      value: stats?.active_responses,
      color: 'success',
      icon: <Activity size={24} variant="Bold" color="#22C55E" />
    },
    {
      id: 'pending-audit',
      label: 'Incidents résolus',
      value: stats?.resolved_incidents,
      color: 'warning',
      icon: <Cpu size={24} variant="Bold" color="#F59E0B" />
    }
  ];

  return (
    <div className="metrics-cards">
      {metrics.map((metric) => (
        <div key={metric.id} className={`metric-card metric-card-${metric.color}`}>
          <div className="metric-icon-wrapper">
            {metric.icon}
          </div>
          <div className="metric-info">
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">
              {isLoading || stats === undefined ? '…' : fmt(metric.value)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
