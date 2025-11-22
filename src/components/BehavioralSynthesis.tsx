import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Zap, 
  Smile, 
  Navigation, 
  Clock, 
  Search, 
  AlertTriangle, 
  Lightbulb,
  CheckCircle2,
  ThumbsUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { AnimatedChart } from './AnimatedChart';

interface CategoricalStats {
  autonomy?: Record<string, number>;
  emotionalReaction?: Record<string, number>;
  pathFluidity?: Record<string, number>;
  duration?: Record<string, number>;
  searchMethod?: Record<string, number>;
}

interface TaskStat {
  taskId: number;
  taskTitle: string;
  successRate: number;
  ease?: number;
  autonomy?: Record<string, number>;
  count: number;
}

interface Stats {
  taskStats: TaskStat[];
  categoricalStats: CategoricalStats;
}

interface BehavioralSynthesisProps {
  categoricalStats: CategoricalStats;
  stats: Stats;
  globalSuccessRate: number;
  globalEaseScore?: number;
  globalAutonomyRate?: number;
}

interface Insight {
  type: 'success' | 'warning' | 'alert';
  icon: any;
  title: string;
  message: string;
  recommendation?: string;
}

const searchMethodLabels: Record<string, string> = {
  'search-bar': 'Barre de recherche',
  'visual-catalog': 'Navigation visuelle',
  'sidebar-assistants': 'Barre latérale',
  'confused': 'Confus / Non trouvé'
};

export function BehavioralSynthesis({ categoricalStats, stats, globalSuccessRate, globalEaseScore, globalAutonomyRate }: BehavioralSynthesisProps) {
  const insights: Insight[] = [];
  
  // Préparer les données pour les graphiques
  const tasksWithEase = stats.taskStats.filter(ts => 
    ts.taskId !== 1 && 
    ts.taskId !== 9 && 
    ts.ease !== undefined
  );

  const taskAutonomyData = stats.taskStats
    .filter(ts => ts.taskId !== 1 && ts.taskId !== 9 && ts.autonomy)
    .map(ts => {
      const distribution = ts.autonomy || {};
      const total = Object.values(distribution).reduce((sum: number, c: any) => sum + (c as number), 0);
      
      return {
        name: `T${ts.taskId}`,
        fullName: ts.taskTitle.length > 38 ? ts.taskTitle.substring(0, 38) + '...' : ts.taskTitle,
        'Autonome': ((distribution['autonomous'] || 0) / total * 100) || 0,
        'Aide minimale': ((distribution['minimal-help'] || 0) / total * 100) || 0,
        'Guidé': ((distribution['guided'] || 0) / total * 100) || 0,
        'Bloqué': ((distribution['blocked'] || 0) / total * 100) || 0,
      };
    });
  
  // Analyse Autonomie
  if (categoricalStats.autonomy) {
    const total = Object.values(categoricalStats.autonomy).reduce((sum, c) => sum + c, 0);
    const autonomous = categoricalStats.autonomy['autonomous'] || 0;
    const minimalHelp = categoricalStats.autonomy['minimal-help'] || 0;
    const guided = categoricalStats.autonomy['guided'] || 0;
    const blocked = categoricalStats.autonomy['blocked'] || 0;
    const aloneRate = ((autonomous + minimalHelp) / total) * 100;
    
    if (aloneRate >= 70) {
      insights.push({
        type: 'success',
        icon: Zap,
        title: 'Excellente autonomie',
        message: `${aloneRate.toFixed(0)}% des tâches réussies sans ou avec peu d'aide (${autonomous + minimalHelp}/${total})`,
        recommendation: 'Les utilisateurs naviguent intuitivement. Maintenez cette clarté dans les futures fonctionnalités.'
      });
    } else if (aloneRate < 50) {
      insights.push({
        type: 'alert',
        icon: AlertTriangle,
        title: 'Aide fréquemment nécessaire',
        message: `Seulement ${aloneRate.toFixed(0)}% d'autonomie (${guided} guidés, ${blocked} bloqués)`,
        recommendation: 'URGENT : Ajouter des tooltips contextuels, simplifier les parcours et renforcer l\'onboarding.'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: Zap,
        title: 'Autonomie moyenne',
        message: `${aloneRate.toFixed(0)}% d'autonomie - ${guided + blocked} utilisateurs ont eu besoin d'aide`,
        recommendation: 'Ajoutez des messages d\'aide inline et des exemples concrets pour guider les utilisateurs.'
      });
    }
  }
  
  // Analyse Réaction Émotionnelle
  if (categoricalStats.emotionalReaction) {
    const total = Object.values(categoricalStats.emotionalReaction).reduce((sum, c) => sum + c, 0);
    const positive = categoricalStats.emotionalReaction['positive'] || 0;
    const neutral = categoricalStats.emotionalReaction['neutral'] || 0;
    const frustrated = categoricalStats.emotionalReaction['frustrated'] || 0;
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
  if (categoricalStats.pathFluidity) {
    const total = Object.values(categoricalStats.pathFluidity).reduce((sum, c) => sum + c, 0);
    const direct = categoricalStats.pathFluidity['direct'] || 0;
    const hesitant = categoricalStats.pathFluidity['hesitant'] || 0;
    const erratic = categoricalStats.pathFluidity['erratic'] || 0;
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
  if (categoricalStats.duration) {
    const total = Object.values(categoricalStats.duration).reduce((sum, c) => sum + c, 0);
    const fast = (categoricalStats.duration['very-fast'] || 0) + (categoricalStats.duration['fast'] || 0);
    const slow = (categoricalStats.duration['long'] || 0) + (categoricalStats.duration['very-long'] || 0);
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
  if (categoricalStats.searchMethod) {
    const total = Object.values(categoricalStats.searchMethod).reduce((sum, c) => sum + c, 0);
    const searchBar = categoricalStats.searchMethod['search-bar'] || 0;
    const visualCatalog = categoricalStats.searchMethod['visual-catalog'] || 0;
    const sidebarAssistants = categoricalStats.searchMethod['sidebar-assistants'] || 0;
    const confused = categoricalStats.searchMethod['confused'] || 0;
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
    <div className="space-y-6">
      {/* ========================================== */}
      {/* GRAPHIQUES DÉTAILLÉS AVEC MÉTRIQUES */}
      {/* ========================================== */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Graphique 1: Taux de réussite */}
        <Card className="overflow-hidden border-[var(--border)] shadow-sm">
          <div className="bg-white p-5 border-b border-[var(--border)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--success)]/10 rounded-[var(--radius-lg)] bg-[rgba(30,14,98,0.1)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                </div>
                <div>
                  <h3 className="text-[var(--foreground)]">Taux de réussite par tâche</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                    Identification des tâches problématiques
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-[var(--primary)] text-white border-[var(--primary)]">
                {stats.taskStats.filter(ts => ts.taskId !== 1 && ts.taskId !== 9).length} tâches
              </Badge>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="bg-[var(--muted)]/20 rounded-[var(--radius-lg)] p-4">
              <AnimatedChart duration={1000}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart 
                    data={stats.taskStats
                      .filter(ts => ts.taskId !== 1 && ts.taskId !== 9)
                      .sort((a, b) => a.successRate - b.successRate)
                      .map(ts => ({
                        name: `T${ts.taskId}`,
                        fullName: ts.taskTitle,
                        value: ts.successRate,
                        fill: ts.successRate >= 80 ? 'var(--success)' : ts.successRate >= 60 ? 'var(--warning)' : 'var(--destructive)'
                      }))}
                    margin={{ top: 20, right: 15, left: 15, bottom: 40 }}
                  >
                  <defs>
                    <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--success)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--success)" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="warningGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--warning)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--warning)" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="destructiveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--destructive)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--muted-foreground)" 
                    tick={{ fontSize: 11 }}
                    angle={0}
                    tickLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    unit="%" 
                    stroke="var(--muted-foreground)" 
                    tick={{ fontSize: 11 }}
                    tickLine={{ stroke: 'var(--border)' }}
                  />
                  <RechartsTooltip 
                    formatter={(value: any, name: any, props: any) => [`${value.toFixed(1)}%`, props.payload.fullName]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    cursor={{ fill: 'var(--accent)', opacity: 0.05 }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={50}>
                    {stats.taskStats
                      .filter(ts => ts.taskId !== 1 && ts.taskId !== 9)
                      .sort((a, b) => a.successRate - b.successRate)
                      .map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.successRate >= 80 
                              ? 'url(#successGradient)' 
                              : entry.successRate >= 60 
                                ? 'url(#warningGradient)' 
                                : 'url(#destructiveGradient)'
                          }
                        />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              </AnimatedChart>
            </div>
            
            {/* Métrique globale dans la même card */}
            <div className="p-4 bg-[var(--success)]/5 border border-[var(--success)]/20 rounded-[var(--radius-lg)]">
              <p className="text-sm text-[var(--foreground)] mb-2">
                <span className="font-semibold">{globalSuccessRate.toFixed(0)}% des tâches réussies</span> sans ou avec peu d'aide
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Les utilisateurs naviguent intuitivement. Maintenez cette clarté dans les futures fonctionnalités.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Graphique 2: Score de facilité */}
        {tasksWithEase.length > 0 && globalEaseScore !== undefined && (
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <div className="bg-white p-5 border-b border-[var(--border)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent)]/10 rounded-[var(--radius-lg)]">
                    <ThumbsUp className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="text-[var(--foreground)]">Score de facilité par tâche</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                      Perception utilisateur sur la difficulté
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-[var(--primary)] text-white border-[var(--primary)]">
                  {tasksWithEase.length} tâches
                </Badge>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="bg-[var(--muted)]/20 rounded-[var(--radius-lg)] p-4">
                <AnimatedChart duration={1000}>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart 
                      data={tasksWithEase
                        .sort((a, b) => (a.ease || 0) - (b.ease || 0))
                        .map(ts => ({
                          name: `T${ts.taskId}`,
                          fullName: ts.taskTitle,
                          value: ts.ease || 0,
                          fill: (ts.ease || 0) >= 7 ? 'var(--success)' : (ts.ease || 0) >= 5 ? 'var(--warning)' : 'var(--destructive)'
                        }))}
                      margin={{ top: 20, right: 15, left: 15, bottom: 40 }}
                    >
                    <defs>
                      <linearGradient id="easeSuccessGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--success)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--success)" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="easeWarningGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--warning)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--warning)" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="easeDestructiveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--destructive)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="var(--muted-foreground)"
                      tick={{ fontSize: 11 }}
                      angle={0}
                      tickLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis 
                      domain={[0, 10]} 
                      stroke="var(--muted-foreground)"
                      tick={{ fontSize: 11 }}
                      tickLine={{ stroke: 'var(--border)' }}
                    />
                    <RechartsTooltip 
                      formatter={(value: any, name: any, props: any) => [`${value.toFixed(1)}/10`, props.payload.fullName]}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      cursor={{ fill: 'var(--accent)', opacity: 0.05 }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={50}>
                      {tasksWithEase
                        .sort((a, b) => (a.ease || 0) - (b.ease || 0))
                        .map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              (entry.ease || 0) >= 7 
                                ? 'url(#easeSuccessGradient)' 
                                : (entry.ease || 0) >= 5 
                                  ? 'url(#easeWarningGradient)' 
                                  : 'url(#easeDestructiveGradient)'
                            }
                          />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </AnimatedChart>
              </div>
              
              {/* Métrique globale dans la même card */}
              <div className="p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-[var(--radius-lg)] bg-[rgba(50,98,14,0.05)]">
                <p className="text-sm text-[var(--foreground)] mb-2">
                  <span className="font-semibold">Facilité moyenne : {globalEaseScore.toFixed(1)}/10</span>
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Les utilisateurs trouvent l'interface intuitive. Continuez à prioriser la simplicité.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Graphique 3: Autonomie - Pleine largeur */}
      {categoricalStats.autonomy && taskAutonomyData.length > 0 && globalAutonomyRate !== undefined && (
        <Card className="overflow-hidden border-[var(--border)] shadow-sm">
          <div className="bg-white p-5 border-b border-[var(--border)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--warning)]/10 rounded-[var(--radius-lg)] bg-[rgba(30,14,98,0.1)]">
                  <Zap className="w-4 h-4 text-[var(--warning)]" />
                </div>
                <div>
                  <h3 className="text-[var(--foreground)]">Niveau d'autonomie par tâche</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                    Besoin d'accompagnement des utilisateurs
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-[var(--primary)] text-white border-[var(--primary)]">
                {taskAutonomyData.length} tâches
              </Badge>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="bg-[var(--muted)]/20 rounded-[var(--radius-lg)] p-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart 
                  data={taskAutonomyData}
                  margin={{ top: 40, right: 15, left: 15, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="autonomousGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--success)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--success)" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="minimalHelpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--warning)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--warning)" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="guidedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF9800" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FF9800" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--destructive)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 11 }}
                    angle={0}
                    tickLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    unit="%" 
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 11 }}
                    tickLine={{ stroke: 'var(--border)' }}
                  />
                  <RechartsTooltip 
                    formatter={(value: any, name: any, props: any) => [`${value.toFixed(0)}%`, props.payload.fullName]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    cursor={{ fill: 'var(--accent)', opacity: 0.05 }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={32}
                    iconType="circle"
                    wrapperStyle={{ 
                      fontSize: '11px', 
                      paddingBottom: '12px'
                    }}
                  />
                  <Bar dataKey="Autonome" stackId="a" fill="url(#autonomousGradient)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Aide minimale" stackId="a" fill="url(#minimalHelpGradient)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Guidé" stackId="a" fill="url(#guidedGradient)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Bloqué" stackId="a" fill="url(#blockedGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Métrique globale dans la même card */}
            <div className="p-4 bg-[var(--warning)]/5 border border-[var(--warning)]/20 rounded-[var(--radius-lg)]">
              <p className="text-sm text-[var(--foreground)] mb-2">
                <span className="font-semibold">Autonomie complète : {globalAutonomyRate.toFixed(0)}%</span>
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Excellente autonomie générale. Les utilisateurs comprennent naturellement le fonctionnement.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================== */}
      {/* INSIGHTS COMPORTEMENTAUX */}
      {/* ========================================== */}
      <div className="pt-4">
        <h4 className="text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[var(--accent)]" />
          Insights et recommandations
        </h4>
        
        {/* KPI Comportementaux compacts côte à côte */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* KPI Autonomie */}
          {categoricalStats.autonomy && (() => {
            const total = Object.values(categoricalStats.autonomy).reduce((sum, c) => sum + c, 0);
            const autonomous = categoricalStats.autonomy['autonomous'] || 0;
            const minimalHelp = categoricalStats.autonomy['minimal-help'] || 0;
            const aloneRate = ((autonomous + minimalHelp) / total) * 100;
            
            return (
              <Card className="overflow-hidden border-[var(--border)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2 text-[var(--muted-foreground)]">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Autonomie</span>
                  </div>
                  <p className="text-2xl text-[var(--success)] mb-1">{aloneRate.toFixed(0)}%</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Sans ou avec peu d'aide
                  </p>
                </CardContent>
              </Card>
            );
          })()}
          
          {/* KPI Réaction émotionnelle */}
          {categoricalStats.emotionalReaction && (() => {
            const total = Object.values(categoricalStats.emotionalReaction).reduce((sum, c) => sum + c, 0);
            const positive = categoricalStats.emotionalReaction['positive'] || 0;
            const positiveRate = (positive / total) * 100;
            
            return (
              <Card className="overflow-hidden border-[var(--border)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2 text-[var(--muted-foreground)]">
                    <Smile className="w-4 h-4" />
                    <span className="text-sm">Expérience émotionnelle</span>
                  </div>
                  <p className="text-2xl text-[var(--success)] mb-1">{positiveRate.toFixed(0)}%</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Réactions positives
                  </p>
                </CardContent>
              </Card>
            );
          })()}
          
          {/* KPI Navigation fluide */}
          {categoricalStats.pathFluidity && (() => {
            const total = Object.values(categoricalStats.pathFluidity).reduce((sum, c) => sum + c, 0);
            const direct = categoricalStats.pathFluidity['direct'] || 0;
            const directRate = (direct / total) * 100;
            
            return (
              <Card className="overflow-hidden border-[var(--border)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2 text-[var(--muted-foreground)]">
                    <Navigation className="w-4 h-4" />
                    <span className="text-sm">Navigation fluide</span>
                  </div>
                  <p className="text-2xl text-[var(--success)] mb-1">{directRate.toFixed(0)}%</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Parcours directs
                  </p>
                </CardContent>
              </Card>
            );
          })()}
        </div>
        
        <div className="space-y-3">
          {/* Card Méthodes de recherche - simple */}
      {categoricalStats.searchMethod && (() => {
        const total = Object.values(categoricalStats.searchMethod).reduce((sum, c) => sum + c, 0);
        const COLORS: Record<string, string> = {
          'search-bar': 'var(--accent)',
          'visual-catalog': '#9C27B0',
          'sidebar-assistants': '#2196F3',
          'confused': 'var(--destructive)'
        };
        const data = Object.entries(categoricalStats.searchMethod)
          .map(([key, count]) => ({
            key,
            name: searchMethodLabels[key] || key,
            value: count,
            percentage: ((count / total) * 100).toFixed(0),
            fill: COLORS[key] || 'var(--accent)'
          }))
          .sort((a, b) => b.value - a.value);

        return (
          <Card className="border-[var(--border)] border-l-4 border-l-[var(--accent)] bg-[var(--accent)]/5" key="search-methods">
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Search className="w-5 h-5 text-[var(--accent)]" />
                <h4 className="text-[var(--foreground)]">Méthodes de recherche utilisées</h4>
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
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${method.percentage}%`,
                          backgroundColor: method.fill
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}
        </div>
      </div>
    </div>
  );
}