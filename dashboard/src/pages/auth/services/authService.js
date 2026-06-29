import axios from 'axios';
import { API_URL_BASE } from '../../../config/api_url_base';

const API_URL = API_URL_BASE;

// Auth par cookie httpOnly : le JWT n'est JAMAIS stocké côté JS (protégé du XSS).
// Le navigateur envoie le cookie automatiquement → toutes les requêtes doivent
// inclure les credentials. On ne stocke en session que le profil (non sensible)
// pour l'UI et pour savoir si on est connecté.
axios.defaults.withCredentials = true;

// Clés de stockage (profil utilisateur uniquement — plus AUCUN token).
const STORAGE_KEYS = {
  USER: 'user',
  USER_ID: 'user_id',
  FIRST_NAME: 'first_name',
  ZONE: 'zone',
  USER_TYPE: 'user_type',
  ORGANISATION: 'organisation',
};

// Lit un cookie (ex. le csrftoken, non-httpOnly, à renvoyer en X-CSRFToken).
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
};

export const authService = {
  /**
   * Connexion de l'utilisateur
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - Données de l'utilisateur connecté
   */
  login: async (credentials) => {
    try {
      console.log('[AUTH] Tentative de connexion avec:', { email: credentials.email, password: credentials.password });
      console.log('[AUTH] API URL:', `${API_URL}/MapApi/login/`);

      // 1. Authentification
      const authResponse = await axios.post(
        `${API_URL}/MapApi/login/`,
        credentials
      );

      console.log('[AUTH] Réponse login:', authResponse.status, authResponse.data);

      // Le login a posé les cookies httpOnly (access/refresh) + le cookie csrftoken.
      // On ne stocke AUCUN token côté JS.

      // 2. Récupération du profil — le cookie d'accès suffit (withCredentials global).
      const userResponse = await axios.get(`${API_URL}/MapApi/user_retrieve/`);

      console.log('[AUTH] Réponse user_retrieve:', userResponse.status);

      const userData = userResponse.data.data || userResponse.data;

      // 3. Stockage du profil uniquement (non sensible) pour l'UI.
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
      console.error('[AUTH] Headers:', error.response?.headers);

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
   * Déconnexion : efface les cookies httpOnly côté serveur + le profil local.
   */
  logout: async () => {
    try {
      await axios.post(`${API_URL}/MapApi/logout/`, {});
    } catch (e) {
      // On vide le local quoi qu'il arrive.
      console.warn('[AUTH] logout serveur:', e?.response?.status);
    }
    Object.values(STORAGE_KEYS).forEach((key) => {
      sessionStorage.removeItem(key);
    });
    // Nettoyage d'éventuels anciens tokens stockés (migration cookie).
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
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
   * Vérifie si l'utilisateur est authentifié. Le vrai justificatif est le cookie
   * httpOnly (illisible par JS) ; on s'appuie donc sur la présence du profil en
   * session. Si le cookie a expiré, les appels API renverront 401.
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!sessionStorage.getItem(STORAGE_KEYS.USER);
  },

  /**
   * Token d'accès : plus jamais accessible côté JS (cookie httpOnly).
   * Conservé pour compat d'API ; renvoie toujours null.
   */
  getAccessToken: () => null,

  getRefreshToken: () => null,

  /**
   * Rafraîchit l'access token via le cookie de refresh (aucun corps requis).
   * @returns {Promise<boolean>} succès
   */
  refreshToken: async () => {
    try {
      await axios.post(`${API_URL}/MapApi/token/refresh/`, {});
      return true; // nouveau cookie d'accès posé par le serveur
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
      // Auth + CSRF via cookies (instance authentifiée).
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
   * Crée une instance axios authentifiée par cookie httpOnly.
   * - withCredentials : envoie le cookie JWT automatiquement.
   * - X-CSRFToken : requis par le backend sur les écritures (lu du cookie csrftoken).
   * Plus aucun en-tête Authorization (le token n'est plus accessible au JS).
   * @returns {AxiosInstance}
   */
  createAuthenticatedAxios: () => {
    const instance = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // Ajoute le token CSRF sur chaque requête (le backend ne le vérifie que sur
    // les méthodes non sûres, mais l'envoyer partout est sans risque).
    instance.interceptors.request.use((config) => {
      const csrf = getCookie('csrftoken');
      if (csrf) {
        config.headers['X-CSRFToken'] = csrf;
      }
      return config;
    });
    return instance;
  },
};

export default authService;

