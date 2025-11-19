// Script pour fixer le TestSession.tsx
// Le problème: j'ai ouvert {currentTask !== 0 && ( à la ligne 957
// mais je ne l'ai pas fermé avec )} avant d'ouvrir le prochain div

// Ligne 957: {currentTask !== 0 && (
// Ligne 1012: </div>  <- fin du bloc de métriques
// Ligne 1013: ligne vide
// Ligne 1014: <div className={isOptionalTask... <- ERREUR ICI: attend ) avant className

// Solution: Ajouter )} après la ligne 1012 (après </div>)
//           Ajouter {currentTask !== 0 && ( avant la ligne 1014

// La ligne 1149 devra aussi avoir )} pour fermer le second bloc conditionnel
