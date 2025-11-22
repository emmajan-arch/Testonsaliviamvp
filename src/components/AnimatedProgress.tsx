import { useState, useEffect } from 'react';
import { Progress } from './ui/progress';
import { useInView } from '../hooks/useInView';

interface AnimatedProgressProps {
  value: number;
  variant?: 'success' | 'warning' | 'destructive' | 'default';
  className?: string;
  duration?: number;
  delay?: number;
}

export function AnimatedProgress({ value, variant, className, duration = 1500, delay = 0 }: AnimatedProgressProps) {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    // Délai avant le début de l'animation
    const timer = setTimeout(() => {
      const startTime = Date.now();
      const endTime = startTime + duration;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        // Fonction d'easing ease-out-quart (plus douce et fluide)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const newValue = easeOutQuart * value;
        
        setCurrentValue(newValue);

        if (now < endTime) {
          requestAnimationFrame(animate);
        } else {
          // Assurer que la valeur finale est exacte
          setCurrentValue(value);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [isInView, value, duration, delay]);

  return (
    <div ref={ref}>
      <Progress value={currentValue} variant={variant} className={className} />
    </div>
  );
}