import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, X, Download, FileText, Presentation } from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { exportSlidesToPDF } from '../utils/slidesExport';
import { toast } from 'sonner@2.0.3';

interface SlideData {
  id: string;
  type: 'image' | 'figma';
  url?: string;
  componentName?: string;
  preview?: string;
}

interface SlideManagerProps {
  onSlidesChange: (slides: SlideData[]) => void;
  initialSlides?: SlideData[];
  isReadOnly?: boolean;
}

export default function SlideManager({ onSlidesChange, initialSlides = [], isReadOnly = false }: SlideManagerProps) {
  const [slides, setSlides] = useState<SlideData[]>(initialSlides);
  const [isOpen, setIsOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newSlide: SlideData = {
          id: `slide-${Date.now()}-${Math.random()}`,
          type: 'image',
          url: event.target?.result as string,
          preview: event.target?.result as string,
        };
        
        const updatedSlides = [...slides, newSlide];
        setSlides(updatedSlides);
        onSlidesChange(updatedSlides);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleDeleteSlide = (id: string) => {
    const updatedSlides = slides.filter((slide) => slide.id !== id);
    setSlides(updatedSlides);
    onSlidesChange(updatedSlides);
  };

  const handleReorder = (newOrder: SlideData[]) => {
    setSlides(newOrder);
    onSlidesChange(newOrder);
  };

  const handleExportPDF = async () => {
    if (slides.length === 0) {
      toast.error('Aucune slide à exporter');
      return;
    }

    try {
      setIsExporting(true);
      setShowExportMenu(false);
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

  return (
    <div className="mb-6">
      {/* Bouton pour ouvrir le gestionnaire */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:bg-[var(--muted)]/30 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--accent)] flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-[var(--accent-foreground)]" />
          </div>
          <div className="text-left">
            <h3 style={{ color: 'var(--foreground)' }}>Gérer les slides</h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {slides.length} slide{slides.length !== 1 ? 's' : ''} importée{slides.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Plus className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--foreground)' }} />
        </motion.div>
      </button>

      {/* Panel de gestion des slides */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="mt-3 p-5 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)]">
          {/* Boutons d'action */}
          <div className="mb-5 flex flex-wrap gap-3">
            {/* Bouton d'import - Masqué en mode lecture seule */}
            {!isReadOnly && (
              <div>
                <label
                  htmlFor="slide-upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-[var(--radius-md)] cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Importer des images
                </label>
                <input
                  id="slide-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
            
            {/* Bouton d'export */}
            {slides.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-[var(--radius-md)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? 'Export en cours...' : 'Exporter'}
                </button>

                {/* Menu d'export */}
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-lg overflow-hidden z-10"
                  >
                    <button
                      onClick={handleExportPDF}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)]/30 transition-colors"
                    >
                      <FileText className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
                      <div className="text-left">
                        <p style={{ color: 'var(--foreground)' }}>Exporter en PDF</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          Document portable
                        </p>
                      </div>
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Info text */}
          {!isReadOnly && (
            <p className="mb-5 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Formats supportés : JPG, PNG, GIF, WebP
            </p>
          )}

          {/* Liste des slides avec drag & drop */}
          {slides.length > 0 ? (
            <div className="space-y-3">
              <h4 className="mb-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {isReadOnly ? 'Slides de présentation' : 'Ordre de présentation'}
              </h4>
              {isReadOnly ? (
                // Mode lecture seule : liste simple sans drag & drop
                <div className="space-y-2">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="flex items-center gap-3 p-3 bg-[var(--muted)]/20 border border-[var(--border)] rounded-[var(--radius-md)]"
                    >
                      {/* Preview */}
                      <div className="w-16 h-10 bg-[var(--muted)] rounded-[var(--radius-sm)] overflow-hidden flex-shrink-0 border border-[var(--border)]">
                        {slide.preview && (
                          <img
                            src={slide.preview}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ color: 'var(--foreground)' }}>Slide {index + 1}</p>
                        <p className="text-xs truncate opacity-60" style={{ color: 'var(--muted-foreground)' }}>
                          {slide.type === 'image' ? 'Image importée' : 'Composant Figma'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Mode édition : drag & drop activé
                <Reorder.Group
                  axis="y"
                  values={slides}
                  onReorder={handleReorder}
                  className="space-y-2"
                >
                  {slides.map((slide, index) => (
                    <Reorder.Item
                      key={slide.id}
                      value={slide}
                      className="flex items-center gap-3 p-3 bg-[var(--muted)]/20 border border-[var(--border)] rounded-[var(--radius-md)] hover:bg-[var(--muted)]/40 transition-all cursor-grab active:cursor-grabbing active:scale-[0.98]"
                    >
                      <GripVertical className="w-4 h-4 opacity-40 flex-shrink-0" style={{ color: 'var(--foreground)' }} />
                      
                      {/* Preview */}
                      <div className="w-16 h-10 bg-[var(--muted)] rounded-[var(--radius-sm)] overflow-hidden flex-shrink-0 border border-[var(--border)]">
                        {slide.preview && (
                          <img
                            src={slide.preview}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ color: 'var(--foreground)' }}>Slide {index + 1}</p>
                        <p className="text-xs truncate opacity-60" style={{ color: 'var(--muted-foreground)' }}>
                          {slide.type === 'image' ? 'Image importée' : 'Composant Figma'}
                        </p>
                      </div>

                      {/* Bouton supprimer */}
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--destructive)]/10 transition-colors flex-shrink-0 opacity-60 hover:opacity-100"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
                      </button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-[var(--radius-md)] bg-[var(--muted)] flex items-center justify-center opacity-60">
                <ImageIcon className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {isReadOnly ? 'Aucune slide disponible' : 'Aucune slide importée'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}