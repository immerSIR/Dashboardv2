import React from 'react';
import { Crown1 } from 'iconsax-react';

export const ProjectCard = ({ project, onClick, isSelected }) => {
  return (
    <article
      className={`project-card ${isSelected ? 'is-selected' : ''} ${project.isOwner ? 'is-owner' : ''}`}
      onClick={() => onClick(project.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(project.id);
        }
      }}
    >
      <div className="project-card-top">
        <div
          className="project-thumb"
          style={{ backgroundImage: `url(${project.image})` }}
          aria-hidden="true"
        >
          {project.isOwner && (
            <span className="project-owner-tag">
              <Crown1 size={12} variant="Bold" color="#FFFFFF" />
              Mon projet
            </span>
          )}
        </div>
        <div className="project-card-info">
          <h3 className="project-title">{project.title}</h3>
          <div className="project-badges">
            {project.badges.map((badge, idx) => (
              <span
                key={idx}
                className={`project-badge project-badge-${badge.variant}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="project-description">{project.description}</p>

      <div className="project-card-footer">
        <div className="project-participants">
          {project.participants.map((p, idx) => (
            <div
              key={idx}
              className="participant-avatar"
              style={{ backgroundColor: p.color }}
              title={p.name}
            >
              {p.initials.slice(0, 2)}
            </div>
          ))}
          {project.extraParticipants > 0 && (
            <div className="participant-avatar participant-extra">
              +{project.extraParticipants}
            </div>
          )}
        </div>

        <span className="project-participants-count">
          {project.participants.length + (project.extraParticipants || 0)} participants
        </span>
      </div>
    </article>
  );
};

export default ProjectCard;
