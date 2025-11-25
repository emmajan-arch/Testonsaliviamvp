import { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  CheckCircle2,
  Users,
  Target,
  AlertCircle,
  Clock,
  Shield,
  Lightbulb,
  UserCheck,
  Hash,
  Sparkles,
  Search,
  Compass,
  RefreshCw,
  Settings,
  PlusCircle,
  FolderOpen,
  History,
  ShieldCheck,
  MessageSquare,
  Edit2,
  Save,
  X,
  Trash2,
  Plus,
  GripVertical,
  Eye,
  Zap,
  Heart,
  Star,
  BookOpen,
  FileText,
  TrendingUp,
  Layout,
  Home,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Image,
  Video,
  Music,
  Download,
  Upload,
  Send,
  Inbox,
  Archive,
  Filter,
  Tag,
  Bookmark,
  Share2,
  Link,
  Copy,
  Check,
  XCircle,
  Info,
  HelpCircle,
  Bell,
  Gift,
  Award,
  Trophy,
  Flag,
  Folder,
  File,
  Code,
  Database,
  Server,
  Cloud,
  Wifi,
  Lock,
  Unlock,
  Key,
  Globe,
  Radio,
  Tv,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Printer,
  Camera,
  Mic,
  Volume2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Battery,
  Bluetooth,
  Cast,
  Activity,
  BarChart,
  PieChart,
  Package,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Briefcase,
  Building,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { IconSelector } from "./IconSelector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner@2.0.3";
import { saveProtocolToSupabase, getProtocolFromSupabase, getProtocolTimestamp, saveProtocolSectionsToSupabase, getProtocolSectionsFromSupabase } from "../utils/supabase/protocol";
import { projectId, publicAnonKey } from "../utils/supabase/info";

// Liste des icônes disponibles pour les tâches
const availableIcons = [
  { name: "Search", label: "Recherche" },
  { name: "Compass", label: "Boussole" },
  { name: "RefreshCw", label: "Actualiser" },
  { name: "Settings", label: "Paramètres" },
  { name: "PlusCircle", label: "Ajouter" },
  { name: "FolderOpen", label: "Dossier" },
  { name: "History", label: "Historique" },
  { name: "ShieldCheck", label: "Sécurité" },
  { name: "MessageSquare", label: "Message" },
  { name: "Target", label: "Cible" },
  { name: "Users", label: "Utilisateurs" },
  { name: "AlertCircle", label: "Alerte" },
  { name: "Clock", label: "Horloge" },
  { name: "CheckCircle2", label: "Validation" },
  { name: "Lightbulb", label: "Idée" },
  { name: "Sparkles", label: "Étoiles" },
  { name: "Eye", label: "Observer" },
  { name: "Zap", label: "Rapide" },
  { name: "Heart", label: "Apprécier" },
  { name: "Star", label: "Favori" },
  { name: "BookOpen", label: "Livre" },
  { name: "FileText", label: "Document" },
  { name: "TrendingUp", label: "Tendance" },
  { name: "Layout", label: "Mise en page" },
];

// Fonction pour obtenir le composant d'icône (sans props pour le sélecteur)
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Search":
      return Search;
    case "Compass":
      return Compass;
    case "RefreshCw":
      return RefreshCw;
    case "Settings":
      return Settings;
    case "PlusCircle":
      return PlusCircle;
    case "FolderOpen":
      return FolderOpen;
    case "History":
      return History;
    case "ShieldCheck":
      return ShieldCheck;
    case "MessageSquare":
      return MessageSquare;
    case "Target":
      return Target;
    case "AlertCircle":
      return AlertCircle;
    case "Users":
      return Users;
    case "Clock":
      return Clock;
    case "CheckCircle2":
      return CheckCircle2;
    case "Lightbulb":
      return Lightbulb;
    case "Sparkles":
      return Sparkles;
    case "Eye":
      return Eye;
    case "Zap":
      return Zap;
    case "Heart":
      return Heart;
    case "Star":
      return Star;
    case "BookOpen":
      return BookOpen;
    case "FileText":
      return FileText;
    case "TrendingUp":
      return TrendingUp;
    case "Layout":
      return Layout;
    default:
      return Target; // Icône par défaut
  }
};

const getIcon = (iconName: string) => {
  const iconProps = { className: "w-5 h-5 text-[var(--accent)]" };
  switch (iconName) {
    case "Search":
      return <Search {...iconProps} />;
    case "Compass":
      return <Compass {...iconProps} />;
    case "RefreshCw":
      return <RefreshCw {...iconProps} />;
    case "Settings":
      return <Settings {...iconProps} />;
    case "PlusCircle":
      return <PlusCircle {...iconProps} />;
    case "FolderOpen":
      return <FolderOpen {...iconProps} />;
    case "History":
      return <History {...iconProps} />;
    case "ShieldCheck":
      return <ShieldCheck {...iconProps} />;
    case "MessageSquare":
      return <MessageSquare {...iconProps} />;
    case "Target":
      return <Target {...iconProps} />;
    case "AlertCircle":
      return <AlertCircle {...iconProps} />;
    case "Users":
      return <Users {...iconProps} />;
    case "Clock":
      return <Clock {...iconProps} />;
    case "CheckCircle2":
      return <CheckCircle2 {...iconProps} />;
    case "Lightbulb":
      return <Lightbulb {...iconProps} />;
    case "Sparkles":
      return <Sparkles {...iconProps} />;
    case "Eye":
      return <Eye {...iconProps} />;
    case "Zap":
      return <Zap {...iconProps} />;
    case "Heart":
      return <Heart {...iconProps} />;
    case "Star":
      return <Star {...iconProps} />;
    case "BookOpen":
      return <BookOpen {...iconProps} />;
    case "FileText":
      return <FileText {...iconProps} />;
    case "TrendingUp":
      return <TrendingUp {...iconProps} />;
    case "Layout":
      return <Layout {...iconProps} />;
    case "Send":
      return <Send {...iconProps} />;
    default:
      return null;
  }
};

const defaultProtocolSections = {
  objectives: {
    id: "objectives",
    title: "Objectifs de la recherche",
    icon: "Target",
    items: [
      "Valider l'ergonomie et la fluidité des parcours clés de la V2",
      "Identifier les points de friction, incompréhensions ou comportements inattendus",
      "Évaluer la valeur perçue : l'assistant facilite-t-il réellement l'accès à l'information / aux ressources internes ?"
    ]
  },
  attention: {
    id: "attention",
    title: "Points d'Attention Essentiels",
    icon: "AlertCircle",
    items: [
      "Notez tous les moments d'hésitation (plus de 3 secondes)",
      "Identifiez les éléments que le participant cherche mais ne trouve pas",
      "Observez les clics sur des éléments non cliquables",
      "Relevez les expressions faciales et verbales de frustration ou de confusion",
      "Comptez le nombre de clics nécessaires pour chaque tâche",
      "Demandez au participant de \"penser à voix haute\" pendant les tâches"
    ]
  },
  participants: {
    id: "participants",
    title: "Profil des Participants",
    icon: "Users",
    fields: {
      population: "Collaborateurs Polycea (non experts IA)",
      size: "6–8 participants",
      diversity: "Métiers & usages variés"
    }
  },
  methodology: {
    id: "methodology",
    title: "Méthodologie",
    icon: "Clock",
    testType: "Test modéré (en direct, salle + visio si besoin)",
    duration: "45 min – 1h",
    approach: [
      "Introduction / cadrage (5 min)",
      "Tâches scénarisées à réaliser en autonomie (30–40 min)",
      "Debrief à chaud (10–15 min)"
    ]
  },
  introScript: {
    id: "introScript",
    title: "Script d'introduction modérateur",
    icon: "MessageSquare",
    content: `Bonjour et merci d'avoir accepté de participer à ce test utilisateur.
Avant de commencer, je vais vous expliquer rapidement le déroulé de la session et poser quelques règles simples.

L'objectif aujourd'hui n'est pas de vous tester, mais de tester le produit.
Il n'y a pas de bonne ou de mauvaise réponse, et nous sommes ici pour comprendre votre manière naturelle d'utiliser l'outil.

Pendant la session, je vous donnerai des scénarios à réaliser.
Je vous demanderai de penser à voix haute : dites ce que vous comprenez, ce que vous cherchez, ce qui vous surprend ou ce qui vous gêne.
Cela nous aide beaucoup à comprendre votre parcours et votre logique.

Vous pouvez à tout moment vous tromper, revenir en arrière, hésiter — cela fait partie du test et nous aide à améliorer l'expérience.

De mon côté, je ne pourrai pas vous aider ou vous guider pendant les tâches, sauf si quelque chose est totalement bloquant.
Je pourrai vous poser des petites questions de clarification, mais l'idée est d'observer votre usage spontané.

La session durera environ 45 minutes.
À la fin, nous prendrons 5 à 10 minutes pour échanger sur votre ressenti général.

Tout ce que vous direz restera confidentiel, il n'y a aucune évaluation individuelle, l'objectif est d'améliorer Alivia pour qu'il soit plus simple, clair et utile pour tous.

Avant qu'on commence :
✔ Est-ce que vous êtes prêt(e) ?
✔ Est-ce que vous avez des questions avant de démarrer ?`
  }
};

const testTasks = [
  {
    id: 1,
    title: "Phase de découverte",
    icon: "Search",
    description:
      "Observer la compréhension initiale de l'interface",
    scenario:
      "Vous arrivez pour la première fois sur Alivia. Sans consigne, explorez et décrivez ce que vous comprenez de ce produit.",
    tasks: [
      "Compréhension des rôles des assistants",
      "Lisibilité de l'interface",
      "Confiance dans la souveraineté des données",
    ],
    metrics: [
      "Compréhension globale",
      "Temps de découverte",
      "Impression initiale",
    ],
    tip: "Laissez le participant explorer librement pendant 2-3 minutes sans intervention. Notez ses premiers mots, ses gestes (scroll, clics, hésitations). C'est le moment clé pour capturer l'impression brute.",
  },
  {
    id: 2,
    title: "Trouver le bon assistant",
    icon: "Compass",
    description: "Capacité à identifier l'assistant pertinent",
    scenario:
      "Votre manager vous demande de retrouver un rapport RH interne. Montrez-moi comment vous vous y prendriez.",
    tasks: [
      "Utilisation de la recherche ou du catalogue d'assistants",
      "Capacité à identifier l'assistant pertinent",
      "Temps de décision et critères utilisés",
    ],
    metrics: [
      "Sur une échelle de 1 à 10, à quel point cette action vous a semblé facile ?",
    ],
    tip: "Observez si le participant utilise spontanément la barre de recherche ou préfère naviguer visuellement dans le catalogue. Notez les mots-clés qu'il cherche et s'il comprend les descriptions des assistants.",
  },
  {
    id: 3,
    title: "Envoyer une requête & obtenir une réponse",
    icon: "Send",
    description: "Première interaction concrète avec l'assistant",
    scenario:
      "Vous avez sélectionné l'assistant RH. Posez-lui une question sur les congés payés et observez la réponse.",
    tasks: [
      "Clarté de la zone de saisie",
      "Compréhension de l'interaction chat",
      "Temps de réponse perçu (attente acceptable ou non)",
      "Lisibilité et pertinence de la réponse",
    ],
    metrics: [
      "Facilité d'interaction",
      "Qualité perçue de la réponse",
      "Fluidité de l'échange",
    ],
    tip: "C'est le moment où le participant vit réellement la valeur du produit. Observez sa réaction à la première réponse : surprise, satisfaction, scepticisme ? Note-t-il la vitesse de réponse ? Lit-il la réponse en entier ?",
  },
  {
    id: 4,
    title: "Vérifier la confiance dans la réponse",
    icon: "ShieldCheck",
    description: "Transparence et traçabilité des sources",
    scenario:
      "L'assistant vient de vous donner une réponse. Comment vérifiez-vous la source de cette information ?",
    tasks: [
      "Transparence des citations/sources",
      "Sentiment de confiance ou doute",
      "Facilité d'accès aux sources",
    ],
    metrics: [
      "Transparence",
      "Niveau de confiance",
      "Traçabilité",
    ],
    tip: 'Enjeu majeur de confiance : le participant voit-il spontanément les sources citées ? Clique-t-il dessus pour vérifier ? Exprime-t-il un sentiment de sécurité ("OK, je peux faire confiance, c\'est sourcé") ?',
  },
  {
    id: 5,
    title: "Changer d'assistant",
    icon: "RefreshCw",
    description: "Clarté de la navigation entre assistants",
    scenario:
      "Vous réalisez que l'assistant choisi n'est pas le bon. Comment faites-vous pour en changer ?",
    tasks: [
      "Clarté de la navigation",
      "Sentiment de perte de contexte ou non",
      "Fluidité du changement",
    ],
    metrics: [
      "Facilité de navigation",
      "Conservation du contexte",
      "Rapidité",
    ],
    tip: "Attention : c'est ici qu'on teste si le retour arrière est intuitif. Le participant cherche-t-il un bouton \"Retour\", un menu, ou clique-t-il sur le logo ? Observez son niveau de frustration ou de confiance.",
  },
  {
    id: 6,
    title: "Paramétrer un assistant",
    icon: "Settings",
    description: "Compréhension et utilisation des paramètres",
    scenario:
      "Configurez un assistant pour répondre en anglais, uniquement à partir de la documentation interne, pas d'internet.",
    tasks: [
      "Compréhension des paramètres disponibles",
      "Fluidité de l'action",
      "Frustrations ou options manquantes",
    ],
    metrics: [
      "Clarté des options",
      "Facilité de configuration",
      "Succès de la tâche",
    ],
    tip: "Vérifiez si le participant comprend l'impact de chaque paramètre. Pose-t-il des questions du type \"Si je désactive internet, où va-t-il chercher l'info ?\" ? C'est un indicateur de compréhension du modèle mental.",
  },
  {
    id: 7,
    title: "Choisir les sources nécessaires",
    icon: "FolderOpen",
    description:
      "Capacité à filtrer et sélectionner les sources",
    scenario:
      "Vous voulez que l'assistant se base uniquement sur 2 répertoires internes précis. Comment procédez-vous ?",
    tasks: [
      "Capacité à filtrer/choisir les sources",
      "Compréhension du rôle des sources dans la réponse",
      "Clarté de l'interface de sélection",
    ],
    metrics: [
      "Facilité de sélection",
      "Compréhension du système",
      "Efficacité",
    ],
    tip: "Point crucial pour la souveraineté des données : le participant comprend-il qu'en sélectionnant des sources spécifiques, il contrôle d'où vient l'information ? C'est un élément de différenciation clé d'Alivia.",
  },
  {
    id: 8,
    title: "Trouver l'historique",
    icon: "History",
    description: "Retrouver et continuer une conversation",
    scenario:
      "Retrouvez la conversation que vous avez eue hier avec un assistant et continuez-la.",
    tasks: [
      "Capacité à retrouver un historique",
      "Compréhension du fil / continuité des conversations",
      "Facilité de reprise",
    ],
    metrics: [
      "Découvrabilité de l'historique",
      "Clarté du fil",
      "Continuité",
    ],
    tip: "Testez si l'historique est facilement accessible (icône, menu, sidebar ?). Le participant doit-il chercher longtemps ? Une fois trouvé, comprend-il comment reprendre là où il s'était arrêté ?",
  },
  {
    id: 9,
    title: "Questions Post-Test",
    icon: "MessageSquare",
    description: "Débriefing à chaud et retour d'expérience global",
    scenario:
      "Prenez 10-15 minutes pour recueillir le retour d'expérience du participant sur l'ensemble du test.",
    tasks: [
      "Impression générale : 3 adjectifs pour décrire l'expérience",
      "Points appréciés du produit",
      "Points frustrants ou bloquants",
      "Compréhension de la souveraineté des données",
      "Valeur perçue dans le quotidien professionnel",
    ],
    metrics: [
      "Facilité",
      "Satisfaction globale",
      "Clarté de la value proposition",
      "Intention d'usage",
    ],
    tip: "C'est le moment de synthèse : laissez le participant s'exprimer librement. Encouragez-le à partager ses vraies impressions sans filtre. Les insights les plus précieux viennent souvent ici.",
  },
];

// Type pour le drag & drop
const TASK_TYPE = 'TASK';

// Composant d'une tâche draggable
interface DraggableTaskProps {
  task: any;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  deleteTask: (taskId: number) => void;
  isEditing: boolean;
  editedTask: any;
  startEditing: (task: any) => void;
  cancelEditing: () => void;
  saveTask: () => void;
  updateEditedTaskField: (field: string, value: any) => void;
  addObservationPoint: () => void;
  removeObservationPoint: (index: number) => void;
  updateObservationPoint: (index: number, value: string) => void;
  addMetric: () => void;
  removeMetric: (index: number) => void;
  updateMetric: (index: number, value: string) => void;
  getIcon: (iconName: string) => JSX.Element | null;
  isReadOnly: boolean;
}

function DraggableTask({
  task,
  index,
  moveTask,
  deleteTask,
  isEditing,
  editedTask,
  startEditing,
  cancelEditing,
  saveTask,
  updateEditedTaskField,
  addObservationPoint,
  removeObservationPoint,
  updateObservationPoint,
  addMetric,
  removeMetric,
  updateMetric,
  getIcon,
  isReadOnly,
}: DraggableTaskProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [{ handlerId }, drop] = useDrop({
    accept: TASK_TYPE,
    canDrop: () => !isReadOnly,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: TASK_TYPE,
    canDrag: () => !isReadOnly,
    item: () => {
      return { id: task.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  const currentTask = isEditing ? editedTask : task;

  return (
    <div ref={ref} data-handler-id={handlerId} style={{ opacity }} className="mb-3">
      <AccordionItem
        value={`task-${task.id}`}
        className="border border-[var(--border)] rounded-[var(--radius)] px-4 bg-[var(--card)] !border-b"
      >
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2 w-full">
            {!isReadOnly && (
              <div className="cursor-move text-[var(--muted-foreground)] hover:text-[var(--accent)]">
                <GripVertical className="w-5 h-5" />
              </div>
            )}
            <Badge
              variant="outline"
              className="shrink-0 border-[var(--accent)]/30 text-[var(--accent)]"
            >
              {index + 1}
            </Badge>
            {getIcon(task.icon)}
            <span className="text-[var(--foreground)] text-[16px] flex-1">
              {task.title}
            </span>
            {!isReadOnly && !isEditing ? (
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(task);
                  }}
                  className="text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </div>
              </>
            ) : !isReadOnly ? (
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelEditing();
                  }}
                  className="text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    saveTask();
                  }}
                  className="text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                </div>
              </>
            ) : null}
          </div>
        </AccordionTrigger>
      <AccordionContent className="pt-4 space-y-4">
        {/* Titre */}
        <div className="space-y-2">
          <Label className="text-[var(--foreground)]">Titre</Label>
          {isEditing ? (
            <Input
              value={currentTask.title}
              onChange={(e) => updateEditedTaskField('title', e.target.value)}
              className="border-[var(--border)]"
            />
          ) : (
            <p className="text-[var(--foreground)]">{currentTask.title}</p>
          )}
        </div>

        {/* Sélecteur d'icône */}
        {isEditing && (
          <IconSelector
            value={currentTask.icon}
            onChange={(iconName) => updateEditedTaskField('icon', iconName)}
          />
        )}

        {/* Description */}
        <div className="space-y-2">
          <h2 className="text-[var(--foreground)] text-[16px] font-bold">
            Description
          </h2>
          {isEditing ? (
            <Textarea
              value={currentTask.description}
              onChange={(e) => updateEditedTaskField('description', e.target.value)}
              className="border-[var(--border)] min-h-[60px]"
            />
          ) : (
            <p className="text-[var(--muted-foreground)] text-[15px]">
              {currentTask.description}
            </p>
          )}
        </div>

        {/* Scénario */}
        <div className="space-y-2">
          <h2 className="text-[var(--foreground)] text-[16px] font-bold">
            Scénario
          </h2>
          {isEditing ? (
            <Textarea
              value={currentTask.scenario}
              onChange={(e) => updateEditedTaskField('scenario', e.target.value)}
              className="border-[var(--border)] min-h-[80px]"
            />
          ) : (
            <p className="text-[var(--muted-foreground)] text-[15px] italic">
              "{currentTask.scenario}"
            </p>
          )}
        </div>

        {/* Points d'observation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[var(--foreground)] text-[16px] font-bold">
              Points d'observation
            </h2>
            {isEditing && (
              <Button
                onClick={addObservationPoint}
                variant="ghost"
                size="sm"
                className="gap-1 text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-2">
              {currentTask.tasks.map((t: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={t}
                    onChange={(e) => updateObservationPoint(idx, e.target.value)}
                    className="border-[var(--border)]"
                  />
                  <Button
                    onClick={() => removeObservationPoint(idx)}
                    variant="ghost"
                    size="sm"
                    className="text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {currentTask.tasks.map((t: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-[var(--muted-foreground)]"
                >
                  <span className="text-[var(--accent)] mt-1">•</span>
                  <span className="text-[15px]">{t}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Métriques clés / Questions à poser */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[var(--foreground)] text-[16px] font-bold">
              {task.id === 2 ? "Questions à poser" : "Métriques clés"}
            </h2>
            {isEditing && (
              <Button
                onClick={addMetric}
                variant="ghost"
                size="sm"
                className="gap-1 text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-2">
              {currentTask.metrics.map((metric: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={metric}
                    onChange={(e) => updateMetric(idx, e.target.value)}
                    className="border-[var(--border)]"
                  />
                  <Button
                    onClick={() => removeMetric(idx)}
                    variant="ghost"
                    size="sm"
                    className="text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentTask.metrics.map((metric: string, idx: number) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-[var(--muted)]/20 text-[var(--foreground)] border border-[var(--border)] text-[14px]"
                >
                  {task.id === 2 ? `Question : "${metric}"` : metric}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Conseil observateur */}
        <div className="space-y-2">
          <h2 className="text-[var(--foreground)] text-[16px] font-bold">
            Conseil observateur
          </h2>
          {isEditing ? (
            <Textarea
              value={currentTask.tip}
              onChange={(e) => updateEditedTaskField('tip', e.target.value)}
              className="border-[var(--border)] min-h-[80px]"
            />
          ) : (
            <div className="bg-[var(--accent)]/10 p-4 rounded-[0px] border-l-4 border-[var(--accent)]">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-[var(--accent)] mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-[rgb(30,14,98)] mb-1 font-bold">
                    Conseil observateur
                  </h2>
                  <p className="text-[rgb(30,14,98)] text-sm">
                    {currentTask.tip}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
    
    {/* Dialog de confirmation de suppression */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent className="bg-[var(--card)] border-[var(--border)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[var(--foreground)]">
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[var(--muted-foreground)]">
            Êtes-vous sûr de vouloir supprimer la tâche "{task.title}" ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[var(--border)] text-[var(--foreground)]">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              deleteTask(task.id);
              setShowDeleteDialog(false);
            }}
            className="bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}

interface ProtocolViewProps {
  isReadOnly?: boolean;
}

export function ProtocolView({ isReadOnly = false }: ProtocolViewProps) {
  const PROTOCOL_VERSION = '2.1'; // Version du protocole - incrémentez pour forcer la mise à jour
  
  const [tasks, setTasks] = useState<any[]>(testTasks);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [openTaskId, setOpenTaskId] = useState<string>("");
  const [newlyCreatedTaskId, setNewlyCreatedTaskId] = useState<number | null>(null);
  
  // États pour les sections du protocole
  const [protocolSections, setProtocolSections] = useState<any>(null);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const [editingProtocolSection, setEditingProtocolSection] = useState<string | null>(null);
  const [editedProtocolSection, setEditedProtocolSection] = useState<any>(null);
  const [openProtocolSection, setOpenProtocolSection] = useState<string>("");
  const [showDeleteProtocolDialog, setShowDeleteProtocolDialog] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

  // Charger les tâches depuis Supabase au démarrage
  useEffect(() => {
    const loadProtocol = async () => {
      console.log(`🔄 ${isReadOnly ? 'VIEWER' : 'ADMIN'} - Chargement du protocole...`);
      try {
        const data = await getProtocolFromSupabase();
        console.log('📥 Données reçues de Supabase:', data);
        
        if (data?.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
          console.log(`✅ ${data.tasks.length} tâches chargées depuis Supabase`);
          setTasks(data.tasks);
          localStorage.setItem('protocolTasks', JSON.stringify(data.tasks));
          // Initialiser le timestamp
          if (data.timestamp) {
            setLastSyncTimestamp(data.timestamp);
            console.log('⏱️ Timestamp initialisé:', data.timestamp);
          }
        } else {
          // Si pas de données dans Supabase, initialiser avec les tâches par défaut
          console.log('⚠️ Pas de données dans Supabase, initialisation avec les tâches par défaut');
          setTasks(testTasks);
          localStorage.setItem('protocolTasks', JSON.stringify(testTasks));
          // Sauvegarder dans Supabase (seulement en mode admin)
          if (!isReadOnly) {
            const result = await saveProtocolToSupabase(testTasks);
            if (result?.timestamp) {
              setLastSyncTimestamp(result.timestamp);
            }
          }
        }
      } catch (error: any) {
        // Ne pas afficher d'erreur console si c'est juste un timeout ou une erreur réseau (comportements normaux)
        if (!error.message?.includes('Timeout') && !error.message?.includes('Failed to fetch')) {
          console.error('❌ Erreur lors du chargement depuis Supabase:', error);
        } else if (error.message?.includes('Timeout')) {
          console.log('⏱️ Timeout lors du chargement du protocole (le serveur est occupé)');
        } else if (error.message?.includes('Failed to fetch')) {
          console.log('🌐 Serveur Supabase non accessible, utilisation du cache local');
        }
        
        // En mode viewer, NE PAS utiliser localStorage car il peut être obsolète
        if (isReadOnly) {
          console.log('👁️ VIEWER: Utilisation des tâches par défaut en attendant');
          setTasks(testTasks);
        } else {
          // Admin peut utiliser localStorage comme fallback
          const savedTasks = localStorage.getItem('protocolTasks');
          if (savedTasks) {
            try {
              const parsed = JSON.parse(savedTasks);
              if (Array.isArray(parsed) && parsed.length > 0) {
                console.log(`📦 ${parsed.length} tâches récupérées du cache local`);
                setTasks(parsed);
              } else {
                setTasks(testTasks);
              }
            } catch (e) {
              setTasks(testTasks);
            }
          } else {
            setTasks(testTasks);
          }
        }
      }
    };

    loadProtocol();
  }, [isReadOnly]);

  // Charger les sections depuis Supabase
  useEffect(() => {
    const loadSections = async () => {
      try {
        const supabaseSections = await getProtocolSectionsFromSupabase();
        if (supabaseSections) {
          console.log('📋 Sections chargées depuis Supabase');
          setProtocolSections(supabaseSections);
          localStorage.setItem('protocolSections', JSON.stringify(supabaseSections));
        } else {
          // Pas de sections dans Supabase, utiliser les valeurs par défaut
          console.log('⚠️ Pas de sections dans Supabase, initialisation avec les valeurs par défaut');
          setProtocolSections(defaultProtocolSections);
          localStorage.setItem('protocolSections', JSON.stringify(defaultProtocolSections));
          // Sauvegarder les sections par défaut dans Supabase (seulement en mode admin)
          if (!isReadOnly) {
            await saveProtocolSectionsToSupabase(defaultProtocolSections);
            console.log('✅ Sections par défaut sauvegardées dans Supabase');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des sections:', error);
        // Fallback sur localStorage
        const savedSections = localStorage.getItem('protocolSections');
        if (savedSections) {
          try {
            const parsed = JSON.parse(savedSections);
            setProtocolSections(parsed);
          } catch (e) {
            setProtocolSections(defaultProtocolSections);
          }
        } else {
          setProtocolSections(defaultProtocolSections);
        }
      } finally {
        setSectionsLoaded(true);
      }
    };

    loadSections();
  }, [isReadOnly]);

  // Polling pour vérifier les mises à jour (toutes les 3 secondes)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const timestamp = await getProtocolTimestamp();
        
        // Log de debug pour voir ce qui se passe
        console.log(`🔄 [${isReadOnly ? 'VIEWER' : 'ADMIN'}] Polling - Local: ${lastSyncTimestamp}, Serveur: ${timestamp}`);
        
        // Si on a un timestamp et qu'il est différent du notre
        if (timestamp && lastSyncTimestamp && timestamp !== lastSyncTimestamp) {
          console.log(`🔔 [${isReadOnly ? 'VIEWER' : 'ADMIN'}] Mise à jour détectée! Ancien: ${lastSyncTimestamp}, Nouveau: ${timestamp}`);
          
          // Il y a eu une mise à jour, recharger les tâches
          const data = await getProtocolFromSupabase();
          console.log('📥 Données reçues:', data);
          
          if (data?.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
            console.log(`✅ ${data.tasks.length} tâches chargées depuis Supabase`);
            setTasks(data.tasks);
            localStorage.setItem('protocolTasks', JSON.stringify(data.tasks));
            setLastSyncTimestamp(timestamp);
            
            // Recharger aussi les sections
            const supabaseSections = await getProtocolSectionsFromSupabase();
            if (supabaseSections) {
              setProtocolSections(supabaseSections);
              localStorage.setItem('protocolSections', JSON.stringify(supabaseSections));
              console.log('📋 Sections mises à jour depuis Supabase');
            }
            
            if (isReadOnly) {
              toast.info('Protocole mis à jour par un administrateur', {
                description: `${data.tasks.length} tâches chargées`
              });
            }
            console.log('✅ Protocole synchronisé depuis Supabase');
          }
        } else if (timestamp && !lastSyncTimestamp) {
          // Première synchronisation après chargement, initialiser le timestamp
          console.log(`⏱️ [${isReadOnly ? 'VIEWER' : 'ADMIN'}] Initialisation du timestamp: ${timestamp}`);
          setLastSyncTimestamp(timestamp);
        }
      } catch (error) {
        console.error(`❌ [${isReadOnly ? 'VIEWER' : 'ADMIN'}] Erreur de polling:`, error);
      }
    }, 3000); // Vérifier toutes les 3 secondes

    return () => clearInterval(interval);
  }, [lastSyncTimestamp, isReadOnly]);

  // Sauvegarder les tâches dans localStorage ET Supabase
  const saveTasks = async (updatedTasks: any[]) => {
    console.log('💾 Sauvegarde de', updatedTasks.length, 'tâches', isReadOnly ? '(mode lecture seule - pas de sync Supabase)' : '');
    setTasks(updatedTasks);
    localStorage.setItem('protocolTasks', JSON.stringify(updatedTasks));
    
    // Sauvegarder dans Supabase (seulement en mode admin)
    if (!isReadOnly) {
      try {
        console.log('☁️ Envoi vers Supabase...');
        const result = await saveProtocolToSupabase(updatedTasks);
        if (result?.timestamp) {
          setLastSyncTimestamp(result.timestamp);
          console.log('✅ Sauvegardé avec timestamp:', result.timestamp);
          toast.success('Protocole synchronisé', {
            description: 'Visible par tous les viewers'
          });
        }
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde dans Supabase:', error);
        toast.error('Erreur lors de la synchronisation');
      }
    }
  };

  const moveTask = (dragIndex: number, hoverIndex: number) => {
    const dragTask = tasks[dragIndex];
    const newTasks = [...tasks];
    newTasks.splice(dragIndex, 1);
    newTasks.splice(hoverIndex, 0, dragTask);
    saveTasks(newTasks);
  };

  // Rafraîchir manuellement depuis Supabase
  const refreshFromSupabase = async () => {
    try {
      console.log('🔄 Rafraîchissement manuel depuis Supabase...');
      const data = await getProtocolFromSupabase();
      if (data?.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
        setTasks(data.tasks);
        localStorage.setItem('protocolTasks', JSON.stringify(data.tasks));
        if (data.timestamp) {
          setLastSyncTimestamp(data.timestamp);
        }
        console.log(`✅ ${data.tasks.length} tâches rechargées`);
      }
      
      // Recharger aussi les sections
      const supabaseSections = await getProtocolSectionsFromSupabase();
      if (supabaseSections) {
        setProtocolSections(supabaseSections);
        localStorage.setItem('protocolSections', JSON.stringify(supabaseSections));
        console.log('✅ Sections rechargées');
      }
      
      toast.success('Protocole rafraîchi', {
        description: 'Dernières données chargées depuis le serveur'
      });
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
      toast.error('Erreur lors du rafraîchissement');
    }
  };

  // Debug - afficher le contenu de Supabase
  const debugSupabase = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a80e52b7/protocol/debug`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      console.log('🔍 DEBUG SUPABASE:', data);
      console.log('📊 Nombre de tâches dans la base:', data.tasksCount);
      console.log('📋 Tâches:', data.protocol?.tasks);
      toast.info(`Base de données: ${data.tasksCount} tâches`, {
        description: 'Voir la console pour plus de détails'
      });
    } catch (error) {
      console.error('❌ Erreur debug:', error);
    }
  };

  const startEditing = (task: any) => {
    setEditingTaskId(task.id);
    setEditedTask({ ...task });
    setOpenTaskId(`task-${task.id}`); // Ouvrir l'accordion automatiquement
  };

  const cancelEditing = () => {
    // Si on annule l'édition d'une tâche nouvellement créée, on la supprime
    if (editingTaskId !== null && editingTaskId === newlyCreatedTaskId) {
      const updatedTasks = tasks.filter(t => t.id !== editingTaskId);
      saveTasks(updatedTasks);
      setNewlyCreatedTaskId(null);
    }
    
    setEditingTaskId(null);
    setEditedTask(null);
    setOpenTaskId(""); // Fermer l'accordion
  };

  const saveTask = () => {
    if (editedTask) {
      const updatedTasks = tasks.map(t => t.id === editedTask.id ? editedTask : t);
      saveTasks(updatedTasks);
      setEditingTaskId(null);
      setEditedTask(null);
      // Réinitialiser l'indicateur de nouvelle tâche une fois sauvegardée
      if (editedTask.id === newlyCreatedTaskId) {
        setNewlyCreatedTaskId(null);
      }
    }
  };

  const updateEditedTaskField = (field: string, value: any) => {
    setEditedTask({ ...editedTask, [field]: value });
  };

  const addObservationPoint = () => {
    const newTasks = [...(editedTask.tasks || []), ""];
    setEditedTask({ ...editedTask, tasks: newTasks });
  };

  const removeObservationPoint = (index: number) => {
    const newTasks = editedTask.tasks.filter((_: any, i: number) => i !== index);
    setEditedTask({ ...editedTask, tasks: newTasks });
  };

  const updateObservationPoint = (index: number, value: string) => {
    const newTasks = [...editedTask.tasks];
    newTasks[index] = value;
    setEditedTask({ ...editedTask, tasks: newTasks });
  };

  const addMetric = () => {
    const newMetrics = [...(editedTask.metrics || []), ""];
    setEditedTask({ ...editedTask, metrics: newMetrics });
  };

  const removeMetric = (index: number) => {
    const newMetrics = editedTask.metrics.filter((_: any, i: number) => i !== index);
    setEditedTask({ ...editedTask, metrics: newMetrics });
  };

  const updateMetric = (index: number, value: string) => {
    const newMetrics = [...editedTask.metrics];
    newMetrics[index] = value;
    setEditedTask({ ...editedTask, metrics: newMetrics });
  };

  const deleteTask = (taskId: number) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    saveTasks(updatedTasks);
    // Annuler l'édition si on supprime la tâche en cours d'édition
    if (editingTaskId === taskId) {
      setEditingTaskId(null);
      setEditedTask(null);
    }
  };

  const addNewTask = () => {
    const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
    const newTask = {
      id: newId,
      title: "Nouvelle tâche",
      icon: "Target",
      description: "Description de la tâche",
      scenario: "Décrivez le scénario ici...",
      tasks: ["Point d'observation 1"],
      metrics: ["Métrique 1"],
      tip: "Conseil pour le facilitateur...",
    };
    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    
    // Mettre automatiquement la nouvelle tâche en mode édition et l'ouvrir
    setEditingTaskId(newId);
    setEditedTask({ ...newTask });
    setOpenTaskId(`task-${newId}`);
    // Marquer cette tâche comme nouvellement créée
    setNewlyCreatedTaskId(newId);
  };

  // Fonctions pour gérer l'édition des sections du protocole
  const startEditingProtocolSection = (sectionId: string) => {
    setEditingProtocolSection(sectionId);
    setEditedProtocolSection({ ...protocolSections[sectionId] });
    setOpenProtocolSection(sectionId);
  };

  const cancelEditingProtocolSection = () => {
    setEditingProtocolSection(null);
    setEditedProtocolSection(null);
    setOpenProtocolSection("");
  };

  const saveProtocolSection = async () => {
    if (editedProtocolSection) {
      const updatedSections = {
        ...protocolSections,
        [editedProtocolSection.id]: editedProtocolSection
      };
      console.log('💾 Sauvegarde de la section:', editedProtocolSection.id);
      setProtocolSections(updatedSections);
      localStorage.setItem('protocolSections', JSON.stringify(updatedSections));
      
      // Sauvegarder dans Supabase (seulement en mode admin)
      if (!isReadOnly) {
        try {
          console.log('☁️ Envoi des sections vers Supabase...');
          await saveProtocolSectionsToSupabase(updatedSections);
          console.log('✅ Sections sauvegardées dans Supabase');
          
          // Déclencher aussi une sauvegarde des tâches pour mettre à jour le timestamp
          // (cela permet aux viewers de détecter le changement via le polling)
          const result = await saveProtocolToSupabase(tasks);
          if (result?.timestamp) {
            setLastSyncTimestamp(result.timestamp);
          }
          
          toast.success('Section mise à jour', {
            description: 'Synchronisée avec tous les viewers'
          });
        } catch (error) {
          console.error('❌ Erreur lors de la sauvegarde des sections:', error);
          toast.error('Erreur lors de la synchronisation de la section');
        }
      }
      
      setEditingProtocolSection(null);
      setEditedProtocolSection(null);
    }
  };

  const updateProtocolSectionField = (field: string, value: any) => {
    setEditedProtocolSection({ ...editedProtocolSection, [field]: value });
  };

  const addProtocolSectionItem = () => {
    if (editedProtocolSection.items) {
      const newItems = [...editedProtocolSection.items, ""];
      setEditedProtocolSection({ ...editedProtocolSection, items: newItems });
    } else if (editedProtocolSection.approach) {
      const newApproach = [...editedProtocolSection.approach, ""];
      setEditedProtocolSection({ ...editedProtocolSection, approach: newApproach });
    }
  };

  const removeProtocolSectionItem = (index: number) => {
    if (editedProtocolSection.items) {
      const newItems = editedProtocolSection.items.filter((_: any, i: number) => i !== index);
      setEditedProtocolSection({ ...editedProtocolSection, items: newItems });
    } else if (editedProtocolSection.approach) {
      const newApproach = editedProtocolSection.approach.filter((_: any, i: number) => i !== index);
      setEditedProtocolSection({ ...editedProtocolSection, approach: newApproach });
    }
  };

  const updateProtocolSectionItem = (index: number, value: string) => {
    if (editedProtocolSection.items) {
      const newItems = [...editedProtocolSection.items];
      newItems[index] = value;
      setEditedProtocolSection({ ...editedProtocolSection, items: newItems });
    } else if (editedProtocolSection.approach) {
      const newApproach = [...editedProtocolSection.approach];
      newApproach[index] = value;
      setEditedProtocolSection({ ...editedProtocolSection, approach: newApproach });
    }
  };

  // Charger les sections du protocole depuis localStorage au démarrage
  useEffect(() => {
    const savedSections = localStorage.getItem('protocolSections');
    if (savedSections) {
      setProtocolSections(JSON.parse(savedSections));
    }
  }, []);

  // Fonction pour exporter les tâches en PDF
  const exportTasksToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Fonction pour ajouter du texte avec wrapping
    const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return lines.length * (fontSize * 0.35); // Retourne la hauteur utilisée
    };

    // Fonction pour vérifier si on doit ajouter une nouvelle page
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // En-tête du document
    doc.setFontSize(18);
    doc.setTextColor(30, 14, 98); // Couleur accent
    doc.text('Protocole de Test UX - Alivia', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, margin, yPosition);
    yPosition += 15;

    // Parcourir toutes les tâches
    tasks.forEach((task, index) => {
      checkNewPage(40);

      // Numéro et titre de la tâche
      doc.setFontSize(14);
      doc.setTextColor(30, 14, 98);
      const titleHeight = addText(`Tâche ${index + 1} : ${task.title}`, margin, yPosition, maxWidth, 14);
      yPosition += titleHeight + 5;

      // Description
      if (task.description) {
        checkNewPage(15);
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const descHeight = addText(task.description, margin, yPosition, maxWidth, 10);
        yPosition += descHeight + 5;
      }

      // Scénario
      checkNewPage(20);
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('Scénario :', margin, yPosition);
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const scenarioHeight = addText(task.scenario, margin + 5, yPosition, maxWidth - 5, 10);
      yPosition += scenarioHeight + 5;

      // Points d'observation
      if (task.tasks && task.tasks.length > 0) {
        checkNewPage(20);
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('Points d\'observation :', margin, yPosition);
        yPosition += 6;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        task.tasks.forEach((point: string) => {
          checkNewPage(10);
          const pointHeight = addText(`• ${point}`, margin + 5, yPosition, maxWidth - 5, 10);
          yPosition += pointHeight + 3;
        });
        yPosition += 2;
      }

      // Métriques
      if (task.metrics && task.metrics.length > 0) {
        checkNewPage(20);
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('Métriques :', margin, yPosition);
        yPosition += 6;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        task.metrics.forEach((metric: string) => {
          checkNewPage(10);
          const metricHeight = addText(`• ${metric}`, margin + 5, yPosition, maxWidth - 5, 10);
          yPosition += metricHeight + 3;
        });
        yPosition += 2;
      }

      // Conseil observateur
      if (task.tip) {
        checkNewPage(20);
        doc.setFontSize(11);
        doc.setTextColor(30, 14, 98);
        doc.text('💡 Conseil observateur :', margin, yPosition);
        yPosition += 6;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const tipHeight = addText(task.tip, margin + 5, yPosition, maxWidth - 5, 10);
        yPosition += tipHeight + 10;
      }

      // Séparateur entre les tâches (sauf pour la dernière)
      if (index < tasks.length - 1) {
        checkNewPage(15);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 15;
      }
    });

    // Sauvegarder le PDF
    doc.save(`Protocole-Test-UX-Alivia-${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);
    
    toast.success('PDF exporté avec succès !');
  };

  return (
    <div className="space-y-6">
      {/* Bannière de correction du Score d'adoption - Admin seulement */}
      {!isReadOnly && (() => {
        const needsFix = (() => {
          try {
            const savedProtocol = localStorage.getItem('testProtocol');
            if (!savedProtocol) return false;
            const protocol = JSON.parse(savedProtocol);
            const task9 = protocol.tasks?.find((t: any) => t.id === 9);
            return task9 && (!task9.metricsFields || !task9.metricsFields.includes('postTestAdoption'));
          } catch {
            return false;
          }
        })();
        
        if (needsFix) {
          return (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-[var(--radius-lg)] p-4 shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                  <div className="space-y-2">
                    <p className="text-red-900 font-medium">⚠️ Score d'adoption manquant</p>
                    <p className="text-sm text-red-800">
                      Le champ "Score d'adoption" n'est pas configuré dans la tâche 9 "Questions Post-Test".
                      Cliquez sur "Restaurer" pour le rétablir automatiquement.
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      toast.loading('Restauration en cours...');
                      const { fixProtocolTask9 } = await import('../utils/fix-protocol');
                      const result = await fixProtocolTask9();
                      
                      toast.dismiss();
                      
                      if (result.success && result.needsReload) {
                        toast.success('✅ Score d\'adoption restauré !', {
                          description: 'Le protocole a été corrigé. Rechargez la page.',
                          duration: 10000,
                          action: {
                            label: 'Recharger maintenant',
                            onClick: () => window.location.reload()
                          }
                        });
                      } else if (result.success && !result.needsReload) {
                        toast.info('Le protocole est déjà correct');
                        setTimeout(() => window.location.reload(), 1500);
                      } else {
                        toast.error('Erreur', {
                          description: result.message
                        });
                      }
                    } catch (error) {
                      toast.dismiss();
                      console.error('Erreur restauration:', error);
                      toast.error('Erreur lors de la restauration', {
                        description: String(error)
                      });
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-[var(--radius-md)] hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restaurer
                </button>
              </div>
            </div>
          );
        }
        return null;
      })()}

      <Card className="shadow-sm border-[var(--border)] mt-[0px] mr-[0px] mb-[24px] ml-[0px]">
        <CardHeader className="bg-[var(--accent)] rounded-t-[var(--radius-lg)] p-[24px]">
          <CardTitle className="text-[var(--accent-foreground)]">
            Protocole de test utilisateur
          </CardTitle>
          <CardDescription className="text-white/70 text-[16px]">
            Test d'utilisabilité pour valider l'ergonomie et la fluidité
            des parcours clés
          </CardDescription>
        </CardHeader>
        <CardContent className="py-[0px] px-[24px]">
          {!sectionsLoaded || !protocolSections ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)] mx-auto"></div>
                <p className="text-sm text-[var(--muted-foreground)]">Chargement du protocole...</p>
              </div>
            </div>
          ) : (
          <Accordion 
            type="single" 
            collapsible 
            className="w-full space-y-3"
            value={openProtocolSection}
            onValueChange={setOpenProtocolSection}
          >
            {/* Section Objectifs */}
            <AccordionItem
              value="objectives"
              className="border border-[var(--border)] rounded-[var(--radius)] px-4 bg-[var(--card)]"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <Target className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-[var(--foreground)] text-[16px] flex-1">
                    {editingProtocolSection === 'objectives' && editedProtocolSection ? editedProtocolSection.title : protocolSections.objectives.title}
                  </span>
                  {!isReadOnly && (
                    editingProtocolSection !== 'objectives' ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingProtocolSection('objectives');
                        }}
                        className="text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditingProtocolSection();
                          }}
                          className="text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            saveProtocolSection();
                          }}
                          className="text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </div>
                      </>
                    )
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                {editingProtocolSection === 'objectives' && editedProtocolSection ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Titre de la section</Label>
                      <Input
                        value={editedProtocolSection.title}
                        onChange={(e) => updateProtocolSectionField('title', e.target.value)}
                        className="border-[var(--border)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Objectifs</Label>
                      {editedProtocolSection.items.map((item: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <Textarea
                            value={item}
                            onChange={(e) => updateProtocolSectionItem(index, e.target.value)}
                            className="border-[var(--border)] flex-1"
                            rows={2}
                          />
                          <Button
                            onClick={() => removeProtocolSectionItem(index)}
                            variant="outline"
                            size="sm"
                            className="border-[var(--border)] text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={addProtocolSectionItem}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-[var(--border)] text-[var(--accent)]"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter un objectif
                      </Button>
                    </div>
                  </>
                ) : (
                  <ul className="space-y-3">
                    {protocolSections.objectives.items.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[var(--accent)] mt-1 flex-shrink-0" />
                        <span className="text-[var(--foreground)]">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Section Points d'Attention */}
            <AccordionItem
              value="attention"
              className="border border-[var(--border)] rounded-[var(--radius)] px-4 bg-[var(--card)]"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <AlertCircle className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-[var(--foreground)] text-[16px] flex-1">
                    {editingProtocolSection === 'attention' && editedProtocolSection ? editedProtocolSection.title : protocolSections.attention.title}
                  </span>
                  {!isReadOnly && (editingProtocolSection !== 'attention' ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingProtocolSection('attention');
                      }}
                      className="text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditingProtocolSection();
                        }}
                        className="text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          saveProtocolSection();
                        }}
                        className="text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </div>
                    </>
                  ))}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-2 bg-[var(--muted)]/20 p-4 rounded-[var(--radius)] border border-[var(--border)]">
                  <p className="text-[var(--foreground)]">• <strong>Notez tous les moments d'hésitation</strong> (plus de 3 secondes)</p>
                  <p className="text-[var(--foreground)]">• <strong>Identifiez les éléments</strong> que le participant cherche mais ne trouve pas</p>
                  <p className="text-[var(--foreground)]">• <strong>Observez les clics</strong> sur des éléments non cliquables</p>
                  <p className="text-[var(--foreground)]">• <strong>Relevez les expressions faciales et verbales</strong> de frustration ou de confusion</p>
                  <p className="text-[var(--foreground)]">• <strong>Comptez le nombre de clics</strong> nécessaires pour chaque tâche</p>
                  <p className="text-[var(--foreground)]">• <strong>Demandez au participant de "penser à voix haute"</strong> pendant les tâches</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section Profil des Participants */}
            <AccordionItem
              value="participants"
              className="border border-[var(--border)] rounded-[var(--radius)] px-4 bg-[var(--card)]"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <Users className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-[var(--foreground)] text-[16px] flex-1">
                    {editingProtocolSection === 'participants' && editedProtocolSection ? editedProtocolSection.title : protocolSections.participants.title}
                  </span>
                  {!isReadOnly && (editingProtocolSection !== 'participants' ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingProtocolSection('participants');
                      }}
                      className="text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditingProtocolSection();
                        }}
                        className="text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          saveProtocolSection();
                        }}
                        className="text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </div>
                    </>
                  ))}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                {editingProtocolSection === 'participants' && editedProtocolSection ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Titre de la section</Label>
                      <Input
                        value={editedProtocolSection.title}
                        onChange={(e) => updateProtocolSectionField('title', e.target.value)}
                        className="border-[var(--border)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Population</Label>
                      <Input
                        value={editedProtocolSection.fields.population}
                        onChange={(e) => updateProtocolSectionField('fields', { ...editedProtocolSection.fields, population: e.target.value })}
                        className="border-[var(--border)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Taille</Label>
                      <Input
                        value={editedProtocolSection.fields.size}
                        onChange={(e) => updateProtocolSectionField('fields', { ...editedProtocolSection.fields, size: e.target.value })}
                        className="border-[var(--border)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Diversité</Label>
                      <Input
                        value={editedProtocolSection.fields.diversity}
                        onChange={(e) => updateProtocolSectionField('fields', { ...editedProtocolSection.fields, diversity: e.target.value })}
                        className="border-[var(--border)]"
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-start gap-3 p-3 bg-[var(--muted)]/20 rounded-[var(--radius)] border border-[var(--border)]">
                      <div className="p-2 bg-[var(--accent)]/10 rounded-[var(--radius-sm)] flex-shrink-0">
                        <UserCheck className="w-4 h-4 text-[var(--accent)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[var(--foreground)] text-sm mb-1 text-[16px]">Population</p>
                        <p className="text-[var(--muted-foreground)] text-xs text-[14px]">
                          {protocolSections.participants.fields.population}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-[var(--muted)]/20 rounded-[var(--radius)] border border-[var(--border)]">
                      <div className="p-2 bg-[var(--accent)]/10 rounded-[var(--radius-sm)] flex-shrink-0">
                        <Hash className="w-4 h-4 text-[var(--accent)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[var(--foreground)] text-sm mb-1 text-[16px]">Taille</p>
                        <p className="text-[var(--muted-foreground)] text-xs text-[14px]">
                          {protocolSections.participants.fields.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-[var(--muted)]/20 rounded-[var(--radius)] border border-[var(--border)]">
                      <div className="p-2 bg-[var(--accent)]/10 rounded-[var(--radius-sm)] flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[var(--foreground)] text-sm mb-1 text-[16px]">Diversité</p>
                        <p className="text-[var(--muted-foreground)] text-xs text-[14px]">
                          {protocolSections.participants.fields.diversity}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Section Méthodologie */}
            <AccordionItem
              value="methodology"
              className="border border-[var(--border)] rounded-[var(--radius)] px-4 bg-[var(--card)]"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <Clock className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-[var(--foreground)] text-[16px] flex-1">
                    {editingProtocolSection === 'methodology' && editedProtocolSection ? editedProtocolSection.title : protocolSections.methodology.title}
                  </span>
                  {!isReadOnly && (editingProtocolSection !== 'methodology' ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingProtocolSection('methodology');
                      }}
                      className="text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditingProtocolSection();
                        }}
                        className="text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          saveProtocolSection();
                        }}
                        className="text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </div>
                    </>
                  ))}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                {editingProtocolSection === 'methodology' && editedProtocolSection ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Titre de la section</Label>
                      <Input
                        value={editedProtocolSection.title}
                        onChange={(e) => updateProtocolSectionField('title', e.target.value)}
                        className="border-[var(--border)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Type de test</Label>
                      <Input
                        value={editedProtocolSection.testType}
                        onChange={(e) => updateProtocolSectionField('testType', e.target.value)}
                        className="border-[var(--border)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Durée par session</Label>
                      <Input
                        value={editedProtocolSection.duration}
                        onChange={(e) => updateProtocolSectionField('duration', e.target.value)}
                        className="border-[var(--border)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Approche (étapes)</Label>
                      {editedProtocolSection.approach.map((step: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={step}
                            onChange={(e) => updateProtocolSectionItem(index, e.target.value)}
                            className="border-[var(--border)] flex-1"
                          />
                          <Button
                            onClick={() => removeProtocolSectionItem(index)}
                            variant="outline"
                            size="sm"
                            className="border-[var(--border)] text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={addProtocolSectionItem}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-[var(--border)] text-[var(--accent)]"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter une étape
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-[var(--muted)]/20 rounded-[var(--radius)] border border-[var(--border)]">
                        <h2 className="text-[var(--foreground)] mb-1">
                          Type de test
                        </h2>
                        <p className="text-[var(--muted-foreground)] text-sm">
                          {protocolSections.methodology.testType}
                        </p>
                      </div>
                      <div className="p-3 bg-[var(--muted)]/20 rounded-[var(--radius)] border border-[var(--border)]">
                        <h2 className="text-[var(--foreground)] mb-1">
                          Durée par session
                        </h2>
                        <p className="text-[var(--muted-foreground)] text-sm">
                          {protocolSections.methodology.duration}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-[var(--foreground)]">
                        Approche :
                      </h2>
                      <div className="space-y-2">
                        {protocolSections.methodology.approach.map((step: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-[var(--muted)]/20 rounded-[var(--radius)] border border-[var(--border)]">
                            <Badge variant="outline" className="mt-1 border-[var(--accent)]/30 text-[var(--accent)]">
                              {index + 1}
                            </Badge>
                            <p className="text-[var(--foreground)]">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Section Script d'introduction modérateur */}
            <AccordionItem
              value="introScript"
              className="border border-[var(--border)] rounded-[var(--radius)] px-4 bg-[var(--card)]"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-[var(--foreground)] text-[16px] flex-1">
                    {editingProtocolSection === 'introScript' && editedProtocolSection ? editedProtocolSection.title : protocolSections.introScript.title}
                  </span>
                  {!isReadOnly && (editingProtocolSection !== 'introScript' ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingProtocolSection('introScript');
                      }}
                      className="text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditingProtocolSection();
                        }}
                        className="text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          saveProtocolSection();
                        }}
                        className="text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 shrink-0 p-2 rounded-[var(--radius)] cursor-pointer transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </div>
                    </>
                  ))}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                {editingProtocolSection === 'introScript' && editedProtocolSection ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Titre de la section</Label>
                      <Input
                        value={editedProtocolSection.title}
                        onChange={(e) => updateProtocolSectionField('title', e.target.value)}
                        className="border-[var(--border)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Contenu du script</Label>
                      <Textarea
                        value={editedProtocolSection.content}
                        onChange={(e) => updateProtocolSectionField('content', e.target.value)}
                        className="border-[var(--border)] min-h-[400px]"
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-[var(--accent)]/5 rounded-[var(--radius)] border border-[var(--accent)]/20">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-[var(--foreground)] whitespace-pre-line">
                        {protocolSections.introScript.content}
                      </p>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-[var(--border)] m-[0px]">
        <CardHeader className="bg-[var(--accent)] rounded-t-[var(--radius-lg)] p-[24px]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-[var(--accent-foreground)]">
                Scénarios & Tâches
              </CardTitle>
              <CardDescription className="text-white/70">
                10 scénarios pour couvrir tous les parcours clés
                d'Alivia (incluant le débriefing post-test)
              </CardDescription>
            </div>
            <Button
              onClick={exportTasksToPDF}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              Exporter PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-[0px] px-[24px]">
          <DndProvider backend={HTML5Backend}>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={openTaskId}
              onValueChange={setOpenTaskId}
            >
              {tasks.map((task, index) => {
                const isEditing = editingTaskId === task.id;

                return (
                  <DraggableTask
                    key={task.id}
                    task={task}
                    index={index}
                    moveTask={moveTask}
                    deleteTask={deleteTask}
                    isEditing={isEditing}
                    editedTask={editedTask}
                    startEditing={startEditing}
                    cancelEditing={cancelEditing}
                    saveTask={saveTask}
                    updateEditedTaskField={updateEditedTaskField}
                    addObservationPoint={addObservationPoint}
                    removeObservationPoint={removeObservationPoint}
                    updateObservationPoint={updateObservationPoint}
                    addMetric={addMetric}
                    removeMetric={removeMetric}
                    updateMetric={updateMetric}
                    getIcon={getIcon}
                    isReadOnly={isReadOnly}
                  />
                );
              })}
            </Accordion>
            {!isReadOnly && (
              <div className="pt-4 pb-6 space-y-3">
                <Button
                  onClick={addNewTask}
                  variant="outline"
                  className="w-full gap-2 border-[var(--border)] border-dashed text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] hover:border-[var(--accent)] m-[0px] py-[16px] p-[16px]"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une tâche
                </Button>
                
              </div>
            )}
          </DndProvider>
        </CardContent>
      </Card>
    </div>
  );
}