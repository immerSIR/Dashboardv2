
import { authService } from '../../auth/services/authService';
import { API_URL_BASE } from '../../../config/api_url_base';



const INCIDENT_URL = 'incident';
const INCIDENTS_URL = 'incidents';

/**
 * Récupère tous les incidents avec pagination
 * @param {number} page - Numéro de page (default: 1)
 * @param {number} pageSize - Taille de la page (default: 10)
 * @returns {Promise<Object>} - { count, next, previous, results }
 */
export const getIncidentsService = async (page = 1, pageSize = 10) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.get(
      `${API_URL_BASE}/MapApi/${INCIDENT_URL}/`,
      {
        // params: { page, page_size: pageSize }
      }
    );

    console.warn('[Incident]url Incidents récupérés:', `${API_URL_BASE}/MapApi/${INCIDENT_URL}`);
    console.log('[Incident] Incidents récupérés:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur récupération incidents:', error.response?.status, error.response?.data);
    throw error;
  }
};


/**
 * Récupère les incidents résolus
 * @returns {Promise<Object>} - { count, next, previous, results }
 */
export const getResolvedIncidentsService = async () => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.get(
      `${API_URL_BASE}/MapApi/incidentResolved/`
    );

    console.log('[Incident] Incidents résolus récupérés:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur récupération incidents résolus:', error.response?.status, error.response?.data);
    throw error;
  }
};


/**
 * Récupère les détails d'un incident spécifique
 * @param {number} id - ID de l'incident
 * @returns {Promise<Object>} Détails de l'incident
 */
export const getIncidentService = async (id) => {
  try {
    const axios = authService.createAuthenticatedAxios();


    const response = await axios.get(
      `${API_URL_BASE}/MapApi/${INCIDENT_URL}/${id}`
    );

    console.log('[Incident]url Incidents récupérés:', `${API_URL_BASE}/MapApi/${INCIDENT_URL}/${id}/`);
    console.log('[Incident] Incident récupéré:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur récupération incident:', error.response?.status, error.response?.data);
    throw error;
  }
};


/**
 * Crée un nouvel incident
 * @param {Object} incidentData - Données de l'incident
 * @param {string} incidentData.title - Titre
 * @param {string} incidentData.zone - Zone (requis)
 * @param {string} incidentData.description - Description
 * @param {string} incidentData.lattitude - Latitude
 * @param {string} incidentData.longitude - Longitude
 * @param {number} incidentData.category_id - ID de la catégorie
 * @param {number} incidentData.indicateur_id - ID de l'indicateur
 * @param {File} incidentData.photo - Fichier photo
 * @param {File} incidentData.video - Fichier vidéo
 * @param {File} incidentData.audio - Fichier audio
 * @returns {Promise<Object>} Incident créé
 */
export const createIncidentService = async (incidentData) => {
  try {
    const axios = authService.createAuthenticatedAxios();

    // Créer un FormData pour envoyer les fichiers
    const formData = new FormData();
    Object.keys(incidentData).forEach(key => {
      if (incidentData[key] !== null && incidentData[key] !== undefined) {
        formData.append(key, incidentData[key]);
      }
    });

    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENT_URL}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('[Incident] Incident créé:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur création incident:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Met à jour un incident
 * @param {number} id - ID de l'incident
 * @param {Object} updates - Données à mettre à jour
 * @returns {Promise<Object>} Incident mis à jour
 */
export const updateIncidentService = async (id, updates) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.put(
      `${API_URL_BASE}/MapApi/${INCIDENT_URL}s/${id}/`,
      updates
    );

    console.log('[Incident] Incident mis à jour:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur mise à jour incident:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Supprime un incident (soft delete)
 * @param {number} id - ID de l'incident
 * @returns {Promise<void>}
 */
export const deleteIncidentService = async (id) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    await axios.delete(`${API_URL_BASE}/MapApi/${INCIDENT_URL}/${id}`);

    console.log('[Incident] Incident supprimé:', id);
  } catch (error) {
    console.error('[Incident] Erreur suppression incident:', error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Prendre en charge un incident (devenir leader)
 * @param {number} incidentId 
 * @returns 
 */
export const takeInChargeIncidentService = async (incidentId, data = null) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENT_URL}s/${incidentId}/take_in_charge/`,
      data
    );

    return response.data;
  } catch (error) {
    console.error('[Prise en charge Incident] Erreur:', error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Récupère les incidents par zone
 * @param {string} zone - Nom de la zone
 * @returns {Promise<Array>} Liste des incidents
 */
export const getIncidentsByZoneService = async (zone) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.get(
      `${API_URL_BASE}/MapApi/${INCIDENT_URL}/zone/${zone}/`
    );

    console.log('[Incident] Incidents par zone récupérés:', response.data);
    return response.data?.results || response.data || [];
  } catch (error) {
    console.error('[Incident] Erreur récupération incidents par zone:', error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Récupère les incidents par catégorie
 * @param {number} categoryId - ID de la catégorie
 * @returns {Promise<Array>} Liste des incidents
 */
export const getIncidentsByCategoryService = async (categoryId) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.get(
      `${API_URL_BASE}/MapApi/${INCIDENT_URL}/category/${categoryId}/`
    );

    console.log('[Incident] Incidents par catégorie récupérés:', response.data);
    return response.data?.results || response.data || [];
  } catch (error) {
    console.error('[Incident] Erreur récupération incidents par catégorie:', error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Récupère les incidents de l'organisation
 * @param {string} source - Source des incidents (agents|citizens|all, default: all)
 * @returns {Promise<Array>} Liste des incidents
 */
export const getOrgIncidentsService = async (source = 'all') => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.get(
      `${API_URL_BASE}/MapApi/org-${INCIDENTS_URL}/`,
      {
        params: { source }
      }
    );

    console.log('[Incident] Incidents organisation récupérés:', response.data);
    return response.data?.results || response.data || [];
  } catch (error) {
    console.error('[Incident] Erreur récupération incidents organisation:', error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Bascule la visibilité publique d'un incident
 * @param {number} incidentId - ID de l'incident
 * @returns {Promise<Object>} - { status, message, data: { is_public } }
 */
export const togglePublicIncidentService = async (incidentId) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENTS_URL}/${incidentId}/toggle-public/`
    );

    console.log('[Incident] Visibilité basculée:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur basculement visibilité:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Récupère les assignations d'incident a un agents
 * @returns {Promise<Array>} 
 */
export const assignIncidentToAgentService = async (incidentId = null, data = null) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    if (incidentId) {
      const payload = {
        incident: incidentId,
        user_id: data?.taken_by,
        deadline: data?.deadline,
        ...data
      };
      console.log('[Incident] Envoi assignation via assignIncidentToAgentService:', payload);
      const response = await axios.post(
        `${API_URL_BASE}/MapApi/agent/assigned-incidents/`,
        payload
      );
      console.log('[Incident] Incident assigné:', response.data);
      return response.data;
    }

    const response = await axios.get(
      `${API_URL_BASE}/MapApi/agent/assigned-incidents/`
    );

    console.log('[Incident] Incidents assignés récupérés:', response.data);
    return response.data?.results || response.data || [];
  } catch (error) {
    console.error(
      `[Incident] Erreur ${incidentId ? 'assignation' : 'récupération'} incidents assignés:`,
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
};

/**
 * Clôture un incident (leader uniquement)
 * @param {number} incidentId - ID de l'incident
 * @param {Object} data - { resolution_start_date, resolution_end_date }
 * @returns {Promise<Object>} Incident clôturé
 */
export const closeIncidentService = async (incidentId, data) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    
    let payload = data;
    let headers = {};

    if (data && data.resolution_file) {
      const formData = new FormData();
      formData.append('resolution_start_date', data.resolution_start_date);
      formData.append('resolution_end_date', data.resolution_end_date);
      formData.append('resolution_file', data.resolution_file);
      payload = formData;
      headers['Content-Type'] = 'multipart/form-data';
    }

    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENT_URL}s/${incidentId}/close/`,
      payload,
      { headers }
    );

    console.log('[Incident] Incident clôturé:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur clôture incident:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Prépare la résolution d'un incident (constitue le dossier de résolution)
 * org_admin OU bureau_agent ; requiert etat `taken_into_account`
 * @param {number} incidentId - ID de l'incident
 * @returns {Promise<Object>} Incident mis à jour
 */
export const prepareResolutionService = async (incidentId) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENTS_URL}/${incidentId}/prepare-resolution/`,
      {}
    );

    console.log('[Incident] Résolution préparée:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur préparation résolution:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Renvoie un incident pour complément (depuis le dossier de résolution préparé)
 * org_admin ; requiert etat `resolution_prepared`
 * @param {number} incidentId - ID de l'incident
 * @returns {Promise<Object>} Incident mis à jour
 */
export const returnForCompletionService = async (incidentId) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENTS_URL}/${incidentId}/return-for-completion/`,
      {}
    );

    console.log('[Incident] Incident renvoyé pour complément:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur renvoi pour complément:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Déclare un incident comme résolu (passe en validation)
 * org_admin ; requiert etat `taken_into_account` ou `resolution_prepared`
 * @param {number} incidentId - ID de l'incident
 * @returns {Promise<Object>} Incident mis à jour
 */
export const declareResolvedService = async (incidentId) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENTS_URL}/${incidentId}/declare-resolved/`,
      {}
    );

    console.log('[Incident] Incident déclaré résolu:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur déclaration résolu:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Valide la résolution d'un incident (résolu définitif)
 * super_admin ; requiert etat `in_validation`
 * @param {number} incidentId - ID de l'incident
 * @returns {Promise<Object>} Incident mis à jour
 */
export const validateResolutionService = async (incidentId) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENTS_URL}/${incidentId}/validate-resolution/`,
      {}
    );

    console.log('[Incident] Résolution validée:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur validation résolution:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Refuse la résolution d'un incident (motif requis)
 * super_admin ; requiert etat `in_validation`
 * @param {number} incidentId - ID de l'incident
 * @param {string} motif - Motif du refus (requis)
 * @returns {Promise<Object>} Incident mis à jour
 */
export const rejectResolutionService = async (incidentId, motif) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENTS_URL}/${incidentId}/reject-resolution/`,
      { motif }
    );

    console.log('[Incident] Résolution refusée:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur refus résolution:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Assigne un incident à une organisation (Super Admin)
 * super_admin ; crée une assignation org en attente (acceptation/refus par l'Admin de l'orga)
 * @param {number} incidentId - ID de l'incident
 * @param {number} organisationId - ID de l'organisation cible
 * @returns {Promise<Object>} Assignation créée
 */
export const assignToOrganisationService = async (incidentId, organisationId) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENTS_URL}/${incidentId}/assign-to-organisation/`,
      { organisation_id: organisationId }
    );

    console.log('[Incident] Incident assigné à l\'organisation:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur assignation à l\'organisation:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Accepte une assignation d'incident à une organisation
 * org_admin (doit posséder l'organisation cible)
 * @param {number} assignmentId - ID de l'assignation org
 * @returns {Promise<Object>} Assignation mise à jour
 */
export const acceptOrgAssignmentService = async (assignmentId) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/incident-org-assignments/${assignmentId}/accept/`,
      {}
    );

    console.log('[Incident] Assignation org acceptée:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur acceptation assignation org:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Refuse une assignation d'incident à une organisation (motif requis)
 * org_admin (doit posséder l'organisation cible)
 * @param {number} assignmentId - ID de l'assignation org
 * @param {string} motif - Motif du refus
 * @returns {Promise<Object>} Assignation mise à jour
 */
export const declineOrgAssignmentService = async (assignmentId, motif) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/incident-org-assignments/${assignmentId}/decline/`,
      { motif }
    );

    console.log('[Incident] Assignation org refusée:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur refus assignation org:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Signale un incident à l'Admin (depuis le terrain)
 * bureau_agent ; requiert etat `declared`
 * @param {number} incidentId - ID de l'incident
 * @param {string} comment - Commentaire (optionnel)
 * @returns {Promise<Object>} Réponse du backend
 */
export const reportToAdminService = async (incidentId, comment) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENTS_URL}/${incidentId}/report-to-admin/`,
      { comment: comment || '' }
    );

    console.log('[Incident] Incident signalé à l\'Admin:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur signalement à l\'Admin:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Relance une tâche échouée (la repasse en attente)
 * leader de l'incident ; requiert une tâche en état `failed`
 * @param {number} incidentId - ID de l'incident
 * @param {number} taskId - ID de la tâche
 * @returns {Promise<Object>} Tâche mise à jour
 */
export const relaunchTaskService = async (incidentId, taskId) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENTS_URL}/${incidentId}/tasks/${taskId}/relaunch/`,
      {}
    );

    console.log('[Incident] Tâche relancée:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur relance tâche:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Récupère les incidents supprimés (corbeille)
 * @returns {Promise<Array>} Liste des incidents supprimés
 */
export const getTrashIncidentsService = async () => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.get(
      `${API_URL_BASE}/MapApi/${INCIDENTS_URL}/trash/`
    );

    console.log('[Incident] Incidents corbeille récupérés:', response.data);
    return response.data?.results || response.data || [];
  } catch (error) {
    console.error('[Incident] Erreur récupération corbeille:', error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Restaure un incident supprimé
 * @param {number} incidentId - ID de l'incident
 * @returns {Promise<Object>} Incident restauré
 */
export const restoreIncidentService = async (incidentId) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${INCIDENT_URL}/${incidentId}/restore/`
    );

    console.log('[Incident] Incident restauré:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur restauration incident:', error.response?.status, error.response?.data);
    throw error?.response?.data || error;
  }
};

/**
 * Récupère les prédictions d'un incident spécifique
 * @param {number|string} id - ID de l'incident
 * @returns {Promise<Object>} Prédictions de l'incident
 */
export const getIncidentPredictionService = async (id) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.get(
      `${API_URL_BASE}/MapApi/Incidentprediction/${id}/`
    );

    console.log('[Incident] Prédiction récupérée:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Incident] Erreur récupération prédiction:', error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Formate un incident pour l'affichage
 * @param {Object} incident - Données brutes de l'incident
 * @returns {Object} Incident formaté
 */
export const formatIncident = (incident) => {
  if (!incident) return null;

  return {
    id: incident.id,
    title: incident.title,
    zone: incident.zone,
    description: incident.description,
    etat: incident.etat,
    etatLabel: getEtatLabel(incident.etat),
    etatColor: getEtatColor(incident.etat),
    progress: incident.progress || 0,
    isPublic: incident.is_public,
    isDeleted: incident.is_deleted,
    createdAt: incident.created_at,
    photo: incident.photo,
    video: incident.video,
    audio: incident.audio,
    category: incident.category,
    takenBy: incident.taken_by,
    userId: incident.user_id,
    resolutionStartDate: incident.resolution_start_date,
    resolutionEndDate: incident.resolution_end_date,
    reportedByAgent: incident.reported_by_agent
  };
};

/**
 * Obtient le libellé d'un état
 * @param {string} etat - État de l'incident
 * @returns {string} Libellé traduit
 */
const getEtatLabel = (etat) => {
  const labels = {
    declared: 'Déclaré',
    taken_into_account: 'Pris en compte',
    in_progress: 'En cours',
    resolution_prepared: 'Résolution préparée',
    in_validation: 'Résolu (en validation)',
    resolved: 'Résolu',
    resolved_definitive: 'Résolu (définitif)'
  };
  return labels[etat] || etat;
};

/**
 * Obtient la couleur associée à un état
 * @param {string} etat - État de l'incident
 * @returns {string} Code couleur
 */
const getEtatColor = (etat) => {
  const colors = {
    declared: '#6C7278',      // gris
    taken_into_account: '#3AA2DD',  // bleu (primary)
    in_progress: '#F59E0B',   // orange (warning)
    resolution_prepared: '#8B5CF6',  // violet (dossier préparé, attente Admin)
    in_validation: '#0EA5E9', // bleu clair (attente validation Super Admin)
    resolved: '#22C55E',      // vert (success)
    resolved_definitive: '#16A34A'  // vert foncé (validé définitivement)
  };
  return colors[etat] || '#6C7278';
};

export default {
  getIncidentsService,
  getResolvedIncidentsService,
  getIncidentService,
  getIncidentPredictionService,
  createIncidentService,
  updateIncidentService,
  deleteIncidentService,
  getIncidentsByZoneService,
  getIncidentsByCategoryService,
  getOrgIncidentsService,
  togglePublicIncidentService,
  assignIncidentToAgentService,
  takeInChargeIncidentService,
  closeIncidentService,
  prepareResolutionService,
  returnForCompletionService,
  declareResolvedService,
  validateResolutionService,
  rejectResolutionService,
  assignToOrganisationService,
  acceptOrgAssignmentService,
  declineOrgAssignmentService,
  reportToAdminService,
  relaunchTaskService,
  getTrashIncidentsService,
  restoreIncidentService,
  formatIncident
};