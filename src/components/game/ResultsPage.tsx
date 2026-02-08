import React, { useState, useEffect } from 'react';
import { User } from '@/types/game';
import AIHost from './AIHost';

interface RoundResult {
  round: number;
  score: number;
  details: string;
}

interface ResultsPageProps {
  user: User;
  totalScore: number;
  roundResults: RoundResult[];
  isWinner?: boolean;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onViewLeaderboard: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  user,
  totalScore,
  roundResults,
  isWinner = true,
  onPlayAgain,
  onGoHome,
  onViewLeaderboard
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [pointsEarned] = useState(Math.floor(totalScore / 10));

  useEffect(() => {
    if (isWinner) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    // Animate score counting
    const duration = 2000;
    const steps = 60;
    const increment = totalScore / steps;
    let current = 0;
    
    const interval = setInterval(() => {
      current += increment;
      if (current >= totalScore) {
        setAnimatedScore(totalScore);
        clearInterval(interval);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [totalScore, isWinner]);

  const getRank = (score: number) => {
    if (score >= 8000) return { rank: 'S', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 6000) return { rank: 'A', color: 'text-purple-400', bg: 'bg-purple-500/20' };
    if (score >= 4000) return { rank: 'B', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
    if (score >= 2000) return { rank: 'C', color: 'text-green-400', bg: 'bg-green-500/20' };
    return { rank: 'D', color: 'text-slate-400', bg: 'bg-slate-500/20' };
  };

  const rankInfo = getRank(totalScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 relative overflow-hidden">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#00d4ff', '#a855f7', '#ec4899', '#22c55e', '#f59e0b'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* AI Host announcement */}
        <div className="mb-8">
          <AIHost 
            messageType={isWinner ? 'victory' : 'defeat'} 
            size="large" 
            isAnimating 
          />
        </div>

        {/* Result header */}
        <div className="text-center mb-8">
          <h1 className={`text-5xl md:text-7xl font-black mb-4 ${
            isWinner 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-600'
          }`}>
            {isWinner ? 'VICTORY!' : 'GAME OVER'}
          </h1>
        </div>

        {/* Score card */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 mb-8">
          {/* User info */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-700">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400">
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-white font-bold text-xl">{user.username}</p>
              <p className="text-slate-400">Final Exam Completed!</p>
            </div>
            <div className={`ml-auto w-20 h-20 rounded-2xl ${rankInfo.bg} flex items-center justify-center`}>
              <span className={`text-4xl font-black ${rankInfo.color}`}>{rankInfo.rank}</span>
            </div>
          </div>

          {/* Total score */}
          <div className="text-center mb-8">
            <p className="text-slate-400 mb-2">TOTAL SCORE</p>
            <p className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              {animatedScore.toLocaleString()}
            </p>
          </div>

          {/* Round breakdown */}
          <div className="space-y-4 mb-8">
            <h3 className="text-white font-bold text-lg">Round Breakdown</h3>
            {roundResults.map((result) => (
              <div 
                key={result.round}
                className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4"
              >
                <div>
                  <p className="text-white font-semibold">Round {result.round}</p>
                  <p className="text-slate-400 text-sm">{result.details}</p>
                </div>
                <p className="text-cyan-400 font-bold text-xl">+{result.score}</p>
              </div>
            ))}
          </div>

          {/* Points earned */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472a4.265 4.265 0 01.264-.521z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-green-400 font-bold">Points Earned!</p>
                  <p className="text-slate-400 text-sm">Redeem for prizes</p>
                </div>
              </div>
              <p className="text-3xl font-black text-green-400">+{pointsEarned}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onPlayAgain}
            className="py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={onViewLeaderboard}
            className="py-4 bg-slate-700 rounded-xl font-bold text-white hover:bg-slate-600 transition-all"
          >
            VIEW LEADERBOARD
          </button>
          <button
            onClick={onGoHome}
            className="py-4 bg-slate-700 rounded-xl font-bold text-white hover:bg-slate-600 transition-all"
          >
            HOME
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;
