import { projectId, publicAnonKey } from './info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a80e52b7`;

export interface SlideData {
  id: string;
  url: string;
  name: string;
}

// Sauvegarde les slides dans Supabase
export async function saveSlidesToSupabase(slides: SlideData[]) {
  try {
    const response = await fetch(`${SERVER_URL}/slides`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ slides }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur lors de la sauvegarde des slides: ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur saveSlidesToSupabase:', error);
    throw error;
  }
}

// Récupère les slides depuis Supabase
export async function getSlidesFromSupabase(): Promise<SlideData[]> {
  try {
    const response = await fetch(`${SERVER_URL}/slides`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur lors de la récupération des slides: ${error}`);
    }

    const data = await response.json();
    return data.slides || [];
  } catch (error) {
    console.error('Erreur getSlidesFromSupabase:', error);
    return [];
  }
}

// Supprime toutes les slides de la base de données
export async function deleteAllSlidesFromSupabase() {
  try {
    const response = await fetch(`${SERVER_URL}/slides`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur lors de la suppression des slides: ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur deleteAllSlidesFromSupabase:', error);
    throw error;
  }
}