/**
 * Utilitaire pour récupérer le token Figma depuis les secrets Supabase
 */

import { projectId, publicAnonKey } from '../supabase/info';

/**
 * Récupère le token Figma depuis les variables d'environnement
 * Note: Le token FIGMA_ACCESS_TOKEN est déjà fourni par l'utilisateur
 */
export async function getFigmaToken(): Promise<string | null> {
  const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a80e52b7`;
  
  console.log('🔑 getFigmaToken: Démarrage...');
  console.log('🔑 Project ID:', projectId);
  console.log('🌐 Server URL:', SERVER_URL);
  
  try {
    console.log('📡 Envoi de la requête au serveur...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(`${SERVER_URL}/figma-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    console.log('📡 Réponse status:', response.status);
    console.log('📡 Réponse OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur lors de la récupération du token Figma');
      console.error('❌ Response status:', response.status);
      console.error('❌ Response text:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('📦 Data reçue:', data);
    console.log('🔑 Token présent:', !!data.token);
    
    return data.token || null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('❌ Timeout lors de la récupération du token Figma (10s)');
    } else {
      console.error('❌ Erreur getFigmaToken:', error.message || error);
    }
    return null;
  }
}