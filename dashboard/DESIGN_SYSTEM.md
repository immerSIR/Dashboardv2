# Map Action - Design System Documentation

## Architecture Atomic Design

Le projet suit l'architecture **Atomic Design** pour une meilleure organisation et réutilisabilité des composants.

### Structure des Dossiers

```
src/
├── components/
│   ├── atoms/          # Composants de base (Boutons, Typographie)
│   ├── molecules/      # Combinaisons d'atomes (InputField, MetricWidget, Card)
│   └── organisms/      # Composants complexes (TopBar, Sidebar, ActivityFeed)
├── index.css          # Design System CSS
└── App.jsx            # Application principale
```

## 🎨 Design Tokens

### Typographie (Inter Sans-Serif)
- **H1 (Display):** 32px / Bold / Tracking -0.025em
- **H2 (Section):** 24px / Semibold / Tracking -0.01em
- **Body Large:** 16px / Regular
- **Body Small:** 14px / Medium
- **Caption:** 12px / Medium / Uppercase

### Palette de Couleurs
- **Primary:** `#0E7490` (Cyan 700)
- **Primary Dark:** `#164E63` (Cyan 900)
- **Surface:** `#FFFFFF` (White)
- **Background:** `#F8FAFC` (Slate 50)
- **Border:** `#E2E8F0` (Slate 200)
- **Severity Low:** `#22C55E` (Green 500)
- **Severity High:** `#EF4444` (Red 500)

### Espacement (Base 4)
- `--spacing-1`: 4px
- `--spacing-2`: 8px
- `--spacing-3`: 12px
- `--spacing-4`: 16px
- `--spacing-6`: 24px
- `--spacing-8`: 32px

### Border Radius
- `--radius-sm`: 4px
- `--radius-md`: 8px (défaut)
- `--radius-lg`: 12px
- `--radius-full`: 9999px (pill)

### Shadows
- `--shadow-sm`: Ombre légère pour les cards
- `--shadow-md`: Ombre moyenne pour les hover states
- `--shadow-lg`: Ombre forte pour les modals

## 📱 Responsive Design (Mobile-First)

### Breakpoints
- **Mobile:** < 768px (par défaut)
- **Tablet:** ≥ 768px
- **Desktop:** ≥ 1024px
- **Large Desktop:** ≥ 1280px

### Comportement Responsive
- **Mobile:** Sidebar en overlay, navigation hamburger
- **Desktop:** Sidebar fixe, navigation complète visible

## 🧩 Composants Disponibles

### Atoms
- `Button` - Boutons (primary, secondary, icon)
- `H1, H2, BodyLarge, BodySmall, Caption` - Typographie

### Molecules
- `InputField` - Champ de saisie avec label
- `SearchBar` - Barre de recherche avec icône
- `MetricWidget` - Widget KPI avec delta
- `Card` - Carte de contenu
- `NavItem` - Item de navigation

### Organisms
- `TopBar` - Barre de navigation supérieure
- `Sidebar` - Navigation latérale
- `ActivityFeed` - Flux d'activités

## 🚀 Utilisation

### Exemple de Button
```jsx
import Button from './components/atoms/Button';

<Button variant="primary" onClick={handleClick}>
  Cliquez ici
</Button>
```

### Exemple de MetricWidget
```jsx
import MetricWidget from './components/molecules/MetricWidget';

<MetricWidget
  title="Total Incidents"
  value="1,234"
  delta="+12%"
  deltaType="positive"
/>
```

### Exemple de Card
```jsx
import Card from './components/molecules/Card';

<Card>
  <h2>Titre</h2>
  <p>Contenu de la carte</p>
</Card>
```

## 🎯 Prochaines Étapes

1. Intégration de la carte OpenStreetMap (Leaflet/Mapbox)
2. Ajout de graphiques (Chart.js/Recharts)
3. Système d'authentification
4. API REST pour les données en temps réel
5. Notifications push
