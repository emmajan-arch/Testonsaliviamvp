# 🔐 Configuration du Token Figma

## ✅ Votre token a été configuré !

Vous venez de configurer votre `FIGMA_ACCESS_TOKEN` avec succès ! 🎉

---

## 📋 Comment obtenir un token Figma

Si vous avez besoin de créer un nouveau token ou de vérifier votre token actuel :

### **1. Accédez aux paramètres Figma**
1. Connectez-vous à [Figma](https://www.figma.com)
2. Cliquez sur votre avatar en haut à droite
3. Sélectionnez **Settings** (Paramètres)

### **2. Créez un Personal Access Token**
1. Dans le menu de gauche, cliquez sur **Account** (Compte)
2. Faites défiler jusqu'à la section **Personal access tokens**
3. Cliquez sur **Create a new personal access token**
4. Donnez un nom à votre token (ex: "Alivia UX Tool")
5. Cliquez sur **Create token**

### **3. Copiez votre token**
⚠️ **IMPORTANT** : Le token ne s'affichera qu'une seule fois !
- Copiez le token immédiatement
- Conservez-le dans un endroit sûr

---

## 🔑 Format du token

Le token Figma ressemble à ceci :
```
figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Il commence généralement par `figd_` suivi d'une longue chaîne de caractères.

---

## 🛡️ Sécurité

### ✅ **À FAIRE**
- Conservez votre token en sécurité
- Ne le partagez jamais publiquement
- Utilisez-le uniquement dans des variables d'environnement

### ❌ **À NE PAS FAIRE**
- Ne commitez jamais le token dans Git
- Ne le partagez pas dans des messages
- Ne le copiez pas dans du code visible

---

## 🧪 Tester votre token

### **Méthode rapide :**
1. Allez dans l'onglet **Présentation** de l'outil
2. Cliquez sur **"Importer depuis Figma"**
3. Entrez l'URL d'un fichier Figma test
4. Si le token fonctionne, vous verrez les slides se télécharger ! ✅

### **Si le token ne fonctionne pas :**
- Vérifiez que le token est correct (copié entièrement)
- Vérifiez que le fichier Figma est accessible
- Créez un nouveau token si nécessaire

---

## 🔄 Mettre à jour le token

Si vous devez changer votre token Figma :

1. Le modal de configuration s'affichera automatiquement
2. Entrez votre nouveau token
3. Cliquez sur **Save**
4. Testez avec un import Figma

---

## 📊 Permissions requises

Le token Figma doit avoir accès :
- ✅ **Lecture des fichiers** (File content)
- ✅ **Récupération des images** (Images)

Ces permissions sont **automatiquement incluses** dans les Personal Access Tokens.

---

## ❓ Résolution de problèmes

### **Erreur : "Token Figma manquant"**
➡️ Le token n'a pas été configuré correctement. Utilisez le modal qui s'affiche pour entrer votre token.

### **Erreur : "Impossible d'accéder au fichier Figma"**
➡️ Vérifiez :
- L'URL du fichier est correcte
- Vous avez accès au fichier dans Figma
- Le fichier n'est pas privé (ou votre token a accès)

### **Erreur : "Aucun frame trouvé"**
➡️ Assurez-vous que votre fichier Figma contient des **frames de niveau supérieur** (pas juste des groupes ou des composants).

---

## 🎯 Workflow complet

```
1. Créez un token Figma
   ↓
2. Configurez-le dans l'outil (via le modal)
   ↓
3. Importez vos slides depuis Figma
   ↓
4. Modifiez dans Figma
   ↓
5. Synchronisez avec un clic
   ↓
6. ✅ Vos slides sont à jour !
```

---

## 📚 Ressources

- [Documentation Figma API](https://www.figma.com/developers/api)
- [Personal Access Tokens](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)

---

Tout est prêt ! Vous pouvez maintenant utiliser l'import Figma 🚀
