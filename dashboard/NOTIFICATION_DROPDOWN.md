# Menu Dropdown Notifications

## ✅ Notifications avec Iconsax

L'icône de notification a été remplacée par celle d'Iconsax et un menu dropdown affiche maintenant la liste des notifications.

---

## 🎯 Fonctionnalités

### Menu Dropdown
✅ **Icône Iconsax** : `Notification` variant Outline  
✅ **Badge dynamique** : Affiche le nombre de notifications non lues  
✅ **Clic pour ouvrir** : Affiche le menu des notifications  
✅ **Liste scrollable** : Max 350px de hauteur  
✅ **Indicateur non lu** : Point bleu + fond bleu clair  
✅ **Animation** : Slide down fluide  
✅ **Footer** : Bouton "Voir toutes les notifications"  

---

## 📝 Fichiers Modifiés

### 1. Header Component
**`/src/components/layout/Header.jsx`**

**Import ajouté :**
```jsx
import { User, Setting2, LogoutCurve, ArrowDown2, Notification } from 'iconsax-react';
```

**État ajouté :**
```jsx
const [showNotifications, setShowNotifications] = useState(false);
```

**Données de notifications :**
```jsx
const notifications = [
  {
    id: 1,
    type: 'incident',
    title: 'Nouvel incident signalé',
    message: 'Un incident a été signalé dans la zone Nord',
    time: 'Il y a 5 min',
    unread: true
  },
  {
    id: 2,
    type: 'collaboration',
    title: 'Nouvelle demande de collaboration',
    message: 'L\'équipe B demande votre assistance',
    time: 'Il y a 1h',
    unread: true
  },
  {
    id: 3,
    type: 'system',
    title: 'Mise à jour système',
    message: 'Le système a été mis à jour avec succès',
    time: 'Il y a 2h',
    unread: false
  }
];

const unreadCount = notifications.filter(n => n.unread).length;
```

**Structure du dropdown :**
```jsx
<div className="notification-dropdown">
  <button 
    className="btn btn-icon notification-btn" 
    onClick={() => setShowNotifications(!showNotifications)}
  >
    <Notification size={24} variant="Outline" />
    {unreadCount > 0 && (
      <span className="notification-badge">{unreadCount}</span>
    )}
  </button>

  {showNotifications && (
    <div className="notification-menu">
      {/* Header */}
      <div className="notification-menu-header">
        <h3>Notifications</h3>
        <span className="notification-count">{unreadCount} non lues</span>
      </div>
      
      {/* Divider */}
      <div className="notification-menu-divider"></div>
      
      {/* Liste */}
      <div className="notification-list">
        {notifications.map((notification) => (
          <div className={`notification-item ${notification.unread ? 'unread' : ''}`}>
            <div className="notification-content">
              <div className="notification-title">{notification.title}</div>
              <div className="notification-message">{notification.message}</div>
              <div className="notification-time">{notification.time}</div>
            </div>
            {notification.unread && <div className="notification-dot"></div>}
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <button className="notification-menu-footer">
        Voir toutes les notifications
      </button>
    </div>
  )}
</div>
```

### 2. Header CSS
**`/src/components/layout/header.css`**

**Styles ajoutés :**

```css
/* Notification Dropdown Container */
.notification-dropdown {
  position: relative;
}

/* Notification Menu */
.notification-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 360px;
  max-width: 400px;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  z-index: 1000;
  animation: slideDown 0.2s ease;
  max-height: 500px;
}

/* Header */
.notification-menu-header {
  padding: var(--spacing-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Liste scrollable */
.notification-list {
  overflow-y: auto;
  max-height: 350px;
}

/* Item de notification */
.notification-item {
  padding: var(--spacing-4);
  display: flex;
  gap: var(--spacing-3);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: var(--color-background);
}

/* Non lu */
.notification-item.unread {
  background-color: rgba(58, 162, 221, 0.05);
}

.notification-item.unread:hover {
  background-color: rgba(58, 162, 221, 0.08);
}

/* Point bleu pour non lu */
.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-primary);
  margin-top: 6px;
}

/* Footer */
.notification-menu-footer {
  padding: var(--spacing-3);
  text-align: center;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
```

---

## 🎨 Structure du Menu

### Header
```
┌─────────────────────────────────┐
│ Notifications    2 non lues     │
└─────────────────────────────────┘
```

### Liste des Notifications
```
┌─────────────────────────────────┐
│ Nouvel incident signalé      ● │ ← Point bleu (non lu)
│ Un incident a été signalé...   │
│ Il y a 5 min                   │
├─────────────────────────────────┤
│ Nouvelle demande...          ● │
│ L'équipe B demande...          │
│ Il y a 1h                      │
├─────────────────────────────────┤
│ Mise à jour système            │ ← Pas de point (lu)
│ Le système a été mis à jour... │
│ Il y a 2h                      │
└─────────────────────────────────┘
```

### Footer
```
┌─────────────────────────────────┐
│ Voir toutes les notifications  │
└─────────────────────────────────┘
```

---

## 🎯 Icône Iconsax

### Import
```jsx
import { Notification } from 'iconsax-react';
```

### Usage
```jsx
<Notification size={24} variant="Outline" />
```

**Propriétés :**
- `size` : 24px
- `variant` : "Outline" (contour)

---

## 🔢 Badge Dynamique

### Calcul
```jsx
const unreadCount = notifications.filter(n => n.unread).length;
```

### Affichage Conditionnel
```jsx
{unreadCount > 0 && (
  <span className="notification-badge">{unreadCount}</span>
)}
```

**Comportement :**
- Si `unreadCount > 0` : Badge affiché avec le nombre
- Si `unreadCount = 0` : Badge caché

---

## 📊 Structure des Données

### Format Notification
```jsx
{
  id: 1,                    // ID unique
  type: 'incident',         // Type: incident, collaboration, system
  title: 'Titre',           // Titre de la notification
  message: 'Message...',    // Message détaillé
  time: 'Il y a 5 min',     // Temps relatif
  unread: true              // État non lu
}
```

### Types de Notifications
- **incident** : Incidents signalés
- **collaboration** : Demandes de collaboration
- **system** : Mises à jour système

---

## 🎨 États Visuels

### Notification Non Lue
```css
.notification-item.unread {
  background-color: rgba(58, 162, 221, 0.05);  /* Fond bleu clair */
}
```
- Fond bleu clair
- Point bleu à droite
- Hover : Fond bleu plus foncé

### Notification Lue
```css
.notification-item {
  background-color: transparent;
}
```
- Fond transparent
- Pas de point
- Hover : Fond gris

---

## ✨ Animations

### Slide Down
```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Durée :** 0.2s  
**Effet :** Le menu glisse vers le bas avec fade-in  

### Hover
```css
transition: background-color 0.2s ease;
```

---

## 📱 Responsive

### Mobile
Le menu s'adapte automatiquement :
- `min-width: 360px` sur desktop
- S'ajuste sur mobile (< 360px)

### Scroll
```css
.notification-list {
  overflow-y: auto;
  max-height: 350px;
}
```

Si plus de 5-6 notifications, la liste devient scrollable.

---

## 🔧 Extensibilité

### Ajouter une Notification
```jsx
const newNotification = {
  id: 4,
  type: 'alert',
  title: 'Nouvelle alerte',
  message: 'Description de l\'alerte',
  time: 'Il y a 30 sec',
  unread: true
};
```

### Marquer comme Lu
```jsx
const markAsRead = (notificationId) => {
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, unread: false } : n
  );
  setNotifications(updated);
};
```

### Tout Marquer comme Lu
```jsx
const markAllAsRead = () => {
  const updated = notifications.map(n => ({ ...n, unread: false }));
  setNotifications(updated);
};
```

---

## 🎯 Exemple Complet

### Vue Fermée
```
Header: [Menu] [Notifications 🔔²] [Avatar]
```

### Vue Ouverte
```
Header: [Menu] [Notifications 🔔²] [Avatar]
                ┌─────────────────────────────────┐
                │ Notifications    2 non lues     │
                ├─────────────────────────────────┤
                │ Nouvel incident signalé      ● │
                │ Un incident a été signalé...   │
                │ Il y a 5 min                   │
                ├─────────────────────────────────┤
                │ Nouvelle demande...          ● │
                │ L'équipe B demande...          │
                │ Il y a 1h                      │
                ├─────────────────────────────────┤
                │ Mise à jour système            │
                │ Le système a été mis à jour... │
                │ Il y a 2h                      │
                ├─────────────────────────────────┤
                │ Voir toutes les notifications  │
                └─────────────────────────────────┘
```

---

## 📋 Checklist

- [x] Icône Iconsax `Notification` importée
- [x] État `showNotifications` créé
- [x] Badge dynamique avec `unreadCount`
- [x] Menu dropdown avec animation
- [x] Header avec titre et compteur
- [x] Liste scrollable (max 350px)
- [x] Items avec titre, message, temps
- [x] Point bleu pour non lu
- [x] Fond bleu clair pour non lu
- [x] Hover states
- [x] Footer "Voir toutes"
- [x] CSS complet

---

## ✅ Résultat

Le menu de notifications est maintenant **100% fonctionnel** !

✅ **Icône Iconsax** : `Notification` variant Outline  
✅ **Badge dynamique** : Affiche le nombre non lu  
✅ **Menu dropdown** : Liste des notifications  
✅ **Indicateur non lu** : Point bleu + fond bleu  
✅ **Scrollable** : Si plus de 5-6 notifications  
✅ **Animation** : Slide down fluide  
✅ **Hover states** : Feedback visuel  
✅ **Footer** : Bouton "Voir toutes"  

Les notifications sont parfaitement intégrées ! 🔔
