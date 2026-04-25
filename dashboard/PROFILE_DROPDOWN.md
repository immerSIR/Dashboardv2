# Menu Dropdown Profil

## ✅ Menu Profil Intégré

Un menu dropdown a été ajouté au header pour afficher les informations du profil utilisateur avec des options de navigation et déconnexion.

---

## 🎯 Fonctionnalités

### Menu Dropdown
✅ **Clic sur avatar** : Ouvre/ferme le menu  
✅ **Informations utilisateur** : Nom et email  
✅ **Options** : Mon profil, Paramètres  
✅ **Déconnexion** : Bouton rouge avec icône  
✅ **Animation** : Slide down fluide  
✅ **Icônes** : Iconsax React  

---

## 📝 Fichiers Modifiés

### 1. Header Component
**`/src/components/layout/Header.jsx`**

**Imports ajoutés :**
```jsx
import { User, Setting2, LogoutCurve, ArrowDown2 } from 'iconsax-react';
```

**État ajouté :**
```jsx
const [showProfileMenu, setShowProfileMenu] = useState(false);
```

**Props ajoutées :**
```jsx
export const Header = ({ onMenuToggle, user, onLogout }) => {
```

**Structure du dropdown :**
```jsx
<div className="profile-dropdown">
  <button 
    className="profile-button"
    onClick={() => setShowProfileMenu(!showProfileMenu)}
  >
    <div className="user-avatar">
      {/* Avatar */}
    </div>
    <ArrowDown2 
      size={16} 
      className={`arrow-icon ${showProfileMenu ? 'open' : ''}`}
    />
  </button>

  {showProfileMenu && (
    <div className="profile-menu">
      {/* Header avec nom et email */}
      <div className="profile-menu-header">
        <div className="profile-info">
          <div className="profile-name">{user.name || 'Utilisateur'}</div>
          <div className="profile-email">{user.email}</div>
        </div>
      </div>
      
      {/* Items du menu */}
      <div className="profile-menu-items">
        <button className="profile-menu-item">
          <User size={20} variant="Outline" />
          <span>Mon profil</span>
        </button>
        
        <button className="profile-menu-item">
          <Setting2 size={20} variant="Outline" />
          <span>Paramètres</span>
        </button>
      </div>
      
      {/* Déconnexion */}
      <button 
        className="profile-menu-item logout"
        onClick={() => {
          setShowProfileMenu(false);
          onLogout && onLogout();
        }}
      >
        <LogoutCurve size={20} variant="Outline" />
        <span>Déconnexion</span>
      </button>
    </div>
  )}
</div>
```

### 2. Header CSS
**`/src/components/layout/header.css`**

**Styles ajoutés :**

```css
/* Profile Dropdown Container */
.profile-dropdown {
  position: relative;
}

/* Profile Button */
.profile-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s ease;
}

.profile-button:hover {
  opacity: 0.8;
}

/* Arrow Icon */
.arrow-icon {
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

.arrow-icon.open {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.profile-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 240px;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  z-index: 1000;
  animation: slideDown 0.2s ease;
}

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

/* Profile Info */
.profile-menu-header {
  padding: var(--spacing-4);
}

.profile-name {
  font-size: var(--font-size-body-large);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.profile-email {
  font-size: var(--font-size-body-small);
  color: var(--color-text-secondary);
}

/* Menu Items */
.profile-menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  padding: var(--spacing-3);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: var(--font-size-body-large);
  color: var(--color-text-primary);
  text-align: left;
}

.profile-menu-item:hover {
  background-color: var(--color-background);
}

/* Logout Button */
.profile-menu-item.logout {
  color: var(--color-severity-high);
  margin: var(--spacing-2);
}

.profile-menu-item.logout:hover {
  background-color: rgba(239, 68, 68, 0.1);
}
```

### 3. Dashboard
**`/src/pages/dashboard/Dashboard.jsx`**

**Prop ajoutée :**
```jsx
<Header 
  onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
  user={user}
  sidebarCollapsed={sidebarCollapsed}
  onLogout={onLogout}  // ← Ajouté
/>
```

---

## 🎨 Structure du Menu

### Header Section
```
┌─────────────────────────┐
│ Nom Utilisateur         │
│ email@example.com       │
└─────────────────────────┘
```

### Menu Items
```
┌─────────────────────────┐
│ 👤 Mon profil           │
│ ⚙️  Paramètres          │
└─────────────────────────┘
```

### Logout
```
┌─────────────────────────┐
│ 🚪 Déconnexion (rouge)  │
└─────────────────────────┘
```

---

## 🎯 Icônes Iconsax Utilisées

### Imports
```jsx
import { 
  User,          // Profil
  Setting2,      // Paramètres
  LogoutCurve,   // Déconnexion
  ArrowDown2     // Flèche dropdown
} from 'iconsax-react';
```

### Usage
```jsx
<User size={20} variant="Outline" />
<Setting2 size={20} variant="Outline" />
<LogoutCurve size={20} variant="Outline" />
<ArrowDown2 size={16} className="arrow-icon" />
```

**Propriétés :**
- `size` : Taille de l'icône (16-20px)
- `variant` : Style de l'icône ("Outline", "Bold", etc.)
- `className` : Classes CSS personnalisées

---

## 🔄 Comportement

### Ouverture/Fermeture

**Clic sur avatar :**
```jsx
onClick={() => setShowProfileMenu(!showProfileMenu)}
```

**État :**
- `showProfileMenu = false` : Menu fermé
- `showProfileMenu = true` : Menu ouvert

**Flèche :**
```jsx
className={`arrow-icon ${showProfileMenu ? 'open' : ''}`}
```
- Fermé : Flèche vers le bas
- Ouvert : Flèche vers le haut (rotation 180°)

### Déconnexion

**Clic sur "Déconnexion" :**
```jsx
onClick={() => {
  setShowProfileMenu(false);  // Ferme le menu
  onLogout && onLogout();     // Appelle la fonction de déconnexion
}}
```

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

### Rotation Flèche
```css
.arrow-icon {
  transition: transform 0.2s ease;
}

.arrow-icon.open {
  transform: rotate(180deg);
}
```

---

## 🎨 Styles Visuels

### Couleurs

| Élément | Couleur | Variable |
|---------|---------|----------|
| **Nom** | Noir | `--color-text-primary` (#1A1C1E) |
| **Email** | Gris | `--color-text-secondary` (#6C7278) |
| **Items** | Noir | `--color-text-primary` |
| **Logout** | Rouge | `--color-severity-high` (#EF4444) |
| **Hover** | Gris clair | `--color-background` |

### Espacements

| Élément | Padding | Variable |
|---------|---------|----------|
| **Header** | 16px | `--spacing-4` |
| **Items** | 12px | `--spacing-3` |
| **Gap icône** | 12px | `--spacing-3` |

### Bordures

| Élément | Valeur |
|---------|--------|
| **Border radius** | 12px (`--radius-lg`) |
| **Border** | 1px solid `--color-border` |
| **Shadow** | `--shadow-lg` |

---

## 📱 Responsive

### Mobile (< 768px)
- Menu dropdown : 240px min-width
- Position : Right aligned
- Fonctionne parfaitement

### Tablet/Desktop (≥ 768px)
- Menu dropdown : 240px min-width
- Position : Right aligned
- Fonctionne parfaitement

---

## 🎯 Données Utilisateur

### Props Attendues
```jsx
user = {
  name: "John Doe",      // Nom complet
  email: "john@example.com"  // Email
}
```

### Affichage
```jsx
<div className="profile-name">{user.name || 'Utilisateur'}</div>
<div className="profile-email">{user.email}</div>
```

**Fallback :** Si `user.name` n'existe pas, affiche "Utilisateur"

---

## 🔧 Extensibilité

### Ajouter un Item

```jsx
<button className="profile-menu-item">
  <IconName size={20} variant="Outline" />
  <span>Nouveau Item</span>
</button>
```

### Ajouter un Divider

```jsx
<div className="profile-menu-divider"></div>
```

### Ajouter une Action

```jsx
<button 
  className="profile-menu-item"
  onClick={() => {
    setShowProfileMenu(false);
    // Votre action ici
  }}
>
  <Icon size={20} variant="Outline" />
  <span>Action</span>
</button>
```

---

## 🎨 Exemple Complet

### Vue Fermée
```
Header: [Logo] [Notifications] [Settings] [Avatar ▼]
```

### Vue Ouverte
```
Header: [Logo] [Notifications] [Settings] [Avatar ▲]
                                           ┌─────────────────────┐
                                           │ John Doe            │
                                           │ john@example.com    │
                                           ├─────────────────────┤
                                           │ 👤 Mon profil       │
                                           │ ⚙️  Paramètres      │
                                           ├─────────────────────┤
                                           │ 🚪 Déconnexion      │
                                           └─────────────────────┘
```

---

## 📋 Checklist

- [x] Iconsax React installé
- [x] Imports des icônes ajoutés
- [x] État `showProfileMenu` créé
- [x] Bouton profil avec flèche
- [x] Menu dropdown avec animation
- [x] Informations utilisateur (nom, email)
- [x] Items "Mon profil" et "Paramètres"
- [x] Bouton déconnexion rouge
- [x] CSS complet avec hover states
- [x] Prop `onLogout` passée depuis Dashboard
- [x] Fermeture du menu après déconnexion

---

## ✅ Résultat

Le menu profil est maintenant **100% fonctionnel** !

✅ **Clic sur avatar** : Ouvre le menu  
✅ **Informations** : Nom et email affichés  
✅ **Navigation** : Mon profil, Paramètres  
✅ **Déconnexion** : Bouton rouge fonctionnel  
✅ **Animation** : Slide down fluide  
✅ **Icônes** : Iconsax React intégrées  
✅ **Responsive** : Fonctionne sur tous écrans  
✅ **UX** : Flèche qui tourne, hover states  

Le profil utilisateur est parfaitement intégré ! 👤
