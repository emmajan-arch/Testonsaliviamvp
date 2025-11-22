import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Presentation } from 'lucide-react';
import { syncWithSupabase } from '../utils/supabase/sessions';

interface PresentationViewProps {
  protocol: any;
  sessions: any[];
}

const Slide: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-16 relative overflow-hidden bg-[#0A0A0F]">
      {/* Dark gradient background with colored accents */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-[#474EFF]/20 via-[#0A0A0F] to-[#B066FF]/20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#474EFF]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#B066FF]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#E884C0]/5 rounded-full blur-[100px]" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#474EFF 1px, transparent 1px), linear-gradient(90deg, #474EFF 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default function PresentationView({ protocol: initialProtocol, sessions: initialSessions }: PresentationViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [protocol, setProtocol] = useState(initialProtocol);
  const [sessions, setSessions] = useState(initialSessions);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données comme dans ResultsView
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const tasksData = localStorage.getItem('protocolTasks');
        if (tasksData) {
          const tasks = JSON.parse(tasksData);
          setProtocol({ tasks, name: 'Protocole de Test UX Alivia V2' });
        }

        const syncedSessions = await syncWithSupabase();
        console.log('📊 Présentation - Sessions chargées:', syncedSessions.length);

        const migratedSessions = syncedSessions.map(session => ({
          ...session,
          tasks: session.tasks.map(task => {
            const isDiscovery = task.taskId === 1 || task.title?.includes('Découverte');
            const isPostTest = task.taskId === 9 || task.title?.includes('Questions Post-Test');
            const isBonus = task.title?.includes('Créer un assistant') || task.title?.includes('BONUS');
            
            const cleanedTask = { ...task };
            
            if (isDiscovery) {
              delete cleanedTask.ease;
              delete cleanedTask.duration;
              delete cleanedTask.autonomy;
              delete cleanedTask.pathFluidity;
            } else if (isPostTest || isBonus) {
              delete cleanedTask.ease;
            } else {
              delete cleanedTask.valuePropositionClarity;
              delete cleanedTask.firstImpression;
            }
            
            return cleanedTask;
          })
        }));

        setSessions(migratedSessions);
      } catch (error) {
        console.error('❌ Erreur chargement données présentation:', error);
        const localSessions = JSON.parse(localStorage.getItem('testSessions') || '[]');
        setSessions(localSessions);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const nextSlide = () => {
    if (!protocol || sessions.length === 0) return;
    const totalSlides = calculateTotalSlides();
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    if (!protocol || sessions.length === 0) return;
    const totalSlides = calculateTotalSlides();
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [protocol, sessions]);

  const calculateTotalSlides = () => {
    if (!protocol || sessions.length === 0) return 0;
    
    const allTasks = sessions.flatMap((s: any) => s.tasks || []);
    const positiveVerbatims = allTasks
      .filter((t: any) => t.notes && t.notes.length > 30)
      .slice(0, 3);
    const negativeVerbatims = allTasks
      .filter((t: any) => t.observations && t.observations.length > 30)
      .slice(0, 3);
    
    let count = 6;
    if (positiveVerbatims.length > 0) count++;
    if (negativeVerbatims.length > 0) count++;
    
    return count;
  };

  if (!protocol || sessions.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-[#0A0A0F]">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#474EFF] via-[#B066FF] to-[#E884C0] flex items-center justify-center">
            <Presentation className="w-12 h-12 text-white" />
          </div>
          <h2 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: 600, color: '#E0E0FF' }}>
            Aucune donnée disponible
          </h2>
          <p style={{ fontSize: '1rem', color: '#8B8BA5' }}>
            {!protocol && 'Créez d\'abord un protocole de test dans l\'onglet "Protocole".'}
            {protocol && sessions.length === 0 && 'Aucune session de test n\'a encore été réalisée. Commencez par ajouter une session dans l\'onglet "Session".'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const allTasks = sessions.flatMap((s: any) => s.tasks || []);
  const completedTasks = allTasks.filter((t: any) => t.success !== undefined);
  const successRate = completedTasks.length > 0
    ? (completedTasks.filter((t: any) => t.success).length / completedTasks.length) * 100
    : 0;

  const autonomyData = allTasks.filter((t: any) => t.autonomy);
  const autonomyRate = autonomyData.length > 0
    ? (autonomyData.filter((t: any) => t.autonomy === 'autonomous').length / autonomyData.length) * 100
    : 0;

  const tasksWithAdoption = allTasks.filter((t: any) => t.taskId === 9 && t.postTestAdoption !== undefined);
  const adoptionScore = tasksWithAdoption.length > 0
    ? tasksWithAdoption.reduce((sum: number, t: any) => sum + (t.postTestAdoption || 0), 0) / tasksWithAdoption.length
    : null;

  const task1Data = allTasks.filter((t: any) => t.taskId === 1);
  const avgComprehension = task1Data.length > 0
    ? task1Data.reduce((sum: number, t: any) => sum + (t.valuePropositionClarity || 0), 0) / task1Data.length
    : 0;
  const avgFirstImpressions = task1Data.length > 0
    ? task1Data.reduce((sum: number, t: any) => sum + (t.firstImpression || 0), 0) / task1Data.length
    : 0;

  const tasksWithEase = allTasks.filter((t: any) => t.ease !== undefined && t.ease !== null);
  const avgEase = tasksWithEase.length > 0
    ? tasksWithEase.reduce((sum: number, t: any) => sum + t.ease, 0) / tasksWithEase.length
    : 0;

  const positiveVerbatims = allTasks
    .filter((t: any) => t.notes && t.notes.length > 30)
    .slice(0, 3)
    .map((t: any) => ({
      text: t.notes,
      participant: sessions.find((s: any) => s.tasks?.includes(t))?.participant?.name || 'Participant',
      role: sessions.find((s: any) => s.tasks?.includes(t))?.participant?.role || '',
    }));

  const negativeVerbatims = allTasks
    .filter((t: any) => t.observations && t.observations.length > 30)
    .slice(0, 3)
    .map((t: any) => ({
      text: t.observations,
      participant: sessions.find((s: any) => s.tasks?.includes(t))?.participant?.name || 'Participant',
      role: sessions.find((s: any) => s.tasks?.includes(t))?.participant?.role || '',
    }));

  const getInsights = () => {
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (successRate >= 80) strengths.push(`Taux de réussite élevé (${successRate.toFixed(0)}%)`);
    if (autonomyRate >= 70) strengths.push(`Forte autonomie des utilisateurs (${autonomyRate.toFixed(0)}%)`);
    if (avgEase >= 7) strengths.push(`Interface perçue comme facile (${avgEase.toFixed(1)}/10)`);
    if (adoptionScore && adoptionScore >= 7) strengths.push(`Score d'adoption positif (${adoptionScore.toFixed(1)}/10)`);

    if (successRate < 70) improvements.push(`Taux de réussite à améliorer (${successRate.toFixed(0)}%)`);
    if (autonomyRate < 50) improvements.push(`Autonomie faible (${autonomyRate.toFixed(0)}%)`);
    if (avgEase < 6) improvements.push(`Facilité perçue faible (${avgEase.toFixed(1)}/10)`);

    return { strengths, improvements };
  };

  const insights = getInsights();

  const taskPerformance = protocol.tasks
    .filter((t: any) => t.id !== 9 && t.id !== 10)
    .map((task: any) => {
      const taskData = allTasks.filter((t: any) => t.taskId === task.id);
      const taskSuccess = taskData.filter((t: any) => t.success).length;
      const taskTotal = taskData.filter((t: any) => t.success !== undefined).length;
      return {
        title: task.title,
        successRate: taskTotal > 0 ? (taskSuccess / taskTotal) * 100 : 0,
      };
    })
    .sort((a: any, b: any) => b.successRate - a.successRate);

  const topTasks = taskPerformance.slice(0, 3);
  const bottomTasks = taskPerformance.slice(-3).reverse();

  const recommendations = [];
  if (successRate < 80) recommendations.push("Simplifier les parcours utilisateurs pour augmenter le taux de réussite");
  if (autonomyRate < 70) recommendations.push("Améliorer les guidages et les affordances pour favoriser l'autonomie");
  if (avgEase < 7) recommendations.push("Retravailler l'ergonomie des interfaces jugées difficiles");
  if (adoptionScore && adoptionScore < 7) recommendations.push("Renforcer la proposition de valeur pour améliorer l'adoption");
  if (recommendations.length === 0) recommendations.push("Continuer à itérer sur les retours qualitatifs pour perfectionner l'expérience");

  const slides = [
    // Slide 1: Cover
    <Slide key="cover">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#474EFF]/20 via-[#B066FF]/20 to-[#E884C0]/20 blur-3xl" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-12"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#474EFF] via-[#B066FF] to-[#E884C0] rounded-3xl blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-32 h-32 bg-gradient-to-br from-[#474EFF] via-[#B066FF] to-[#E884C0] rounded-3xl flex items-center justify-center">
              <span className="text-6xl">📊</span>
            </div>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-6 relative"
          style={{ 
            fontSize: '4.5rem', 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0FF 50%, #FFFFFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}
        >
          UX Research Results
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-4"
        >
          <p style={{ 
            fontSize: '1.5rem', 
            color: '#B0B0C8',
            fontWeight: 400,
            letterSpacing: '0.01em'
          }}>
            {protocol.name}
          </p>
          
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
              <span style={{ fontSize: '1.125rem', color: '#8B8BA5' }}>
                {sessions.length} participant{sessions.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
              <span style={{ fontSize: '1.125rem', color: '#8B8BA5' }}>
                {new Date().toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Slide>,

    // Slide 2: Key Metrics
    <Slide key="metrics">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-7xl"
      >
        <h2 className="text-center mb-20" style={{ 
          fontSize: '3rem', 
          fontWeight: 700,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #B0B0C8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.01em'
        }}>
          Métriques clés
        </h2>

        <div className="grid grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#474EFF]/30 to-[#B066FF]/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-all">
              <div className="text-center">
                <div className="mb-3" style={{ 
                  fontSize: '6rem', 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #474EFF 0%, #B066FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1
                }}>
                  {successRate.toFixed(0)}%
                </div>
                <div className="h-1 w-20 mx-auto mb-4 bg-gradient-to-r from-[#474EFF] to-[#B066FF] rounded-full" />
                <div style={{ fontSize: '1.125rem', fontWeight: 500, color: '#8B8BA5', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Taux de réussite
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#B066FF]/30 to-[#E884C0]/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-all">
              <div className="text-center">
                <div className="mb-3" style={{ 
                  fontSize: '6rem', 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #B066FF 0%, #E884C0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1
                }}>
                  {autonomyRate.toFixed(0)}%
                </div>
                <div className="h-1 w-20 mx-auto mb-4 bg-gradient-to-r from-[#B066FF] to-[#E884C0] rounded-full" />
                <div style={{ fontSize: '1.125rem', fontWeight: 500, color: '#8B8BA5', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Autonomie
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#E884C0]/30 to-[#FFE366]/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-all">
              <div className="text-center">
                <div className="mb-3" style={{ 
                  fontSize: '6rem', 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #E884C0 0%, #FFE366 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1
                }}>
                  {adoptionScore ? adoptionScore.toFixed(1) : 'N/A'}
                </div>
                <div className="h-1 w-20 mx-auto mb-4 bg-gradient-to-r from-[#E884C0] to-[#FFE366] rounded-full" />
                <div style={{ fontSize: '1.125rem', fontWeight: 500, color: '#8B8BA5', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Score adoption /10
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Slide>,

    // Slide 3: Satisfaction
    <Slide key="satisfaction">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl"
      >
        <h2 className="text-center mb-20" style={{ 
          fontSize: '3rem', 
          fontWeight: 700,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #B0B0C8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.01em'
        }}>
          Satisfaction utilisateur
        </h2>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#474EFF]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <span style={{ fontSize: '1.75rem', fontWeight: 600, color: '#E0E0FF' }}>Facilité globale</span>
                <span style={{ 
                  fontSize: '3rem', 
                  fontWeight: 800,
                  background: avgEase >= 7 ? 'linear-gradient(135deg, #06D65C, #00F260)' : avgEase >= 5 ? 'linear-gradient(135deg, #FF6B35, #FFB319)' : 'linear-gradient(135deg, #FF4560, #FF6B9D)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {avgEase.toFixed(1)}<span style={{ fontSize: '1.5rem', opacity: 0.5 }}>/10</span>
                </span>
              </div>
              <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(avgEase / 10) * 100}%` }}
                  transition={{ delay: 0.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ 
                    background: avgEase >= 7 ? 'linear-gradient(90deg, #06D65C, #00F260)' : avgEase >= 5 ? 'linear-gradient(90deg, #FF6B35, #FFB319)' : 'linear-gradient(90deg, #FF4560, #FF6B9D)',
                    boxShadow: avgEase >= 7 ? '0 0 20px rgba(6, 214, 92, 0.6)' : avgEase >= 5 ? '0 0 20px rgba(255, 107, 53, 0.6)' : '0 0 20px rgba(255, 69, 96, 0.6)'
                  }}
                />
              </div>
            </div>
          </motion.div>

          {task1Data.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#B066FF]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <span style={{ fontSize: '1.75rem', fontWeight: 600, color: '#E0E0FF' }}>Compréhension d'Alivia</span>
                    <span style={{ 
                      fontSize: '3rem', 
                      fontWeight: 800,
                      background: avgComprehension >= 7 ? 'linear-gradient(135deg, #06D65C, #00F260)' : avgComprehension >= 5 ? 'linear-gradient(135deg, #FF6B35, #FFB319)' : 'linear-gradient(135deg, #FF4560, #FF6B9D)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {avgComprehension.toFixed(1)}<span style={{ fontSize: '1.5rem', opacity: 0.5 }}>/10</span>
                    </span>
                  </div>
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(avgComprehension / 10) * 100}%` }}
                      transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ 
                        background: avgComprehension >= 7 ? 'linear-gradient(90deg, #06D65C, #00F260)' : avgComprehension >= 5 ? 'linear-gradient(90deg, #FF6B35, #FFB319)' : 'linear-gradient(90deg, #FF4560, #FF6B9D)',
                        boxShadow: avgComprehension >= 7 ? '0 0 20px rgba(6, 214, 92, 0.6)' : avgComprehension >= 5 ? '0 0 20px rgba(255, 107, 53, 0.6)' : '0 0 20px rgba(255, 69, 96, 0.6)'
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#E884C0]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <span style={{ fontSize: '1.75rem', fontWeight: 600, color: '#E0E0FF' }}>Premières impressions</span>
                    <span style={{ 
                      fontSize: '3rem', 
                      fontWeight: 800,
                      background: avgFirstImpressions >= 7 ? 'linear-gradient(135deg, #06D65C, #00F260)' : avgFirstImpressions >= 5 ? 'linear-gradient(135deg, #FF6B35, #FFB319)' : 'linear-gradient(135deg, #FF4560, #FF6B9D)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {avgFirstImpressions.toFixed(1)}<span style={{ fontSize: '1.5rem', opacity: 0.5 }}>/10</span>
                    </span>
                  </div>
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(avgFirstImpressions / 10) * 100}%` }}
                      transition={{ delay: 0.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ 
                        background: avgFirstImpressions >= 7 ? 'linear-gradient(90deg, #06D65C, #00F260)' : avgFirstImpressions >= 5 ? 'linear-gradient(90deg, #FF6B35, #FFB319)' : 'linear-gradient(90deg, #FF4560, #FF6B9D)',
                        boxShadow: avgFirstImpressions >= 7 ? '0 0 20px rgba(6, 214, 92, 0.6)' : avgFirstImpressions >= 5 ? '0 0 20px rgba(255, 107, 53, 0.6)' : '0 0 20px rgba(255, 69, 96, 0.6)'
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </Slide>,

    // More slides follow...
  ];

  const totalSlides = calculateTotalSlides();

  return (
    <div className="relative w-full h-full bg-[#0A0A0F]">
      <div className="w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            {slides[currentSlide]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls - Dark */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/[0.08] backdrop-blur-xl rounded-full px-6 py-3 shadow-2xl border border-white/10">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: '#E0E0FF' }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all rounded-full ${
                idx === currentSlide
                  ? 'w-8 h-2 bg-gradient-to-r from-[#474EFF] to-[#B066FF]'
                  : 'w-2 h-2 bg-white/20 hover:bg-white/30'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: '#E0E0FF' }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slide Counter - Dark */}
      <div className="absolute top-8 right-8 bg-white/[0.08] backdrop-blur-xl rounded-full px-6 py-3 shadow-2xl border border-white/10">
        <span style={{ fontSize: '1.125rem', fontWeight: 500, color: '#B0B0C8' }}>
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>

      {/* Instructions hint - Dark */}
      <div className="absolute top-8 left-8 bg-white/[0.08] backdrop-blur-xl rounded-xl px-6 py-3 shadow-2xl border border-white/10">
        <p style={{ fontSize: '0.875rem', color: '#8B8BA5' }}>
          ← → Naviguer · Espace Suivant
        </p>
      </div>
    </div>
  );
}
