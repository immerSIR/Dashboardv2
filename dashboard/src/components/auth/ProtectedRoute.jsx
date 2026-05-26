import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../pages/auth/services/authService';

/**
 * Composant qui protège les routes en vérifiant l'authentification.
 * Si l'utilisateur n'est pas connecté, redirige vers /login.
 */
export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirige vers login en sauvegardant la page demandée
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
