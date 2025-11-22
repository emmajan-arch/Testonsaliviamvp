# 🔧 Guide de restauration du Score d'adoption

## Problème
Le champ "Score d'adoption" ne s'affiche pas dans la tâche 9 "Questions Post-Test".

## Cause
La tâche 9 dans le protocole sauvegardé (Supabase + localStorage) n'inclut pas `postTestAdoption` dans son tableau `metricsFields`.

## Solution automatique ✨

### Méthode 1 : Via l'interface (RECOMMANDÉ)

1. **Connectez-vous en mode Admin**
2. **Allez dans l'onglet "Protocole"**
3. **Si une bannière rouge apparaît**, cliquez sur le bouton **"Restaurer"**
4. **Rechargez la page** quand le toast de confirmation apparaît
5. ✅ **Le Score d'adoption devrait maintenant être visible dans la tâche 9**

### Méthode 2 : Via la console navigateur

Ouvrez la console du navigateur (F12) et exécutez :

```javascript
// Appeler l'API de correction
fetch('https://{projectId}.supabase.co/functions/v1/make-server-a80e52b7/protocol/fix-task9', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer {publicAnonKey}'
  }
})
.then(r => r.json())
.then(result => {
  console.log('Résultat:', result);
  if (result.success) {
    alert('Score d\'adoption restauré ! Rechargez la page.');
    window.location.reload();
  }
});
```

## Vérification manuelle

### Vérifier le localStorage :

```javascript
// Dans la console navigateur
const protocol = JSON.parse(localStorage.getItem('testProtocol'));
const task9 = protocol.tasks.find(t => t.id === 9);
console.log('metricsFields de la tâche 9:', task9.metricsFields);

// Devrait afficher :
// ['postTestFrustrations', 'postTestDataStorage', 'postTestPracticalUse', 'postTestAdoption', 'notes']
```

### Vérifier le serveur Supabase :

```javascript
// Dans la console navigateur
fetch('https://{projectId}.supabase.co/functions/v1/make-server-a80e52b7/protocol/debug', {
  headers: { 'Authorization': 'Bearer {publicAnonKey}' }
})
.then(r => r.json())
.then(data => {
  const task9 = data.protocol.tasks.find(t => t.id === 9);
  console.log('Task 9 côté serveur:', task9);
});
```

## Structure correcte de la tâche 9

```javascript
{
  id: 9,
  title: 'Questions Post-Test',
  icon: 'MessageSquare',
  description: 'Débriefing à chaud et retour d\'expérience global',
  scenario: 'Prenez 10-15 minutes pour recueillir le retour d\'expérience du participant sur l\'ensemble du test.',
  tasks: [
    'Points frustrants ou bloquants',
    'Compréhension de la souveraineté des données',
    'Valeur perçue dans le quotidien professionnel',
    'Score d\'adoption global',
  ],
  metrics: [],
  tip: 'C\'est le moment de synthèse : laissez le participant s\'exprimer librement.',
  // ⚠️ LIGNE CRITIQUE - doit contenir tous ces champs :
  metricsFields: ['postTestFrustrations', 'postTestDataStorage', 'postTestPracticalUse', 'postTestAdoption', 'notes']
}
```

## Fichiers modifiés

1. **`/supabase/functions/server/index.tsx`** : Route POST `/protocol/fix-task9` pour corriger côté serveur
2. **`/utils/fix-protocol.tsx`** : Utilitaire qui corrige serveur + localStorage + cache
3. **`/components/ProtocolView.tsx`** : Bannière d'alerte rouge avec bouton "Restaurer"
4. **`/components/TestSession.tsx`** : 
   - Tâche 9 par défaut corrigée (ligne 222)
   - Alerte jaune dans la session si configuration incomplète

## Commandes utiles

### Nettoyer complètement le cache local :
```javascript
localStorage.removeItem('testProtocol');
localStorage.removeItem('protocolTasks');
localStorage.removeItem('currentSession');
window.location.reload();
```

### Forcer un rechargement depuis le serveur :
```javascript
localStorage.removeItem('protocolTasks');
window.location.reload();
```

## Support

Si le problème persiste après ces étapes :

1. Vérifiez les logs de la console navigateur
2. Vérifiez les logs du serveur Supabase Edge Functions
3. Assurez-vous qu'aucune session n'est en cours (cela bloque le rechargement du protocole)
