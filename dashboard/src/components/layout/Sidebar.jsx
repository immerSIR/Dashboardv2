import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Element4, People, ProfileCircle, Clock, Briefcase, Award, Trash, Buildings2, Profile2User, Lock1, ClipboardTick } from 'iconsax-react';
import logoMapAction from '../../assets/logo.svg';
import logoMapActionMin from '../../assets/logo-min.svg';
import './sidebar.css';
import {
  User,          // Mon profil
  Setting2,      // Paramètres
  LogoutCurve,   // Déconnexion
  People as IconsaxPeople
} from 'iconsax-react';
import { getUserRole, SUPER_ADMIN, ORG_ADMIN, BUREAU_AGENT } from '../../utils/roleHelpers';
 
export const Sidebar = ({ isOpen, onClose, isCollapsed: controlledCollapsed, onCollapsedChange, onToggleCollapse }) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleCollapsed = () => {
    const newCollapsedState = !isCollapsed;
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsedState);
    } else if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(newCollapsedState);
    }
  };
  const userRole = getUserRole();

  // Chaque entrée déclare les rôles autorisés à la voir, et éventuellement
  // un libellé spécifique par rôle (labelByRole). Voir spec §1.
  const allNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Element4,
      path: '/dashboard',
      roles: [SUPER_ADMIN, ORG_ADMIN, BUREAU_AGENT]
    },
    {
      id: 'collaboration',
      label: 'Collaborations',
      icon: IconsaxPeople,
      path: '/collaboration',
      roles: [SUPER_ADMIN, ORG_ADMIN, BUREAU_AGENT]
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: Briefcase,
      path: '/incidents',
      roles: [SUPER_ADMIN, ORG_ADMIN, BUREAU_AGENT]
    },
    {
      id: 'implication-privee',
      label: 'Implication privée',
      icon: Lock1,
      path: '/implication-privee',
      roles: [SUPER_ADMIN, ORG_ADMIN, BUREAU_AGENT]
    },
    {
      // « Mes interventions » : côté organisation uniquement (Admin / Agent).
      // Réutilise la route incidents (pas de route dédiée existante).
      id: 'interventions',
      label: 'Mes interventions',
      icon: ClipboardTick,
      path: '/incidents',
      roles: [ORG_ADMIN, BUREAU_AGENT]
    },
    {
      id: 'organisations',
      label: 'Organisations',
      icon: Buildings2,
      path: '/organisations',
      roles: [SUPER_ADMIN]
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: Profile2User,
      path: '/agents',
      roles: [SUPER_ADMIN, ORG_ADMIN, BUREAU_AGENT],
      // L'agent de bureau voit « Mon équipe » (même route).
      labelByRole: { [BUREAU_AGENT]: 'Mon équipe' }
    },
    {
      id: 'impact',
      label: 'Impact',
      icon: Award,
      path: '/impact',
      roles: [SUPER_ADMIN, ORG_ADMIN, BUREAU_AGENT]
    },
    {
      id: 'profile',
      label: 'Mon profil',
      icon: User,
      path: '/profile',
      roles: [SUPER_ADMIN, ORG_ADMIN, BUREAU_AGENT]
    },
    {
      id: 'trash',
      label: 'Corbeille',
      icon: Trash,
      path: '/trash',
      roles: [SUPER_ADMIN]
    }
  ];

  // Filtre par rôle, et applique le libellé spécifique au rôle s'il existe.
  // Si le rôle est inconnu (null), on n'affiche aucune entrée restreinte —
  // mais par défaut on montre tout pour ne pas casser les sessions sans rôle.
  const navItems = allNavItems
    .filter((item) => !userRole || item.roles.includes(userRole))
    .map((item) => ({
      ...item,
      label: (item.labelByRole && item.labelByRole[userRole]) || item.label
    }));

  const handleItemClick = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isActive = (path) => {
    if (location.pathname === path) return true;
    if (path !== '/' && location.pathname.startsWith(path + '/')) return true;
    if (path === '/collaboration' && location.pathname.startsWith('/collaboration-detail')) return true;
    return false;
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Bouton Toggle Flottant - Au-dessus de tout */}
        <button 
          className="sidebar-toggle-btn"
          onClick={() => {
            // Sur mobile: fermer l'overlay
            if (window.innerWidth < 1024) {
              onClose();
            } else {
              // Sur desktop: toggle collapsed state
              handleToggleCollapsed();
            }
          }}
          aria-label={isCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            {isCollapsed ? (
              <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </button>
        
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {isCollapsed ? (
              <img src={logoMapActionMin} alt="Map Action" className="logo-image-min" />
            ) : (
              <img src={logoMapAction} alt="Map Action" className="logo-image" />
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" role="navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleItemClick(item.path)}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <span className="sidebar-icon">
                <item.icon size={20} variant="Bold" />
              </span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>

       
      
      </aside>
    </>
  );
};

export default Sidebar;
