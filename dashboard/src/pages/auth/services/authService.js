import axios from 'axios';
import { API_URL_BASE } from '../../../config/api_url_base';

const API_URL = API_URL_BASE;

// Auth par JWT Bearer. Le backend (api/dashboard) et les fronts de dev sont sur
// des origines différentes (cross-site) → les cookies httpOnly ne peuvent pas
// être envoyés par le navigateur. On s'appuie donc sur le token : le /login/
// renvoie access + refresh dans le corps, on les stocke et on les envoie en
// en-tête Authorization sur chaque requête. Pas de cookie → pas de credentials.
axios.defaults.withCredentials = false;

// Clés de stockage (sessionStorage : effacé à la fermeture de l'onglet).
const STORAGE_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  USER: 'user',
  USER_ID: 'user_id',
  FIRST_NAME: 'first_name',
  ZONE: 'zone',
  USER_TYPE: 'user_type',
  ORGANISATION: 'organisation',
};

const setTokens = ({ access, refresh }) => {
  if (access) sessionStorage.setItem(STORAGE_KEYS.ACCESS, access);
  if (refresh) sessionStorage.setItem(STORAGE_KEYS.REFRESH, refresh);
};

export const authService = {
  /**
   * Connexion de l'utilisateur
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - Données de l'utilisateur connecté
   */
  login: async (credentials) => {
    try {
      console.log('[AUTH] Tentative de connexion avec:', { email: credentials.email });
      console.log('[AUTH] API URL:', `${API_URL}/MapApi/login/`);

      // 1. Authentification — access + refresh renvoyés dans le corps.
      const authResponse = await axios.post(
        `${API_URL}/MapApi/login/`,
        credentials
      );

      console.log('[AUTH] Réponse login:', authResponse.status);

      const { access, refresh } = authResponse.data || {};
      setTokens({ access, refresh });

      // 2. Récupération du profil avec le Bearer fraîchement obtenu.
      const userResponse = await axios.get(`${API_URL}/MapApi/user_retrieve/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      console.log('[AUTH] Réponse user_retrieve:', userResponse.status);

      const userData = userResponse.data.data || userResponse.data;

      // 3. Stockage du profil (non sensible) pour l'UI.
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      sessionStorage.setItem(STORAGE_KEYS.USER_ID, userData.id);
      sessionStorage.setItem(STORAGE_KEYS.FIRST_NAME, userData.first_name);
      sessionStorage.setItem(STORAGE_KEYS.ZONE, userData.adress);
      sessionStorage.setItem(STORAGE_KEYS.USER_TYPE, userData.user_type);
      sessionStorage.setItem(STORAGE_KEYS.ORGANISATION, userData.organisation);

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      console.error('[AUTH] Erreur complète:', error);
      console.error('[AUTH] Status:', error.response?.status);
      console.error('[AUTH] Data:', error.response?.data);

      if (error.response?.status === 401) {
        throw {
          detail: 'Identifiants incorrects. Vérifiez votre email et mot de passe.',
          status: 401,
          originalError: error.response?.data
        };
      }

      throw error.response?.data || error.message || 'Erreur de connexion';
    }
  },

  /**
   * Déconnexion : efface les tokens + le profil local.
   */
  logout: async () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      sessionStorage.removeItem(key);
    });
    // Anciennes clés (migration depuis l'essai cookie httpOnly).
    sessionStorage.removeItem('csrftoken');
  },

  /**
   * Récupère l'utilisateur courant
   * @returns {Object|null}
   */
  getCurrentUser: () => {
    const user = sessionStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Vérifie si l'utilisateur est authentifié (présence d'un access token).
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!sessionStorage.getItem(STORAGE_KEYS.ACCESS);
  },

  /**
   * Token d'accès courant (pour Authorization: Bearer et le handshake WS).
   * @returns {string|null}
   */
  getAccessToken: () => sessionStorage.getItem(STORAGE_KEYS.ACCESS),

  getRefreshToken: () => sessionStorage.getItem(STORAGE_KEYS.REFRESH),

  /**
   * Rafraîchit l'access token à partir du refresh token stocké.
   * @returns {Promise<boolean>} succès
   */
  refreshToken: async () => {
    try {
      const refresh = sessionStorage.getItem(STORAGE_KEYS.REFRESH);
      if (!refresh) return false;
      const response = await axios.post(`${API_URL}/MapApi/token/refresh/`, { refresh });
      const access = response.data?.access;
      if (!access) return false;
      sessionStorage.setItem(STORAGE_KEYS.ACCESS, access);
      // SimpleJWT peut renvoyer un nouveau refresh (rotation) — on le garde si présent.
      if (response.data?.refresh) {
        sessionStorage.setItem(STORAGE_KEYS.REFRESH, response.data.refresh);
      }
      return true;
    } catch (error) {
      console.error('Token refresh error:', error?.response?.status);
      await authService.logout();
      return false;
    }
  },

  /**
   * Demande de réinitialisation du mot de passe (envoi du code par email)
   * @param {string} email - Adresse e-mail de l'utilisateur
   * @returns {Promise<Object>} - { message: string }
   */
  requestPasswordReset: async (email) => {
    try {
      console.log('[AUTH] Demande de réinitialisation pour:', email);
      const response = await axios.post(`${API_URL}/MapApi/password/`, { email });
      console.log('[AUTH] Réponse requestPasswordReset:', response.data);
      return response.data;
    } catch (error) {
      console.error('[AUTH] Erreur requestPasswordReset:', error);
      throw error.response?.data || error.message || 'Erreur lors de l\'envoi de l\'e-mail';
    }
  },

  /**
   * Confirme la réinitialisation du mot de passe avec le code reçu par email
   * @param {Object} payload - { email, code, new_password }
   * @returns {Promise<Object>} - { message: string }
   */
  confirmPasswordReset: async ({ email, code, new_password }) => {
    try {
      console.log('[AUTH] Confirmation réinitialisation pour:', email);
      const response = await axios.post(`${API_URL}/MapApi/password_reset/`, {
        email,
        code,
        new_password,
      });
      console.log('[AUTH] Réponse confirmPasswordReset:', response.data);
      return response.data;
    } catch (error) {
      console.error('[AUTH] Erreur confirmPasswordReset:', error);
      throw error.response?.data || error.message || 'Erreur lors de la réinitialisation';
    }
  },

  /**
   * Change le mot de passe de l'utilisateur connecté
   * @param {Object} payload - { old_password, new_password }
   * @returns {Promise<Object>} - { message: string }
   */
  changePassword: async ({ old_password, new_password }) => {
    try {
      console.log('[AUTH] Changement de mot de passe');
      const client = authService.createAuthenticatedAxios();
      const response = await client.post(
        `/MapApi/change_password/`,
        { old_password, new_password },
      );
      console.log('[AUTH] Réponse changePassword:', response.data);
      return response.data;
    } catch (error) {
      console.error('[AUTH] Erreur changePassword:', error);
      throw error.response?.data || error.message || 'Erreur lors du changement de mot de passe';
    }
  },


  /**
   * Crée une instance axios authentifiée par Bearer.
   * Le token est lu à chaque requête (toujours à jour après un refresh).
   * @returns {AxiosInstance}
   */
  createAuthenticatedAxios: () => {
    const instance = axios.create({
      baseURL: API_URL,
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    instance.interceptors.request.use((config) => {
      const token = sessionStorage.getItem(STORAGE_KEYS.ACCESS);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return instance;
  },
};

export default authService;
