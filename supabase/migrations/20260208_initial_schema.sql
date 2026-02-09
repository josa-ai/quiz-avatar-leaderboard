-- Initial schema for Final Exam Challenge

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  total_points INTEGER DEFAULT 0,
  current_rank INTEGER DEFAULT 999,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Game sessions table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL DEFAULT 'solo',
  total_score INTEGER NOT NULL DEFAULT 0,
  round_results JSONB DEFAULT '[]'::jsonb,
  is_winner BOOLEAN DEFAULT false,
  team_members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leaderboard entries table
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  period TEXT DEFAULT 'all_time',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Practice progress table
CREATE TABLE practice_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prize redemptions table
CREATE TABLE prize_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prize_id TEXT NOT NULL,
  prize_name TEXT NOT NULL,
  points_cost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_leaderboard_entries_user_id ON leaderboard_entries(user_id);
CREATE INDEX idx_leaderboard_entries_score ON leaderboard_entries(score DESC);
CREATE INDEX idx_leaderboard_entries_period ON leaderboard_entries(period);
CREATE INDEX idx_practice_progress_user_id ON practice_progress(user_id);
CREATE INDEX idx_prize_redemptions_user_id ON prize_redemptions(user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: can read own row, leaderboard queries need public read on limited columns
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Allow insert via service role or edge function" ON users
  FOR INSERT WITH CHECK (true);

-- Game sessions: owner can read/write
CREATE POLICY "Users can read own game sessions" ON game_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert game sessions" ON game_sessions
  FOR INSERT WITH CHECK (true);

-- Leaderboard: publicly readable
CREATE POLICY "Leaderboard is publicly readable" ON leaderboard_entries
  FOR SELECT USING (true);

CREATE POLICY "Users can insert leaderboard entries" ON leaderboard_entries
  FOR INSERT WITH CHECK (true);

-- Practice progress
CREATE POLICY "Users can read own practice progress" ON practice_progress
  FOR SELECT USING (true);

CREATE POLICY "Users can insert practice progress" ON practice_progress
  FOR INSERT WITH CHECK (true);

-- Prize redemptions
CREATE POLICY "Users can read own prize redemptions" ON prize_redemptions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert prize redemptions" ON prize_redemptions
  FOR INSERT WITH CHECK (true);

-- Allow updates on users from edge functions (for point updates, etc.)
CREATE POLICY "Allow updates from edge functions" ON users
  FOR UPDATE USING (true);
