import React, { useState } from 'react';
import { Element4, People, Danger, ProfileCircle, Clock, Briefcase, MessageQuestion, Award } from 'iconsax-react';
import logoMapAction from '../../assets/logo.svg';
import logoMapActionMin from '../../assets/logo-min.svg';
import './sidebar.css';
import { 
  User,          // Mon profil
  Setting2,      // Paramètres
  LogoutCurve,   // Déconnexion
  People as IconsaxPeople  
} from 'iconsax-react';
 
export const Sidebar = ({ isOpen, onClose, activeItem, onItemClick, onCollapsedChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleToggleCollapsed = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsedState);
    }
  };
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Element4
    },
    {
      id: 'collaboration',
      label: 'Mes collaborations',
      icon: IconsaxPeople,
    },
    {
      id: 'projects',
      label: 'Projets de collaboration',
      icon: Briefcase
    },
    {
      id: 'requests',
      label: 'Demandes de collaboration',
      icon: MessageQuestion
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: Danger
    },
    {
      id: 'impact',
      label: 'Impact',
      icon: Award
    },
  
 
    {
      id: 'profile',
      label: 'Mon profil',
      icon: User
    }
  ];

  const handleItemClick = (itemId) => {
    onItemClick(itemId);
    if (window.innerWidth < 1024) {
      onClose();
    }
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
              className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
              aria-current={activeItem === item.id ? 'page' : undefined}
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
