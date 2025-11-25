import { projectId, publicAnonKey } from './info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a80e52b7`;

/**
 * Vérifie la santé du serveur Supabase
 */
export async function checkServerHealth(): Promise<{ ok: boolean; message: string; latency?: number }> {
  const startTime = Date.now();
  
  try {
    console.log('🏥 Health check du serveur Supabase...');
    console.log('🌐 URL:', `${SERVER_URL}/health`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(`${SERVER_URL}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Serveur accessible (${latency}ms)`, data);
      return { 
        ok: true, 
        message: `Serveur opérationnel (${latency}ms)`,
        latency 
      };
    } else {
      console.error('❌ Serveur a répondu avec une erreur:', response.status);
      return { 
        ok: false, 
        message: `Erreur ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error: any) {
    const latency = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.log(`⏱️ Timeout après ${latency}ms - Serveur occupé`);
      return { 
        ok: false, 
        message: `Timeout après ${latency}ms. Le serveur ne répond pas.` 
      };
    }
    
    // Gestion silencieuse des erreurs réseau (comportement normal)
    if (error.message?.includes('Failed to fetch')) {
      console.log('🌐 Serveur Supabase non accessible, mode hors-ligne');
      return { 
        ok: false, 
        message: `Mode hors-ligne` 
      };
    }
    
    // Erreurs inattendues seulement
    console.error('❌ Erreur de connexion inattendue:', error);
    return { 
      ok: false, 
      message: `Erreur de connexion: ${error.message}` 
    };
  }
}