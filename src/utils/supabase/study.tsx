import { projectId, publicAnonKey } from "./info";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a80e52b7`;

export interface Study {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_STUDY: Study = {
  id: "alivia_default_study",
  title: "Étude UX Alivia V2",
};

export async function fetchCurrentStudy(): Promise<Study> {
  try {
    const response = await fetch(`${API_BASE_URL}/study`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Erreur lors du chargement de l'étude:", await response.text());
      return DEFAULT_STUDY;
    }

    const data = await response.json();
    return (data.study as Study) ?? DEFAULT_STUDY;
  } catch (error) {
    console.error("Erreur dans fetchCurrentStudy:", error);
    return DEFAULT_STUDY;
  }
}

export async function updateStudyTitle(newTitle: string): Promise<Study> {
  const safeTitle = newTitle.trim() || "Étude sans titre";

  try {
    const response = await fetch(`${API_BASE_URL}/study`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: safeTitle,
      }),
    });

    if (!response.ok) {
      console.error("Erreur lors de la mise à jour du titre de l'étude:", await response.text());
      throw new Error("Impossible de mettre à jour le titre de l'étude.");
    }

    const data = await response.json();
    return (data.study as Study) ?? { ...DEFAULT_STUDY, title: safeTitle };
  } catch (error) {
    console.error("Erreur dans updateStudyTitle:", error);
    throw error;
  }
}


