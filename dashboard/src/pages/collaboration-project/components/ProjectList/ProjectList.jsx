import React, { useState, useMemo } from 'react';
import { SearchNormal1, ArrowDown2 } from 'iconsax-react';
import ProjectCard from './ProjectCard';
import { projects } from '../../data/projects';
import './project-list.css';

export const ProjectList = ({ onSelectProject, selectedId }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // Build dynamic dropdown options from data
  const types = useMemo(
    () => [...new Set(projects.map((p) => p.type))],
    []
  );

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase());

      const matchesType = !typeFilter || p.type === typeFilter;

      const matchesStatus =
        !statusFilter ||
        p.badges.some((b) => b.variant === statusFilter);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  return (
    <section className="project-list-section">
      {/* Header */}
      <header className="project-list-header">
        <h1 className="project-list-title">Projets Collaboratifs</h1>
        <p className="project-list-subtitle">
          Rejoignez des initiatives environnementales en cours ou proposez votre
          expertise pour soutenir les communautés locales.
        </p>
      </header>

      {/* Filters bar */}
      <div className="project-filters">
        <div className="project-search">
          <SearchNormal1 size={18} variant="Linear" color="#6C7278" />
          <input
            type="text"
            placeholder="Rechercher un projet, une commune..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="project-filters-row">
          <div className="project-select">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Type</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ArrowDown2 size={16} variant="Linear" color="#6C7278" />
          </div>

          <div className="project-select">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Statut</option>
              <option value="in-progress">En cours</option>
              <option value="planned">Planifié</option>
              <option value="critical">Critique</option>
              <option value="expert-needed">Besoin expert</option>
            </select>
            <ArrowDown2 size={16} variant="Linear" color="#6C7278" />
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="project-empty">
          <p>Aucun projet ne correspond à vos critères.</p>
        </div>
      ) : (
        <div className="project-grid">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={onSelectProject}
              isSelected={project.id === selectedId}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProjectList;
