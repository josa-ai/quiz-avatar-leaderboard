import { supabase } from './supabase';
import { User, TeamMember, LeaderboardEntry } from '@/types/game';

interface RoundResult {
  round: number;
  score: number;
  details: string;
}

interface GameServiceResponse<T> {
  data?: T;
  error?: string;
}

// Register a new user
export async function registerUser(
  email: string,
  username: string,
  password: string,
  avatar?: string
): Promise<GameServiceResponse<User>> {
  try {
    const { data, error } = await supabase.functions.invoke('game-api', {
      body: {
        action: 'register',
        data: { email, username, password, avatar }
      }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data: data.user };
  } catch (error: any) {
    console.error('Register error:', error);
    return { error: error.message || 'Registration failed' };
  }
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<GameServiceResponse<User>> {
  try {
    const { data, error } = await supabase.functions.invoke('game-api', {
      body: {
        action: 'login',
        data: { email, password }
      }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data: data.user };
  } catch (error: any) {
    console.error('Login error:', error);
    return { error: error.message || 'Login failed' };
  }
}

// Save game session and update leaderboard
export async function saveGameSession(
  userId: string,
  gameMode: 'solo' | 'vs',
  totalScore: number,
  roundResults: RoundResult[],
  isWinner: boolean,
  teamMembers?: TeamMember[]
): Promise<GameServiceResponse<{ session: any; pointsEarned: number; user: User }>> {
  try {
    const { data, error } = await supabase.functions.invoke('game-api', {
      body: {
        action: 'saveGameSession',
        data: {
          userId,
          gameMode,
          totalScore,
          roundResults,
          isWinner,
          teamMembers
        }
      }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data };
  } catch (error: any) {
    console.error('Save game session error:', error);
    return { error: error.message || 'Failed to save game session' };
  }
}

// Get leaderboard
export async function getLeaderboard(
  period: 'all_time' | 'weekly' | 'daily' = 'all_time',
  limit: number = 100
): Promise<GameServiceResponse<LeaderboardEntry[]>> {
  try {
    const { data, error } = await supabase.functions.invoke('game-api', {
      body: {
        action: 'getLeaderboard',
        data: { period, limit }
      }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data: data.leaderboard };
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    return { error: error.message || 'Failed to get leaderboard' };
  }
}

// Get user stats
export async function getUserStats(
  userId: string
): Promise<GameServiceResponse<{ user: User; bestScore: number; recentGames: any[] }>> {
  try {
    const { data, error } = await supabase.functions.invoke('game-api', {
      body: {
        action: 'getUserStats',
        data: { userId }
      }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data };
  } catch (error: any) {
    console.error('Get user stats error:', error);
    return { error: error.message || 'Failed to get user stats' };
  }
}

// Redeem prize
export async function redeemPrize(
  userId: string,
  prizeId: string,
  prizeName: string,
  pointsCost: number
): Promise<GameServiceResponse<User>> {
  try {
    const { data, error } = await supabase.functions.invoke('game-api', {
      body: {
        action: 'redeemPrize',
        data: { userId, prizeId, prizeName, pointsCost }
      }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data: data.user };
  } catch (error: any) {
    console.error('Redeem prize error:', error);
    return { error: error.message || 'Failed to redeem prize' };
  }
}

// Save practice progress
export async function savePracticeProgress(
  userId: string,
  subject: string,
  questionsAnswered: number,
  correctAnswers: number,
  timeSpent: number
): Promise<GameServiceResponse<{ success: boolean }>> {
  try {
    const { data, error } = await supabase.functions.invoke('game-api', {
      body: {
        action: 'savePracticeProgress',
        data: { userId, subject, questionsAnswered, correctAnswers, timeSpent }
      }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data: { success: true } };
  } catch (error: any) {
    console.error('Save practice progress error:', error);
    return { error: error.message || 'Failed to save practice progress' };
  }
}

// Get practice stats
export async function getPracticeStats(
  userId: string
): Promise<GameServiceResponse<{ progress: any[]; subjectStats: Record<string, any> }>> {
  try {
    const { data, error } = await supabase.functions.invoke('game-api', {
      body: {
        action: 'getPracticeStats',
        data: { userId }
      }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data };
  } catch (error: any) {
    console.error('Get practice stats error:', error);
    return { error: error.message || 'Failed to get practice stats' };
  }
}

// Subscribe to real-time leaderboard updates
export function subscribeToLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void
) {
  const channel = supabase
    .channel('leaderboard-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leaderboard_entries'
      },
      async () => {
        // Fetch updated leaderboard when changes occur
        const result = await getLeaderboard('all_time', 100);
        if (result.data) {
          callback(result.data);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribe to user updates
export function subscribeToUserUpdates(
  userId: string,
  callback: (user: User) => void
) {
  const channel = supabase
    .channel(`user-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        const user = payload.new as any;
        callback({
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          points: user.total_points,
          rank: user.current_rank || 999,
          gamesPlayed: user.games_played,
          wins: user.games_won
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
