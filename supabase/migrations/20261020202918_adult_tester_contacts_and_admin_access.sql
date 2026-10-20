-- Additive: preserve every existing identity, password hash and game relationship.
ALTER TABLE public.users
  ADD COLUMN full_name text CHECK (full_name IS NULL OR char_length(full_name) BETWEEN 1 AND 120),
  ADD COLUMN marketing_opt_in boolean,
  ADD COLUMN consent_recorded_at timestamptz,
  ADD COLUMN consent_version text,
  ADD COLUMN registration_source text,
  ADD COLUMN email_normalized text GENERATED ALWAYS AS (lower(email)) STORED,
  ADD COLUMN is_admin boolean NOT NULL DEFAULT false,
  ADD COLUMN must_change_password boolean NOT NULL DEFAULT false,
  ADD COLUMN auth_version integer NOT NULL DEFAULT 0 CHECK (auth_version >= 0);

-- Case-insensitive uniqueness without rewriting legacy email addresses.
CREATE UNIQUE INDEX users_email_normalized_key ON public.users (email_normalized);

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA app_private TO service_role;
CREATE TABLE app_private.auth_limits (
  key text PRIMARY KEY,
  attempts integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX auth_limits_expiry_idx ON app_private.auth_limits (expires_at);
ALTER TABLE app_private.auth_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app_private.auth_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON app_private.auth_limits TO service_role;

-- Atomic, persistent limits across Edge Function instances. Keys contain digests,
-- not raw email addresses or IP addresses. Only the backend can call this RPC.
CREATE FUNCTION public.consume_auth_attempt(p_key text, p_limit integer, p_window_seconds integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_attempts integer;
  v_expires timestamptz;
BEGIN
  IF char_length(p_key) NOT BETWEEN 1 AND 160 OR p_limit NOT BETWEEN 1 AND 100
     OR p_window_seconds NOT BETWEEN 1 AND 86400 THEN
    RAISE EXCEPTION 'Invalid limit configuration';
  END IF;
  DELETE FROM app_private.auth_limits WHERE expires_at < now() - interval '1 day';
  INSERT INTO app_private.auth_limits AS limits (key, attempts, expires_at)
    VALUES (p_key, 1, now() + make_interval(secs => p_window_seconds))
  ON CONFLICT (key) DO UPDATE SET
    attempts = CASE WHEN limits.expires_at <= now() THEN 1 ELSE limits.attempts + 1 END,
    expires_at = CASE WHEN limits.expires_at <= now() THEN now() + make_interval(secs => p_window_seconds) ELSE limits.expires_at END
  RETURNING attempts, expires_at INTO v_attempts, v_expires;
  RETURN jsonb_build_object('allowed', v_attempts <= p_limit,
    'retry_after', greatest(1, ceil(extract(epoch FROM (v_expires - now())))::integer));
END;
$$;
REVOKE ALL ON FUNCTION public.consume_auth_attempt(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_auth_attempt(text, integer, integer) TO service_role;
