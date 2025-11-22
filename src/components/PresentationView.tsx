import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Presentation, Maximize, Minimize, Upload, Trash2, Plus, Play, FileText } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import * as pdfjsLib from 'pdfjs-dist@4.8.69';
import { saveSlidesToSupabase, getSlidesFromSupabase, deleteAllSlidesFromSupabase, SlideData } from '../utils/supabase/slides';

// Configuration de PDF.js avec une version stable depuis unpkg
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs';

interface PresentationViewProps {
  protocol?: any;
  sessions?: any[];
  isReadOnly?: boolean;
}

interface SlideData {
  id: string;
  url: string;
  name: string;
}

export default function PresentationView({ protocol, sessions, isReadOnly = false }: PresentationViewProps) {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les slides depuis Supabase
  useEffect(() => {
    const fetchSlides = async () => {
      const fetchedSlides = await getSlidesFromSupabase();
      if (fetchedSlides) {
        setSlides(fetchedSlides);
      }
    };
    fetchSlides();
  }, []);

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
            {!isReadOnly && (
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
            )}
            
            {slides.length > 0 && !isReadOnly && (
              <button
                onClick={handleDeleteAllSlides}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-all"
                title="Supprimer toutes les slides"
              >
                <Trash2 className="w-4 h-4" />
                <span style={{ fontSize: 'var(--text-sm)' }}>Tout supprimer</span>
              </button>
            )}
            
            {slides.length > 0 && (
              <button
                onClick={startPresentation}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-white hover:opacity-90 transition-all shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span style={{ fontSize: 'var(--text-sm)' }}>Présenter</span>
              </button>
            )}
          </div>
        </div>

        {/* Liste des slides */}
        {slides.length === 0 ? (
          <div className="border-2 border-dashed border-[var(--border)] rounded-[var(--radius-lg)] p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <Presentation className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-[var(--foreground)] mb-2">Aucune slide</h3>
            <p className="text-[var(--muted-foreground)] mb-3" style={{ fontSize: 'var(--text-sm)' }}>
              Importez des images (PNG, JPG) ou un PDF complet
            </p>
            <div className="flex items-center justify-center gap-2 text-[var(--muted-foreground)]" style={{ fontSize: 'var(--text-xs)' }}>
              <FileText className="w-4 h-4" />
              <span>Les PDFs sont automatiquement convertis en slides individuelles</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`relative group border-2 rounded-[var(--radius-lg)] overflow-hidden cursor-pointer transition-all ${
                  currentSlide === index
                    ? 'border-[var(--accent)] shadow-lg'
                    : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                }`}
                onClick={() => setCurrentSlide(index)}
                onDoubleClick={() => {
                  setCurrentSlide(index);
                  setIsPresenting(true);
                }}
                title="Double-cliquez pour lancer la présentation"
              >
                <div className="aspect-video bg-[var(--muted)] flex items-center justify-center overflow-hidden">
                  <img
                    src={slide.url}
                    alt={slide.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-2 bg-white border-t border-[var(--border)]">
                  <p className="text-[var(--foreground)] truncate" style={{ fontSize: 'var(--text-xs)' }}>
                    Slide {index + 1}
                  </p>
                </div>

                {!isReadOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(slide.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-[var(--radius-sm)] shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mode présentation (fullscreen) */}
      {isPresenting && slides.length > 0 && createPortal(presentationContent, document.body)}
    </>
  );
}