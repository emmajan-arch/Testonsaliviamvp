import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, X, CheckCircle2, Loader2, Download, ArrowRight, AlertCircle } from 'lucide-react';

interface ImportProgressPanelProps {
  total: number;
  current: number;
  currentSlideName?: string;
  importedSlides: Array<{ name: string; status: 'done' | 'loading' }>;
  onClose?: () => void;
  onGoToSlides?: () => void;
  // ✨ Nouvelles props pour les slides détectées
  newSlidesDetected?: Array<{ id: string; name: string; previouslyIgnored?: boolean }>;
  selectedSlideIds?: Set<string>;
  onImportNewSlides?: () => void;
  isImportingNewSlides?: boolean;
  onToggleSlide?: (slideId: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onDismiss?: () => void;
}

export function ImportProgressPanel({
  total,
  current,
  currentSlideName,
  importedSlides,
  onClose,
  onGoToSlides,
  // ✨ Nouvelles props pour les slides détectées
  newSlidesDetected,
  selectedSlideIds,
  onImportNewSlides,
  isImportingNewSlides,
  onToggleSlide,
  onSelectAll,
  onDeselectAll,
  onDismiss,
}: ImportProgressPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDismissConfirmation, setShowDismissConfirmation] = useState(false);
  const progress = total > 0 ? (current / total) * 100 : 0;
  const isComplete = current >= total && total > 0;
  
  // ✅ Afficher uniquement les nouvelles slides quand il n'y a pas d'import en cours
  const hasNewSlides = newSlidesDetected && newSlidesDetected.length > 0;
  const showNewSlidesOnly = hasNewSlides && total === 0;
  const selectedCount = selectedSlideIds?.size ?? 0;
  const ignoredCount = newSlidesDetected?.filter(s => s.previouslyIgnored).length ?? 0;
  const newCount = (newSlidesDetected?.length ?? 0) - ignoredCount;

  // ✅ Fermer automatiquement le panneau après avoir confirmé l'ignore
  useEffect(() => {
    if (showDismissConfirmation) {
      const timer = setTimeout(() => {
        onClose?.(); // ✅ Fermer seulement le panneau, pas appeler onDismiss à nouveau
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showDismissConfirmation, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
        }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-6 right-6 z-50 w-80 overflow-hidden bg-card"
        style={{
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-accent text-accent-foreground border-b border-border">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </motion.div>
            ) : showNewSlidesOnly ? (
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <AlertCircle className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ 
                  y: [0, -3, 0],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Download className="w-5 h-5" />
              </motion.div>
            )}
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
              {isComplete 
                ? 'Import terminé' 
                : showNewSlidesOnly 
                  ? 'Nouvelles slides détectées'
                  : 'Import Figma'
              }
            </span>
            {!isComplete && !showNewSlidesOnly && (
              <span 
                className="px-2 py-0.5 bg-accent-foreground/10 rounded-full"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                {current}/{total}
              </span>
            )}
            {showNewSlidesOnly && (
              <span 
                className="px-2 py-0.5 bg-accent-foreground/10 rounded-full"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                {newSlidesDetected?.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-accent-foreground/10 rounded transition-colors"
              aria-label={isMinimized ? 'Agrandir' : 'Réduire'}
            >
              {isMinimized ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {/* ✅ Afficher le bouton X pour "Import terminé" OU "Nouvelles slides détectées" */}
            {(isComplete || showNewSlidesOnly) && onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent-foreground/10 rounded transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Progress bar - Seulement si on importe */}
                {!showNewSlidesOnly && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        {current} / {total} slides
                      </span>
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="h-full bg-accent"
                        style={{
                          background: isComplete
                            ? 'var(--success)'
                            : 'linear-gradient(90deg, var(--accent) 0%, var(--info) 100%)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Current slide */}
                {!isComplete && currentSlideName && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-muted/50"
                    style={{ borderRadius: 'var(--radius-lg)' }}
                  >
                    <Loader2 className="w-4 h-4 mt-0.5 animate-spin text-info flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: 'var(--text-xs)' }}
                      >
                        En cours
                      </p>
                      <p
                        className="truncate"
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {currentSlideName}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Success message with button */}
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <div
                      className="p-3 bg-success/10 border border-success/20"
                      style={{ borderRadius: 'var(--radius-lg)' }}
                    >
                      <p
                        className="text-success text-center"
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        ✨ {total} slide{total > 1 ? 's' : ''} importée{total > 1 ? 's' : ''} avec succès
                      </p>
                    </div>
                    {onGoToSlides && (
                      <button
                        onClick={onGoToSlides}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground hover:bg-accent/90 transition-all"
                        style={{ borderRadius: 'var(--radius-lg)' }}
                      >
                        <span
                          style={{ 
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                          }}
                        >
                          Accéder aux slides
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                )}

                {/* ✨ Nouvelles slides détectées */}
                {showNewSlidesOnly && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    {/* ✅ Message de confirmation quand on ignore tout */}
                    {showDismissConfirmation ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-3"
                      >
                        <div
                          className="p-4 bg-muted/50 border border-border"
                          style={{ borderRadius: 'var(--radius-lg)' }}
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            <p
                              className="text-foreground text-center"
                              style={{
                                fontSize: 'var(--text-base)',
                                fontWeight: 'var(--font-weight-semibold)',
                              }}
                            >
                              Slides ignorées
                            </p>
                          </div>
                          <p
                            className="text-muted-foreground text-center"
                            style={{
                              fontSize: 'var(--text-sm)',
                            }}
                          >
                            {newSlidesDetected.length} slide{newSlidesDetected.length > 1 ? 's ont' : ' a'} été ignorée{newSlidesDetected.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <div
                          className="p-3 bg-info/10 border border-info/20"
                          style={{ borderRadius: 'var(--radius-lg)' }}
                        >
                          <p
                            className="text-info text-center"
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--font-weight-semibold)',
                            }}
                          >
                            <AlertCircle className="w-4 h-4 inline-block mr-1.5 mb-0.5" />
                            {newSlidesDetected.length} nouvelle{newSlidesDetected.length > 1 ? 's' : ''} slide{newSlidesDetected.length > 1 ? 's' : ''}
                          </p>
                          {ignoredCount > 0 && (
                            <p
                              className="text-muted-foreground text-center mt-1.5"
                              style={{
                                fontSize: 'var(--text-xs)',
                              }}
                            >
                              dont {ignoredCount} ignorée{ignoredCount > 1 ? 's' : ''} précédemment
                            </p>
                          )}
                        </div>
                        
                        {/* Liste des nouvelles slides */}
                        <div
                          className="p-3 bg-muted/30 border border-border max-h-64 overflow-y-auto"
                          style={{ borderRadius: 'var(--radius-md)' }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p 
                              className="text-muted-foreground"
                              style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
                            >
                              Sélectionner les slides :
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={onSelectAll}
                                className="px-2 py-0.5 hover:bg-muted rounded transition-colors"
                                style={{ fontSize: 'var(--text-xs)' }}
                              >
                                Tout
                              </button>
                              <button
                                onClick={onDeselectAll}
                                className="px-2 py-0.5 hover:bg-muted rounded transition-colors"
                                style={{ fontSize: 'var(--text-xs)' }}
                              >
                                Aucun
                              </button>
                            </div>
                          </div>
                          <ul className="space-y-2">
                            {newSlidesDetected.map((slide) => {
                              const isSelected = selectedSlideIds?.has(slide.id) ?? false;
                              return (
                                <li 
                                  key={slide.id}
                                  className="flex items-start gap-2.5"
                                >
                                  <input
                                    type="checkbox"
                                    id={`slide-${slide.id}`}
                                    checked={isSelected}
                                    onChange={() => onToggleSlide?.(slide.id)}
                                    className="mt-0.5 w-4 h-4 rounded border-border cursor-pointer"
                                    style={{ accentColor: 'var(--info)' }}
                                  />
                                  <label
                                    htmlFor={`slide-${slide.id}`}
                                    className="flex-1 cursor-pointer text-foreground hover:text-info transition-colors"
                                    style={{ fontSize: 'var(--text-sm)' }}
                                    title={slide.name}
                                  >
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={isSelected ? '' : 'opacity-60'}>{slide.name}</span>
                                      {slide.previouslyIgnored && (
                                        <span 
                                          className="px-1.5 py-0.5 bg-warning/10 text-warning border border-warning/20 whitespace-nowrap"
                                          style={{ 
                                            fontSize: 'var(--text-xs)', 
                                            borderRadius: 'var(--radius-sm)',
                                            fontWeight: 'var(--font-weight-medium)'
                                          }}
                                          title="Vous aviez choisi de ne pas importer cette slide précédemment"
                                        >
                                          Ignorée précédemment
                                        </span>
                                      )}
                                    </div>
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        
                        {/* Boutons d'action */}
                        <div className="flex gap-2">
                          {onDismiss && (
                            <button
                              onClick={() => {
                                onDismiss(); // ✅ Marquer les slides comme ignorées
                                setShowDismissConfirmation(true); // ✅ Afficher la confirmation
                              }}
                              disabled={isImportingNewSlides}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-foreground hover:bg-muted/80 border border-border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ borderRadius: 'var(--radius-lg)' }}
                            >
                              <span
                                style={{ 
                                  fontSize: 'var(--text-sm)',
                                  fontWeight: 'var(--font-weight-medium)',
                                }}
                              >
                                Tout ignorer
                              </span>
                            </button>
                          )}
                          
                          {onImportNewSlides && (
                            <button
                              onClick={onImportNewSlides}
                              disabled={isImportingNewSlides || selectedCount === 0}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ borderRadius: 'var(--radius-lg)' }}
                            >
                              {isImportingNewSlides && <Loader2 className="w-4 h-4 animate-spin" />}
                              <span
                                style={{ 
                                  fontSize: 'var(--text-sm)',
                                  fontWeight: 'var(--font-weight-medium)',
                                }}
                              >
                                {isImportingNewSlides 
                                  ? 'Importation...' 
                                  : `Importer ${selectedCount} slide${selectedCount > 1 ? 's' : ''}`
                                }
                              </span>
                              {!isImportingNewSlides && selectedCount > 0 && <ArrowRight className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}