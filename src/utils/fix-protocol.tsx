/**
 * Utilitaire pour corriger le protocole et restaurer le Score d'adoption
 * dans la tâche 9 "Questions Post-Test"
 */

import { projectId, publicAnonKey } from './supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a80e52b7`;

/**
 * Corrige le protocole à la fois côté serveur ET localStorage
 */
export async function fixProtocolTask9() {
  try {
    console.log('🔧 Début de la correction du protocole...');
    
    // 1. CORRECTION CÔTÉ SERVEUR (prioritaire)
    console.log('🌐 Correction côté serveur...');
    const serverResponse = await fetch(`${SERVER_URL}/protocol/fix-task9`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!serverResponse.ok) {
      const error = await serverResponse.text();
      console.error('❌ Erreur serveur:', error);
      throw new Error(`Erreur serveur: ${error}`);
    }

    const serverResult = await serverResponse.json();
    console.log('✅ Résultat serveur:', serverResult);
    
    // 2. CORRECTION LOCALE (localStorage)
    console.log('💾 Correction du localStorage...');
    const savedProtocol = localStorage.getItem('testProtocol');
    
    if (savedProtocol) {
      try {
        const protocol = JSON.parse(savedProtocol);
        
        if (protocol.tasks && Array.isArray(protocol.tasks)) {
          const task9Index = protocol.tasks.findIndex((t: any) => t.id === 9);
          
          if (task9Index !== -1) {
            const correctMetricsFields = ['postTestFrustrations', 'postTestDataStorage', 'postTestPracticalUse', 'postTestAdoption', 'notes'];
            
            protocol.tasks[task9Index] = {
              ...protocol.tasks[task9Index],
              metricsFields: correctMetricsFields
            };
            
            localStorage.setItem('testProtocol', JSON.stringify(protocol));
            console.log('✅ localStorage mis à jour !');
          }
        }
      } catch (e) {
        console.error('⚠️ Erreur lors de la mise à jour du localStorage:', e);
        // Ne pas bloquer si localStorage échoue
      }
    }
    
    // 3. CORRECTION protocolTasks (cache des tâches)
    console.log('💾 Correction du cache protocolTasks...');
    const savedTasks = localStorage.getItem('protocolTasks');
    
    if (savedTasks) {
      try {
        const tasks = JSON.parse(savedTasks);
        
        if (Array.isArray(tasks)) {
          const task9Index = tasks.findIndex((t: any) => t.id === 9);
          
          if (task9Index !== -1) {
            const correctMetricsFields = ['postTestFrustrations', 'postTestDataStorage', 'postTestPracticalUse', 'postTestAdoption', 'notes'];
            
            tasks[task9Index] = {
              ...tasks[task9Index],
              metricsFields: correctMetricsFields
            };
            
            localStorage.setItem('protocolTasks', JSON.stringify(tasks));
            console.log('✅ Cache protocolTasks mis à jour !');
          }
        }
      } catch (e) {
        console.error('⚠️ Erreur lors de la mise à jour du cache:', e);
        // Ne pas bloquer si cache échoue
      }
    }
    
    return { 
      success: true, 
      message: 'Score d\'adoption restauré !', 
      updated: serverResult.updated,
      needsReload: serverResult.needsReload,
      serverResult
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    return { 
      success: false, 
      message: `Erreur: ${error}`,
      needsReload: false
    };
  }
}

/**
 * Vérifie si le protocole a besoin d'être corrigé
 */
export function checkProtocolNeedsFix(): boolean {
  try {
    // Vérifier testProtocol
    const savedProtocol = localStorage.getItem('testProtocol');
    if (savedProtocol) {
      const protocol = JSON.parse(savedProtocol);
      const task9 = protocol.tasks?.find((t: any) => t.id === 9);
      
      if (task9 && task9.metricsFields && !task9.metricsFields.includes('postTestAdoption')) {
        return true;
      }
    }
    
    // Vérifier protocolTasks
    const savedTasks = localStorage.getItem('protocolTasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      const task9 = tasks?.find((t: any) => t.id === 9);
      
      if (task9 && task9.metricsFields && !task9.metricsFields.includes('postTestAdoption')) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return false;
  }
}
