import { authService } from '../../auth/services/authService';
import { API_URL_BASE } from '../../../config/api_url_base';

// ─────────────────────────────────────────────────────────
// SUGGESTIONS DE PARTENAIRES
// ─────────────────────────────────────────────────────────

/**
 * Lister les suggestions de partenaires pour un incident
 * GET /MapApi/incidents/<incident_id>/suggestions/
 * @param {number|string} incidentId
 * @returns {Promise<Array>}
 */
export const listPartnerSuggestionsService = async (incidentId) => {
    try {
        const axios = authService.createAuthenticatedAxios();
        const response = await axios.get(`${API_URL_BASE}/MapApi/incidents/${incidentId}/suggestions/`);
        console.log('[PartnerSuggestion] Suggestions récupérées:', response.data);
        return response?.data?.results || response?.data || [];
    } catch (error) {
        console.error('[PartnerSuggestion] Erreur liste suggestions:', error?.response?.status, error?.response?.data);
        throw error;
    }
};

/**
 * Suggérer un partenaire pour collaboration sur un incident
 * POST /MapApi/incidents/<incident_id>/suggestions/
 * @param {number|string} incidentId
 * @param {{
 *   suggested_partner: number,
 *   suggested_role?: 'leader' | 'contributor' | 'observer',
 *   justification?: string
 * }} data
 * @returns {Promise<Object>}
 */
export const createPartnerSuggestionService = async (incidentId, data) => {
    try {
        const axios = authService.createAuthenticatedAxios();
        const response = await axios.post(`${API_URL_BASE}/MapApi/incidents/${incidentId}/suggestions/`, data);
        console.log('[PartnerSuggestion] Suggestion créée:', response.data);
        return response?.data || {};
    } catch (error) {
        console.error('[PartnerSuggestion] Erreur création suggestion:', error?.response?.status, error?.response?.data);
        throw error;
    }
};

/**
 * Détails d'une suggestion de partenaire
 * GET /MapApi/incidents/<incident_id>/suggestions/<suggestion_id>/
 * @param {number|string} incidentId
 * @param {number|string} suggestionId
 * @returns {Promise<Object>}
 */
export const getPartnerSuggestionService = async (incidentId, suggestionId) => {
    try {
        const axios = authService.createAuthenticatedAxios();
        const response = await axios.get(`${API_URL_BASE}/MapApi/incidents/${incidentId}/suggestions/${suggestionId}/`);
        console.log('[PartnerSuggestion] Détail suggestion:', response.data);
        return response?.data || {};
    } catch (error) {
        console.error('[PartnerSuggestion] Erreur détail suggestion:', error?.response?.status, error?.response?.data);
        throw error;
    }

};

/**
 * Accepter une suggestion de partenaire
 * POST /MapApi/incidents/<incident_id>/suggestions/<suggestion_id>/accept/
 * @param {number|string} incidentId
 * @param {number|string} suggestionId
 * @returns {Promise<Object>}
 */
export const acceptPartnerSuggestionService = async (incidentId, suggestionId) => {
    try {
        const axios = authService.createAuthenticatedAxios();
        const response = await axios.post(
            `${API_URL_BASE}/MapApi/incidents/${incidentId}/suggestions/${suggestionId}/accept/`
        );
        console.log('[PartnerSuggestion] Suggestion acceptée:', response.data);
        return response?.data || {};
    } catch (error) {
        console.error('[PartnerSuggestion] Erreur acceptation suggestion:', error?.response?.status, error?.response?.data);
        throw error;
    }
};

/**
 * Rejeter une suggestion de partenaire
 * POST /MapApi/incidents/<incident_id>/suggestions/<suggestion_id>/reject/
 * @param {number|string} incidentId
 * @param {number|string} suggestionId
 * @returns {Promise<Object>}
 */
export const rejectPartnerSuggestionService = async (incidentId, suggestionId) => {
    try {
        const axios = authService.createAuthenticatedAxios();
        const response = await axios.post(
            `${API_URL_BASE}/MapApi/incidents/${incidentId}/suggestions/${suggestionId}/reject/`
        );
        console.log('[PartnerSuggestion] Suggestion rejetée:', response.data);
        return response?.data || {};
    } catch (error) {
        console.error('[PartnerSuggestion] Erreur rejet suggestion:', error?.response?.status, error?.response?.data);
        throw error;
    }
};

export default {
    listPartnerSuggestionsService,
    createPartnerSuggestionService,
    getPartnerSuggestionService,
    acceptPartnerSuggestionService,
    rejectPartnerSuggestionService,
};
