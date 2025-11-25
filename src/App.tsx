import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from './components/ui/tabs';
import { ProtocolView } from './components/ProtocolView';
import { TestSession } from './components/TestSession';
import { ResultsView } from './components/ResultsView';
import PresentationView from './components/PresentationView';
import { AliviaLogo } from './components/AliviaLogo';
import { LoginScreen, UserRole } from './components/LoginScreen';
import { ConnectionStatus } from './components/ConnectionStatus';
import { ImportProgressPanel } from './components/ImportProgressPanel';
import { ClipboardList, PlayCircle, BarChart3, Presentation, LogOut, Shield, Eye, ChevronLeft, ChevronRight, Plus, FlaskConical, PanelLeftClose, PanelLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { syncWithSupabase } from './utils/supabase/sessions';
import { checkServerHealth } from './utils/supabase/health';
import emmaAvatar from 'figma:asset/16d25bac4bc2165deddd3aadc01d6675f6dc94fa.png';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [activeTab, setActiveTab] = useState('protocol');
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [protocol, setProtocol] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTestId, setCurrentTestId] = useState('test-1');

  // ✅ État pour le panneau de progression d'import (global)
  const [showImportProgress, setShowImportProgress] = useState(false);
  const [importProgressData, setImportProgressData] = useState<{
    total: number;
    current: number;
    currentSlideName?: string;
    importedSlides: Array<{ name: string; status: 'done' | 'loading' }>;
  }>({
    total: 0,
    current: 0,
    importedSlides: [],
  });

  // Mock tests list (prêt pour le multi-test)
  const tests = [
    { id: 'test-1', name: 'Test UX Alivia V2', date: 'En cours' }
  ];

  // Charger le protocole et les sessions
  useEffect(() => {
    const loadData = async () => {
      // Vérifier la santé du serveur (le composant ConnectionStatus affichera l'état)
      const healthCheck = await checkServerHealth();
      if (!healthCheck.ok) {
        // Ne logger que si ce n'est pas un mode hors-ligne (normal)
        if (!healthCheck.message.includes('Mode hors-ligne') && !healthCheck.message.includes('Timeout')) {
          console.warn('⚠️ Serveur Supabase:', healthCheck.message);
        } else {
          console.log('🌐 Application en mode hors-ligne (cache local actif)');
        }
      }

      // Charger le protocole
      const savedProtocol = JSON.parse(localStorage.getItem('testProtocol') || 'null');
      setProtocol(savedProtocol);

      // Charger les sessions depuis Supabase
      try {
        const syncedSessions = await syncWithSupabase();
        console.log('📥 Sessions chargées dans App:', syncedSessions.length, 'sessions');
        setSessions(syncedSessions);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des sessions:', error);
        setSessions([]);
      }
    };
    loadData();

    // Écouter les changements dans localStorage
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Recharger les données quand on change d'onglet vers présentation
  useEffect(() => {
    if (activeTab === 'presentation') {
      const loadData = async () => {
        const savedProtocol = JSON.parse(localStorage.getItem('testProtocol') || 'null');
        setProtocol(savedProtocol);
        
        try {
          const syncedSessions = await syncWithSupabase();
          console.log('🔄 Rechargement des sessions pour présentation:', syncedSessions.length);
          setSessions(syncedSessions);
        } catch (error) {
          console.error('❌ Erreur lors du rechargement des sessions:', error);
        }
      };
      loadData();
    }
  }, [activeTab]);

  // Vérifier si l'utilisateur est déjà authentifié au chargement
  useEffect(() => {
    const authenticated = sessionStorage.getItem('alivia_authenticated');
    const role = sessionStorage.getItem('alivia_role') as UserRole;
    if (authenticated === 'true' && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  // Auto-collapse sidebar sur mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEditSession = (sessionId: number) => {
    setEditingSessionId(sessionId);
    setActiveTab('session');
  };

  const handleSessionComplete = () => {
    setEditingSessionId(null);
    setActiveTab('results');
    // Recharger les sessions depuis Supabase après sauvegarde
    const reloadSessions = async () => {
      try {
        const syncedSessions = await syncWithSupabase();
        console.log('🔄 Sessions rechargées après sauvegarde:', syncedSessions.length);
        setSessions(syncedSessions);
      } catch (error) {
        console.error('Error reloading sessions:', error);
      }
    };
    reloadSessions();
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

  // Si pas authentifié, afficher l'écran de connexion
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div 
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(270deg, #FFF9F9 6.5%, #FDF9FC 33.54%, #FAF9FF 73.35%, #F5F6FF 99.86%)' }}
    >
      {/* ============================================ */}
      {/* SIDEBAR */}
      {/* ============================================ */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-white border-r border-sidebar-border z-40 transition-all duration-300 flex flex-col shadow-sm ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-4 border-b border-sidebar-border flex items-center justify-between h-[73px]">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-2.5">
                <AliviaLogo className="w-7 h-7 flex-shrink-0" />
                <span className="text-sidebar-foreground font-medium">
                  Alivia <span style={{ color: '#A6002D' }}>♥</span> users
                </span>
              </div>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 hover:bg-sidebar-accent rounded-[var(--radius-sm)] transition-all"
                title="Réduire la sidebar"
              >
                <PanelLeftClose className="w-5 h-5 text-sidebar-foreground" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-sidebar-accent rounded-[var(--radius-sm)] transition-all mx-auto"
              title="Ouvrir la sidebar"
            >
              <PanelLeft className="w-5 h-5 text-sidebar-foreground" />
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 mt-4">
          <button
            onClick={() => setActiveTab('protocol')}
            className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] transition-all ${
              activeTab === 'protocol'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            } ${sidebarCollapsed ? 'flex justify-center' : ''}`}
            title={sidebarCollapsed ? 'Protocole' : ''}
          >
            {sidebarCollapsed ? (
              <ClipboardList className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4 flex-shrink-0" />
                <span style={{ fontSize: 'var(--text-sm)' }}>Protocole</span>
              </div>
            )}
          </button>

          {userRole !== 'viewer' && (
            <button
              onClick={() => setActiveTab('session')}
              className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] transition-all ${
                activeTab === 'session'
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              } ${sidebarCollapsed ? 'flex justify-center' : ''}`}
              title={sidebarCollapsed ? 'Session' : ''}
            >
              {sidebarCollapsed ? (
                <PlayCircle className="w-5 h-5" />
              ) : (
                <div className="flex items-center gap-2.5">
                  <PlayCircle className="w-4 h-4 flex-shrink-0" />
                  <span style={{ fontSize: 'var(--text-sm)' }}>Session</span>
                </div>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('results')}
            className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] transition-all ${
              activeTab === 'results'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            } ${sidebarCollapsed ? 'flex justify-center' : ''}`}
            title={sidebarCollapsed ? 'Résultats' : ''}
          >
            {sidebarCollapsed ? (
              <BarChart3 className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                <span style={{ fontSize: 'var(--text-sm)' }}>Résultats</span>
              </div>
            )}
          </button>

          <button
            onClick={() => setActiveTab('presentation')}
            className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] transition-all ${
              activeTab === 'presentation'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            } ${sidebarCollapsed ? 'flex justify-center' : ''}`}
            title={sidebarCollapsed ? 'Présentation' : ''}
          >
            {sidebarCollapsed ? (
              <Presentation className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2.5">
                <Presentation className="w-4 h-4 flex-shrink-0" />
                <span style={{ fontSize: 'var(--text-sm)' }}>Présentation</span>
              </div>
            )}
          </button>
        </div>

        {/* Sidebar Footer - User Info */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <img 
                src={emmaAvatar}
                alt="Emma Jan"
                className="w-9 h-9 rounded-[var(--radius-md)] flex-shrink-0 ring-1 ring-sidebar-border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sidebar-foreground truncate" style={{ fontSize: 'var(--text-sm)' }}>
                  Emma Jan
                </p>
                <p className="text-sidebar-foreground/60" style={{ fontSize: 'var(--text-xs)' }}>
                  Product designer
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center justify-center rounded-[var(--radius-sm)] border px-2 py-1.5 cursor-pointer hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1 ${
                      userRole === 'admin' 
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'bg-sidebar-accent text-sidebar-foreground border-sidebar-border'
                    }`}
                  >
                    {userRole === 'admin' ? (
                      <Shield className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
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
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <img 
                src={emmaAvatar}
                alt="Emma Jan"
                className="w-9 h-9 rounded-[var(--radius-md)] ring-1 ring-sidebar-border"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center justify-center rounded-[var(--radius-sm)] border p-1.5 cursor-pointer hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1 ${
                      userRole === 'admin' 
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'bg-sidebar-accent text-sidebar-foreground border-sidebar-border'
                    }`}
                  >
                    {userRole === 'admin' ? (
                      <Shield className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
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
            </div>
          )}
        </div>
      </aside>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header simplifié */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[var(--border)] h-[73px]">
          <div className="px-8 h-full flex items-center justify-between">
            <div>
              <h1 className="text-[var(--foreground)] text-[20px] font-bold">
                {tests.find(t => t.id === currentTestId)?.name || 'Test UX'}
              </h1>
              <p className="text-[var(--muted-foreground)]" style={{ fontSize: 'var(--text-sm)' }}>
                Outils de test utilisateur pour Alivia V2
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              userRole === 'admin' 
                ? 'bg-[var(--accent)]/5 text-[var(--accent)] border-[var(--accent)]/20'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'
            }`} style={{ fontSize: 'var(--text-xs)' }}>
              {userRole === 'admin' ? (
                <>
                  <Shield className="w-3 h-3" />
                  Admin
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  Viewer
                </>
              )}
            </span>
          </div>
        </header>

        {/* Content Area - Sans les Tabs UI */}
        <main className="p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="protocol" className="mt-0">
              <ProtocolView isReadOnly={userRole === 'viewer'} />
            </TabsContent>

            <TabsContent value="session" className="mt-0">
              <TestSession 
                onSessionComplete={handleSessionComplete}
                editingSessionId={editingSessionId}
                isReadOnly={userRole === 'viewer'}
              />
            </TabsContent>

            <TabsContent value="results" className="mt-0">
              <ResultsView 
                onEditSession={handleEditSession} 
                isActive={activeTab === 'results'} 
                isReadOnly={userRole === 'viewer'}
                sidebarCollapsed={sidebarCollapsed}
              />
            </TabsContent>

            <TabsContent value="presentation" className="mt-0">
              <PresentationView 
                protocol={protocol} 
                sessions={sessions} 
                isReadOnly={userRole === 'viewer'}
                onImportProgressChange={setImportProgressData}
                onShowImportProgressChange={setShowImportProgress}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Connection Status Indicator */}
      <ConnectionStatus />

      {/* Import Progress Panel - Flottant sur toute l'application */}
      {showImportProgress && (
        <ImportProgressPanel
          total={importProgressData.total}
          current={importProgressData.current}
          currentSlideName={importProgressData.currentSlideName}
          importedSlides={importProgressData.importedSlides}
          onClose={() => setShowImportProgress(false)}
          onGoToSlides={() => {
            setActiveTab('presentation');
            setShowImportProgress(false);
          }}
        />
      )}
    </div>
  );
}