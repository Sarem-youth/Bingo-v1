CREATE TABLE GameSessions (
    session_id SERIAL PRIMARY KEY, -- Renamed from game_session_id
    -- company_id INTEGER NOT NULL REFERENCES Companies(company_id) ON DELETE CASCADE, -- Removed
    -- cashier_user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE RESTRICT, -- Removed
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Changed default
    end_time TIMESTAMP WITH TIME ZONE,
    picked_numbers INTEGER[], -- Added
    status VARCHAR(10) NOT NULL CHECK (status IN ('active', 'paused', 'finished')), -- Adjusted VARCHAR size and values
    winning_pattern JSONB, -- Changed from VARCHAR(255)
    total_buy_in DECIMAL(12, 2) DEFAULT 0.00, -- Added
    prize_payout DECIMAL(12, 2) DEFAULT 0.00, -- Added
    -- jackpot_amount DECIMAL(10, 2) DEFAULT 0.00, -- Removed
    -- numbers_called TEXT, -- Removed
    -- last_called_number INTEGER, -- Removed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
-- CREATE INDEX idx_gamesessions_company_id ON GameSessions(company_id); -- Removed
-- CREATE INDEX idx_gamesessions_cashier_user_id ON GameSessions(cashier_user_id); -- Removed
CREATE INDEX idx_gamesessions_status ON GameSessions(status);
