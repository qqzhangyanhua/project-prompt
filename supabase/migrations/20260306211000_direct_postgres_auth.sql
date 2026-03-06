-- Direct PostgreSQL auth/session support
-- Keep existing business tables, remove dependency on Supabase auth.users.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS password_hash text;

CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_unique_idx
  ON user_profiles (lower(email));

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON user_sessions(expires_at);
