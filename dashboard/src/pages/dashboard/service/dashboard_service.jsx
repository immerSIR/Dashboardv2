import { authService } from '../../auth/services/authService';
import { API_URL_BASE } from '../../../config/api_url_base';

/**
 * Récupère les statistiques agrégées du dashboard (cartes KPI + widgets +
 * activité récente). Tout est calculé côté backend (une seule requête).
 * @returns {Promise<Object>} { total_alerts, active_responses, resolved_incidents,
 *   by_zone[], by_category[], by_severity{}, recent_activity[] }
 */
export const getDashboardStatsService = async () => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.get(
      `${API_URL_BASE}/MapApi/incidents/dashboard-stats/`
    );
    return response.data || {};
  } catch (error) {
    console.error('[DASHBOARD] Erreur stats:', error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Récupère tous les incidents pour la carte
 */
export const getIncidentsService = async (filterType = 'all') => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.get(
      `${API_URL_BASE}/MapApi/incident-filter/?filter_type=${filterType}`
    );
    
    return  response.data   || [];
  } catch (error) {
    console.error('[DASHBOARD] Erreur:', error.response?.status, error.response?.data);
    throw error;
  }
};
