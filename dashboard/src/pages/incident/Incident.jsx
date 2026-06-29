import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { useSidebarState } from '../../hooks/useSidebarState';
import { Header, Sidebar } from '../../components/layout';
import IncidentList from './components/IncidentList/IncidentList';
import { getIncidentsService, getIncidentService } from './service/incident_service';
import { authService } from '../auth/services/authService';
import IncidentModalContext from './modale/IncidentModalContext';
import IncidentDeleteModal from './modale/IncidentDeleteModal';
import IncidentAssignModal from './modale/IncidentAssignModal';
import './incident.css';

// Fonction pour adapter les données de l'API au format attendu
const adaptIncidentData = (incident, currentUserId = null) => {
  if (!incident) return null;

  // Mapper l'état de l'incident vers un badge
  const getBadgeFromEtat = (etat) => {
    const badges = {
      'declared': { label: 'DÉCLARÉ', variant: 'declared' },
      'taken_into_account': { label: 'PRIS EN COMPTE', variant: 'taken' },
      'resolved': { label: 'RÉSOLU', variant: 'resolved' }
    };
    return badges[etat] || { label: 'EN COURS', variant: 'in-progress' };
  };

  return {
    ...incident,
    // Adapter les champs pour la carte et le détail
    location: incident.zone || incident.location || 'Localisation non spécifiée',
    type: incident.zone || incident.type || 'Non spécifié',
    image: incident.photo || incident.image,
    photo: incident.photo || incident.image, // Pour IncidentCard
    organisation_name: incident.organisation_name || incident.user_id?.organisation_name || 'Non spécifié',
    user_full_name: incident.user_full_name || (incident.user_id ? `${incident.user_id.first_name} ${incident.user_id.last_name}` : 'Non spécifié'),
    badges: [getBadgeFromEtat(incident.etat)],
    description: incident.description || 'Aucune description disponible',
    // Ajouter les coordonnées formatées
    coordinates: (() => {
      const lat = parseFloat(incident.lattitude);
      const lng = parseFloat(incident.longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { lat, lng };
      }
      return null;
    })(),
    // Dates formatées
    startDate: incident.created_at ? new Date(incident.created_at).toLocaleDateString('fr-FR') : 'Non spécifié',
    endDate: incident.resolution_end_date ? new Date(incident.resolution_end_date).toLocaleDateString('fr-FR') : 'En cours',
    // Informations supplémentaires
    objectives: incident.objectives || [],
    participants: incident.participants || [],
    // taken_by est l'ID de la personne qui a pris en charge, pas le nombre
    participantsCount: incident.participants?.length || 0,
    extraParticipants: 0,
    // taken_by contient l'ID de l'utilisateur qui a pris en charge l'incident
    takenBy: incident.taken_by,
    // Déterminer si l'utilisateur connecté est propriétaire de l'incident
    isOwner: currentUserId ? incident.taken_by === currentUserId : false
  };
};

export const Incident = () => {
  const navigate = useNavigate();
  const {
    isOpen: sidebarOpen,
    setOpen: setSidebarOpen,
    isCollapsed: sidebarCollapsed,
    setCollapsed: setSidebarCollapsed,
  } = useSidebarState();

  const workspaceClass = [
    'incident-workspace',
  ].join(' ');

  // Récupérer l'ID de l'utilisateur connecté
  const currentUserId = sessionStorage.getItem('user_id');

  // Charger la liste des incidents avec useSWR
  const {
    data: rawIncidents,
    error: incidentsError,
    isLoading: isLoadingIncidents,
    mutate: mutateIncidents
  } = useSWR(
    '/incidents/all',
    () => getIncidentsService('all'),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      onSuccess: (data) => {
        console.log('[INCIDENT] Incidents chargés:', data);
      },
      onError: (error) => {
        console.error('[INCIDENT] Erreur chargement incidents:', error);
      }
    }
  );

  // Adapter les données des incidents avec l'ID de l'utilisateur
  const rawList = rawIncidents
    ? Array.isArray(rawIncidents)
      ? rawIncidents
      : Array.isArray(rawIncidents.results)
        ? rawIncidents.results
        : []
    : [];

  const incidents = rawList.map((inc) => adaptIncidentData(inc, currentUserId));

  // ── États locaux pour la gestion des modales d'incidents ─────────────────────
  const [deleteModal, setDeleteModal] = useState({ open: false, incident: null });
  const [assignModal, setAssignModal] = useState({ open: false, incident: null });
  const [deleteAlert, setDeleteAlert] = useState({ type: null, message: null });
  const [assignAlert, setAssignAlert] = useState({ type: null, message: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [deleteClosing, setDeleteClosing] = useState(false);
  const [assignClosing, setAssignClosing] = useState(false);

  const openDeleteModal = (incident) => {
    setDeleteModal({ open: true, incident });
    setDeleteAlert({ type: null, message: null });
    setDeleteClosing(false);
  };

  const closeDeleteModal = () => {
    setDeleteClosing(true);
    setTimeout(() => {
      setDeleteModal({ open: false, incident: null });
      setDeleteAlert({ type: null, message: null });
      setDeleteClosing(false);
    }, 280);
  };

  const openAssignModal = (incident) => {
    setAssignModal({ open: true, incident });
    setAssignAlert({ type: null, message: null });
    setAssignClosing(false);
  };

  const closeAssignModal = () => {
    setAssignClosing(true);
    setTimeout(() => {
      setAssignModal({ open: false, incident: null });
      setAssignAlert({ type: null, message: null });
      setAssignClosing(false);
    }, 280);
  };

  const contextValue = {
    deleteModal,
    setDeleteModal,
    assignModal,
    setAssignModal,
    deleteAlert,
    setDeleteAlert,
    assignAlert,
    setAssignAlert,
    isDeleting,
    setIsDeleting,
    isAssigning,
    setIsAssigning,
    deleteClosing,
    setDeleteClosing,
    assignClosing,
    setAssignClosing,
    mutateIncidents,
    openDeleteModal,
    closeDeleteModal,
    openAssignModal,
    closeAssignModal
  };

  return (
    <IncidentModalContext.Provider value={contextValue}>
      <div className="incident-page">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        <div className={`incident-page-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Header
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            sidebarCollapsed={sidebarCollapsed}
          />

          <div className={workspaceClass}>
            {/* Liste des incidents (Pleine largeur) */}
            <IncidentList
              incidents={incidents}
              isLoading={isLoadingIncidents}
              onSelectIncident={(id) => navigate(`/incidents/${id}`)}
            />
          </div>
        </div>

        {/* Modales d'actions d'incidents */}
        <IncidentAssignModal />
        <IncidentDeleteModal />
      </div>
    </IncidentModalContext.Provider>
  );
};

export default Incident;
