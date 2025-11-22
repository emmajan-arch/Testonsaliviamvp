import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AlertCircle, TrendingUp, TrendingDown, Download, Trash2, Users, Clock, MousePointer, AlertTriangle, Smile, Target, Zap, Search, Lightbulb, Shield, CheckCircle2, XCircle, Eye, ThumbsUp, Brain, Navigation, Activity, FileText, Table, Info, Cloud, RefreshCw, Upload, Video, FileText as FileTextIcon, Play, Plus, X as XIcon, ArrowRight, ChevronDown, Sparkles, BarChart3, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AliviaLogo } from './AliviaLogo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import jsPDF from 'jspdf';
import { syncWithSupabase, deleteSession as deleteFromSupabase, updateSession, VideoTimestamp, deleteRecording as deleteRecordingFromSupabase } from '../utils/supabase/sessions';
import { toast } from 'sonner@2.0.3';
import { QualitativeSynthesis } from './QualitativeSynthesis';
import { VideoPlayer, VideoPlayerRef } from './VideoPlayer';
import { generateCompletePDF } from '../utils/pdfExport';
import { AnimatedProgress } from './AnimatedProgress';
import { AnimatedNumber } from './AnimatedNumber';
import { AnimatedChart } from './AnimatedChart';
import { DetailedTaskCharts } from './DetailedTaskCharts';
import { SimplifiedOverviewInsights } from './SimplifiedOverviewInsights';
import { BehavioralSynthesis } from './BehavioralSynthesis';
import { CircularGauge } from './CircularGauge';

// Fonction utilitaire pour supprimer les émojis
const removeEmojis = (text: string): string => {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F910}-\u{1F96B}]|[\u{1F980}-\u{1F9E0}]/gu, '').trim();
};

interface TaskResult {
  taskId: number;
  title: string;
  success: boolean;
  // Métriques catégorielles
  duration?: string;
  autonomy?: string;
  pathFluidity?: string;
  emotionalReaction?: string;
  searchMethod?: string[]; // Sélection multiple
  // Métrique numérique (échelle 1-10)
  ease?: number; // Facilité - collectée uniquement pour tâches 2-8
  valuePropositionClarity?: number; // Compréhension d'Alivia - collectée uniquement pour tâche 1 (Phase de découverte)
  firstImpression?: number; // Premières impressions - collectée uniquement pour tâche 1 (Phase de découverte)
  // Champs texte
  notes: string;
  taskVerbatimsPositive?: string;
  taskVerbatimsNegative?: string;
  // Questions post-test (tâche 9)
  postTestImpression?: string;
  postTestLiked?: string;
  postTestFrustrations?: string;
  postTestDataStorage?: string;
  postTestPracticalUse?: string;
  postTestAdoption?: number; // Score d'adoption (échelle 1-10) : "A quel point vous voyez utiliser le produit au quotidien ?"
  // skipped?: boolean; supprimé - toutes les tâches sont obligatoires
}

interface TestSession {
  id: number;
  date: string;
  participant: {
    name: string;
    role: string;
    experience: string;
    department?: string;
    aiToolsFrequency?: string;
    aiToolsEase?: string;
    aliviaFrequency?: string;
  };
  tasks: TaskResult[];
  generalObservations: string;
  recordingUrl?: string;
  transcription?: string;
  timestamps?: VideoTimestamp[];
}

// Traductions et icônes des métriques NUMÉRIQUES (échelles 1-10)
// Note : Ne conserver QUE les métriques numériques collectées via Slider
const metricConfig: Record<string, { label: string; icon: any }> = {
  ease: { label: 'Facilité', icon: ThumbsUp },
  valuePropositionClarity: { label: 'Compréhension d\'Alivia', icon: Lightbulb },
  firstImpression: { label: 'Premières impressions', icon: Sparkles }
};

const categoricalConfig: Record<string, { label: string; icon: any }> = {
  duration: { label: 'Durée', icon: Clock },
  autonomy: { label: 'Autonomie', icon: Zap },
  pathFluidity: { label: 'Fluidité', icon: Navigation },
  emotionalReaction: { label: 'Réaction émotionnelle', icon: Smile },
  searchMethod: { label: 'Méthode de recherche', icon: Search }
};

// Traductions des valeurs
const durationLabels: Record<string, string> = {
  'very-fast': 'Très rapide',
  'fast': 'Rapide',
  'medium': 'Moyen',
  'long': 'Long',
  'very-long': 'Très long'
};

const autonomyLabels: Record<string, string> = {
  'autonomous': 'Totalement autonome',
  'minimal-help': 'Aide minimale',
  'guided': 'A dû être guidé',
  'blocked': 'Bloqué sans aide'
};

const pathFluidityLabels: Record<string, string> = {
  'direct': 'Direct',
  'hesitant': 'Avec hésitations',
  'erratic': 'Erratique'
};

const emotionalReactionLabels: Record<string, string> = {
  'positive': 'Positif/Confiant',
  'neutral': 'Neutre/Concentré',
  'frustrated': 'Frustré/Confus'
};

const searchMethodLabels: Record<string, string> = {
  'search-bar': 'Barre de recherche',
  'visual-catalog': 'Navigation visuelle catalogue',
  'sidebar-assistants': 'Consultation des assistants dans la barre latérale',
  'confused': 'Confusion / ne trouve pas'
};

const getMetricColor = (value: number) => {
  if (value >= 8) return 'text-[var(--success)]';
  if (value >= 6) return 'text-[var(--foreground)]';
  if (value >= 4) return 'text-[var(--warning)]';
  return 'text-[var(--destructive)]';
};

const getBarColor = (value: number) => {
  if (value >= 80) return 'var(--success)';
  if (value >= 60) return 'var(--accent)';
  if (value >= 40) return 'var(--warning)';
  return 'var(--destructive)';
};

// Composant pour les headers de section
const SectionHeader = ({ icon: Icon, title, description, borderColor, bgColor, iconColor }: any) => (
  <div className={`flex items-center gap-3 pb-3 border-b-2 ${borderColor}`}>
    <div className={`p-2.5 ${bgColor} rounded-[var(--radius)]`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div>
      <h2 className="text-2xl text-[var(--foreground)]">{title}</h2>
      <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
    </div>
  </div>
);

interface ResultsViewProps {
  onEditSession: (sessionId: number) => void;
  isActive?: boolean;
  isReadOnly?: boolean;
  sidebarCollapsed?: boolean;
}

export function ResultsView({ onEditSession, isActive, isReadOnly = false, sidebarCollapsed = false }: ResultsViewProps) {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const videoPlayerRefs = useRef<{ [key: number]: VideoPlayerRef | null }>({});
  
  // Navigation sections state
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [showNavBar, setShowNavBar] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Chargement initial
  useEffect(() => {
    loadSessions();
  }, []);

  // Auto-sync quand l'onglet devient actif
  useEffect(() => {
    if (isActive) {
      handleSync();
    }
  }, [isActive]);

  // Synchroniser le localStorage quand sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('testSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll Spy pour détecter la section active
  useEffect(() => {
    const handleScroll = () => {
      // Afficher la barre de navigation après 100px de scroll
      if (window.scrollY > 100) {
        setShowNavBar(true);
        
        // Cacher la barre après 2 secondes d'inactivité
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
          setShowNavBar(false);
        }, 2000);
      } else {
        setShowNavBar(false);
      }

      const sections = [
        { id: 'overview', element: document.getElementById('section-overview') },
        { id: 'behavioral', element: document.getElementById('section-behavioral') },
        { id: 'qualitative', element: document.getElementById('section-qualitative') },
        { id: 'tasks', element: document.getElementById('section-tasks') },
        { id: 'sessions', element: document.getElementById('section-sessions') }
      ];

      const scrollPosition = window.scrollY + 300; // Offset pour détecter la section visible

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const sectionTop = section.element.offsetTop;
          if (scrollPosition >= sectionTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Fonction pour scroller vers une section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      const navHeight = 100; // Offset pour la barre flottante
      const elementPosition = element.offsetTop - navHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  // Charger le protocole actuel depuis localStorage
  const getCurrentProtocol = () => {
    try {
      const tasksData = localStorage.getItem('protocolTasks');
      if (!tasksData) {
        console.warn('⚠️ Aucune tâche trouvée dans protocolTasks');
        return null;
      }
      
      const tasks = JSON.parse(tasksData);
      return { tasks };
    } catch (error) {
      console.error('Error loading protocol:', error);
      return null;
    }
  };

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      // Sync with Supabase on load
      const syncedSessions = await syncWithSupabase();
      console.log('📥 Sessions chargées depuis Supabase:', syncedSessions.length, 'sessions');
      
      // 🔧 MIGRATION: Migrer et nettoyer les données
      let needsUpdate = false;
      
      // Données de restauration pour la tâche 8 "Trouver l'historique"
      const task8Data: Record<string, { ease: number; success: boolean; duration: string; autonomy: string; pathFluidity: string }> = {
        'Louis': { ease: 9, success: true, duration: 'very-fast', autonomy: 'autonomous', pathFluidity: 'direct' },
        'Charles': { ease: 8, success: true, duration: 'fast', autonomy: 'autonomous', pathFluidity: 'direct' },
        'Anne': { ease: 7, success: true, duration: 'medium', autonomy: 'minimal-help', pathFluidity: 'hesitant' },
        'Lucas': { ease: 6, success: true, duration: 'medium', autonomy: 'minimal-help', pathFluidity: 'hesitant' }
      };
      
      const migratedSessions = syncedSessions.map(session => {
        // Étape 1: Récupérer le score d'adoption de la tâche 10 avant suppression
        const task10 = session.tasks.find(t => t.taskId === 10 || t.title?.includes('Créer un assistant'));
        const postTestAdoptionFromTask10 = task10?.postTestAdoption;
        
        if (task10) {
          console.log(`🔧 Migration session ${session.id}: tâche 10 détectée, score d'adoption = ${postTestAdoptionFromTask10}`);
          needsUpdate = true;
        }
        
        // Étape 2: Filtrer et supprimer la tâche 10
        let filteredTasks = session.tasks.filter(t => {
          const isTask10 = t.taskId === 10 || t.title?.includes('Créer un assistant');
          if (isTask10) {
            console.log(`❌ Suppression tâche 10: "${t.title}"`);
          }
          return !isTask10;
        });
        
        // Étape 3: Corriger les taskId basés sur les titres (mapping standard)
        const taskTitleToId: Record<string, number> = {
          'Phase de découverte': 1,
          'Trouver le bon assistant': 2,
          'Envoyer une requête & obtenir une réponse': 3,
          'Vérifier la confiance dans la réponse': 4,
          'Changer d\'assistant': 5,
          'Paramétrer un assistant': 6,
          'Choisir les sources nécessaires': 7,
          'Trouver l\'historique': 8,
          'Questions Post-Test': 9
        };
        
        filteredTasks = filteredTasks.map(task => {
          const normalizedTitle = task.title?.trim() || '';
          let correctedId = task.taskId;
          
          // Essayer de trouver un ID correspondant au titre
          for (const [titleKey, id] of Object.entries(taskTitleToId)) {
            if (normalizedTitle.toLowerCase().includes(titleKey.toLowerCase()) || 
                titleKey.toLowerCase().includes(normalizedTitle.toLowerCase())) {
              if (correctedId !== id) {
                console.log(`🔧 Correction ID: "${normalizedTitle}" ${correctedId} → ${id}`);
                needsUpdate = true;
              }
              correctedId = id;
              break;
            }
          }
          
          const isDiscovery = correctedId === 1 || normalizedTitle.includes('Découverte');
          const isPostTest = correctedId === 9 || normalizedTitle.includes('Questions Post-Test');
          
          // Nettoyer les métriques incorrectes
          const cleanedTask = { ...task, taskId: correctedId };
          
          // Supprimer le flag skipped
          delete cleanedTask.skipped;
          
          // Pour la tâche Découverte : supprimer ease, garder valuePropositionClarity et firstImpression
          if (isDiscovery) {
            delete cleanedTask.ease;
            delete cleanedTask.duration;
            delete cleanedTask.autonomy;
            delete cleanedTask.pathFluidity;
          }
          // Pour Questions Post-Test : supprimer ease, transférer score adoption de tâche 10
          else if (isPostTest) {
            delete cleanedTask.ease;
            // Transférer le score d'adoption de la tâche 10 vers la tâche 9 si nécessaire
            if (postTestAdoptionFromTask10 && !cleanedTask.postTestAdoption) {
              console.log(`✅ Transfert score adoption: tâche 10 → tâche 9 (${postTestAdoptionFromTask10})`);
              cleanedTask.postTestAdoption = postTestAdoptionFromTask10;
              needsUpdate = true;
            }
          }
          // Pour les tâches standards : supprimer valuePropositionClarity et firstImpression
          else {
            delete cleanedTask.valuePropositionClarity;
            delete cleanedTask.firstImpression;
          }
          
          return cleanedTask;
        });
        
        // Étape 4: Restaurer automatiquement la tâche 8 "Trouver l'historique" si elle est manquante
        const task8Exists = filteredTasks.some(t => t.taskId === 8 || t.title?.toLowerCase().includes('historique'));
        const participantName = session.participant.name;
        
        if (!task8Exists) {
          // Utiliser les données pré-remplies si disponibles, sinon valeurs par défaut modifiables
          const defaultData = task8Data[participantName] || {
            ease: undefined,
            success: false,
            duration: '',
            autonomy: '',
            pathFluidity: ''
          };
          
          const task8: TaskResult = {
            taskId: 8,
            title: 'Trouver l\'historique',
            success: defaultData.success,
            duration: defaultData.duration,
            autonomy: defaultData.autonomy,
            pathFluidity: defaultData.pathFluidity,
            ease: defaultData.ease,
            notes: '',
            taskVerbatimsPositive: '',
            taskVerbatimsNegative: '',
            emotionalReaction: 'neutral'
          };
          
          // Insérer la tâche 8 à la bonne position (avant la tâche 9)
          const task9Index = filteredTasks.findIndex(t => t.taskId === 9 || t.title?.includes('Questions Post-Test'));
          if (task9Index !== -1) {
            filteredTasks.splice(task9Index, 0, task8);
          } else {
            filteredTasks.push(task8);
          }
          
          needsUpdate = true;
        }
        
        return {
          ...session,
          tasks: filteredTasks
        };
      });
      
      syncedSessions.forEach((s, idx) => {
        console.log(`Session ${idx + 1}:`, {
          id: s.id,
          participant: s.participant.name,
          date: s.date,
          nbTasks: s.tasks?.length || 0,
          tasksIds: s.tasks?.map(t => t.taskId) || []
        });
      });
      
      // Étape 4: Sauvegarder automatiquement les sessions migrées si modifications détectées
      if (needsUpdate) {
        console.log('💾 Sauvegarde automatique des sessions migrées...');
        for (const session of migratedSessions) {
          try {
            await updateSession(session.id, { tasks: session.tasks });
            console.log(`✅ Session ${session.id} migrée et sauvegardée`);
          } catch (error) {
            console.error(`❌ Erreur sauvegarde session ${session.id}:`, error);
          }
        }
        
        // Mettre à jour aussi le localStorage pour que l'édition fonctionne
        localStorage.setItem('testSessions', JSON.stringify(migratedSessions));
        console.log('💾 localStorage synchronisé avec les sessions migrées');
        
        toast.success('Migration automatique effectuée avec succès');
      }
      
      setSessions(migratedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      // Fallback to localStorage
      const localSessions = JSON.parse(localStorage.getItem('testSessions') || '[]');
      console.log('📥 Sessions chargées depuis localStorage (fallback):', localSessions.length, 'sessions');
      setSessions(localSessions);
      toast.error('Erreur de chargement cloud. Données locales affichées.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const syncedSessions = await syncWithSupabase();
      console.log('🔄 Synchronisation manuelle - Sessions récupérées:', syncedSessions.length);
      
      // 🔧 MIGRATION: Utiliser la même logique que loadSessions
      let needsUpdate = false;
      
      // Données de restauration pour la tâche 8 "Trouver l'historique"
      const task8Data: Record<string, { ease: number; success: boolean; duration: string; autonomy: string; pathFluidity: string }> = {
        'Louis': { ease: 9, success: true, duration: 'very-fast', autonomy: 'autonomous', pathFluidity: 'direct' },
        'Charles': { ease: 8, success: true, duration: 'fast', autonomy: 'autonomous', pathFluidity: 'direct' },
        'Anne': { ease: 7, success: true, duration: 'medium', autonomy: 'minimal-help', pathFluidity: 'hesitant' },
        'Lucas': { ease: 6, success: true, duration: 'medium', autonomy: 'minimal-help', pathFluidity: 'hesitant' }
      };
      
      const migratedSessions = syncedSessions.map(session => {
        const task10 = session.tasks.find(t => t.taskId === 10 || t.title?.includes('Créer un assistant'));
        const postTestAdoptionFromTask10 = task10?.postTestAdoption;
        
        if (task10) {
          needsUpdate = true;
        }
        
        let filteredTasks = session.tasks.filter(t => {
          const isTask10 = t.taskId === 10 || t.title?.includes('Créer un assistant');
          return !isTask10;
        });
        
        const taskTitleToId: Record<string, number> = {
          'Phase de découverte': 1,
          'Trouver le bon assistant': 2,
          'Envoyer une requête & obtenir une réponse': 3,
          'Vérifier la confiance dans la réponse': 4,
          'Changer d\'assistant': 5,
          'Paramétrer un assistant': 6,
          'Choisir les sources nécessaires': 7,
          'Trouver l\'historique': 8,
          'Questions Post-Test': 9
        };
        
        filteredTasks = filteredTasks.map(task => {
          const normalizedTitle = task.title?.trim() || '';
          let correctedId = task.taskId;
          
          for (const [titleKey, id] of Object.entries(taskTitleToId)) {
            if (normalizedTitle.toLowerCase().includes(titleKey.toLowerCase()) || 
                titleKey.toLowerCase().includes(normalizedTitle.toLowerCase())) {
              if (correctedId !== id) {
                needsUpdate = true;
              }
              correctedId = id;
              break;
            }
          }
          
          const isDiscovery = correctedId === 1 || normalizedTitle.includes('Découverte');
          const isPostTest = correctedId === 9 || normalizedTitle.includes('Questions Post-Test');
          
          const cleanedTask = { ...task, taskId: correctedId };
          delete cleanedTask.skipped;
          
          if (isDiscovery) {
            delete cleanedTask.ease;
            delete cleanedTask.duration;
            delete cleanedTask.autonomy;
            delete cleanedTask.pathFluidity;
          } else if (isPostTest) {
            delete cleanedTask.ease;
            if (postTestAdoptionFromTask10 && !cleanedTask.postTestAdoption) {
              cleanedTask.postTestAdoption = postTestAdoptionFromTask10;
              needsUpdate = true;
            }
          } else {
            delete cleanedTask.valuePropositionClarity;
            delete cleanedTask.firstImpression;
          }
          
          return cleanedTask;
        });
        
        // Restaurer automatiquement la tâche 8 "Trouver l'historique" si elle est manquante
        const task8Exists = filteredTasks.some(t => t.taskId === 8 || t.title?.toLowerCase().includes('historique'));
        const participantName = session.participant.name;
        
        if (!task8Exists) {
          console.log(`✅ Restauration automatique tâche 8 pour ${participantName} (sync)`);
          
          // Utiliser les données pré-remplies si disponibles, sinon valeurs par défaut modifiables
          const defaultData = task8Data[participantName] || {
            ease: undefined,
            success: false,
            duration: '',
            autonomy: '',
            pathFluidity: ''
          };
          
          const task8: TaskResult = {
            taskId: 8,
            title: 'Trouver l\'historique',
            success: defaultData.success,
            duration: defaultData.duration,
            autonomy: defaultData.autonomy,
            pathFluidity: defaultData.pathFluidity,
            ease: defaultData.ease,
            notes: '',
            taskVerbatimsPositive: '',
            taskVerbatimsNegative: '',
            emotionalReaction: 'neutral'
          };
          
          // Insérer la tâche 8 à la bonne position (avant la tâche 9)
          const task9Index = filteredTasks.findIndex(t => t.taskId === 9 || t.title?.includes('Questions Post-Test'));
          if (task9Index !== -1) {
            filteredTasks.splice(task9Index, 0, task8);
          } else {
            filteredTasks.push(task8);
          }
          
          needsUpdate = true;
        }
        
        return {
          ...session,
          tasks: filteredTasks
        };
      });
      
      syncedSessions.forEach((s, idx) => {
        console.log(`Session ${idx + 1}:`, {
          id: s.id,
          participant: s.participant.name,
          date: s.date,
          nbTasks: s.tasks?.length || 0
        });
      });
      
      // Sauvegarder automatiquement si migrations nécessaires
      if (needsUpdate) {
        for (const session of migratedSessions) {
          try {
            await updateSession(session.id, { tasks: session.tasks });
          } catch (error) {
            console.error(`❌ Erreur sauvegarde session ${session.id}:`, error);
          }
        }
        
        // Mettre à jour aussi le localStorage pour que l'édition fonctionne
        localStorage.setItem('testSessions', JSON.stringify(migratedSessions));
        console.log('💾 localStorage synchronisé avec les sessions migrées (sync)');
      }
      
      setSessions(migratedSessions);
      toast.success('Synchronisation réussie avec le cloud ☁️');
    } catch (error) {
      console.error('Error syncing sessions:', error);
      toast.error('Erreur de synchronisation avec le cloud');
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteSession = async (id: number) => {
    // Confirmation de suppression
    const confirmed = window.confirm('⚠️ ATTENTION : Cette session sera DÉFINITIVEMENT supprimée du cloud et ne pourra pas être récupérée. Êtes-vous sûr de vouloir continuer ?');
    
    if (!confirmed) {
      return;
    }
    
    try {
      // Delete from Supabase (source de vérité)
      await deleteFromSupabase(id);
      
      // Re-synchroniser avec le cloud pour s'assurer que tout est à jour
      const syncedSessions = await syncWithSupabase();
      setSessions(syncedSessions);
      
      toast.success('✅ Session supprimée DÉFINITIVEMENT du cloud et synchronisée');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('❌ Erreur lors de la suppression. Veuillez réessayer ou contacter le support.');
    }
  };

  const handleUploadRecording = (sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    setSelectedSessionId(sessionId);
    setVideoUrl(session?.recordingUrl || '');
    setUploadDialogOpen(true);
  };



  // Convertir l'URL Google Drive en URL d'embed si nécessaire
  const convertGoogleDriveUrl = (url: string): string => {
    if (!url) return '';
    
    // Si c'est déjà une URL preview, la retourner telle quelle
    if (url.includes('/preview')) return url;
    
    // Extraire l'ID du fichier Google Drive
    const match = url.match(/\/file\/d\/([^\/]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    
    // Si c'est une autre URL (YouTube, Vimeo, etc.), la retourner telle quelle
    return url;
  };

  const submitRecording = async () => {
    if (!selectedSessionId || !videoUrl.trim()) {
      toast.error('Veuillez saisir une URL de vidéo');
      return;
    }

    setIsUploading(true);
    try {
      const convertedUrl = convertGoogleDriveUrl(videoUrl);
      
      // Update local state
      const updatedSessions = sessions.map(s => 
        s.id === selectedSessionId 
          ? { ...s, recordingUrl: convertedUrl }
          : s
      );
      setSessions(updatedSessions);
      localStorage.setItem('testSessions', JSON.stringify(updatedSessions));
      
      // Sync with Supabase
      await updateSession(selectedSessionId, {
        recordingUrl: convertedUrl
      });
      
      toast.success('✅ Enregistrement vidéo ajouté avec succès');
      setUploadDialogOpen(false);
    } catch (error) {
      console.error('Error saving recording:', error);
      toast.error('Erreur lors de la sauvegarde de l\'enregistrement');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteRecording = async (sessionId: number) => {
    try {
      // Delete recording from Supabase
      await deleteRecordingFromSupabase(sessionId);
      
      // Update local state
      const updatedSessions = sessions.map(s => 
        s.id === sessionId 
          ? { ...s, recordingUrl: undefined, transcription: undefined, timestamps: undefined }
          : s
      );
      setSessions(updatedSessions);
      localStorage.setItem('testSessions', JSON.stringify(updatedSessions));
      
      toast.success('Enregistrement supprimé avec succès');
    } catch (error) {
      console.error('Error deleting recording:', error);
      
      // Fallback: delete only from localStorage
      const updatedSessions = sessions.map(s => 
        s.id === sessionId 
          ? { ...s, recordingUrl: undefined, transcription: undefined, timestamps: undefined }
          : s
      );
      setSessions(updatedSessions);
      localStorage.setItem('testSessions', JSON.stringify(updatedSessions));
      
      toast.error('Erreur cloud. Enregistrement supprimé localement.');
    }
  };

  const exportToCSV = () => {
    const allTasks = sessions.flatMap(s => s.tasks.map(t => ({
      ...t,
      sessionId: s.id,
      sessionDate: s.date,
      participantName: s.participant.name,
      participantRole: s.participant.role,
      participantExperience: s.participant.experience,
      participantDepartment: s.participant.department || '',
      participantAiToolsFrequency: s.participant.aiToolsFrequency || '',
      participantAiToolsEase: s.participant.aiToolsEase || '',
      participantAliviaFrequency: s.participant.aliviaFrequency || ''
    })));

    if (allTasks.length === 0) return;

    // En-têtes CSV (dynamique selon metricConfig)
    const metricHeaders = Object.values(metricConfig).map(m => m.label);
    const headers = [
      'Session ID', 'Date', 'Participant', 'Rôle', 'Expérience', 'Département',
      'Fréquence Outils IA', 'Aisance IA', 'Fréquence Alivia',
      'Tâche ID', 'Titre Tâche', 'Réussite', 
      'Durée', 'Autonomie', 'Fluidité', 'Réaction Émotionnelle', 'Méthode Recherche',
      ...metricHeaders,
      'Notes', 'Impression Post-Test', 'Points Appréciés', 'Frustrations', 
      'Stockage Données', 'Usage Pratique', 'Score Adoption'
    ];

    const csvRows = [headers.join(',')];

    allTasks.forEach(task => {
      const row = [
        task.sessionId,
        task.sessionDate,
        `"${task.participantName}"`,
        `"${task.participantRole}"`,
        `"${task.participantExperience}"`,
        `"${task.participantDepartment}"`,
        `"${task.participantAiToolsFrequency}"`,
        `"${task.participantAiToolsEase}"`,
        `"${task.participantAliviaFrequency}"`,
        task.taskId,
        `"${removeEmojis(task.title)}"`,
        task.success ? 'Oui' : 'Non',
        task.duration ? durationLabels[task.duration] || task.duration : '',
        task.autonomy ? autonomyLabels[task.autonomy] || task.autonomy : '',
        task.pathFluidity ? pathFluidityLabels[task.pathFluidity] || task.pathFluidity : '',
        task.emotionalReaction ? emotionalReactionLabels[task.emotionalReaction] || task.emotionalReaction : '',
        task.searchMethod && task.searchMethod.length > 0 ? task.searchMethod.map(m => searchMethodLabels[m] || m).join(', ') : '',
        ...Object.keys(metricConfig).map(key => {
          // La métrique "ease" (Facilité) n'est pas collectée pour : Découverte, Questions Post-Test, tâches bonus
          const isPostTest = task.title === 'Questions Post-Test' || task.title?.includes('Questions Post-Test');
          const isDiscovery = task.title?.includes('Découverte');
          const isBonus = task.title?.includes('Créer un assistant') || task.title?.includes('BONUS');
          if (key === 'ease' && (isDiscovery || isPostTest || isBonus)) return '';
          return task[key as keyof TaskResult] || '';
        }),
        `"${(task.notes || '').replace(/"/g, '""')}"`,
        `"${(task.postTestImpression || '').replace(/"/g, '""')}"`,
        `"${(task.postTestLiked || '').replace(/"/g, '""')}"`,
        `"${(task.postTestFrustrations || '').replace(/"/g, '""')}"`,
        `"${(task.postTestDataStorage || '').replace(/"/g, '""')}"`,
        `"${(task.postTestPracticalUse || '').replace(/"/g, '""')}"`,
        task.postTestAdoption || ''
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `alivia-test-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportSessionToPDF = (session: TestSession) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    const leftMargin = 15;
    const rightMargin = pageWidth - 15;
    const maxWidth = rightMargin - leftMargin;

    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(30, 14, 98);
    doc.text('Alivia - Session Test UX', leftMargin, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, leftMargin, yPos);
    
    yPos += 10;
    doc.setDrawColor(30, 14, 98);
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    
    yPos += 10;

    // Informations participant
    doc.setFontSize(14);
    doc.setTextColor(30, 14, 98);
    doc.text(session.participant.name, leftMargin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${session.participant.role} | ${new Date(session.date).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, leftMargin, yPos);
    yPos += 6;
    
    if (session.participant.aiToolsFrequency || session.participant.aiToolsEase || session.participant.aliviaFrequency) {
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const profileInfo = [];
      if (session.participant.aiToolsFrequency) profileInfo.push(`IA: ${session.participant.aiToolsFrequency}`);
      if (session.participant.aiToolsEase) profileInfo.push(`Aisance: ${session.participant.aiToolsEase}`);
      if (session.participant.aliviaFrequency) profileInfo.push(`Alivia: ${session.participant.aliviaFrequency}`);
      doc.text(profileInfo.join(' | '), leftMargin, yPos);
      yPos += 8;
    }

    // Résumé
    const successCount = session.tasks.filter(t => t.success).length;
    const successRate = (successCount / session.tasks.length) * 100;
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Tâches réussies: ${successCount}/${session.tasks.length} (${successRate.toFixed(0)}%)`, leftMargin, yPos);
    yPos += 10;

    // Tâches
    session.tasks.forEach((task, taskIndex) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const taskTitle = `Tâche ${taskIndex + 1}: ${removeEmojis(task.title)}`;
      doc.text(taskTitle, leftMargin, yPos);
      yPos += 5;

      doc.setFontSize(8);
      if (task.success) {
        doc.setTextColor(34, 197, 94);
      } else {
        doc.setTextColor(239, 68, 68);
      }
      doc.text(task.success ? 'Réussite' : 'Échec', leftMargin + 3, yPos);
      yPos += 5;

      // Métriques numériques (dynamique selon metricConfig)
      const taskMetrics = [];
      Object.keys(metricConfig).forEach(metricKey => {
        // Détection du type de tâche
        const isPostTest = task.title === 'Questions Post-Test' || task.title?.includes('Questions Post-Test');
        const isDiscovery = task.title?.includes('Découverte');
        const isBonus = task.title?.includes('Créer un assistant') || task.title?.includes('BONUS');
        
        // Pour la tâche Découverte : afficher seulement valuePropositionClarity et firstImpression
        if (isDiscovery) {
          if (metricKey !== 'valuePropositionClarity' && metricKey !== 'firstImpression') return;
        }
        // Pour Questions Post-Test et tâches bonus : ne pas afficher ease
        else if (metricKey === 'ease' && (isPostTest || isBonus)) {
          return;
        }
        // Pour les autres tâches : ne pas afficher valuePropositionClarity et firstImpression
        else if (metricKey === 'valuePropositionClarity' || metricKey === 'firstImpression') {
          return;
        }
        
        const value = task[metricKey as keyof TaskResult];
        if (typeof value === 'number') {
          taskMetrics.push(`${metricConfig[metricKey].label}: ${value}/10`);
        }
      });

      if (taskMetrics.length > 0) {
        doc.setTextColor(100, 100, 100);
        doc.text(taskMetrics.join(' | '), leftMargin + 3, yPos);
        yPos += 5;
      }

      // Notes
      if (task.notes && task.notes.trim()) {
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        const notesLines = doc.splitTextToSize(`Notes: ${task.notes}`, maxWidth - 10);
        doc.text(notesLines, leftMargin + 3, yPos);
        yPos += notesLines.length * 4 + 3;
      }

      // Verbatim
      if (task.verbatim && task.verbatim.trim()) {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(8);
        doc.setTextColor(100, 50, 150);
        doc.setFont(undefined, 'italic');
        const verbatimLines = doc.splitTextToSize(`"${task.verbatim}"`, maxWidth - 10);
        doc.text(verbatimLines, leftMargin + 3, yPos);
        doc.setFont(undefined, 'normal');
        yPos += verbatimLines.length * 4 + 3;
      }

      yPos += 3;
    });

    // Observations générales
    if (session.generalObservations && session.generalObservations.trim()) {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(30, 14, 98);
      doc.text('Observations Générales', leftMargin, yPos);
      yPos += 6;

      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      const obsLines = doc.splitTextToSize(session.generalObservations, maxWidth);
      doc.text(obsLines, leftMargin, yPos);
    }

    doc.save(`alivia-session-${session.participant.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Session exportée en PDF !');
  };

  const exportToPDF = () => {
    const stats = calculateStats();
    if (!stats) {
      toast.error('Impossible de générer le PDF : aucune donnée disponible');
      return;
    }
    
    const doc = generateCompletePDF({ sessions, stats });
    doc.save(`alivia-test-results-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Résultats exportés en PDF !');
  };

  /* ANCIENNE FONCTION - CONSERVÉE POUR RÉFÉRENCE
  const exportToPDF_OLD = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    const leftMargin = 15;
    const rightMargin = pageWidth - 15;
    const maxWidth = rightMargin - leftMargin;

    // Couleurs du design system Alivia
    const colors = {
      primary: [30, 14, 98],      // #1E0E62
      accent: [101, 84, 192],     // #6554C0
      success: [34, 197, 94],     // #22C55E
      warning: [251, 146, 60],    // #FB923C
      error: [239, 68, 68],       // #EF4444
      muted: [148, 163, 184],     // #94A3B8
      text: [15, 23, 42]          // #0F172A
    };

    // Fonction pour dessiner une jauge circulaire
    const drawGauge = (x: number, y: number, radius: number, percentage: number, color: number[], label: string) => {
      // Cercle de fond
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(3);
      doc.circle(x, y, radius, 'S');
      
      // Arc de progression
      if (percentage > 0) {
        doc.setDrawColor(...color);
        doc.setLineWidth(3);
        const startAngle = -90;
        const endAngle = startAngle + (percentage / 100) * 360;
        
        // Dessiner l'arc par segments
        const segments = 30;
        for (let i = 0; i < segments; i++) {
          const angle1 = startAngle + (i / segments) * (endAngle - startAngle);
          const angle2 = startAngle + ((i + 1) / segments) * (endAngle - startAngle);
          
          if (angle2 <= endAngle) {
            const x1 = x + radius * Math.cos(angle1 * Math.PI / 180);
            const y1 = y + radius * Math.sin(angle1 * Math.PI / 180);
            const x2 = x + radius * Math.cos(angle2 * Math.PI / 180);
            const y2 = y + radius * Math.sin(angle2 * Math.PI / 180);
            doc.line(x1, y1, x2, y2);
          }
        }
      }
      
      // Pourcentage au centre
      doc.setFontSize(16);
      doc.setTextColor(...color);
      doc.text(`${percentage.toFixed(0)}%`, x, y + 2, { align: 'center' });
      
      // Label en dessous
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(label, x, y + radius + 8, { align: 'center' });
    };

    // Fonction pour dessiner une barre de progression horizontale
    const drawProgressBar = (x: number, y: number, width: number, height: number, percentage: number, color: number[], label: string, value: string) => {
      // Label
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(label, x, y - 2);
      
      // Valeur à droite
      doc.setTextColor(...color);
      doc.text(value, x + width, y - 2, { align: 'right' });
      
      // Fond de la barre
      doc.setFillColor(240, 240, 240);
      doc.rect(x, y, width, height, 'F');
      
      // Barre de progression
      if (percentage > 0) {
        doc.setFillColor(...color);
        doc.rect(x, y, (width * percentage) / 100, height, 'F');
      }
    };

    // ==========================================
    // PAGE 1 : VUE D'ENSEMBLE
    // ==========================================
    
    // En-tête avec logo
    doc.setFontSize(24);
    doc.setTextColor(...colors.primary);
    doc.text('Alivia', leftMargin, yPos);
    
    yPos += 4;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Rapport Tests UX', leftMargin, yPos);
    
    // Date
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}`, rightMargin, yPos, { align: 'right' });
    
    yPos += 5;
    doc.setDrawColor(...colors.accent);
    doc.setLineWidth(0.8);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    
    yPos += 15;

    // Statistiques globales
    const stats = calculateStats();
    if (stats) {
      doc.setFontSize(14);
      doc.setTextColor(...colors.primary);
      doc.text('📊 Vue d\'Ensemble', leftMargin, yPos);
      yPos += 12;

      // Jauges principales (3 jauges côte à côte)
      const gaugeY = yPos;
      const gaugeSpacing = 60;
      const gaugeRadius = 12;
      
      // Jauge 1: Taux de réussite
      drawGauge(
        leftMargin + 25, 
        gaugeY, 
        gaugeRadius, 
        stats.successRate, 
        colors.success,
        'Taux de réussite'
      );
      
      // Jauge 2: Autonomie
      if (stats.autonomyRate !== null) {
        drawGauge(
          leftMargin + 25 + gaugeSpacing, 
          gaugeY, 
          gaugeRadius, 
          stats.autonomyRate, 
          stats.autonomyRate >= 70 ? colors.success : colors.warning,
          'Autonomie'
        );
      }
      
      // Jauge 3: Score d'adoption
      if (stats.adoptionScore !== null) {
        const adoptionPercent = (stats.adoptionScore / 10) * 100;
        drawGauge(
          leftMargin + 25 + gaugeSpacing * 2, 
          gaugeY, 
          gaugeRadius, 
          adoptionPercent, 
          adoptionPercent >= 80 ? colors.success : adoptionPercent >= 60 ? colors.warning : colors.error,
          'Adoption'
        );
      }
      
      yPos = gaugeY + gaugeRadius + 15;

      // Métriques textuelles
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      const metricsGrid = [
        [`Sessions: ${sessions.length}`, `Participants: ${new Set(sessions.map(s => s.participant.name)).size}`],
        [`Tests réussis: ${Math.round((stats.successRate / 100) * sessions.reduce((sum, s) => sum + s.tasks.length, 0))}/${sessions.reduce((sum, s) => sum + s.tasks.length, 0)}`, 
         stats.adoptionScore ? `Score moyen: ${stats.adoptionScore.toFixed(1)}/10` : '']
      ];
      
      metricsGrid.forEach(row => {
        doc.text(row[0], leftMargin + 5, yPos);
        if (row[1]) {
          doc.text(row[1], leftMargin + 95, yPos);
        }
        yPos += 6;
      });

      // Métriques numériques (Facilité, Compréhension, etc.)
      if (stats.numericalMetrics && Object.keys(stats.numericalMetrics).length > 0) {
        yPos += 8;
        doc.setFontSize(12);
        doc.setTextColor(...colors.primary);
        doc.text('🎯 Métriques de satisfaction', leftMargin, yPos);
        yPos += 10;

        Object.entries(stats.numericalMetrics).forEach(([metricKey, data]) => {
          const config = metricConfig[metricKey];
          if (!config) return;
          
          const avgScore = data.totalScore / data.count;
          const percentage = (avgScore / 10) * 100;
          
          let barColor = colors.success;
          if (avgScore < 5) barColor = colors.error;
          else if (avgScore < 7) barColor = colors.warning;
          
          drawProgressBar(
            leftMargin + 5,
            yPos,
            maxWidth - 10,
            4,
            percentage,
            barColor,
            config.label,
            `${avgScore.toFixed(1)}/10`
          );
          
          yPos += 12;
        });
      }

      // Insights
      if (stats.insights.strengths.length > 0 || stats.insights.improvements.length > 0) {
        yPos += 10;
        
        // Points forts
        if (stats.insights.strengths.length > 0) {
          doc.setFontSize(11);
          doc.setTextColor(...colors.success);
          doc.text('✓ Points forts', leftMargin, yPos);
          yPos += 6;
          
          doc.setFontSize(8);
          doc.setTextColor(60, 60, 60);
          stats.insights.strengths.slice(0, 3).forEach(strength => {
            const lines = doc.splitTextToSize(`• ${strength}`, maxWidth - 10);
            lines.forEach((line: string) => {
              if (yPos > pageHeight - 30) {
                doc.addPage();
                yPos = 20;
              }
              doc.text(line, leftMargin + 5, yPos);
              yPos += 4;
            });
          });
          yPos += 4;
        }
        
        // Points d'amélioration
        if (stats.insights.improvements.length > 0) {
          if (yPos > pageHeight - 50) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(11);
          doc.setTextColor(...colors.warning);
          doc.text('⚠ Points d\'amélioration', leftMargin, yPos);
          yPos += 6;
          
          doc.setFontSize(8);
          doc.setTextColor(60, 60, 60);
          stats.insights.improvements.slice(0, 3).forEach(improvement => {
            const lines = doc.splitTextToSize(`• ${improvement}`, maxWidth - 10);
            lines.forEach((line: string) => {
              if (yPos > pageHeight - 20) {
                doc.addPage();
                yPos = 20;
              }
              doc.text(line, leftMargin + 5, yPos);
              yPos += 4;
            });
          });
        }
      }
    }

    // ==========================================
    // PAGE 2+ : DÉTAILS DES SESSIONS
    // ==========================================
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(16);
    doc.setTextColor(...colors.primary);
    doc.text('📋 Détail des Sessions', leftMargin, yPos);
    yPos += 10;

    sessions.forEach((session, index) => {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      // Encadré pour chaque session
      doc.setDrawColor(...colors.accent);
      doc.setLineWidth(0.3);
      doc.setFillColor(250, 250, 255);
      doc.roundedRect(leftMargin, yPos - 5, maxWidth, 15, 2, 2, 'FD');

      doc.setFontSize(11);
      doc.setTextColor(...colors.primary);
      doc.text(`Session ${index + 1} • ${session.participant.name}`, leftMargin + 3, yPos);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`${session.participant.role} • ${new Date(session.date).toLocaleDateString('fr-FR')}`, 
        leftMargin + 3, yPos + 5);
      
      yPos += 18;

      // Tâches
      session.tasks.forEach((task, taskIndex) => {
        if (yPos > pageHeight - 35) {
          doc.addPage();
          yPos = 20;
        }

        // Titre de la tâche avec icône de statut
        doc.setFontSize(9);
        const statusIcon = task.success ? '✓' : '✗';
        const statusColor = task.success ? colors.success : colors.error;
        doc.setTextColor(...statusColor);
        doc.text(statusIcon, leftMargin + 5, yPos);
        
        doc.setTextColor(60, 60, 60);
        const cleanTitle = removeEmojis(task.title);
        doc.text(`Tâche ${taskIndex + 1}: ${cleanTitle}`, leftMargin + 10, yPos);
        yPos += 5;

        // Métriques de la tâche
        const taskMetrics: string[] = [];
        Object.keys(metricConfig).forEach(metricKey => {
          const isPostTest = task.title === 'Questions Post-Test' || task.title?.includes('Questions Post-Test');
          const isDiscovery = task.title?.includes('Découverte');
          const isBonus = task.title?.includes('Créer un assistant') || task.title?.includes('BONUS');
          
          if (isDiscovery) {
            if (metricKey !== 'valuePropositionClarity' && metricKey !== 'firstImpression') return;
          } else if (metricKey === 'ease' && (isPostTest || isBonus)) {
            return;
          } else if (metricKey === 'valuePropositionClarity' || metricKey === 'firstImpression') {
            return;
          }
          
          const value = task[metricKey as keyof TaskResult];
          if (typeof value === 'number') {
            taskMetrics.push(`${metricConfig[metricKey].label}: ${value}/10`);
          }
        });

        if (taskMetrics.length > 0) {
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text(taskMetrics.join(' • '), leftMargin + 10, yPos);
          yPos += 4;
        }

        // Notes avec fond grisé
        if (task.notes && task.notes.trim()) {
          doc.setFillColor(248, 248, 248);
          const notesHeight = Math.min(doc.splitTextToSize(task.notes, maxWidth - 20).length * 3.5 + 2, 20);
          doc.rect(leftMargin + 10, yPos - 2, maxWidth - 15, notesHeight, 'F');
          
          doc.setFontSize(7);
          doc.setTextColor(80, 80, 80);
          const noteLines = doc.splitTextToSize(task.notes, maxWidth - 20);
          noteLines.slice(0, 5).forEach((line: string) => {
            if (yPos > pageHeight - 20) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, leftMargin + 12, yPos);
            yPos += 3.5;
          });
          yPos += 2;
        }

        yPos += 4;
      });

      yPos += 6;
    });

    // Pied de page sur toutes les pages
    const totalPages = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i}/${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text('Alivia Tests UX', rightMargin, pageHeight - 10, { align: 'right' });
    }

    doc.save(`alivia-test-results-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Résultats exportés en PDF !');
  };
  */

  // Détecte les métriques disponibles dans les sessions
  const getAvailableMetrics = () => {
    if (sessions.length === 0) return new Set<string>();
    
    const metrics = new Set<string>();
    sessions.forEach(session => {
      session.tasks.forEach(task => {
        Object.keys(task).forEach(key => {
          if (task[key as keyof TaskResult] !== undefined && 
              key !== 'taskId' && 
              key !== 'title' && 
              key !== 'success' && 
              key !== 'notes' &&
              !key.startsWith('postTest')) {
            metrics.add(key);
          }
        });
      });
    });
    return metrics;
  };

  const calculateStats = () => {
    if (sessions.length === 0) return null;

    console.log('📊 ======= CALCUL DES STATISTIQUES =======');
    console.log('📦 Nombre de sessions:', sessions.length);
    sessions.forEach((session, idx) => {
      console.log(`Session ${idx + 1}:`, {
        id: session.id,
        participant: session.participant.name,
        nbTasks: session.tasks.length,
        tasks: session.tasks.map(t => ({
          id: t.taskId,
          title: t.title,
          success: t.success,
          skipped: t.skipped,
          ease: t.ease,
          duration: t.duration,
          autonomy: t.autonomy
        }))
      });
    });

    const allTasks = sessions.flatMap(s => s.tasks).filter(t => !t.skipped); // Exclure les tâches marquées comme non effectuées
    console.log('📋 Total tâches (après filtrage skipped):', allTasks.length);
    console.log('📋 Tâches filtrées:', allTasks.map(t => ({ id: t.taskId, title: t.title, success: t.success, ease: t.ease })));
    
    // Debug: afficher toutes les tâches 9 avec leurs scores d'adoption
    const task9s = allTasks.filter(t => t.taskId === 9);
    console.log('🔍 DEBUG - Toutes les tâches 9:', task9s.map(t => ({ 
      taskId: t.taskId, 
      postTestAdoption: t.postTestAdoption,
      postTestFrustrations: t.postTestFrustrations
    })));
    
    const availableMetrics = getAvailableMetrics();
    
    const successRate = allTasks.length > 0 ? (allTasks.filter(t => t.success).length / allTasks.length) * 100 : 0;
    console.log('✅ Taux de réussite:', successRate.toFixed(1) + '%', `(${allTasks.filter(t => t.success).length}/${allTasks.length})`);

    // Calcul du taux d'autonomie
    // Exclure la tâche 1 (Phase de découverte) qui n'a pas ces métriques
    const tasksWithAutonomy = allTasks.filter(t => t.taskId !== 1 && t.autonomy !== undefined && t.autonomy !== '' && t.autonomy !== null);
    console.log('🔍 Autonomie - Tâches avec valeur d\'autonomie:', tasksWithAutonomy.map(t => ({ id: t.taskId, title: t.title, autonomy: t.autonomy })));
    
    const aloneCount = tasksWithAutonomy.filter(t => t.autonomy === 'autonomous').length;
    console.log(`🔍 Autonomie - Tâches "alone": ${aloneCount}/${tasksWithAutonomy.length}`);
    
    const autonomyRate = tasksWithAutonomy.length > 0
      ? (aloneCount / tasksWithAutonomy.length) * 100
      : null;
    console.log('🔍 Autonomie - Taux final:', autonomyRate?.toFixed(1) + '%');

    // Calcul des moyennes pour les métriques numériques (échelles 1-10)
    // Utiliser uniquement les métriques définies dans metricConfig
    const numericalMetrics: Record<string, { totalScore: number; count: number }> = {};
    const numericalMetricKeys = Object.keys(metricConfig);
    
    const metricSampleCounts: Record<string, number> = {};
    
    numericalMetricKeys.forEach(metric => {
      // Ne pas filtrer par availableMetrics - vérifier directement si des tâches ont cette métrique
      let tasksWithMetric = allTasks.filter(t => t[metric as keyof TaskResult] !== undefined && t[metric as keyof TaskResult] !== null);
      
      console.log(`📊 Métrique "${metric}" - Tâches avec valeur avant filtrage:`, tasksWithMetric.length);
      
      // La métrique "ease" (Facilité) est collectée UNIQUEMENT pour les tâches d'usage standard (tâches 2-8)
      // Exclure : Découverte (tâche 1) et Questions Post-Test (tâche 9)
      if (metric === 'ease') {
        console.log(`   Tâches avant filtrage:`, tasksWithMetric.map(t => ({ id: t.taskId, title: t.title, ease: t.ease })));
        tasksWithMetric = tasksWithMetric.filter(t => {
          const isPostTest = t.title === 'Questions Post-Test' || t.title?.includes('Questions Post-Test');
          const isDiscovery = t.taskId === 1 || t.title?.includes('Découverte');
          return !isPostTest && !isDiscovery;
        });
        console.log(`   Tâches après filtrage:`, tasksWithMetric.map(t => ({ id: t.taskId, title: t.title, ease: t.ease })));
      }
      
      // Les métriques "valuePropositionClarity" et "firstImpression" sont collectées UNIQUEMENT pour la tâche Découverte
      if (metric === 'valuePropositionClarity' || metric === 'firstImpression') {
        console.log(`   Tâches avant filtrage:`, tasksWithMetric.map(t => ({ id: t.taskId, title: t.title, [metric]: t[metric as keyof TaskResult] })));
        tasksWithMetric = tasksWithMetric.filter(t => {
          const isDiscovery = t.taskId === 1 || t.title?.includes('Découverte');
          return isDiscovery;
        });
        console.log(`   Tâches après filtrage:`, tasksWithMetric.map(t => ({ id: t.taskId, title: t.title, [metric]: t[metric as keyof TaskResult] })));
      }
      
      if (tasksWithMetric.length > 0) {
        const sum = tasksWithMetric.reduce((sum, t) => sum + (Number(t[metric as keyof TaskResult]) || 0), 0);
        numericalMetrics[metric] = {
          totalScore: sum,
          count: tasksWithMetric.length
        };
        metricSampleCounts[metric] = tasksWithMetric.length;
        console.log(`   ✅ Moyenne "${metric}": ${(sum / tasksWithMetric.length).toFixed(2)}/10 (${tasksWithMetric.length} tâches, somme: ${sum})`);
      } else {
        console.log(`   ⚠️ Aucune tâche avec la métrique "${metric}"`);
      }
    });
    
    console.log('📊 Métriques numériques finales:', numericalMetrics);

    // Calcul des statistiques pour les métriques catégorielles
    const categoricalStats: Record<string, Record<string, number>> = {};
    const categoricalMetrics = ['duration', 'autonomy', 'pathFluidity', 'emotionalReaction', 'searchMethod'];
    
    categoricalMetrics.forEach(metric => {
      // Ne pas filtrer par availableMetrics - vérifier directement
      let tasksWithMetric = allTasks.filter(t => {
        const value = t[metric as keyof TaskResult];
        // Exclure la tâche 1 (Phase de découverte) pour duration, autonomy, pathFluidity
        if (['duration', 'autonomy', 'pathFluidity'].includes(metric) && t.taskId === 1) {
          return false;
        }
        return value !== undefined && value !== null && value !== '';
      });
      
      console.log(`📊 Métrique catégorielle "${metric}" - Tâches avec valeur:`, tasksWithMetric.length);
      
      // searchMethod n'est collecté que sur la tâche "Trouver le bon assistant"
      if (metric === 'searchMethod') {
        tasksWithMetric = tasksWithMetric.filter(t => t.title === 'Trouver le bon assistant' || t.title?.includes('Trouver le bon assistant'));
      }
      
      if (tasksWithMetric.length > 0) {
        const distribution: Record<string, number> = {};
        tasksWithMetric.forEach(t => {
          const value = t[metric as keyof TaskResult];
          // Gérer searchMethod comme un tableau (ignorer les anciennes valeurs string)
          if (metric === 'searchMethod') {
            if (Array.isArray(value)) {
              value.forEach(method => {
                distribution[method] = (distribution[method] || 0) + 1;
              });
            }
            // Ignorer les anciennes valeurs string comme "both"
          } else {
            const strValue = String(value);
            distribution[strValue] = (distribution[strValue] || 0) + 1;
          }
        });
        categoricalStats[metric] = distribution;
        console.log(`   Distribution "${metric}":`, distribution);
      }
    });

    // Stats par tâche (format array pour l'affichage)
    const taskStats = Array.from(new Set(allTasks.map(t => t.taskId))).map(taskId => {
      const taskResults = allTasks.filter(t => t.taskId === taskId);
      if (taskResults.length === 0) return null;
      
      const stats: any = {
        taskId,
        taskTitle: removeEmojis(taskResults[0].title),
        successRate: (taskResults.filter(t => t.success).length / taskResults.length) * 100,
        count: taskResults.length
      };

      // Ajout des métriques numériques disponibles pour cette tâche
      numericalMetricKeys.forEach(metric => {
        const taskTitle = taskResults[0]?.title || '';
        const isPostTest = taskTitle === 'Questions Post-Test' || taskTitle.includes('Questions Post-Test');
        const isDiscovery = taskTitle.includes('Découverte');
        const isBonus = taskTitle.includes('Créer un assistant') || taskTitle.includes('BONUS');
        
        // Pour la tâche Découverte : calculer seulement valuePropositionClarity et firstImpression
        if (isDiscovery) {
          if (metric !== 'valuePropositionClarity' && metric !== 'firstImpression') {
            return;
          }
        }
        // Pour Questions Post-Test et tâches bonus : ne pas calculer ease
        else if (metric === 'ease' && (isPostTest || isBonus)) {
          return;
        }
        // Pour les autres tâches : ne pas calculer valuePropositionClarity et firstImpression
        else if (metric === 'valuePropositionClarity' || metric === 'firstImpression') {
          return;
        }
        
        const tasksWithMetric = taskResults.filter(t => t[metric as keyof TaskResult] !== undefined);
        if (tasksWithMetric.length > 0) {
          stats[metric] = tasksWithMetric.reduce((sum, t) => sum + (Number(t[metric as keyof TaskResult]) || 0), 0) / tasksWithMetric.length;
        }
      });

      // Ajout des métriques catégorielles pour cette tâche
      categoricalMetrics.forEach(metric => {
        const tasksWithMetric = taskResults.filter(t => t[metric as keyof TaskResult] !== undefined && t[metric as keyof TaskResult] !== null && t[metric as keyof TaskResult] !== '');
        if (tasksWithMetric.length > 0) {
          const distribution: Record<string, number> = {};
          tasksWithMetric.forEach(t => {
            const value = t[metric as keyof TaskResult];
            // Gérer searchMethod comme un tableau (ignorer les anciennes valeurs string)
            if (metric === 'searchMethod') {
              if (Array.isArray(value)) {
                value.forEach(method => {
                  distribution[method] = (distribution[method] || 0) + 1;
                });
              }
              // Ignorer les anciennes valeurs string comme "both"
            } else {
              const strValue = String(value);
              distribution[strValue] = (distribution[strValue] || 0) + 1;
            }
          });
          stats[metric] = distribution;
        }
      });

      return stats;
    }).filter(Boolean);
    
    console.log('📊 Stats par tâche (taskStats):', taskStats.map(t => ({
      taskId: t.taskId,
      title: t.taskTitle,
      successRate: t.successRate.toFixed(1) + '%',
      ease: t.ease?.toFixed(1),
      duration: t.duration,
      autonomy: t.autonomy,
      pathFluidity: t.pathFluidity
    })));

    // Stats par tâche (format Record pour QualitativeSynthesis)
    const taskStatsForQualitative: Record<string, { title: string; successCount: number; totalAttempts: number }> = {};
    Array.from(new Set(allTasks.map(t => t.taskId))).forEach(taskId => {
      const taskResults = allTasks.filter(t => t.taskId === taskId);
      if (taskResults.length > 0) {
        taskStatsForQualitative[taskId.toString()] = {
          title: taskResults[0].title,
          successCount: taskResults.filter(t => t.success).length,
          totalAttempts: taskResults.length
        };
      }
    });

    // Génération d'insights
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (successRate >= 80) {
      strengths.push(`Excellent taux de réussite global (${successRate.toFixed(0)}%)`);
    } else if (successRate < 70) {
      improvements.push(`Taux de réussite à améliorer (${successRate.toFixed(0)}%)`);
    }

    Object.entries(numericalMetrics).forEach(([metric, value]) => {
      if (value >= 8) {
        strengths.push(`${metricConfig[metric]?.label || metric} excellente (${value.toFixed(1)}/10)`);
      } else if (value < 6) {
        improvements.push(`${metricConfig[metric]?.label || metric} à améliorer (${value.toFixed(1)}/10)`);
      }
    });

    // Insights sur les métriques catégorielles
    if (categoricalStats.autonomy) {
      const totalAutonomy = Object.entries(categoricalStats.autonomy).reduce((sum, [, count]) => sum + count, 0);
      const aloneCount = categoricalStats.autonomy['autonomous'] || 0;
      const autonomyRate = (aloneCount / totalAutonomy) * 100;
      if (aloneCount / totalAutonomy >= 0.7) {
        strengths.push(`Forte autonomie des utilisateurs (${autonomyRate.toFixed(0)}%)`);
      } else if (aloneCount / totalAutonomy < 0.5) {
        improvements.push(`Autonomie faible - trop d'aide nécessaire (${autonomyRate.toFixed(0)}%)`);
      }
    }

    if (categoricalStats.emotionalReaction) {
      const positiveCount = categoricalStats.emotionalReaction['positive'] || 0;
      const totalEmotional = Object.values(categoricalStats.emotionalReaction).reduce((sum, count) => sum + count, 0);
      const positiveRate = (positiveCount / totalEmotional) * 100;
      if (positiveCount / totalEmotional < 0.5) {
        improvements.push(`Réactions émotionnelles à surveiller (${positiveRate.toFixed(0)}% positives)`);
      }
    }

    // Calcul du score d'adoption moyen (collecté dans la tâche 9 - Questions Post-Test)
    // Chercher dans les tâches dont le titre contient "post-test" (pour plus de robustesse)
    console.log('📊 ===== ANALYSE SCORE D\'ADOPTION =====');
    console.log('📊 Toutes les tâches:', allTasks.map(t => ({ sessionId: sessions.find((s: any) => s.tasks?.some((st: any) => st === t))?.id, taskId: t.taskId, title: t.title, adoption: t.postTestAdoption })));
    const tasksWithAdoption = allTasks.filter(t => {
      const isPostTest = t.taskId === 9 || t.title?.toLowerCase().includes('post-test') || t.title?.toLowerCase().includes('questions post-test');
      return isPostTest && t.postTestAdoption !== undefined && t.postTestAdoption !== null;
    });
    console.log('📊 Score d\'adoption - Tâches post-test avec postTestAdoption:', tasksWithAdoption.map(t => ({ id: t.taskId, title: t.title, adoption: t.postTestAdoption })));
    const adoptionScore = tasksWithAdoption.length > 0
      ? tasksWithAdoption.reduce((sum, t) => sum + (t.postTestAdoption || 0), 0) / tasksWithAdoption.length
      : null;
    console.log('📊 Score d\'adoption final:', adoptionScore?.toFixed(2));
    console.log('📊 ===== FIN ANALYSE =====');

    // Insights sur le score d'adoption
    if (adoptionScore !== null) {
      if (adoptionScore >= 8) {
        strengths.push(`Excellent score d'adoption (${adoptionScore.toFixed(1)}/10)`);
      } else if (adoptionScore >= 6) {
        strengths.push(`Bon potentiel d'adoption (${adoptionScore.toFixed(1)}/10)`);
      } else if (adoptionScore < 5) {
        improvements.push(`Score d'adoption faible (${adoptionScore.toFixed(1)}/10) - revoir la proposition de valeur`);
      }
    }

    console.log('📊 ======= FIN DU CALCUL DES STATISTIQUES =======');
    
    return {
      successRate,
      autonomyRate,
      adoptionScore,
      numericalMetrics,
      metricSampleCounts,
      categoricalStats,
      taskStats,
      taskStatsForQualitative,
      availableMetrics: Array.from(availableMetrics),
      insights: { strengths, improvements }
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <Card className="shadow-sm border-[var(--border)]">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-[var(--accent)]/10 rounded-full mb-4 animate-pulse">
            <Cloud className="w-12 h-12 text-[var(--accent)]" />
          </div>
          <h3 className="text-[var(--foreground)] mb-2">Chargement...</h3>
          <p className="text-[var(--muted-foreground)] text-center max-w-md">
            Synchronisation avec le cloud
          </p>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="shadow-sm border-[var(--border)]">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-[var(--muted)] rounded-full mb-4">
            <Users className="w-12 h-12 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="text-[var(--foreground)] mb-2">Aucune session enregistrée</h3>
          <p className="text-[var(--muted-foreground)] text-center max-w-md mb-4">
            Commencez par effectuer des tests dans l'onglet "Session de Test"
          </p>
          <Button onClick={handleSync} variant="outline" disabled={isSyncing}>
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 mr-2" />
                Vérifier le cloud
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-6 mb-10">
        {/* Infos à gauche */}
        <div className="space-y-4">
          <p className="text-[var(--accent)] m-0 text-[15px]">Analyse UX</p>
          <h1 className="text-[var(--foreground)] m-0 text-[30px] font-bold">Résultats des Tests</h1>
          
        </div>

        {/* Boutons à droite */}
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            onClick={handleSync} 
            variant="outline" 
            disabled={isSyncing}
            className="bg-white border-[var(--accent)]/20 hover:bg-[var(--accent)]/5"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sync...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Synchroniser
              </>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white border-[var(--accent)]/20 hover:bg-[var(--accent)]/5">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-[var(--border)]">
              <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2" />
                Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
                <Table className="w-4 h-4 mr-2" />
                Exporter en CSV
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={async () => {
                  if (window.confirm('⚠️ Cette action va nettoyer le cache local et re-synchroniser avec le cloud. Les sessions qui n\'existent que localement seront perdues. Continuer ?')) {
                    try {
                      // Vider complètement le localStorage
                      localStorage.removeItem('testSessions');
                      // Re-synchroniser avec le cloud
                      setIsSyncing(true);
                      const syncedSessions = await syncWithSupabase();
                      setSessions(syncedSessions);
                      toast.success('✅ Cache nettoyé et synchronisé avec le cloud');
                    } catch (error) {
                      console.error('Error cleaning cache:', error);
                      toast.error('❌ Erreur lors du nettoyage du cache');
                    } finally {
                      setIsSyncing(false);
                    }
                  }
                }}
                className="cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Nettoyer le cache local
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {stats && (
        <>
          {/* ============================================ */}
          {/* FLOATING NAVIGATION BAR */}
          {/* ============================================ */}
          <div 
            className={`fixed bottom-6 z-50 max-w-[95vw] transition-all duration-200 ease-in-out ${
              showNavBar 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-20 opacity-0 pointer-events-none'
            }`}
            style={{
              left: '50%',
              marginLeft: sidebarCollapsed ? '32px' : '128px',
              transform: 'translateX(-50%)'
            }}
          >
            <div className="bg-white/95 backdrop-blur-md shadow-2xl border border-[var(--border)] rounded-full px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => scrollToSection('overview')}
                className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                  activeSection === 'overview'
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md scale-105'
                    : 'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/70 hover:text-[var(--foreground)]'
                }`}
                title="Vue d'ensemble"
              >
                <Activity className="w-5 h-5" />
                <span className="hidden md:inline">Vue d'ensemble</span>
              </button>
              
              <button
                onClick={() => scrollToSection('behavioral')}
                className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                  activeSection === 'behavioral'
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md scale-105'
                    : 'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/70 hover:text-[var(--foreground)]'
                }`}
                title="Synthèse comportementale"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden md:inline">Comportemental</span>
              </button>
              
              <button
                onClick={() => scrollToSection('qualitative')}
                className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                  activeSection === 'qualitative'
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md scale-105'
                    : 'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/70 hover:text-[var(--foreground)]'
                }`}
                title="Synthèse qualitative"
              >
                <Lightbulb className="w-5 h-5" />
                <span className="hidden md:inline">Qualitatif</span>
              </button>
              
              <button
                onClick={() => scrollToSection('tasks')}
                className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                  activeSection === 'tasks'
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md scale-105'
                    : 'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/70 hover:text-[var(--foreground)]'
                }`}
                title="Performance par tâche"
              >
                <Target className="w-5 h-5" />
                <span className="hidden md:inline">Tâches</span>
              </button>
              
              <button
                onClick={() => scrollToSection('sessions')}
                className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                  activeSection === 'sessions'
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md scale-105'
                    : 'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/70 hover:text-[var(--foreground)]'
                }`}
                title="Sessions détaillées"
              >
                <Users className="w-5 h-5" />
                <span className="hidden md:inline">Sessions</span>
              </button>
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION 1: VUE D'ENSEMBLE */}
          {/* ============================================ */}
          <div id="section-overview" className="bg-white border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
            <div className="p-6 border-b-2 border-[var(--accent)] bg-[var(--accent)]">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/20 rounded-[var(--radius)]">
                    <Activity className="w-6 h-6 text-[var(--accent-foreground)]" />
                  </div>
                  <div>
                    <h2 className="text-[var(--accent-foreground)]">Vue d'ensemble</h2>
                    <p className="text-[var(--accent-foreground)]/70">Indicateurs clés de performance</p>
                  </div>
                </div>
                
                {/* Métriques rapides dans le header */}
                <div className="hidden lg:flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <p className="text-xs text-[var(--accent-foreground)]/70">Participants</p>
                    <p className="text-lg text-[var(--accent-foreground)]">
                      {(() => {
                        const uniqueParticipants = new Set(sessions.map(s => s.participant.name));
                        return uniqueParticipants.size;
                      })()}
                    </p>
                  </div>
                  
                  <div className="w-px h-10 bg-[var(--accent-foreground)]/20" />
                  
                  <div className="flex flex-col items-end">
                    <p className="text-xs text-[var(--accent-foreground)]/70">Sessions</p>
                    <p className="text-lg text-[var(--accent-foreground)]">{sessions.length}</p>
                  </div>
                  
                  <div className="w-px h-10 bg-[var(--accent-foreground)]/20" />
                  
                  <div className="flex flex-col items-end">
                    <p className="text-xs text-[var(--accent-foreground)]/70">Dernier test</p>
                    <p className="text-sm text-[var(--accent-foreground)]">
                      {(() => {
                        const latestSession = sessions.sort((a, b) => 
                          new Date(b.date).getTime() - new Date(a.date).getTime()
                        )[0];
                        
                        const today = new Date();
                        const sessionDate = new Date(latestSession.date);
                        
                        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const sessionMidnight = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
                        
                        const daysDiff = Math.floor(
                          (todayMidnight.getTime() - sessionMidnight.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        
                        if (daysDiff === 0) return "Aujourd'hui";
                        if (daysDiff === 1) return "Hier";
                        if (daysDiff < 7) return `Il y a ${daysDiff}j`;
                        if (daysDiff < 30) return `Il y a ${Math.floor(daysDiff / 7)}sem`;
                        return `Il y a ${Math.floor(daysDiff / 30)}mois`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* KPI Cards - Super important ! */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* KPI 1: Taux de réussite */}
                <Card className="overflow-hidden border-[var(--border)] hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-[var(--muted)] rounded-[var(--radius-lg)]">
                        <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                      </div>
                      <h4 className="text-sm text-[var(--primary)]">Taux de réussite</h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl text-[var(--foreground)]">
                        <AnimatedNumber value={stats.successRate} duration={1500} decimals={0} suffix="%" delay={0} />
                      </p>
                      <AnimatedProgress value={stats.successRate} className="h-2" duration={1500} delay={0} />
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {(() => {
                          const totalTasks = sessions.reduce((sum, s) => sum + s.tasks.filter(t => t.taskId !== 1 && t.taskId !== 9).length, 0);
                          const successfulTasks = Math.round((stats.successRate / 100) * totalTasks);
                          return `${successfulTasks}/${totalTasks} tâches réussies`;
                        })()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* KPI 2: Autonomie */}
                {stats.autonomyRate !== null && (
                  <Card className="overflow-hidden border-[var(--border)] hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[var(--muted)] rounded-[var(--radius-lg)]">
                          <Zap className="w-4 h-4 text-[var(--primary)]" />
                        </div>
                        <h4 className="text-sm text-[var(--primary)]">Autonomie</h4>
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl text-[var(--foreground)]">
                          <AnimatedNumber value={stats.autonomyRate} duration={1500} decimals={0} suffix="%" delay={150} />
                        </p>
                        <AnimatedProgress 
                          value={stats.autonomyRate} 
                          className="h-2"
                          duration={1500}
                          delay={150}
                        />
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Sans ou avec peu d'aide
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* KPI 3: Facilité */}
                {stats.numericalMetrics.ease !== undefined && (
                  <Card className="overflow-hidden border-[var(--border)] hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[var(--muted)] rounded-[var(--radius-lg)]">
                          <ThumbsUp className="w-4 h-4 text-[var(--primary)]" />
                        </div>
                        <h4 className="text-sm text-[var(--primary)]">Facilité</h4>
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl text-[var(--foreground)]">
                          <AnimatedNumber 
                            value={stats.numericalMetrics.ease.totalScore / stats.numericalMetrics.ease.count} 
                            duration={1500} 
                            decimals={1}
                            delay={300}
                          />
                          <span className="text-lg text-[var(--muted-foreground)]">/10</span>
                        </p>
                        <AnimatedProgress 
                          value={(stats.numericalMetrics.ease.totalScore / stats.numericalMetrics.ease.count) * 10} 
                          className="h-2"
                          duration={1500}
                          delay={300}
                        />
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Score moyen de facilité
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* KPI 4: Score d'adoption */}
                {stats.adoptionScore !== null && (
                  <Card className="overflow-hidden border-[var(--border)] hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[var(--muted)] rounded-[var(--radius-lg)]">
                          <Target className="w-4 h-4 text-[var(--primary)]" />
                        </div>
                        <h4 className="text-sm text-[var(--primary)]">Score d'adoption</h4>
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl text-[var(--foreground)]">
                          <AnimatedNumber value={stats.adoptionScore} duration={1500} decimals={1} delay={450} />
                          <span className="text-lg text-[var(--muted-foreground)]">/10</span>
                        </p>
                        <AnimatedProgress 
                          value={stats.adoptionScore * 10} 
                          className="h-2"
                          duration={1500}
                          delay={450}
                        />
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Usage quotidien perçu
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Insights simplifiés */}
              <SimplifiedOverviewInsights 
                taskStats={stats.taskStats} 
                insights={stats.insights} 
              />
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION 2: SYNTHÈSE COMPORTEMENTALE */}
          {/* ============================================ */}
          {stats.taskStats.length > 0 && (
            <div id="section-behavioral" className="bg-white border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
              <div className="p-6 border-b-2 border-[var(--accent)] bg-[var(--accent)]">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--accent-foreground)]/10 backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-[var(--accent-foreground)]" />
                  </div>
                  <div>
                    <h2 className="text-[var(--accent-foreground)]">Synthèse comportementale</h2>
                    <p className="text-[var(--accent-foreground)]/70">Analyse des patterns d'utilisation et recommandations</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <BehavioralSynthesis 
                  categoricalStats={stats.categoricalStats}
                  stats={stats}
                  globalSuccessRate={stats.successRate}
                  globalEaseScore={stats.numericalMetrics.ease !== undefined ? stats.numericalMetrics.ease.totalScore / stats.numericalMetrics.ease.count : undefined}
                  globalAutonomyRate={stats.autonomyRate !== null ? stats.autonomyRate : undefined}
                />
              </div>
            </div>
          )}



          {/* ============================================ */}
          {/* SECTION 3: SYNTHÈSE QUALITATIVE */}
          {/* ============================================ */}
          <div id="section-qualitative" className="bg-white border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
            <div className="p-6 border-b-2 border-[var(--accent)] bg-[var(--accent)]">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/20 rounded-[var(--radius)]">
                  <Lightbulb className="w-6 h-6 text-[var(--accent-foreground)]" />
                </div>
                <div>
                  <h2 className="text-[var(--accent-foreground)]">Synthèse qualitative</h2>
                  <p className="text-[var(--accent-foreground)]/70">Insights et patterns détectés automatiquement</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              <QualitativeSynthesis sessions={sessions} stats={stats ? { taskStats: stats.taskStatsForQualitative } : undefined} />
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION 5: PERFORMANCE PAR TÂCHE */}
          {/* ============================================ */}
          <div id="section-tasks" className="bg-white border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
            <div className="p-6 border-b-2 border-[var(--accent)] bg-[var(--accent)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/20 rounded-[var(--radius)]">
                    <Target className="w-6 h-6 text-[var(--accent-foreground)]" />
                  </div>
                  <div>
                    <h2 className="text-[var(--accent-foreground)]">Performance par Tâche</h2>
                    <p className="text-[var(--accent-foreground)]/70">Analyse détaillée de chaque étape du parcours</p>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-2 hover:bg-white/10 rounded-[var(--radius)] transition-colors">
                        <Info className="w-5 h-5 text-[var(--accent-foreground)]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs bg-white border border-[var(--border)] p-4 shadow-lg">
                      <div className="space-y-3">
                        <div>
                          <p className="text-[var(--foreground)] mb-2">Badges de taux de réussite :</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]">80%+</Badge>
                              <span className="text-[var(--muted-foreground)]">Excellent</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[var(--info)] text-[var(--info-foreground)] hover:bg-[var(--info)]">60-79%</Badge>
                              <span className="text-[var(--muted-foreground)]">Bon</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">&lt;60%</Badge>
                              <span className="text-[var(--muted-foreground)]">À améliorer</span>
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-[var(--foreground)] mb-2">Notes sur 10 :</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--success)]">8.0+</span>
                              <span className="text-[var(--muted-foreground)]">Excellent</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--foreground)]">6.0-7.9</span>
                              <span className="text-[var(--muted-foreground)]">Bon</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--warning)]">4.0-5.9</span>
                              <span className="text-[var(--muted-foreground)]">Moyen</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--destructive)]">&lt;4.0</span>
                              <span className="text-[var(--muted-foreground)]">Faible</span>
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-[var(--foreground)] mb-2">Autonomie (valeur dominante) :</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--success)]">Réussi seul</span>
                              <span className="text-[var(--muted-foreground)]">Vert</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--warning)]">Réussi avec indices</span>
                              <span className="text-[var(--muted-foreground)]">Orange</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--destructive)]">Échec malgré aide</span>
                              <span className="text-[var(--muted-foreground)]">Rouge</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-1 py-[8px] px-[24px]">
              {stats.taskStats.map((task: any) => {
                // Récupérer dynamiquement les métriques numériques disponibles
                const getAllMetricsInTask = (taskData: any) => {
                  const taskTitle = taskData.taskTitle || '';
                  const isPostTest = taskTitle === 'Questions Post-Test' || taskTitle.includes('Questions Post-Test');
                  const isDiscovery = taskTitle.includes('Découverte');
                  const isBonus = taskTitle.includes('Créer un assistant') || taskTitle.includes('BONUS');
                  
                  const allMetricKeys = Object.keys(metricConfig);
                  return allMetricKeys.filter(metricId => {
                    const value = taskData[metricId];
                    if (typeof value !== 'number') return false;
                    
                    // Pour la tâche Découverte : afficher seulement valuePropositionClarity et firstImpression
                    if (isDiscovery) {
                      return metricId === 'valuePropositionClarity' || metricId === 'firstImpression';
                    }
                    
                    // Pour Questions Post-Test et tâches bonus : ne pas afficher ease
                    if (metricId === 'ease' && (isPostTest || isBonus)) {
                      return false;
                    }
                    
                    // Pour les autres tâches : ne pas afficher valuePropositionClarity et firstImpression
                    if (metricId === 'valuePropositionClarity' || metricId === 'firstImpression') {
                      return false;
                    }
                    
                    return true;
                  });
                };
                
                // Obtenir la valeur dominante d'une métrique catégorielle
                const getDominantValue = (distribution: Record<string, number>) => {
                  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
                  if (entries.length === 0) return null;
                  const [key] = entries[0];
                  return key;
                };
                
                const metricsToShow = getAllMetricsInTask(task);
                
                // Détection de la tâche de découverte (cohérent avec getAllMetricsInTask)
                const taskTitle = task.taskTitle || '';
                const isDiscoveryTask = taskTitle.includes('Découverte');
                
                // Log pour debug Phase de découverte
                if (isDiscoveryTask) {
                  console.log(`🔍 Phase de découverte détectée:`, {
                    taskId: task.taskId,
                    taskTitle: task.taskTitle,
                    metricsToShow,
                    valuePropositionClarity: task.valuePropositionClarity,
                    firstImpression: task.firstImpression
                  });
                }
                
                // Métriques catégorielles importantes : durée, fluidité et autonomie
                // Pas de ces métriques pour la Phase de découverte
                const duration = (!isDiscoveryTask && task.duration) ? getDominantValue(task.duration) : null;
                const pathFluidity = (!isDiscoveryTask && task.pathFluidity) ? getDominantValue(task.pathFluidity) : null;
                const autonomy = (!isDiscoveryTask && task.autonomy) ? getDominantValue(task.autonomy) : null;
                
                // Log pour debug
                if (task.taskId === 2 || task.taskId === 3) {
                  console.log(`🎯 Tâche ${task.taskId} (${task.taskTitle}):`, {
                    autonomyDistribution: task.autonomy,
                    autonomyDominante: autonomy,
                    duration,
                    pathFluidity
                  });
                }
                
                return (
                  <div key={task.taskId} className="py-3 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs text-[var(--muted-foreground)]">#{task.taskId}</span>
                        <span className="text-[var(--foreground)] truncate">{task.taskTitle}</span>
                      </div>
                      {/* Pas de taux de réussite pour la Phase de découverte */}
                      {!isDiscoveryTask && (
                      <Badge 
                        variant={task.successRate >= 80 ? "default" : task.successRate >= 60 ? "secondary" : "destructive"}
                        className={task.successRate >= 80 ? 'bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]' : task.successRate >= 60 ? 'bg-[var(--info)] text-[var(--info-foreground)] hover:bg-[var(--info)]' : ''}
                      >
                        {task.successRate.toFixed(0)}%
                      </Badge>
                      )}
                    </div>
                    
                    {/* Ligne compacte avec toutes les métriques */}
                    <div className="flex items-center gap-4 flex-wrap text-sm">
                      {/* Métriques numériques */}
                      {metricsToShow.map((metricId: string) => {
                        const metricValue = task[metricId as keyof TaskResult];
                        if (typeof metricValue !== 'number') return null;
                        
                        const config = metricConfig[metricId];
                        if (!config) return null;
                        
                        const IconComponent = config.icon;
                        
                        return (
                          <div key={metricId} className="flex items-center gap-1.5">
                            <IconComponent className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                            <span className="text-xs text-[var(--muted-foreground)]">{config.label}:</span>
                            <span className={`${getMetricColor(metricValue)}`}>
                              {metricValue.toFixed(1)}
                            </span>
                          </div>
                        );
                      })}
                      
                      {/* Durée */}
                      {duration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {durationLabels[duration] || duration}
                          </span>
                        </div>
                      )}
                      
                      {/* Fluidité */}
                      {pathFluidity && (
                        <div className="flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {pathFluidityLabels[pathFluidity] || pathFluidity}
                          </span>
                        </div>
                      )}
                      
                      {/* Autonomie */}
                      {autonomy && (
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                          <span className={`text-xs ${
                            autonomy === 'autonomous' ? 'text-[var(--success)]' :
                            autonomy === 'minimal-help' ? 'text-[var(--warning)]' :
                            'text-[var(--destructive)]'
                          }`}>
                            {autonomyLabels[autonomy] || autonomy}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION 6: SESSIONS DÉTAILLÉES */}
          {/* ============================================ */}
          <div id="section-sessions" className="bg-white border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
            <div className="p-6 border-b-2 border-[var(--accent)] bg-[var(--accent)]">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/20 rounded-[var(--radius)]">
                  <Users className="w-6 h-6 text-[var(--accent-foreground)]" />
                </div>
                <div>
                  <h2 className="text-[var(--accent-foreground)]">Sessions d��taillées</h2>
                  <p className="text-[var(--accent-foreground)]/70">Cliquez pour voir les détails de chaque session</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <Accordion type="single" collapsible className="w-full space-y-3">
                {sessions.map((session) => (
                  <AccordionItem key={session.id} value={`session-${session.id}`} className="border border-[var(--border)] rounded-[var(--radius)] bg-[var(--card)]">
                    <div 
                      className="flex items-center px-4 p-[16px] cursor-pointer hover:bg-[var(--muted)]/30 transition-colors"
                      onClick={(e) => {
                        // Trouver l'AccordionTrigger et simuler son clic
                        const trigger = e.currentTarget.querySelector('[data-accordion-trigger]');
                        if (trigger && e.target === e.currentTarget || 
                            e.target instanceof HTMLElement && !e.target.closest('[data-dropdown-menu]') && !e.target.closest('button')) {
                          (trigger as HTMLElement).click();
                        }
                      }}
                    >
                      {/* Left: Name and Date */}
                      <div className="flex flex-col items-start flex-1">
                        <span className="text-[var(--foreground)]">{session.participant.name}</span>
                        <span className="text-[var(--muted-foreground)]">{new Date(session.date).toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      
                      {/* Right: Badges */}
                      <div className="flex items-center gap-2 mr-2">
                        <Badge variant="secondary" className="bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30">{session.participant.role}</Badge>
                        {session.recordingUrl && (
                          <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-violet-200 flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            Vidéo
                          </Badge>
                        )}
                      </div>
                      
                      {/* Chevron */}
                      <AccordionTrigger className="hover:no-underline w-auto mr-2" data-accordion-trigger />
                      
                      {/* Quick Actions Menu */}
                      <div onClick={(e) => e.stopPropagation()} data-dropdown-menu>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[var(--muted)]">
                              <span className="sr-only">Actions</span>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
                                <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                                <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-[var(--border)]">
                            {!isReadOnly && (
                              <>
                                <DropdownMenuItem onClick={() => onEditSession(session.id)} className="cursor-pointer">
                                  <FileText className="w-4 h-4 mr-2" />
                                  Modifier la session
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUploadRecording(session.id)} className="cursor-pointer">
                                  {session.recordingUrl ? (
                                    <>
                                      <Video className="w-4 h-4 mr-2" />
                                      Modifier l'enregistrement
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Ajouter un enregistrement
                                    </>
                                  )}
                                </DropdownMenuItem>
                                {session.recordingUrl && (
                                  <DropdownMenuItem 
                                    onClick={() => deleteRecording(session.id)}
                                    className="cursor-pointer text-[var(--warning)] focus:text-[var(--warning)] focus:bg-[var(--warning)]/10"
                                  >
                                    <XIcon className="w-4 h-4 mr-2" />
                                    Supprimer l'enregistrement
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            <DropdownMenuItem onClick={() => exportSessionToPDF(session)} className="cursor-pointer">
                              <Download className="w-4 h-4 mr-2" />
                              Exporter en PDF
                            </DropdownMenuItem>
                            {!isReadOnly && (
                              <DropdownMenuItem 
                                onClick={() => deleteSession(session.id)}
                                className="cursor-pointer text-[var(--destructive)] focus:text-[var(--destructive)] focus:bg-[var(--destructive)]/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer la session
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <AccordionContent>
                      <div className="space-y-4 pt-4 px-4 pb-4">
                        {/* Recording Section */}
                        {session.recordingUrl && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                              <Video className="w-4 h-4" />
                              <span className="text-sm">Enregistrement de la session</span>
                            </div>
                            <div className="bg-black rounded-[var(--radius)] overflow-hidden">
                              <VideoPlayer
                                ref={(ref) => (videoPlayerRefs.current[session.id] = ref)}
                                src={session.recordingUrl}
                                className="w-full max-h-[400px]"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm p-3 bg-[var(--muted)]/30 rounded-[var(--radius)] border border-[var(--border)] flex-wrap">
                          <div>
                            <span className="text-[var(--muted-foreground)]">Métier / Secteur: </span>
                            <Badge variant="outline">{session.participant.role}</Badge>
                          </div>
                          {session.participant.aiToolsEase && (
                            <div>
                              <span className="text-[var(--muted-foreground)]">Aisance IA: </span>
                              <Badge variant="outline">
                                {session.participant.aiToolsEase === 'expert' && 'Expert'}
                                {session.participant.aiToolsEase === 'intermediate' && 'Intermédiaire'}
                                {session.participant.aiToolsEase === 'novice' && 'Novice'}
                                {session.participant.aiToolsEase === 'none' && 'Aucune'}
                              </Badge>
                            </div>
                          )}
                          {session.participant.department && (
                            <div>
                              <span className="text-[var(--muted-foreground)]">Département: </span>
                              <Badge variant="outline">{session.participant.department}</Badge>
                            </div>
                          )}
                          {session.participant.aliviaFrequency && (
                            <div>
                              <span className="text-[var(--muted-foreground)]">Fréquence Alivia: </span>
                              <Badge variant="outline">
                                {session.participant.aliviaFrequency === 'daily' && 'Quotidien'}
                                {session.participant.aliviaFrequency === 'weekly' && 'Hebdomadaire'}
                                {session.participant.aliviaFrequency === 'monthly' && 'Mensuel'}
                                {session.participant.aliviaFrequency === 'rarely' && 'Rarement'}
                                {session.participant.aliviaFrequency === 'first-time' && 'Première fois'}
                              </Badge>
                            </div>
                          )}
                          <div>
                            <span className="text-[var(--muted-foreground)]">Tâches réussies: </span>
                            <span className="text-[var(--foreground)]">
                              {session.tasks.filter(t => t.success).length}/{session.tasks.length}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                        {session.tasks.map((task, idx) => (
                          <div key={idx} className={`border-l-4 ${task.success ? 'border-green-500' : 'border-red-500'} pl-4 py-2 bg-[var(--muted)]/20 rounded-r-[var(--radius)] space-y-2 ${task.skipped ? 'border-amber-400 opacity-75' : ''}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {task.skipped ? (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                                    Non effectuée
                                  </Badge>
                                ) : (
                                  <Badge variant={task.success ? "default" : "destructive"} className={task.success ? 'bg-green-600' : ''}>
                                    {task.success ? 'Réussite' : 'Échec'}
                                  </Badge>
                                )}
                                <span className="text-xs text-[var(--muted-foreground)]">#{task.taskId}</span>
                                <span className="text-[var(--foreground)]">{removeEmojis(task.title)}</span>
                              </div>
                            </div>
                            
                            {/* Affichage dynamique des métriques */}
                            {!task.skipped && (() => {
                              // Récupérer dynamiquement toutes les métriques numériques disponibles
                              const allMetricKeys = Object.keys(metricConfig);
                              const allowedMetrics = allMetricKeys.filter(metricId => {
                                // La métrique "ease" (Facilité) ne s'affiche PAS pour : 
                                // - Découverte du produit (tâche 1)
                                // - Questions Post-Test
                                // - Créer un assistant (tâche bonus)
                                const isPostTest = task.title?.includes('Questions Post-Test');
                                const isDiscovery = task.taskId === 1 || task.title?.includes('Découverte');
                                const isBonus = task.title?.includes('Créer un assistant') || task.title?.includes('BONUS');
                                
                                if (metricId === 'ease' && (isDiscovery || isPostTest || isBonus)) {
                                  return false;
                                }
                                
                                // Les métriques "valuePropositionClarity" et "firstImpression" s'affichent UNIQUEMENT pour la tâche 1
                                if ((metricId === 'valuePropositionClarity' || metricId === 'firstImpression') && !isDiscovery) {
                                  return false;
                                }
                                
                                const value = task[metricId as keyof TaskResult];
                                return typeof value === 'number';
                              });
                              
                              return (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              {task.duration && (
                                <div>
                                  <span className="text-[var(--muted-foreground)]">Durée: </span>
                                  <span className="text-[var(--foreground)]">{durationLabels[task.duration] || task.duration}</span>
                                </div>
                              )}
                              {task.autonomy && (
                                <div>
                                  <span className="text-[var(--muted-foreground)]">Autonomie: </span>
                                  <span className="text-[var(--foreground)]">{autonomyLabels[task.autonomy] || task.autonomy}</span>
                                </div>
                              )}
                              {task.pathFluidity && (
                                <div>
                                  <span className="text-[var(--muted-foreground)]">Fluidité: </span>
                                  <span className="text-[var(--foreground)]">{pathFluidityLabels[task.pathFluidity] || task.pathFluidity}</span>
                                </div>
                              )}
                              {task.emotionalReaction && (
                                <div>
                                  <span className="text-[var(--muted-foreground)]">Réaction: </span>
                                  <span className="text-[var(--foreground)]">{emotionalReactionLabels[task.emotionalReaction] || task.emotionalReaction}</span>
                                </div>
                              )}
                              {task.searchMethod && (
                                <div>
                                  <span className="text-[var(--muted-foreground)]">Méthode: </span>
                                  <span className="text-[var(--foreground)]">{searchMethodLabels[task.searchMethod] || task.searchMethod}</span>
                                </div>
                              )}
                              
                              {/* Métriques numériques (affichées UNIQUEMENT si dans le protocole actuel) */}
                              {allowedMetrics.map((metricId: string) => {
                                const value = task[metricId as keyof TaskResult];
                                if (typeof value !== 'number') return null;
                                
                                const config = metricConfig[metricId];
                                if (!config) return null;
                                
                                return (
                                  <div key={metricId}>
                                    <span className="text-[var(--muted-foreground)]">{config.label}: </span>
                                    <span className={getMetricColor(value)}>{value}/10</span>
                                  </div>
                                );
                              })}
                            </div>
                              );
                            })()}

                            {/* Notes de la tâche */}
                            {task.notes && (
                              <p className="text-sm text-[var(--foreground)] italic bg-[var(--muted)]/30 p-3 rounded-[var(--radius)] border border-[var(--border)]">
                                "{task.notes}"
                              </p>
                            )}

                            {/* Affichage des questions post-test (UNIQUEMENT pour la tâche "Questions Post-Test") */}
                            {(task.title === 'Questions Post-Test' || task.title?.includes('Questions Post-Test')) && (task.postTestFrustrations || task.postTestDataStorage || task.postTestPracticalUse || (task.postTestAdoption !== undefined && task.postTestAdoption !== null)) && (
                              <div className="mt-2 p-3 bg-violet-50 rounded-[var(--radius)] border border-violet-200 space-y-2">
                                <div className="text-sm font-semibold text-violet-700 mb-2">📋 Questions Post-Test</div>
                                {task.postTestFrustrations && (
                                  <div className="text-sm">
                                    <span className="text-red-700 font-medium">• Points frustrants: </span>
                                    <span className="text-red-900">{task.postTestFrustrations}</span>
                                  </div>
                                )}
                                {task.postTestDataStorage && (
                                  <div className="text-sm">
                                    <span className="text-[var(--muted-foreground)] font-medium">• Souveraineté des données: </span>
                                    <span className="text-[var(--foreground)]">{task.postTestDataStorage}</span>
                                  </div>
                                )}
                                {task.postTestPracticalUse && (
                                  <div className="text-sm">
                                    <span className="text-[var(--muted-foreground)] font-medium">• Valeur perçue (usage quotidien): </span>
                                    <span className="text-[var(--foreground)]">{task.postTestPracticalUse}</span>
                                  </div>
                                )}
                                {task.postTestAdoption !== undefined && task.postTestAdoption !== null && (
                                  <div className="text-sm bg-gradient-to-r from-purple-50 to-blue-50 p-2 rounded border border-purple-200 mt-2">
                                    <span className="text-purple-700 font-semibold">⭐ Score d'adoption: </span>
                                    <span className={`font-bold ${
                                      task.postTestAdoption >= 8 ? 'text-green-700' : 
                                      task.postTestAdoption >= 6 ? 'text-purple-700' : 
                                      task.postTestAdoption >= 4 ? 'text-yellow-700' :
                                      'text-red-700'
                                    }`}>{task.postTestAdoption}/10</span>
                                    <span className="text-purple-600 text-xs ml-1">(usage quotidien envisagé)</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        </div>

                        {session.generalObservations && (
                          <div className="mt-4 p-4 bg-[var(--muted)]/20 border border-[var(--border)] rounded-[var(--radius)]">
                            <h4 className="text-[var(--foreground)] mb-2">Observations générales</h4>
                            <p className="text-[var(--muted-foreground)] text-sm">{session.generalObservations}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </>
      )}

      {/* Video URL Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              {videoUrl ? 'Modifier l\'enregistrement' : 'Ajouter un enregistrement'}
            </DialogTitle>
            <DialogDescription>
              Ajoutez le lien de votre vidéo Google Drive, YouTube ou autre plateforme.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="video-url" className="flex items-center gap-2">
                URL de la vidéo *
                <Badge variant="secondary" className="text-xs">Google Drive, YouTube, Vimeo...</Badge>
              </Label>
              <Input
                id="video-url"
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="font-mono text-sm"
                autoFocus
              />
              <div className="space-y-1">
                <p className="text-xs text-[var(--muted-foreground)]">
                  💡 <strong>Google Drive:</strong> Partagez la vidéo → "Toute personne disposant du lien" → Copiez le lien
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  💡 <strong>YouTube:</strong> Utilisez l'URL de la vidéo (publique ou non répertoriée)
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              disabled={isUploading}
            >
              Annuler
            </Button>
            <Button
              onClick={submitRecording}
              disabled={!videoUrl.trim() || isUploading}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}