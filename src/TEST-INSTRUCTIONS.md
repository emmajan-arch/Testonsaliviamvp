# 🧪 Instructions de Test - Application Alivia UX Protocol

## 🚀 Mode Test Rapide - Guide Ultra-Rapide

**Pour tester l'app en 10 secondes :**

1. Onglet "Session" → Nom : `test` → Clic "Enregistrer"
2. Clic "Commencer le Test"
3. Utilisez la barre jaune pour naviguer entre les tâches
4. Cliquez sur "Auto-remplir" sur chaque tâche
5. Testez les métriques dynamiques !

---

## 🚀 Mode Test Rapide - Guide Complet

### Comment activer le mode test ?

Pour tester rapidement l'application sans avoir à remplir tous les champs de session, vous pouvez utiliser le **Mode Test** :

1. **Allez dans l'onglet "Session"**
2. **Dans le champ "Nom du participant", tapez exactement : `test`**
3. **Cliquez directement sur "Enregistrer le Participant"** (les autres champs deviennent optionnels et seront auto-remplis)

**C'est tout !** Les champs Rôle, Département, Fréquence IA, etc. sont automatiquement pré-remplis avec des valeurs par défaut si vous les laissez vides.

### ✨ Fonctionnalités du Mode Test

Une fois le mode test activé, vous aurez accès à :

#### 🚫 Validation simplifiée
- **Champs auto-remplis** : Tous les champs du formulaire participant sont optionnels
- **Validation en 1 clic** : Tapez "test" et cliquez sur "Enregistrer", c'est tout !
- **Valeurs par défaut intelligentes** : Si vous laissez un champ vide, il sera automatiquement rempli (Rôle: "Testeur", Département: "Tech", etc.)

#### 🎯 Navigation rapide entre les tâches
- **Barre de navigation avec toutes les tâches** : Cliquez sur n'importe quelle tâche pour y accéder directement
- **Badge "Mode Test"** : Indicateur visuel en haut de page
- **Boutons numérotés** : Navigation instantanée vers n'importe quelle tâche

#### ⚡ Auto-remplissage des données
- **Bouton "Auto-remplir avec des données de test"** : Génère automatiquement :
  - Notes de test
  - Verbatims positifs et négatifs
  - Toutes les métriques (sliders pré-remplis avec des valeurs réalistes)
  - Métriques personnalisées du protocole
  - Durées, niveaux d'autonomie, etc.

#### 🎨 Interface visuelle
- **Thème jaune** : Le mode test utilise une palette jaune pour bien le distinguer du mode réel
- **Indicateurs visuels** : Alertes, badges et icônes dédiées (Zap ⚡ et Sparkles ✨)
- **Page de confirmation personnalisée** : Instructions spécifiques au mode test

### 💡 Cas d'usage

**Mode Test est parfait pour :**
- Tester rapidement l'interface sans saisir de vraies données
- Vérifier que les métriques personnalisées s'affichent correctement
- Naviguer entre les tâches pour valider le design
- Démonstration rapide de l'application
- Développement et debugging

**Mode Normal (sans "test") pour :**
- Sessions réelles avec de vrais participants
- Collecte de données UX authentiques
- Tests utilisateurs officiels

---

## 📋 Test des Métriques Dynamiques

### Comment tester que les métriques du Protocole apparaissent dans la Session ?

1. **Allez dans l'onglet "Protocole"**
2. **Créez ou modifiez une tâche**
3. **Ajoutez des métriques personnalisées** (ex: "Intuitivité", "Satisfaction")
4. **Allez dans l'onglet "Session"**
5. **Lancez une session de test** (nom: "test")
6. **Vérifiez que vos métriques personnalisées apparaissent** en plus de "Clarté" et "Facilité"

Les métriques sont **synchronisées en temps réel** entre Protocole et Session grâce à localStorage.

---

# 🧪 Instructions de Test - Ancien Système Multi-Projets

## Phase 1 : Test des nouveaux composants

### Comment tester ?

**Étape 1 : Activer la page de test**

Ouvre `/App.tsx` et remplace **temporairement** tout le contenu par ces 2 lignes :

```tsx
import TestProjectsPage from './TestProjectsPage';
export default TestProjectsPage;
```

**Étape 2 : Tester les fonctionnalités**

Une fois la page de test activée, tu pourras :

✅ **Créer un nouveau projet**
- Clique sur "Nouveau projet"
- Remplis le nom (ex: "Test Dashboard")
- Choisis un template (essaye "Assistant IA Conversationnel" ou "Navigation")
- Clique sur "Créer le projet"

✅ **Voir la liste des projets**
- Les projets créés s'affichent en cartes
- Chaque carte montre : nom, description, nombre de sessions, dernière session

✅ **Ouvrir un projet**
- Clique sur "Voir" sur une carte de projet
- Tu accèdes au dashboard du projet
- Tu vois l'aperçu du protocole (tâches, métriques, questions)

✅ **Naviguer**
- Depuis le dashboard, clique sur "←" pour revenir à la liste
- Les données sont persistées dans Supabase (KV store)

🚧 **Fonctionnalités non encore branchées (Phase 2)** :
- "Nouveau test" → Affichera une alerte (sera branché à TestSession.tsx)
- "Voir les résultats" → Affichera une alerte (sera branché à ResultsView.tsx)
- "Modifier le protocole" → Affichera une alerte (sera développé en Phase 3)

---

## Ce qui fonctionne déjà

### Backend (KV Store)
- ✅ Création de projets
- ✅ Sauvegarde de protocoles
- ✅ Templates pré-configurés
- ✅ Chargement des projets et protocoles

### UI
- ✅ Design system respecté (couleurs, espacements, bordures)
- ✅ Liste des projets avec recherche visuelle
- ✅ Dashboard du projet
- ✅ Dialog de création avec templates
- ✅ Responsive design

---

## Comment revenir à l'app actuelle ?

**Méthode 1 : Restaurer App.tsx**
Annule les modifications dans `/App.tsx` (Ctrl+Z ou restaure le contenu original)

**Méthode 2 : Supprimer les fichiers**
Si tu veux tout annuler et repartir de zéro :
1. Supprime `/TestProjectsPage.tsx`
2. Supprime `/TEST-INSTRUCTIONS.md`
3. Supprime `/utils/templates.tsx`
4. Supprime `/utils/supabase/projects.tsx`
5. Supprime `/utils/supabase/protocols.tsx`
6. Supprime le dossier `/components/projects/`

Ton app Alivia d'origine fonctionnera exactement comme avant.

---

## Données de test

Les projets créés sont stockés dans Supabase avec ces clés :
- `projects:list` → Liste des IDs de projets
- `project:proj_XXX` → Données d'un projet
- `protocol:proj_XXX` → Protocole d'un projet

Pour nettoyer la base de test (via l'interface Supabase ou le code) :
```tsx
// Dans la console du navigateur ou un script
await kv.del('projects:list');
// Puis supprimer individuellement chaque projet
```

---

## Prochaines étapes (si tu valides Phase 1)

### Phase 2 : Brancher l'existant
- Modifier `TestSession.tsx` pour charger le protocole dynamique
- Modifier `ResultsView.tsx` pour les métriques dynamiques
- Intégrer dans `App.tsx` avec le routing complet

### Phase 3 : Éditeur de protocole
- `ProtocolEditor.tsx` avec onglets (Tâches, Métriques, Démographie)
- Édition des tâches (drag & drop pour réordonner)
- Édition des métriques personnalisées

---

## Questions ?

Si quelque chose ne fonctionne pas :
1. Vérifie la console du navigateur (F12) pour les erreurs
2. Vérifie que Supabase est bien connecté
3. Les toasts (notifications) affichent les erreurs éventuelles

**Bon test ! 🚀**
