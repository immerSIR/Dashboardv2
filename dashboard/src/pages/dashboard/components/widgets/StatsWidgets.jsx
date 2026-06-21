import React from 'react';
import { Location, Chart2, Warning2, ArrowRight2 } from 'iconsax-react';
import './stats-widgets.css';

const DONUT_R = 45;
const DONUT_C = 2 * Math.PI * DONUT_R; // circonférence ≈ 282.74

export const StatsWidgets = ({ stats, isLoading = false }) => {
  const loading = isLoading || stats === undefined;

  // Par localité (top zones) — données réelles
  const locationStats = stats?.by_zone || [];

  // Top incidents par catégorie — données réelles (% du total)
  const topIncidents = (stats?.by_category || []).map((c) => ({
    name: (c.name || '').toUpperCase(),
    percentage: c.percentage,
  }));

  // Gravité : high → Critique, medium → Grave, low → Modéré
  const sev = stats?.by_severity || {};
  const severityData = [
    { key: 'high', label: 'Critique', percentage: sev.high?.percentage ?? 0, color: 'var(--color-severity-high)' },
    { key: 'medium', label: 'Grave', percentage: sev.medium?.percentage ?? 0, color: 'var(--color-severity-medium)' },
    { key: 'low', label: 'Modéré', percentage: sev.low?.percentage ?? 0, color: 'var(--color-severity-low)' },
  ];

  // Segments du donut calculés dynamiquement à partir des pourcentages
  let acc = 0;
  const donutSegments = severityData
    .filter((s) => s.percentage > 0)
    .map((s) => {
      const arc = (s.percentage / 100) * DONUT_C;
      const segment = { color: s.color, arc, offset: acc };
      acc += arc;
      return segment;
    });

  return (
    <div className="stats-widgets">
      {/* Par Localité */}
      <div className="stats-widget">
        <div className="widget-header">
          <Location size={18} variant="Bold" />
          <h3>Par Localité</h3>
        </div>
        <div className="widget-content">
          {loading ? (
            <div className="stat-row"><span className="stat-label">Chargement…</span></div>
          ) : locationStats.length === 0 ? (
            <div className="stat-row"><span className="stat-label">Aucune donnée</span></div>
          ) : (
            locationStats.map((location, index) => (
              <div key={index} className="stat-row">
                <span className="stat-label">{location.name}</span>
                <span className="stat-value">{location.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top 5 Incidents */}
      <div className="stats-widget">
        <div className="widget-header">
          <Chart2 size={18} variant="Bold" />
          <h3>Top 5 Incidents</h3>
        </div>
        <div className="widget-content">
          {loading ? (
            <div className="incident-row"><span className="incident-label">Chargement…</span></div>
          ) : topIncidents.length === 0 ? (
            <div className="incident-row"><span className="incident-label">Aucune catégorie renseignée</span></div>
          ) : (
            <>
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
                <ArrowRight2 size={14} variant="Linear" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Gravité */}
      <div className="stats-widget">
        <div className="widget-header">
          <Warning2 size={18} variant="Bold" />
          <h3>Gravité</h3>
        </div>
        <div className="widget-content">
          <div className="donut-chart">
            <svg viewBox="0 0 120 120" className="donut-svg">
              {donutSegments.length === 0 ? (
                <circle cx="60" cy="60" r={DONUT_R} fill="none" stroke="#E5E7EB" strokeWidth="20" />
              ) : (
                donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="60"
                    cy="60"
                    r={DONUT_R}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="20"
                    strokeDasharray={`${seg.arc} ${DONUT_C}`}
                    strokeDashoffset={-seg.offset}
                    transform="rotate(-90 60 60)"
                  />
                ))
              )}
              <text x="60" y="60" textAnchor="middle" dy="7" className="donut-label">
                Global
              </text>
            </svg>
          </div>
          <div className="severity-legend">
            {severityData.map((item, index) => (
              <div key={index} className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: item.color }}></div>
                <span className="legend-label">{item.label}: {loading ? '…' : `${item.percentage}%`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsWidgets;
