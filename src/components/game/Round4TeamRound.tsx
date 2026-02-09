import React, { useState, useEffect, useCallback } from 'react';
import { TeamMember, Question } from '@/types/game';
import { trueFalseQuestions, generateBoardSquares, hostQuotes } from '@/data/gameData';
import { fisherYatesShuffle } from '@/lib/shuffle';
import AIHost from './AIHost';
import Timer from './Timer';

interface Round4Props {
  teamMembers: TeamMember[];
  onComplete: (score: number, correctAnswers: number) => void;
  onEndGame: () => void;
}

const Round4TeamRound: React.FC<Round4Props> = ({ teamMembers, onComplete, onEndGame }) => {
  const [questions] = useState<Question[]>(() => {
    const boardSquares = generateBoardSquares();
    const boardQuestions = boardSquares.filter(s => s.question).map(s => s.question!);
    const allQuestions = [...trueFalseQuestions, ...boardQuestions];
    return fisherYatesShuffle(allQuestions).slice(0, 20);
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [hostMessage, setHostMessage] = useState('');
  const [showBuzzer, setShowBuzzer] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentMember = teamMembers.length > 0 
    ? teamMembers[currentMemberIndex % teamMembers.length]
    : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      setIsRunning(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isRunning || feedback || !userAnswer.trim()) return;

    let isCorrect = false;
    
    if (typeof currentQuestion.answer === 'boolean') {
      const answerLower = userAnswer.toLowerCase().trim();
      isCorrect = (answerLower === 'true' || answerLower === 't' || answerLower === 'yes') === currentQuestion.answer ||
                  (answerLower === 'false' || answerLower === 'f' || answerLower === 'no') === !currentQuestion.answer;
    } else {
      isCorrect = userAnswer.toLowerCase().trim().includes(String(currentQuestion.answer).toLowerCase());
    }

    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
      setCorrectAnswers(prev => prev + 1);
      setFeedback('correct');
      setHostMessage(hostQuotes.correct[Math.floor(Math.random() * hostQuotes.correct.length)]);
    } else {
      setFeedback('incorrect');
      setHostMessage(`${hostQuotes.incorrect[Math.floor(Math.random() * hostQuotes.incorrect.length)]} The answer was: ${currentQuestion.answer}`);
    }

    setTimeout(() => {
      setFeedback(null);
      setHostMessage('');
      setUserAnswer('');
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setCurrentMemberIndex(prev => prev + 1);
      } else {
        handleTimeUp();
      }
    }, 1500);
  }, [currentIndex, currentQuestion, currentMember, feedback, isRunning, questions.length, userAnswer]);

  const handleTimeUp = useCallback(() => {
    setIsRunning(false);
    setShowBuzzer(true);
    
    setTimeout(() => {
      setShowBuzzer(false);
      onComplete(score, correctAnswers);
    }, 2000);
  }, [score, correctAnswers, onComplete]);

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
          <AIHost messageType="round4Intro" size="large" />
          <div className="mt-8">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
              FINAL ROUND
            </h2>
            <p className="text-2xl text-white mb-2">TEAM CHALLENGE</p>
            <p className="text-slate-400">5 minutes | {teamMembers.length > 0 ? `${teamMembers.length} Team Members` : 'Solo Mode'}</p>
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

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={onEndGame}
              className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium mb-1"
            >
              ✕ End Game
            </button>
            <h1 className="text-2xl font-bold text-white">Final Round: Team Challenge</h1>
            <p className="text-slate-400">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-slate-400 text-sm">Team Score</p>
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

        {/* Team members carousel */}
        {teamMembers.length > 0 && (
          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-3">Current Player:</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {teamMembers.map((member, idx) => (
                <div 
                  key={member.id}
                  className={`flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                    idx === currentMemberIndex % teamMembers.length
                      ? 'bg-cyan-500/20 border-2 border-cyan-400'
                      : 'bg-slate-800/50 border border-slate-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    idx === currentMemberIndex % teamMembers.length
                      ? 'bg-gradient-to-br from-cyan-400 to-purple-500'
                      : 'bg-slate-600'
                  }`}>
                    {member.name[0].toUpperCase()}
                  </div>
                  <span className={`font-medium ${
                    idx === currentMemberIndex % teamMembers.length
                      ? 'text-cyan-400'
                      : 'text-slate-400'
                  }`}>
                    {member.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Host */}
        {hostMessage && (
          <div className="mb-6">
            <AIHost message={hostMessage} messageType="custom" size="small" isAnimating />
          </div>
        )}

        {/* Question Card */}
        <div className={`bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border-2 transition-all duration-300 ${
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
            {currentMember && (
              <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-cyan-400 text-sm">
                {currentMember.name}'s turn
              </span>
            )}
          </div>

          {/* Question */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Answer input */}
          {typeof currentQuestion.answer === 'boolean' ? (
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => { setUserAnswer('true'); }}
                disabled={!!feedback}
                className={`py-6 rounded-2xl font-black text-2xl transition-all duration-300 ${
                  userAnswer === 'true'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gradient-to-br from-green-400 to-emerald-600 text-white hover:shadow-lg'
                } disabled:cursor-not-allowed`}
              >
                TRUE
              </button>
              <button
                onClick={() => { setUserAnswer('false'); }}
                disabled={!!feedback}
                className={`py-6 rounded-2xl font-black text-2xl transition-all duration-300 ${
                  userAnswer === 'false'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gradient-to-br from-red-400 to-rose-600 text-white hover:shadow-lg'
                } disabled:cursor-not-allowed`}
              >
                FALSE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-4">
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
                disabled={!userAnswer.trim() || !!feedback}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white disabled:opacity-50"
              >
                SUBMIT
              </button>
            </form>
          )}

          {/* Submit button for true/false */}
          {typeof currentQuestion.answer === 'boolean' && userAnswer && !feedback && (
            <button
              onClick={(e) => handleSubmit(e as any)}
              className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white"
            >
              CONFIRM ANSWER
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-slate-400 text-sm">
            {correctAnswers}/{currentIndex + 1} correct
          </span>
        </div>
      </div>
    </div>
  );
};

export default Round4TeamRound;
