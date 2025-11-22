import { useState, useEffect } from 'react';
import { useInView } from '../hooks/useInView';
import { AnimatedNumber } from './AnimatedNumber';

interface CircularGaugeProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  color?: string;
  duration?: number;
  showPercentage?: boolean;
  customContent?: React.ReactNode;
}

export function CircularGauge({ 
  value, 
  size = 120, 
  strokeWidth = 8, 
  className = '',
  label,
  color = 'var(--accent)',
  duration = 1200,
  showPercentage = true,
  customContent
}: CircularGaugeProps) {
  const { ref, isInView } = useInView({ threshold: 0.3 });
  const [currentValue, setCurrentValue] = useState(0);

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (currentValue / 100) * circumference;
  const offset = circumference - progress;

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const animate = () => {
      const now = Date.now();
      const progressTime = Math.min((now - startTime) / duration, 1);
      
      // Easing function (ease-out cubic) - même que AnimatedNumber pour la cohérence
      const easeOut = 1 - Math.pow(1 - progressTime, 3);
      const newValue = easeOut * value;
      
      setCurrentValue(newValue);

      if (now < endTime) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [isInView, value, duration]);

  return (
    <div ref={ref} className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={strokeWidth}
            opacity={0.15}
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.3s ease',
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {customContent || (
            <>
              {showPercentage && (
                <span className="text-2xl text-[var(--foreground)]">
                  <AnimatedNumber value={value} duration={duration} decimals={0} suffix="%" />
                </span>
              )}
            </>
          )}
        </div>
      </div>
      {label && (
        <span className="text-xs text-[var(--muted-foreground)] text-center">
          {label}
        </span>
      )}
    </div>
  );
}
