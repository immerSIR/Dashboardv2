import React, { useState, useRef, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import useSWR from 'swr';
import {
  ShimmerThumbnail,
  ShimmerTitle,
  ShimmerText,
  ShimmerCircularImage,
  ShimmerButton
} from 'react-shimmer-effects';
import { takeInChargeIncidentService, getIncidentService, getIncidentPredictionService, togglePublicIncidentService, prepareResolutionService, returnForCompletionService, declareResolvedService, disengageIncidentService, validateResolutionService, rejectResolutionService, assignToOrganisationService, acceptOrgAssignmentService, declineOrgAssignmentService, reportToAdminService } from '../../service/incident_service';
import { requestCollaborationService } from '../../service/collaboration_service';
import { getIncidentChatHistoryService, sendIncidentChatMessageService } from '../../service/chat_service';
import { suggestCollaborationPartnerService } from '../../../collaboration-detail/service/collab_detail_service';
import {
  ArrowLeft2,
  Location,
  Calendar,
  Category2,
  TickCircle,
  Briefcase,
  VideoSquare,
  Map as MapIcon,
  UserAdd,
  CloseCircle,
  Crown1,
  People,
  Eye,
  EyeSlash,
  Add,
  SearchNormal1,
  Buildings2,
  MagicStar,
  Play,
  Pause,
  VolumeHigh,
  Danger,
  SearchStatus,
  ClipboardTick,
  ShieldTick,
  Camera,
  Warning2,
  Ruler,
  Message,
  Send2
} from 'iconsax-react';
import './incident-detail.css';
import './dark-dashboard.css';
import { getOrganisationsService, formatOrganisation } from '../../../organisations/service/organisation_service';
import { IncidentDetailContext } from './IncidentDetailContext';
import { InviteOrgModal } from './modal/InviteOrgModal';
import { canActOnIncident, canPrepareResolution, canDeclareResolved, canDisengage, canValidateResolution, canAssignToOrg, isOrgAdmin, canReportToAdmin } from '../../../../utils/roleHelpers';
import { authService } from '../../../auth/services/authService';

// Composant shimmer pour le détail d'incident
const IncidentDetailSkeleton = () => (
  <section className="project-detail" style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', padding: '0' }}>
    {/* Header */}
    <div className="detail-header" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="detail-title-block">
        <div className="detail-back-btn-skeleton" style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden' }}>
          <ShimmerThumbnail height={40} width={40} rounded />
        </div>
        <div className="detail-title-skeleton" style={{ flex: 1, marginLeft: '12px', maxWidth: '300px' }}>
          <ShimmerTitle line={1} gap={0} variant="primary" />
        </div>
        <div className="detail-badges-skeleton" style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
          <div style={{ width: '80px', height: '24px', borderRadius: '20px', overflow: 'hidden' }}>
            <ShimmerThumbnail height={24} width={80} rounded />
          </div>
          <div style={{ width: '60px', height: '24px', borderRadius: '20px', overflow: 'hidden' }}>
            <ShimmerThumbnail height={24} width={60} rounded />
          </div>
        </div>
        <div className="detail-action-btn-skeleton" style={{ marginLeft: 'auto', width: '180px', height: '38px', borderRadius: '8px', overflow: 'hidden' }}>
          <ShimmerThumbnail height={38} width={180} rounded />
        </div>
      </div>

      {/* Meta info list shimmer */}
      <div className="detail-meta" style={{ marginTop: '8px', display: 'flex', gap: '16px' }}>
        <div style={{ width: '150px', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
          <ShimmerThumbnail height={16} width={150} rounded />
        </div>
        <div style={{ width: '120px', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
          <ShimmerThumbnail height={16} width={120} rounded />
        </div>
      </div>
    </div>

    <div className="incident-dark-dashboard">
      {/* ── Colonne gauche ── */}
      <div className="dashboard-col-left">
        {/* Photo Card Shimmer */}
        <div className="dark-card" style={{ marginBottom: '20px', padding: '16px' }}>
          <div style={{ width: '180px', height: '16px', marginBottom: '16px', overflow: 'hidden' }}>
            <ShimmerTitle line={1} gap={0} />
          </div>
          <div style={{ width: '100%', height: '260px', borderRadius: '8px', overflow: 'hidden' }}>
            <ShimmerThumbnail height={260} rounded />
          </div>
        </div>

        {/* Audio Card Shimmer */}
        <div className="dark-card" style={{ marginBottom: '20px', padding: '16px' }}>
          <div style={{ width: '150px', height: '16px', marginBottom: '16px', overflow: 'hidden' }}>
            <ShimmerTitle line={1} gap={0} />
          </div>
          <div style={{ width: '100%', height: '54px', borderRadius: '8px', overflow: 'hidden' }}>
            <ShimmerThumbnail height={54} rounded />
          </div>
        </div>

        {/* GPS Card Shimmer */}
        <div className="dark-card" style={{ marginBottom: '20px', padding: '16px' }}>
          <div style={{ width: '160px', height: '16px', marginBottom: '16px', overflow: 'hidden' }}>
            <ShimmerTitle line={1} gap={0} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ height: '38px', borderRadius: '6px', overflow: 'hidden' }}>
              <ShimmerThumbnail height={38} rounded />
            </div>
            <div style={{ height: '38px', borderRadius: '6px', overflow: 'hidden' }}>
              <ShimmerThumbnail height={38} rounded />
            </div>
          </div>
          <div style={{ width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden' }}>
            <ShimmerThumbnail height={180} rounded />
          </div>
        </div>
      </div>

      {/* ── Colonne droite ── */}
      <div className="dashboard-col-right">
        {/* KPIs row shimmer */}
        <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div className="kpi-card" style={{ padding: '16px', height: '120px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ShimmerCircularImage size={32} />
            <ShimmerText line={1} gap={0} />
            <ShimmerText line={1} gap={0} />
          </div>
          <div className="kpi-card" style={{ padding: '16px', height: '120px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ShimmerCircularImage size={32} />
            <ShimmerText line={1} gap={0} />
            <ShimmerText line={1} gap={0} />
          </div>
          <div className="kpi-card" style={{ padding: '16px', height: '120px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ShimmerCircularImage size={32} />
            <ShimmerText line={1} gap={0} />
            <ShimmerText line={1} gap={0} />
          </div>
        </div>

        {/* IA vision analysis card shimmer */}
        <div className="dark-card" style={{ marginBottom: '20px', padding: '16px' }}>
          <div style={{ width: '200px', height: '18px', marginBottom: '16px', overflow: 'hidden' }}>
            <ShimmerTitle line={1} gap={0} />
          </div>
          <div style={{ width: '120px', height: '24px', borderRadius: '20px', marginBottom: '16px', overflow: 'hidden' }}>
            <ShimmerThumbnail height={24} width={120} rounded />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ShimmerText line={4} gap={10} />
          </div>
        </div>

        {/* 3 Pillars shimmer */}
        <div className="pillars-grid" style={{ marginBottom: '20px' }}>
          <div className="dark-card" style={{ padding: '16px', height: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ShimmerTitle line={1} gap={0} />
            <ShimmerText line={3} gap={10} />
          </div>
          <div className="dark-card" style={{ padding: '16px', height: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ShimmerTitle line={1} gap={0} />
            <ShimmerText line={3} gap={10} />
          </div>
          <div className="dark-card" style={{ padding: '16px', height: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ShimmerTitle line={1} gap={0} />
            <ShimmerText line={3} gap={10} />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Étapes du statut d'un incident (selon l'API)
const INCIDENT_STATUS_STEPS = [
  { id: 'declared', label: 'Déclaré', icon: Danger },
  { id: 'taken_into_account', label: 'Pris en compte', icon: ClipboardTick },
  { id: 'resolved', label: 'Résolu', icon: ShieldTick }
];

// Formatte les secondes en mm:ss
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const ROLE_OPTIONS = [
  {
    id: 'leader',
    label: 'Leader',
    description: 'Pilote l\'action et coordonne les autres organisations',
    icon: Crown1,
    color: 'var(--color-warning)'
  },
  {
    id: 'contributeur',
    label: 'Contributeur',
    description: 'Participe activement à la réalisation des tâches',
    icon: People,
    color: 'var(--color-primary)'
  },
  {
    id: 'observateur',
    label: 'Observateur',
    description: 'Suit l\'avancement sans participer directement',
    icon: Eye,
    color: 'var(--color-text-secondary)'
  }
];

// Rôles disponibles pour les organisations invitées (sans Leader)
const ORG_ROLE_OPTIONS = ROLE_OPTIONS.filter(role => role.id !== 'leader');

export const IncidentDetail = ({ incident, onBack, isLoading = false }) => {
  // Utiliser useSWR pour rafraîchir les données automatiquement
  const { data: swrIncident, mutate, isLoading: isSwrLoading } = useSWR(
    incident?.id ? `/incidents/${incident.id}` : null,
    () => getIncidentService(incident.id),
    {
      fallbackData: incident,
    }
  );

  const isCurrentlyLoading = isLoading || isSwrLoading || (incident?.id && !swrIncident?.title);

  // Récupérer la prédiction de l'incident
  const { data: prediction, isLoading: isLoadingPrediction } = useSWR(
    incident?.id ? `/Incidentprediction/${incident.id}` : null,
    () => getIncidentPredictionService(incident.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const pred = (Array.isArray(prediction) && prediction.length > 0) ? prediction[0] : (prediction || null);

  // Utiliser les données de SWR si disponibles, sinon les props
  const currentIncident = swrIncident || incident;

  // Récupérer l'ID de l'utilisateur connecté
  const currentUserId = sessionStorage.getItem('user_id');

  // Valeurs par défaut pour les champs manquants
  const safeIncident = currentIncident ? {
    title: currentIncident.title || 'Incident sans titre',
    badges: currentIncident.badges || [{ label: 'EN COURS', variant: 'in-progress' }],
    image: currentIncident?.image || currentIncident?.photo,
    description: currentIncident.description || 'Aucune description disponible',
    fullDescription: currentIncident.fullDescription || currentIncident.description || 'Aucune description disponible',
    type: currentIncident.type || currentIncident.zone || 'Non spécifié',
    location: currentIncident.location || currentIncident.zone || 'Localisation non spécifiée',
    coordinates: currentIncident.coordinates || (() => {
      const lat = parseFloat(currentIncident.lattitude);
      const lng = parseFloat(currentIncident.longitude);
      // Vérifier que les coordonnées sont des nombres valides
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { lat, lng };
      }
      return null;
    })(),
    video: currentIncident.video || null,
    startDate: currentIncident.startDate || currentIncident.created_at ? new Date(currentIncident.created_at).toLocaleDateString('fr-FR') : 'Non spécifié',
    endDate: currentIncident.endDate || 'En cours',
    participantsCount: currentIncident.participantsCount || 0,
    etat: currentIncident.etat || 'declared',
    aiAnalysis: currentIncident.aiAnalysis || {
      text: "Analyse en cours...",
      audio: currentIncident.audio || null
    },
    participants: currentIncident.participants || [],
    extraParticipants: currentIncident.extraParticipants || 0,
    // Déterminer si l'utilisateur connecté est propriétaire de l'incident
    isOwner: currentUserId ? currentIncident.taken_by === currentUserId : false,
    ...currentIncident
  } : null;

  const [joinOpen, setJoinOpen] = useState(false);
  const [joinClosing, setJoinClosing] = useState(false);
  const [joinShowing, setJoinShowing] = useState(false);
  const [motif, setMotif] = useState('');
  const [invitedOrgs, setInvitedOrgs] = useState([]);
  const [orgSearch, setOrgSearch] = useState('');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [selfRole, setSelfRole] = useState('contributeur');
  const [isInvolvePrivate, setIsInvolvePrivate] = useState(false);
  const [workMode, setWorkMode] = useState('collaboration');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatMessagesEndRef = useRef(null);

  // Flux de résolution (préparer / déclarer résolu / valider / refuser)
  const [resolutionBusy, setResolutionBusy] = useState(false);
  const [resolutionFeedback, setResolutionFeedback] = useState(null); // { type, message }

  // Assignation à une organisation (Super Admin) : ouverture du sélecteur + orga choisie
  const [assignOrgOpen, setAssignOrgOpen] = useState(false);
  const [selectedAssignOrgId, setSelectedAssignOrgId] = useState('');

  useEffect(() => {
    setImageLoaded(false);
  }, [safeIncident?.image]);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Bonjour ! Je suis l\'assistant IA Vision. Comment puis-je vous aider avec cet incident ?' }
  ]);

  // SWR pour charger l'historique du chatbot
  const { data: chatHistory, mutate: mutateChatHistory } = useSWR(
    chatOpen && safeIncident?.id ? `chat-history-${safeIncident.id}` : null,
    () => getIncidentChatHistoryService(safeIncident.id),
    { revalidateOnFocus: false }
  );

  // Synchroniser l'historique de chat avec le state messages
  useEffect(() => {
    if (chatHistory?.history) {
      const formattedHistory = chatHistory.history.map((msg, index) => ({
        id: msg.created_at || index,
        sender: msg.role === 'assistant' ? 'bot' : 'user',
        text: msg.content
      }));
      if (formattedHistory.length > 0) {
        setMessages(formattedHistory);
      } else {
        setMessages([
          { id: 1, sender: 'bot', text: 'Bonjour ! Je suis l\'assistant IA Vision. Comment puis-je vous aider avec cet incident ?' }
        ]);
      }
    }
  }, [chatHistory]);

  // Bloquer le scroll du body quand le chatbot est ouvert
  useEffect(() => {
    if (chatOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [chatOpen]);

  // Défilement automatique vers le bas lors de la réception d'un nouveau message
  useEffect(() => {
    if (chatOpen) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen, isTyping]);

  // Récupérer les organisations avec useSWR uniquement quand le modal est ouvert
  const { data: rawOrganisations, isLoading: isLoadingOrgs } = useSWR(
    joinOpen ? 'organisations' : null,
    getOrganisationsService,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );




  // Formater les organisations pour l'affichage
  const availableOrgs = rawOrganisations ? rawOrganisations?.map(formatOrganisation) : [];

  // Organisations pour le sélecteur d'assignation (Super Admin) — chargées à l'ouverture du contrôle
  const { data: rawAssignOrgs, isLoading: isLoadingAssignOrgs } = useSWR(
    assignOrgOpen ? 'organisations-assign' : null,
    getOrganisationsService,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const assignOrgs = rawAssignOrgs ? rawAssignOrgs.map(formatOrganisation) : [];

  // Assignations org de l'incident (exposées en lecture seule par IncidentGetSerializer)
  const orgAssignments = Array.isArray(currentIncident?.org_assignments)
    ? currentIncident.org_assignments
    : [];
  const pendingOrgAssignment = orgAssignments.find((a) => a?.status === 'pending') || null;
  // Org de l'utilisateur connecté (org_admin) — utilisée pour cibler l'assignation à accepter/refuser
  const currentUserOrgId = authService.getCurrentUser()?.organisation_member ?? null;
  // L'assignation en attente concerne-t-elle l'organisation de l'Admin connecté ?
  const myPendingOrgAssignment =
    pendingOrgAssignment &&
    currentUserOrgId != null &&
    pendingOrgAssignment.organisation_id === currentUserOrgId
      ? pendingOrgAssignment
      : null;


  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef(null);

  // Gérer le timeout de 1min30
  useEffect(() => {
    if (isCurrentlyLoading && incident) {
      // Démarrer le timer de 90 secondes
      timeoutRef.current = setTimeout(() => {
        setLoadingTimeout(true);
      }, 90000); // 90 secondes
    } else {
      // Réinitialiser le timeout si le chargement est terminé
      setLoadingTimeout(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isCurrentlyLoading, incident]);

  // Fonction pour recharger les données
  const handleRefresh = () => {
    setLoadingTimeout(false);
    mutate();
  };

  // Exécute une action du flux de résolution puis rafraîchit l'incident (SWR mutate)
  const runResolutionAction = async (action, successMessage) => {
    if (resolutionBusy) return;
    setResolutionBusy(true);
    setResolutionFeedback(null);
    try {
      await action();
      await mutate();
      setResolutionFeedback({ type: 'success', message: successMessage });
    } catch (error) {
      console.error('[Incident] Erreur action résolution:', error);
      const status = error?.response?.status;
      let message = error?.detail || error?.message || error?.response?.data?.detail || error?.response?.data?.message;
      if (!message) {
        if (status === 403) message = "Vous n'avez pas la permission d'effectuer cette action.";
        else if (status === 400) message = "Action impossible dans l'état actuel de l'incident.";
        else if (status === 404) message = 'Incident non trouvé.';
        else message = 'Une erreur est survenue. Veuillez réessayer.';
      }
      setResolutionFeedback({ type: 'danger', message });
    } finally {
      setResolutionBusy(false);
    }
  };

  const handlePrepareResolution = () =>
    runResolutionAction(() => prepareResolutionService(safeIncident.id), 'Dossier de résolution préparé.');

  const handleDeclareResolved = () =>
    runResolutionAction(() => declareResolvedService(safeIncident.id), 'Incident déclaré résolu, en attente de validation.');

  const handleDisengage = () => {
    if (!window.confirm('Se désengager de cet incident ? Cette action libère votre prise en charge.')) return;
    runResolutionAction(() => disengageIncidentService(safeIncident.id), 'Désengagement effectué.');
  };

  const handleReturnForCompletion = () =>
    runResolutionAction(() => returnForCompletionService(safeIncident.id), 'Incident renvoyé pour complément.');

  const handleValidateResolution = () =>
    runResolutionAction(() => validateResolutionService(safeIncident.id), 'Résolution validée définitivement.');

  const handleRejectResolution = () => {
    const motif = window.prompt('Motif du refus (obligatoire) :');
    if (motif === null) return; // annulé
    if (!motif.trim()) {
      setResolutionFeedback({ type: 'danger', message: 'Le motif du refus est obligatoire.' });
      return;
    }
    runResolutionAction(() => rejectResolutionService(safeIncident.id, motif.trim()), 'Résolution refusée.');
  };

  // ── Phase 4 : assignation org / accept-decline / signalement Admin ──

  // Super Admin : assigner l'incident à l'organisation sélectionnée
  const handleAssignToOrganisation = () => {
    if (!selectedAssignOrgId) {
      setResolutionFeedback({ type: 'danger', message: 'Veuillez sélectionner une organisation.' });
      return;
    }
    runResolutionAction(
      () => assignToOrganisationService(safeIncident.id, selectedAssignOrgId),
      "Incident assigné à l'organisation."
    ).then(() => {
      setAssignOrgOpen(false);
      setSelectedAssignOrgId('');
    });
  };

  // Org Admin : accepter une assignation org en attente
  const handleAcceptOrgAssignment = (assignmentId) =>
    runResolutionAction(() => acceptOrgAssignmentService(assignmentId), 'Assignation acceptée.');

  // Org Admin : refuser une assignation org en attente (motif obligatoire)
  const handleDeclineOrgAssignment = (assignmentId) => {
    const motif = window.prompt('Motif du refus (obligatoire) :');
    if (motif === null) return; // annulé
    if (!motif.trim()) {
      setResolutionFeedback({ type: 'danger', message: 'Le motif du refus est obligatoire.' });
      return;
    }
    runResolutionAction(() => declineOrgAssignmentService(assignmentId, motif.trim()), 'Assignation refusée.');
  };

  // Bureau agent : signaler l'incident à son Admin (commentaire optionnel)
  const handleReportToAdmin = () => {
    const comment = window.prompt('Commentaire pour votre Admin (optionnel) :');
    if (comment === null) return; // annulé
    runResolutionAction(() => reportToAdminService(safeIncident.id, comment.trim()), 'Incident signalé à votre Admin.');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    if (!safeIncident?.id) return;

    const userText = chatMessage.trim();
    setChatMessage('');
    setChatError(null);

    // Ajouter le message utilisateur localement pour la réactivité
    const tempUserId = Date.now();
    setMessages(prev => [...prev, { id: tempUserId, sender: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const response = await sendIncidentChatMessageService(safeIncident.id, userText);

      // Mettre à jour l'historique avec la réponse de l'API
      if (response?.history) {
        const formattedHistory = response.history.map((msg, index) => ({
          id: msg.created_at || index,
          sender: msg.role === 'assistant' ? 'bot' : 'user',
          text: msg.content
        }));
        setMessages(formattedHistory);
      } else if (response?.message) {
        setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: response.message }]);
      }
      mutateChatHistory();
    } catch (err) {
      console.error('[Chat] Erreur envoi message:', err);
      const status = err?.response?.status;
      // Détail réel renvoyé par le backend (cause exacte de l'échec)
      const detail = err?.response?.data?.detail || err?.response?.data?.message;
      let msg;
      if (detail) {
        // On surface le détail backend tel quel ; pour un 502 on précise qu'il
        // vient du service IA (et que le message a quand même été enregistré).
        msg = status === 502
          ? `Service IA indisponible : ${detail} (votre message a été enregistré)`
          : detail;
      } else if (status === 400) {
        msg = "La prédiction de l'incident doit être terminée (avec des résultats) pour pouvoir interagir avec l'assistant.";
      } else if (status === 404) {
        msg = "L'incident n'a pas été trouvé.";
      } else if (status === 502) {
        msg = "Le service d'intelligence artificielle est temporairement indisponible, mais votre message a bien été enregistré.";
      } else {
        msg = err?.message || "Une erreur est survenue lors de l'envoi de votre message.";
      }
      setChatError(msg);
    } finally {
      setIsTyping(false);
    }
  };

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const onAudioTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
  };

  const onAudioLoaded = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
  };

  const onAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const seekAudio = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = Math.max(0, Math.min(duration, ratio * duration));
  };

  // Reset l'audio quand le projet change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [safeIncident?.id]);

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (joinOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [joinOpen]);

  const openJoinModal = () => {
    setJoinClosing(false);
    setJoinOpen(true);
    if (safeIncident?.etat === 'declared') {
      setSelfRole('leader');
      setWorkMode('collaboration');
    } else {
      setSelfRole('contributeur');
      setWorkMode('collaboration');
    }
    setTimeout(() => {
      setJoinShowing(true);
    }, 10);
  };

  const closeJoinModal = () => {
    setJoinShowing(false);
    setJoinClosing(true);
    setTimeout(() => {
      setJoinOpen(false);
      setJoinClosing(false);
      setMotif('');
      setInvitedOrgs([]);
      setOrgSearch('');
      setShowOrgDropdown(false);
      setSelfRole('contributeur');
      setIsInvolvePrivate(false);
      setWorkMode('collaboration');
    }, 300);
  };

  const addInvitedOrg = (org) => {
    if (invitedOrgs.find((o) => o.id === org.id)) return;
    setInvitedOrgs((prev) => [...prev, { ...org, role: 'contributeur' }]);
    setOrgSearch('');
    setShowOrgDropdown(false);
  };

  const removeInvitedOrg = (orgId) => {
    setInvitedOrgs((prev) => prev.filter((o) => o.id !== orgId));
  };

  const updateOrgRole = (orgId, role) => {
    setInvitedOrgs((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, role } : o))
    );
  };

  const updateOrgComment = (orgId, comment) => {
    setInvitedOrgs((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, comment } : o))
    );
  };

  const filteredOrgs = availableOrgs.filter(
    (org) =>
      !invitedOrgs.find((o) => o.id === org.id) &&
      org.name.toLowerCase().includes(orgSearch.toLowerCase())
  );

  // Debug: Afficher le résultat du filtrage
  useEffect(() => {
    if (orgSearch) {
      console.log('========================================');
      console.log('🔍 RECHERCHE D\'ORGANISATIONS');
      console.log('========================================');
      console.log('🔎 Texte recherché:', `"${orgSearch}"`);
      console.log('📋 Total organisations disponibles:', availableOrgs.length);
      console.log('✅ Organisations filtrées:', filteredOrgs.length);
      if (filteredOrgs.length > 0) {
        console.log('📌 Résultats:', filteredOrgs.map(o => ({ id: o.id, name: o.name, initials: o.initials })));
      } else {
        console.log('❌ Aucun résultat trouvé');
        console.log('💡 Exemple de noms disponibles:', availableOrgs.slice(0, 5).map(o => o.name));
      }
      console.log('========================================');
    }
  }, [orgSearch]);

  const handleJoinSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);
    setAlertMessage(null);

    try {
      // Si l'utilisateur est propriétaire, envoyer les invitations
      if (safeIncident.isOwner) {
        if (invitedOrgs.length === 0) {
          setAlertType('warning');
          setAlertMessage('Veuillez sélectionner au moins une organisation à inviter.');
          setIsSubmitting(false);
          return;
        }

        let successCount = 0;
        let errorCount = 0;
        let errorMessages = [];

        for (const org of invitedOrgs) {
          try {
            const roleStr = org.role === 'observateur' ? 'observer' : 'contributor';
            const commentStr = org.comment || `Invitation à rejoindre l'incident en tant que ${org.role}`;
            const result = await suggestCollaborationPartnerService(safeIncident.id, {
              incident: safeIncident.id,
              suggested_organisation: org.id,
              suggested_role: roleStr,
              justification: commentStr,
              user: currentUserId ? currentUserId : null
            });
            console.log('Invitation envoyée:', result);
            successCount++;
          } catch (err) {
            console.error('Erreur envoi suggestion:', err);
            errorCount++;

            // Récupérer le message d'erreur explicite
            let errorMsg = 'Erreur inconnue';
            const data = err.response?.data;
            if (data) {
              if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
                const msg = data.non_field_errors[0];
                errorMsg = msg.includes('unique set')
                  ? 'Cette organisation a déjà été invitée ou suggérée pour cet incident.'
                  : msg;
              } else if (data.detail) {
                errorMsg = data.detail;
              } else if (data.message) {
                errorMsg = data.message;
              } else if (data.error) {
                errorMsg = data.error;
              } else {
                const keys = Object.keys(data);
                if (keys.length > 0) {
                  const val = data[keys[0]];
                  const msg = Array.isArray(val) ? val[0] : String(val);
                  errorMsg = msg.includes('unique set')
                    ? 'Cette organisation a déjà été invitée ou suggérée pour cet incident.'
                    : msg;
                } else {
                  errorMsg = err.message || 'Erreur inconnue';
                }
              }
            } else {
              errorMsg = err.message || 'Erreur inconnue';
            }

            errorMessages.push(errorMsg);
            console.error('Message d\'erreur:', errorMsg);
          }
        }

        if (successCount > 0) {
          setAlertType('success');
          setAlertMessage(`${successCount} invitation${successCount > 1 ? 's' : ''} envoyée${successCount > 1 ? 's' : ''} avec succès !`);

          // Réinitialiser la liste des organisations invitées
          setInvitedOrgs([]);

          // Rafraîchir les données
          await mutate();

          // Fermer le modal après 2 secondes si tout s'est bien passé
          if (errorCount === 0) {
            setTimeout(() => {
              closeJoinModal();
            }, 2000);
          }
        }

        if (errorCount > 0) {
          setAlertType(successCount > 0 ? 'warning' : 'danger');

          // Afficher le message d'erreur explicite
          const errorDetail = errorMessages.length > 0 ? errorMessages[0] : 'Erreur inconnue';

          setAlertMessage(
            successCount > 0
              ? `${successCount} invitation${successCount > 1 ? 's' : ''} envoyée${successCount > 1 ? 's' : ''}, mais ${errorCount} erreur${errorCount > 1 ? 's' : ''}: ${errorDetail}`
              : `Erreur lors de l'envoi des invitations: ${errorDetail}`
          );
        }

        // Réactiver le bouton
        setIsSubmitting(false);
        return;
      }

      // Vérifier si l'incident est déjà pris en charge
      const incidentEtat = safeIncident?.etat;
      const isNotTakenInCharge = incidentEtat === 'declared';

      if (isNotTakenInCharge && selfRole === 'leader') {
        // Si l'incident n'est pas pris en charge et que le rôle choisi est leader, prendre en charge (devenir leader)
        const result = await takeInChargeIncidentService(safeIncident.id, {
          mode: workMode === 'interne' ? 'internal' : 'collaborative'
        });
        console.log('Incident pris en charge:', result);
        if (result.status == "success") {
          // Si l'utilisateur a demandé à s'impliquer en privé ou travailler en interne, on bascule la visibilité en privée
          if ((isInvolvePrivate || workMode === 'interne') && safeIncident.is_public) {
            try {
              await togglePublicIncidentService(safeIncident.id);
              console.log('Incident basculé en privé avec succès');
            } catch (err) {
              console.error('Erreur lors du basculement en privé:', err);
            }
          }

          setAlertType('success');
          setAlertMessage('Vous êtes maintenant le leader de cet incident !');

          // Rafraîchir les données avec useSWR
          await mutate();
        } else {
          setAlertType('danger');
          setAlertMessage('Erreur lors de la prise en charge de l\'incident');
        }

        // Fermer le modal après 1.2 secondes
        setTimeout(() => {
          closeJoinModal();
          setIsSubmitting(false);
        }, 1200);
      } else {
        // Si l'incident est déjà pris en charge, OU s'il n'est pas pris en charge mais que l'utilisateur choisit d'être contributeur ou observateur
        // `user` (l'émetteur) est défini CÔTÉ SERVEUR = utilisateur authentifié.
        // Ne PAS l'envoyer : un mauvais id (ex. 6) provoquait « 400 Invalid pk ».
        const collaborationData = {
          incident: safeIncident.id,
          role: selfRole === 'contributeur' ? 'contributor' : selfRole === 'leader' ? 'leader' : 'observer',
          motivation: motif,
        };

        const result = await requestCollaborationService(collaborationData);
        console.log('Demande de collaboration envoyée:', result);
        setAlertType('success');
        setAlertMessage(
          isNotTakenInCharge
            ? 'Votre demande de collaboration a été envoyée !'
            : 'Votre demande a été envoyée au leader de l\'incident !'
        );

        // Fermer le modal après 1.2 secondes
        setTimeout(() => {
          closeJoinModal();
          setIsSubmitting(false);
        }, 1200);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);

      // Gérer les erreurs spécifiques
      setAlertType('danger');
      if (error.response?.status === 400) {
        setAlertMessage(error.response?.data?.message || 'Erreur : Incident déjà pris en charge ou données invalides');
      } else if (error.response?.status === 403) {
        setAlertMessage('Vous n\'avez pas la permission d\'effectuer cette action');
      } else if (error.response?.status === 404) {
        setAlertMessage('Incident non trouvé');
      } else {
        setAlertMessage('Une erreur est survenue. Veuillez réessayer.');
      }
      setIsSubmitting(false);
    }
  };

  if (isCurrentlyLoading) {
    // Si le timeout est atteint, afficher le bouton de rechargement
    if (loadingTimeout) {
      return (
        <section className="project-detail empty">
          <div className="project-detail-empty">
            <Danger size={48} variant="Bold" color="var(--color-warning)" />
            <h3 style={{ marginTop: 'var(--spacing-4)', marginBottom: 'var(--spacing-2)', color: 'var(--color-text-primary)' }}>
              Chargement trop long
            </h3>
            <p style={{ marginBottom: 'var(--spacing-5)', color: 'var(--color-text-secondary)' }}>
              Les données prennent plus de temps que prévu à se charger.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={handleRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)',
                padding: 'var(--spacing-3) var(--spacing-5)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-medium)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-surface)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <SearchStatus size={20} variant="Bold" />
              Actualiser la demande
            </button>
          </div>
        </section>
      );
    }
    return <IncidentDetailSkeleton />;
  }

  if (!incident) {
    return (
      <section className="project-detail empty">
        <div className="project-detail-empty">
          <Briefcase size={48} variant="Linear" color="var(--color-text-muted)" />
          <p>Sélectionnez un incident dans la liste pour voir ses détails</p>
        </div>
      </section>
    );
  }

  const getStatusBadge = () => {
    switch (safeIncident.etat) {
      case 'resolved':
        return safeIncident.isOwner
          ? {
            label: 'Résolu (Moi)',
            color: 'var(--color-success)',
            bg: 'rgba(34, 197, 94, 0.12)',
            border: 'rgba(34, 197, 94, 0.3)',
            icon: <ShieldTick size={14} variant="Bold" color="var(--color-success)" style={{ marginRight: '6px' }} />
          }
          : {
            label: 'Résolu (Autre)',
            color: 'var(--color-text-secondary)',
            bg: 'rgba(107, 114, 128, 0.12)',
            border: 'rgba(107, 114, 128, 0.3)',
            icon: <ShieldTick size={14} variant="Bold" color="var(--color-text-secondary)" style={{ marginRight: '6px' }} />
          };
      case 'taken_into_account':
        return safeIncident.isOwner
          ? {
            label: 'Pris en compte (Moi)',
            color: 'var(--color-primary)',
            bg: 'rgba(58, 162, 221, 0.12)',
            border: 'rgba(58, 162, 221, 0.3)',
            icon: <ClipboardTick size={14} variant="Bold" color="var(--color-primary)" style={{ marginRight: '6px' }} />
          }
          : {
            label: 'Pris en compte (Autre)',
            color: 'var(--color-warning)',
            bg: 'rgba(249, 115, 22, 0.12)',
            border: 'rgba(249, 115, 22, 0.3)',
            icon: <ClipboardTick size={14} variant="Bold" color="var(--color-warning)" style={{ marginRight: '6px' }} />
          };
      case 'declared':
      default:
        return {
          label: 'Déclaré',
          color: 'var(--color-danger)',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.3)',
          icon: <Danger size={14} variant="Bold" color="var(--color-danger)" style={{ marginRight: '6px' }} />
        };
    }
  };

  const getVisibilityBadge = () => {
    return safeIncident.is_public
      ? {
        label: 'Public',
        color: 'var(--color-success)',
        bg: 'rgba(34, 197, 94, 0.12)',
        border: 'rgba(34, 197, 94, 0.3)',
        icon: <Eye size={14} variant="Bold" color="var(--color-success)" style={{ marginRight: '6px' }} />
      }
      : {
        label: 'Privé',
        color: 'var(--color-text-secondary)',
        bg: 'rgba(107, 114, 128, 0.12)',
        border: 'rgba(107, 114, 128, 0.3)',
        icon: <EyeSlash size={14} variant="Bold" color="var(--color-text-secondary)" style={{ marginRight: '6px' }} />
      };
  };

  const getModeBadge = () => {
    if (!safeIncident?.take_in_charge_mode) return null;
    const isInternal = safeIncident.take_in_charge_mode === 'internal' || safeIncident.take_in_charge_mode === 'interne';
    return isInternal
      ? {
        label: 'Interne',
        color: 'var(--color-danger)',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.3)',
        icon: <Briefcase size={14} variant="Bold" color="var(--color-danger)" style={{ marginRight: '6px' }} />
      }
      : {
        label: 'Collaboratif',
        color: 'var(--color-primary)',
        bg: 'rgba(58, 162, 221, 0.12)',
        border: 'rgba(58, 162, 221, 0.3)',
        icon: <People size={14} variant="Bold" color="var(--color-primary)" style={{ marginRight: '6px' }} />
      };
  };

  const currentStatus = getStatusBadge();
  const visibilityBadge = getVisibilityBadge();
  const modeBadge = getModeBadge();

  const getUserRoleBadge = () => {
    const roleVal = safeIncident?.role || safeIncident?.userRole;
    if (!roleVal) return null;

    const normalizedRole = roleVal.toLowerCase();
    if (normalizedRole === 'observer' || normalizedRole === 'observateur') {
      return {
        label: 'Observateur',
        color: 'var(--color-text-secondary)',
        bg: 'rgba(108, 114, 120, 0.12)',
        border: 'rgba(108, 114, 120, 0.3)',
        icon: <Eye size={14} variant="Bold" color="var(--color-text-secondary)" style={{ marginRight: '6px' }} />
      };
    }
    if (normalizedRole === 'contributor' || normalizedRole === 'contributeur') {
      return {
        label: 'Contributeur',
        color: 'var(--color-primary)',
        bg: 'rgba(58, 162, 221, 0.12)',
        border: 'rgba(58, 162, 221, 0.3)',
        icon: <People size={14} variant="Bold" color="var(--color-primary)" style={{ marginRight: '6px' }} />
      };
    }
    if (normalizedRole === 'leader') {
      return {
        label: 'Leader',
        color: 'var(--color-warning)',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.3)',
        icon: <Crown1 size={14} variant="Bold" color="var(--color-warning)" style={{ marginRight: '6px' }} />
      };
    }
    return null;
  };

  const userRoleBadge = getUserRoleBadge();
  const userRoleVal = safeIncident?.role || safeIncident?.userRole;
  const hasParticipantRole = userRoleVal && (
    userRoleVal.toLowerCase() === 'observer' ||
    userRoleVal.toLowerCase() === 'observateur' ||
    userRoleVal.toLowerCase() === 'contributor' ||
    userRoleVal.toLowerCase() === 'contributeur'
  );

  const contextValue = {
    joinOpen,
    joinClosing,
    joinShowing,
    closeJoinModal,
    safeIncident,
    handleJoinSubmit,
    alertMessage,
    alertType,
    setAlertMessage,
    motif,
    setMotif,
    selfRole,
    setSelfRole,
    orgSearch,
    setOrgSearch,
    showOrgDropdown,
    setShowOrgDropdown,
    isLoadingOrgs,
    filteredOrgs,
    availableOrgs,
    addInvitedOrg,
    invitedOrgs,
    removeInvitedOrg,
    updateOrgRole,
    updateOrgComment,
    isSubmitting,
    ROLE_OPTIONS,
    ORG_ROLE_OPTIONS,
    isInvolvePrivate,
    setIsInvolvePrivate,
    workMode,
    setWorkMode
  };

  return (
    <IncidentDetailContext.Provider value={contextValue}>
      <section className="project-detail" style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', padding: '0' }}>
        {/* Header */}
        <div className="detail-header" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="detail-title-block">
            <button
              type="button"
              className="detail-back-btn"
              onClick={onBack}
              aria-label="Retour à la liste"
              style={{ display: 'flex', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            >
              <ArrowLeft2 size={20} variant="Linear" color="var(--color-text-primary)" />
            </button>
            <h2 className="detail-title" style={{ color: 'var(--color-text-primary)' }}>{safeIncident.title}</h2>
            {/* Badge statut */}
            <span className="detail-status-badge-custom" style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: currentStatus.bg,
              color: currentStatus.color,
              border: `1px solid ${currentStatus.border}`,
              whiteSpace: 'nowrap'
            }}>
              {currentStatus.icon}
              {currentStatus.label}
            </span>
            {/* Badge public/privé */}
            <span className="detail-visibility-badge-custom" style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: visibilityBadge.bg,
              color: visibilityBadge.color,
              border: `1px solid ${visibilityBadge.border}`,
              whiteSpace: 'nowrap'
            }}>
              {visibilityBadge.icon}
              {visibilityBadge.label}
            </span>

            {/* Badge mode d'implication (Interne/Collaboratif) */}
            {modeBadge && (
              <span className="detail-mode-badge-custom" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: modeBadge.bg,
                color: modeBadge.color,
                border: `1px solid ${modeBadge.border}`,
                whiteSpace: 'nowrap',
                marginLeft: '8px'
              }}>
                {modeBadge.icon}
                {modeBadge.label}
              </span>
            )}

            {/* Badge de rôle utilisateur (Observateur / Contributeur / Leader) */}
            {userRoleBadge && (
              <span className="detail-user-role-badge-custom" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: userRoleBadge.bg,
                color: userRoleBadge.color,
                border: `1px solid ${userRoleBadge.border}`,
                whiteSpace: 'nowrap',
                marginLeft: '8px'
              }}>
                {userRoleBadge.icon}
                {userRoleBadge.label}
              </span>
            )}

            {/* Bouton Prendre en compte / Inviter - Réservé à l'Admin d'organisation (matrice §6 :
                agir sur incident / inviter / collaborer). Masqué si l'incident est géré en interne
                ou si l'utilisateur a déjà un rôle. */}
            {canActOnIncident() && !(safeIncident?.take_in_charge_mode === 'internal' || safeIncident?.take_in_charge_mode === 'interne') && !hasParticipantRole && (
              <button
                type="button"
                className="detail-action-btn-custom"
                onClick={openJoinModal}
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-surface)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2E8BC0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
              >
                <UserAdd size={18} variant="Bold" color="var(--color-surface)" />
                {safeIncident.isOwner
                  ? 'Inviter des organisations'
                  : safeIncident?.etat === 'declared'
                    ? "S'impliquer"
                    : "Rejoindre l'action"
                }
              </button>
            )}
          </div>
          {/* Méta-infos */}
          <div className="detail-meta" style={{ marginTop: '8px' }}>
            <div className="detail-meta-item">
              <Location size={14} variant="Bold" color="var(--color-text-muted)" />
              <span>{safeIncident.zone || safeIncident.location}</span>
            </div>
            <div className="detail-meta-item">
              <Calendar size={14} variant="Bold" color="var(--color-text-muted)" />
              <span>Déclaré le {safeIncident.startDate}</span>
            </div>
            <div className="detail-meta-item">
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ID #{safeIncident.id}</span>
            </div>
          </div>

          {/* ── Flux de résolution : actions gated par rôle + état ── */}
          {(() => {
            const etat = safeIncident.etat;
            const buttons = [];

            const baseBtnStyle = {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: resolutionBusy ? 'not-allowed' : 'pointer',
              opacity: resolutionBusy ? 0.6 : 1,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            };

            const addBtn = (key, label, onClick, color, icon) => buttons.push(
              <button
                key={key}
                type="button"
                onClick={onClick}
                disabled={resolutionBusy}
                style={{ ...baseBtnStyle, backgroundColor: color, color: 'var(--color-surface)' }}
              >
                {icon}
                {label}
              </button>
            );

            const iconPrepare = <ClipboardTick size={18} variant="Bold" color="var(--color-surface)" />;
            const iconResolve = <ShieldTick size={18} variant="Bold" color="var(--color-surface)" />;
            const iconReturn = <ArrowLeft2 size={18} variant="Bold" color="var(--color-surface)" />;
            const iconValidate = <TickCircle size={18} variant="Bold" color="var(--color-surface)" />;
            const iconReject = <CloseCircle size={18} variant="Bold" color="var(--color-surface)" />;

            if (etat === 'taken_into_account') {
              if (canPrepareResolution()) addBtn('prepare', 'Préparer la résolution', handlePrepareResolution, 'var(--color-primary)', iconPrepare);
              if (canDeclareResolved()) addBtn('declare', 'Déclarer résolu', handleDeclareResolved, 'var(--color-success)', iconResolve);
              if (canDisengage() && safeIncident.isOwner) addBtn('disengage', 'Se désengager', handleDisengage, 'var(--color-danger)', iconReject);
            } else if (etat === 'resolution_prepared') {
              if (canDeclareResolved()) addBtn('declare', 'Déclarer résolu', handleDeclareResolved, 'var(--color-success)', iconResolve);
              if (canDeclareResolved()) addBtn('return', 'Renvoyer pour complément', handleReturnForCompletion, 'var(--color-warning)', iconReturn);
            } else if (etat === 'in_validation') {
              if (canValidateResolution()) {
                addBtn('validate', 'Valider la résolution', handleValidateResolution, 'var(--color-success)', iconValidate);
                addBtn('reject', 'Refuser', handleRejectResolution, 'var(--color-danger)', iconReject);
              }
            }

            // Note de statut lecture seule pour que tous les rôles voient l'état
            const statusNote = etat === 'in_validation'
              ? 'Résolution déclarée — en attente de validation par le Super Admin.'
              : etat === 'resolved_definitive'
                ? 'Résolution validée définitivement.'
                : null;

            if (buttons.length === 0 && !statusNote && !resolutionFeedback) return null;

            return (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {buttons.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {buttons}
                  </div>
                )}
                {statusNote && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)'
                  }}>
                    <ShieldTick size={16} variant="Bold" color="var(--color-text-secondary)" />
                    {statusNote}
                  </div>
                )}
                {resolutionFeedback && (
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: resolutionFeedback.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'
                  }}>
                    {resolutionFeedback.message}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Phase 4 : assignation org (Super Admin) / accept-decline (Org Admin) / signalement (Bureau Agent) ── */}
          {(() => {
            const ctrlBtnStyle = {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: resolutionBusy ? 'not-allowed' : 'pointer',
              opacity: resolutionBusy ? 0.6 : 1,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            };

            // Super Admin : assigner à une organisation (uniquement s'il n'y a pas déjà une assignation en attente)
            const showAssignToOrg = canAssignToOrg() && !pendingOrgAssignment;
            // Org Admin : assignation en attente ciblant son organisation
            const showAcceptDecline = isOrgAdmin() && !!myPendingOrgAssignment;
            // Bureau Agent : incident déclaré → signaler à l'Admin
            const showReportToAdmin = canReportToAdmin() && safeIncident.etat === 'declared';

            if (!showAssignToOrg && !showAcceptDecline && !showReportToAdmin) return null;

            return (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {showAssignToOrg && !assignOrgOpen && (
                    <button
                      type="button"
                      onClick={() => setAssignOrgOpen(true)}
                      disabled={resolutionBusy}
                      style={{ ...ctrlBtnStyle, backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' }}
                    >
                      <Buildings2 size={18} variant="Bold" color="var(--color-surface)" />
                      Assigner à une organisation
                    </button>
                  )}

                  {showAssignToOrg && assignOrgOpen && (
                    <>
                      <select
                        value={selectedAssignOrgId}
                        onChange={(e) => setSelectedAssignOrgId(e.target.value)}
                        disabled={resolutionBusy || isLoadingAssignOrgs}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text-primary)',
                          fontSize: '14px',
                          minWidth: '220px'
                        }}
                      >
                        <option value="">
                          {isLoadingAssignOrgs ? 'Chargement…' : '— Sélectionner une organisation —'}
                        </option>
                        {assignOrgs.map((org) => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAssignToOrganisation}
                        disabled={resolutionBusy || !selectedAssignOrgId}
                        style={{ ...ctrlBtnStyle, backgroundColor: 'var(--color-success)', color: 'var(--color-surface)' }}
                      >
                        <TickCircle size={18} variant="Bold" color="var(--color-surface)" />
                        Confirmer
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAssignOrgOpen(false); setSelectedAssignOrgId(''); }}
                        disabled={resolutionBusy}
                        style={{ ...ctrlBtnStyle, backgroundColor: 'var(--color-text-secondary)', color: 'var(--color-surface)' }}
                      >
                        <CloseCircle size={18} variant="Bold" color="var(--color-surface)" />
                        Annuler
                      </button>
                    </>
                  )}

                  {showAcceptDecline && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAcceptOrgAssignment(myPendingOrgAssignment.id)}
                        disabled={resolutionBusy}
                        style={{ ...ctrlBtnStyle, backgroundColor: 'var(--color-success)', color: 'var(--color-surface)' }}
                      >
                        <TickCircle size={18} variant="Bold" color="var(--color-surface)" />
                        Accepter l'assignation
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineOrgAssignment(myPendingOrgAssignment.id)}
                        disabled={resolutionBusy}
                        style={{ ...ctrlBtnStyle, backgroundColor: 'var(--color-danger)', color: 'var(--color-surface)' }}
                      >
                        <CloseCircle size={18} variant="Bold" color="var(--color-surface)" />
                        Refuser
                      </button>
                    </>
                  )}

                  {showReportToAdmin && (
                    <button
                      type="button"
                      onClick={handleReportToAdmin}
                      disabled={resolutionBusy}
                      style={{ ...ctrlBtnStyle, backgroundColor: 'var(--color-warning)', color: 'var(--color-surface)' }}
                    >
                      <Danger size={18} variant="Bold" color="var(--color-surface)" />
                      Signaler à mon Admin
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="incident-dark-dashboard">

          {/* ── Colonne gauche ── */}
          <div className="dashboard-col-left">

            {/* Photo */}
            <div className="dark-card" style={{ marginBottom: '20px', padding: '16px' }}>
              <div className="dark-card-title">
                PHOTO DE L'INCIDENT
              </div>
              <div className="incident-image-container"
                style={{
                  position: 'relative',
                  overflow: 'hidden', borderRadius: '8px',
                  minHeight: '180px',
                  backgroundColor: '#d2d6deff'
                }}>
                {safeIncident.image ? (
                  <>
                    {!imageLoaded && (
                      <div className="shimmer-box" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#d2d6deff',
                        zIndex: 2
                      }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          border: '3px solid var(--color-primary)',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      </div>
                    )}
                    <img
                      src={safeIncident.image}
                      alt="Incident"
                      className="incident-actual-image clickable"
                      onClick={() => setIsImageModalOpen(true)}
                      onLoad={() => setImageLoaded(true)}
                      style={{
                        filter: imageLoaded ? 'none' : 'blur(16px)',
                        transition: 'filter 0.4s ease-out, opacity 0.4s ease-out',
                        opacity: imageLoaded ? 1 : 0.5
                      }}
                    />
                  </>
                ) : (
                  <div className="image-placeholder">
                    <p>Aucune photo disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Audio */}
            {safeIncident.aiAnalysis?.audio && (() => {
              const progressPercent = duration ? (currentTime / duration) * 100 : 0;
              return (
                <div className="dark-card" style={{ marginBottom: '20px', padding: '16px' }}>
                  <div className="dark-card-title">
                    MESSAGE VOCAL
                  </div>
                  <div className="detail-audio-player">
                    <button
                      type="button"
                      className="detail-audio-play-btn"
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pause' : 'Lire'}
                    >
                      {isPlaying ? (
                        <Pause size={16} variant="Bold" color="var(--color-surface)" />
                      ) : (
                        <Play size={16} variant="Bold" color="var(--color-surface)" />
                      )}
                    </button>
                    <div className="detail-audio-track">
                      <div className="detail-audio-progress" onClick={seekAudio} role="slider" tabIndex={0} aria-label="Progression audio">
                        <div className="detail-audio-progress-fill" style={{ width: `${progressPercent}%` }} />
                      </div>
                      <div className="detail-audio-times">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                    <audio
                      ref={audioRef}
                      src={safeIncident.aiAnalysis.audio}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onTimeUpdate={onAudioTimeUpdate}
                      onLoadedMetadata={onAudioLoaded}
                      onEnded={onAudioEnded}
                      preload="metadata"
                    />
                  </div>
                </div>
              );
            })()}

            {/* Coordonnées GPS */}
            <div className="dark-card" style={{ marginBottom: '20px', padding: '16px' }}>
              <div className="dark-card-title">
                COORDONNÉES GPS
              </div>
              {safeIncident.coordinates ? (
                <>
                  <div className="gps-inputs">
                    <div className="dark-input-group">
                      <label>Latitude</label>
                      <input type="text" className="dark-input" value={safeIncident.coordinates.lat} readOnly />
                    </div>
                    <div className="dark-input-group">
                      <label>Longitude</label>
                      <input type="text" className="dark-input" value={safeIncident.coordinates.lng} readOnly />
                    </div>
                  </div>
                  {/* Mini-carte */}
                  <div className="detail-geo-map" style={{ marginTop: '12px', height: '180px', borderRadius: '8px', overflow: 'hidden' }}>
                    <Map
                      cooperativeGestures={true}
                      initialViewState={{
                        longitude: safeIncident.coordinates.lng,
                        latitude: safeIncident.coordinates.lat,
                        zoom: 14
                      }}
                      mapboxAccessToken={MAPBOX_TOKEN}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle="mapbox://styles/mapbox/streets-v12"
                    >
                      <Marker longitude={safeIncident.coordinates.lng} latitude={safeIncident.coordinates.lat} anchor="bottom">
                        <div className="project-map-marker">
                          <Location size={24} variant="Bold" color="var(--color-danger)" />
                        </div>
                      </Marker>
                    </Map>
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Coordonnées non disponibles</p>
              )}
            </div>



            {/* Description */}
            <div className="dark-card" style={{ marginBottom: '20px', padding: '16px' }}>
              <div className="dark-card-title">
                DESCRIPTION
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
                {safeIncident.description && safeIncident.description.trim()
                  ? safeIncident.description
                  : 'Aucune description disponible pour cet incident.'}
              </p>
            </div>

            {/* Vidéo */}
            <div className="dark-card" style={{ padding: '16px' }}>
              <div className="dark-card-title">
                VIDÉO DE L'INCIDENT
              </div>
              {safeIncident.video ? (
                <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000', aspectRatio: '16/9' }}>
                  <video
                    controls
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
                    src={safeIncident.video}
                  >
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '40px 20px',
                  backgroundColor: 'var(--color-background)',
                  borderRadius: '8px',
                  border: '1px dashed var(--color-border)',
                  color: 'var(--color-text-muted)',
                  fontSize: '14px'
                }}>
                  <span>Aucune vidéo disponible pour cet incident</span>
                </div>
              )}
            </div>

          </div>

          {/* ── Colonne droite ── */}
          <div className="dashboard-col-right">
            {!pred || pred?.length === 0 ?
              (
                <div style={{
                  padding: 'var(--spacing-8) var(--spacing-6)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-4)',
                  minHeight: '400px',
                  border: '1px dashed var(--color-border)',
                }}>
                  {/* <MagicStar size={48} variant="Bold" color="var(--color-text-muted)" style={{ opacity: 0.6 }} /> */}
                  <h3 style={{ margin: 0, fontSize: 'var(--font-size-h3)', color: 'var(--color-text-primary)' }}>Aucune Prédiction IA</h3>
                  <p style={{ fontSize: 'var(--font-size-body-small)', color: 'var(--color-text-secondary)', lineHeight: '1.6', maxWidth: '320px', margin: 0 }}>
                    L'analyse prédictive, satellite et de vulnérabilité sociale n'a pas encore été générée pour cet incident.
                  </p>
                  <div className='body-large'>
                    Attente du traitement par le modèle IA...
                  </div>
                </div>
              ) : (
                <>
                  {/* KPIs - Top 4 cards */}
                  <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {/* Score d'impact global */}
                    <div className="kpi-card" style={{ margin: 0 }}>
                      <Danger size={32} variant="Bold" color="var(--color-warning)" />
                      <div className="kpi-value" style={{ fontSize: '28px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning)' }}>
                        {pred.global_impact_score}
                      </div>
                      <div className="kpi-label">SCORE D'IMPACT GLOBAL</div>
                    </div>
                    {/* Statut stepper - SUIVI DE L'INCIDENT */}
                    {(() => {
                      const currentIndex = INCIDENT_STATUS_STEPS.findIndex(s => s.id === safeIncident.etat);
                      const validIndex = currentIndex === -1 ? 0 : currentIndex;
                      return (
                        <div className="dark-card" style={{ marginBottom: '20px', padding: '16px' }}>
                          <div className="dark-card-title">
                            SUIVI DE L'INCIDENT
                          </div>
                          <div className="incident-status-stepper">
                            <div className="incident-status-bar">
                              {INCIDENT_STATUS_STEPS.map((step, idx) => (
                                <div key={step.id} className={`incident-status-segment ${idx < validIndex ? 'is-done' : ''} ${idx === validIndex ? 'is-current' : ''}`} />
                              ))}
                            </div>
                            <div className="incident-status-steps">
                              {INCIDENT_STATUS_STEPS.map((step, idx) => (
                                <div key={step.id} className={`incident-status-step ${idx < validIndex ? 'is-done' : ''} ${idx === validIndex ? 'is-current' : ''}`}>
                                  <span className="incident-status-dot" />
                                  <span className="incident-status-label">{step.label.toUpperCase()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>


                  {/* ANALYSE IA VISION */}
                  <div className="dark-card" style={{ marginBottom: 'var(--spacing-5)', padding: 'var(--spacing-4)' }}>
                    <div className="dark-card-title" style={{ marginBottom: 'var(--spacing-4)' }}>
                      ANALYSE IA VISION
                    </div>

                    {/* Badge IA Vision Engagée */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-1)',
                      padding: 'var(--spacing-1) var(--spacing-3)',
                      backgroundColor: 'var(--color-background)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-success)',
                      marginBottom: 'var(--spacing-3)'
                    }}>
                      <span style={{ fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-success)' }}>
                        {pred.status === 'completed' ? 'IA Vision Terminée' : 'IA Vision Engagée'}
                      </span>
                    </div>

                    {/* GÉOCIBLAGE IA (DISPLAY NAME & GEOCIBLAGE) */}
                    <div style={{
                      padding: 'var(--spacing-3)',
                      backgroundColor: 'var(--color-background)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      marginBottom: 'var(--spacing-4)'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)', textTransform: 'uppercase' }}>
                        Géolocalisation Estimée
                      </div>
                      <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-1)', lineHeight: '1.4' }}>
                        {pred.display_name}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-body-small)', color: 'var(--color-text-secondary)' }}>
                        Ville: <strong>{pred.city}</strong> | Région: <strong>{pred.region}</strong> | Pays: <strong>{pred.country}</strong>
                      </div>
                      <div style={{ fontSize: 'var(--font-size-body-small)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
                        Coords: <strong>{pred.latitude}, {pred.longitude}</strong>
                      </div>
                    </div>

                    {/* Motif détecté */}
                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-1)',
                        padding: 'var(--spacing-1) var(--spacing-2)',
                        backgroundColor: 'var(--color-background)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-danger)',
                        marginBottom: 'var(--spacing-2)'
                      }}>
                        <span style={{ fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-danger)' }}>
                          Motif ({pred.sub_category})
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--font-size-body-small)', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
                        {pred.incident_type || `${pred.macro_category} — ${pred.sub_category}`}
                      </p>
                    </div>

                    {/* Description de l'analyse */}
                    <p style={{ fontSize: 'var(--font-size-body-small)', color: 'var(--color-text-secondary)', lineHeight: '1.7', margin: 0 }}>
                      {pred.analysis || pred.description}
                    </p>

                    {/* Vecteurs de propagation */}
                    <div style={{ marginTop: 'var(--spacing-4)' }}>
                      <div style={{ fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        VECTEURS DE PROPAGATION
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                        {(pred.spread_vectors || []).map((vector, idx) => (
                          <span key={idx} style={{ padding: 'var(--spacing-1) var(--spacing-2)', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-medium)' }}>
                            {vector}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tags d'impact secondaires */}
                    <div style={{ marginTop: 'var(--spacing-4)' }}>
                      <div style={{ fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        TAGS D'IMPACT SECONDAIRES
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                        {(pred.impact_tags || []).map((tag, idx) => (
                          <span key={idx} style={{ padding: 'var(--spacing-1) var(--spacing-2)', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-success)', color: 'var(--color-success)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-medium)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SATELLITE PLOTS VISUALISATION */}
                  {(pred.ndvi_heatmap || pred.ndvi_ndwi_plot || pred.landcover_plot) && (
                    <div className="dark-card" style={{ marginBottom: 'var(--spacing-5)', padding: 'var(--spacing-4)' }}>
                      <div className="dark-card-title" style={{ marginBottom: 'var(--spacing-4)' }}>
                        IMAGERIE SPECTRE & COUVERTURE SATELLITE
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--spacing-3)' }}>
                        {pred.ndvi_heatmap && (
                          <div style={{ textAlign: 'center' }}>
                            <img src={pred.ndvi_heatmap} alt="NDVI Heatmap" style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                            <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Heatmap NDVI</div>
                          </div>
                        )}
                        {pred.ndvi_ndwi_plot && (
                          <div style={{ textAlign: 'center' }}>
                            <img src={pred.ndvi_ndwi_plot} alt="NDVI/NDWI Plot" style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                            <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>NDVI / NDWI Plot</div>
                          </div>
                        )}
                        {pred.landcover_plot && (
                          <div style={{ textAlign: 'center' }}>
                            <img src={pred.landcover_plot} alt="Landcover Plot" style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                            <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Couverture du Sol</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3 PILIERS D'IMPACT */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    {/* Pilier Social */}
                    <div className="dark-card" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
                        <span style={{ fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Pilier Social
                        </span>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>PERSONNES EXPOSÉES</div>
                        <div style={{ fontSize: '20px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                          {pred.total_population_exposed}
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>FEMMES ADULTES</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.adult_women_exposed}
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>HOMMES ADULTES</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.adult_men_exposed}
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>ENFANTS {'(<15 ANS)'}</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.children_exposed}
                        </div>
                      </div>

                      {/* VULNERABILITE SOCIALE */}
                      <div style={{ marginBottom: 'var(--spacing-3)', paddingTop: 'var(--spacing-2)', borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>VULNÉRABILITÉ SOCIALE</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
                          <span style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>{pred.social_vulnerability_score}/10</span>
                          {pred.is_social_probabilistic && (
                            <span style={{ fontSize: '9px', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '2px 4px', borderRadius: 'var(--radius-sm)', fontWeight: 'var(--font-weight-semibold)' }}>PROB</span>
                          )}
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>MATERNITÉS</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.maternities_count ?? pred.maternities ?? 0}
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>CRÈCHES</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.nurseries_count ?? pred.nurseries ?? 0}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>CENTRES DE SANTÉ</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.health_centers ?? 0}
                        </div>
                      </div>
                    </div>

                    {/* Pilier Environnemental */}
                    <div className="dark-card" style={{ padding: 'var(--spacing-4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
                        <span style={{ fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Pilier Environnemental
                        </span>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>TEMPÉRATURE</div>
                        <div style={{ fontSize: '20px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
                          {pred.topography?.temperature_celsius ?? 40.5}°C
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>PRÉCIPITATIONS</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.topography?.precipitation ?? 0} mm
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>VENT</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.topography?.wind_speed ?? 7.5} km/h
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>PENTE</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {parseFloat(pred.topography?.slope_percent ?? 3.41656).toFixed(4)}%
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>NDVI</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {parseFloat(pred.satellite?.ndvi ?? 0.176).toFixed(3)}
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>NDWI</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {parseFloat(pred.satellite?.ndwi ?? -0.363).toFixed(3)}
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>OCCUPATION DU SOL</div>
                        <div style={{ fontSize: 'var(--font-size-body-small)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.satellite?.land_use || 'Urbain / Bâti'}
                        </div>
                      </div>

                      {/* ALTITUDE */}
                      <div>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>ALTITUDE</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.topography?.elevation ?? 0} m
                        </div>
                      </div>
                    </div>

                    {/* Pilier Économique */}
                    <div className="dark-card" style={{ padding: 'var(--spacing-4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
                        <span style={{ fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Pilier Économique
                        </span>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>ÉCOLES</div>
                        <div style={{ fontSize: '20px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning)' }}>
                          {pred.schools ?? pred.social_data?.schools ?? 0}
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>MARCHÉS</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.markets ?? pred.social_data?.markets ?? 0}
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>SOURCES D'EAU</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.water_points ?? pred.social_data?.water_points ?? 0}
                        </div>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>ROUTES / PONTS</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.main_roads_bridges ?? pred.social_data?.main_roads_bridges ?? 0}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>BÂTIMENTS</div>
                        <div style={{ fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {pred.residential_buildings ?? pred.social_data?.residential_buildings ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ALERTE PROPAGATION */}
                  <div style={{
                    padding: 'var(--spacing-4)',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-warning)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--spacing-5)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-body-small)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning)', marginBottom: 'var(--spacing-2)' }}>
                          ALERTE PROPAGATION : {pred.potential_risk?.message || `Risque de propagation secondaire par courant d'eau estimé à ≥${pred.impact_radius_meters}m.`}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                          <div style={{ marginBottom: 'var(--spacing-1)' }}>
                            <strong style={{ color: 'var(--color-text-primary)' }}>POPULATION POTENTIELLE EXPOSÉE :</strong> {pred.potential_risk?.stats?.total_pop ?? pred.total_population_exposed} pers.
                          </div>
                          <div>
                            <strong style={{ color: 'var(--color-text-primary)' }}>BÂTIMENTS DANS LA ZONE À RISQUE :</strong> {pred.potential_risk?.stats?.infrastructures ?? pred.residential_buildings} sites
                          </div>
                          {pred.potential_risk && (
                            <div style={{ marginTop: 'var(--spacing-2)', paddingTop: 'var(--spacing-2)', borderTop: '1px dashed var(--color-warning)' }}>
                              <div>Vecteur de propagation: <strong>{pred.potential_risk.vector}</strong></div>
                              <div style={{ marginTop: '2px' }}>Distance: <strong>+{pred.potential_risk.distance}m</strong> (Rayon potentiel: <strong>{pred.potential_risk.potential_radius}m</strong>)</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INTERVENTION RECOMMANDÉE */}
                  <div style={{
                    padding: 'var(--spacing-4)',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-success)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--spacing-5)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-body-small)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)', marginBottom: 'var(--spacing-2)' }}>
                          {pred.recommendation || pred.piste_solution || `Intervention recommandée dans un rayon de ${pred.impact_radius_meters}m. Score de gravité: ${pred.global_impact_score}/10.`}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)', lineHeight: '1.6', display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
                          <div>
                            <People size={14} variant="Bold" color="var(--color-success)" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                            <strong>{pred.adult_women_exposed} femmes adultes</strong>
                          </div>
                          <div>
                            <People size={14} variant="Bold" color="var(--color-success)" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                            <strong>{pred.adult_men_exposed} hommes adultes</strong>
                          </div>
                          <div>
                            <People size={14} variant="Bold" color="var(--color-success)" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                            <strong>{pred.children_exposed} enfants {'(<15 ans)'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>

        {/* Floating Chatbot Button */}
        <button className="floating-chatbot" onClick={() => setChatOpen(!chatOpen)} aria-label="Ouvrir l'assistant de chat">
          {chatOpen ? <CloseCircle size={28} variant="Bold" color="#FFFFFF" /> : <Message size={28} variant="Bold" color="#FFFFFF" />}
        </button>

        {/* Chatbot Panel */}
        {chatOpen && (
          <div className="chatbot-panel">
            <div className="chatbot-header">
              <div className="chatbot-header-title">
                Assistant IA Map Action
              </div>
              <button type="button" onClick={() => setChatOpen(false)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Fermer l'assistant de chat">
                <CloseCircle size={20} variant="Linear" color='#ffffff' />
              </button>
            </div>

            {isLoadingPrediction ? (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-surface)'
              }}>
                <span className="chatbot-btn-spinner" style={{ width: '24px', height: '24px', border: '3px solid rgba(58, 162, 221, 0.25)', borderTopColor: 'var(--color-primary)' }} />
              </div>
            ) : !pred ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface)'
              }}>
                <Warning2 size={48} variant="Bold" color="var(--color-warning)" style={{ marginBottom: '16px' }} />
                <h4 style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  Chat indisponible
                </h4>
                <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
                  Le chat n'est pas disponible pour cet incident car aucune prédiction/analyse n'a encore été générée.
                </p>
              </div>
            ) : (
              <>
                <div className="chatbot-messages">
                  {messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`chat-bubble ${msg.sender}`}>
                      {msg.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="chatbot-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>

                {chatError && (
                  <div className="chatbot-error-message">
                    <CloseCircle size={16} variant="Bold" color="#EF4444" />
                    <span>{chatError}</span>
                  </div>
                )}

                <form className="chatbot-input-area" onSubmit={handleSendMessage}>
                  <textarea
                    className="chatbot-input"
                    placeholder="Posez votre question..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    disabled={isTyping}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    rows={2}
                  />
                  <button type="submit" className="chatbot-send-btn" disabled={isTyping || !chatMessage.trim()}>
                    {isTyping ? (
                      <span className="chatbot-btn-spinner" />
                    ) : (
                      <Send2 size={18} variant="Bold" color='#ffffff' />
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* Modal Rejoindre l'action / Inviter des organisations */}
        <InviteOrgModal key={"InviteOrgModalIncident"} />
        {/* Modal pour afficher l'image en grand */}
        {isImageModalOpen && safeIncident.image && (
          <div className="image-zoom-modal" onClick={() => setIsImageModalOpen(false)}>
            <button className="image-zoom-close" onClick={() => setIsImageModalOpen(false)}>
              <CloseCircle size={32} variant="Bold" color="#FFF" />
            </button>
            <img src={safeIncident.image} alt="Incident Zoom" className="image-zoom-content" onClick={(e) => e.stopPropagation()} />
          </div>
        )}

      </section>
    </IncidentDetailContext.Provider>
  );
};

export default IncidentDetail;
