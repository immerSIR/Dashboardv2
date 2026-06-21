/**
 * roleHelpers — source unique pour la logique de rôles côté web.
 *
 * Le backend renvoie un `web_role` canonique sur l'objet utilisateur :
 *   - 'super_admin'  → opérateur de la plateforme (supervise, n'opère pas)
 *   - 'org_admin'    → admin d'organisation (décide et engage l'organisation)
 *   - 'bureau_agent' → agent de bureau (opère au quotidien)
 *   - 'field_agent' / null → pas d'accès web (mobile uniquement)
 *
 * Les prédicats de permission sont dérivés de la matrice §6 de
 * `Map_Action_Logique_des_roles.md`.
 */
import { authService } from '../pages/auth/services/authService';

// Constantes de rôles canoniques
export const SUPER_ADMIN = 'super_admin';
export const ORG_ADMIN = 'org_admin';
export const BUREAU_AGENT = 'bureau_agent';

/**
 * Récupère le rôle web de l'utilisateur connecté (null-safe).
 * @returns {string|null}
 */
export const getUserRole = () => authService.getCurrentUser()?.web_role ?? null;

/**
 * Petit hook pour récupérer le rôle dans un composant.
 * (Le rôle vit dans sessionStorage, il ne change pas pendant la session ;
 * on lit simplement la valeur courante.)
 * @returns {string|null}
 */
export const useUserRole = () => getUserRole();

// Helpers d'identité de rôle
export const isSuperAdmin = (role = getUserRole()) => role === SUPER_ADMIN;
export const isOrgAdmin = (role = getUserRole()) => role === ORG_ADMIN;
export const isBureauAgent = (role = getUserRole()) => role === BUREAU_AGENT;

// Prédicats de permission (matrice §6)
export const canActOnIncident = (role = getUserRole()) => role === ORG_ADMIN;
export const canDeclareResolved = (role = getUserRole()) => role === ORG_ADMIN;
export const canValidateResolution = (role = getUserRole()) => role === SUPER_ADMIN;
export const canAssignToOrg = (role = getUserRole()) => role === SUPER_ADMIN;
export const canAssignToAgents = (role = getUserRole()) => role === ORG_ADMIN;
export const canDeleteIncident = (role = getUserRole()) => role === SUPER_ADMIN;
export const canManageOrganisations = (role = getUserRole()) => role === SUPER_ADMIN;
export const canManageUsers = (role = getUserRole()) =>
  role === ORG_ADMIN || role === SUPER_ADMIN;
export const canAccessTrash = (role = getUserRole()) => role === SUPER_ADMIN;
export const canRequestCollaboration = (role = getUserRole()) => role === ORG_ADMIN;
export const canDisengage = (role = getUserRole()) => role === ORG_ADMIN;
export const canSuggestTasks = (role = getUserRole()) =>
  role === ORG_ADMIN || role === BUREAU_AGENT;
export const canPrepareResolution = (role = getUserRole()) =>
  role === ORG_ADMIN || role === BUREAU_AGENT;

export default {
  SUPER_ADMIN,
  ORG_ADMIN,
  BUREAU_AGENT,
  getUserRole,
  useUserRole,
  isSuperAdmin,
  isOrgAdmin,
  isBureauAgent,
  canActOnIncident,
  canDeclareResolved,
  canValidateResolution,
  canAssignToOrg,
  canAssignToAgents,
  canDeleteIncident,
  canManageOrganisations,
  canManageUsers,
  canAccessTrash,
  canRequestCollaboration,
  canDisengage,
  canSuggestTasks,
  canPrepareResolution,
};
