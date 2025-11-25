import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Presentation, Maximize, Minimize, Upload, Trash2, Plus, Play, FileText, Download, MoreHorizontal, RefreshCw, ExternalLink, Edit, AlertCircle, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import * as pdfjsLib from 'pdfjs-dist@4.8.69';
import { saveSlidesToSupabase, getSlidesFromSupabase, deleteAllSlidesFromSupabase, SlideData } from '../utils/supabase/slides';
import { exportSlidesToPDF } from '../utils/slidesExport';
import { FigmaImportDialog } from './FigmaImportDialog';
import { syncSlidesFromFigma, extractFileIdFromUrl, checkFigmaFileUpdates, checkIndividualSlideUpdates, syncSingleSlide } from '../utils/figma/sync';
import { getFigmaToken } from '../utils/figma/token';
import { checkServerHealth } from '../utils/supabase/health';
import { toast } from 'sonner@2.0.3';

// Configuration de PDF.js avec une version stable depuis unpkg
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs';

// Logo Figma SVG
const FigmaLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
  </svg>
);

interface PresentationViewProps {
  protocol?: any;
  sessions?: any[];
  isReadOnly?: boolean;
  onImportProgressChange?: (data: {
    total: number;
    current: number;
    currentSlideName?: string;
    importedSlides: Array<{ name: string; status: 'done' | 'loading' }>;
  }) => void;
  onShowImportProgressChange?: (show: boolean) => void;
}

export default function PresentationView({ 
  protocol, 
  sessions, 
  isReadOnly = false,
  onImportProgressChange,
  onShowImportProgressChange 
}: PresentationViewProps) {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFigmaImport, setShowFigmaImport] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [modifiedSlideIds, setModifiedSlideIds] = useState<Set<string>>(new Set());
  const [syncingSlideIds, setSyncingSlideIds] = useState<Set<string>>(new Set());
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const checkUpdatesIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [importingSlidesCount, setImportingSlidesCount] = useState(0);
  const [totalSlidesToImport, setTotalSlidesToImport] = useState(0);
  
  // ✅ État local pour construire les données de progression avant de les envoyer au parent
  const [localProgressData, setLocalProgressData] = useState<{
    total: number;
    current: number;
    currentSlideName?: string;
    importedSlides: Array<{ name: string; status: 'done' | 'loading' }>;
  }>({
    total: 0,
    current: 0,
    importedSlides: [],
  });
  
  // ✅ Synchroniser l'état local avec le callback parent
  useEffect(() => {
    if (onImportProgressChange) {
      onImportProgressChange(localProgressData);
    }
  }, [localProgressData, onImportProgressChange]);
  
  // ✅ REF pour garder les slides à jour dans les closures
  const slidesRef = useRef<SlideData[]>([]);
  
  // ✅ Synchroniser le ref avec le state
  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  // Charger les slides depuis Supabase
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        console.log('🔄 Chargement des slides depuis Supabase...');
        const fetchedSlides = await getSlidesFromSupabase();
        console.log('✅ Slides récupérées:', fetchedSlides?.length || 0);
        if (fetchedSlides && fetchedSlides.length > 0) {
          setSlides(fetchedSlides);
        }
      } catch (error: any) {
        // Ne pas afficher d'erreur pour les cas normaux (timeout, réseau)
        if (!error.message?.includes('Timeout') && !error.message?.includes('Failed to fetch')) {
          console.error('❌ Erreur de chargement des slides:', error);
          toast.error('Erreur de connexion au serveur', {
            description: error.message
          });
        } else {
          console.log('⚠️ Serveur non accessible, on continue sans slides');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, []);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionsMenu]);

  // Gérer l'export PDF
  const handleExportPDF = async () => {
    setShowActionsMenu(false);
    setIsExporting(true);
    try {
      toast.info('Export PDF en cours...');
      await exportSlidesToPDF(slides);
      toast.success('Slides exportées en PDF avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Sauvegarder les slides dans Supabase
  const saveSlides = async (newSlides: SlideData[]) => {
    try {
      setSlides(newSlides);
      await saveSlidesToSupabase(newSlides);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des slides:', error);
    }
  };

  // Convertir un PDF en images
  const convertPdfToImages = async (file: File): Promise<SlideData[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const slidePromises: Promise<SlideData>[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        slidePromises.push(
          (async () => {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 }); // Résolution optimisée pour éviter les erreurs de stockage
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Canvas context not available');
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;
            
            // Utiliser JPEG avec compression pour réduire la taille
            const imageUrl = canvas.toDataURL('image/jpeg', 0.85);
            
            return {
              id: `slide-${Date.now()}-${pageNum}-${Math.random()}`,
              url: imageUrl,
              name: `${file.name} - Page ${pageNum}`,
            };
          })()
        );
      }

      return await Promise.all(slidePromises);
    } catch (error) {
      console.error('Erreur lors de la conversion du PDF:', error);
      alert('Erreur lors de l\'import du PDF. Assurez-vous que le fichier est valide.');
      return [];
    }
  };

  // Upload de slides
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const newSlides: SlideData[] = [];

    try {
      for (const file of Array.from(files)) {
        if (file.type === 'application/pdf') {
          // Traiter les fichiers PDF
          const pdfSlides = await convertPdfToImages(file);
          newSlides.push(...pdfSlides);
        } else if (file.type.startsWith('image/')) {
          // Traiter les images
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onload = (event) => {
              const newSlide: SlideData = {
                id: `slide-${Date.now()}-${Math.random()}`,
                url: event.target?.result as string,
                name: file.name,
              };
              newSlides.push(newSlide);
              resolve();
            };
            reader.readAsDataURL(file);
          });
        }
      }

      if (newSlides.length > 0) {
        saveSlides([...slides, ...newSlides]);
      }
    } finally {
      setIsUploading(false);
      // Reset input pour permettre de re-upload le même fichier
      e.target.value = '';
    }
  };

  // Supprimer une slide
  const deleteSlide = (id: string) => {
    const newSlides = slides.filter(s => s.id !== id);
    saveSlides(newSlides);
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(Math.max(0, newSlides.length - 1));
    }
  };

  // Supprimer toutes les slides
  const handleDeleteAllSlides = async () => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer toutes les slides (${slides.length} slide${slides.length > 1 ? 's' : ''}) ?\n\nCette action est irréversible.`
    );
    
    if (!confirmed) return;
    
    try {
      await deleteAllSlidesFromSupabase();
      setSlides([]);
      setCurrentSlide(0);
      alert('Toutes les slides ont été supprimées avec succès.');
    } catch (error) {
      console.error('Erreur lors de la suppression des slides:', error);
      alert('Erreur lors de la suppression des slides. Veuillez réessayer.');
    }
  };

  // Navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  // Démarrer la présentation
  const startPresentation = () => {
    setIsPresenting(true);
    setCurrentSlide(0);
  };

  // Import depuis Figma - Callback après import
  const handleFigmaImportComplete = async (
    importedSlides: Array<{ id: string; name: string; imageBase64: string; lastModified: string; contentHash: string }>,
    fileUrl: string
  ) => {
    try {
      console.log('📥 handleFigmaImportComplete - Début de la sauvegarde...');
      console.log('📊 Nombre de slides importées:', importedSlides.length);
      
      // Extraire le fileId depuis l'URL
      const fileId = extractFileIdFromUrl(fileUrl);
      console.log('🔗 File ID extrait:', fileId);
      console.log('🔗 File URL:', fileUrl);
      
      // Convertir les slides importés en SlideData avec les métadonnées Figma
      const newSlides: SlideData[] = importedSlides.map((slide) => ({
        id: `figma-${slide.id}-${Date.now()}`,
        url: slide.imageBase64, // C'est une data URL (data:image/png;base64,...)
        name: slide.name,
        figmaFileId: fileId || undefined,
        figmaFrameId: slide.id,
        figmaFileUrl: fileUrl,
        lastSyncDate: slide.lastModified, // ✅ Utiliser le lastModified de Figma
        contentHash: slide.contentHash, // ✅ Sauvegarder le hash du contenu
      }));

      console.log('🔄 Slides converties:', newSlides.length);
      console.log('📋 Exemple de slide:', {
        id: newSlides[0]?.id,
        name: newSlides[0]?.name,
        urlLength: newSlides[0]?.url?.length,
        figmaFileId: newSlides[0]?.figmaFileId,
        figmaFrameId: newSlides[0]?.figmaFrameId,
        contentHash: newSlides[0]?.contentHash
      });

      // Sauvegarder les slides (en ajoutant aux slides existantes)
      const allSlides = [...slides, ...newSlides];
      console.log('💾 Total de slides à sauvegarder:', allSlides.length);
      
      await saveSlides(allSlides);
      
      console.log('✅ Slides sauvegardées avec succès !');
      toast.success(`${newSlides.length} slides importées depuis Figma !`);
      
      // Fermer le dialogue d'import
      setShowFigmaImport(false);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des slides Figma:', error);
      toast.error('Erreur lors de la sauvegarde des slides');
    }
  };

  // ✅ Callback pour ajouter une slide progressivement pendant l'import
  const handleSlideImported = async (
    slide: { id: string; name: string; imageBase64: string; lastModified: string; contentHash: string },
    fileUrl: string
  ) => {
    try {
      const fileId = extractFileIdFromUrl(fileUrl);
      
      const newSlide: SlideData = {
        id: `figma-${slide.id}-${Date.now()}`,
        url: slide.imageBase64,
        name: slide.name,
        figmaFileId: fileId || undefined,
        figmaFrameId: slide.id,
        figmaFileUrl: fileUrl,
        lastSyncDate: slide.lastModified,
        contentHash: slide.contentHash,
      };

      // Ajouter immédiatement la slide à l'état local pour un affichage progressif
      setSlides(prevSlides => {
        const updatedSlides = [...prevSlides, newSlide];
        // Sauvegarder en base immédiatement (en arrière-plan)
        saveSlidesToSupabase(updatedSlides).catch(error => {
          console.error('❌ Erreur lors de la sauvegarde progressive:', error);
        });
        return updatedSlides;
      });
      
      // ✅ Mettre à jour le panneau de progression
      setLocalProgressData(prev => {
        const newCurrent = prev.current + 1;
        const newData = {
          ...prev,
          current: newCurrent,
          importedSlides: [...prev.importedSlides, { name: slide.name, status: 'done' as const }],
        };
        
        // ✅ Si c'est la dernière slide, fermer le panneau après 3 secondes
        if (newCurrent >= prev.total && onShowImportProgressChange) {
          setTimeout(() => {
            onShowImportProgressChange(false);
          }, 3000);
        }
        
        return newData;
      });
      
      // ✅ Décrémenter le compteur de slides en cours d'import
      setImportingSlidesCount(prev => Math.max(0, prev - 1));
      
      console.log(`✅ Slide "${slide.name}" ajoutée progressivement`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout progressif de la slide:', error);
    }
  };

  // ✅ Callback au démarrage de l'import pour afficher les skeletons
  const handleImportStart = (totalSlides: number, fileUrl: string) => {
    console.log(`🎬 Import démarré: ${totalSlides} slides à importer`);
    setTotalSlidesToImport(totalSlides);
    setImportingSlidesCount(totalSlides);
    
    // ✅ Afficher le panneau de progression et initialiser les données
    if (onShowImportProgressChange) {
      onShowImportProgressChange(true);
    }
    setLocalProgressData({
      total: totalSlides,
      current: 0,
      importedSlides: [],
    });
  };

  // ✅ Callback pour mettre à jour la progression (nom de la slide en cours)
  const handleProgressUpdate = (currentSlideName: string) => {
    setLocalProgressData(prev => ({
      ...prev,
      currentSlideName,
    }));
  };

  // Synchroniser les slides depuis Figma
  const handleSyncFromFigma = async () => {
    setShowActionsMenu(false);
    
    // Vérifier s'il y a des slides provenant de Figma
    const figmaSlides = slides.filter(s => s.figmaFileId && s.figmaFrameId);
    
    if (figmaSlides.length === 0) {
      toast.error('Aucune slide Figma à synchroniser. Importez d\'abord des slides depuis Figma.');
      return;
    }

    // Récupérer le fileId (toutes les slides d'un même import ont le même fileId)
    const fileId = figmaSlides[0].figmaFileId;
    const fileUrl = figmaSlides[0].figmaFileUrl;
    
    if (!fileId) {
      toast.error('Impossible de trouver l\'ID du fichier Figma');
      return;
    }

    setIsSyncing(true);
    try {
      const accessToken = await getFigmaToken();
      if (!accessToken) {
        console.error('❌ Token Figma non disponible');
        toast.error('Impossible de récupérer le token Figma', {
          description: 'Vérifiez que le serveur backend est démarré et que FIGMA_ACCESS_TOKEN est configuré.'
        });
        return;
      }

      toast.info('Synchronisation avec Figma en cours...');
      
      // Synchroniser les slides
      const syncedSlides = await syncSlidesFromFigma(fileId, accessToken);
      
      // ✅ Utiliser le même lastModified du fichier pour TOUTES les slides
      const fileLastModified = syncedSlides[0]?.lastModified || new Date().toISOString();
      
      // Mettre à jour uniquement les slides Figma existantes
      const updatedSlides = slides.map(slide => {
        if (slide.figmaFrameId) {
          const syncedSlide = syncedSlides.find(s => s.id === slide.figmaFrameId);
          if (syncedSlide) {
            return {
              ...slide,
              url: syncedSlide.imageBase64,
              name: syncedSlide.name,
              lastSyncDate: fileLastModified, // ✅ Même date pour toutes les slides
              contentHash: syncedSlide.contentHash, // ✅ Hash unique par slide
            };
          }
        }
        return slide;
      });

      await saveSlides(updatedSlides);
      
      console.log('✅ Synchronisation complète terminée en DB');
      console.log('🔄 Rechargement depuis Supabase pour synchroniser le state local...');
      
      // ✅ CRUCIAL : Recharger depuis la DB pour garantir que le state local est à jour
      const freshSlides = await getSlidesFromSupabase();
      console.log('📊 Slides rechargées depuis DB:', freshSlides.length);
      setSlides(freshSlides);
      
      setHasUpdates(false); // Réinitialiser le badge après synchronisation réussie
      setModifiedSlideIds(new Set()); // Réinitialiser les slides modifiées
      
      console.log('✅ State local synchronisé avec la DB');
      console.log('⏸️ Pause du polling pendant 5 secondes...');
      
      // ✅ CRUCIAL : Désactiver le polling pendant 5 secondes après la synchro
      // pour éviter une race condition
      if (checkUpdatesIntervalRef.current) {
        clearInterval(checkUpdatesIntervalRef.current);
      }
      
      // Redémarrer le polling après 5 secondes
      setTimeout(() => {
        console.log('▶️ Redémarrage du polling...');
        // ✅ Vérifier avec slidesRef au moment du restart, pas la closure
        if (slidesRef.current.some(s => s.figmaFileId)) {
          const interval = setInterval(() => {
            console.log('🔄 Vérification automatique des mises à jour Figma...');
            checkForUpdates(true); // Mode silencieux (pas de toast)
          }, 30000); // 30 secondes
          checkUpdatesIntervalRef.current = interval;
        }
      }, 5000);
      
      toast.success('Slides synchronisées avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error(error.message || 'Erreur lors de la synchronisation avec Figma');
    } finally {
      setIsSyncing(false);
    }
  };

  // Synchroniser une seule slide depuis Figma
  const handleSyncSingleSlide = async (slideId: string) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide || !slide.figmaFileId || !slide.figmaFrameId) {
      toast.error('Cette slide n\'est pas liée à Figma');
      return;
    }

    // Ajouter l'ID aux slides en cours de synchronisation
    setSyncingSlideIds(prev => new Set([...prev, slide.figmaFrameId!]));

    try {
      const accessToken = await getFigmaToken();
      if (!accessToken) {
        toast.error('Token Figma manquant');
        return;
      }

      console.log('\n🔄 === SYNCHRONISATION INDIVIDUELLE ===');
      console.log('📄 Slide à synchroniser:', slide.name);
      console.log('🆔 Frame ID:', slide.figmaFrameId);
      console.log('🔐 Hash AVANT sync:', slide.contentHash);

      toast.info(`Synchronisation de la slide ${slides.findIndex(s => s.id === slideId) + 1}...`);

      // Synchroniser uniquement cette slide
      const syncedSlide = await syncSingleSlide(
        slide.figmaFileId,
        slide.figmaFrameId,
        accessToken
      );

      if (!syncedSlide) {
        throw new Error('Impossible de synchroniser la slide');
      }

      console.log('🔐 Hash APRÈS sync (reçu de Figma):', syncedSlide.contentHash);
      console.log('📅 lastModified du fichier:', syncedSlide.lastModified);
      console.log('🔍 Comparaison hash:', {
        ancien: slide.contentHash,
        nouveau: syncedSlide.contentHash,
        identique: slide.contentHash === syncedSlide.contentHash ? '✅ OUI' : '❌ NON'
      });

      // ✅ Utiliser le lastModified du fichier (pas celui de la slide individuelle)
      // Toutes les slides du même fichier doivent avoir le même lastModified
      const fileLastModified = syncedSlide.lastModified;

      // Mettre à jour cette slide dans le state local
      const updatedSlides = slides.map(s => {
        if (s.id === slideId) {
          console.log('✅ Mise à jour de la slide dans le state local');
          console.log('   Ancien hash:', s.contentHash);
          console.log('   Nouveau hash:', syncedSlide.contentHash);
          // C'est la slide qu'on synchronise : on met à jour tout
          return {
            ...s,
            url: syncedSlide.imageBase64,
            name: syncedSlide.name,
            lastSyncDate: fileLastModified,
            contentHash: syncedSlide.contentHash,
          };
        }
        return s;
      });

      console.log('💾 Sauvegarde en base de données...');
      
      // ✅ IMPORTANT : Sauvegarder d'abord
      await saveSlidesToSupabase(updatedSlides);
      
      console.log('✅ Sauvegarde terminée en DB');
      console.log('🔄 Rechargement depuis Supabase pour synchroniser le state local...');
      
      // ✅ CRUCIAL : Recharger depuis la DB pour avoir le state exact
      // Cela évite les problèmes de closure avec le polling
      const freshSlides = await getSlidesFromSupabase();
      console.log('📊 Slides rechargées depuis DB:', freshSlides.length);
      
      // Vérifier que le nouveau hash est bien là
      const reloadedSlide = freshSlides.find(s => s.id === slideId);
      console.log('🔍 Vérification du hash après rechargement:');
      console.log('   Hash dans DB:', reloadedSlide?.contentHash);
      console.log('   Hash attendu:', syncedSlide.contentHash);
      console.log('   Match:', reloadedSlide?.contentHash === syncedSlide.contentHash ? '✅ OUI' : '❌ NON');
      
      // Mettre à jour le state avec les données fraîches de la DB
      setSlides(freshSlides);
      
      console.log('✅ State local synchronisé avec la DB');
      
      // ✅ IMPORTANT : Retirer immédiatement cette slide des modifiedSlideIds
      setModifiedSlideIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(slide.figmaFrameId!);
        console.log('🗑️ Retrait de', slide.figmaFrameId, 'des slides modifiées');
        console.log('   Taille du Set avant:', prev.size);
        console.log('   Taille du Set après:', newSet.size);
        
        // Revérifier s'il y a encore des mises à jour globales
        if (newSet.size === 0) {
          console.log('✅ Plus aucune slide modifiée, désactivation du badge');
          setHasUpdates(false);
        }
        
        return newSet;
      });
      
      // ✅ CRUCIAL : Désactiver le polling pendant 5 secondes après la synchro
      // pour éviter une race condition
      console.log('⏸️ Pause du polling pendant 5 secondes...');
      if (checkUpdatesIntervalRef.current) {
        clearInterval(checkUpdatesIntervalRef.current);
      }
      
      // Redémarrer le polling après 5 secondes
      setTimeout(() => {
        console.log('▶️ Redémarrage du polling...');
        // ✅ Vérifier avec slidesRef au moment du restart, pas la closure
        if (slidesRef.current.some(s => s.figmaFileId)) {
          const interval = setInterval(() => {
            console.log('🔄 Vérification automatique des mises à jour Figma...');
            checkForUpdates(true); // Mode silencieux (pas de toast)
          }, 30000); // 30 secondes
          checkUpdatesIntervalRef.current = interval;
        }
      }, 5000);

      toast.success('Slide synchronisée !');
    } catch (error: any) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      toast.error(error.message || 'Erreur lors de la synchronisation');
    } finally {
      // Retirer l'ID des slides en cours de synchronisation
      setSyncingSlideIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(slide.figmaFrameId!);
        return newSet;
      });
    }
  };

  // Ouvrir le fichier Figma dans un nouvel onglet
  const handleEditInFigma = () => {
    setShowActionsMenu(false);
    
    const figmaSlide = slides.find(s => s.figmaFileUrl);
    if (figmaSlide && figmaSlide.figmaFileUrl) {
      window.open(figmaSlide.figmaFileUrl, '_blank');
    } else {
      toast.error('Aucun fichier Figma lié à ces slides');
    }
  };

  // Vérifier si des slides proviennent de Figma
  const hasFigmaSlides = slides.some(s => s.figmaFileId);
  const figmaFileUrl = slides.find(s => s.figmaFileUrl)?.figmaFileUrl;
  const lastSync = slides.find(s => s.lastSyncDate)?.lastSyncDate;
  
  // ✅ Vérifier combien de slides Figma ont un hash
  const figmaSlidesCount = slides.filter(s => s.figmaFileId).length;
  const figmaSlidesWithHash = slides.filter(s => s.figmaFileId && s.contentHash).length;
  const needsInitialSync = hasFigmaSlides && figmaSlidesWithHash < figmaSlidesCount;

  // Fonction de vérification des mises à jour (réutilisable)
  const checkForUpdates = async (silent: boolean = false) => {
    // ✅ CRUCIAL : Utiliser slidesRef.current au lieu de slides pour éviter les closures obsolètes
    const currentSlides = slidesRef.current;
    
    // ✅ On vérifie seulement s'il y a des slides Figma, pas le lastSync
    const hasFigma = currentSlides.some(s => s.figmaFileId);
    if (!hasFigma) return;
    
    const figmaSlide = currentSlides.find(s => s.figmaFileId);
    if (!figmaSlide || !figmaSlide.figmaFileId) return;
    
    // ✅ Vérifier s'il y a au moins une slide avec un contentHash
    const slidesWithHash = currentSlides.filter(s => s.figmaFrameId && s.contentHash);
    if (slidesWithHash.length === 0) {
      console.log('⚠️ Aucune slide avec hash trouvée, impossible de détecter les modifications');
      return;
    }
    
    setIsCheckingUpdates(true);
    let modifiedIds = new Set<string>();
    
    try {
      const accessToken = await getFigmaToken();
      if (!accessToken) {
        console.log('Token Figma manquant, impossible de vérifier les mises à jour');
        return;
      }
      
      // Vérifier les slides individuelles (la vraie source de vérité)
      const figmaSlides = currentSlides.filter(s => s.figmaFrameId);
      
      console.log('\n🔍 === ANALYSE DES SLIDES FIGMA ===');
      console.log('📊 Total slides:', currentSlides.length);
      console.log('📊 Slides avec figmaFrameId:', figmaSlides.length);
      console.log('📊 Slides avec hash:', slidesWithHash.length);
      
      // Log détaillé de chaque slide
      figmaSlides.forEach(s => {
        console.log(`\n📄 Slide: "${s.name}"`);
        console.log(`   frameId: ${s.figmaFrameId || 'MANQUANT'}`);
        console.log(`   contentHash: ${s.contentHash || 'MANQUANT'}`);
        console.log(`   lastSyncDate: ${s.lastSyncDate || 'MANQUANT'}`);
      });
      
      if (figmaSlides.length > 0) {
        console.log('\n🔍 Vérification de', figmaSlides.length, 'slides avec Figma frameIds');
        
        modifiedIds = await checkIndividualSlideUpdates(
          figmaSlide.figmaFileId,
          accessToken,
          figmaSlides
        );
        
        setModifiedSlideIds(modifiedIds);
        
        // ✅ hasUpdates est basé UNIQUEMENT sur les slides modifiées détectées
        const hasAnyUpdates = modifiedIds.size > 0;
        setHasUpdates(hasAnyUpdates);
        
        if (modifiedIds.size > 0) {
          console.log(`✨ ${modifiedIds.size} slide(s) modifiée(s):`, Array.from(modifiedIds));
          // Log détaillé des slides modifiées
          modifiedIds.forEach(frameId => {
            const slide = currentSlides.find(s => s.figmaFrameId === frameId);
            if (slide) {
              console.log(`  - Slide "${slide.name}" (frameId: ${frameId})`);
            }
          });
        } else {
          console.log('✅ Aucune slide modifiée détectée');
        }
      } else {
        // Si aucune slide n'a de hash, on ne peut pas détecter de modifications
        setHasUpdates(false);
        setModifiedSlideIds(new Set());
      }
      
      setLastCheckTime(new Date());
      
      if (modifiedIds.size > 0 && !silent) {
        toast.info('🔄 Nouvelles modifications détectées dans Figma', {
          description: `${modifiedIds.size} slide(s) ont été modifiée(s)`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des mises à jour:', error);
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  // Vérifier les mises à jour Figma au chargement des slides
  useEffect(() => {
    checkForUpdates();
  }, [hasFigmaSlides, slides.length]);

  // Polling automatique toutes les 30 secondes pour vérifier les mises à jour
  useEffect(() => {
    if (!hasFigmaSlides) return;

    const checkUpdatesInterval = setInterval(() => {
      console.log('🔄 Vérification automatique des mises à jour Figma...');
      checkForUpdates(true); // Mode silencieux (pas de toast)
    }, 30000); // 30 secondes

    checkUpdatesIntervalRef.current = checkUpdatesInterval;

    return () => {
      if (checkUpdatesIntervalRef.current) {
        clearInterval(checkUpdatesIntervalRef.current);
      }
    };
  }, [hasFigmaSlides, slides.length]);

  // Gérer l'auto-masquage des contrôles en mode présentation
  useEffect(() => {
    if (isPresenting) {
      setShowControls(true);
      
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      const handleMouseMove = () => {
        setShowControls(true);
        
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current);
        }
        
        hideControlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      };

      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current);
        }
      };
    } else {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    }
  }, [isPresenting]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresenting) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsPresenting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, currentSlide, slides.length]);

  // Mode présentation fullscreen
  const presentationContent = (
    <div className="fixed inset-0 z-[9999] w-screen h-screen bg-[#16161d] overflow-hidden">
      {/* Slide actuelle */}
      <div className="w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full flex items-center justify-center p-12"
          >
            <img
              src={slides[currentSlide]?.url}
              alt={slides[currentSlide]?.name}
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Contrôles de navigation */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/95 backdrop-blur-lg rounded-full px-6 py-3 shadow-xl border border-[var(--border)]/20"
        style={{ pointerEvents: showControls ? 'auto' : 'none' }}
      >
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--accent)' }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <span className="text-[var(--muted-foreground)] font-medium px-2" style={{ fontSize: 'var(--text-sm)' }}>
          {currentSlide + 1} / {slides.length}
        </span>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--accent)' }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Bouton quitter */}
      <motion.button
        initial={{ opacity: 1 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsPresenting(false)}
        className="absolute top-8 right-8 bg-white/95 backdrop-blur-lg rounded-full p-3 shadow-lg border border-[var(--border)]/20 hover:bg-[var(--muted)] transition-colors"
        style={{ pointerEvents: showControls ? 'auto' : 'none', color: 'var(--accent)' }}
        title="Quitter (ESC)"
      >
        <Minimize className="w-6 h-6" />
      </motion.button>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[var(--foreground)]">Gestion des slides</h2>
            <p className="text-[var(--muted-foreground)]" style={{ fontSize: 'var(--text-sm)' }}>
              Uploadez vos slides pour créer une présentation
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {slides.length > 0 && (
              <button
                onClick={startPresentation}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-white hover:opacity-90 transition-all shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span style={{ fontSize: 'var(--text-sm)' }}>Présenter</span>
              </button>
            )}

            {slides.length > 0 && (
              <div className="relative" ref={actionsMenuRef}>
                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  disabled={isExporting}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-white hover:bg-[var(--muted)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Plus d'actions"
                >
                  <MoreHorizontal className="w-4 h-4 text-[var(--accent)]" />
                </button>

                {showActionsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[var(--radius-md)] shadow-lg border border-[var(--border)] overflow-hidden z-50"
                  >
                    <button
                      onClick={handleExportPDF}
                      disabled={isExporting}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="w-4 h-4 text-[var(--accent)]" />
                      <div className="text-left flex-1">
                        <p className="text-[var(--foreground)]" style={{ fontSize: 'var(--text-sm)' }}>Exporter en PDF</p>
                        <p className="text-[var(--muted-foreground)]" style={{ fontSize: 'var(--text-xs)' }}>
                          Document portable
                        </p>
                      </div>
                    </button>
                    {!isReadOnly && (
                      <>
                        <div className="h-px bg-[var(--border)]" />
                        <button
                          onClick={() => {
                            setShowActionsMenu(false);
                            handleDeleteAllSlides();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <div className="text-left flex-1">
                            <p className="text-red-600" style={{ fontSize: 'var(--text-sm)' }}>Tout supprimer</p>
                            <p className="text-[var(--muted-foreground)]" style={{ fontSize: 'var(--text-xs)' }}>
                              Supprimer toutes les slides
                            </p>
                          </div>
                        </button>
                      </>
                    )}
                    {hasFigmaSlides && (
                      <>
                        <div className="h-px bg-[var(--border)]" />
                        <button
                          onClick={handleEditInFigma}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-[var(--accent)]" />
                          <div className="text-left flex-1">
                            <p className="text-[var(--foreground)]" style={{ fontSize: 'var(--text-sm)' }}>Modifier dans Figma</p>
                            <p className="text-[var(--muted-foreground)]" style={{ fontSize: 'var(--text-xs)' }}>
                              Ouvrir le fichier Figma
                            </p>
                          </div>
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bannière d'information Figma */}
        {hasFigmaSlides && (
          <>
            {/* ⚠️ Bannière d'avertissement pour slides sans hash */}
            {needsInitialSync && (
              <div className="p-4 rounded-[var(--radius-lg)] border bg-amber-50 border-amber-300 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center bg-amber-100">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[var(--foreground)] mb-1" style={{ fontSize: 'var(--text-sm)' }}>
                      ⚠️ Synchronisation initiale requise
                    </h3>
                    <p className="text-amber-700 mb-2" style={{ fontSize: 'var(--text-xs)' }}>
                      {figmaSlidesCount - figmaSlidesWithHash} slide{figmaSlidesCount - figmaSlidesWithHash > 1 ? 's' : ''} sur {figmaSlidesCount} n'ont pas encore de hash de contenu. 
                      <strong className="block mt-1">Sans hash, je ne peux pas détecter les modifications slide par slide.</strong>
                    </p>
                    <p className="text-amber-700" style={{ fontSize: 'var(--text-xs)' }}>
                      Cliquez sur "Synchroniser" ci-dessous pour générer les hash de toutes les slides et activer la détection de modifications automatique.
                    </p>
                  </div>
                  <button
                    onClick={handleSyncFromFigma}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-amber-600"
                    title="Synchroniser toutes les slides pour générer les hash"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span style={{ fontSize: 'var(--text-xs)' }}>
                      {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
                    </span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Bannière normale (si toutes les slides ont un hash) */}
            {!needsInitialSync && (
              <div className={`p-4 rounded-[var(--radius-lg)] border ${hasUpdates ? 'bg-orange-50 border-orange-300' : 'bg-[var(--accent)]/5 border-[var(--accent)]/20'}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center ${hasUpdates ? 'bg-orange-100' : 'bg-white'}`}>
                    {hasUpdates ? (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    ) : (
                      <FigmaLogo className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[var(--foreground)]" style={{ fontSize: 'var(--text-sm)' }}>
                        {hasUpdates ? '🔄 Mises à jour disponibles dans Figma !' : 'Slides synchronisées avec Figma'}
                      </h3>
                      {hasUpdates && modifiedSlideIds.size > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 border border-orange-300" style={{ fontSize: 'var(--text-xs)' }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                          <span className="text-orange-700">{modifiedSlideIds.size} slide{modifiedSlideIds.size > 1 ? 's' : ''}</span>
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className={hasUpdates ? 'text-orange-700' : 'text-[var(--muted-foreground)]'} style={{ fontSize: 'var(--text-xs)' }}>
                        {lastSync ? (
                          <>
                            {hasUpdates ? 'Votre fichier Figma a été modifié depuis la' : 'Dernière synchronisation :'} <span className="text-[var(--foreground)]">{new Date(lastSync).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </>
                        ) : (
                          'Importées depuis Figma'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasUpdates ? (
                      <button
                        onClick={handleSyncFromFigma}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-orange-600"
                        title="Synchroniser toutes les slides avec Figma"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span style={{ fontSize: 'var(--text-xs)' }}>
                          {isSyncing ? 'Synchronisation...' : 'Tout mettre à jour'}
                        </span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => checkForUpdates(false)}
                          disabled={isCheckingUpdates}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--accent)] bg-white hover:bg-[var(--accent)]/5 text-[var(--accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Vérifier les mises à jour manuellement"
                        >
                          <RefreshCw className={`w-4 h-4 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                          <span style={{ fontSize: 'var(--text-xs)' }}>
                            {isCheckingUpdates ? 'Vérification...' : 'Vérifier'}
                          </span>
                        </button>
                        <button
                          onClick={handleEditInFigma}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-white hover:opacity-90 transition-all bg-[var(--accent)]"
                          title="Ouvrir le fichier dans Figma"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span style={{ fontSize: 'var(--text-xs)' }}>
                            Modifier dans Figma
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Liste des slides */}
        {isLoading ? (
          <div className="border-2 border-dashed border-[var(--border)] rounded-[var(--radius-lg)] p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <Presentation className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-[var(--foreground)] mb-2">Chargement des slides...</h3>
            <p className="text-[var(--muted-foreground)] mb-3" style={{ fontSize: 'var(--text-sm)' }}>
              Veuillez patienter
            </p>
          </div>
        ) : slides.length === 0 ? (
          <div className="border-2 border-dashed border-[var(--border)] rounded-[var(--radius-lg)] p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <Presentation className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-[var(--foreground)] mb-2">Aucune slide</h3>
            <p className="text-[var(--muted-foreground)] mb-4" style={{ fontSize: 'var(--text-sm)' }}>
              Importez des images (PNG, JPG) ou un PDF complet
            </p>
            
            {!isReadOnly && (
              <div className="flex items-center justify-center gap-3 mb-4">
                <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white hover:bg-[var(--muted)] transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <Upload className={`w-4 h-4 text-[var(--accent)] ${isUploading ? 'animate-pulse' : ''}`} />
                  <span style={{ fontSize: 'var(--text-sm)' }}>
                    {isUploading ? 'Import en cours...' : 'Ajouter des slides'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>

                <button
                  onClick={() => setShowFigmaImport(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--accent)] bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10 text-[var(--accent)] transition-all"
                >
                  <FigmaLogo className="w-4 h-4" />
                  <span style={{ fontSize: 'var(--text-sm)' }}>Importer depuis Figma</span>
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-2 text-[var(--muted-foreground)]" style={{ fontSize: 'var(--text-xs)' }}>
              <FileText className="w-4 h-4" />
              <span>Les PDFs sont automatiquement convertis en slides individuelles</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {slides.map((slide, index) => {
              const isModified = slide.figmaFrameId && modifiedSlideIds.has(slide.figmaFrameId);
              const isSyncing = slide.figmaFrameId && syncingSlideIds.has(slide.figmaFrameId);
              
              return (
                <div
                  key={slide.id}
                  className={`relative group border-2 rounded-[var(--radius-lg)] overflow-hidden cursor-pointer transition-all ${
                    currentSlide === index
                      ? 'border-[var(--accent)] shadow-lg'
                      : isModified
                      ? 'border-orange-400 hover:border-orange-500'
                      : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  onDoubleClick={() => {
                    setCurrentSlide(index);
                    setIsPresenting(true);
                  }}
                  title="Double-cliquez pour lancer la présentation"
                >
                  {/* Pastille orange pour les slides modifiées */}
                  {isModified && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500 shadow-md animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span className="text-white" style={{ fontSize: '10px' }}>Modifié</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="aspect-video bg-[var(--muted)] flex items-center justify-center overflow-hidden">
                    <img
                      src={slide.url}
                      alt={slide.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-2 bg-white border-t border-[var(--border)]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[var(--foreground)] truncate flex-1" style={{ fontSize: 'var(--text-xs)' }}>
                        Slide {index + 1}
                      </p>
                      
                      {/* Indicateur de statut Figma */}
                      {slide.figmaFrameId && (
                        <div className="flex-shrink-0">
                          {!slide.contentHash ? (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-100 border border-gray-300" title="Pas encore synchronisée (hash manquant)">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              <span className="text-gray-600" style={{ fontSize: '9px' }}>No Hash</span>
                            </div>
                          ) : isModified ? (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-100 border border-orange-400" title="Modifiée dans Figma">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-orange-700" style={{ fontSize: '9px' }}>Modifié</span>
                              </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 border border-green-300" title="À jour avec Figma">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="text-green-700" style={{ fontSize: '9px' }}>À jour</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isReadOnly && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {/* Bouton de synchronisation pour les slides modifiées */}
                      {isModified && slide.figmaFrameId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSyncSingleSlide(slide.id);
                          }}
                          disabled={isSyncing}
                          className="p-1.5 bg-orange-500 rounded-[var(--radius-sm)] shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Synchroniser cette slide"
                        >
                          <RefreshCw className={`w-4 h-4 text-white ${isSyncing ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                      
                      {/* Bouton de suppression */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSlide(slide.id);
                        }}
                        className="p-1.5 bg-white/95 rounded-[var(--radius-sm)] shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* ✅ Skeletons pour les slides en cours d'import */}
            {importingSlidesCount > 0 && Array.from({ length: importingSlidesCount }).map((_, skeletonIndex) => (
              <motion.div
                key={`skeleton-${skeletonIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: skeletonIndex * 0.05 }}
                className="relative border-2 border-dashed border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden"
              >
                <div className="aspect-video bg-[var(--muted)] flex items-center justify-center overflow-hidden animate-pulse">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
                    <p className="text-[var(--muted-foreground)]" style={{ fontSize: 'var(--text-xs)' }}>
                      Import en cours...
                    </p>
                  </div>
                </div>
                
                <div className="p-2 bg-white border-t border-[var(--border)]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-3 bg-[var(--muted)] rounded-full w-20 animate-pulse" />
                    <div className="h-3 bg-[var(--muted)] rounded-full w-12 animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Mode présentation (fullscreen) */}
      {isPresenting && slides.length > 0 && createPortal(presentationContent, document.body)}

      {/* Dialog d'import depuis Figma */}
      <FigmaImportDialog
        open={showFigmaImport}
        onOpenChange={setShowFigmaImport}
        onImportComplete={handleFigmaImportComplete}
        onSlideImported={handleSlideImported}
        onImportStart={handleImportStart}
        onProgressUpdate={handleProgressUpdate}
      />
    </>
  );
}