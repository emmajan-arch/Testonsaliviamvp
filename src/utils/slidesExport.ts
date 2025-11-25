import jsPDF from 'jspdf';

export interface SlideData {
  id: string;
  url: string;
  name: string;
}

/**
 * Exporte les slides en PDF
 */
export async function exportSlidesToPDF(slides: SlideData[]) {
  if (slides.length === 0) {
    throw new Error('Aucune slide à exporter');
  }

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1920, 1080]
  });

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    if (i > 0) {
      pdf.addPage();
    }

    // Ajouter l'image si disponible
    if (slide.url) {
      const imageData = slide.url;
      
      try {
        // Créer une image temporaire pour obtenir les dimensions
        const img = new Image();
        img.src = imageData!;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Calculer les dimensions pour centrer l'image
        const pdfWidth = 1920;
        const pdfHeight = 1080;
        const imgRatio = img.width / img.height;
        const pdfRatio = pdfWidth / pdfHeight;

        let width, height, x, y;

        if (imgRatio > pdfRatio) {
          // L'image est plus large que le PDF
          width = pdfWidth;
          height = pdfWidth / imgRatio;
          x = 0;
          y = (pdfHeight - height) / 2;
        } else {
          // L'image est plus haute que le PDF
          height = pdfHeight;
          width = pdfHeight * imgRatio;
          x = (pdfWidth - width) / 2;
          y = 0;
        }

        pdf.addImage(imageData!, 'PNG', x, y, width, height);
      } catch (error) {
        console.error(`Erreur lors de l'ajout de la slide ${i + 1}:`, error);
        // Ajouter une page blanche avec un message d'erreur
        pdf.setFontSize(20);
        pdf.text(`Erreur: Impossible de charger la slide ${i + 1}`, 960, 540, { align: 'center' });
      }
    }
  }

  // Télécharger le PDF
  const timestamp = new Date().toISOString().split('T')[0];
  pdf.save(`slides-presentation-${timestamp}.pdf`);
}