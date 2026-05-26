import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { useSidebarState } from '../../hooks/useSidebarState';
import { Header, Sidebar } from '../../components/layout';
import {
  Trash, SearchNormal1, ArrowDown2, RotateLeft,
  InfoCircle, CloseCircle, Grid2, HambergerMenu
} from 'iconsax-react';
import { getTrashIncidentsService } from '../incident/service/incident_service';
import './trash.css';

export const TrashPage = () => {
  const {
    isOpen: sidebarOpen,
    setOpen: setSidebarOpen,
    isCollapsed: sidebarCollapsed,
    setCollapsed: setSidebarCollapsed,
  } = useSidebarState();

  // Utiliser useSWR pour charger les incidents supprimés
  const { data: incidentsData, error: incidentsError, isLoading, mutate } = useSWR(
    'trash-incidents',
    getTrashIncidentsService,
    {
      revalidateOnFocus: false
    }
  );

  const incidents = incidentsData || [];

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  const types = useMemo(() => [...new Set(incidents.map((i) => i.type))], [incidents]);

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      const matchSearch =
        !search ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.location.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || i.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [incidents, search, typeFilter]);

  // ── Restaurer un incident ──────────────────────────────
  const handleRestore = async (id) => {
    const item = incidents.find((i) => i.id === id);
    try {
      // Appeler l'API pour restaurer l'incident (à implémenter)
      // await restoreIncidentService(id);
      
      // Rafraîchir les données
      await mutate();
      setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
      showToast(`"${item?.title}" a été restauré.`);
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      showToast('Erreur lors de la restauration.');
    }
  };

  // ── Supprimer définitivement ──────────────────────────
  const handleDeletePermanent = async (id) => {
    try {
      if (id === 'batch') {
        // Appeler l'API pour supprimer définitivement les incidents sélectionnés
        // await Promise.all([...selected].map(id => deleteIncidentPermanentlyService(id)));
        
        await mutate();
        setSelected(new Set());
        showToast('Incidents sélectionnés supprimés définitivement.');
      } else {
        // Appeler l'API pour supprimer définitivement un incident
        // await deleteIncidentPermanentlyService(id);
        
        await mutate();
        setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
        showToast('Incident supprimé définitivement.');
      }
      setConfirmId(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showToast('Erreur lors de la suppression.');
      setConfirmId(null);
    }
  };

  // ── Restaurer tous les sélectionnés ───────────────────
  const handleRestoreSelected = async () => {
    try {
      // Appeler l'API pour restaurer les incidents sélectionnés
      // await Promise.all([...selected].map(id => restoreIncidentService(id)));
      
      const count = selected.size;
      await mutate();
      showToast(`${count} incident(s) restauré(s).`);
      setSelected(new Set());
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      showToast('Erreur lors de la restauration.');
    }
  };

  // ── Toast ─────────────────────────────────────────────
  const showToast = (message) => {
    setToast({ message, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Sélection ─────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  };

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  // ── Composant carte réutilisable ─────────────────────
  const IncidentItem = ({ incident }) => {
    const isChecked = selected.has(incident.id);
    const urgent = incident.expiresIn <= 5;

    if (viewMode === 'list') {
      return (
        <div className={`trash-row ${isChecked ? 'is-selected' : ''}`}>
          <input
            type="checkbox"
            className="trash-row-checkbox"
            checked={isChecked}
            onChange={() => toggleSelect(incident.id)}
          />

          <div className="trash-row-thumb">
            <img src={incident.image} alt={incident.title} />
          </div>

          <div className="trash-row-main">
            <div className="trash-row-top">
              <span className={`trash-badge trash-badge-${incident.badgeVariant}`}>
                {incident.badgeLabel}
              </span>
              <span className="trash-card-type">{incident.type}</span>
            </div>
            <h3 className="trash-row-title">{incident.title}</h3>
            <p className="trash-row-desc">{incident.description}</p>
          </div>

          <div className="trash-row-meta">
            <span className="trash-card-location">📍 {incident.location}</span>
            <span className="trash-card-date">🗑 {incident.deletedAt}</span>
            <div className="trash-card-expiry">
              <span
                className="trash-expiry-dot"
                style={{ backgroundColor: urgent ? 'var(--color-danger)' : 'var(--color-warning)' }}
              />
              <span style={{ color: urgent ? 'var(--color-danger)' : 'inherit' }}>
                {incident.expiresIn}j restant{incident.expiresIn > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="trash-row-actions">
            <button
              className="trash-btn-restore"
              onClick={() => handleRestore(incident.id)}
              title="Restaurer"
            >
              <RotateLeft size={15} variant="Linear" />
              Restaurer
            </button>
            <button
              className="trash-btn-delete"
              onClick={() => setConfirmId(incident.id)}
              title="Supprimer définitivement"
            >
              <Trash size={14} variant="Linear" />
              Supprimer
            </button>
          </div>
        </div>
      );
    }

    // ── Vue grille ──
    return (
      <div className={`trash-card ${isChecked ? 'is-selected' : ''}`}>
        <input
          type="checkbox"
          className="trash-card-checkbox"
          checked={isChecked}
          onChange={() => toggleSelect(incident.id)}
        />

        <div className="trash-card-thumb">
          <img src={incident.image} alt={incident.title} />
          <div className="trash-card-overlay" aria-hidden="true" />
        </div>

        <div className="trash-card-body">
          <div className="trash-card-meta">
            <span className={`trash-badge trash-badge-${incident.badgeVariant}`}>
              {incident.badgeLabel}
            </span>
            <span className="trash-card-type">{incident.type}</span>
          </div>

          <h3 className="trash-card-title">{incident.title}</h3>
          <p className="trash-card-desc">{incident.description}</p>

          <div className="trash-card-info-row">
            <span className="trash-card-location">📍 {incident.location}</span>
            <span className="trash-card-date">🗑 Supprimé le {incident.deletedAt}</span>
          </div>

          <div className="trash-card-expiry">
            <span
              className="trash-expiry-dot"
              style={{ backgroundColor: urgent ? 'var(--color-danger)' : 'var(--color-warning)' }}
            />
            Expire dans <strong>{incident.expiresIn} jour{incident.expiresIn > 1 ? 's' : ''}</strong>
          </div>
        </div>

        <div className="trash-card-actions">
          <button
            className="trash-btn-restore"
            onClick={() => handleRestore(incident.id)}
            title="Restaurer cet incident"
          >
            <RotateLeft size={16} variant="Linear" />
            Restaurer
          </button>
          <button
            className="trash-btn-delete"
            onClick={() => setConfirmId(incident.id)}
            title="Supprimer définitivement"
          >
            <Trash size={15} variant="Linear" />
            Supprimer
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="trash-page">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div className={`trash-page-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="trash-content">

          {/* ── État de chargement ── */}
          {isLoading && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p>Chargement des incidents supprimés...</p>
            </div>
          )}

          {/* ── État d'erreur ── */}
          {incidentsError && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-danger)' }}>
              <p>Erreur lors du chargement des incidents supprimés.</p>
              <button 
                onClick={() => mutate()} 
                style={{ marginTop: '12px', padding: '8px 16px', cursor: 'pointer' }}
              >
                Réessayer
              </button>
            </div>
          )}

          {/* ── Contenu principal ── */}
          {!isLoading && !incidentsError && (
            <>
          {/* ── Header de page ── */}
          <div className="trash-header">
            <div className="trash-header-left">

              <div>
                <h1 className="trash-title">Corbeille</h1>
                <p className="trash-subtitle">
                  Les incidents supprimés sont conservés pendant <strong>30 jours</strong> avant d'être définitivement effacés.
                </p>
              </div>
            </div>

            <div className="trash-header-right">
              {selected.size > 0 && (
                <div className="trash-batch-actions" style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                  <button className="trash-btn-restore-all" onClick={handleRestoreSelected}>
                    <RotateLeft size={16} variant="Linear" />
                    Restaurer ({selected.size})
                  </button>
                  <button className="trash-btn-delete-all" onClick={() => setConfirmId('batch')} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-3) var(--spacing-5)', backgroundColor: 'var(--color-danger)', color: 'var(--color-surface)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-semibold)', fontFamily: 'var(--font-family)', cursor: 'pointer', transition: 'background-color 0.2s ease, transform 0.1s ease', whiteSpace: 'nowrap' }}>
                    <Trash size={16} variant="Linear" />
                    Supprimer ({selected.size})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Bannière info ── */}
          <div className="trash-info-banner">
            <InfoCircle size={16} variant="Linear" color="var(--color-primary)" />
            <span>{incidents.length} incident(s) dans la corbeille. La suppression définitive est irréversible.</span>
          </div>

          {/* ── Filtres ── */}
          <div className="trash-filters">
            <div className="trash-search">
              <SearchNormal1 size={16} variant="Linear" color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Rechercher un incident..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="trash-select-wrap">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">Tous les types</option>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ArrowDown2 size={14} variant="Linear" color="var(--color-text-muted)" />
            </div>

            <label className="trash-select-all">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
              <span>Tout sélectionner</span>
            </label>

            {/* Toggle vue intégré sur la même ligne */}
            <div className="trash-view-toggle" role="group" aria-label="Changer de vue" style={{ marginLeft: 'auto' }}>
              <button
                className={`trash-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Vue liste"
                aria-pressed={viewMode === 'list'}
              >
                <HambergerMenu
                  size={18}
                  variant={viewMode === 'list' ? 'Bold' : 'Linear'}
                  color={viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-muted)'}
                />
              </button>
              <button
                className={`trash-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Vue grille"
                aria-pressed={viewMode === 'grid'}
              >
                <Grid2
                  size={18}
                  variant={viewMode === 'grid' ? 'Bold' : 'Linear'}
                  color={viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-muted)'}
                />
              </button>
            </div>

            <span className="trash-count-label" style={{ marginLeft: 'var(--spacing-2)' }}>
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Contenu ── */}
          {filtered.length === 0 ? (
            <div className="trash-empty">
              <div className="trash-empty-icon">
                <Trash size={48} variant="Linear" color="var(--color-border)" />
              </div>
              <p className="trash-empty-title">La corbeille est vide</p>
              <p className="trash-empty-sub">Aucun incident supprimé ne correspond à vos critères.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="trash-grid">
              {filtered.map((incident) => (
                <IncidentItem key={incident.id} incident={incident} />
              ))}
            </div>
          ) : (
            <div className="trash-list">
              {filtered.map((incident) => (
                <IncidentItem key={incident.id} incident={incident} />
              ))}
            </div>
          )}
          </>
          )}

        </main>
      </div>

      {/* ── Modal confirmation ── */}
      {confirmId && (
        <div className="trash-modal-overlay" onClick={() => setConfirmId(null)}>
          <div className="trash-modal" onClick={(e) => e.stopPropagation()}>
            <button className="trash-modal-close" onClick={() => setConfirmId(null)}>
              <CloseCircle size={24} variant="Bold" color="var(--color-text-muted)" />
            </button>
            <div className="trash-modal-icon">
              <Trash size={32} variant="Bold" color="var(--color-danger)" />
            </div>
            <h2 className="trash-modal-title">Suppression définitive</h2>
            <p className="trash-modal-text">
              Cette action est <strong>irréversible</strong>. {confirmId === 'batch' ? `${selected.size} incident(s) seront` : "L'incident sera"} définitivement supprimé{confirmId === 'batch' ? 's' : ''} et ne pourra{confirmId === 'batch' ? 'nt' : ''} pas être récupéré{confirmId === 'batch' ? 's' : ''}.
            </p>
            <div className="trash-modal-actions">
              <button className="trash-modal-cancel" onClick={() => setConfirmId(null)}>
                Annuler
              </button>
              <button className="trash-modal-confirm" onClick={() => handleDeletePermanent(confirmId)}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="trash-toast">
          <RotateLeft size={16} variant="Linear" />
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default TrashPage;
