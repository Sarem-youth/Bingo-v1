CREATE TABLE Transactions (
    transaction_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES GameSessions(session_id) ON DELETE SET NULL, -- Renamed from game_session_id
    cashier_id INTEGER REFERENCES Users(user_id) ON DELETE RESTRICT, -- Added, was user_id
    type VARCHAR(15) NOT NULL CHECK (type IN ('buy_in', 'payout', 'reconciliation')), -- Adjusted VARCHAR size and values
    amount DECIMAL(10, 2) NOT NULL,
    notes TEXT, -- Retained from existing
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Changed default
);

-- Indexes for performance
CREATE INDEX idx_transactions_game_session_id ON Transactions(session_id); -- Renamed from game_session_id
CREATE INDEX idx_transactions_cashier_id ON Transactions(cashier_id); -- Added
