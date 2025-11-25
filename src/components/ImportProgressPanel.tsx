import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, X, CheckCircle2, Loader2, Download, ArrowRight } from 'lucide-react';

interface ImportProgressPanelProps {
  total: number;
  current: number;
  currentSlideName?: string;
  importedSlides: Array<{ name: string; status: 'done' | 'loading' }>;
  onClose?: () => void;
  onGoToSlides?: () => void;
}

export function ImportProgressPanel({
  total,
  current,
  currentSlideName,
  importedSlides,
  onClose,
  onGoToSlides,
}: ImportProgressPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const progress = total > 0 ? (current / total) * 100 : 0;
  const isComplete = current >= total && total > 0;

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
              {isComplete ? 'Import terminé' : 'Import Figma'}
            </span>
            {!isComplete && (
              <span 
                className="px-2 py-0.5 bg-accent-foreground/10 rounded-full"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                {current}/{total}
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
            {isComplete && onClose && (
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
                {/* Progress bar */}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}