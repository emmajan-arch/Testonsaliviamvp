import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AlertCircle, TrendingUp, TrendingDown, Download, Trash2, Users, Clock, MousePointer, AlertTriangle, Smile, Target, Zap, Search, Lightbulb, Shield, CheckCircle2, XCircle, Eye, ThumbsUp, Brain, Navigation, Activity, FileText, Table, Info, Cloud, RefreshCw, Upload, Video, FileText as FileTextIcon, Play, Plus, X as XIcon, ArrowRight, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AliviaLogo } from './AliviaLogo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import jsPDF from 'jspdf';
import { syncWithSupabase, deleteSession as deleteFromSupabase, uploadRecording, updateSession, VideoTimestamp, deleteRecording as deleteRecordingFromSupabase } from '../utils/supabase/sessions';
import { toast } from 'sonner@2.0.3';
import { QualitativeSynthesis } from './QualitativeSynthesis';
import { VideoPlayer, VideoPlayerRef } from './VideoPlayer';

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
  skipped?: boolean; // Pour marquer une tâche comme non effectuée (optionnelle - "Créer un assistant" - tâche 10)
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
  ease: { label: 'Facilité', icon: ThumbsUp }
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
}

export function ResultsView({ onEditSession, isActive, isReadOnly = false }: ResultsViewProps) {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [timestamps, setTimestamps] = useState<VideoTimestamp[]>([]);
  const [newTimestamp, setNewTimestamp] = useState({ time: '', label: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRefs = useRef<{ [key: number]: VideoPlayerRef | null }>({});

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
      syncedSessions.forEach((s, idx) => {
        console.log(`Session ${idx + 1}:`, {
          id: s.id,
          participant: s.participant.name,
          date: s.date,
          nbTasks: s.tasks?.length || 0,
          tasksIds: s.tasks?.map(t => t.taskId) || []
        });
      });
      setSessions(syncedSessions);
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
      syncedSessions.forEach((s, idx) => {
        console.log(`Session ${idx + 1}:`, {
          id: s.id,
          participant: s.participant.name,
          date: s.date,
          nbTasks: s.tasks?.length || 0
        });
      });
      setSessions(syncedSessions);
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
    setSelectedSessionId(sessionId);
    setUploadFile(null);
    setTranscriptionText('');
    setTimestamps([]);
    setNewTimestamp({ time: '', label: '', description: '' });
    setUploadDialogOpen(true);
  };



  const autoGenerateTimestamps = () => {
    if (!selectedSessionId) return;
    
    const session = sessions.find(s => s.id === selectedSessionId);
    if (!session) return;

    // Générer des timestamps suggérés basés sur les tâches
    const suggestedTimestamps: VideoTimestamp[] = session.tasks.map((task, index) => ({
      id: `auto-${Date.now()}-${index}`,
      time: index * 180, // 3 minutes par tâche (à ajuster manuellement)
      label: `Tâche ${task.taskId}: ${task.title}`,
      description: task.success ? 'Tâche réussie' : 'Tâche échouée',
      taskId: task.taskId
    }));

    setTimestamps(suggestedTimestamps);
    toast.success(`${suggestedTimestamps.length} timestamps générés. Ajustez les temps selon votre vidéo.`);
  };

  const addTimestamp = () => {
    if (!newTimestamp.time || !newTimestamp.label) {
      toast.error('Le temps et le label sont requis');
      return;
    }

    const timeInSeconds = parseTimeToSeconds(newTimestamp.time);
    if (isNaN(timeInSeconds) || timeInSeconds < 0) {
      toast.error('Format de temps invalide. Utilisez MM:SS ou HH:MM:SS');
      return;
    }

    const timestamp: VideoTimestamp = {
      id: Date.now().toString(),
      time: timeInSeconds,
      label: newTimestamp.label,
      description: newTimestamp.description || undefined,
    };

    setTimestamps([...timestamps, timestamp].sort((a, b) => a.time - b.time));
    setNewTimestamp({ time: '', label: '', description: '' });
  };

  const removeTimestamp = (id: string) => {
    setTimestamps(timestamps.filter(t => t.id !== id));
  };

  const editTimestamp = (timestamp: VideoTimestamp) => {
    setNewTimestamp({
      time: formatTime(timestamp.time),
      label: timestamp.label,
      description: timestamp.description || ''
    });
    removeTimestamp(timestamp.id);
  };

  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(p => parseInt(p, 10));
    if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return NaN;
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const seekToTimestamp = (sessionId: number, time: number) => {
    const player = videoPlayerRefs.current[sessionId];
    if (player) {
      player.seekTo(time);
      player.play();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const submitRecording = async () => {
    if (!selectedSessionId || !uploadFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setIsUploading(true);
    try {
      const recordingUrl = await uploadRecording(selectedSessionId, uploadFile, transcriptionText, timestamps);
      
      // Update local state
      const updatedSessions = sessions.map(s => 
        s.id === selectedSessionId 
          ? { ...s, recordingUrl, transcription: transcriptionText, timestamps }
          : s
      );
      setSessions(updatedSessions);
      localStorage.setItem('testSessions', JSON.stringify(updatedSessions));
      
      toast.success('Enregistrement importé avec succès');
      setUploadDialogOpen(false);
    } catch (error) {
      console.error('Error uploading recording:', error);
      toast.error('Erreur lors de l\'import de l\'enregistrement');
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
          // La métrique "ease" (Facilité) n'est pas collectée pour : Tâche 1 (Découverte), Tâche 10 (Questions Post-Test), tâches bonus
          const isTaskToExclude = task.taskId === 1 || task.taskId === 10;
          const isBonus = task.title?.includes('Créer un assistant') || task.title?.includes('BONUS');
          if (key === 'ease' && (isTaskToExclude || isBonus)) return '';
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

      // Métriques
      const taskMetrics = [];
      // La métrique "ease" (Facilité) est collectée UNIQUEMENT pour les tâches 2-8 (tâches d'usage)
      if (task.ease && task.taskId >= 2 && task.taskId <= 8) {
        taskMetrics.push(`Facilité: ${task.ease}/10`);
      }

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
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    const leftMargin = 15;
    const rightMargin = pageWidth - 15;
    const maxWidth = rightMargin - leftMargin;

    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(30, 14, 98); // #1E0E62
    doc.text('Alivia - Résultats Tests UX', leftMargin, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, leftMargin, yPos);
    
    yPos += 10;
    doc.setDrawColor(30, 14, 98);
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    
    yPos += 10;

    // Statistiques globales
    const stats = calculateStats();
    if (stats) {
      doc.setFontSize(14);
      doc.setTextColor(30, 14, 98);
      doc.text('Vue d\'Ensemble', leftMargin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      const metrics = [
        `Sessions: ${sessions.length}`,
        `Participants: ${new Set(sessions.map(s => s.participant.name)).size}`,
        `Taux de réussite: ${stats.successRate.toFixed(0)}%`,
        stats.autonomyRate !== null ? `Autonomie complète: ${stats.autonomyRate.toFixed(0)}%` : null
      ].filter(Boolean);

      metrics.forEach(metric => {
        if (metric) {
          doc.text(metric, leftMargin + 5, yPos);
          yPos += 6;
        }
      });

      yPos += 5;
    }

    // Sessions détaillées
    sessions.forEach((session, index) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(30, 14, 98);
      doc.text(`Session ${index + 1} - ${session.participant.name}`, leftMargin, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`${session.participant.role} | ${new Date(session.date).toLocaleDateString('fr-FR')}`, leftMargin, yPos);
      yPos += 5;
      
      if (session.participant.aiToolsFrequency || session.participant.aiToolsEase || session.participant.aliviaFrequency) {
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        const profileInfo = [];
        if (session.participant.aiToolsFrequency) profileInfo.push(`IA: ${session.participant.aiToolsFrequency}`);
        if (session.participant.aiToolsEase) profileInfo.push(`Aisance: ${session.participant.aiToolsEase}`);
        if (session.participant.aliviaFrequency) profileInfo.push(`Alivia: ${session.participant.aliviaFrequency}`);
        doc.text(profileInfo.join(' | '), leftMargin, yPos);
        yPos += 6;
      } else {
        yPos += 3;
      }

      // Tâches
      session.tasks.forEach((task, taskIndex) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const taskTitle = `Tâche ${taskIndex + 1}: ${removeEmojis(task.title)}`;
        doc.text(taskTitle, leftMargin + 3, yPos);
        yPos += 5;

        doc.setFontSize(8);
        if (task.success) {
          doc.setTextColor(34, 197, 94); // green
        } else {
          doc.setTextColor(239, 68, 68); // red
        }
        doc.text(task.success ? 'Réussite' : 'Échec', leftMargin + 6, yPos);
        yPos += 5;

        // Métriques numériques (dynamique selon metricConfig)
        const taskMetrics = [];
        Object.keys(metricConfig).forEach(metricKey => {
          // La métrique "ease" (Facilité) n'est pas collectée pour : Tâche 1 (Découverte), Tâche 10 (Questions Post-Test), tâches bonus
          const isTaskToExclude = task.taskId === 1 || task.taskId === 10;
          const isBonus = task.title?.includes('Créer un assistant') || task.title?.includes('BONUS');
          if (metricKey === 'ease' && (isTaskToExclude || isBonus)) return;
          
          const value = task[metricKey as keyof TaskResult];
          if (typeof value === 'number') {
            taskMetrics.push(`${metricConfig[metricKey].label}: ${value}/10`);
          }
        });

        if (taskMetrics.length > 0) {
          doc.setTextColor(100, 100, 100);
          doc.text(taskMetrics.join(' | '), leftMargin + 6, yPos);
          yPos += 5;
        }

        // Notes
        if (task.notes && task.notes.trim()) {
          doc.setTextColor(80, 80, 80);
          const noteLines = doc.splitTextToSize(`Notes: ${task.notes}`, maxWidth - 10);
          noteLines.forEach((line: string) => {
            if (yPos > pageHeight - 20) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, leftMargin + 6, yPos);
            yPos += 4;
          });
        }

        yPos += 3;
      });

      yPos += 5;
    });

    doc.save(`alivia-test-results-${new Date().toISOString().split('T')[0]}.pdf`);
  };

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
    
    // ====== TAUX DE RÉUSSITE ======
    // IMPORTANT : Exclure la tâche 1 (Phase de découverte) et la tâche 10 (Questions Post-Test)
    // Car ce sont des tâches spéciales qui ne sont pas des "tâches d'usage" standard
    const tasksForSuccessRate = allTasks.filter(t => t.taskId !== 1 && t.taskId !== 10);
    const successRate = tasksForSuccessRate.length > 0 
      ? (tasksForSuccessRate.filter(t => t.success).length / tasksForSuccessRate.length) * 100 
      : 0;
    console.log('✅ Taux de réussite:', successRate.toFixed(1) + '%', `(${tasksForSuccessRate.filter(t => t.success).length}/${tasksForSuccessRate.length})`);

    // ====== TAUX D'AUTONOMIE ======
    // Exclure la tâche 1 (Phase de découverte) et la tâche 10 (Questions Post-Test) qui n'ont pas ces métriques
    const tasksWithAutonomy = allTasks.filter(t => t.taskId !== 1 && t.taskId !== 10 && t.autonomy !== undefined && t.autonomy !== '' && t.autonomy !== null);
    console.log('🔍 Autonomie - Tâches avec valeur d\'autonomie:', tasksWithAutonomy.map(t => ({ id: t.taskId, title: t.title, autonomy: t.autonomy })));
    
    const aloneCount = tasksWithAutonomy.filter(t => t.autonomy === 'autonomous').length;
    console.log(`🔍 Autonomie - Tâches "alone": ${aloneCount}/${tasksWithAutonomy.length}`);
    
    const autonomyRate = tasksWithAutonomy.length > 0
      ? (aloneCount / tasksWithAutonomy.length) * 100
      : null;
    console.log('🔍 Autonomie - Taux final:', autonomyRate?.toFixed(1) + '%');

    // Calcul des moyennes pour les métriques numériques (échelles 1-10)
    // Utiliser uniquement les métriques définies dans metricConfig
    const numericalMetrics: Record<string, number> = {};
    const numericalMetricKeys = Object.keys(metricConfig);
    
    const metricSampleCounts: Record<string, number> = {};
    
    numericalMetricKeys.forEach(metric => {
      // Ne pas filtrer par availableMetrics - vérifier directement si des tâches ont cette métrique
      let tasksWithMetric = allTasks.filter(t => t[metric as keyof TaskResult] !== undefined && t[metric as keyof TaskResult] !== null);
      
      console.log(`📊 Métrique "${metric}" - Tâches avec valeur avant filtrage:`, tasksWithMetric.length);
      
      // La métrique "ease" (Facilité) est collectée UNIQUEMENT pour les tâches d'usage standard
      // Exclure : Tâche 1 (Découverte), Tâche 10 (Questions Post-Test), et tâches bonus
      if (metric === 'ease') {
        console.log(`   Tâches avant filtrage:`, tasksWithMetric.map(t => ({ id: t.taskId, title: t.title, ease: t.ease })));
        tasksWithMetric = tasksWithMetric.filter(t => {
          // Filtrer par ID (plus fiable que par titre)
          const isTaskToExclude = t.taskId === 1 || t.taskId === 10;
          const isBonus = t.title?.includes('Créer un assistant') || t.title?.includes('BONUS');
          return !isTaskToExclude && !isBonus;
        });
        console.log(`   Tâches après filtrage:`, tasksWithMetric.map(t => ({ id: t.taskId, title: t.title, ease: t.ease })));
      }
      
      if (tasksWithMetric.length > 0) {
        const sum = tasksWithMetric.reduce((sum, t) => sum + (Number(t[metric as keyof TaskResult]) || 0), 0);
        const avg = sum / tasksWithMetric.length;
        numericalMetrics[metric] = avg;
        metricSampleCounts[metric] = tasksWithMetric.length;
        console.log(`   ✅ Moyenne "${metric}": ${avg.toFixed(2)}/10 (${tasksWithMetric.length} tâches, somme: ${sum})`);
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
        // Exclure la tâche 1 (Phase de découverte) et la tâche 10 (Questions Post-Test) 
        // pour duration, autonomy, pathFluidity, emotionalReaction
        if (['duration', 'autonomy', 'pathFluidity', 'emotionalReaction'].includes(metric) && (t.taskId === 1 || t.taskId === 10)) {
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
        // La métrique "ease" (Facilité) n'est pas collectée pour : Tâche 1 (Découverte), Tâche 10 (Questions Post-Test), tâches bonus
        const taskTitle = taskResults[0]?.title || '';
        const isTaskToExclude = taskId === 1 || taskId === 10;
        const isBonus = taskTitle.includes('Créer un assistant') || taskTitle.includes('BONUS');
        if (metric === 'ease' && (isTaskToExclude || isBonus)) {
          return;
        }
        
        const tasksWithMetric = taskResults.filter(t => t[metric as keyof TaskResult] !== undefined);
        if (tasksWithMetric.length > 0) {
          stats[metric] = tasksWithMetric.reduce((sum, t) => sum + (Number(t[metric as keyof TaskResult]) || 0), 0) / tasksWithMetric.length;
        }
      });

      // Ajout des métriques catégorielles pour cette tâche
      categoricalMetrics.forEach(metric => {
        // Exclure la tâche 1 et la tâche 10 pour certaines métriques
        let tasksWithMetric = taskResults.filter(t => t[metric as keyof TaskResult] !== undefined && t[metric as keyof TaskResult] !== null && t[metric as keyof TaskResult] !== '');
        
        // Ces métriques ne s'appliquent pas à la tâche 1 (Découverte) ni à la tâche 10 (Questions Post-Test)
        if (['duration', 'autonomy', 'pathFluidity', 'emotionalReaction'].includes(metric) && (taskId === 1 || taskId === 10)) {
          return;
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
      if (aloneCount / totalAutonomy >= 0.7) {
        strengths.push('Forte autonomie des utilisateurs');
      } else if (aloneCount / totalAutonomy < 0.5) {
        improvements.push('Autonomie faible - trop d\'aide nécessaire');
      }
    }

    if (categoricalStats.emotionalReaction) {
      const positiveCount = categoricalStats.emotionalReaction['positive'] || 0;
      const totalEmotional = Object.values(categoricalStats.emotionalReaction).reduce((sum, count) => sum + count, 0);
      if (positiveCount / totalEmotional < 0.5) {
        improvements.push('Réactions émotionnelles à surveiller');
      }
    }

    // Calcul du score d'adoption moyen (collecté dans la tâche 9 - Questions Post-Test)
    // Ne prendre en compte que les tâches 10 avec un score d'adoption renseigné (tâche Questions Post-Test)
    console.log('📊 ===== ANALYSE SCORE D\'ADOPTION =====');
    console.log('📊 Toutes les tâches:', allTasks.map(t => ({ sessionId: sessions.find((s: any) => s.tasks?.some((st: any) => st === t))?.id, taskId: t.taskId, adoption: t.postTestAdoption })));
    const tasksWithAdoption = allTasks.filter(t => t.taskId === 10 && t.postTestAdoption !== undefined && t.postTestAdoption !== null);
    console.log('📊 Score d\'adoption - Tâches 10 (Questions Post-Test) avec postTestAdoption:', tasksWithAdoption.map(t => ({ id: t.taskId, adoption: t.postTestAdoption })));
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
          {/* SECTION 1: VUE D'ENSEMBLE */}
          {/* ============================================ */}
          <div className="bg-white border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
            <div className="p-6 border-b-2 border-[var(--accent)] bg-[var(--accent)]">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/20 rounded-[var(--radius)]">
                  <Activity className="w-6 h-6 text-[var(--accent-foreground)]" />
                </div>
                <div>
                  <h2 className="text-[var(--accent-foreground)]">Vue d'ensemble</h2>
                  <p className="text-[var(--accent-foreground)]/70">Indicateurs clés de performance</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Métriques Contextuelles */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-[16px] p-[0px] mt-[0px] mr-[0px] mb-[24px] ml-[0px]">
                {/* Participants */}
                <div className="flex flex-col flex-1">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Participants</p>
                  <p className="text-2xl text-[var(--foreground)] text-[18px]">
                    {(() => {
                      const uniqueParticipants = new Set(sessions.map(s => s.participant.name));
                      return uniqueParticipants.size;
                    })()}
                  </p>
                </div>

                <div className="hidden md:block w-px h-12 bg-[var(--border)] opacity-50" />

                {/* Sessions */}
                <div className="flex flex-col flex-1">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Sessions</p>
                  <p className="text-2xl text-[var(--foreground)] text-[18px]">{sessions.length}</p>
                </div>

                <div className="hidden md:block w-px h-12 bg-[var(--border)] opacity-50" />

                {/* Rôles testés */}
                

              

                {/* Dernier test */}
                <div className="flex flex-col flex-1">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Dernier test</p>
                  <p className="text-sm text-[var(--foreground)] text-[18px]">
                    {(() => {
                      const latestSession = sessions.sort((a, b) => 
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                      )[0];
                      
                      // Comparer les dates calendaires, pas les heures écoulées
                      const today = new Date();
                      const sessionDate = new Date(latestSession.date);
                      
                      // Remettre à minuit pour comparer uniquement les jours
                      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      const sessionMidnight = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
                      
                      const daysDiff = Math.floor(
                        (todayMidnight.getTime() - sessionMidnight.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      
                      if (daysDiff === 0) return 'Aujourd\'hui';
                      if (daysDiff === 1) return 'Hier';
                      if (daysDiff < 7) return `Il y a ${daysDiff}j`;
                      if (daysDiff < 30) return `Il y a ${Math.floor(daysDiff / 7)}sem`;
                      return `Il y a ${Math.floor(daysDiff / 30)}mois`;
                    })()}
                  </p>
                </div>
              </div>


              {/* KPIs principaux */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-white border-[var(--border)]">
                  <CardContent className="pt-6 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#010502]" />
                        <span className="text-sm text-[#010502] font-bold text-[16px] font-normal">Taux de réussite</span>
                      </div>
                    </div>
                    <div className="text-3xl mb-2 text-[var(--success)]">{stats.successRate.toFixed(0)}%</div>
                    <Progress value={stats.successRate} variant="success" className="h-1.5" />
                  </CardContent>
                </Card>

                <Card className="bg-white border-[var(--border)]">
                  <CardContent className="pt-6 pb-4">
                    {stats.autonomyRate !== null ? (
                      <>
                        <div className="flex items-center justify-between mb-3 bg-[rgba(1,5,2,0)]">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#010502]" />
                            <span className="text-sm text-[16px] font-bold font-normal text-[#010502]">Autonomie complète</span>
                          </div>
                        </div>
                        <div className={`text-3xl mb-2 ${stats.autonomyRate >= 70 ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                          {stats.autonomyRate.toFixed(0)}%
                        </div>
                        <Progress value={stats.autonomyRate} variant={stats.autonomyRate >= 70 ? "success" : "warning"} className="h-1.5" />
                        <p className="text-xs text-[var(--muted-foreground)] mt-2">
                          Tâches réussies sans aide
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span className="text-sm text-[var(--muted-foreground)]">Autonomie complète</span>
                        </div>
                        <div className="text-3xl text-[var(--muted-foreground)] mb-2">N/A</div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Aucune donnée d'autonomie
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Facilité */}
                <Card className="bg-white border-[var(--border)]">
                  <CardContent className="pt-6 pb-4">
                    {stats.numericalMetrics.ease !== undefined ? (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Smile className="w-4 h-4 text-[#010502]" />
                            <span className="text-sm text-[#010502] text-[16px]">Facilité</span>
                          </div>
                        </div>
                        <div className="text-3xl mb-2">
                          <span className={`${
                            stats.numericalMetrics.ease >= 8 ? 'text-[var(--success)]' : 
                            stats.numericalMetrics.ease >= 6 ? 'text-[var(--warning)]' : 
                            'text-[var(--destructive)]'
                          }`}>
                            {stats.numericalMetrics.ease.toFixed(1)}
                          </span>
                          <span className="text-lg text-[var(--muted-foreground)]">/10</span>
                        </div>
                        <Progress 
                          value={stats.numericalMetrics.ease * 10} 
                          variant={
                            stats.numericalMetrics.ease >= 8 ? "success" : 
                            stats.numericalMetrics.ease >= 6 ? "warning" : 
                            "destructive"
                          } 
                          className="h-1.5" 
                        />
                        <p className="text-xs text-[var(--muted-foreground)] mt-2">
                          Perception de facilité d'usage
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <Smile className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span className="text-sm text-[var(--muted-foreground)]">Facilité</span>
                        </div>
                        <div className="text-3xl text-[var(--muted-foreground)] mb-2">N/A</div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Aucune donnée de facilité
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Score d'Adoption - NOUVEAU */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                  <CardContent className="pt-6 pb-4">
                    {stats.adoptionScore !== null && stats.adoptionScore !== undefined ? (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-purple-900 font-bold text-[16px] font-normal">Score d'adoption</span>
                          </div>
                        </div>
                        <div className="text-3xl mb-2">
                          <span className={`${
                            stats.adoptionScore >= 8 ? 'text-[var(--success)]' : 
                            stats.adoptionScore >= 6 ? 'text-purple-600' : 
                            stats.adoptionScore >= 4 ? 'text-[var(--warning)]' :
                            'text-[var(--destructive)]'
                          }`}>
                            {stats.adoptionScore.toFixed(1)}
                          </span>
                          <span className="text-lg text-[var(--muted-foreground)]">/10</span>
                        </div>
                        <Progress 
                          value={stats.adoptionScore * 10} 
                          variant={
                            stats.adoptionScore >= 8 ? "success" : 
                            stats.adoptionScore >= 6 ? "default" : 
                            stats.adoptionScore >= 4 ? "warning" :
                            "destructive"
                          } 
                          className="h-1.5" 
                        />
                        <p className="text-xs text-purple-700 mt-2">
                          Usage quotidien envisagé
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <ThumbsUp className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span className="text-sm text-[var(--muted-foreground)]">Score d'adoption</span>
                        </div>
                        <div className="text-3xl text-[var(--muted-foreground)] mb-2">N/A</div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Aucune donnée d'adoption
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Insights automatiques */}
              {(stats.insights.strengths.length > 0 || stats.insights.improvements.length > 0) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {stats.insights.strengths.length > 0 && (
                    <Card className="bg-white border-[var(--success)]">
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                          <span className="text-[var(--success)]">Points forts</span>
                        </div>
                        <ul className="space-y-1.5">
                          {stats.insights.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[var(--foreground)]">
                              <span className="text-[var(--success)] mt-0.5">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {stats.insights.improvements.length > 0 && (
                    <Card className="bg-white border-[var(--warning)]">
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-4 h-4 text-[var(--warning)]" />
                          <span className="text-[var(--warning)]">Points d'amélioration</span>
                        </div>
                        <ul className="space-y-1.5">
                          {stats.insights.improvements.map((improvement, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[var(--foreground)]">
                              <span className="text-[var(--warning)] mt-0.5">•</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION 2: SYNTHÈSE COMPORTEMENTALE */}
          {/* ============================================ */}
          {Object.keys(stats.categoricalStats).length > 0 && (
            <div className="bg-white border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
              <div className="p-6 border-b-2 border-[var(--accent)] bg-[var(--accent)]">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/20 rounded-[var(--radius)]">
                    <Activity className="w-6 h-6 text-[var(--accent-foreground)]" />
                  </div>
                  <div>
                    <h2 className="text-[var(--accent-foreground)]">Synthèse Comportementale</h2>
                    <p className="text-[var(--accent-foreground)]/70">Analyse des patterns d'utilisation et recommandations</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Insights globaux */}
                {(() => {
                  const insights: { type: 'success' | 'warning' | 'alert'; icon: any; title: string; message: string; recommendation?: string }[] = [];
                  
                  // Analyse Autonomie
                  if (stats.categoricalStats.autonomy) {
                    const total = Object.values(stats.categoricalStats.autonomy).reduce((sum, c) => sum + c, 0);
                    const autonomous = stats.categoricalStats.autonomy['autonomous'] || 0;
                    const minimalHelp = stats.categoricalStats.autonomy['minimal-help'] || 0;
                    const guided = stats.categoricalStats.autonomy['guided'] || 0;
                    const blocked = stats.categoricalStats.autonomy['blocked'] || 0;
                    const autonomousRate = (autonomous / total) * 100;
                    
                    if (autonomousRate >= 70) {
                      insights.push({
                        type: 'success',
                        icon: Zap,
                        title: 'Excellente autonomie',
                        message: `${autonomousRate.toFixed(0)}% des tâches réussies sans aide (${autonomous}/${total})`,
                        recommendation: 'Les utilisateurs naviguent intuitivement. Maintenez cette clarté dans les futures fonctionnalités.'
                      });
                    } else if (autonomousRate < 50) {
                      insights.push({
                        type: 'alert',
                        icon: AlertTriangle,
                        title: 'Aide fréquemment nécessaire',
                        message: `Seulement ${autonomousRate.toFixed(0)}% d'autonomie (${minimalHelp + guided} avec aide, ${blocked} bloqués)`,
                        recommendation: 'URGENT : Ajouter des tooltips contextuels, simplifier les parcours et renforcer l\'onboarding.'
                      });
                    } else {
                      insights.push({
                        type: 'warning',
                        icon: Zap,
                        title: 'Autonomie moyenne',
                        message: `${autonomousRate.toFixed(0)}% d'autonomie - ${minimalHelp + guided} utilisateurs ont besoin d'indices`,
                        recommendation: 'Ajoutez des messages d\'aide inline et des exemples concrets pour guider les utilisateurs.'
                      });
                    }
                  }
                  
                  // Analyse Réaction Émotionnelle
                  if (stats.categoricalStats.emotionalReaction) {
                    const total = Object.values(stats.categoricalStats.emotionalReaction).reduce((sum, c) => sum + c, 0);
                    const positive = stats.categoricalStats.emotionalReaction['positive'] || 0;
                    const neutral = stats.categoricalStats.emotionalReaction['neutral'] || 0;
                    const frustrated = stats.categoricalStats.emotionalReaction['frustrated'] || 0;
                    const positiveRate = (positive / total) * 100;
                    const frustratedRate = (frustrated / total) * 100;
                    
                    if (frustratedRate >= 30) {
                      insights.push({
                        type: 'alert',
                        icon: AlertTriangle,
                        title: 'Frustration élevée détectée',
                        message: `${frustratedRate.toFixed(0)}% de réactions négatives (${frustrated} participants)`,
                        recommendation: 'CRITIQUE : Identifier les points de friction principaux et simplifier les parcours concernés.'
                      });
                    } else if (positiveRate >= 60) {
                      insights.push({
                        type: 'success',
                        icon: Smile,
                        title: 'Expérience émotionnelle positive',
                        message: `${positiveRate.toFixed(0)}% de réactions positives/confiantes`,
                        recommendation: 'Bon ressenti général. Documentez les éléments appréciés pour les reproduire.'
                      });
                    } else if (frustratedRate > 0) {
                      insights.push({
                        type: 'warning',
                        icon: Smile,
                        title: 'Quelques frustrations observées',
                        message: `${frustrated} participant${frustrated > 1 ? 's' : ''} frustré${frustrated > 1 ? 's' : ''} / ${neutral} neutre${neutral > 1 ? 's' : ''}`,
                        recommendation: 'Analysez les notes qualitatives pour identifier les sources de friction.'
                      });
                    }
                  }
                  
                  // Analyse Fluidité
                  if (stats.categoricalStats.pathFluidity) {
                    const total = Object.values(stats.categoricalStats.pathFluidity).reduce((sum, c) => sum + c, 0);
                    const direct = stats.categoricalStats.pathFluidity['direct'] || 0;
                    const hesitant = stats.categoricalStats.pathFluidity['hesitant'] || 0;
                    const erratic = stats.categoricalStats.pathFluidity['erratic'] || 0;
                    const directRate = (direct / total) * 100;
                    const erraticRate = (erratic / total) * 100;
                    
                    if (erraticRate >= 25) {
                      insights.push({
                        type: 'alert',
                        icon: Navigation,
                        title: 'Parcours erratiques fréquents',
                        message: `${erraticRate.toFixed(0)}% de parcours erratiques (${erratic}/${total})`,
                        recommendation: 'URGENT : L\'architecture de l\'information est confuse. Repenser la navigation et l\'organisation.'
                      });
                    } else if (directRate >= 60) {
                      insights.push({
                        type: 'success',
                        icon: Navigation,
                        title: 'Navigation fluide',
                        message: `${directRate.toFixed(0)}% de parcours directs - architecture claire`,
                        recommendation: 'Les utilisateurs trouvent rapidement leur chemin. Structure efficace à conserver.'
                      });
                    } else if (hesitant > 0) {
                      insights.push({
                        type: 'warning',
                        icon: Navigation,
                        title: 'Hésitations dans la navigation',
                        message: `${hesitant} participant${hesitant > 1 ? 's' : ''} hésitant${hesitant > 1 ? 's' : ''} dans leur parcours`,
                        recommendation: 'Clarifiez les labels de navigation et renforcez la hiérarchie visuelle.'
                      });
                    }
                  }
                  
                  // Analyse Durée
                  if (stats.categoricalStats.duration) {
                    const total = Object.values(stats.categoricalStats.duration).reduce((sum, c) => sum + c, 0);
                    const fast = (stats.categoricalStats.duration['very-fast'] || 0) + (stats.categoricalStats.duration['fast'] || 0);
                    const slow = (stats.categoricalStats.duration['long'] || 0) + (stats.categoricalStats.duration['very-long'] || 0);
                    const slowRate = (slow / total) * 100;
                    
                    if (slowRate >= 40) {
                      insights.push({
                        type: 'warning',
                        icon: Clock,
                        title: 'Temps d\'exécution élevés',
                        message: `${slowRate.toFixed(0)}% des tâches prennent trop de temps (${slow}/${total})`,
                        recommendation: 'Optimisez les parcours longs : réduire les étapes, ajouter des raccourcis, pré-remplir les champs.'
                      });
                    } else if ((fast / total) * 100 >= 60) {
                      insights.push({
                        type: 'success',
                        icon: Clock,
                        title: 'Efficacité temporelle',
                        message: `${((fast / total) * 100).toFixed(0)}% des tâches réalisées rapidement`,
                        recommendation: 'Parcours optimisés. Mesurez les temps réels pour confirmer cette perception.'
                      });
                    }
                  }
                  
                  // Analyse Méthodes de recherche
                  if (stats.categoricalStats.searchMethod) {
                    const total = Object.values(stats.categoricalStats.searchMethod).reduce((sum, c) => sum + c, 0);
                    const searchBar = stats.categoricalStats.searchMethod['search-bar'] || 0;
                    const visualCatalog = stats.categoricalStats.searchMethod['visual-catalog'] || 0;
                    const sidebarAssistants = stats.categoricalStats.searchMethod['sidebar-assistants'] || 0;
                    const confused = stats.categoricalStats.searchMethod['confused'] || 0;
                    const confusedRate = (confused / total) * 100;
                    
                    if (confusedRate >= 30) {
                      insights.push({
                        type: 'alert',
                        icon: Search,
                        title: 'Difficulté à trouver les assistants',
                        message: `${confusedRate.toFixed(0)}% des utilisateurs ne trouvent pas ou sont confus (${confused}/${total})`,
                        recommendation: 'URGENT : Améliorer la visibilité et l\'accès aux assistants. Considérer un onboarding guidé.'
                      });
                    } else if (sidebarAssistants > searchBar && sidebarAssistants > visualCatalog) {
                      insights.push({
                        type: 'success',
                        icon: Search,
                        title: 'Barre latérale plébiscitée',
                        message: `${((sidebarAssistants / total) * 100).toFixed(0)}% préfèrent la barre latérale (${sidebarAssistants}/${total})`,
                        recommendation: 'La barre latérale est efficace. Envisagez de la mettre davantage en avant.'
                      });
                    } else if (searchBar > 0 && visualCatalog > 0) {
                      const mostUsed = searchBar > visualCatalog ? 'Barre de recherche' : 'Navigation visuelle';
                      const mostUsedCount = Math.max(searchBar, visualCatalog);
                      insights.push({
                        type: 'success',
                        icon: Search,
                        title: `${mostUsed} privilégiée`,
                        message: `${((mostUsedCount / total) * 100).toFixed(0)}% utilisent ${mostUsed.toLowerCase()} (${mostUsedCount}/${total})`,
                        recommendation: 'Méthodes de recherche équilibrées. Maintenez cette diversité d\'accès.'
                      });
                    }
                  }
                  
                  return (
                    <div className="space-y-3">
                      {insights.map((insight, idx) => (
                        <Card 
                          key={idx} 
                          className={`border-l-4 ${
                            insight.type === 'success' ? 'border-l-[var(--success)] bg-green-50/50' :
                            insight.type === 'alert' ? 'border-l-[var(--destructive)] bg-red-50/50' :
                            'border-l-[var(--warning)] bg-yellow-50/50'
                          }`}
                        >
                          <CardContent className="pt-4 pb-4">
                            <div className="flex gap-3">
                              <div className={`p-2 rounded-[var(--radius)] h-fit ${
                                insight.type === 'success' ? 'bg-[var(--success)]/10' :
                                insight.type === 'alert' ? 'bg-[var(--destructive)]/10' :
                                'bg-[var(--warning)]/10'
                              }`}>
                                <insight.icon className={`w-5 h-5 ${
                                  insight.type === 'success' ? 'text-[var(--success)]' :
                                  insight.type === 'alert' ? 'text-[var(--destructive)]' :
                                  'text-[var(--warning)]'
                                }`} />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-[var(--foreground)]">{insight.title}</h4>
                                  <Badge 
                                    variant={insight.type === 'success' ? 'default' : 'destructive'}
                                    className={
                                      insight.type === 'success' ? 'bg-[var(--success)] hover:bg-[var(--success)]' :
                                      insight.type === 'alert' ? 'bg-[var(--destructive)] hover:bg-[var(--destructive)]' :
                                      'bg-[var(--warning)] hover:bg-[var(--warning)]'
                                    }
                                  >
                                    {insight.type === 'success' ? '✓ Bon' : insight.type === 'alert' ? '⚠ Urgent' : '⚡ À surveiller'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-[var(--muted-foreground)]">{insight.message}</p>
                                {insight.recommendation && (
                                  <p className="text-sm text-[var(--foreground)] bg-white/80 p-2 rounded-[var(--radius)] border border-[var(--border)] mt-2">
                                    <strong>→ Action :</strong> {insight.recommendation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })()}

                {/* Card Méthodes de recherche */}
                {stats.categoricalStats.searchMethod && (() => {
                  const total = Object.values(stats.categoricalStats.searchMethod).reduce((sum, c) => sum + c, 0);
                  const COLORS: Record<string, string> = {
                    'search-bar': 'var(--accent)',
                    'visual-catalog': '#9C27B0',
                    'sidebar-assistants': '#2196F3',
                    'confused': 'var(--destructive)'
                  };
                  const data = Object.entries(stats.categoricalStats.searchMethod)
                    .map(([key, count]) => ({
                      key,
                      name: searchMethodLabels[key] || key,
                      value: count,
                      percentage: ((count / total) * 100).toFixed(0),
                      fill: COLORS[key] || 'var(--accent)'
                    }))
                    .sort((a, b) => b.value - a.value);

                  return (
                    <Card className="shadow-md border-[var(--border)] overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-[var(--accent)]/10 rounded-[var(--radius)]">
                            <Search className="w-5 h-5 text-[var(--accent)]" />
                          </div>
                          <h3 className="text-[var(--foreground)]">Méthodes de recherche utilisées</h3>
                        </div>
                        
                        <div className="space-y-3">
                          {data.map((method) => (
                            <div key={method.key} className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--foreground)]">{method.name}</span>
                                <span className="text-[var(--muted-foreground)]">
                                  {method.value} fois ({method.percentage}%)
                                </span>
                              </div>
                              <div className="relative h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                                <div 
                                  className="absolute top-0 left-0 h-full rounded-full transition-all"
                                  style={{ 
                                    width: `${method.percentage}%`,
                                    backgroundColor: method.fill
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Insight rapide */}
                        <div className="mt-4 p-3 bg-[var(--muted)]/30 rounded-[var(--radius)] border border-[var(--border)]">
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {(() => {
                              const mostUsed = data[0];
                              const confused = stats.categoricalStats.searchMethod['confused'] || 0;
                              const confusedRate = (confused / total) * 100;
                              
                              if (confusedRate >= 30) {
                                return `⚠️ ${confusedRate.toFixed(0)}% des utilisateurs ont eu des difficultés à trouver les assistants.`;
                              } else if (mostUsed) {
                                return `✓ La méthode la plus utilisée est "${mostUsed.name}" avec ${mostUsed.percentage}% des utilisations.`;
                              }
                              return 'Distribution équilibrée des méthodes de recherche.';
                            })()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Détails graphiques (optionnel - collapse) */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-[var(--accent)] hover:underline">
                    <ChevronDown className="w-4 h-4" />
                    Voir les graphiques détaillés
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Autonomie */}
                      {stats.categoricalStats.autonomy && (() => {
                        const COLORS = {
                          'autonomous': 'var(--success)',
                          'minimal-help': 'var(--warning)',
                          'guided': '#FF9800',
                          'blocked': 'var(--destructive)'
                        };
                        const data = Object.entries(stats.categoricalStats.autonomy).map(([key, count]) => {
                          const total = Object.values(stats.categoricalStats.autonomy).reduce((sum, c) => sum + c, 0);
                          return {
                            name: autonomyLabels[key] || key,
                            value: count,
                            percentage: ((count / total) * 100).toFixed(0),
                            fill: COLORS[key as keyof typeof COLORS] || 'var(--accent)'
                          };
                        }).sort((a, b) => b.value - a.value);
                        
                        return (
                          <Card className="shadow-md border-[var(--border)]">
                            <CardContent className="pt-6 space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-5 h-5 text-[var(--accent)]" />
                                <h3 className="text-[var(--foreground)]">Niveau d'autonomie</h3>
                              </div>
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percentage }) => `${percentage}%`}
                                    labelLine={false}
                                  >
                                    {data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip 
                                    formatter={(value: any) => [`${value} participant${value > 1 ? 's' : ''}`, 'Nombre']}
                                    contentStyle={{ 
                                      backgroundColor: 'white', 
                                      border: '1px solid var(--border)',
                                      borderRadius: '8px'
                                    }}
                                  />
                                  <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px' }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        );
                      })()}

                      {/* Fluidité du parcours */}
                      {stats.categoricalStats.pathFluidity && (() => {
                        const COLORS = {
                          'direct': 'var(--success)',
                          'hesitant': 'var(--warning)',
                          'hesitations': 'var(--warning)',
                          'erratic': 'var(--destructive)'
                        };
                        const data = Object.entries(stats.categoricalStats.pathFluidity).map(([key, count]) => {
                          const total = Object.values(stats.categoricalStats.pathFluidity).reduce((sum, c) => sum + c, 0);
                          return {
                            name: pathFluidityLabels[key] || key,
                            value: count,
                            percentage: ((count / total) * 100).toFixed(0),
                            fill: COLORS[key as keyof typeof COLORS] || 'var(--accent)'
                          };
                        }).sort((a, b) => b.value - a.value);
                        
                        return (
                          <Card className="shadow-md border-[var(--border)]">
                            <CardContent className="pt-6 space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Navigation className="w-5 h-5 text-[var(--accent)]" />
                                <h3 className="text-[var(--foreground)]">Fluidité du parcours</h3>
                              </div>
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percentage }) => `${percentage}%`}
                                    labelLine={false}
                                  >
                                    {data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip 
                                    formatter={(value: any) => [`${value} participant${value > 1 ? 's' : ''}`, 'Nombre']}
                                    contentStyle={{ 
                                      backgroundColor: 'white', 
                                      border: '1px solid var(--border)',
                                      borderRadius: '8px'
                                    }}
                                  />
                                  <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px' }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        );
                      })()}

                      {/* Réaction émotionnelle */}
                      {stats.categoricalStats.emotionalReaction && (() => {
                        const COLORS = {
                          'positive': 'var(--success)',
                          'neutral': 'var(--warning)',
                          'frustrated': 'var(--destructive)'
                        };
                        const data = Object.entries(stats.categoricalStats.emotionalReaction).map(([key, count]) => {
                          const total = Object.values(stats.categoricalStats.emotionalReaction).reduce((sum, c) => sum + c, 0);
                          return {
                            name: emotionalReactionLabels[key] || key,
                            value: count,
                            percentage: ((count / total) * 100).toFixed(0),
                            fill: COLORS[key as keyof typeof COLORS] || 'var(--accent)'
                          };
                        }).sort((a, b) => b.value - a.value);
                        
                        return (
                          <Card className="shadow-md border-[var(--border)]">
                            <CardContent className="pt-6 space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Smile className="w-5 h-5 text-[var(--accent)]" />
                                <h3 className="text-[var(--foreground)]">Réaction émotionnelle</h3>
                              </div>
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percentage }) => `${percentage}%`}
                                    labelLine={false}
                                  >
                                    {data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip 
                                    formatter={(value: any) => [`${value} participant${value > 1 ? 's' : ''}`, 'Nombre']}
                                    contentStyle={{ 
                                      backgroundColor: 'white', 
                                      border: '1px solid var(--border)',
                                      borderRadius: '8px'
                                    }}
                                  />
                                  <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px' }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        );
                      })()}

                      {/* Durée estimée */}
                      {stats.categoricalStats.duration && (() => {
                        const COLORS = {
                          'very-fast': '#4CAF50',
                          'fast': 'var(--success)',
                          'medium': 'var(--warning)',
                          'long': '#FF9800',
                          'very-long': 'var(--destructive)'
                        };
                        const data = Object.entries(stats.categoricalStats.duration).map(([key, count]) => {
                          const total = Object.values(stats.categoricalStats.duration).reduce((sum, c) => sum + c, 0);
                          return {
                            name: durationLabels[key] || key,
                            value: count,
                            percentage: ((count / total) * 100).toFixed(0),
                            fill: COLORS[key as keyof typeof COLORS] || 'var(--accent)'
                          };
                        }).sort((a, b) => b.value - a.value);
                        
                        return (
                          <Card className="shadow-md border-[var(--border)]">
                            <CardContent className="pt-6 space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-[var(--accent)]" />
                                <h3 className="text-[var(--foreground)]">Durée estimée</h3>
                              </div>
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percentage }) => `${percentage}%`}
                                    labelLine={false}
                                  >
                                    {data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip 
                                    formatter={(value: any) => [`${value} participant${value > 1 ? 's' : ''}`, 'Nombre']}
                                    contentStyle={{ 
                                      backgroundColor: 'white', 
                                      border: '1px solid var(--border)',
                                      borderRadius: '8px'
                                    }}
                                  />
                                  <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px' }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        );
                      })()}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* SECTION 3: PRIORISATION DES ACTIONS */}
          {/* ============================================ */}
          {sessions.length > 0 && (
            <div className="bg-white border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
              <div className="p-6 border-b-2 border-[var(--accent)] bg-[var(--accent)]">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/20 rounded-[var(--radius)]">
                    <Target className="w-6 h-6 text-[var(--accent-foreground)]" />
                  </div>
                  <div>
                    <h2 className="text-[var(--accent-foreground)]">Priorisation des actions</h2>
                    <p className="text-[var(--accent-foreground)]/70">Matrice Impact / Effort pour guider vos améliorations</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {(() => {
                  // Extraire les actions à partir des pain points et quick wins
                  interface PrioritizedAction {
                    title: string;
                    description: string;
                    impact: 'high' | 'low';
                    effort: 'high' | 'low';
                    estimatedTime?: string;
                    affectedTasks?: string[];
                    usersImpacted?: number;
                  }

                  const actions: PrioritizedAction[] = [];

                  // Analyser les tâches pour détecter automatiquement des actions
                  // Basé sur le taux de réussite et les observations
                  Object.entries(stats.taskStats).forEach(([taskId, taskStat]) => {
                    const successRate = (taskStat.successCount / taskStat.totalAttempts) * 100;
                    const taskTitle = taskStat.title;
                    
                    // Collecter les feedbacks pour cette tâche
                    const taskFeedbacks = sessions.flatMap(s => 
                      s.tasks.filter(t => t.taskId === parseInt(taskId))
                    );
                    
                    const frustrationCount = taskFeedbacks.filter(t => 
                      t.emotionalReaction === 'frustrated' || t.emotionalReaction === 'confused'
                    ).length;
                    
                    const needsHelpCount = taskFeedbacks.filter(t => 
                      t.autonomy === 'minimal-help' || t.autonomy === 'guided' || t.autonomy === 'blocked'
                    ).length;

                    // Tâche avec taux de succès < 50% = Impact élevé
                    if (successRate < 50 && frustrationCount >= 2) {
                      actions.push({
                        title: `Refonte navigation : ${taskTitle}`,
                        description: `${frustrationCount} participants frustrés, ${successRate.toFixed(0)}% de réussite`,
                        impact: 'high',
                        effort: 'high',
                        estimatedTime: '2-3 semaines',
                        affectedTasks: [taskTitle],
                        usersImpacted: frustrationCount
                      });
                    }

                    // Tâche avec besoin d'aide fréquent mais réussite > 50%
                    if (successRate >= 50 && successRate < 80 && needsHelpCount >= 3) {
                      actions.push({
                        title: `Ajouter tooltips/guidage : ${taskTitle}`,
                        description: `${needsHelpCount} participants ont besoin d'aide`,
                        impact: 'high',
                        effort: 'low',
                        estimatedTime: '1-2 jours',
                        affectedTasks: [taskTitle],
                        usersImpacted: needsHelpCount
                      });
                    }

                    // Tâche qui fonctionne bien (>80%) avec petits détails à peaufiner
                    if (successRate >= 80 && taskFeedbacks.length > 0) {
                      const minorIssues = taskFeedbacks.filter(t => 
                        t.pathFluidity === 'hesitant' && t.success
                      ).length;

                      if (minorIssues > 0 && minorIssues < 3) {
                        actions.push({
                          title: `Micro-amélioration UX : ${taskTitle}`,
                          description: `${minorIssues} légères hésitations détectées`,
                          impact: 'low',
                          effort: 'low',
                          estimatedTime: '1-2 heures',
                          affectedTasks: [taskTitle],
                          usersImpacted: minorIssues
                        });
                      }
                    }
                  });

                  // Ajouter des actions générales basées sur les patterns globaux
                  const allFeedbacks = sessions.flatMap(s => s.tasks);
                  const totalSearchBarUsers = allFeedbacks.filter(t => Array.isArray(t.searchMethod) && t.searchMethod.includes('search-bar')).length;
                  const totalVisualNavUsers = allFeedbacks.filter(t => Array.isArray(t.searchMethod) && t.searchMethod.includes('visual-catalog')).length;
                  
                  if (totalSearchBarUsers > 0 && totalVisualNavUsers > 0) {
                    const searchBarSuccess = allFeedbacks.filter(t => Array.isArray(t.searchMethod) && t.searchMethod.includes('search-bar') && t.success).length / totalSearchBarUsers * 100;
                    const visualNavSuccess = allFeedbacks.filter(t => Array.isArray(t.searchMethod) && t.searchMethod.includes('visual-catalog') && t.success).length / totalVisualNavUsers * 100;
                    
                    if (Math.abs(searchBarSuccess - visualNavSuccess) > 20) {
                      const betterMethod = searchBarSuccess > visualNavSuccess ? 'Barre de recherche' : 'Navigation visuelle';
                      actions.push({
                        title: `Promouvoir la ${betterMethod}`,
                        description: `${Math.abs(searchBarSuccess - visualNavSuccess).toFixed(0)}% d'écart de réussite entre les méthodes`,
                        impact: 'high',
                        effort: 'low',
                        estimatedTime: '1 jour',
                        usersImpacted: Math.min(totalSearchBarUsers, totalVisualNavUsers)
                      });
                    }
                  }

                  // Si aucune action détectée
                  if (actions.length === 0) {
                    return (
                      <Alert className="border-[var(--accent)]/20 bg-[var(--accent)]/5">
                        <Info className="h-4 w-4 text-[var(--accent)]" />
                        <AlertTitle className="text-[var(--accent)]\">Excellentes performances !</AlertTitle>
                        <AlertDescription className="text-[var(--muted-foreground)]">
                          Aucune action prioritaire détectée. Votre application fonctionne très bien ! Continuez à monitorer les prochains tests.
                        </AlertDescription>
                      </Alert>
                    );
                  }

                  // Organiser les actions par quadrant
                  const quickWins = actions.filter(a => a.impact === 'high' && a.effort === 'low');
                  const majorProjects = actions.filter(a => a.impact === 'high' && a.effort === 'high');
                  const niceToHave = actions.filter(a => a.impact === 'low' && a.effort === 'low');
                  const toAvoid = actions.filter(a => a.impact === 'low' && a.effort === 'high');

                  interface QuadrantProps {
                    title: string;
                    actions: PrioritizedAction[];
                    color: string;
                    borderColor: string;
                    icon: any;
                    bgColor: string;
                  }

                  const Quadrant = ({ title, actions, color, borderColor, icon: Icon, bgColor }: QuadrantProps) => (
                    <div 
                      className={`p-5 rounded-[var(--radius-lg)] border-2 ${bgColor}`}
                      style={{ borderColor }}
                    >
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
                        <Icon className={`w-5 h-5 ${color}`} />
                        <h3 className={`${color}`}>{title}</h3>
                        <Badge variant="outline" className="ml-auto">{actions.length}</Badge>
                      </div>

                      {actions.length === 0 ? (
                        <p className="text-sm text-[var(--muted-foreground)] italic">Aucune action dans cette catégorie</p>
                      ) : (
                        <div className="space-y-3">
                          {actions.map((action, idx) => (
                            <div 
                              key={idx}
                              className="p-3 bg-white rounded-[var(--radius)] border border-[var(--border)]"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-sm text-[var(--foreground)]">{action.title}</h4>
                                {action.estimatedTime && (
                                  <Badge variant="secondary" className="shrink-0 text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {action.estimatedTime}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-[var(--muted-foreground)]">{action.description}</p>
                              {action.usersImpacted && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Users className="w-3 h-3 text-[var(--muted-foreground)]" />
                                  <span className="text-xs text-[var(--muted-foreground)]">
                                    {action.usersImpacted} utilisateur{action.usersImpacted > 1 ? 's' : ''} impacté{action.usersImpacted > 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );

                  return (
                    <div className="space-y-6">
                      {/* Description de la matrice */}
                      <Alert className="border-[var(--accent)]/20 bg-[var(--accent)]/5">
                        <Info className="h-4 w-4 text-[var(--accent)]" />
                        <AlertTitle className="text-[var(--accent)]">Comment utiliser cette matrice ?</AlertTitle>
                        <AlertDescription className="text-[var(--muted-foreground)]">
                          Cette matrice organise les améliorations suggérées selon leur impact utilisateur et l'effort de mise en œuvre. 
                          Commencez par les <span className="text-[var(--success)]">Quick Wins</span>, puis tacklez les <span className="text-[var(--warning)]">Projets majeurs</span>.
                        </AlertDescription>
                      </Alert>

                      {/* Grille 2x2 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* QUADRANT 1: Quick Wins (Impact élevé / Effort faible) */}
                        <Quadrant
                          title="🚀 Quick Wins"
                          actions={quickWins}
                          color="text-[var(--success)]"
                          borderColor="var(--success)"
                          icon={CheckCircle2}
                          bgColor="bg-[var(--success)]/5"
                        />

                        {/* QUADRANT 2: Projets majeurs (Impact élevé / Effort élevé) */}
                        <Quadrant
                          title="🔴 Projets majeurs"
                          actions={majorProjects}
                          color="text-[var(--warning)]"
                          borderColor="var(--warning)"
                          icon={AlertTriangle}
                          bgColor="bg-[var(--warning)]/5"
                        />

                        {/* QUADRANT 3: Nice to have (Impact faible / Effort faible) */}
                        <Quadrant
                          title="💡 Nice to Have"
                          actions={niceToHave}
                          color="text-[var(--info)]"
                          borderColor="var(--info)"
                          icon={Lightbulb}
                          bgColor="bg-[var(--info)]/5"
                        />

                        {/* QUADRANT 4: À éviter (Impact faible / Effort élevé) */}
                        <Quadrant
                          title="⚠️ À éviter"
                          actions={toAvoid}
                          color="text-[var(--muted-foreground)]"
                          borderColor="var(--border)"
                          icon={XCircle}
                          bgColor="bg-[var(--muted)]/30"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* SECTION 4: SYNTHÈSE QUALITATIVE */}
          {/* ============================================ */}
          <div className="bg-white border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
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
          <div className="bg-white border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
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
                              <span className="text-[var(--success)]">Totalement autonome</span>
                              <span className="text-[var(--muted-foreground)]">Vert</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--warning)]">Aide minimale</span>
                              <span className="text-[var(--muted-foreground)]">Orange</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--destructive)]">A dû être guidé / Bloqué</span>
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
                  const allMetricKeys = Object.keys(metricConfig);
                  return allMetricKeys.filter(metricId => {
                    const value = taskData[metricId];
                    if (typeof value !== 'number') return false;
                    
                    // Exclure "ease" (Facilité) pour : Découverte, Questions Post-Test, tâches bonus
                    if (metricId === 'ease') {
                      const taskTitle = taskData.taskTitle || '';
                      const isPostTest = taskTitle === 'Questions Post-Test' || taskTitle.includes('Questions Post-Test');
                      const isDiscovery = taskTitle.includes('Découverte');
                      const isBonus = taskTitle.includes('Créer un assistant') || taskTitle.includes('BONUS');
                      if (isDiscovery || isPostTest || isBonus) {
                        return false;
                      }
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
                
                // Métriques catégorielles importantes : durée, fluidité et autonomie
                // Pas de ces métriques pour la tâche 1 (Phase de découverte) ni la tâche 10 (Questions Post-Test)
                const duration = (task.taskId !== 1 && task.taskId !== 10 && task.duration) ? getDominantValue(task.duration) : null;
                const pathFluidity = (task.taskId !== 1 && task.taskId !== 10 && task.pathFluidity) ? getDominantValue(task.pathFluidity) : null;
                const autonomy = (task.taskId !== 1 && task.taskId !== 10 && task.autonomy) ? getDominantValue(task.autonomy) : null;
                
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
                      {/* Pas de taux de réussite pour la tâche 1 (Découverte) ni la tâche 10 (Questions Post-Test) */}
                      {task.taskId !== 1 && task.taskId !== 10 && (
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
                            autonomy === 'guided' ? 'text-[var(--destructive)]' :
                            autonomy === 'blocked' ? 'text-[var(--destructive)]' :
                            'text-[var(--muted-foreground)]'
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
          <div className="bg-white border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
            <div className="p-6 border-b-2 border-[var(--accent)] bg-[var(--accent)]">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/20 rounded-[var(--radius)]">
                  <Users className="w-6 h-6 text-[var(--accent-foreground)]" />
                </div>
                <div>
                  <h2 className="text-[var(--accent-foreground)]">Sessions détaillées</h2>
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
                      
                      {/* Right: Role Badge */}
                      <Badge variant="secondary" className="bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30 mr-2">{session.participant.role}</Badge>
                      
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
                                  <Upload className="w-4 h-4 mr-2" />
                                  Importer enregistrement
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
                        {/* Recording and Transcription Section */}
                        {(session.recordingUrl || session.transcription) && (
                          <Tabs defaultValue="recording" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="recording" className="flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                Enregistrement
                              </TabsTrigger>
                              <TabsTrigger value="transcription" className="flex items-center gap-2">
                                <FileTextIcon className="w-4 h-4" />
                                Transcription
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="recording" className="space-y-3">
                              {session.recordingUrl ? (
                                <div className="space-y-3">
                                  <div className="bg-black rounded-[var(--radius)] overflow-hidden">
                                    <VideoPlayer
                                      ref={(ref) => (videoPlayerRefs.current[session.id] = ref)}
                                      src={session.recordingUrl}
                                      className="w-full max-h-[400px]"
                                    />
                                  </div>
                                  
                                  {/* Timestamps Navigation */}
                                  {session.timestamps && session.timestamps.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-sm text-[var(--foreground)]">Points clés de la vidéo</h4>
                                      <div className="space-y-2">
                                        {session.timestamps.map((timestamp) => (
                                          <button
                                            key={timestamp.id}
                                            onClick={() => seekToTimestamp(session.id, timestamp.time)}
                                            className="w-full flex items-start gap-3 p-3 bg-[var(--muted)]/20 hover:bg-[var(--muted)]/40 rounded-[var(--radius)] border border-[var(--border)] transition-colors text-left group"
                                          >
                                            <div className="flex items-center justify-center w-8 h-8 bg-[var(--accent)]/20 rounded-[var(--radius-sm)] flex-shrink-0 group-hover:bg-[var(--accent)]/30 transition-colors">
                                              <Play className="w-4 h-4 text-[var(--accent)]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs text-[var(--accent)]">{formatTime(timestamp.time)}</span>
                                                <span className="text-sm text-[var(--foreground)]">{timestamp.label}</span>
                                              </div>
                                              {timestamp.description && (
                                                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                                  {timestamp.description}
                                                </p>
                                              )}
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-6 text-center text-[var(--muted-foreground)] bg-[var(--muted)]/20 rounded-[var(--radius)] border border-dashed border-[var(--border)]">
                                  Aucun enregistrement disponible
                                </div>
                              )}
                            </TabsContent>
                            <TabsContent value="transcription" className="space-y-3">
                              {session.transcription || (session.timestamps && session.timestamps.length > 0) ? (
                                <div className="space-y-3">
                                  {/* Timestamps Quick Navigation */}
                                  {session.timestamps && session.timestamps.length > 0 && (
                                    <div className="p-3 bg-[var(--accent)]/5 rounded-[var(--radius)] border border-[var(--accent)]/20">
                                      <h4 className="text-sm text-[var(--foreground)] mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[var(--accent)]" />
                                        Navigation rapide
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {session.timestamps.map((timestamp) => (
                                          <button
                                            key={timestamp.id}
                                            onClick={() => seekToTimestamp(session.id, timestamp.time)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-[var(--accent)]/10 rounded-[var(--radius-sm)] border border-[var(--border)] transition-colors text-xs group"
                                            title={timestamp.description}
                                          >
                                            <Play className="w-3 h-3 text-[var(--accent)]" />
                                            <span className="text-[var(--accent)]">{formatTime(timestamp.time)}</span>
                                            <span className="text-[var(--foreground)]">{timestamp.label}</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Transcription Text */}
                                  {session.transcription && (
                                    <div className="p-4 bg-[var(--muted)]/20 rounded-[var(--radius)] border border-[var(--border)] max-h-[400px] overflow-y-auto">
                                      <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                                        {session.transcription}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-6 text-center text-[var(--muted-foreground)] bg-[var(--muted)]/20 rounded-[var(--radius)] border border-dashed border-[var(--border)]">
                                  Aucune transcription ou timestamp disponible
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
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

      {/* Upload Recording Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importer l'enregistrement de la session</DialogTitle>
            <DialogDescription>
              Importez la vidéo/audio de la session Google Meets et copiez-collez la transcription automatique.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="recording-file">Fichier vidéo/audio *</Label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  id="recording-file"
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choisir un fichier
                </Button>
                {uploadFile && (
                  <span className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Formats acceptés: MP4, MOV, AVI, MP3, WAV, etc.
              </p>
            </div>

            {/* Transcription */}
            <div className="space-y-2">
              <Label htmlFor="transcription">Transcription (optionnel)</Label>
              <Textarea
                id="transcription"
                placeholder="Collez ici la transcription automatique de Google Meets..."
                value={transcriptionText}
                onChange={(e) => setTranscriptionText(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Astuce: Dans Google Meets, activez les sous-titres puis copiez le texte affich��.
              </p>
            </div>

            {/* Timestamps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Points clés de la vidéo (optionnel)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={autoGenerateTimestamps}
                    className="text-xs h-7"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Auto-générer
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    {timestamps.length} timestamp{timestamps.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
              
              {/* Add Timestamp Form */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-2">
                  <Input
                    placeholder="MM:SS"
                    value={newTimestamp.time}
                    onChange={(e) => setNewTimestamp({ ...newTimestamp, time: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    placeholder="Label (ex: Tâche 1)"
                    value={newTimestamp.label}
                    onChange={(e) => setNewTimestamp({ ...newTimestamp, label: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    placeholder="Description (optionnel)"
                    value={newTimestamp.description}
                    onChange={(e) => setNewTimestamp({ ...newTimestamp, description: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={addTimestamp}
                    className="w-full h-full p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-[var(--muted-foreground)]">
                Ajoutez des repères temporels pour naviguer rapidement dans la vidéo (format: MM:SS ou HH:MM:SS)
              </p>

              {/* Timestamps List */}
              {timestamps.length > 0 && (
                <div className="space-y-2 max-h-[200px] overflow-y-auto p-3 bg-[var(--muted)]/10 rounded-[var(--radius)] border border-[var(--border)]">
                  {timestamps.map((timestamp) => (
                    <div
                      key={timestamp.id}
                      className="flex items-start gap-2 p-2 bg-white rounded-[var(--radius-sm)] border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                      <button
                        onClick={() => editTimestamp(timestamp)}
                        className="flex-1 min-w-0 text-left hover:opacity-75 transition-opacity"
                        title="Cliquer pour éditer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--accent)]">{formatTime(timestamp.time)}</span>
                          <span className="text-sm text-[var(--foreground)]">{timestamp.label}</span>
                        </div>
                        {timestamp.description && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            {timestamp.description}
                          </p>
                        )}
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimestamp(timestamp.id)}
                        className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer"
                      >
                        <XIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
              disabled={!uploadFile || isUploading}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Import en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}