CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY,
  username VARCHAR(120) NOT NULL UNIQUE,
  email VARCHAR(120) UNIQUE,
  phone_number VARCHAR(40) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'business_owner',
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_role_check CHECK (role IN ('business_owner', 'admin', 'lender', 'cooperative')),
  CONSTRAINT users_verification_status_check CHECK (verification_status IN ('pending', 'verified', 'rejected'))
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  category VARCHAR(120) NOT NULL,
  description TEXT,
  payment_method VARCHAR(60) NOT NULL DEFAULT 'cash',
  mobile_money_ref VARCHAR(120),
  transaction_date TIMESTAMPTZ NOT NULL,
  is_synced BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT transactions_type_check CHECK (type IN ('sale', 'expense', 'mobile_money_in', 'mobile_money_out')),
  CONSTRAINT transactions_amount_check CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON transactions(user_id, transaction_date DESC);

CREATE TABLE IF NOT EXISTS credit_scores (
  score_id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  score_value INTEGER NOT NULL,
  factors JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT credit_scores_value_check CHECK (score_value BETWEEN 300 AND 850)
);

CREATE INDEX IF NOT EXISTS idx_credit_scores_user_calculated
  ON credit_scores(user_id, calculated_at DESC);

CREATE TABLE IF NOT EXISTS reports (
  report_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  file_path TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_generated
  ON reports(user_id, generated_at DESC);

CREATE TABLE IF NOT EXISTS scoring_rules (
  rule_id BIGSERIAL PRIMARY KEY,
  rule_name VARCHAR(120) NOT NULL,
  weight NUMERIC(8, 2) NOT NULL DEFAULT 1,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  action VARCHAR(120) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
  ON audit_logs(user_id, created_at DESC);
