import { supabase } from './supabase';
import { User, TeamMember, LeaderboardEntry, RoundResult, SavedTeam, Challenge, GameSessionRecord } from '@/types/game';
import { mockLeaderboard } from '@/data/gameData';

interface GameServiceResponse<T> {
  data?: T;
  error?: string;
}

// ─── Auth token management ─────────────────────────────────────────────────

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function invokeApi(action: string, data: Record<string, unknown> = {}) {
  const headers: Record<string, string> = {};
  if (authToken) {
    headers['x-app-token'] = authToken;
  }
  return supabase.functions.invoke('game-api', {
    body: { action, data },
    headers,
  });
}

// ─── Public endpoints (no auth needed) ─────────────────────────────────────

// Register a new user
export async function registerUser(
  email: string,
  username: string,
  password: string,
  avatar?: string
): Promise<GameServiceResponse<{ user: User; token: string }>> {
  try {
    const { data, error } = await invokeApi('register', { email, username, password, avatar });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data: { user: data.user, token: data.token } };
  } catch (error: any) {
    console.error('Register error:', error);
    return { error: error.message || 'Registration failed' };
  }
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<GameServiceResponse<{ user: User; token: string }>> {
  try {
    const { data, error } = await invokeApi('login', { email, password });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data: { user: data.user, token: data.token } };
  } catch (error: any) {
    console.error('Login error:', error);
    return { error: error.message || 'Login failed' };
  }
}

// Get leaderboard
export async function getLeaderboard(
  period: 'all_time' | 'weekly' | 'daily' = 'all_time',
  limit: number = 100
): Promise<GameServiceResponse<LeaderboardEntry[]>> {
  try {
    const { data, error } = await invokeApi('getLeaderboard', { period, limit });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data: data.leaderboard };
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    return { data: mockLeaderboard };
  }
}

// ─── Authenticated endpoints ───────────────────────────────────────────────

// Save game session and update leaderboard
export async function saveGameSession(
  gameMode: 'solo' | 'vs',
  totalScore: number,
  roundResults: RoundResult[],
  isWinner: boolean,
  teamMembers?: TeamMember[]
): Promise<GameServiceResponse<{ session: any; pointsEarned: number; user: User }>> {
  try {
    const { data, error } = await invokeApi('saveGameSession', {
      gameMode,
      totalScore,
      roundResults,
      isWinner,
      teamMembers
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data };
  } catch (error: any) {
    console.error('Save game session error:', error);
    try {
      const queue = JSON.parse(localStorage.getItem('finalexam_pending_sessions') || '[]');
      queue.push({ gameMode, totalScore, roundResults, isWinner, teamMembers, timestamp: Date.now() });
      localStorage.setItem('finalexam_pending_sessions', JSON.stringify(queue));
    } catch {}
    return { error: error.message || 'Failed to save game session' };
  }
}

// Get user stats
export async function getUserStats(): Promise<GameServiceResponse<{ user: User; bestScore: number; recentGames: any[] }>> {
  try {
    const { data, error } = await invokeApi('getUserStats');

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
  prizeId: string,
  prizeName: string,
  pointsCost: number
): Promise<GameServiceResponse<User>> {
  try {
    const { data, error } = await invokeApi('redeemPrize', { prizeId, prizeName, pointsCost });

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
  subject: string,
  questionsAnswered: number,
  correctAnswers: number,
  timeSpent: number
): Promise<GameServiceResponse<{ success: boolean }>> {
  try {
    const { data, error } = await invokeApi('savePracticeProgress', { subject, questionsAnswered, correctAnswers, timeSpent });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data: { success: true } };
  } catch (error: any) {
    console.error('Save practice progress error:', error);
    return { error: error.message || 'Failed to save practice progress' };
  }
}

// Get practice stats
export async function getPracticeStats(): Promise<GameServiceResponse<{ progress: any[]; subjectStats: Record<string, any> }>> {
  try {
    const { data, error } = await invokeApi('getPracticeStats');

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { data };
  } catch (error: any) {
    console.error('Get practice stats error:', error);
    return { error: error.message || 'Failed to get practice stats' };
  }
}

// Save a team
export async function saveTeam(
  teamName: string,
  members: TeamMember[]
): Promise<GameServiceResponse<SavedTeam>> {
  try {
    const { data, error } = await invokeApi('saveTeam', { teamName, members });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return { data: data.team };
  } catch (error: any) {
    return { error: error.message || 'Failed to save team' };
  }
}

// Get user's saved teams
export async function getTeams(): Promise<GameServiceResponse<SavedTeam[]>> {
  try {
    const { data, error } = await invokeApi('getTeams');
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return { data: data.teams };
  } catch (error: any) {
    return { error: error.message || 'Failed to get teams' };
  }
}

// Update a saved team
export async function updateTeam(
  teamId: string,
  teamName?: string,
  members?: TeamMember[]
): Promise<GameServiceResponse<SavedTeam>> {
  try {
    const { data, error } = await invokeApi('updateTeam', { teamId, teamName, members });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return { data: data.team };
  } catch (error: any) {
    return { error: error.message || 'Failed to update team' };
  }
}

// Delete a saved team
export async function deleteTeam(
  teamId: string
): Promise<GameServiceResponse<{ success: boolean }>> {
  try {
    const { data, error } = await invokeApi('deleteTeam', { teamId });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return { data: { success: true } };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete team' };
  }
}

// Create a challenge
export async function createChallenge(): Promise<GameServiceResponse<Challenge>> {
  try {
    const { data, error } = await invokeApi('createChallenge');
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return { data: data.challenge };
  } catch (error: any) {
    return { error: error.message || 'Failed to create challenge' };
  }
}

// Submit challenger score
export async function submitChallengerScore(
  challengeId: string,
  score: number,
  roundResults: RoundResult[],
  teamMembers: TeamMember[]
): Promise<GameServiceResponse<Challenge>> {
  try {
    const { data, error } = await invokeApi('submitChallengerScore', { challengeId, score, roundResults, teamMembers });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return { data: data.challenge };
  } catch (error: any) {
    return { error: error.message || 'Failed to submit challenger score' };
  }
}

// Join a challenge by code
export async function joinChallenge(
  challengeCode: string
): Promise<GameServiceResponse<Challenge>> {
  try {
    const { data, error } = await invokeApi('joinChallenge', { challengeCode });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return { data: data.challenge };
  } catch (error: any) {
    return { error: error.message || 'Failed to join challenge' };
  }
}

// Submit opponent score
export async function submitOpponentScore(
  challengeId: string,
  score: number,
  roundResults: RoundResult[],
  teamMembers: TeamMember[]
): Promise<GameServiceResponse<Challenge>> {
  try {
    const { data, error } = await invokeApi('submitOpponentScore', { challengeId, score, roundResults, teamMembers });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return { data: data.challenge };
  } catch (error: any) {
    return { error: error.message || 'Failed to submit opponent score' };
  }
}

// Get user's challenges
export async function getChallenges(): Promise<GameServiceResponse<Challenge[]>> {
  try {
    const { data, error } = await invokeApi('getChallenges');
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return { data: data.challenges };
  } catch (error: any) {
    return { error: error.message || 'Failed to get challenges' };
  }
}

// Get single challenge
export async function getChallenge(
  challengeId?: string,
  challengeCode?: string
): Promise<GameServiceResponse<Challenge>> {
  try {
    const { data, error } = await invokeApi('getChallenge', { challengeId, challengeCode });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return { data: data.challenge };
  } catch (error: any) {
    return { error: error.message || 'Failed to get challenge' };
  }
}

// Get game history (paginated)
export async function getGameHistory(
  limit: number = 20,
  offset: number = 0
): Promise<GameServiceResponse<GameSessionRecord[]>> {
  try {
    const { data, error } = await invokeApi('getGameHistory', { limit, offset });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return { data: data.sessions };
  } catch (error: any) {
    return { error: error.message || 'Failed to get game history' };
  }
}

// Update user profile (avatar)
export async function updateProfile(
  avatar: string
): Promise<GameServiceResponse<User>> {
  try {
    const { data, error } = await invokeApi('updateProfile', { avatar });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return { data: data.user };
  } catch (error: any) {
    return { error: error.message || 'Failed to update profile' };
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
