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

export interface RoundResult {
  round: number;
  score: number;
  details: string;
}

export interface SavedTeam {
  id: string;
  owner_id: string;
  team_name: string;
  members: TeamMember[];
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  challenge_code: string;
  challenger_id: string;
  opponent_id: string | null;
  challenger_score: number | null;
  challenger_round_results: RoundResult[];
  challenger_team_members: TeamMember[];
  opponent_score: number | null;
  opponent_round_results: RoundResult[];
  opponent_team_members: TeamMember[];
  question_seed: number;
  status: 'pending' | 'active' | 'completed' | 'expired';
  created_at: string;
  expires_at: string;
  challenger_username?: string;
  opponent_username?: string;
}

export interface GameSessionRecord {
  id: string;
  user_id: string;
  game_mode: 'solo' | 'vs';
  total_score: number;
  round_results: RoundResult[];
  is_winner: boolean;
  team_members: TeamMember[];
  challenge_id: string | null;
  created_at: string;
}
