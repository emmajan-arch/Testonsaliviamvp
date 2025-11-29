import { SlideData } from '../supabase/slides';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

/**
 * Trie récursivement les clés d'un objet pour garantir un JSON.stringify déterministe
 */
function sortObjectKeys(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  
  const sorted: any = {};
  Object.keys(obj).sort().forEach(key => {
    sorted[key] = sortObjectKeys(obj[key]);
  });
  return sorted;
}

/**
 * Calcule un hash du contenu d'un node Figma pour détecter les modifications
 * Utilise UNIQUEMENT les propriétés visuelles stables (pas de timestamps)
 */
function calculateNodeContentHash(node: any, silent: boolean = false): string {
  if (!silent) {
    console.log('🔨 calculateNodeContentHash appelé pour:', node.name);
  }
  
  // ✅ Fonction récursive pour extraire le contenu des enfants
  const extractNodeContent = (n: any): any => {
    if (!n) return null;
    
    return {
      type: n.type,
      name: n.name,
      // Géométrie (arrondir pour éviter les micro-variations)
      bounds: n.absoluteBoundingBox ? {
        w: Math.round(n.absoluteBoundingBox.width || 0),
        h: Math.round(n.absoluteBoundingBox.height || 0),
        x: Math.round(n.absoluteBoundingBox.x || 0),
        y: Math.round(n.absoluteBoundingBox.y || 0),
      } : null,
      
      // Styles visuels (triés pour être déterministes)
      fills: n.fills ? sortObjectKeys(n.fills) : null,
      strokes: n.strokes ? sortObjectKeys(n.strokes) : null,
      effects: n.effects ? sortObjectKeys(n.effects) : null,
      bg: n.backgroundColor ? sortObjectKeys(n.backgroundColor) : null,
      
      // Propriétés de style supplémentaires
      opacity: n.opacity,
      blendMode: n.blendMode,
      
      // Texte (si applicable)
      chars: n.characters,
      style: n.style ? sortObjectKeys(n.style) : null,
      
      // Enfants (récursif - CONTENU complet)
      children: n.children?.map((child: any) => extractNodeContent(child)) || null,
    };
  };
  
  // Extraire tout le contenu du node et de ses enfants
  const content = extractNodeContent(node);
  
  // Convertir en JSON trié pour garantir le déterminisme
  const contentRepresentation = JSON.stringify(sortObjectKeys(content));
  
  // Calculer un hash simple (somme des codes de caractères)
  let hash = 0;
  for (let i = 0; i < contentRepresentation.length; i++) {
    const char = contentRepresentation.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en entier 32 bits
  }
  
  const hashString = Math.abs(hash).toString(36);
  
  if (!silent) {
    console.log('🔨 Hash calculé:', hashString);
    console.log('🔨 Basé sur:', {
      name: node.name,
      type: node.type,
      dimensions: `${Math.round(node.absoluteBoundingBox?.width || 0)}x${Math.round(node.absoluteBoundingBox?.height || 0)}`,
      hasFills: !!node.fills,
      hasStrokes: !!node.strokes,
      hasText: !!node.characters,
      childrenCount: node.children?.length || 0,
      contentLength: contentRepresentation.length,
    });
  }
  
  return hashString;
}

/**
 * Extrait le File ID depuis une URL Figma
 */
export function extractFileIdFromUrl(url: string): string | null {
  console.log('🔍 extractFileIdFromUrl:', url);
  
  // Formats supportés:
  // https://www.figma.com/file/{fileId}/...
  // https://www.figma.com/design/{fileId}/...
  // https://www.figma.com/proto/{fileId}/...
  const patterns = [
    /figma\.com\/file\/([a-zA-Z0-9]+)/,
    /figma\.com\/design\/([a-zA-Z0-9]+)/,
    /figma\.com\/proto\/([a-zA-Z0-9]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      console.log('✅ File ID trouvé:', match[1]);
      return match[1];
    }
  }
  
  console.error('❌ Aucun File ID trouvé dans l\'URL');
  return null;
}

/**
 * Récupère les informations d'un fichier Figma
 */
export async function getFigmaFileInfo(
  fileId: string,
  accessToken: string
): Promise<{ name: string; fileUrl: string; lastModified: string; document?: any } | null> {
  try {
    console.log('📂 getFigmaFileInfo pour fileId:', fileId);
    
    const response = await fetch(`${FIGMA_API_BASE}/files/${fileId}`, {
      headers: {
        'X-Figma-Token': accessToken,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API Figma:', response.status, errorText);
      throw new Error(`Erreur API Figma (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ File info récupéré:', data.name, 'Last modified:', data.lastModified);
    
    return {
      name: data.name,
      fileUrl: `https://www.figma.com/file/${fileId}`,
      lastModified: data.lastModified,
      document: data.document, // ✅ Inclure le document complet pour syncSlidesFromFigma
    };
  } catch (error) {
    console.error('❌ Erreur getFigmaFileInfo:', error);
    throw error;
  }
}

/**
 * Vérifie si le fichier Figma a été modifié depuis la dernière synchronisation
 */
export async function checkFigmaFileUpdates(
  fileId: string,
  accessToken: string,
  lastSyncDate: string
): Promise<{ hasUpdates: boolean; lastModified: string }> {
  try {
    console.log('🔍 Vérification des mises à jour Figma...');
    console.log('📅 Dernière synchro:', lastSyncDate);
    
    const fileInfo = await getFigmaFileInfo(fileId, accessToken);
    
    if (!fileInfo) {
      throw new Error('Impossible de récupérer les informations du fichier');
    }
    
    const lastModified = fileInfo.lastModified;
    const hasUpdates = new Date(lastModified) > new Date(lastSyncDate);
    
    console.log('📅 Dernière modification Figma:', lastModified);
    console.log(hasUpdates ? '✨ Nouvelles modifications détectées !' : '✅ Fichier à jour');
    
    return {
      hasUpdates,
      lastModified,
    };
  } catch (error) {
    console.error('❌ Erreur checkFigmaFileUpdates:', error);
    throw error;
  }
}

/**
 * Vérifie quelles slides individuelles ont été modifiées dans Figma
 * Retourne un Set avec les frameIds des slides modifiées
 * 
 * Approche: Compare le hash du contenu actuel de chaque frame avec le hash stocké
 * Cela permet une détection précise slide par slide des modifications réelles
 */
export async function checkIndividualSlideUpdates(
  fileId: string,
  accessToken: string,
  slidesToCheck: SlideData[]
): Promise<Set<string>> {
  try {
    console.log('\n🔍 === VÉRIFICATION DES MISES À JOUR INDIVIDUELLES ===');
    console.log('📂 File ID:', fileId);
    console.log('📊 Nombre de slides à vérifier:', slidesToCheck.length);
    
    const modifiedFrameIds = new Set<string>();
    
    // Filtrer les slides qui ont un contentHash
    const slidesWithHash = slidesToCheck.filter(s => s.contentHash);
    const slidesWithoutHash = slidesToCheck.filter(s => !s.contentHash);
    
    console.log(`\n📊 État des slides:`);
    console.log(`   ✅ Avec hash: ${slidesWithHash.length}`);
    console.log(`   ❌ Sans hash: ${slidesWithoutHash.length}`);
    
    if (slidesWithoutHash.length > 0) {
      console.log(`\n⚠️ ${slidesWithoutHash.length} slide(s) SANS hash (ne peuvent pas être vérifiées)`);
      console.log(`💡 Conseil: Synchronisez ces slides pour générer leur hash`);
    }
    
    if (slidesWithHash.length === 0) {
      console.log('\n⚠️ AUCUNE slide avec hash trouvée. Impossible de détecter les modifications.');
      console.log('💡 Toutes les slides doivent être synchronisées au moins une fois pour avoir un hash.');
      return modifiedFrameIds;
    }
    
    console.log(`\n🔎 Vérification des ${slidesWithHash.length} slides avec hash...`);
    
    // ✅ OPTIMISATION: Traiter par batches de 10 frames en PARALLÈLE
    const BATCH_SIZE = 10;
    const batches: SlideData[][] = [];
    
    for (let i = 0; i < slidesWithHash.length; i += BATCH_SIZE) {
      batches.push(slidesWithHash.slice(i, Math.min(i + BATCH_SIZE, slidesWithHash.length)));
    }
    
    console.log(`📦 ${batches.length} batch(es) à traiter en parallèle`);
    
    // ✅ PARALLÉLISER les requêtes pour gagner du temps
    const batchPromises = batches.map(async (batch, batchIndex) => {
      const batchIds = batch.map(s => s.figmaFrameId!).join(',');
      
      try {
        // ✅ OPTIMISATION: depth=5 au lieu de 10 (plus rapide, suffit pour 99% des cas)
        const response = await fetch(
          `${FIGMA_API_BASE}/files/${fileId}/nodes?ids=${batchIds}&depth=5`,
          {
            headers: {
              'X-Figma-Token': accessToken,
            },
          }
        );
        
        if (!response.ok) {
          console.log(`⚠️ Batch ${batchIndex + 1} - Erreur API (${response.status}), slides ignorées`);
          return [];
        }
        
        const data = await response.json();
        const modified: string[] = [];
        
        // Vérifier chaque frame du batch
        for (const slide of batch) {
          const frameId = slide.figmaFrameId!;
          const storedHash = slide.contentHash!;
          const frameData = data.nodes[frameId];
          
          if (!frameData?.document) {
            continue;
          }
          
          // Calculer le hash actuel du contenu (mode silencieux)
          const currentHash = calculateNodeContentHash(frameData.document, true);
          
          // ✅ LOG DÉTAILLÉ pour debug
          console.log(`\n🔍 Comparaison pour "${slide.name}" (frameId: ${frameId})`);
          console.log(`   📦 Hash STOCKÉ:  "${storedHash}"`);
          console.log(`   🆕 Hash ACTUEL:  "${currentHash}"`);
          console.log(`   🔢 Longueur stocké: ${storedHash.length}, actuel: ${currentHash.length}`);
          console.log(`   🎯 Type stocké: ${typeof storedHash}, actuel: ${typeof currentHash}`);
          console.log(`   ✔️ Strictement égal (===): ${currentHash === storedHash ? 'OUI' : 'NON'}`);
          console.log(`   ✔️ Égal (==): ${currentHash == storedHash ? 'OUI' : 'NON'}`);
          
          // Comparer les hash
          if (currentHash !== storedHash) {
            console.log(`   ❌ RÉSULTAT: DIFFÉRENTS → Slide marquée comme MODIFIÉE`);
            modified.push(frameId);
          } else {
            console.log(`   ✅ RÉSULTAT: IDENTIQUES → Slide INCHANGÉE`);
          }
        }
        
        return modified;
      } catch (error: any) {
        // Gestion silencieuse des erreurs réseau (comportement normal)
        if (error.message?.includes('Failed to fetch')) {
          console.log(`🌐 Batch ${batchIndex + 1} - Serveur Figma non accessible, retry plus tard`);
        } else if (error.name === 'AbortError') {
          console.log(`⏱️ Batch ${batchIndex + 1} - Timeout, retry plus tard`);
        } else {
          // Erreurs inattendues seulement
          console.error(`❌ Batch ${batchIndex + 1} - Erreur inattendue:`, error);
        }
        return [];
      }
    });
    
    // Attendre que tous les batches soient traités
    const results = await Promise.all(batchPromises);
    
    // Combiner tous les résultats
    results.flat().forEach(frameId => modifiedFrameIds.add(frameId));
    
    console.log(`\n📊 RÉSULTAT FINAL: ${modifiedFrameIds.size} slide(s) modifiée(s)`);
    if (modifiedFrameIds.size > 0) {
      console.log('📝 Liste des frameIds modifiés:', Array.from(modifiedFrameIds));
      console.log('\n💡 Note: Ces slides ont un contenu différent de leur dernière synchronisation.');
    }
    
    return modifiedFrameIds;
    
  } catch (error) {
    console.error('❌ Erreur checkIndividualSlideUpdates:', error);
    throw error;
  }
}

/**
 * Détecte les nouvelles slides ajoutées dans Figma qui ne sont pas encore synchronisées
 * Retourne un tableau avec les informations des nouvelles frames
 */
export async function detectNewSlidesInFigma(
  fileId: string,
  accessToken: string,
  existingSlides: SlideData[]
): Promise<Array<{ id: string; name: string }>> {
  try {
    console.log('\n🔍 === DÉTECTION DES NOUVELLES SLIDES ===');
    console.log('📂 File ID:', fileId);
    console.log('📊 Slides existantes:', existingSlides.length);
    
    // 1. Récupérer les informations du fichier Figma
    const fileInfo = await getFigmaFileInfo(fileId, accessToken);
    
    if (!fileInfo || !fileInfo.document) {
      throw new Error('Impossible de récupérer les informations du fichier Figma');
    }
    
    // 2. Trouver toutes les frames actuelles dans Figma
    const figmaFrames: Array<{ id: string; name: string }> = [];
    
    // ✅ Taille minimale pour considérer une frame comme une slide (1920x1080px - format présentation standard)
    const MIN_FRAME_WIDTH = 1920;
    const MIN_FRAME_HEIGHT = 1080;
    
    const findFrames = (node: any) => {
      if (!node || !node.type) return;
      
      if (node.type === 'FRAME' || node.type === 'COMPONENT') {
        // ✅ Vérifier que la frame a une taille minimale (pour ignorer les icônes, petits éléments, etc.)
        const width = node.absoluteBoundingBox?.width || 0;
        const height = node.absoluteBoundingBox?.height || 0;
        
        if (width >= MIN_FRAME_WIDTH && height >= MIN_FRAME_HEIGHT) {
          figmaFrames.push({ id: node.id, name: node.name });
          console.log(`✅ Frame valide: "${node.name}" (${Math.round(width)}x${Math.round(height)}px)`);
        } else {
          console.log(`⏭️  Frame ignorée (trop petite < ${MIN_FRAME_WIDTH}x${MIN_FRAME_HEIGHT}): "${node.name}" (${Math.round(width)}x${Math.round(height)}px)`);
        }
        return;
      }
      
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => findFrames(child));
      }
    };
    
    fileInfo.document.children.forEach((page: any) => {
      if (page && page.children) {
        page.children.forEach((child: any) => findFrames(child));
      }
    });
    
    console.log(`📊 Frames trouvées dans Figma: ${figmaFrames.length}`);
    
    // 3. Créer un Set des figmaFrameIds existants
    const existingFrameIds = new Set(
      existingSlides
        .map(s => s.figmaFrameId)
        .filter(id => id !== undefined) as string[]
    );
    
    console.log(`📊 FrameIds existants: ${existingFrameIds.size}`);
    
    // 4. Trouver les nouvelles frames (qui existent dans Figma mais pas dans l'app)
    const newFrames = figmaFrames.filter(frame => !existingFrameIds.has(frame.id));
    
    console.log(`\n✨ ${newFrames.length} nouvelle(s) slide(s) détectée(s)`);
    
    if (newFrames.length > 0) {
      console.log('📝 Nouvelles slides:', newFrames.map(f => f.name).join(', '));
    }
    
    return newFrames;
    
  } catch (error) {
    console.error('❌ Erreur detectNewSlidesInFigma:', error);
    throw error;
  }
}

/**
 * Synchronise une seule slide depuis Figma
 */
export async function syncSingleSlide(
  fileId: string,
  frameId: string,
  accessToken: string
): Promise<{ id: string; name: string; imageBase64: string; lastModified: string; contentHash: string } | null> {
  try {
    console.log(`🔄 Synchronisation de la slide ${frameId}...`);
    
    // ✅ OPTIMISATION: Lancer les 2 requêtes API en PARALLÈLE
    const [fileInfo, fileResponse] = await Promise.all([
      // 1. Récupérer le lastModified du fichier
      getFigmaFileInfo(fileId, accessToken),
      
      // 2. Récupérer les informations du frame avec depth=5 (cohérence avec vérification)
      fetch(`${FIGMA_API_BASE}/files/${fileId}/nodes?ids=${frameId}&depth=5`, {
        headers: {
          'X-Figma-Token': accessToken,
        },
      })
    ]);
    
    if (!fileInfo) {
      throw new Error('Impossible de récupérer les informations du fichier');
    }
    
    const fileLastModified = fileInfo.lastModified;

    if (!fileResponse.ok) {
      throw new Error(`Erreur lors de la récupération du frame (${fileResponse.status})`);
    }

    const fileData = await fileResponse.json();
    const frameData = fileData.nodes[frameId];
    
    if (!frameData || !frameData.document) {
      throw new Error('Frame introuvable');
    }
    
    const frameName = frameData.document.name;
    
    // Calculer le hash du contenu pour détection des modifications (mode silencieux)
    const contentHash = calculateNodeContentHash(frameData.document, true);
    console.log(`🔐 Hash calculé: ${contentHash}`);
    
    // Récupérer l'image du frame avec une qualité optimisée
    const imageResponse = await fetch(
      `${FIGMA_API_BASE}/images/${fileId}?ids=${frameId}&format=png&scale=2`,
      {
        headers: {
          'X-Figma-Token': accessToken,
        },
      }
    );

    if (!imageResponse.ok) {
      throw new Error(`Erreur lors de la récupération de l'image (${imageResponse.status})`);
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.images[frameId];

    if (!imageUrl) {
      throw new Error('URL d\'image non disponible');
    }

    // Télécharger l'image
    const imgResponse = await fetch(imageUrl);
    const imgBlob = await imgResponse.blob();
    
    // Convertir en base64
    const imageBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(imgBlob);
    });

    console.log(`✅ Slide ${frameId} synchronisée (hash: ${contentHash})`);
    
    return {
      id: frameId,
      name: frameName,
      imageBase64,
      lastModified: fileLastModified,
      contentHash, // ✅ Retourner le hash pour la détection des changements
    };
  } catch (error) {
    console.error(`❌ Erreur syncSingleSlide pour ${frameId}:`, error);
    throw error;
  }
}

/**
 * Synchronise les slides depuis Figma (importe toutes les frames de niveau supérieur)
 */
export async function syncSlidesFromFigma(
  fileId: string,
  accessToken: string,
  onProgress?: (current: number, total: number, slideName?: string, slideData?: { id: string; name: string; imageBase64: string; lastModified: string; contentHash: string }) => void
): Promise<Array<{ id: string; name: string; imageBase64: string; lastModified: string; contentHash: string }>> {
  try {
    console.log('🔄 Synchronisation des slides depuis Figma...');
    console.log('📂 File ID:', fileId);
    
    // 1. Récupérer les informations du fichier
    const fileInfo = await getFigmaFileInfo(fileId, accessToken);
    
    if (!fileInfo) {
      throw new Error('Impossible de récupérer les informations du fichier Figma');
    }
    
    console.log('✅ Fichier récupéré:', fileInfo.name);
    console.log('📅 Dernière modification:', fileInfo.lastModified);
    
    // Vérifications de sécurité
    if (!fileInfo.document) {
      console.error('❌ fileInfo.document est undefined');
      console.log('📋 Structure de fileInfo:', JSON.stringify(fileInfo, null, 2));
      throw new Error('Structure du fichier Figma invalide : document manquant');
    }
    
    if (!fileInfo.document.children || !Array.isArray(fileInfo.document.children)) {
      console.error('❌ fileInfo.document.children est undefined ou n\'est pas un tableau');
      console.log('📋 Structure de fileInfo.document:', JSON.stringify(fileInfo.document, null, 2));
      throw new Error('Structure du fichier Figma invalide : pages manquantes');
    }
    
    console.log('📄 Nombre de pages:', fileInfo.document.children.length);
    
    // 2. Trouver toutes les frames de niveau supérieur (slides)
    const frames: Array<{ id: string; name: string }> = [];
    
    const findFrames = (node: any) => {
      if (!node || !node.type) {
        console.warn('⚠️ Node invalide détecté:', node);
        return;
      }
      
      if (node.type === 'FRAME' || node.type === 'COMPONENT') {
        frames.push({ id: node.id, name: node.name });
        return; // Ne pas descendre dans les enfants des frames
      }
      
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => findFrames(child));
      }
    };
    
    fileInfo.document.children.forEach((page: any) => {
      if (!page) {
        console.warn('⚠️ Page undefined détectée');
        return;
      }
      
      console.log(`📄 Analyse de la page: "${page.name || 'Sans nom'}"`);
      
      if (page.children && Array.isArray(page.children)) {
        page.children.forEach((child: any) => findFrames(child));
      } else {
        console.warn(`⚠️ Page "${page.name}" n'a pas de children valides`);
      }
    });
    
    console.log(`🎯 ${frames.length} frames trouvées`);
    
    if (frames.length === 0) {
      throw new Error('Aucune frame trouvée dans le fichier Figma');
    }
    
    // 3. Récupérer les données détaillées de toutes les frames (pour le contentHash)
    console.log('📥 Récupération des données détaillées des frames...');
    const frameIds = frames.map(f => f.id).join(',');
    const nodesResponse = await fetch(
      `${FIGMA_API_BASE}/files/${fileId}/nodes?ids=${frameIds}&depth=5`,
      {
        headers: {
          'X-Figma-Token': accessToken,
        },
      }
    );
    
    if (!nodesResponse.ok) {
      throw new Error(`Erreur lors de la récupération des nodes (${nodesResponse.status})`);
    }
    
    const nodesData = await nodesResponse.json();
    console.log('✅ Données détaillées récupérées');
    
    // 4. Récupérer les images de toutes les frames
    const frameIdsStr = frames.map(f => f.id).join(',');
    const imageResponse = await fetch(
      `${FIGMA_API_BASE}/images/${fileId}?ids=${frameIdsStr}&format=png&scale=2`,
      {
        headers: {
          'X-Figma-Token': accessToken,
        },
      }
    );
    
    if (!imageResponse.ok) {
      throw new Error(`Erreur lors de la récupération des images (${imageResponse.status})`);
    }
    
    const imageData = await imageResponse.json();
    console.log('✅ URLs des images récupérées');
    
    // 5. Télécharger toutes les images et calculer les hash - SÉQUENTIELLEMENT pour import progressif
    const slides: Array<{ id: string; name: string; imageBase64: string; lastModified: string; contentHash: string }> = [];
    
    for (let index = 0; index < frames.length; index++) {
      const frame = frames[index];
      const imageUrl = imageData.images[frame.id];
      
      if (!imageUrl) {
        console.warn(`⚠️ Pas d'URL d'image pour la frame ${frame.name}`);
        continue;
      }
      
      try {
        // Télécharger l'image
        const imgResponse = await fetch(imageUrl);
        const imgBlob = await imgResponse.blob();
        
        // Convertir en base64
        const imageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imgBlob);
        });
        
        // Calculer le hash du contenu
        const nodeData = nodesData.nodes[frame.id];
        let contentHash = '';
        
        if (nodeData && nodeData.document) {
          console.log(`🔐 Calcul du hash pour \"${frame.name}\"...`);
          contentHash = calculateNodeContentHash(nodeData.document);
        } else {
          console.warn(`⚠️ Pas de données de node pour \"${frame.name}\", hash par défaut`);
          contentHash = Date.now().toString(36);
        }
        
        console.log(`✅ Frame \"${frame.name}\" téléchargée et hash calculé: ${contentHash}`);
        
        const slideData = {
          id: frame.id,
          name: frame.name,
          imageBase64,
          lastModified: fileInfo.lastModified,
          contentHash,
        };
        
        slides.push(slideData);
        
        // ✅ Appeler le callback immédiatement après chaque slide téléchargée
        if (onProgress) {
          onProgress(index + 1, frames.length, frame.name, slideData);
        }
      } catch (error) {
        console.error(`❌ Erreur lors du téléchargement de la frame ${frame.name}:`, error);
        // On continue avec les autres slides
      }
    }
    
    console.log(`✅ ${slides.length}/${frames.length} slides synchronisées avec succès`);
    
    return slides;
  } catch (error) {
    console.error('❌ Erreur syncSlidesFromFigma:', error);
    throw error;
  }
}