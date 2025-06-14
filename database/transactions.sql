CREATE TABLE Transactions (
    transaction_id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('player_buy_in', 'payout', 'agent_commission_payout', 'admin_commission')),
    game_session_id INTEGER REFERENCES GameSessions(game_session_id) ON DELETE SET NULL, -- Assuming GameSessions table
    user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE RESTRICT, -- Cashier who processed
    company_id INTEGER NOT NULL REFERENCES Companies(company_id) ON DELETE RESTRICT,
    agent_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE RESTRICT, -- Agent associated with the company
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Add checks to ensure user_id refers to a 'cashier' and agent_id refers to an 'agent'.
-- Requires application logic or triggers.

-- Indexes for performance
CREATE INDEX idx_transactions_type ON Transactions(type);
CREATE INDEX idx_transactions_game_session_id ON Transactions(game_session_id);
CREATE INDEX idx_transactions_user_id ON Transactions(user_id);
CREATE INDEX idx_transactions_company_id ON Transactions(company_id);
CREATE INDEX idx_transactions_agent_id ON Transactions(agent_id);
CREATE INDEX idx_transactions_timestamp ON Transactions(timestamp);
