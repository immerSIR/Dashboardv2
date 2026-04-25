# Bootstrap 5 - Intégration

## ✅ Bootstrap CSS Minifié Ajouté

Bootstrap 5.3.2 a été ajouté au projet via CDN dans `index.html`.

### 📦 Version Installée
- **Version** : Bootstrap 5.3.2
- **Type** : CSS uniquement (minifié)
- **Source** : CDN jsDelivr
- **Taille** : ~160 KB (minifié)

---

## 🎯 Utilisation

### Classes Bootstrap Disponibles

Vous pouvez maintenant utiliser toutes les classes utilitaires Bootstrap :

#### Layout & Grid
```jsx
<div className="container">
  <div className="row">
    <div className="col-md-6">Colonne 1</div>
    <div className="col-md-6">Colonne 2</div>
  </div>
</div>
```

#### Spacing (Margin & Padding)
```jsx
<div className="mt-3 mb-4 p-2">
  {/* mt-3 = margin-top, mb-4 = margin-bottom, p-2 = padding */}
</div>
```

#### Flexbox
```jsx
<div className="d-flex justify-content-between align-items-center">
  <span>Gauche</span>
  <span>Droite</span>
</div>
```

#### Boutons
```jsx
<button className="btn btn-primary">Primaire</button>
<button className="btn btn-secondary">Secondaire</button>
<button className="btn btn-success">Succès</button>
```

#### Cards
```jsx
<div className="card">
  <div className="card-body">
    <h5 className="card-title">Titre</h5>
    <p className="card-text">Contenu</p>
  </div>
</div>
```

#### Alerts
```jsx
<div className="alert alert-info">Information</div>
<div className="alert alert-warning">Attention</div>
<div className="alert alert-danger">Erreur</div>
```

#### Display
```jsx
<div className="d-none d-md-block">Caché sur mobile, visible sur tablet+</div>
<div className="d-block d-md-none">Visible sur mobile, caché sur tablet+</div>
```

---

## ⚠️ Coexistence avec le Design System Existant

### Priorité des Styles
1. **Vos styles custom** (`index.css`, `login.css`, etc.) - Priorité HAUTE
2. **Bootstrap** - Priorité MOYENNE
3. **Styles par défaut du navigateur** - Priorité BASSE

### Éviter les Conflits

**Option 1 : Utiliser Bootstrap de manière sélective**
```jsx
// Bon : Utiliser les classes utilitaires Bootstrap
<div className="d-flex gap-3 mt-4">
  <button className="btn btn-primary">OK</button>
</div>

// Éviter : Mélanger avec vos classes custom
<button className="btn btn-primary login-button">
  {/* Peut créer des conflits */}
</button>
```

**Option 2 : Préfixer vos classes**
```css
/* Vos styles custom */
.custom-button {
  /* Vos styles */
}

/* Bootstrap */
.btn {
  /* Styles Bootstrap */
}
```

---

## 🎨 Classes Utilitaires Recommandées

### Spacing Scale
```
0 = 0
1 = 0.25rem (4px)
2 = 0.5rem (8px)
3 = 1rem (16px)
4 = 1.5rem (24px)
5 = 3rem (48px)
```

**Exemples :**
- `mt-3` = margin-top: 1rem
- `px-4` = padding-left + padding-right: 1.5rem
- `gap-2` = gap: 0.5rem

### Responsive Breakpoints
```
sm = 576px
md = 768px
lg = 1024px
xl = 1280px
xxl = 1400px
```

**Exemples :**
- `col-12 col-md-6` = 100% sur mobile, 50% sur tablet+
- `d-none d-lg-block` = Caché jusqu'à 1024px

---

## 🚀 Exemples d'Intégration

### Exemple 1 : Card avec Bootstrap
```jsx
<div className="card shadow-sm">
  <div className="card-header bg-primary text-white">
    <h5 className="mb-0">Titre</h5>
  </div>
  <div className="card-body">
    <p className="card-text">Contenu de la carte</p>
    <button className="btn btn-sm btn-outline-primary">Action</button>
  </div>
</div>
```

### Exemple 2 : Grid Responsive
```jsx
<div className="container-fluid">
  <div className="row g-3">
    <div className="col-12 col-md-6 col-lg-4">
      <MetricWidget />
    </div>
    <div className="col-12 col-md-6 col-lg-4">
      <MetricWidget />
    </div>
    <div className="col-12 col-md-6 col-lg-4">
      <MetricWidget />
    </div>
  </div>
</div>
```

### Exemple 3 : Formulaire
```jsx
<form>
  <div className="mb-3">
    <label className="form-label">Email</label>
    <input type="email" className="form-control" />
  </div>
  <div className="mb-3">
    <label className="form-label">Mot de passe</label>
    <input type="password" className="form-control" />
  </div>
  <button type="submit" className="btn btn-primary w-100">
    Se connecter
  </button>
</form>
```

---

## 📝 Bonnes Pratiques

### ✅ À Faire
- Utiliser les classes utilitaires Bootstrap pour le spacing
- Utiliser le système de grille pour les layouts
- Utiliser les classes responsive (d-none, d-md-block, etc.)
- Combiner avec vos styles custom quand nécessaire

### ❌ À Éviter
- Surcharger tous vos composants avec Bootstrap
- Mélanger trop de classes Bootstrap et custom sur le même élément
- Utiliser Bootstrap pour tout (gardez votre design system)

---

## 🔧 Alternative : Installation via npm

Si vous préférez installer Bootstrap via npm :

```bash
npm install bootstrap@5.3.2
```

Puis dans `main.jsx` :
```jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'; // Vos styles après Bootstrap
```

**Avantage** : Meilleur contrôle, pas de dépendance CDN
**Inconvénient** : Augmente la taille du bundle

---

## 📚 Ressources

- [Documentation Bootstrap 5](https://getbootstrap.com/docs/5.3/)
- [Classes Utilitaires](https://getbootstrap.com/docs/5.3/utilities/api/)
- [Système de Grille](https://getbootstrap.com/docs/5.3/layout/grid/)
- [Composants](https://getbootstrap.com/docs/5.3/components/)

---

## ⚡ Performance

Bootstrap CSS minifié est chargé depuis un CDN :
- ✅ Cache navigateur
- ✅ Compression gzip
- ✅ CDN rapide (jsDelivr)
- ✅ Integrity check (SRI)

**Taille** : ~160 KB (minifié), ~25 KB (gzippé)
