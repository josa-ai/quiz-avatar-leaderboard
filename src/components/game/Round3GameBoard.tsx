import React, { useState, useEffect, useCallback } from 'react';
import { BoardSquare } from '@/types/game';
import { generateBoardSquares } from '@/data/gameData';
import AIHost from './AIHost';
import Timer from './Timer';

interface Round3Props {
  onComplete: (score: number, squaresCleared: number) => void;
  onEndGame: () => void;
}

const Round3GameBoard: React.FC<Round3Props> = ({ onComplete, onEndGame }) => {
  const [squares, setSquares] = useState<BoardSquare[]>(() => generateBoardSquares());
  const [selectedSquare, setSelectedSquare] = useState<BoardSquare | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'trap' | null>(null);
  const [hostMessage, setHostMessage] = useState('');
  const [showBuzzer, setShowBuzzer] = useState(false);
  const [squaresCleared, setSquaresCleared] = useState(0);
  const [lostTurn, setLostTurn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      setIsRunning(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      history: { bg: 'bg-amber-600', border: 'border-amber-400', text: 'text-amber-400' },
      language: { bg: 'bg-purple-600', border: 'border-purple-400', text: 'text-purple-400' },
      science: { bg: 'bg-green-600', border: 'border-green-400', text: 'text-green-400' },
      reading: { bg: 'bg-blue-600', border: 'border-blue-400', text: 'text-blue-400' }
    };
    return colors[category] || { bg: 'bg-slate-600', border: 'border-slate-400', text: 'text-slate-400' };
  };

  const handleSquareClick = (square: BoardSquare) => {
    if (!isRunning || square.isRevealed || lostTurn || selectedSquare) return;

    if (square.isTrap) {
      setFeedback('trap');
      if (square.trapType === 'loseTurn') {
        setHostMessage("IT'S A TRAP! You lose your next turn!");
        setLostTurn(true);
        setTimeout(() => setLostTurn(false), 3000);
      } else {
        const pointsLost = square.pointsLoss || 100;
        setScore(prev => Math.max(0, prev - pointsLost));
        setHostMessage(`TRAP! You just lost ${pointsLost} points! Haha!`);
      }
      
      const newSquares = squares.map(s => 
        s.id === square.id ? { ...s, isRevealed: true } : s
      );
      setSquares(newSquares);
      
      setTimeout(() => {
        setFeedback(null);
        setHostMessage('');
      }, 2000);
    } else {
      setSelectedSquare(square);
    }
  };

  const handleSubmitAnswer = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSquare || !userAnswer.trim()) return;

    const correctAnswer = String(selectedSquare.question?.answer).toLowerCase();
    const isCorrect = userAnswer.toLowerCase().trim().includes(correctAnswer.toLowerCase());

    if (isCorrect) {
      setScore(prev => prev + (selectedSquare.question?.points || 100));
      setFeedback('correct');
      setHostMessage("CORRECT! That's what I'm talking about!");
      setSquaresCleared(prev => prev + 1);
      
      const newSquares = squares.map(s => 
        s.id === selectedSquare.id ? { ...s, isRevealed: true } : s
      );
      setSquares(newSquares);
    } else {
      setFeedback('incorrect');
      setHostMessage(`WRONG! The answer was: ${selectedSquare.question?.answer}`);
      
      const newSquares = squares.map(s => 
        s.id === selectedSquare.id ? { ...s, isRevealed: true } : s
      );
      setSquares(newSquares);
    }

    setTimeout(() => {
      setFeedback(null);
      setHostMessage('');
      setSelectedSquare(null);
      setUserAnswer('');
      
      // Check if all squares are revealed
      const remainingSquares = squares.filter(s => !s.isRevealed).length;
      if (remainingSquares <= 1) {
        handleTimeUp();
      }
    }, 2000);
  }, [selectedSquare, userAnswer, squares]);

  const handleTimeUp = useCallback(() => {
    setIsRunning(false);
    setShowBuzzer(true);
    
    setTimeout(() => {
      setShowBuzzer(false);
      onComplete(score, squaresCleared);
    }, 2000);
  }, [score, squaresCleared, onComplete]);

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AIHost messageType="round3Intro" size="large" />
          <div className="mt-8">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
              ROUND 3
            </h2>
            <p className="text-2xl text-white mb-2">CATEGORY BOARD</p>
            <p className="text-slate-400">10 minutes | Watch out for TRAPS!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      {/* Buzzer overlay */}
      {showBuzzer && (
        <div className="fixed inset-0 bg-red-500/30 z-50 flex items-center justify-center animate-pulse">
          <div className="text-center">
            <div className="text-8xl font-black text-white mb-4 animate-bounce">TIME'S UP!</div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={onEndGame}
              className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium mb-1"
            >
              ✕ End Game
            </button>
            <h1 className="text-2xl font-bold text-white">Round 3: Category Board</h1>
            <p className="text-slate-400">Select a square to answer</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-slate-400 text-sm">Score</p>
              <p className="text-3xl font-bold text-cyan-400">{score}</p>
            </div>
            <Timer 
              duration={600} 
              onTimeUp={handleTimeUp} 
              isRunning={isRunning}
              size="medium"
            />
          </div>
        </div>

        {/* Category legend */}
        <div className="flex flex-wrap gap-4 mb-6">
          {['history', 'language', 'science', 'reading'].map(cat => (
            <div key={cat} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${getCategoryColor(cat).bg}`}></div>
              <span className={`text-sm font-medium ${getCategoryColor(cat).text}`}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600"></div>
            <span className="text-sm font-medium text-red-400">Trap!</span>
          </div>
        </div>

        {/* AI Host */}
        {hostMessage && (
          <div className="mb-6">
            <AIHost message={hostMessage} messageType="custom" size="small" isAnimating />
          </div>
        )}

        {/* Lost turn indicator */}
        {lostTurn && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-center">
            <p className="text-red-400 font-bold animate-pulse">Turn Lost! Wait...</p>
          </div>
        )}

        {/* Game Board */}
        <div className="grid grid-cols-5 gap-2 md:gap-3 mb-8">
          {squares.map((square) => {
            const colors = getCategoryColor(square.category);
            return (
              <button
                key={square.id}
                onClick={() => handleSquareClick(square)}
                disabled={square.isRevealed || lostTurn || !!selectedSquare}
                className={`aspect-square rounded-xl transition-all duration-300 flex items-center justify-center text-white font-bold ${
                  square.isRevealed
                    ? square.isTrap 
                      ? 'bg-red-900/50 border-2 border-red-500/50'
                      : 'bg-slate-700/50 border-2 border-slate-600/50'
                    : `${colors.bg} ${colors.border} border-2 hover:scale-105 hover:shadow-lg cursor-pointer`
                } disabled:cursor-not-allowed`}
              >
                {square.isRevealed ? (
                  square.isTrap ? (
                    <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )
                ) : (
                  <span className="text-xs md:text-sm opacity-80">
                    {square.question?.points}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Question Modal */}
        {selectedSquare && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className={`bg-slate-800 rounded-3xl p-8 max-w-2xl w-full border-2 transition-all ${
              feedback === 'correct' ? 'border-green-500' :
              feedback === 'incorrect' ? 'border-red-500' :
              getCategoryColor(selectedSquare.category).border
            }`}>
              {/* Category badge */}
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-4 py-1 rounded-full text-white text-sm font-semibold ${getCategoryColor(selectedSquare.category).bg}`}>
                  {selectedSquare.category.toUpperCase()}
                </span>
                <span className="px-3 py-1 bg-slate-700 rounded-full text-slate-300 text-sm">
                  {selectedSquare.question?.points} pts
                </span>
              </div>

              {/* Question */}
              <h3 className="text-2xl font-bold text-white mb-8">
                {selectedSquare.question?.question}
              </h3>

              {/* Answer form */}
              {!feedback && (
                <form onSubmit={handleSubmitAnswer} className="flex gap-4">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    className="flex-1 px-6 py-4 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white text-xl placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white"
                  >
                    SUBMIT
                  </button>
                </form>
              )}

              {/* Feedback */}
              {feedback && (
                <div className={`text-center p-6 rounded-xl ${
                  feedback === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <p className={`text-2xl font-bold ${
                    feedback === 'correct' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {feedback === 'correct' ? 'CORRECT!' : 'INCORRECT!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Round3GameBoard;
