export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  points: number;
  rank: number;
  gamesPlayed: number;
  wins: number;
}

export interface Question {
  id: number;
  question: string;
  answer: boolean | string | number;
  category: 'math' | 'reading' | 'writing' | 'science' | 'history' | 'language';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

export interface GameState {
  currentRound: number;
  score: number;
  timeRemaining: number;
  isPlaying: boolean;
  currentQuestion: number;
  answers: { questionId: number; correct: boolean }[];
  teamMembers: TeamMember[];
  opponent?: User;
  gameMode: 'solo' | 'vs';
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  date: string;
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  image: string;
  category: 'discount' | 'merchandise' | 'experience';
}

export interface BoardSquare {
  id: number;
  category: 'history' | 'language' | 'science' | 'reading';
  isTrap: boolean;
  trapType?: 'loseTurn' | 'losePoints';
  pointsLoss?: number;
  isRevealed: boolean;
  question?: Question;
}

export interface EscapeRoom {
  id: number;
  name: string;
  equations: { equation: string; answer: number }[];
  isUnlocked: boolean;
  isCompleted: boolean;
}
