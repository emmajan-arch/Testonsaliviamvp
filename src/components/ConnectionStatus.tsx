import { useEffect, useState } from 'react';
import { Cloud, AlertCircle } from 'lucide-react';
import { checkServerHealth } from '../utils/supabase/health';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      const result = await checkServerHealth();
      setIsOnline(result.ok);
      setIsChecking(false);
    };

    checkConnection();
    
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Ne rien afficher pendant le chargement initial
  if (isChecking && isOnline === null) {
    return null;
  }

  // Afficher seulement si déconnecté
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div 
          className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-all"
          style={{
            backgroundColor: 'var(--color-error-light)',
            border: '1px solid',
            borderColor: 'var(--color-error)'
          }}
        >
          <AlertCircle 
            className="w-4 h-4" 
            style={{ color: 'var(--color-error-dark)' }}
          />
          <span 
            className="text-sm"
            style={{ color: 'var(--color-error-dark)' }}
          >
            Serveur déconnecté
          </span>
        </div>
      </div>
    );
  }

  // Ne rien afficher si connecté
  return null;
}