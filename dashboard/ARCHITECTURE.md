# Architecture du Projet - Map Action Dashboard

## 📁 Structure Feature-Based

Le projet utilise une architecture **feature-based** où chaque fonctionnalité majeure a son propre dossier contenant tous ses composants, styles et services.

```
src/
├── pages/
│   ├── auth/                    # Feature Authentification
│   │   ├── Login.jsx           # Composant principal
│   │   ├── login.css           # Styles spécifiques
│   │   ├── services/
│   │   │   └── authService.js  # Logique métier
│   │   └── index.js            # Exports publics
│   │
│   └── dashboard/              # Feature Dashboard
│       ├── Dashboard.jsx       # Composant principal
│       ├── dashboard.css       # Styles spécifiques
│       ├── components/         # Composants locaux
│       │   ├── TopBar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── MetricWidget.jsx
│       │   ├── ActivityFeed.jsx
│       │   ├── MapContainer.jsx
│       │   └── StatsCard.jsx
│       └── index.js            # Exports publics
│
├── components/                 # Composants partagés (Atomic Design)
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
│
├── index.css                   # Design System global
├── App.jsx                     # Point d'entrée
└── main.jsx                    # Bootstrap React

```

## 🎯 Principes d'Architecture

### 1. Page-Based Organization
Chaque page est **autonome** et contient :
- ✅ Composants UI
- ✅ Styles CSS
- ✅ Services/API
- ✅ Logique métier
- ✅ Types/Interfaces (si TypeScript)

### 2. Atomic Design (Composants Partagés)
- **Atoms** : Boutons, Inputs, Typography
- **Molecules** : Cards, Forms, Widgets
- **Organisms** : Headers, Sidebars, Sections

### 3. Séparation des Responsabilités
- **Components** : UI uniquement
- **Services** : Logique métier et API
- **CSS** : Styles isolés par page

## 📦 Pages Actuelles

### Auth Page
```
pages/auth/
├── Login.jsx              # Page de connexion
├── login.css             # Styles login
├── services/
│   └── authService.js    # API authentification
└── index.js              # export { Login, authService }
```

### Dashboard Page
```
pages/dashboard/
├── Dashboard.jsx          # Page principale
├── dashboard.css         # Styles dashboard
├── components/           # Composants locaux
│   ├── TopBar.jsx
│   ├── Sidebar.jsx
│   ├── MetricWidget.jsx
│   ├── ActivityFeed.jsx
│   ├── MapContainer.jsx
│   └── StatsCard.jsx
└── index.js              # export { Dashboard }
```

## 🔄 Flux de Données

```
App.jsx
  ├─> Login (auth feature)
  │     └─> authService.login()
  │
  └─> Dashboard (dashboard feature)
        ├─> TopBar
        ├─> Sidebar
        ├─> MetricWidget
        ├─> MapContainer
        └─> ActivityFeed
```

## 🚀 Avantages de cette Architecture

1. **Scalabilité** : Facile d'ajouter de nouvelles pages
2. **Maintenabilité** : Code organisé et prévisible
3. **Réutilisabilité** : Composants partagés via `/components`
4. **Isolation** : Chaque page est indépendante
5. **Collaboration** : Équipes peuvent travailler sur différentes pages

## 📝 Conventions de Nommage

- **Pages** : `kebab-case` (auth, dashboard, map-view)
- **Composants** : `PascalCase` (Login.jsx, Dashboard.jsx)
- **Services** : `camelCase` (authService.js, mapService.js)
- **CSS** : `kebab-case` (login.css, dashboard.css)

## 🔜 Prochaines Pages à Ajouter

- `pages/map/` - Carte interactive avec OSM
- `pages/alerts/` - Gestion des alertes
- `pages/reports/` - Génération de rapports
- `pages/settings/` - Paramètres utilisateur
