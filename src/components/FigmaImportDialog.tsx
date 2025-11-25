import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { extractFileIdFromUrl, getFigmaFileInfo, syncSlidesFromFigma } from '../utils/figma/sync';
import { getFigmaToken } from '../utils/figma/token';
import { toast } from 'sonner@2.0.3';

interface FigmaImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (slides: Array<{ id: string; name: string; imageBase64: string; lastModified: string; contentHash: string }>, fileUrl: string) => void;
  onSlideImported?: (slide: { id: string; name: string; imageBase64: string; lastModified: string; contentHash: string }, fileUrl: string) => void;
  onImportStart?: (totalSlides: number, fileUrl: string) => void;
  onProgressUpdate?: (currentSlideName: string) => void;
}

interface ImportProgress {
  phase: 'connecting' | 'loading-file' | 'discovering-frames' | 'downloading';
  currentSlide?: string;
  current: number;
  total: number;
  processedSlides: Array<{ name: string; status: 'done' | 'error' }>;
}

export function FigmaImportDialog({ open, onOpenChange, onImportComplete, onSlideImported, onImportStart, onProgressUpdate }: FigmaImportDialogProps) {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const handleImport = async () => {
    console.log('🚀 handleImport démarré');
    console.log('📝 URL Figma:', figmaUrl);
    
    if (!figmaUrl.trim()) {
      console.error('❌ URL vide');
      toast.error('Veuillez entrer une URL Figma');
      return;
    }

    // Extraire l'ID du fichier
    console.log('🔍 Extraction de l\'ID du fichier...');
    const fileId = extractFileIdFromUrl(figmaUrl);
    console.log('📋 File ID extrait:', fileId);
    
    if (!fileId) {
      console.error('❌ File ID invalide');
      toast.error('URL Figma invalide. Formats acceptés:\n• https://www.figma.com/file/{fileId}/...\n• https://www.figma.com/design/{fileId}/...');
      return;
    }

    setIsLoading(true);
    setProgress({ phase: 'connecting', current: 0, total: 0, processedSlides: [] });
    console.log('⏳ Loading activé');

    try {
      // Récupérer le token depuis le serveur
      console.log('🔑 Récupération du token Figma...');
      setProgress({ phase: 'connecting', current: 0, total: 0, processedSlides: [] });
      const accessToken = await getFigmaToken();
      console.log('🔑 Token reçu:', accessToken ? 'OUI ✅' : 'NON ❌');
      
      if (!accessToken) {
        console.error('❌ Token manquant');
        toast.error('Token Figma manquant. Veuillez configurer votre token Figma dans les paramètres.');
        setIsLoading(false);
        return;
      }

      // 1. Vérifier que le fichier existe
      console.log('📂 Récupération des infos du fichier...');
      setProgress({ phase: 'loading-file', current: 0, total: 0, processedSlides: [] });
      const fileInfo = await getFigmaFileInfo(fileId, accessToken);
      console.log('📂 File info:', fileInfo);
      
      if (!fileInfo) {
        console.error('❌ Fichier non accessible');
        toast.error('Impossible d\'accéder au fichier Figma. Vérifiez l\'URL et les permissions.');
        setIsLoading(false);
        return;
      }

      console.log('✅ Fichier trouvé:', fileInfo.fileName);

      // 2. Découverte des frames
      setProgress({ phase: 'discovering-frames', current: 0, total: 0, processedSlides: [] });

      // 3. Compter les slides AVANT de fermer la modale
      console.log('🔍 Découverte des frames...');
      // On fait un appel rapide pour compter les slides
      const tempAccessToken = accessToken;
      const tempFileInfo = fileInfo;
      
      // Extraire les frames pour connaitre le total
      let totalFrames = 0;
      if (tempFileInfo.document && tempFileInfo.document.children) {
        const findFramesCount = (node: any): number => {
          let count = 0;
          if (node.type === 'FRAME' || node.type === 'COMPONENT') {
            count++;
          } else if (node.children && Array.isArray(node.children)) {
            node.children.forEach((child: any) => {
              count += findFramesCount(child);
            });
          }
          return count;
        };
        
        tempFileInfo.document.children.forEach((page: any) => {
          if (page.children && Array.isArray(page.children)) {
            page.children.forEach((child: any) => {
              totalFrames += findFramesCount(child);
            });
          }
        });
      }
      
      console.log(`🎯 ${totalFrames} frames détectées`);
      
      if (totalFrames === 0) {
        toast.error('Aucune frame trouvée dans le fichier Figma');
        setIsLoading(false);
        return;
      }

      // ✅ Notifier le parent du nombre de slides et FERMER LA MODALE
      if (onImportStart) {
        onImportStart(totalFrames, fileInfo.fileUrl);
      }
      onOpenChange(false);
      toast.info(`Import de ${totalFrames} slide${totalFrames > 1 ? 's' : ''} en cours...`, { duration: 2000 });

      // 3. Synchroniser les slides avec callback détaillé
      console.log('⬇️ Téléchargement des slides...');
      const slides = await syncSlidesFromFigma(
        fileId,
        accessToken,
        (current, total, slideName, slideData) => {
          console.log(`📊 Progress: ${current}/${total} - ${slideName || 'En cours...'}`);
          setProgress(prev => ({
            phase: 'downloading',
            current,
            total,
            currentSlide: slideName,
            processedSlides: prev ? [
              ...prev.processedSlides,
              { name: slideName || `Slide ${current}`, status: 'done' }
            ] : [{ name: slideName || `Slide ${current}`, status: 'done' }]
          }));
          
          // ✅ Mettre à jour le nom de la slide en cours dans le panneau de progression
          if (onProgressUpdate && slideName) {
            onProgressUpdate(slideName);
          }
          
          // ✅ Appeler le callback avec la slide complète dès qu'elle est téléchargée
          if (onSlideImported && slideData) {
            onSlideImported(slideData, fileInfo.fileUrl);
          }
        }
      );

      console.log('✅ Slides téléchargés:', slides.length);
      
      if (slides.length === 0) {
        console.error('❌ Aucun slide trouvé');
        toast.error('Aucun slide trouvé. Assurez-vous que votre fichier contient des frames.');
        setIsLoading(false);
        return;
      }

      // ✅ Ne pas appeler onImportComplete car les slides ont déjà été ajoutées progressivement
      // 3. Import terminé
      console.log('✅ Import terminé avec succès!');
      toast.success(`${slides.length} slides importés avec succès !`);
      
      // Reset
      setFigmaUrl('');
      setProgress(null);
    } catch (error: any) {
      console.error('❌ Erreur import Figma:', error);
      console.error('❌ Stack trace:', error.stack);
      console.error('❌ Message:', error.message);
      toast.error(error.message || 'Erreur lors de l\'import depuis Figma');
    } finally {
      console.log('🏁 Fin du handleImport');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importer depuis Figma</DialogTitle>
          <DialogDescription>
            Collez le lien de votre fichier Figma contenant vos slides.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="figma-url">URL du fichier Figma</Label>
            <Input
              id="figma-url"
              placeholder="https://www.figma.com/design/ABC123XYZ/Mon-Fichier"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-[var(--muted-foreground)]" style={{ fontSize: 'var(--text-xs)' }}>
              Collez l'URL complète depuis votre navigateur (n'importe quel format accepté)
            </p>
          </div>

          {/* Instructions */}
          <div className="rounded-[var(--radius-md)] bg-[var(--muted)] p-4 space-y-2">
            <p style={{ fontSize: 'var(--text-sm)' }} className="text-[var(--foreground)]">
              📋 <strong>Instructions :</strong>
            </p>
            <ul className="space-y-1 text-[var(--muted-foreground)] list-disc list-inside" style={{ fontSize: 'var(--text-sm)' }}>
              <li>Créez vos slides dans Figma (1 frame = 1 slide)</li>
              <li>Copiez l'URL du fichier depuis votre navigateur</li>
              <li>Collez l'URL ci-dessus et cliquez sur "Importer"</li>
              <li>Les slides seront téléchargés et stockés</li>
            </ul>
          </div>

          {/* Progress */}
          {progress && (
            <div className="space-y-3 p-4 rounded-[var(--radius-md)] bg-[var(--muted)]/30 border border-[var(--border)]">
              {/* Phase status */}
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                <span className="text-[var(--foreground)]" style={{ fontSize: 'var(--text-sm)' }}>
                  {progress.phase === 'connecting' && '🔗 Connexion à Figma...'}
                  {progress.phase === 'loading-file' && '📂 Chargement du fichier...'}
                  {progress.phase === 'discovering-frames' && '🔍 Recherche des slides...'}
                  {progress.phase === 'downloading' && `⬇️ Téléchargement en cours...`}
                </span>
              </div>

              {/* Progress bar */}
              {progress.total > 0 && (
                <>
                  <div className="flex items-center justify-between" style={{ fontSize: 'var(--text-sm)' }}>
                    <span className="text-[var(--muted-foreground)]">
                      {progress.currentSlide || 'Traitement...'}
                    </span>
                    <span className="text-[var(--accent)]">
                      {progress.current}/{progress.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </>
              )}

              {/* Processed slides list */}
              {progress.processedSlides.length > 0 && (
                <div className="mt-3 space-y-1 max-h-[150px] overflow-y-auto">
                  <p className="text-[var(--muted-foreground)]" style={{ fontSize: 'var(--text-xs)' }}>
                    Slides importées :
                  </p>
                  {progress.processedSlides.slice(-5).map((slide, idx) => (
                    <div key={idx} className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)' }}>
                      <CheckCircle2 className="w-3 h-3 text-[var(--success)] flex-shrink-0" />
                      <span className="text-[var(--muted-foreground)] truncate">{slide.name}</span>
                    </div>
                  ))}
                  {progress.processedSlides.length > 5 && (
                    <p className="text-[var(--muted-foreground)]" style={{ fontSize: 'var(--text-xs)' }}>
                      ... et {progress.processedSlides.length - 5} autre(s)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Note about token */}
          <div className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--info)]/5 border border-[var(--info)]/20">
            <ExternalLink className="w-4 h-4 text-[var(--info)] flex-shrink-0 mt-0.5" />
            <p style={{ fontSize: 'var(--text-xs)' }} className="text-[var(--info)]">
              Assurez-vous d'avoir configuré votre token Figma dans les variables d'environnement.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setFigmaUrl('');
              setProgress(null);
            }}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleImport}
            disabled={isLoading || !figmaUrl.trim()}
            className="bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Importer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}