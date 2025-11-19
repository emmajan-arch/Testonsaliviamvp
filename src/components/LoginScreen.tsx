import { useState } from 'react';
import { AliviaLogo } from './AliviaLogo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Lock, Eye, EyeOff, AlertCircle, Users } from 'lucide-react';

export type UserRole = 'admin' | 'viewer';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Identifiants (admin et viewer)
  const CREDENTIALS = {
    admin: {
      username: 'Alivia_UX',
      password: 'iloveusers',
      role: 'admin' as UserRole,
    },
    viewer: {
      username: 'Alivia_Product',
      password: 'Alivia2024!',
      role: 'viewer' as UserRole,
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier les credentials admin
    if (username === CREDENTIALS.admin.username && password === CREDENTIALS.admin.password) {
      setError('');
      sessionStorage.setItem('alivia_authenticated', 'true');
      sessionStorage.setItem('alivia_role', 'admin');
      sessionStorage.setItem('alivia_username', username);
      onLogin('admin');
    } 
    // Vérifier les credentials viewer
    else if (username === CREDENTIALS.viewer.username && password === CREDENTIALS.viewer.password) {
      setError('');
      sessionStorage.setItem('alivia_authenticated', 'true');
      sessionStorage.setItem('alivia_role', 'viewer');
      sessionStorage.setItem('alivia_username', username);
      onLogin('viewer');
    } 
    else {
      setError('Identifiant ou mot de passe incorrect');
      setPassword('');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(270deg, #FFF9F9 6.5%, #FDF9FC 33.54%, #FAF9FF 73.35%, #F5F6FF 99.86%)' }}
    >
      <Card className="w-full max-w-md border-2 border-[var(--border)] shadow-xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--accent)]/10 blur-2xl rounded-full" />
              <AliviaLogo className="w-16 h-16 relative" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl text-[var(--foreground)]">
              Protocole de Test UX
            </CardTitle>
            <CardDescription className="text-[var(--muted-foreground)] mt-2">
              Accès réservé à l'équipe Alivia
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2 text-[var(--foreground)]">
                  <Users className="w-4 h-4 text-[var(--accent)]" />
                  Nom d'utilisateur
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Nom d'utilisateur"
                  className="border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-[var(--foreground)]">
                  <Lock className="w-4 h-4 text-[var(--accent)]" />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Entrez le mot de passe"
                    className="pr-10 border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-[var(--destructive)] text-sm bg-[var(--destructive)]/5 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--destructive)]/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
            >
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
