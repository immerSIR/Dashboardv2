import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Element4, People, ProfileCircle, Clock, Briefcase, Award, Trash, Buildings2, Profile2User } from 'iconsax-react';
import logoMapAction from '../../assets/logo.svg';
import logoMapActionMin from '../../assets/logo-min.svg';
import './sidebar.css';
import { 
  User,          // Mon profil
  Setting2,      // Paramètres
  LogoutCurve,   // Déconnexion
  People as IconsaxPeople  
} from 'iconsax-react';
 
export const Sidebar = ({ isOpen, onClose, isCollapsed: controlledCollapsed, onCollapsedChange }) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setIsCollapsed = onCollapsedChange ? (val) => onCollapsedChange(val) : setInternalCollapsed;
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleToggleCollapsed = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
  };
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Element4,
      path: '/dashboard'
    },
    {
      id: 'collaboration',
      label: 'Collaborations',
      icon: IconsaxPeople,
      path: '/collaboration'
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: Briefcase,
      path: '/incidents'
    },
    {
      id: 'organisations',
      label: 'Organisations',
      icon: Buildings2,
      path: '/organisations'
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: Profile2User,
      path: '/agents'
    },
    {
      id: 'impact',
      label: 'Impact',
      icon: Award,
      path: '/impact'
    },
  

    {
      id: 'profile',
      label: 'Mon profil',
      icon: User,
      path: '/profile'
    },
    {
      id: 'trash',
      label: 'Corbeille',
      icon: Trash,
      path: '/trash'
    }
  ];

  const handleItemClick = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isActive = (path) => location.pathname === path;

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
