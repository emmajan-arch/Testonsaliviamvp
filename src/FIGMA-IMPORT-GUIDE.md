# 🎨 Guide d'import et synchronisation Figma

## ✨ Fonctionnalités implémentées

### 1. **Import depuis Figma**
- ✅ Bouton "Importer depuis Figma" dans l'onglet Présentation
- ✅ Interface de saisie pour coller un lien Figma
- ✅ Téléchargement automatique des frames comme slides
- ✅ Sauvegarde dans Supabase avec métadonnées Figma

### 2. **Synchronisation**
- ✅ Bouton "🔄 Synchroniser avec Figma" dans le menu "..."
- ✅ Mise à jour automatique des slides modifiées dans Figma
- ✅ Indicateur de dernière synchronisation
- ✅ Les slides restent visibles dans le lecteur pendant la synchro

### 3. **Édition rapide**
- ✅ Bouton "✏️ Modifier dans Figma" dans le menu "..."
- ✅ Ouvre le fichier Figma source dans un nouvel onglet
- ✅ Retour facile pour synchroniser les modifications

---

## 🚀 Comment ça marche

### Workflow complet

```
1. Créer vos slides dans Figma
   ↓
2. Importer depuis Figma (via lien)
   ↓
3. Présenter dans l'outil
   ↓
4. Modifier dans Figma (bouton direct)
   ↓
5. Synchroniser les modifications
   ↓
6. Les slides sont mises à jour ! ✨
```

---

## 📋 Guide d'utilisation

### **Étape 1 : Créer vos slides dans Figma**

1. Ouvrez Figma
2. Créez un fichier avec vos slides
3. **Important** : Chaque slide doit être un **Frame** de niveau supérieur
   - Par exemple : "Slide 1", "Slide 2", "Slide 3", etc.
4. Copiez l'URL du fichier depuis votre navigateur

**Format de l'URL :**
```
https://www.figma.com/file/{fileId}/{fileName}
```

---

### **Étape 2 : Importer dans l'outil**

1. Allez dans l'onglet **Présentation**
2. Cliquez sur **"Importer depuis Figma"**
3. Collez l'URL de votre fichier Figma
4. Cliquez sur **"Importer"**
5. ⏳ Attendez le téléchargement (une barre de progression s'affiche)
6. ✅ Vos slides apparaissent dans le lecteur !

---

### **Étape 3 : Présenter**

1. Vos slides sont maintenant dans le lecteur
2. Cliquez sur **"Présenter"** pour lancer la présentation
3. Navigation :
   - **Flèches** ou **Espace** : Slide suivante
   - **Flèche gauche** : Slide précédente
   - **ESC** : Quitter le mode présentation

---

### **Étape 4 : Modifier et synchroniser**

#### **Modifier dans Figma**

1. Dans le lecteur, cliquez sur le menu **"..."**
2. Cliquez sur **"✏️ Modifier dans Figma"**
3. Le fichier Figma s'ouvre dans un nouvel onglet
4. Faites vos modifications dans Figma
5. Sauvegardez dans Figma

#### **Synchroniser les modifications**

1. Revenez dans l'outil
2. Cliquez sur le menu **"..."**
3. Cliquez sur **"🔄 Synchroniser avec Figma"**
4. ⏳ Les slides sont re-téléchargées depuis Figma
5. ✅ Les modifications apparaissent dans le lecteur !

---

## 🔍 Indicateurs visuels

### **Dans le menu "..."**

Quand vous avez des slides Figma, le menu affiche :

- **📤 Exporter en PDF** - Exporter toutes les slides en PDF
- **📊 Exporter en PowerPoint** - Exporter en .pptx
- **🔄 Synchroniser avec Figma** - Mettre à jour depuis Figma
  - Affiche la date de dernière synchronisation
- **✏️ Modifier dans Figma** - Ouvrir le fichier source
- **🗑️ Tout supprimer** - Supprimer toutes les slides

---

## ⚙️ Configuration technique

### **Token Figma**

Le token Figma doit être configuré dans les variables d'environnement :

```
VITE_FIGMA_ACCESS_TOKEN=votre_token_ici
```

✅ **Ce token est déjà configuré dans votre environnement !**

---

## 📊 Métadonnées stockées

Pour chaque slide Figma, nous stockons :

- `figmaFileId` : ID du fichier Figma source
- `figmaFrameId` : ID du frame dans Figma
- `figmaFileUrl` : URL du fichier Figma
- `lastSyncDate` : Date de dernière synchronisation

Cela permet de :
- Savoir quelles slides proviennent de Figma
- Synchroniser uniquement les slides Figma
- Garder un lien vers le fichier source

---

## ❓ FAQ

### **Q : Puis-je mixer des slides Figma et des slides uploadées ?**
**R :** Oui ! Vous pouvez avoir des slides depuis Figma et des slides uploadées (PDF/images) dans le même lecteur.

### **Q : La synchronisation supprime-t-elle mes slides uploadées ?**
**R :** Non ! La synchronisation ne met à jour que les slides provenant de Figma. Les autres slides restent intactes.

### **Q : Que se passe-t-il si je supprime un frame dans Figma ?**
**R :** La slide correspondante restera dans le lecteur jusqu'à ce que vous la supprimiez manuellement.

### **Q : Puis-je synchroniser plusieurs fichiers Figma ?**
**R :** Actuellement, la synchronisation fonctionne avec un seul fichier Figma à la fois. Si vous importez un nouveau fichier, les métadonnées seront mises à jour.

### **Q : Les slides sont-elles en temps réel ?**
**R :** Non, c'est une synchronisation manuelle. Cliquez sur "Synchroniser" pour récupérer les modifications depuis Figma.

---

## 🎯 Avantages de ce workflow

### ✅ **Édition professionnelle**
- Utilisez la puissance de Figma pour créer vos slides
- Tous les outils de design Figma à disposition

### ✅ **Présentation optimisée**
- Lecteur dédié avec mode plein écran
- Navigation fluide avec animations
- Interface épurée

### ✅ **Workflow fluide**
- Un clic pour ouvrir Figma
- Un clic pour synchroniser
- Pas besoin d'export/import manuel

### ✅ **Stockage centralisé**
- Slides stockées dans Supabase
- Accessibles depuis n'importe où
- Sauvegarde automatique

---

## 🚧 Limites actuelles

- ⚠️ Les slides sont converties en **images** (pas de texte éditable dans l'outil)
- ⚠️ La synchronisation est **manuelle** (pas automatique en temps réel)
- ⚠️ Un seul fichier Figma peut être synchronisé à la fois

---

## 🔮 Améliorations futures possibles

1. **Synchronisation automatique** via webhooks Figma
2. **Multi-fichiers** : Gérer plusieurs sources Figma
3. **Synchronisation sélective** : Choisir quelles slides synchroniser
4. **Prévisualisation** : Voir les modifications avant de synchroniser

---

Bon test ! 🎉
