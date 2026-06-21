import { authService } from '../../auth/services/authService';
import { API_URL_BASE } from '../../../config/api_url_base';

const DISCUSSION_URL = 'discussion';

/**
 * Récupère tous les messages de discussion d'un incident
 * @param {number} incidentId - ID de l'incident
 * @returns {Promise<Array>} Liste des messages
 */
export const getDiscussionMessagesService = async (incidentId) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.get(`${API_URL_BASE}/MapApi/${DISCUSSION_URL}/${incidentId}/`);

    console.log('[Discussion] Messages récupérés:', response.data);
    return response?.data?.results || response?.data || [];
  } catch (error) {
    console.error('[Discussion] Erreur récupération messages:', error?.response?.status, error?.response?.data);
    throw error;
  }
};

/**
 * Envoie un message texte dans la discussion
 * @param {number} incidentId - ID de l'incident
 * @param {Object} data - Données du message
 * @param {string} data.message - Contenu du message
 * @param {number} [data.recipient] - ID du destinataire (optionnel)
 * @returns {Promise<Object>} Message créé
 */
export const sendTextMessageService = async (incidentId, data) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${DISCUSSION_URL}/${incidentId}/`,
      {
        message: data.message,
        ...(data.recipient && { recipient: data.recipient })
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[Discussion] Message texte envoyé:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Discussion] Erreur envoi message texte:', error?.response?.status, error?.response?.data);
    throw error;
  }
};

/**
 * Envoie un message audio dans la discussion
 * @param {number} incidentId - ID de l'incident
 * @param {Object} data - Données du message
 * @param {File} data.audio - Fichier audio (mp3, wav, etc.)
 * @param {number} [data.recipient] - ID du destinataire (optionnel)
 * @returns {Promise<Object>} Message créé
 */
export const sendAudioMessageService = async (incidentId, data) => {
  try {
    const axios = authService.createAuthenticatedAxios();

    const formData = new FormData();
    formData.append('audio', data.audio);
    if (data.recipient) {
      formData.append('recipient', data.recipient);
    }

    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${DISCUSSION_URL}/${incidentId}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('[Discussion] Message audio envoyé:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Discussion] Erreur envoi message audio:', error?.response?.status, error?.response?.data);
    throw error;
  }
};

/**
 * Envoie un fichier joint dans la discussion
 * @param {number} incidentId - ID de l'incident
 * @param {Object} data - Données du message
 * @param {File} data.attachment - Fichier joint (pdf, doc, docx, xls, xlsx)
 * @param {number} [data.recipient] - ID du destinataire (optionnel)
 * @returns {Promise<Object>} Message créé
 */
export const sendAttachmentMessageService = async (incidentId, data) => {
  try {
    const axios = authService.createAuthenticatedAxios();

    const formData = new FormData();
    formData.append('attachment', data.attachment);
    if (data.recipient) {
      formData.append('recipient', data.recipient);
    }

    const response = await axios.post(
      `${API_URL_BASE}/MapApi/${DISCUSSION_URL}/${incidentId}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('[Discussion] Fichier joint envoyé:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Discussion] Erreur envoi fichier joint:', error?.response?.status, error?.response?.data);
    throw error;
  }
};

/**
 * Envoie un message avec texte et fichier joint
 * @param {number} incidentId - ID de l'incident
 * @param {Object} data - Données du message
 * @param {string} [data.message] - Contenu du message (optionnel)
 * @param {File} [data.attachment] - Fichier joint (optionnel)
 * @param {File} [data.audio] - Fichier audio (optionnel)
 * @param {number} [data.recipient] - ID du destinataire (optionnel)
 * @returns {Promise<Object>} Message créé
 */
export const sendMessageService = async (incidentId, data) => {
  try {
    const axios = authService.createAuthenticatedAxios();

    // Si c'est un message texte simple
    if (data.message && !data.attachment && !data.audio) {
      return await sendTextMessageService(incidentId, data);
    }

    // Si c'est un fichier audio
    if (data.audio) {
      return await sendAudioMessageService(incidentId, data);
    }

    // Si c'est un fichier joint (avec ou sans message)
    if (data.attachment) {
      const formData = new FormData();
      formData.append('attachment', data.attachment);
      if (data.message) {
        formData.append('message', data.message);
      }
      if (data.recipient) {
        formData.append('recipient', data.recipient);
      }

      const response = await axios.post(
        `${API_URL_BASE}/MapApi/${DISCUSSION_URL}/${incidentId}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('[Discussion] Message avec fichier envoyé:', response.data);
      return response.data;
    }

    throw new Error('Au moins un des champs message/audio/attachment est requis');
  } catch (error) {
    console.error('[Discussion] Erreur envoi message:', error?.response?.status, error?.response?.data);
    throw error;
  }
};

/**
 * Formate un message pour l'affichage
 * @param {Object} message - Message brut de l'API
 * @returns {Object} Message formaté
 */
export const formatMessage = (message) => {
  if (!message) return null;

  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id;

  let senderId = null;
  let senderName = '';
  let senderInitials = 'U';
  let isMe = false;

  if (message.sender && typeof message.sender === 'object') {
    senderId = message.sender.id;
    senderName = message.sender.organisation_name || `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim() || `Utilisateur #${senderId}`;

    const first = message.sender.first_name?.[0] || '';
    const last = message.sender.last_name?.[0] || '';
    senderInitials = (first + last).toUpperCase() || 'U';
    isMe = currentUserId ? (senderId === currentUserId) : (message.is_me || false);
  } else {
    senderId = message.sender;
    senderName = message.sender_name || `Utilisateur #${senderId}`;
    senderInitials = message.sender_initials || 'U';
    isMe = message.is_me || false;
  }

  let file = null;
  if (message.attachment) {
    const urlWithoutQuery = message.attachment.split('?')[0];
    const rawName = message.attachment_name || urlWithoutQuery.split('/').pop() || 'Fichier joint';
    const cleanName = decodeURIComponent(rawName);
    file = {
      name: cleanName,
      size: 0,
      type: urlWithoutQuery.toLowerCase().endsWith('.pdf') ? 'pdf' : '',
      url: message.attachment
    };
  }

  return {
    id: message.id,
    senderId,
    senderName,
    senderInitials,
    senderColor: message.sender_color || (isMe ? 'var(--color-primary)' : '#6C7278'),
    message: message.message || '',
    audio: message.audio || null,
    attachment: message.attachment || null,
    attachmentName: message.attachment_name || null,
    file,
    recipient: message.recipient || null,
    timestamp: message.created_at,
    isMe,
    createdAt: message.created_at
  };
};

/**
 * Filtre les messages par destinataire
 * @param {Array} messages - Liste des messages
 * @param {number} recipientId - ID du destinataire
 * @returns {Array} Messages filtrés
 */
export const filterMessagesByRecipient = (messages, recipientId) => {
  if (!recipientId) return messages;
  return messages.filter(msg => msg.recipient === recipientId || msg.sender === recipientId);
};

/**
 * Groupe les messages par date
 * @param {Array} messages - Liste des messages
 * @returns {Object} Messages groupés par date
 */
export const groupMessagesByDate = (messages) => {
  if (!messages || messages.length === 0) return {};

  return messages.reduce((acc, message) => {
    const date = new Date(message.timestamp || message.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(message);
    return acc;
  }, {});
};

/**
 * Suggère une organisation partenaire pour une collaboration
 * @param {number} incidentId - ID de la collaboration
 * @param {Object} data - Données de la suggestion
 * @param {number} [data.suggested_organisation] - ID de l'organisation à inviter
 *   (le backend résout son admin/bureau_agent comme partenaire)
 * @param {number} [data.suggested_partner] - ID de l'utilisateur partenaire (alternative)
 * @param {string} data.suggested_role - 'contributor' | 'observer'
 * @param {string} data.justification - Motif de la suggestion
 * @returns {Promise<Object>} Résultat de la suggestion
 */
export const suggestCollaborationPartnerService = async (incidentId, data) => {
  try {
    const axios = authService.createAuthenticatedAxios();
    // Le backend accepte soit suggested_organisation (id org -> résout l'admin),
    // soit suggested_partner (id user). On invite des organisations, donc on
    // privilégie suggested_organisation quand il est fourni.
    const payload = {
      incident: data.incident,
      suggested_role: data.suggested_role,
      justification: data.justification || ''
    };
    if (data.suggested_organisation != null) {
      payload.suggested_organisation = data.suggested_organisation;
    } else {
      payload.suggested_partner = data.suggested_partner;
    }
    const response = await axios.post(
      `${API_URL_BASE}/MapApi/incidents/${incidentId}/suggestions/`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('[Collaboration] Suggestion envoyée:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Collaboration] Erreur suggestion:', error?.response?.status, error?.response?.data);
    throw error;
  }
};

export default {
  getDiscussionMessagesService,
  sendTextMessageService,
  sendAudioMessageService,
  sendAttachmentMessageService,
  sendMessageService,
  formatMessage,
  filterMessagesByRecipient,
  groupMessagesByDate
};
