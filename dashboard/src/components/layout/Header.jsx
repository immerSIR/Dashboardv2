import { useState } from 'react';
import { User, Setting2, LogoutCurve, ArrowDown2, Notification, Danger, People, InfoCircle } from 'iconsax-react';
import logoMapActionMin from '../../assets/logo-min.svg';
import './header.css';

export const Header = ({ onMenuToggle, user, onLogout, onNavChange }) => {
  const [activeLanguage, setActiveLanguage] = useState('Français');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const languages = ['Bambara', 'Fulfulde', 'Français'];
  
  // Données de notifications (exemple)
  const notifications = [
    {
      id: 2,
      type: 'collaboration',
      title: 'Nouvelle demande de collaboration',
      message: 'L\'équipe B demande votre assistance',
      time: 'Il y a 1h',
      unread: true
    },
    {
      id: 4,
      type: 'system',
      title: 'Mise à jour système',
      message: 'Le système a été mis à jour avec succès',
      time: 'Il y a 3h',
      unread: false
    },
    {
      id: 5,
      type: 'collaboration',
      title: 'Rapport partagé',
      message: 'L\'équipe A a partagé un nouveau rapport',
      time: 'Il y a 4h',
      unread: false
    },
    {
      id: 7,
      type: 'system',
      title: 'Sauvegarde effectuée',
      message: 'La sauvegarde automatique a été effectuée',
      time: 'Il y a 6h',
      unread: false
    },
    {
      id: 8,
      type: 'collaboration',
      title: 'Nouvelle mission assignée',
      message: 'Vous avez été assigné à une nouvelle mission',
      time: 'Il y a 8h',
      unread: false
    },
    {
      id: 10,
      type: 'system',
      title: 'Maintenance programmée',
      message: 'Une maintenance est programmée pour demain',
      time: 'Il y a 12h',
      unread: false
    }
  ];
  
  const unreadCount = notifications.filter(n => n.unread).length;
  
  // Fonction pour obtenir l'icône selon le type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'collaboration':
        return <People size={20} variant="Bold" color="#3AA2DD" />;
      case 'system':
        return <InfoCircle size={20} variant="Bold" color="#6C7278" />;
      default:
        return <Notification size={20} variant="Bold" color="#6C7278" />;
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="menu-toggle btn btn-icon"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

       
      </div>

      <div className="header-right">
    

        <div className="notification-dropdown">
          <button 
            className="btn btn-icon notification-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Notification size={24} variant="Outline" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-menu">
              <div className="notification-menu-header">
                <h3>Notifications</h3>
                <span className="notification-count">{unreadCount} non lues</span>
              </div>
              
              <div className="notification-menu-divider"></div>
              
              <div className="notification-list">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.unread ? 'unread' : ''}`}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{notification.time}</div>
                    </div>
                    {notification.unread && <div className="notification-dot"></div>}
                  </div>
                ))}
              </div>
              
              <div className="notification-menu-divider"></div>
              
              <button className="notification-menu-footer">
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>

        {user && (
          <div className="profile-dropdown">
            <div 
              className="user-avatar"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              role="button"
              aria-label="Menu profil"
            >
              <img 
                src={user.avatar || '/default-avatar.png'} 
                alt={user.name || 'User'}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="avatar-placeholder">
                {(user.email || 'U').charAt(0).toUpperCase()}
              </div>
            </div>

            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div className="profile-name">{user.name || 'Utilisateur'}</div>
                  <div className="profile-email">{user.email}</div>
                </div>
                
                <div className="profile-menu-items">
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavChange && onNavChange('profile');
                    }}
                  >
                    <User size={18} variant="Outline" />
                    <span>Mon profil</span>
                  </button>
                  
                  <button className="profile-menu-item">
                    <Setting2 size={18} variant="Outline" />
                    <span>Paramètres</span>
                  </button>
                  
                  <button 
                    className="profile-menu-item logout"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout && onLogout();
                    }}
                  >
                    <LogoutCurve size={18} variant="Outline" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
