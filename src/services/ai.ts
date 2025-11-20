import { ensureGroqClient } from "../groqClient";
import type { TestSession } from "../utils/supabase/sessions";

/**
 * Concatène toutes les notes et verbatims pertinentes d'une session
 * pour alimenter le prompt IA.
 */
function extractNotesFromSession(session: TestSession): string {
  const parts: string[] = [];

  if (session.generalObservations) {
    parts.push(`Observations générales: ${session.generalObservations}`);
  }

  for (const task of session.tasks) {
    const taskParts: string[] = [];

    if (task.title) {
      taskParts.push(`Tâche: ${task.title}`);
    }
    if (task.notes) {
      taskParts.push(`Notes: ${task.notes}`);
    }
    if (task.verbatim) {
      taskParts.push(`Verbatim: ${task.verbatim}`);
    }
    if (task.taskVerbatimsPositive) {
      taskParts.push(`Points positifs: ${task.taskVerbatimsPositive}`);
    }
    if (task.taskVerbatimsNegative) {
      taskParts.push(`Points négatifs: ${task.taskVerbatimsNegative}`);
    }
    if (task.postTestFrustrations) {
      taskParts.push(`Frustrations: ${task.postTestFrustrations}`);
    }
    if (task.postTestImpression) {
      taskParts.push(`Impression finale: ${task.postTestImpression}`);
    }

    if (taskParts.length > 0) {
      parts.push(taskParts.join(" | "));
    }
  }

  return parts.join("\n");
}

/**
 * Analyse des préoccupations communes pour une étude donnée.
 * Cette fonction est conçue pour être utilisée uniquement dans la sandbox IA.
 */
export async function analyzeCommonConcernsForStudy(
  studyId: string
): Promise<string> {
  if (!studyId.trim()) {
    throw new Error("studyId est requis pour l'analyse.");
  }

  // On charge dynamiquement pour limiter les dépendances croisées
  const { fetchSessions } = await import("../utils/supabase/sessions");

  const allSessions = await fetchSessions();

  // On suppose que les sessions renvoyées par le backend peuvent contenir un champ facultatif `studyId`.
  // Si aucune session ne correspond, on retombe sur toutes les sessions (cas mono-étude actuel).
  let sessionsForStudy = allSessions.filter(
    (session: any) => session.studyId === studyId
  );

  if (sessionsForStudy.length === 0) {
    sessionsForStudy = allSessions;
  }

  const allNotes = sessionsForStudy
    .map((session) => extractNotesFromSession(session))
    .filter(Boolean)
    .join("\n\n---\n\n");

  if (!allNotes) {
    return `Aucune note exploitable trouvée pour l'étude "${studyId}".`;
  }

  const client = ensureGroqClient();

  const systemPrompt = [
    "Tu es un·e UX Researcher senior, habitué·e à rédiger des rapports de test utilisateur clairs, structurés et actionnables pour des équipes Produit, Design et Tech.",
    "",
    "Je te fournis des notes provenant de plusieurs sessions d’une même étude : observations, verbatims, confusions, comportements, signaux faibles, etc.",
    "Tu dois produire une analyse complète, limpide, professionnelle et immédiatement exploitable.",
    "",
    "Ta réponse doit être structurée en 4 sections principales :",
    "",
    "1. 🟢 **Ce qui fonctionne bien (Points positifs)**",
    "   - Liste claire et hiérarchisée des éléments qui ont réellement bien fonctionné.",
    "   - Insiste sur les comportements positifs répétés et les éléments intuitifs.",
    "   - Donne des exemples concrets (verbalisations, comportements observés).",
    "   - Objectif : faire ressortir les forces du produit de manière concise et utile.",
    "",
    "2. 🔴 **Ce qui pose problème (Points de frictions majeurs)**",
    "   - Analyse les irritants récurrents, incompréhensions, blocages, hésitations.",
    "   - Regroupe les frictions par thèmes (ex : compréhension, navigation, feedbacks, charge cognitive, attentes, confiance, etc.).",
    "   - Explique POURQUOI ces frictions apparaissent (causes profondes, mécanismes UX).",
    "   - Ajoute 1–2 verbatims reformulés par friction pour incarner l’insight.",
    "",
    "3. 🟣 **Comment améliorer (Améliorations suggérées + Next Steps)**",
    "   - Pour CHAQUE point de friction important, propose :",
    "     - une ou plusieurs améliorations UX concrètes,",
    "     - leur pertinence (ce problème résout quoi),",
    "     - leur impact potentiel (H/M/L si utile),",
    "     - les risques si rien n’est fait.",
    "   - Termine par une liste de **Next Steps clairs et opérationnels** :",
    "     - 3 à 6 actions immédiates que l’équipe peut entreprendre,",
    "     - ordonnées dans un ordre logique (quick wins → améliorations structurelles).",
    "   - L’objectif est que l’équipe sache “quoi faire demain”.",
    "",
    "4. 🟠 **Synthèse essentielle (3 lignes maximum)**",
    "   - Les 2–3 idées clés à retenir absolument.",
    "   - Une phrase sur l’état général de l’expérience utilisateur.",
    "   - Une phrase sur la direction produit recommandée.",
    "",
    "Contraintes :",
    "- Réponds en français.",
    "- Structure impeccable : titres, sous-titres, listes à puces, espaces, cohérence visuelle.",
    "- Ton professionnel, précis, orienté décision produit.",
    "- Le texte doit pouvoir être copié-collé tel quel dans un rapport UX.",
  ].join("\n");

  const userPrompt = [
    `ID de l'étude : ${studyId}`,
    "",
    "Voici les notes et verbatims bruts issus des sessions de test de cette étude :",
    allNotes,
  ].join("\n\n");

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error(
      "La réponse de l'API Groq est vide ou invalide. Réessaie plus tard."
    );
  }

  return content;
}


