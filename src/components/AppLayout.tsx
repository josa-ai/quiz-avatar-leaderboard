import React, { useState, useCallback, useEffect } from 'react';
import { User, TeamMember, Prize, RoundResult, Challenge } from '@/types/game';
import { saveGameSession, subscribeToUserUpdates, createChallenge, submitChallengerScore, submitOpponentScore, getChallenge, setAuthToken } from '@/lib/gameService';
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
import HistoryPage from './game/HistoryPage';
import SettingsPage from './game/SettingsPage';
import ChallengeCreatePage from './game/ChallengeCreatePage';
import ChallengeJoinPage from './game/ChallengeJoinPage';
import ChallengeResultsPage from './game/ChallengeResultsPage';
import ChallengeListPage from './game/ChallengeListPage';

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
  | 'practice'
  | 'history'
  | 'settings'
  | 'challengeCreate'
  | 'challengeJoin'
  | 'challengeResults'
  | 'challengeList';

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
  // Restore auth token from localStorage on init
  useState(() => {
    try {
      const token = localStorage.getItem('finalexam_token');
      if (token) setAuthToken(token);
    } catch {}
  });

  const [gameMode, setGameMode] = useState<'solo' | 'vs'>('solo');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [transitionData, setTransitionData] = useState({ fromRound: 0, toRound: 0 });
  const [isSavingGame, setIsSavingGame] = useState(false);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [challengeQuestionSeed, setChallengeQuestionSeed] = useState<number | undefined>(undefined);
  const [challengeRole, setChallengeRole] = useState<'challenger' | 'opponent' | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);

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
  const handleLogin = useCallback((loggedInUser: User, token?: string) => {
    setUser(loggedInUser);
    setCurrentScreen('home');
    try { localStorage.setItem('finalexam_user', JSON.stringify(loggedInUser)); } catch {}
    if (token) {
      setAuthToken(token);
      try { localStorage.setItem('finalexam_token', token); } catch {}
    }
  }, []);

  // Register
  const handleRegister = useCallback((newUser: User, token?: string) => {
    setUser(newUser);
    setCurrentScreen('home');
    try { localStorage.setItem('finalexam_user', JSON.stringify(newUser)); } catch {}
    if (token) {
      setAuthToken(token);
      try { localStorage.setItem('finalexam_token', token); } catch {}
    }
  }, []);

  // Logout
  const handleLogout = useCallback(() => {
    setUser(null);
    setCurrentScreen('login');
    setAuthToken(null);
    try {
      localStorage.removeItem('finalexam_user');
      localStorage.removeItem('finalexam_token');
    } catch {}
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
    const finalResults: RoundResult[] = [...roundResults, {
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
          gameMode,
          finalScore,
          finalResults,
          finalScore >= 2000,
          teamMembers
        );

        if (result.data?.user) {
          setUser(result.data.user);
        }

        // If this is a challenge game, submit the score
        if (activeChallengeId && challengeRole) {
          if (challengeRole === 'challenger') {
            const chalResult = await submitChallengerScore(activeChallengeId, finalScore, finalResults, teamMembers);
            if (chalResult.data) setCurrentChallenge(chalResult.data);
          } else {
            const oppResult = await submitOpponentScore(activeChallengeId, finalScore, finalResults, teamMembers);
            if (oppResult.data) setCurrentChallenge(oppResult.data);
          }
        }
      } catch (error) {
        console.error('Failed to save game session:', error);
      } finally {
        setIsSavingGame(false);
      }
    }

    // Navigate to challenge results if in a challenge, otherwise regular results
    if (activeChallengeId) {
      setCurrentScreen('challengeResults');
    } else {
      setCurrentScreen('results');
    }
  }, [totalScore, roundResults, user, gameMode, teamMembers, activeChallengeId, challengeRole]);

  // Transition complete
  const handleTransitionComplete = useCallback(() => {
    const nextRound = transitionData.toRound;
    setCurrentRound(nextRound);
    setCurrentScreen(`round${nextRound}` as GameScreen);
  }, [transitionData.toRound]);

  // End game (quit mid-play)
  const handleEndGame = useCallback(() => {
    setCurrentRound(1);
    setTotalScore(0);
    setRoundResults([]);
    setCurrentScreen('home');
  }, []);

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

  // View history
  const handleViewHistory = useCallback(() => {
    setCurrentScreen('history');
  }, []);

  // View settings
  const handleViewSettings = useCallback(() => {
    setCurrentScreen('settings');
  }, []);

  // Handle user update (from settings avatar change)
  const handleUserUpdate = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    try { localStorage.setItem('finalexam_user', JSON.stringify(updatedUser)); } catch {}
  }, []);

  // Challenge: create
  const handleCreateChallenge = useCallback(async () => {
    if (!user || user.id.startsWith('demo-')) return;
    const result = await createChallenge();
    if (result.data) {
      setActiveChallengeId(result.data.id);
      setChallengeQuestionSeed(result.data.question_seed);
      setChallengeRole('challenger');
      setCurrentChallenge(result.data);
      setCurrentScreen('challengeCreate');
    }
  }, [user]);

  // Challenge: join
  const handleJoinChallenge = useCallback(() => {
    setCurrentScreen('challengeJoin');
  }, []);

  // Challenge: after joining, start game
  const handleChallengeJoined = useCallback((challenge: Challenge) => {
    setActiveChallengeId(challenge.id);
    setChallengeQuestionSeed(challenge.question_seed);
    setChallengeRole('opponent');
    setCurrentChallenge(challenge);
  }, []);

  // Challenge: start playing (from create page or after join)
  const handleStartChallengeGame = useCallback((members: TeamMember[]) => {
    setGameMode('vs');
    setTeamMembers(members);
    setCurrentRound(1);
    setTotalScore(0);
    setRoundResults([]);
    setCurrentScreen('round1');
  }, []);

  // Challenge: view list
  const handleViewChallenges = useCallback(() => {
    setCurrentScreen('challengeList');
  }, []);

  // Challenge: view results for a specific challenge
  const handleViewChallengeResults = useCallback(async (challengeId: string) => {
    const result = await getChallenge(challengeId);
    if (result.data) {
      setCurrentChallenge(result.data);
      setCurrentScreen('challengeResults');
    }
  }, []);

  // Quick VS (existing behavior, no challenge tracking)
  const handleQuickVs = useCallback(() => {
    // Go straight to team setup like before
  }, []);

  // Go home
  const handleGoHome = useCallback(() => {
    setActiveChallengeId(null);
    setChallengeQuestionSeed(undefined);
    setChallengeRole(null);
    setCurrentChallenge(null);
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
            onViewHistory={handleViewHistory}
            onViewSettings={handleViewSettings}
            onCreateChallenge={handleCreateChallenge}
            onJoinChallenge={handleJoinChallenge}
            onViewChallenges={handleViewChallenges}
            onLogout={handleLogout}
          />
        ) : null;
      
      case 'round1':
        return <Round1TrueFalse onComplete={handleRound1Complete} onEndGame={handleEndGame} questionSeed={challengeQuestionSeed} />;

      case 'round2':
        return <Round2EscapeRoom onComplete={handleRound2Complete} onEndGame={handleEndGame} questionSeed={challengeQuestionSeed} />;

      case 'round3':
        return <Round3GameBoard onComplete={handleRound3Complete} onEndGame={handleEndGame} questionSeed={challengeQuestionSeed} />;

      case 'round4':
        return <Round4TeamRound teamMembers={teamMembers} onComplete={handleRound4Complete} onEndGame={handleEndGame} questionSeed={challengeQuestionSeed} />;
      
      case 'transition':
        return (
          <RoundTransition
            fromRound={transitionData.fromRound}
            toRound={transitionData.toRound}
            score={totalScore}
            onComplete={handleTransitionComplete}
            onEndGame={handleEndGame}
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

      case 'history':
        return user ? (
          <HistoryPage
            user={user}
            onBack={handleGoHome}
            onViewChallenge={handleViewChallengeResults}
          />
        ) : null;

      case 'settings':
        return user ? (
          <SettingsPage
            user={user}
            onBack={handleGoHome}
            onUserUpdate={handleUserUpdate}
          />
        ) : null;

      case 'challengeCreate':
        return user && currentChallenge ? (
          <ChallengeCreatePage
            challenge={currentChallenge}
            onStartPlaying={handleStartChallengeGame}
            onBack={handleGoHome}
          />
        ) : null;

      case 'challengeJoin':
        return user ? (
          <ChallengeJoinPage
            user={user}
            onChallengeJoined={handleChallengeJoined}
            onStartPlaying={handleStartChallengeGame}
            onBack={handleGoHome}
          />
        ) : null;

      case 'challengeResults':
        return user && currentChallenge ? (
          <ChallengeResultsPage
            challenge={currentChallenge}
            currentUserId={user.id}
            onBack={handleGoHome}
            onViewChallenges={handleViewChallenges}
          />
        ) : null;

      case 'challengeList':
        return user ? (
          <ChallengeListPage
            user={user}
            onViewChallenge={handleViewChallengeResults}
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
