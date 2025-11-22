import React, { useEffect, useRef, useState } from 'react';

interface FigmaSlideScalerProps {
  children: React.ReactNode;
  slideWidth?: number;
  slideHeight?: number;
}

/**
 * Wrapper qui scale automatiquement les slides Figma (1920x1080) 
 * pour qu'elles rentrent dans n'importe quel viewport
 */
export default function FigmaSlideScaler({ 
  children, 
  slideWidth = 1920, 
  slideHeight = 1080 
}: FigmaSlideScalerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculer le ratio pour fitter dans le container
      const scaleX = containerWidth / slideWidth;
      const scaleY = containerHeight / slideHeight;
      
      // Prendre le plus petit ratio pour que tout rentre
      const newScale = Math.min(scaleX, scaleY);
      
      setScale(newScale);
    };

    updateScale();

    // Re-calculer lors du resize
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [slideWidth, slideHeight]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      <div
        style={{
          width: `${slideWidth}px`,
          height: `${slideHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}