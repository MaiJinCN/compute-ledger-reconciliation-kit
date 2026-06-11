-- Provider-neutral reference schema.
-- Adapt table names and column types to your database engine.

CREATE TABLE IF NOT EXISTS task_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL UNIQUE,
  project_id TEXT,
  account_id TEXT,
  client_request_id TEXT UNIQUE,
  task_type TEXT NOT NULL,
  task_name TEXT,
  status TEXT NOT NULL,
  provider_required INTEGER NOT NULL DEFAULT 0,
  started_at TEXT,
  submitted_at TEXT,
  finished_at TEXT,
  credits_consumed INTEGER NOT NULL DEFAULT 0,
  gpu_seconds INTEGER,
  raw_cost REAL,
  balance_before INTEGER,
  balance_after INTEGER,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provider_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_task_id TEXT NOT NULL,
  provider_status TEXT,
  gpu_seconds INTEGER,
  raw_cost REAL,
  output_url TEXT,
  raw_usage_json TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_task_id)
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ledger_entry_id TEXT NOT NULL UNIQUE,
  task_id TEXT,
  project_id TEXT,
  account_id TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  credits_delta INTEGER NOT NULL,
  balance_before INTEGER,
  balance_after INTEGER,
  gpu_seconds INTEGER,
  provider TEXT,
  provider_task_id TEXT,
  raw_cost REAL,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_records_project ON task_records(project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_task_records_account ON task_records(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_task_records_client_request ON task_records(client_request_id);
CREATE INDEX IF NOT EXISTS idx_provider_jobs_task ON provider_jobs(task_id);
CREATE INDEX IF NOT EXISTS idx_provider_jobs_provider_task ON provider_jobs(provider, provider_task_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_task ON ledger_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON ledger_entries(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_provider_task ON ledger_entries(provider, provider_task_id);
