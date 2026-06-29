import { authService } from '../../auth/services/authService';
import { API_URL_BASE } from '../../../config/api_url_base';

/**
 * Récupère tous les membres d'une organisation
 * @param {number|string} organisationId - ID de l'organisation
 * @returns {Promise<Array>} Liste des membres
 */
export const getOrganisationMembersService = async (organisationId) => {
    try {
        const axios = authService.createAuthenticatedAxios();
        const response = await axios.get(`${API_URL_BASE}/MapApi/organisations/${organisationId}/members/`);
        console.log('[Members] Membres récupérés:', response.data);
        return response.data;
    } catch (error) {
        console.error('[Members] Erreur récupération membres:', error?.response?.status, error?.response?.data);
        throw error;
    }
};

/**
 * Récupère la liste des agents visibles par l'utilisateur connecté.
 * Le backend filtre automatiquement selon le rôle : un Super Admin voit les
 * agents de TOUTES les organisations ; un admin/membre d'org ne voit que ceux
 * de SA propre organisation. À utiliser à la place d'une boucle sur
 * `organisations/<id>/members/` (qui renvoie 403 pour les orgs étrangères).
 * @param {Object} [params] - Filtres optionnels { search, role, status }
 * @returns {Promise<Object>} Réponse paginée { count, results }
 */
export const getAgentsService = async (params = {}) => {
    try {
        const axios = authService.createAuthenticatedAxios();
        const response = await axios.get(`${API_URL_BASE}/MapApi/agents/`, {
            params: { page_size: 100, ...params },
        });
        console.log('[Members] Agents récupérés:', response.data?.count ?? response.data);
        return response.data;
    } catch (error) {
        console.error('[Members] Erreur récupération agents:', error?.response?.status, error?.response?.data);
        throw error;
    }
};

/**
 * Crée un nouvel agent de terrain dans une organisation
 * @param {number|string} organisationId - ID de l'organisation
 * @param {Object} agentData - Données de l'agent à créer
 * @returns {Promise<Object>} Agent créé
 */
export const createOrganisationAgentService = async (organisationId, agentData) => {
    try {
        const axios = authService.createAuthenticatedAxios();
        const response = await axios.post(
            `${API_URL_BASE}/MapApi/organisations/${organisationId}/agents/create/`,
            agentData,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('[Members] Agent créé:', response.data);
        return response.data;
    } catch (error) {
        console.error('[Members] Erreur création agent:', error?.response?.status, error?.response?.data);
        throw error;
    }
};

/**
 * Ajoute un membre existant à une organisation
 * @param {number|string} organisationId - ID de l'organisation
 * @param {Object} data - Données { user_id, org_role }
 * @returns {Promise<Object>}
 */
export const addOrganisationStaffMemberService = async (organisationId, data) => {
    try {
        const axios = authService.createAuthenticatedAxios();
        const response = await axios.post(
            `${API_URL_BASE}/MapApi/organisations/${organisationId}/staff/create/`,
            data,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('[Members] Staff ajouté:', response.data);
        return response.data;
    } catch (error) {
        console.error('[Members] Erreur ajout staff:', error?.response?.status, error?.response?.data);
        throw error;
    }
};

/**
 * Modifie le rôle d'un membre
 * @param {number|string} organisationId - ID de l'organisation
 * @param {number|string} userId - ID de l'utilisateur
 * @param {Object} data - Données { org_role }
 * @returns {Promise<Object>}
 */
export const updateOrganisationMemberService = async (organisationId, userId, data) => {
    try {
        const axios = authService.createAuthenticatedAxios();
        const response = await axios.put(
            `${API_URL_BASE}/MapApi/organisations/${organisationId}/members/${userId}/`,
            data,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('[Members] Membre mis à jour:', response.data);
        return response.data;
    } catch (error) {
        console.error('[Members] Erreur mise à jour membre:', error?.response?.status, error?.response?.data);
        throw error;
    }
};

/**
 * Retire un membre d'une organisation
 * @param {number|string} organisationId - ID de l'organisation
 * @param {number|string} userId - ID de l'utilisateur
 * @returns {Promise<Object>}
 */
export const removeOrganisationMemberService = async (organisationId, userId) => {
    try {
        const axios = authService.createAuthenticatedAxios();
        const response = await axios.delete(
            `${API_URL_BASE}/MapApi/organisations/${organisationId}/members/${userId}/`
        );
        console.log('[Members] Membre retiré:', response.data);
        return response.data;
    } catch (error) {
        console.error('[Members] Erreur retrait membre:', error?.response?.status, error?.response?.data);
        throw error;
    }
};
