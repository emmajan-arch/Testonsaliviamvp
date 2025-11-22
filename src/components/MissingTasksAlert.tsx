import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, Plus } from 'lucide-react';

interface MissingTasksAlertProps {
  missingTasks: Array<{ id: number; title: string }>;
  onAddMissingTasks: () => void;
  participantName: string;
}

export function MissingTasksAlert({ missingTasks, onAddMissingTasks, participantName }: MissingTasksAlertProps) {
  if (missingTasks.length === 0) return null;

  return (
    <Alert 
      className="mb-6 border-[var(--warning)] bg-[var(--warning)]/5"
    >
      <AlertCircle className="h-5 w-5 text-[var(--warning)]" />
      <AlertTitle className="text-[var(--foreground)] mb-2">
        Tâches manquantes détectées
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-[var(--muted-foreground)]" style={{ fontSize: 'var(--text-sm)' }}>
          Le protocole actuel contient <strong>{missingTasks.length}</strong> tâche{missingTasks.length > 1 ? 's' : ''} qui {missingTasks.length > 1 ? 'n\'étaient pas présentes' : 'n\'était pas présente'} lors du test de <strong>{participantName}</strong>.
        </p>
        
        <div className="flex flex-wrap gap-2">
          {missingTasks.map((task) => (
            <Badge 
              key={task.id}
              variant="outline"
              className="bg-white border-[var(--warning)]/30"
            >
              Tâche {task.id}: {task.title}
            </Badge>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={onAddMissingTasks}
            size="sm"
            className="bg-[var(--warning)] hover:bg-[var(--warning)]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter les tâches manquantes
          </Button>
          <p className="text-[var(--muted-foreground)] self-center" style={{ fontSize: 'var(--text-xs)' }}>
            Les tâches seront insérées à leur position correcte dans la session
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
