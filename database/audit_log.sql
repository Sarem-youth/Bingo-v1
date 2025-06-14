-- filepath: c:\Users\SaremTadele\Downloads\Bingo\database\audit_log.sql
CREATE TABLE AuditLog (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id) ON DELETE SET NULL, -- Set to NULL if user is deleted
    action TEXT NOT NULL, -- e.g., "User login", "Game started", "Payout Confirmed: $50"
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Index on user_id and timestamp for faster querying
CREATE INDEX idx_auditlog_user_id ON AuditLog(user_id);
CREATE INDEX idx_auditlog_timestamp ON AuditLog(timestamp);
