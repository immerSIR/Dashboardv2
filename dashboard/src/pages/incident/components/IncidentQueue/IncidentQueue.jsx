import React, { useState } from 'react';
import { SearchNormal1 } from 'iconsax-react';
import { incidents } from '../../data/incidents';
import './incident-queue.css';

export const IncidentQueue = ({ selectedId, onSelect }) => {
  const [search, setSearch] = useState('');

  const filtered = incidents.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="incident-queue">
      <div className="incident-queue-header">
        <h2 className="incident-queue-title">Incident Queue</h2>
        <div className="incident-search">
          <SearchNormal1 size={16} variant="Linear" color="#6C7278" />
          <input
            type="text"
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="incident-queue-list">
        {filtered.map((incident) => (
          <button
            key={incident.id}
            className={`incident-card incident-${incident.status} ${selectedId === incident.id ? 'selected' : ''}`}
            onClick={() => onSelect && onSelect(incident.id)}
          >
            <div className="incident-card-top">
              <span className="incident-id">
                <span className="incident-dot"></span>
                {incident.id}
              </span>
              <span className={`incident-pill pill-${incident.status}`}>
                {incident.statusLabel}
              </span>
            </div>
            <h3 className="incident-title">{incident.title}</h3>
            <p className="incident-location">{incident.location}</p>
            <div className="incident-team">
              <div className="incident-avatars">
                <div className="avatar"></div>
                {incident.extra && <div className="avatar"></div>}
              </div>
              <span className="incident-team-name">
                {incident.team}
                {incident.extra && <span className="incident-extra"> {incident.extra}</span>}
              </span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default IncidentQueue;
