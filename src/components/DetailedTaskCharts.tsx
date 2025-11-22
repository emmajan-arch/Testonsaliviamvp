import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, ThumbsUp, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

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
  categoricalStats: {
    autonomy?: Record<string, number>;
  };
}

interface DetailedTaskChartsProps {
  stats: Stats;
  globalSuccessRate: number;
  globalEaseScore?: number;
  globalAutonomyRate?: number;
}

export function DetailedTaskCharts({ stats, globalSuccessRate, globalEaseScore, globalAutonomyRate }: DetailedTaskChartsProps) {
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

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Taux de réussite par tâche */}
      <Card className="overflow-hidden border-[var(--border)] shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="bg-gradient-to-br from-[var(--success)]/5 via-white to-white p-5 border-b border-[var(--border)]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--success)]/10 rounded-[var(--radius-lg)] border border-[var(--success)]/20">
                <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
              </div>
              <div>
                <h3 className="text-[var(--foreground)]">Taux de réussite par tâche</h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                  Identification des tâches problématiques
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white/80 border-[var(--success)]/30 text-[var(--success)]">
              {stats.taskStats.filter(ts => ts.taskId !== 1 && ts.taskId !== 9).length} tâches
            </Badge>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="bg-[var(--muted)]/20 rounded-[var(--radius-lg)] p-4 mb-4">
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
          </div>
          
          {/* Légende */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-start gap-2 p-2 rounded-[var(--radius)] bg-[var(--success)]/5 border border-[var(--success)]/20">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] mt-1 flex-shrink-0"></div>
              <div>
                <p className="text-xs text-[var(--foreground)]">Excellente</p>
                <p className="text-xs text-[var(--muted-foreground)]">≥ 80%</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-[var(--radius)] bg-[var(--warning)]/5 border border-[var(--warning)]/20">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)] mt-1 flex-shrink-0"></div>
              <div>
                <p className="text-xs text-[var(--foreground)]">À surveiller</p>
                <p className="text-xs text-[var(--muted-foreground)]">60-79%</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-[var(--radius)] bg-[var(--destructive)]/5 border border-[var(--destructive)]/20">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--destructive)] mt-1 flex-shrink-0"></div>
              <div>
                <p className="text-xs text-[var(--foreground)]">Critique</p>
                <p className="text-xs text-[var(--muted-foreground)]">&lt; 60%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score de facilité par tâche */}
      {tasksWithEase.length > 0 && (
        <Card className="overflow-hidden border-[var(--border)] shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="bg-gradient-to-br from-[var(--accent)]/5 via-white to-white p-5 border-b border-[var(--border)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--accent)]/10 rounded-[var(--radius-lg)] border border-[var(--accent)]/20">
                  <ThumbsUp className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-[var(--foreground)]">Score de facilité par tâche</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                    Perception utilisateur sur la difficulté
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white/80 border-[var(--accent)]/30 text-[var(--accent)]">
                {tasksWithEase.length} tâches
              </Badge>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="bg-[var(--muted)]/20 rounded-[var(--radius-lg)] p-4 mb-4">
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
            </div>
            
            {/* Légende */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-start gap-2 p-2 rounded-[var(--radius)] bg-[var(--success)]/5 border border-[var(--success)]/20">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] mt-1 flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-[var(--foreground)]">Facile</p>
                  <p className="text-xs text-[var(--muted-foreground)]">≥ 7/10</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-[var(--radius)] bg-[var(--warning)]/5 border border-[var(--warning)]/20">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)] mt-1 flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-[var(--foreground)]">Moyen</p>
                  <p className="text-xs text-[var(--muted-foreground)]">5-6.9/10</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-[var(--radius)] bg-[var(--destructive)]/5 border border-[var(--destructive)]/20">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--destructive)] mt-1 flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-[var(--foreground)]">Difficile</p>
                  <p className="text-xs text-[var(--muted-foreground)]">&lt; 5/10</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Niveau d'autonomie par tâche - Pleine largeur si impair */}
      {stats.categoricalStats.autonomy && taskAutonomyData.length > 0 && (
        <Card className={`overflow-hidden border-[var(--border)] shadow-lg hover:shadow-xl transition-shadow duration-300 ${tasksWithEase.length === 0 ? 'lg:col-span-2' : 'lg:col-span-2'}`}>
          <div className="bg-gradient-to-br from-[var(--warning)]/5 via-white to-white p-5 border-b border-[var(--border)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--warning)]/10 rounded-[var(--radius-lg)] border border-[var(--warning)]/20">
                  <Zap className="w-4 h-4 text-[var(--warning)]" />
                </div>
                <div>
                  <h3 className="text-[var(--foreground)]">Niveau d'autonomie par tâche</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                    Besoin d'accompagnement des utilisateurs
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white/80 border-[var(--warning)]/30 text-[var(--warning)]">
                {taskAutonomyData.length} tâches
              </Badge>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="bg-[var(--muted)]/20 rounded-[var(--radius-lg)] p-4 mb-4">
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
            
            {/* Légende harmonisée */}
            <div className="grid grid-cols-4 gap-2">
              <div className="flex items-start gap-2 p-2 rounded-[var(--radius)] bg-[var(--success)]/5 border border-[var(--success)]/20">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] mt-1 flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-[var(--foreground)]">Autonome</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Seul</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-[var(--radius)] bg-[var(--warning)]/5 border border-[var(--warning)]/20">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)] mt-1 flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-[var(--foreground)]">Aide minimale</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Indices</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-[var(--radius)] bg-orange-500/5 border border-orange-500/20">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-[var(--foreground)]">Guidé</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Avec aide</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-[var(--radius)] bg-[var(--destructive)]/5 border border-[var(--destructive)]/20">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--destructive)] mt-1 flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-[var(--foreground)]">Bloqué</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Échec</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}