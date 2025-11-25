import { projectId, publicAnonKey } from './info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a80e52b7`;

export interface SlideData {
  id: string;
  url: string;
  name: string;
  figmaFileId?: string;      // ID du fichier Figma source
  figmaFrameId?: string;      // ID du frame dans Figma
  figmaFileUrl?: string;      // URL du fichier Figma
  lastSyncDate?: string;      // Date de dernière synchronisation
  contentHash?: string;       // Hash du contenu pour détecter les modifications
}

// Sauvegarde les slides dans Supabase
export async function saveSlidesToSupabase(slides: SlideData[]) {
  try {
    console.log('💾 Sauvegarde de', slides.length, 'slides...');
    
    // Créer un AbortController avec un timeout de 5 minutes pour les gros fichiers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes
    
    const response = await fetch(`${SERVER_URL}/slides`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ slides }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur saveSlidesToSupabase:', error);
      throw new Error(`Erreur lors de la sauvegarde des slides: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Slides sauvegardées sur Supabase');
    return data;
  } catch (error: any) {
    // Gestion spécifique de l'AbortError
    if (error.name === 'AbortError') {
      console.error('❌ Timeout lors de la sauvegarde (> 5 minutes). Les slides sont peut-être trop volumineuses.');
      throw new Error('Timeout: La sauvegarde prend trop de temps. Essayez avec moins de slides ou des images plus petites.');
    }
    console.error('❌ Erreur saveSlidesToSupabase:', error);
    throw error;
  }
}

// Récupère les slides depuis Supabase
export async function getSlidesFromSupabase(): Promise<SlideData[]> {
  try {
    console.log('📡 Appel de getSlidesFromSupabase...');
    console.log('🌐 Server URL:', SERVER_URL);
    
    // Créer un AbortController avec un timeout de 30 secondes (réduit pour un chargement initial)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('⏱️ Timeout de 30s atteint, annulation de la requête...');
      controller.abort();
    }, 30000); // 30 secondes
    
    const response = await fetch(`${SERVER_URL}/slides`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur getSlidesFromSupabase:', error);
      throw new Error(`Erreur lors de la récupération des slides: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Slides récupérées depuis Supabase:', data.slides?.length || 0);
    return data.slides || [];
  } catch (error: any) {
    // Gestion spécifique de l'AbortError
    if (error.name === 'AbortError') {
      console.log('⏱️ Timeout lors de la récupération (> 30s). Le serveur est occupé.');
      console.log('💡 Utilisation du cache local ou liste vide.');
      // Retourner un tableau vide au lieu de throw pour permettre à l'app de continuer
      return [];
    }
    
    // Autres erreurs réseau
    if (error.message && error.message.includes('Failed to fetch')) {
      console.log('🌐 Serveur Supabase non accessible pour les slides');
      console.log('💡 Utilisation du cache local ou liste vide.');
      // Retourner un tableau vide au lieu de throw
      return [];
    }
    
    // Erreurs inattendues seulement
    console.error('❌ Erreur getSlidesFromSupabase:', error);
    throw error;
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
      console.error('❌ Erreur deleteAllSlidesFromSupabase:', error);
      throw new Error(`Erreur lors de la suppression des slides: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Slides supprimées de Supabase');
    return data;
  } catch (error) {
    console.error('❌ Erreur deleteAllSlidesFromSupabase:', error);
    throw error;
  }
}