import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ProtocolView } from './components/ProtocolView';
import { TestSession } from './components/TestSession';
import { ResultsView } from './components/ResultsView';
import { AliviaLogo } from './components/AliviaLogo';
import { LoginScreen, UserRole } from './components/LoginScreen';
import { ClipboardList, PlayCircle, BarChart3, LogOut, Shield, Eye, Sparkles, Pencil } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { fetchCurrentStudy, updateStudyTitle, type Study } from './utils/supabase/study';
import emmaAvatar from 'figma:asset/16d25bac4bc2165deddd3aadc01d6675f6dc94fa.png';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [activeTab, setActiveTab] = useState('protocol');
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [study, setStudy] = useState<Study | null>(null);
  const [isLoadingStudy, setIsLoadingStudy] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  // Vérifier si l'utilisateur est déjà authentifié au chargement
  useEffect(() => {
    const authenticated = sessionStorage.getItem('alivia_authenticated');
    const role = sessionStorage.getItem('alivia_role') as UserRole;
    if (authenticated === 'true' && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  // Charger les métadonnées de l'étude
  useEffect(() => {
    const loadStudy = async () => {
      try {
        const s = await fetchCurrentStudy();
        setStudy(s);
        setDraftTitle(s.title);
      } catch (error) {
        console.error('Erreur lors du chargement de l’étude:', error);
      } finally {
        setIsLoadingStudy(false);
      }
    };

    loadStudy();
  }, []);

  const handleEditSession = (sessionId: number) => {
    setEditingSessionId(sessionId);
    setActiveTab('session');
  };

  const handleSessionComplete = () => {
    setEditingSessionId(null);
    setActiveTab('results');
  };

  const handleLogin = (role: UserRole) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('alivia_authenticated');
    sessionStorage.removeItem('alivia_role');
    setIsAuthenticated(false);
  };

  const handleStartEditTitle = () => {
    if (!study) return;
    setDraftTitle(study.title);
    setIsEditingTitle(true);
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setDraftTitle(study?.title ?? '');
  };

  const handleSaveTitle = async () => {
    if (!draftTitle.trim()) {
      setDraftTitle(study?.title ?? 'Étude sans titre');
      setIsEditingTitle(false);
      return;
    }

    try {
      setIsSavingTitle(true);
      const updated = await updateStudyTitle(draftTitle);
      setStudy(updated);
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du titre de l’étude:', error);
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleOpenIaSandbox = () => {
    const studyId = study?.id ?? 'alivia_default_study';
    const url = `/ia-sandbox?studyId=${encodeURIComponent(studyId)}`;
    // Navigation dans le même onglet pour garder une expérience fluide
    window.location.href = url;
  };

  // Si pas authentifié, afficher l'écran de connexion
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div 
      className="min-h-screen"
      style={{ background: 'linear-gradient(270deg, #FFF9F9 6.5%, #FDF9FC 33.54%, #FAF9FF 73.35%, #F5F6FF 99.86%)' }}
    >
      {/* NAVBAR STICKY FULL-WIDTH */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-[var(--accent)]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <AliviaLogo className="w-8 h-8 md:w-10 md:h-10" />
              <div className="h-10 md:h-12 w-px bg-[var(--accent)]/20 mx-2" />
              <div className="text-left">
                <h1 className="text-[var(--foreground)]">Protocole de Test UX</h1>
                <p className="text-[var(--muted-foreground)] text-sm font-normal">
                  Outils de test utilisateur pour Alivia V2
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center justify-center rounded-[var(--radius-md)] border px-2.5 py-1 text-xs w-fit whitespace-nowrap gap-1.5 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      userRole === 'admin' 
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)] focus:ring-[var(--accent)]'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] focus:ring-[var(--accent)]'
                    }`}
                  >
                    {userRole === 'admin' ? (
                      <>
                        <Shield className="w-3.5 h-3.5" />
                        Admin
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Viewer
                      </>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="gap-2 text-[var(--destructive)] focus:text-[var(--destructive)] focus:bg-[var(--destructive)]/5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="h-10 w-px bg-[var(--accent)]/20" />
              <div className="flex items-center gap-3">
                <p className="text-[var(--muted-foreground)] text-sm font-normal text-right">
                  © Emma Jan<br />
                  Product designer @ Alivia
                </p>
                <img 
                  src={emmaAvatar}
                  alt="Emma Jan"
                  className="h-14 rounded-[var(--radius-md)]"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Titre d'étude et actions globales */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
              Étude en cours
            </p>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="max-w-md"
                  disabled={isSavingTitle}
                />
                <Button
                  size="sm"
                  onClick={handleSaveTitle}
                  disabled={isSavingTitle}
                >
                  {isSavingTitle ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEditTitle}
                  disabled={isSavingTitle}
                >
                  Annuler
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  {isLoadingStudy
                    ? 'Chargement de l’étude…'
                    : study?.title || 'Étude sans titre'}
                </h2>
                {userRole === 'admin' && (
                  <button
                    type="button"
                    onClick={handleStartEditTitle}
                    className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-2 py-1 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)]/20"
                  >
                    <Pencil className="h-3 w-3" />
                    Éditer
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/10"
              onClick={handleOpenIaSandbox}
            >
              <Sparkles className="h-4 w-4" />
              Analyser cette étude avec l’IA (Sandbox)
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full mb-6 bg-white/80 backdrop-blur-sm p-2 rounded-[var(--radius-lg)] border border-[var(--accent)]/10 shadow-sm h-auto ${userRole === 'viewer' ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <TabsTrigger value="protocol" className="flex items-center justify-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Protocole</span>
            </TabsTrigger>
            {userRole !== 'viewer' && (
              <TabsTrigger 
                value="session" 
                className="flex items-center justify-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span className="hidden sm:inline font-normal">Session</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="results" className="flex items-center justify-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Résultats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="protocol">
            <ProtocolView isReadOnly={userRole === 'viewer'} />
          </TabsContent>

          <TabsContent value="session">
            <TestSession 
              onSessionComplete={handleSessionComplete}
              editingSessionId={editingSessionId}
              isReadOnly={userRole === 'viewer'}
            />
          </TabsContent>

          <TabsContent value="results">
            <ResultsView 
              onEditSession={handleEditSession} 
              isActive={activeTab === 'results'} 
              isReadOnly={userRole === 'viewer'}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}