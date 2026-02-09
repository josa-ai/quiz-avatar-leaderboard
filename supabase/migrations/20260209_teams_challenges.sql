-- Persistent Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_teams_owner_id ON teams(owner_id);
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teams full access" ON teams FOR ALL USING (true) WITH CHECK (true);

-- Ghost Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_code TEXT UNIQUE NOT NULL,
  challenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  challenger_score INTEGER,
  challenger_round_results JSONB DEFAULT '[]'::jsonb,
  challenger_team_members JSONB DEFAULT '[]'::jsonb,
  opponent_score INTEGER,
  opponent_round_results JSONB DEFAULT '[]'::jsonb,
  opponent_team_members JSONB DEFAULT '[]'::jsonb,
  question_seed INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);
CREATE INDEX idx_challenges_code ON challenges(challenge_code);
CREATE INDEX idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX idx_challenges_opponent ON challenges(opponent_id);
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges full access" ON challenges FOR ALL USING (true) WITH CHECK (true);

-- Link game sessions to challenges
ALTER TABLE game_sessions ADD COLUMN challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL;
