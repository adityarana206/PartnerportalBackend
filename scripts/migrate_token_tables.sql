-- =============================================================================
-- TOKEN TABLES MIGRATION — run once
-- Creates refresh_tokens and blacklisted_tokens tables.
-- =============================================================================

BEGIN;

-- ─── 1. Refresh Tokens ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          SERIAL      PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT        NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id  ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token    ON refresh_tokens(token);

-- ─── 2. Blacklisted Tokens ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blacklisted_tokens (
  id          SERIAL      PRIMARY KEY,
  token       TEXT        NOT NULL UNIQUE,
  user_id     INTEGER     REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_token      ON blacklisted_tokens(token);
CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_expires_at ON blacklisted_tokens(expires_at);

COMMIT;
