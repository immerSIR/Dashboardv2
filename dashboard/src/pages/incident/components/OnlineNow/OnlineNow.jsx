import React from 'react';
import { Lock1, Setting2 } from 'iconsax-react';
import './online-now.css';

const people = {
  government: [
    {
      id: 1,
      name: 'Marcus Chen',
      role: 'Health Ministry',
      online: true,
      avatarColor: 'linear-gradient(135deg, #fbcfe8, #f472b6)'
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      role: 'EPA Specialist',
      online: true,
      avatarColor: 'linear-gradient(135deg, #bae6fd, #38bdf8)'
    },
    {
      id: 3,
      name: 'David Traoré',
      role: 'Environment Ministry',
      online: true,
      avatarColor: 'linear-gradient(135deg, #fde68a, #f59e0b)'
    }
  ],
  organizations: [
    {
      id: 4,
      name: "Liam O'Neill",
      role: 'Eco-Guardians NGO',
      online: true,
      avatarColor: 'linear-gradient(135deg, #bbf7d0, #22c55e)'
    },
    {
      id: 5,
      name: 'Priya Sharma',
      role: 'Green Future NGO',
      online: true,
      avatarColor: 'linear-gradient(135deg, #ddd6fe, #8b5cf6)'
    },
    {
      id: 6,
      name: 'Elena Rodriguez',
      role: 'Sanitation Dept',
      online: false,
      avatarColor: 'linear-gradient(135deg, #fecaca, #ef4444)'
    },
    {
      id: 7,
      name: 'Fatou Diarra',
      role: 'WWF Mali',
      online: true,
      avatarColor: 'linear-gradient(135deg, #c7d2fe, #6366f1)'
    }
  ]
};

const getInitials = (name) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const PersonRow = ({ person }) => (
  <div className="person-row">
    <div className="person-avatar-wrapper">
      <div className="person-avatar" style={{ background: person.avatarColor }}>
        {getInitials(person.name)}
      </div>
      {person.online && <span className="person-online-dot"></span>}
    </div>
    <div className="person-info">
      <div className="person-name">{person.name}</div>
      <div className="person-role">{person.role}</div>
    </div>
  </div>
);

export const OnlineNow = () => {
  const totalActive =
    people.government.filter((p) => p.online).length +
    people.organizations.filter((p) => p.online).length;

  return (
    <aside className="online-now">
      <div className="online-now-header">
        <h3 className="online-now-title">ONLINE NOW</h3>
        <span className="online-now-count">{totalActive} ACTIVE</span>
      </div>

      <div className="online-now-body">
        <section className="online-section">
          <h4 className="online-section-title">GOVERNMENT</h4>
          <div className="online-section-list">
            {people.government.map((p) => (
              <PersonRow key={p.id} person={p} />
            ))}
          </div>
        </section>

        <section className="online-section">
          <h4 className="online-section-title">ORGANIZATIONS</h4>
          <div className="online-section-list">
            {people.organizations.map((p) => (
              <PersonRow key={p.id} person={p} />
            ))}
          </div>
        </section>
      </div>

      <div className="online-now-footer">
        <button className="manage-permissions-btn">
          <Setting2 size={16} variant="Linear" color="#1A1C1E" />
          Manage Permissions
        </button>
        <div className="encryption-note">
          <Lock1 size={12} variant="Bold" color="#9CA3AF" />
          End-to-end encrypted collaboration
        </div>
      </div>
    </aside>
  );
};

export default OnlineNow;
