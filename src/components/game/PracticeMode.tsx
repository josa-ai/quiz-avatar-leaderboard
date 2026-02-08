import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/game';
import { flashCards, subjectInfo, SubjectKey, FlashCard } from '@/data/practiceData';
import AIHost from './AIHost';

interface PracticeModeProps {
  user: User;
  onBack: () => void;
  weakAreas?: SubjectKey[];
}

interface SubjectProgress {
  totalQuestions: number;
  correctAnswers: number;
  totalTime: number;
  sessions: number;
}

const PracticeMode: React.FC<PracticeModeProps> = ({ user, onBack, weakAreas = [] }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, reviewed: 0 });
  const [subjectProgress, setSubjectProgress] = useState<Record<SubjectKey, SubjectProgress>>({
    math: { totalQuestions: 0, correctAnswers: 0, totalTime: 0, sessions: 0 },
    reading: { totalQuestions: 0, correctAnswers: 0, totalTime: 0, sessions: 0 },
    science: { totalQuestions: 0, correctAnswers: 0, totalTime: 0, sessions: 0 },
    history: { totalQuestions: 0, correctAnswers: 0, totalTime: 0, sessions: 0 },
    language: { totalQuestions: 0, correctAnswers: 0, totalTime: 0, sessions: 0 }
  });
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  // Get cards for selected subject
  const subjectCards = selectedSubject 
    ? flashCards.filter(card => card.category === selectedSubject)
    : [];

  const currentCard = subjectCards[currentCardIndex];

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`practice_progress_${user.id}`);
    if (saved) {
      try {
        setSubjectProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }

    const savedMastered = localStorage.getItem(`mastered_cards_${user.id}`);
    if (savedMastered) {
      try {
        setMasteredCards(new Set(JSON.parse(savedMastered)));
      } catch (e) {
        console.error('Failed to load mastered cards:', e);
      }
    }
  }, [user.id]);

  // Save progress to localStorage
  const saveProgress = useCallback((progress: Record<SubjectKey, SubjectProgress>) => {
    localStorage.setItem(`practice_progress_${user.id}`, JSON.stringify(progress));
  }, [user.id]);

  // Save mastered cards
  const saveMasteredCards = useCallback((cards: Set<number>) => {
    localStorage.setItem(`mastered_cards_${user.id}`, JSON.stringify(Array.from(cards)));
  }, [user.id]);

  // Start studying a subject
  const handleSelectSubject = (subject: SubjectKey) => {
    setSelectedSubject(subject);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowExplanation(false);
    setSessionStats({ correct: 0, incorrect: 0, reviewed: 0 });
    setSessionStartTime(Date.now());
  };

  // Flip card
  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setSessionStats(prev => ({ ...prev, reviewed: prev.reviewed + 1 }));
    }
  };

  // Mark answer
  const handleMarkAnswer = (correct: boolean) => {
    setSessionStats(prev => ({
      ...prev,
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1
    }));

    if (correct && currentCard) {
      const newMastered = new Set(masteredCards);
      newMastered.add(currentCard.id);
      setMasteredCards(newMastered);
      saveMasteredCards(newMastered);
    }

    // Move to next card
    setTimeout(() => {
      if (currentCardIndex < subjectCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setIsFlipped(false);
        setShowExplanation(false);
      }
    }, 300);
  };

  // End session and save progress
  const handleEndSession = () => {
    if (selectedSubject && sessionStats.reviewed > 0) {
      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
      const newProgress = {
        ...subjectProgress,
        [selectedSubject]: {
          totalQuestions: subjectProgress[selectedSubject].totalQuestions + sessionStats.reviewed,
          correctAnswers: subjectProgress[selectedSubject].correctAnswers + sessionStats.correct,
          totalTime: subjectProgress[selectedSubject].totalTime + timeSpent,
          sessions: subjectProgress[selectedSubject].sessions + 1
        }
      };
      setSubjectProgress(newProgress);
      saveProgress(newProgress);
    }
    setSelectedSubject(null);
  };

  // Calculate accuracy for a subject
  const getAccuracy = (subject: SubjectKey) => {
    const progress = subjectProgress[subject];
    if (progress.totalQuestions === 0) return 0;
    return Math.round((progress.correctAnswers / progress.totalQuestions) * 100);
  };

  // Get recommendations based on weak areas
  const getRecommendations = (): SubjectKey[] => {
    const accuracies = Object.entries(subjectProgress)
      .map(([subject, progress]) => ({
        subject: subject as SubjectKey,
        accuracy: progress.totalQuestions > 0 
          ? (progress.correctAnswers / progress.totalQuestions) * 100 
          : 50,
        sessions: progress.sessions
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    // Return subjects with lowest accuracy or least practice
    return accuracies
      .filter(a => a.accuracy < 70 || a.sessions < 2)
      .slice(0, 3)
      .map(a => a.subject);
  };

  const recommendations = getRecommendations();

  // Render subject icon
  const renderIcon = (iconName: string, className: string = "w-6 h-6") => {
    switch (iconName) {
      case 'calculator':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'book':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'flask':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'landmark':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      case 'pen':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Subject selection view
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400">
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-medium">{user.username}</span>
            </div>
          </header>

          {/* AI Host */}
          <div className="mb-8">
            <AIHost 
              message="Welcome to Practice Mode! No pressure here - take your time to master each subject. I recommend starting with your weakest areas!"
              size="medium"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-3">
              PRACTICE MODE
            </h1>
            <p className="text-slate-400 text-lg">Study at your own pace with flashcards and detailed explanations</p>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-6 border border-amber-400/30">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-bold text-amber-400">Recommended for You</h3>
              </div>
              <p className="text-slate-300 mb-4">Based on your performance, focus on these subjects:</p>
              <div className="flex flex-wrap gap-3">
                {recommendations.map(subject => (
                  <button
                    key={subject}
                    onClick={() => handleSelectSubject(subject)}
                    className={`px-4 py-2 rounded-xl bg-gradient-to-r ${subjectInfo[subject].color} text-white font-semibold hover:scale-105 transition-transform`}
                  >
                    {subjectInfo[subject].name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {(Object.keys(subjectInfo) as SubjectKey[]).map(subject => {
              const info = subjectInfo[subject];
              const progress = subjectProgress[subject];
              const accuracy = getAccuracy(subject);
              const cardCount = flashCards.filter(c => c.category === subject).length;
              const masteredCount = flashCards.filter(c => c.category === subject && masteredCards.has(c.id)).length;

              return (
                <button
                  key={subject}
                  onClick={() => handleSelectSubject(subject)}
                  className={`relative bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border ${info.borderColor} hover:scale-[1.02] transition-all duration-300 text-left group overflow-hidden`}
                >
                  {/* Background glow */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${info.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white`}>
                        {renderIcon(info.icon, "w-7 h-7")}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{info.name}</h3>
                        <p className="text-slate-400 text-sm">{cardCount} flashcards</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 text-sm mb-4">{info.description}</p>

                    {/* Progress */}
                    <div className="space-y-3">
                      {/* Accuracy bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Accuracy</span>
                          <span className={`font-semibold ${accuracy >= 70 ? 'text-green-400' : accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {progress.totalQuestions > 0 ? `${accuracy}%` : 'Not started'}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${info.color} transition-all duration-500`}
                            style={{ width: `${accuracy}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Mastery bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Mastered</span>
                          <span className="text-cyan-400 font-semibold">{masteredCount}/{cardCount}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                            style={{ width: `${(masteredCount / cardCount) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between text-xs text-slate-500 pt-2">
                        <span>{progress.sessions} sessions</span>
                        <span>{Math.floor(progress.totalTime / 60)} min studied</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Overall Stats */}
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Overall Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">
                  {Object.values(subjectProgress).reduce((sum, p) => sum + p.totalQuestions, 0)}
                </div>
                <div className="text-slate-400 text-sm">Cards Reviewed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {masteredCards.size}
                </div>
                <div className="text-slate-400 text-sm">Cards Mastered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {Object.values(subjectProgress).reduce((sum, p) => sum + p.sessions, 0)}
                </div>
                <div className="text-slate-400 text-sm">Study Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">
                  {Math.floor(Object.values(subjectProgress).reduce((sum, p) => sum + p.totalTime, 0) / 60)}
                </div>
                <div className="text-slate-400 text-sm">Minutes Studied</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Flashcard study view
  const info = subjectInfo[selectedSubject];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br ${info.color} opacity-10 rounded-full blur-3xl`}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={handleEndSession}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            End Session
          </button>
          <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${info.color} text-white font-semibold`}>
            {info.name}
          </div>
        </header>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Card {currentCardIndex + 1} of {subjectCards.length}</span>
            <span>Session: {sessionStats.correct} correct, {sessionStats.incorrect} incorrect</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${info.color} transition-all duration-300`}
              style={{ width: `${((currentCardIndex + 1) / subjectCards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        {currentCard && (
          <div className="mb-6">
            <div 
              onClick={handleFlipCard}
              className={`relative min-h-[300px] md:min-h-[350px] cursor-pointer perspective-1000`}
            >
              <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front of card */}
                <div className={`absolute inset-0 bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border ${info.borderColor} flex flex-col items-center justify-center backface-hidden ${isFlipped ? 'invisible' : ''}`}>
                  {/* Mastered badge */}
                  {masteredCards.has(currentCard.id) && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/20 rounded-full border border-green-400/50">
                      <span className="text-green-400 text-sm font-medium">Mastered</span>
                    </div>
                  )}
                  
                  {/* Difficulty badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full ${
                    currentCard.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                    currentCard.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    <span className="text-sm font-medium capitalize">{currentCard.difficulty}</span>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-4">QUESTION</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                      {currentCard.question}
                    </h2>
                  </div>

                  <p className="absolute bottom-6 text-slate-500 text-sm">Tap to reveal answer</p>
                </div>

                {/* Back of card */}
                <div className={`absolute inset-0 bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border ${info.borderColor} flex flex-col items-center justify-center backface-hidden rotate-y-180 ${!isFlipped ? 'invisible' : ''}`}>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-4">ANSWER</p>
                    <h2 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${info.color} bg-clip-text text-transparent leading-relaxed`}>
                      {currentCard.answer}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Answer buttons (show when flipped) */}
            {isFlipped && !showExplanation && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleMarkAnswer(false)}
                  className="flex-1 py-4 bg-red-500/20 border border-red-400/50 rounded-2xl text-red-400 font-bold text-lg hover:bg-red-500/30 transition-colors"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Got it Wrong
                  </span>
                </button>
                <button
                  onClick={() => setShowExplanation(true)}
                  className="px-6 py-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleMarkAnswer(true)}
                  className="flex-1 py-4 bg-green-500/20 border border-green-400/50 rounded-2xl text-green-400 font-bold text-lg hover:bg-green-500/30 transition-colors"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Got it Right
                  </span>
                </button>
              </div>
            )}

            {/* Explanation panel */}
            {showExplanation && (
              <div className="mt-6 bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-cyan-400/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-cyan-400">Detailed Explanation</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">{currentCard.explanation}</p>
                
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => {
                      setShowExplanation(false);
                      handleMarkAnswer(false);
                    }}
                    className="flex-1 py-3 bg-red-500/20 border border-red-400/50 rounded-xl text-red-400 font-semibold hover:bg-red-500/30 transition-colors"
                  >
                    Still Need Practice
                  </button>
                  <button
                    onClick={() => {
                      setShowExplanation(false);
                      handleMarkAnswer(true);
                    }}
                    className="flex-1 py-3 bg-green-500/20 border border-green-400/50 rounded-xl text-green-400 font-semibold hover:bg-green-500/30 transition-colors"
                  >
                    Got It Now!
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              if (currentCardIndex > 0) {
                setCurrentCardIndex(prev => prev - 1);
                setIsFlipped(false);
                setShowExplanation(false);
              }
            }}
            disabled={currentCardIndex === 0}
            className="px-6 py-3 bg-slate-700/50 rounded-xl text-slate-300 font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {subjectCards.slice(Math.max(0, currentCardIndex - 2), Math.min(subjectCards.length, currentCardIndex + 3)).map((_, idx) => {
              const actualIdx = Math.max(0, currentCardIndex - 2) + idx;
              return (
                <button
                  key={actualIdx}
                  onClick={() => {
                    setCurrentCardIndex(actualIdx);
                    setIsFlipped(false);
                    setShowExplanation(false);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    actualIdx === currentCardIndex 
                      ? `bg-gradient-to-r ${info.color} scale-125` 
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              );
            })}
          </div>

          <button
            onClick={() => {
              if (currentCardIndex < subjectCards.length - 1) {
                setCurrentCardIndex(prev => prev + 1);
                setIsFlipped(false);
                setShowExplanation(false);
              }
            }}
            disabled={currentCardIndex === subjectCards.length - 1}
            className="px-6 py-3 bg-slate-700/50 rounded-xl text-slate-300 font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>

        {/* Session complete */}
        {currentCardIndex === subjectCards.length - 1 && isFlipped && (
          <div className="mt-8 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl p-6 border border-cyan-400/30 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Session Complete!</h3>
            <p className="text-slate-300 mb-4">
              You reviewed all {subjectCards.length} cards in {info.name}
            </p>
            <div className="flex justify-center gap-8 mb-6">
              <div>
                <div className="text-3xl font-bold text-green-400">{sessionStats.correct}</div>
                <div className="text-slate-400 text-sm">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-400">{sessionStats.incorrect}</div>
                <div className="text-slate-400 text-sm">Need Practice</div>
              </div>
            </div>
            <button
              onClick={handleEndSession}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              Back to Subjects
            </button>
          </div>
        )}
      </div>

      {/* CSS for 3D flip effect */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default PracticeMode;
