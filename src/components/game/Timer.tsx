import React, { useState, useEffect, useCallback } from 'react';

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isRunning: boolean;
  onTick?: (remaining: number) => void;
  size?: 'small' | 'medium' | 'large';
}

const Timer: React.FC<TimerProps> = ({ 
  duration, 
  onTimeUp, 
  isRunning, 
  onTick,
  size = 'medium' 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);
  const [isDanger, setIsDanger] = useState(false);

  useEffect(() => {
    setTimeRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        if (onTick) onTick(newTime);
        
        if (newTime <= 30 && newTime > 10) {
          setIsWarning(true);
          setIsDanger(false);
        } else if (newTime <= 10) {
          setIsWarning(false);
          setIsDanger(true);
        }
        
        if (newTime <= 0) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp, onTick]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = (timeRemaining / duration) * 100;

  const sizeClasses = {
    small: 'w-20 h-20 text-lg',
    medium: 'w-28 h-28 text-2xl',
    large: 'w-36 h-36 text-3xl'
  };

  const strokeWidth = size === 'small' ? 4 : size === 'medium' ? 6 : 8;
  const radius = size === 'small' ? 36 : size === 'medium' ? 50 : 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClass = isDanger 
    ? 'text-red-500' 
    : isWarning 
      ? 'text-yellow-500' 
      : 'text-cyan-400';

  const glowClass = isDanger 
    ? 'shadow-red-500/50' 
    : isWarning 
      ? 'shadow-yellow-500/50' 
      : 'shadow-cyan-400/50';

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      {/* Background circle */}
      <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}>
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700"
        />
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${colorClass} transition-all duration-1000`}
        />
      </svg>
      
      {/* Time display */}
      <div className={`relative z-10 font-bold ${colorClass} ${isDanger ? 'animate-pulse' : ''}`}>
        {formatTime(timeRemaining)}
      </div>
      
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full blur-md ${glowClass} shadow-lg opacity-50`}></div>
    </div>
  );
};

export default Timer;
