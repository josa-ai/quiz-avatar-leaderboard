-- Fix wide-open RLS policies with proper restrictions
-- Note: The edge function uses service_role key which bypasses RLS.
-- These policies are defense-in-depth against direct anon key access.

-- ─── USERS ──────────────────────────────────────────────────────────────────
-- Drop existing wide-open policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow insert via service role or edge function" ON users;
DROP POLICY IF EXISTS "Allow updates from edge functions" ON users;

-- Public SELECT for leaderboard (limited columns enforced at query level)
CREATE POLICY "users_select" ON users
  FOR SELECT USING (true);

-- INSERT only via service_role (registration through edge function)
CREATE POLICY "users_insert_service" ON users
  FOR INSERT WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- UPDATE own row or via service_role
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (
    auth.uid()::text = id::text
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ─── GAME SESSIONS ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can insert game sessions" ON game_sessions;

CREATE POLICY "game_sessions_select_own" ON game_sessions
  FOR SELECT USING (
    user_id = auth.uid()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "game_sessions_insert_service" ON game_sessions
  FOR INSERT WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ─── LEADERBOARD ENTRIES ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Leaderboard is publicly readable" ON leaderboard_entries;
DROP POLICY IF EXISTS "Users can insert leaderboard entries" ON leaderboard_entries;

-- Public read for leaderboard display
CREATE POLICY "leaderboard_select_public" ON leaderboard_entries
  FOR SELECT USING (true);

-- Insert only via service_role
CREATE POLICY "leaderboard_insert_service" ON leaderboard_entries
  FOR INSERT WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ─── PRACTICE PROGRESS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own practice progress" ON practice_progress;
DROP POLICY IF EXISTS "Users can insert practice progress" ON practice_progress;

CREATE POLICY "practice_select_own" ON practice_progress
  FOR SELECT USING (
    user_id = auth.uid()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "practice_insert_service" ON practice_progress
  FOR INSERT WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ─── PRIZE REDEMPTIONS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own prize redemptions" ON prize_redemptions;
DROP POLICY IF EXISTS "Users can insert prize redemptions" ON prize_redemptions;

CREATE POLICY "prize_select_own" ON prize_redemptions
  FOR SELECT USING (
    user_id = auth.uid()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "prize_insert_service" ON prize_redemptions
  FOR INSERT WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ─── TEAMS ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Teams full access" ON teams;

CREATE POLICY "teams_select_own" ON teams
  FOR SELECT USING (
    owner_id = auth.uid()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "teams_insert_service" ON teams
  FOR INSERT WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "teams_update_own" ON teams
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "teams_delete_own" ON teams
  FOR DELETE USING (
    owner_id = auth.uid()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ─── CHALLENGES ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Challenges full access" ON challenges;

-- Participants can read their own challenges
CREATE POLICY "challenges_select_participant" ON challenges
  FOR SELECT USING (
    challenger_id = auth.uid()
    OR opponent_id = auth.uid()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Insert only via service_role
CREATE POLICY "challenges_insert_service" ON challenges
  FOR INSERT WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Update only for participants or service_role
CREATE POLICY "challenges_update_participant" ON challenges
  FOR UPDATE USING (
    challenger_id = auth.uid()
    OR opponent_id = auth.uid()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );
