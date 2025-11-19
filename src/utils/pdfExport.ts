import jsPDF from 'jspdf';
import { TestSession, TaskResult } from '../utils/supabase/sessions';

// Configuration des métriques (doit être synchronisée avec ResultsView.tsx)
const metricConfig: Record<string, { label: string }> = {
  ease: { label: 'Facilité' },
  valuePropositionClarity: { label: 'Compréhension d\'Alivia' },
  firstImpression: { label: 'Premières impressions' }
};

// Fonction utilitaire pour supprimer les émojis
const removeEmojis = (text: string | undefined | null): string => {
  if (!text) return '';
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F910}-\u{1F96B}]|[\u{1F980}-\u{1F9E0}]/gu, '').trim();
};

interface PDFExportOptions {
  sessions: TestSession[];
  stats: any;
}

export const generateCompletePDF = ({ sessions, stats }: PDFExportOptions) => {
  console.log('📄 ===== GÉNÉRATION PDF =====');
  console.log('📦 Sessions:', sessions.length);
  console.log('📊 Stats numericalMetrics:', stats.numericalMetrics);
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;
  const leftMargin = 15;
  const rightMargin = pageWidth - 15;
  const maxWidth = rightMargin - leftMargin;
  const colWidth = maxWidth / 2 - 3;

  // Couleurs
  const c = {
    primary: [30, 14, 98] as [number, number, number],
    accent: [101, 84, 192] as [number, number, number],
    success: [34, 197, 94] as [number, number, number],
    warning: [251, 146, 60] as [number, number, number],
    error: [239, 68, 68] as [number, number, number],
    muted: [148, 163, 184] as [number, number, number],
    text: [60, 60, 60] as [number, number, number],
    lightText: [120, 120, 120] as [number, number, number],
    lightBg: [245, 247, 250] as [number, number, number]
  };

  const checkPage = (space: number = 40) => {
    if (yPos > pageHeight - space) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  const addSectionHeader = (title: string, icon: string = '') => {
    checkPage(20);
    doc.setFillColor(250, 250, 255);
    doc.rect(leftMargin - 2, yPos - 5, maxWidth + 4, 12, 'F');
    doc.setFontSize(13);
    doc.setTextColor(...c.primary);
    doc.text(`${icon} ${title}`, leftMargin, yPos);
    yPos += 10;
  };

  const addSubheader = (title: string) => {
    checkPage(15);
    doc.setFontSize(10);
    doc.setTextColor(...c.accent);
    doc.text(title, leftMargin, yPos);
    yPos += 7;
  };

  const addText = (text: string, fontSize: number = 9, color: [number, number, number] = c.text, indent: number = 0) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxWidth - indent);
    lines.forEach((line: string) => {
      checkPage();
      doc.text(line, leftMargin + indent, yPos);
      yPos += fontSize * 0.4;
    });
  };

  const drawProgressBar = (label: string, value: number, maxValue: number, showPercentage: boolean = true) => {
    checkPage(12);
    const barWidth = maxWidth - 40;
    const percentage = (value / maxValue) * 100;
    
    // Label et valeur
    doc.setFontSize(8);
    doc.setTextColor(...c.text);
    doc.text(label, leftMargin + 2, yPos - 1);
    
    const displayText = showPercentage ? `${percentage.toFixed(0)}%` : `${value}/${maxValue}`;
    doc.text(displayText, leftMargin + barWidth + 35, yPos - 1, { align: 'right' });
    
    // Fond barre
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(leftMargin + 2, yPos, barWidth + 30, 4, 1, 1, 'F');
    
    // Barre progression avec couleur adaptative
    if (percentage > 0) {
      let barColor = c.success;
      if (percentage < 40) barColor = c.error;
      else if (percentage < 70) barColor = c.warning;
      
      doc.setFillColor(...barColor);
      doc.roundedRect(leftMargin + 2, yPos, ((barWidth + 30) * percentage) / 100, 4, 1, 1, 'F');
    }
    
    yPos += 10;
  };

  const drawMetricBox = (label: string, value: string, color: [number, number, number], x: number, width: number) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, yPos, width, 18, 2, 2, 'S');
    
    doc.setFontSize(16);
    doc.setTextColor(...color);
    doc.text(value, x + width / 2, yPos + 8, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setTextColor(...c.lightText);
    doc.text(label, x + width / 2, yPos + 14, { align: 'center' });
  };

  // ==========================================
  // PAGE 1 : COUVERTURE
  // ==========================================
  
  // Bannière header
  doc.setFillColor(...c.primary);
  doc.rect(0, 0, pageWidth, 55, 'F');
  
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text('Rapport Tests UX', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(13);
  doc.text('Alivia - Protocole de test utilisateur', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(9);
  const today = new Date();
  doc.text(`Généré le ${today.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, 45, { align: 'center' });
  
  yPos = 70;

  // Résumé exécutif
  doc.setFontSize(14);
  doc.setTextColor(...c.primary);
  doc.text('Résumé Exécutif', leftMargin, yPos);
  yPos += 10;

  // Métriques clés en 3 colonnes
  const boxWidth = (maxWidth - 10) / 3;
  drawMetricBox('Sessions réalisées', `${sessions.length}`, c.accent, leftMargin, boxWidth);
  drawMetricBox('Participants uniques', `${new Set(sessions.map(s => s.participant.name)).size}`, c.accent, leftMargin + boxWidth + 5, boxWidth);
  drawMetricBox('Taux de réussite', `${stats.successRate.toFixed(0)}%`, 
    stats.successRate >= 70 ? c.success : stats.successRate >= 50 ? c.warning : c.error, 
    leftMargin + (boxWidth + 5) * 2, boxWidth);
  
  yPos += 25;

  // Deuxième rangée
  if (stats.autonomyRate !== null) {
    drawMetricBox('Autonomie complète', `${stats.autonomyRate.toFixed(0)}%`, 
      stats.autonomyRate >= 70 ? c.success : c.warning, 
      leftMargin, boxWidth);
  }
  
  if (stats.adoptionScore !== null) {
    drawMetricBox('Score d\'adoption', `${stats.adoptionScore.toFixed(1)}/10`, 
      stats.adoptionScore >= 7 ? c.success : stats.adoptionScore >= 5 ? c.warning : c.error,
      leftMargin + boxWidth + 5, boxWidth);
  }

  const totalTasks = sessions.reduce((sum, s) => sum + s.tasks.length, 0);
  drawMetricBox('Tâches testées', `${totalTasks}`, c.muted, leftMargin + (boxWidth + 5) * 2, boxWidth);
  
  yPos += 25;

  // Insights clés
  if (stats.insights.strengths.length > 0 || stats.insights.improvements.length > 0) {
    checkPage(50);
    
    doc.setFontSize(11);
    doc.setTextColor(...c.primary);
    doc.text('Insights Clés', leftMargin, yPos);
    yPos += 8;

    // Points forts
    if (stats.insights.strengths.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(...c.success);
      doc.text('✓ Points forts', leftMargin + 2, yPos);
      yPos += 5;
      
      doc.setFontSize(8);
      doc.setTextColor(...c.text);
      stats.insights.strengths.slice(0, 4).forEach((strength: string) => {
        const lines = doc.splitTextToSize(`• ${strength}`, maxWidth - 8);
        lines.forEach((line: string) => {
          checkPage();
          doc.text(line, leftMargin + 5, yPos);
          yPos += 4;
        });
      });
      yPos += 3;
    }

    // Points d'amélioration
    if (stats.insights.improvements.length > 0) {
      checkPage(25);
      doc.setFontSize(9);
      doc.setTextColor(...c.warning);
      doc.text('⚠ Points d\'amélioration', leftMargin + 2, yPos);
      yPos += 5;
      
      doc.setFontSize(8);
      doc.setTextColor(...c.text);
      stats.insights.improvements.slice(0, 4).forEach((improvement: string) => {
        const lines = doc.splitTextToSize(`• ${improvement}`, maxWidth - 8);
        lines.forEach((line: string) => {
          checkPage();
          doc.text(line, leftMargin + 5, yPos);
          yPos += 4;
        });
      });
    }
  }

  // ==========================================
  // PAGE 2 : MÉTRIQUES DE SATISFACTION
  // ==========================================
  doc.addPage();
  yPos = 20;

  addSectionHeader('Métriques de Satisfaction', '🎯');
  yPos += 5;

  if (stats.numericalMetrics && Object.keys(stats.numericalMetrics).length > 0) {
    Object.entries(stats.numericalMetrics).forEach(([metricKey, data]: [string, any]) => {
      const config = metricConfig[metricKey];
      if (!config) {
        console.warn(`⚠️ Config non trouvée pour la métrique: ${metricKey}`);
        return;
      }
      if (!data) {
        console.warn(`⚠️ Data undefined pour la métrique: ${metricKey}`);
        return;
      }
      if (!data.totalScore || !data.count) {
        console.warn(`⚠️ totalScore ou count manquant pour ${metricKey}:`, data);
        return;
      }
      
      const avgScore = data.totalScore / data.count;
      const percentage = (avgScore / 10) * 100;
      
      checkPage(15);
      
      // Label et score
      doc.setFontSize(9);
      doc.setTextColor(...c.text);
      doc.text(config.label, leftMargin + 2, yPos - 1);
      
      doc.setFontSize(10);
      let scoreColor = c.success;
      if (avgScore < 5) scoreColor = c.error;
      else if (avgScore < 7) scoreColor = c.warning;
      doc.setTextColor(...scoreColor);
      doc.text(`${avgScore.toFixed(1)}/10`, leftMargin + maxWidth - 15, yPos - 1, { align: 'right' });
      
      // Barre
      const barWidth = maxWidth - 20;
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(leftMargin + 2, yPos, barWidth, 5, 1, 1, 'F');
      
      if (percentage > 0) {
        doc.setFillColor(...scoreColor);
        doc.roundedRect(leftMargin + 2, yPos, (barWidth * percentage) / 100, 5, 1, 1, 'F');
      }
      
      // Nombre d'échantillons
      doc.setFontSize(7);
      doc.setTextColor(...c.lightText);
      doc.text(`(${data.count} évaluation${data.count > 1 ? 's' : ''})`, leftMargin + 2, yPos + 9);
      
      yPos += 16;
    });
  }

  // ==========================================
  // SYNTHÈSE COMPORTEMENTALE
  // ==========================================
  yPos += 5;
  addSectionHeader('Synthèse Comportementale', '📊');
  yPos += 2;

  if (stats.categoricalStats) {
    // Réactions émotionnelles
    if (stats.categoricalStats.emotionalReaction) {
      addSubheader('Réactions émotionnelles');
      const emotions = stats.categoricalStats.emotionalReaction;
      const totalEmotions = Object.values(emotions).reduce((sum: number, val: any) => sum + val, 0) as number;
      
      Object.entries(emotions).forEach(([emotion, count]: [string, any]) => {
        const emotionLabels: Record<string, string> = {
          'satisfied': 'Satisfait',
          'frustrated': 'Frustré',
          'confused': 'Confus',
          'neutral': 'Neutre'
        };
        const percentage = (count / totalEmotions) * 100;
        drawProgressBar(emotionLabels[emotion] || emotion, count, totalEmotions, true);
      });
      yPos += 3;
    }

    // Niveau d'autonomie
    if (stats.categoricalStats.autonomy) {
      checkPage(30);
      addSubheader('Niveau d\'autonomie');
      const autonomy = stats.categoricalStats.autonomy;
      const totalAutonomy = Object.values(autonomy).reduce((sum: number, val: any) => sum + val, 0) as number;
      
      Object.entries(autonomy).forEach(([level, count]: [string, any]) => {
        const autonomyLabels: Record<string, string> = {
          'autonomous': 'Autonome',
          'with-help': 'Avec aide',
          'failed': 'Échec'
        };
        const percentage = (count / totalAutonomy) * 100;
        drawProgressBar(autonomyLabels[level] || level, count, totalAutonomy, true);
      });
      yPos += 3;
    }

    // Fluidité du parcours
    if (stats.categoricalStats.pathFluidity) {
      checkPage(30);
      addSubheader('Fluidité du parcours');
      const fluidity = stats.categoricalStats.pathFluidity;
      const totalFluidity = Object.values(fluidity).reduce((sum: number, val: any) => sum + val, 0) as number;
      
      Object.entries(fluidity).forEach(([level, count]: [string, any]) => {
        const fluidityLabels: Record<string, string> = {
          'direct': 'Direct',
          'hesitant': 'Hésitant',
          'lost': 'Perdu'
        };
        const percentage = (count / totalFluidity) * 100;
        drawProgressBar(fluidityLabels[level] || level, count, totalFluidity, true);
      });
      yPos += 3;
    }

    // Méthodes de recherche
    if (stats.categoricalStats.searchMethod) {
      checkPage(30);
      addSubheader('Méthodes de recherche');
      const methods = stats.categoricalStats.searchMethod;
      const totalMethods = Object.values(methods).reduce((sum: number, val: any) => sum + val, 0) as number;
      
      Object.entries(methods).forEach(([method, count]: [string, any]) => {
        const methodLabels: Record<string, string> = {
          'search-bar': 'Barre de recherche',
          'visual-catalog': 'Catalogue visuel',
          'menu': 'Menu',
          'ai-assistant': 'Assistant IA'
        };
        const percentage = (count / totalMethods) * 100;
        drawProgressBar(methodLabels[method] || method, count, totalMethods, true);
      });
    }
  }

  // ==========================================
  // PERFORMANCE PAR TÂCHE
  // ==========================================
  doc.addPage();
  yPos = 20;
  
  addSectionHeader('Performance par Tâche', '📋');
  yPos += 5;

  if (stats.taskStats) {
    Object.entries(stats.taskStats).forEach(([taskId, taskStat]: [string, any]) => {
      // Vérification de sécurité pour taskStat
      if (!taskStat || typeof taskStat !== 'object') {
        console.warn(`⚠️ taskStat invalide pour taskId ${taskId}:`, taskStat);
        return;
      }
      
      checkPage(45);
      
      // Encadré pour chaque tâche
      doc.setDrawColor(...c.accent);
      doc.setLineWidth(0.3);
      doc.setFillColor(...c.lightBg);
      doc.roundedRect(leftMargin, yPos, maxWidth, 35, 2, 2, 'FD');
      
      // Titre tâche
      doc.setFontSize(10);
      doc.setTextColor(...c.primary);
      const cleanTitle = removeEmojis(taskStat.title || 'Tâche sans titre');
      const titleLines = doc.splitTextToSize(cleanTitle, maxWidth - 10);
      doc.text(titleLines[0], leftMargin + 3, yPos + 5);
      
      // Statistiques
      const successRate = (taskStat.successCount / taskStat.totalAttempts) * 100;
      const yStart = yPos + 12;
      
      // Colonne gauche
      doc.setFontSize(8);
      doc.setTextColor(...c.text);
      doc.text(`Réussite: ${taskStat.successCount}/${taskStat.totalAttempts} (${successRate.toFixed(0)}%)`, leftMargin + 3, yStart);
      
      if (taskStat.avgDuration) {
        doc.text(`Durée moyenne: ${taskStat.avgDuration}`, leftMargin + 3, yStart + 5);
      }
      
      if (taskStat.avgEase) {
        doc.text(`Facilité: ${taskStat.avgEase.toFixed(1)}/10`, leftMargin + 3, yStart + 10);
      }
      
      // Colonne droite
      if (taskStat.autonomousCount !== undefined) {
        const autoRate = (taskStat.autonomousCount / taskStat.totalAttempts) * 100;
        doc.text(`Autonomie: ${autoRate.toFixed(0)}%`, leftMargin + colWidth + 10, yStart);
      }
      
      if (taskStat.satisfiedCount !== undefined) {
        const satisfactionRate = (taskStat.satisfiedCount / taskStat.totalAttempts) * 100;
        doc.text(`Satisfaction: ${satisfactionRate.toFixed(0)}%`, leftMargin + colWidth + 10, yStart + 5);
      }
      
      // Barre de progression visuelle
      const barY = yPos + 28;
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(leftMargin + 3, barY, maxWidth - 6, 4, 1, 1, 'F');
      
      if (successRate > 0) {
        const barColor = successRate >= 70 ? c.success : successRate >= 50 ? c.warning : c.error;
        doc.setFillColor(...barColor);
        doc.roundedRect(leftMargin + 3, barY, ((maxWidth - 6) * successRate) / 100, 4, 1, 1, 'F');
      }
      
      yPos += 40;
    });
  }

  // ==========================================
  // SESSIONS DÉTAILLÉES
  // ==========================================
  doc.addPage();
  yPos = 20;
  
  addSectionHeader('Sessions Détaillées', '👥');
  yPos += 5;

  sessions.forEach((session, sessionIndex) => {
    checkPage(55);
    
    // Encadré session
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(leftMargin, yPos, maxWidth, 20, 2, 2, 'F');
    
    // Nom et rôle
    doc.setFontSize(11);
    doc.setTextColor(...c.primary);
    doc.text(`Session ${sessionIndex + 1}: ${session.participant.name}`, leftMargin + 3, yPos + 6);
    
    doc.setFontSize(8);
    doc.setTextColor(...c.lightText);
    doc.text(`${session.participant.role} • ${new Date(session.date).toLocaleDateString('fr-FR')}`, 
      leftMargin + 3, yPos + 11);
    
    // Profil participant
    if (session.participant.aiToolsFrequency || session.participant.aiToolsEase) {
      doc.setFontSize(7);
      const profile = [];
      if (session.participant.aiToolsFrequency) profile.push(`Fréq. IA: ${session.participant.aiToolsFrequency}`);
      if (session.participant.aiToolsEase) profile.push(`Aisance: ${session.participant.aiToolsEase}`);
      if (session.participant.aliviaFrequency) profile.push(`Alivia: ${session.participant.aliviaFrequency}`);
      doc.text(profile.join(' • '), leftMargin + 3, yPos + 16);
    }
    
    yPos += 25;

    // Observations générales
    if (session.generalObservations && session.generalObservations.trim()) {
      checkPage(25);
      doc.setFontSize(8);
      doc.setTextColor(...c.text);
      doc.text('Observations:', leftMargin + 3, yPos);
      yPos += 4;
      
      doc.setFontSize(7);
      doc.setTextColor(...c.lightText);
      const obsLines = doc.splitTextToSize(session.generalObservations, maxWidth - 10);
      obsLines.slice(0, 4).forEach((line: string) => {
        checkPage();
        doc.text(line, leftMargin + 5, yPos);
        yPos += 3;
      });
      yPos += 4;
    }

    // Tâches de la session
    session.tasks.forEach((task, taskIndex) => {
      if (!task) return; // Skip undefined tasks
      
      checkPage(30);
      
      // Status icon
      const icon = task.success ? '✓' : '✗';
      const iconColor = task.success ? c.success : c.error;
      doc.setFontSize(9);
      doc.setTextColor(...iconColor);
      doc.text(icon, leftMargin + 5, yPos);
      
      // Titre tâche
      doc.setTextColor(...c.text);
      const taskTitle = removeEmojis(task.title);
      doc.text(`Tâche ${taskIndex + 1}: ${taskTitle.substring(0, 60)}${taskTitle.length > 60 ? '...' : ''}`, 
        leftMargin + 10, yPos);
      yPos += 5;
      
      // Métriques
      doc.setFontSize(7);
      doc.setTextColor(...c.lightText);
      const metrics = [];
      
      if (typeof task.ease === 'number') metrics.push(`Facilité: ${task.ease}/10`);
      if (task.duration) metrics.push(`Durée: ${task.duration}`);
      if (task.autonomy) {
        const autonomyLabels: Record<string, string> = {
          'autonomous': 'Autonome',
          'with-help': 'Avec aide',
          'failed': 'Échec'
        };
        metrics.push(`${autonomyLabels[task.autonomy] || task.autonomy}`);
      }
      
      if (metrics.length > 0) {
        doc.text(metrics.join(' • '), leftMargin + 10, yPos);
        yPos += 4;
      }
      
      // Notes
      if (task.notes && task.notes.trim()) {
        doc.setFontSize(7);
        doc.setTextColor(...c.text);
        const noteLines = doc.splitTextToSize(task.notes, maxWidth - 20);
        noteLines.slice(0, 2).forEach((line: string) => {
          checkPage();
          doc.text(line, leftMargin + 10, yPos);
          yPos += 3;
        });
      }
      
      yPos += 5;
    });
    
    yPos += 8;
  });

  // ==========================================
  // PIED DE PAGE
  // ==========================================
  const totalPages = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...c.lightText);
    doc.text(`Page ${i}/${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('Alivia Tests UX', leftMargin, pageHeight - 10);
    doc.text(today.toLocaleDateString('fr-FR'), rightMargin, pageHeight - 10, { align: 'right' });
    
    // Ligne de séparation
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, pageHeight - 15, rightMargin, pageHeight - 15);
  }

  return doc;
};