# Font Size 14px et Couleurs Icônes

## ✅ Taille de Police 14px par Défaut

La taille de police par défaut est maintenant 14px avec des couleurs appropriées pour toutes les icônes.

---

## 📝 Variables CSS Mises à Jour

### Font Sizes
```css
:root {
  --font-size-h1: 32px;
  --font-size-h2: 24px;
  --font-size-h3: 18px;
  --font-size-body-large: 16px;
  --font-size-body: 14px;          /* ← Nouveau (par défaut) */
  --font-size-body-small: 13px;
  --font-size-caption: 12px;
}
```

### Body
```css
body {
  font-size: var(--font-size-body);  /* 14px */
}
```

---

## 🎨 Couleurs des Icônes

### Par Défaut
```css
svg {
  color: var(--color-text-secondary);  /* #6C7278 - Gris */
}
```

### Hover
```css
:hover svg {
  color: var(--color-primary);  /* #3AA2DD - Bleu */
}
```

### Exceptions
- **Déconnexion** : `var(--color-severity-high)` (#EF4444 - Rouge)
- **Notifications** : Couleurs spécifiques par type

---

## 📝 Modifications Appliquées

### 1. index.css

**Variables ajoutées :**
```css
--font-size-h3: 18px;
--font-size-body: 14px;        /* Nouveau */
--font-size-body-small: 13px;
```

**Body :**
```css
body {
  font-size: var(--font-size-body);  /* Au lieu de body-large */
}
```

### 2. header.css

**Boutons :**
```css
.language-btn {
  font-size: var(--font-size-body);  /* 14px au lieu de body-small */
}
```

**Icônes notifications :**
```css
.notification-btn svg {
  color: var(--color-text-secondary);
}
```

**Notifications :**
```css
.notification-title {
  font-size: var(--font-size-body);  /* 14px */
}

.notification-message {
  font-size: var(--font-size-caption);  /* 12px */
}

.notification-time {
  font-size: var(--font-size-caption);  /* 12px */
}

.notification-menu-footer {
  font-size: var(--font-size-body);  /* 14px */
}
```

**Profil :**
```css
.profile-name {
  font-size: var(--font-size-body);  /* 14px */
}

.profile-email {
  font-size: var(--font-size-caption);  /* 12px */
}

.profile-menu-item {
  font-size: var(--font-size-body);  /* 14px */
}

/* Icônes profil */
.profile-menu-item svg {
  color: var(--color-text-secondary);
}

.profile-menu-item:hover svg {
  color: var(--color-primary);
}

/* Déconnexion */
.profile-menu-item.logout svg {
  color: var(--color-severity-high);
}

.profile-menu-item.logout:hover svg {
  color: var(--color-severity-high);
}
```

---

## 🎯 Hiérarchie des Tailles

| Élément | Variable | Taille | Usage |
|---------|----------|--------|-------|
| **H1** | `--font-size-h1` | 32px | Titres principaux |
| **H2** | `--font-size-h2` | 24px | Sous-titres |
| **H3** | `--font-size-h3` | 18px | Sections |
| **Body Large** | `--font-size-body-large` | 16px | Texte important |
| **Body** | `--font-size-body` | **14px** | **Texte par défaut** |
| **Body Small** | `--font-size-body-small` | 13px | Texte secondaire |
| **Caption** | `--font-size-caption` | 12px | Légendes, timestamps |

---

## 🎨 Couleurs des Icônes par Contexte

### Notifications
```css
/* Incident - Rouge */
<Danger size={20} variant="Bold" color="#EF4444" />

/* Collaboration - Bleu */
<People size={20} variant="Bold" color="#3AA2DD" />

/* System - Gris */
<InfoCircle size={20} variant="Bold" color="#6C7278" />
```

### Profil
```css
/* Par défaut - Gris */
.profile-menu-item svg {
  color: var(--color-text-secondary);  /* #6C7278 */
}

/* Hover - Bleu */
.profile-menu-item:hover svg {
  color: var(--color-primary);  /* #3AA2DD */
}

/* Déconnexion - Rouge */
.profile-menu-item.logout svg {
  color: var(--color-severity-high);  /* #EF4444 */
}
```

### Boutons
```css
/* Par défaut - Gris */
.notification-btn svg {
  color: var(--color-text-secondary);
}
```

---

## 📊 Mapping Font Sizes

### Avant
```css
body: 16px (body-large)
notifications: 16px (body-large)
profile: 16px (body-large)
```

### Après
```css
body: 14px (body)
notifications: 14px (body)
profile: 14px (body)
messages: 12px (caption)
time: 12px (caption)
```

---

## 🎯 Exemples d'Usage

### Notification
```jsx
<div className="notification-item">
  <div className="notification-icon">
    <Danger size={20} variant="Bold" color="#EF4444" />
  </div>
  <div className="notification-content">
    <div className="notification-title">Titre</div>        {/* 14px */}
    <div className="notification-message">Message</div>    {/* 12px */}
    <div className="notification-time">Il y a 5 min</div> {/* 12px */}
  </div>
</div>
```

### Profil
```jsx
<div className="profile-menu">
  <div className="profile-menu-header">
    <div className="profile-name">John Doe</div>           {/* 14px */}
    <div className="profile-email">john@example.com</div>  {/* 12px */}
  </div>
  
  <button className="profile-menu-item">                   {/* 14px */}
    <User size={18} variant="Outline" />                   {/* Gris */}
    <span>Mon profil</span>
  </button>
  
  <button className="profile-menu-item logout">
    <LogoutCurve size={18} variant="Outline" />            {/* Rouge */}
    <span>Déconnexion</span>
  </button>
</div>
```

---

## ✨ Avantages

### Lisibilité
✅ **14px** : Taille optimale pour la lecture  
✅ **12px** : Pour les infos secondaires  
✅ **Hiérarchie claire** : Titres vs contenu  

### Cohérence
✅ **Variables CSS** : Utilisées partout  
✅ **Couleurs icônes** : Gris par défaut  
✅ **Hover states** : Bleu primaire  
✅ **Contexte** : Rouge pour déconnexion  

### Maintenance
✅ **Centralisé** : Variables dans `:root`  
✅ **Facile à modifier** : Changer une variable  
✅ **Cohérent** : Même taille partout  

---

## 📋 Checklist

- [x] Variable `--font-size-body: 14px` ajoutée
- [x] Variable `--font-size-h3: 18px` ajoutée
- [x] Variable `--font-size-body-small: 13px` ajoutée
- [x] Body utilise `--font-size-body`
- [x] Notifications utilisent 14px
- [x] Profil utilise 14px
- [x] Messages/temps utilisent 12px
- [x] Icônes ont couleur par défaut (gris)
- [x] Icônes hover (bleu)
- [x] Icône déconnexion (rouge)
- [x] Icônes notifications (couleurs spécifiques)

---

## 🎨 Palette de Couleurs Icônes

| Contexte | État | Couleur | Variable |
|----------|------|---------|----------|
| **Par défaut** | Normal | Gris #6C7278 | `--color-text-secondary` |
| **Hover** | Hover | Bleu #3AA2DD | `--color-primary` |
| **Déconnexion** | Toujours | Rouge #EF4444 | `--color-severity-high` |
| **Incident** | Toujours | Rouge #EF4444 | Hardcoded |
| **Collaboration** | Toujours | Bleu #3AA2DD | Hardcoded |
| **System** | Toujours | Gris #6C7278 | Hardcoded |

---

## ✅ Résultat

Le système de typographie est maintenant **cohérent et professionnel** !

✅ **14px par défaut** : Taille optimale  
✅ **Variables CSS** : Utilisées partout  
✅ **Hiérarchie claire** : 32px → 14px → 12px  
✅ **Icônes colorées** : Gris par défaut  
✅ **Hover bleu** : Feedback visuel  
✅ **Contexte** : Rouge pour actions critiques  
✅ **Cohérence** : Même système partout  

Le design est maintenant **uniforme et lisible** ! 📝
