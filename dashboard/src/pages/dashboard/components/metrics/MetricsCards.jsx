import React from 'react';
import { NotificationBing, Activity, Cpu } from 'iconsax-react';
import './metrics-cards.css';

export const MetricsCards = () => {
  const metrics = [
    {
      id: 'total-alerts',
      label: 'Total des alertes',
      value: '1 284',
      color: 'primary',
      icon: <NotificationBing size={24} variant="Bold" color="#3AA2DD" />
    },
    {
      id: 'active-responses',
      label: 'Réponses actives',
      value: '42',
      color: 'success',
      icon: <Activity size={24} variant="Bold" color="#22C55E" />
    },
    {
      id: 'pending-audit',
      label: 'Audit IA en attente',
      value: '15',
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
            <div className="metric-value">{metric.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
