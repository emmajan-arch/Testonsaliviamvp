import { Card, CardContent } from './ui/card';
import { CheckCircle2, Zap, Smile, ThumbsUp } from 'lucide-react';

interface OverviewKPIsProps {
  successRate: number;
  autonomyRate: number | null;
  easeScore: number | null;
  adoptionScore: number | null;
  totalTasks: number;
  successfulTasks: number;
}

export function OverviewKPIs({ 
  successRate, 
  autonomyRate, 
  easeScore, 
  adoptionScore,
  totalTasks,
  successfulTasks
}: OverviewKPIsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* KPI 1: Taux de réussite */}
      <Card className="overflow-hidden border-[var(--border)]">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3 text-[var(--muted-foreground)]">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">Taux de réussite</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl text-[var(--success)]">{successRate.toFixed(0)}%</p>
            <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--success)] rounded-full transition-all"
                style={{ width: `${successRate}%` }}
              />
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              {successfulTasks}/{totalTasks} tâches réussies
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPI 2: Autonomie */}
      {autonomyRate !== null && (
        <Card className="overflow-hidden border-[var(--border)]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3 text-[var(--muted-foreground)]">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Autonomie complète</span>
            </div>
            <div className="space-y-2">
              <p className="text-3xl text-[var(--success)]">{autonomyRate.toFixed(0)}%</p>
              <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--success)] rounded-full transition-all"
                  style={{ width: `${autonomyRate}%` }}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Tâches réussies sans aide
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI 3: Facilité */}
      {easeScore !== null && (
        <Card className="overflow-hidden border-[var(--border)]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3 text-[var(--muted-foreground)]">
              <Smile className="w-4 h-4" />
              <span className="text-sm">Facilité</span>
            </div>
            <div className="space-y-2">
              <p className="text-3xl text-[var(--success)]">
                {easeScore.toFixed(1)}<span className="text-lg text-[var(--muted-foreground)]">/10</span>
              </p>
              <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--success)] rounded-full transition-all"
                  style={{ width: `${easeScore * 10}%` }}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Perception de facilité d'usage
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI 4: Score d'adoption */}
      {adoptionScore !== null && (
        <Card className="overflow-hidden border-[var(--border)]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3 text-[var(--muted-foreground)]">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">Score d'adoption</span>
            </div>
            <div className="space-y-2">
              <p className="text-3xl text-[var(--accent)]">
                {adoptionScore.toFixed(1)}<span className="text-lg text-[var(--muted-foreground)]">/10</span>
              </p>
              <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent)] rounded-full transition-all"
                  style={{ width: `${adoptionScore * 10}%` }}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Usage quotidien envisagé
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
