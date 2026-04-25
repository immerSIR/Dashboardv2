# Standards d'Accessibilité - Map Action Dashboard

## 📱 Tailles Minimales des Éléments Interactifs

### Règle Principale
Tous les éléments interactifs (boutons, inputs, liens cliquables) doivent avoir une **hauteur minimum de 46px** pour garantir une bonne accessibilité tactile sur mobile.

### Éléments Concernés

#### ✅ Boutons
```css
.btn {
  min-height: 46px;  /* Hauteur minimum pour accessibilité */
}

.btn-icon {
  min-width: 46px;   /* Largeur minimum pour boutons carrés */
  min-height: 46px;
}
```

**Exemples :**
- Bouton primaire : `min-height: 46px`
- Bouton secondaire : `min-height: 46px`
- Bouton icon : `min-width: 46px` + `min-height: 46px`
- Boutons sociaux : `min-height: 46px`

#### ✅ Inputs
```css
.input-field {
  min-height: 46px;  /* Hauteur minimum pour accessibilité */
}
```

**Exemples :**
- Champs texte
- Champs email
- Champs password
- Barre de recherche
- Select/Dropdown

#### ✅ Liens Cliquables
Les liens dans les zones de navigation doivent aussi respecter cette hauteur :
```css
.nav-item {
  min-height: 46px;
  padding: var(--spacing-3);
}
```

## 🎯 Pourquoi 46px ?

### Standards d'Accessibilité
- **WCAG 2.1** recommande une taille minimale de **44px**
- **Apple iOS** recommande **44pt** (environ 44px)
- **Android Material Design** recommande **48dp** (environ 48px)
- **Notre choix : 46px** - Compromis optimal entre les standards

### Avantages
1. ✅ **Accessibilité tactile** : Facile à toucher sur mobile
2. ✅ **Réduction des erreurs** : Moins de clics accidentels
3. ✅ **Conformité WCAG** : Respect des standards d'accessibilité
4. ✅ **UX améliorée** : Meilleure expérience utilisateur

## 📐 Zones de Touch Target

### Zone Minimum Recommandée
```
┌─────────────────────┐
│                     │
│    46px × 46px     │  ← Zone tactile minimum
│                     │
└─────────────────────┘
```

### Espacement Entre Éléments
- **Minimum : 8px** entre deux éléments interactifs
- **Recommandé : 12px** pour plus de confort

```css
.button-group {
  gap: var(--spacing-3);  /* 12px d'espacement */
}
```

## 🎨 Application dans le Design System

### Variables CSS
```css
:root {
  --touch-target-min: 46px;
  --spacing-touch: 12px;
}
```

### Classes Utilitaires
```css
.touch-target {
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
}
```

## ✅ Checklist d'Accessibilité

### Éléments Interactifs
- [ ] Tous les boutons ont `min-height: 46px`
- [ ] Tous les inputs ont `min-height: 46px`
- [ ] Les boutons icon ont `min-width: 46px` et `min-height: 46px`
- [ ] Espacement minimum de 8px entre éléments
- [ ] Contraste de couleur suffisant (ratio 4.5:1 minimum)

### Navigation
- [ ] Items de navigation accessibles au clavier
- [ ] États focus visibles
- [ ] Liens avec zone de clic suffisante

### Formulaires
- [ ] Labels associés aux inputs
- [ ] Messages d'erreur clairs
- [ ] Validation accessible

## 📱 Tests Responsive

### Breakpoints à Tester
1. **Mobile** : 375px (iPhone SE)
2. **Mobile Large** : 414px (iPhone Pro Max)
3. **Tablet** : 768px (iPad)
4. **Desktop** : 1024px et plus

### Tests Tactiles
- Tester sur appareil réel si possible
- Vérifier la facilité de clic/tap
- S'assurer qu'aucun élément ne se chevauche

## 🔧 Outils de Test

### Chrome DevTools
```
1. Ouvrir DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Sélectionner un appareil mobile
4. Tester les interactions
```

### Extensions Utiles
- **WAVE** : Évaluation d'accessibilité
- **axe DevTools** : Tests automatisés
- **Lighthouse** : Audit complet

## 📚 Ressources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html)
- [WebAIM Accessibility](https://webaim.org/)
