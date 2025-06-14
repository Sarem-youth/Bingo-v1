CREATE TABLE GameSessions (
    game_session_id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES Companies(company_id) ON DELETE CASCADE,
    cashier_user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE RESTRICT, -- Cashier running the game
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    winning_pattern VARCHAR(255), -- e.g., 'single_line', 'four_corners', 'blackout'
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    jackpot_amount DECIMAL(10, 2) DEFAULT 0.00,
    numbers_called TEXT, -- Could be a JSON array or comma-separated string of numbers
    last_called_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_gamesessions_company_id ON GameSessions(company_id);
CREATE INDEX idx_gamesessions_cashier_user_id ON GameSessions(cashier_user_id);
CREATE INDEX idx_gamesessions_status ON GameSessions(status);
