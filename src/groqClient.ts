import Groq from "groq-sdk";

const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

if (!apiKey) {
  console.warn(
    "[Groq] VITE_GROQ_API_KEY n'est pas définie. Le client Groq fonctionnera en mode dégradé."
  );
}

const isBrowser = typeof window !== "undefined";
const isSandbox = (import.meta as any).env?.VITE_IA_SANDBOX === "true";

/**
 * Client Groq partagé dans l'application.
 *
 * ATTENTION : l'utilisation du SDK côté navigateur est potentiellement risquée
 * car elle expose la clé API dans le bundle. Ici, on l'active uniquement
 * pour la sandbox IA via l'option `dangerouslyAllowBrowser`.
 */
export const groqClient = new Groq({
  apiKey: apiKey ?? "",
  ...(isBrowser && isSandbox ? { dangerouslyAllowBrowser: true } : {}),
});

/**
 * Helper optionnel si tu veux t'assurer que la clé est bien configurée
 * avant d'appeler l'API dans un composant / un service.
 */
export function ensureGroqClient() {
  if (!apiKey) {
    throw new Error(
      "[Groq] VITE_GROQ_API_KEY n'est pas définie. Ajoute-la dans ton fichier .env.local à la racine du projet."
    );
  }
  return groqClient;
}


