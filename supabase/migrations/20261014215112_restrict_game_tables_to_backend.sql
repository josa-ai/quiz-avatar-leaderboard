-- The application authenticates through game-api using custom x-app-token JWTs.
-- No browser role should query these base tables, including through joins.
-- Keep all account rows, hashes, IDs and the service-role backend unchanged.
DO $$
DECLARE
  table_name text;
  existing_policy record;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'users', 'game_sessions', 'leaderboard_entries', 'practice_progress',
    'prize_redemptions', 'teams', 'challenges'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    FOR existing_policy IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = table_name
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', existing_policy.policyname, table_name);
    END LOOP;
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM PUBLIC, anon, authenticated', table_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO service_role', table_name);
  END LOOP;
END;
$$;

-- This trigger requires no browser-callable RPC surface.
ALTER FUNCTION public.update_updated_at() SET search_path = '';
REVOKE ALL ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
