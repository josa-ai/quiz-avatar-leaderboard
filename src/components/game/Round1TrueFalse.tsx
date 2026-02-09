import React, { useState, useEffect, useCallback } from 'react';
import { Question } from '@/types/game';
import { trueFalseQuestions, hostQuotes } from '@/data/gameData';
import { fisherYatesShuffle } from '@/lib/shuffle';
import { useHostAudio } from '@/hooks/useHostAudio';
import AIHost from './AIHost';
import Timer from './Timer';

interface Round1Props {
  onComplete: (score: number, answers: { questionId: number; correct: boolean }[]) => void;
  onEndGame: () => void;
}

const Round1TrueFalse: React.FC<Round1Props> = ({ onComplete, onEndGame }) => {
  const [questions] = useState<Question[]>(() =>
    fisherYatesShuffle(trueFalseQuestions).slice(0, 20)
  );
  const { play: playAudio } = useHostAudio();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; correct: boolean }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [hostMessage, setHostMessage] = useState<string>('');
  const [showBuzzer, setShowBuzzer] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    // Start after intro
    const timer = setTimeout(() => {
      setShowIntro(false);
      setIsRunning(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleAnswer = useCallback((answer: boolean) => {
    if (!isRunning || feedback) return;

    const isCorrect = answer === currentQuestion.answer;
    const newAnswers = [...answers, { questionId: currentQuestion.id, correct: isCorrect }];
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
      setFeedback('correct');
      const idx = Math.floor(Math.random() * hostQuotes.correct.length);
      playAudio('correct', idx);
      setHostMessage(hostQuotes.correct[idx]);
    } else {
      setFeedback('incorrect');
      const idx = Math.floor(Math.random() * hostQuotes.incorrect.length);
      playAudio('incorrect', idx);
      setHostMessage(hostQuotes.incorrect[idx]);
    }

    // Move to next question after feedback
    setTimeout(() => {
      setFeedback(null);
      setHostMessage('');
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        handleTimeUp();
      }
    }, 1500);
  }, [currentIndex, currentQuestion, answers, isRunning, feedback, questions.length]);

  const handleTimeUp = useCallback(() => {
    setIsRunning(false);
    setShowBuzzer(true);
    
    // Play buzzer sound effect (visual only for now)
    setTimeout(() => {
      setShowBuzzer(false);
      onComplete(score, answers);
    }, 2000);
  }, [score, answers, onComplete]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      math: 'bg-blue-500',
      reading: 'bg-purple-500',
      writing: 'bg-pink-500',
      science: 'bg-green-500',
      history: 'bg-amber-500',
      language: 'bg-cyan-500'
    };
    return colors[category] || 'bg-slate-500';
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AIHost messageType="round1Intro" size="large" />
          <div className="mt-8">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
              ROUND 1
            </h2>
            <p className="text-2xl text-white mb-2">TRUE or FALSE</p>
            <p className="text-slate-400">5 minutes | SAT Questions</p>
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
            <svg className="w-32 h-32 mx-auto text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm1-8V7h-2v5H7v2h6z"/>
            </svg>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={onEndGame}
              className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium mb-1"
            >
              ✕ End Game
            </button>
            <h1 className="text-2xl font-bold text-white">Round 1: True or False</h1>
            <p className="text-slate-400">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-slate-400 text-sm">Score</p>
              <p className="text-3xl font-bold text-cyan-400">{score}</p>
            </div>
            <Timer 
              duration={300} 
              onTimeUp={handleTimeUp} 
              isRunning={isRunning}
              size="medium"
            />
          </div>
        </div>

        {/* AI Host feedback */}
        {hostMessage && (
          <div className="mb-6">
            <AIHost message={hostMessage} messageType="custom" size="small" isAnimating />
          </div>
        )}

        {/* Question Card */}
        <div className={`bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-300 ${
          feedback === 'correct' ? 'border-green-500 shadow-lg shadow-green-500/30' :
          feedback === 'incorrect' ? 'border-red-500 shadow-lg shadow-red-500/30' :
          'border-slate-700/50'
        }`}>
          {/* Category badge */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-4 py-1 rounded-full text-white text-sm font-semibold ${getCategoryColor(currentQuestion.category)}`}>
              {currentQuestion.category.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-slate-700 rounded-full text-slate-300 text-sm">
              {currentQuestion.points} pts
            </span>
          </div>

          {/* Question */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-12 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Answer buttons */}
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleAnswer(true)}
              disabled={!!feedback}
              className={`py-8 rounded-2xl font-black text-3xl transition-all duration-300 transform hover:scale-105 ${
                feedback === 'correct' && currentQuestion.answer === true
                  ? 'bg-green-500 text-white'
                  : feedback === 'incorrect' && currentQuestion.answer === true
                    ? 'bg-green-500/50 text-white'
                    : 'bg-gradient-to-br from-green-400 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50'
              } disabled:cursor-not-allowed`}
            >
              TRUE
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={!!feedback}
              className={`py-8 rounded-2xl font-black text-3xl transition-all duration-300 transform hover:scale-105 ${
                feedback === 'correct' && currentQuestion.answer === false
                  ? 'bg-green-500 text-white'
                  : feedback === 'incorrect' && currentQuestion.answer === false
                    ? 'bg-green-500/50 text-white'
                    : 'bg-gradient-to-br from-red-400 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/50'
              } disabled:cursor-not-allowed`}
            >
              FALSE
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Round1TrueFalse;
