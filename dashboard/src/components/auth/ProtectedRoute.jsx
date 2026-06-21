import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../pages/auth/services/authService';
import { getUserRole } from '../../utils/roleHelpers';

/**
 * Composant qui protège les routes en vérifiant l'authentification.
 * Si l'utilisateur n'est pas connecté, redirige vers /login.
 *
 * @param {string[]} [allowedRoles] - Si fourni, seuls ces rôles web peuvent
 *   accéder à la route ; les autres sont redirigés vers /dashboard.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirige vers login en sauvegardant la page demandée
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(getUserRole())) {
    // Authentifié mais rôle non autorisé : retour au dashboard (pas login)
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
