import React, { useState, useEffect } from 'react';
import { hostQuotes } from '@/data/gameData';

interface AIHostProps {
  message?: string;
  messageType?: 'welcome' | 'round1Intro' | 'round2Intro' | 'round3Intro' | 'round4Intro' | 'correct' | 'incorrect' | 'timeUp' | 'victory' | 'defeat' | 'custom';
  isAnimating?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const AIHost: React.FC<AIHostProps> = ({ 
  message, 
  messageType = 'welcome', 
  isAnimating = false,
  size = 'medium' 
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setShowBubble(true);
    } else if (messageType !== 'custom' && hostQuotes[messageType]) {
      const quotes = hostQuotes[messageType];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      typeMessage(randomQuote);
    }
  }, [message, messageType]);

  const typeMessage = (text: string) => {
    setIsTyping(true);
    setShowBubble(true);
    let index = 0;
    setCurrentMessage('');
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setCurrentMessage(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);

    return () => clearInterval(interval);
  };

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const bubbleSizes = {
    small: 'max-w-[200px] text-xs',
    medium: 'max-w-[300px] text-sm',
    large: 'max-w-[400px] text-base'
  };

  return (
    <div className="flex items-start gap-4">
      {/* Principal Avatar */}
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-cyan-400 shadow-lg shadow-cyan-400/50 ${isAnimating ? 'animate-bounce' : ''}`}>
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/6829088702a251ce52390b4c_1768321680007_eefa5b93.jpg"
            alt="Principal Powers"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md -z-10"></div>
        
        {/* Speaking indicator */}
        {isTyping && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Speech Bubble */}
      {showBubble && currentMessage && (
        <div className={`relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 ${bubbleSizes[size]} border border-cyan-400/30 shadow-xl`}>
          {/* Triangle pointer */}
          <div className="absolute left-0 top-6 -translate-x-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-slate-800"></div>
          
          <p className="text-white font-medium leading-relaxed">
            {currentMessage}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
          
          {/* Name tag */}
          <div className="absolute -top-3 left-4 bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1 rounded-full">
            <span className="text-xs font-bold text-white">Principal Powers</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIHost;
