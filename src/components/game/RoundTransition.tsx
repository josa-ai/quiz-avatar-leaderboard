import React, { useEffect, useState } from 'react';
import AIHost from './AIHost';

interface RoundTransitionProps {
  fromRound: number;
  toRound: number;
  score: number;
  onComplete: () => void;
}

const RoundTransition: React.FC<RoundTransitionProps> = ({ 
  fromRound, 
  toRound, 
  score, 
  onComplete 
}) => {
  const [stage, setStage] = useState<'summary' | 'next'>('summary');

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('next'), 2500);
    const timer2 = setTimeout(() => onComplete(), 5000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  const getRoundName = (round: number) => {
    switch (round) {
      case 1: return 'True or False';
      case 2: return 'Math Escape Room';
      case 3: return 'Category Board';
      case 4: return 'Team Challenge';
      default: return `Round ${round}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        {stage === 'summary' ? (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-green-400 mb-2">Round {fromRound} Complete!</h2>
              <p className="text-slate-400">{getRoundName(fromRound)}</p>
            </div>
            
            <div className="bg-slate-800/80 rounded-3xl p-8 border border-slate-700/50 mb-8">
              <p className="text-slate-400 mb-2">Current Score</p>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                {score.toLocaleString()}
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((r) => (
                  <div 
                    key={r}
                    className={`w-12 h-2 rounded-full ${
                      r <= fromRound ? 'bg-green-500' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <AIHost 
              message={`Get ready for Round ${toRound}! ${getRoundName(toRound)} is coming up!`}
              messageType="custom"
              size="large"
              isAnimating
            />
            
            <div className="mt-8">
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4 animate-pulse">
                ROUND {toRound}
              </h2>
              <p className="text-2xl text-white">{getRoundName(toRound)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoundTransition;
