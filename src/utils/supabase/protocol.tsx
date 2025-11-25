import { projectId, publicAnonKey } from './info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a80e52b7`;

// Helper pour faire des requêtes avec timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Timeout après ${timeoutMs}ms - Le serveur Supabase ne répond pas assez vite`);
    }
    throw error;
  }
}

// Sauvegarde les tâches du protocole dans Supabase
export async function saveProtocolToSupabase(tasks: any[]) {
  try {
    const response = await fetchWithTimeout(`${SERVER_URL}/protocol`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ tasks }),
    }, 15000); // 15s timeout pour la sauvegarde

    if (!response.ok) {
      const error = await response.text();
      console.error('Erreur saveProtocolToSupabase:', error);
      throw new Error(`Erreur lors de la sauvegarde: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Protocole sauvegardé sur Supabase');
    return data;
  } catch (error) {
    console.error('❌ Erreur saveProtocolToSupabase:', error);
    throw error;
  }
}

// Récupère les tâches du protocole depuis Supabase
export async function getProtocolFromSupabase() {
  try {
    console.log('📡 Appel de getProtocolFromSupabase...');
    console.log('🌐 Server URL:', SERVER_URL);
    
    const response = await fetchWithTimeout(`${SERVER_URL}/protocol`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    }, 10000); // 10s timeout

    if (!response.ok) {
      const error = await response.text();
      console.error('Erreur getProtocolFromSupabase:', error);
      throw new Error(`Erreur lors de la récupération: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Protocole récupéré depuis Supabase');
    // Retourner à la fois les tâches et le timestamp
    return {
      tasks: data.tasks || null,
      timestamp: data.timestamp || null
    };
  } catch (error: any) {
    // Ne logger que si ce n'est pas un timeout ou une erreur réseau (comportements normaux)
    if (!error.message?.includes('Timeout') && !error.message?.includes('Failed to fetch')) {
      console.error('❌ Erreur getProtocolFromSupabase:', error);
    } else if (error.message?.includes('Failed to fetch')) {
      console.log('🌐 Serveur Supabase non accessible, utilisation du cache local');
    }
    
    // Si c'est un timeout ou une erreur réseau, retourner null au lieu de throw
    if (error.message && (error.message.includes('Timeout') || error.message.includes('timeout') || error.message.includes('Failed to fetch'))) {
      return { tasks: null, timestamp: null };
    }
    
    throw error;
  }
}

// Récupère le timestamp de dernière mise à jour
export async function getProtocolTimestamp() {
  try {
    const response = await fetchWithTimeout(`${SERVER_URL}/protocol/timestamp`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    }, 5000); // 5s timeout (requête rapide)

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.timestamp || null;
  } catch (error) {
    // Ne pas logger, c'est un polling normal
    return null;
  }
}

// Sauvegarde les sections du protocole dans Supabase
export async function saveProtocolSectionsToSupabase(sections: any) {
  try {
    const response = await fetchWithTimeout(`${SERVER_URL}/protocol/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ sections }),
    }, 10000); // 10s timeout

    if (!response.ok) {
      const error = await response.text();
      console.error('Erreur saveProtocolSectionsToSupabase:', error);
      throw new Error(`Erreur lors de la sauvegarde: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Sections du protocole sauvegardées sur Supabase');
    return data;
  } catch (error) {
    console.error('❌ Erreur saveProtocolSectionsToSupabase:', error);
    throw error;
  }
}

// Récupère les sections du protocole depuis Supabase
export async function getProtocolSectionsFromSupabase() {
  try {
    const response = await fetchWithTimeout(`${SERVER_URL}/protocol/sections`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    }, 10000); // 10s timeout

    if (!response.ok) {
      const error = await response.text();
      console.error('Erreur getProtocolSectionsFromSupabase:', error);
      throw new Error(`Erreur lors de la récupération: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Sections du protocole récupérées depuis Supabase');
    return data.sections || null;
  } catch (error: any) {
    // Ne logger que si ce n'est pas un timeout ou une erreur réseau
    if (!error.message?.includes('Timeout') && !error.message?.includes('Failed to fetch')) {
      console.error('❌ Erreur getProtocolSectionsFromSupabase:', error);
    }
    
    // Retourner null pour les erreurs réseau (au lieu de throw)
    if (error.message && (error.message.includes('Timeout') || error.message.includes('timeout') || error.message.includes('Failed to fetch'))) {
      return null;
    }
    
    throw error;
  }
}