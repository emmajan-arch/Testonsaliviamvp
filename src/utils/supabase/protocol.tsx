import { projectId, publicAnonKey } from './info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a80e52b7`;

// Sauvegarde les tâches du protocole dans Supabase
export async function saveProtocolToSupabase(tasks: any[]) {
  try {
    const response = await fetch(`${SERVER_URL}/protocol`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ tasks }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur lors de la sauvegarde: ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur saveProtocolToSupabase:', error);
    throw error;
  }
}

// Récupère les tâches du protocole depuis Supabase
export async function getProtocolFromSupabase() {
  try {
    const response = await fetch(`${SERVER_URL}/protocol`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur lors de la récupération: ${error}`);
    }

    const data = await response.json();
    // Retourner à la fois les tâches et le timestamp
    return {
      tasks: data.tasks || null,
      timestamp: data.timestamp || null
    };
  } catch (error) {
    console.error('Erreur getProtocolFromSupabase:', error);
    return { tasks: null, timestamp: null };
  }
}

// Récupère le timestamp de dernière mise à jour
export async function getProtocolTimestamp() {
  try {
    const response = await fetch(`${SERVER_URL}/protocol/timestamp`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.timestamp || null;
  } catch (error) {
    console.error('Erreur getProtocolTimestamp:', error);
    return null;
  }
}

// Sauvegarde les sections du protocole dans Supabase
export async function saveProtocolSectionsToSupabase(sections: any) {
  try {
    const response = await fetch(`${SERVER_URL}/protocol/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ sections }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur lors de la sauvegarde: ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur saveProtocolSectionsToSupabase:', error);
    throw error;
  }
}

// Récupère les sections du protocole depuis Supabase
export async function getProtocolSectionsFromSupabase() {
  try {
    const response = await fetch(`${SERVER_URL}/protocol/sections`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur lors de la récupération: ${error}`);
    }

    const data = await response.json();
    return data.sections || null;
  } catch (error) {
    console.error('Erreur getProtocolSectionsFromSupabase:', error);
    return null;
  }
}
