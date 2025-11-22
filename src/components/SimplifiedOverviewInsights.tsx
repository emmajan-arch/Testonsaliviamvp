import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

interface TaskStat {
  taskId: number;
  taskTitle: string;
  successRate: number;
  ease?: number;
  valuePropositionClarity?: number;
  firstImpression?: number;
}

interface SimplifiedOverviewInsightsProps {
  taskStats: TaskStat[];
  insights: {
    strengths: string[];
    improvements: string[];
  };
}

export function SimplifiedOverviewInsights({ taskStats, insights }: SimplifiedOverviewInsightsProps) {
  // Identifier les tâches problématiques
  const problematicTasks = taskStats.filter((task: any) => {
    if (!task) return false;
    
    const hasLowSuccess = task.successRate < 70;
    const hasLowEase = task.ease !== undefined && task.ease < 6;
    const hasLowComprehension = task.valuePropositionClarity !== undefined && task.valuePropositionClarity < 6;
    const hasLowFirstImpression = task.firstImpression !== undefined && task.firstImpression < 6;
    
    return hasLowSuccess || hasLowEase || hasLowComprehension || hasLowFirstImpression;
  }).map((task: any) => {
    const issues: string[] = [];
    if (task.successRate < 70) issues.push(`Réussite : ${task.successRate.toFixed(0)}%`);
    if (task.ease !== undefined && task.ease < 6) issues.push(`Facilité : ${task.ease.toFixed(1)}/10`);
    if (task.valuePropositionClarity !== undefined && task.valuePropositionClarity < 6) issues.push(`Compréhension : ${task.valuePropositionClarity.toFixed(1)}/10`);
    if (task.firstImpression !== undefined && task.firstImpression < 6) issues.push(`Impression : ${task.firstImpression.toFixed(1)}/10`);
    
    return {
      ...task,
      issues
    };
  });

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Tâches problématiques */}
      <Card className="bg-red-50/50 border-l-4 border-l-[var(--destructive)] border border-red-200/50">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-[var(--radius-lg)] bg-[var(--destructive)]/10 shrink-0">
              <AlertTriangle className="w-5 h-5 text-[var(--destructive)]" />
            </div>
            <div>
              <h3 className="text-[var(--foreground)] mb-1">Tâches nécessitant une attention</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {problematicTasks.length > 0 ? (
                  <>{problematicTasks.length} tâche{problematicTasks.length > 1 ? 's' : ''} avec des scores faibles</>
                ) : (
                  <>Aucune tâche problématique détectée</>
                )}
              </p>
            </div>
          </div>
          {problematicTasks.length > 0 ? (
            <div className="space-y-2.5">
              {problematicTasks.map((task: any) => (
                <div key={task.taskId} className="bg-white rounded-[var(--radius-lg)] p-4 border border-[var(--border)] hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <Badge variant="destructive" className="text-xs shrink-0 mt-0.5">T{task.taskId}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--foreground)] mb-2">{task.taskTitle}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {task.issues.map((issue: string, idx: number) => (
                          <span key={idx} className="text-xs text-[var(--destructive)] bg-red-100 px-2.5 py-1 rounded-full">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 className="w-8 h-8 text-[var(--success)] mx-auto mb-2 opacity-50" />
              <p className="text-sm text-[var(--muted-foreground)]">Tous les scores sont satisfaisants</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points forts */}
      <Card className="bg-green-50/50 border-l-4 border-l-[var(--success)] border border-green-200/50">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-[var(--radius-lg)] bg-[var(--success)]/10 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <h3 className="text-[var(--foreground)] mb-1">Points forts</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {insights.strengths.length > 0 ? (
                  <>{insights.strengths.length} élément{insights.strengths.length > 1 ? 's' : ''} positif{insights.strengths.length > 1 ? 's' : ''}</>
                ) : (
                  <>Aucun insight détecté pour le moment</>
                )}
              </p>
            </div>
          </div>
          {insights.strengths.length > 0 ? (
            <ul className="space-y-2">
              {insights.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2.5 bg-white rounded-[var(--radius-lg)] p-3 border border-[var(--border)] hover:shadow-sm transition-shadow">
                  <span className="text-[var(--success)] mt-0.5 shrink-0">•</span>
                  <span className="text-sm text-[var(--foreground)] leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2 opacity-30" />
              <p className="text-sm text-[var(--muted-foreground)]">Complétez des sessions pour obtenir des insights</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
