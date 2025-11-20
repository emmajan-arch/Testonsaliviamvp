import { ensureGroqClient } from "../groqClient";
import type { TestSession } from "../utils/supabase/sessions";

/**
 * Construit un bloc de transcription pour une session,
 * basé UNIQUEMENT sur ce que dit et fait l'utilisateur.
 */
function extractTranscriptionFromSession(
  session: TestSession,
  index: number
): string {
  const headerLines: string[] = [];

  const participantName = session.participant?.name || "Participant inconnu";
  const participantRole = session.participant?.role || "Rôle inconnu";
  const hasVideo = Boolean(session.recordingUrl || (session as any).videoUrl);

  headerLines.push(`Session ${index + 1} (id: ${session.id})`);
  headerLines.push(
    `Participant: ${participantName} — Rôle: ${participantRole}`
  );
  headerLines.push(`Vidéo associée: ${hasVideo ? "oui" : "non"}`);

  const transcription = session.transcription?.trim();

  if (!transcription) {
    headerLines.push(
      "Transcription: [Aucune transcription fournie pour cette session]"
    );
    return headerLines.join("\n");
  }

  headerLines.push("Transcription :");
  headerLines.push(transcription);

  return headerLines.join("\n");
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
    .map((session, index) => extractTranscriptionFromSession(session, index))
    .filter(Boolean)
    .join("\n\n---\n\n");

  if (!allNotes) {
    return `Aucune note exploitable trouvée pour l'étude "${studyId}".`;
  }

  const client = ensureGroqClient();

  const systemPrompt = [
    "Tu es un·e UX Researcher principal·e.",
    "",
    "Je te fournis les transcriptions brutes de plusieurs sessions de test utilisateur (texte issu de fichiers importés ou transcriptions manuelles).",
    "Ne prends PAS en compte les notes internes du chercheur, seulement ce que les utilisateurs disent et font réellement.",
    "",
    "À partir de ces transcriptions, génère une analyse complète et actionnable structurée en 3 parties :",
    "",
    "1. Points positifs",
    "2. Points de frictions majeurs",
    "3. Améliorations suggérées + Next Steps",
    "",
    "Pour chaque friction, identifie les causes profondes et propose des recommandations concrètes et priorisées.",
    "Réponds uniquement sur la base des transcriptions fournies.",
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
    "Les blocs suivants sont les transcriptions brutes des sessions de test utilisateur de cette étude.",
    "Chaque bloc correspond à une session distincte, avec indication du participant et de la présence éventuelle d'une vidéo associée.",
    "",
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


