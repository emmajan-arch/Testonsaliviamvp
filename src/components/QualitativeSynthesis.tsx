import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckCircle2, AlertCircle, MessageSquareQuote, Info } from 'lucide-react';

interface Task {
  taskId: number;
  title: string;
  success: boolean;
  notes: string;
  postTestImpression?: string;
  postTestLiked?: string;
  postTestFrustrations?: string;
  postTestDataStorage?: string;
  postTestPracticalUse?: string;
  postTestAdoption?: number;
  verbatim?: string;
  taskVerbatimsPositive?: string;
  taskVerbatimsNegative?: string;
}

interface Session {
  id: string;
  participant: {
    name: string;
  };
  tasks: Task[];
  generalObservations?: string;
}

interface QualitativeSynthesisProps {
  sessions: Session[];
  stats?: any; // Not used anymore
}

export function QualitativeSynthesis({ sessions, stats }: QualitativeSynthesisProps) {
  // Vérifier s'il y a des données qualitatives
  const hasAnyData = sessions.some(s => 
    s.tasks.some(t => 
      t.postTestLiked || t.postTestFrustrations || 
      t.taskVerbatimsPositive || t.taskVerbatimsNegative
    )
  );

  if (!hasAnyData) {
    return (
      <Alert className="border-[var(--accent)]/20 bg-[var(--accent)]/5">
        <Info className="h-4 w-4 text-[var(--accent)]" />
        <AlertTitle className="text-[var(--accent)]">Aucune donnée qualitative</AlertTitle>
        <AlertDescription className="text-[var(--muted-foreground)]">
          Les sessions enregistrées ne contiennent pas encore de notes, observations ou retours post-test. L'analyse qualitative se générera automatiquement dès que vous aurez des données.
        </AlertDescription>
      </Alert>
    );
  }

  // Fonction pour détecter le sentiment d'un verbatim (avec gestion des négations)
  const detectSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
    const lowerText = text.toLowerCase();
    
    // Détection des négations en français
    const hasNegation = /\b(ne |n'|pas |jamais |aucun|sans |manque|rien )/i.test(lowerText);
    
    const positiveKeywords = ['bien', 'super', 'génial', 'parfait', 'excellent', 'facile', 'simple', 'clair', 'intuitif', 'fluide', 'rapide', 'pratique', 'utile', 'efficace', 'aime', 'adore', 'cool', 'top', 'réussi', 'bravo', 'agréable', 'satisfait', 'content', 'appreciate', 'bon', 'bonne', 'meilleur'];
    const negativeKeywords = ['problème', 'difficulté', 'difficile', 'compliqué', 'confus', 'lent', 'bug', 'erreur', 'bloqué', 'frustrant', 'agaçant', 'impossible', 'perdu', 'bizarre', 'étrange', 'incompréhensible', 'mauvais', 'pire', 'galère', 'embêtant', 'ennuyeux', 'lourd', 'chiant'];
    
    // Mots-clés explicitement négatifs même sans négation
    const explicitNegative = ['pas clair', 'comprends pas', 'comprend pas', 'ne sais pas', 'sais pas'];
    const hasExplicitNegative = explicitNegative.some(phrase => lowerText.includes(phrase));
    
    const positiveCount = positiveKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter(keyword => lowerText.includes(keyword)).length;
    
    // Si phrase explicitement négative
    if (hasExplicitNegative) return 'negative';
    
    // Si négation détectée avec mots positifs → inverser en négatif
    if (hasNegation && positiveCount > 0) return 'negative';
    
    // Classification normale
    if (positiveCount > negativeCount && positiveCount > 0) return 'positive';
    if (negativeCount > positiveCount && negativeCount > 0) return 'negative';
    
    return 'neutral';
  };



  // COLLECTE DE TOUS LES VERBATIMS
  interface CategorizedVerbatim {
    text: string;
    author: string;
    source: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }

  const allVerbatims: CategorizedVerbatim[] = [];

  sessions.forEach(session => {
    // 1. Verbatims des tâches (notes + verbatim général)
    session.tasks.forEach(task => {
      // 1. Verbatims positifs des tâches (FORCÉS positifs)
      if (task.taskVerbatimsPositive && task.taskVerbatimsPositive.trim()) {
        allVerbatims.push({
          text: task.taskVerbatimsPositive,
          author: session.participant.name,
          source: `Tâche ${task.taskId}: ${task.title}`,
          sentiment: 'positive' // FORCÉ positif
        });
      }

      // 2. Verbatims négatifs des tâches (FORCÉS négatifs)
      if (task.taskVerbatimsNegative && task.taskVerbatimsNegative.trim()) {
        allVerbatims.push({
          text: task.taskVerbatimsNegative,
          author: session.participant.name,
          source: `Tâche ${task.taskId}: ${task.title}`,
          sentiment: 'negative' // FORCÉ négatif
        });
      }

      // 3. Post-test POSITIFS automatiques (postTestLiked)
      if (task.postTestLiked && task.postTestLiked.trim()) {
        allVerbatims.push({
          text: task.postTestLiked,
          author: session.participant.name,
          source: 'Points appréciés',
          sentiment: 'positive' // FORCÉ positif
        });
      }

      // 4. Post-test NÉGATIFS automatiques (postTestFrustrations)
      if (task.postTestFrustrations && task.postTestFrustrations.trim()) {
        allVerbatims.push({
          text: task.postTestFrustrations,
          author: session.participant.name,
          source: 'Points frustrants',
          sentiment: 'negative' // FORCÉ négatif
        });
      }
    });

    // 5. Observations générales
    if (session.generalObservations && session.generalObservations.trim()) {
      const sentiment = detectSentiment(session.generalObservations);
      allVerbatims.push({
        text: session.generalObservations,
        author: session.participant.name,
        source: 'Observations générales',
        sentiment
      });
    }
  });

  // FILTRAGE PAR SENTIMENT
  const positiveVerbatims = allVerbatims.filter(v => v.sentiment === 'positive');
  const negativeVerbatims = allVerbatims.filter(v => v.sentiment === 'negative');
  const neutralVerbatims = allVerbatims.filter(v => v.sentiment === 'neutral');

  return (
    <div className="space-y-6">
      {/* ONGLETS AVEC KPI */}
      <Tabs defaultValue="positives" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-[var(--muted)]/30">
          <TabsTrigger 
            value="positives" 
            className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Positifs</span>
            </div>
            <span className="text-xl">{positiveVerbatims.length}</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="negatives" 
            className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Négatifs</span>
            </div>
            <span className="text-xl">{negativeVerbatims.length}</span>
          </TabsTrigger>
        </TabsList>

        {/* ONGLET: POSITIFS */}
        <TabsContent value="positives" className="space-y-6 mt-6">
          {positiveVerbatims.length > 0 ? (
            <div className="space-y-2">
              {positiveVerbatims.map((verbatim, idx) => (
                <div key={idx} className="p-3 bg-white rounded-[var(--radius)] border border-gray-300">
                  <div className="flex items-start gap-2">
                    <MessageSquareQuote className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-[var(--foreground)] italic mb-1">
                        "{verbatim.text}"
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {verbatim.author} • {verbatim.source}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert className="border-[var(--accent)]/20 bg-[var(--accent)]/5">
              <Info className="h-4 w-4 text-[var(--accent)]" />
              <AlertTitle className="text-[var(--accent)]">Aucun verbatim positif</AlertTitle>
              <AlertDescription className="text-[var(--muted-foreground)]">
                Complétez plus de sessions avec des retours positifs pour identifier les forces de votre produit.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* ONGLET: NÉGATIFS */}
        <TabsContent value="negatives" className="space-y-6 mt-6">
          {negativeVerbatims.length > 0 ? (
            <div className="space-y-2">
              {negativeVerbatims.map((verbatim, idx) => (
                <div key={idx} className="p-3 bg-white rounded-[var(--radius)] border border-gray-300">
                  <div className="flex items-start gap-2">
                    <MessageSquareQuote className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-[var(--foreground)] italic mb-1">
                        "{verbatim.text}"
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {verbatim.author} • {verbatim.source}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert className="border-green-200 bg-green-50/30">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">Aucun verbatim négatif 🎉</AlertTitle>
              <AlertDescription className="text-green-600/80">
                Excellent ! Aucune frustration n'a été exprimée par les participants.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

      </Tabs>

      {/* Message si aucune donnée */}
      {allVerbatims.length === 0 && (
        <Alert className="border-[var(--accent)]/20 bg-[var(--accent)]/5">
          <Info className="h-4 w-4 text-[var(--accent)]" />
          <AlertTitle className="text-[var(--accent)]">Données insuffisantes</AlertTitle>
          <AlertDescription className="text-[var(--muted-foreground)]">
            Il n'y a pas assez de données pour générer des insights actionnables. Complétez au moins 2 sessions de test avec des verbatims et retours post-test.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}