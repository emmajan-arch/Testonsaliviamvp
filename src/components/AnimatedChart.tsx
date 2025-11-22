import { useState, useEffect, ReactNode } from 'react';
import { useInView } from '../hooks/useInView';

interface AnimatedChartProps {
  children: ReactNode;
  duration?: number;
}

export function AnimatedChart({ children, duration = 800 }: AnimatedChartProps) {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.95);

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setOpacity(easeOut);
      setScale(0.95 + (0.05 * easeOut));

      if (now < endTime) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [isInView, duration]);

  return (
    <div 
      ref={ref} 
      style={{ 
        opacity, 
        transform: `scale(${scale})`,
        transition: 'none'
      }}
    >
      {children}
    </div>
  );
}
