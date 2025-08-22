
-- migrations/0001_init.sql
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  website TEXT,
  plan TEXT,
  message TEXT,
  user_agent TEXT,
  ip TEXT
);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
