import React, { useState, useCallback, useEffect } from 'react';
import { User, TeamMember, Prize } from '@/types/game';
import { saveGameSession, subscribeToUserUpdates } from '@/lib/gameService';
import SplashScreen from './game/SplashScreen';
import LoginPage from './game/LoginPage';
import RegisterPage from './game/RegisterPage';
import HomePage from './game/HomePage';
import Round1TrueFalse from './game/Round1TrueFalse';
import Round2EscapeRoom from './game/Round2EscapeRoom';
import Round3GameBoard from './game/Round3GameBoard';
import Round4TeamRound from './game/Round4TeamRound';
import RoundTransition from './game/RoundTransition';
import ResultsPage from './game/ResultsPage';
import LeaderboardPage from './game/LeaderboardPage';
import RewardsPage from './game/RewardsPage';
import PracticeMode from './game/PracticeMode';

type GameScreen = 
  | 'splash' 
  | 'login' 
  | 'register' 
  | 'home' 
  | 'round1' 
  | 'round2' 
  | 'round3' 
  | 'round4' 
  | 'transition'
  | 'results' 
  | 'leaderboard' 
  | 'rewards'
  | 'practice';

interface RoundResult {
  round: number;
  score: number;
  details: string;
}

const AppLayout: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>(() => {
    try {
      const saved = localStorage.getItem('finalexam_user');
      if (saved) return 'home' as GameScreen;
    } catch {}
    return 'splash' as GameScreen;
  });
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('finalexam_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [gameMode, setGameMode] = useState<'solo' | 'vs'>('solo');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [transitionData, setTransitionData] = useState({ fromRound: 0, toRound: 0 });
  const [isSavingGame, setIsSavingGame] = useState(false);

  // Subscribe to real-time user updates when logged in
  useEffect(() => {
    if (user && user.id && !user.id.startsWith('demo-')) {
      const unsubscribe = subscribeToUserUpdates(user.id, (updatedUser) => {
        setUser(updatedUser);
      });
      return () => unsubscribe();
    }
  }, [user?.id]);

  // Splash complete
  const handleSplashComplete = useCallback(() => {
    setCurrentScreen('login');
  }, []);

  // Login
  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentScreen('home');
    try { localStorage.setItem('finalexam_user', JSON.stringify(loggedInUser)); } catch {}
  }, []);

  // Register
  const handleRegister = useCallback((newUser: User) => {
    setUser(newUser);
    setCurrentScreen('home');
    try { localStorage.setItem('finalexam_user', JSON.stringify(newUser)); } catch {}
  }, []);

  // Logout
  const handleLogout = useCallback(() => {
    setUser(null);
    setCurrentScreen('login');
    try { localStorage.removeItem('finalexam_user'); } catch {}
  }, []);

  // Start game
  const handleStartGame = useCallback((mode: 'solo' | 'vs', members: TeamMember[]) => {
    setGameMode(mode);
    setTeamMembers(members);
    setCurrentRound(1);
    setTotalScore(0);
    setRoundResults([]);
    setCurrentScreen('round1');
  }, []);

  // View practice mode
  const handleViewPractice = useCallback(() => {
    setCurrentScreen('practice');
  }, []);

  // Round 1 complete
  const handleRound1Complete = useCallback((score: number, answers: { questionId: number; correct: boolean }[]) => {
    const correctCount = answers.filter(a => a.correct).length;
    setTotalScore(prev => prev + score);
    setRoundResults(prev => [...prev, { 
      round: 1, 
      score, 
      details: `${correctCount}/${answers.length} correct answers` 
    }]);
    setTransitionData({ fromRound: 1, toRound: 2 });
    setCurrentScreen('transition');
  }, []);

  // Round 2 complete
  const handleRound2Complete = useCallback((score: number, roomsCompleted: number) => {
    setTotalScore(prev => prev + score);
    setRoundResults(prev => [...prev, { 
      round: 2, 
      score, 
      details: `${roomsCompleted}/3 rooms escaped` 
    }]);
    setTransitionData({ fromRound: 2, toRound: 3 });
    setCurrentScreen('transition');
  }, []);

  // Round 3 complete
  const handleRound3Complete = useCallback((score: number, squaresCleared: number) => {
    setTotalScore(prev => prev + score);
    setRoundResults(prev => [...prev, { 
      round: 3, 
      score, 
      details: `${squaresCleared}/25 squares cleared` 
    }]);
    setTransitionData({ fromRound: 3, toRound: 4 });
    setCurrentScreen('transition');
  }, []);

  // Round 4 complete - save game to database
  const handleRound4Complete = useCallback(async (score: number, correctAnswers: number) => {
    const finalScore = totalScore + score;
    const finalResults = [...roundResults, { 
      round: 4, 
      score, 
      details: `${correctAnswers} team answers correct` 
    }];
    
    setTotalScore(finalScore);
    setRoundResults(finalResults);
    
    // Save game session to database
    if (user && !user.id.startsWith('demo-')) {
      setIsSavingGame(true);
      try {
        const result = await saveGameSession(
          user.id,
          gameMode,
          finalScore,
          finalResults,
          finalScore >= 2000,
          teamMembers
        );
        
        if (result.data?.user) {
          setUser(result.data.user);
        }
      } catch (error) {
        console.error('Failed to save game session:', error);
      } finally {
        setIsSavingGame(false);
      }
    }
    
    setCurrentScreen('results');
  }, [totalScore, roundResults, user, gameMode, teamMembers]);

  // Transition complete
  const handleTransitionComplete = useCallback(() => {
    const nextRound = transitionData.toRound;
    setCurrentRound(nextRound);
    setCurrentScreen(`round${nextRound}` as GameScreen);
  }, [transitionData.toRound]);

  // Play again
  const handlePlayAgain = useCallback(() => {
    setCurrentRound(1);
    setTotalScore(0);
    setRoundResults([]);
    setCurrentScreen('home');
  }, []);

  // View leaderboard
  const handleViewLeaderboard = useCallback(() => {
    setCurrentScreen('leaderboard');
  }, []);

  // View rewards
  const handleViewRewards = useCallback(() => {
    setCurrentScreen('rewards');
  }, []);

  // Go home
  const handleGoHome = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  // Redeem prize - update user with new points
  const handleRedeemPrize = useCallback((prize: Prize, updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onComplete={handleSplashComplete} />;
      
      case 'login':
        return (
          <LoginPage 
            onLogin={handleLogin} 
            onRegister={() => setCurrentScreen('register')} 
          />
        );
      
      case 'register':
        return (
          <RegisterPage 
            onRegister={handleRegister} 
            onBack={() => setCurrentScreen('login')} 
          />
        );
      
      case 'home':
        return user ? (
          <HomePage 
            user={user}
            onStartGame={handleStartGame}
            onViewLeaderboard={handleViewLeaderboard}
            onViewRewards={handleViewRewards}
            onViewPractice={handleViewPractice}
            onLogout={handleLogout}
          />
        ) : null;
      
      case 'round1':
        return <Round1TrueFalse onComplete={handleRound1Complete} />;
      
      case 'round2':
        return <Round2EscapeRoom onComplete={handleRound2Complete} />;
      
      case 'round3':
        return <Round3GameBoard onComplete={handleRound3Complete} />;
      
      case 'round4':
        return <Round4TeamRound teamMembers={teamMembers} onComplete={handleRound4Complete} />;
      
      case 'transition':
        return (
          <RoundTransition 
            fromRound={transitionData.fromRound}
            toRound={transitionData.toRound}
            score={totalScore}
            onComplete={handleTransitionComplete}
          />
        );
      
      case 'results':
        return user ? (
          <ResultsPage 
            user={user}
            totalScore={totalScore}
            roundResults={roundResults}
            isWinner={totalScore >= 2000}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleGoHome}
            onViewLeaderboard={handleViewLeaderboard}
          />
        ) : null;
      
      case 'leaderboard':
        return user ? (
          <LeaderboardPage 
            currentUser={user}
            onBack={handleGoHome}
          />
        ) : null;
      
      case 'rewards':
        return user ? (
          <RewardsPage 
            user={user}
            onBack={handleGoHome}
            onRedeem={handleRedeemPrize}
          />
        ) : null;

      case 'practice':
        return user ? (
          <PracticeMode 
            user={user}
            onBack={handleGoHome}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {renderScreen()}
      
      {/* Saving game indicator */}
      {isSavingGame && (
        <div className="fixed bottom-4 right-4 bg-slate-800 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg border border-slate-700">
          <svg className="animate-spin h-4 w-4 text-cyan-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-slate-300 text-sm">Saving score...</span>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
