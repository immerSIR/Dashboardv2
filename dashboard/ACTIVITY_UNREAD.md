# Activités Non Lues

## ✅ Mise en Évidence des Activités Non Lues

Les activités non lues sont maintenant mises en évidence avec un background bleu clair et un badge affiche le nombre total.

---

## 🎯 Fonctionnalités

### Badge Non Lues
✅ **Nombre affiché** : "4 non lues"  
✅ **Badge bleu** : Background primaire  
✅ **Position** : À droite du titre  
✅ **Conditionnel** : Affiché seulement si > 0  

### Items Non Lus
✅ **Background bleu clair** : `rgba(58, 162, 221, 0.05)`  
✅ **Point bleu** : À droite de l'item  
✅ **Hover différent** : Background plus foncé  
✅ **Position relative** : Point positionné absolument  

---

## 📝 Modifications

### 1. ActivityPanel.jsx

**Ajout de la propriété unread :**
```jsx
const activities = [
  {
    id: 1,
    type: 'incident-taken',
    title: 'La mairie de la commune IV',
    description: 'a pris en compte un incident.',
    time: 'À l\'instant',
    severity: 'info',
    unread: true  // ← Nouveau
  },
  // ... 4 activités avec unread: true
  // ... 6 activités avec unread: false
];
```

**Calcul du nombre non lu :**
```jsx
const unreadCount = activities.filter(a => a.unread).length;
```

**Badge dans le header :**
```jsx
<div className="activity-header">
  <div className="activity-header-top">
    <h3 className="activity-title">
      Activité en temps réel
      <span className="live-indicator">
        <span className="live-dot"></span>
      </span>
    </h3>
    {unreadCount > 0 && (
      <span className="activity-unread-badge">
        {unreadCount} non lues
      </span>
    )}
  </div>
  <p className="activity-subtitle">Dernières mises à jour des flux</p>
</div>
```

**Classe unread et point bleu :**
```jsx
<div 
  className={`activity-item activity-${activity.severity} ${activity.unread ? 'unread' : ''}`}
>
  <div className="activity-icon-wrapper">
    {getActivityIcon(activity.type, activity.severity)}
  </div>
  <div className="activity-content">
    <p className="activity-text">
      <strong>{activity.title}</strong> {activity.description}
    </p>
    <span className="activity-time">{activity.time}</span>
  </div>
  {activity.unread && <div className="activity-unread-dot"></div>}
</div>
```

### 2. activity-panel.css

**Header avec badge :**
```css
.activity-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-1);
}

.activity-title {
  margin: 0;  /* Pas de marge en bas */
}

.activity-unread-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-primary);
  color: var(--color-surface);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  white-space: nowrap;
}
```

**Items non lus :**
```css
.activity-item {
  position: relative;  /* Pour le point absolu */
}

.activity-item.unread {
  background-color: rgba(58, 162, 221, 0.05);
}

.activity-item.unread:hover {
  background-color: rgba(58, 162, 221, 0.08);
}

.activity-unread-dot {
  position: absolute;
  top: 50%;
  right: var(--spacing-4);
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background-color: var(--color-primary);
  border-radius: 50%;
  flex-shrink: 0;
}
```

---

## 🎨 Design Visuel

### Header avec Badge
```
┌─────────────────────────────────────┐
│ Activité en temps réel ●  [4 non lues] │ ← Badge bleu
│ DERNIÈRES MISES À JOUR DES FLUX     │
├─────────────────────────────────────┤
```

### Items Non Lus
```
┌─────────────────────────────────────┐
│ [📄] La mairie... pris en...      ● │ ← Background bleu clair + point
│      À l'instant                    │
├─────────────────────────────────────┤
│ [✓] L'Unicef a résolu...          ● │ ← Background bleu clair + point
│     Il y a 5 min                    │
├─────────────────────────────────────┤
│ [👥] Le GEDEFOR demande...        ● │ ← Background bleu clair + point
│      Il y a 12 min                  │
├─────────────────────────────────────┤
│ [📷] Un Agent terrain...          ● │ ← Background bleu clair + point
│      Il y a 26 min                  │
├─────────────────────────────────────┤
│ [⚠️] Alerte IA: Détection...        │ ← Pas de background ni point
│      Il y a 32 min                  │
└─────────────────────────────────────┘
```

---

## 📊 Répartition Activités

| État | Nombre | IDs |
|------|--------|-----|
| **Non lues** | 4 | 1, 2, 3, 4 |
| **Lues** | 6 | 5, 6, 7, 8, 9, 10 |
| **Total** | 10 | - |

---

## 🎨 Couleurs

### Badge
```css
background-color: var(--color-primary);  /* #3AA2DD */
color: var(--color-surface);             /* #FFFFFF */
```

### Background Non Lu
```css
/* Normal */
background-color: rgba(58, 162, 221, 0.05);  /* Bleu 5% */

/* Hover */
background-color: rgba(58, 162, 221, 0.08);  /* Bleu 8% */
```

### Point Bleu
```css
background-color: var(--color-primary);  /* #3AA2DD */
width: 8px;
height: 8px;
border-radius: 50%;
```

---

## ✨ États Visuels

### Item Lu (Normal)
```
┌─────────────────────────────────┐
│ [ℹ️] Système a archivé...       │ ← Background blanc
│      Il y a 3h                  │
└─────────────────────────────────┘
```

### Item Non Lu (Normal)
```
┌─────────────────────────────────┐
│ [📄] La mairie... pris en...  ● │ ← Background bleu clair
│      À l'instant                │   Point bleu
└─────────────────────────────────┘
```

### Item Lu (Hover)
```
┌─────────────────────────────────┐
│ [ℹ️] Système a archivé...       │ ← Background gris clair
│      Il y a 3h                  │
└─────────────────────────────────┘
```

### Item Non Lu (Hover)
```
┌─────────────────────────────────┐
│ [📄] La mairie... pris en...  ● │ ← Background bleu plus foncé
│      À l'instant                │   Point bleu
└─────────────────────────────────┘
```

---

## 🎯 Logique Conditionnelle

### Badge
```jsx
{unreadCount > 0 && (
  <span className="activity-unread-badge">
    {unreadCount} non lues
  </span>
)}
```
- Affiché seulement si `unreadCount > 0`
- Texte dynamique : "4 non lues"

### Point Bleu
```jsx
{activity.unread && <div className="activity-unread-dot"></div>}
```
- Affiché seulement si `activity.unread === true`

### Classe CSS
```jsx
className={`activity-item activity-${activity.severity} ${activity.unread ? 'unread' : ''}`}
```
- Ajoute la classe `unread` si `activity.unread === true`

---

## 📐 Dimensions

### Badge
```css
padding: 4px 8px;
font-size: 12px;
border-radius: 999px;  /* Pill shape */
```

### Point Bleu
```css
width: 8px;
height: 8px;
border-radius: 50%;
right: 16px;
top: 50%;
transform: translateY(-50%);
```

---

## 🔧 Exemple Complet

### Activité Non Lue
```jsx
{
  id: 1,
  type: 'incident-taken',
  title: 'La mairie de la commune IV',
  description: 'a pris en compte un incident.',
  time: 'À l\'instant',
  severity: 'info',
  unread: true  // ← Non lue
}
```

**Rendu :**
```html
<div class="activity-item activity-info unread">
  <div class="activity-icon-wrapper">
    <DocumentText size={20} variant="Bold" color="#3AA2DD" />
  </div>
  <div class="activity-content">
    <p class="activity-text">
      <strong>La mairie de la commune IV</strong> a pris en compte un incident.
    </p>
    <span class="activity-time">À l'instant</span>
  </div>
  <div class="activity-unread-dot"></div>
</div>
```

---

## 📋 Checklist

- [x] Propriété `unread` ajoutée aux activités
- [x] 4 activités marquées comme non lues
- [x] 6 activités marquées comme lues
- [x] Calcul `unreadCount` avec filter
- [x] Badge "X non lues" dans le header
- [x] Badge conditionnel (si > 0)
- [x] Classe `unread` sur les items
- [x] Background bleu clair pour items non lus
- [x] Point bleu à droite des items non lus
- [x] Hover différent pour items non lus
- [x] Position absolute pour le point
- [x] Badge avec border-radius pill

---

## ✅ Résultat

Les activités non lues sont maintenant **clairement identifiables** !

✅ **Badge "4 non lues"** : En haut à droite  
✅ **Background bleu clair** : Items non lus  
✅ **Point bleu** : À droite de chaque item non lu  
✅ **Hover adapté** : Background plus foncé  
✅ **Conditionnel** : Badge affiché si > 0  
✅ **Visuel clair** : Facile à identifier  
✅ **Cohérent** : Même couleur primaire  
✅ **Professionnel** : Design épuré  

Les activités non lues sont maintenant **mises en évidence** ! 🔵
