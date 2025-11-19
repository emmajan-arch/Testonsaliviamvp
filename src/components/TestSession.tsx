import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { Save, Trash2, PlayCircle, CheckCircle2, Lightbulb, ChevronLeft, ChevronRight, ChevronDown, MessageSquare, Cloud, FileText, Zap, Sparkles, Eye, Clock, User, Users, Activity, Smile, Frown, Search, ThumbsUp, HelpCircle, XCircle } from 'lucide-react';
import { saveSession as saveToSupabase } from '../utils/supabase/sessions';
import { getProtocolFromSupabase } from '../utils/supabase/protocol';

interface TaskResult {
  taskId: number;
  title: string;
  success: boolean;
  duration?: string;
  autonomy?: string;
  pathFluidity?: string;
  emotionalReaction?: string;
  errorsCount?: number;
  hesitations?: number;
  notes: string;
  verbatim?: string;
  taskVerbatimsPositive?: string;
  taskVerbatimsNegative?: string;
  ease?: number; // Métrique numérique standard (échelle 1-10)
  searchMethod?: string[]; // Méthode de recherche (array pour sélection multiple)
  sourcesUnderstanding?: number;
  confidenceLevel?: number;
  valuePropositionClarity?: number;
  firstImpression?: number;
  postTestImpression?: string;
  postTestLiked?: string;
  postTestFrustrations?: string;
  postTestDataStorage?: string;
  postTestPracticalUse?: string;
  postTestAdoption?: number; // Score d'adoption (échelle 1-10) : "A quel point vous voyez utiliser le produit au quotidien ?"
  customMetrics?: Record<string, any>;
  skipped?: boolean; // Pour marquer une tâche comme non effectuée (optionnelle)
}

interface TestSessionProps {
  onSessionComplete: () => void;
  editingSessionId?: number | null;
  isReadOnly?: boolean;
}

const defaultTestTasks = [
  {
    id: 1,
    title: 'Phase de découverte',
    icon: 'Search',
    description: 'Observer la compréhension initiale de l\'interface',
    scenario: 'Vous arrivez pour la première fois sur Alivia. Sans consigne, explorez et décrivez ce que vous comprenez de ce produit.',
    tasks: [
      'Compréhension des rôles des assistants',
      'Lisibilité de l\'interface',
      'Confiance dans la souveraineté des données',
    ],
    metrics: [
      'Compréhension globale',
      'Temps de découverte',
      'Impression initiale',
    ],
    tip: 'Laissez le participant explorer librement pendant 2-3 minutes sans intervention. Notez ses premiers mots, ses gestes (scroll, clics, hésitations). C\'est le moment clé pour capturer l\'impression brute.',
    metricsFields: ['valuePropositionClarity', 'firstImpression', 'notes']
  },
  {
    id: 2,
    title: 'Trouver le bon assistant',
    icon: 'Compass',
    description: 'Capacité à identifier l\'assistant pertinent',
    scenario: 'Votre manager vous demande de retrouver un rapport RH interne. Montrez-moi comment vous vous y prendriez.',
    tasks: [
      'Utilisation de la recherche ou du catalogue d\'assistants',
      'Capacité à identifier l\'assistant pertinent',
      'Temps de décision et critères utilisés',
    ],
    metrics: [
      'Sur une échelle de 1 à 10, à quel point cette action vous a semblé facile ?',
    ],
    tip: 'Observez si le participant utilise spontanément la barre de recherche ou préfère naviguer visuellement dans le catalogue. Notez les mots-clés qu\'il cherche et s\'il comprend les descriptions des assistants.',
    metricsFields: ['taskVerbatimsPositive', 'taskVerbatimsNegative', 'success', 'duration', 'autonomy', 'pathFluidity', 'emotionalReaction', 'searchMethod', 'notes', 'ease']
  },
  {
    id: 3,
    title: 'Envoyer une requête & obtenir une réponse',
    icon: 'Send',
    description: 'Première interaction concrète avec l\'assistant',
    scenario: 'Vous avez sélectionné l\'assistant RH. Posez-lui une question sur les congés payés et observez la réponse.',
    tasks: [
      'Clarté de la zone de saisie',
      'Compréhension de l\'interaction chat',
      'Temps de réponse perçu (attente acceptable ou non)',
      'Lisibilité et pertinence de la réponse',
    ],
    metrics: [
      'Facilité d\'interaction',
      'Qualité perçue de la réponse',
      'Fluidité de l\'échange',
    ],
    tip: 'C\'est le moment où le participant vit réellement la valeur du produit. Observez sa réaction à la première réponse : surprise, satisfaction, scepticisme ? Note-t-il la vitesse de réponse ? Lit-il la réponse en entier ?',
    metricsFields: ['taskVerbatimsPositive', 'taskVerbatimsNegative', 'success', 'duration', 'autonomy', 'pathFluidity', 'emotionalReaction', 'notes', 'ease']
  },
  {
    id: 4,
    title: 'Vérifier la confiance dans la réponse',
    icon: 'ShieldCheck',
    description: 'Transparence et traçabilité des sources',
    scenario: 'L\'assistant vient de vous donner une réponse. Comment vérifiez-vous la source de cette information ?',
    tasks: [
      'Transparence des citations/sources',
      'Sentiment de confiance ou doute',
      'Facilité d\'accès aux sources',
    ],
    metrics: [
      'Transparence',
      'Niveau de confiance',
      'Traçabilité',
    ],
    tip: 'Enjeu majeur de confiance : le participant voit-il spontanément les sources citées ? Clique-t-il dessus pour vérifier ? Exprime-t-il un sentiment de sécurité ("OK, je peux faire confiance, c\'est sourcé") ?',
    metricsFields: ['taskVerbatimsPositive', 'taskVerbatimsNegative', 'success', 'duration', 'autonomy', 'pathFluidity', 'emotionalReaction', 'notes', 'ease']
  },
  {
    id: 5,
    title: 'Changer d\'assistant',
    icon: 'RefreshCw',
    description: 'Clarté de la navigation entre assistants',
    scenario: 'Vous réalisez que l\'assistant choisi n\'est pas le bon. Comment faites-vous pour en changer ?',
    tasks: [
      'Clarté de la navigation',
      'Sentiment de perte de contexte ou non',
      'Fluidité du changement',
    ],
    metrics: [
      'Facilité de navigation',
      'Conservation du contexte',
      'Rapidité',
    ],
    tip: 'Attention : c\'est ici qu\'on teste si le retour arrière est intuitif. Le participant cherche-t-il un bouton "Retour", un menu, ou clique-t-il sur le logo ? Observez son niveau de frustration ou de confiance.',
    metricsFields: ['taskVerbatimsPositive', 'taskVerbatimsNegative', 'success', 'duration', 'autonomy', 'pathFluidity', 'emotionalReaction', 'notes', 'ease']
  },
  {
    id: 6,
    title: 'Paramétrer un assistant',
    icon: 'Settings',
    description: 'Compréhension et utilisation des paramètres',
    scenario: 'Configurez un assistant pour répondre en anglais, uniquement à partir de la documentation interne, pas d\'internet.',
    tasks: [
      'Compréhension des paramètres disponibles',
      'Fluidité de l\'action',
      'Frustrations ou options manquantes',
    ],
    metrics: [
      'Clarté des options',
      'Facilité de configuration',
      'Succès de la tâche',
    ],
    tip: 'Vérifiez si le participant comprend l\'impact de chaque paramètre. Pose-t-il des questions du type "Si je désactive internet, où va-t-il chercher l\'info ?" ? C\'est un indicateur de compréhension du modèle mental.',
    metricsFields: ['taskVerbatimsPositive', 'taskVerbatimsNegative', 'success', 'duration', 'autonomy', 'pathFluidity', 'emotionalReaction', 'notes', 'ease']
  },
  {
    id: 7,
    title: 'Choisir les sources nécessaires',
    icon: 'FolderOpen',
    description: 'Capacité à filtrer et sélectionner les sources',
    scenario: 'Vous voulez que l\'assistant se base uniquement sur 2 répertoires internes précis. Comment procédez-vous ?',
    tasks: [
      'Capacité à filtrer/choisir les sources',
      'Compréhension du rôle des sources dans la réponse',
      'Clarté de l\'interface de sélection',
    ],
    metrics: [
      'Facilité de sélection',
      'Compréhension du système',
      'Efficacité',
    ],
    tip: 'Point crucial pour la souveraineté des données : le participant comprend-il qu\'en sélectionnant des sources spécifiques, il contrôle d\'où vient l\'information ? C\'est un élément de différenciation clé d\'Alivia.',
    metricsFields: ['taskVerbatimsPositive', 'taskVerbatimsNegative', 'success', 'duration', 'autonomy', 'pathFluidity', 'emotionalReaction', 'notes', 'ease']
  },
  {
    id: 8,
    title: 'Trouver l\'historique',
    icon: 'History',
    description: 'Retrouver et continuer une conversation',
    scenario: 'Retrouvez la conversation que vous avez eue hier avec un assistant et continuez-la.',
    tasks: [
      'Capacité à retrouver un historique',
      'Compréhension du fil / continuité des conversations',
      'Facilité de reprise',
    ],
    metrics: [
      'Découvrabilité de l\'historique',
      'Clarté du fil',
      'Continuité',
    ],
    tip: 'Testez si l\'historique est facilement accessible (icône, menu, sidebar ?). Le participant doit-il chercher longtemps ? Une fois trouvé, comprend-il comment reprendre là où il s\'était arrêté ?',
    metricsFields: ['taskVerbatimsPositive', 'taskVerbatimsNegative', 'success', 'duration', 'autonomy', 'pathFluidity', 'emotionalReaction', 'notes', 'ease']
  },
  {
    id: 9,
    title: 'Questions Post-Test',
    icon: 'MessageSquare',
    description: 'Débriefing à chaud et retour d\'expérience global',
    scenario: 'Prenez 10-15 minutes pour recueillir le retour d\'expérience du participant sur l\'ensemble du test.',
    tasks: [
      'Points frustrants ou bloquants',
      'Compréhension de la souveraineté des données',
      'Valeur perçue dans le quotidien professionnel',
      'Score d\'adoption global',
    ],
    metrics: [
      'Facilité',
      'Satisfaction globale',
      'Clarté de la value proposition',
      'Intention d\'usage',
    ],
    tip: 'C\'est le moment de synthèse : laissez le participant s\'exprimer librement. Encouragez-le à partager ses vraies impressions sans filtre. Les insights les plus précieux viennent souvent ici.',
    metricsFields: ['postTestQuestions', 'notes']
  },
  {
    id: 10,
    title: 'Créer un assistant',
    icon: 'PlusCircle',
    description: 'Processus de création d\'un nouvel assistant (Tâche facultative)',
    scenario: 'Créez un nouvel assistant dédié aux documents financiers Polycea.',
    tasks: [
      'Logique suivie pour créer',
      'Compréhension du processus (sources, langue, nom, rôle)',
      'Sentiment de complexité vs simplicité',
    ],
    metrics: [
      'Intuitivité du processus',
      'Compréhension des étapes',
      'Satisfaction',
    ],
    tip: 'Cette tâche est plus avancée et facultative : observez l\'ordre des étapes choisies par le participant (nom > sources > langue ou autre ?). Notez s\'il se sent perdu ou au contraire guidé par l\'interface.',
    metricsFields: ['taskVerbatimsPositive', 'taskVerbatimsNegative', 'success', 'duration', 'autonomy', 'pathFluidity', 'emotionalReaction', 'notes', 'ease'],
    optional: true
  }
];

export function TestSession({ onSessionComplete, editingSessionId, isReadOnly = false }: TestSessionProps) {
  const [isTipsOpen, setIsTipsOpen] = useState(true);
  const [isTaskContextOpen, setIsTaskContextOpen] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fonction pour nettoyer les tâches et s'assurer que :
  // - "Questions Post-Test" n'est JAMAIS optionnelle
  // - "Créer un assistant" est TOUJOURS optionnelle
  const cleanTasks = (tasks: any[]) => {
    return tasks.map(task => {
      // Forcer "Questions Post-Test" à NE JAMAIS être optionnelle
      if (task.title === 'Questions Post-Test' || task.title?.includes('Questions Post-Test')) {
        const { optional, ...cleanedTask } = task;
        return cleanedTask;
      }
      // Forcer "Créer un assistant" (tâche 10) à TOUJOURS être optionnelle
      if (task.title?.includes('Créer un assistant')) {
        return { ...task, optional: true };
      }
      return task;
    });
  };

  const [testTasks, setTestTasks] = useState(() => {
    const saved = localStorage.getItem('protocolTasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return cleanTasks(parsed);
      } catch (e) { console.error(e); }
    }
    return defaultTestTasks;
  });

  const [participant, setParticipant] = useState(() => {
    const saved = localStorage.getItem('currentSession');
    return saved ? (JSON.parse(saved).participant || { name: '', role: '', experience: '', aiToolsFrequency: '', aiToolsEase: '', aliviaFrequency: '' }) : { name: '', role: '', experience: '', aiToolsFrequency: '', aiToolsEase: '', aliviaFrequency: '' };
  });
  
  const [isParticipantRegistered, setIsParticipantRegistered] = useState(() => {
    const saved = localStorage.getItem('currentSession');
    return saved ? (JSON.parse(saved).isParticipantRegistered || false) : false;
  });

  const [sessionStarted, setSessionStarted] = useState(() => {
    const saved = localStorage.getItem('currentSession');
    return saved ? (JSON.parse(saved).sessionStarted || false) : false;
  });

  useEffect(() => {
    const loadTasks = async () => {
      // NE PAS recharger les tâches si une session est en cours
      if (sessionStarted) {
        console.log('⏸️ Session active - rechargement des tâches désactivé');
        return;
      }
      
      try {
        const data = await getProtocolFromSupabase();
        if (data?.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
          console.log('✅ TestSession: Tâches chargées depuis Supabase');
          const cleaned = cleanTasks(data.tasks);
          setTestTasks(cleaned);
          localStorage.setItem('protocolTasks', JSON.stringify(cleaned));
          return;
        }
      } catch (error) { console.error(error); }

      const saved = localStorage.getItem('protocolTasks');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setTestTasks(cleanTasks(parsed));
          else setTestTasks(defaultTestTasks);
        } catch (e) { setTestTasks(defaultTestTasks); }
      } else setTestTasks(defaultTestTasks);
    };
    
    // Charger une seule fois au démarrage si aucune session active
    if (!sessionStarted) {
      loadTasks();
    }
    
    const handleStorageChange = () => { 
      if (!sessionStarted) loadTasks(); 
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      if (!sessionStarted) loadTasks();
    }, 5000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [sessionStarted]);

  const [currentTask, setCurrentTask] = useState(() => {
    const saved = localStorage.getItem('currentSession');
    return saved ? (JSON.parse(saved).currentTask || 0) : 0;
  });

  const [taskResults, setTaskResults] = useState<TaskResult[]>(() => {
    const saved = localStorage.getItem('currentSession');
    return saved ? (JSON.parse(saved).taskResults || []) : [];
  });

  const [currentTaskData, setCurrentTaskData] = useState<TaskResult>(() => {
    const saved = localStorage.getItem('currentSession');
    if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.currentTaskData || createEmptyResult(testTasks[0]);
    }
    return createEmptyResult(testTasks[0]);
  });

  function createEmptyResult(task: any): TaskResult {
      if (!task) return {} as any;
      
      // Détection du type de tâche pour initialiser les bonnes métriques
      const isDiscovery = task.id === 1 || task.title?.includes('Découverte');
      const isPostTest = task.title?.includes('Questions Post-Test');
      const isBonus = task.title?.includes('Créer un assistant') || task.title?.includes('BONUS');
      
      return {
        taskId: task.id,
        title: task.title,
        success: true,
        duration: '',
        autonomy: '',
        pathFluidity: '',
        emotionalReaction: '',
        errorsCount: 0,
        hesitations: 0,
        notes: '',
        verbatim: '',
        taskVerbatimsPositive: '',
        taskVerbatimsNegative: '',
        // Ease uniquement pour les tâches 2-8 et 10 (pas découverte, pas post-test, pas bonus si bonus)
        ease: (!isDiscovery && !isPostTest && !isBonus) ? 5 : undefined,
        searchMethod: [],
        sourcesUnderstanding: 5,
        confidenceLevel: 5,
        // Métriques spécifiques à la phase de découverte
        valuePropositionClarity: isDiscovery ? 5 : undefined,
        firstImpression: isDiscovery ? 5 : undefined,
        postTestImpression: '',
        postTestLiked: '',
        postTestFrustrations: '',
        postTestDataStorage: '',
        postTestPracticalUse: '',
        postTestAdoption: isPostTest ? 5 : undefined,
        customMetrics: {}
      };
  }

  const [generalObservations, setGeneralObservations] = useState(() => {
    const saved = localStorage.getItem('currentSession');
    return saved ? (JSON.parse(saved).generalObservations || '') : '';
  });

  useEffect(() => {
    if (editingSessionId) {
      const testSessions = JSON.parse(localStorage.getItem('testSessions') || '[]');
      const sessionToEdit = testSessions.find((s: any) => s.id === editingSessionId);
      if (sessionToEdit) {
        setParticipant(sessionToEdit.participant);
        setIsParticipantRegistered(true);
        setSessionStarted(true);
        
        // NETTOYAGE: Supprimer les champs post-test des tâches qui ne sont pas la tâche 9
        const cleanedTasks = sessionToEdit.tasks.map((task: TaskResult) => {
          console.log('🔍 DEBUG LOAD - Tâche:', task.taskId, 'postTestAdoption:', task.postTestAdoption);
          // Pas de nettoyage : les champs post-test ne s'affichent que sur la tâche 9
          return task;
        });
        
        setTaskResults(cleanedTasks);
        setGeneralObservations(sessionToEdit.generalObservations || '');
        const lastTaskIndex = cleanedTasks.length > 0 ? cleanedTasks.length - 1 : 0;
        setCurrentTask(lastTaskIndex);
        if (cleanedTasks[lastTaskIndex]) {
          let taskData = cleanedTasks[lastTaskIndex];
          // Pas de nettoyage : les champs post-test ne s'affichent que sur la tâche 9
          setCurrentTaskData(taskData);
        }
        toast.success('Session chargée pour modification');
      }
    }
  }, [editingSessionId]);

  useEffect(() => {
    const sessionState = { participant, isParticipantRegistered, sessionStarted, currentTask, taskResults, currentTaskData, generalObservations, editingSessionId };
    localStorage.setItem('currentSession', JSON.stringify(sessionState));
    
    // Debug: afficher le score d'adoption de currentTaskData
    if (currentTaskData.taskId === 9) {
      console.log('🔍 DEBUG currentTaskData - Score d\'adoption tâche 9:', currentTaskData.postTestAdoption);
    }
  }, [participant, isParticipantRegistered, sessionStarted, currentTask, taskResults, currentTaskData, generalObservations, editingSessionId]);

  const handleNextTask = () => {
    const updatedResults = [...taskResults];
    const existingIndex = updatedResults.findIndex(r => r.taskId === currentTaskData.taskId);
    if (existingIndex !== -1) updatedResults[existingIndex] = currentTaskData;
    else updatedResults.push(currentTaskData);
    setTaskResults(updatedResults);
    
    if (currentTask < testTasks.length - 1) {
      const nextTask = currentTask + 1;
      setCurrentTask(nextTask);
      const savedTaskData = updatedResults.find(r => r.taskId === testTasks[nextTask].id);
      let taskData = savedTaskData || createEmptyResult(testTasks[nextTask]);
      
      // Pas de nettoyage : les champs post-test ne s'affichent que sur la tâche 9
      
      setCurrentTaskData(taskData);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success(`Passage à la tâche ${nextTask + 1}`);
    }
  };

  const handlePreviousTask = () => {
    if (currentTask > 0) {
      const updatedResults = [...taskResults];
      const existingIndex = updatedResults.findIndex(r => r.taskId === currentTaskData.taskId);
      if (existingIndex !== -1) updatedResults[existingIndex] = currentTaskData;
      else updatedResults.push(currentTaskData);
      setTaskResults(updatedResults);
      
      const prevTask = currentTask - 1;
      setCurrentTask(prevTask);
      const savedTaskData = updatedResults.find(r => r.taskId === testTasks[prevTask].id);
      let taskData = savedTaskData || createEmptyResult(testTasks[prevTask]);
      
      // Les champs post-test ne s'affichent que sur la tâche 9, donc pas besoin de les nettoyer ailleurs
      // Le nettoyage précédent causait un bug : il écrasait le score d'adoption sauvegardé !
      
      setCurrentTaskData(taskData);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success(`Retour à la tâche ${prevTask + 1}`);
    }
  };

  const saveSession = async () => {
    console.log('💾 ===== DÉBUT SAUVEGARDE =====');
    console.log('📊 currentTaskData au moment du clic:', JSON.stringify(currentTaskData, null, 2));
    
    const updatedResults = [...taskResults];
    const existingIndex = updatedResults.findIndex(r => r.taskId === currentTaskData.taskId);
    if (existingIndex !== -1) updatedResults[existingIndex] = currentTaskData;
    else updatedResults.push(currentTaskData);

    // Debug: vérifier le score d'adoption avant sauvegarde
    const task9 = updatedResults.find(t => t.taskId === 9);
    console.log('🔍 DEBUG SAVE - Score d\'adoption tâche 9 avant sauvegarde:', task9?.postTestAdoption);
    console.log('🔍 DEBUG SAVE - Toutes les données tâche 9:', task9);

    const sessionData = { participant, tasks: updatedResults, generalObservations };
    try {
      if (editingSessionId) {
        console.log('🔄 MODE ÉDITION - Session ID:', editingSessionId);
        const { updateSession } = await import('../utils/supabase/sessions');
        const updatedSession = await updateSession(editingSessionId, sessionData);
        console.log('✅ Session mise à jour depuis le serveur:', updatedSession);
        const existingSessions = JSON.parse(localStorage.getItem('testSessions') || '[]');
        const sessionIndex = existingSessions.findIndex((s: any) => s.id === editingSessionId);
        console.log('📍 Index de la session dans localStorage:', sessionIndex);
        if (sessionIndex !== -1) {
          existingSessions[sessionIndex] = updatedSession;
          localStorage.setItem('testSessions', JSON.stringify(existingSessions));
          console.log('✅ localStorage mis à jour avec la session modifiée');
        } else {
          console.warn('⚠️ Session non trouvée dans localStorage, ajout...');
          existingSessions.push(updatedSession);
          localStorage.setItem('testSessions', JSON.stringify(existingSessions));
        }
        toast.success('Session mise à jour');
      } else {
        console.log('✨ MODE CRÉATION - Nouvelle session');
        const savedSession = await saveToSupabase(sessionData);
        console.log('✅ Nouvelle session créée:', savedSession);
        const existingSessions = JSON.parse(localStorage.getItem('testSessions') || '[]');
        localStorage.setItem('testSessions', JSON.stringify([...existingSessions, savedSession]));
        toast.success('Session enregistrée');
      }
      resetForm();
      onSessionComplete();
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      // Local backup - CORRECTED: Respecter le mode édition même en cas d'erreur
      if (editingSessionId) {
        // MODE ÉDITION : Mettre à jour la session existante
        console.log('💾 Sauvegarde locale en mode édition (erreur cloud)');
        const session = { id: editingSessionId, date: new Date().toISOString(), ...sessionData };
        const existingSessions = JSON.parse(localStorage.getItem('testSessions') || '[]');
        const sessionIndex = existingSessions.findIndex((s: any) => s.id === editingSessionId);
        if (sessionIndex !== -1) {
          existingSessions[sessionIndex] = session;
          localStorage.setItem('testSessions', JSON.stringify(existingSessions));
          toast.error('Session mise à jour localement (erreur cloud)');
        } else {
          toast.error('Erreur : Session introuvable');
        }
      } else {
        // MODE CRÉATION : Créer une nouvelle session
        console.log('💾 Sauvegarde locale en mode création (erreur cloud)');
        const session = { id: Date.now(), date: new Date().toISOString(), ...sessionData };
        const existingSessions = JSON.parse(localStorage.getItem('testSessions') || '[]');
        localStorage.setItem('testSessions', JSON.stringify([...existingSessions, session]));
        toast.error('Sauvegarde locale uniquement (erreur cloud)');
      }
      resetForm();
      onSessionComplete();
    }
  };

  const resetForm = () => {
    setParticipant({ name: '', role: '', experience: '', aiToolsFrequency: '', aiToolsEase: '', aliviaFrequency: '' });
    setIsParticipantRegistered(false);
    setSessionStarted(false);
    setCurrentTask(0);
    setTaskResults([]);
    setCurrentTaskData(createEmptyResult(testTasks[0]));
    setGeneralObservations('');
    localStorage.removeItem('currentSession');
  };

  const progress = ((currentTask + 1) / testTasks.length) * 100;
  const currentTaskObj = testTasks[currentTask];
  
  // UNIQUEMENT la tâche 10 (Questions Post-Test) affiche les questions post-test
  // On se base sur l'ID 10 car même si le titre est modifié dans le protocole, l'ID reste stable
  const isPostTestTask = currentTaskObj?.id === 10;
  
  // Seules les tâches marquées optional: true sont facultatives (tâche 10 "Créer un assistant")
  // On détecte par : propriété optional OU titre qui contient "Créer un assistant"
  const isOptionalTask = currentTaskObj?.optional === true || 
                         currentTaskObj?.title?.includes('Créer un assistant');

  const isTestMode = participant.name.toLowerCase().trim() === 'test';
  
  const goToTask = (taskIndex: number) => {
    // Empêcher la navigation vers la même tâche
    if (taskIndex === currentTask) return;
    
    console.log('🎯 Navigation vers la tâche', taskIndex + 1, 'depuis le mode test');
    
    // Sauvegarder la tâche actuelle avant de changer
    const updatedResults = [...taskResults];
    const existingIndex = updatedResults.findIndex(r => r.taskId === currentTaskData.taskId);
    if (existingIndex !== -1) updatedResults[existingIndex] = currentTaskData;
    else updatedResults.push(currentTaskData);
    setTaskResults(updatedResults);
    
    // Changer de tâche
    setCurrentTask(taskIndex);
    const savedTaskData = updatedResults.find(r => r.taskId === testTasks[taskIndex].id);
    let taskData = savedTaskData || createEmptyResult(testTasks[taskIndex]);
    
    // Pas de nettoyage : les champs post-test ne s'affichent que sur la tâche 9
    
    setCurrentTaskData(taskData);
    
    // Scroll vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isParticipantRegistered) {
    return (
      <div className="container mx-auto max-w-2xl py-10">
        <Card className="border-[var(--border)] shadow-lg">
          <CardHeader className="bg-[var(--card)] border-b border-[var(--border)]">
            <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
              <Users className="h-6 w-6 text-[var(--accent)]" />
              Informations Participant
            </CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">Avant de démarrer, merci de renseigner ces informations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom et prénom *</Label>
              <Input 
                id="name" 
                value={participant.name} 
                onChange={(e) => setParticipant({...participant, name: e.target.value})}
                placeholder="Ex: Marie Dupont"
                disabled={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Poste / Rôle</Label>
              <Input 
                id="role" 
                value={participant.role} 
                onChange={(e) => setParticipant({...participant, role: e.target.value})}
                placeholder="Ex: Product Manager, UX Researcher..."
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiToolsFrequency">Fréquence d'utilisation d'outils IA (ChatGPT, Copilot...)</Label>
              <Select value={participant.aiToolsFrequency} onValueChange={(v) => setParticipant({...participant, aiToolsFrequency: v})} disabled={isReadOnly}>
                <SelectTrigger id="aiToolsFrequency">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidiennement</SelectItem>
                  <SelectItem value="weekly">Plusieurs fois par semaine</SelectItem>
                  <SelectItem value="monthly">De temps en temps</SelectItem>
                  <SelectItem value="never">Jamais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiToolsEase">Aisance avec les outils IA</Label>
              <Select value={participant.aiToolsEase} onValueChange={(v) => setParticipant({...participant, aiToolsEase: v})} disabled={isReadOnly}>
                <SelectTrigger id="aiToolsEase">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expert">Expert (maîtrise avancée du prompting)</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire (usage régulier, bonnes bases)</SelectItem>
                  <SelectItem value="beginner">Débutant (usage basique, peu d'expérience)</SelectItem>
                  <SelectItem value="none">Aucune expérience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aliviaFrequency">Utilisation d'Alivia</Label>
              <Select value={participant.aliviaFrequency} onValueChange={(v) => setParticipant({...participant, aliviaFrequency: v})} disabled={isReadOnly}>
                <SelectTrigger id="aliviaFrequency">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Je n'ai jamais utilisé Alivia</SelectItem>
                  <SelectItem value="occasional">J'utilise occasionnellement Alivia</SelectItem>
                  <SelectItem value="often">J'utilise souvent Alivia</SelectItem>
                  <SelectItem value="daily">J'utilise tous les jours Alivia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => setIsParticipantRegistered(true)} 
              disabled={!participant.name || isReadOnly}
              className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
            >
              Continuer
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="container mx-auto max-w-3xl py-10">
        <Card className="border-[var(--border)] shadow-lg">
          <CardHeader className="bg-[var(--card)] border-b border-[var(--border)]">
            <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
              <PlayCircle className="h-6 w-6 text-[var(--accent)]" />
              Prêt à démarrer le test ?
            </CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">
              Participant : <span className="text-[var(--foreground)]">{participant.name}</span> {participant.role && `• ${participant.role}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-[var(--muted)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="flex items-center gap-2 text-[var(--foreground)] mb-2">
                  <Lightbulb className="h-5 w-5 text-[var(--accent)]" />
                  Consignes importantes
                </h3>
                <ul className="space-y-2 text-[var(--muted-foreground)]">
                  <li>✅ Laissez le participant explorer librement sans trop intervenir</li>
                  <li>📝 Notez ses verbatims spontanés (ce qu'il dit, exprime, ressent)</li>
                  <li>👀 Observez les micro-comportements : hésitations, erreurs, clics inutiles</li>
                  <li>⏱️ Ne précipitez pas : laissez le temps à chaque action</li>
                  <li>💬 Encouragez le participant à penser à voix haute</li>
                </ul>
              </div>

              <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
                <p className="text-[var(--muted-foreground)]">
                  Ce protocole comporte <span className="text-[var(--foreground)]">{testTasks.length} tâches</span>. 
                  Durée estimée : <span className="text-[var(--foreground)]">45-60 minutes</span>.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsParticipantRegistered(false)}
              disabled={isReadOnly}
              className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              Retour
            </Button>
            <Button 
              onClick={() => setSessionStarted(true)} 
              className="flex-1 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
              disabled={isReadOnly}
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Démarrer le test
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-6 space-y-6">
      {/* Test Mode Quick Nav */}
      {isTestMode && (
        <Card className="border-[var(--accent)] bg-[var(--accent)]/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-[var(--accent)]">🧪 Mode Test - Navigation Rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {testTasks.map((task, idx) => (
                <Button
                  key={task.id}
                  size="sm"
                  variant={currentTask === idx ? "default" : "outline"}
                  onClick={() => goToTask(idx)}
                  className={currentTask === idx ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"}
                >
                  T{task.id}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[var(--muted-foreground)]">
            Tâche {currentTask + 1} / {testTasks.length}
            {isOptionalTask && <Badge variant="outline" className="ml-2 border-[var(--accent)] text-[var(--accent)]">BONUS</Badge>}
          </span>
          <span className="text-[var(--muted-foreground)]">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Task Card */}
      <Card className="border-[var(--border)] shadow-lg">
        <CardHeader className="bg-[var(--card)] border-b border-[var(--border)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 text-[var(--foreground)]">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <span className="text-[var(--primary)]">{currentTask + 1}</span>
                </div>
                {currentTaskObj?.title}
                {isOptionalTask && (
                  <Badge variant="outline" className="border-[var(--accent)] text-[var(--accent)]">
                    BONUS
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2 text-[var(--muted-foreground)]">{currentTaskObj?.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Optional Task Toggle */}
          {isOptionalTask && (
            <div className="bg-[var(--muted)] p-4 rounded-lg border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-[var(--foreground)]">Tâche facultative</Label>
                  <p className="text-[var(--muted-foreground)] mt-1">
                    Cette tâche est optionnelle. Vous pouvez choisir de ne pas la réaliser.
                  </p>
                </div>
                <Switch
                  checked={!currentTaskData.skipped}
                  onCheckedChange={(checked) => setCurrentTaskData({...currentTaskData, skipped: !checked})}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          )}

          {/* Layout en 2 colonnes : Scenario à gauche, Métriques à droite */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLONNE GAUCHE : Contexte de la tâche */}
            <div className="lg:col-span-1 space-y-4">
              {/* Scénario */}
              <div className="bg-[rgb(8,3,81)] p-4 rounded-lg space-y-3">
                <h4 className="flex items-center gap-2 text-[var(--primary-foreground)]">
                  <FileText className="h-5 w-5 text-[var(--primary-foreground)]" />
                  Scénario
                </h4>
                <p className="text-[var(--primary-foreground)] italic leading-relaxed">
                  &ldquo;{currentTaskObj?.scenario}&rdquo;
                </p>
              </div>

              {/* Conseil Facilitateur */}
              <div className="bg-[var(--accent)]/5 p-4 rounded-lg border border-[var(--accent)]/20 space-y-3">
                <h4 className="flex items-center gap-2 text-[var(--foreground)]">
                  <Lightbulb className="h-5 w-5 text-[var(--accent)]" />
                  Conseil Facilitateur
                </h4>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  {currentTaskObj?.tip}
                </p>
              </div>
            </div>

            {/* COLONNE DROITE : Formulaire métriques */}
            <div className="lg:col-span-2">
              <div className={`space-y-6 ${isOptionalTask && currentTaskData.skipped ? 'opacity-40 pointer-events-none' : ''}`}>
            {isPostTestTask ? (
              /* POST-TEST QUESTIONS - Uniquement pour la tâche 9 */
              <div className="space-y-6 p-6 bg-[var(--muted)]/30 rounded-lg border border-[var(--border)]">
                <h3 className="flex items-center gap-2 text-[var(--foreground)]">
                  <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
                  Questions Post-Test
                </h3>

                <div className="space-y-2">
                  <Label>Points frustrants</Label>
                  <Textarea 
                    placeholder="Qu'est-ce qui a été frustrant ou bloquant durant le test ?"
                    className="min-h-[100px] border-[var(--border)]"
                    value={currentTaskData.postTestFrustrations || ''}
                    onChange={(e) => setCurrentTaskData({...currentTaskData, postTestFrustrations: e.target.value})}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Souveraineté des données</Label>
                  <Textarea 
                    placeholder="Le participant a-t-il compris le concept de souveraineté des données ?"
                    className="min-h-[100px] border-[var(--border)]"
                    value={currentTaskData.postTestDataStorage || ''}
                    onChange={(e) => setCurrentTaskData({...currentTaskData, postTestDataStorage: e.target.value})}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valeur perçue (usage quotidien)</Label>
                  <Textarea 
                    placeholder="Le participant voit-il l'utilité d'Alivia dans son quotidien professionnel ?"
                    className="min-h-[100px] border-[var(--border)]"
                    value={currentTaskData.postTestPracticalUse || ''}
                    onChange={(e) => setCurrentTaskData({...currentTaskData, postTestPracticalUse: e.target.value})}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Label>Score d'adoption</Label>
                  <p className="text-[var(--muted-foreground)]">
                    A quel point vous voyez-vous utiliser ce produit au quotidien ?
                  </p>
                  <Slider 
                    value={[currentTaskData.postTestAdoption || 5]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(val) => {
                      console.log('🔍 DEBUG SLIDER - Nouvelle valeur d\'adoption:', val[0]);
                      setCurrentTaskData({...currentTaskData, postTestAdoption: val[0]});
                    }}
                    className="py-4"
                    disabled={isReadOnly}
                  />
                  <div className="flex justify-between text-[var(--muted-foreground)]">
                    <span>1 - Jamais</span>
                    <span className="text-[var(--primary)]">{currentTaskData.postTestAdoption || 5}/10</span>
                    <span>10 - Quotidiennement</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes d'observation</Label>
                  <Textarea 
                    placeholder="Autres remarques, insights, verbatims..."
                    className="min-h-[100px] border-[var(--border)]"
                    value={currentTaskData.notes || ''}
                    onChange={(e) => setCurrentTaskData({...currentTaskData, notes: e.target.value})}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            ) : (
              /* TÂCHES STANDARDS (1-8, 10) */
              <>
                {/* TASK 1 ONLY: Two custom gauges */}
                {currentTaskObj?.id === 1 && (
                  <div className="space-y-8">
                    {/* Gauge 1: Compréhension d'Alivia */}
                    <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)] space-y-4">
                      <div className="space-y-2">
                        <Label>Compréhension d'Alivia</Label>
                        <p className="text-[var(--muted-foreground)]">
                          Le participant a-t-il compris la proposition de valeur d'Alivia ?
                        </p>
                      </div>
                      <Slider 
                        value={[currentTaskData.valuePropositionClarity || 5]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(val) => setCurrentTaskData({...currentTaskData, valuePropositionClarity: val[0]})}
                        className="py-4"
                        disabled={isReadOnly}
                      />
                      <div className="flex justify-between text-[var(--muted-foreground)]">
                        <span>1 - Incompréhensible</span>
                        <span className="text-[var(--primary)]">{currentTaskData.valuePropositionClarity || 5}/10</span>
                        <span>10 - Cristallin</span>
                      </div>
                    </div>

                    {/* Gauge 2: Première impression */}
                    <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)] space-y-4">
                      <div className="space-y-2">
                        <Label>Impression initiale</Label>
                        <p className="text-[var(--muted-foreground)]">
                          Quelle est la première impression du participant ?
                        </p>
                      </div>
                      <Slider 
                        value={[currentTaskData.firstImpression || 5]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(val) => setCurrentTaskData({...currentTaskData, firstImpression: val[0]})}
                        className="py-4"
                        disabled={isReadOnly}
                      />
                      <div className="flex justify-between text-[var(--muted-foreground)]">
                        <span>1 - Très négative</span>
                        <span className="text-[var(--primary)]">{currentTaskData.firstImpression || 5}/10</span>
                        <span>10 - Très positive</span>
                      </div>
                    </div>

                    {/* Verbatims */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border)]">
                      <div className="space-y-3">
                        <Label className="text-green-600">Verbatims positifs</Label>
                        <Textarea 
                          placeholder="Citations positives du participant..."
                          className="min-h-[100px] border-[var(--border)]"
                          value={currentTaskData.positiveVerbatims || ''}
                          onChange={(e) => setCurrentTaskData({...currentTaskData, positiveVerbatims: e.target.value})}
                          disabled={isReadOnly}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-red-600">Verbatims négatifs</Label>
                        <Textarea 
                          placeholder="Citations négatives ou points de friction..."
                          className="min-h-[100px] border-[var(--border)]"
                          value={currentTaskData.negativeVerbatims || ''}
                          onChange={(e) => setCurrentTaskData({...currentTaskData, negativeVerbatims: e.target.value})}
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>

                    {/* Notes d'observation */}
                    <div className="pt-4 border-t border-[var(--border)]">
                      <div className="space-y-3">
                        <Label>Notes d'observation</Label>
                        <Textarea 
                          placeholder="Comportements, hésitations, verbatims spontanés..."
                          className="min-h-[120px] border-[var(--border)]"
                          value={currentTaskData.notes || ''}
                          onChange={(e) => setCurrentTaskData({...currentTaskData, notes: e.target.value})}
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pour les tâches 2-8 et 10: Afficher les métriques standard */}
                {currentTaskObj?.id !== 1 && (
                  <>
                    {/* DYNAMIC FIELDS BASED ON CONFIG */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Duration */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Clock className="w-4 h-4"/> Durée d'exécution</Label>
                        <Select value={currentTaskData.duration || ''} onValueChange={(v) => setCurrentTaskData({...currentTaskData, duration: v})} disabled={isReadOnly}>
                           <SelectTrigger className="border-[var(--border)]"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="<30s">Moins de 30 secondes</SelectItem>
                             <SelectItem value="30s-1m">30 secondes - 1 minute</SelectItem>
                             <SelectItem value="1-2m">1 - 2 minutes</SelectItem>
                             <SelectItem value="2-5m">2 - 5 minutes</SelectItem>
                             <SelectItem value=">5m">Plus de 5 minutes</SelectItem>
                           </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Autonomy */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><User className="w-4 h-4"/> Niveau d'autonomie</Label>
                        <Select value={currentTaskData.autonomy || ''} onValueChange={(v) => setCurrentTaskData({...currentTaskData, autonomy: v})} disabled={isReadOnly}>
                           <SelectTrigger className="border-[var(--border)]"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="autonomous">Totalement autonome</SelectItem>
                             <SelectItem value="minimal-help">Aide minimale</SelectItem>
                             <SelectItem value="guided">A dû être guidé</SelectItem>
                             <SelectItem value="blocked">Bloqué sans aide</SelectItem>
                           </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Path Fluidity */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Activity className="w-4 h-4"/> Fluidité du parcours</Label>
                        <Select value={currentTaskData.pathFluidity || ''} onValueChange={(v) => setCurrentTaskData({...currentTaskData, pathFluidity: v})} disabled={isReadOnly}>
                           <SelectTrigger className="border-[var(--border)]"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="direct">Direct</SelectItem>
                             <SelectItem value="hesitant">Avec hésitations</SelectItem>
                             <SelectItem value="erratic">Erratique</SelectItem>
                           </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Emotional Reaction */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Smile className="w-4 h-4"/> Réaction émotionnelle observée</Label>
                        <Select value={currentTaskData.emotionalReaction || ''} onValueChange={(v) => setCurrentTaskData({...currentTaskData, emotionalReaction: v})} disabled={isReadOnly}>
                           <SelectTrigger className="border-[var(--border)]"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="positive">Positif/Confiant</SelectItem>
                             <SelectItem value="neutral">Neutre/Concentré</SelectItem>
                             <SelectItem value="frustrated">Frustré/Confus</SelectItem>
                           </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Task Success */}
                    <div className="space-y-3 pt-2">
                      <Label>Tâche réussie ?</Label>
                      <RadioGroup value={currentTaskData.success ? "yes" : "no"} onValueChange={(v) => setCurrentTaskData({...currentTaskData, success: v === "yes"})} disabled={isReadOnly}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="success-yes" />
                          <Label htmlFor="success-yes" className="flex items-center gap-2 cursor-pointer">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Oui, réussie
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="success-no" />
                          <Label htmlFor="success-no" className="flex items-center gap-2 cursor-pointer">
                            <XCircle className="w-4 h-4 text-red-600" />
                            Non, échec
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {/* Search Method - Specific to Task 5 (and 2 if legacy) */}
                    {(currentTaskObj?.metricsFields?.includes('searchMethod') || currentTaskObj?.id === 2 || currentTaskObj?.id === 5) && (
                       <div className="space-y-3 pt-2">
                         <Label>Méthode de recherche utilisée</Label>
                         <div className="grid grid-cols-2 gap-2">
                           {['Barre de recherche', 'Navigation Catalogue', 'Filtres', 'Suggestions'].map((method) => (
                             <div key={method} className="flex items-center space-x-2">
                               <Checkbox 
                                 id={method}
                                 checked={currentTaskData.searchMethod?.includes(method) || false}
                                 onCheckedChange={(checked) => {
                                   const current = currentTaskData.searchMethod || [];
                                   setCurrentTaskData({
                                     ...currentTaskData,
                                     searchMethod: checked ? [...current, method] : current.filter(m => m !== method)
                                   });
                                 }}
                                 disabled={isReadOnly}
                               />
                               <Label htmlFor={method} className="cursor-pointer">{method}</Label>
                             </div>
                           ))}
                         </div>
                       </div>
                    )}

                    {/* Verbatims */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                       <div className="space-y-2">
                         <Label className="text-green-600 flex items-center gap-1"><ThumbsUp className="w-4 h-4"/> Points positifs</Label>
                         <Textarea 
                           className="border-green-100 focus:border-green-300 min-h-[80px]"
                           placeholder="Ce qui a plu..."
                           value={currentTaskData.taskVerbatimsPositive || ''}
                           onChange={(e) => setCurrentTaskData({...currentTaskData, taskVerbatimsPositive: e.target.value})}
                           disabled={isReadOnly}
                         />
                       </div>
                       <div className="space-y-2">
                         <Label className="text-red-600 flex items-center gap-1"><Frown className="w-4 h-4"/> Points négatifs</Label>
                         <Textarea 
                           className="border-red-100 focus:border-red-300 min-h-[80px]"
                           placeholder="Ce qui a bloqué..."
                           value={currentTaskData.taskVerbatimsNegative || ''}
                           onChange={(e) => setCurrentTaskData({...currentTaskData, taskVerbatimsNegative: e.target.value})}
                           disabled={isReadOnly}
                         />
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <Label>Notes d'observation</Label>
                       <Textarea 
                         placeholder="Comportements, hésitations, erreurs..."
                         className="min-h-[100px] border-[var(--border)]"
                         value={currentTaskData.notes || ''}
                         onChange={(e) => setCurrentTaskData({...currentTaskData, notes: e.target.value})}
                         disabled={isReadOnly}
                       />
                    </div>

                    {/* Standard Ease Metric - UNIQUEMENT pour tâches 2-8 (pas découverte, pas post-test, pas bonus) */}
                    {currentTaskObj?.id !== 9 && 
                     !currentTaskObj?.title?.includes('Questions Post-Test') &&
                     !currentTaskObj?.optional && (
                    <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                      <Label>Facilité</Label>
                      <p className="text-[var(--muted-foreground)]">
                        Sur une échelle de 1 à 10, à quel point cette action vous a semblé facile ?
                      </p>
                      <Slider 
                        value={[currentTaskData.ease || 5]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(val) => setCurrentTaskData({...currentTaskData, ease: val[0]})}
                        className="py-4"
                        disabled={isReadOnly}
                      />
                      <div className="flex justify-between text-[var(--muted-foreground)]">
                        <span>Très difficile</span>
                        <span className="text-[var(--primary)]">{currentTaskData.ease || 5}/10</span>
                        <span>Très facile</span>
                      </div>
                    </div>
                    )}
                  </>
                )}
              </>
            )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-[var(--border)] pt-6">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handlePreviousTask}
              disabled={currentTask === 0 || isReadOnly}
              className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
              disabled={isReadOnly}
              className="border-[var(--destructive)] text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Annuler la session
            </Button>
          </div>

          {currentTask === testTasks.length - 1 ? (
            <Button 
              onClick={saveSession}
              disabled={isReadOnly}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Terminer et sauvegarder
            </Button>
          ) : (
            <Button 
              onClick={handleNextTask}
              disabled={isReadOnly}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="border-[var(--border)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[var(--foreground)]">Annuler la session ?</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--muted-foreground)]">
              Toutes les données non sauvegardées seront perdues. Êtes-vous sûr ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]">Continuer la session</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetForm();
                onSessionComplete();
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
