import React from 'react';
import { Location, Chart2, Warning2, ArrowRight2 } from 'iconsax-react';
import './stats-widgets.css';

export const StatsWidgets = () => {
  const locationStats = [
    { name: 'Commune IV', count: 342 },
    { name: 'Commune I', count: 215 },
    { name: 'Kati', count: 189 },
    { name: 'Ségou', count: 156 },
    { name: 'Kayes', count: 124 }
  ];

  const topIncidents = [
    { name: 'DÉFORESTATION', percentage: 42 },
    { name: 'POLLUTION EAU', percentage: 28 },
    { name: 'INCENDIE', percentage: 15 }
  ];

  const severityData = [
    { label: 'Critique', percentage: 12, color: 'var(--color-severity-high)' },
    { label: 'Grave', percentage: 23, color: 'var(--color-severity-medium)' },
    { label: 'Modéré', percentage: 65, color: 'var(--color-severity-low)' }
  ];

  return (
    <div className="stats-widgets">
      {/* Par Localité */}
      <div className="stats-widget">
        <div className="widget-header">
          <Location size={18} variant="Bold"  />
          <h3>Par Localité</h3>
        </div>
        <div className="widget-content">
          {locationStats.map((location, index) => (
            <div key={index} className="stat-row">
              <span className="stat-label">{location.name}</span>
              <span className="stat-value">{location.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 Incidents */}
      <div className="stats-widget">
        <div className="widget-header">
          <Chart2 size={18} variant="Bold"   />
          <h3>Top 5 Incidents</h3>
        </div>
        <div className="widget-content">
          {topIncidents.map((incident, index) => (
            <div key={index} className="incident-row">
              <div className="incident-info">
                <span className="incident-label">{incident.name}</span>
                <span className="incident-percentage">{incident.percentage}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${incident.percentage}%`,
                    backgroundColor: 'var(--color-primary)'
                  }}
                />
              </div>
            </div>
          ))}
          <button className="widget-link">
            Voir tout le classement
            <ArrowRight2 size={14} variant="Linear"  />
          </button>
        </div>
      </div>

      {/* Gravité */}
      <div className="stats-widget">
        <div className="widget-header">
          <Warning2 size={18} variant="Bold"  />
          <h3>Gravité</h3>
        </div>
        <div className="widget-content">
          <div className="donut-chart">
            <svg viewBox="0 0 120 120" className="donut-svg">
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="var(--color-severity-low)"
                strokeWidth="20"
                strokeDasharray="282.7"
                strokeDashoffset="70.675"
                transform="rotate(-90 60 60)"
              />
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="var(--color-severity-medium)"
                strokeWidth="20"
                strokeDasharray="282.7"
                strokeDashoffset="217.7"
                transform="rotate(145 60 60)"
              />
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="var(--color-severity-high)"
                strokeWidth="20"
                strokeDasharray="282.7"
                strokeDashoffset="248.8"
                transform="rotate(228 60 60)"
              />
              <text x="60" y="60" textAnchor="middle" dy="7" className="donut-label">
                Global
              </text>
            </svg>
          </div>
          <div className="severity-legend">
            {severityData.map((item, index) => (
              <div key={index} className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: item.color }}></div>
                <span className="legend-label">{item.label}: {item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsWidgets;
