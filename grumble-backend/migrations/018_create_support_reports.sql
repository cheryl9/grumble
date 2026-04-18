-- Support Reports table for help/support issue tracking
CREATE TABLE IF NOT EXISTS support_reports (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category      VARCHAR(64) NOT NULL,
  description   TEXT NOT NULL,
  contact_email VARCHAR(255),
  status        VARCHAR(32) DEFAULT 'open',
  admin_notes   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at   TIMESTAMP
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_support_reports_user_id ON support_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_support_reports_status ON support_reports(status);
CREATE INDEX IF NOT EXISTS idx_support_reports_created_at ON support_reports(created_at DESC);
